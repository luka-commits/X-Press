/**
 * Tests for useOrderFormatter hook
 */

import { formatDate, formatDateTime, getStatusBadge, getPipelineStage } from '../useOrderFormatter';

describe('formatDate', () => {
  it('formats a valid date string to dd.MM.yyyy', () => {
    expect(formatDate('2026-01-15T10:30:00')).toBe('15.01.2026');
  });

  it('returns – for null', () => {
    expect(formatDate(null)).toBe('–');
  });

  it('returns – for undefined', () => {
    expect(formatDate(undefined)).toBe('–');
  });

  it('returns – for empty string', () => {
    expect(formatDate('')).toBe('–');
  });

  it('returns – for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('–');
  });
});

describe('formatDateTime', () => {
  it('formats a valid date string to dd.MM.yyyy HH:mm', () => {
    expect(formatDateTime('2026-01-15T10:30:00')).toBe('15.01.2026 10:30');
  });

  it('returns – for null', () => {
    expect(formatDateTime(null)).toBe('–');
  });
});

describe('getStatusBadge', () => {
  it('returns problem badge for istStatus=problem', () => {
    const badge = getStatusBadge('problem', null);
    expect(badge.label).toBe('Problem');
    expect(badge.className).toContain('red');
  });

  it('returns versendet badge for versandStatus=versendet', () => {
    const badge = getStatusBadge('fertig', 'versendet');
    expect(badge.label).toBe('Versendet');
    expect(badge.className).toContain('green');
  });

  it('returns versandbereit badge for versandStatus=versandbereit', () => {
    const badge = getStatusBadge('fertig', 'versandbereit');
    expect(badge.label).toBe('Versandbereit');
    expect(badge.className).toContain('blue');
  });

  it('returns fertig badge for istStatus=fertig without versandStatus', () => {
    const badge = getStatusBadge('fertig', null);
    expect(badge.label).toBe('Fertig');
    expect(badge.className).toContain('emerald');
  });

  it('returns in_produktion badge for istStatus=in_produktion', () => {
    const badge = getStatusBadge('in_produktion', null);
    expect(badge.label).toBe('In Produktion');
    expect(badge.className).toContain('amber');
  });

  it('returns offen badge for no status', () => {
    const badge = getStatusBadge(null, null);
    expect(badge.label).toBe('Offen');
    expect(badge.className).toContain('neutral');
  });

  it('prioritizes problem over versendet', () => {
    const badge = getStatusBadge('problem', 'versendet');
    expect(badge.label).toBe('Problem');
  });
});

describe('getPipelineStage', () => {
  it('returns problem for istStatus=problem', () => {
    expect(getPipelineStage('problem', null)).toBe('problem');
  });

  it('returns versendet for versandStatus=versendet', () => {
    expect(getPipelineStage('fertig', 'versendet')).toBe('versendet');
  });

  it('returns versandbereit for versandStatus=versandbereit', () => {
    expect(getPipelineStage('fertig', 'versandbereit')).toBe('versandbereit');
  });

  it('returns fertig for istStatus=fertig', () => {
    expect(getPipelineStage('fertig', null)).toBe('fertig');
  });

  it('returns in_produktion for istStatus=in_produktion', () => {
    expect(getPipelineStage('in_produktion', null)).toBe('in_produktion');
  });

  it('returns offen for no status', () => {
    expect(getPipelineStage(null, null)).toBe('offen');
  });
});
