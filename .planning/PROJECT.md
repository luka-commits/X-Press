# XOS Mobile Status-Update

## What This Is

Eine mobil-optimierte Web-App für Produktionsmitarbeiter bei X-Press, um Auftragsstatus in Echtzeit zu aktualisieren. Die App erweitert das bestehende XOS Dashboard um IST-Zustand-Erfassung vom Shopfloor mit einem 3-Klick-Workflow.

## Core Value

**Mitarbeiter können mit 3 Klicks den Auftragsstatus vom Handy aus updaten.** Wenn das nicht funktioniert oder zu kompliziert ist, wird es nicht genutzt.

## Requirements

### Validated

- ✓ Dashboard zeigt SOLL-Daten aus Prinance XML — existing
- ✓ Auftragssuche und Filterung funktioniert — existing
- ✓ Datenbank-Schema für Aufträge vorhanden — existing
- ✓ Mobile Status-Update Seite (`/status`) mit 3-Klick-Workflow — v1.0
- ✓ Datenbank-Erweiterung (istStatus, statusKommentar, statusUpdatedAt) — v1.0
- ✓ API-Endpoint für Status-Updates (PATCH /api/orders/[id]/status) — v1.0
- ✓ Dashboard-Integration (IST-Status-Spalte, Problem-Zähler, Filter) — v1.0

### Active

(None yet — plan next milestone)

### Out of Scope

- Benachrichtigungen (E-Mail/SMS/Push) — v2, erhöht Komplexität
- Login/Authentifizierung — v2, MVP ohne Auth für schnellen Start
- Arbeitsgang-Quittierung — v2, Auftrag-Level reicht für Adoption
- Datum-Anpassungen — Produktionsplanung, nicht Shopfloor
- QR-Codes auf Auftragstaschen — nice-to-have, nicht MVP

## Context

**Shipped v1.0:**
- 5,914 LOC TypeScript
- Tech stack: Next.js 14, Supabase, Prisma, Tailwind CSS
- Mobile-first /status page for shopfloor workers
- Dashboard integration with IST-Status visibility

**Production State:**
- Produktionsmitarbeiter können Auftragsstatus updaten
- Dashboard zeigt IST-Zustand vom Shopfloor
- Problem-Aufträge sind sofort sichtbar

## Constraints

- **Tech Stack**: Next.js 14, Supabase, Prisma (bestehendes Projekt erweitern)
- **Mobile-First**: Status-Seite muss auf Smartphone perfekt funktionieren
- **Adoption**: Maximal 3 Klicks für ein Status-Update
- **Integration**: Gleiche Codebase, neue Route `/status`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Auftrag-basiert statt Arbeitsgang-basiert | Einfacher = höhere Adoption bei Mitarbeitern | ✓ Good |
| Kein Login für MVP | Schneller Start, Komplexität reduzieren | ✓ Good |
| Gleiche Codebase | Shared DB, Types, API - weniger Wartung | ✓ Good |
| 3 Status-Optionen | Klar und eindeutig, keine Entscheidungsmüdigkeit | ✓ Good |
| Kommentar optional | Pflichtfeld würde Nutzung reduzieren | ✓ Good |
| Prisma db push statt migrate dev | Database hatte Drift (Tables ohne Migration History) | ✓ Good |
| IstStatus separat von status Feld | IST-Zustand vom Shopfloor, nicht Order Lifecycle | ✓ Good |
| Amber für in_produktion | Visuelle Unterscheidung von grün (fertig) und rot (problem) | ✓ Good |

---
*Last updated: 2026-01-16 after v1.0 milestone*
