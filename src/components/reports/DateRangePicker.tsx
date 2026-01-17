'use client';

import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date;
  to: Date;
}

type PresetKey = 'last7' | 'last30' | 'thisMonth' | 'lastMonth';

interface Preset {
  key: PresetKey;
  label: string;
  getRange: () => DateRange;
}

const PRESETS: Preset[] = [
  {
    key: 'last7',
    label: 'Letzte 7 Tage',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    key: 'last30',
    label: 'Letzte 30 Tage',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
  {
    key: 'thisMonth',
    label: 'Dieser Monat',
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    key: 'lastMonth',
    label: 'Letzter Monat',
    getRange: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfDay(endOfMonth(subMonths(new Date(), 1))),
    }),
  },
];

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange) => void;
  className?: string;
}

/**
 * DateRangePicker - Date range selector with presets
 *
 * Features:
 * - Preset buttons: Letzte 7 Tage, Letzte 30 Tage, Dieser Monat, Letzter Monat
 * - Calendar with range selection
 * - German locale formatting
 */
export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<PresetKey | null>('last30');

  // Initialize with default range on mount
  React.useEffect(() => {
    if (!value && selectedPreset) {
      const preset = PRESETS.find((p) => p.key === selectedPreset);
      if (preset) {
        onChange(preset.getRange());
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePresetClick = (preset: Preset) => {
    const range = preset.getRange();
    setSelectedPreset(preset.key);
    onChange(range);
  };

  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setSelectedPreset(null);
      onChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
      });
    }
  };

  const getButtonText = () => {
    if (!value) {
      return 'Zeitraum wahlen';
    }
    return `${format(value.from, 'dd.MM.yyyy', { locale: de })} - ${format(value.to, 'dd.MM.yyyy', { locale: de })}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal min-w-[280px]',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getButtonText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 p-3 border-b">
          {PRESETS.map((preset) => (
            <Button
              key={preset.key}
              variant={selectedPreset === preset.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetClick(preset)}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Calendar */}
        <Calendar
          mode="range"
          selected={value ? { from: value.from, to: value.to } : undefined}
          onSelect={handleCalendarSelect}
          numberOfMonths={2}
          locale={de}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
