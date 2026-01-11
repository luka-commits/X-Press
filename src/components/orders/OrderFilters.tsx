'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderFiltersProps {
  produkttypen: string[];
  sachbearbeiter: string[];
}

export function OrderFilters({ produkttypen, sachbearbeiter }: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDeadline = searchParams.get('deadline') || 'all';
  const currentStatus = searchParams.get('status') || 'all';
  const currentProdukttyp = searchParams.get('produkttyp') || '';
  const currentSachbearbeiter = searchParams.get('sachbearbeiter') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/orders?${params.toString()}`);
  };

  const deadlineOptions = [
    { value: 'all', label: 'Alle Termine' },
    { value: 'today', label: 'Heute' },
    { value: 'week', label: 'Diese Woche' },
    { value: 'overdue', label: 'Überfällig' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Alle Status' },
    { value: 'aktiv', label: 'Aktiv' },
    { value: 'abgeschlossen', label: 'Abgeschlossen' },
  ];

  const clearFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    router.push(`/orders?${params.toString()}`);
  };

  const hasActiveFilters =
    currentDeadline !== 'all' ||
    currentStatus !== 'all' ||
    currentProdukttyp !== '' ||
    currentSachbearbeiter !== '';

  return (
    <div className="flex gap-2 items-center">
      {/* Deadline Dropdown */}
      <Select
        value={currentDeadline}
        onValueChange={(value) => updateFilter('deadline', value)}
      >
        <SelectTrigger className="w-[140px] bg-white">
          <SelectValue placeholder="Termin" />
        </SelectTrigger>
        <SelectContent>
          {deadlineOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Dropdown */}
      <Select
        value={currentStatus}
        onValueChange={(value) => updateFilter('status', value)}
      >
        <SelectTrigger className="w-[150px] bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Produkttyp Dropdown */}
      {produkttypen.length > 0 && (
        <Select
          value={currentProdukttyp || 'all'}
          onValueChange={(value) => updateFilter('produkttyp', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Produkttyp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Produkttypen</SelectItem>
            {produkttypen.map((typ) => (
              <SelectItem key={typ} value={typ}>
                {typ}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Sachbearbeiter Dropdown */}
      {sachbearbeiter.length > 0 && (
        <Select
          value={currentSachbearbeiter || 'all'}
          onValueChange={(value) => updateFilter('sachbearbeiter', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Sachbearbeiter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Sachbearbeiter</SelectItem>
            {sachbearbeiter.map((sb) => (
              <SelectItem key={sb} value={sb}>
                {sb}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-neutral-500 hover:text-xpress-text"
        >
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}
