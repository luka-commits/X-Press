# Roadmap: XOS Mobile Status-Update

## Overview

Erweiterung des XOS Dashboards um mobile Status-Update-Funktionalität. Produktionsmitarbeiter können per Smartphone den Auftragsstatus aktualisieren. Die Implementierung erfolgt in 8 Phasen: von der Datenbank-Erweiterung über die mobile UI bis zur Dashboard-Integration.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Database Schema** - Neue Felder für Status-Tracking (Completed 2026-01-15)
- [x] **Phase 2: Status API** - PATCH Endpoint für Status-Updates (Completed 2026-01-15)
- [x] **Phase 3: Mobile Layout** - Mobile-optimiertes Layout für /status (Completed 2026-01-16)
- [x] **Phase 4: Order Search** - Suchfeld mit Autocomplete (Completed 2026-01-16)
- [x] **Phase 5: Order Selection** - Auftragsdetails nach Auswahl (Completed 2026-01-16)
- [x] **Phase 6: Status Update UI** - Status-Buttons mit Feedback (Completed 2026-01-16)
- [ ] **Phase 7: Dashboard Status Column** - IST-Status in Auftragsliste
- [ ] **Phase 8: Dashboard Problem Features** - Problem-Zähler und Filter

## Phase Details

### Phase 1: Database Schema
**Goal**: Auftrag-Tabelle um istStatus, statusKommentar, statusUpdatedAt erweitern
**Depends on**: Nothing (first phase)
**Research**: Unlikely (Prisma migrations, bestehende Patterns)
**Plans**: 1 plan

Plans:
- [x] 01-01: Schema-Migration und Prisma-Client-Update

### Phase 2: Status API
**Goal**: PATCH /api/orders/[id]/status Endpoint mit Validierung
**Depends on**: Phase 1
**Research**: Unlikely (Next.js API routes, bestehende Patterns)
**Plans**: 1 plan

Plans:
- [x] 02-01: API-Route mit Status-Validierung

### Phase 3: Mobile Layout
**Goal**: Mobile-optimiertes Layout für /status Route
**Depends on**: Nothing (parallel zu Phase 1-2 möglich)
**Research**: Unlikely (Next.js app router, Tailwind responsive)
**Plans**: 1 plan

Plans:
- [x] 03-01: Mobile Layout-Komponente und Route-Struktur

### Phase 4: Order Search
**Goal**: Suchfeld mit Autocomplete (Auftragsnummer, Kunde, Produkt)
**Depends on**: Phase 3
**Research**: Unlikely (bestehende Suche im Codebase)
**Plans**: 2 plans

Plans:
- [x] 04-01: Such-API mit Autocomplete-Ergebnissen
- [x] 04-02: Suchfeld-Komponente mit Debounce

### Phase 5: Order Selection
**Goal**: Auftragsdetails nach Auswahl anzeigen (Kunde, Produkt, Liefertermin)
**Depends on**: Phase 4
**Research**: Unlikely (bestehende Supabase-Queries)
**Plans**: 1 plan

Plans:
- [x] 05-01: Order-Detail-Ansicht für Mobile

### Phase 6: Status Update UI
**Goal**: 3 große Status-Buttons + optionales Kommentarfeld + Bestätigung
**Depends on**: Phase 2, Phase 5
**Research**: Unlikely (Standard React UI)
**Plans**: 2 plans

Plans:
- [x] 06-01: Status-Buttons mit API-Integration
- [x] 06-02: Kommentarfeld und Erfolgsbestätigung

### Phase 7: Dashboard Status Column
**Goal**: IST-Status-Spalte in OrderTable mit Farbcodierung
**Depends on**: Phase 1
**Research**: Unlikely (bestehende OrderTable-Komponente)
**Plans**: 1 plan

Plans:
- [ ] 07-01: Status-Spalte mit Farbcodierung

### Phase 8: Dashboard Problem Features
**Goal**: Problem-Zähler auf Startseite + Filter für Problemaufträge
**Depends on**: Phase 7
**Research**: Unlikely (bestehende Dashboard-Patterns)
**Plans**: 2 plans

Plans:
- [ ] 08-01: Problem-Zähler auf Dashboard
- [ ] 08-02: Problemaufträge-Filter

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database Schema | 1/1 | Complete | 2026-01-15 |
| 2. Status API | 1/1 | Complete | 2026-01-15 |
| 3. Mobile Layout | 1/1 | Complete | 2026-01-16 |
| 4. Order Search | 2/2 | Complete | 2026-01-16 |
| 5. Order Selection | 1/1 | Complete | 2026-01-16 |
| 6. Status Update UI | 2/2 | Complete | 2026-01-16 |
| 7. Dashboard Status Column | 0/1 | Not started | - |
| 8. Dashboard Problem Features | 0/2 | Not started | - |
