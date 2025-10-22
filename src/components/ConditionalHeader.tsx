
"use client";

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { useEffect, useState } from 'react';

export function ConditionalHeader() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const noHeaderPaths = ['/login', '/signup', '/terms', '/privacy', '/focus'];

  const shouldHide = noHeaderPaths.some(p => pathname.startsWith(p));

  if (!isMounted || shouldHide) {
    return null;
  }

  return <Header />;
}
