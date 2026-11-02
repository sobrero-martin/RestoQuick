import React, { useState } from 'react';
import { ClosingCalculation } from '../types';
import { 
  Receipt, 
  Printer, 
  Copy, 
  CheckCircle2, 
  LogOut,
  FileCheck2
} from 'lucide-react';

interface ClosingSummaryProps {
  calculation: ClosingCalculation;
  onOpenReceipt: () => void;
  onFinalizeClosing: () => void;
  onExitApp: () => void;
  isFinalized: boolean;
}

export const ClosingSummary: React.FC<ClosingSummaryProps> = ({
  calculation,
  onOpenReceipt,
  onFinalizeClosing,
  onExitApp,
  isFinalized,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const formatMoney = (amount: number) => {
    return `$ ${amount.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleCopySummary = async () => {
    const activeItems = calculation.items.filter((i) => i.quantity > 0);
    const textReport = [
      '========================================',
      '        RESTOQUICK - CIERRE DIARIO',
      `Fecha/Hora: ${new Date().toLocaleString('es-AR')}`,
      '========================================',
      ...activeItems.map(
        (i) => `${i.name.padEnd(22)} ${i.quantity.toString().padStart(4)} un.  ${formatMoney(i.subtotal).padStart(14)}`
      ),
      '----------------------------------------',
      `TOTAL UNIDADES:      ${calculation.totalUnits} un.`,
      `SUBTOTAL NETO:       ${formatMoney(calculation.netSales)}`,
      `IMPUESTO (18%):      ${formatMoney(calculation.taxAmount)}`,
      `VENTA TOTAL:         ${formatMoney(calculation.totalSales)}`,
      '========================================',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(textReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const activeCount = calculation.items.filter((i) => i.quantity > 0).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Financial Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header with status */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Resumen del Cierre
            </h3>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md ${
              isFinalized
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            {isFinalized ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Cierre Registrado</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Borrador en curso</span>
              </>
            )}
          </span>
        </div>

        {/* Financial Highlights */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Main Total Callout */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Venta Total (con impuestos)
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {calculation.totalUnits} unidades
              </span>
            </div>
            <div className="mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                {formatMoney(calculation.totalSales)}
              </span>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2.5 text-sm">
            {/* Net Sales */}
            <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">
                Subtotal neto (sin impuestos)
              </span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                {formatMoney(calculation.netSales)}
              </span>
            </div>

            {/* Tax Row */}
            <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">
                Impuesto a pagar (18%)
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {formatMoney(calculation.taxAmount)}
              </span>
            </div>
          </div>

          {/* Quick Ticket Voucher Preview */}
          <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-950/70 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>Arqueo de Turno</span>
              <span>{activeCount} ítems con ventas</span>
            </div>

            <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900 py-1 space-y-1">
              {activeCount === 0 ? (
                <p className="py-2 text-center text-slate-400 italic text-[11px]">
                  No se han registrado cantidades vendidas aún.
                </p>
              ) : (
                calculation.items
                  .filter((i) => i.quantity > 0)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between py-1 text-[11px] gap-2"
                    >
                      <span className="text-slate-800 dark:text-slate-200 font-sans leading-tight break-words flex-1">
                        {item.name} <span className="text-slate-400 font-mono">×{item.quantity}</span>
                      </span>
                      <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 shrink-0">
                        {formatMoney(item.subtotal)}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={onFinalizeClosing}
              disabled={calculation.totalSales === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isFinalized ? 'Actualizar Cierre de Caja' : 'Finalizar y Registrar Cierre'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenReceipt}
                disabled={!isFinalized || calculation.totalSales === 0}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title={
                  !isFinalized
                    ? 'Finaliza y registra el cierre para habilitar la impresión'
                    : 'Imprimir ticket o guardar como PDF'
                }
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                disabled={calculation.totalSales === 0}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Copiar resumen al portapapeles"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>

            {/* Exit button */}
            <button
              type="button"
              onClick={onExitApp}
              className="mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Cerrar sesión de caja y reiniciar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión / Salir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
