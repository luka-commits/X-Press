/**
 * Supabase Client für UI-Reads
 *
 * Verwendet REST API statt direkte PostgreSQL-Verbindung
 * → Keine Connection-Pooler-Probleme
 * → Schneller für Serverless
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 10 Sekunden Timeout um endloses Laden zu verhindern
const QUERY_TIMEOUT_MS = 10000;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
});

// Typen für unsere Tabellen (basierend auf Prisma-Schema)
export interface Kunde {
  id: number;
  name: string | null;
  firma: string | null;
  telefon: string | null;
  mobil: string | null;
  email: string | null;
  adresse: string | null;
  externeNummer: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Maschine {
  id: number;
  name: string;
  kurzname: string | null;
  kostenstelle: string | null;
  tageskapazitaetMinuten: number;
  istLeitmaschine: boolean;
  aktiv: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Arbeitsgang {
  id: number;
  auftragId: string;
  maschineId: number | null;
  sortOrder: number | null;
  zeitMinuten: number | null;
  geplantDatum: string | null;
  beschreibung: string | null;
  kostenstelle: string | null;
  createdAt: string;
  updatedAt: string;
  Maschine?: Maschine | null;
}

export interface Auftrag {
  auftragsnummer: string;
  kundeId: number | null;
  produkttyp: string | null;
  produktbeschreibung: string | null;
  liefertermin: string | null;
  drucktermin: string | null;
  wtvTermin: string | null;
  prioritaet: number | null;
  status: string;
  xmlImportDatum: string;
  createdAt: string;
  updatedAt: string;
  Kunde?: Kunde | null;
  Arbeitsgang?: Arbeitsgang[];
}
