# Roadmap: XOS Mobile Status-Update

## Milestones

- ✅ **v1.0 Mobile Status-Update** — Phases 1-8 (shipped 2026-01-16)
- ✅ **v1.1 Versand-Übersicht** — Phases 9-12 (shipped 2026-01-16)
- 🚧 **v1.2 Versand Pro** — Phases 13-15 (in progress)

## Completed Milestones

- ✅ [v1.0 Mobile Status-Update](milestones/v1.0-ROADMAP.md) (Phases 1-8) — SHIPPED 2026-01-16
- ✅ [v1.1 Versand-Übersicht](milestones/v1.1-ROADMAP.md) (Phases 9-12) — SHIPPED 2026-01-16

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

### 🚧 v1.2 Versand Pro (In Progress)

**Milestone Goal:** Verbesserte Versand-Seite mit Google Maps, interaktiver Karte und Inline-KPIs

**Design-Entscheidung (2026-01-16):**
- ❌ Kein Split-View (Karte nimmt unnötig Platz weg)
- ✅ Karte bleibt Toggle (opt-in, volle Breite wenn aktiv)
- ✅ Bidirektionale Interaktion Liste↔Karte
- ✅ Inline-KPIs auf Versandseite (nicht im Dashboard)
- 🔮 Routenplanung/Multi-Select → später wenn validiert

#### Phase 13: Google Maps Migration

**Goal**: Leaflet durch Google Maps ersetzen, API-Key konfigurieren, Clustering beibehalten
**Depends on**: v1.1 complete
**Research**: Unlikely (well-documented API)
**Plans**: 1

Plans:
- [x] 13-01: Google Maps Migration (install deps, rewrite component, remove Leaflet) — completed 2026-01-16

#### Phase 14: Karte-Liste Interaktion + Desktop Layout

**Goal**: Desktop Split-View Layout und bidirektionale Interaktion zwischen Liste und Karte
**Depends on**: Phase 13
**Research**: Unlikely (internal patterns)
**Plans**: 1

Layout:
- Desktop (≥768px): Split-View mit Liste links, Karte rechts (immer sichtbar)
- Mobile (<768px): Toggle-basierte Karte (bestehendes Verhalten)

Features:
- Klick auf Order-Card → Karte zoomt zu diesem Punkt, Marker highlighted
- Klick auf Marker → Order-Card scrollt in View, wird hervorgehoben
- Karte zeigt alle gefilterten Aufträge

Plans:
- [ ] 14-01: Desktop split-view + bidirectional list↔map interaction

#### Phase 15: Inline Versand-KPIs

**Goal**: Schnelle Übersichtszahlen direkt auf der Versandseite
**Depends on**: Phase 14
**Research**: Unlikely (existing patterns)
**Plans**: TBD

Features:
- Kompakte KPI-Leiste: "12 Offen · 5 Versandbereit · 3 Versendet"
- Klickbar als Filter-Shortcut

Plans:
- [ ] 15-01: TBD

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
| 14. Karte-Liste Interaktion | v1.2 | 0/? | Not started | - |
| 15. Inline Versand-KPIs | v1.2 | 0/? | Not started | - |
