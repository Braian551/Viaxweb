import React from 'react';
import HowItWorks from '../components/HowItWorks';
import VehicleTypes from '../components/VehicleTypes';
import Safety from '../components/Safety';
import SeoMeta from '../components/SeoMeta';

export default function ClientesPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://viaxcol.online/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Clientes',
        item: 'https://viaxcol.online/clientes',
      },
    ],
  };

  return (
    <div className="page-shell">
      <SeoMeta
        title="Viajes para clientes"
        description="Solicita viajes en Moto, Carro, Mototaxi o Taxi. Revisa precio antes de confirmar y sigue tu ruta en tiempo real con Viax."
        path="/clientes"
        keywords="solicitar viaje, app clientes transporte, taxi en colombia, mototaxi"
        jsonLd={breadcrumbJsonLd}
      />
      <section className="page-hero">
        <span className="section__badge">Clientes</span>
        <h1 className="page-hero__title">Movilidad segura y transparente para tu día a día</h1>
        <p className="page-hero__subtitle">
          Solicita viajes con Moto, Carro, Mototaxi o Taxi, revisa tu tarifa antes de confirmar y sigue todo en tiempo real.
        </p>
      </section>
      <HowItWorks />
      <VehicleTypes />
      <Safety />
    </div>
  );
}
