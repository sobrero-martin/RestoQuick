export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'Comidas' | 'Bebidas' | 'Acompañamientos y Postres';
  description?: string;
  iconName?: 'burger' | 'beer' | 'soda' | 'salad' | 'hotdog' | 'cup' | 'soup' | 'cake' | 'utensils' | 'pizza' | 'coffee';
}

export interface SalesRecord {
  itemId: string;
  quantity: number;
}

export interface CalculatedItem extends MenuItem {
  quantity: number;
  subtotal: number;
}

export interface ClosingCalculation {
  items: CalculatedItem[];
  totalUnits: number;
  totalSales: number; // Venta total $
  taxAmount: number;  // Impuesto $ (18%)
  netSales: number;   // Venta neta (Venta total - Impuesto)
}

