
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname === '/calendar') {
    return null;
  }

  return (
    <footer className="py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground flex justify-center items-center gap-4 flex-wrap">
        <p>created by His Royal Highness Lord-Samp2009</p>
        <Link href="/terms" className="underline hover:text-primary">
          Terms & Conditions
        </Link>
        <Link href="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
