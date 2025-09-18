
import type { Metadata } from 'next';
import './globals.css';
import { EventProvider } from '@/context/EventContext';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/context/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { ConditionalHeader } from '@/components/ConditionalHeader';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});


export const metadata: Metadata = {
  title: 'Eventide',
  description: 'An AI-powered event management app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head />
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <AuthProvider>
          <ThemeProvider>
            <EventProvider>
              <div className="relative flex min-h-screen flex-col">
                <ConditionalHeader />
                <main className="flex-1">{children}</main>
                <footer className="py-4 px-4 md:px-8">
                  <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
                    <p>created by His Royal Highness Lord-Samp2009</p>
                  </div>
                </footer>
              </div>
              <Toaster />
            </EventProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
