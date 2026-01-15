'use client';

import { MobileLayout } from '@/components/layout';
import { VersandOrderList } from '@/components/versand';

/**
 * Versand Page - Shipping Team Order View
 *
 * Mobile-optimized page for shipping team to:
 * - View orders sorted by PLZ for route optimization
 * - Filter by deadline (today/week/all)
 * - Filter by versandStatus (offen/versandbereit)
 * - Mark orders as versandbereit or versendet
 */
export default function VersandPage() {
  return (
    <MobileLayout title="Versand" showBack={true}>
      <VersandOrderList />
    </MobileLayout>
  );
}
