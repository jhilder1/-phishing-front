import { Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { DemoModeProvider } from './context/DemoModeContext';
import { AnalysisDetailPage } from './pages/AnalysisDetailPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';

/** Rutas principales: Página de entrada en '/', Tablero en '/tablero', Analizador e Historial. */
export function App() {
  return (
    <ErrorBoundary>
      <DemoModeProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="tablero" element={<DashboardPage />} />
            <Route path="analizar" element={<AnalyzePage />} />
            <Route path="analisis/:id" element={<AnalysisDetailPage />} />
            <Route path="historial" element={<HistoryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </DemoModeProvider>
    </ErrorBoundary>
  );
}
