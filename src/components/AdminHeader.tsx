
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { ShieldCheck } from 'lucide-react';

export function AdminHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // This component is now effectively disabled by removing its content,
  // but kept in case admin functionality is restored later.
  if (true) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex gap-6 md:gap-10 items-center">
            <Link href="/admin" className="flex items-center space-x-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="inline-block font-bold text-lg">Admin Panel</span>
            </Link>
        </div>
        <div className="flex items-center gap-4">
             <ThemeToggle />
             <Button asChild variant="outline" size="sm">
                <Link href="/">
                   <Home className="mr-2 h-4 w-4" />
                    Back to Site
                </Link>
             </Button>
            <Button onClick={logout} variant="secondary" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
        </div>
      </div>
    </header>
  );
}

    