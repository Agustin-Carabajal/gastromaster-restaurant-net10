import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  X,
  Trash2,
  Send,
  AlertTriangle,
  User,
  CheckCircle,
  Plus,
  Minus,
  UtensilsCrossed,
} from 'lucide-react';

export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    cartItems,
    selectedTable,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    submitCustomerOrder,
  } = useRestaurant();

  const [customerGeneralNotes, setCustomerGeneralNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);

  if (!isOpen) return null;

  // Group cart items by diner number
  const dinersGrouped = cartItems.reduce((acc, item) => {
    if (!acc[item.dinerNumber]) {
      acc[item.dinerNumber] = [];
    }
    acc[item.dinerNumber].push(item);
    return acc;
  }, {} as Record<number, typeof cartItems>);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = +(subtotal * 0.18).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    await submitCustomerOrder(customerGeneralNotes);
    setIsSubmitting(false);
    setOrderSentSuccess(true);
    setTimeout(() => {
      setOrderSentSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#10291f] h-full flex flex-col shadow-2xl border-l border-[#23533e] text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1b4434] flex items-center justify-between bg-[#0e241c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Comanda de Mesa #{selectedTable?.number || 1}
              </h3>
              <p className="text-[11px] text-emerald-300/80">
                {cartItems.length} {cartItems.length === 1 ? 'item listo' : 'items listos'} para enviar a cocina
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {orderSentSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/60">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-white">
                ¡Comanda en Marcha!
              </h4>
              <p className="text-xs text-emerald-200/90 max-w-xs">
                La cocina y barra han recibido tu orden y están preparando los platos en este instante.
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-emerald-400/60">
              <UtensilsCrossed className="w-12 h-12 stroke-[1.2]" />
              <p className="text-sm font-bold text-emerald-100">
                El pedido para esta mesa está vacío
              </p>
              <p className="text-xs max-w-xs text-emerald-300/70">
                Selecciona platillos, combos o bebidas de la carta y asígnalos a cada comensal para enviar la comanda.
              </p>
            </div>
          ) : (
            <>
              {/* Diners list */}
              {Object.keys(dinersGrouped).map((dinerKey) => {
                const dinerNum = Number(dinerKey);
                const items = dinersGrouped[dinerNum];
                const dinerSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

                return (
                  <div
                    key={dinerKey}
                    className="border border-[#23533e] rounded-2xl overflow-hidden bg-[#143628]"
                  >
                    <div className="px-3.5 py-2 bg-[#194231] flex items-center justify-between text-xs font-semibold text-emerald-100 border-b border-[#23533e]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Comensal #{dinerNum}</span>
                      </div>
                      <span className="font-mono text-amber-300 font-bold">
                        S/. {dinerSubtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="divide-y divide-[#1e4c38]">
                      {items.map((item) => (
                        <div key={item.id} className="p-3 text-xs space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-semibold text-white">
                                {item.productName}
                              </span>
                              <div className="text-[11px] text-emerald-300/80 font-mono">
                                S/. {item.price.toFixed(2)} c/u
                              </div>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-emerald-400/70 hover:text-red-400 p-1"
                              title="Quitar plato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Notes and Allergies */}
                          {item.notes && (
                            <div className="text-[11px] text-emerald-200 bg-[#0d221a] p-1.5 rounded-lg border border-[#23533e] italic">
                              &ldquo;{item.notes}&rdquo;
                            </div>
                          )}

                          {item.allergensAlert && item.allergensAlert.length > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-red-300 font-medium bg-red-950/50 p-1.5 rounded-lg border border-red-800">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                              <span>Alerta Alergias: {item.allergensAlert.join(', ')}</span>
                            </div>
                          )}

                          {/* Quantity control */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-emerald-300/70">
                              Estación: {item.station === 'cocina' ? 'Cocina' : 'Barra'}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartItemQuantity(item.id, -1)}
                                className="w-6 h-6 rounded-lg bg-[#1f4e3b] flex items-center justify-center hover:bg-[#28634b] transition-colors border border-[#2d6c52]"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono font-bold text-xs w-4 text-center tabular-nums text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartItemQuantity(item.id, 1)}
                                className="w-6 h-6 rounded-lg bg-[#1f4e3b] flex items-center justify-center hover:bg-[#28634b] transition-colors border border-[#2d6c52]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* General Order Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-200">
                  Instrucciones generales para el servicio de la mesa:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Servir las bebidas primero, traer cubiertos extra..."
                  value={customerGeneralNotes}
                  onChange={(e) => setCustomerGeneralNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0b1f17] border border-[#23533e] rounded-xl text-white placeholder-emerald-700 focus:outline-hidden focus:border-emerald-400 shadow-inner"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer with totals & Submit CTA */}
        {cartItems.length > 0 && !orderSentSuccess && (
          <div className="p-5 border-t border-[#1b4434] bg-[#0c2018] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-emerald-300/80">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="font-mono tabular-nums text-white">S/. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-300/80">
                <span>Impuesto IGV (18%)</span>
                <span className="font-mono tabular-nums text-white">S/. {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-[#1b4434]">
                <span>Total a Pagar</span>
                <span className="font-mono tabular-nums text-base text-amber-300 font-black">
                  S/. {total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={clearCart}
                className="px-3 py-2.5 text-xs text-emerald-300/80 hover:text-red-300 font-medium border border-[#23533e] rounded-xl hover:bg-[#15382a]"
                title="Vaciar carrito"
              >
                Vaciar
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitOrder}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando a cocina...' : 'Enviar Comanda a Cocina'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
