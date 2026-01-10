# X-Press Operating System (XOS) - Projektübersicht

## Projekt-Kontext

**Unternehmen:** X-Press Grafik & Druck Berlin GmbH
**Standort:** Nunsdorfer Ring 13, 12277 Berlin-Marienfelde
**Produktionsfläche:** 5.500 m² auf 9.000 m² Firmengelände
**Mitarbeiter:** 48-60
**Maschinenpark:** 40+ spezialisierte Produktionssysteme
**Tägliches Druckvolumen:** 800.000+ Drucke
**Kundenstamm:** 3.000+ Bestandskunden

## Projektziel: Digitalisierung der Druckerei

Ablösung der analogen "Auftragstasche" durch ein digitales Dashboard (XOS). Beendigung der "Black Box" in der Auftragsverwaltung durch Visualisierung des Projektstatus.

---

## Säule 1: Digitale Fertigungs-Übersicht (59.500 €)

### Konzept: Maschinen-zentriert

**WICHTIG:** Das ursprüngliche 7-Stage-Modell wurde verworfen. Stattdessen:

- **Maschinen-Kalender** statt Stage-Pipeline
- **Automatischer Fortschritt** aus XML (keine manuelle Quittierung)
- **5-6 Leitmaschinen** statt alle 40 Maschinen

### Module:

| Modul | Funktion | Budget |
|-------|----------|--------|
| 1-A | Executive Dashboard (Kapazitäts-Ampel) | 18.500 € |
| 1-B | Intelligente Auftragsliste (Suche/Filter) | 12.000 € |
| 1-C | Maschinen-Kalender (Timeline pro Maschine) | 29.000 € |

### Leitmaschinen für MVP:

1. Speedmaster XL 106-8P (Flaggschiff)
2. Speedmaster CX 102-6+L
3. Speedmaster CD 102-5L
4. POLAR PACE 137 LW (Schneidroboter)
5. Sammelhefter ST-400

### Datenquelle

- **System:** Heidelberg Prinance ERP (Branchenstandard)
- **Export-Format:** JDF/JMF-kompatible XML-Dateien
- **Integration:** Hotfolder-Überwachung (Read-Only)

### Pflichtfelder aus XML

| Feld | XML-Element | Beispiel |
|------|-------------|----------|
| Auftragsnummer | `<Auftrag>` | GP25-7647 |
| Kunde + Kontakt | `<Kunde>` | Maria Mikalo |
| Produktart | `<PRODUCTTYPE>` | Fadengeheftete Broschüren |
| Liefertermin | Lieferdatum | 05.08.2025 |
| Maschinenzuweisung | Kostenstelle | Speedmaster XL106-8P |
| Zeitschätzung | `ZEIT="24"` | 24 Minuten |
| Arbeitsschritt-Reihenfolge | `Sort="400011"` | Workflow-Ordnung |

### Leitmaschinen für Kapazitäts-Tracking (MVP-Priorität)

**Tier 1 - Kritische Druckkapazität:**
- Heidelberg Speedmaster XL 106-8P (8-Farben + Lack, 75x106cm) - ~300 EUR/Stunde
- Heidelberg Speedmaster CX 102-6+L (6-Farben + UV-Lack)
- Heidelberg Speedmaster CD 102-5L (5-Farben + Lack)
- Heidelberg Speedmaster CD 74-5P+LX (5-Farben + Lack)
- Heidelberg Speedmaster SX 52-5L (5-Farben + Lack)

**Tier 2 - Kritischer Pfad:**
- POLAR PACE 137 LW (Vollautomatischer Schneidroboter) [ENGPASS]
- Heidelberg Sammelhefter ST-400 (Hochleistungs-Bindung)

**Tier 3 - Premium-Finishing:**
- IMG Brausse 1050 SEF (Tiegel-Stanzautomat)
- SPS Vitessa XP (Partielle UV-Lackierung, Glitzereffekte)
- Billhöfer EK-Trendline (Kaschierung)

---

## Technische Rahmenbedingungen

- **Plattform:** Webbasierte Applikation (Desktop-optimiert)
- **Status-Updates:** Manuell durch Abteilungsleiter (Stage-Quittierung)
- **Schnittstellen:** Read-Only Zugriff auf Prinance-Exports
- **Keine:** Live-Sensor-Anbindung, automatische Lagerbestandsbuchung, Zeiterfassung

---

## Tech-Stack (entschieden)

| Komponente | Technologie |
|------------|-------------|
| Frontend | Next.js 14 (React) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes |
| Datenbank | PostgreSQL |
| XML-Parser | fast-xml-parser |

## Bekannte Herausforderungen

1. **XML-Encoding:** Umlaute fehlerhaft (Ã¼ statt ü) - robustes Parsing erforderlich
2. **Daten-Konsistenz:** Nur 2 Sample-XMLs analysiert - mehr Samples bei Kickoff anfordern
3. **Hotfolder-Zuverlässigkeit:** Dashboard hängt von kontinuierlichen Prinance-Exports ab
4. **SOLL vs. IST:** Phase 1 zeigt nur Planungsdaten, keine Ist-Zustände
5. **Kostenstellen-Mapping:** Muss bei Kickoff mit X-Press geklärt werden

---

## Machbarkeitsanalyse

**Score:** 96/100 - "Phase 1 ist vollständig umsetzbar"

**Datenverfügbarkeit für MVP:**
- Modul 1-A (Executive Dashboard): 100%
- Modul 1-B (Auftragsliste): 100%
- Modul 1-C (Kalender): 90%

---

## Projekt-Dokumentation

| Datei | Zweck |
|-------|-------|
| `PRD_XOS_Saeule1.md` | Product Requirements Document |
| `Machbarkeitsanalyse_Phase1.docx` | Machbarkeitsstudie (96/100) |
| `X-Press_Maschinenpark_Uebersicht.docx` | Kompletter Maschinenpark |
| `GP25-7647.xml` | Beispiel-Auftrag (Broschüren) |
| `GP25-7689.xml` | Beispiel-Auftrag (Plakate) |

---

## Quick Reference: XML-Struktur

```xml
<Auftrag>           <!-- Order Master Data -->
  <Kunde>           <!-- Customer + Contact -->
  <LeListe>         <!-- Labor Entries (Zeit-Schätzungen) -->
  <AvEreignisse>    <!-- Events/Milestones -->
  <Arbeitsvorgang>  <!-- Work Steps/Processes -->
  <PRODUCTTYPE>     <!-- Product Specifications -->
  <Bogengruppen>    <!-- Sheet Groups -->
  <JOB2JDF>         <!-- JDF Mapping -->
</Auftrag>
```

Wichtige Attribute:
- `ZEIT="24"` - Zeitschätzung in Minuten
- `Sort="400011"` - Workflow-Reihenfolge
- `KpPriorität` - Auftragspriorität (Skala unklar)
