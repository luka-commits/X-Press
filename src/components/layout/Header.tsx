"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tagesübersicht", href: "/" },
  { name: "Aufträge", href: "/orders" },
  { name: "Wochenplan", href: "/calendar" },
  { name: "Versand", href: "/versand" },
  { name: "Auftragsupdates", href: "/status" },
  { name: "Reports", href: "/reports" },
];

interface HeaderProps {
  headerRight?: React.ReactNode;
}

export function Header({ headerRight }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-ghl-border flex items-center justify-between px-6">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <span className="text-xl font-semibold text-ghl-text">
          X-Press <span className="text-ghl-blue">XOS</span>
        </span>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors rounded-md",
                  isActive
                    ? "bg-ghl-blue/10 text-ghl-blue"
                    : "text-ghl-text-secondary hover:text-ghl-text hover:bg-gray-100"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Actions */}
      {headerRight || (
        <button
          onClick={handleRefresh}
          className="px-4 py-2 text-sm font-medium text-white bg-ghl-blue hover:bg-ghl-blue-hover rounded-md transition-colors shadow-sm"
        >
          Aktualisieren
        </button>
      )}
    </header>
  );
}
