import React from 'react';
import ForCompanies from '../components/ForCompanies';
import SeoMeta from '../components/SeoMeta';

export default function EmpresasPage() {
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
        name: 'Empresas',
        item: 'https://viaxcol.online/empresas',
      },
    ],
  };

  return (
    <div className="page-shell">
      <SeoMeta
        title="Solución para empresas de transporte"
        description="Gestiona flota, conductores, documentos, tarifas y reportes de tu empresa de transporte con la plataforma Viax."
        path="/empresas"
        keywords="software para empresas de transporte, gestión de flota, plataforma para conductores"
        jsonLd={breadcrumbJsonLd}
      />
      <section className="page-hero">
        <span className="section__badge">Empresas</span>
        <h1 className="page-hero__title">Gestiona tu operación de transporte en un solo lugar</h1>
        <p className="page-hero__subtitle">
          Administra conductores, verifica documentos, configura tarifas por tipo de vehículo y monitorea reportes financieros.
        </p>
      </section>
      <ForCompanies />
    </div>
  );
}
