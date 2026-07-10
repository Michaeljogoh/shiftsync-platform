import type { Metadata } from 'next';
import './globals.css';
import { DM_Sans, Inter, Source_Code_Pro } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ReactQueryProvider } from '@/lib/tanstack-query/ReactQueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WakeApiOnVisit } from '@/components/wake-api-on-visit';
import { getWakeApiOrigin } from '@/lib/api/wake-api';

const fontSans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const fontDisplay = DM_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});
const fontMono = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'ShiftSync | Shift scheduling for multi-location teams',
  description:
    'Plan, publish, and manage shifts across locations. Real-time updates, swap workflows, and constraint-aware scheduling for restaurant groups.',
  icons: {
    icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    shortcut: ['/logo.svg'],
  },
  openGraph: {
    title: 'ShiftSync',
    description: 'Shift scheduling and workforce management for multi-location restaurant groups.',
    type: 'website',
  },
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const apiOrigin = getWakeApiOrigin();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('font-sans', fontSans.variable, fontDisplay.variable, fontMono.variable)}
    >
      <head>
        {apiOrigin ? <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" /> : null}
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <TooltipProvider>
          <WakeApiOnVisit />
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}


