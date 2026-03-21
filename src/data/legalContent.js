export const roleLabels = {
  cliente: 'Cliente',
  conductor: 'Conductor',
  empresa: 'Empresa',
  administrador: 'Administrador',
  servidor: 'Servidor/API',
};

const updateDate = '21 de marzo de 2026';

// 1. Intermediación
const intermediationSection = {
  heading: 'Nuestra Función: Intermediación Tecnológica',
  summary: 'Viax es una plataforma tecnológica que conecta a usuarios con conductores y empresas de transporte. No prestamos el servicio de transporte directamente.',
  bullets: [
    'Naturaleza: Viax opera exclusivamente como plataforma de intermediación tecnológica entre usuarios y prestadores del servicio de transporte.',
    'Alcance: No prestamos el servicio de transporte ni actuamos como empresa transportadora. La responsabilidad del transporte recae en el conductor y su empresa afiliada.',
    'Independencia: No existe relación laboral, societaria ni de subordinación entre Viax y los conductores, empresas o usuarios registrados.',
    'Responsabilidad: Viax actúa como intermediario tecnológico, sin perjuicio de las obligaciones legales que le correspondan como plataforma tecnológica conforme a la legislación colombiana, incluyendo las disposiciones aplicables de protección al consumidor y tratamiento de datos personales.',
  ],
};

// 1b. Identificación legal de la empresa
const companyIdentificationSection = {
  heading: 'Identificación de la Empresa',
  summary: 'Datos de identificación de la entidad responsable de la plataforma tecnológica Viax.',
  bullets: [
    'Razón social: VIAX TECHNOLOGY S.A.S.',
    'NIT: 902040253-1.',
    'País de constitución: República de Colombia.',
    'Contacto y canal oficial: viaxoficialcol@gmail.com. Este correo es el canal oficial para notificaciones, solicitudes legales, PQR y comunicaciones formales relacionadas con la plataforma.',
    'Publicación en tienda: La aplicación puede ser publicada en plataformas digitales a través de cuentas de desarrollador administradas por representantes autorizados, sin que ello afecte la titularidad de la plataforma, la cual pertenece exclusivamente a VIAX TECHNOLOGY S.A.S.',
  ],
};

// 2. Marco legal
const legalFrameworkSection = {
  heading: 'Marco Normativo',
  summary: 'Tus derechos están protegidos bajo las leyes colombianas vigentes sobre protección de datos, comercio electrónico y derechos del consumidor.',
  bullets: [
    'Datos Personales: Tratamos tu información conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.',
    'Validez electrónica: Las firmas electrónicas, códigos OTP y aceptaciones digitales tienen plena validez jurídica conforme a la Ley 527 de 1999.',
    'Consumidor: Se garantizan todos tus derechos como consumidor conforme a la Ley 1480 de 2011. Ninguna cláusula de estos términos limita tus derechos irrenunciables como consumidor.',
  ],
};

const dataControllerSection = {
  heading: 'Responsable del Tratamiento y Uso de Datos',
  summary: 'VIAX TECHNOLOGY S.A.S. (NIT 902040253-1) es el responsable del tratamiento de tus datos personales y los protege conforme a la ley colombiana. No comercializamos tu información.',
  bullets: [
    'VIAX TECHNOLOGY S.A.S., identificada con NIT 902040253-1, es el Responsable del Tratamiento de los datos personales recolectados a través de la aplicación y el sitio web.',
    'Utilizamos tus datos únicamente con tu consentimiento previo y para las finalidades necesarias para la prestación del servicio.',
    'La conservación de datos se limita al período estrictamente necesario según la finalidad del tratamiento o el plazo exigido por la normativa vigente.',
  ],
};

const permissionsUsageSection = {
  heading: 'Uso de Permisos del Dispositivo',
  summary: 'Solicitamos ciertos permisos en tu dispositivo exclusivamente para que la aplicación funcione correctamente.',
  bullets: [
    'Ubicación: Utilizada únicamente para la asignación de viajes, navegación de rutas y funciones de seguridad.',
    'Cámara (si aplica): Para verificación de identidad del perfil o validación de documentos requeridos.',
    'Almacenamiento (si aplica): Para guardar temporalmente comprobantes o archivos necesarios del servicio.',
    'Estos permisos no se utilizan para fines publicitarios ni se comparten con terceros para tales fines.',
    'Puedes revocar los permisos en cualquier momento desde la configuración de tu dispositivo, lo cual puede limitar algunas funcionalidades de la aplicación.',
  ],
};

// 3. Responsabilidades
const driverResponsibilitySection = {
  heading: 'Responsabilidades del Conductor',
  summary: 'Como conductor registrado en Viax, te comprometes a cumplir con las normas de tránsito y a mantener tu documentación vigente.',
  bullets: [
    'Afiliación: Debes estar vinculado a una empresa de transporte legalmente habilitada. No se admite el registro como conductor independiente sin empresa.',
    'Documentación: Tu licencia de conducción, SOAT y revisión técnico-mecánica deben ser auténticos y estar vigentes.',
    'Autonomía: Tú defines tus propios horarios y tiempos de conexión. Viax no exige exclusividad ni establece relación de dependencia.',
  ],
};

const clientResponsibilitySection = {
  heading: 'Responsabilidades del Cliente',
  summary: 'Al solicitar un servicio, te comprometes a utilizar la plataforma de manera respetuosa y conforme a la ley.',
  bullets: [
    'Información veraz: Debes proporcionar datos reales y actualizados al registrarte y solicitar servicios.',
    'Prohibiciones: Está prohibido utilizar la plataforma para transportar sustancias ilegales, elementos prohibidos por la ley o cualquier objeto que ponga en riesgo la seguridad.',
    'Conducta: El uso abusivo de la plataforma, como cancelaciones fraudulentas, daños al vehículo o evasión de pago, podrá dar lugar a la suspensión o cancelación de tu cuenta.',
  ],
};

const enterpriseResponsibilitySection = {
  heading: 'Responsabilidades de la Empresa',
  summary: 'La empresa registrada es responsable ante la ley por la idoneidad de sus vehículos y la conducta de sus conductores afiliados.',
  bullets: [
    'Garante: La empresa es responsable de verificar la idoneidad de los vehículos y la documentación de los conductores vinculados a su flota.',
    'Obligaciones legales: Asumes la responsabilidad sobre el cumplimiento de las obligaciones tributarias, laborales y de seguridad social de tu operación de transporte.',
  ],
};

const adminResponsibilitySection = {
  heading: 'Confidencialidad y Secreto Comercial',
  summary: 'Los administradores del sistema están sujetos a estrictas políticas de confidencialidad para proteger la información de la plataforma y sus usuarios.',
  bullets: [
    'Confidencialidad: El acceso a la información del sistema es exclusivamente funcional. La extracción no autorizada de datos está prohibida y puede generar responsabilidad legal.',
    'Auditoría: Todo acceso y operación realizada en el panel de administración queda registrado. Se realizarán auditorías periódicas para verificar el uso adecuado del sistema.',
  ],
};

const serverResponsibilitySection = {
  heading: 'Reglas para Conexiones Externas (APIs)',
  summary: 'Medidas de seguridad para regular el tráfico automatizado y proteger la estabilidad de la plataforma.',
  bullets: [
    'Restricciones: Se aplicarán bloqueos automáticos a conexiones que realicen solicitudes masivas, extracción de datos o cualquier actividad que comprometa la estabilidad del servicio.',
  ],
};

// 4. Pagos
const paymentsSection = {
  heading: 'Pagos, Tarifas y Comisiones',
  summary: 'El uso de la plataforma tecnológica implica costos y tarifas necesarios para su funcionamiento y mantenimiento.',
  bullets: [
    'Usuario: El cliente paga el servicio según las tarifas mostradas en pantalla al momento de solicitar y finalizar el viaje.',
    'Conductores: Viax cobra una comisión de intermediación sobre cada viaje completado. La morosidad reiterada podrá generar restricciones en la asignación de nuevos servicios.',
    'Empresas: La conciliación financiera se realiza mediante comprobantes de depósito o sistema de saldos prepagados.',
    'Impuestos: Las obligaciones tributarias derivadas de la actividad de transporte son responsabilidad del prestador del servicio (conductor y/o empresa), conforme a la normativa fiscal vigente.',
  ],
};

// 5. Eliminación de cuenta
const accountDeletionSectionsByRole = {
  cliente: {
    heading: 'Eliminación de Cuenta',
    summary: 'Puedes solicitar la eliminación de tu cuenta en cualquier momento. La eliminación de datos personales está sujeta a las obligaciones legales de retención aplicables.',
    bullets: [
      'Solicitud: Puedes solicitar la eliminación de tu cuenta desde la aplicación o enviando un correo electrónico a viaxoficialcol@gmail.com con el asunto "Eliminación de cuenta".',
      'Período de gracia: Durante los 15 días siguientes a tu solicitud, la cuenta quedará suspendida. Si inicias sesión durante este período, la solicitud se cancelará automáticamente.',
      'Eliminación de datos: Una vez confirmada la eliminación, tus datos personales serán suprimidos de nuestros sistemas. En caso de no existir obligación legal de retención, podrás solicitar la eliminación inmediata sin esperar el período de gracia.',
      'Retención legal: Conforme a la normativa vigente, Viax conservará únicamente los registros exigidos por obligaciones contables, fiscales o de seguridad por el plazo legal correspondiente, tras lo cual serán eliminados.',
    ],
  },
  conductor: {
    heading: 'Eliminación de Cuenta de Conductor',
    summary: 'Puedes solicitar la eliminación de tu cuenta como conductor. Algunos registros se conservarán según lo exija la normativa vigente.',
    bullets: [
      'Solicitud: Puedes iniciar el proceso desde la aplicación o enviando un correo electrónico a viaxoficialcol@gmail.com. El proceso tomará hasta 15 días hábiles.',
      'Eliminación inmediata: Puedes solicitar la eliminación inmediata de tus datos personales cuando no exista obligación legal que requiera su conservación.',
      'Datos biométricos: Si se capturaron datos biométricos, estos serán eliminados de todos los sistemas de la plataforma de forma inmediata tras la solicitud.',
      'Retención legal: Se conservarán únicamente los registros de viajes e información financiera exigidos por las autoridades fiscales o de tránsito, conforme a la normativa aplicable.',
    ],
  },
  empresa: {
    heading: 'Desvinculación de la Empresa',
    summary: 'La empresa puede solicitar su desvinculación de la plataforma a través de los canales autorizados.',
    bullets: [
      'Solicitud formal: La desvinculación debe ser solicitada por el representante legal o administrador autorizado de la empresa, a través de la plataforma o del correo viaxoficialcol@gmail.com.',
      'Eliminación de datos: Los datos de la empresa que no estén sujetos a obligación legal de retención podrán ser eliminados de forma inmediata a solicitud del representante legal.',
      'Saldos pendientes: Cualquier saldo pendiente de pago será liquidado antes de completar la desvinculación.',
    ],
  },
};

// 6. Seguridad / fraude
const securityAndFraudSection = {
  heading: 'Seguridad y Prevención de Fraude',
  summary: 'Viax implementa medidas de seguridad tecnológica para proteger a los usuarios y prevenir actividades fraudulentas en la plataforma.',
  bullets: [
    'Cifrado: Todas las comunicaciones entre la aplicación y los servidores de Viax están protegidas mediante cifrado HTTPS/TLS. Los datos sensibles se almacenan de forma cifrada en los sistemas de la plataforma.',
    'Monitoreo: Viax realiza monitoreo técnico de actividad sospechosa, incluyendo análisis de direcciones IP y patrones de uso, para detectar y prevenir conductas fraudulentas.',
    'Autenticación: El inicio de sesión se realiza mediante código OTP o cuenta de Google. Las acciones realizadas mediante autenticación válida se considerarán realizadas por el titular de la cuenta, salvo prueba en contrario conforme a la legislación vigente. No compartas tus credenciales de acceso.',
    'Medidas: Viax podrá suspender o cancelar cuentas cuando detecte actividades que infrinjan estos términos, sin perjuicio de las acciones legales correspondientes.',
  ],
};

// 6b. Biometría (sección independiente)
const biometryConsentSection = {
  heading: 'Datos Biométricos',
  summary: 'Los datos biométricos son considerados datos sensibles conforme a la Ley 1581 de 2012. Su uso en Viax es opcional, requiere tu consentimiento expreso e independiente, y se utiliza exclusivamente para fines de seguridad.',
  bullets: [
    'Datos sensibles: Los datos biométricos son considerados datos sensibles conforme a la Ley 1581 de 2012 y su tratamiento está sujeto a las garantías especiales previstas para este tipo de información.',
    'Consentimiento: El uso de verificación biométrica (como reconocimiento facial) requiere tu autorización previa, expresa e informada, otorgada de forma independiente a la aceptación de estos términos.',
    'Finalidad: Los datos biométricos se utilizan exclusivamente para fines de verificación de identidad, seguridad y prevención de fraude.',
    'Carácter opcional: La verificación biométrica es opcional cuando existan métodos alternativos de verificación disponibles. Nunca serás obligado a proporcionar datos biométricos para utilizar el servicio.',
    'No comercialización: Viax no comercializa, vende ni comparte datos biométricos con terceros bajo ninguna circunstancia.',
    'Eliminación: Los datos biométricos son eliminados de nuestros sistemas una vez cumplida la finalidad para la cual fueron recolectados, o cuando el usuario solicite su eliminación.',
  ],
};

// 6c. Transferencia internacional de datos
const internationalTransferSection = {
  heading: 'Transferencia Internacional de Datos',
  summary: 'Viax utiliza proveedores de servicios en la nube que pueden almacenar datos fuera de Colombia, siempre con medidas de protección adecuadas conforme a la Ley 1581 de 2012.',
  bullets: [
    'Base legal: La transferencia internacional de datos se realiza conforme al artículo 26 de la Ley 1581 de 2012 y sus decretos reglamentarios, garantizando niveles adecuados de protección.',
    'Proveedores: Viax utiliza servicios de Firebase (Google Cloud) y Cloudflare, cuyos servidores pueden estar ubicados fuera de Colombia, en países que pueden incluir Estados Unidos y otras jurisdicciones donde estos proveedores operan.',
    'Estándares de seguridad: Estos proveedores cumplen con estándares internacionales de seguridad de la información, incluyendo certificaciones ISO 27001, SOC 2 y el cumplimiento del GDPR.',
    'Medidas de protección: Se implementan medidas técnicas y contractuales adecuadas para garantizar la protección de tus datos personales durante y después de la transferencia.',
    'Finalidad: La transferencia se realiza únicamente para garantizar la prestación del servicio, la seguridad de la plataforma y el almacenamiento seguro de la información.',
    'Consentimiento: Al aceptar esta política de privacidad, el usuario autoriza expresamente la transferencia internacional de sus datos personales a los proveedores indicados, conforme a lo dispuesto en la Ley 1581 de 2012.',
  ],
};

// 6d. Seguridad de datos (Google Play Data Safety)
const googlePlayDataSafetySection = {
  heading: 'Seguridad de Datos (Google Play)',
  summary: 'Información sobre las prácticas de recolección, uso y seguridad de datos de Viax, conforme a los requisitos de transparencia de Google Play.',
  bullets: [
    'Datos recolectados: Viax recolecta datos de ubicación (para asignación de viajes y navegación), datos de identificación personal (nombre, correo electrónico, número de teléfono para el registro y prestación del servicio) y datos de uso de la aplicación (para mejorar la experiencia y la seguridad).',
    'Finalidad: Todos los datos recolectados se utilizan exclusivamente para la prestación del servicio de intermediación tecnológica, la seguridad de los usuarios y el cumplimiento de obligaciones legales.',
    'No venta de datos: Viax NO vende datos personales de los usuarios a terceros bajo ninguna circunstancia.',
    'Cifrado: Toda la información transmitida entre tu dispositivo y nuestros servidores está protegida mediante cifrado HTTPS/TLS.',
    'Retención: Los datos personales se conservan mientras tu cuenta esté activa y durante el período adicional que la normativa vigente exija. Una vez eliminada la cuenta, solo se retienen los datos requeridos por obligación legal.',
    'Eliminación: Puedes solicitar la eliminación de tus datos personales en cualquier momento desde la aplicación o enviando un correo a viaxoficialcol@gmail.com. Los datos serán eliminados conforme a lo establecido en la sección de Eliminación de Cuenta.',
    'Compartición con terceros: Los datos solo se comparten con proveedores de infraestructura tecnológica (Firebase, Cloudflare) necesarios para la operación del servicio, y con autoridades competentes cuando la ley lo exija.',
  ],
};

const adminSecuritySection = {
  heading: 'Auditoría de Administradores',
  summary: 'Todas las operaciones realizadas por los administradores de la plataforma quedan registradas en un log de auditoría inmutable.',
  bullets: [
    'Registro de actividad: Cada acción realizada por un administrador sobre cuentas, valores o configuraciones del sistema queda registrada con fecha, hora y usuario responsable.',
  ],
};

const serverSecuritySection = {
  heading: 'Protección de Infraestructura',
  summary: 'Viax implementa medidas de seguridad perimetral y cifrado para proteger la infraestructura tecnológica de la plataforma.',
  bullets: [
    'Seguridad: Se emplean firewalls, protección contra ataques DDoS, cifrado en tránsito (HTTPS/TLS) y monitoreo continuo sobre la infraestructura alojada en servicios de nube corporativos.',
  ],
};

// 7. UGC / chat
const chatAndUGCSection = {
  heading: 'Chat y Contenido Generado por Usuarios',
  summary: 'Viax ofrece un sistema de chat interno entre pasajeros y conductores durante el servicio. La plataforma cuenta con herramientas de moderación para garantizar un entorno seguro.',
  bullets: [
    'Reportar: Los usuarios pueden reportar contenido o conductas inapropiadas directamente desde la aplicación. Cada reporte será revisado por el equipo de Viax.',
    'Bloquear: Los usuarios pueden bloquear a otros usuarios para evitar comunicaciones no deseadas durante y después del servicio.',
    'Moderación: Viax podrá revisar, moderar y tomar acciones sobre el contenido generado por los usuarios cuando se presenten reportes o se detecten posibles infracciones a estas políticas.',
    'Acciones: En caso de incumplimiento verificado, Viax podrá aplicar medidas que incluyen advertencias, suspensión temporal, eliminación de contenido o cancelación definitiva de la cuenta.',
    'Privacidad del chat: Los mensajes del chat son confidenciales y solo serán revisados por Viax en caso de reporte, disputa entre usuarios u orden de autoridad competente.',
  ],
};

// 8. Disponibilidad
const serviceAvailabilitySection = {
  heading: 'Disponibilidad del Servicio y Precisión del GPS',
  summary: 'Viax se esfuerza por mantener la plataforma disponible, pero no puede garantizar un funcionamiento ininterrumpido debido a factores externos.',
  bullets: [
    'Disponibilidad: El servicio puede experimentar interrupciones temporales por mantenimiento, actualizaciones o factores ajenos a nuestro control, como fallas en redes de telecomunicaciones.',
    'GPS: Las ubicaciones y rutas mostradas en la aplicación dependen de servicios de geolocalización de terceros (GPS), cuya precisión puede variar según las condiciones del dispositivo y la cobertura. Las imprecisiones del GPS no constituyen un incumplimiento por parte de Viax.',
  ],
};

// 9. Modificaciones
const termsModificationSection = {
  heading: 'Actualizaciones de este Acuerdo',
  summary: 'Viax podrá actualizar estos términos y te notificará sobre los cambios relevantes para que puedas revisarlos.',
  bullets: [
    'Notificación: Te informaremos sobre cambios significativos en estos términos a través de la aplicación o correo electrónico. El uso continuado de la plataforma después de la notificación constituye la aceptación de los términos actualizados.',
  ],
};

// 10. Terminación
const serviceTerminationSection = {
  heading: 'Suspensión y Terminación del Servicio',
  summary: 'Viax podrá suspender o cancelar cuentas que incumplan estos términos o la legislación vigente, garantizando el debido proceso.',
  bullets: [
    'Causales: Viax podrá suspender o cancelar cuentas en casos de fraude, acoso, incumplimiento de la documentación requerida, conductas que pongan en riesgo la seguridad de otros usuarios, o cualquier infracción grave de estos términos.',
    'Proceso: Antes de la cancelación definitiva, Viax notificará al usuario las razones de la medida, salvo en casos que representen un riesgo inminente para la seguridad. El usuario podrá presentar descargos dentro de los 5 días hábiles siguientes a la notificación.',
  ],
};

// 11. Responsabilidad financiera
const financialLimitationSection = {
  heading: 'Límites de Responsabilidad',
  summary: 'Como intermediario tecnológico, la responsabilidad de Viax se limita conforme a la legislación aplicable, sin eximir el deber de diligencia propio de la plataforma.',
  bullets: [
    'Intermediación: Viax actúa como intermediario tecnológico y no ejecuta directamente el servicio de transporte. La cobertura de daños derivados del transporte corresponde al SOAT y las pólizas del vehículo, conforme a la normativa vigente.',
    'Deber de diligencia: Viax se compromete a actuar con la diligencia razonablemente esperada de una plataforma tecnológica, implementando las medidas de seguridad y verificación disponibles para proteger la integridad del servicio.',
    'Responsabilidad indirecta: En caso de fallas atribuibles a la plataforma que generen perjuicios verificables, Viax responderá conforme a la legislación colombiana, limitándose a los daños directos y probados.',
    'Disponibilidad: Las interrupciones temporales de la plataforma por causas técnicas ajenas al control razonable de Viax no generan responsabilidad por lucro cesante, salvo que se demuestre dolo o culpa grave.',
    'Derechos del consumidor: Lo anterior se entiende sin perjuicio de los derechos irrenunciables del consumidor conforme a la Ley 1480 de 2011.',
  ],
};

// 12. Jurisdicción
const jurisdictionSection = {
  heading: 'Ley Aplicable y Resolución de Conflictos',
  summary: 'Estos términos se rigen por la legislación colombiana. Ante cualquier conflicto, priorizamos la solución directa y el diálogo.',
  bullets: [
    'Legislación: Estos términos se rigen por las leyes de la República de Colombia, con jurisdicción principal en Bogotá D.C., sin perjuicio del derecho del consumidor a acudir a su jurisdicción local conforme a la ley.',
    'Quejas y reclamos (PQR): Para quejas, reclamos o peticiones, escríbenos a viaxoficialcol@gmail.com. Responderemos dentro de los 15 días hábiles establecidos por la normativa vigente.',
    'Mecanismos alternativos: Las partes podrán acudir a mecanismos alternativos de solución de conflictos como conciliación o mediación antes de iniciar acciones judiciales, cuando sea aplicable.',
    'Cooperación con autoridades: Viax colaborará de manera oportuna con las autoridades competentes que requieran información conforme a la ley.',
  ],
};

// 13. Cláusula final
const finalClauseSection = {
  heading: 'Consentimiento y Disposiciones Finales',
  summary: 'Al utilizar Viax, confirmas que has leído, comprendido y aceptado estos términos.',
  bullets: [
    'Aceptación digital: La aceptación de estos términos mediante medios electrónicos (OTP, botón de aceptación, clic) tiene la misma validez jurídica que una firma manuscrita, conforme a la Ley 527 de 1999.',
    'Consentimiento de privacidad: El tratamiento de datos personales se rige por la Política de Privacidad, la cual es aceptada de manera independiente por el usuario al momento del registro en la plataforma.',
    'Divisibilidad: Si alguna cláusula de estos términos es declarada inválida o inaplicable por autoridad competente, las demás cláusulas mantendrán su plena validez y efecto.',
  ],
};

// Extras o Específicas
const cookiesAndStorageSection = {
  heading: 'Cookies y Almacenamiento Local',
  summary: 'Información sobre el uso de cookies en el sitio web y el almacenamiento local en la aplicación móvil.',
  bullets: [
    'Sitio web (Cookies): Utilizamos cookies estrictamente necesarias para el funcionamiento del sitio web, como la gestión de sesiones y preferencias de usuario.',
    'Aplicación (almacenamiento local): La app almacena tokens de autenticación de forma segura en el dispositivo para mantener tu sesión activa. Al desinstalar la aplicación, estos datos se eliminan automáticamente.',
    'No rastreo: No utilizamos cookies ni almacenamiento local para rastrear tu actividad fuera de la plataforma Viax.',
  ],
};

const rightsPrivacySection = {
  heading: 'Tus Derechos como Titular de Datos (Habeas Data)',
  summary: 'Tienes derecho a conocer, actualizar, rectificar y solicitar la eliminación de tus datos personales en cualquier momento.',
  bullets: [
    'Derechos: Conforme a la Ley 1581 de 2012, puedes ejercer tus derechos de acceso, actualización, rectificación, supresión y revocatoria del consentimiento sobre tus datos personales.',
    'Canal: Para ejercer estos derechos, envía tu solicitud a viaxoficialcol@gmail.com indicando tu nombre completo, número de identificación y el derecho que deseas ejercer. Responderemos dentro de los plazos legales establecidos.',
  ],
};

export const legalContent = {
  cliente: {
    terms: {
      title: 'Términos y Condiciones - Usuario Cliente',
      intro: 'Estos términos regulan el uso de la plataforma tecnológica Viax en Colombia. Al utilizar nuestra aplicación, aceptas las condiciones aquí establecidas. Te recomendamos leer este documento con atención.',
      meta: `Última actualización: ${updateDate}`,
      sections: [],
    },
    privacy: {
      title: 'Política de Privacidad - Cliente',
      intro: 'Esta política describe cómo recolectamos, utilizamos y protegemos tu información personal cuando usas la aplicación Viax como cliente.',
      meta: `Última actualización: ${updateDate}`,
      sections: [],
    },
  },
  conductor: {
    terms: {
      title: 'Términos y Condiciones - Conductor',
      intro: 'Estos términos regulan el uso de la plataforma Viax por parte de los conductores afiliados y empresas de transporte que utilizan nuestra tecnología para recibir solicitudes de servicio.',
      meta: `Última actualización: ${updateDate}`,
      sections: [],
    },
    privacy: {
      title: 'Política de Privacidad - Conductor',
      intro: 'Esta política detalla cómo tratamos la información personal y de ubicación de los conductores registrados en la plataforma Viax.',
      meta: `Última actualización: ${updateDate}`,
      sections: [],
    },
  },
  empresa: {
    terms: {
      title: 'Términos y Condiciones - Empresa de Transporte',
      intro: 'Estos términos están dirigidos a las personas jurídicas y empresas de transporte que administran flotas de vehículos a través de la plataforma Viax.',
      meta: `Última actualización: ${updateDate}`,
      sections: [],
    },
    privacy: {
      title: 'Política de Privacidad - Empresa',
      intro: 'Esta política describe el tratamiento de datos de las empresas registradas en Viax, incluyendo la información de sus conductores y operaciones.',
      meta: `Última actualización: ${updateDate}`,
      sections: [],
    },
  },
  administrador: {
    terms: {
      title: 'Términos de Uso - Panel de Administración',
      intro: 'Estos términos regulan el acceso y uso del panel de administración de Viax por parte del personal autorizado. Todo acceso está sujeto a confidencialidad y auditoría.',
      meta: `Última actualización: ${updateDate}`,
      sections: [],
    },
    privacy: {
      title: 'Política de Privacidad y Auditoría - Administrador',
      intro: 'Toda operación realizada en el panel de administración es registrada en un sistema de auditoría para garantizar la transparencia y seguridad de la plataforma.',
      meta: `Última actualización: ${updateDate}`,
      sections: [],
    },
  },
  servidor: {
    terms: {
      title: 'Términos de Uso - API y Conexiones Externas',
      intro: 'Estas políticas regulan el comportamiento de integraciones, bots y conexiones automatizadas que interactúan con los servicios de la plataforma Viax.',
      meta: `Última actualización: ${updateDate}`,
      sections: [],
    },
    privacy: {
      title: 'Política de Seguridad - Infraestructura y Telemetría',
      intro: 'Esta política describe las medidas de seguridad aplicadas a las conexiones externas y el tráfico automatizado sobre la infraestructura de Viax.',
      meta: `Última actualización: ${updateDate}`,
      sections: [],
    },
  },
};

const addSectionOnce = (sections, sectionToAdd) => {
  if (!sectionToAdd) return;
  const isDuplicate = sections.some((s) => s.heading === sectionToAdd.heading);
  if (!isDuplicate) {
    sections.push(sectionToAdd);
  }
};

['cliente', 'conductor', 'empresa', 'administrador', 'servidor'].forEach((roleKey) => {
  
  if (legalContent[roleKey].terms) {
    const ts = [];
    
    if (roleKey !== 'servidor' && roleKey !== 'administrador') {
      addSectionOnce(ts, intermediationSection);
    }
    
    addSectionOnce(ts, legalFrameworkSection);
    addSectionOnce(ts, companyIdentificationSection);
    
    if (roleKey === 'cliente') {
      addSectionOnce(ts, clientResponsibilitySection);
      addSectionOnce(ts, paymentsSection);
      addSectionOnce(ts, accountDeletionSectionsByRole.cliente);
    } else if (roleKey === 'conductor') {
      addSectionOnce(ts, driverResponsibilitySection);
      addSectionOnce(ts, paymentsSection);
      addSectionOnce(ts, accountDeletionSectionsByRole.conductor);
    } else if (roleKey === 'empresa') {
      addSectionOnce(ts, enterpriseResponsibilitySection);
      addSectionOnce(ts, paymentsSection);
      addSectionOnce(ts, accountDeletionSectionsByRole.empresa);
    } else if (roleKey === 'administrador') {
      addSectionOnce(ts, adminResponsibilitySection);
    } else if (roleKey === 'servidor') {
      addSectionOnce(ts, serverResponsibilitySection);
    }

    if (roleKey !== 'servidor' && roleKey !== 'administrador') {
      addSectionOnce(ts, chatAndUGCSection);
      addSectionOnce(ts, serviceAvailabilitySection);
    }

    addSectionOnce(ts, termsModificationSection);
    addSectionOnce(ts, serviceTerminationSection);
    
    if (roleKey !== 'servidor' && roleKey !== 'administrador') {
      addSectionOnce(ts, financialLimitationSection);
    }
    
    addSectionOnce(ts, jurisdictionSection);
    addSectionOnce(ts, finalClauseSection);
    
    legalContent[roleKey].terms.sections = ts;
  }
  
  if (legalContent[roleKey].privacy) {
    const ps = [];

    addSectionOnce(ps, companyIdentificationSection);

    if (roleKey !== 'servidor') {
      addSectionOnce(ps, dataControllerSection);
      addSectionOnce(ps, permissionsUsageSection); 
      addSectionOnce(ps, securityAndFraudSection);
      addSectionOnce(ps, biometryConsentSection);
      addSectionOnce(ps, internationalTransferSection);
      
      if (roleKey === 'cliente' || roleKey === 'conductor' || roleKey === 'empresa') {
        addSectionOnce(ps, googlePlayDataSafetySection);
        addSectionOnce(ps, rightsPrivacySection);
        addSectionOnce(ps, accountDeletionSectionsByRole[roleKey]);
        addSectionOnce(ps, chatAndUGCSection);
        addSectionOnce(ps, cookiesAndStorageSection);
      }
      
      if (roleKey === 'administrador') {
        addSectionOnce(ps, adminSecuritySection);
      }
    } else {
      addSectionOnce(ps, serverSecuritySection);
    }

    addSectionOnce(ps, termsModificationSection);
    addSectionOnce(ps, serviceTerminationSection);
    addSectionOnce(ps, jurisdictionSection);
    addSectionOnce(ps, finalClauseSection);
    
    legalContent[roleKey].privacy.sections = ps;
  }
});

const globalSectionOrder = [
  // 1. Identidad
  'Identificación de la Empresa',
  'Nuestra Función: Intermediación Tecnológica',
  // 2. Marco legal
  'Marco Normativo',
  // 3. Datos personales
  'Responsable del Tratamiento y Uso de Datos',
  'Uso de Permisos del Dispositivo',
  'Datos Biométricos',
  'Transferencia Internacional de Datos',
  'Seguridad de Datos (Google Play)',
  'Cookies y Almacenamiento Local',
  // 4. Funcionamiento
  'Chat y Contenido Generado por Usuarios',
  'Disponibilidad del Servicio y Precisión del GPS',
  // 5. Responsabilidades por rol
  'Responsabilidades del Cliente',
  'Responsabilidades del Conductor',
  'Responsabilidades de la Empresa',
  'Confidencialidad y Secreto Comercial',
  'Reglas para Conexiones Externas (APIs)',
  // 6. Pagos
  'Pagos, Tarifas y Comisiones',
  // 7. Seguridad
  'Seguridad y Prevención de Fraude',
  'Auditoría de Administradores',
  'Protección de Infraestructura',
  // 8. Derechos del usuario
  'Tus Derechos como Titular de Datos (Habeas Data)',
  'Eliminación de Cuenta',
  'Eliminación de Cuenta de Conductor',
  'Desvinculación de la Empresa',
  // 9. Cierre
  'Límites de Responsabilidad',
  'Suspensión y Terminación del Servicio',
  'Actualizaciones de este Acuerdo',
  'Ley Aplicable y Resolución de Conflictos',
  'Consentimiento y Disposiciones Finales',
];

const sortSections = (sections) => {
  return sections.sort((a, b) => {
    const indexA = globalSectionOrder.indexOf(a.heading);
    const indexB = globalSectionOrder.indexOf(b.heading);
    const posA = indexA !== -1 ? indexA : 999;
    const posB = indexB !== -1 ? indexB : 999;
    return posA - posB;
  });
};

['cliente', 'conductor', 'empresa', 'administrador', 'servidor'].forEach((roleKey) => {
  if (legalContent[roleKey].terms?.sections) {
    legalContent[roleKey].terms.sections = sortSections(legalContent[roleKey].terms.sections);
  }
  if (legalContent[roleKey].privacy?.sections) {
    legalContent[roleKey].privacy.sections = sortSections(legalContent[roleKey].privacy.sections);
  }
});
