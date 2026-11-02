import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_MENU_ITEMS } from './data/menuData';
import { MenuItem, ClosingCalculation } from './types';
import { Header } from './components/Header';
import { SalesTable } from './components/SalesTable';
import { ClosingSummary } from './components/ClosingSummary';
import { ConfirmModal } from './components/ConfirmModal';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { AddItemModal } from './components/AddItemModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Dynamic menu items list (user can add new items)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    return [...INITIAL_MENU_ITEMS];
  });

  // Sales state (mapping item id to sold quantity)
  const [sales, setSales] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    INITIAL_MENU_ITEMS.forEach((i) => {
      initial[i.id] = 0;
    });
    return initial;
  });

  // Closing status
  const [isFinalized, setIsFinalized] = useState<boolean>(false);

  // Modals state
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

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

  // Update quantity handler
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setSales((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }));
    setIsFinalized(false);
  };

  // Open add modal
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setIsAddItemOpen(true);
  };

  // Open edit modal for any item
  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsAddItemOpen(true);
  };

  // Save item (create or update)
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

  // Delete any item with confirmation
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

  // Clear all with confirmation
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

  // Finalize closing
  const handleFinalizeClosing = () => {
    setIsFinalized(true);
    setToastMessage('¡Cierre diario registrado y validado con éxito!');
  };

  // Exit app with confirmation
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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 2-Column Responsive Workspace */}
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
              onOpenReceipt={() => setIsReceiptOpen(true)}
              onFinalizeClosing={handleFinalizeClosing}
              onExitApp={handleExitApp}
              isFinalized={isFinalized}
            />
          </div>
        </div>

        {/* Bottom Operational Footnote */}
        <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>RestoQuick · Sistema de Punto de Venta y Control de Caja</span>
        </footer>
      </main>

      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
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
