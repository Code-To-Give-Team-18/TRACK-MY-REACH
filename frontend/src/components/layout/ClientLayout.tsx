'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Exclude header and footer for digital-twin pages
  const excludedPaths = ['/digital-twin', '/digital-twin-v2'];
  const shouldShowHeaderFooter = !excludedPaths.includes(pathname);

  return (
    <>
      {shouldShowHeaderFooter && <Header />}
      <main className={shouldShowHeaderFooter ? 'pt-20' : ''}>
        {children}
      </main>
      {shouldShowHeaderFooter && <Footer />}
    </>
  );
}