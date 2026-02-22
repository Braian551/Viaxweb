import React from 'react';
import { FiShield, FiSmartphone, FiUserCheck, FiLock, FiEye, FiAward } from 'react-icons/fi';

const safetyItems = [
  {
    icon: FiUserCheck,
    title: 'Conductores verificados',
    desc: 'Cada conductor pasa por un proceso de verificación documental: licencia, SOAT y datos del vehículo revisados por un administrador.',
  },
  {
    icon: FiAward,
    title: 'Sistema ConfianzaScore',
    desc: 'Algoritmo exclusivo que prioriza conductores favoritos basándose en historial, calificaciones, zona y frecuencia de uso.',
  },
  {
    icon: FiSmartphone,
    title: 'Seguridad de dispositivo',
    desc: 'Un solo dispositivo de confianza por cuenta. Cambios de dispositivo invalidan sesiones anteriores automáticamente.',
  },
  {
    icon: FiLock,
    title: 'Verificación por correo',
    desc: 'Códigos de 6 dígitos vía correo electrónico para verificar tu identidad. Sistema anti-fuerza bruta con bloqueo temporal.',
  },
  {
    icon: FiEye,
    title: 'Seguimiento en tiempo real',
    desc: 'GPS activo durante todo el viaje. Comparte tu ubicación con familiares para mayor tranquilidad.',
  },
  {
    icon: FiShield,
    title: 'Auditoría y trazabilidad',
    desc: 'Cada acción queda registrada. Sistema de logs de seguridad para proteger a todos los usuarios.',
  },
];

export default function Safety() {
  return (
    <section className="safety" id="safety">
      <div className="section__header">
        <span className="section__badge">Seguridad</span>
        <h2 className="section__title">Tu seguridad es nuestra prioridad</h2>
        <p className="section__subtitle">
          Múltiples capas de protección para que viajes con total tranquilidad.
        </p>
      </div>

      <div className="safety__grid">
        {safetyItems.map((item, idx) => (
          <div key={idx} className="safety-card">
            <div className="safety-card__icon">
              <item.icon size={24} />
            </div>
            <div className="safety-card__content">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
