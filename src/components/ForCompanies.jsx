import React from 'react';
import {
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiCheckCircle,
  FiSettings,
  FiFileText,
} from 'react-icons/fi';

const tools = [
  { icon: FiUsers, title: 'Conductores', subtitle: 'Flota', desc: 'Gestiona, aprueba o desvincula conductores de tu empresa.' },
  { icon: FiFileText, title: 'Documentos', subtitle: 'Verificar', desc: 'Revisa y verifica la documentación de cada conductor.' },
  { icon: FiDollarSign, title: 'Tarifas', subtitle: 'Precios', desc: 'Configura precios por tipo de vehículo y horario.' },
  { icon: FiSettings, title: 'Vehículos', subtitle: 'Tipos', desc: 'Administra los tipos de vehículo habilitados en tu flota.' },
  { icon: FiBarChart2, title: 'Reportes', subtitle: 'Estadísticas', desc: 'Analiza el rendimiento de tu empresa con datos en tiempo real.' },
  { icon: FiCheckCircle, title: 'Comisiones', subtitle: 'Pagos', desc: 'Controla deudas, liquidaciones y pagos de conductores.' },
];

export default function ForCompanies() {
  return (
    <section className="companies" id="companies">
      <div className="section__header">
        <span className="section__badge">Para empresas</span>
        <h2 className="section__title">Tu empresa de transporte, digitalizada</h2>
        <p className="section__subtitle">
          Panel completo para gestionar tu flota de conductores, tarifas, documentos
          y finanzas desde un solo lugar.
        </p>
      </div>

      <div className="companies__layout">
        <div className="companies__dashboard">
          {/* Mini dashboard mockup */}
          <div className="companies__dash-header">
            <div className="companies__dash-brand">
              <div className="companies__dash-avatar" />
              <div>
                <div className="companies__dash-name">Tu Empresa S.A.S</div>
                <div className="companies__dash-sub">Panel de control</div>
              </div>
            </div>
          </div>
          <div className="companies__dash-stats">
            <div className="companies__dash-stat">
              <span className="companies__dash-stat-value">24</span>
              <span className="companies__dash-stat-label">Viajes hoy</span>
            </div>
            <div className="companies__dash-stat">
              <span className="companies__dash-stat-value">12</span>
              <span className="companies__dash-stat-label">Conductores</span>
            </div>
            <div className="companies__dash-stat">
              <span className="companies__dash-stat-value">$340K</span>
              <span className="companies__dash-stat-label">Ganancias</span>
            </div>
          </div>
          <div className="companies__dash-tools">
            {tools.map((tool, idx) => (
              <div key={idx} className="companies__dash-tool">
                <div className="companies__dash-tool-icon">
                  <tool.icon size={18} />
                </div>
                <div>
                  <span className="companies__dash-tool-title">{tool.title}</span>
                  <span className="companies__dash-tool-sub">{tool.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="companies__info">
          <h3>Todo lo que necesitas para operar</h3>
          <div className="companies__features">
            {tools.map((tool, idx) => (
              <div key={idx} className="companies__feature">
                <div className="companies__feature-icon">
                  <tool.icon size={20} />
                </div>
                <div>
                  <h4>{tool.title}</h4>
                  <p>{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <a href="#" className="btn btn--primary btn--lg">
            Registrar mi empresa
          </a>
        </div>
      </div>
    </section>
  );
}
