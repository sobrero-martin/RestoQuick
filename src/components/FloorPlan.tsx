import React, { useState } from 'react';
import { 
  RestaurantTable, 
  TableStatus, 
  TableZone, 
  MenuItem 
} from '../types';
import { 
  Users, 
  Clock, 
  FileText, 
  Receipt, 
  QrCode, 
  ExternalLink, 
  Plus, 
  Trash2, 
  AlertCircle,
  Sparkles,
  Utensils,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface FloorPlanProps {
  tables: RestaurantTable[];
  menuItems: MenuItem[];
  onSelectTable: (table: RestaurantTable) => void;
  onUpdateTableObservations: (tableId: string, observations: string) => void;
  onUpdateTableStatus: (tableId: string, status: TableStatus) => void;
  onUpdateTableDiners: (tableId: string, diners: number) => void;
  onAddItemToTable: (tableId: string, menuItem: MenuItem, quantity: number, notes?: string) => void;
  onRemoveOrderItem: (tableId: string, orderIndex: number) => void;
  onOpenPayment: (table: RestaurantTable) => void;
  onOpenQR: (table: RestaurantTable) => void;
  onOpenClientMode: (table: RestaurantTable) => void;
  onFreeTable: (tableId: string) => void;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({
  tables,
  menuItems,
  onSelectTable,
  onUpdateTableObservations,
  onUpdateTableStatus,
  onUpdateTableDiners,
  onAddItemToTable,
  onRemoveOrderItem,
  onOpenPayment,
  onOpenQR,
  onOpenClientMode,
  onFreeTable,
}) => {
  const [activeZone, setActiveZone] = useState<'todas' | TableZone>('todas');
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[1]?.id || tables[0]?.id || '');
  const [isAddingItems, setIsAddingItems] = useState<boolean>(false);
  const [quickSearch, setQuickSearch] = useState<string>('');
  const [itemNote, setItemNote] = useState<string>('');

  const selectedTable = tables.find((t) => t.id === selectedTableId) || tables[0];

  const filteredTables = tables.filter((t) => {
    if (activeZone === 'todas') return true;
    return t.zone === activeZone;
  });

  // Status configuration mapping
  const statusConfig: Record<TableStatus, { label: string; bg: string; border: string; text: string; dot: string }> = {
    disponible: {
      label: 'Disponible',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-500/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    ocupada: {
      label: 'Ocupada',
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      border: 'border-sky-500/60',
      text: 'text-sky-700 dark:text-sky-300',
      dot: 'bg-sky-500',
    },
    pidiendo: {
      label: 'En Espera / Pidiendo',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-500/60',
      text: 'text-amber-800 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    por_cobrar: {
      label: 'Cuenta Solicitada',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-500/60',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-500',
    },
    reservada: {
      label: 'Reservada',
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      border: 'border-slate-400/50',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-400',
    },
  };

  // Quick observation suggestion chips
  const observationTags = [
    'Cumpleaños 🎂',
    'Celíaco / Sin TACC 🌾',
    'Alérgico a frutos secos ⚠️',
    'Comensales con prisa ⏱️',
    'Sin sal agregada 🧂',
    'Hielo y limón extra 🍋',
    'Mesa con niños (trona) 👶',
    'Cuenta separada 💳',
  ];

  const handleAddTagToObservations = (tag: string) => {
    if (!selectedTable) return;
    const current = selectedTable.observations.trim();
    const updated = current ? `${current}. ${tag}` : tag;
    onUpdateTableObservations(selectedTable.id, updated);
  };

  const getTableSubtotal = (table: RestaurantTable) => {
    return table.orders.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  };

  const formatMoney = (amount: number) => {
    return `$ ${amount.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Render simulated chairs around the table
  const renderChairs = (capacity: number, shape: string) => {
    const chairs = [];
    const count = capacity;
    for (let i = 0; i < count; i++) {
      chairs.push(i);
    }

    if (shape === 'round') {
      return (
        <>
          {chairs.map((_, i) => {
            const angle = (i / count) * 2 * Math.PI;
            const radius = 34; // px from center
            const cx = 50 + radius * Math.cos(angle);
            const cy = 50 + radius * Math.sin(angle);
            return (
              <div
                key={i}
                className="absolute w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 shadow-2xs -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                style={{ left: `${cx}%`, top: `${cy}%` }}
              />
            );
          })}
        </>
      );
    }

    // Square or rectangular: chairs at top and bottom
    const topCount = Math.ceil(count / 2);
    const bottomCount = Math.floor(count / 2);

    return (
      <>
        {/* Top chairs */}
        <div className="absolute -top-3.5 left-2 right-2 flex justify-around pointer-events-none">
          {Array.from({ length: topCount }).map((_, i) => (
            <div
              key={`top-${i}`}
              className="w-3.5 h-3 rounded-t-sm bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 shadow-2xs"
            />
          ))}
        </div>
        {/* Bottom chairs */}
        <div className="absolute -bottom-3.5 left-2 right-2 flex justify-around pointer-events-none">
          {Array.from({ length: bottomCount }).map((_, i) => (
            <div
              key={`bottom-${i}`}
              className="w-3.5 h-3 rounded-b-sm bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 shadow-2xs"
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Plano del Salón
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Haz click sobre una mesa para gestionar comensales, comanda, observaciones y cobro.
          </p>
        </div>

        {/* Zone Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          {(
            [
              { id: 'todas', label: 'Todo el Local' },
              { id: 'salon', label: 'Salón Principal' },
              { id: 'terraza', label: 'Terraza' },
              { id: 'vip', label: 'Sector Barra / VIP' },
            ] as const
          ).map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => setActiveZone(zone.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                activeZone === zone.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {zone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Floor Layout Grid: 2-column layout (Left: Architectural Canvas 8 cols, Right: Selected Table Details 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Spatial Floor Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Spatial Floor Area Container */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-100 dark:bg-slate-950/80 rounded-2xl border-2 border-slate-300/80 dark:border-slate-800 p-4 sm:p-6 overflow-hidden shadow-inner select-none">
            {/* Architectural Grid Background */}
            <div 
              className="absolute inset-0 opacity-[0.07] dark:opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Architectural Room Features */}
            {/* 1. Main Entrance Door at bottom center */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-200 dark:bg-slate-800 border-t-2 border-slate-400 dark:border-slate-600 text-[10px] font-bold text-slate-500 uppercase tracking-widest rounded-t-md flex items-center gap-1.5">
              <span>Puerta Principal / Acceso</span>
            </div>

            {/* 2. Kitchen & Counter Service at top left */}
            <div className="absolute top-2 left-3 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 rounded-lg text-[10px] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 shadow-2xs">
              <Utensils className="w-3 h-3" />
              <span>Cocina & Despacho</span>
            </div>

            {/* 3. Bar Counter at top center */}
            <div className="absolute top-2 left-1/3 -translate-x-1/2 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300">
              <span>Barra de Tragos & Café</span>
            </div>

            {/* 4. Terrace Divider at top right */}
            <div className="absolute top-2 right-4 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-md text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              <span>Terraza al Aire Libre 🌿</span>
            </div>

            {/* Architectural Divider Lines */}
            <div className="absolute top-10 bottom-10 right-[30%] w-px border-r-2 border-dashed border-slate-300 dark:border-slate-800/80 pointer-events-none" />
            <div className="absolute top-[68%] left-3 right-[30%] h-px border-b-2 border-dashed border-slate-300 dark:border-slate-800/80 pointer-events-none" />

            {/* Render Restaurant Tables in their Real Positions */}
            {filteredTables.map((table) => {
              const isSelected = selectedTable?.id === table.id;
              const subtotal = getTableSubtotal(table);
              const config = statusConfig[table.status];
              const hasObservations = Boolean(table.observations && table.observations.trim().length > 0);

              const isRound = table.shape === 'round';
              const isRect = table.shape === 'rect';

              return (
                <div
                  key={table.id}
                  onClick={() => {
                    setSelectedTableId(table.id);
                    onSelectTable(table);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group ${
                    isSelected ? 'z-20 scale-105' : 'z-10 hover:scale-102'
                  }`}
                  style={{
                    left: `${table.x}%`,
                    top: `${table.y}%`,
                  }}
                >
                  {/* Surrounding Chairs */}
                  {renderChairs(table.capacity, table.shape)}

                  {/* Table Surface */}
                  <div
                    className={`relative flex flex-col items-center justify-center border-2 transition-all shadow-md ${
                      config.bg
                    } ${
                      isSelected
                        ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-lg'
                        : config.border
                    } ${
                      isRound
                        ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-full'
                        : isRect
                        ? 'w-24 h-16 sm:w-28 sm:h-20 rounded-xl'
                        : 'w-16 h-16 sm:w-20 sm:h-20 rounded-xl'
                    }`}
                  >
                    {/* Status Dot / Indicator */}
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
                        M{table.number}
                      </span>
                    </div>

                    {/* Capacity / Diners Info */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                      <Users className="w-2.5 h-2.5" />
                      <span>{table.diners > 0 ? `${table.diners}/${table.capacity}` : `${table.capacity}p`}</span>
                    </div>

                    {/* Subtotal Pill if has consumption */}
                    {subtotal > 0 && (
                      <span className="mt-1 font-mono text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
                        {formatMoney(subtotal)}
                      </span>
                    )}

                    {/* Observations alert badge */}
                    {hasObservations && (
                      <div 
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold shadow-xs animate-bounce"
                        title={table.observations}
                      >
                        !
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Status Legend */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-semibold text-[11px]">Estados de mesa:</span>
            <div className="flex flex-wrap items-center gap-3">
              {(
                [
                  { status: 'disponible', label: 'Disponible' },
                  { status: 'ocupada', label: 'Ocupada' },
                  { status: 'pidiendo', label: 'Pidiendo / Esperando' },
                  { status: 'por_cobrar', label: 'Cuenta Pedida' },
                  { status: 'reservada', label: 'Reservada' },
                ] as const
              ).map((item) => {
                const cfg = statusConfig[item.status];
                return (
                  <div key={item.status} className="flex items-center gap-1.5 text-[11px]">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Table Manager & Orders */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {selectedTable ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              {/* Table Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shadow-emerald-600/30">
                    M{selectedTable.number}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {selectedTable.name}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {selectedTable.zone === 'salon' ? 'Salón Principal' : selectedTable.zone === 'terraza' ? 'Terraza Exterior' : 'Sector VIP / Barra'} · {selectedTable.capacity} asientos
                    </span>
                  </div>
                </div>

                {/* QR Code Action Button */}
                <button
                  type="button"
                  onClick={() => onOpenQR(selectedTable)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Ver código QR de la mesa"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* Status & Diners Controls */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                {/* Status Switcher */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    Estado Actual
                  </label>
                  <select
                    value={selectedTable.status}
                    onChange={(e) => onUpdateTableStatus(selectedTable.id, e.target.value as TableStatus)}
                    className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="disponible">🟢 Disponible / Libre</option>
                    <option value="ocupada">🔵 Ocupada (Consumiendo)</option>
                    <option value="pidiendo">🟡 Pidiendo / Espera de platos</option>
                    <option value="por_cobrar">🟣 Cuenta Solicitada (Cobrar)</option>
                    <option value="reservada">⚪ Reservada</option>
                  </select>
                </div>

                {/* Diners Count Stepper */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Comensales sentados:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateTableDiners(selectedTable.id, Math.max(0, selectedTable.diners - 1))}
                      className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-xs">
                      {selectedTable.diners}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateTableDiners(selectedTable.id, selectedTable.diners + 1)}
                      className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* OBSERVACIONES POR MESA (Prominent Requirement) */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/20 dark:bg-amber-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Observaciones de la Mesa</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Visibles para mozos y cocina</span>
                </div>

                <textarea
                  rows={2}
                  value={selectedTable.observations}
                  onChange={(e) => onUpdateTableObservations(selectedTable.id, e.target.value)}
                  placeholder="Ej: Cliente celíaco, festejan cumpleaños, comida sin sal, bebidas con hielo..."
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                />

                {/* Quick observation tag chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {observationTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTagToObservations(tag)}
                      className="px-2 py-0.5 text-[10px] bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Current Orders */}
              <div className="p-4 flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Comanda de Consumo ({selectedTable.orders.length} ítems)
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsAddingItems(!isAddingItems)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingItems ? 'Cerrar selector' : 'Añadir ítem'}</span>
                  </button>
                </div>

                {/* Quick Item Picker Modal/Dropdown */}
                {isAddingItems && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-100">
                    <input
                      type="text"
                      placeholder="Buscar producto o combo..."
                      value={quickSearch}
                      onChange={(e) => setQuickSearch(e.target.value)}
                      className="w-full p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Nota especial (ej. sin cebolla)..."
                      value={itemNote}
                      onChange={(e) => setItemNote(e.target.value)}
                      className="w-full p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />

                    <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
                      {menuItems
                        .filter((i) => i.name.toLowerCase().includes(quickSearch.toLowerCase()))
                        .map((item) => (
                          <div
                            key={item.id}
                            className="pt-1 flex items-center justify-between text-xs py-1"
                          >
                            <span className="truncate flex-1 font-medium">{item.name}</span>
                            <span className="font-mono tabular-nums text-slate-500 mr-2">
                              {formatMoney(item.price)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onAddItemToTable(selectedTable.id, item, 1, itemNote || undefined);
                                setItemNote('');
                              }}
                              className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                            >
                              + Agregar
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Orders List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedTable.orders.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs italic">
                      Mesa sin productos cargados.
                    </div>
                  ) : (
                    selectedTable.orders.map((order, idx) => (
                      <div key={idx} className="pt-1.5 flex items-start justify-between gap-2 text-xs">
                        <div className="flex-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                            {order.quantity}× {order.name}
                          </span>
                          {order.notes && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 block italic">
                              Nota: {order.notes}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            Hora: {order.addedAt}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                            {formatMoney(order.price * order.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveOrderItem(selectedTable.id, idx)}
                            className="text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Quitar ítem"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal & Total Display */}
                {selectedTable.orders.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Subtotal neto:</span>
                      <span className="font-mono">{formatMoney(getTableSubtotal(selectedTable))}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Impuestos (18%):</span>
                      <span className="font-mono text-amber-600">{formatMoney(getTableSubtotal(selectedTable) * 0.18)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white pt-1">
                      <span>Total con IVA:</span>
                      <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatMoney(getTableSubtotal(selectedTable) * 1.18)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Table Actions Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col gap-2">
                {/* Cobrar Button */}
                <button
                  type="button"
                  onClick={() => onOpenPayment(selectedTable)}
                  disabled={selectedTable.orders.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Cobrar Mesa (Efectivo / MP QR / Tarjetas)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {/* Enter as client for this table */}
                  <button
                    type="button"
                    onClick={() => onOpenClientMode(selectedTable)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ver Carta / Menú</span>
                  </button>

                  {/* Free table */}
                  <button
                    type="button"
                    onClick={() => onFreeTable(selectedTable.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Liberar Mesa</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
              Selecciona una mesa en el plano para ver y editar su información.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
