# XOS - X-Press Operating System

Digitales Dashboard zur Ablösung der analogen "Auftragstasche" bei X-Press Grafik & Druck Berlin.

## Säule 1: Digitale Fertigungs-Übersicht

### Module

| Modul | Funktion |
|-------|----------|
| 1-A | Executive Dashboard (Kapazitäts-Ampel) |
| 1-B | Intelligente Auftragsliste |
| 1-C | Maschinen-Kalender |

### Tech-Stack

- **Frontend:** Next.js 14 + React
- **Styling:** Tailwind CSS + shadcn/ui
- **Datenbank:** PostgreSQL
- **XML-Parser:** fast-xml-parser

## Projektstruktur

```
X-Press/
├── CLAUDE.md          # Projekt-Kontext für Claude
├── README.md          # Diese Datei
├── docs/              # Dokumentation
│   ├── PRD_XOS_Saeule1_v2.md
│   └── referenz/      # Beispiel-Auftragstaschen
├── data/samples/      # XML-Testdaten
└── src/               # Application Code
```

## Entwicklung

```bash
npm install
npm run dev
```

## Dokumentation

- [PRD Säule 1](docs/PRD_XOS_Saeule1_v2.md) - Product Requirements
- [Maschinenpark](docs/X-Press_Maschinenpark_Uebersicht.docx) - 40+ Maschinen
