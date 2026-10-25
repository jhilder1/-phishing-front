# Detector de Phishing · Frontend

Interfaz web de la demo del **Detector de Phishing con IA**, según
`ESPECIFICACION_INTERFAZ_PHISHING.md` v2.0 (reducida).

- React 18.3 + Vite 5 + React Router 6 + Recharts 2 + TypeScript (`strict`)
- Un solo archivo CSS con variables (sin librerías de estilos)
- `fetch` nativo hacia `/api/*` (contrato del §5)

## Requisitos

- Node.js 20 LTS o superior
- npm 10

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
npm run dev                  # http://localhost:5173 (proxy /api → http://localhost:3001)
```

Sin backend disponible, use la API simulada:

```bash
npm run dev:mock
```

## Scripts

| Script             | Función                                               |
| ------------------ | ----------------------------------------------------- |
| `npm run dev`      | Vite en el puerto 5173 con proxy de `/api` hacia 3001 |
| `npm run dev:mock` | Igual, pero con la API simulada en el navegador       |
| `npm run build`    | Verificación de tipos y compilación en `dist/`        |
| `npm run preview`  | Sirve `dist/` localmente                              |
| `npm test`         | Pruebas unitarias (Vitest)                            |
| `npm run lint`     | ESLint + Prettier en modo verificación                |
| `npm run format`   | Formatea el código con Prettier                       |

## Variables de entorno

| Variable               | Descripción                                                                   |
| ---------------------- | ----------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`    | Vacío = mismo origen (`/api`). URL absoluta solo si el backend habilita CORS. |
| `VITE_API_MOCK`        | `true` para usar la API simulada.                                             |
| `DEV_API_PROXY_TARGET` | Solo desarrollo: destino del proxy de `/api`.                                 |

> Todo lo que empieza por `VITE_` queda visible en el navegador. **Nunca** coloque
> aquí la URL ni la clave de n8n.

## Estructura

```
src/
├─ components/   # Componentes reutilizables (Layout, etc.)
├─ lib/          # Configuración, rutas, cliente de API, formatos, validación
├─ pages/        # P02 Tablero, P03 Analizar, P04 Detalle, P05 Historial, G01
├─ styles/       # app.css (tokens del §10.1)
└─ test/         # Configuración de pruebas
```

## Seguridad

ESLint falla si aparece `dangerouslySetInnerHTML`, `innerHTML`, `eval` (AC-SEC-02) o el
uso de `localStorage`, `sessionStorage` o cookies (§8.3).
