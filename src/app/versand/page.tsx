'use client';

import { Truck } from 'lucide-react';

import { MainLayout } from '@/components/layout';
import { VersandOrderList } from '@/components/versand';

/**
 * Versand Page - Shipping Team Order View
 *
 * Desktop & mobile page for shipping team to:
 * - View orders sorted by PLZ for route optimization
 * - Filter by deadline (today/week/all)
 * - Filter by versandStatus (offen/versandbereit)
 * - Mark orders as versandbereit or versendet
 * - View orders on map with bidirectional interaction
 */
export default function VersandPage() {
  return (
    <MainLayout
      headerRight={
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Truck className="w-4 h-4" />
          <span>Versand-Übersicht</span>
        </div>
      }
    >
      <VersandOrderList />
    </MainLayout>
  );
}
