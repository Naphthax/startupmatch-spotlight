// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StartupMatch',
  description: 'Connecting Founders and Investors',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 1. "dark" Klasse erzwingt den Dark Mode für shadcn
    <html lang="en" className="dark">
      <body
        className={cn(
          'min-h-screen font-sans antialiased',
          // 2. Setzt den Hintergrund auf reines Schwarz
          'bg-[#000000] text-white',
          inter.className
        )}
      >
        {children}
      </body>
    </html>
  );
}