# Detector de Phishing - Frontend

Interfaz web para la detección y análisis de correos sospechosos y visualización de métricas de seguridad.

## Requisitos

- Node.js >= 20
- npm >= 10

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Modo desarrollo con simulación de datos (mock)
npm run dev:mock

# Compilación para producción
npm run build

# Ejecutar pruebas unitarias
npm test

# Verificación de código y estilos
npm run lint
```

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:5173`.
- `npm run dev:mock`: Inicia el servidor de desarrollo utilizando datos simulados locales.
- `npm run build`: Valida tipos TypeScript y genera los archivos estáticos en `dist/`.
- `npm run preview`: Previsualiza localmente la compilación de producción.
- `npm test`: Ejecuta las pruebas automatizadas con Vitest.
- `npm run lint`: Ejecuta el análisis estático de código (ESLint) y validación de formato (Prettier).
- `npm run format`: Corrige automáticamente el formateo de archivos.

## Variables de entorno

Consulte `.env.example` para configurar las variables requeridas en desarrollo o despliegue.
