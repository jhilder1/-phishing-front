import type { MuestraCaso } from '../types';

/**
 * 4 casos de ejemplo oficiales conforme a §9.1.
 */
export const MOCK_SAMPLES: MuestraCaso[] = [
  {
    id: 'phishing-credenciales',
    titulo: 'Verificación de cuenta bancaria',
    descripcion: 'Suplanta a un banco y pide actualizar credenciales con urgencia',
    remitente: 'seguridad@banco-seguro.co',
    asunto: 'URGENTE: Verifique su cuenta para evitar bloqueo inmediato',
    cuerpo:
      'Estimado cliente,\n\nHemos detectado actividad inusual en su cuenta. Ingrese de inmediato al siguiente enlace para verificar sus credenciales o su acceso será suspendido en las próximas 24 horas: https://banco-seguro-verificacion.co/login\n\nAtentamente,\nDepartamento de Seguridad',
    cabeceras:
      'Received: from mail.banco-seguro.co (unknown [198.51.100.24])\nSubject: URGENTE: Verifique su cuenta',
  },
  {
    id: 'bec-transferencia',
    titulo: 'Cambio de cuenta de pago',
    descripcion: 'Un supuesto gerente pide cambiar la cuenta de un proveedor',
    remitente: 'gerencia.finanzas@empresa-aliada.com',
    asunto: 'Actualización urgente de datos bancarios para transferencia de factura',
    cuerpo:
      'Hola,\n\nPor favor tenga en cuenta que a partir de hoy todas las transferencias de facturas pendientes deben realizarse a nuestra nueva cuenta corriente No. 450123984712039. Agradezco confirmación de recibido.\n\nSaludos cordiales,\nDirección Financiera',
    cabeceras: 'Received: from mail-relay.externo.org\nFrom: gerencia.finanzas@empresa-aliada.com',
  },
  {
    id: 'factura-adjunta',
    titulo: 'Factura con adjunto',
    descripcion: 'Remitente desconocido que menciona un adjunto comprimido',
    remitente: 'cobranzas@facturacion-desconocida.net',
    asunto: 'Factura electrónica vencida - Aviso final',
    cuerpo:
      'Estimado señor / señora,\n\nAdjunto encontrará el comprobante de su factura pendiente. Por favor descargue y descomprima el archivo Factura_Final.zip para revisar el detalle de cobro.\n\nCobranzas Internacionales',
    cabeceras: 'Received: from desconocida.net\nSubject: Factura electrónica vencida',
  },
  {
    id: 'boletin-interno',
    titulo: 'Boletín interno de RR. HH.',
    descripcion: 'Comunicado legítimo con enlaces de la propia empresa',
    remitente: 'comunicaciones@miempresa.com',
    asunto: 'Boletín de novedades y bienestar laboral - Octubre',
    cuerpo:
      'Hola equipo,\n\nLos invitamos a leer la edición de este mes con las nuevas actividades de bienestar, jornadas de capacitación e inscripciones abiertas para el torneo de fútbol.\n\nPueden consultar todos los detalles en nuestro portal interno de empleados.\n\n¡Feliz semana!\nEquipo de Recursos Humanos',
    cabeceras: 'Received: from internal-smtp.miempresa.com\nDKIM-Signature: v=1; d=miempresa.com',
  },
];
