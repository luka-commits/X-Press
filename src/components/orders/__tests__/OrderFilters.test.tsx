/**
 * Tests for OrderFilters component
 *
 * Tests filter state management, URL parameter handling, and UI rendering.
 */

import { render, screen, fireEvent, within } from '@testing-library/react';

import { OrderFilters } from '../OrderFilters';

// Mock next/navigation
const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Helper to create a mock URLSearchParams with specified values
function createSearchParams(params: Record<string, string> = {}) {
  mockSearchParams = new URLSearchParams(params);
}

describe('OrderFilters', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  describe('Initial render', () => {
    it('renders deadline dropdown with "Alle Termine" default', () => {
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      expect(screen.getByText('Alle Termine')).toBeInTheDocument();
    });

    it('renders pipeline dropdown with "Alle Status" default', () => {
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      expect(screen.getByText('Alle Status')).toBeInTheDocument();
    });

    it('renders produkttyp dropdown when produkttypen prop not empty', () => {
      render(
        <OrderFilters produkttypen={['Broschüren', 'Flyer', 'Plakate']} sachbearbeiter={[]} />
      );

      expect(screen.getByText('Alle Produkttypen')).toBeInTheDocument();
    });

    it('does NOT render produkttyp dropdown when produkttypen prop is empty', () => {
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      // Should not have produkttypen dropdown
      expect(screen.queryByText('Alle Produkttypen')).not.toBeInTheDocument();
    });

    it('renders sachbearbeiter dropdown when sachbearbeiter prop not empty', () => {
      render(
        <OrderFilters produkttypen={[]} sachbearbeiter={['Max Mustermann', 'Erika Musterfrau']} />
      );

      expect(screen.getByText('Alle Sachbearbeiter')).toBeInTheDocument();
    });

    it('does NOT render sachbearbeiter dropdown when sachbearbeiter prop is empty', () => {
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      expect(screen.queryByText('Alle Sachbearbeiter')).not.toBeInTheDocument();
    });

    it('does NOT show "Filter zurücksetzen" when no filters active', () => {
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      expect(screen.queryByText('Filter zurücksetzen')).not.toBeInTheDocument();
    });
  });

  describe('URL param reading', () => {
    it('reads current deadline filter value from searchParams', () => {
      createSearchParams({ deadline: 'today' });
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      // The select should show "Heute" as selected
      expect(screen.getByText('Heute')).toBeInTheDocument();
    });

    it('reads current pipeline filter value from searchParams', () => {
      createSearchParams({ pipeline: 'in_produktion' });
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      expect(screen.getByText('In Produktion')).toBeInTheDocument();
    });

    it('reads current produkttyp filter value from searchParams', () => {
      createSearchParams({ produkttyp: 'Broschüren' });
      render(<OrderFilters produkttypen={['Broschüren', 'Flyer']} sachbearbeiter={[]} />);

      // The third combobox should show Broschüren
      const comboboxes = screen.getAllByRole('combobox');
      expect(within(comboboxes[2]).getByText('Broschüren')).toBeInTheDocument();
    });

    it('reads current sachbearbeiter filter value from searchParams', () => {
      createSearchParams({ sachbearbeiter: 'Max Mustermann' });
      render(
        <OrderFilters produkttypen={[]} sachbearbeiter={['Max Mustermann', 'Erika Musterfrau']} />
      );

      // The third combobox should show Max Mustermann
      const comboboxes = screen.getAllByRole('combobox');
      expect(within(comboboxes[2]).getByText('Max Mustermann')).toBeInTheDocument();
    });
  });

  describe('Filter changes', () => {
    it('selecting deadline filter calls router.push with updated params', () => {
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      // Open deadline dropdown (first combobox)
      const comboboxes = screen.getAllByRole('combobox');
      fireEvent.click(comboboxes[0]);

      // Select "Heute"
      const todayOption = screen.getByRole('option', { name: 'Heute' });
      fireEvent.click(todayOption);

      expect(mockPush).toHaveBeenCalledWith('/orders?deadline=today&page=1');
    });

    it('selecting pipeline filter calls router.push with updated params', () => {
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      // Open pipeline dropdown (second combobox)
      const comboboxes = screen.getAllByRole('combobox');
      fireEvent.click(comboboxes[1]);

      // Select "In Produktion"
      const inProduktionOption = screen.getByRole('option', { name: 'In Produktion' });
      fireEvent.click(inProduktionOption);

      expect(mockPush).toHaveBeenCalledWith('/orders?pipeline=in_produktion&page=1');
    });

    it('selecting produkttyp filter updates URL correctly', () => {
      render(<OrderFilters produkttypen={['Broschüren', 'Flyer']} sachbearbeiter={[]} />);

      // Open produkttyp dropdown (third combobox)
      const comboboxes = screen.getAllByRole('combobox');
      fireEvent.click(comboboxes[2]);

      // Select "Broschüren"
      const broschuerenOption = screen.getByRole('option', { name: 'Broschüren' });
      fireEvent.click(broschuerenOption);

      expect(mockPush).toHaveBeenCalledWith('/orders?produkttyp=Brosch%C3%BCren&page=1');
    });

    it('selecting sachbearbeiter filter updates URL correctly', () => {
      render(
        <OrderFilters produkttypen={[]} sachbearbeiter={['Max Mustermann', 'Erika Musterfrau']} />
      );

      // Open sachbearbeiter dropdown (third combobox when no produkttypen)
      const comboboxes = screen.getAllByRole('combobox');
      fireEvent.click(comboboxes[2]);

      // Select "Max Mustermann"
      const maxOption = screen.getByRole('option', { name: 'Max Mustermann' });
      fireEvent.click(maxOption);

      expect(mockPush).toHaveBeenCalledWith('/orders?sachbearbeiter=Max+Mustermann&page=1');
    });

    it('resets page to 1 when filter changes', () => {
      createSearchParams({ page: '5' });
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      // Open deadline dropdown
      const comboboxes = screen.getAllByRole('combobox');
      fireEvent.click(comboboxes[0]);

      // Select "Heute"
      const todayOption = screen.getByRole('option', { name: 'Heute' });
      fireEvent.click(todayOption);

      // Verify page is reset to 1
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=1'));
    });

    it('selecting "all" removes filter from URL', () => {
      createSearchParams({ deadline: 'today' });
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      // Open deadline dropdown
      const comboboxes = screen.getAllByRole('combobox');
      fireEvent.click(comboboxes[0]);

      // Select "Alle Termine"
      const allOption = screen.getByRole('option', { name: 'Alle Termine' });
      fireEvent.click(allOption);

      // Should not contain deadline in URL
      expect(mockPush).toHaveBeenCalledWith('/orders?page=1');
    });
  });

  describe('Clear filters', () => {
    it('shows "Filter zurücksetzen" button when deadline filter is active', () => {
      createSearchParams({ deadline: 'today' });
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      expect(screen.getByText('Filter zurücksetzen')).toBeInTheDocument();
    });

    it('shows "Filter zurücksetzen" button when pipeline filter is active', () => {
      createSearchParams({ pipeline: 'offen' });
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      expect(screen.getByText('Filter zurücksetzen')).toBeInTheDocument();
    });

    it('shows "Filter zurücksetzen" button when produkttyp filter is active', () => {
      createSearchParams({ produkttyp: 'Broschüren' });
      render(<OrderFilters produkttypen={['Broschüren']} sachbearbeiter={[]} />);

      expect(screen.getByText('Filter zurücksetzen')).toBeInTheDocument();
    });

    it('shows "Filter zurücksetzen" button when sachbearbeiter filter is active', () => {
      createSearchParams({ sachbearbeiter: 'Max' });
      render(<OrderFilters produkttypen={[]} sachbearbeiter={['Max']} />);

      expect(screen.getByText('Filter zurücksetzen')).toBeInTheDocument();
    });

    it('clicking clear removes all filters except search', () => {
      createSearchParams({
        deadline: 'today',
        pipeline: 'offen',
        produkttyp: 'Broschüren',
        search: 'GP25-7647',
      });
      render(<OrderFilters produkttypen={['Broschüren']} sachbearbeiter={[]} />);

      const clearButton = screen.getByText('Filter zurücksetzen');
      fireEvent.click(clearButton);

      // Should preserve search but remove other filters
      expect(mockPush).toHaveBeenCalledWith('/orders?search=GP25-7647');
    });

    it('clicking clear removes all filters when no search active', () => {
      createSearchParams({ deadline: 'today', pipeline: 'offen' });
      render(<OrderFilters produkttypen={[]} sachbearbeiter={[]} />);

      const clearButton = screen.getByText('Filter zurücksetzen');
      fireEvent.click(clearButton);

      expect(mockPush).toHaveBeenCalledWith('/orders?');
    });
  });
});
