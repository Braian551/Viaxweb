export const roleLabels = {
  cliente: 'Cliente',
  conductor: 'Conductor',
  empresa: 'Empresa',
  administrador: 'Administrador',
  servidor: 'Servidor/API',
};

const updateDate = '19 de marzo de 2026';

// --- SECCIONES TRANSVERSALES: Resumen UX (Summary) + Legal (Bullets) ---

const intermediationDisclaimerSection = {
  heading: 'Nuestra función: Intermediación Tecnológica',
  summary: 'Viax es una plataforma tecnológica que conecta a usuarios con conductores (independientes o empresas). No prestamos el servicio de transporte directamente.',
  bullets: [
    'Naturaleza del servicio: Viax opera como una plataforma de intermediación tecnológica, facilitando el contacto mediante licenciamiento de software (Aplicaciones Móvil/Web).',
    'Límites de intermediación: Viax NO es una empresa proveedora de transporte público o privado, no posee flotas vehiculares y no está constituida legalmente como habilitadora de rutas en Colombia.',
    'Independencia: No existe relación laboral, de subordinación ni mandato exclusivo entre Viax y los conductores independientes o las empresas de transporte afiliadas.',
    'Relación material de servicio: El acuerdo sobre la prestación del traslado se perfecciona de manera autónoma y directa entre el cliente solicitante y el proveedor (conductor o empresa) que acepta el servicio.',
  ],
};

const legalFrameworkSection = {
  heading: 'Marco Normativo (Legislación Colombiana)',
  summary: 'Tus derechos están protegidos por las leyes colombianas de protección de datos, comercio electrónico y los derechos del consumidor.',
  bullets: [
    'Protección de Datos: Toda información personal se trata conforme al Artículo 15 de la Constitución Nacional, la Ley 1581 de 2012 y el Decreto 1377 de 2013 (Habeas Data).',
    'Firma y Validez Electrónica: Según la Ley 527 de 1999 (Ley de Comercio Electrónico), las validaciones mediante OTP, el inicio de sesión y los registros de uso tienen plenos efectos legales como firma electrónica y equivalencia probatoria.',
    'Estatuto del Consumidor: Las interacciones de consumo dentro de la plataforma tecnológica se rigen bajo los parámetros fijados por la Ley 1480 de 2011 (Estatuto del Consumidor).',
  ],
};

const dataControllerSection = {
  heading: 'Responsable del Tratamiento y Privacidad',
  summary: 'Viax protege tu información y la utiliza exclusivamente para asegurar que la app funcione correctamente bajo tu autorización.',
  bullets: [
    'Viax actúa como el Responsable del Tratamiento de los datos personales ingresados en el ecosistema digital (app y web).',
    'Tratamos tu información con fundamento en tu consentimiento libre, expreso e informado, así como en la necesidad inherente de ejecutar el contrato de intermediación.',
    'De conformidad con la normatividad colombiana, no retendremos datos innecesarios a perpetuidad. La retención extendida operará de forma cifrada única y estrictamente ante requisitos legales contables (DIAN) o de fiscalización por autoridades competentes.',
  ],
};

const minorshipAndTransferSection = {
  heading: 'Uso por menores de edad y servidores internacionales',
  summary: 'Nuestra plataforma es solo para mayores de 18 años. Guardamos tu información en servidores globales muy seguros, como Firebase o Cloudflare.',
  bullets: [
    'Restricción de edad: El uso de la plataforma está restringido a mayores de edad. Viax no recauda conscientemente datos de niños, niñas o adolescentes (NNA). Ante la detección de perfiles infractores, estos se suprimirán inmediatamente.',
    'Infraestructura Tecnológica: Para asegurar el funcionamiento en tiempo real, Viax soporta sus bases de datos en proveedores tipo Cloud Computing ubicados fuera de Colombia (ej. Firebase, Google Cloud, Cloudflare R2).',
    'Transferencia Expresa: Al utilizar nuestros servicios, el usuario otorga autorización legal para efectuar la transferencia y transmisión transfronteriza de datos, respaldada bajo niveles de seguridad equivalentes o superiores a los de Colombia.',
  ],
};

const securityAndFraudSection = {
  heading: 'Seguridad, Identificación y Biometría',
  summary: 'Usamos procesos seguros (códigos OTP o verificación facial) para cuidar las cuentas. También registramos de dónde te conectas para prevenir fraudes.',
  bullets: [
    'Trazabilidad Técnica: Para mitigar incidentes de ciberseguridad o abuso en la plataforma, registramos automáticamente datos de conectividad como tu Dirección IP y el Identificador de Dispositivo (DeviceID/MAC).',
    'Evidencia Digital: Los informes técnicos (logs) de conexión proveídos por los servidores podrán emplearse como material de investigación o probatorio frente a intentos de suplantación, reclamaciones financieras o procesos ante autoridades lícitas.',
    'Biometría Autorizada: Cuando la ley o la seguridad operativa (ej. conductores) lo requieran, la plataforma utilizará reconocimiento facial en vivo o APIs biométricas (local_auth) exclusivamente con fines de homologación y validación transitoria frente al fraude, sin comercializar dichos escaneos.',
  ],
};

const privacyRightsSection = {
  heading: 'Tus Derechos como Titular (Habeas Data)',
  summary: 'Tienes el poder absoluto sobre tu información. Puedes pedirnos actualizarla o eliminarla cuando quieras sin costo alguno.',
  bullets: [
    'Gozas del derecho a conocer, actualizar y rectificar permanentemente tu información frente a registros inexactos o fraccionados directamente dentro de tu perfil de usuario.',
    'Puedes solicitar copia de la autorización que nos confiaste en tu proceso de registro.',
    'Puedes radicar Peticiones, Quejas o Reclamos (PQR) relacionados con tu privacidad en los canales de atención y correos de la app integrados (previo a escalar ante la Superintendencia de Industria y Comercio).',
  ],
};

// --- SECCIONES ESPECÍFICAS DE ELIMINACIÓN DE CUENTAS ---

const accountDeletionSectionsByRole = {
  cliente: {
    heading: 'Procedimiento Expreso de Eliminación de Cuenta',
    summary: 'Si decides irte, te pediremos un código por correo. Congelaremos tu cuenta 15 días por si cambias de idea. Luego, borraremos casi todo en el sistema.',
    bullets: [
      'Proceso nativo: Todo trámite de supresión de cuenta se inicia autogestionado dentro de las configuraciones de la aplicación y cursará previa validación de identidad (OTP).',
      'Margen de Retracto: La cuenta trasmutará a un estado transitorio "Pendiente de Eliminación" de 15 días calendario ininterrumpidos. Iniciar sesión dentro de este plazo reversará y abortará legalmente la solicitud en curso.',
      'Supresión efectiva: Terminado el plazo legal de retracto, toda Identificación de Información Personal (PII) será purificada y se volverá genéricamente anónima de forma irreversible.',
      'Retención Residual Contractual: Viax retendrá en servidores offline, separadamente temporal y por el periodo de prescripción ordinario, solo los logs y montos financieros estipulados por mandato de auditoría tributaria colombiana (Estatuto Tributario Nacional).',
    ],
  },
  conductor: {
    heading: 'Cancelación Operativa de Identidad de Conductor',
    summary: 'Puedes terminar nuestro acuerdo desde la app. Después de los 15 días de margen, no mantendremos tus fotos, pero conservaremos reportes viales por normativas aduaneras o de tránsito.',
    bullets: [
      'Tramitología: La desconexión del módulo conductor implica autenticación revalidada y un "soft-delete" programado de 15 días continuos de congelamiento, cancelando proyecciones de viaje futuras.',
      'Plazo Reversible: Hasta antes del vencimiento, el titular goza de plenas facultades para revocar la instrucción reinstalando los aplicativos e iniciando procesos de sesión biométrica afirmativos.',
      'Supresión: Los registros vehiculares y documentos RUNT caducados serán suprimidos conforme a las disposiciones constitucionales de la Ley 1581 sobre purga al cumplimiento de la necesidad.',
      'Retención por Obligaciones de Transporte y Hacienda: Excepcionalmente, los viajes transados y los saldos bancarios reportados permanecerán retenidos pasivamente a modo de archivo muerto para fungir como evidencia defensiva (SuperTransporte/DIAN) durante el tiempo que la legislación colombiana imponga caducidad.',
    ],
  },
  empresa: {
    heading: 'Desvinculación del Módulo Corporativo',
    summary: 'Una empresa puede disolver el acceso de todo su municipio. Habrá 15 días de preaviso logístico. Finalizado esto, desconectaremos todos los carros afiliados.',
    bullets: [
      'El panel y atributos empresariales (Máster) son revocables elevando la PQR tecnológica desde un usuario administrador matriculado.',
      'Aplica una franja precautoria de 15 días estándar previniendo una contingencia (Cyberattack, Extorsiones Corporativas); cesando tras ese margen cualquier vínculo o enrutamiento activo sobre las flotillas que tenga censadas el NIT empresarial de referencia.',
      'La supresión del NIT es inexorable; no obstante los balances brutos pendientes o conciliados superviven a manera de extracto inmutable con fines de sustanciación contable corporativa nacional (Libros, IVA, Renta).',
    ],
  },
};

// --- POLÍTICAS Y ACUERDOS ENSAMBLADOS (POR ROL) ---

export const legalContent = {
  cliente: {
    terms: {
      title: 'Términos y Condiciones - Intermediación a Usuarios',
      intro: 'Estos términos rigen el uso de nuestra tecnología. Entiende este documento legal como tu manual de convivencia y derechos que posees como usuario de la app Viax en Colombia.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        intermediationDisclaimerSection,
        legalFrameworkSection,
        {
          heading: 'Exoneración delimitada a la naturaleza del servicio',
          summary: 'La app facilita el contacto. Pero durante el camino, el responsable legal por golpes u accidentes es el conductor y su seguro obligatorio (SOAT), no la aplicación tecnológica.',
          bullets: [
            'Siendo Viax un conducto puramente ecosistémico en la nube, los riesgos inherentes, culpas materiales, físicas, viales o siniestrales surgidos adentro del automotor recaen legalmente sobre el proveedor físico y los seguros obligatorios correspondientes (SOAT / Pólizas RC Vehiculares).',
            'La compañía aboga por la seguridad aplicando barreras tecnológicas de expulsión a conductores o vehículos que incumplan calificaciones estándar, pero como intermediario puro no puede constituirse civil ni solidariamente responsable extracontractual por los hechos de proveedores independientes o aseguradoras de empresas afiliadas.',
            'Sin perjuicio de lo expuesto, de acaecer incidencias de consumo dentro del ámbito tecnológico (ej. cobros debitados erróneamente en pasarelas), la PQR frente a Viax sí surtirá acompañamiento de reembolso basado plenamente en las trazas de bitácora electrónica levantadas sobre ese cargo digital.',
          ],
        },
        {
          heading: 'Responsabilidades recíprocas del cliente',
          summary: 'Tú eres responsable de dar un buen trato al conductor, cumplir con los pagos que programes y no enviar paquetes o elementos fuera de la ley colombiana.',
          bullets: [
            'Proporcionarás intencionalmente información cierta para la construcción tarifaria del aplicativo o de cara al registro.',
            'Se rechazan enérgicamente todas las intenciones de utilizar al ente provisto en red P2P (Conductor) para movilizar mercancía de contrabando, armas u objetos prohibidos por el Estado Constitucional de Derecho Colombiano (Ley 599 de 2000).',
            'Comportamientos consistentes en malos tratos al operario, el cancelamiento recurrente y frívolo, o los rehusamientos crónicos de pago transaccional comprobados, originarán la restricción tecnológica de acceso al ecosistema.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Política de Privacidad y Captura - Clientes',
      intro: 'El acceso eficiente al mapa de Viax demanda un consumo de tus datos espaciales. Aquí validamos hasta qué punto y por qué recolectamos esos puntos en tu celular.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        dataControllerSection,
        minorshipAndTransferSection,
        {
          heading: 'Tratamiento de coordenadas geográficas en Primer Plano',
          summary: 'Activamos tu GPS solo cuando estás buscando viaje o dentro del carro. Sin esta función no sabríamos dónde debemos enviarte al conductor.',
          bullets: [
            'Obtención de Ubicación Activa: La App Viax recopila de ti (cliente civil) variables in-situ temporales sobre latitud y longitud. Este acceso se produce de manera activa únicamente y mientras mantengas la solicitud viva abierta en la interfaz digital.',
            'Funcionalidad Lógica: El recaudo es fundamental para procrear trazos tarifarios, estimaciones precisas de distancia contra el tráfico en tiempo real y poder acoplar el ID más cercano del conductor prestatario del municipio pertinente.',
            'Mitigación Operacional: Si decides revocar el permiso GPS en tu dispositivo, la app Viax no surtirá un bloqueo punitivo; simplemente no logrará materializar la asignación correcta al faltar el dato estructurante primario para localizarte físicamente.',
          ],
        },
        securityAndFraudSection,
        privacyRightsSection,
      ],
    },
  },
  conductor: {
    terms: {
      title: 'Términos y Condiciones para Oferentes - Operador/Conductor',
      intro: 'Aviso legal dirigido a proveedores independientes o flotas empresariales que utilizan nuestra arquitectura tecnológica para ofertar y recibir solicitudes de servicio.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        intermediationDisclaimerSection,
        legalFrameworkSection,
        {
          heading: 'Modelos de adhesión, capacidad jurídica e idoneidad',
          summary: 'Deberás certificar bajo tu responsabilidad que tú y tu vehículo cumplen con todas las leyes de tránsito colombianas. Puedes ser independiente o afiliarte a una Empresa gestora.',
          bullets: [
            'Múltiples afiliaciones operativas: Viax permite dos modalidades operativas base: como actor independiente con vehículo propio, o como actor subordinado operativamente a un panel Empresa debidamente registrado en un municipio específico bajo sus lineamientos adicionales.',
            'Responsabilidad Personal Vehicular: El acto de aportar a los servidores originadores (ej. Cloudflare R2) de Tarjetas de Propiedad, Seguros Vigentes (SOAT) y Licencias ostenta peso de Declaración Juramentada sobre su vigencia y autenticidad plena. Presentar documentos falsos habilita a la plataforma a suspender todo vínculo e informar las discrepancias a las autoridades sectoriales y Fiscalía.',
            'Total Independencia de Tiempo: Ninguna directriz de Viax menoscaba la facultad del conductor para decidir sobre el tiempo, duración y forma de ejecutar recorridos; la no exigencia de cuotas temporales excluye cualquier presunción de subordinación laboral tipificada ante el Ministerio del Trabajo.',
          ],
        },
        {
          heading: 'Cargos de Intermediación Tecnológica (Comisiones y Tarifas)',
          summary: 'Cobramos nuestra tarifa tecnológica cada vez que la app te interconecta con un cliente exitosamente. Si deudas sobrepasan límites, la app no te mandará más viajes.',
          bullets: [
            'Liquidación del Servicio P2B: En estricto contraprestación económica por facilitarle la red electrónica de clientes y usar el algoritmo tarifario, la plataforma técnica retiene, líquida o comisiona porcentualmente los costos de conexión por trayecto aceptado de manera exitosa.',
            'Manejo de Cartera: La inacción morosa y la acumulación de saldos crediticios deudores en la aplicación faculta normativamente a Viax para aplicar bloqueos operacionales algorítmicos transitorios; es decir, suspendiendo la capacidad del aplicativo para notificarle viajes nuevos hasta la estabilización o depósito de la deuda de recargo.',
            'Naturaleza de Obligaciones Tributarias: Debido a que la compañía no asume roles de retenedor laboral sobre salarios ficticios, el conductor y/o su respectiva Empresa asumen la obligación inalienable de pagar el respectivo régimen de retenciones e impuestos directos sobre sus utilidades generadas originariamente por su mandato civil adscrito a ley.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Política Integral de Privacidad PII - Conductor',
      intro: 'Con el objetivo de salvaguardar tu ruta y mantenerte conectado operativamente a la base instalada, esta sección desglosa el uso permanente del tracking en tu cuenta.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        dataControllerSection,
        minorshipAndTransferSection,
        {
          heading: 'Ubicación en segundo plano (Background Location)',
          summary: 'Para que puedas recibir solicitudes de viaje en tiempo real, la app utiliza tu ubicación en segundo plano únicamente cuando te encuentras en modo disponible dentro de la plataforma.',
          bullets: [
            'Uso condicionado: La ubicación en segundo plano se activa exclusivamente cuando el conductor decide estar en estado "disponible" o "en línea" para recibir solicitudes.',
            'Función principal: Este acceso es necesario para el funcionamiento esencial de la app, permitiendo asignar viajes cercanos, calcular rutas en tiempo real y garantizar la operación del servicio.',
            'No uso fuera de servicio: La aplicación NO recopila ni rastrea tu ubicación en segundo plano cuando estás fuera de línea, desconectado o no disponible.',
            'Privacidad y limitación: Los datos de ubicación no se venden, no se utilizan para publicidad ni para fines externos al funcionamiento de la plataforma.',
            'Control del usuario: Puedes desactivar este permiso en cualquier momento desde la configuración de tu dispositivo, lo que impedirá recibir nuevas solicitudes mientras esté desactivado.',
          ],
        },
        securityAndFraudSection,
        privacyRightsSection,
      ],
    },
  },
  empresa: {
    terms: {
      title: 'Licenciamiento Máster Administrativo - Panel Empresa',
      intro: 'Estatutos exclusivos destinados para flotas, personas jurídicas y NITs colombianos consolidados que patrocinan una red de vehículos y operarios en la intermediadora.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        intermediationDisclaimerSection,
        legalFrameworkSection,
        {
          heading: 'Garante y Responsabilidad Solidaria Corporativa',
          summary: 'La Empresa inscrita responde integralmente ante las leyes por las revisiones mecánicas y los papeles de los conductores bajo su mando. Viax no responderá por fraude en perfiles sub-afiliados.',
          bullets: [
            'Dolo Documental Operativo: El representante de panel legalizado de la corporación Empresa ante nuestro sistema asume en primera instancia jurídica (ante leyes penales y de tránsito) la responsabilidad directa sobre la habilitación e idoneidad de los automotores que afilie bajo su terminal de supervisión (sus conductores delegados en municipio vía el backend Viax).',
            'Subsanación Solidaria Obligatoria: Es un deber legal indivisible de la Empresa titular solventar la cartera pasiva comisional adeudada. Esto implica sumir la mora técnica de conectividad acumulada operativamente por cada unidad móvil inscrita en su cuenta Máster y que no fuera cubierta individualmente por el conductor proveedor de servicio.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Política de Privacidad y Sensibilidad - Entidad Máster',
      intro: 'Al poseer información privada general de múltiples rutas e itinerarios, asumen mandatos éticos como sub-responsables jurídicos.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        dataControllerSection,
        {
          heading: 'Corresponsabilidad sobre la base "PII" visualizada',
          summary: 'En tu panel Empresa verás los nombres y viajes de decenas de personas todos los meses. Estrictamente tienes prohibido "bajarte" esta información o utilizarla para fines extra-plataforma como publicidad molesta o extorsión.',
          bullets: [
            'Elevación a Corresponsable Legal: Mientras el Máster Empresarial y sus sub-administradores accedan, procesen o visualicen métricas en el panel concernientes con Información Personal Identificable ("PII": Nombres, Recorridos, Frecuencias y Zonas) derivadas de los trayectos de sus afiliados operadores, obran y se enmarcan en estricto cumplimiento como Corresponsable Limitado solidario sobre la correcta custodia de los datos al tenor de la exigencias de la Ley 1581 de 2012 colombiana.',
            'Punição por Data Breach Comercial (Brechas de Seguridad): Configura falta y violación mayúscula el exportar lógicamente de manera masiva o tabular el acervo de registros de viajes PII con aspiraciones proscritas de telemarketing telefónico abusivo u operaciones sin consentimiento claro. Delitos provenientes por robo de claves del Master (brechas o ingenierías sociales en el municipio contra la empresa) forzarán acciones donde será reportado primigeniamente como causante de la vulnerabilidad ante la Superintendencia.',
          ],
        },
        securityAndFraudSection,
        privacyRightsSection,
      ],
    },
  },
  administrador: {
    terms: {
      title: 'Contrato Funcionario Tecnológico - Panel Backoffice (Admin)',
      intro: 'Las siguientes reglas dictan los protocolos de acceso de uso exclusivo de nuestros analistas in-house (operadores directos). Todo acceso queda supeditado al secreto mercantil.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Secreto de Tecnología y Retención Punitiva',
          summary: 'Como administrador corporativo posees acceso al motor de todo Viax. Usar esta información o divulgar nuestras métricas por cualquier otro fin, resultará en proceso laboral y penal en tu contra.',
          bullets: [
            'Protección a la Organización (No-disclosure Restrictivo): El contacto de validación por JSON Web Tokens en la base de datos central PostgreSQL, revisar estados contables nativos y el análisis de copias del R2 fotográficas se enmarca de factor en los delitos contra el Secreto Mercantil Empresarial y obliga solidaria, penal y procesalmente al trabajador validante bajo un NDA innegable.',
            'Incursión Proscrita en Endpoints: Extraer hojas de datos, robar mapeos relacionales, cloronar información algorítmica externa manipulada o descargar copias crudas para fines ajenos a los puramente laborales para los que fue concedido el permiso derivará en un escalamiento conforme al Artículo 269A del Código Penal local de Colombia referente a acceso abusivo a ecosistema informático.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Auditoría Cero Confianza del Perfil Analista',
      intro: 'Cualquier modificación o reintegro que programes dentro de nuestros sistemas es almacenado en un historial incorruptible de tu cuenta que nos permite desvendar los fraudes internos y auditar lo que miras.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        securityAndFraudSection,
        {
          heading: 'Inmutabilidad Técnica (Activity Logs Intocables)',
          summary: 'Monitoreamos a la par el Timestamp real. Necesitamos saber qué empleado, en qué momento exacto editó a favor, o desconectó malintencionadamente a un usuario per-to-per o los saldos en pantalla.',
          bullets: [
            'La estructura lógica del subdominio de administradores captura en logs de fecha inalterables y con obligatoriedad imperiosa cada HTTP Request (edit, delete, fetch de cuentas sensibles) amparada bajó el rastro de la JWT inyectada del usuario.',
            'Tal inmutabilidad es la regla primordial. Es insumo en disputas laborales o reclamaciones públicas externas utilizándose con total severidad en comités probatorios donde las acciones y negligencias del analista resulten juzgadas.',
          ],
        },
      ],
    },
  },
  servidor: {
    terms: {
      title: 'Reglas de Interoperabilidad - Agentes API y Trazabilidad Web',
      intro: 'Políticas sin concesión enfocadas a regular el comportamiento de bots o scripts integradores de pasarelas, entidades logísticas u originarios del tráfico web desatendido a nuestros domas.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        legalFrameworkSection,
        {
          heading: 'Mitigaciones Activas frente DANA/DDOS y Extracciones',
          summary: 'La saturación adrede es denegada implacablemente. Los bots abusivos chocarán contra nuestros Firewalls y serán excluidos silente y definidamente para preservar el equilibrio del ecosistema conectivo auténtico.',
          bullets: [
            'Rate Limiting Absoluto: Proscripción técnica ineludible. El bombardeo sistemático automatizado (Ej: scraping no validado de locaciones), repeticiones de enumeración y las cargas intempestivas que colapsen nuestras arquitecturas implicarán restricción WAF frontal sobre las redes y los rangos IPv4/IPv6 identificables involucrados al perpetrador bot asíncrono.',
            'Abdicación SLA Programática: Todas las API Endpoints y Webhooks de la solución se operarán bajo el postulado dogmático de provisión "As-Is". La compañía técnica se declara irremediablemente absuelta bajo preámbulo formal frente interrupciones de disponibilidad originando la negación absoluta ante exigencias jurídicas sobre reparación pecuniaria generada por promesas de SLA (Uptime del 99%) al decaer las peticiones del tercero externo.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Filtraje Firewall y Agnosticidad Temporal (Telemetría de Nodos)',
      intro: 'El tratamiento al que son sometidas las huellas digitales que dejan en el borde externo los ruteadores computacionales y sus programas iterativos en la nube.',
      meta: `Última actualización: ${updateDate}`,
      sections: [
        {
          heading: 'Anonimización de Peticiones y Desasociación Perimetral',
          summary: 'El motor no identifica individualmente a qué persona civil corresponden en Colombia los ruidos del bot. Recolecta huellas invisibles temporalizadas para banear conexiones tóxicas de Internet purificándolas.',
          bullets: [
            'La información interceptada pasivamente sobre la red perimetral TCP/IP (Logs, Tokens efímeros, telemetría Nginx, identificadores de navegadores) obedece al propósito de seguridad de ciberdefensa sin intenciones asimétricas identitarias lícitas. Operarán algorítmicamente y crípticamente asumiendo un estado general purgado que las transmuta a registros agnósticos temporales amparando directrices base PII locales y eximiendo consentimientos expresos al provenir de fuentes maliciosas anónimas disuadidas o redes abstractas automáticas.',
          ],
        },
      ],
    },
  },
};

const legalReinforcementSection = {
  heading: 'Nulidad Parcial, Separabilidad y Compromiso Final Vinculante',
  summary: 'Estas reglas son serias. Respetar la plataforma es un trato que aceptaste cuando enviaste tu código OTP de confirmación para unirte a esta comunidad libre.',
  bullets: [
    'Expresión de la Voluntad Digital Confirmada: Operacionalizando la norma y doctrina establecida en el Comercio Electrónico moderno, la sola acción del usuario de haber superado un doble factor numérico en Firebase, o haber cliqueado afirmativamente durante las actualizaciones en la GUI de la app, funge con el carácter de validez irrefutable que representa un repudio en contra, enmarcado dentro del aval tecnológico de la Ley 527 de 1999 nacional.',
    'Separabilidad Contractual Divisible (Severability Covenants): Al momento fortuito que a vista de autoridades jurisdiccionales se dictaminare nulo estrictamente alguno de los subenunciados expuestos en estos estamentos, ello no erosionará, anulará, o infectará de inoperancia a la sobrevivencia paralela lógica o estructura global del acuerdo con base informática y las remanentes obligaciones asumidas lícitamente inalteradas.',
    'Indemnidad Generalizada Final P2P: Reiterando que el contrato real, el perfeccionamiento legal y los trayectos se logran distantes del espectro binario de Viax; las comunidades viales y de provistas admiten someterse asumiendo exclusión formal pura de daños contra de nuestra entidad empresarial originaria limitando de primera voz reclamos donde se aduzca responsabilidad nuestra por eventualidades nacidas entre el viaje. Instaurándose adicionalmente el pacto arbitral o el requisito de procedimiento jurídico que estipula la conciliación y transaccion extrajudicial oficial obligatoria colombiana en derecho.',
  ],
};

['cliente', 'conductor', 'empresa', 'administrador', 'servidor'].forEach((roleKey) => {
  const role = legalContent[roleKey];
  if (!role) {
    return;
  }

  const deletionSection = accountDeletionSectionsByRole[roleKey];

  if (role.terms?.sections) {
    if (deletionSection && (roleKey === 'cliente' || roleKey === 'conductor' || roleKey === 'empresa')) {
      role.terms.sections.push(deletionSection);
    }
    role.terms.sections.push(legalReinforcementSection);
  }

  if (role.privacy?.sections) {
    if (deletionSection && (roleKey === 'cliente' || roleKey === 'conductor' || roleKey === 'empresa')) {
      role.privacy.sections.push(deletionSection);
    }
    role.privacy.sections.push(legalReinforcementSection);
  }
});
