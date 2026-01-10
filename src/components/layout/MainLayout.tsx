"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}

export function MainLayout({ children, title, subtitle, headerRight }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-xpress-bg">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header title={title} subtitle={subtitle} headerRight={headerRight} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
