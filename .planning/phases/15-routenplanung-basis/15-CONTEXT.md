# Phase 15: Routenplanung-Basis - Context

**Gathered:** 2026-01-16
**Status:** Ready for planning

<vision>
## How This Should Work

Toggle into a "Routenplanung" mode on the existing Versand page. Checkboxes appear on list items to select orders for a route. As orders are selected, they get highlighted on the map with numbered markers (1, 2, 3...) showing the delivery sequence. A route line connects the selected stops on the map.

The route order follows selection order — you click orders in the sequence you want to visit them. This is the foundation; Phase 16 will add an "Optimieren" button that uses Google Routes API to reorder stops for the optimal route.

Builds naturally on the existing bidirectional list-map interaction from v1.2.

</vision>

<essential>
## What Must Be Nailed

- **Clear visual feedback** — Selected orders are obviously highlighted, numbered markers show delivery order, route line is visible on the map
- **Clean mode distinction** — Clear difference between normal view and "Routenplanung" mode
- **Solid foundation** — This is the base for Phase 16 optimization; selection + visualization must work reliably

</essential>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Just make it work well.

</specifics>

<notes>
## Additional Context

- Route planning is a "do it right" task, not a "do it fast" task
- Versand team plans routes once per shift, not constantly
- Fast selection (bulk select, area select) can be added later if needed
- Phase 16 adds Google Routes API optimization on top of this foundation

</notes>

---

*Phase: 15-routenplanung-basis*
*Context gathered: 2026-01-16*
