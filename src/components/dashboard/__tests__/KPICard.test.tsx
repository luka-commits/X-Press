/**
 * Tests for KPICard component
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { KPICard } from '../KPICard';

describe('KPICard', () => {
  it('renders label and value', () => {
    render(<KPICard label="Test Label" value={42} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with suffix', () => {
    render(<KPICard label="Percentage" value={85} suffix="%" />);

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<KPICard label="Status" value="Active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<KPICard label="Default" value={10} />);

    const valueElement = screen.getByText('10');
    expect(valueElement).toHaveClass('text-ghl-text');
  });

  it('applies critical variant styles', () => {
    render(<KPICard label="Critical" value={5} variant="critical" />);

    const valueElement = screen.getByText('5');
    expect(valueElement).toHaveClass('text-capacity-red');
  });

  it('applies warning variant styles', () => {
    render(<KPICard label="Warning" value={3} variant="warning" />);

    const valueElement = screen.getByText('3');
    expect(valueElement).toHaveClass('text-capacity-yellow');
  });

  it('applies success variant styles', () => {
    render(<KPICard label="Success" value={0} variant="success" />);

    const valueElement = screen.getByText('0');
    expect(valueElement).toHaveClass('text-capacity-green');
  });

  it('is clickable when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<KPICard label="Clickable" value={10} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation when clickable', () => {
    const handleClick = jest.fn();
    render(<KPICard label="Keyboard Nav" value={10} onClick={handleClick} />);

    const card = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('is not clickable when onClick is not provided', () => {
    render(<KPICard label="Not Clickable" value={10} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
