import React from 'react';
import { ClosingCalculation, PaymentDetails } from '../types';
import { X, Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: ClosingCalculation;
  paymentDetails?: PaymentDetails | null;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  isOpen,
  onClose,
  calculation,
  paymentDetails,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (amount: number) => {
    return `$ ${amount.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const activeItems = calculation.items.filter((i) => i.quantity > 0);
  const currentDate = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 text-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-title"
      >
        {/* Modal Controls */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {paymentDetails ? 'Comprobante de Pago de Mesa' : 'Vista Previa de Comprobante'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Cerrar ticket"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Content */}
        <div className="p-6 font-mono text-xs leading-relaxed space-y-4 bg-white print:p-0">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h2 id="ticket-title" className="text-base font-bold tracking-tight text-slate-900">
              RESTOQUICK
            </h2>
            <p className="text-[11px] text-slate-500">C.U.I.T. 30-71429810-4 · IVA Responsable Inscripto</p>
            <div className="mt-2 text-[10px] uppercase font-bold text-slate-700 bg-slate-100 py-0.5 rounded">
              {paymentDetails
                ? `TICKET DE VENTA · ${paymentDetails.tableName?.toUpperCase() || 'MESA'}`
                : 'COMPROBANTE DE CIERRE DIARIO DE CAJA'}
            </div>
          </div>

          {/* Meta Info */}
          <div className="text-[11px] space-y-0.5 text-slate-600 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span className="font-semibold text-slate-900 capitalize">{currentDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Hora de emisión:</span>
              <span className="font-semibold text-slate-900">{paymentDetails?.timestamp || currentTime}</span>
            </div>
            {paymentDetails?.tableName && (
              <div className="flex justify-between">
                <span>Ubicación:</span>
                <span className="font-semibold text-slate-900">{paymentDetails.tableName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Caja:</span>
              <span className="font-semibold text-slate-900">Terminal Principal #01</span>
            </div>
          </div>

          {/* Payment Method Details (If applicable) */}
          {paymentDetails && (
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">MÉTODO DE PAGO:</span>
                <span className="font-bold text-emerald-700 uppercase">
                  {paymentDetails.method === 'efectivo'
                    ? 'Efectivo'
                    : paymentDetails.method === 'tarjeta_debito'
                    ? `Tarjeta Débito (${paymentDetails.cardBrand})`
                    : paymentDetails.method === 'tarjeta_credito'
                    ? `Tarjeta Crédito (${paymentDetails.cardBrand} - ${paymentDetails.cardInstallments} cuota/s)`
                    : paymentDetails.method === 'transferencia_mp'
                    ? `QR Mercado Pago (${paymentDetails.mpReference})`
                    : `Cuenta Dividida (${paymentDetails.splitDiners} pers.)`}
                </span>
              </div>

              {paymentDetails.cashGiven && (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>Abona con:</span>
                    <span className="font-semibold">{formatMoney(paymentDetails.cashGiven)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Vuelto entregado:</span>
                    <span className="font-semibold text-emerald-600">{formatMoney(paymentDetails.change || 0)}</span>
                  </div>
                </>
              )}

              {paymentDetails.amountPerDiner && (
                <div className="flex justify-between text-slate-500">
                  <span>Importe por persona ({paymentDetails.splitDiners}p):</span>
                  <span className="font-semibold">{formatMoney(paymentDetails.amountPerDiner)}</span>
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-700 pb-1.5 border-b border-slate-200">
              <span className="w-1/2">Menú / Ítem</span>
              <span className="w-1/4 text-center">Cant.</span>
              <span className="w-1/4 text-right">Subtotal neto</span>
            </div>
            <div className="divide-y divide-slate-100 py-1 space-y-1">
              {activeItems.map((item) => (
                <div key={item.id} className="flex justify-between text-[11px] py-1 border-b border-dotted border-slate-100 last:border-0">
                  <div className="w-1/2 font-sans pr-2">
                    <span className="break-words font-medium block leading-snug">{item.name}</span>
                    <span className="text-[9px] text-slate-400 block font-mono mt-0.5">
                      @ {formatMoney(item.price)}
                    </span>
                  </div>
                  <div className="w-1/4 text-center tabular-nums self-center">
                    {item.quantity}
                  </div>
                  <div className="w-1/4 text-right tabular-nums font-semibold self-center">
                    {formatMoney(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals in $ */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between text-slate-600">
              <span>Total Unidades:</span>
              <span className="font-bold tabular-nums text-slate-900">{calculation.totalUnits} un.</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Neto (sin impuestos):</span>
              <span className="tabular-nums font-semibold">{formatMoney(calculation.netSales)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Impuesto (18% IVA):</span>
              <span className="tabular-nums font-semibold text-amber-600">{formatMoney(calculation.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
              <span>VENTA TOTAL:</span>
              <span className="tabular-nums text-base font-extrabold text-emerald-700">{formatMoney(calculation.totalSales)}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
            <div>
              <div className="border-t border-slate-400 pt-1">Atendido por Mozo</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1">Caja / Control</div>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 pt-2">
            *** ¡Muchas gracias por su visita a RestoQuick! ***
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comprobante</span>
          </button>
        </div>
      </div>
    </div>
  );
};
