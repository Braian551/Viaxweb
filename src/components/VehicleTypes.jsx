import React from 'react';

const vehicles = [
  {
    name: 'Moto',
    image: '/vehicles/moto3d.png',
    desc: 'Rápido y económico',
    tagline: 'Ágil en el tráfico, ideal para tu día a día.',
    features: ['1 pasajero', 'Rapidez en tráfico', 'Menor costo'],
  },
  {
    name: 'Carro',
    image: '/vehicles/auto3d.png',
    desc: 'Cómodo y seguro',
    tagline: 'Espacio, comodidad y seguridad para tu recorrido.',
    features: ['Hasta 4 pasajeros', 'Equipaje incluido', 'Aire acondicionado'],
  },
  {
    name: 'Mototaxi',
    image: '/vehicles/mototaxi3d.png',
    desc: 'Ideal para tu recorrido',
    tagline: 'Transporte versátil y económico para trayectos cortos.',
    features: ['4 pasajeros', 'Rutas directas', 'Precio competitivo'],
  },
  {
    name: 'Taxi',
    image: '/vehicles/taxi3d.png',
    desc: 'Tradicional y confiable',
    tagline: 'El servicio de siempre con la tecnología de Viax.',
    features: ['Hasta 5 pasajeros', 'Taxímetro digital', 'Conductores verificados'],
  },
];

export default function VehicleTypes() {
  return (
    <section className="vehicles" id="vehicles">
      <div className="section__header">
        <span className="section__badge">Vehículos</span>
        <h2 className="section__title">Elige tu tipo de transporte</h2>
        <p className="section__subtitle">
          Desde motos ágiles hasta taxis confiables, tenemos la opción ideal para ti.
        </p>
      </div>

      <div className="vehicles__grid">
        {vehicles.map((v, idx) => (
          <div key={idx} className="vehicle-card">
            <div className="vehicle-card__image">
              <img src={v.image} alt={v.name} />
            </div>
            <h3 className="vehicle-card__name">{v.name}</h3>
            <p className="vehicle-card__tagline">{v.desc}</p>
            <p className="vehicle-card__desc">{v.tagline}</p>
            <ul className="vehicle-card__features">
              {v.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
