import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { Link, NavLink } from 'react-router-dom';

export default function Header({ isDark, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Inicio', to: '/' },
    { label: 'Clientes', to: '/clientes' },
    { label: 'Conductores', to: '/conductores' },
    { label: 'Empresas', to: '/empresas' },
    { label: 'Legal', to: '/legal?doc=terms&role=cliente' },
  ];

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__brand" onClick={() => setMenuOpen(false)}>
          <img src="/logo.png" alt="Viax" className="header__logo" />
          <div className="header__brand-text">
            <span className="header__brand-name">VIAX</span>
            <span className="header__brand-tagline">Movilidad inteligente</span>
          </div>
        </Link>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <button
            className="header__theme-btn"
            onClick={onToggleTheme}
            type="button"
            aria-label="Cambiar tema"
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button
            className="header__menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
            aria-label="Menú"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
