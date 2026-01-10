"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}

export function Header({ title, subtitle, headerRight }: HeaderProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <header className="h-auto min-h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 py-3">
      <div>
        <h1 className="text-lg font-semibold text-xpress-text">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>

      {headerRight || (
        <button
          onClick={handleRefresh}
          className="px-4 py-2 text-sm font-medium text-xpress-text bg-xpress-yellow hover:bg-xpress-yellow-hover rounded-md transition-colors"
        >
          Aktualisieren
        </button>
      )}
    </header>
  );
}
