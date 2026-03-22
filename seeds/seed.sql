-- Referencia: datos demo equivalentes a `npm run db:seed`.
-- Ejecutar solo si preferís SQL puro (tras migraciones Drizzle).
-- Los UUID dependen de inserciones previas; el script TypeScript es reproducible.

-- Ejemplo de orden de inserción:
-- 1. locations, sectors, suppliers
-- 2. drugs → presentations → commercial_products
-- 3. brand_equivalence_pairs, operational_equivalence_groups + items
-- 4. stock_thresholds
-- 5. inventory_lots
-- 6. consumption_daily_aggregates

-- Ver scripts/seed.ts para valores concretos y detección de duplicados.
