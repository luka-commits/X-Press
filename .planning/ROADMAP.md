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
**Plans**: TBD

Plans:
- [ ] 09-01: TBD (run /gsd:plan-phase 9 to break down)

#### Phase 10: Versand-API & Liste

**Goal**: Endpunkte für Versandfertig-Markierung, Liste mit Liefertermin-Filter
**Depends on**: Phase 9
**Research**: Unlikely (similar to Phase 2 Status API)
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

#### Phase 11: Versand-UI Seite

**Goal**: /versand Route mit PLZ-Sortierung, Versandfertig-Button
**Depends on**: Phase 10
**Research**: Unlikely (similar to Phase 3/6 mobile UI patterns)
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

#### Phase 12: Kartenansicht

**Goal**: Map-Integration mit Lieferadressen, PLZ-Cluster-Visualisierung
**Depends on**: Phase 11
**Research**: Likely (map library integration)
**Research topics**: Leaflet vs Mapbox vs Google Maps, React integration, PLZ clustering
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

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
| 9. Versand-Datenmodell | v1.1 | 0/? | Not started | - |
| 10. Versand-API & Liste | v1.1 | 0/? | Not started | - |
| 11. Versand-UI Seite | v1.1 | 0/? | Not started | - |
| 12. Kartenansicht | v1.1 | 0/? | Not started | - |
