# Detector de Phishing - Frontend

Interfaz web profesional para la detección y análisis de correos sospechosos y visualización de métricas de seguridad en tiempo real.

Desarrollada con **React 18**, **TypeScript** (modo estricto), **Vite**, **React Router v6** y **Recharts**, cumpliendo rigurosamente los estándares de accesibilidad WCAG AA, seguridad OWASP y diseño corporativo.

---

## Características principales

- **P02 · Tablero:** 4 tarjetas KPI con métricas agregadas a 30 días, gráfico de barras apiladas por día (`Recharts`), top 5 de indicadores frecuentes y tabla con los 10 análisis más recientes.
- **P03 · Analizar correo:** Pestañas para pegar contenido libre o seleccionar casos de prueba preconfigurados, validación en vivo, aviso de privacidad, contador de caracteres y cancelación de solicitud con `AbortController`.
- **P04 · Detalle de análisis:** Visualización exhaustiva con medidor de puntaje de riesgo (`role="meter"` con marcas visuales en 30 y 75), insignias de severidad y ruta, desglose técnico de indicadores, justificación del veredicto y vista previa segura del correo.
- **P05 · Historial:** Filtrado multi-criterio por casillas sincronizado en la URL, paginación dinámica (20 elementos por página) y estados vacíos/de error con reintento.
- **G01 · Página no encontrada:** Manejo amigable de rutas no definidas o identificadores no encontrados.
- **Simulador local de alta fidelidad:** Capa mock determinista en memoria (100 registros con distribución estadística exacta y enmascaramiento de datos personales según §6.3), permitiendo ejecutar, probar y demostrar la aplicación sin dependencias externas.

---

## Requisitos

- **Node.js** >= 20.x
- **npm** >= 10.x

---

## Instalación y ejecución local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo interactivo (con mock local activado)
npm run dev:mock

# O iniciar contra un backend API real
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

---

## Scripts disponibles

| Comando            | Descripción                                                     |
| ------------------ | --------------------------------------------------------------- |
| `npm run dev`      | Inicia el servidor de desarrollo Vite                           |
| `npm run dev:mock` | Inicia el entorno local con simulación de API integrada         |
| `npm run build`    | Compila TypeScript y genera el paquete de producción en `dist/` |
| `npm run preview`  | Previsualiza localmente el paquete de producción de `dist/`     |
| `npm test`         | Ejecuta la suite completa de pruebas automatizadas con Vitest   |
| `npm run e2e`      | Ejecuta la prueba end-to-end del flujo crítico de análisis      |
| `npm run lint`     | Ejecuta ESLint (con reglas estrictas de seguridad) y Prettier   |
| `npm run format`   | Corrige automáticamente el formato de código con Prettier       |

---

## Pruebas automatizadas

El proyecto cuenta con cobertura exhaustiva de pruebas unitarias, de integración y de extremo a extremo:

```bash
# Ejecutar suite de pruebas
npm test

# Ejecutar prueba de flujo crítico
npm run e2e
```

- **AC-TEST-01:** Normalizador del motor con soporte para `output`, indicadores como cadena u objeto, resolución de ruta y límites de score.
- **AC-TEST-02:** Cálculo de veredicto con 100% de cobertura en ramas y límites 29, 30 y 75.
- **AC-TEST-03:** Métricas agregadas y enmascaramiento de correos y números largos sobre datos de siembra.
- **AC-TEST-04:** Flujo crítico completo: abrir `/analizar` → elegir muestra → analizar → ver detalle con veredicto "Malicioso" → verificar inclusión inmediata en la primera fila de `/historial`.

---

## Seguridad y accesibilidad

- **Sin almacenamiento inseguro en navegador:** Se prohíbe el uso de `localStorage`, `sessionStorage` y `document.cookie`. El estado de navegación y filtros se sincroniza exclusivamente mediante parámetros de URL.
- **Prevención de XSS:** Se prohíbe terminantemente `dangerouslySetInnerHTML`, `innerHTML` y `eval()`, forzado mediante reglas personalizadas de ESLint en AST.
- **Accesibilidad (WCAG AA):**
  - Navegación completa por teclado con indicador de foco de alto contraste (`#0B5FFF` de 2 px).
  - Contraste superior a 4,5:1 en todos los elementos y estados.
  - El veredicto siempre combina color, icono SVG y texto explícito (nunca solo color).
  - Un solo encabezado `<h1>` semántico por pantalla.

---

## Despliegue en la nube

El proyecto está preparado para desplegarse de manera inmediata en cualquier plataforma moderna de nube:

### Opción 1: Vercel

El repositorio incluye `vercel.json` con reescritura SPA a `/index.html`:

```bash
# Vercel CLI
npx vercel --prod
```

### Opción 2: Netlify

El repositorio incluye `netlify.toml` preconfigurado con publicación de `dist` y regla de redirección `/*` a `/index.html`:

```bash
# Netlify CLI
npx netlify deploy --prod --dir=dist
```

### Opción 3: Contenedor Docker / Cloud Run / AWS ECS

El repositorio incluye `Dockerfile` multi-etapa y `nginx.conf` optimizado con gzip, encabezados de caché para activos con hash y soporte SPA:

```bash
# Construir imagen Docker
docker build -t phishing-detector-front:latest .

# Ejecutar localmente en el puerto 8080
docker run -d -p 8080:80 phishing-detector-front:latest
```

---

## Variables de entorno

Consulte `.env.example`:

| Variable               | Tipo     | Por defecto             | Descripción                                                                    |
| ---------------------- | -------- | ----------------------- | ------------------------------------------------------------------------------ |
| `VITE_API_BASE_URL`    | String   | `""`                    | URL base de la API REST. Dejar vacío para llamadas al mismo origen (`/api/*`). |
| `VITE_API_MOCK`        | Booleano | `false`                 | Activa la simulación de API en el cliente para demos sin backend.              |
| `DEV_API_PROXY_TARGET` | String   | `http://localhost:3001` | Destino del proxy inverso de Vite durante el desarrollo.                       |
