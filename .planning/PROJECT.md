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
- ✓ Versand-Datenmodell (VersandStatus, Lieferadresse, Geocoding) — v1.1
- ✓ Versand-API & Liste mit PLZ-Sortierung — v1.1
- ✓ /versand Seite mit Status-Buttons — v1.1
- ✓ Google Maps Integration mit MarkerClusterer — v1.2
- ✓ Desktop Split-View Layout (Liste + Karte) — v1.2
- ✓ VersandKPIs (Offen/Versandbereit/Versendet/Überfällig) — v1.2
- ✓ Bidirektionale Karte-Liste Interaktion — v1.2
- ✓ Routenplanung mit manueller Sortierung — v1.3
- ✓ Nearest-Neighbor Routenoptimierung — v1.3
- ✓ Google Maps Navigation Export (Einzel + Multi-Stop) — v1.3
- ✓ Reports-Seite mit Sub-Navigation — v1.4
- ✓ Abgeschlossene Aufträge Tabelle mit Pagination — v1.4
- ✓ DateRangePicker mit deutschen Presets — v1.4
- ✓ Zeitraum-Analysen mit VolumeChart — v1.4
- ✓ Versand-Reports mit Liefermetriken und PLZ-Verteilung — v1.4
- ✓ Combined Pipeline-Status column (In Produktion → Fertig → Versandbereit → Versendet + Problem) — v1.5
- ✓ VersandStatus filter auf Aufträge-Seite — v1.5
- ✓ Reports in Sidebar-Navigation — v1.5
- ✓ Abgeschlossene tab zeigt nur versendete Aufträge — v1.5

### Active

(None yet — plan next milestone)

### Out of Scope

- Benachrichtigungen (E-Mail/SMS/Push) — v2, erhöht Komplexität
- Login/Authentifizierung — v2, MVP ohne Auth für schnellen Start
- Arbeitsgang-Quittierung — v2, Auftrag-Level reicht für Adoption
- Datum-Anpassungen — Produktionsplanung, nicht Shopfloor
- QR-Codes auf Auftragstaschen — nice-to-have, nicht MVP

## Context

**Shipped v1.5:**
- 9,777 LOC TypeScript
- Tech stack: Next.js 14, Supabase, Prisma, Tailwind CSS, Google Maps API, Recharts
- Mobile-first /status page for shopfloor workers
- /versand page with routing optimization and navigation export
- /reports page with completed orders, analytics, and shipping reports
- Dashboard integration with combined Pipeline-Status visibility

**Production State:**
- Produktionsmitarbeiter können Auftragsstatus updaten
- Dashboard zeigt IST-Zustand vom Shopfloor mit Pipeline-Status
- Problem-Aufträge sind sofort sichtbar
- Versand-Team hat Routenplanung mit Optimierung und Google Maps Export
- Management hat Reports mit historischen Daten und Analytics
- Klare Tab-Verantwortlichkeiten: Aufträge = in Bearbeitung, Reports = versendet

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
| PLZ-Sortierung für Versand | Geografische Gruppierung für effiziente Lieferungen | ✓ Good |
| Google Maps statt Leaflet | Bessere UX, Zukunft: Routenplanung | ✓ Good |
| Desktop Split-View (≥768px) | Karte immer sichtbar auf Desktop für schnellen Überblick | ✓ Good |
| Inline KPIs | Schneller Überblick ohne separaten Tab | ✓ Good |
| Bidirektionale Interaktion | Karte nützlich machen durch Card↔Marker Verknüpfung | ✓ Good |
| Link-Export statt Fahrer-Management | MVP-scope halten, Link reicht für Navigation | ✓ Good |
| Nearest-Neighbor Optimierung | Einfach zu implementieren, gute Ergebnisse für <20 Stops | ✓ Good |
| Inline tabs für Reports | Einfacher als layout.tsx für single-page reports section | ✓ Good |
| Supabase REST für Read Queries | Konsistent mit dashboard-queries pattern | ✓ Good |
| PLZ 2-Digit Gruppierung | Deutsche PLZ-Struktur erlaubt regionale Analyse | ✓ Good |
| Pipeline-Status Priorität | Problem > VersandStatus > IstStatus für klare Sichtbarkeit | ✓ Good |
| Abgeschlossene = nur versendet | Klare Trennung: Aufträge = in Bearbeitung, Reports = shipped | ✓ Good |

---
*Last updated: 2026-01-17 after v1.5 milestone*
