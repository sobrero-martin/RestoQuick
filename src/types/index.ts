export interface MenuItem {
  id: string;
  name: string;
  price: number; // Precio neto unitario (antes de impuestos)
  category: 'Comidas' | 'Bebidas' | 'Acompañamientos y Postres';
  iconName?: 'burger' | 'beer' | 'soda' | 'salad' | 'hotdog' | 'cup' | 'soup' | 'cake' | 'utensils' | 'pizza' | 'coffee';
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
