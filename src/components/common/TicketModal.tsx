import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, Printer, CheckCircle, Receipt, QrCode } from 'lucide-react';
import { DinerOrderItem } from '../../types';

export const TicketModal: React.FC = () => {
  const { ticketModal, closeTicketModal } = useRestaurant();

  if (!ticketModal.isOpen || !ticketModal.data) return null;

  const data = ticketModal.data;
  const items: DinerOrderItem[] = data.items || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#122e23] border border-[#23533e] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 my-8 text-white">
        {/* Top actions */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1c4434]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Mesa Cobrada con Éxito</span>
          </div>
          <button
            onClick={closeTicketModal}
            className="text-emerald-300 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Printable Ticket Card (Simulated 80mm POS Thermal Receipt) */}
        <div
          id="printable-ticket"
          className="bg-[#0b1f17] p-5 rounded-2xl border border-[#1b4434] font-mono text-xs space-y-3 text-emerald-100 shadow-inner"
        >
          {/* Header */}
          <div className="text-center space-y-0.5 border-b border-dashed border-[#23533e] pb-3">
            <h3 className="font-extrabold text-sm tracking-tight text-white">
              GASTROMASTER RESTAURANTE S.A.C.
            </h3>
            <p className="text-[11px] text-emerald-400/80">R.U.C. 20608945123</p>
            <p className="text-[10px] text-emerald-400/80">Av. Larco 450, Miraflores, Lima</p>
            <p className="text-[10px] text-emerald-400/80">Telf: (01) 445-8920</p>
            <div className="text-[11px] font-bold text-emerald-300 pt-1">
              BOLETA ELECTRÓNICA: {data.ticketNumber}
            </div>
          </div>

          {/* Details */}
          <div className="text-[11px] space-y-0.5 text-emerald-300/80 border-b border-dashed border-[#23533e] pb-2">
            <div className="flex justify-between">
              <span>Mesa: {data.tableName}</span>
              <span>Fecha: {data.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Hora: {data.time}</span>
              <span>Cajero: Agustín (Gerencia)</span>
            </div>
            {data.customer && (
              <div className="pt-0.5 font-bold text-white">
                Cliente: {data.customer.name} (Socio {data.customer.tier})
              </div>
            )}
          </div>

          {/* Items breakdown */}
          <div className="space-y-1.5 py-1 border-b border-dashed border-[#23533e]">
            <div className="flex justify-between text-[10px] font-bold text-emerald-400 uppercase">
              <span>Cant / Descripción</span>
              <span>Total</span>
            </div>
            {items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-[11px] leading-tight">
                <div>
                  <span className="font-bold text-white">{it.quantity}x</span> {it.productName}
                  <div className="text-[10px] text-emerald-400/70">Comensal #{it.dinerNumber}</div>
                </div>
                <span className="font-bold shrink-0 tabular-nums text-white">
                  S/. {(it.price * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between text-emerald-300/80 text-[11px]">
              <span>Op. Gravada (Neto)</span>
              <span className="tabular-nums">S/. {data.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-300/80 text-[11px]">
              <span>I.G.V. (18.00%)</span>
              <span className="tabular-nums">S/. {data.tax.toFixed(2)}</span>
            </div>
            {data.tipAmount > 0 && (
              <div className="flex justify-between text-teal-300 text-[11px]">
                <span>Propina de Mozo</span>
                <span className="tabular-nums">+ S/. {data.tipAmount.toFixed(2)}</span>
              </div>
            )}
            {data.discountAmount > 0 && (
              <div className="flex justify-between text-amber-300 text-[11px]">
                <span>Descuento / Puntos</span>
                <span className="tabular-nums">- S/. {data.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-dashed border-[#23533e]">
              <span>TOTAL A PAGAR</span>
              <span className="tabular-nums text-base text-amber-300 font-black">S/. {data.total.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-emerald-300/80 pt-0.5">
              Método de Pago: <span className="font-bold uppercase text-white">{data.paymentMethod}</span>
            </div>
          </div>

          {/* QR & Footer */}
          <div className="pt-2 text-center space-y-1 border-t border-dashed border-[#23533e]">
            <div className="w-16 h-16 bg-[#163a2c] mx-auto rounded-xl flex items-center justify-center p-1 border border-[#23533e]">
              <QrCode className="w-12 h-12 text-emerald-300" />
            </div>
            <div className="text-[9px] text-emerald-400/70">
              Representación impresa de la Boleta Electrónica
            </div>
            <div className="text-[10px] font-bold text-emerald-200">
              ¡Gracias por preferir GastroMaster!
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={closeTicketModal}
            className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-[#23533e] text-emerald-200 hover:bg-[#183e2f]"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
