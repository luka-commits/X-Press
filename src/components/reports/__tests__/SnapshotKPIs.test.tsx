/**
 * Tests for SnapshotKPIs component
 *
 * Tests loading states, data display, highlight conditions,
 * click handling, and keyboard accessibility.
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { SnapshotKPIs } from '../SnapshotKPIs';

const mockData = {
  aktiveAuftraege: 25,
  problemAuftraege: 3,
  aeltesterAuftrag: 10,
  morgenFaellig: 5,
};

describe('SnapshotKPIs', () => {
  describe('Loading state', () => {
    it('shows loading spinner (Loader2) when loading=true', () => {
      render(<SnapshotKPIs data={null} loading={true} />);

      // Check for animated spinner elements - Loader2 has animate-spin class
      const spinners = document.querySelectorAll('.animate-spin');
      expect(spinners.length).toBeGreaterThan(0);
    });

    it('shows "Lade..." text in each card when loading', () => {
      render(<SnapshotKPIs data={null} loading={true} />);

      const loadingTexts = screen.getAllByText('Lade...');
      expect(loadingTexts.length).toBe(4); // One for each KPI card
    });
  });

  describe('Data display', () => {
    it('shows "Aktueller Stand" header', () => {
      render(<SnapshotKPIs data={mockData} loading={false} />);

      expect(screen.getByText('Aktueller Stand')).toBeInTheDocument();
    });

    it('renders 4 KPI cards in grid', () => {
      render(<SnapshotKPIs data={mockData} loading={false} />);

      expect(screen.getByText('Offene Aufträge')).toBeInTheDocument();
      expect(screen.getByText('Problem-Aufträge')).toBeInTheDocument();
      expect(screen.getByText('Ältester Auftrag')).toBeInTheDocument();
      expect(screen.getByText('Morgen fällig')).toBeInTheDocument();
    });

    it('displays aktiveAuftraege value', () => {
      render(<SnapshotKPIs data={mockData} loading={false} />);

      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('displays problemAuftraege value', () => {
      render(<SnapshotKPIs data={mockData} loading={false} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays aeltesterAuftrag with "Tage" suffix', () => {
      render(<SnapshotKPIs data={mockData} loading={false} />);

      expect(screen.getByText('10 Tage')).toBeInTheDocument();
    });

    it('shows "-" for aeltesterAuftrag when null', () => {
      const dataWithNullOldest = {
        ...mockData,
        aeltesterAuftrag: null,
      };
      render(<SnapshotKPIs data={dataWithNullOldest} loading={false} />);

      // Find the Ältester Auftrag label, then check its sibling value
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('displays morgenFaellig value', () => {
      render(<SnapshotKPIs data={mockData} loading={false} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Highlight conditions', () => {
    it('problemAuftraege highlighted (text-red-600) when > 0', () => {
      render(<SnapshotKPIs data={mockData} loading={false} />);

      // problemAuftraege is 3, should be highlighted
      const value = screen.getByText('3');
      expect(value).toHaveClass('text-red-600');
    });

    it('problemAuftraege not highlighted when = 0', () => {
      const dataWithZeroProblems = {
        ...mockData,
        problemAuftraege: 0,
      };
      render(<SnapshotKPIs data={dataWithZeroProblems} loading={false} />);

      // Find the value 0 that is NOT in the openOrders context
      // We need to find specifically the problemAuftraege 0
      const zeroValues = screen.getAllByText('0');
      // Check that at least one zero is not highlighted with red
      const nonHighlightedZero = zeroValues.find((el) => !el.classList.contains('text-red-600'));
      expect(nonHighlightedZero).toBeTruthy();
    });

    it('aeltesterAuftrag highlighted (text-amber-600) when > 7', () => {
      render(<SnapshotKPIs data={mockData} loading={false} />);

      // aeltesterAuftrag is 10, should be highlighted
      const value = screen.getByText('10 Tage');
      expect(value).toHaveClass('text-amber-600');
    });

    it('aeltesterAuftrag not highlighted when <= 7', () => {
      const dataWithRecentOldest = {
        ...mockData,
        aeltesterAuftrag: 5,
      };
      render(<SnapshotKPIs data={dataWithRecentOldest} loading={false} />);

      const value = screen.getByText('5 Tage');
      expect(value).not.toHaveClass('text-amber-600');
    });

    it('morgenFaellig highlighted (text-amber-600) when > 0', () => {
      render(<SnapshotKPIs data={mockData} loading={false} />);

      // morgenFaellig is 5, should be highlighted
      const value = screen.getByText('5');
      expect(value).toHaveClass('text-amber-600');
    });

    it('morgenFaellig not highlighted when = 0', () => {
      const dataWithZeroTomorrow = {
        ...mockData,
        morgenFaellig: 0,
      };
      render(<SnapshotKPIs data={dataWithZeroTomorrow} loading={false} />);

      // One of the zeros should not have amber highlight
      const zeroValues = screen.getAllByText('0');
      const nonAmberZero = zeroValues.find((el) => !el.classList.contains('text-amber-600'));
      expect(nonAmberZero).toBeTruthy();
    });
  });

  describe('Click handling', () => {
    it('clicking problemAuftraege calls onKpiClick with "problem"', () => {
      const handleKpiClick = jest.fn();
      render(<SnapshotKPIs data={mockData} loading={false} onKpiClick={handleKpiClick} />);

      // Find the Problem-Aufträge card button
      const buttons = screen.getAllByRole('button');
      const problemButton = buttons.find((btn) => btn.textContent?.includes('Problem-Aufträge'));

      fireEvent.click(problemButton!);
      expect(handleKpiClick).toHaveBeenCalledWith('problem');
    });

    it('clicking aeltesterAuftrag calls onKpiClick with "oldest"', () => {
      const handleKpiClick = jest.fn();
      render(<SnapshotKPIs data={mockData} loading={false} onKpiClick={handleKpiClick} />);

      const buttons = screen.getAllByRole('button');
      const oldestButton = buttons.find((btn) => btn.textContent?.includes('Ältester Auftrag'));

      fireEvent.click(oldestButton!);
      expect(handleKpiClick).toHaveBeenCalledWith('oldest');
    });

    it('clicking morgenFaellig calls onKpiClick with "tomorrow"', () => {
      const handleKpiClick = jest.fn();
      render(<SnapshotKPIs data={mockData} loading={false} onKpiClick={handleKpiClick} />);

      const buttons = screen.getAllByRole('button');
      const tomorrowButton = buttons.find((btn) => btn.textContent?.includes('Morgen fällig'));

      fireEvent.click(tomorrowButton!);
      expect(handleKpiClick).toHaveBeenCalledWith('tomorrow');
    });

    it('clicking aktiveAuftraege calls onKpiClick with "openOrders"', () => {
      const handleKpiClick = jest.fn();
      render(<SnapshotKPIs data={mockData} loading={false} onKpiClick={handleKpiClick} />);

      const buttons = screen.getAllByRole('button');
      const openOrdersButton = buttons.find((btn) => btn.textContent?.includes('Offene Aufträge'));

      fireEvent.click(openOrdersButton!);
      expect(handleKpiClick).toHaveBeenCalledWith('openOrders');
    });
  });

  describe('Keyboard accessibility', () => {
    it('cards with onClick have role="button" and tabIndex=0', () => {
      const handleKpiClick = jest.fn();
      render(<SnapshotKPIs data={mockData} loading={false} onKpiClick={handleKpiClick} />);

      const buttons = screen.getAllByRole('button');
      // All 4 cards should be buttons when onKpiClick is provided
      expect(buttons.length).toBe(4);

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('Enter key triggers click handler', () => {
      const handleKpiClick = jest.fn();
      render(<SnapshotKPIs data={mockData} loading={false} onKpiClick={handleKpiClick} />);

      const buttons = screen.getAllByRole('button');
      const problemButton = buttons.find((btn) => btn.textContent?.includes('Problem-Aufträge'));

      fireEvent.keyDown(problemButton!, { key: 'Enter' });
      expect(handleKpiClick).toHaveBeenCalledWith('problem');
    });

    it('Space key triggers click handler', () => {
      const handleKpiClick = jest.fn();
      render(<SnapshotKPIs data={mockData} loading={false} onKpiClick={handleKpiClick} />);

      const buttons = screen.getAllByRole('button');
      const oldestButton = buttons.find((btn) => btn.textContent?.includes('Ältester Auftrag'));

      fireEvent.keyDown(oldestButton!, { key: ' ' });
      expect(handleKpiClick).toHaveBeenCalledWith('oldest');
    });

    it('cards without onKpiClick are not interactive', () => {
      render(<SnapshotKPIs data={mockData} loading={false} />);

      // When no onKpiClick is provided, cards should not have button role
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);
    });
  });
});
