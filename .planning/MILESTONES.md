# Project Milestones: XOS Mobile Status-Update

## v1.0 Mobile Status-Update (Shipped: 2026-01-16)

**Delivered:** Mobile-optimierte Status-Update-Funktionalität für Produktionsmitarbeiter mit 3-Klick-Workflow und Dashboard-Integration.

**Phases completed:** 1-8 (11 plans total)

**Key accomplishments:**

- Database schema extended with IstStatus enum and tracking fields
- PATCH /api/orders/[id]/status endpoint with validation
- Mobile-first /status page optimized for shopfloor workers
- Order search with autocomplete (Auftragsnummer, Kunde, Produkt)
- 3-click status update flow: Search → Select → Tap status
- Dashboard integration: IST-Status column, Problem-Auftraege KPI, filter

**Stats:**

- 46 files created/modified
- 3,545 lines of TypeScript added
- 8 phases, 11 plans
- 6 days from start to ship (2026-01-10 → 2026-01-16)

**Git range:** `c678923` (feat(01-01)) → `9f0f251` (fix)

**Archive:** [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

---

## v1.1 Versand-Übersicht (Shipped: 2026-01-16)

**Delivered:** Versand-Team Workflow mit VersandStatus-Tracking, PLZ-Sortierung und Geocoding-Grundlagen.

**Phases completed:** 9-12 (4 plans total)

**Key accomplishments:**

- VersandStatus enum (offen, versandbereit, versendet) with tracking fields
- Delivery address parsing from XML (street, PLZ, city, country)
- PATCH /api/orders/[id]/versand endpoint for status updates
- GET /api/versand/orders with PLZ sorting and deadline filters
- /versand page with order list and status buttons
- Geocoding setup with lat/lng fields and PLZ lookup utility
- Note: Leaflet map component (12-02) replaced by v1.2 Google Maps integration

**Stats:**

- 4 phases, 4 plans
- 1 day (2026-01-15 → 2026-01-16)

**Archive:** [v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)

---

## v1.2 Versand Pro (Shipped: 2026-01-16)

**Delivered:** Verbesserte Versand-Seite mit Google Maps, Desktop Split-View Layout, KPIs und bidirektionaler Karte-Liste Interaktion.

**Phases completed:** 13-14 (2 plans total)

**Key accomplishments:**

- Google Maps Migration: Leaflet durch Google Maps API ersetzt mit MarkerClusterer
- VersandKPIs Komponente: Offen/Versandbereit/Versendet/Überfällig auf einen Blick
- Responsive Desktop Split-View: Liste links, Karte rechts (≥768px)
- Bidirektionale Interaktion: Klick auf Card → Marker highlighted, Klick auf Marker → Card scrollt in View
- InfoWindow bei Marker-Klick mit Auftragdetails

**Stats:**

- 16 files modified (+1,188 / -386 lines)
- 7,424 LOC TypeScript total
- 2 phases, 2 plans
- Same day (2026-01-16, ~45 min execution)

**Git range:** `efb505f` (feat(13)) → `7398b99` (feat(14-01))

**Archive:** [v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)

---
