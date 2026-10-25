import type {
  Analisis,
  IndicadorAnalisis,
  NivelSeveridad,
  RutaAnalisis,
  Veredicto,
} from '../types';

const INDICADORES_POOL: IndicadorAnalisis[] = [
  { codigo: 'urgencia', descripcion: 'Sentido de urgencia injustificado', peso: 1.5 },
  {
    codigo: 'dominio_externo',
    descripcion: 'Dominio remitente externo o no coincidente',
    peso: 1.2,
  },
  { codigo: 'enlace_acortado', descripcion: 'Uso de enlace acortado o redirigido', peso: 1.8 },
  {
    codigo: 'solicitud_credenciales',
    descripcion: 'Petición directa de credenciales o pagos',
    peso: 2.0,
  },
  {
    codigo: 'amenaza',
    descripcion: 'Amenaza de bloqueo o consecuencias negativas',
    peso: 1.4,
  },
];

/**
 * Genera los 100 documentos seed deterministas según las reglas del §9.2.
 */
export function generateSeedAnalyses(baseDate: Date = new Date()): Analisis[] {
  // Ajustar baseDate a las 12:00 hora Colombia (UTC-5)
  // 12:00 en UTC-5 equivale a 17:00 UTC
  const fixedBase = new Date(baseDate);
  fixedBase.setUTCHours(17, 0, 0, 0);

  const analyses: Analisis[] = [];

  for (let i = 0; i < 100; i++) {
    const daysAgo = Math.floor((i * 30) / 100);
    const itemDate = new Date(fixedBase.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    let veredicto: Veredicto;
    if (i <= 54) {
      veredicto = 'sin_indicadores';
    } else if (i <= 69) {
      veredicto = 'sospechoso';
    } else {
      veredicto = 'malicioso';
    }

    const ruta: RutaAnalisis = i % 5 < 3 ? 'heuristica' : 'ia';

    let score: number;
    if (veredicto === 'sin_indicadores') {
      score = 5 + (i % 20);
    } else if (veredicto === 'sospechoso') {
      score = 35 + (i % 35);
    } else {
      score = 76 + (i % 24);
    }

    let severidad: NivelSeveridad;
    if (veredicto === 'sin_indicadores') {
      severidad = 'Bajo';
    } else if (veredicto === 'sospechoso') {
      severidad = 'Medio';
    } else {
      severidad = score < 90 ? 'Alto' : 'Crítico';
    }

    const duracion_ms = ruta === 'heuristica' ? 800 + ((i * 17) % 1700) : 3000 + ((i * 61) % 6000);

    let indicadores: IndicadorAnalisis[] = [];
    if (veredicto !== 'sin_indicadores') {
      const idx1 = i % 5;
      const idx2 = (i + 2) % 5;
      const ind1 = INDICADORES_POOL[idx1];
      const ind2 = INDICADORES_POOL[idx2];
      if (ind1 && ind2) {
        indicadores = [ind1, ind2];
      }
    }

    // ID determinista de 24 caracteres hexadecimales
    const hexSuffix = i.toString(16).padStart(4, '0');
    const id = `6720c3f1a9b2c4d5e600${hexSuffix}`;

    analyses.push({
      id,
      origen: 'seed',
      modo: 'pegar',
      creado_en: itemDate.toISOString(),
      duracion_ms,
      correo: {
        remitente: `contacto${i}@dominio-${i % 8}.com`,
        asunto: `Revisión de seguridad y verificación #${i + 1}`,
        cuerpo_enmascarado: `Estimado usuario,\nEste es el cuerpo enmascarado del mensaje de prueba número ${i + 1}.\nCualquier número largo ha sido reemplazado por [NÚMERO_OCULTO] y correos enmascarados como u***@dominio.com.`,
      },
      resultado: {
        score,
        ruta,
        es_phishing: veredicto === 'malicioso',
        veredicto,
        nivel_severidad: severidad,
        resumen:
          veredicto === 'malicioso'
            ? 'El análisis detectó indicadores de alta peligrosidad compatibles con una campaña de phishing.'
            : veredicto === 'sospechoso'
              ? 'Se observaron anomalías heurísticas que requieren precaución por parte del receptor.'
              : 'El mensaje analizado no presenta indicadores de suplantación ni enlaces maliciosos conocidos.',
        analisis_tecnico:
          'Evaluación exhaustiva de cabeceras, coherencia del dominio remitente y evaluación sintáctica de patrones de urgencia.',
        justificacion_veredicto:
          veredicto === 'malicioso'
            ? 'Se confirma la presencia de tácticas de ingeniería social orientadas a la captura ilegítima de datos.'
            : veredicto === 'sospechoso'
              ? 'Puntuación intermedia debido a discrepancias en el remitente y lenguaje de insistencia moderado.'
              : 'Todos los parámetros evaluados se encuentran dentro de los rangos de normalidad esperados.',
        indicadores,
      },
    });
  }

  // Ordenar de más reciente a más antiguo (creado_en descendente)
  return analyses.sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
}
