import React from 'react';
import ForDrivers from '../components/ForDrivers';
import SeoMeta from '../components/SeoMeta';

export default function ConductoresPage() {
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
        name: 'Conductores',
        item: 'https://viaxcol.online/conductores',
      },
    ],
  };

  return (
    <div className="page-shell">
      <SeoMeta
        title="Plataforma para conductores"
        description="Regístrate como conductor en Viax y gestiona viajes, ingresos, comisiones y documentación desde una sola app."
        path="/conductores"
        keywords="trabajar como conductor, app para conductores, generar ingresos con carro o moto"
        jsonLd={breadcrumbJsonLd}
      />
      <section className="page-hero">
        <span className="section__badge">Conductores</span>
        <h1 className="page-hero__title">Más control, más viajes, más ingresos</h1>
        <p className="page-hero__subtitle">
          Opera con panel en tiempo real, gestión documental, control de comisiones y herramientas diseñadas para trabajar mejor.
        </p>
      </section>
      <ForDrivers />
    </div>
  );
}
