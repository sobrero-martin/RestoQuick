import React, { useState, useEffect } from 'react';
import { MenuItem, CategoryType } from '../types';
import { ItemIcon } from './ItemIcon';
import { X, Plus, Edit2, AlertCircle } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveItem: (item: MenuItem) => void;
  initialItem?: MenuItem | null;
}

const AVAILABLE_ICONS = [
  { id: 'burger', label: 'Hamburguesa' },
  { id: 'hotdog', label: 'Comida rápida' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'soup', label: 'Sopa / Caliente' },
  { id: 'salad', label: 'Ensalada' },
  { id: 'beer', label: 'Cerveza' },
  { id: 'soda', label: 'Gaseosa' },
  { id: 'cup', label: 'Bebida / Café' },
  { id: 'cake', label: 'Postre' },
  { id: 'utensils', label: 'Plato general' },
] as const;

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSaveItem,
  initialItem,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<CategoryType>('Comidas');
  const [iconName, setIconName] = useState<any>('utensils');
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(initialItem);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setPrice(initialItem.price.toString());
      setCategory(initialItem.category);
      setIconName(initialItem.iconName || 'utensils');
    } else {
      setName('');
      setPrice('');
      setCategory('Comidas');
      setIconName('utensils');
    }
    setError(null);
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const parsedPrice = parseFloat(price.replace(',', '.'));

    if (!cleanName) {
      setError('Por favor ingresa el nombre del producto.');
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Por favor ingresa un precio válido mayor a 0.');
      return;
    }

    const itemToSave: MenuItem = {
      id: initialItem ? initialItem.id : `item-${Date.now()}`,
      name: cleanName,
      price: parsedPrice,
      category,
      iconName,
    };

    onSaveItem(itemToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              {isEditing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h3 id="item-modal-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {isEditing ? 'Editar Ítem del Menú' : 'Agregar Nuevo Ítem al Menú'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? 'Actualiza los datos del producto' : 'El producto se sumará a la planilla de caja'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre del producto
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ej: Empanada de carne, Milanesa..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Precio unitario sin impuestos ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                $
              </span>
              <input
                type="text"
                required
                inputMode="decimal"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
            >
              <option value="Combos y Promos">Combos y Promos</option>
              <option value="Comidas">Comidas</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Acompañamientos y Postres">Acompañamientos y Postres</option>
            </select>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ícono del ítem
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => setIconName(icon.id)}
                  title={icon.label}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${
                    iconName === icon.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <ItemIcon iconName={icon.id} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isEditing ? 'Actualizar Ítem' : 'Guardar Ítem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
