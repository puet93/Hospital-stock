export const DEFAULT_TIMEZONE = "America/Argentina/Buenos_Aires";
export const DEFAULT_CURRENCY = "ARS";

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  farmacia_jefe: "Farmacia jefe",
  farmaceutico: "Farmacéutico",
  deposito: "Depósito",
  auditor: "Auditor",
  solo_lectura: "Solo lectura",
};

export const MOVEMENT_LABELS: Record<string, string> = {
  ingreso: "Ingreso",
  egreso: "Egreso",
  transferencia: "Transferencia",
  ajuste: "Ajuste",
  devolucion: "Devolución",
  merma: "Merma",
  cuarentena: "Cuarentena",
  desbloqueo: "Desbloqueo",
  reserva: "Reserva",
  liberacion_reserva: "Liberación de reserva",
};

export const ALERT_LABELS: Record<string, string> = {
  stock_bajo: "Stock bajo",
  quiebre_stock: "Quiebre de stock",
  vencimiento_proximo: "Vencimiento próximo",
  lote_vencido: "Lote vencido",
  stock_inmovilizado: "Stock inmovilizado",
  sobrestock: "Sobrestock",
  consumo_anomalo: "Consumo anómalo",
  diferencia_inventario: "Diferencia de inventario",
  sustitucion_posible: "Posible sustitución por equivalente",
};
