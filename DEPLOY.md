# Despliegue del frontend (web) en Vercel

> **La guía completa (Supabase, Gemini, seed, backend en Render, CI, verificación y solución de
> problemas) está en el repo del backend:**
> [Plantini-BackEnd → DEPLOY.md](https://github.com/CamiloRaphaelZuletaWolff/Plantini-BackEnd/blob/main/DEPLOY.md).
> Este archivo resume solo la parte de Vercel. Hazla **después** de tener el backend en Render
> (necesitas su URL).

## Qué hay en este repo para el despliegue

| Archivo | Para qué |
|---|---|
| `vercel.json` | `npm ci` → `npx expo export --platform web` → publica `dist/`, y reescribe todas las rutas a `/index.html` (SPA). |
| `.github/workflows/ci.yml` | En cada push/PR: `npm ci`, `npm run typecheck`, `npm test` y `npx expo export --platform web` (Node 22). |
| `.env.example` | Variables que necesita la app (copia a `.env` para desarrollo local). |
| `src/components/map/mapPrimitives.web.tsx` | Mapa web con Leaflet + OpenStreetMap (gratis, sin API key). En móvil se sigue usando `react-native-maps`. |
| `babel.config.js` | Activa `unstable_transformImportMeta`: sin esto la web queda en blanco con *"Cannot use 'import.meta' outside a module"* (lo provoca el build ESM de `zustand`). |

> Hay dos lockfiles (`package-lock.json` y `yarn.lock`). Vercel usa `npm ci` por `vercel.json`;
> **borra `yarn.lock`** para evitar confusiones: `git rm yarn.lock && git commit -m "chore: use npm only"`.

## Pasos en Vercel (resumen)

1. <https://vercel.com/new> → **Import** `Plantini-FrontEnd` (si no aparece: *Adjust GitHub App Permissions*).
2. **Project Name:** `voluntariado-upb` (tu URL será `https://voluntariado-upb.vercel.app`).
3. **Framework Preset:** `Other`. **Root Directory:** `./`. No cambies *Build and Output Settings* (los define `vercel.json`).
4. **Environment Variables** (Production + Preview + Development):

| Name | Value |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key de Supabase (**nunca** la service_role) |
| `EXPO_PUBLIC_GEMINI_BASE_URL` | URL de Render sin `/api` ni `/` final, p. ej. `https://plantini-backend.onrender.com` |

5. **Deploy** (3–6 min).
6. Copia tu dominio de Vercel y:
   - En **Render** → `plantini-backend` → **Environment** → `CORS_ORIGINS=https://voluntariado-upb.vercel.app` → *Save and deploy*.
   - En **Supabase** → Authentication → **URL Configuration** → *Site URL* = tu dominio de Vercel y en *Redirect URLs* añade `https://voluntariado-upb.vercel.app/**`.

> Las variables `EXPO_PUBLIC_*` se incrustan en el bundle **al compilar**: si cambias alguna, haz
> **Deployments → ⋯ → Redeploy**. Son públicas por diseño; no pongas secretos ahí.

## Probar el build web en local

```bash
npm ci
cp .env.example .env   # y rellena los valores
npx expo export --platform web
npx serve dist --single   # abre http://localhost:3000
```

## Notas de la versión web

- **Mapa:** Leaflet + OpenStreetMap con los mismos pines, tarjetas y navegación al detalle que en móvil.
- **Notificaciones push/locales y tareas en segundo plano:** solo móvil; en web se omiten sin errores.
- **Chatbot:** si el backend gratuito de Render estaba dormido, la primera respuesta tarda ~1 min y la
  app muestra *"Despertando el servidor gratuito, ~1 min…"*.
- **Login:** email + contraseña. Cuenta demo pública (creada por el seed del backend):
  `estudiante@upb.edu.bo` / `Password123!` (o el valor de `SEED_STUDENT_PASSWORD`). Las cuentas
  `organizador@upb.edu.bo` y `admin@upb.edu.bo` usan contraseñas secretas (`SEED_ORGANIZER_PASSWORD`,
  `SEED_ADMIN_PASSWORD`): **no las publiques** (ver *Cargar datos de demo* en el DEPLOY.md del backend).
- **Cabeceras de seguridad:** `vercel.json` añade CSP, `X-Frame-Options: DENY`, `nosniff`,
  `Referrer-Policy` y HSTS. La CSP permite conectarse a `*.supabase.co` y `*.onrender.com`; si
  despliegas el backend en otro dominio, añádelo a `connect-src` en `vercel.json`.
- **Sesión en web:** Supabase guarda la sesión en `localStorage` (comportamiento estándar de
  supabase-js en el navegador). Por eso importa que no haya XSS: la app no usa
  `dangerouslySetInnerHTML` y el chat y el mapa renderizan texto, no HTML.
