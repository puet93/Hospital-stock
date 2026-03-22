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

Sin variables de Supabase, el **middleware** no exige login y podés abrir `/dashboard` para revisar la UI. Con Supabase activo, las rutas de la aplicación redirigen a `/login`.

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

- `vercel.json` define un cron diario (`0 6 * * *`) contra `/api/cron/evaluate-alerts`.
- En Vercel, definí la variable de entorno **`CRON_SECRET`**. El endpoint espera cabecera `Authorization: Bearer <CRON_SECRET>` (comportamiento estándar de Vercel Cron).
- Asegurá también `DATABASE_URL` en el proyecto desplegado.

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
