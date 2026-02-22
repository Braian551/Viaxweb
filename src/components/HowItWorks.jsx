import React from 'react';
import { FiUserPlus, FiSearch, FiDollarSign, FiNavigation } from 'react-icons/fi';

const steps = [
  {
    icon: FiUserPlus,
    number: '01',
    title: 'Crea tu cuenta',
    desc: 'Regístrate con Google o correo electrónico en segundos. Verificación rápida y segura.',
  },
  {
    icon: FiSearch,
    number: '02',
    title: 'Elige tu destino',
    desc: 'Busca tu destino, selecciona el tipo de vehículo y visualiza la ruta en el mapa.',
  },
  {
    icon: FiDollarSign,
    number: '03',
    title: 'Confirma el precio',
    desc: 'Revisa el desglose completo de la tarifa antes de solicitar. Sin sorpresas.',
  },
  {
    icon: FiNavigation,
    number: '04',
    title: 'Viaja tranquilo',
    desc: 'Sigue tu viaje en tiempo real. Conductores verificados y soporte disponible.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section__header">
        <span className="section__badge">Cómo funciona</span>
        <h2 className="section__title">En 4 simples pasos</h2>
        <p className="section__subtitle">
          Solicitar un viaje con Viax es rápido, seguro y transparente.
        </p>
      </div>

      <div className="steps">
        {steps.map((step, idx) => (
          <div key={idx} className="step">
            <div className="step__icon-wrap">
              <div className="step__number">{step.number}</div>
              <div className="step__icon">
                <step.icon size={28} />
              </div>
              {idx < steps.length - 1 && <div className="step__connector" />}
            </div>
            <h3 className="step__title">{step.title}</h3>
            <p className="step__desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
