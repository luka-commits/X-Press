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
- ✓ Pipeline Analytics Dashboard mit Funnel und KPIs — v1.6
- ✓ ThroughputChart Zeitreihen (Eingang vs Versendet) — v1.6
- ✓ Dashboard auf 4 KPIs reduziert (Problem-KPI in Reports) — v1.6
- ✓ KPI-Klick-Overlay mit Dialog und Auftragsliste — v1.7
- ✓ KPI-Detail-API für Dashboard-Drilldown — v1.7
- ✓ Reports-Drilldown bei Klick auf KPIs und Charts — v1.8
- ✓ Reports-KPI-API mit Zeitraum-Filter — v1.8
- ✓ Comprehensive test infrastructure (Jest, Testing Library, Prisma/Supabase mocks) — v1.9
- ✓ 235 unit and component tests with full coverage — v1.9
- ✓ Playwright E2E testing with smoke tests for all routes — v1.9
- ✓ Performance optimization: Lighthouse 47→100, LCP 17.3s→0.55s — v1.9
- ✓ Lazy loading for KPIOrdersDialog and Recharts components — v1.9
- ✓ ESLint strict mode (no-explicit-any as error, 0 warnings) — v1.9

### Active

(None yet — plan next milestone)

### Out of Scope

- Benachrichtigungen (E-Mail/SMS/Push) — v2, erhöht Komplexität
- Login/Authentifizierung — v2, MVP ohne Auth für schnellen Start
- Arbeitsgang-Quittierung — v2, Auftrag-Level reicht für Adoption
- Datum-Anpassungen — Produktionsplanung, nicht Shopfloor
- QR-Codes auf Auftragstaschen — nice-to-have, nicht MVP

## Context

**Shipped v1.9:**
- ~10,000 LOC TypeScript
- Tech stack: Next.js 14, Supabase, Prisma, Tailwind CSS, Google Maps API, Recharts
- 235 tests (unit, component, E2E) with full coverage
- Lighthouse 100 score on all routes
- Mobile-first /status page for shopfloor workers
- /versand page with routing optimization and navigation export
- /reports page with consolidated PipelineDashboard (Funnel, KPIs, Charts)
- Dashboard with 4 KPIs and click-through drilldown

**Production State:**
- Produktionsmitarbeiter können Auftragsstatus updaten
- Dashboard zeigt IST-Zustand vom Shopfloor mit Pipeline-Status (4 KPIs)
- KPI-Klick-Overlay: Bei Klick auf KPI-Karten öffnet sich Dialog mit Auftragsliste
- Problem-Aufträge sichtbar in Reports SnapshotKPIs
- Versand-Team hat Routenplanung mit Optimierung und Google Maps Export
- Management hat konsolidiertes Pipeline-Dashboard mit Zeitreihen und Drilldown
- Klare Tab-Verantwortlichkeiten: Aufträge = in Bearbeitung, Reports = Analytics + Shipped
- Performance optimiert: Lazy loading für Dialoge und Charts, 100 Lighthouse Score

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
| Factory pattern für Test-Fixtures | createMock* mit Overrides für maximale Flexibilität | ✓ Good |
| Chromium-only E2E Tests | Schnellere Testausführung, Cross-Browser später | ✓ Good |
| Lazy Loading für Dialoge | next/dynamic für on-demand Loading statt Route-Level Splitting | ✓ Good |
| Type Guards statt Type Assertions | Sicherere TypeScript-Nutzung für filter() Narrowing | ✓ Good |
| no-explicit-any als Error | Strikte TypeScript-Qualität, alle any justified oder entfernt | ✓ Good |

---
*Last updated: 2026-01-18 after v1.9 milestone*
