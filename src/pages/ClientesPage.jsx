import React from 'react';
import HowItWorks from '../components/HowItWorks';
import VehicleTypes from '../components/VehicleTypes';
import Safety from '../components/Safety';

export default function ClientesPage() {
  return (
    <div className="page-shell">
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
