import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiTruck, FiBriefcase, FiArrowRight } from 'react-icons/fi';
import Hero from '../components/Hero';
import Download from '../components/Download';
import SeoMeta from '../components/SeoMeta';
import FaqSection from '../components/FaqSection';

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
  const faqData = [
    {
      question: '¿Cómo solicito un viaje en Viax?',
      answer: 'Ingresa origen y destino, elige tipo de vehículo (Moto, Carro, Mototaxi o Taxi), revisa la tarifa y confirma el viaje.',
    },
    {
      question: '¿Qué tipos de vehículo están disponibles?',
      answer: 'Viax ofrece Moto, Carro, Mototaxi y Taxi según disponibilidad operativa en tu zona.',
    },
    {
      question: '¿Cómo me registro como conductor?',
      answer: 'Desde la sección Conductores puedes iniciar el proceso, cargar documentación y completar la validación para activación.',
    },
    {
      question: '¿Viax tiene solución para empresas de transporte?',
      answer: 'Sí. Las empresas pueden gestionar conductores, documentos, tarifas, comisiones y reportes desde un panel unificado.',
    },
    {
      question: '¿Cómo se calculan las tarifas?',
      answer: 'El precio considera tarifa base, distancia, tiempo y posibles recargos operativos según configuración vigente.',
    },
    {
      question: '¿Dónde consulto términos y privacidad?',
      answer: 'En la sección Legal puedes consultar términos y política de privacidad por rol: cliente, conductor, empresa, administrador o servidor.',
    },
  ];

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://viaxcol.online/#organization',
        name: 'VIAX TECHNOLOGY S.A.S',
        url: 'https://viaxcol.online',
        logo: 'https://viaxcol.online/logo.png',
        email: 'legal@viaxcol.online',
        areaServed: 'Colombia',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://viaxcol.online/#website',
        url: 'https://viaxcol.online/',
        name: 'Viax Colombia',
        inLanguage: 'es-CO',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Viax',
        operatingSystem: 'Android, iOS, Web',
        applicationCategory: 'TravelApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'COP',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqData.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <SeoMeta
        title="App de transporte en Colombia"
        description="Viax conecta clientes, conductores y empresas con seguimiento en tiempo real, conductores verificados y tarifas transparentes en Colombia."
        path="/"
        keywords="app de transporte colombia, solicitar viaje, moto taxi carro, plataforma de movilidad, viax"
        jsonLd={homeJsonLd}
      />
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
      <FaqSection />
      <Download />
    </>
  );
}
