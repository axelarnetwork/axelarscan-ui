'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';
// @ts-expect-error react-linkify has no type declarations
import Linkify from 'react-linkify';
import parse from 'html-react-parser';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

import * as styles from './Layout.styles';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const lite = pathname.startsWith('/lite/');

  const noHeader = lite;
  const noStatusMessage = lite || ['/tvl'].includes(pathname);
  const noFooter = lite || ['/tvl'].includes(pathname);

  return (
    <div className={styles.layoutWrapper}>
      {!noHeader && (
        <>
          <motion.header layoutScroll className={styles.headerMotion}>
            {process.env.NEXT_PUBLIC_STATUS_MESSAGE && !noStatusMessage && (
              <div className={styles.statusBanner}>
                <div className={styles.statusBannerContent}>
                  <span className={styles.statusMessage}>
                    <Linkify>
                      {parse(process.env.NEXT_PUBLIC_STATUS_MESSAGE)}
                    </Linkify>
                  </span>
                </div>
              </div>
            )}
            <Header />
          </motion.header>
        </>
      )}
      <div className={clsx(styles.contentWrapper, !noFooter && styles.contentWrapperFull)}>
        <main className={styles.main}>{children}</main>
        {!noFooter && <Footer />}
      </div>
    </div>
  );
}
