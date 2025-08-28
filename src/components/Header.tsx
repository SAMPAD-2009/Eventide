"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const navLinkClasses = (path: string) =>
    cn(
      "transition-colors hover:text-primary",
      pathname === path ? "text-primary font-semibold" : "text-muted-foreground"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 px-4 md:px-6">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-lg">Eventide</span>
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className={navLinkClasses("/")}>
              Upcoming
            </Link>
            <Link href="/future" className={navLinkClasses("/future")}>
              Future
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
