export type CategoryType = 'Comidas' | 'Bebidas' | 'Acompañamientos y Postres' | 'Combos y Promos';

export interface MenuItem {
  id: string;
  name: string;
  price: number; // Precio neto unitario (antes de impuestos)
  category: CategoryType;
  iconName?: 'burger' | 'beer' | 'soda' | 'salad' | 'hotdog' | 'cup' | 'soup' | 'cake' | 'utensils' | 'pizza' | 'coffee';
  image?: string;
  description?: string;
  isCombo?: boolean;
  comboIncludes?: string[];
  badge?: string;
  popular?: boolean;
}

export interface CalculatedItem extends MenuItem {
  quantity: number;
  subtotal: number; // Subtotal neto (cantidad * precio neto)
}

export interface ClosingCalculation {
  items: CalculatedItem[];
  totalUnits: number;
  netSales: number;   // Subtotal neto (antes de impuestos)
  taxAmount: number;  // Impuesto 18% (netSales * 0.18)
  totalSales: number; // Total final con impuestos (netSales + taxAmount)
}

export type TableStatus = 'disponible' | 'ocupada' | 'pidiendo' | 'por_cobrar' | 'reservada';
export type TableZone = 'salon' | 'terraza' | 'vip';
export type TableShape = 'round' | 'square' | 'rect';

export interface TableOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  addedAt: string;
}

export interface RestaurantTable {
  id: string;
  number: number;
  name: string;
  zone: TableZone;
  capacity: number;
  shape: TableShape;
  // Spatial coordinates on the floor plan (percentage coordinates 0-100)
  x: number;
  y: number;
  width?: number;
  height?: number;
  status: TableStatus;
  diners: number;
  orders: TableOrderItem[];
  observations: string; // Observaciones de la mesa (alergias, pedidos especiales, etc.)
  openedAt?: string;
  waiter?: string;
}

export type PaymentMethodType = 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia_mp' | 'dividida';

export interface PaymentDetails {
  method: PaymentMethodType;
  amount: number;
  taxAmount: number;
  netAmount: number;
  cashGiven?: number;
  change?: number;
  cardBrand?: string;
  cardInstallments?: number;
  mpReference?: string;
  splitDiners?: number;
  amountPerDiner?: number;
  timestamp: string;
  tableNumber?: number;
  tableName?: string;
}

export type AppRole = 'admin' | 'cliente';
export type AdminTab = 'plano' | 'ventas' | 'cierre';
