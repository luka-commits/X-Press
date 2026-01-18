'use client';

import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/auth';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Tagesübersicht', href: '/' },
  { name: 'Aufträge', href: '/orders' },
  { name: 'Wochenplan', href: '/calendar' },
  { name: 'Versand', href: '/versand' },
  { name: 'Auftragsupdates', href: '/status' },
  { name: 'Reports', href: '/reports' },
];

interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}

interface HeaderProps {
  headerRight?: React.ReactNode;
}

export function Header({ headerRight }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Fetch/create profile
        fetch('/api/profile')
          .then((res) => res.json())
          .then((data) => {
            if (data.id) setProfile(data);
          })
          .catch(console.error);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetch('/api/profile')
          .then((res) => res.json())
          .then((data) => {
            if (data.id) setProfile(data);
          })
          .catch(console.error);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-ghl-border flex items-center justify-between px-6">
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
                  'px-4 py-2 text-sm font-medium transition-colors rounded-md',
                  isActive
                    ? 'bg-ghl-blue/10 text-ghl-blue'
                    : 'text-ghl-text-secondary hover:text-ghl-text hover:bg-gray-100'
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {headerRight || (
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm font-medium text-white bg-ghl-blue hover:bg-ghl-blue-hover rounded-md transition-colors shadow-sm"
          >
            Aktualisieren
          </button>
        )}

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <span className="text-sm text-ghl-text-secondary truncate max-w-[200px]">
              {profile?.fullName || user.email}
            </span>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {loading ? '...' : 'Abmelden'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
