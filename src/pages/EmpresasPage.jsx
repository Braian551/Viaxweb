import React from 'react';
import ForCompanies from '../components/ForCompanies';

export default function EmpresasPage() {
  return (
    <div className="page-shell">
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
