'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
}

export function MobileHeader({ title = 'XOS Status', showBack = false }: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="h-14 bg-white border-b border-ghl-border flex items-center px-4">
      {/* Left: Back button or spacer */}
      <div className="w-10">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-ghl-text-secondary hover:text-ghl-text transition-colors rounded-md"
            aria-label="Zurück"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Center: Title */}
      <h1 className="flex-1 text-center text-lg font-semibold text-ghl-text">
        <span className="text-ghl-blue">X-Press</span> {title}
      </h1>

      {/* Right: Spacer for symmetry */}
      <div className="w-10" />
    </header>
  );
}
