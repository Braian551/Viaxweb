import React from 'react';
import { FiCheckCircle, FiDollarSign, FiClock, FiBarChart2 } from 'react-icons/fi';

const benefits = [
  {
    icon: FiClock,
    title: 'Horario flexible',
    desc: 'Tú decides cuándo y cuánto trabajar. Activa o desactiva tu disponibilidad en cualquier momento.',
  },
  {
    icon: FiDollarSign,
    title: 'Ganancias transparentes',
    desc: 'Panel completo con ingresos diarios, semanales y mensuales. Sin costos ocultos.',
  },
  {
    icon: FiBarChart2,
    title: 'Comisiones claras',
    desc: 'Conoce exactamente lo que pagas. Reportes de comisión y deuda siempre disponibles.',
  },
  {
    icon: FiCheckCircle,
    title: 'Proceso simple',
    desc: 'Registro rápido, sube tus documentos, espera verificación y comienza a generar ingresos.',
  },
];

export default function ForDrivers() {
  return (
    <section className="drivers" id="drivers">
      <div className="drivers__content">
        <div className="drivers__text">
          <span className="section__badge">Para conductores</span>
          <h2 className="section__title">Genera ingresos con tu vehículo</h2>
          <p className="section__subtitle">
            Únete a la red de conductores de Viax. Proceso de registro simple,
            herramientas potentes y ganancias transparentes.
          </p>

          <div className="drivers__benefits">
            {benefits.map((b, idx) => (
              <div key={idx} className="driver-benefit">
                <div className="driver-benefit__icon">
                  <b.icon size={20} />
                </div>
                <div>
                  <h4>{b.title}</h4>
                  <p>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="drivers__cta-card">
          <h3>Requisitos para registrarte</h3>
          <ul>
            <li>
              <FiCheckCircle size={16} />
              <span>Licencia de conducción vigente</span>
            </li>
            <li>
              <FiCheckCircle size={16} />
              <span>SOAT del vehículo al día</span>
            </li>
            <li>
              <FiCheckCircle size={16} />
              <span>Tarjeta de propiedad</span>
            </li>
            <li>
              <FiCheckCircle size={16} />
              <span>Documento de identidad</span>
            </li>
            <li>
              <FiCheckCircle size={16} />
              <span>Cuenta de correo electrónico</span>
            </li>
          </ul>
          <a href="#" className="btn btn--primary btn--lg btn--full">
            Registrarme como conductor
          </a>
        </div>
      </div>
    </section>
  );
}
