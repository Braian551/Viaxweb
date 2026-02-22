import React from 'react';
import { FiMapPin, FiNavigation, FiShield, FiClock, FiStar, FiChevronRight, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__content">
        <div className="hero__badge">Disponible en Colombia</div>
        <h1 className="hero__title">
          Viaja fácil,<br />
          <span className="hero__title--accent">llega rápido.</span>
        </h1>
        <p className="hero__subtitle">
          Conectamos pasajeros con conductores verificados. Transporte seguro,
          transparente y confiable para tu día a día.
        </p>
        <div className="hero__actions">
          <Link to="/clientes" className="btn btn--primary btn--lg">
            Conoce más
            <FiNavigation size={16} />
          </Link>
          <Link to="/conductores" className="btn btn--outline btn--lg">
            Quiero ser conductor
          </Link>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-icon"><FiMapPin size={18} /></span>
            <div>
              <strong>4 tipos</strong>
              <span>de vehículo</span>
            </div>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-icon"><FiShield size={18} /></span>
            <div>
              <strong>100%</strong>
              <span>verificados</span>
            </div>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-icon"><FiNavigation size={18} /></span>
            <div>
              <strong>Tiempo real</strong>
              <span>seguimiento GPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Mockup — Trip Preview Screen */}
      <div className="hero__visual">
        <div className="hero__phone">
          <div className="hero__phone-screen">
            {/* Status bar */}
            <div className="phone-statusbar">
              <span className="phone-statusbar__time">9:41</span>
              <div className="phone-statusbar__notch" />
              <div className="phone-statusbar__icons">
                <span className="phone-statusbar__dot" />
                <span className="phone-statusbar__dot" />
                <span className="phone-statusbar__dot" />
              </div>
            </div>

            {/* App bar */}
            <div className="phone-appbar">
              <div className="phone-appbar__left">
                <img src="/logo.png" alt="" className="phone-appbar__logo" />
                <div>
                  <div className="phone-appbar__greeting">Hola, Braian</div>
                  <div className="phone-appbar__sub">Viax Technology</div>
                </div>
              </div>
              <div className="phone-appbar__bell">
                <FiMapPin size={13} />
              </div>
            </div>

            {/* Map area */}
            <div className="phone-map">
              {/* Map grid pattern */}
              <div className="phone-map__grid" />

              {/* Origin marker */}
              <div className="phone-map__origin">
                <div className="phone-map__origin-dot" />
                <div className="phone-map__origin-pulse" />
              </div>

              {/* Route line */}
              <div className="phone-map__route" />

              {/* Destination marker */}
              <div className="phone-map__dest" />
            </div>

            {/* Bottom sheet — "Elige tu viaje" */}
            <div className="phone-sheet">
              <div className="phone-sheet__handle" />

              <div className="phone-sheet__header">
                <span className="phone-sheet__title">Elige tu viaje</span>
              </div>

              {/* Route info */}
              <div className="phone-sheet__route">
                <div className="phone-sheet__route-dots">
                  <div className="phone-sheet__dot phone-sheet__dot--blue" />
                  <div className="phone-sheet__dot-line" />
                  <div className="phone-sheet__dot phone-sheet__dot--green" />
                </div>
                <div className="phone-sheet__route-info">
                  <div className="phone-sheet__route-row">
                    <span className="phone-sheet__route-label">Origen</span>
                    <span className="phone-sheet__route-text">Centro Comercial</span>
                  </div>
                  <div className="phone-sheet__route-row">
                    <span className="phone-sheet__route-label">Destino</span>
                    <span className="phone-sheet__route-text">Aeropuerto</span>
                  </div>
                </div>
              </div>

              {/* Vehicle selector */}
              <div className="phone-sheet__vehicles">
                <div className="phone-sheet__vehicle">
                  <img src="/vehicles/moto3d.png" alt="" />
                  <span>Moto</span>
                </div>
                <div className="phone-sheet__vehicle phone-sheet__vehicle--active">
                  <img src="/vehicles/auto3d.png" alt="" />
                  <span>Carro</span>
                </div>
                <div className="phone-sheet__vehicle">
                  <img src="/vehicles/mototaxi3d.png" alt="" />
                  <span>Mototaxi</span>
                </div>
                <div className="phone-sheet__vehicle">
                  <img src="/vehicles/taxi3d.png" alt="" />
                  <span>Taxi</span>
                </div>
              </div>

              {/* Price & details */}
              <div className="phone-sheet__details">
                <div className="phone-sheet__price-row">
                  <div>
                    <div className="phone-sheet__price">$12.500</div>
                    <div className="phone-sheet__price-sub">
                      <FiClock size={10} /> 15 min &middot; 8.2 km
                    </div>
                  </div>
                  <div className="phone-sheet__rating">
                    <FiStar size={11} />
                    <span> 4.8</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="phone-sheet__cta" type="button">
                Solicitar viaje
                <FiChevronRight size={16} />
              </button>

              {/* Bottom nav */}
              <div className="phone-nav">
                <div className="phone-nav__item phone-nav__item--active">
                  <FiMapPin size={16} />
                  <span>Inicio</span>
                </div>
                <div className="phone-nav__item">
                  <FiClock size={16} />
                  <span>Viajes</span>
                </div>
                <div className="phone-nav__item">
                  <FiUser size={16} />
                  <span>Perfil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero__glow" />
      </div>
    </section>
  );
}
