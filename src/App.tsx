import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_MENU_ITEMS } from './data/menuData';
import { INITIAL_TABLES } from './data/tablesData';
import { 
  MenuItem, 
  ClosingCalculation, 
  RestaurantTable, 
  TableStatus, 
  PaymentDetails, 
  AppRole, 
  AdminTab 
} from './types';
import { Header } from './components/Header';
import { FloorPlan } from './components/FloorPlan';
import { SalesTable } from './components/SalesTable';
import { ClosingSummary } from './components/ClosingSummary';
import { ClientMenu } from './components/ClientMenu';
import { PaymentModal } from './components/PaymentModal';
import { TableQRModal } from './components/TableQRModal';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { AddItemModal } from './components/AddItemModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CheckCircle2, LayoutGrid, TableProperties } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // App Role & Navigation State
  const [currentRole, setCurrentRole] = useState<AppRole>('admin');
  const [adminTab, setAdminTab] = useState<AdminTab>('plano');

  // Tables State (Floor plan with spatial positions & active orders)
  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    return [...INITIAL_TABLES];
  });

  // Client selected table
  const [activeClientTableId, setActiveClientTableId] = useState<string>('mesa-4');

  // Dynamic menu items list (user can add new items or combos)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    return [...INITIAL_MENU_ITEMS];
  });

  // Global register of sales (item id -> quantity sold across closed tables & counter sales)
  const [sales, setSales] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    INITIAL_MENU_ITEMS.forEach((i) => {
      initial[i.id] = 0;
    });
    // Add consumption from initial tables that are active
    INITIAL_TABLES.forEach((table) => {
      table.orders.forEach((order) => {
        initial[order.itemId] = (initial[order.itemId] || 0) + order.quantity;
      });
    });
    return initial;
  });

  // Daily Closing status
  const [isFinalized, setIsFinalized] = useState<boolean>(false);

  // Modals state
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [lastPayment, setLastPayment] = useState<PaymentDetails | null>(null);

  const [isAddItemOpen, setIsAddItemOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [payingTable, setPayingTable] = useState<RestaurantTable | null>(null);
  const [qrTable, setQrTable] = useState<RestaurantTable | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Financial calculation memoized
  const calculation: ClosingCalculation = useMemo(() => {
    const items = menuItems.map((item) => {
      const quantity = sales[item.id] || 0;
      const subtotal = quantity * item.price;
      return {
        ...item,
        quantity,
        subtotal,
      };
    });

    const totalUnits = items.reduce((acc, curr) => acc + curr.quantity, 0);
    const netSales = items.reduce((acc, curr) => acc + curr.subtotal, 0);
    const taxAmount = Number((netSales * 0.18).toFixed(2));
    const totalSales = Number((netSales + taxAmount).toFixed(2));

    return {
      items,
      totalUnits,
      netSales,
      taxAmount,
      totalSales,
    };
  }, [menuItems, sales]);

  // Current table object for client mode
  const activeClientTable = tables.find((t) => t.id === activeClientTableId) || tables[0];

  // --------------------------------------------------------------------------
  // TABLE HANDLERS (Observaciones, Pedidos, Estados, Comensales)
  // --------------------------------------------------------------------------

  // Update observations per table
  const handleUpdateTableObservations = (tableId: string, observations: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, observations } : t))
    );
  };

  // Update status per table
  const handleUpdateTableStatus = (tableId: string, status: TableStatus) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t))
    );
  };

  // Update diners count per table
  const handleUpdateTableDiners = (tableId: string, diners: number) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, diners } : t))
    );
  };

  // Add item to table order
  const handleAddItemToTable = (
    tableId: string,
    menuItem: MenuItem,
    quantity: number,
    notes?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;

        const newOrders = [
          ...t.orders,
          {
            itemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity,
            notes,
            addedAt: timestamp,
          },
        ];

        return {
          ...t,
          status: t.status === 'disponible' ? 'ocupada' : t.status,
          diners: t.diners === 0 ? 2 : t.diners,
          orders: newOrders,
        };
      })
    );

    // Update global sales tally
    setSales((prev) => ({
      ...prev,
      [menuItem.id]: (prev[menuItem.id] || 0) + quantity,
    }));

    setToastMessage(`Se agregó "${quantity}× ${menuItem.name}" a la mesa.`);
  };

  // Remove order item from table
  const handleRemoveOrderItem = (tableId: string, orderIndex: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const itemToRemove = t.orders[orderIndex];
        if (itemToRemove) {
          // Adjust global sales
          setSales((sPrev) => ({
            ...sPrev,
            [itemToRemove.itemId]: Math.max(0, (sPrev[itemToRemove.itemId] || 0) - itemToRemove.quantity),
          }));
        }
        const updatedOrders = t.orders.filter((_, idx) => idx !== orderIndex);
        return {
          ...t,
          orders: updatedOrders,
        };
      })
    );
  };

  // Client sent order from menu
  const handleSendClientOrder = (
    tableId: string,
    cartItems: { item: MenuItem; quantity: number; notes?: string }[],
    tableObservations?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;

        const newOrderItems = cartItems.map((c) => ({
          itemId: c.item.id,
          name: c.item.name,
          price: c.item.price,
          quantity: c.quantity,
          notes: c.notes,
          addedAt: timestamp,
        }));

        return {
          ...t,
          status: 'pidiendo',
          diners: t.diners === 0 ? 2 : t.diners,
          orders: [...t.orders, ...newOrderItems],
          observations: tableObservations || t.observations,
        };
      })
    );

    // Sync sales quantities
    setSales((prev) => {
      const copy = { ...prev };
      cartItems.forEach((c) => {
        copy[c.item.id] = (copy[c.item.id] || 0) + c.quantity;
      });
      return copy;
    });

    setToastMessage(`¡Comanda enviada a cocina para la ${activeClientTable.name}!`);
  };

  // Client requests bill (notifies waiter, marks table as 'por_cobrar')
  const handleRequestBillFromClient = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, status: 'por_cobrar' } : t
      )
    );
    const tbl = tables.find((t) => t.id === tableId);
    setToastMessage(`🔔 ${tbl?.name || 'Mesa'}: ¡El comensal ha solicitado la cuenta al mozo!`);
  };

  // Payment Confirmation
  const handleConfirmPayment = (payment: PaymentDetails) => {
    if (!payingTable) return;

    // Free the table
    setTables((prev) =>
      prev.map((t) =>
        t.id === payingTable.id
          ? {
              ...t,
              status: 'disponible',
              diners: 0,
              orders: [],
              observations: 'Mesa sanitizada y disponible tras cobro.',
            }
          : t
      )
    );

    setLastPayment(payment);
    setPayingTable(null);
    setIsReceiptOpen(true);
    setToastMessage(
      `¡Pago de $${payment.amount.toLocaleString('es-AR')} confirmado (${payment.method})! Mesa liberada.`
    );
  };

  // Free table directly
  const handleFreeTable = (tableId: string) => {
    const tableToFree = tables.find((t) => t.id === tableId);
    if (!tableToFree) return;

    setConfirmConfig({
      isOpen: true,
      title: `¿Liberar ${tableToFree.name}?`,
      message: `Se quitarán las comandas actuales y la mesa volverá al estado "Disponible".`,
      confirmLabel: 'Liberar Mesa',
      isDestructive: true,
      onConfirm: () => {
        setTables((prev) =>
          prev.map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  status: 'disponible',
                  diners: 0,
                  orders: [],
                  observations: '',
                }
              : t
          )
        );
        setConfirmConfig(null);
        setToastMessage(`La ${tableToFree.name} ahora está disponible.`);
      },
    });
  };

  // Open Client mode focused on a specific table
  const handleOpenClientMode = (table: RestaurantTable) => {
    setActiveClientTableId(table.id);
    setCurrentRole('cliente');
  };

  // Open QR modal for a table
  const handleOpenQR = (table: RestaurantTable) => {
    setQrTable(table);
  };

  // --------------------------------------------------------------------------
  // COUNTER / SALES TABLE HANDLERS
  // --------------------------------------------------------------------------

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setSales((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }));
    setIsFinalized(false);
  };

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setIsAddItemOpen(true);
  };

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsAddItemOpen(true);
  };

  const handleSaveItem = (itemToSave: MenuItem) => {
    const exists = menuItems.some((i) => i.id === itemToSave.id);
    if (exists) {
      setMenuItems((prev) => prev.map((i) => (i.id === itemToSave.id ? itemToSave : i)));
      setToastMessage(`Se actualizó "${itemToSave.name}".`);
    } else {
      setMenuItems((prev) => [...prev, itemToSave]);
      setSales((prev) => ({
        ...prev,
        [itemToSave.id]: 0,
      }));
      setToastMessage(`Se agregó "${itemToSave.name}" al menú.`);
    }
    setEditingItem(null);
  };

  const handleDeleteItem = (item: MenuItem) => {
    setConfirmConfig({
      isOpen: true,
      title: `¿Eliminar "${item.name}"?`,
      message: `Se quitará este producto del menú y se recalcularán los totales del día.`,
      confirmLabel: 'Eliminar ítem',
      isDestructive: true,
      onConfirm: () => {
        setMenuItems((prev) => prev.filter((i) => i.id !== item.id));
        setSales((prev) => {
          const copy = { ...prev };
          delete copy[item.id];
          return copy;
        });
        setConfirmConfig(null);
        setToastMessage(`Se eliminó "${item.name}".`);
      },
    });
  };

  const handleClearAll = () => {
    setConfirmConfig({
      isOpen: true,
      title: '¿Reiniciar todas las cantidades a cero?',
      message:
        'Esta acción pondrá en 0 todas las cantidades vendidas registradas en la planilla de caja.',
      confirmLabel: 'Sí, limpiar todo',
      isDestructive: true,
      onConfirm: () => {
        const resetMap: Record<string, number> = {};
        menuItems.forEach((i) => {
          resetMap[i.id] = 0;
        });
        setSales(resetMap);
        setIsFinalized(false);
        setConfirmConfig(null);
        setToastMessage('Se han reiniciado las cantidades a cero.');
      },
    });
  };

  const handleFinalizeClosing = () => {
    setIsFinalized(true);
    setToastMessage('¡Cierre diario registrado y validado con éxito!');
  };

  const handleExitApp = () => {
    setConfirmConfig({
      isOpen: true,
      title: '¿Deseas cerrar la sesión de caja?',
      message:
        'Se verificará el cierre actual antes de reiniciar el punto de venta para el próximo turno de trabajo.',
      confirmLabel: 'Cerrar sesión',
      isDestructive: false,
      onConfirm: () => {
        setConfirmConfig(null);
        setToastMessage('Sesión cerrada. Terminal disponible para el siguiente turno.');
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeAdminTab={adminTab}
        onAdminTabChange={setAdminTab}
        activeTableName={activeClientTable.name}
      />

      {/* ROL CLIENTE: Menú Digital para Comensales */}
      {currentRole === 'cliente' ? (
        <ClientMenu
          currentTable={activeClientTable}
          allTables={tables}
          menuItems={menuItems}
          onSelectTable={(t) => setActiveClientTableId(t.id)}
          onSendOrder={handleSendClientOrder}
          onRequestBill={handleRequestBillFromClient}
          onSwitchToAdmin={() => setCurrentRole('admin')}
        />
      ) : (
        /* ROL ADMINISTRACIÓN / SALÓN / CAJA */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Sub-Navigation Tabs for Admin */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAdminTab('plano')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  adminTab === 'plano'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Plano del Salón</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('ventas')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  adminTab === 'ventas'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Planilla de Caja & Arqueo Diario</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">{tables.length}</span> mesas en local · 
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {tables.filter((t) => t.status === 'disponible').length} disponibles
              </span>
            </div>
          </div>

          {/* Conditional Rendering based on active tab */}
          {adminTab === 'plano' ? (
            <FloorPlan
              tables={tables}
              menuItems={menuItems}
              onSelectTable={(table) => {
                // table selection handled inside FloorPlan
              }}
              onUpdateTableObservations={handleUpdateTableObservations}
              onUpdateTableStatus={handleUpdateTableStatus}
              onUpdateTableDiners={handleUpdateTableDiners}
              onAddItemToTable={handleAddItemToTable}
              onRemoveOrderItem={handleRemoveOrderItem}
              onOpenPayment={(table) => setPayingTable(table)}
              onOpenQR={handleOpenQR}
              onOpenClientMode={handleOpenClientMode}
              onFreeTable={handleFreeTable}
            />
          ) : (
            /* 2-Column Responsive Workspace: Sales Table + Closing Summary */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Left Column: Sales Registration Table (8 columns) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <SalesTable
                  items={menuItems}
                  sales={sales}
                  onQuantityChange={handleQuantityChange}
                  onClearAll={handleClearAll}
                  onOpenAddItem={handleOpenAddItem}
                  onEditItem={handleOpenEditItem}
                  onDeleteItem={handleDeleteItem}
                />
              </div>

              {/* Right Column: Financial Closing Panel (4 columns) */}
              <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
                <ClosingSummary
                  calculation={calculation}
                  onOpenReceipt={() => {
                    setLastPayment(null);
                    setIsReceiptOpen(true);
                  }}
                  onFinalizeClosing={handleFinalizeClosing}
                  onExitApp={handleExitApp}
                  isFinalized={isFinalized}
                />
              </div>
            </div>
          )}

          {/* Bottom Operational Footnote */}
          <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>RestoQuick · Sistema de Punto de Venta, Plano de Mesas y Menú QR</span>
            <span>Impuesto 18% aplicado sobre la venta neta consolidada</span>
          </footer>
        </main>
      )}

      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Payment Modal */}
      {payingTable && (
        <PaymentModal
          table={payingTable}
          isOpen={Boolean(payingTable)}
          onClose={() => setPayingTable(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* Table QR Code Modal */}
      {qrTable && (
        <TableQRModal
          table={qrTable}
          isOpen={Boolean(qrTable)}
          onClose={() => setQrTable(null)}
          onSimulateClient={(table) => {
            setActiveClientTableId(table.id);
            setCurrentRole('cliente');
          }}
        />
      )}

      {/* Add / Edit Item Modal */}
      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => {
          setIsAddItemOpen(false);
          setEditingItem(null);
        }}
        onSaveItem={handleSaveItem}
        initialItem={editingItem}
      />

      {/* Printable Receipt Modal */}
      <ReceiptPrintModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        calculation={calculation}
        paymentDetails={lastPayment}
      />

      {/* Confirmation Modal */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          isDestructive={confirmConfig.isDestructive}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </div>
  );
}
