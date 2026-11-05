import React, { useState } from 'react';
import { RestaurantTable } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone,
  MapPin,
  Users
} from 'lucide-react';

interface TableQRModalProps {
  table: RestaurantTable | null;
  isOpen: boolean;
  onClose: () => void;
  onSimulateClient: (table: RestaurantTable) => void;
}

export const TableQRModal: React.FC<TableQRModalProps> = ({
  table,
  isOpen,
  onClose,
  onSimulateClient,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !table) return null;

  const simulatedUrl = `https://restoquick.app/menu?mesa=${table.number}&zona=${table.zone}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(simulatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 id="qr-modal-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                Código QR de la {table.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Escaneo directo para menú digital y pedidos de comensales
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal de QR"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Printable Card Preview */}
        <div className="p-6 flex flex-col items-center bg-slate-50 dark:bg-slate-950/40">
          {/* Table QR Card Frame */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-dashed border-emerald-500/40 dark:border-emerald-600/40 shadow-sm flex flex-col items-center max-w-xs w-full text-center">
            {/* Header Badge */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{table.zone === 'salon' ? 'Salón Principal' : table.zone === 'terraza' ? 'Terraza Exterior' : 'Sector VIP / Barra'}</span>
            </div>

            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              {table.name}
            </h4>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <Users className="w-3.5 h-3.5" />
              <span>Capacidad: {table.capacity} comensales</span>
            </div>

            {/* QR Code Container */}
            <QRCodeDisplay
              value={simulatedUrl}
              size={190}
            />

            <p className="mt-4 text-xs font-medium text-slate-700 dark:text-slate-300">
              Escaneá con la cámara de tu celular
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Accedé al menú digital, combos con descuento y realizá tu pedido directamente a la cocina.
            </p>
          </div>

          {/* Direct URL Box */}
          <div className="mt-4 w-full flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-mono text-slate-600 dark:text-slate-300 truncate flex-1 select-all text-[11px]">
              {simulatedUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer shrink-0"
              title="Copiar link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir QR de Mesa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSimulateClient(table);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Carta Digital</span>
          </button>
        </div>
      </div>
    </div>
  );
};
