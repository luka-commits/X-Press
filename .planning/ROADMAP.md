# Roadmap: XOS Mobile Status-Update

## Milestones

- ✅ **v1.0 Mobile Status-Update** — Phases 1-8 (shipped 2026-01-16)
- ✅ **v1.1 Versand-Übersicht** — Phases 9-12 (shipped 2026-01-16)
- ✅ **v1.2 Versand Pro** — Phases 13-14 (shipped 2026-01-16)
- 🚧 **v1.3 Routenplanung** — Phases 15-18 (in progress)

## Completed Milestones

- ✅ [v1.0 Mobile Status-Update](milestones/v1.0-ROADMAP.md) (Phases 1-8) — SHIPPED 2026-01-16
- ✅ [v1.1 Versand-Übersicht](milestones/v1.1-ROADMAP.md) (Phases 9-12) — SHIPPED 2026-01-16
- ✅ [v1.2 Versand Pro](milestones/v1.2-ROADMAP.md) (Phases 13-14) — SHIPPED 2026-01-16

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

### 🚧 v1.3 Routenplanung (In Progress)

**Milestone Goal:** Routenplanung für Versand-Team mit Optimierung und Multi-Fahrer Support

#### Phase 15: Routenplanung-Basis

**Goal**: Modus-Toggle, Auftragsauswahl, Route auf Karte visualisieren
**Depends on**: v1.2 complete
**Research**: Unlikely (internal patterns, existing /versand page)
**Plans**: TBD

Plans:
- [ ] 15-01: TBD (run /gsd:plan-phase 15 to break down)

#### Phase 16: Routenoptimierung

**Goal**: Google Routes API Integration, optimale Reihenfolge berechnen
**Depends on**: Phase 15
**Research**: Likely (external API integration)
**Research topics**: Google Routes API, Directions API vs Routes API, waypoint optimization
**Plans**: TBD

Plans:
- [ ] 16-01: TBD

#### Phase 17: Export & Fahrer

**Goal**: Navigation-Export (Deep Links), Fahrer-Zuweisung Basis
**Depends on**: Phase 16
**Research**: Unlikely (standard patterns)
**Plans**: TBD

Plans:
- [ ] 17-01: TBD

#### Phase 18: Fahrer-Management

**Goal**: Erweiterte Fahrer-Verwaltung (optional scope)
**Depends on**: Phase 17
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 18-01: TBD

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
| 15. Routenplanung-Basis | v1.3 | 0/? | Not started | - |
| 16. Routenoptimierung | v1.3 | 0/? | Not started | - |
| 17. Export & Fahrer | v1.3 | 0/? | Not started | - |
| 18. Fahrer-Management | v1.3 | 0/? | Not started | - |
