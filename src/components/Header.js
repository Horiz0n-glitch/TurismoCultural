'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Data: provinces (top row) and categories+pages (bottom row)
const PROVINCE_ITEMS = [
  { label: 'Buenos Aires', href: '/categoria/buenos-aires' },
  { label: 'CABA', href: '/categoria/ciudad-de-buenos-aires' },
  { label: 'Catamarca', href: '/categoria/catamarca' },
  { label: 'Chaco', href: '/categoria/chaco' },
  { label: 'Chubut', href: '/categoria/chubut' },
  { label: 'Córdoba', href: '/categoria/cordoba' },
  { label: 'Corrientes', href: '/categoria/corrientes' },
  { label: 'Entre Ríos', href: '/categoria/entre-rios' },
  { label: 'Formosa', href: '/categoria/formosa' },
  { label: 'Jujuy', href: '/categoria/jujuy' },
  { label: 'La Pampa', href: '/categoria/la-pampa' },
  { label: 'La Rioja', href: '/categoria/la-rioja' },
  { label: 'Mendoza', href: '/categoria/mendoza' },
  { label: 'Misiones', href: '/categoria/misiones' },
  { label: 'Neuquén', href: '/categoria/neuquen' },
  { label: 'Río Negro', href: '/categoria/rio-negro' },
  { label: 'Salta', href: '/categoria/salta' },
  { label: 'San Juan', href: '/categoria/san-juan' },
  { label: 'San Luis', href: '/categoria/san-luis' },
  { label: 'Santa Cruz', href: '/categoria/santa-cruz' },
  { label: 'Santa Fé', href: '/categoria/santa-fe' },
  { label: 'Sgo. del Estero', href: '/categoria/santiago-del-estero' },
  { label: 'Tierra del Fuego', href: '/categoria/tierra-del-fuego' },
  { label: 'Tucumán', href: '/categoria/tucuman' },
  { label: 'Latinoamérica', href: '/categoria/latinoamerica' },
  { label: 'Resto del mundo', href: '/categoria/resto-del-mundo' },
];

const CATEGORY_ITEMS = [
  { label: 'Destacadas', href: '/categoria/destacadas' },
  { label: 'Noticias', href: '/categoria/noticias' },
  { label: 'Eventos', href: '/categoria/eventos' },
  { label: 'Turismo', href: '/categoria/turismo' },
  { label: 'Gastronómico', href: '/categoria/gastronomico' },
  { label: 'Capacitación', href: '/categoria/capacitacion' },
  { label: 'Museos', href: '/categoria/museos' },
  { label: 'Ferias y Congresos', href: '/categoria/ferias-y-congresos' },
  { label: 'Recorridos', href: '/categoria/recorridos' },
  { label: 'Cultura', href: '/categoria/cultura' },
  { label: 'Curiosidades', href: '/categoria/curiosidades' },
  { label: 'Ambiente', href: '/categoria/ambiente' },
  { label: 'RSE', href: '/categoria/rse' },
  { label: 'Breves', href: '/categoria/breves' },
];

const PAGE_ITEMS = [
  { label: 'Quienes Somos', href: '/quienes-somos' },
  { label: 'Servicios', href: '/categoria/servicios' },
  { label: 'Staff', href: '/staff' },
  { label: 'Contacto', href: '/contacto' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Row 1: Provinces scroll state
  const navRef1 = useRef(null);
  const [canScrollLeft1, setCanScrollLeft1] = useState(false);
  const [canScrollRight1, setCanScrollRight1] = useState(true);

  // Row 2: Categories + Pages scroll state
  const navRef2 = useRef(null);
  const [canScrollLeft2, setCanScrollLeft2] = useState(false);
  const [canScrollRight2, setCanScrollRight2] = useState(true);

  function isActive(href) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  // Track scroll position for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkScroll = (ref, setLeft, setRight) => {
    if (ref.current) {
      const el = ref.current;
      setLeft(el.scrollLeft > 5);
      setRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  const scrollNav = (ref, direction, setLeft, setRight) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
      setTimeout(() => checkScroll(ref, setLeft, setRight), 300);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?s=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  // Render a scrollable row of links
  const renderNavRow = (items, ref, canLeft, canRight, setLeft, setRight, compact) => (
    <div style={{ position: 'relative' }}>
      {/* Scroll Left Arrow */}
      {canLeft && (
        <button
          onClick={() => scrollNav(ref, -1, setLeft, setRight)}
          aria-label="Desplazar izquierda"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 28,
            background: 'linear-gradient(to right, #aa0000 60%, transparent)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            zIndex: 5,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: 4,
          }}
        >
          ‹
        </button>
      )}

      <nav onScroll={() => checkScroll(ref, setLeft, setRight)}>
        <ul
          ref={ref}
          style={{
            listStyle: 'none',
            margin: 0,
            padding: compact ? '2px 15px' : '0 15px',
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            gap: 0,
            alignItems: 'center',
            minHeight: compact ? 30 : 36,
            flexWrap: menuOpen ? 'wrap' : 'nowrap',
          }}
        >
          {items.map((item, i) => (
            <span
              key={`${item.href}-${i}`}
              style={{
                flexShrink: 0,
                listStyle: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Link
                href={item.href}
                style={{
                  display: 'block',
                  padding: compact ? '0 7px' : '0 9px',
                  color: 'white',
                  fontSize: compact ? 11.5 : 12.5,
                  fontFamily: "'PT Sans', Arial, Helvetica, sans-serif",
                  fontWeight: isActive(item.href) ? 700 : 400,
                  lineHeight: compact ? '30px' : '36px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  opacity: isActive(item.href) ? 1 : 0.85,
                  borderBottom: isActive(item.href)
                    ? '2px solid white'
                    : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.target.style.opacity = '1';
                    e.target.style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.target.style.opacity = '0.85';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {item.label === 'CABA' ? 'CDAD. DE BS. AS.' : item.label.toUpperCase()}
              </Link>
              {/* Separator pipe */}
              {i < items.length - 1 && (
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, userSelect: 'none' }}>|</span>
              )}
            </span>
          ))}
        </ul>
      </nav>

      {/* Scroll Right Arrow */}
      {canRight && (
        <button
          onClick={() => scrollNav(ref, 1, setLeft, setRight)}
          aria-label="Desplazar derecha"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 28,
            background: 'linear-gradient(to left, #aa0000 60%, transparent)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            zIndex: 5,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 4,
          }}
        >
          ›
        </button>
      )}
    </div>
  );

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: scrolled ? '0 3px 12px rgba(0,0,0,0.2)' : '0 1px 0 rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* ===== TOP ACCENT BAR ===== */}
      <div
        style={{
          height: 3,
          background: '#8b0000',
        }}
      />

      {/* ===== NAV BAR: Two rows ===== */}
      <div
        style={{
          background: '#aa0000',
          position: 'relative',
          borderBottom: menuOpen ? 'none' : '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 10px',
            position: 'relative',
          }}
        >
          {/* Mobile Menu - wraps both nav rows */}
          <div className={`${menuOpen ? '' : ''}`} style={{
            display: 'block',
          }}>
            <div className="nav-row-wrapper" style={{
              display: menuOpen ? 'block' : 'none',
            }}>
              {/* ROW 1: Provinces */}
              {renderNavRow(
                PROVINCE_ITEMS,
                navRef1,
                canScrollLeft1,
                canScrollRight1,
                setCanScrollLeft1,
                setCanScrollRight1,
                false
              )}

              {/* ROW 2: Categories + Pages */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}>
                {renderNavRow(
                  [...CATEGORY_ITEMS, ...PAGE_ITEMS],
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
      </div>

      {/* ===== LOGO + SEARCH HEADER ===== */}
      <div
        style={{
          background: '#aa0000',
          borderBottom: 'none',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-tc.png"
              alt="Turismo Cultural"
              style={{
                height: 'auto',
                width: 'auto',
                maxHeight: 65,
                maxWidth: 220,
              }}
            />
          </Link>

          {/* Right side: search + mobile toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexShrink: 0,
            }}
          >
            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
            >
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '7px 10px',
                  fontSize: 13,
                  fontFamily: "'PT Sans', Arial, sans-serif",
                  outline: 'none',
                  width: 140,
                }}
              />
              <button
                type="submit"
                aria-label="Buscar"
                style={{
                  background: 'rgba(0,0,0,0.15)',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: '7px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0,0,0,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0,0,0,0.15)';
                }}
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="mobile-nav-btn"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '6px 14px',
                fontSize: 13,
                cursor: 'pointer',
                borderRadius: 2,
                fontFamily: "'PT Sans', Arial, sans-serif",
                fontWeight: 400,
                letterSpacing: '0.5px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.12)';
              }}
            >
              {menuOpen ? '✕ CERRAR' : '☰ MENÚ'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        ul::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 769px) {
          .mobile-nav-btn {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: none !important;
          }
          .nav-row-wrapper {
            display: block !important;
          }
        }
        @media (max-width: 768px) {
          .mobile-nav-btn {
            display: inline-flex !important;
          }
          .nav-row-wrapper {
            border-top: 1px solid rgba(255,255,255,0.1);
            padding: 6px 0;
          }
          .nav-row-wrapper ul {
            flex-wrap: wrap;
            padding: 4px 10px !important;
            overflow-x: visible !important;
          }
        }
        ::placeholder {
          color: rgba(255,255,255,0.5);
          opacity: 1;
        }
      `}</style>
    </header>
  );
}
