/**
 * Tests for VersandKPIs component
 *
 * Tests KPI count calculations, rendering, variants, and click handling.
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { VersandKPIs } from '../VersandKPIs';
import type { VersandOrder } from '../VersandOrderCard';

// Helper to create mock VersandOrder data
function createMockOrder(overrides: Partial<VersandOrder> = {}): VersandOrder {
  return {
    auftragsnummer: 'GP25-0001',
    produkttyp: 'Broschüren',
    liefertermin: '2026-01-20',
    versandStatus: 'offen',
    versandKommentar: null,
    versandUpdatedAt: null,
    lieferStrasse: 'Teststraße 1',
    lieferPlz: '12345',
    lieferOrt: 'Berlin',
    lieferLand: 'DE',
    lieferLat: null,
    lieferLng: null,
    kunde: {
      firma: 'Test GmbH',
      name: 'Max Mustermann',
    },
    ...overrides,
  };
}

// Helper to get today's date at midnight for overdue calculations
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

describe('VersandKPIs', () => {
  describe('Count calculations', () => {
    it('counts offen orders (versandStatus === "offen")', () => {
      const orders: VersandOrder[] = [
        createMockOrder({ auftragsnummer: 'GP25-0001', versandStatus: 'offen' }),
        createMockOrder({ auftragsnummer: 'GP25-0002', versandStatus: 'offen' }),
        createMockOrder({ auftragsnummer: 'GP25-0003', versandStatus: 'versandbereit' }),
      ];

      render(<VersandKPIs orders={orders} />);

      // Find Offen card and verify count is 2
      const offenCard = screen.getByText('Offen').closest('div')?.closest('div');
      expect(offenCard).toHaveTextContent('2');
    });

    it('counts offen orders (versandStatus === null)', () => {
      const orders: VersandOrder[] = [
        createMockOrder({ auftragsnummer: 'GP25-0001', versandStatus: null }),
        createMockOrder({ auftragsnummer: 'GP25-0002', versandStatus: null }),
        createMockOrder({ auftragsnummer: 'GP25-0003', versandStatus: 'versandbereit' }),
      ];

      render(<VersandKPIs orders={orders} />);

      // Offen should count orders with null status
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('counts versandbereit orders', () => {
      const orders: VersandOrder[] = [
        createMockOrder({ auftragsnummer: 'GP25-0001', versandStatus: 'versandbereit' }),
        createMockOrder({ auftragsnummer: 'GP25-0002', versandStatus: 'versandbereit' }),
        createMockOrder({ auftragsnummer: 'GP25-0003', versandStatus: 'versandbereit' }),
        createMockOrder({ auftragsnummer: 'GP25-0004', versandStatus: 'offen' }),
      ];

      render(<VersandKPIs orders={orders} />);

      // Find Versandbereit card and verify count is 3
      const versandbereitCard = screen.getByText('Versandbereit').closest('div')?.closest('div');
      expect(versandbereitCard).toHaveTextContent('3');
    });

    it('counts versendet orders', () => {
      const orders: VersandOrder[] = [
        createMockOrder({ auftragsnummer: 'GP25-0001', versandStatus: 'versendet' }),
        createMockOrder({ auftragsnummer: 'GP25-0002', versandStatus: 'versendet' }),
        createMockOrder({ auftragsnummer: 'GP25-0003', versandStatus: 'offen' }),
      ];

      render(<VersandKPIs orders={orders} />);

      // Find Versendet card and verify count is 2
      const versendetCard = screen.getByText('Versendet').closest('div')?.closest('div');
      expect(versendetCard).toHaveTextContent('2');
    });

    it('counts ueberfaellig orders (liefertermin < today AND not versendet)', () => {
      const orders: VersandOrder[] = [
        createMockOrder({
          auftragsnummer: 'GP25-0001',
          versandStatus: 'offen',
          liefertermin: getYesterdayDate(),
        }),
        createMockOrder({
          auftragsnummer: 'GP25-0002',
          versandStatus: 'versandbereit',
          liefertermin: getYesterdayDate(),
        }),
        createMockOrder({
          auftragsnummer: 'GP25-0003',
          versandStatus: 'versendet', // Not overdue because already sent
          liefertermin: getYesterdayDate(),
        }),
        createMockOrder({
          auftragsnummer: 'GP25-0004',
          versandStatus: 'offen',
          liefertermin: getTomorrowDate(), // Not overdue
        }),
      ];

      render(<VersandKPIs orders={orders} />);

      // Find Überfällig card - should be 2 (GP25-0001 and GP25-0002)
      const ueberfaelligCard = screen.getByText('Überfällig').closest('div')?.closest('div');
      expect(ueberfaelligCard).toHaveTextContent('2');
    });

    it('does not count orders without liefertermin as ueberfaellig', () => {
      const orders: VersandOrder[] = [
        createMockOrder({
          auftragsnummer: 'GP25-0001',
          versandStatus: 'offen',
          liefertermin: null,
        }),
      ];

      render(<VersandKPIs orders={orders} />);

      // Überfällig should be 0
      const ueberfaelligCard = screen.getByText('Überfällig').closest('div')?.closest('div');
      expect(ueberfaelligCard).toHaveTextContent('0');
    });
  });

  describe('Rendering', () => {
    it('renders 4 KPI cards (Offen, Versandbereit, Versendet, Überfällig)', () => {
      render(<VersandKPIs orders={[]} />);

      expect(screen.getByText('Offen')).toBeInTheDocument();
      expect(screen.getByText('Versandbereit')).toBeInTheDocument();
      expect(screen.getByText('Versendet')).toBeInTheDocument();
      expect(screen.getByText('Überfällig')).toBeInTheDocument();
    });

    it('shows correct count values in each card', () => {
      const orders: VersandOrder[] = [
        createMockOrder({ auftragsnummer: 'GP25-0001', versandStatus: 'offen' }),
        createMockOrder({ auftragsnummer: 'GP25-0002', versandStatus: 'versandbereit' }),
        createMockOrder({ auftragsnummer: 'GP25-0003', versandStatus: 'versandbereit' }),
        createMockOrder({ auftragsnummer: 'GP25-0004', versandStatus: 'versendet' }),
      ];

      render(<VersandKPIs orders={orders} />);

      // Verify each card has the correct count
      const offenCard = screen.getByText('Offen').closest('div')?.closest('div');
      expect(offenCard).toHaveTextContent('1');

      const versandbereitCard = screen.getByText('Versandbereit').closest('div')?.closest('div');
      expect(versandbereitCard).toHaveTextContent('2');

      const versendetCard = screen.getByText('Versendet').closest('div')?.closest('div');
      expect(versendetCard).toHaveTextContent('1');

      const ueberfaelligCard = screen.getByText('Überfällig').closest('div')?.closest('div');
      expect(ueberfaelligCard).toHaveTextContent('0');
    });

    it('shows correct icons for each card', () => {
      render(<VersandKPIs orders={[]} />);

      // Verify SVG icons are present (Lucide icons)
      // Package icon for Offen
      const offenContainer = screen.getByText('Offen').closest('div')?.parentElement;
      expect(offenContainer?.querySelector('svg')).toBeInTheDocument();

      // Truck icon for Versandbereit
      const versandbereitContainer = screen
        .getByText('Versandbereit')
        .closest('div')?.parentElement;
      expect(versandbereitContainer?.querySelector('svg')).toBeInTheDocument();

      // CheckCircle icon for Versendet
      const versendetContainer = screen.getByText('Versendet').closest('div')?.parentElement;
      expect(versendetContainer?.querySelector('svg')).toBeInTheDocument();

      // AlertTriangle icon for Überfällig
      const ueberfaelligContainer = screen.getByText('Überfällig').closest('div')?.parentElement;
      expect(ueberfaelligContainer?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Variant styles', () => {
    it('applies default variant styles for Offen card', () => {
      render(<VersandKPIs orders={[createMockOrder({ versandStatus: 'offen' })]} />);

      // Offen card value should have default text color (ghl-text)
      const offenCard = screen.getByText('Offen').closest('div')?.closest('div');
      const valueElement = offenCard?.querySelector('.text-ghl-text');
      expect(valueElement).toBeInTheDocument();
    });

    it('applies amber variant styles for Versandbereit card', () => {
      render(<VersandKPIs orders={[createMockOrder({ versandStatus: 'versandbereit' })]} />);

      // Versandbereit card value should have amber color
      const versandbereitCard = screen.getByText('Versandbereit').closest('div')?.closest('div');
      const valueElement = versandbereitCard?.querySelector('.text-amber-600');
      expect(valueElement).toBeInTheDocument();
    });

    it('applies green variant styles for Versendet card', () => {
      render(<VersandKPIs orders={[createMockOrder({ versandStatus: 'versendet' })]} />);

      // Versendet card value should have green color
      const versendetCard = screen.getByText('Versendet').closest('div')?.closest('div');
      const valueElement = versendetCard?.querySelector('.text-green-600');
      expect(valueElement).toBeInTheDocument();
    });

    it('applies red variant styles for Überfällig card when count > 0', () => {
      const orders: VersandOrder[] = [
        createMockOrder({
          versandStatus: 'offen',
          liefertermin: getYesterdayDate(),
        }),
      ];

      render(<VersandKPIs orders={orders} />);

      // Überfällig card value should have red color when there are overdue orders
      const ueberfaelligCard = screen.getByText('Überfällig').closest('div')?.closest('div');
      const valueElement = ueberfaelligCard?.querySelector('.text-red-600');
      expect(valueElement).toBeInTheDocument();
    });

    it('applies default variant styles for Überfällig card when count === 0', () => {
      render(<VersandKPIs orders={[]} />);

      // Überfällig card should have default styles when count is 0
      const ueberfaelligCard = screen.getByText('Überfällig').closest('div')?.closest('div');
      const valueElement = ueberfaelligCard?.querySelector('.text-ghl-text');
      expect(valueElement).toBeInTheDocument();
    });
  });

  describe('Click handling', () => {
    it('clicking Offen card calls onFilterClick("offen")', () => {
      const handleFilterClick = jest.fn();
      render(<VersandKPIs orders={[]} onFilterClick={handleFilterClick} />);

      // Find and click Offen card button
      const offenButton = screen.getByText('Offen').closest('button');
      fireEvent.click(offenButton!);

      expect(handleFilterClick).toHaveBeenCalledWith('offen');
    });

    it('clicking Versandbereit card calls onFilterClick("versandbereit")', () => {
      const handleFilterClick = jest.fn();
      render(<VersandKPIs orders={[]} onFilterClick={handleFilterClick} />);

      // Find and click Versandbereit card button
      const versandbereitButton = screen.getByText('Versandbereit').closest('button');
      fireEvent.click(versandbereitButton!);

      expect(handleFilterClick).toHaveBeenCalledWith('versandbereit');
    });

    it('clicking Versendet card calls onFilterClick("all")', () => {
      const handleFilterClick = jest.fn();
      render(<VersandKPIs orders={[]} onFilterClick={handleFilterClick} />);

      // Find and click Versendet card button
      const versendetButton = screen.getByText('Versendet').closest('button');
      fireEvent.click(versendetButton!);

      expect(handleFilterClick).toHaveBeenCalledWith('all');
    });

    it('Überfällig card is not clickable (no onClick)', () => {
      const handleFilterClick = jest.fn();
      render(<VersandKPIs orders={[]} onFilterClick={handleFilterClick} />);

      // Überfällig card should NOT be a button
      const ueberfaelligLabel = screen.getByText('Überfällig');
      const ueberfaelligButton = ueberfaelligLabel.closest('button');
      expect(ueberfaelligButton).toBeNull();
    });

    it('cards are not clickable when onFilterClick is not provided', () => {
      render(<VersandKPIs orders={[]} />);

      // Offen should not be a button
      const offenLabel = screen.getByText('Offen');
      const offenButton = offenLabel.closest('button');
      expect(offenButton).toBeNull();
    });
  });

  describe('Active state', () => {
    it('shows active styles (border-blue-400) when activeFilter matches "offen"', () => {
      render(<VersandKPIs orders={[]} onFilterClick={jest.fn()} activeFilter="offen" />);

      // Find Offen card's inner div and check for active border class
      const offenButton = screen.getByText('Offen').closest('button');
      const innerDiv = offenButton?.querySelector('.border-blue-400');
      expect(innerDiv).toBeInTheDocument();
    });

    it('shows active styles when activeFilter matches "versandbereit"', () => {
      render(<VersandKPIs orders={[]} onFilterClick={jest.fn()} activeFilter="versandbereit" />);

      const versandbereitButton = screen.getByText('Versandbereit').closest('button');
      const innerDiv = versandbereitButton?.querySelector('.border-blue-400');
      expect(innerDiv).toBeInTheDocument();
    });

    it('does not show active styles for non-matching filter', () => {
      render(<VersandKPIs orders={[]} onFilterClick={jest.fn()} activeFilter="offen" />);

      // Versandbereit should not have active border
      const versandbereitButton = screen.getByText('Versandbereit').closest('button');
      // Check that it doesn't have the ring-1 class indicating active state
      const ringDiv = versandbereitButton?.querySelector('.ring-1.ring-blue-400');
      expect(ringDiv).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('handles empty orders array', () => {
      render(<VersandKPIs orders={[]} />);

      // All counts should be 0
      const cards = screen.getAllByText('0');
      expect(cards).toHaveLength(4);
    });

    it('handles orders with mixed statuses', () => {
      const orders: VersandOrder[] = [
        createMockOrder({ auftragsnummer: 'GP25-0001', versandStatus: 'offen' }),
        createMockOrder({ auftragsnummer: 'GP25-0002', versandStatus: null }),
        createMockOrder({ auftragsnummer: 'GP25-0003', versandStatus: 'versandbereit' }),
        createMockOrder({ auftragsnummer: 'GP25-0004', versandStatus: 'versendet' }),
        createMockOrder({
          auftragsnummer: 'GP25-0005',
          versandStatus: 'offen',
          liefertermin: getYesterdayDate(),
        }),
      ];

      render(<VersandKPIs orders={orders} />);

      // Offen: GP25-0001, GP25-0002, GP25-0005 = 3
      const offenCard = screen.getByText('Offen').closest('div')?.closest('div');
      expect(offenCard).toHaveTextContent('3');

      // Versandbereit: GP25-0003 = 1
      const versandbereitCard = screen.getByText('Versandbereit').closest('div')?.closest('div');
      expect(versandbereitCard).toHaveTextContent('1');

      // Versendet: GP25-0004 = 1
      const versendetCard = screen.getByText('Versendet').closest('div')?.closest('div');
      expect(versendetCard).toHaveTextContent('1');

      // Überfällig: GP25-0005 = 1
      const ueberfaelligCard = screen.getByText('Überfällig').closest('div')?.closest('div');
      expect(ueberfaelligCard).toHaveTextContent('1');
    });
  });
});
