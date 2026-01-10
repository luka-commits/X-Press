# PRD: XOS Säule 1 - Digitale Fertigungs-Übersicht

**Projekt:** X-Press Operating System (XOS)
**Version:** 2.0
**Datum:** 10. Januar 2026
**Status:** Final - zur Implementierung freigegeben

---

## 1. Executive Summary

Säule 1 ersetzt die analoge "Auftragstasche" durch ein digitales Dashboard. Das System aggregiert Daten aus der Prinance-XML-Schnittstelle und visualisiert:

1. **Maschinenauslastung** - Kapazitäts-Ampel für Leitmaschinen
2. **Auftragsstatus** - Durchsuchbare Liste aller aktiven Jobs
3. **Produktionsplanung** - Visueller Kalender pro Maschine

**Kernprinzip:** Maschinen-zentriert statt workflow-zentriert. Keine manuelle Dateneingabe erforderlich.

---

## 2. Module

### 2.1 Modul 1-A: Executive Dashboard (18.500 €)

**Zweck:** Der Puls der Firma - Morgenansicht für Geschäftsführung

#### Komponenten:

**KPI-Kacheln (oben):**
| Kachel | Beschreibung |
|--------|--------------|
| Aktive Aufträge | Anzahl aller laufenden Jobs |
| Kritisch | Aufträge mit Liefertermin heute/morgen |
| Ø Auslastung | Durchschnittliche Maschinenauslastung (%) |
| Engpass | Maschine mit höchster Auslastung |

**Kapazitäts-Ampel (mitte):**
- Balkendiagramm pro Leitmaschine
- Farbkodierung: Grün (<70%), Gelb (70-90%), Rot (>90%)
- Prozentanzeige der Tagesauslastung

**Kritische Aufträge (unten):**
- Liste der Aufträge mit Liefertermin ≤ 2 Tage
- Sortiert nach Dringlichkeit
- Direktlink zur Detail-Ansicht

#### Datenquellen:
- Aggregation aus allen importierten XML-Dateien
- ZEIT-Attribute für Kapazitätsberechnung
- Liefertermin-Felder für Deadline-Tracking

#### Kapazitätsberechnung:

| Metrik | Formel |
|--------|--------|
| Tagesauslastung pro Maschine | Σ ZEIT aller Aufträge am Tag X / Tageskapazität (480 min) × 100% |
| Ø Auslastung (Dashboard) | Durchschnitt der Tagesauslastung aller Leitmaschinen |
| Engpass | Maschine mit höchster Tagesauslastung |
| Kritisch-Schwelle | > 90% Auslastung |

**Beispiel:**
- XL 106 hat am 25.07. drei Aufträge: 79 min + 45 min + 120 min = 244 min
- Tageskapazität: 480 min (8h)
- Auslastung: 244 / 480 = 51% (Grün)

---

### 2.2 Modul 1-B: Intelligente Auftragsliste (12.000 €)

**Zweck:** Finden statt Suchen - Kundenfragen in 2 Sekunden beantworten

#### Such- und Filterfunktionen:

**Volltextsuche:**
- Auftragsnummer (z.B. "GP25-7647")
- Kundenname (z.B. "Mikalo")
- Produkt (z.B. "Broschüre")

**Filter:**
| Filter | Optionen |
|--------|----------|
| Liefertermin | Heute, Diese Woche, Überfällig, Alle |
| Sachbearbeiter | Dropdown aus XML-Daten |
| Produkttyp | Broschüren, Plakate, Flyer, etc. |
| Status | Aktiv, Abgeschlossen |

#### Listenansicht:
```
Auftragsnr. | Kunde | Produkt | Liefertermin | Status | Aktion
GP25-7647 | Maria Mikalo | Broschüren | 05.08.2025 | In Produktion | [Details]
GP25-7689 | Villa Wessel | Plakate A3 | 02.08.2025 | Bereit | [Details]
```

#### Detail-Ansicht (Digitale Auftragstasche):

**Kundeninformationen:**
- Name, Firma
- Telefon, Mobil, E-Mail
- Adresse

**Produktspezifikationen:**
- Produkttyp und Beschreibung
- Format (z.B. 22.7 x 29.7 cm)
- Papiersorte und Grammatur
- Farbigkeit (z.B. 4/4-c)
- Auflage

**Termine:**
- Drucktermin (SOLL)
- WTV-Termin (SOLL)
- Liefertermin

**Arbeitsgänge:**
- Liste aller geplanten Schritte mit Maschine und Zeit
- Fortschrittsanzeige: "X von Y Arbeitsgängen"

---

### 2.3 Modul 1-C: Maschinen-Kalender (29.000 €)

**Zweck:** Planungssicherheit - Engpässe und Leerlauf auf einen Blick

#### Ansicht:
- **Tagesbasierte Darstellung** (keine Uhrzeiten)
- Horizontale Zeitachse (Wochentage Mo-Fr)
- Vertikale Liste der Leitmaschinen
- Pro Tag/Maschine: Liste der Aufträge mit Gesamtminuten und Auslastung %

#### Datenzuordnung (Termine → Maschinen):
| Termintyp | XML-Feld | Zugeordnete Maschinen |
|-----------|----------|----------------------|
| Drucktermin | `TerminDruck` | Druckmaschinen (Kostenstellen 42xx) |
| WTV-Termin | `TerminWTV` | Finishing: POLAR, Sammelhefter (Kostenstellen 5xxx, 6xxx) |

*Alle Arbeitsgänge eines Auftrags werden dem entsprechenden Termin zugeordnet.*

#### Leitmaschinen (MVP):

| # | Maschine | Kostenstelle | Tageskapazität |
|---|----------|--------------|----------------|
| 1 | Speedmaster XL 106-8P | 4250 | 480 min (8h) |
| 2 | Speedmaster CX 102-6+L | TBD* | 480 min |
| 3 | Speedmaster CD 102-5L | 4230 | 480 min |
| 4 | POLAR 115 XT / PACE 137 LW** | 5101 / TBD | 480 min |
| 5 | Sammelhefter ST-400 | TBD* | 480 min |

*TBD = bei Kickoff mit X-Press klären (nicht in Sample-XMLs enthalten)*

**Zwei POLAR-Schneidemaschinen vorhanden: POLAR 115 XT (Kostenstelle 5101, in XMLs) und POLAR PACE 137 LW (kritischer Engpass, Kostenstelle bei Kickoff klären).

**Architektur-Entscheidung:** Nur Leitmaschinen erscheinen in Dashboard (1-A) und Kalender (1-C). Alle Arbeitsgänge erscheinen in der Auftrags-Detailansicht (1-B). Begründung: Übersichtlichkeit, Fokus auf Engpässe, erweiterbar.

#### Farbkodierung:
| Farbe | Bedeutung |
|-------|-----------|
| Grün | Normal belegt (<70%) |
| Gelb | Hohe Auslastung (70-90%) |
| Rot | Überlastet (>90%) |
| Weiß/Grau | Frei |
| Blau (Rand) | Heute |

#### Interaktion:
- **Klick auf Block:** Öffnet Auftrags-Detail
- **Hover:** Zeigt Kurzinfo (Kunde, Produkt, Menge, Zeit)
- **Navigation:** Wochenweise vor/zurück

---

## 3. Daten-Architektur

### 3.1 Import-Pipeline

```
Prinance ERP
    ↓
Hotfolder (XML/JDF)
    ↓
XML-Parser (mit Encoding-Fix)
    ↓
PostgreSQL Datenbank
    ↓
Next.js API
    ↓
Dashboard Frontend
```

### 3.2 Datenmodell

```sql
-- Aufträge
CREATE TABLE auftraege (
    auftragsnummer VARCHAR PRIMARY KEY,
    kunde_id INTEGER REFERENCES kunden(id),
    produkttyp VARCHAR,
    produktbeschreibung TEXT,
    liefertermin DATE,
    drucktermin DATE,
    wtv_termin DATE,
    prioritaet INTEGER,
    status VARCHAR DEFAULT 'aktiv',
    xml_import_datum TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Kunden
CREATE TABLE kunden (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    firma VARCHAR,
    telefon VARCHAR,
    mobil VARCHAR,
    email VARCHAR,
    adresse TEXT,
    externe_nummer VARCHAR
);

-- Arbeitsgänge
CREATE TABLE arbeitsgaenge (
    id SERIAL PRIMARY KEY,
    auftrag_id VARCHAR REFERENCES auftraege(auftragsnummer),
    maschine_id INTEGER REFERENCES maschinen(id),
    sort_order INTEGER,
    zeit_minuten DECIMAL,
    geplant_datum DATE,
    beschreibung VARCHAR
);

-- Maschinen
CREATE TABLE maschinen (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    kurzname VARCHAR,
    kostenstelle VARCHAR,
    tageskapazitaet_minuten INTEGER DEFAULT 480,
    ist_leitmaschine BOOLEAN DEFAULT FALSE,  -- Nur true = erscheint in Dashboard/Kalender
    aktiv BOOLEAN DEFAULT TRUE
);
```

### 3.3 XML-Parsing

**Pflichtfelder:**

| Feld | XML-Pfad | Beispiel |
|------|----------|----------|
| Auftragsnummer | `Auftrag/@Auftragsnummer` | GP25-7647 |
| Kunde | `Kunde/Eintrag[@Art="Kurztext"]` | Maria Mikalo |
| **TerminDruck** | `Auftrag/Termine/@TerminDruck` | 45863 (Excel-Datum) |
| **TerminWTV** | `Auftrag/Termine/@TerminWTV` | 45868 (Excel-Datum) |
| **Liefertermin** | `Auftrag/Termine/@Liefertermin` | 45874 (Excel-Datum) |
| Produkttyp | `PRODUCTTYPE/@Objektgruppe` | Broschüren |
| Arbeitsgänge | `Arbeitsvorgang` mit `ZEIT` | 24 Minuten |
| Kostenstelle | `Arbeitsvorgang/@Kostenstelle` | 4250 |

**Datumskonvertierung (Excel OLE → JavaScript):**
```javascript
// Excel speichert Datum als Tage seit 1900-01-01
function excelDateToJS(excelDate) {
    return new Date((excelDate - 25569) * 86400 * 1000);
}

// Beispiele:
// 45863 → 2025-07-25 (TerminDruck)
// 45868 → 2025-07-30 (TerminWTV)
// 45874 → 2025-08-05 (Liefertermin)
```

**Encoding-Handling:**
```javascript
// Fix für fehlerhafte Umlaute
function fixEncoding(text) {
    return text
        .replace(/Ã¼/g, 'ü')
        .replace(/Ã¶/g, 'ö')
        .replace(/Ã¤/g, 'ä')
        .replace(/ÃŸ/g, 'ß')
        .replace(/Ã„/g, 'Ä')
        .replace(/Ã–/g, 'Ö')
        .replace(/Ãœ/g, 'Ü');
}
```

### 3.4 Kostenstellen-Mapping (aus XML-Analyse)

| Kostenstelle | Maschine | Kurzbez | Kategorie |
|--------------|----------|---------|-----------|
| **Druckmaschinen** ||||
| 4210 | Speedmaster 52-5L-P | SM52-5L-P | Bogenoffset |
| 4230 | Speedmaster CD102-5L | CD102-5L-N | Bogenoffset |
| 4250 | Speedmaster XL106-8P | XL106-8P-N | Bogenoffset (Flaggschiff) |
| **Weiterverarbeitung** ||||
| 5000 | Weiterverarbeitung (allg.) | WTV | Sammelkostenstelle |
| 5101 | Polar Mohr 115 XT | PM115XT | Schneiden |
| 5202 | Heidelberg Stahlfolder T82 | STAHL82 | Falzen |
| 5831 | Rillnak Rillmaschine | RILLNAK-N | Rillen |
| 5900 | Tisch (allgemein) | TI-ALLG | Handarbeit |
| 5920 | Verpackung | VERPACK | Verpacken |
| 5990 | Versandkosten | VERSAND | Logistik |
| **Vorstufe** ||||
| 1100 | DTP - Datenübernahme | DTP-NEU | Datenprüfung |
| 3300 | Digitale Bogenmontage | DIGI-MON | Druckvorbereitung |
| 3400 | Computer to Plate | CTP | Plattenbelichtung |
| **Material/Overhead** ||||
| 9910 | Prozesskosten Verwaltung | PZK-ALL | Overhead |
| 9990 | Frachtkosten/Versand | FRACHT | Logistik |
| 9997 | Farbe | FARBE | Material |
| 9998 | Papier | PAPIER | Material |

*Hinweis: Aus 2 Sample-XMLs extrahiert. Fehlende Maschinen (CX 102, ST-400, POLAR PACE) bei Kickoff klären.*

### 3.5 ZEIT-Aggregation

**Regel:** Gesamtzeit pro Maschine = Σ (ZEIT aller Elemente mit ZEIT > 0 pro Kostenstelle)

```javascript
// ZEIT-Werte sind in Arbeitsvorgang/Elemente Nodes verteilt
// Manche Elemente haben ZEIT="0.00" (z.B. Material) - diese ignorieren

function aggregiereZeit(arbeitsvorgang) {
    return arbeitsvorgang.Elemente
        .filter(el => parseFloat(el.ZEIT) > 0)
        .reduce((sum, el) => sum + parseFloat(el.ZEIT), 0);
}
```

**Beispiel aus XML:**
- Grundeinrichten Druckwerk: 15.00 min
- Fortdruck: 11.07 min
- Farbe: 0.00 min (Material, ignorieren)
- **Gesamt für Maschine:** 26.07 min

---

## 4. Tech-Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend | Next.js 14 (React) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes |
| Datenbank | Supabase (PostgreSQL) |
| ORM | Prisma |
| XML-Parser | fast-xml-parser |
| Hosting | Vercel oder eigener Server |

---

## 5. Abgrenzung (Out of Scope)

| Feature | Status | Begründung |
|---------|--------|------------|
| 7-Stage-Pipeline | Verworfen | Zu komplex, manuelle Quittierung unrealistisch |
| Manuelle Stage-Quittierung | Verworfen | Keine Adoption durch Mitarbeiter |
| Live-Sensor-Anbindung | Phase 2 | Technisch aufwändig |
| IST-Status (Echtzeit) | Phase 2 | Nur SOLL-Daten aus XML in Phase 1 |
| Lagerbestandsverwaltung | Nicht geplant | Anderes System |
| Mitarbeiter-Zeiterfassung | Nicht geplant | Anderes System |
| Alle 40 Maschinen | Reduziert | Nur 5-6 Leitmaschinen relevant |

---

## 6. Offene Punkte (vor Kickoff klären)

| # | Frage | Details | An |
|---|-------|---------|-----|
| 1 | **Fehlende Kostenstellen** | CX 102-6+L und Sammelhefter ST-400 nicht in Sample-XMLs. Welche Kostenstellen? | X-Press |
| 2 | **POLAR-Klärung** | In XML: "Polar Mohr 115 XT" (5101). Ist das identisch mit POLAR PACE 137 LW? | X-Press |
| 3 | **Leitmaschinen bestätigen** | Vorschlag: XL106, CX102, CD102, POLAR, ST-400. Fehlt etwas? Andere Prioritäten? | X-Press |
| 4 | **Hotfolder-Pfad** | UNC-Pfad zum XML-Export-Ordner? Netzlaufwerk oder lokal? | X-Press IT |
| 5 | **Export-Frequenz** | Wie oft exportiert Prinance XMLs? Bei jeder Änderung? Einmal täglich? | X-Press IT |
| 6 | **Duplikat-Handling** | Was passiert, wenn eine XML erneut exportiert wird? Überschreiben? | X-Press IT |
| 7 | **Tageskapazität** | 8h Einschicht oder 16h Zweischicht pro Maschine? | X-Press |
| 8 | **Mehr XML-Samples** | Verschiedene Produkttypen (Flyer, Plakate, Booklets) für Parser-Tests | X-Press |
| 9 | **Zugangsrollen** | Wer braucht Zugang? Nur GF oder auch Abteilungsleiter? | X-Press |

---

## 7. Zeitplan (Vorschlag)

| Phase | Inhalt | Dauer |
|-------|--------|-------|
| Sprint 1 | Setup, XML-Parser, Datenmodell | 2 Wochen |
| Sprint 2 | Modul 1-B (Auftragsliste) | 2 Wochen |
| Sprint 3 | Modul 1-A (Dashboard) | 2 Wochen |
| Sprint 4 | Modul 1-C (Kalender) | 3 Wochen |
| Sprint 5 | Testing, Bugfixes, UAT | 1-2 Wochen |

**Gesamt:** 10-11 Wochen

---

## 8. Erfolgskriterien

| Kriterium | Messung |
|-----------|---------|
| Auftrag finden | < 5 Sekunden |
| Dashboard lädt | < 2 Sekunden |
| XML-Import | Automatisch, ohne manuelle Eingriffe |
| Kapazitätsanzeige | Korrekt berechnet (validiert mit X-Press) |
| Adoption | Geschäftsführung nutzt Dashboard täglich |

---

## Anhang: UI-Mockups

### Dashboard (Modul 1-A)
```
┌─────────────────────────────────────────────────────────────┐
│  XOS Dashboard                          [Filter] [Refresh]  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ AUFTRÄGE │  │ KRITISCH │  │ AUSLASTG │  │ ENGPASS  │    │
│  │    47    │  │    3     │  │   78%    │  │  POLAR   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                             │
│  MASCHINEN-AUSLASTUNG                                       │
│  XL 106    [████████████████████░░░░░]  85%  🟡             │
│  CX 102    [████████████░░░░░░░░░░░░░]  60%  🟢             │
│  CD 102    [█████████████████████████]  95%  🔴             │
│  POLAR     [████████████████████████░]  92%  🔴             │
│                                                             │
│  KRITISCHE AUFTRÄGE (Liefertermin ≤ 2 Tage)                │
│  GP25-7647 │ Mikalo │ Broschüren │ HEUTE │ [Details]        │
│  GP25-7689 │ Villa W│ Plakate    │ morgen│ [Details]        │
└─────────────────────────────────────────────────────────────┘
```

### Maschinen-Kalender (Modul 1-C)
```
┌──────────────────────────────────────────────────────────────────┐
│  Maschinen-Kalender              [< Woche >]  KW 30 / 2025       │
├──────────────────────────────────────────────────────────────────┤
│          │ Mo 21    │ Di 22    │ Mi 23    │ Do 24    │ Fr 25    │
├──────────────────────────────────────────────────────────────────┤
│ XL 106   │          │ GP-7689  │          │ GP-7647  │ GP-7652  │
│          │    -     │  45 min  │    -     │  79 min  │ 120 min  │
│          │   0% 🟢  │   9% 🟢  │   0% 🟢  │  16% 🟢  │  25% 🟢  │
├──────────────────────────────────────────────────────────────────┤
│ CD 102   │ GP-7633  │          │ GP-7647  │          │          │
│          │  65 min  │    -     │  45 min  │    -     │    -     │
│          │  14% 🟢  │   0% 🟢  │   9% 🟢  │   0% 🟢  │   0% 🟢  │
├──────────────────────────────────────────────────────────────────┤
│ POLAR    │          │          │          │          │ GP-7647  │
│ (WTV)    │    -     │    -     │    -     │    -     │  90 min  │
│          │   0% 🟢  │   0% 🟢  │   0% 🟢  │   0% 🟢  │  19% 🟢  │
└──────────────────────────────────────────────────────────────────┘

Legende:
- Pro Zelle: Auftragsnummer(n), Gesamtminuten, Auslastung %
- Farben: 🟢 <70%  🟡 70-90%  🔴 >90%
- Druckmaschinen nutzen TerminDruck, POLAR/ST-400 nutzen TerminWTV
```
