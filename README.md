# Hospital-stock

Repositorio: [github.com/puet93/Hospital-stock](https://github.com/puet93/Hospital-stock)

Sistema web para **farmacia hospitalaria** en Argentina: ubicaciones, stock por lote, vencimientos, trazabilidad interna, tendencias de consumo, equivalencias administrables y alertas operativas. **No** prescribe ni sugiere tratamientos; el foco es inventario, logística, auditoría y análisis.

- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres + Auth) · Drizzle ORM · Zod · Recharts · TanStack Table · date-fns · react-hook-form · Vitest  
- **UI:** español · moneda por defecto **ARS** · zona horaria de referencia **America/Argentina/Buenos_Aires**

## Requisitos

- Node.js 20+
- Proyecto en [Supabase](https://supabase.com) (o Postgres compatible)
- Cuenta [Vercel](https://vercel.com) para despliegue y cron

## Configuración local

1. Clonar y dependencias:

   ```bash
   cd farmacia-hospital-stock-ar
   npm install
   ```

2. Copiar variables:

   ```bash
   cp .env.example .env.local
   ```

   Completar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `DATABASE_URL` (cadena directa Postgres de Supabase: *Settings → Database*).

3. Aplicar esquema en la base (elegí una opción):

   - **Supabase SQL Editor (recomendado si no usás Drizzle desde local):** abrí el archivo [`supabase/APPLY_IN_SQL_EDITOR.sql`](./supabase/APPLY_IN_SQL_EDITOR.sql), copiá todo el contenido y ejecutalo en **Supabase → SQL → New query**. Luego ejecutá [`supabase/migrations/0001_profile_on_signup.sql`](./supabase/migrations/0001_profile_on_signup.sql) para el trigger de perfiles al registrarse.

   - **Drizzle Push** (rápido en desarrollo):

     ```bash
     npm run db:push
     ```

   - **Migraciones SQL generadas:** en orden, `drizzle/0000_init.sql` y `drizzle/0001_unique_location_sector_code.sql`, o `drizzle-kit migrate`.

4. (Opcional) Trigger de perfil al registrarse: ejecutá `supabase/migrations/0001_profile_on_signup.sql` en Supabase después de crear las tablas. Asigná roles manualmente en `profiles.role` para el primer administrador.

5. Datos demo:

   ```bash
   npm run db:seed
   ```

6. Arrancar:

   ```bash
   npm run dev
   ```

**Autenticación:** por defecto **no** hay login: `/` y el panel abren directo (cualquiera con la URL ve los datos; usalo solo en entornos de prueba o detrás de otra capa). Para exigir Supabase Auth en rutas `(main)`, definí **`AUTH_REQUIRED=1`** en el entorno (Vercel / `.env.local`). Sin variables de Supabase, el login no puede funcionar aunque actives `AUTH_REQUIRED`.

**Vercel:** no hay archivo `middleware.ts` en la raíz. Cualquier middleware en Edge en este stack disparaba `MIDDLEWARE_INVOCATION_FAILED` / `__dirname is not defined`. La sesión se refresca al usar `createClient()` + `getUser()` en layouts/páginas servidor (`src/lib/supabase/server.ts`).

## Scripts

| Script            | Descripción                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Desarrollo Next.js                               |
| `npm run build`   | Build producción                                 |
| `npm run test`    | Vitest (FEFO y consumo)                          |
| `npm run db:push` | Sincronizar esquema Drizzle → DB                 |
| `npm run db:generate` | Generar migración desde `src/db/schema.ts`   |
| `npm run db:migrate`  | Aplicar migraciones (Drizzle)                |
| `npm run db:studio`   | Drizzle Studio                               |
| `npm run db:seed`     | Seed TypeScript reproducible                 |

## Vercel y cron

- `vercel.json` fija **`framework: "nextjs"`** y deja `buildCommand` / `outputDirectory` / `installCommand` en **`null`** (valor automático del builder de Next). Así se evita que un override viejo en el dashboard sirva una carpeta vacía y devuelva 404. También define el cron (`0 6 * * *`) hacia `/api/cron/evaluate-alerts`.
- En Vercel, definí **`CRON_SECRET`**. El cron envía `Authorization: Bearer <CRON_SECRET>`.

### Variables de entorno en Vercel (Production)

| Variable | Obligatoria | Notas |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Solo si usás login | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Solo si usás login | Clave anon del proyecto |
| `AUTH_REQUIRED` | Opcional | `1` para exigir login en `(main)`; **sin definir**, el panel es público (provisional). |
| `DATABASE_URL` | Sí (panel con datos) | URI `postgresql://...` (pooler 6543 recomendado), **no** la URL `https://` de Supabase |
| `CRON_SECRET` | Para el cron | Cualquier string secreto; igual en Vercel y en el job |

Sin `AUTH_REQUIRED`, no hace falta Supabase para **entrar** al panel; igual podés dejar las vars públicas si más adelante activás login. `DATABASE_URL` mal puesta no suele dar 404, sino error al consultar la DB.

**Supabase Auth en producción:** en *Authentication → URL configuration* cargá la URL de Vercel en **Site URL** (ej. `https://tu-proyecto.vercel.app`) y en **Redirect URLs** agregá `https://tu-proyecto.vercel.app/auth/callback` (y `http://localhost:3000/auth/callback` para local). Sin esto, el login con magic link / OAuth puede fallar aunque el deploy esté bien.

**Postgres desde Vercel:** preferí la cadena **Transaction pooler** (puerto **6543**, host `*.pooler.supabase.com`, con `?pgbouncer=true` si el panel la muestra). El puerto **5432** directo a `db.*.supabase.co` a veces agota conexiones o da timeouts con muchas invocaciones serverless.

**Diagnóstico:** abrí `https://tu-dominio.vercel.app/api/health` → debe responder JSON `{"ok":true,"env":{...}}`. Si ahí también ves 404 de plataforma, el problema es de enrutado/deploy en Vercel, no de una env concreta.

### Si el deploy está “Ready” pero ves `404: NOT_FOUND`

En **Next.js en Vercel** no hay “carpeta de salida” manual: el build tiene que correr **en la raíz del repo donde está `package.json` y `next.config.ts`**.

1. **Project → Settings → General → Root Directory**  
   - Debe estar **vacío** si esos archivos están en la raíz del repo `Hospital-stock`.  
   - Si el código vive en una subcarpeta (ej. `farmacia-hospital-stock-ar/`), poné **esa** ruta como Root Directory.

2. **Settings → Build & Development → Output Directory**  
   - Para Next.js debe estar **vacío** (no pongas `.next` ni `out`). Si lo configuraste, borralo; un valor incorrecto provoca **404 en toda la app** aunque el log diga `Route (app)` y “Deployment completed”.  
   - Si el UI tiene un toggle **Override**, apagalo para Output Directory (no alcanza con “borrar el texto” si el override sigue forzando un valor).

3. **Framework Preset**  
   - Debe ser **Next.js**. El `vercel.json` del repo fija `"framework": "nextjs"` para alinear con el builder correcto aunque el dashboard haya quedado en “Other”.

4. **Dominio que abrís** — En Vercel, abrí el deploy → **Visit** (o copiá la URL “Production” de ese proyecto). A veces el enlace del repo de GitHub (`hospital-stock.vercel.app`) apunta a **otro** proyecto Vercel viejo o sin este código; ese caso da `404 NOT_FOUND` de plataforma en todas las rutas.

5. Volvé a **Redeploy** tras corregir.

Si Root y Output ya están vacíos y sigue el 404:

6. **Mismo código en GitHub** — En la raíz del repo tiene que haber `package.json`, `next.config.ts` y la carpeta `src/app/` (no solo un submódulo o README). Abrí [tu repo en GitHub](https://github.com/puet93/Hospital-stock) y comprobá el árbol de archivos.

7. **Rama de producción** — *Settings → Git → Production Branch* debe ser la rama que estás pusheando (normalmente `main`).

8. **Build** — En el deploy → **Building** → el log debería mostrar algo como `Route (app)` con `/`, `/login`, `/dashboard`, etc. Si no aparece, el build no es el de Next.

9. **Overrides** — En *Settings → General* dejá vacíos **Build Command** e **Install Command** (sin override). Vercel usa `next build` automático para Next.js.

10. **Redeploy sin caché** — Deployments → … en el último → **Redeploy** → marca **Clear build cache**.

11. **Probar rutas** — `https://tu-proyecto.vercel.app/login` y `https://tu-proyecto.vercel.app/dashboard` (a veces el preview del dashboard de Vercel apunta a una URL vieja).

## Reglas de negocio (resumen)

- **Jerarquía:** droga → presentación → producto comercial → lote (con número, vencimiento, ingreso, proveedor, costo en centavos ARS, ubicación, disponible/reservado/bloqueado).
- **FEFO:** `lib/stock/fefo.ts` — orden por vencimiento y desempate por fecha de ingreso.
- **Equivalencias:** tablas `drug_equivalence_links`, `operational_equivalence_groups` (+ ítems), `brand_equivalence_pairs` — todo configurable; sin inferencia clínica automática.
- **Movimientos:** enum en `movement_type` (ingreso, egreso, transferencia, ajuste, devolución, merma, cuarentena, desbloqueo, reserva, liberación).
- **Alertas:** tipos en `alert_type`; evaluación de ejemplo en `lib/alerts/evaluate.ts` y persistencia vía cron.
- **Roles (app):** `user_role` en `profiles` — admin, farmacia_jefe, farmaceutico, deposito, auditor, solo_lectura. La autorización fina por ruta/API queda para iterar según políticas del hospital.

## Estructura útil

- `src/db/schema.ts` — modelo Drizzle  
- `src/lib/stock/` — FEFO y consumo (medias móviles, cobertura, anomalías)  
- `src/app/(main)/` — páginas con shell (panel, lotes, etc.)  
- `src/app/api/cron/evaluate-alerts/` — job protegido  
- `drizzle/` — migraciones SQL generadas  
- `scripts/seed.ts` + `seeds/seed.sql` — semillas  

## Licencia

Uso interno / proyecto hospitalario — ajustá la licencia según tu organización.
