import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  date,
  pgEnum,
  uniqueIndex,
  index,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "farmacia_jefe",
  "farmaceutico",
  "deposito",
  "auditor",
  "solo_lectura",
]);

export const movementTypeEnum = pgEnum("movement_type", [
  "ingreso",
  "egreso",
  "transferencia",
  "ajuste",
  "devolucion",
  "merma",
  "cuarentena",
  "desbloqueo",
  "reserva",
  "liberacion_reserva",
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "stock_bajo",
  "quiebre_stock",
  "vencimiento_proximo",
  "lote_vencido",
  "stock_inmovilizado",
  "sobrestock",
  "consumo_anomalo",
  "diferencia_inventario",
  "sustitucion_posible",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "info",
  "warning",
  "critical",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email"),
  fullName: text("full_name"),
  role: userRoleEnum("role").notNull().default("solo_lectura"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const drugs = pgTable(
  "drugs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code"),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("drugs_code_unique").on(t.code)]
);

export const presentations = pgTable("presentations", {
  id: uuid("id").primaryKey().defaultRandom(),
  drugId: uuid("drug_id")
    .notNull()
    .references(() => drugs.id, { onDelete: "restrict" }),
  dosageForm: text("dosage_form").notNull(),
  strength: text("strength").notNull(),
  unit: text("unit").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const commercialProducts = pgTable("commercial_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  presentationId: uuid("presentation_id")
    .notNull()
    .references(() => presentations.id, { onDelete: "restrict" }),
  brandName: text("brand_name").notNull(),
  barcode: text("barcode"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  contact: text("contact"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const sectors = pgTable(
  "sectors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code"),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("sectors_code_unique").on(t.code)]
);

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code"),
    name: text("name").notNull(),
    isStorage: boolean("is_storage").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("locations_code_unique").on(t.code)]
);

export const inventoryLots = pgTable(
  "inventory_lots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commercialProductId: uuid("commercial_product_id")
      .notNull()
      .references(() => commercialProducts.id, { onDelete: "restrict" }),
    lotNumber: text("lot_number").notNull(),
    expiryDate: date("expiry_date").notNull(),
    entryDate: date("entry_date").notNull(),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    unitCostArsCents: integer("unit_cost_ars_cents").notNull().default(0),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    qtyAvailable: integer("qty_available").notNull().default(0),
    qtyReserved: integer("qty_reserved").notNull().default(0),
    qtyBlocked: integer("qty_blocked").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("lot_product_loc_unique").on(
      t.commercialProductId,
      t.lotNumber,
      t.locationId
    ),
    index("inventory_lots_expiry_idx").on(t.expiryDate),
    index("inventory_lots_product_idx").on(t.commercialProductId),
  ]
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    movementType: movementTypeEnum("movement_type").notNull(),
    inventoryLotId: uuid("inventory_lot_id")
      .notNull()
      .references(() => inventoryLots.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    fromLocationId: uuid("from_location_id").references(() => locations.id),
    toLocationId: uuid("to_location_id").references(() => locations.id),
    sectorId: uuid("sector_id").references(() => sectors.id),
    reference: text("reference"),
    notes: text("notes"),
    performedBy: uuid("performed_by").references(() => profiles.id),
    performedAt: timestamp("performed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    metadata: jsonb("metadata"),
  },
  (t) => [
    index("stock_movements_lot_idx").on(t.inventoryLotId),
    index("stock_movements_performed_idx").on(t.performedAt),
  ]
);

/** Equivalencia explícita entre drogas (no clínica automática; administrable). */
export const drugEquivalenceLinks = pgTable(
  "drug_equivalence_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    drugIdA: uuid("drug_id_a")
      .notNull()
      .references(() => drugs.id, { onDelete: "cascade" }),
    drugIdB: uuid("drug_id_b")
      .notNull()
      .references(() => drugs.id, { onDelete: "cascade" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("drug_eq_pair_unique").on(t.drugIdA, t.drugIdB)]
);

export const operationalEquivalenceGroups = pgTable(
  "operational_equivalence_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  }
);

export const operationalEquivalenceGroupItems = pgTable(
  "operational_equivalence_group_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => operationalEquivalenceGroups.id, {
        onDelete: "cascade",
      }),
    commercialProductId: uuid("commercial_product_id")
      .notNull()
      .references(() => commercialProducts.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("op_eq_group_product_unique").on(
      t.groupId,
      t.commercialProductId
    ),
  ]
);

/** Misma composición y concentración, distinta marca — vínculo manual. */
export const brandEquivalencePairs = pgTable(
  "brand_equivalence_pairs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commercialProductIdA: uuid("commercial_product_id_a")
      .notNull()
      .references(() => commercialProducts.id, { onDelete: "cascade" }),
    commercialProductIdB: uuid("commercial_product_id_b")
      .notNull()
      .references(() => commercialProducts.id, { onDelete: "cascade" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("brand_eq_pair_unique").on(
      t.commercialProductIdA,
      t.commercialProductIdB
    ),
  ]
);

export const stockThresholds = pgTable(
  "stock_thresholds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commercialProductId: uuid("commercial_product_id")
      .notNull()
      .references(() => commercialProducts.id, { onDelete: "cascade" }),
    locationId: uuid("location_id").references(() => locations.id),
    minQty: integer("min_qty").notNull().default(0),
    maxQty: integer("max_qty"),
    expiryWarningDays: integer("expiry_warning_days").notNull().default(90),
    immobileDaysWarning: integer("immobile_days_warning").notNull().default(
      180
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("threshold_product_loc_unique").on(
      t.commercialProductId,
      t.locationId
    ),
  ]
);

export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    alertType: alertTypeEnum("alert_type").notNull(),
    severity: alertSeverityEnum("severity").notNull().default("warning"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata"),
    inventoryLotId: uuid("inventory_lot_id").references(() => inventoryLots.id),
    commercialProductId: uuid("commercial_product_id").references(
      () => commercialProducts.id
    ),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("alerts_active_idx").on(t.dismissedAt),
    index("alerts_type_idx").on(t.alertType),
  ]
);

export const consumptionDailyAggregates = pgTable(
  "consumption_daily_aggregates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    day: date("day").notNull(),
    commercialProductId: uuid("commercial_product_id")
      .notNull()
      .references(() => commercialProducts.id, { onDelete: "cascade" }),
    sectorId: uuid("sector_id").references(() => sectors.id),
    locationId: uuid("location_id").references(() => locations.id),
    qtyOut: integer("qty_out").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("consumption_day_product_sector_loc").on(
      t.day,
      t.commercialProductId,
      t.sectorId,
      t.locationId
    ),
  ]
);

export const drugsRelations = relations(drugs, ({ many }) => ({
  presentations: many(presentations),
}));

export const presentationsRelations = relations(
  presentations,
  ({ one, many }) => ({
    drug: one(drugs, {
      fields: [presentations.drugId],
      references: [drugs.id],
    }),
    commercialProducts: many(commercialProducts),
  })
);

export const commercialProductsRelations = relations(
  commercialProducts,
  ({ one, many }) => ({
    presentation: one(presentations, {
      fields: [commercialProducts.presentationId],
      references: [presentations.id],
    }),
    lots: many(inventoryLots),
  })
);

export const inventoryLotsRelations = relations(
  inventoryLots,
  ({ one, many }) => ({
    commercialProduct: one(commercialProducts, {
      fields: [inventoryLots.commercialProductId],
      references: [commercialProducts.id],
    }),
    location: one(locations, {
      fields: [inventoryLots.locationId],
      references: [locations.id],
    }),
    supplier: one(suppliers, {
      fields: [inventoryLots.supplierId],
      references: [suppliers.id],
    }),
    movements: many(stockMovements),
  })
);
