/**
 * Tests for KPIOrdersDialog component
 *
 * Tests dialog states (loading, error, empty, data),
 * fetch behavior, and tageUebrig badge colors.
 */

import { render, screen, waitFor } from '@testing-library/react';

import { KPIOrdersDialog } from '../KPIOrdersDialog';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Store original fetch
const originalFetch = global.fetch;

describe('KPIOrdersDialog', () => {
  const defaultProps = {
    kpiType: 'total' as const,
    title: 'Test Dialog',
    isOpen: false,
    onOpenChange: jest.fn(),
  };

  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Rendering states', () => {
    it('shows loading state when dialog opens', async () => {
      // Mock fetch to delay response
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve({ orders: [], count: 0, date: '2026-01-18' }),
              });
            }, 100);
          })
      );

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByText('Lädt...')).toBeInTheDocument();
    });

    it('shows error message when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows error message when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText('Fehler beim Laden der Aufträge')).toBeInTheDocument();
      });
    });

    it('shows empty state when no orders returned', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: [],
            count: 0,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText('Keine Aufträge')).toBeInTheDocument();
        expect(
          screen.getByText('Für diesen KPI gibt es derzeit keine Aufträge.')
        ).toBeInTheDocument();
      });
    });

    it('renders order table when orders exist', async () => {
      const mockOrders = [
        {
          auftragsnummer: 'GP25-1234',
          kunde: 'Test Kunde',
          produkttyp: 'Broschüren',
          liefertermin: '2026-01-25',
          tageUebrig: 7,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: mockOrders,
            count: 1,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        // Table headers
        expect(screen.getByText('Auftrag')).toBeInTheDocument();
        expect(screen.getByText('Kunde')).toBeInTheDocument();
        expect(screen.getByText('Produkttyp')).toBeInTheDocument();
        expect(screen.getByText('Liefertermin')).toBeInTheDocument();
        expect(screen.getByText('Tage übrig')).toBeInTheDocument();
      });
    });
  });

  describe('Fetch behavior', () => {
    it('fetches from correct URL with kpiType parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'critical',
            orders: [],
            count: 0,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} kpiType="critical" isOpen={true} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/dashboard/kpi-orders?type=critical');
      });
    });

    it('does NOT fetch when dialog is closed', () => {
      render(<KPIOrdersDialog {...defaultProps} isOpen={false} />);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('re-fetches when dialog opens again', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: [],
            count: 0,
            date: '2026-01-18',
          }),
      });

      const { rerender } = render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Close dialog
      rerender(<KPIOrdersDialog {...defaultProps} isOpen={false} />);

      // Re-open dialog
      rerender(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Order display', () => {
    it('displays order data correctly', async () => {
      const mockOrders = [
        {
          auftragsnummer: 'GP25-7647',
          kunde: 'Maria Mikalo',
          produkttyp: 'Fadengeheftete Broschüren',
          liefertermin: '2026-01-25',
          tageUebrig: 7,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: mockOrders,
            count: 1,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText('GP25-7647')).toBeInTheDocument();
        expect(screen.getByText('Maria Mikalo')).toBeInTheDocument();
        expect(screen.getByText('Fadengeheftete Broschüren')).toBeInTheDocument();
        expect(screen.getByText('25.01.2026')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
      });
    });

    it('links to order detail page', async () => {
      const mockOrders = [
        {
          auftragsnummer: 'GP25-9999',
          kunde: 'Test',
          produkttyp: null,
          liefertermin: null,
          tageUebrig: 3,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: mockOrders,
            count: 1,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'GP25-9999' });
        expect(link).toHaveAttribute('href', '/orders/GP25-9999');
      });
    });

    it('shows dash for null produkttyp', async () => {
      const mockOrders = [
        {
          auftragsnummer: 'GP25-0001',
          kunde: 'Test',
          produkttyp: null,
          liefertermin: '2026-01-25',
          tageUebrig: 3,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: mockOrders,
            count: 1,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        // Find the table cells
        const cells = screen.getAllByRole('cell');
        // Third column (index 2) is produkttyp
        expect(cells[2]).toHaveTextContent('–');
      });
    });

    it('shows dash for null liefertermin', async () => {
      const mockOrders = [
        {
          auftragsnummer: 'GP25-0002',
          kunde: 'Test',
          produkttyp: 'Plakate',
          liefertermin: null,
          tageUebrig: 5,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: mockOrders,
            count: 1,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        const cells = screen.getAllByRole('cell');
        // Fourth column (index 3) is liefertermin
        expect(cells[3]).toHaveTextContent('–');
      });
    });

    it('formats liefertermin as dd.MM.yyyy', async () => {
      const mockOrders = [
        {
          auftragsnummer: 'GP25-0003',
          kunde: 'Test',
          produkttyp: 'Test',
          liefertermin: '2026-08-05',
          tageUebrig: 5,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: mockOrders,
            count: 1,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText('05.08.2026')).toBeInTheDocument();
      });
    });
  });

  describe('tageUebrig badge colors', () => {
    it('shows red badge for 0 days', async () => {
      const mockOrders = [
        {
          auftragsnummer: 'GP25-RED',
          kunde: 'Test',
          produkttyp: null,
          liefertermin: null,
          tageUebrig: 0,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'critical',
            orders: mockOrders,
            count: 1,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        const badge = screen.getByText('0');
        expect(badge).toHaveClass('bg-capacity-red');
      });
    });

    it('shows yellow badge for 1 day', async () => {
      const mockOrders = [
        {
          auftragsnummer: 'GP25-YELLOW',
          kunde: 'Test',
          produkttyp: null,
          liefertermin: null,
          tageUebrig: 1,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'critical',
            orders: mockOrders,
            count: 1,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        const badge = screen.getByText('1');
        expect(badge).toHaveClass('bg-capacity-yellow');
      });
    });

    it('shows green badge for 2+ days', async () => {
      const mockOrders = [
        {
          auftragsnummer: 'GP25-GREEN2',
          kunde: 'Test',
          produkttyp: null,
          liefertermin: null,
          tageUebrig: 2,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: mockOrders,
            count: 1,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        const badge = screen.getByText('2');
        expect(badge).toHaveClass('bg-capacity-green');
      });
    });

    it('shows green badge for large day counts', async () => {
      const mockOrders = [
        {
          auftragsnummer: 'GP25-GREEN30',
          kunde: 'Test',
          produkttyp: null,
          liefertermin: null,
          tageUebrig: 30,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: mockOrders,
            count: 1,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        const badge = screen.getByText('30');
        expect(badge).toHaveClass('bg-capacity-green');
      });
    });
  });

  describe('Dialog props', () => {
    it('renders with correct title', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'total',
            orders: [],
            count: 0,
            date: '2026-01-18',
          }),
      });

      render(<KPIOrdersDialog {...defaultProps} title="Kritische Aufträge" isOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText('Kritische Aufträge')).toBeInTheDocument();
      });
    });
  });
});
