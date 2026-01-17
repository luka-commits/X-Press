/**
 * XOS Parser Test API
 *
 * GET /api/test-parser - Testet XML-Parser mit Sample-Datei (ohne DB)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { NextResponse } from 'next/server';

import { parseXML, summarizeAuftrag } from '@/lib/xml-parser';

export async function GET() {
  try {
    // Lade Sample XML
    const samplePath = join(process.cwd(), 'data', 'samples', 'GP25-7647.xml');

    let xmlContent: string;
    try {
      xmlContent = readFileSync(samplePath, 'utf-8');
    } catch {
      return NextResponse.json({ error: `Sample file not found: ${samplePath}` }, { status: 404 });
    }

    // Parse
    const parsed = parseXML(xmlContent);

    // Return detailed result
    return NextResponse.json({
      success: true,
      summary: summarizeAuftrag(parsed),
      parsed: {
        auftragsnummer: parsed.auftragsnummer,
        produktart: parsed.produktart,
        produktbeschreibung: parsed.produktbeschreibung?.substring(0, 150) + '...',
        sachbearbeiter: parsed.sachbearbeiter,
        sachbearbeiterTelefon: parsed.sachbearbeiterTelefon,
        sachbearbeiterEmail: parsed.sachbearbeiterEmail,
        auflage: parsed.auflage,
        prioritaet: parsed.prioritaet,
        termine: {
          liefertermin: parsed.liefertermin?.toISOString().split('T')[0],
          drucktermin: parsed.drucktermin?.toISOString().split('T')[0],
          wtvTermin: parsed.wtvTermin?.toISOString().split('T')[0],
        },
        kunde: parsed.kunde,
        arbeitsgaengeCount: parsed.arbeitsgaenge.length,
        arbeitsgaenge: parsed.arbeitsgaenge.slice(0, 10).map((ag) => ({
          name: ag.name,
          kostenstelle: ag.kostenstelle,
          kostenstellenName: ag.kostenstellenName,
          zeitMinuten: ag.zeitMinuten,
          sortOrder: ag.sortOrder,
        })),
      },
      maschinenZusammenfassung: getMaschinenZusammenfassung(parsed.arbeitsgaenge),
    });
  } catch (error) {
    console.error('Parser test error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

function getMaschinenZusammenfassung(arbeitsgaenge: any[]) {
  const maschinenZeit = new Map<string, { name: string; zeit: number; count: number }>();

  for (const ag of arbeitsgaenge) {
    const key = ag.kostenstelle;
    const current = maschinenZeit.get(key) || { name: ag.kostenstellenName, zeit: 0, count: 0 };
    current.zeit += ag.zeitMinuten;
    current.count += 1;
    maschinenZeit.set(key, current);
  }

  return Array.from(maschinenZeit.entries())
    .map(([kostenstelle, data]) => ({
      kostenstelle,
      name: data.name,
      gesamtZeit: Math.round(data.zeit * 100) / 100,
      anzahlSchritte: data.count,
    }))
    .sort((a, b) => b.gesamtZeit - a.gesamtZeit);
}
