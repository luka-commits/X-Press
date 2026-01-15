# XOS Mobile Status-Update

## What This Is

Eine mobil-optimierte Web-App für Produktionsmitarbeiter bei X-Press, um Auftragsstatus in Echtzeit zu aktualisieren. Die App erweitert das bestehende XOS Dashboard um IST-Zustand-Erfassung und beendet die "Black Box" in der Produktion.

## Core Value

**Mitarbeiter können mit 3 Klicks den Auftragsstatus vom Handy aus updaten.** Wenn das nicht funktioniert oder zu kompliziert ist, wird es nicht genutzt.

## Requirements

### Validated

- ✓ Dashboard zeigt SOLL-Daten aus Prinance XML — existing
- ✓ Auftragssuche und Filterung funktioniert — existing
- ✓ Datenbank-Schema für Aufträge vorhanden — existing

### Active

- [ ] Mobile Status-Update Seite (`/status`)
  - Suchfeld mit Autocomplete (Auftragsnummer, Kunde, Produkt)
  - Auftragsdetails anzeigen (Kunde, Produkt, Liefertermin)
  - 3 große Status-Buttons: "In Produktion" / "Fertig" / "Problem"
  - Optionales Kommentarfeld
  - Bestätigungsmeldung nach Update

- [ ] Datenbank-Erweiterung
  - Neues Feld `istStatus` in Auftrag-Tabelle
  - Neues Feld `statusKommentar` in Auftrag-Tabelle
  - Neues Feld `statusUpdatedAt` für Zeitstempel

- [ ] API-Endpoint für Status-Updates
  - PATCH `/api/orders/[id]/status`
  - Akzeptiert: status, kommentar
  - Validierung der Status-Werte

- [ ] Dashboard-Integration
  - IST-Status-Spalte in Auftragsliste
  - Farbcodierung: 🟢 Fertig, 🟡 In Produktion, 🔴 Problem
  - Problem-Zähler auf Dashboard-Startseite
  - Filter: "Nur Problemaufträge anzeigen"

### Out of Scope

- Benachrichtigungen (E-Mail/SMS/Push) — v2, erhöht Komplexität
- Login/Authentifizierung — v2, MVP ohne Auth für schnellen Start
- Arbeitsgang-Quittierung — v2, Auftrag-Level reicht für Adoption
- Datum-Anpassungen — Produktionsplanung, nicht Shopfloor
- QR-Codes auf Auftragstaschen — nice-to-have, nicht MVP

## Context

**Ausgangssituation:**
- XOS Dashboard zeigt nur SOLL-Zustand (Prinance XML)
- Kein Feedback vom Shopfloor
- Produktion ist "Black Box"
- Bisherige Lösung: Analoge Auftragstasche

**Nutzer:**
- Produktionsmitarbeiter (Drucker, Schneider, Buchbinder)
- Arbeiten an Maschinen, haben Smartphone dabei
- Wollen nicht viel tippen

**Technische Basis:**
- Bestehendes Next.js 14 Projekt
- Supabase PostgreSQL
- Prisma ORM
- Deployed auf Vercel

## Constraints

- **Tech Stack**: Next.js 14, Supabase, Prisma (bestehendes Projekt erweitern)
- **Mobile-First**: Status-Seite muss auf Smartphone perfekt funktionieren
- **Adoption**: Maximal 3 Klicks für ein Status-Update
- **Integration**: Gleiche Codebase, neue Route `/status`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Auftrag-basiert statt Arbeitsgang-basiert | Einfacher = höhere Adoption bei Mitarbeitern | — Pending |
| Kein Login für MVP | Schneller Start, Komplexität reduzieren | — Pending |
| Gleiche Codebase | Shared DB, Types, API - weniger Wartung | — Pending |
| 3 Status-Optionen | Klar und eindeutig, keine Entscheidungsmüdigkeit | — Pending |
| Kommentar optional | Pflichtfeld würde Nutzung reduzieren | — Pending |

---
*Last updated: 2026-01-16 after project initialization*
