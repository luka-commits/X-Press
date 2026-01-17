# Phase 23: Reports neu - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<vision>
## How This Should Work

Eine konsolidierte Reports-Seite die Pipeline-Analytics auf einen Blick zeigt. Kombination aus visuellem Pipeline-Funnel oben und KPI-Karten darunter — alles mit Zeitraum-Filterung.

**Layout-Konzept:**
- Oben: Pipeline-Funnel mit Stages und Anzahlen (Eingang → Produktion → Versandbereit → Versendet)
- Darunter: KPI-Karten mit Mix aus Auftrags-Metriken, Versand-Metriken, Problem-Tracking
- Zeitreihen-Charts für Trends über Zeit
- Überall: Vergleich zur Vorperiode (z.B. "↓ 11% vs Last 31 Days")

**Zeitraum-Filterung:**
- Schnelle Presets: Heute / Woche / Monat
- Custom Datepicker für beliebigen von-bis Zeitraum

</vision>

<essential>
## What Must Be Nailed

- **Schneller Überblick** — In 5 Sekunden verstehen: wie läuft der Laden heute
- **Zeitvergleich** — Wie war letzte Woche vs. diese Woche, Trends erkennen
- **Probleme finden** — Sofort sehen wo es hakt, was Aufmerksamkeit braucht
- **Zeitraum-Filter** — Zentral für alle Metriken, schnelle Presets + Custom Range

</essential>

<specifics>
## Specific Ideas

**Referenz-UI (Screenshots geteilt):**
- Große Headline-Zahlen mit Vorperioden-Vergleich Badge (↓ 75% vs Last 31 Days)
- Horizontaler Funnel mit Stages, Cumulative %, Next Step Conversion %
- Donut-Charts für Verteilungen (Stage Distribution)
- Zeitreihen Line-Charts (Counts Over Time)
- Filter-Dropdowns in Karten-Headern
- Einheitlicher Karten-Stil mit klarer Hierarchie

**Gewünschte Elemente:**
- Funnel mit Stage-Anzahlen + Vorperioden-Vergleich
- Donut-Chart für Stage Distribution
- Zeitreihen-Charts für Trends
- KPI-Mix: Aufträge, Versand, Probleme

</specifics>

<notes>
## Additional Context

Teil von v1.6 Pipeline-Analytics — Ziel ist Reports zu einem fokussierten Pipeline-Dashboard zu konsolidieren. Phase 24 wird Zeitreihen-Charts (Eingang vs. Versand) und Dashboard-Anpassungen (Problem-KPI entfernen) hinzufügen.

User hat klare visuelle Referenzen geteilt — das Design soll diesem Stil folgen mit großen Zahlen, Vergleichs-Badges, und verschiedenen Chart-Typen.

</notes>

---

*Phase: 23-reports-neu*
*Context gathered: 2026-01-17*
