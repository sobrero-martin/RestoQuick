import React, { useState } from 'react';
import { 
  MenuItem, 
  RestaurantTable, 
  TableOrderItem 
} from '../types';
import { ItemIcon } from './ItemIcon';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  UtensilsCrossed, 
  Sparkles, 
  Tag, 
  BellRing, 
  CheckCircle2, 
  ArrowLeft,
  X,
  CreditCard,
  QrCode,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  FileCheck
} from 'lucide-react';

interface ClientMenuProps {
  currentTable: RestaurantTable;
  allTables: RestaurantTable[];
  menuItems: MenuItem[];
  onSelectTable: (table: RestaurantTable) => void;
  onSendOrder: (tableId: string, items: { item: MenuItem; quantity: number; notes?: string }[], tableObservations?: string) => void;
  onRequestBill: (tableId: string) => void;
  onSwitchToAdmin: () => void;
}

export const ClientMenu: React.FC<ClientMenuProps> = ({
  currentTable,
  allTables,
  menuItems,
  onSelectTable,
  onSendOrder,
  onRequestBill,
  onSwitchToAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Combos y Promos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Cart state for newly selected items by the client
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number; notes?: string }[]>([]);
  
  // Table observation note by customer
  const [customerObservation, setCustomerObservation] = useState<string>(currentTable.observations || '');
  
  // Customization modal state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customQty, setCustomQty] = useState<number>(1);
  const [customNotes, setCustomNotes] = useState<string>('');
  
  // Drawer open state
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  
  // Waiter call feedback
  const [waiterCalled, setWaiterCalled] = useState<boolean>(false);
  const [orderSentSuccess, setOrderSentSuccess] = useState<boolean>(false);
  const [billRequested, setBillRequested] = useState<boolean>(false);

  const handleRequestBill = () => {
    onRequestBill(currentTable.id);
    setBillRequested(true);
    setTimeout(() => {
      setBillRequested(false);
    }, 6000);
  };

  const categories = [
    'Combos y Promos',
    'Comidas',
    'Bebidas',
    'Acompañamientos y Postres',
    'Todos',
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    return matchesCategory && matchesSearch;
  });

  const cartTotalItems = cart.reduce((acc, c) => acc + c.quantity, 0);
  const cartSubtotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  const cartTax = cartSubtotal * 0.18;
  const cartTotal = cartSubtotal + cartTax;

  const existingOrdersSubtotal = currentTable.orders.reduce((acc, o) => acc + o.price * o.quantity, 0);

  const formatMoney = (amount: number) => {
    return `$ ${amount.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const handleOpenCustomize = (item: MenuItem) => {
    setCustomizingItem(item);
    setCustomQty(1);
    setCustomNotes('');
  };

  const handleAddToCart = () => {
    if (!customizingItem) return;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (p) => p.item.id === customizingItem.id && p.notes === customNotes
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += customQty;
        return copy;
      }
      return [...prev, { item: customizingItem, quantity: customQty, notes: customNotes }];
    });

    setCustomizingItem(null);
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (index: number, delta: number) => {
    setCart((prev) => {
      const copy = [...prev];
      const next = copy[index].quantity + delta;
      if (next <= 0) {
        return copy.filter((_, i) => i !== index);
      }
      copy[index].quantity = next;
      return copy;
    });
  };

  const handleSendOrderToKitchen = () => {
    if (cart.length === 0) return;
    onSendOrder(currentTable.id, cart, customerObservation);
    setCart([]);
    setOrderSentSuccess(true);
    setTimeout(() => {
      setOrderSentSuccess(false);
      setIsCartOpen(false);
    }, 2500);
  };

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-24">
      {/* Top Customer Brand & Table Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand & Table Locator */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Volver al panel de administración"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  RestoQuick Menú
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <MapPin className="w-3 h-3" />
                  <span>{currentTable.name}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {currentTable.zone === 'salon' ? 'Salón Principal' : currentTable.zone === 'terraza' ? 'Terraza Exterior' : 'Sector VIP / Barra'}
              </span>
            </div>
          </div>

          {/* Quick Actions: Switch table & Call waiter */}
          <div className="flex items-center gap-2">
            {/* Table selector dropdown */}
            <select
              value={currentTable.id}
              onChange={(e) => {
                const found = allTables.find((t) => t.id === e.target.value);
                if (found) onSelectTable(found);
              }}
              className="hidden sm:block py-1.5 px-2.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {allTables.map((t) => (
                <option key={t.id} value={t.id}>
                  Cambiar a {t.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCallWaiter}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                waiterCalled
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              <BellRing className={`w-3.5 h-3.5 ${waiterCalled ? 'animate-bounce' : ''}`} />
              <span>{waiterCalled ? '¡Mozo avisado!' : 'Llamar al mozo'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-4 py-5 space-y-6">
        {/* Table Banner with Active Consumption and Observations */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col justify-between gap-2">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Menú Digital en Mesa
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Bienvenido a la {currentTable.name}
            </h1>
            <p className="text-xs text-emerald-100/90 max-w-xl">
              Explora nuestros combos especiales, personaliza tus platos con observaciones para la cocina y envía tu pedido directamente.
            </p>
          </div>
        </div>

        {/* Categories Bar & Search */}
        <div className="space-y-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isComboCat = cat === 'Combos y Promos';
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? isComboCat
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                        : 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {isComboCat && <Sparkles className="w-3.5 h-3.5 text-amber-200" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar platos, hamburguesas, pizzas, bebidas o combos..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 shadow-xs"
            />
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{selectedCategory}</span>
            <span className="text-xs font-normal text-slate-400">
              ({filteredItems.length} opciones disponibles)
            </span>
          </h2>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isCombo = Boolean(item.isCombo);

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden flex flex-col group ${
                  isCombo
                    ? 'border-amber-300 dark:border-amber-800/80 hover:shadow-md hover:border-amber-400'
                    : 'border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300'
                }`}
              >
                {/* Product Image Slot with Fallback */}
                <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Graceful fallback to styled domain visual
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}

                  {/* Fallback container with icon if image not available or errored */}
                  <div className="absolute inset-0 -z-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400">
                    <ItemIcon iconName={item.iconName} className="w-10 h-10 text-emerald-600 mb-1" />
                    <span className="text-xs font-medium text-slate-500">{item.name}</span>
                  </div>

                  {/* Badge for Combos or Popular */}
                  {item.badge && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{item.badge}</span>
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/70 text-white backdrop-blur-xs">
                    {item.category}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {item.name}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Combo Included Items List */}
                    {isCombo && item.comboIncludes && item.comboIncludes.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-dashed border-amber-200 dark:border-amber-900/60 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                          El combo incluye:
                        </span>
                        <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                          {item.comboIncludes.map((inc, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-amber-500" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Price & Add Action Button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white tabular-nums block leading-none">
                        {formatMoney(item.price)}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        +18% IVA al cierre
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenCustomize(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Bar with Order Summary Trigger */}
      {(cartTotalItems > 0 || currentTable.orders.length > 0) && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-2xl">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
                aria-label="Abrir pedido de la mesa"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartTotalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                    {cartTotalItems}
                  </span>
                )}
              </button>

              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {cartTotalItems > 0 ? `${cartTotalItems} ítems listos para pedir` : `Mesa con comanda activa`}
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {cartTotalItems > 0 ? `Subtotal nuevo: ${formatMoney(cartTotal)}` : `Total consumido: ${formatMoney(existingOrdersSubtotal * 1.18)}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartTotalItems > 0 ? (
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="inline-flex items-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ver y Enviar Pedido</span>
                </button>
              ) : currentTable.status === 'por_cobrar' || billRequested ? (
                <div className="inline-flex items-center gap-2 py-2.5 px-4 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 rounded-xl shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Cuenta solicitada · Mozo en camino</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestBill}
                  className="inline-flex items-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pedir la Cuenta</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Item Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                Agregar {customizingItem.name}
              </span>
              <button
                type="button"
                onClick={() => setCustomizingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Quantity Stepper */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cantidad:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomQty(Math.max(1, customQty - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm">
                    {customQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomQty(customQty + 1)}
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Special Note / Observation for item */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Observaciones para la cocina (opcional):
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, carne a punto, aderezos aparte..."
                  className="w-full p-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              {/* Subtotal */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Monto:</span>
                <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatMoney(customizingItem.price * customQty)}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCustomizingItem(null)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
              >
                Confirmar y Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Cart & Table Order Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pedido para la {currentTable.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
              {/* Table Level Observations */}
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Observaciones para la mesa:</span>
                </label>
                <input
                  type="text"
                  value={customerObservation}
                  onChange={(e) => setCustomerObservation(e.target.value)}
                  placeholder="Ej: Somos 3 comensales, uno es alérgico al marisco..."
                  className="w-full p-2 text-xs bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-lg"
                />
              </div>

              {/* Items in Current Cart (Pending Sending) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Nuevos productos a pedir ({cart.length})
                </span>

                {cart.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No has agregado nuevos productos todavía.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cart.map((cartItem, idx) => (
                      <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {cartItem.item.name}
                          </span>
                          {cartItem.notes && (
                            <span className="text-[11px] text-amber-700 dark:text-amber-400 italic block">
                              Nota: {cartItem.notes}
                            </span>
                          )}
                          <span className="text-xs font-mono text-emerald-600 font-semibold block mt-0.5">
                            {formatMoney(cartItem.item.price * cartItem.quantity)}
                          </span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(idx, -1)}
                            className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-mono text-xs font-bold">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(idx, 1)}
                            className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Existing Orders Already Sent to Kitchen */}
              {currentTable.orders.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Ya marchando en cocina ({currentTable.orders.length})
                  </span>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    {currentTable.orders.map((order, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <span>{order.quantity}× {order.name}</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatMoney(order.price * order.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
              {cart.length > 0 && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Subtotal nuevo pedido:</span>
                    <span className="font-mono">{formatMoney(cartSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Impuestos (18%):</span>
                    <span className="font-mono text-amber-600">{formatMoney(cartTax)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm pt-1">
                    <span>Total a enviar:</span>
                    <span className="font-mono font-extrabold text-emerald-600 text-base">
                      {formatMoney(cartTotal)}
                    </span>
                  </div>
                </div>
              )}

              {orderSentSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Pedido enviado a la cocina con éxito!</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSendOrderToKitchen}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Pedido a Cocina</span>
                  </button>
                )}

                {currentTable.orders.length > 0 && (
                  currentTable.status === 'por_cobrar' || billRequested ? (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 rounded-xl">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Cuenta solicitada · Mozo notificado</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleRequestBill();
                        setIsCartOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pedir la Cuenta</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Requested Toast Feedback */}
      {billRequested && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-3 duration-200 border border-emerald-500 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>¡Cuenta solicitada! El mozo fue notificado en el sistema y se acerca a tu mesa con el comprobante para cobrar.</span>
        </div>
      )}
    </div>
  );
};
