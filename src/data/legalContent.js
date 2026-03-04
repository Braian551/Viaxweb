export const roleLabels = {
  cliente: 'Cliente',
  conductor: 'Conductor',
  empresa: 'Empresa',
  administrador: 'Administrador',
  servidor: 'Servidor/API',
};

const updateDate = '04 de marzo de 2026';

const legalFrameworkSection = {
  heading: 'Marco normativo colombiano aplicable',
  bullets: [
    'Constitución Política de Colombia, artículo 15 (intimidad, buen nombre y habeas data).',
    'Ley 1581 de 2012 y Decreto 1377 de 2013 para protección de datos personales.',
    'Ley 1266 de 2008 en lo que resulte aplicable a información financiera, comercial o crediticia.',
    'Ley 1480 de 2011 (Estatuto del Consumidor) para relaciones de consumo en canales digitales.',
    'Ley 527 de 1999 sobre mensajes de datos, comercio electrónico y equivalencia funcional.',
    'Normativa sectorial de transporte, tránsito y seguridad vial aplicable al territorio colombiano.',
  ],
};

const privacyRightsSection = {
  heading: 'Derechos del titular de datos (Habeas Data)',
  bullets: [
    'Conocer, actualizar y rectificar datos personales frente al responsable o encargado del tratamiento.',
    'Solicitar prueba de la autorización otorgada para el tratamiento, salvo excepciones legales.',
    'Ser informado, previa solicitud, sobre el uso que se ha dado a sus datos personales.',
    'Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones al régimen de protección de datos.',
    'Revocar la autorización y/o solicitar supresión del dato cuando no exista deber legal o contractual que impida eliminarlo.',
    'Acceder de forma gratuita a sus datos personales en los términos definidos por la regulación aplicable.',
  ],
};

const securitySection = {
  heading: 'Seguridad de la cuenta y controles de acceso',
  bullets: [
    'La plataforma puede solicitar verificación por correo electrónico para activar o recuperar acceso.',
    'Viax aplica controles de dispositivo confiable, detección de dispositivo nuevo y bloqueo temporal por intentos fallidos.',
    'El usuario es responsable de custodiar credenciales, códigos de verificación y equipos desde los que accede.',
    'El uso indebido, la suplantación o el acceso no autorizado pueden generar suspensión preventiva y reporte a autoridades.',
    'La plataforma mantiene trazas técnicas y de auditoría con fines de seguridad, prevención de fraude y cumplimiento.',
  ],
};

const geolocationSection = {
  heading: 'Geolocalización y datos de viaje',
  bullets: [
    'Para operar los servicios, Viax puede tratar coordenadas de origen, destino, ruta, distancia y tiempo estimado/real.',
    'La ubicación se usa para asignación operativa, seguridad, soporte, resolución de incidentes y evidencia transaccional.',
    'El usuario reconoce que la precisión de mapas, geocodificación y tráfico puede variar por terceros o condiciones externas.',
    'El uso de ubicación en segundo plano o en tiempo real depende del permiso otorgado en el dispositivo y puede revocarse.',
    'La revocatoria de permisos de ubicación puede limitar total o parcialmente funcionalidades esenciales de la plataforma.',
  ],
};

export const legalContent = {
  cliente: {
    terms: {
      title: 'Términos y Condiciones - Cliente',
      intro: 'Estos términos regulan el acceso y uso de Viax por parte de clientes que solicitan servicios de movilidad, logística o servicios relacionados en territorio colombiano.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Objeto del servicio y alcance de la plataforma',
          bullets: [
            'Viax actúa como plataforma tecnológica de intermediación que conecta clientes con conductores y/o empresas habilitadas.',
            'La disponibilidad del servicio depende de cobertura geográfica, oferta activa, conectividad y condiciones operativas.',
            'Los tiempos de llegada, ruta sugerida y duración estimada son valores de referencia y pueden cambiar en tiempo real.',
            'Viax podrá incorporar o retirar funcionalidades, tipos de servicio o zonas de operación sin afectar derechos adquiridos.',
            'El uso de la plataforma implica aceptación de estos términos y de la política de privacidad correspondiente al rol cliente.',
          ],
        },
        {
          heading: 'Registro, cuenta y veracidad de la información',
          bullets: [
            'El cliente debe registrar información real, completa y actualizada para operar de forma segura.',
            'El titular declara que el correo y/o número de contacto suministrados son de su uso y control legítimo.',
            'La cuenta es personal e intransferible; se prohíbe compartir credenciales con terceros.',
            'Viax podrá solicitar validaciones adicionales de identidad cuando detecte riesgo de fraude o suplantación.',
            'La inexactitud relevante de datos puede generar limitaciones temporales o terminación de la cuenta.',
          ],
        },
        securitySection,
        geolocationSection,
        {
          heading: 'Tarifas, cotizaciones, pagos y ajustes operativos',
          bullets: [
            'La cotización se calcula con variables como distancia, tiempo, tipo de vehículo, recargos y configuración vigente.',
            'Pueden existir recargos por franja horaria, condiciones de alta demanda, eventos especiales o variables de operación.',
            'El valor final puede diferir de la estimación inicial por cambios de ruta, tiempos de espera o novedades del servicio.',
            'Toda transacción puede quedar registrada para soporte, conciliación, auditoría y cumplimiento tributario/contable.',
            'Cuando aplique, los reembolsos o reversos se evaluarán conforme evidencia operativa y políticas internas de resolución.',
          ],
        },
        {
          heading: 'Conducta del usuario y restricciones',
          bullets: [
            'El cliente debe mantener trato respetuoso con conductores, personal de soporte y demás usuarios.',
            'Se prohíbe usar la app para fines ilícitos, fraude, suplantación, amenazas o actividades contrarias a la ley.',
            'La manipulación de precios, abuso de promociones o falsedad en reportes puede causar bloqueo de cuenta.',
            'El cliente debe cumplir normas de convivencia y seguridad durante la prestación del servicio.',
            'Viax podrá limitar o cerrar cuentas ante incumplimientos graves, preservando evidencias para investigación.',
          ],
        },
        {
          heading: 'Cancelaciones, soporte, PQR y limitación de responsabilidad',
          bullets: [
            'Las cancelaciones pueden generar condiciones o cargos según momento de cancelación y estado operativo del servicio.',
            'El cliente puede presentar solicitudes, quejas o reclamos por canales oficiales dispuestos por Viax.',
            'Viax implementa medidas razonables de continuidad, pero no garantiza operación ininterrumpida del servicio digital.',
            'Viax no responde por hechos atribuibles exclusivamente a terceros, fuerza mayor o fallas externas de conectividad.',
            'En todo caso, se aplicarán las normas colombianas imperativas de protección al consumidor y responsabilidad civil.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Política de Privacidad - Cliente',
      intro: 'Esta política describe cómo Viax recolecta, usa, almacena, comparte y protege datos personales de clientes conforme al régimen colombiano de protección de datos.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Datos personales que se recolectan',
          bullets: [
            'Datos de identificación y contacto: nombre, correo electrónico, teléfono y otros datos de perfil.',
            'Datos transaccionales: historial de solicitudes, estado de viajes, tiempos, valores y novedades operativas.',
            'Datos de ubicación: origen, destino, trazas de ruta y eventos relacionados con el servicio.',
            'Datos técnicos: identificadores de dispositivo, registros de acceso, direcciones IP, versión de aplicación y eventos de seguridad.',
            'Datos de interacción: comunicaciones con soporte, PQR, valoraciones y reportes de incidentes.',
          ],
        },
        {
          heading: 'Finalidades del tratamiento',
          bullets: [
            'Gestionar registro, autenticación, operación de servicios y administración de cuenta.',
            'Calcular cotizaciones, ejecutar asignación operativa y gestionar facturación/conciliación.',
            'Prevenir fraude, suplantación, accesos no autorizados y otros riesgos de seguridad.',
            'Atender solicitudes de soporte, PQR, controversias y requerimientos de autoridades competentes.',
            'Cumplir obligaciones legales, regulatorias, contractuales, contables y de auditoría.',
          ],
        },
        {
          heading: 'Compartición y transferencia de información',
          bullets: [
            'Se comparte información necesaria con conductores y/o empresas para ejecutar el servicio solicitado.',
            'Se podrá compartir información con proveedores tecnológicos que apoyan autenticación, mensajería, mapas o infraestructura.',
            'Toda transferencia nacional o internacional se realiza bajo medidas contractuales y de seguridad razonables.',
            'Viax podrá entregar información a autoridades judiciales o administrativas cuando exista deber legal.',
            'No se comercializan datos personales para fines incompatibles con los aquí informados.',
          ],
        },
        {
          heading: 'Conservación, seguridad y gestión del riesgo',
          bullets: [
            'Los datos se conservan por el tiempo necesario para la finalidad informada y plazos legales aplicables.',
            'Viax aplica controles administrativos, técnicos y organizacionales proporcionales al riesgo del tratamiento.',
            'Se implementan medidas de control de acceso, monitoreo de eventos y gestión de incidentes de seguridad.',
            'La supresión de datos podrá estar limitada por deberes legales de conservación o defensa ante reclamaciones.',
            'Ante incidentes relevantes, Viax podrá activar protocolos de contención, análisis y reporte conforme la normativa aplicable.',
          ],
        },
        privacyRightsSection,
        {
          heading: 'Canales de atención y vigencia de la política',
          bullets: [
            'Las consultas o reclamos sobre datos personales se atienden por canales oficiales de soporte de Viax.',
            'Viax podrá actualizar esta política por cambios regulatorios, tecnológicos u operativos.',
            'Las versiones vigentes se publicarán en el sitio web y/o aplicaciones oficiales.',
            'Cuando la modificación sea sustancial, se informará por medios razonables dentro de la plataforma.',
            'El uso continuado de la plataforma después de la actualización implica aceptación de la versión vigente.',
          ],
        },
      ],
    },
  },
  conductor: {
    terms: {
      title: 'Términos y Condiciones - Conductor',
      intro: 'Aplican a conductores que usan Viax para aceptar y ejecutar servicios, con deberes especiales de seguridad, documentación y cumplimiento regulatorio.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Vinculación, elegibilidad y documentación',
          bullets: [
            'El conductor debe aportar documentación personal, de licencia, vehículo y demás soportes exigidos por la operación.',
            'La activación está sujeta a verificación documental y validaciones de consistencia de la información.',
            'El conductor garantiza que los documentos cargados son auténticos, vigentes y corresponden a su identidad.',
            'Viax o la empresa vinculante pueden suspender la cuenta por documentos vencidos, inconsistentes o no verificables.',
            'La permanencia en la plataforma exige mantener documentación actualizada durante toda la relación operativa.',
          ],
        },
        {
          heading: 'Obligaciones operativas y de conducta',
          bullets: [
            'Gestionar disponibilidad, aceptación y ejecución de servicios con diligencia y trato respetuoso.',
            'Cumplir normas de tránsito, seguridad vial, requisitos de habilitación y protocolos de servicio.',
            'No realizar cobros no autorizados ni acuerdos por fuera de plataforma que afecten trazabilidad.',
            'Reportar incidentes, accidentes o novedades relevantes de forma inmediata por canales internos.',
            'Abstenerse de discriminar usuarios, incurrir en acoso o cualquier comportamiento contrario a la ley.',
          ],
        },
        securitySection,
        geolocationSection,
        {
          heading: 'Compensación económica, comisiones y conciliación',
          bullets: [
            'Las reglas de liquidación, comisiones, deducciones y periodicidad se informan en la configuración vigente.',
            'La asignación de viajes y la generación de ingresos dependen de demanda, desempeño y disponibilidad.',
            'Viax podrá retener temporalmente valores ante disputas, señales de fraude o requerimiento de verificación.',
            'Toda reclamación económica debe presentarse con evidencia mínima y dentro de los plazos definidos por operación.',
            'Los reportes financieros de la cuenta prevalecen como base de conciliación, salvo prueba técnica en contrario.',
          ],
        },
        {
          heading: 'Suspensión, terminación y medidas disciplinarias',
          bullets: [
            'El incumplimiento de obligaciones operativas o de seguridad puede generar suspensión temporal o terminación definitiva.',
            'También procede suspensión por inactividad prolongada, baja calidad reiterada o incumplimiento documental.',
            'Las decisiones pueden apoyarse en auditorías internas, reportes de usuarios y validaciones técnicas.',
            'La terminación no exime obligaciones económicas o legales pendientes entre las partes.',
            'Viax conserva la evidencia relevante para defensa jurídica y cooperación con autoridades competentes.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Política de Privacidad - Conductor',
      intro: 'Regula el tratamiento de datos personales y operativos del conductor, incluyendo datos sensibles y documentación asociada a la prestación del servicio.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Datos tratados del conductor',
          bullets: [
            'Datos de identificación y contacto del conductor titular de la cuenta.',
            'Datos del vehículo y documentación de habilitación, licencias, seguros y soportes anexos.',
            'Datos operativos: estado en línea, aceptación/rechazo de servicios, rutas, tiempos y métricas de desempeño.',
            'Datos de seguridad y acceso: identificadores de dispositivo, eventos de autenticación y registros de riesgo.',
            'Datos de soporte y cumplimiento: comunicaciones, controversias, incidentes y reportes de auditoría.',
          ],
        },
        {
          heading: 'Finalidades específicas',
          bullets: [
            'Validar identidad, documentación y elegibilidad operativa del conductor dentro de la plataforma.',
            'Gestionar asignación de servicios, trazabilidad y calidad de la experiencia del usuario.',
            'Calcular ingresos, comisiones, conciliaciones y soportes financieros correspondientes.',
            'Prevenir fraude, suplantación y uso indebido de cuentas o documentos.',
            'Atender requerimientos regulatorios, judiciales o administrativos aplicables al sector.',
          ],
        },
        {
          heading: 'Tratamiento de información documental y evidencia',
          bullets: [
            'Los documentos cargados pueden ser sometidos a revisión automática y/o validación humana.',
            'La información documental puede conservarse por plazos legales de auditoría o defensa jurídica.',
            'El conductor autoriza verificaciones de consistencia entre datos declarados y documentos aportados.',
            'En caso de inconsistencias relevantes, Viax podrá restringir funcionalidades hasta aclaración.',
            'La evidencia técnica y documental puede usarse para resolver disputas o incidentes de seguridad.',
          ],
        },
        {
          heading: 'Compartición y acceso restringido',
          bullets: [
            'La información se comparte bajo necesidad operativa con empresas vinculadas o áreas internas autorizadas.',
            'Los proveedores tecnológicos acceden únicamente a datos necesarios para cumplir su función contractual.',
            'No se permite el acceso indiscriminado a expedientes; se aplican principios de minimización y necesidad.',
            'La información podrá reportarse a autoridades competentes en cumplimiento de deber legal.',
            'Toda transferencia se realiza bajo medidas razonables de confidencialidad y seguridad.',
          ],
        },
        privacyRightsSection,
      ],
    },
  },
  empresa: {
    terms: {
      title: 'Términos y Condiciones - Empresa',
      intro: 'Aplican a empresas que administran operación, conductores y componentes financieros dentro del ecosistema Viax.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Naturaleza de la cuenta empresa y representación',
          bullets: [
            'La cuenta empresa debe ser creada por representante autorizado o persona con delegación suficiente.',
            'La empresa responde por el uso de usuarios internos habilitados en su panel y por sus actuaciones.',
            'La información societaria, tributaria y de contacto debe mantenerse actualizada y verificable.',
            'Viax puede solicitar soportes adicionales para validar representación y prevenir suplantación corporativa.',
            'La inexactitud sustancial de la información puede causar suspensión o terminación de la cuenta empresa.',
          ],
        },
        {
          heading: 'Gestión de conductores y operación asociada',
          bullets: [
            'La empresa gestiona procesos de vinculación, seguimiento y control de conductores en su alcance contractual.',
            'Debe verificar y mantener documentación vigente de su personal operativo cuando aplique.',
            'La empresa se compromete a no habilitar perfiles que incumplan requisitos legales o de seguridad.',
            'Viax podrá imponer controles adicionales ante incidentes, reclamaciones reiteradas o señales de riesgo.',
            'La empresa debe colaborar en investigaciones internas y en requerimientos de autoridades competentes.',
          ],
        },
        {
          heading: 'Condiciones económicas, comisiones y facturación',
          bullets: [
            'Las condiciones económicas entre Viax y la empresa se rigen por la configuración vigente y acuerdos comerciales.',
            'La plataforma puede generar reportes de liquidación, comisiones, cargos y ajustes de operación.',
            'La empresa acepta procesos de conciliación soportados en registros transaccionales y de auditoría.',
            'Los desacuerdos económicos deberán presentarse dentro de términos razonables y con evidencia verificable.',
            'El incumplimiento reiterado de obligaciones económicas puede generar limitación funcional o suspensión.',
          ],
        },
        securitySection,
        {
          heading: 'Confidencialidad, propiedad intelectual y uso de la plataforma',
          bullets: [
            'La empresa se obliga a mantener reserva sobre información técnica, comercial y operativa conocida por el servicio.',
            'No podrá copiar, descompilar, revender ni explotar indebidamente funcionalidades de Viax.',
            'Las marcas, interfaces, código y contenidos de Viax están protegidos por régimen de propiedad intelectual.',
            'Todo uso debe orientarse a finalidades legítimas de operación y gestión empresarial autorizada.',
            'El incumplimiento de estas obligaciones puede generar acciones contractuales y legales correspondientes.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Política de Privacidad - Empresa',
      intro: 'Regula el tratamiento de datos corporativos, personales de representantes y datos operativos/financieros vinculados a cuentas empresa.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Datos recolectados para cuentas empresa',
          bullets: [
            'Datos corporativos: razón social, NIT, dirección, contactos y documentos de soporte empresarial.',
            'Datos de representantes, administradores y usuarios autorizados del panel empresa.',
            'Datos operativos: conductores vinculados, estados de validación, métricas de servicio y novedades.',
            'Datos financieros y de conciliación derivados de la operación y liquidación de servicios.',
            'Registros técnicos y de auditoría de accesos y acciones administrativas en la plataforma.',
          ],
        },
        {
          heading: 'Finalidades de tratamiento',
          bullets: [
            'Gestionar la relación comercial y contractual entre Viax y la empresa usuaria.',
            'Habilitar funcionalidades de administración de operación, conductores y seguimiento de desempeño.',
            'Ejecutar procesos de facturación, conciliación, soporte y atención de controversias.',
            'Prevenir riesgos de fraude, acceso indebido, suplantación y uso no autorizado del panel.',
            'Cumplir obligaciones legales, tributarias, contables y de cooperación con autoridades.',
          ],
        },
        {
          heading: 'Compartición, transmisión y deberes de corresponsabilidad',
          bullets: [
            'Viax y la empresa pueden actuar como responsables independientes o corresponsables según el flujo de datos.',
            'Cada parte debe implementar medidas razonables de seguridad para los datos bajo su control.',
            'La compartición con proveedores tecnológicos se limita a finalidades operativas y contractuales.',
            'La empresa debe informar y obtener autorizaciones cuando la ley así lo exija respecto de su personal.',
            'La entrega de información a autoridades se realizará en los casos previstos por ley.',
          ],
        },
        {
          heading: 'Conservación y trazabilidad',
          bullets: [
            'Los registros empresariales y de operación se conservan por plazos compatibles con finalidades y deber legal.',
            'Los datos podrán mantenerse para auditorías, defensa judicial y cumplimiento de obligaciones contables.',
            'Al finalizar la relación contractual, se aplicarán políticas de bloqueo, supresión o anonimización según proceda.',
            'La eliminación total puede verse limitada por obligaciones legales de conservación documental.',
            'La trazabilidad de acciones administrativas puede mantenerse por seguridad y control interno.',
          ],
        },
        privacyRightsSection,
      ],
    },
  },
  administrador: {
    terms: {
      title: 'Términos y Condiciones - Administrador',
      intro: 'Aplican a perfiles administrativos con acceso a funciones sensibles de monitoreo, validación, auditoría y configuración de operación en Viax.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Alcance de privilegios y principio de necesidad',
          bullets: [
            'El acceso administrativo se otorga por rol y bajo el principio de mínimo privilegio.',
            'Toda acción administrativa debe responder a una finalidad legítima y verificable de operación o cumplimiento.',
            'Se prohíbe consultar o extraer información por curiosidad, interés personal o finalidades no autorizadas.',
            'Viax puede limitar funcionalidades administrativas por seguridad, auditoría o reasignación de funciones.',
            'El uso del panel presupone deber reforzado de confidencialidad y diligencia profesional.',
          ],
        },
        securitySection,
        {
          heading: 'Auditoría, trazabilidad y deber de reporte',
          bullets: [
            'Las acciones críticas del panel pueden quedar registradas en bitácoras de auditoría y seguridad.',
            'El administrador debe reportar incidentes, accesos sospechosos o anomalías operativas de forma inmediata.',
            'La omisión de reporte de incidentes graves puede constituir incumplimiento disciplinario.',
            'Los registros de auditoría pueden ser usados en investigaciones internas y procesos legales.',
            'Cualquier modificación de datos sensibles debe ser justificable, trazable y alineada con política interna.',
          ],
        },
        {
          heading: 'Prohibiciones y medidas frente a incumplimiento',
          bullets: [
            'Se prohíbe compartir credenciales, delegar sesiones abiertas o usar accesos de terceros.',
            'No está permitido alterar, ocultar o destruir evidencia operativa o registros administrativos.',
            'Está prohibida la divulgación no autorizada de información personal, comercial o técnica.',
            'Viax puede revocar accesos de forma inmediata ante riesgo de seguridad o incumplimiento.',
            'Las conductas ilícitas podrán ser informadas a autoridades competentes y generar acciones legales.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Política de Privacidad - Administrador',
      intro: 'Define el tratamiento de datos personales y metadatos asociados al desempeño de funciones administrativas en la plataforma Viax.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Datos tratados del administrador',
          bullets: [
            'Datos de identificación, contacto corporativo y credenciales de acceso.',
            'Metadatos de sesión, eventos de autenticación y controles de seguridad asociados.',
            'Registros de actividad en panel, incluyendo acciones sobre usuarios, conductores, empresas y finanzas.',
            'Evidencias de incidentes, observaciones de auditoría y actuaciones de cumplimiento.',
            'Historial de asignación de roles y cambios de permisos internos.',
          ],
        },
        {
          heading: 'Finalidades y base de legitimación',
          bullets: [
            'Administrar el acceso seguro a herramientas críticas de operación y control.',
            'Cumplir estándares de auditoría interna, seguridad de la información y gobierno corporativo.',
            'Investigar eventos de riesgo, fraude o incumplimiento en el ecosistema Viax.',
            'Atender requerimientos regulatorios y obligaciones de cooperación con autoridades.',
            'Preservar trazabilidad y evidencia para defensa jurídica de la organización.',
          ],
        },
        {
          heading: 'Conservación, confidencialidad y deber reforzado',
          bullets: [
            'Los registros de auditoría administrativa se conservan según necesidad operativa y obligaciones legales.',
            'El administrador tiene deber reforzado de reserva sobre toda información a la que acceda por su rol.',
            'El tratamiento indebido de datos personales puede generar consecuencias disciplinarias y legales.',
            'La plataforma aplica mecanismos de monitoreo y control sobre cuentas con privilegios elevados.',
            'Las actividades de alto riesgo pueden requerir validaciones adicionales y revisión por pares.',
          ],
        },
        privacyRightsSection,
      ],
    },
  },
  servidor: {
    terms: {
      title: 'Términos de Uso del Servidor/API - Viax',
      intro: 'Aplican al consumo técnico de servicios backend, integraciones y uso de infraestructura API de Viax por actores autorizados.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Uso permitido y autenticación técnica',
          bullets: [
            'El acceso a endpoints y recursos backend debe estar expresamente autorizado por Viax.',
            'Las credenciales técnicas, llaves o secretos son confidenciales y no pueden compartirse con terceros.',
            'Toda integración debe respetar límites de uso razonable, seguridad y disponibilidad del servicio.',
            'Está prohibido el scraping masivo, pruebas invasivas no autorizadas o cualquier intento de explotación.',
            'Viax puede restringir o revocar accesos API cuando detecte riesgo operacional o incumplimiento.',
          ],
        },
        {
          heading: 'Continuidad, cambios y versionamiento',
          bullets: [
            'Viax podrá modificar endpoints, estructuras de respuesta o reglas de integración por seguridad o evolución del servicio.',
            'Las integraciones deben prever manejo de errores, reintentos controlados y validación de respuestas.',
            'No se garantiza disponibilidad absoluta ni ausencia de mantenimientos programados o contingencias.',
            'Los consumidores API deben implementar buenas prácticas de resiliencia y observabilidad técnica.',
            'Las dependencias de terceros usadas por la integración son responsabilidad del integrador externo.',
          ],
        },
        {
          heading: 'Responsabilidad y cumplimiento',
          bullets: [
            'El integrador responde por el uso que haga de los datos recibidos y por su propio cumplimiento normativo.',
            'Se exige cumplimiento de normas de seguridad de la información y protección de datos aplicables.',
            'El incumplimiento de políticas técnicas puede generar suspensión inmediata del acceso API.',
            'Viax puede conservar evidencia técnica de tráfico para auditoría, seguridad y defensa jurídica.',
            'Las controversias se resolverán conforme a la legislación colombiana y a los acuerdos aplicables.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Política de Privacidad - Servidor/API',
      intro: 'Describe el tratamiento de registros técnicos y metadatos asociados a infraestructura, seguridad y operación de APIs de Viax.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Datos técnicos recolectados',
          bullets: [
            'Direcciones IP, timestamps, rutas invocadas, códigos de estado y latencias de operación.',
            'Identificadores técnicos de cliente, entorno, sesión o dispositivo según configuración de seguridad.',
            'Registros de errores, eventos de autenticación y alertas de comportamiento anómalo.',
            'Evidencia de cambios de configuración, despliegues y actividades administrativas sobre infraestructura.',
            'Métricas de consumo para capacidad, rendimiento, estabilidad y prevención de abuso.',
          ],
        },
        {
          heading: 'Finalidades y retención de logs',
          bullets: [
            'Monitorear salud del servicio, diagnóstico de fallas y mejora continua de rendimiento.',
            'Detectar incidentes de ciberseguridad, intentos de intrusión y abuso de recursos.',
            'Cumplir deberes de trazabilidad, auditoría y requerimientos de autoridades competentes.',
            'Aplicar políticas de retención y depuración conforme necesidad técnica y obligaciones legales.',
            'Anonimizar o minimizar información cuando resulte procedente para fines estadísticos o analíticos.',
          ],
        },
        privacyRightsSection,
      ],
    },
  },
};
