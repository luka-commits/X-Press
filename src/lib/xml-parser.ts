/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * XOS XML-Parser für Prinance JDF/XML Exports
 *
 * Extrahiert Auftragsdaten aus Heidelberg Prinance XML-Dateien
 * und transformiert sie für die XOS-Datenbank.
 */

import { XMLParser } from 'fast-xml-parser';

// ============================================================
// Types
// ============================================================

export interface ParsedAuftrag {
  auftragsnummer: string;
  produktart: string | null;
  produktbeschreibung: string | null; // Kombiniert aus 1, 2, 3
  sachbearbeiter: string | null;
  sachbearbeiterTelefon: string | null;
  sachbearbeiterEmail: string | null;
  prioritaet: number | null;
  auflage: number | null; // Auflagenhoehe (Stückzahl)

  // Termine (Excel OLE Dates konvertiert)
  liefertermin: Date | null;
  drucktermin: Date | null;
  wtvTermin: Date | null;

  // Kunde
  kunde: ParsedKunde | null;

  // Arbeitsgänge
  arbeitsgaenge: ParsedArbeitsgang[];
}

export interface ParsedKunde {
  name: string | null;
  firma: string | null;
  telefon: string | null;
  mobil: string | null;
  email: string | null;
  adresse: string | null;  // Combined address for backwards compatibility
  externeNummer: string | null;
  // Individual address fields for PLZ sorting and map clustering
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  land: string | null;
}

export interface ParsedArbeitsgang {
  name: string;
  kostenstelle: string;
  kostenstellenName: string;
  kostenstellenKurzbez: string;
  sortOrder: number;
  zeitMinuten: number;
  beschreibung: string | null;
}

// ============================================================
// Encoding Fix
// ============================================================

/**
 * Repariert fehlerhafte UTF-8 Encodings aus Prinance Export
 * Prinance exportiert manchmal mit falscher Codepage
 */
export function fixEncoding(text: string): string {
  if (!text) return text;

  return text
    // Kleinbuchstaben
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¤/g, 'ä')
    .replace(/ÃŸ/g, 'ß')
    // Großbuchstaben
    .replace(/Ã„/g, 'Ä')
    .replace(/Ã–/g, 'Ö')
    .replace(/Ãœ/g, 'Ü')
    // Entity Escapes
    .replace(/&#xA;/g, '\n')
    .replace(/&#x9;/g, '\t');
}

// ============================================================
// Date Conversion
// ============================================================

/**
 * Konvertiert Excel OLE Datum (Tage seit 1900-01-01) zu JavaScript Date
 *
 * Excel OLE Datum: 45863 → 2025-07-25
 */
export function excelDateToJS(excelDate: number | string | null): Date | null {
  if (excelDate === null || excelDate === undefined || excelDate === '') {
    return null;
  }

  const numericDate = typeof excelDate === 'string' ? parseFloat(excelDate) : excelDate;

  if (isNaN(numericDate) || numericDate === 0) {
    return null;
  }

  // Excel Epoch: 1900-01-01, aber mit Leap-Year-Bug (1900 zählt als Schaltjahr)
  // JavaScript Epoch: 1970-01-01
  // Differenz: 25569 Tage
  const jsDate = new Date((numericDate - 25569) * 86400 * 1000);

  return jsDate;
}

// ============================================================
// ZEIT Aggregation
// ============================================================

/**
 * Aggregiert ZEIT-Werte aus Elemente-Nodes eines Arbeitsvorgangs
 * Ignoriert ZEIT="0.00" (Material-Positionen)
 */
function aggregiereZeit(elemente: any): number {
  if (!elemente) return 0;

  // Kann ein einzelnes Objekt oder ein Array sein
  const elementeArray = Array.isArray(elemente) ? elemente : [elemente];

  return elementeArray
    .filter((el: any) => {
      const zeit = parseFloat(el?.['@_ZEIT'] || '0');
      return zeit > 0;
    })
    .reduce((sum: number, el: any) => {
      return sum + parseFloat(el?.['@_ZEIT'] || '0');
    }, 0);
}

// ============================================================
// Main Parser
// ============================================================

/**
 * Parst eine Prinance XML-Datei und extrahiert Auftragsdaten
 */
export function parseXML(xmlContent: string): ParsedAuftrag {
  // Fix encoding issues first
  const fixedXml = fixEncoding(xmlContent);

  // Configure parser
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseAttributeValue: false, // Keep as strings for dates
  });

  const parsed = parser.parse(fixedXml);

  // Navigate to Auftrag element
  const jdfAdapter = parsed.JDFAdapter;
  if (!jdfAdapter) {
    throw new Error('Invalid XML: Missing JDFAdapter root element');
  }

  const auftrag = jdfAdapter.Auftrag;
  if (!auftrag) {
    throw new Error('Invalid XML: Missing Auftrag element');
  }

  // Extract basic info
  const auftragsnummer = auftrag['@_Auftragsnummer'];
  if (!auftragsnummer) {
    throw new Error('Invalid XML: Missing Auftragsnummer');
  }

  // Extract Termine
  const termine = auftrag.Termine || {};
  const drucktermin = excelDateToJS(termine['@_TerminDruck']);
  const wtvTermin = excelDateToJS(termine['@_TerminWTV']);
  const liefertermin = excelDateToJS(termine['@_Liefertermin']);

  // Extract Kunde
  const kundeNode = auftrag.Kunde?.Kundenadresse;
  let kunde: ParsedKunde | null = null;

  if (kundeNode) {
    // Extract communication entries
    const komEntries = kundeNode.KomEntry;
    const komArray = Array.isArray(komEntries) ? komEntries : (komEntries ? [komEntries] : []);

    const telefon = komArray.find((k: any) => k['@_Kommtypname'] === 'Telefon')?.['@_Wert'] || null;
    const mobil = komArray.find((k: any) => k['@_Kommtypname'] === 'Mobil')?.['@_Wert'] || null;
    const email = komArray.find((k: any) => k['@_Kommtypname'] === 'E-Mail')?.['@_Wert'] || null;

    // Extract individual address fields
    const strasse = kundeNode['@_Strasse'] || '';
    const plz = kundeNode['@_PLZ'] || '';
    const ort = kundeNode['@_Ort'] || '';
    const land = kundeNode['@_LandName'] || kundeNode['@_LKZ'] || '';

    // Build combined address string for backwards compatibility
    const adresse = [strasse, `${plz} ${ort}`.trim()].filter(Boolean).join(', ');

    kunde = {
      name: kundeNode['@_Name'] || null,
      firma: kundeNode['@_Name2'] || kundeNode['@_Kurzbezeichnung'] || null,
      telefon,
      mobil,
      email,
      adresse: adresse || null,
      externeNummer: auftrag.Kunde?.['@_ExterneAdressnummer'] || null,
      // Individual address fields for PLZ sorting and map clustering
      strasse: strasse || null,
      plz: plz || null,
      ort: ort || null,
      land: land || null,
    };
  }

  // Extract Arbeitsgänge - nested under Kalkulation > Bogengruppen
  const bogengruppen = auftrag.Kalkulation?.Bogengruppen || [];
  const bogengruppenArray = Array.isArray(bogengruppen) ? bogengruppen : [bogengruppen];

  // Collect all Arbeitsvorgänge from all Bogengruppen
  const arbeitsvorgaengeArray: any[] = [];
  for (const bg of bogengruppenArray) {
    if (!bg) continue;
    const avs = bg.Arbeitsvorgang || [];
    const avsArray = Array.isArray(avs) ? avs : [avs];
    arbeitsvorgaengeArray.push(...avsArray);
  }

  const arbeitsgaenge: ParsedArbeitsgang[] = arbeitsvorgaengeArray
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((av: any) => av && av['@_Kostenstelle'])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((av: any) => {
      // Aggregate ZEIT from Elemente
      const zeitMinuten = aggregiereZeit(av.Elemente);

      // Beschreibung: Noteprod hat Vorrang, dann Name als Fallback
      const beschreibung = av['@_Noteprod']?.trim()
        || av['@_Name']?.trim()
        || null;

      return {
        name: av['@_Name'] || 'Unbenannt',
        kostenstelle: av['@_Kostenstelle'],
        kostenstellenName: av['@_KostenstellenName'] || '',
        kostenstellenKurzbez: av['@_KostenstellenKurzbez'] || '',
        sortOrder: parseInt(av['@_Sort'] || '0', 10),
        zeitMinuten,
        beschreibung,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Kombiniere Produktbeschreibungen 1, 2, 3
  const beschreibungTeile = [
    auftrag['@_Produktbeschreibung1'],
    auftrag['@_Produktbeschreibung2'],
    auftrag['@_Produktbeschreibung3'],
  ].filter(Boolean);
  const produktbeschreibung = beschreibungTeile.length > 0
    ? beschreibungTeile.join(' ').trim()
    : null;

  // Auflage extrahieren
  const auflagenhoehe = auftrag.Auflage?.['@_Auflagenhoehe'];
  const auflage = auflagenhoehe ? parseInt(auflagenhoehe, 10) : null;

  // Build result
  const result: ParsedAuftrag = {
    auftragsnummer,
    produktart: auftrag['@_Produktart'] || null,
    produktbeschreibung,
    sachbearbeiter: auftrag['@_Sachbearbeiter']
      ? `${auftrag['@_SachbearbeiterVorname'] || ''} ${auftrag['@_Sachbearbeiter']}`.trim()
      : null,
    sachbearbeiterTelefon: auftrag['@_SachbearbeiterTelefon'] || null,
    sachbearbeiterEmail: auftrag['@_SachbearbeiterEmail'] || null,
    prioritaet: auftrag['@_KpPriorität'] ? parseInt(auftrag['@_KpPriorität'], 10) : null,
    auflage,
    liefertermin,
    drucktermin,
    wtvTermin,
    kunde,
    arbeitsgaenge,
  };

  return result;
}

// ============================================================
// Summary Helper
// ============================================================

/**
 * Erstellt eine Zusammenfassung eines geparsten Auftrags (für Logging/Debug)
 */
export function summarizeAuftrag(auftrag: ParsedAuftrag): string {
  const lines = [
    `Auftrag: ${auftrag.auftragsnummer}`,
    `Kunde: ${auftrag.kunde?.name || 'Unbekannt'}`,
    `Produkt: ${auftrag.produktart || 'N/A'}`,
    `Auflage: ${auftrag.auflage || 'N/A'} Stück`,
    `Sachbearbeiter: ${auftrag.sachbearbeiter || 'N/A'}`,
    `Liefertermin: ${auftrag.liefertermin?.toISOString().split('T')[0] || 'N/A'}`,
    `Drucktermin: ${auftrag.drucktermin?.toISOString().split('T')[0] || 'N/A'}`,
    `WTV-Termin: ${auftrag.wtvTermin?.toISOString().split('T')[0] || 'N/A'}`,
    `Arbeitsgänge: ${auftrag.arbeitsgaenge.length}`,
  ];

  // Add top machines by time
  const maschinenZeit = new Map<string, number>();
  for (const ag of auftrag.arbeitsgaenge) {
    const current = maschinenZeit.get(ag.kostenstellenName) || 0;
    maschinenZeit.set(ag.kostenstellenName, current + ag.zeitMinuten);
  }

  const sortedMaschinen = Array.from(maschinenZeit.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sortedMaschinen.length > 0) {
    lines.push('');
    lines.push('Top Maschinen (ZEIT):');
    for (const [name, zeit] of sortedMaschinen) {
      lines.push(`  - ${name}: ${zeit.toFixed(1)} min`);
    }
  }

  return lines.join('\n');
}
