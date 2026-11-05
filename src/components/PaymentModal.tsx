import React, { useState } from 'react';
import { 
  RestaurantTable, 
  PaymentDetails, 
  PaymentMethodType 
} from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { 
  X, 
  Banknote, 
  CreditCard, 
  QrCode, 
  Users2, 
  CheckCircle2, 
  Receipt,
  Copy,
  Check,
  Building2
} from 'lucide-react';

interface PaymentModalProps {
  table: RestaurantTable | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (payment: PaymentDetails) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  table,
  isOpen,
  onClose,
  onConfirmPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('efectivo');
  
  // Cash state
  const [cashGiven, setCashGiven] = useState<string>('');
  
  // Card state
  const [cardBrand, setCardBrand] = useState<string>('Visa');
  const [installments, setInstallments] = useState<number>(1);
  const [cardRef, setCardRef] = useState<string>('');
  
  // Split bill state
  const [splitCount, setSplitCount] = useState<number>(table?.diners || 2);

  // Copy state
  const [aliasCopied, setAliasCopied] = useState<boolean>(false);
  const [cvuCopied, setCvuCopied] = useState<boolean>(false);

  if (!isOpen || !table) return null;

  // Calculate table consumption
  const netAmount = table.orders.reduce((acc, order) => acc + order.price * order.quantity, 0);
  const taxAmount = Number((netAmount * 0.18).toFixed(2));
  const totalAmount = Number((netAmount + taxAmount).toFixed(2));

  const formatMoney = (amount: number) => {
    return `$ ${amount.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Cash calculations
  const parsedCash = parseFloat(cashGiven) || 0;
  const changeDue = Math.max(0, parsedCash - totalAmount);
  const isCashSufficient = parsedCash >= totalAmount;

  // Split bill calculations
  const actualSplitCount = Math.max(1, splitCount);
  const amountPerDiner = Number((totalAmount / actualSplitCount).toFixed(2));

  // Quick cash setters
  const handleQuickCash = (amount: number) => {
    setCashGiven(amount.toString());
  };

  const handleCopy = async (text: string, type: 'alias' | 'cvu') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'alias') {
        setAliasCopied(true);
        setTimeout(() => setAliasCopied(false), 2000);
      } else {
        setCvuCopied(true);
        setTimeout(() => setCvuCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentDetails: PaymentDetails = {
      method: selectedMethod,
      amount: totalAmount,
      taxAmount,
      netAmount,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      tableNumber: table.number,
      tableName: table.name,
      ...(selectedMethod === 'efectivo' && {
        cashGiven: parsedCash || totalAmount,
        change: changeDue,
      }),
      ...((selectedMethod === 'tarjeta_debito' || selectedMethod === 'tarjeta_credito') && {
        cardBrand,
        cardInstallments: installments,
      }),
      ...(selectedMethod === 'transferencia_mp' && {
        mpReference: `MP-${Math.floor(100000 + Math.random() * 900000)}`,
      }),
      ...(selectedMethod === 'dividida' && {
        splitDiners: actualSplitCount,
        amountPerDiner,
      }),
    };

    onConfirmPayment(paymentDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 id="payment-modal-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Cobrar {table.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Selecciona el método de pago y emite el comprobante
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal de pago"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Order Financial Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Subtotal neto (sin imp.):</span>
              <span className="font-mono">{formatMoney(netAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Impuesto 18% (IVA):</span>
              <span className="font-mono text-amber-600 dark:text-amber-400">{formatMoney(taxAmount)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Total a Pagar:
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatMoney(totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Efectivo */}
              <button
                type="button"
                onClick={() => setSelectedMethod('efectivo')}
                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'efectivo'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold">Efectivo</span>
              </button>

              {/* Tarjeta Débito */}
              <button
                type="button"
                onClick={() => setSelectedMethod('tarjeta_debito')}
                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'tarjeta_debito'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold">Tarjeta Débito</span>
              </button>

              {/* Transferencia / MP QR */}
              <button
                type="button"
                onClick={() => setSelectedMethod('transferencia_mp')}
                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'transferencia_mp'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold">QR / Mercado Pago</span>
              </button>

              {/* Dividir Cuenta */}
              <button
                type="button"
                onClick={() => setSelectedMethod('dividida')}
                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'dividida'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Users2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold">Dividir Cuenta</span>
              </button>
            </div>
          </div>

          {/* Method Sub-Form */}
          {selectedMethod === 'efectivo' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                ¿Con cuánto abona el cliente?
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  step="100"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  placeholder={totalAmount.toString()}
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickCash(totalAmount)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  Exacto (${totalAmount.toFixed(0)})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(Math.ceil(totalAmount / 5000) * 5000)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  ${(Math.ceil(totalAmount / 5000) * 5000).toLocaleString('es-AR')}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(Math.ceil(totalAmount / 10000) * 10000 + (totalAmount % 10000 === 0 ? 10000 : 0))}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  ${(Math.ceil(totalAmount / 10000) * 10000 + (totalAmount % 10000 === 0 ? 10000 : 0)).toLocaleString('es-AR')}
                </button>
              </div>

              {/* Live Change / Vuelto */}
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Vuelto / Cambio a entregar:
                </span>
                <span className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatMoney(changeDue)}
                </span>
              </div>
            </div>
          )}

          {(selectedMethod === 'tarjeta_debito' || selectedMethod === 'tarjeta_credito') && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Red de Tarjeta
                  </label>
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Visa">Visa Débito / Crédito</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Cabal">Cabal</option>
                    <option value="American Express">American Express</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Plan de Cuotas
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full py-2 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value={1}>1 Pago (${totalAmount.toLocaleString('es-AR')})</option>
                    <option value={3}>3 Cuotas (${(totalAmount / 3).toFixed(2)} c/u)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  N° de Cupón / Terminal POS (opcional)
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="Ej: POS-9938"
                  className="w-full py-1.5 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'transferencia_mp' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center text-center space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Escanear para pagar con Mercado Pago o cualquier billetera
              </span>

              {/* Dynamic QR for Payment */}
              <QRCodeDisplay
                value={`00020101021243650016COM.MERCADOLIBRE0129https://mpago.la/pos/${table.number}-${totalAmount}5204000053030325802AR5914RESTOQUICK_SA6009BSAS6304`}
                size={160}
              />

              {/* Bank Details */}
              <div className="w-full space-y-2 text-left pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ALIAS</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">restoquick.mp</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('restoquick.mp', 'alias')}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 cursor-pointer"
                  >
                    {aliasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">CVU BANCARIO</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">0000003100012345678901</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('0000003100012345678901', 'cvu')}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 cursor-pointer"
                  >
                    {cvuCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'dividida' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ¿Entre cuántas personas se divide la cuenta?
                </label>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSplitCount(num)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        splitCount === num
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Per Diner Card */}
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Abono por cada comensal ({actualSplitCount} pers.):
                </span>
                <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatMoney(amountPerDiner)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Pago y Liberar Mesa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
