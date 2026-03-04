import React from 'react';
import { FiFileText, FiShield } from 'react-icons/fi';
import { legalContent, roleLabels } from '../data/legalContent';

export default function LegalView({ role, doc, onRoleChange, onDocChange }) {
  const roleData = legalContent[role] ?? legalContent.cliente;
  const selectedDoc = roleData[doc] ?? roleData.terms;
  const roleLabel = roleLabels[role] ?? roleLabels.cliente;

  return (
    <section className="legal" id="legal">
      <div className="section__header">
        <span className="section__badge">Legal</span>
        <h2 className="section__title">Documentos legales</h2>
        <p className="section__subtitle">
          Transparencia total. Consulta nuestros términos y políticas por rol de usuario.
        </p>
      </div>

      <div className="legal__controls">
        <div className="legal__doc-tabs">
          <button
            className={`legal__doc-tab ${doc === 'terms' ? 'legal__doc-tab--active' : ''}`}
            onClick={() => onDocChange('terms')}
            type="button"
          >
            <FiFileText size={16} />
            Términos
          </button>
          <button
            className={`legal__doc-tab ${doc === 'privacy' ? 'legal__doc-tab--active' : ''}`}
            onClick={() => onDocChange('privacy')}
            type="button"
          >
            <FiShield size={16} />
            Privacidad
          </button>
        </div>

        <select
          className="legal__role-select"
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
        >
          {Object.entries(roleLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="legal__header-card">
        <h3>{selectedDoc.title}</h3>
        <p>{selectedDoc.intro}</p>
        <div className="legal__meta-row">
          <span className="legal__meta-pill">Rol: {roleLabel}</span>
          {selectedDoc.meta && <span className="legal__meta-pill">{selectedDoc.meta}</span>}
        </div>
      </div>

      <div className="legal__notice">
        Este contenido tiene alcance informativo y contractual dentro de la plataforma. Para implementación formal de cumplimiento,
        se recomienda validación final con asesoría jurídica especializada en derecho digital y protección de datos en Colombia.
      </div>

      <div className="legal__grid">
        {selectedDoc.sections.map((section, idx) => (
          <article key={`${section.heading}-${idx}`} className="legal__card">
            <h4>
              <span className="legal__section-index">{idx + 1}.</span> {section.heading}
            </h4>
            {section.bullets && (
              <ul>
                {section.bullets.map((item, itemIdx) => (
                  <li key={itemIdx}>{item}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
