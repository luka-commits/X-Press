"use client";

import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function MainLayout({ children, headerRight }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-xpress-bg flex flex-col">
      <Header headerRight={headerRight} />

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
