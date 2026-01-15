'use client';

import { MobileLayout } from '@/components/layout';
import { Search } from 'lucide-react';

export default function StatusPage() {
  return (
    <MobileLayout>
      {/* Phase 4: Order search component will be added here */}
      <div className="bg-white rounded-lg border border-ghl-border p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-ghl-blue/10 flex items-center justify-center mx-auto mb-4">
          <Search className="w-6 h-6 text-ghl-blue" />
        </div>
        <h2 className="text-lg font-semibold text-ghl-text mb-2">
          Auftrag suchen
        </h2>
        <p className="text-sm text-ghl-text-secondary">
          Auftragsnummer eingeben oder QR-Code scannen
        </p>
        <p className="text-xs text-ghl-text-secondary mt-4">
          (Suchfunktion wird in Phase 4 implementiert)
        </p>
      </div>
    </MobileLayout>
  );
}
