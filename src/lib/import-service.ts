/**
 * XOS Import Service
 *
 * Speichert geparste XML-Daten in der Supabase/PostgreSQL Datenbank
 */

import prisma from './prisma';
import { ParsedAuftrag, ParsedArbeitsgang } from './xml-parser';

export interface ImportResult {
  success: boolean;
  auftragsnummer: string;
  isUpdate: boolean;
  arbeitsgaengeCount: number;
  maschinenCreated: string[];
  error?: string;
}

/**
 * Importiert einen geparsten Auftrag in die Datenbank
 *
 * - Erstellt oder aktualisiert den Auftrag
 * - Erstellt oder findet den Kunden
 * - Erstellt fehlende Maschinen automatisch
 * - Erstellt alle Arbeitsgänge
 */
export async function importAuftrag(parsed: ParsedAuftrag): Promise<ImportResult> {
  const maschinenCreated: string[] = [];

  try {
    // Explizite Verbindung für Stabilität (besonders bei Pooler-Verbindungen)
    await prisma.$connect();

    // 1. Prüfe ob Auftrag bereits existiert
    const existingAuftrag = await prisma.auftrag.findUnique({
      where: { auftragsnummer: parsed.auftragsnummer },
    });
    const isUpdate = !!existingAuftrag;

    // 2. Kunde anlegen oder finden
    let kundeId: number | null = null;
    if (parsed.kunde) {
      // Suche nach externer Nummer oder Name
      let kunde = parsed.kunde.externeNummer
        ? await prisma.kunde.findFirst({
            where: { externeNummer: parsed.kunde.externeNummer },
          })
        : null;

      if (!kunde && parsed.kunde.name) {
        kunde = await prisma.kunde.findFirst({
          where: { name: parsed.kunde.name },
        });
      }

      if (kunde) {
        kundeId = kunde.id;
      } else {
        // Neuen Kunden anlegen
        const newKunde = await prisma.kunde.create({
          data: {
            name: parsed.kunde.name,
            firma: parsed.kunde.firma,
            telefon: parsed.kunde.telefon,
            mobil: parsed.kunde.mobil,
            email: parsed.kunde.email,
            adresse: parsed.kunde.adresse,
            externeNummer: parsed.kunde.externeNummer,
          },
        });
        kundeId = newKunde.id;
      }
    }

    // 3. Maschinen anlegen falls nicht vorhanden
    const uniqueKostenstellen = Array.from(
      new Set(parsed.arbeitsgaenge.map((ag) => ag.kostenstelle).filter(Boolean))
    );

    for (const kostenstelle of uniqueKostenstellen) {
      const ag = parsed.arbeitsgaenge.find((a) => a.kostenstelle === kostenstelle);
      if (!ag) continue;

      const existingMaschine = await prisma.maschine.findUnique({
        where: { kostenstelle },
      });

      if (!existingMaschine) {
        await prisma.maschine.create({
          data: {
            name: ag.kostenstellenName || `Maschine ${kostenstelle}`,
            kurzname: ag.kostenstellenKurzbez || null,
            kostenstelle,
            istLeitmaschine: isLeitmaschine(kostenstelle),
          },
        });
        maschinenCreated.push(ag.kostenstellenName || kostenstelle);
      }
    }

    // 4. Maschinen-Lookup für Arbeitsgänge vorbereiten (batch query to avoid N+1)
    const maschineMap = new Map<string, number>();
    if (uniqueKostenstellen.length > 0) {
      const maschinen = await prisma.maschine.findMany({
        where: { kostenstelle: { in: uniqueKostenstellen } },
      });
      for (const maschine of maschinen) {
        if (maschine.kostenstelle) {
          maschineMap.set(maschine.kostenstelle, maschine.id);
        }
      }
    }

    // 5. Auftrag und Arbeitsgänge in einer Transaction anlegen/aktualisieren
    // → Verhindert inkonsistente Daten bei Fehlern
    await prisma.$transaction(async (tx) => {
      if (isUpdate) {
        // Alte Arbeitsgänge löschen
        await tx.arbeitsgang.deleteMany({
          where: { auftragId: parsed.auftragsnummer },
        });

        // Auftrag aktualisieren
        await tx.auftrag.update({
          where: { auftragsnummer: parsed.auftragsnummer },
          data: {
            kundeId,
            produkttyp: parsed.produktart,
            produktbeschreibung: parsed.produktbeschreibung,
            sachbearbeiter: parsed.sachbearbeiter,
            sachbearbeiterTelefon: parsed.sachbearbeiterTelefon,
            sachbearbeiterEmail: parsed.sachbearbeiterEmail,
            auflage: parsed.auflage,
            liefertermin: parsed.liefertermin,
            drucktermin: parsed.drucktermin,
            wtvTermin: parsed.wtvTermin,
            prioritaet: parsed.prioritaet,
            xmlImportDatum: new Date(),
            // Individual address fields (customer address as delivery address)
            lieferStrasse: parsed.kunde?.strasse,
            lieferPlz: parsed.kunde?.plz,
            lieferOrt: parsed.kunde?.ort,
            lieferLand: parsed.kunde?.land,
          },
        });
      } else {
        await tx.auftrag.create({
          data: {
            auftragsnummer: parsed.auftragsnummer,
            kundeId,
            produkttyp: parsed.produktart,
            produktbeschreibung: parsed.produktbeschreibung,
            sachbearbeiter: parsed.sachbearbeiter,
            sachbearbeiterTelefon: parsed.sachbearbeiterTelefon,
            sachbearbeiterEmail: parsed.sachbearbeiterEmail,
            auflage: parsed.auflage,
            liefertermin: parsed.liefertermin,
            drucktermin: parsed.drucktermin,
            wtvTermin: parsed.wtvTermin,
            prioritaet: parsed.prioritaet,
            status: 'aktiv',
            // Individual address fields (customer address as delivery address)
            lieferStrasse: parsed.kunde?.strasse,
            lieferPlz: parsed.kunde?.plz,
            lieferOrt: parsed.kunde?.ort,
            lieferLand: parsed.kunde?.land,
          },
        });
      }

      // Arbeitsgänge als Batch anlegen (schneller, verhindert Transaction-Timeout)
      const arbeitsgaengeData = parsed.arbeitsgaenge.map((ag) => {
        // Bestimme geplantes Datum basierend auf Kostenstelle
        // Druckmaschinen (42xx) → Drucktermin, WTV (5xxx) → WTV-Termin
        let geplantDatum: Date | null = null;
        if (ag.kostenstelle.startsWith('42')) {
          geplantDatum = parsed.drucktermin;
        } else if (ag.kostenstelle.startsWith('5') || ag.kostenstelle.startsWith('6')) {
          geplantDatum = parsed.wtvTermin;
        }

        return {
          auftragId: parsed.auftragsnummer,
          maschineId: maschineMap.get(ag.kostenstelle) || null,
          sortOrder: ag.sortOrder,
          zeitMinuten: ag.zeitMinuten,
          geplantDatum,
          beschreibung: ag.beschreibung,
          kostenstelle: ag.kostenstelle,
        };
      });

      await tx.arbeitsgang.createMany({
        data: arbeitsgaengeData,
      });
    }, {
      timeout: 30000, // 30 Sekunden Timeout für Transaction
    });

    return {
      success: true,
      auftragsnummer: parsed.auftragsnummer,
      isUpdate,
      arbeitsgaengeCount: parsed.arbeitsgaenge.length,
      maschinenCreated,
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      auftragsnummer: parsed.auftragsnummer,
      isUpdate: false,
      arbeitsgaengeCount: 0,
      maschinenCreated: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Bestimmt ob eine Kostenstelle eine Leitmaschine ist
 *
 * Leitmaschinen erscheinen in Dashboard und Kalender
 */
function isLeitmaschine(kostenstelle: string): boolean {
  // Bekannte Leitmaschinen-Kostenstellen
  const leitmaschinen = [
    '4250', // Speedmaster XL 106-8P
    '4230', // Speedmaster CD 102-5L
    '4240', // Speedmaster CX 102-6+L (TBD - geschätzt)
    '5101', // POLAR (Schneiden)
    // Weitere nach Kickoff ergänzen
  ];

  return leitmaschinen.includes(kostenstelle);
}

/**
 * Holt alle Aufträge mit Arbeitsgängen für Dashboard
 */
export async function getAllAuftraege() {
  await prisma.$connect();
  return prisma.auftrag.findMany({
    where: { status: 'aktiv' },
    include: {
      kunde: true,
      arbeitsgaenge: {
        include: { maschine: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { liefertermin: 'asc' },
  });
}

/**
 * Holt alle Leitmaschinen mit ihren Arbeitsgängen für ein Datum
 */
export async function getLeitmaschinenMitAuslastung(datum: Date) {
  await prisma.$connect();
  const startOfDay = new Date(datum);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(datum);
  endOfDay.setHours(23, 59, 59, 999);

  const maschinen = await prisma.maschine.findMany({
    where: { istLeitmaschine: true, aktiv: true },
    include: {
      arbeitsgaenge: {
        where: {
          geplantDatum: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: { auftrag: true },
      },
    },
  });

  return maschinen.map((m) => {
    const gesamtZeit = m.arbeitsgaenge.reduce((sum, ag) => sum + (ag.zeitMinuten || 0), 0);
    const auslastung = (gesamtZeit / m.tageskapazitaetMinuten) * 100;

    return {
      id: m.id,
      name: m.name,
      kurzname: m.kurzname,
      kostenstelle: m.kostenstelle,
      gesamtZeit,
      tageskapazitaet: m.tageskapazitaetMinuten,
      auslastung: Math.round(auslastung * 10) / 10,
      auftraege: m.arbeitsgaenge.map((ag) => ({
        auftragsnummer: ag.auftragId,
        zeit: ag.zeitMinuten,
        kunde: ag.auftrag.produkttyp, // Vereinfacht
      })),
    };
  });
}
