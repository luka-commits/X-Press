"use client";

import { MobileHeader } from "./MobileHeader";

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

export function MobileLayout({ children, title, showBack = false }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-ghl-bg flex flex-col">
      {/* Safe area padding for mobile notches */}
      <div className="pt-[env(safe-area-inset-top)]">
        <MobileHeader title={title} showBack={showBack} />
      </div>

      {/* Touch-friendly main content with p-4 (smaller than desktop p-6) */}
      <main className="flex-1 p-4 pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
    </div>
  );
}
