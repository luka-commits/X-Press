'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

import { Input } from '@/components/ui/input';

export function OrderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [value, setValue] = useState(initialSearch);

  // Track if this is the initial mount to avoid triggering search on first render
  const isInitialMount = useRef(true);
  // Track the last submitted search value to avoid duplicate submissions
  const lastSubmittedValue = useRef(initialSearch);

  useEffect(() => {
    // Skip the initial mount - don't trigger search on page load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only trigger search if value actually changed from last submission
    if (value === lastSubmittedValue.current) {
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      lastSubmittedValue.current = value;
      router.push(`/orders?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
      <Input
        type="text"
        placeholder="Suche nach Auftragsnr., Kunde, Produkt..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 bg-white"
      />
    </div>
  );
}
