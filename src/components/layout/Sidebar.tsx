"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Aufträge", href: "/orders" },
  { name: "Kalender", href: "/calendar" },
  { name: "Versand", href: "/versand" },
  { name: "Reports", href: "/reports" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 min-h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-200">
        <span className="text-xl font-semibold text-xpress-text">
          X-Press <span className="text-xpress-blue">XOS</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "block px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-xpress-yellow text-xpress-text"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-xpress-text"
                  )}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
