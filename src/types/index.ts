export type UserRole = 'cliente' | 'mozo' | 'gerente';

export type ProductCategory = 'comidas' | 'bebidas' | 'postres' | 'combos' | 'promociones';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  image: string;
  available: boolean;
  stock: number;
  minStock: number;
  allergens: string[]; // e.g., 'Gluten', 'Lácteos', 'Mariscos', 'Maní'
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  calories?: number;
  preparationStation: 'cocina' | 'barra';
}

export interface DinerOrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  dinerNumber: number; // Comensal 1, Comensal 2, etc.
  notes?: string;
  allergensAlert?: string[];
  station: 'cocina' | 'barra';
  status: 'en_espera' | 'en_preparacion' | 'listo' | 'servido';
  addedAt: string;
}

export type TableStatus = 'libre' | 'reservada' | 'ocupada' | 'no_disponible';

export interface Table {
  id: number;
  number: number;
  name: string;
  zone: 'Salón Principal' | 'Terraza' | 'Barra' | 'VIP';
  capacity: number;
  status: TableStatus;
  currentDiners: number;
  assignedWaiter?: string;
  occupiedSince?: string;
  activeOrderId?: string;
  activeOrderItems: DinerOrderItem[];
  reservationName?: string;
  reservationTime?: string;
  notes?: string;
  securityCode: string; // e.g. 'M1-8840' - Printed on table QR stand
  mapCoordinates: {
    x: number; // percentage in floor plan (0-100)
    y: number; // percentage in floor plan (0-100)
    width: number;
    height: number;
    shape: 'square' | 'circle' | 'rectangle';
  };
}

export interface Order {
  id: string;
  tableNumber: number;
  tableName: string;
  waiterName: string;
  items: DinerOrderItem[];
  status: 'activa' | 'en_cocina' | 'servida' | 'pagada' | 'cancelada';
  subtotal: number;
  tax: number; // 21% IVA (Argentina)
  tip: number;
  discount: number;
  total: number;
  paymentMethod?: 'efectivo' | 'tarjeta' | 'mercado_pago' | 'yape_plin' | 'puntos';
  createdAt: string;
  closedAt?: string;
  customerName?: string;
  customerPointsEarned?: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  tier: 'Bronce' | 'Plata' | 'Oro' | 'Platino';
  visitCount: number;
  favoriteDish: string;
  registeredAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: 'kg' | 'litros' | 'unidades' | 'botellas';
  unitCost: number;
  supplier: string;
  lastRestocked: string;
}

export interface DailySaleItemSummary {
  productName: string;
  category: ProductCategory;
  quantitySold: number;
  unitPrice: number;
  totalSales: number;
  cost: number;
}

export interface DailyClosingData {
  id: string;
  date: string;
  openedAt: string;
  closedAt: string;
  closedBy: string;
  itemsSummary: DailySaleItemSummary[];
  totalGrossSales: number;
  totalTax: number;
  totalTips: number;
  totalDiscounts: number;
  totalNetSales: number;
  cashExpected: number;
  cashCounted: number;
  cashDifference: number;
  cardSales: number;
  digitalWalletSales: number;
  pointsDiscountTotal: number;
  tablesServed: number;
  totalCustomers: number;
  averageTicket: number;
  notes?: string;
}
