import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Table,
  DinerOrderItem,
  InventoryItem,
  CustomerProfile,
  DailyClosingData,
  UserRole,
  TableStatus,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_TABLES,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS,
  LEGACY_IMAGE_DAILY_DATA,
} from '../data/initialData';
import confetti from 'canvas-confetti';

export type AppView =
  | 'cliente-menu'
  | 'cliente-perfil'
  | 'admin-mesas'
  | 'admin-kds'
  | 'admin-arqueo'
  | 'admin-inventario'
  | 'admin-menu'
  | 'admin-reportes';

interface NotificationToast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
}

interface RestaurantContextType {
  // Roles and Navigation
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  goBack: () => void;
  canGoBack: boolean;

  // Staff PIN Authentication
  authenticatedStaffRole: 'mozo' | 'gerente' | null;
  loginStaffWithPin: (pin: string) => { success: boolean; role?: 'mozo' | 'gerente'; message: string };
  logoutStaff: () => void;

  // Physical Table Verification for Diners (QR / Security Code)
  verifiedTableId: number | null;
  verifiedTable: Table | null;
  verifyTableWithCode: (code: string) => { success: boolean; table?: Table; message: string };
  clearTableVerification: () => void;

  // Selected table (for Staff or verified customer)
  selectedTableId: number;
  setSelectedTableId: (id: number) => void;
  selectedTable: Table | undefined;

  // Data
  products: Product[];
  tables: Table[];
  inventory: InventoryItem[];
  customers: CustomerProfile[];
  currentCustomer: CustomerProfile | null;
  dailyClosing: DailyClosingData;

  // Cart / Customer Order
  cartItems: DinerOrderItem[];
  addToCart: (item: Omit<DinerOrderItem, 'id' | 'addedAt' | 'status'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  submitCustomerOrder: (customerNotes?: string) => Promise<boolean>;

  // Table Actions
  updateTableStatus: (tableId: number, status: TableStatus, diners?: number) => void;
  addOrderItemDirectly: (tableId: number, item: Omit<DinerOrderItem, 'id' | 'addedAt' | 'status'>) => void;
  updateOrderItemStatus: (tableId: number, itemId: string, status: DinerOrderItem['status']) => void;
  checkoutTable: (
    tableId: number,
    paymentMethod: 'efectivo' | 'tarjeta' | 'mercado_pago' | 'yape_plin' | 'puntos',
    tipAmount: number,
    discountAmount: number
  ) => void;

  // Kitchen/Bar KDS
  allKitchenOrders: { table: Table; item: DinerOrderItem }[];

  // Inventory & Menu Management
  restockItem: (itemId: string, amount: number) => void;
  saveProduct: (product: Product) => void;
  saveDailyClosing: (closing: DailyClosingData) => void;

  // Loyalty & Customers
  loginCustomer: (emailOrPhone: string) => boolean;
  logoutCustomer: () => void;
  redeemCustomerPoints: (pointsCost: number, rewardDesc: string) => boolean;

  // Notifications
  notifications: NotificationToast[];
  dismissNotification: (id: string) => void;

  // Accessibility
  highContrast: boolean;
  setHighContrast: React.Dispatch<React.SetStateAction<boolean>>;
  largeFont: boolean;
  setLargeFont: React.Dispatch<React.SetStateAction<boolean>>;

  // Ticket Preview
  ticketModal: {
    isOpen: boolean;
    data: any | null;
  };
  openTicketModal: (data: any) => void;
  closeTicketModal: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('cliente');
  const [authenticatedStaffRole, setAuthenticatedStaffRole] = useState<'mozo' | 'gerente' | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('cliente-menu');
  const [history, setHistory] = useState<AppView[]>([]);

  // Tables - Always merge with INITIAL_TABLES to ensure securityCode, coordinates and ARS pricing exist
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('gm_tables_ars');
    if (!saved) return INITIAL_TABLES;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_TABLES;
      // If table items have old Soles prices (< $100), migrate to INITIAL_TABLES
      const hasOldSoles = parsed.some((t: any) => t.activeOrderItems?.some((i: any) => i.price < 100));
      if (hasOldSoles) return INITIAL_TABLES;
      return INITIAL_TABLES.map((initTable) => {
        const found = parsed.find((p: any) => p && p.id === initTable.id);
        if (!found) return initTable;
        return {
          ...initTable,
          ...found,
          securityCode: found.securityCode || initTable.securityCode,
          mapCoordinates: found.mapCoordinates || initTable.mapCoordinates,
        };
      });
    } catch {
      return INITIAL_TABLES;
    }
  });

  // Physical Table Verification for Diners (Defaults to Mesa 1 for initial preview or null)
  const [verifiedTableId, setVerifiedTableId] = useState<number | null>(() => {
    const saved = localStorage.getItem('gm_verified_table_id');
    if (saved) {
      const num = Number(saved);
      if (!isNaN(num) && num > 0) return num;
    }
    return 1; // Default to Mesa 1 initially
  });

  const [selectedTableId, setSelectedTableId] = useState<number>(1);

  // Products in Argentine Pesos (ARS $)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('gm_products_ars');
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].price > 100) {
        return parsed;
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('gm_inventory_ars');
    if (!saved) return INITIAL_INVENTORY;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].unitCost > 100) {
        return parsed;
      }
    } catch {}
    return INITIAL_INVENTORY;
  });

  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem('gm_customers_ars');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(INITIAL_CUSTOMERS[0]);

  const [dailyClosing, setDailyClosing] = useState<DailyClosingData>(() => {
    const saved = localStorage.getItem('gm_daily_closing_ars');
    if (!saved) return LEGACY_IMAGE_DAILY_DATA;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.totalGrossSales > 1000) {
        return parsed;
      }
    } catch {}
    return LEGACY_IMAGE_DAILY_DATA;
  });

  const [cartItems, setCartItems] = useState<DinerOrderItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationToast[]>([
    {
      id: 'notif-welcome',
      message: 'Bienvenido a GastroMaster Pro. Sistema de Restaurante activo en Pesos Argentinos ($ ARS).',
      type: 'info',
      timestamp: '14:00',
    },
  ]);

  // Accessibility
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [largeFont, setLargeFont] = useState<boolean>(false);

  // Ticket Modal
  const [ticketModal, setTicketModal] = useState<{ isOpen: boolean; data: any | null }>({
    isOpen: false,
    data: null,
  });

  // Sync state to local storage with ARS versioning
  useEffect(() => {
    localStorage.setItem('gm_tables_ars', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('gm_products_ars', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gm_inventory_ars', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('gm_daily_closing_ars', JSON.stringify(dailyClosing));
  }, [dailyClosing]);

  useEffect(() => {
    localStorage.setItem('gm_customers_ars', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    if (verifiedTableId !== null) {
      localStorage.setItem('gm_verified_table_id', verifiedTableId.toString());
    } else {
      localStorage.removeItem('gm_verified_table_id');
    }
  }, [verifiedTableId]);

  // Keep selectedTable in sync with verifiedTableId when in customer mode
  useEffect(() => {
    if (userRole === 'cliente' && verifiedTableId !== null) {
      setSelectedTableId(verifiedTableId);
    }
  }, [userRole, verifiedTableId]);

  const verifiedTable = tables.find((t) => t.id === verifiedTableId) || null;
  const selectedTable = tables.find((t) => t.id === selectedTableId) || tables[0];

  // Navigation
  const navigateTo = (view: AppView) => {
    if (view !== currentView) {
      setHistory((prev) => [...prev, currentView]);
      setCurrentView(view);
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setCurrentView(prev);
    }
  };

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif: NotificationToast = {
      id: 'notif-' + Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Staff Authentication with Security PIN
  const loginStaffWithPin = (pin: string): { success: boolean; role?: 'mozo' | 'gerente'; message: string } => {
    const cleanedPin = pin.trim();
    if (cleanedPin === '9999') {
      setAuthenticatedStaffRole('gerente');
      setUserRole('gerente');
      setCurrentView('admin-mesas');
      addNotification('Acceso concedido como Gerente / Administrador.', 'success');
      return { success: true, role: 'gerente', message: 'Bienvenido, Gerente General.' };
    }
    if (cleanedPin === '1234') {
      setAuthenticatedStaffRole('mozo');
      setUserRole('mozo');
      setCurrentView('admin-mesas');
      addNotification('Acceso concedido como Mozo / Camarero.', 'success');
      return { success: true, role: 'mozo', message: 'Bienvenido, Camarero de Salón.' };
    }
    return { success: false, message: 'PIN de empleado incorrecto. Revisa el código de seguridad.' };
  };

  const logoutStaff = () => {
    setAuthenticatedStaffRole(null);
    setUserRole('cliente');
    setCurrentView('cliente-menu');
    addNotification('Sesión de personal cerrada. Regresando al portal de comensales.', 'info');
  };

  // Table Physical Code / QR Verification
  const verifyTableWithCode = (code: string): { success: boolean; table?: Table; message: string } => {
    if (!code || typeof code !== 'string') {
      return { success: false, message: 'Por favor ingresa un código de mesa válido.' };
    }

    const cleanInput = code.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanInput) {
      return { success: false, message: 'El código de mesa no puede estar vacío.' };
    }

    const found = tables.find((t) => {
      const secCode = (t.securityCode || `M${t.number}-${1000 + t.id * 111}`).toUpperCase().replace(/\s+/g, '');
      const numTarget = `MESA${t.number}`;
      const shortCode = secCode.includes('-') ? secCode.split('-')[1] : '';
      const mNum = `M${t.number}`;
      const onlyNum = `${t.number}`;

      return (
        secCode === cleanInput ||
        numTarget === cleanInput ||
        (shortCode && shortCode === cleanInput) ||
        mNum === cleanInput ||
        onlyNum === cleanInput ||
        cleanInput.includes(secCode)
      );
    });

    if (found) {
      setVerifiedTableId(found.id);
      setSelectedTableId(found.id);
      addNotification(`¡Mesa #${found.number} (${found.name}) validada correctamente!`, 'success');
      return { success: true, table: found, message: `Mesa verificada: ${found.name}` };
    }

    return {
      success: false,
      message: `El código "${code}" no coincide con ninguna mesa física activa. Prueba con M1-7892 o Mesa 1.`,
    };
  };

  const clearTableVerification = () => {
    setVerifiedTableId(null);
    setCartItems([]);
    addNotification('Verificación de mesa reiniciada. Escanea el QR de tu nueva mesa.', 'info');
  };

  // Cart operations
  const addToCart = (item: Omit<DinerOrderItem, 'id' | 'addedAt' | 'status'>) => {
    const newItem: DinerOrderItem = {
      ...item,
      id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'en_espera',
    };
    setCartItems((prev) => [...prev, newItem]);
    addNotification(`Añadido: ${item.quantity}x ${item.productName} (Comensal ${item.dinerNumber})`, 'success');
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    addNotification('Platillo eliminado del pedido.', 'info');
  };

  const updateCartItemQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as DinerOrderItem[]
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const submitCustomerOrder = async (customerNotes?: string): Promise<boolean> => {
    if (cartItems.length === 0) return false;
    const targetTableId = userRole === 'cliente' ? (verifiedTableId || selectedTableId) : selectedTableId;

    // Deduct stock in products
    const updatedProducts = [...products];
    cartItems.forEach((cartItem) => {
      const pIndex = updatedProducts.findIndex((p) => p.id === cartItem.productId);
      if (pIndex !== -1 && updatedProducts[pIndex].stock > 0) {
        updatedProducts[pIndex].stock = Math.max(0, updatedProducts[pIndex].stock - cartItem.quantity);
      }
    });
    setProducts(updatedProducts);

    // Update table
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === targetTableId) {
          const combinedItems = [...t.activeOrderItems, ...cartItems];
          const diners = Math.max(t.currentDiners || 1, Math.max(...cartItems.map((c) => c.dinerNumber)));
          return {
            ...t,
            status: 'ocupada',
            currentDiners: diners,
            occupiedSince: t.occupiedSince || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            activeOrderId: t.activeOrderId || 'ORD-' + Math.floor(1000 + Math.random() * 9000),
            activeOrderItems: combinedItems,
          };
        }
        return t;
      })
    );

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    addNotification(`¡Pedido de ${cartItems.length} items enviado con éxito a Cocina y Barra!`, 'success');
    clearCart();
    return true;
  };

  const updateTableStatus = (tableId: number, status: TableStatus, diners?: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status,
            currentDiners: diners !== undefined ? diners : t.currentDiners,
            occupiedSince:
              status === 'ocupada' && !t.occupiedSince
                ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : status === 'libre'
                ? undefined
                : t.occupiedSince,
            activeOrderItems: status === 'libre' ? [] : t.activeOrderItems,
            activeOrderId: status === 'libre' ? undefined : t.activeOrderId,
          };
        }
        return t;
      })
    );
    addNotification(`Mesa #${tableId} actualizada a estado: ${status.toUpperCase()}`, 'info');
  };

  const addOrderItemDirectly = (tableId: number, item: Omit<DinerOrderItem, 'id' | 'addedAt' | 'status'>) => {
    const newItem: DinerOrderItem = {
      ...item,
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'en_preparacion',
    };

    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'ocupada',
            activeOrderItems: [...t.activeOrderItems, newItem],
            currentDiners: Math.max(t.currentDiners, item.dinerNumber),
          };
        }
        return t;
      })
    );

    addNotification(`Agregado a Mesa #${tableId}: ${item.productName}`, 'success');
  };

  const updateOrderItemStatus = (tableId: number, itemId: string, status: DinerOrderItem['status']) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            activeOrderItems: t.activeOrderItems.map((item) =>
              item.id === itemId ? { ...item, status } : item
            ),
          };
        }
        return t;
      })
    );
  };

  const checkoutTable = (
    tableId: number,
    paymentMethod: 'efectivo' | 'tarjeta' | 'mercado_pago' | 'yape_plin' | 'puntos',
    tipAmount: number = 0,
    discountAmount: number = 0
  ) => {
    const targetTable = tables.find((t) => t.id === tableId);
    if (!targetTable || targetTable.activeOrderItems.length === 0) return;

    const subtotal = targetTable.activeOrderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = +(subtotal * 0.21).toFixed(2);
    const total = +(subtotal + tax + tipAmount - discountAmount).toFixed(2);

    // Update Daily Closing record
    setDailyClosing((prev) => {
      const updatedSummaries = [...prev.itemsSummary];
      targetTable.activeOrderItems.forEach((item) => {
        const found = updatedSummaries.find(
          (s) => s.productName.toLowerCase() === item.productName.toLowerCase()
        );
        if (found) {
          found.quantitySold += item.quantity;
          found.totalSales += item.price * item.quantity;
        } else {
          updatedSummaries.push({
            productName: item.productName,
            category: item.station === 'barra' ? 'bebidas' : 'comidas',
            quantitySold: item.quantity,
            unitPrice: item.price,
            totalSales: item.price * item.quantity,
            cost: item.price * 0.4,
          });
        }
      });

      const newTotalGross = +(prev.totalGrossSales + subtotal + tax).toFixed(2);
      const newTotalTax = +(prev.totalTax + tax).toFixed(2);
      const newTotalTips = +(prev.totalTips + tipAmount).toFixed(2);
      const newTotalDiscounts = +(prev.totalDiscounts + discountAmount).toFixed(2);
      const newTotalNet = +(prev.totalNetSales + subtotal).toFixed(2);

      let newCashExpected = prev.cashExpected;
      let newCardSales = prev.cardSales;
      let newWalletSales = prev.digitalWalletSales;

      if (paymentMethod === 'efectivo') {
        newCashExpected += total;
      } else if (paymentMethod === 'tarjeta') {
        newCardSales += total;
      } else if (paymentMethod === 'mercado_pago' || paymentMethod === 'yape_plin') {
        newWalletSales += total;
      }

      return {
        ...prev,
        itemsSummary: updatedSummaries,
        totalGrossSales: newTotalGross,
        totalTax: newTotalTax,
        totalTips: newTotalTips,
        totalDiscounts: newTotalDiscounts,
        totalNetSales: newTotalNet,
        cashExpected: +newCashExpected.toFixed(2),
        cashCounted: +newCashExpected.toFixed(2),
        cardSales: +newCardSales.toFixed(2),
        digitalWalletSales: +newWalletSales.toFixed(2),
        tablesServed: prev.tablesServed + 1,
        totalCustomers: prev.totalCustomers + (targetTable.currentDiners || 1),
        averageTicket: +((newTotalGross / (prev.tablesServed + 1)).toFixed(2)),
      };
    });

    if (currentCustomer) {
      const earned = Math.max(1, Math.floor(total / 100)); // 1 punto por cada $ 100 ARS
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === currentCustomer.id
            ? { ...c, points: c.points + earned, visitCount: c.visitCount + 1 }
            : c
        )
      );
      setCurrentCustomer((prev) =>
        prev ? { ...prev, points: prev.points + earned, visitCount: prev.visitCount + 1 } : null
      );
      addNotification(`¡${earned} GastroPuntos acumulados en tu cuenta!`, 'success');
    }

    setTicketModal({
      isOpen: true,
      data: {
        ticketNumber: 'TKT-' + Math.floor(100000 + Math.random() * 900000),
        tableName: targetTable.name,
        date: new Date().toLocaleDateString('es-AR'),
        time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        items: targetTable.activeOrderItems,
        subtotal,
        tax,
        tipAmount,
        discountAmount,
        total,
        paymentMethod,
        customer: currentCustomer,
      },
    });

    updateTableStatus(tableId, 'libre', 0);
  };

  const allKitchenOrders = tables.flatMap((t) =>
    t.activeOrderItems
      .filter((item) => item.status !== 'servido')
      .map((item) => ({ table: t, item }))
  );

  const restockItem = (itemId: string, amount: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              currentStock: +(item.currentStock + amount).toFixed(1),
              lastRestocked: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
    addNotification('Inventario reabastecido con éxito.', 'success');
  };

  const saveProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [...prev, product];
    });
    addNotification(`Plato "${product.name}" guardado en el menú.`, 'success');
  };

  const saveDailyClosing = (closing: DailyClosingData) => {
    setDailyClosing(closing);
    addNotification('Arqueo de caja del día guardado satisfactoriamente.', 'success');
  };

  const loginCustomer = (emailOrPhone: string): boolean => {
    const found = customers.find(
      (c) =>
        c.email.toLowerCase() === emailOrPhone.toLowerCase() ||
        c.phone.replace(/\s+/g, '') === emailOrPhone.replace(/\s+/g, '')
    );
    if (found) {
      setCurrentCustomer(found);
      addNotification(`¡Hola ${found.name}! Has iniciado sesión.`, 'success');
      return true;
    }
    const newCust: CustomerProfile = {
      id: 'cust-' + Date.now(),
      name: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'Comensal VIP',
      email: emailOrPhone.includes('@') ? emailOrPhone : 'cliente@restaurant.pe',
      phone: emailOrPhone.includes('@') ? '+51 900 123 456' : emailOrPhone,
      points: 100,
      tier: 'Bronce',
      visitCount: 1,
      favoriteDish: 'Hamburguesa Artesanal Angus',
      registeredAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    setCurrentCustomer(newCust);
    addNotification(`¡Cuenta creada con éxito! Ganaste tus primeros 100 GastroPuntos.`, 'success');
    return true;
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    addNotification('Sesión de cliente cerrada.', 'info');
  };

  const redeemCustomerPoints = (pointsCost: number, rewardDesc: string): boolean => {
    if (!currentCustomer || currentCustomer.points < pointsCost) {
      addNotification('Puntos insuficientes para este beneficio.', 'warning');
      return false;
    }
    setCurrentCustomer((prev) => (prev ? { ...prev, points: prev.points - pointsCost } : null));
    setCustomers((prev) =>
      prev.map((c) => (c.id === currentCustomer.id ? { ...c, points: c.points - pointsCost } : c))
    );
    addNotification(`¡Canje exitoso! Beneficio obtenido: ${rewardDesc}`, 'success');
    return true;
  };

  const openTicketModal = (data: any) => {
    setTicketModal({ isOpen: true, data });
  };

  const closeTicketModal = () => {
    setTicketModal({ isOpen: false, data: null });
  };

  return (
    <RestaurantContext.Provider
      value={{
        userRole,
        setUserRole,
        currentView,
        setCurrentView: navigateTo,
        goBack,
        canGoBack: history.length > 0,
        authenticatedStaffRole,
        loginStaffWithPin,
        logoutStaff,
        verifiedTableId,
        verifiedTable,
        verifyTableWithCode,
        clearTableVerification,
        selectedTableId,
        setSelectedTableId,
        selectedTable,
        products,
        tables,
        inventory,
        customers,
        currentCustomer,
        dailyClosing,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        submitCustomerOrder,
        updateTableStatus,
        addOrderItemDirectly,
        updateOrderItemStatus,
        checkoutTable,
        allKitchenOrders,
        restockItem,
        saveProduct,
        saveDailyClosing,
        loginCustomer,
        logoutCustomer,
        redeemCustomerPoints,
        notifications,
        dismissNotification,
        highContrast,
        setHighContrast,
        largeFont,
        setLargeFont,
        ticketModal,
        openTicketModal,
        closeTicketModal,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
