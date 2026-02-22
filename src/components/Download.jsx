import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { IoLogoGooglePlaystore, IoLogoApple } from 'react-icons/io5';

export default function Download() {
  return (
    <section className="download" id="download">
      <div className="download__inner">
        <div className="download__content">
          <span className="section__badge section__badge--light">Descarga la app</span>
          <h2 className="download__title">
            Comienza a viajar hoy
          </h2>
          <p className="download__subtitle">
            Descarga Viax y solicita tu primer viaje. Disponible para Android e iOS.
          </p>
          <div className="download__buttons">
            <a href="#" className="download__store-btn">
              <IoLogoGooglePlaystore size={24} />
              <div>
                <small>Próximamente en</small>
                <strong>Google Play</strong>
              </div>
            </a>
            <a href="#" className="download__store-btn">
              <IoLogoApple size={24} />
              <div>
                <small>Próximamente n</small>
                <strong>App Store</strong>
              </div>
            </a>
          </div>
        </div>
        <div className="download__visual">
          <div className="download__icon-float">
            <FiDownload size={64} />
          </div>
        </div>
      </div>
    </section>
  );
}
