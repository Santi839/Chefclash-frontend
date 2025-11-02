import { NavLink } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

function LiquidNavbar({ isAdmin, isLogged, onLogout }) {
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(max-width: 768px)').matches;
  });

  const isMobileViewport = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  const navigationItems = [
    { key: 'home', label: 'Inicio', to: '/', end: true, type: 'link' },
    { key: 'about', label: 'Nosotros', to: '/about', type: 'link' },
    { key: 'tournaments', label: 'Torneos', to: '/tournaments', type: 'link' },
    ...(isAdmin ? [{ key: 'chefs', label: 'Chefs', to: '/admin/chefs', type: 'link' }] : []),
    ...(isLogged
      ? [
          { key: 'profile', label: 'Perfil', to: '/profile', type: 'link' },
          { key: 'logout', label: 'Cerrar sesión', to: null, type: 'button', onClick: onLogout },
        ]
      : [
          { key: 'login', label: 'Login', to: '/login', type: 'link' },
          { key: 'register', label: 'Registro', to: '/register', type: 'link' },
        ]),
  ];

  const updateBlob = (event) => {
    if (isMobileViewport()) return;
    const nav = navRef.current;
    if (!nav) return;
    const blob = nav.querySelector('.c-navbar__blob');
    if (!blob) return;

    const linkRect = event.currentTarget.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const width = Math.max(linkRect.width + 24, 110);
    const x = linkRect.left - navRect.left - (width - linkRect.width) / 2;
    const y = Math.min(linkRect.top - navRect.top, navRect.height - linkRect.height);

    window.requestAnimationFrame(() => {
      blob.style.opacity = '1';
      blob.style.width = `${width}px`;
      blob.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  const hideBlob = () => {
    if (isMobileViewport()) return;
    const nav = navRef.current;
    if (!nav) return;
    const blob = nav.querySelector('.c-navbar__blob');
    if (!blob) return;
    window.requestAnimationFrame(() => {
      blob.style.opacity = '0';
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen((previous) => {
      const next = !previous;
      if (!next) {
        hideBlob();
      }
      return next;
    });
  };

  const handleResponsiveClose = () => {
    if (isMobileViewport()) {
      setIsMenuOpen(false);
      hideBlob();
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => {
      const isMobile = isMobileViewport();
      setIsDesktopView(!isMobile);
      if (!isMobile) {
        setIsMenuOpen(false);
        hideBlob();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isMobileViewport() || typeof document === 'undefined') {
      return undefined;
    }

    const { body } = document;
    body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen || typeof window === 'undefined') return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        hideBlob();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleBackdropClick = (event) => {
    if (isMenuOpen && event.target === event.currentTarget) {
      setIsMenuOpen(false);
      hideBlob();
    }
  };

  return (
    <div
      className={`c-navbar-wrapper${isMenuOpen ? ' is-menu-open' : ''}`}
      onClick={handleBackdropClick}
    >
      <nav
        className={`c-navbar${isMenuOpen ? ' c-navbar--open' : ''}`}
        ref={navRef}
        aria-label="Navegación principal mejorada"
        onMouseLeave={hideBlob}
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="c-navbar__goo-fx" width="0" height="0" aria-hidden="true">
          <filter id="c-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -15"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </svg>
        {!isDesktopView && (
          <button
            type="button"
            className={`c-navbar__toggle${isMenuOpen ? ' is-open' : ''}`}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            aria-label={isMenuOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}
            onClick={toggleMenu}
          >
            <span aria-hidden="true" className="c-navbar__toggle-bar" />
            <span aria-hidden="true" className="c-navbar__toggle-bar" />
            <span aria-hidden="true" className="c-navbar__toggle-bar" />
          </button>
        )}
        <ul
          id="primary-navigation"
          className={`c-navbar__list${isMenuOpen ? ' c-navbar__list--open' : ''}`}
        >
          {navigationItems.map((item) => {
            const commonProps = {
              onMouseEnter: updateBlob,
              onFocus: updateBlob,
              onMouseLeave: hideBlob,
              onBlur: hideBlob,
              className: 'c-navbar__link',
            };
            const isLogout = item.key === 'logout';

            return (
              <li
                key={item.key}
                className={`c-navbar__item${isLogout ? ' c-navbar__item--action' : ''}`}
              >
                {item.type === 'link' ? (
                  <NavLink
                    to={item.to}
                    end={item.end}
                    {...commonProps}
                    className={({ isActive }) =>
                      `${commonProps.className}${isActive ? ' is-active' : ''}`
                    }
                    style={({ isActive }) => 
                      isMobileViewport() 
                        ? {} 
                        : { color: isActive ? 'var(--c-color-primary)' : 'var(--c-color-dark)' }
                    }
                    onClick={handleResponsiveClose}
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    {...commonProps}
                    className={`${commonProps.className} c-navbar__link--action`}
                    onClick={(event) => {
                      if (typeof item.onClick === 'function') {
                        item.onClick(event);
                      }
                      handleResponsiveClose();
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {isDesktopView && <span className="c-navbar__blob" aria-hidden="true" />}
      </nav>
    </div>
  );
}

export default LiquidNavbar;
