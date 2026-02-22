import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiMail,
  FiGlobe,
  FiChevronUp,
} from 'react-icons/fi';

const footerLinks = {
  Plataforma: [
    { label: 'Inicio', to: '/' },
    { label: 'Clientes', to: '/clientes' },
    { label: 'Conductores', to: '/conductores' },
    { label: 'Empresas', to: '/empresas' },
  ],
  Legal: [
    { label: 'Términos y condiciones', to: '/legal?doc=terms&role=cliente' },
    { label: 'Política de privacidad', to: '/legal?doc=privacy&role=cliente' },
  ],
  Compañía: [
    { label: 'Sobre nosotros', to: '/' },
    { label: 'Para conductores', to: '/conductores' },
    { label: 'Para empresas', to: '/empresas' },
  ],
};

export default function Footer() {
  const scrollTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" id="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <img src="/logo.png" alt="Viax" className="footer__logo" />
          <h3>VIAX TECHNOLOGY S.A.S</h3>
          <p>Movilidad inteligente para Colombia.</p>

          <div className="footer__contact">
            <div className="footer__contact-item">
              <FiMail size={16} />
              <span>viaxoficialcol@gmail.com</span>
            </div>
            <div className="footer__contact-item">
              <FiGlobe size={16} />
              <span>viaxcol.online</span>
            </div>
            <div className="footer__contact-item">
              <FiMapPin size={16} />
              <span>Colombia</span>
            </div>
          </div>
        </div>

        <div className="footer__links">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="footer__column">
              <h4>{title}</h4>
              <ul>
                {links.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} VIAX TECHNOLOGY S.A.S. Todos los derechos reservados.</p>
        <p className="footer__rep">Representante legal: Braian Andres Oquendo Durango</p>
        <button className="footer__top-btn" onClick={scrollTop} type="button" aria-label="Ir arriba">
          <FiChevronUp size={20} />
        </button>
      </div>
    </footer>
  );
}
