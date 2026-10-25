/**
 * Definiciones de tipos del contrato de la API y modelo de dominio.
 * Conforme a las especificaciones de la API (§5.1, §5.4, §5.5, §5.6).
 */

export type Veredicto = 'malicioso' | 'sospechoso' | 'sin_indicadores';

export type NivelSeveridad = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';

export type RutaAnalisis = 'heuristica' | 'ia';

export interface IndicadorAnalisis {
  codigo: string;
  descripcion: string;
  peso: number | null;
}

export interface CorreoAnalisis {
  remitente: string;
  asunto: string;
  cuerpo_enmascarado: string;
}

export interface ResultadoAnalisis {
  score: number;
  ruta: RutaAnalisis;
  es_phishing: boolean;
  veredicto: Veredicto;
  nivel_severidad: NivelSeveridad;
  resumen: string;
  analisis_tecnico: string;
  justificacion_veredicto: string;
  indicadores: IndicadorAnalisis[];
}

export interface Analisis {
  id: string;
  origen: 'usuario' | 'seed';
  modo: 'pegar' | 'muestra';
  muestra_id?: string;
  creado_en: string;
  duracion_ms: number;
  correo: CorreoAnalisis;
  resultado: ResultadoAnalisis;
}

export interface AnalisisListItem {
  id: string;
  creado_en: string;
  correo: {
    asunto: string;
    remitente: string;
  };
  resultado: {
    veredicto: Veredicto;
    score: number;
  };
}

export interface AnalisisListResponse {
  items: AnalisisListItem[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

export interface AnalisisListParams {
  veredicto?: Veredicto[];
  pagina?: number;
  limite?: number;
}

export interface MetricasPorDia {
  fecha: string; // YYYY-MM-DD
  malicioso: number;
  sospechoso: number;
  sin_indicadores: number;
}

export interface TopIndicador {
  codigo: string;
  descripcion: string;
  conteo: number;
}

export interface MetricasResumen {
  desde: string;
  hasta: string;
  total: number;
  por_veredicto: {
    malicioso: number;
    sospechoso: number;
    sin_indicadores: number;
  };
  pct_sin_llm: number;
  duracion_media_ms: number;
  por_dia: MetricasPorDia[];
  top_indicadores: TopIndicador[];
}

export interface MuestraCaso {
  id: string;
  titulo: string;
  descripcion: string;
  remitente: string;
  asunto: string;
  cuerpo: string;
  cabeceras?: string;
}

export interface AnalizarModoPegarPayload {
  modo: 'pegar';
  remitente: string;
  asunto: string;
  cuerpo: string;
  cabeceras?: string;
}

export interface AnalizarModoMuestraPayload {
  modo: 'muestra';
  muestra_id: string;
}

export type AnalizarPayload = AnalizarModoPegarPayload | AnalizarModoMuestraPayload;

export interface ApiErrorDetail {
  campo: string;
  mensaje: string;
}

export interface ApiErrorBody {
  error: {
    codigo: string;
    mensaje: string;
    detalles?: ApiErrorDetail[];
  };
}
