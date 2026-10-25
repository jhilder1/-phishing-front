import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import * as api from '@/lib/api';
import { ApiError } from '@/lib/errors';
import { routerFuture } from '@/lib/router';
import type { Analisis } from '@/lib/types';
import { AnalysisDetailPage } from './AnalysisDetailPage';

const VALID_ID = '6720c3f1a9b2c4d5e6f70812';

const MOCK_ANALISIS_MALICIOSO: Analisis = {
  id: VALID_ID,
  origen: 'usuario',
  modo: 'pegar',
  creado_en: '2026-10-21T14:30:00.000Z',
  duracion_ms: 4200,
  correo: {
    remitente: 'alerta@banco-seguro.co',
    asunto: 'Verifique su cuenta',
    cuerpo_enmascarado: 'Texto de prueba con enmascarado u***@banco.com y [NÚMERO_OCULTO].',
  },
  resultado: {
    score: 82,
    ruta: 'ia',
    es_phishing: true,
    veredicto: 'malicioso',
    nivel_severidad: 'Alto',
    resumen: 'Detección de patrones de phishing bancario.',
    analisis_tecnico: 'Cabeceras incoherentes con el dominio remitente.',
    justificacion_veredicto: 'Presencia de tácticas de ingeniería social y urgencia.',
    indicadores: [
      { codigo: 'urgencia', descripcion: 'Sentido de urgencia injustificado', peso: 1.25 },
      { codigo: 'dominio_externo', descripcion: 'Dominio remitente externo', peso: -0.5 },
    ],
  },
};

function renderDetail(id = VALID_ID) {
  return render(
    <MemoryRouter initialEntries={[`/analisis/${id}`]} future={routerFuture}>
      <Routes>
        <Route path="/analisis/:id" element={<AnalysisDetailPage />} />
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('P04 · Detalle de análisis (§4.3)', () => {
  it('AC-DET-01: muestra los elementos P04-E1 a P04-E12 con los textos exactos', async () => {
    vi.spyOn(api, 'getAnalysis').mockResolvedValueOnce(MOCK_ANALISIS_MALICIOSO);
    renderDetail();

    // P04-E1: Migas
    expect(await screen.findByText(`Análisis ${VALID_ID.slice(0, 8)}`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Historial' })).toHaveAttribute('href', '/historial');

    // P04-E2: Veredicto h1
    const heading = screen.getByTestId('verdict-heading');
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveTextContent('Malicioso');

    // P04-E3: Medidor de score
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '82');

    // P04-E4: Severidad
    expect(screen.getByTestId('p04-e4')).toHaveTextContent('Severidad: Alto');

    // P04-E5: Ruta
    expect(screen.getByTestId('p04-e5')).toHaveTextContent('Analizado con IA');

    // P04-E6: Datos del correo
    const dataCard = screen.getByTestId('p04-e6');
    expect(dataCard).toHaveTextContent('alerta@banco-seguro.co');
    expect(dataCard).toHaveTextContent('Verifique su cuenta');
    expect(dataCard).toHaveTextContent(/4[.,]2\s*s/);

    // P04-E7: Resumen
    expect(screen.getByRole('heading', { level: 2, name: 'Resumen' })).toBeInTheDocument();
    expect(screen.getByTestId('p04-e7')).toHaveTextContent(
      'Detección de patrones de phishing bancario.',
    );

    // P04-E8: Indicadores detectados
    expect(
      screen.getByRole('heading', { level: 2, name: 'Indicadores detectados' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sentido de urgencia injustificado')).toBeInTheDocument();
    expect(screen.getByText('+1,25')).toBeInTheDocument();

    // P04-E9: Análisis técnico
    expect(screen.getByRole('heading', { level: 2, name: 'Análisis técnico' })).toBeInTheDocument();
    expect(screen.getByTestId('p04-e9')).toHaveTextContent(
      'Cabeceras incoherentes con el dominio remitente.',
    );

    // P04-E10: Justificación del veredicto
    expect(
      screen.getByRole('heading', { level: 2, name: 'Justificación del veredicto' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('p04-e10')).toHaveTextContent(
      'Presencia de tácticas de ingeniería social y urgencia.',
    );

    // P04-E11: Vista previa del correo
    expect(
      screen.getByRole('heading', { level: 2, name: 'Vista previa del correo' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('p04-e11')).toHaveTextContent(/Texto de prueba con enmascarado/);

    // P04-E12: Aviso siempre visible
    expect(screen.getByTestId('p04-e12')).toHaveTextContent(
      'Este resultado es una ayuda para el análisis. Ante la duda, no abra enlaces ni adjuntos y consulte al equipo de seguridad.',
    );
  });

  it('AC-DET-04: texto con <script>alert(1)</script> se renderiza literal y no se ejecuta', async () => {
    const maliciousScript = '<script>alert(1)</script>';
    const xssAnalisis: Analisis = {
      ...MOCK_ANALISIS_MALICIOSO,
      correo: {
        ...MOCK_ANALISIS_MALICIOSO.correo,
        asunto: `Asunto con ${maliciousScript}`,
        cuerpo_enmascarado: `Cuerpo con ${maliciousScript}`,
      },
      resultado: {
        ...MOCK_ANALISIS_MALICIOSO.resultado,
        resumen: `Resumen con ${maliciousScript}`,
      },
    };

    vi.spyOn(api, 'getAnalysis').mockResolvedValueOnce(xssAnalisis);
    renderDetail();

    expect(await screen.findByText(`Asunto con ${maliciousScript}`)).toBeInTheDocument();
    expect(screen.getByText(`Resumen con ${maliciousScript}`)).toBeInTheDocument();
  });

  it('AC-DET-05: un id inválido (no 24 hex) muestra G01 directamente sin llamar a la API', () => {
    const apiSpy = vi.spyOn(api, 'getAnalysis');
    renderDetail('id-invalido-123');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('AC-DET-05: si la API responde 404 muestra G01', async () => {
    vi.spyOn(api, 'getAnalysis').mockRejectedValueOnce(
      new ApiError(404, 'NO_ENCONTRADO', 'No existe'),
    );
    renderDetail('6720c3f1a9b2c4d5e6f79999');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });

  it('permite alternar Ver todo / Ver menos en correos de más de 2000 caracteres (P04-E11)', async () => {
    const longBody = 'X'.repeat(2500);
    const longAnalisis: Analisis = {
      ...MOCK_ANALISIS_MALICIOSO,
      correo: {
        ...MOCK_ANALISIS_MALICIOSO.correo,
        cuerpo_enmascarado: longBody,
      },
    };

    vi.spyOn(api, 'getAnalysis').mockResolvedValueOnce(longAnalisis);
    renderDetail();

    const toggleBtn = await screen.findByTestId('toggle-full-email');
    expect(toggleBtn).toHaveTextContent('Ver todo');
    expect(screen.getByTestId('p04-e11')).toHaveTextContent(`${'X'.repeat(2000)}…`);

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent('Ver menos');
    expect(screen.getByTestId('p04-e11')).toHaveTextContent(longBody);
  });
});
