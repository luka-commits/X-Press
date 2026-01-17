/**
 * Tests for ReportsOrdersDialog component
 *
 * Tests rendering states (loading/error/empty/data), fetch behavior,
 * order display formatting, and tageUebrig badge colors.
 */

import { render, screen, waitFor } from '@testing-library/react';

import { ReportsOrdersDialog } from '../ReportsOrdersDialog';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockOrders = [
  {
    auftragsnummer: 'GP25-1234',
    kunde: 'Test Kunde',
    produkttyp: 'Broschüren',
    liefertermin: '2026-01-20',
    tageUebrig: 3,
  },
  {
    auftragsnummer: 'GP25-5678',
    kunde: 'Andere Firma',
    produkttyp: null,
    liefertermin: null,
    tageUebrig: 0,
  },
  {
    auftragsnummer: 'GP25-9999',
    kunde: 'Eilkunde',
    produkttyp: 'Plakate',
    liefertermin: '2026-01-18',
    tageUebrig: 1,
  },
];

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ReportsOrdersDialog', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('Rendering states', () => {
    it('shows loading state ("Lädt...") when isOpen changes to true', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ type: 'problem', orders: [], count: 0 }),
                }),
              100
            )
          )
      );

      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      expect(screen.getByText('Lädt...')).toBeInTheDocument();
    });

    it('shows error message when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows error message when response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Fehler beim Laden der Aufträge')).toBeInTheDocument();
      });
    });

    it('shows empty state ("Keine Aufträge") when no orders returned', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'problem',
            orders: [],
            count: 0,
            date: '2026-01-17',
          }),
      });

      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Keine Aufträge')).toBeInTheDocument();
      });
    });

    it('renders order table when orders exist', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'problem',
            orders: mockOrders,
            count: 3,
            date: '2026-01-17',
          }),
      });

      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('GP25-1234')).toBeInTheDocument();
      });

      // Check table headers
      expect(screen.getByText('Auftrag')).toBeInTheDocument();
      expect(screen.getByText('Kunde')).toBeInTheDocument();
      expect(screen.getByText('Produkttyp')).toBeInTheDocument();
      expect(screen.getByText('Liefertermin')).toBeInTheDocument();
      expect(screen.getByText('Tage übrig')).toBeInTheDocument();
    });
  });

  describe('Fetch behavior', () => {
    it('fetches from /api/reports/kpi-orders with type parameter', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'problem',
            orders: [],
            count: 0,
            date: '2026-01-17',
          }),
      });

      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/reports/kpi-orders?type=problem');
      });
    });

    it('adds stage parameter when kpiType="stage" and stage provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'stage',
            orders: [],
            count: 0,
            date: '2026-01-17',
            stage: 'offen',
          }),
      });

      render(
        <ReportsOrdersDialog
          kpiType="stage"
          title="Offene Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
          stage="offen"
        />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/reports/kpi-orders?type=stage&stage=offen');
      });
    });

    it('does NOT fetch when dialog is closed', () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={false}
          onOpenChange={() => {}}
        />
      );

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('re-fetches when dialog opens again', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'oldest',
            orders: [],
            count: 0,
            date: '2026-01-17',
          }),
      });

      const { rerender } = render(
        <ReportsOrdersDialog
          kpiType="oldest"
          title="Älteste Aufträge"
          isOpen={false}
          onOpenChange={() => {}}
        />
      );

      expect(mockFetch).not.toHaveBeenCalled();

      // Open dialog
      rerender(
        <ReportsOrdersDialog
          kpiType="oldest"
          title="Älteste Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Close and reopen
      rerender(
        <ReportsOrdersDialog
          kpiType="oldest"
          title="Älteste Aufträge"
          isOpen={false}
          onOpenChange={() => {}}
        />
      );

      rerender(
        <ReportsOrdersDialog
          kpiType="oldest"
          title="Älteste Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Order display', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'problem',
            orders: mockOrders,
            count: 3,
            date: '2026-01-17',
          }),
      });
    });

    it('displays auftragsnummer as link to order detail', async () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'GP25-1234' });
        expect(link).toHaveAttribute('href', '/orders/GP25-1234');
      });
    });

    it('displays kunde', async () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Kunde')).toBeInTheDocument();
        expect(screen.getByText('Andere Firma')).toBeInTheDocument();
      });
    });

    it('displays produkttyp', async () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Broschüren')).toBeInTheDocument();
        expect(screen.getByText('Plakate')).toBeInTheDocument();
      });
    });

    it('shows "–" for null produkttyp', async () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        // There should be at least one "–" for null produkttyp
        const dashes = screen.getAllByText('–');
        expect(dashes.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('formats liefertermin as dd.MM.yyyy', async () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        // 2026-01-20 should be formatted as 20.01.2026
        expect(screen.getByText('20.01.2026')).toBeInTheDocument();
        // 2026-01-18 should be formatted as 18.01.2026
        expect(screen.getByText('18.01.2026')).toBeInTheDocument();
      });
    });

    it('shows "–" for null liefertermin', async () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        // GP25-5678 has null liefertermin and null produkttyp
        // So there should be multiple dashes
        const dashes = screen.getAllByText('–');
        expect(dashes.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('displays tageUebrig value', async () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
  });

  describe('tageUebrig badge colors', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'problem',
            orders: mockOrders,
            count: 3,
            date: '2026-01-17',
          }),
      });
    });

    it('Red (bg-capacity-red) for <= 0 days', async () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        // tageUebrig = 0 should have red background
        const zeroElement = screen.getByText('0');
        expect(zeroElement).toHaveClass('bg-capacity-red');
      });
    });

    it('Yellow (bg-capacity-yellow) for 1 day', async () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        // tageUebrig = 1 should have yellow background
        const oneElement = screen.getByText('1');
        expect(oneElement).toHaveClass('bg-capacity-yellow');
      });
    });

    it('Green (bg-capacity-green) for 2+ days', async () => {
      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        // tageUebrig = 3 should have green background
        const threeElement = screen.getByText('3');
        expect(threeElement).toHaveClass('bg-capacity-green');
      });
    });
  });

  describe('Dialog title', () => {
    it('shows title prop in DialogTitle', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'problem',
            orders: [],
            count: 0,
            date: '2026-01-17',
          }),
      });

      render(
        <ReportsOrdersDialog
          kpiType="problem"
          title="Problem-Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Problem-Aufträge')).toBeInTheDocument();
      });
    });

    it('renders different titles for different kpiTypes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'tomorrow',
            orders: [],
            count: 0,
            date: '2026-01-17',
          }),
      });

      render(
        <ReportsOrdersDialog
          kpiType="tomorrow"
          title="Morgen fällige Aufträge"
          isOpen={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Morgen fällige Aufträge')).toBeInTheDocument();
      });
    });
  });
});
