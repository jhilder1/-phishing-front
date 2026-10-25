import { describe, expect, it } from 'vitest';
import { isEmailValid, validateModoMuestra, validateModoPegar } from './validation';

describe('Validaciones del formulario (§4.2 P03)', () => {
  it('valida correos electrónicos y longitud máxima de 254', () => {
    expect(isEmailValid('usuario@dominio.com')).toBe(true);
    expect(isEmailValid('correo.invalido')).toBe(false);
    expect(isEmailValid('')).toBe(false);
    expect(isEmailValid('a'.repeat(250) + '@dominio.com')).toBe(false);
  });

  it('valida modo pegar con campos vacíos y genera los mensajes exactos', () => {
    const res = validateModoPegar({
      remitente: '',
      asunto: '',
      cuerpo: '',
    });

    expect(res.isValid).toBe(false);
    expect(res.errors.remitente).toBe('Ingrese un correo válido, por ejemplo nombre@dominio.com.');
    expect(res.errors.asunto).toBe('El asunto es obligatorio (máx. 300 caracteres).');
    expect(res.errors.cuerpo).toBe('El cuerpo es obligatorio (máx. 20 000 caracteres).');
    expect(res.firstErrorField).toBe('remitente');
  });

  it('rechaza cabeceras con más de 10.000 caracteres', () => {
    const res = validateModoPegar({
      remitente: 'test@banco.com',
      asunto: 'Asunto de prueba',
      cuerpo: 'Cuerpo suficiente',
      cabeceras: 'A'.repeat(10001),
    });

    expect(res.isValid).toBe(false);
    expect(res.errors.cabeceras).toBe('Las cabeceras superan 10 000 caracteres.');
  });

  it('acepta contenido válido en modo pegar', () => {
    const res = validateModoPegar({
      remitente: 'cliente@empresa.com',
      asunto: 'Consulta sobre factura #123',
      cuerpo: 'Estimados señores, solicito información.',
      cabeceras: 'Received: from server.com',
    });

    expect(res.isValid).toBe(true);
    expect(Object.keys(res.errors)).toHaveLength(0);
  });

  it('valida que el caso de muestra sea uno de los 4 permitidos', () => {
    expect(validateModoMuestra('phishing-credenciales').isValid).toBe(true);
    expect(validateModoMuestra('bec-transferencia').isValid).toBe(true);
    expect(validateModoMuestra('factura-adjunta').isValid).toBe(true);
    expect(validateModoMuestra('boletin-interno').isValid).toBe(true);

    const invalido = validateModoMuestra('muestra-inexistente');
    expect(invalido.isValid).toBe(false);
    expect(invalido.errors.muestra_id).toBeDefined();
  });
});
