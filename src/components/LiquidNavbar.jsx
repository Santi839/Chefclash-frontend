import { NavLink } from 'react-router-dom';
import { useRef } from 'react';

function LiquidNavbar({ isAdmin, isLogged, onLogout }) {
  const navRef = useRef(null);

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
    const nav = navRef.current;
    if (!nav) return;
    const blob = nav.querySelector('.c-navbar__blob');
    if (!blob) return;
    window.requestAnimationFrame(() => {
      blob.style.opacity = '0';
    });
  };

  return (
    <div className="c-navbar-wrapper">
      <nav
        className="c-navbar"
        ref={navRef}
        aria-label="Navegación principal mejorada"
        onMouseLeave={hideBlob}
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
        <ul className="c-navbar__list">
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
                    style={({ isActive }) => ({ color: isActive ? 'var(--c-color-primary)' : 'var(--c-color-dark)' })}
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    {...commonProps}
                    className={`${commonProps.className} c-navbar__link--action`}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <span className="c-navbar__blob" aria-hidden="true" />
      </nav>
    </div>
  );
}

export default LiquidNavbar;
