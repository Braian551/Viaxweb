import React from 'react';
import SeoMeta from '../components/SeoMeta';

export default function EliminarCuentaPage() {
  return (
    <div className="page-shell">
      <SeoMeta
        title="Eliminacion de Cuenta - Viax"
        description="Conoce como solicitar la eliminacion de tu cuenta en la app Viax, propiedad de VIAX TECHNOLOGY S.A.S., segun lineamientos de Google Play."
        path="/eliminar-cuenta"
        keywords="eliminacion de cuenta viax, borrar cuenta viax, google play account deletion"
      />

      <section className="account-deletion" id="eliminar-cuenta">
        <div className="section__header">
          <span className="section__badge">Google Play</span>
          <h1 className="section__title">Eliminacion de Cuenta - Viax</h1>
          <p className="section__subtitle">
            Esta pagina publica explica el proceso de eliminacion de cuenta para la app Viax,
            propiedad de VIAX TECHNOLOGY S.A.S., segun los requisitos de Google Play sobre
            eliminacion de cuentas.
          </p>
        </div>

        <div className="account-deletion__notice">
          No necesitas iniciar sesion para consultar esta informacion.
        </div>

        <div className="account-deletion__grid">
          <article className="account-deletion__card">
            <h2>1. Introduccion</h2>
            <p>
              Esta pagina permite a los usuarios conocer como eliminar su cuenta en Viax
              y entender el tratamiento de datos relacionado con este proceso.
            </p>
          </article>

          <article className="account-deletion__card">
            <h2>2. Como solicitar la eliminacion</h2>
            <ul>
              <li>
                Desde la aplicacion movil, ingresando a la seccion de configuracion y buscando
                la opcion <strong>Eliminar cuenta</strong>.
              </li>
              <li>
                Segun el rol, la opcion puede estar en configuracion general, zona de peligro
                o perfil/configuracion de empresa.
              </li>
              <li>
                Tambien puedes ubicarla con el buscador interno de configuracion escribiendo
                <strong> Eliminar cuenta</strong>.
              </li>
              <li>
                Enviando un correo a <a href="mailto:viaxoficialcol@gmail.com">viaxoficialcol@gmail.com</a>{' '}
                con el asunto <strong>"Eliminacion de cuenta"</strong>.
              </li>
            </ul>
          </article>

          <article className="account-deletion__card">
            <h2>3. Proceso de eliminacion</h2>
            <ul>
              <li>
                La cuenta sera desactivada una vez el usuario confirme la solicitud de
                eliminacion desde la aplicacion o por correo.
              </li>
              <li>Se puede solicitar validacion de identidad para proteger la cuenta.</li>
              <li>El proceso completo puede tardar hasta 15 dias habiles.</li>
              <li>
                Los usuarios tambien pueden solicitar la eliminacion total o parcial de sus datos
                personales sin necesidad de eliminar su cuenta, enviando una solicitud al correo
                de contacto.
              </li>
            </ul>
          </article>

          <article className="account-deletion__card">
            <h2>4. Datos que se eliminan</h2>
            <ul>
              <li>Nombre.</li>
              <li>Correo electronico.</li>
              <li>Numero de telefono.</li>
              <li>Datos de uso de la app.</li>
            </ul>
          </article>

          <article className="account-deletion__card">
            <h2>5. Datos que pueden conservarse</h2>
            <ul>
              <li>Registros de viajes.</li>
              <li>Informacion fiscal o contable requerida por ley.</li>
              <li>Datos necesarios para cumplir obligaciones legales en Colombia.</li>
            </ul>
          </article>

          <article className="account-deletion__card">
            <h2>6. Base legal</h2>
            <p>
              La retencion de ciertos datos se realiza conforme a la legislacion colombiana,
              incluyendo la Ley 1581 de 2012 y demas normas aplicables sobre proteccion de
              datos personales y obligaciones legales vigentes.
            </p>
          </article>

          <article className="account-deletion__card account-deletion__card--contact">
            <h2>7. Contacto</h2>
            <p>
              Si necesitas ayuda con la eliminacion de cuenta de Viax, escribe a:
            </p>
            <a href="mailto:viaxoficialcol@gmail.com" className="account-deletion__mail">
              viaxoficialcol@gmail.com
            </a>
          </article>
        </div>

        <p className="account-deletion__compliance-note">
          Esta pagina cumple con las politicas de eliminacion de cuentas de Google Play para
          aplicaciones que permiten la creacion de cuentas de usuario.
        </p>
      </section>
    </div>
  );
}
