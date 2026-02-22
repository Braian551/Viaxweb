import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiTruck, FiBriefcase, FiArrowRight } from 'react-icons/fi';
import Hero from '../components/Hero';
import Download from '../components/Download';

const audienceCards = [
  {
    icon: FiUsers,
    title: 'Clientes',
    description: 'Solicita viajes con seguimiento en tiempo real y precios transparentes.',
    to: '/clientes',
    cta: 'Ver experiencia cliente',
  },
  {
    icon: FiTruck,
    title: 'Conductores',
    description: 'Administra tu disponibilidad, recibe solicitudes y controla tus ganancias.',
    to: '/conductores',
    cta: 'Ver panel de conductor',
  },
  {
    icon: FiBriefcase,
    title: 'Empresas',
    description: 'Gestiona flota, tarifas, documentos y reportes desde un solo panel.',
    to: '/empresas',
    cta: 'Ver solución para empresas',
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="audience-overview">
        <div className="section__header">
          <span className="section__badge">Plataforma por perfil</span>
          <h2 className="section__title">Una solución completa para cada rol</h2>
          <p className="section__subtitle">
            Navega por cada experiencia y conoce exactamente cómo funciona Viax para tu negocio o movilidad diaria.
          </p>
        </div>

        <div className="audience-overview__grid">
          {audienceCards.map((card) => (
            <article key={card.title} className="audience-card">
              <div className="audience-card__icon">
                <card.icon size={24} />
              </div>
              <h3 className="audience-card__title">{card.title}</h3>
              <p className="audience-card__description">{card.description}</p>
              <Link className="audience-card__link" to={card.to}>
                {card.cta}
                <FiArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <Download />
    </>
  );
}
