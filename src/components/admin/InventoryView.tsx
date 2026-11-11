import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { InventoryItem } from '../../types';
import {
  Boxes,
  Plus,
  AlertTriangle,
  CheckCircle,
  Truck,
  RotateCw,
  Search,
  X,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, restockItem } = useRestaurant();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');

  // Restock modal
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  const categories = ['todos', ...Array.from(new Set(inventory.map((i) => i.category)))];

  const filteredItems = inventory.filter((item) => {
    if (categoryFilter !== 'todos' && item.category !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q);
    }
    return true;
  });

  const getStockStatus = (current: number, min: number) => {
    if (current <= min * 0.5) {
      return { label: 'Crítico / Reordenar Ya', color: 'text-red-300 bg-red-950/60 border-red-800' };
    }
    if (current <= min) {
      return { label: 'Stock Bajo', color: 'text-amber-300 bg-amber-950/60 border-amber-700' };
    }
    return { label: 'Abastecido Óptimo', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-700' };
  };

  const handleConfirmRestock = () => {
    if (!restockingItem || restockAmount <= 0) return;
    restockItem(restockingItem.id, restockAmount);
    setRestockingItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-emerald-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            Control de Inventario y Materia Prima
          </h2>
          <p className="text-xs text-emerald-300/80">
            Seguimiento de insumos críticos, alertas automáticas de reposición y costos unitarios
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-emerald-400" />
            <input
              type="text"
              placeholder="Buscar insumo o proveedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-9 pr-3 py-1.5 bg-[#122e23] border border-[#23533e] rounded-xl text-white placeholder-emerald-700 focus:outline-hidden focus:border-emerald-400 shadow-inner"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-[#122e23] border border-[#23533e] text-emerald-100 rounded-xl font-medium focus:outline-hidden focus:border-emerald-400"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#0e241c] text-white">
                {c === 'todos' ? 'Todas las Categorías' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#122e23] rounded-3xl border border-[#23533e] shadow-md">
        <div>
          <span className="text-xs text-emerald-300/80">Insumos Registrados</span>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {inventory.length} items
          </div>
        </div>
        <div>
          <span className="text-xs text-emerald-300/80">Alertas de Stock Crítico</span>
          <div className="text-xl font-bold font-mono text-red-400 tabular-nums">
            {inventory.filter((i) => i.currentStock <= i.minStock).length} alertas activas
          </div>
        </div>
        <div>
          <span className="text-xs text-emerald-300/80">Valorización de Almacén</span>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            S/. {inventory.reduce((sum, i) => sum + i.currentStock * i.unitCost, 0).toFixed(2)}
          </div>
        </div>
        <div>
          <span className="text-xs text-emerald-300/80">Proveedores Activos</span>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {new Set(inventory.map((i) => i.supplier)).size} casas comerciales
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#122e23] rounded-3xl border border-[#23533e] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0e241c] text-emerald-200 font-semibold border-b border-[#1c4434]">
              <tr>
                <th className="px-4 py-3">Insumo</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Stock Actual</th>
                <th className="px-4 py-3 text-right">Stock Mínimo</th>
                <th className="px-4 py-3 text-right">Costo Unit. S/.</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#183b2d]">
              {filteredItems.map((item) => {
                const status = getStockStatus(item.currentStock, item.minStock);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#163a2c] transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-white">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-emerald-300/80">{item.category}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-300/80">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-200">
                      S/. {item.unitCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-300/80">
                      {item.supplier}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setRestockingItem(item);
                          setRestockAmount(10);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#183e2f] hover:bg-[#20513d] text-emerald-100 transition-colors inline-flex items-center gap-1 border border-[#255640]"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reabastecer</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#122e23] border border-[#23533e] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c4434]">
              <div>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase">
                  Reabastecimiento de Almacén
                </span>
                <h3 className="text-base font-bold text-white">
                  {restockingItem.name}
                </h3>
              </div>
              <button
                onClick={() => setRestockingItem(null)}
                className="text-emerald-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-emerald-200">
                Cantidad a ingresar ({restockingItem.unit}):
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#0b1f17] border border-[#23533e] rounded-xl text-white focus:outline-hidden focus:border-emerald-400 shadow-inner"
              />
            </div>

            <div className="text-xs text-emerald-300 space-y-1 bg-[#0e241c] p-3 rounded-2xl border border-[#1b4434]">
              <div className="flex justify-between">
                <span>Stock actual:</span>
                <span className="font-mono text-white">{restockingItem.currentStock} {restockingItem.unit}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span>Nuevo stock estimado:</span>
                <span className="font-mono text-emerald-400">{restockingItem.currentStock + restockAmount} {restockingItem.unit}</span>
              </div>
              <div className="flex justify-between text-amber-300 font-mono">
                <span>Costo estimado de la compra:</span>
                <span>S/. {(restockAmount * restockingItem.unitCost).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockingItem(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-[#23533e] text-emerald-200 hover:bg-[#183e2f]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 shadow-md shadow-emerald-950/40"
              >
                Confirmar Ingreso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
