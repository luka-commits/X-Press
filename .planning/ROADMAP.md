# Roadmap: XOS Mobile Status-Update

## Milestones

- ✅ **v1.0 Mobile Status-Update** — Phases 1-8 (shipped 2026-01-16)
- ✅ **v1.1 Versand-Übersicht** — Phases 9-12 (shipped 2026-01-16)
- ✅ **v1.2 Versand Pro** — Phases 13-14 (shipped 2026-01-16)
- ✅ **v1.3 Routenplanung** — Phases 15-17 (shipped 2026-01-16)
- ✅ **v1.4 Reporting** — Phases 18-20 (shipped 2026-01-17)
- ✅ **v1.5 System-Konsolidierung** — Phases 21-22 (shipped 2026-01-17)
- ✅ **v1.6 Pipeline-Analytics** — Phases 23-24 (shipped 2026-01-17)
- ✅ **v1.7 KPI-Klick-Overlay** — Phases 25-27 (shipped 2026-01-17)
- ✅ **v1.8 Reports-Drilldown** — Phases 28-29 (shipped 2026-01-17)
- 🚧 **v1.9 Fixes** — Phases 30-37 (in progress)

---

### 🚧 v1.9 Fixes (In Progress)

**Milestone Goal:** Systematisches Testing, Bug-Fixes, Performance-Optimierung und Code-Quality Verbesserungen.

#### Phase 30: Test-Setup ✓

**Goal**: Jest und Testing-Library konfigurieren, Test-Grundlagen schaffen
**Depends on**: Previous milestone complete
**Research**: Unlikely (established patterns)
**Plans**: 1/1 complete

Plans:
- [x] 30-01: Test utilities and mocks (Prisma/Supabase mocks, fixtures, docs update) — completed 2026-01-17

#### Phase 31: Unit-Tests API ✓

**Goal**: Tests für API-Routen und Datenlogik schreiben
**Depends on**: Phase 30
**Research**: Unlikely (internal patterns)
**Plans**: 2/2 complete

Plans:
- [x] 31-01: Core Orders API tests (list, status, search) — completed 2026-01-18
- [x] 31-02: Dashboard & Reports API tests (kpi-orders, pipeline) — completed 2026-01-18

#### Phase 32: Component-Tests ✓

**Goal**: Tests für kritische UI-Komponenten (Dashboard, Versand, Reports)
**Depends on**: Phase 30
**Research**: Unlikely (internal patterns)
**Plans**: 3/3 complete

Plans:
- [x] 32-01: Dashboard dialog tests (KPIOrdersDialog, DashboardClient) — completed 2026-01-18
- [x] 32-02: Orders & Versand tests (OrderFilters, VersandKPIs) — completed 2026-01-18
- [x] 32-03: Reports tests (SnapshotKPIs, ReportsOrdersDialog) — completed 2026-01-18

#### Phase 33: E2E-Tests ✓

**Goal**: End-to-End Tests für Hauptworkflows (Status-Update, Versand, Reports)
**Depends on**: Phase 31, 32
**Research**: Unlikely (Playwright/Cypress patterns)
**Plans**: 3/3 complete

Plans:
- [x] 33-01: Playwright E2E setup (smoke tests for all pages) — completed 2026-01-18
- [x] 33-02: Status workflow E2E tests (search, select, update) — completed 2026-01-18
- [x] 33-03: Dashboard & Reports drilldown E2E tests — completed 2026-01-18

#### Phase 34: Bug-Fixes ✓

**Goal**: Gefundene Bugs aus Testing und bekannte Issues beheben
**Depends on**: Phase 33
**Research**: Unlikely (internal code)
**Plans**: 1/1 complete

Plans:
- [x] 34-01: Bug analysis (no bugs found - all tests pass) — completed 2026-01-18

#### Phase 35: Performance-Audit ✓

**Goal**: Lighthouse-Audit, Bundle-Analyse, Render-Performance messen
**Depends on**: Phase 34
**Research**: Unlikely (standard tools)
**Plans**: 1/1 complete

Plans:
- [x] 35-01: Performance audit (Lighthouse, bundle analysis, Core Web Vitals) — completed 2026-01-18

#### Phase 36: Performance-Optimierung ✓

**Goal**: Identifizierte Bottlenecks beheben (Bundle-Size, Lazy-Loading, Caching)
**Depends on**: Phase 35
**Research**: Unlikely (Next.js patterns)
**Plans**: 3/3 complete

Plans:
- [x] 36-01: Dashboard KPIOrdersDialog lazy loading (next/dynamic) — completed 2026-01-18
- [x] 36-02: Reports Recharts lazy loading (all chart components) — completed 2026-01-18
- [x] 36-03: Verify optimizations (Lighthouse re-audit, checkpoint) — completed 2026-01-18

#### Phase 37: Code-Quality

**Goal**: ESLint strict, TypeScript strict, Dead-Code entfernen, Konsistenz
**Depends on**: Phase 36
**Research**: Unlikely (established tooling)
**Plans**: TBD

Plans:
- [ ] 37-01: TBD

---

## Completed Milestones

- ✅ [v1.0 Mobile Status-Update](milestones/v1.0-ROADMAP.md) (Phases 1-8) — SHIPPED 2026-01-16
- ✅ [v1.1 Versand-Übersicht](milestones/v1.1-ROADMAP.md) (Phases 9-12) — SHIPPED 2026-01-16
- ✅ [v1.2 Versand Pro](milestones/v1.2-ROADMAP.md) (Phases 13-14) — SHIPPED 2026-01-16
- ✅ [v1.3 Routenplanung](milestones/v1.3-ROADMAP.md) (Phases 15-17) — SHIPPED 2026-01-16
- ✅ [v1.4 Reporting](milestones/v1.4-ROADMAP.md) (Phases 18-20) — SHIPPED 2026-01-17
- ✅ [v1.5 System-Konsolidierung](milestones/v1.5-ROADMAP.md) (Phases 21-22) — SHIPPED 2026-01-17
- ✅ [v1.6 Pipeline-Analytics](milestones/v1.6-ROADMAP.md) (Phases 23-24) — SHIPPED 2026-01-17
- ✅ [v1.7 KPI-Klick-Overlay](milestones/v1.7-ROADMAP.md) (Phases 25-27) — SHIPPED 2026-01-17
- ✅ [v1.8 Reports-Drilldown](milestones/v1.8-ROADMAP.md) (Phases 28-29) — SHIPPED 2026-01-17

<details>
<summary>✅ v1.0 Mobile Status-Update (Phases 1-8) — SHIPPED 2026-01-16</summary>

Erweiterung des XOS Dashboards um mobile Status-Update-Funktionalität. Produktionsmitarbeiter können per Smartphone den Auftragsstatus aktualisieren.

- [x] Phase 1: Database Schema (1/1 plans) — completed 2026-01-15
- [x] Phase 2: Status API (1/1 plans) — completed 2026-01-15
- [x] Phase 3: Mobile Layout (1/1 plans) — completed 2026-01-16
- [x] Phase 4: Order Search (2/2 plans) — completed 2026-01-16
- [x] Phase 5: Order Selection (1/1 plans) — completed 2026-01-16
- [x] Phase 6: Status Update UI (2/2 plans) — completed 2026-01-16
- [x] Phase 7: Dashboard Status Column (1/1 plans) — completed 2026-01-16
- [x] Phase 8: Dashboard Problem Features (2/2 plans) — completed 2026-01-16

</details>

<details>
<summary>✅ v1.1 Versand-Übersicht (Phases 9-12) — SHIPPED 2026-01-16</summary>

Versand-Team Workflow mit PLZ-Sortierung und Geocoding-Grundlagen.

- [x] Phase 9: Versand-Datenmodell (1/1 plans) — completed 2026-01-15
- [x] Phase 10: Versand-API & Liste (1/1 plans) — completed 2026-01-15
- [x] Phase 11: Versand-UI Seite (1/1 plans) — completed 2026-01-15
- [x] Phase 12: Kartenansicht (1/2 plans) — completed 2026-01-16
  - Note: 12-02 (Leaflet Map) replaced by v1.2 Google Maps integration

</details>

<details>
<summary>✅ v1.2 Versand Pro (Phases 13-14) — SHIPPED 2026-01-16</summary>

Verbesserte Versand-Seite mit Google Maps, interaktiver Karte und Inline-KPIs.

- [x] Phase 13: Google Maps Migration (1/1 plans) — completed 2026-01-16
- [x] Phase 14: Desktop Layout + KPIs + Karte-Liste Interaktion (1/1 plans) — completed 2026-01-16
  - Note: Phase 15 (KPIs) integrated into Phase 14

</details>

<details>
<summary>✅ v1.3 Routenplanung (Phases 15-17) — SHIPPED 2026-01-16</summary>

Routenplanung für Versand-Team mit Optimierung und Google Maps Navigation Export.

- [x] Phase 15: Routenplanung-Basis (1/1 plans) — completed 2026-01-16
- [x] Phase 16: Routenoptimierung (1/1 plans) — completed 2026-01-16
- [x] Phase 17: Export & Fahrer (1/1 plans) — completed 2026-01-16
  - Note: Phase 18 (Fahrer-Management) removed — Link-Export sufficient for now

</details>

<details>
<summary>✅ v1.4 Reporting (Phases 18-20) — SHIPPED 2026-01-17</summary>

Historische Daten und Analytics für Management-Übersicht mit Reports-Sektion.

- [x] Phase 18: Reports-Grundstruktur (1/1 plans) — completed 2026-01-16
- [x] Phase 19: Zeitraum-Analysen (2/2 plans) — completed 2026-01-17
- [x] Phase 20: Versand-Reports (2/2 plans) — completed 2026-01-17

</details>

<details>
<summary>✅ v1.5 System-Konsolidierung (Phases 21-22) — SHIPPED 2026-01-17</summary>

Kohäsives System aus User-Sicht: klare Pipeline-Logik, klare Tab-Verantwortlichkeiten, keine gemischten Daten.

- [x] Phase 21: Aufträge Pipeline-View (1/1 plans) — completed 2026-01-16
- [x] Phase 22: Reports & Navigation (1/1 plans) — completed 2026-01-17

</details>

<details>
<summary>✅ v1.6 Pipeline-Analytics (Phases 23-24) — SHIPPED 2026-01-17</summary>

Reports zu einem fokussierten Pipeline-Dashboard konsolidieren, Dashboard entschlacken.

- [x] Phase 23: Reports neu (1/1 plans) — completed 2026-01-17
- [x] Phase 24: Reports Zeitreihen + Dashboard (1/1 plans) — completed 2026-01-17

</details>

<details>
<summary>✅ v1.7 KPI-Klick-Overlay (Phases 25-27) — SHIPPED 2026-01-17</summary>

Bei Klick auf KPI-Karten im Dashboard öffnet sich ein Dialog mit der zugehörigen Auftragsliste.

- [x] Phase 25: Dialog-Komponente (1/1 plans) — completed 2026-01-17
- [x] Phase 26: KPI-Detail-API (1/1 plans) — completed 2026-01-17
- [x] Phase 27: KPI-Overlay-UI (1/1 plans) — completed 2026-01-17

</details>

<details>
<summary>v1.8 Reports-Drilldown (Phases 28-29) — SHIPPED 2026-01-17</summary>

Bei Klick auf KPIs und Charts in der Reports-Seite öffnet sich ein Dialog mit der zugehörigen Auftragsliste.

- [x] Phase 28: Reports-KPI-API (1/1 plans) — completed 2026-01-17
- [x] Phase 29: Reports-Drilldown-UI (3/3 plans) — completed 2026-01-17

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Database Schema | v1.0 | 1/1 | Complete | 2026-01-15 |
| 2. Status API | v1.0 | 1/1 | Complete | 2026-01-15 |
| 3. Mobile Layout | v1.0 | 1/1 | Complete | 2026-01-16 |
| 4. Order Search | v1.0 | 2/2 | Complete | 2026-01-16 |
| 5. Order Selection | v1.0 | 1/1 | Complete | 2026-01-16 |
| 6. Status Update UI | v1.0 | 2/2 | Complete | 2026-01-16 |
| 7. Dashboard Status Column | v1.0 | 1/1 | Complete | 2026-01-16 |
| 8. Dashboard Problem Features | v1.0 | 2/2 | Complete | 2026-01-16 |
| 9. Versand-Datenmodell | v1.1 | 1/1 | Complete | 2026-01-15 |
| 10. Versand-API & Liste | v1.1 | 1/1 | Complete | 2026-01-15 |
| 11. Versand-UI Seite | v1.1 | 1/1 | Complete | 2026-01-15 |
| 12. Kartenansicht | v1.1 | 1/1 | Complete | 2026-01-16 |
| 13. Google Maps Migration | v1.2 | 1/1 | Complete | 2026-01-16 |
| 14. Desktop + KPIs + Interaktion | v1.2 | 1/1 | Complete | 2026-01-16 |
| 15. Routenplanung-Basis | v1.3 | 1/1 | Complete | 2026-01-16 |
| 16. Routenoptimierung | v1.3 | 1/1 | Complete | 2026-01-16 |
| 17. Export & Fahrer | v1.3 | 1/1 | Complete | 2026-01-16 |
| 18. Reports-Grundstruktur | v1.4 | 1/1 | Complete | 2026-01-16 |
| 19. Zeitraum-Analysen | v1.4 | 2/2 | Complete | 2026-01-17 |
| 20. Versand-Reports | v1.4 | 2/2 | Complete | 2026-01-17 |
| 21. Aufträge Pipeline-View | v1.5 | 1/1 | Complete | 2026-01-16 |
| 22. Reports & Navigation | v1.5 | 1/1 | Complete | 2026-01-17 |
| 23. Reports neu | v1.6 | 1/1 | Complete | 2026-01-17 |
| 24. Reports Zeitreihen + Dashboard | v1.6 | 1/1 | Complete | 2026-01-17 |
| 25. Dialog-Komponente | v1.7 | 1/1 | Complete | 2026-01-17 |
| 26. KPI-Detail-API | v1.7 | 1/1 | Complete | 2026-01-17 |
| 27. KPI-Overlay-UI | v1.7 | 1/1 | Complete | 2026-01-17 |
| 28. Reports-KPI-API | v1.8 | 1/1 | Complete | 2026-01-17 |
| 29. Reports-Drilldown-UI | v1.8 | 3/3 | Complete | 2026-01-17 |
| 30. Test-Setup | v1.9 | 1/1 | Complete | 2026-01-17 |
| 31. Unit-Tests API | v1.9 | 2/2 | Complete | 2026-01-18 |
| 32. Component-Tests | v1.9 | 3/3 | Complete | 2026-01-18 |
| 33. E2E-Tests | v1.9 | 3/3 | Complete | 2026-01-18 |
| 34. Bug-Fixes | v1.9 | 1/1 | Complete | 2026-01-18 |
| 35. Performance-Audit | v1.9 | 1/1 | Complete | 2026-01-18 |
| 36. Performance-Optimierung | v1.9 | 3/3 | Complete | 2026-01-18 |
| 37. Code-Quality | v1.9 | 0/? | Not started | - |
