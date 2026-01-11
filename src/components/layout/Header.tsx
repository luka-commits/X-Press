"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Aufträge", href: "/orders" },
  { name: "Kalender", href: "/calendar" },
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
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <span className="text-xl font-semibold text-xpress-text">
          X-Press <span className="text-xpress-blue">XOS</span>
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
                  "px-4 py-2 text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-xpress-text"
                    : "text-neutral-500 hover:text-xpress-text"
                )}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-xpress-yellow" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Actions */}
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
