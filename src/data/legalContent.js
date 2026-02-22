export const roleLabels = {
  cliente: 'Cliente',
  conductor: 'Conductor',
  empresa: 'Empresa',
  administrador: 'Administrador',
  servidor: 'Servidor/API',
};

export const legalContent = {
  cliente: {
    terms: {
      title: 'Términos y Condiciones - Cliente',
      intro: 'Regulan el uso de Viax por clientes que solicitan viajes y servicios.',
      sections: [
        { heading: '1. Objeto', bullets: ['Viax conecta clientes con conductores/empresas afiliadas.', 'No garantiza disponibilidad total ni tiempos exactos.'] },
        { heading: '2. Cuenta y seguridad', bullets: ['Información veraz y actualizada.', 'Custodia de credenciales y códigos.', 'Reporte inmediato de uso no autorizado.'] },
        { heading: '3. Tarifas y pagos', bullets: ['Tarifas con base en distancia, tiempo y configuración vigente.', 'El valor mostrado puede variar por eventos operativos del viaje.'] },
      ],
    },
    privacy: {
      title: 'Política de Privacidad - Cliente',
      intro: 'Describe el tratamiento de datos personales de clientes en Viax.',
      sections: [
        { heading: '1. Datos tratados', bullets: ['Identificación y contacto.', 'Historial de solicitudes e interacciones.', 'Ubicación asociada al servicio.'] },
        { heading: '2. Finalidades', bullets: ['Operación del servicio y seguridad.', 'Soporte, conciliación y prevención de fraude.', 'Cumplimiento legal.'] },
      ],
    },
  },
  conductor: {
    terms: {
      title: 'Términos y Condiciones - Conductor',
      intro: 'Aplican a conductores que operan servicios en Viax.',
      sections: [
        { heading: '1. Requisitos', bullets: ['Documentación personal y del vehículo vigente.', 'Validación documental previa a activación.'] },
        { heading: '2. Operación', bullets: ['Gestión de disponibilidad y aceptación de viajes.', 'Cumplimiento de normas de tránsito y trato adecuado.'] },
        { heading: '3. Comisiones y pagos', bullets: ['Aplican reglas de comisión/liquidación vigentes.', 'Los reportes de pago requieren comprobante válido y confirmación.'] },
      ],
    },
    privacy: {
      title: 'Política de Privacidad - Conductor',
      intro: 'Regula el tratamiento de datos del conductor.',
      sections: [
        { heading: '1. Datos tratados', bullets: ['Datos personales y contacto.', 'Documentos y validaciones.', 'Ubicación y trazabilidad operacional.'] },
        { heading: '2. Finalidades', bullets: ['Verificación, seguridad y control de calidad.', 'Gestión de operaciones, comisiones y cumplimiento legal.'] },
      ],
    },
  },
  empresa: {
    terms: {
      title: 'Términos y Condiciones - Empresa',
      intro: 'Aplican a empresas que gestionan conductores y operación en Viax.',
      sections: [
        { heading: '1. Administración', bullets: ['Actualización de datos corporativos y bancarios.', 'Responsabilidad por acciones de usuarios autorizados.'] },
        { heading: '2. Conductores', bullets: ['Verificación de requisitos y documentación.', 'Gestión de aprobaciones/rechazos en su alcance.'] },
        { heading: '3. Cuenta con plataforma', bullets: ['Aceptación de comisión configurada.', 'Confirmaciones pueden generar cargos en cuenta empresa-plataforma.'] },
      ],
    },
    privacy: {
      title: 'Política de Privacidad - Empresa',
      intro: 'Tratamiento de datos corporativos y operativos.',
      sections: [
        { heading: '1. Datos tratados', bullets: ['Información corporativa y bancaria.', 'Actividad de usuarios empresa.', 'Datos operativos y financieros asociados.'] },
        { heading: '2. Finalidades', bullets: ['Gestión comercial y conciliación.', 'Seguridad, auditoría y cumplimiento legal.'] },
      ],
    },
  },
  administrador: {
    terms: {
      title: 'Términos y Condiciones - Administrador',
      intro: 'Aplican a usuarios con privilegios administrativos en Viax.',
      sections: [
        { heading: '1. Alcance', bullets: ['Gestión de validaciones, monitoreo y auditoría.', 'Uso de funciones con finalidad legítima y trazabilidad.'] },
        { heading: '2. Seguridad', bullets: ['Credenciales intransferibles.', 'Prohibido compartir accesos o códigos.'] },
        { heading: '3. Restricciones', bullets: ['No alterar registros con fines indebidos.', 'No divulgar información fuera de canales autorizados.'] },
      ],
    },
    privacy: {
      title: 'Política de Privacidad - Administrador',
      intro: 'Tratamiento de datos asociados al uso del panel administrativo.',
      sections: [
        { heading: '1. Registros', bullets: ['Actividad y trazas de auditoría.', 'Eventos críticos de seguridad y operación.'] },
        { heading: '2. Finalidades', bullets: ['Trazabilidad, cumplimiento y gestión de incidentes.'] },
      ],
    },
  },
  servidor: {
    terms: {
      title: 'Términos de Uso del Servidor/API - Viax',
      intro: 'Aplican al uso técnico e integración de servicios backend Viax.',
      sections: [
        { heading: '1. Uso autorizado', bullets: ['Solo para fines permitidos por Viax.', 'Prohibido scraping masivo o ataques automatizados.'] },
        { heading: '2. Seguridad técnica', bullets: ['Protección de tokens y secretos.', 'Controles de acceso y manejo responsable de errores.'] },
        { heading: '3. Disponibilidad y cambios', bullets: ['Vía actualizaciones, Viax puede modificar endpoints y estructuras para seguridad/estabilidad.'] },
      ],
    },
    privacy: {
      title: 'Política de Privacidad - Servidor/API',
      intro: 'Tratamiento de registros técnicos en la infraestructura Viax.',
      sections: [
        { heading: '1. Registros', bullets: ['Logs de operación, auditoría y seguridad para monitoreo.'] },
        { heading: '2. Retención', bullets: ['Conservación según necesidad técnica y legal.'] },
      ],
    },
  },
};
