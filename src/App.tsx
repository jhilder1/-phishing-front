import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DemoModeProvider } from './context/DemoModeContext';
import { AnalysisDetailPage } from './pages/AnalysisDetailPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { NotFoundPage } from './pages/NotFoundPage';

/** Rutas exactas del §4.0. Cualquier otra ruta muestra G01. */
export function App() {
  return (
    <DemoModeProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="analizar" element={<AnalyzePage />} />
          <Route path="analisis/:id" element={<AnalysisDetailPage />} />
          <Route path="historial" element={<HistoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </DemoModeProvider>
  );
}
