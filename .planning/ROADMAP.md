# Roadmap: XOS Mobile Status-Update

## Milestones

- ✅ **v1.0 Mobile Status-Update** — Phases 1-8 (shipped 2026-01-16)
- 🚧 **v1.1 Versand-Übersicht** — Phases 9-12 (in progress)

## Completed Milestones

- ✅ [v1.0 Mobile Status-Update](milestones/v1.0-ROADMAP.md) (Phases 1-8) — SHIPPED 2026-01-16

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

### 🚧 v1.1 Versand-Übersicht (In Progress)

**Milestone Goal:** Versand-Team kann sehen welche Aufträge wann wohin müssen, optimiert durch PLZ-Sortierung und Kartenansicht

#### Phase 9: Versand-Datenmodell

**Goal**: VersandStatus Enum und Adress-Parsing aus XML erweitern
**Depends on**: v1.0 complete
**Research**: Unlikely (extending existing schema patterns)
**Plans**: 1

Plans:
- [x] 09-01: Versand-Datenmodell (VersandStatus enum, address fields)

#### Phase 10: Versand-API & Liste

**Goal**: Endpunkte für Versandfertig-Markierung, Liste mit Liefertermin-Filter
**Depends on**: Phase 9
**Research**: Unlikely (similar to Phase 2 Status API)
**Plans**: 1

Plans:
- [x] 10-01: Versand-API (PATCH status, GET orders with PLZ sorting)

#### Phase 11: Versand-UI Seite

**Goal**: /versand Route mit PLZ-Sortierung, Versandfertig-Button
**Depends on**: Phase 10
**Research**: Unlikely (similar to Phase 3/6 mobile UI patterns)
**Plans**: 1

Plans:
- [x] 11-01: Versand-UI (page, order list, status buttons)

#### Phase 12: Kartenansicht

**Goal**: Map-Integration mit Lieferadressen, PLZ-Cluster-Visualisierung
**Depends on**: Phase 11
**Research**: Complete (12-RESEARCH.md)
**Plans**: 2

Plans:
- [x] 12-01: Geocoding Setup (DB fields, PLZ lookup utility, API coordinates)
- [ ] 12-02: Map Component (Leaflet integration, marker clustering)

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
| 12. Kartenansicht | v1.1 | 1/2 | In progress | - |
