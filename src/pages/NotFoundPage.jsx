import React from 'react';
import SeoMeta from '../components/SeoMeta';

export default function NotFoundPage() {
  return (
    <div className="page-shell">
      <SeoMeta
        title="Pagina no encontrada"
        description="La ruta solicitada no existe en Viax."
        path="/404"
        noindex
      />
      <section className="page-hero">
        <span className="section__badge">404</span>
        <h1 className="page-hero__title">Pagina no encontrada</h1>
        <p className="page-hero__subtitle">
          La URL solicitada no existe o fue movida. Revisa el enlace o vuelve al inicio.
        </p>
      </section>
    </div>
  );
}
