/**
 * Tests for DashboardClient component
 *
 * Tests rendering, button states, and refresh interactions.
 * Mocks useDashboardRefresh hook to control state.
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { DashboardClient } from '../DashboardClient';

// Mock the hooks module
jest.mock('@/hooks', () => ({
  useDashboardRefresh: jest.fn(),
}));

// Import the mocked hook to configure it in tests
import { useDashboardRefresh } from '@/hooks';

const mockUseDashboardRefresh = useDashboardRefresh as jest.MockedFunction<
  typeof useDashboardRefresh
>;

describe('DashboardClient', () => {
  const defaultMockReturn = {
    isRefreshing: false,
    showSuccess: false,
    countdown: 285,
    countdownText: '4:45',
    handleRefresh: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockUseDashboardRefresh.mockReturnValue(defaultMockReturn);
  });

  describe('Rendering', () => {
    it('shows lastUpdated time', () => {
      render(<DashboardClient lastUpdated="14:30:25" />);

      expect(screen.getByText(/Aktualisiert: 14:30:25/)).toBeInTheDocument();
    });

    it('shows countdown text', () => {
      render(<DashboardClient lastUpdated="14:30:25" />);

      expect(screen.getByText(/Nächste Aktualisierung in 4:45/)).toBeInTheDocument();
    });

    it('shows Aktualisieren button', () => {
      render(<DashboardClient lastUpdated="14:30:25" />);

      expect(screen.getByRole('button', { name: /Aktualisieren/i })).toBeInTheDocument();
    });
  });

  describe('Hook mocking', () => {
    it('uses countdown text from hook', () => {
      mockUseDashboardRefresh.mockReturnValue({
        ...defaultMockReturn,
        countdownText: '2:30',
      });

      render(<DashboardClient lastUpdated="10:00:00" />);

      expect(screen.getByText(/Nächste Aktualisierung in 2:30/)).toBeInTheDocument();
    });
  });

  describe('Button states', () => {
    it('shows default state with RefreshCw icon and Aktualisieren text', () => {
      render(<DashboardClient lastUpdated="14:30:25" />);

      const button = screen.getByRole('button', { name: /Aktualisieren/i });
      expect(button).toBeEnabled();
      // Check that button contains the refresh icon (by checking class structure)
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).not.toHaveClass('animate-spin');
    });

    it('disables button and shows spinner when refreshing', () => {
      mockUseDashboardRefresh.mockReturnValue({
        ...defaultMockReturn,
        isRefreshing: true,
      });

      render(<DashboardClient lastUpdated="14:30:25" />);

      const button = screen.getByRole('button', { name: /Aktualisieren/i });
      expect(button).toBeDisabled();

      // Check that the icon has animate-spin class
      const icon = button.querySelector('svg');
      expect(icon).toHaveClass('animate-spin');
    });

    it('shows Aktualisiert with Check icon and green background on success', () => {
      mockUseDashboardRefresh.mockReturnValue({
        ...defaultMockReturn,
        showSuccess: true,
      });

      render(<DashboardClient lastUpdated="14:30:25" />);

      const button = screen.getByRole('button', { name: /Aktualisiert/i });
      expect(button).toBeInTheDocument();
      // Check for green background class
      expect(button).toHaveClass('bg-capacity-green');
    });

    it('does not show spinner when showing success state', () => {
      mockUseDashboardRefresh.mockReturnValue({
        ...defaultMockReturn,
        showSuccess: true,
        isRefreshing: false,
      });

      render(<DashboardClient lastUpdated="14:30:25" />);

      const button = screen.getByRole('button', { name: /Aktualisiert/i });
      const icon = button.querySelector('svg');
      expect(icon).not.toHaveClass('animate-spin');
    });
  });

  describe('Click handling', () => {
    it('calls handleRefresh when button is clicked', () => {
      const mockHandleRefresh = jest.fn();
      mockUseDashboardRefresh.mockReturnValue({
        ...defaultMockReturn,
        handleRefresh: mockHandleRefresh,
      });

      render(<DashboardClient lastUpdated="14:30:25" />);

      const button = screen.getByRole('button', { name: /Aktualisieren/i });
      fireEvent.click(button);

      expect(mockHandleRefresh).toHaveBeenCalledTimes(1);
    });

    it('does not call handleRefresh when button is disabled', () => {
      const mockHandleRefresh = jest.fn();
      mockUseDashboardRefresh.mockReturnValue({
        ...defaultMockReturn,
        isRefreshing: true,
        handleRefresh: mockHandleRefresh,
      });

      render(<DashboardClient lastUpdated="14:30:25" />);

      const button = screen.getByRole('button', { name: /Aktualisieren/i });
      fireEvent.click(button);

      // Button is disabled, so click should not trigger handler
      expect(mockHandleRefresh).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles countdown at 0:00', () => {
      mockUseDashboardRefresh.mockReturnValue({
        ...defaultMockReturn,
        countdown: 0,
        countdownText: '0:00',
      });

      render(<DashboardClient lastUpdated="14:30:25" />);

      expect(screen.getByText(/Nächste Aktualisierung in 0:00/)).toBeInTheDocument();
    });

    it('handles long countdown text', () => {
      mockUseDashboardRefresh.mockReturnValue({
        ...defaultMockReturn,
        countdown: 599,
        countdownText: '9:59',
      });

      render(<DashboardClient lastUpdated="14:30:25" />);

      expect(screen.getByText(/Nächste Aktualisierung in 9:59/)).toBeInTheDocument();
    });
  });
});
