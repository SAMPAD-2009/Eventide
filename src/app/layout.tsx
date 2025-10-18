
import type { Metadata } from 'next';
import './globals.css';
import { EventProvider } from '@/context/EventContext';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/context/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { ConditionalHeader } from '@/components/ConditionalHeader';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { SiteAlert } from '@/components/SiteAlert';
import { Suspense } from 'react';
import { ConditionalFooter } from '@/components/ConditionalFooter';
import { TodoProvider } from '@/context/TodoContext';
import { LabelProvider } from '@/context/LabelContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});


export const metadata: Metadata = {
  title: 'Eventide',
  description: 'An AI-powered event management app.',
  icons: {
    icon: 'https://img.icons8.com/?size=100&id=15753&format=png&color=000000',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="https://img.icons8.com/?size=100&id=15753&format=png&color=000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <AuthProvider>
          <ThemeProvider>
            <LabelProvider>
              <EventProvider>
                <TodoProvider>
                    <div className="relative flex min-h-screen flex-col">
                      <Suspense fallback={null}>
                        <SiteAlert />
                      </Suspense>
                      <ConditionalHeader />
                      <main className="flex-1">{children}</main>
                      <ConditionalFooter />
                    </div>
                    <Toaster />
                </TodoProvider>
              </EventProvider>
            </LabelProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
