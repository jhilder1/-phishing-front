/**
 * Validaciones del formulario de análisis según §4.2 (P03).
 * Los mensajes de error y reglas coinciden literalmente con la especificación.
 */

export interface FormErrorsModoPegar {
  remitente?: string;
  asunto?: string;
  cuerpo?: string;
  cabeceras?: string;
}

export interface FormErrorsModoMuestra {
  muestra_id?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CASOS_MUESTRA_VALIDOS = [
  'phishing-credenciales',
  'bec-transferencia',
  'factura-adjunta',
  'boletin-interno',
] as const;

export type MuestraValidaId = (typeof CASOS_MUESTRA_VALIDOS)[number];

export function isEmailValid(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email.trim());
}

export function validateModoPegar(values: {
  remitente: string;
  asunto: string;
  cuerpo: string;
  cabeceras?: string;
}): {
  isValid: boolean;
  errors: FormErrorsModoPegar;
  firstErrorField?: keyof FormErrorsModoPegar;
} {
  const errors: FormErrorsModoPegar = {};

  const remitenteTrim = values.remitente?.trim() ?? '';
  if (!remitenteTrim || !isEmailValid(remitenteTrim)) {
    errors.remitente = 'Ingrese un correo válido, por ejemplo nombre@dominio.com.';
  }

  const asuntoTrim = values.asunto?.trim() ?? '';
  if (!asuntoTrim || asuntoTrim.length < 1 || asuntoTrim.length > 300) {
    errors.asunto = 'El asunto es obligatorio (máx. 300 caracteres).';
  }

  const cuerpo = values.cuerpo ?? '';
  if (!cuerpo.trim() || cuerpo.length < 1 || cuerpo.length > 20000) {
    errors.cuerpo = 'El cuerpo es obligatorio (máx. 20 000 caracteres).';
  }

  const cabeceras = values.cabeceras ?? '';
  if (cabeceras.length > 10000) {
    errors.cabeceras = 'Las cabeceras superan 10 000 caracteres.';
  }

  const errorKeys = Object.keys(errors) as (keyof FormErrorsModoPegar)[];
  const isValid = errorKeys.length === 0;

  return {
    isValid,
    errors,
    firstErrorField: errorKeys[0],
  };
}

export function validateModoMuestra(muestraId: string): {
  isValid: boolean;
  errors: FormErrorsModoMuestra;
} {
  const errors: FormErrorsModoMuestra = {};
  if (!CASOS_MUESTRA_VALIDOS.includes(muestraId as MuestraValidaId)) {
    errors.muestra_id = 'Seleccione un caso de ejemplo válido.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
