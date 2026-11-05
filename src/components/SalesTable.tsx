import React, { useState } from 'react';
import { MenuItem } from '../types';
import { ItemIcon } from './ItemIcon';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Search, 
  Trash2, 
  PlusCircle,
  Pencil
} from 'lucide-react';

interface SalesTableProps {
  items: MenuItem[];
  sales: Record<string, number>;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onClearAll: () => void;
  onOpenAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (item: MenuItem) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  items,
  sales,
  onQuantityChange,
  onClearAll,
  onOpenAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['Todos', 'Combos y Promos', 'Comidas', 'Bebidas', 'Acompañamientos y Postres'];

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  const handleInputChange = (itemId: string, rawValue: string) => {
    const cleanValue = rawValue.replace(/[^0-9]/g, '');
    const numValue = cleanValue === '' ? 0 : parseInt(cleanValue, 10);
    onQuantityChange(itemId, Math.max(0, numValue));
  };

  const handleIncrement = (itemId: string, delta: number) => {
    const current = sales[itemId] || 0;
    const nextVal = Math.max(0, current + delta);
    onQuantityChange(itemId, nextVal);
  };

  const handleResetSingle = (itemId: string) => {
    onQuantityChange(itemId, 0);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Registro de Ventas del Menú
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Precios antes de impuestos. El 18% se aplica sobre la venta neta total.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Agregar Ítem al Menú</span>
            </button>

            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-xs cursor-pointer"
              title="Restablecer todas las cantidades a cero con confirmación"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Limpiar todo</span>
            </button>
          </div>
        </div>

        {/* Filter bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-lg overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <th scope="col" className="py-3 px-4 sm:px-6 w-[32%] sm:w-[35%] text-center whitespace-nowrap">
                Producto / Menú
              </th>
              <th scope="col" className="py-3 px-3 text-center w-36 sm:w-40 whitespace-nowrap">
                Precio (sin imp.)
              </th>
              <th scope="col" className="py-3 px-2 text-center w-44 sm:w-48 whitespace-nowrap">
                Cantidad
              </th>
              <th scope="col" className="py-3 px-3 text-center w-36 sm:w-40 whitespace-nowrap">
                Subtotal neto
              </th>
              <th scope="col" className="py-3 px-3 text-center w-20 sm:w-24 whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                  No se encontraron productos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const qty = sales[item.id] || 0;
                const subtotal = qty * item.price;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      qty > 0 ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                    }`}
                  >
                    {/* Item Info - Centered with header */}
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center justify-center gap-2.5 max-w-sm mx-auto">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                          <ItemIcon iconName={item.iconName} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block text-xs leading-snug break-words">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 break-words">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Unit Price in $ (pre-tax) - Centered with header */}
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap text-xs sm:text-[13px]">
                      $ {item.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Quantity Input with Steppers & Symmetrical Left Spacer - Dead Centered */}
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1 w-full">
                        {/* Balancing spacer matching the 24px reset button */}
                        <div className="w-6 h-6 shrink-0" aria-hidden="true" />

                        <button
                          type="button"
                          onClick={() => handleIncrement(item.id, -1)}
                          disabled={qty <= 0}
                          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          aria-label={`Disminuir ${item.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={qty === 0 ? '' : qty}
                          placeholder="0"
                          onChange={(e) => handleInputChange(item.id, e.target.value)}
                          className="w-16 h-8 shrink-0 text-center font-mono font-semibold text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                          aria-label={`Cantidad de ${item.name}`}
                        />

                        <button
                          type="button"
                          onClick={() => handleIncrement(item.id, 1)}
                          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          aria-label={`Aumentar ${item.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Space-reserved reset button */}
                        <button
                          type="button"
                          onClick={() => handleResetSingle(item.id)}
                          tabIndex={qty > 0 ? 0 : -1}
                          className={`w-6 h-6 shrink-0 flex items-center justify-center rounded text-slate-400 hover:text-rose-500 transition-all ${
                            qty > 0 ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'
                          }`}
                          title="Restablecer cantidad a 0"
                          aria-label={`Poner en 0 ${item.name}`}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Subtotal in $ - Centered identically to Precio (sin imp.) */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-xs sm:text-[13px] tabular-nums whitespace-nowrap">
                      <span className={subtotal > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}>
                        $ {subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Actions: Edit & Delete for EVERY row */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          title={`Editar ${item.name}`}
                          aria-label={`Editar ${item.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteItem(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          title={`Eliminar ${item.name}`}
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{filteredItems.length} productos en lista</span>
        <span>Escribe la cantidad directamente o usa <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300">Tab</kbd> para avanzar</span>
      </div>
    </div>
  );
};
