import React, { useState } from 'react';
import {
  FiMap,
  FiClock,
  FiStar,
  FiDollarSign,
  FiTruck,
  FiMapPin,
  FiUsers,
  FiFileText,
  FiBell,
  FiBarChart2,
  FiSettings,
  FiCheckCircle,
} from 'react-icons/fi';

const tabs = [
  { key: 'pasajero', label: 'Pasajeros' },
  { key: 'conductor', label: 'Conductores' },
  { key: 'empresa', label: 'Empresas' },
];

const features = {
  pasajero: [
    {
      icon: FiMap,
      title: 'Solicitud inteligente',
      desc: 'Selecciona origen y destino con búsqueda inteligente. Visualiza la ruta en el mapa antes de confirmar.',
    },
    {
      icon: FiTruck,
      title: 'Múltiples vehículos',
      desc: 'Elige entre Moto, Carro, Taxi o Mototaxi según tu necesidad de transporte.',
    },
    {
      icon: FiDollarSign,
      title: 'Precio transparente',
      desc: 'Cotización en tiempo real con desglose de tarifa base, distancia, tiempo y recargos.',
    },
    {
      icon: FiMapPin,
      title: 'Seguimiento en vivo',
      desc: 'Monitorea tu viaje en tiempo real con la ubicación del conductor y tiempo estimado.',
    },
    {
      icon: FiStar,
      title: 'Conductores de confianza',
      desc: 'Sistema ConfianzaScore que prioriza conductores favoritos y mejor calificados.',
    },
    {
      icon: FiClock,
      title: 'Historial completo',
      desc: 'Accede a todo tu historial de viajes, calificaciones y recibos en cualquier momento.',
    },
  ],
  conductor: [
    {
      icon: FiBell,
      title: 'Solicitudes en tiempo real',
      desc: 'Recibe solicitudes cercanas con alertas sonoras. Actualización automática cada 5 segundos.',
    },
    {
      icon: FiBarChart2,
      title: 'Panel de ganancias',
      desc: 'Visualiza tus ingresos diarios, semanales y mensuales con reportes detallados.',
    },
    {
      icon: FiFileText,
      title: 'Gestión documental',
      desc: 'Sube licencia, SOAT y documentos del vehículo. Seguimiento del estado de verificación.',
    },
    {
      icon: FiDollarSign,
      title: 'Comisiones claras',
      desc: 'Conoce exactamente cuánto pagas de comisión y tu estado de deuda en todo momento.',
    },
    {
      icon: FiSettings,
      title: 'Control total',
      desc: 'Gestiona tu disponibilidad, acepta o rechaza viajes, y configura tu perfil.',
    },
    {
      icon: FiMap,
      title: 'Navegación activa',
      desc: 'Navega tus viajes activos con GPS en tiempo real integrado en la app.',
    },
  ],
  empresa: [
    {
      icon: FiUsers,
      title: 'Gestión de flota',
      desc: 'Administra todos los conductores y vehículos de tu empresa desde un solo lugar.',
    },
    {
      icon: FiCheckCircle,
      title: 'Aprobación de documentos',
      desc: 'Revisa y aprueba la documentación de tus conductores de forma eficiente.',
    },
    {
      icon: FiBarChart2,
      title: 'Reportes financieros',
      desc: 'Monitorea comisiones, deudas y rendimiento de tus conductores.',
    },
    {
      icon: FiFileText,
      title: 'Perfil corporativo',
      desc: 'Mantén actualizada la información de tu empresa, datos bancarios y documentos.',
    },
    {
      icon: FiDollarSign,
      title: 'Comisiones configurables',
      desc: 'Sistema de comisiones por conductor con confirmaciones y cargos automatizados.',
    },
    {
      icon: FiSettings,
      title: 'Panel de control',
      desc: 'Accede a herramientas administrativas diseñadas para empresas de transporte.',
    },
  ],
};

export default function Features() {
  const [activeTab, setActiveTab] = useState('pasajero');
  const items = features[activeTab];

  return (
    <section className="features" id="features">
      <div className="section__header">
        <span className="section__badge">Características</span>
        <h2 className="section__title">Todo lo que necesitas en una sola app</h2>
        <p className="section__subtitle">
          Diseñada para pasajeros, conductores y empresas de transporte.
        </p>
      </div>

      <div className="features__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`features__tab ${activeTab === tab.key ? 'features__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="features__grid">
        {items.map((item, idx) => (
          <article key={`${activeTab}-${idx}`} className="feature-card">
            <div className="feature-card__icon">
              <item.icon size={24} />
            </div>
            <h3 className="feature-card__title">{item.title}</h3>
            <p className="feature-card__desc">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
