/** Fila mínima para orden FEFO (vencimiento más cercano, desempate por ingreso). */
export type FefoLotRow = {
  id: string;
  expiryDate: string;
  entryDate: string;
  qtyAvailable: number;
};
