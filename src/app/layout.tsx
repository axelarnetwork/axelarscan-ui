import { Suspense } from 'react';
import Script from 'next/script';
import { Inter, Lexend } from 'next/font/google';
import clsx from 'clsx';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'react-hot-toast';
import type { Metadata } from 'next';

import { Providers } from '@/app/providers';
import { Layout } from '@/components/Layout';

import '@/styles/tailwind.css';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: {
    template: '%s - Axelarscan',
    default: process.env.NEXT_PUBLIC_DEFAULT_TITLE ?? 'Axelarscan',
  },
  description: process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION,
  openGraph: {
    images: `${process.env.NEXT_PUBLIC_APP_URL}/images/ogimage.png`,
  },
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // next-themes injects a "light"/"dark" class on <html> via a blocking script
      // before React hydrates, causing a className mismatch in React 19+.
      // Can be removed if next-themes adds cookie-based SSR theme detection,
      // or if we replace next-themes with a custom cookie-based solution.
      suppressHydrationWarning
      className={clsx(
        'h-full scroll-smooth bg-white antialiased dark:bg-zinc-900',
        inter.variable,
        lexend.variable
      )}
    >
      {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
        <>
          <Script
            async
            id="gtag"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
          />
          <Script
            id="gtag-config"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
        <Providers>
          <div className="w-full">
            <Layout>
              <Suspense>{children}</Suspense>
            </Layout>
          </div>
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
