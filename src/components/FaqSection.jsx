import React from 'react';

const faqs = [
  {
    question: '¿Cómo solicito un viaje en Viax?',
    answer: 'Ingresa origen y destino, elige tipo de vehículo (Moto, Carro, Mototaxi o Taxi), revisa la tarifa y confirma el viaje.',
  },
  {
    question: '¿Qué tipos de vehículo están disponibles?',
    answer: 'Viax ofrece Moto, Carro, Mototaxi y Taxi según disponibilidad operativa en tu zona.',
  },
  {
    question: '¿Cómo me registro como conductor?',
    answer: 'Desde la sección Conductores puedes iniciar el proceso, cargar documentación y completar la validación para activación.',
  },
  {
    question: '¿Viax tiene solución para empresas de transporte?',
    answer: 'Sí. Las empresas pueden gestionar conductores, documentos, tarifas, comisiones y reportes desde un panel unificado.',
  },
  {
    question: '¿Cómo se calculan las tarifas?',
    answer: 'El precio considera tarifa base, distancia, tiempo y posibles recargos operativos según configuración vigente.',
  },
  {
    question: '¿Dónde consulto términos y privacidad?',
    answer: 'En la sección Legal puedes consultar términos y política de privacidad por rol: cliente, conductor, empresa, administrador o servidor.',
  },
];

export default function FaqSection() {
  return (
    <section className="faq" id="faq">
      <div className="section__header">
        <span className="section__badge">Preguntas frecuentes</span>
        <h2 className="section__title">Resolvemos tus dudas principales</h2>
        <p className="section__subtitle">
          Información clave para clientes, conductores y empresas antes de comenzar con Viax.
        </p>
      </div>

      <div className="faq__grid">
        {faqs.map((faq) => (
          <article key={faq.question} className="faq__item">
            <h3 className="faq__question">{faq.question}</h3>
            <p className="faq__answer">{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
