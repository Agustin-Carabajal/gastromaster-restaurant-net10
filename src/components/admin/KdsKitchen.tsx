import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { DinerOrderItem } from '../../types';
import {
  ChefHat,
  Flame,
  Wine,
  Clock,
  AlertTriangle,
  CheckCircle,
  Printer,
  Filter,
  Check,
} from 'lucide-react';

export const KdsKitchen: React.FC = () => {
  const { tables, updateOrderItemStatus } = useRestaurant();
  const [stationFilter, setStationFilter] = useState<'todos' | 'cocina' | 'barra'>('todos');
  const [printingComanda, setPrintingComanda] = useState<{ tableName: string; items: DinerOrderItem[] } | null>(null);

  // Group active orders by table
  const activeTablesWithOrders = tables
    .map((table) => {
      const pendingItems = table.activeOrderItems.filter((item) => {
        if (item.status === 'servido') return false;
        if (stationFilter !== 'todos' && item.station !== stationFilter) return false;
        return true;
      });
      return {
        table,
        items: pendingItems,
      };
    })
    .filter((entry) => entry.items.length > 0);

  const getStatusBadge = (status: DinerOrderItem['status']) => {
    switch (status) {
      case 'en_espera':
        return { label: 'En Cola', bg: 'bg-[#183e2f] text-emerald-200 border border-[#255640]' };
      case 'en_preparacion':
        return { label: 'En Marcha / Fuego', bg: 'bg-amber-950/70 text-amber-300 border border-amber-600/60' };
      case 'listo':
        return { label: 'Listo en Pase', bg: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/70' };
      default:
        return { label: 'Servido', bg: 'bg-[#183e2f] text-emerald-500' };
    }
  };

  const handlePrintComanda = (tableName: string, items: DinerOrderItem[]) => {
    setPrintingComanda({ tableName, items });
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-emerald-50">
      {/* Header & Station Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-400" />
            KDS Pantalla de Producción (Cocina & Barra)
          </h2>
          <p className="text-xs text-emerald-300/80">
            Comandas en tiempo real, alertas de alérgenos e impresión automática de tickets térmicos
          </p>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#122e23] border border-[#23533e] rounded-2xl">
          <button
            onClick={() => setStationFilter('todos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              stationFilter === 'todos'
                ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            Todas las Estaciones
          </button>
          <button
            onClick={() => setStationFilter('cocina')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              stationFilter === 'cocina'
                ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-teal-300" />
            <span>Cocina Caliente</span>
          </button>
          <button
            onClick={() => setStationFilter('barra')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              stationFilter === 'barra'
                ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Wine className="w-3.5 h-3.5 text-emerald-300" />
            <span>Barra & Bebidas</span>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {activeTablesWithOrders.length === 0 ? (
        <div className="bg-[#122e23] border border-[#23533e] rounded-3xl p-12 text-center space-y-3 shadow-xl">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">
            ¡Todas las comandas están al día!
          </h3>
          <p className="text-xs text-emerald-300/80 max-w-sm mx-auto">
            No hay platos pendientes en preparación. Los nuevos pedidos ingresados desde mesas o mozos aparecerán aquí al instante.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTablesWithOrders.map(({ table, items }) => {
            const hasAllergyInOrder = items.some((i) => i.allergensAlert && i.allergensAlert.length > 0);

            return (
              <div
                key={table.id}
                className={`bg-[#122e23] border rounded-3xl overflow-hidden shadow-md flex flex-col justify-between ${
                  hasAllergyInOrder
                    ? 'border-red-500/80 ring-2 ring-red-500'
                    : 'border-[#23533e]'
                }`}
              >
                <div>
                  {/* Comanda Header */}
                  <div className="p-4 bg-[#0e241c] text-white flex items-center justify-between border-b border-[#1b4434]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base tracking-tight">{table.name}</span>
                        <span className="font-mono text-xs text-amber-300 font-bold">#{table.number}</span>
                      </div>
                      <div className="text-[11px] text-emerald-300/80 flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3 h-3 text-amber-300" />
                        <span>Abierto: {table.occupiedSince || 'Ahora'}</span>
                        <span>·</span>
                        <span>{table.currentDiners} comensales</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePrintComanda(table.name, items)}
                      className="p-2 rounded-xl bg-[#183e2f] hover:bg-[#20513d] text-emerald-200 hover:text-white transition-colors border border-[#255640]"
                      title="Imprimir comanda térmica de cocina (80mm)"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Allergy Banner if any item has warning */}
                  {hasAllergyInOrder && (
                    <div className="bg-red-600 text-white px-4 py-1.5 text-xs font-bold flex items-center gap-2 uppercase tracking-wide">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>¡Alerta Médica de Alergias en esta mesa!</span>
                    </div>
                  )}

                  {/* Order items list */}
                  <div className="p-4 divide-y divide-[#1b4434] space-y-3">
                    {items.map((item) => {
                      const badge = getStatusBadge(item.status);

                      return (
                        <div key={item.id} className="pt-3 first:pt-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm bg-[#0e241c] border border-[#23533e] px-2 py-0.5 rounded-lg text-emerald-300">
                                  {item.quantity}x
                                </span>
                                <span className="font-bold text-white text-sm">
                                  {item.productName}
                                </span>
                              </div>
                              <span className="text-[11px] text-emerald-300/80 font-medium">
                                Comensal #{item.dinerNumber} · {item.station.toUpperCase()}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <div className="text-xs text-emerald-100 bg-[#0d221a] p-2 rounded-xl border border-[#23533e] font-medium italic">
                              Nota: {item.notes}
                            </div>
                          )}

                          {/* Allergen alert */}
                          {item.allergensAlert && item.allergensAlert.length > 0 && (
                            <div className="text-xs text-red-200 bg-red-950/60 p-2 rounded-xl border border-red-800 font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                              <span>ALERGIA: {item.allergensAlert.join(', ')}</span>
                            </div>
                          )}

                          {/* Status Stepper Controls */}
                          <div className="flex items-center gap-1.5 pt-1">
                            {item.status === 'en_espera' && (
                              <button
                                onClick={() => updateOrderItemStatus(table.id, item.id, 'en_preparacion')}
                                className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-1"
                              >
                                <Flame className="w-3.5 h-3.5" />
                                <span>Iniciar Cocción</span>
                              </button>
                            )}

                            {item.status === 'en_preparacion' && (
                              <button
                                onClick={() => updateOrderItemStatus(table.id, item.id, 'listo')}
                                className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-950/40"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Marcar Listo en Pase</span>
                              </button>
                            )}

                            {item.status === 'listo' && (
                              <button
                                onClick={() => updateOrderItemStatus(table.id, item.id, 'servido')}
                                className="flex-1 py-1.5 px-2 bg-[#183e2f] hover:bg-[#20513d] text-emerald-100 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 border border-[#255640]"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Entregado a Mesa</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 bg-[#0e241c] border-t border-[#1b4434] text-[11px] text-emerald-300/80 flex justify-between items-center">
                  <span>Orden: {table.activeOrderId || 'ORD-LIVE'}</span>
                  <span className="font-mono text-emerald-300">{items.length} platos en ticket</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hidden printable comanda element */}
      {printingComanda && (
        <div id="printable-ticket" className="hidden">
          <div className="text-center pb-2 border-b border-black font-mono text-xs">
            <h2 className="font-bold text-sm">*** COMANDA DE COCINA ***</h2>
            <div>{printingComanda.tableName}</div>
            <div>Hora: {new Date().toLocaleTimeString()}</div>
          </div>
          <div className="py-2 font-mono text-xs space-y-1.5">
            {printingComanda.items.map((it, idx) => (
              <div key={idx} className="border-b border-dashed border-gray-400 pb-1">
                <div className="font-bold">
                  {it.quantity}x {it.productName} (Comensal #{it.dinerNumber})
                </div>
                {it.notes && <div>* NOTA: {it.notes}</div>}
                {it.allergensAlert && (
                  <div className="font-bold uppercase">*** ALERGIA: {it.allergensAlert.join(', ')} ***</div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center pt-2 border-t border-black font-mono text-[10px]">
            GastroMaster KDS Production
          </div>
        </div>
      )}
    </div>
  );
};
