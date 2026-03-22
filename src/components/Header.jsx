import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { useTheme } from '../features/shared/context/ThemeContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

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
    { label: 'Legal', to: '/legal' },
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
          {user ? (
            <div className="header__user-menu">
              <span className="header__user-name">{user.nombre || user.name}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="header__logout-btn">
                Salir
              </button>
            </div>
          ) : (
            <div className="header__auth-buttons">
              <Link to="/login" className="header__login-btn btn btn--primary">
                <FiUser className="header__login-icon" size={16} />
                <span className="header__login-text">Iniciar Sesión</span>
              </Link>
            </div>
          )}

          <button
            className="header__theme-btn"
            onClick={toggleTheme}
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
