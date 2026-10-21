'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import styles from './Header.module.css';
import type { NavigationItem } from '@/lib/content';

interface NavItem {
  label: string;
  href: string;
}

export default function Header({ navigation }: { navigation: NavigationItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const navRef1 = useRef<HTMLUListElement>(null);
  const [canScrollLeft1, setCanScrollLeft1] = useState(false);
  const [canScrollRight1, setCanScrollRight1] = useState(true);

  const navRef2 = useRef<HTMLUListElement>(null);
  const [canScrollLeft2, setCanScrollLeft2] = useState(false);
  const [canScrollRight2, setCanScrollRight2] = useState(true);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkScroll = (ref: React.RefObject<HTMLUListElement | null>, setLeft: (v: boolean) => void, setRight: (v: boolean) => void) => {
    if (ref.current) {
      const el = ref.current;
      setLeft(el.scrollLeft > 5);
      setRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  const scrollNav = (ref: React.RefObject<HTMLUListElement | null>, direction: number, setLeft: (v: boolean) => void, setRight: (v: boolean) => void) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
      setTimeout(() => checkScroll(ref, setLeft, setRight), 300);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?s=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const renderNavRow = (
    items: NavItem[],
    ref: React.RefObject<HTMLUListElement | null>,
    canLeft: boolean,
    canRight: boolean,
    setLeft: (v: boolean) => void,
    setRight: (v: boolean) => void,
    compact: boolean
  ) => (
    <div className={styles.scrollContainer}>
      {canLeft && (
        <button
          onClick={() => scrollNav(ref, -1, setLeft, setRight)}
          aria-label="Desplazar izquierda"
          className={styles.scrollBtnLeft}
        >
          ‹
        </button>
      )}

      <nav aria-label={compact ? 'Secciones del sitio' : 'Destinos por provincia'} onScroll={() => checkScroll(ref, setLeft, setRight)}>
        <ul
          ref={ref}
          className={[
            styles.navList,
            compact ? styles.navListCompact : '',
            menuOpen ? styles.navListWrapped : '',
          ].filter(Boolean).join(' ')}
        >
          {items.map((item, i) => (
            <li key={`${item.href}-${i}`} className={styles.navItem}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={[
                  styles.navLink,
                  compact ? styles.navLinkCompact : '',
                  isActive(item.href) ? styles.navLinkActive : '',
                ].filter(Boolean).join(' ')}
              >
                {item.label === 'CABA' ? 'CDAD. DE BS. AS.' : item.label.toUpperCase()}
              </Link>
              {i < items.length - 1 && (
                <span className={styles.separator}>|</span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {canRight && (
        <button
          onClick={() => scrollNav(ref, 1, setLeft, setRight)}
          aria-label="Desplazar derecha"
          className={styles.scrollBtnRight}
        >
          ›
        </button>
      )}
    </div>
  );

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.headerScrolled : styles.headerNotScrolled}`}
    >
      <div className={styles.accentBar} />

      <div className={styles.logoBar}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/logo-tc.png"
              alt="Turismo Cultural"
              width={220}
              height={65}
              priority
              style={{ height: 'auto', width: 'auto', maxHeight: 65, maxWidth: 220 }}
            />
          </Link>

          <div className={styles.rightSection}>
            <form
              onSubmit={handleSearch}
              className={styles.searchForm}
            >
              <input
                type="text"
                placeholder="Buscar..."
                aria-label="Buscar artículos"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" aria-label="Buscar" className={styles.searchBtn}>
                <MagnifyingGlassIcon className="icon icon-xs" />
              </button>
            </form>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="site-navigation"
              className={`${styles.mobileToggle} ${menuOpen ? styles.mobileToggleOpen : ''}`}
            >
              {menuOpen ? '✕ CERRAR' : '☰ MENÚ'}
            </button>
          </div>
        </div>
      </div>

      <div
        id="site-navigation"
        className={`${styles.navBar} ${menuOpen ? styles.navBarOpen : styles.navBarClosed}`}
      >
        <div className={styles.navContainer}>
          <div className={`${styles.navRowWrapper} ${menuOpen ? styles.navRowWrapperVisible : ''}`}>
            {renderNavRow(
              navigation.filter(item => item.section === 'provinces'),
              navRef1,
              canScrollLeft1,
              canScrollRight1,
              setCanScrollLeft1,
              setCanScrollRight1,
              false
            )}

            <div className={styles.rowDivider}>
              {renderNavRow(
                navigation.filter(item => item.section === 'topics'),
                navRef2,
                canScrollLeft2,
                canScrollRight2,
                setCanScrollLeft2,
                setCanScrollRight2,
                true
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
