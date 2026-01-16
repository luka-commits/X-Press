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
  const currentIstStatus = searchParams.get('istStatus') || 'all';
  const currentVersandStatus = searchParams.get('versandStatus') || 'all';
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

  const istStatusOptions = [
    { value: 'all', label: 'Alle IST-Status' },
    { value: 'fertig', label: 'Fertig' },
    { value: 'in_produktion', label: 'In Produktion' },
    { value: 'problem', label: 'Problem' },
  ];

  const versandStatusOptions = [
    { value: 'all', label: 'Alle Versand-Status' },
    { value: 'offen', label: 'Offen' },
    { value: 'versandbereit', label: 'Versandbereit' },
    { value: 'versendet', label: 'Versendet' },
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
    currentIstStatus !== 'all' ||
    currentVersandStatus !== 'all' ||
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

      {/* IST-Status Dropdown */}
      <Select
        value={currentIstStatus}
        onValueChange={(value) => updateFilter('istStatus', value)}
      >
        <SelectTrigger className="w-[150px] bg-white">
          <SelectValue placeholder="IST-Status" />
        </SelectTrigger>
        <SelectContent>
          {istStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Versand-Status Dropdown */}
      <Select
        value={currentVersandStatus}
        onValueChange={(value) => updateFilter('versandStatus', value)}
      >
        <SelectTrigger className="w-[170px] bg-white">
          <SelectValue placeholder="Versand-Status" />
        </SelectTrigger>
        <SelectContent>
          {versandStatusOptions.map((option) => (
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
          className="text-neutral-500 hover:text-ghl-text"
        >
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}
