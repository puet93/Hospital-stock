-- =============================================================================
-- Farmacia hospitalaria — esquema completo para Supabase (Postgres)
-- =============================================================================
-- Cómo usar:
-- 1. Supabase Dashboard → SQL Editor → New query
-- 2. Pegá todo este archivo y ejecutá (Run).
-- 3. Después ejecutá por separado: supabase/migrations/0001_profile_on_signup.sql
--    (crea el perfil al registrarse vía Supabase Auth).
--
-- Equivale a drizzle/0000_init.sql + drizzle/0001_unique_location_sector_code.sql
-- =============================================================================

CREATE TYPE "public"."alert_severity" AS ENUM('info', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('stock_bajo', 'quiebre_stock', 'vencimiento_proximo', 'lote_vencido', 'stock_inmovilizado', 'sobrestock', 'consumo_anomalo', 'diferencia_inventario', 'sustitucion_posible');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('ingreso', 'egreso', 'transferencia', 'ajuste', 'devolucion', 'merma', 'cuarentena', 'desbloqueo', 'reserva', 'liberacion_reserva');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'farmacia_jefe', 'farmaceutico', 'deposito', 'auditor', 'solo_lectura');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_type" "alert_type" NOT NULL,
	"severity" "alert_severity" DEFAULT 'warning' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"inventory_lot_id" uuid,
	"commercial_product_id" uuid,
	"dismissed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "brand_equivalence_pairs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commercial_product_id_a" uuid NOT NULL,
	"commercial_product_id_b" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commercial_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presentation_id" uuid NOT NULL,
	"brand_name" text NOT NULL,
	"barcode" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consumption_daily_aggregates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day" date NOT NULL,
	"commercial_product_id" uuid NOT NULL,
	"sector_id" uuid,
	"location_id" uuid,
	"qty_out" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drug_equivalence_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drug_id_a" uuid NOT NULL,
	"drug_id_b" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drugs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory_lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commercial_product_id" uuid NOT NULL,
	"lot_number" text NOT NULL,
	"expiry_date" date NOT NULL,
	"entry_date" date NOT NULL,
	"supplier_id" uuid,
	"unit_cost_ars_cents" integer DEFAULT 0 NOT NULL,
	"location_id" uuid NOT NULL,
	"qty_available" integer DEFAULT 0 NOT NULL,
	"qty_reserved" integer DEFAULT 0 NOT NULL,
	"qty_blocked" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"is_storage" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "operational_equivalence_group_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"commercial_product_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operational_equivalence_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "presentations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drug_id" uuid NOT NULL,
	"dosage_form" text NOT NULL,
	"strength" text NOT NULL,
	"unit" text NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"full_name" text,
	"role" "user_role" DEFAULT 'solo_lectura' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"movement_type" "movement_type" NOT NULL,
	"inventory_lot_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"from_location_id" uuid,
	"to_location_id" uuid,
	"sector_id" uuid,
	"reference" text,
	"notes" text,
	"performed_by" uuid,
	"performed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "stock_thresholds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commercial_product_id" uuid NOT NULL,
	"location_id" uuid,
	"min_qty" integer DEFAULT 0 NOT NULL,
	"max_qty" integer,
	"expiry_warning_days" integer DEFAULT 90 NOT NULL,
	"immobile_days_warning" integer DEFAULT 180 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"contact" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_inventory_lot_id_inventory_lots_id_fk" FOREIGN KEY ("inventory_lot_id") REFERENCES "public"."inventory_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_commercial_product_id_commercial_products_id_fk" FOREIGN KEY ("commercial_product_id") REFERENCES "public"."commercial_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_equivalence_pairs" ADD CONSTRAINT "brand_equivalence_pairs_commercial_product_id_a_commercial_products_id_fk" FOREIGN KEY ("commercial_product_id_a") REFERENCES "public"."commercial_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_equivalence_pairs" ADD CONSTRAINT "brand_equivalence_pairs_commercial_product_id_b_commercial_products_id_fk" FOREIGN KEY ("commercial_product_id_b") REFERENCES "public"."commercial_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commercial_products" ADD CONSTRAINT "commercial_products_presentation_id_presentations_id_fk" FOREIGN KEY ("presentation_id") REFERENCES "public"."presentations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumption_daily_aggregates" ADD CONSTRAINT "consumption_daily_aggregates_commercial_product_id_commercial_products_id_fk" FOREIGN KEY ("commercial_product_id") REFERENCES "public"."commercial_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumption_daily_aggregates" ADD CONSTRAINT "consumption_daily_aggregates_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumption_daily_aggregates" ADD CONSTRAINT "consumption_daily_aggregates_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_equivalence_links" ADD CONSTRAINT "drug_equivalence_links_drug_id_a_drugs_id_fk" FOREIGN KEY ("drug_id_a") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_equivalence_links" ADD CONSTRAINT "drug_equivalence_links_drug_id_b_drugs_id_fk" FOREIGN KEY ("drug_id_b") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_commercial_product_id_commercial_products_id_fk" FOREIGN KEY ("commercial_product_id") REFERENCES "public"."commercial_products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operational_equivalence_group_items" ADD CONSTRAINT "operational_equivalence_group_items_group_id_operational_equivalence_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."operational_equivalence_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operational_equivalence_group_items" ADD CONSTRAINT "operational_equivalence_group_items_commercial_product_id_commercial_products_id_fk" FOREIGN KEY ("commercial_product_id") REFERENCES "public"."commercial_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentations" ADD CONSTRAINT "presentations_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inventory_lot_id_inventory_lots_id_fk" FOREIGN KEY ("inventory_lot_id") REFERENCES "public"."inventory_lots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_from_location_id_locations_id_fk" FOREIGN KEY ("from_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_to_location_id_locations_id_fk" FOREIGN KEY ("to_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performed_by_profiles_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_thresholds" ADD CONSTRAINT "stock_thresholds_commercial_product_id_commercial_products_id_fk" FOREIGN KEY ("commercial_product_id") REFERENCES "public"."commercial_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_thresholds" ADD CONSTRAINT "stock_thresholds_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alerts_active_idx" ON "alerts" USING btree ("dismissed_at");--> statement-breakpoint
CREATE INDEX "alerts_type_idx" ON "alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_eq_pair_unique" ON "brand_equivalence_pairs" USING btree ("commercial_product_id_a","commercial_product_id_b");--> statement-breakpoint
CREATE UNIQUE INDEX "consumption_day_product_sector_loc" ON "consumption_daily_aggregates" USING btree ("day","commercial_product_id","sector_id","location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "drug_eq_pair_unique" ON "drug_equivalence_links" USING btree ("drug_id_a","drug_id_b");--> statement-breakpoint
CREATE UNIQUE INDEX "drugs_code_unique" ON "drugs" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "lot_product_loc_unique" ON "inventory_lots" USING btree ("commercial_product_id","lot_number","location_id");--> statement-breakpoint
CREATE INDEX "inventory_lots_expiry_idx" ON "inventory_lots" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "inventory_lots_product_idx" ON "inventory_lots" USING btree ("commercial_product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "op_eq_group_product_unique" ON "operational_equivalence_group_items" USING btree ("group_id","commercial_product_id");--> statement-breakpoint
CREATE INDEX "stock_movements_lot_idx" ON "stock_movements" USING btree ("inventory_lot_id");--> statement-breakpoint
CREATE INDEX "stock_movements_performed_idx" ON "stock_movements" USING btree ("performed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "threshold_product_loc_unique" ON "stock_thresholds" USING btree ("commercial_product_id","location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_code_unique" ON "locations" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "sectors_code_unique" ON "sectors" USING btree ("code");
