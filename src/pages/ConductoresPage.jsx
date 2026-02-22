import React from 'react';
import ForDrivers from '../components/ForDrivers';

export default function ConductoresPage() {
  return (
    <div className="page-shell">
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
