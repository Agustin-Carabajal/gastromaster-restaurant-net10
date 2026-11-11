import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import { Table, TableStatus, Product } from '../../types';
import {
  Users,
  Clock,
  Plus,
  Receipt,
  Check,
  CreditCard,
  DollarSign,
  Smartphone,
  Sparkles,
  AlertTriangle,
  X,
  UserCheck,
  Utensils,
  LayoutGrid,
  Map,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const TablesGrid: React.FC = () => {
  const {
    tables,
    products,
    updateTableStatus,
    addOrderItemDirectly,
    checkoutTable,
    openTicketModal,
    setSelectedTableId,
    setCurrentView,
  } = useRestaurant();

  // View mode: 'map' (Plano 2D), 'cards' (Tarjetas), 'combined' (Plano + Panel lateral)
  const [displayMode, setDisplayMode] = useState<'combined' | 'map' | 'cards'>('combined');
  const [activeZone, setActiveZone] = useState<string>('todos');
  const [selectedFloorTable, setSelectedFloorTable] = useState<Table>(tables[0]);

  // Order modal
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | null>(null);
  const [manualDiner, setManualDiner] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [manualQuantity, setManualQuantity] = useState<number>(1);
  const [manualNotes, setManualNotes] = useState<string>('');
  const [manualAllergens, setManualAllergens] = useState<string>('');

  // Checkout modal
  const [checkoutModalTable, setCheckoutModalTable] = useState<Table | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'mercado_pago' | 'yape_plin' | 'puntos'>('efectivo');
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<number>(0);

  // Table status edit modal
  const [editingTableStatus, setEditingTableStatus] = useState<Table | null>(null);
  const [newStatus, setNewStatus] = useState<TableStatus>('libre');
  const [newDinersCount, setNewDinersCount] = useState<number>(2);

  const zones = ['todos', 'Salón Principal', 'Terraza', 'Barra', 'VIP'];

  const filteredTables = tables.filter((t) => {
    if (activeZone !== 'todos' && t.zone !== activeZone) return false;
    return true;
  });

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'libre':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-700/80';
      case 'ocupada':
        return 'bg-amber-950/60 text-amber-300 border-amber-700/80';
      case 'reservada':
        return 'bg-blue-950/60 text-blue-300 border-blue-700/80';
      case 'no_disponible':
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  const getMapTableBorderColor = (table: Table) => {
    const isSelected = selectedFloorTable?.id === table.id;
    if (isSelected) return 'ring-3 ring-emerald-400 border-emerald-300 shadow-lg scale-105 bg-[#1a4433]';
    switch (table.status) {
      case 'libre':
        return 'border-emerald-500/80 bg-emerald-950/50 hover:border-emerald-400';
      case 'ocupada':
        return 'border-amber-500/90 bg-amber-950/60 hover:border-amber-400';
      case 'reservada':
        return 'border-teal-500/80 bg-teal-950/50 hover:border-teal-400';
      case 'no_disponible':
        return 'border-[#23533e] bg-[#0d2218]/80 opacity-60';
    }
  };

  const handleOpenManualOrder = (table: Table) => {
    setSelectedTableForOrder(table);
    setSelectedProductId(products[0]?.id || '');
    setManualDiner(1);
    setManualQuantity(1);
    setManualNotes('');
    setManualAllergens('');
  };

  const handleConfirmManualOrder = () => {
    if (!selectedTableForOrder || !selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    addOrderItemDirectly(selectedTableForOrder.id, {
      productId: prod.id,
      productName: prod.name,
      price: prod.price,
      quantity: Math.max(1, manualQuantity),
      dinerNumber: manualDiner,
      notes: manualNotes.trim() || undefined,
      allergensAlert: manualAllergens.trim() ? [manualAllergens.trim()] : undefined,
      station: prod.preparationStation,
    });

    setSelectedTableForOrder(null);
  };

  const handleOpenCheckout = (table: Table) => {
    const subtotal = table.activeOrderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = subtotal * 0.21;
    const initialTip = (subtotal + tax) * 0.1;
    setCheckoutModalTable(table);
    setPaymentMethod('efectivo');
    setTipPercentage(10);
    setDiscountAmount(0);
    setCashGiven(Math.ceil(subtotal + tax + initialTip));
  };

  const handleConfirmCheckout = () => {
    if (!checkoutModalTable) return;
    const subtotal = checkoutModalTable.activeOrderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = subtotal * 0.21;
    const tipAmount = tipPercentage > 0 ? (subtotal + tax) * (tipPercentage / 100) : 0;

    checkoutTable(checkoutModalTable.id, paymentMethod, +tipAmount.toFixed(2), +discountAmount.toFixed(2));
    setCheckoutModalTable(null);
  };

  const handleSaveStatusChange = () => {
    if (!editingTableStatus) return;
    updateTableStatus(editingTableStatus.id, newStatus, newDinersCount);
    setEditingTableStatus(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-emerald-50">
      {/* Header and View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-400" />
            Salón de Mesas & Plano Visual Interactivo
          </h2>
          <p className="text-xs text-emerald-300/80">
            Control visual del restaurante en tiempo real, asignación de comensales, comandería y cobranza
          </p>
        </div>

        {/* View mode toggle button group */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#122e23] border border-[#23533e] rounded-xl">
            <button
              onClick={() => setDisplayMode('combined')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                displayMode === 'combined'
                  ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
                  : 'text-emerald-300 hover:text-white'
              }`}
              title="Vista combinada: Plano a la izquierda y detalle de mesa a la derecha"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plano + Detalle</span>
            </button>

            <button
              onClick={() => setDisplayMode('map')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                displayMode === 'map'
                  ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
                  : 'text-emerald-300 hover:text-white'
              }`}
              title="Plano de arquitectura visual 2D a pantalla completa"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Solo Plano 2D</span>
            </button>

            <button
              onClick={() => setDisplayMode('cards')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                displayMode === 'cards'
                  ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
                  : 'text-emerald-300 hover:text-white'
              }`}
              title="Cuadrícula clásica de tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Solo Tarjetas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#122e23] rounded-2xl border border-[#23533e] shadow-md">
        <div>
          <span className="text-xs text-emerald-300/80">Mesas Ocupadas</span>
          <div className="text-xl font-black font-mono text-amber-300 tabular-nums">
            {tables.filter((t) => t.status === 'ocupada').length} / {tables.length}
          </div>
        </div>
        <div>
          <span className="text-xs text-emerald-300/80">Comensales en Salón</span>
          <div className="text-xl font-black font-mono text-white tabular-nums">
            {tables.reduce((sum, t) => sum + (t.currentDiners || 0), 0)} personas
          </div>
        </div>
        <div>
          <span className="text-xs text-emerald-300/80">Mesas Libres</span>
          <div className="text-xl font-black font-mono text-emerald-400 tabular-nums">
            {tables.filter((t) => t.status === 'libre').length} listas
          </div>
        </div>
        <div>
          <span className="text-xs text-emerald-300/80">Ventas en Curso</span>
          <div className="text-xl font-black font-mono text-emerald-300 tabular-nums">
            S/.{' '}
            {tables
              .flatMap((t) => t.activeOrderItems)
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toFixed(2)}
          </div>
        </div>
      </div>

      {/* Main Floor Plan Map & Details Layout */}
      {(displayMode === 'combined' || displayMode === 'map') && (
        <div className={`grid gap-6 ${displayMode === 'combined' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Architectural 2D Floor Plan Canvas (2 spans in combined) */}
          <div
            className={`${
              displayMode === 'combined' ? 'lg:col-span-2' : ''
            } bg-[#122e23] rounded-3xl border border-[#23533e] p-5 shadow-xl space-y-4`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c4434] pb-3">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">
                  Plano Arquitectónico 2D del Restaurante
                </h3>
                <span className="text-[11px] text-emerald-300/80 hidden sm:inline">
                  (Haz clic sobre cualquier mesa para abrir su control)
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Libre
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ocupada
                </span>
                <span className="flex items-center gap-1.5 text-teal-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Reservada
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-800" /> Fuera serv.
                </span>
              </div>
            </div>

            {/* Interactive Schematic Blueprint Room */}
            <div className="relative w-full h-[460px] bg-[#0a1c14] rounded-2xl border-2 border-dashed border-[#1f4c39] overflow-hidden select-none p-4">
              {/* Floor zone guides & labels */}
              {/* Main Hall */}
              <div className="absolute left-4 top-4 right-[35%] bottom-[28%] border border-[#1b4332] rounded-2xl p-2 bg-[#0d261b]/60 pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-emerald-300/70 font-bold block">
                  Salón Principal (Ventanales)
                </span>
              </div>

              {/* Terrace */}
              <div className="absolute right-4 top-4 w-[31%] bottom-[28%] border border-[#1b4332] rounded-2xl p-2 bg-[#122e22]/50 pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-teal-300/80 font-bold block">
                  Terraza Panorámica
                </span>
              </div>

              {/* Bar Counter */}
              <div className="absolute left-4 bottom-4 w-[40%] h-[22%] border border-[#1b4332] rounded-2xl p-2 bg-[#122e22]/60 pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
                  Barra de Tragos & Cócteles
                </span>
              </div>

              {/* VIP Cava */}
              <div className="absolute left-[44%] bottom-4 right-[25%] h-[22%] border border-[#1b4332] rounded-2xl p-2 bg-[#0e271c]/60 pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-amber-300/80 font-bold block">
                  Cava VIP
                </span>
              </div>

              {/* Kitchen Pass / KDS Station */}
              <div className="absolute right-4 bottom-4 w-[21%] h-[22%] border border-emerald-500/40 rounded-2xl p-2 bg-emerald-950/30 pointer-events-none flex flex-col justify-center items-center text-center">
                <span className="text-[9px] uppercase tracking-widest text-emerald-300 font-black">
                  Pase de Cocina KDS
                </span>
                <span className="text-[8px] text-emerald-400/80">Salida de Comandas</span>
              </div>

              {/* Interactive Tables placed according to mapCoordinates */}
              {tables.map((table) => {
                const subtotal = table.activeOrderItems.reduce((s, i) => s + i.price * i.quantity, 0);
                const isSelected = selectedFloorTable?.id === table.id;

                return (
                  <button
                    key={table.id}
                    onClick={() => {
                      setSelectedFloorTable(table);
                      setSelectedTableId(table.id);
                    }}
                    style={{
                      left: `${table.mapCoordinates.x}%`,
                      top: `${table.mapCoordinates.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute p-2.5 border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center shadow-md ${
                      table.mapCoordinates.shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                    } ${getMapTableBorderColor(table)}`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-xs text-white">M#{table.number}</span>
                      {table.status === 'ocupada' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </div>

                    <div className="text-[10px] text-emerald-200 font-mono mt-0.5">
                      {table.status === 'ocupada' ? (
                        <span className="text-amber-300 font-bold">S/. {subtotal.toFixed(0)}</span>
                      ) : (
                        <span className="capitalize text-emerald-300/70">{table.status}</span>
                      )}
                    </div>

                    <div className="text-[9px] text-emerald-300/80 flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" />
                      <span>{table.currentDiners}/{table.capacity}</span>
                    </div>

                    {/* QR Code label */}
                    <div className="text-[8px] font-mono text-emerald-400/60 mt-0.5">
                      {table.securityCode}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Control Panel for the Selected Table from the map */}
          {displayMode === 'combined' && selectedFloorTable && (
            <div className="bg-[#122e23] rounded-3xl border border-[#23533e] p-5 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#1c4434] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Control Directo de Mesa
                    </span>
                    <h3 className="text-lg font-black text-white">
                      {selectedFloorTable.name}
                    </h3>
                    <div className="text-xs text-emerald-300/80 font-mono">
                      Código QR: <strong className="text-emerald-300 font-bold">{selectedFloorTable.securityCode}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingTableStatus(selectedFloorTable);
                      setNewStatus(selectedFloorTable.status);
                      setNewDinersCount(selectedFloorTable.currentDiners || 2);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-xl border uppercase font-bold cursor-pointer transition-all ${getStatusColor(
                      selectedFloorTable.status
                    )}`}
                  >
                    {selectedFloorTable.status.replace('_', ' ')}
                  </button>
                </div>

                {/* Capacity & Time info */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#0e241c] p-3 rounded-2xl border border-[#1b4434]">
                  <div>
                    <span className="text-emerald-300/80 text-[10px] block">Comensales Sentados</span>
                    <span className="font-bold text-white text-sm">
                      {selectedFloorTable.currentDiners} de {selectedFloorTable.capacity} asientos
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-300/80 text-[10px] block">Ocupación Desde</span>
                    <span className="font-bold text-amber-300 font-mono text-sm">
                      {selectedFloorTable.occupiedSince || 'Libre'}
                    </span>
                  </div>
                </div>

                {/* Active Items breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-100">
                    <span>Comanda en Mesa ({selectedFloorTable.activeOrderItems.length} items)</span>
                    <span className="font-mono text-amber-300 text-sm">
                      S/.{' '}
                      {selectedFloorTable.activeOrderItems
                        .reduce((s, i) => s + i.price * i.quantity, 0)
                        .toFixed(2)}
                    </span>
                  </div>

                  {selectedFloorTable.activeOrderItems.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                      {selectedFloorTable.activeOrderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#173b2d] border border-[#255640]"
                        >
                          <div>
                            <span className="font-semibold text-white">
                              {item.quantity}x {item.productName}
                            </span>
                            <div className="text-[10px] text-emerald-300/80">
                              Comensal #{item.dinerNumber} · {item.station}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-emerald-100 tabular-nums">
                            S/. {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-emerald-400/60 bg-[#0e241c] rounded-2xl border border-dashed border-[#1f4c39]">
                      No hay pedidos en curso en esta mesa
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-[#1c4434] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenManualOrder(selectedFloorTable)}
                    className="py-2 px-3 text-xs font-bold rounded-xl bg-[#173b2d] hover:bg-[#1e4d3b] text-white flex items-center justify-center gap-1.5 transition-colors border border-[#255640]"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tomar Pedido</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTableId(selectedFloorTable.id);
                      setCurrentView('cliente-menu');
                    }}
                    className="py-2 px-3 text-xs font-bold rounded-xl border border-[#255640] hover:border-emerald-400 text-emerald-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Ver Carta</span>
                  </button>
                </div>

                {selectedFloorTable.activeOrderItems.length > 0 && (
                  <button
                    onClick={() => handleOpenCheckout(selectedFloorTable)}
                    className="w-full py-2.5 px-4 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 transition-all active:scale-98"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Cobrar Mesa & Emitir Boleta</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Classic / Detailed Cards View */}
      {(displayMode === 'cards' || displayMode === 'combined') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[#1c4434] pb-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span>Listado de Mesas por Tarjetas</span>
            </h3>

            {/* Zone Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-[#122e23] border border-[#23533e] rounded-xl overflow-x-auto">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setActiveZone(zone)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeZone === zone
                      ? 'bg-emerald-500 text-neutral-950 font-black'
                      : 'text-emerald-300 hover:text-white'
                  }`}
                >
                  {zone === 'todos' ? 'Todas' : zone}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTables.map((table) => {
              const tableSubtotal = table.activeOrderItems.reduce((s, i) => s + i.price * i.quantity, 0);
              const isOccupied = table.status === 'ocupada';

              return (
                <div
                  key={table.id}
                  className={`bg-[#122e23] border rounded-2xl p-4 flex flex-col justify-between transition-all shadow-md ${
                    isOccupied
                      ? 'border-amber-500/60'
                      : 'border-[#23533e]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">
                            {table.name}
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">#{table.number}</span>
                        </div>
                        <span className="text-[11px] text-emerald-300/80 font-mono">
                          Código QR: {table.securityCode}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setEditingTableStatus(table);
                          setNewStatus(table.status);
                          setNewDinersCount(table.currentDiners || 2);
                        }}
                        className={`text-xs px-2 py-0.5 rounded-lg border uppercase tracking-wider font-bold cursor-pointer ${getStatusColor(
                          table.status
                        )}`}
                      >
                        {table.status.replace('_', ' ')}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-emerald-200 pt-1 border-t border-[#1c4434]">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {table.currentDiners}/{table.capacity} comensales
                        </span>
                      </div>
                      {table.occupiedSince && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-300" />
                          <span>Desde {table.occupiedSince}</span>
                        </div>
                      )}
                    </div>

                    {isOccupied && table.activeOrderItems.length > 0 ? (
                      <div className="space-y-1 pt-2 border-t border-[#1c4434]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-emerald-100">
                            Comanda ({table.activeOrderItems.length} items)
                          </span>
                          <span className="font-mono font-bold text-amber-300">
                            S/. {tableSubtotal.toFixed(2)}
                          </span>
                        </div>

                        <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[11px]">
                          {table.activeOrderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-emerald-100 bg-[#173b2d] px-2 py-1 rounded-lg"
                            >
                              <span className="truncate max-w-[150px]">
                                {item.quantity}x {item.productName} (C#{item.dinerNumber})
                              </span>
                              <span className="font-mono tabular-nums shrink-0 font-bold text-emerald-200">
                                S/. {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 text-center text-xs text-emerald-400/60">
                        {table.status === 'libre' ? 'Mesa limpia y disponible' : 'Mesa en espera'}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#1c4434] space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenManualOrder(table)}
                        className="py-1.5 px-2 text-xs font-bold rounded-xl bg-[#173b2d] hover:bg-[#1e4d3b] text-white flex items-center justify-center gap-1 transition-colors border border-[#255640]"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tomar Pedido</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTableId(table.id);
                          setCurrentView('cliente-menu');
                        }}
                        className="py-1.5 px-2 text-xs font-bold rounded-xl border border-[#255640] hover:border-emerald-400 text-emerald-200 flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Ver Carta</span>
                      </button>
                    </div>

                    {isOccupied && table.activeOrderItems.length > 0 && (
                      <button
                        onClick={() => handleOpenCheckout(table)}
                        className="w-full py-2 px-3 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 flex items-center justify-center gap-2 shadow-md transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Cobrar Mesa (S/. {tableSubtotal.toFixed(2)})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Order Modal (Waiter quick entry) */}
      {selectedTableForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#122e23] border border-[#23533e] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c4434]">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase">
                  Toma Manual de Comanda
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedTableForOrder.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTableForOrder(null)}
                className="text-emerald-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diner Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300">
                Comensal en la mesa:
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setManualDiner(num)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border ${
                      manualDiner === num
                        ? 'bg-amber-500 border-amber-600 text-neutral-950'
                        : 'bg-[#202532] border-[#2d3242] text-neutral-300'
                    }`}
                  >
                    C#{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Picker */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300">
                Plato o Bebida del Menú:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#111318] border border-[#2d3242] rounded-xl text-white focus:outline-hidden focus:border-amber-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - S/. {p.price.toFixed(2)} ({p.preparationStation.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">
                Cantidad:
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setManualQuantity(q)}
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-bold ${
                      manualQuantity === q
                        ? 'bg-amber-500 text-neutral-950'
                        : 'bg-[#202532] text-neutral-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Special notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300">
                Notas de cocina (ej: término, sin cebolla):
              </label>
              <input
                type="text"
                placeholder="Instrucciones para cocina..."
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#111318] border border-[#2d3242] rounded-xl text-white"
              />
            </div>

            {/* Allergies alert */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Alerta de Alergia:
              </label>
              <input
                type="text"
                placeholder="Ej: Celíaco estricto, alergia al maní..."
                value={manualAllergens}
                onChange={(e) => setManualAllergens(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-red-950/30 border border-red-800 rounded-xl text-red-200"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedTableForOrder(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-[#2d3242] text-neutral-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmManualOrder}
                className="flex-1 py-2 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 shadow-md"
              >
                Enviar a Cocina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#171a22] border border-[#2b303d] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#252a37]">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase">
                  Caja y Facturación
                </span>
                <h3 className="text-base font-bold text-white">
                  Cobrar {checkoutModalTable.name}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutModalTable(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const subtotal = checkoutModalTable.activeOrderItems.reduce((s, i) => s + i.price * i.quantity, 0);
              const tax = +(subtotal * 0.18).toFixed(2);
              const tip = tipPercentage > 0 ? +((subtotal + tax) * (tipPercentage / 100)).toFixed(2) : 0;
              const total = +(subtotal + tax + tip - discountAmount).toFixed(2);
              const change = cashGiven > total ? +(cashGiven - total).toFixed(2) : 0;

              return (
                <div className="space-y-4 text-xs">
                  <div className="bg-[#111318] p-3 rounded-2xl border border-[#262c3b] space-y-1.5">
                    <div className="flex justify-between text-neutral-400">
                      <span>Subtotal consumo ({checkoutModalTable.activeOrderItems.length} platos)</span>
                      <span className="font-mono tabular-nums text-white">S/. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>IGV (18% oficial)</span>
                      <span className="font-mono tabular-nums text-white">S/. {tax.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-neutral-400">Propina voluntaria para mozos:</span>
                      <div className="flex items-center gap-1.5">
                        {[0, 5, 10, 15].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setTipPercentage(p)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              tipPercentage === p
                                ? 'bg-amber-500 text-neutral-950'
                                : 'bg-[#202532] text-neutral-300'
                            }`}
                          >
                            {p}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {tip > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Propina ({tipPercentage}%)</span>
                        <span className="font-mono tabular-nums">+ S/. {tip.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#252a37]">
                      <span>Total Liquidación</span>
                      <span className="font-mono text-amber-400 tabular-nums">
                        S/. {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-300">
                      Método de Pago:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('efectivo')}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col items-center gap-1 transition-colors ${
                          paymentMethod === 'efectivo'
                            ? 'bg-amber-500 text-neutral-950 border-amber-600 font-bold'
                            : 'bg-[#1e2330] border-[#293042] text-neutral-300'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Efectivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('tarjeta')}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col items-center gap-1 transition-colors ${
                          paymentMethod === 'tarjeta'
                            ? 'bg-amber-500 text-neutral-950 border-amber-600 font-bold'
                            : 'bg-[#1e2330] border-[#293042] text-neutral-300'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Tarjeta</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('yape_plin')}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col items-center gap-1 transition-colors ${
                          paymentMethod === 'yape_plin'
                            ? 'bg-amber-500 text-neutral-950 border-amber-600 font-bold'
                            : 'bg-[#1e2330] border-[#293042] text-neutral-300'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Yape / Plin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('puntos')}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col items-center gap-1 transition-colors ${
                          paymentMethod === 'puntos'
                            ? 'bg-amber-500 text-neutral-950 border-amber-600 font-bold'
                            : 'bg-[#1e2330] border-[#293042] text-neutral-300'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Puntos</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'efectivo' && (
                    <div className="bg-[#111318] p-3 rounded-2xl border border-[#272d3e] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-300">
                          Efectivo recibido en caja:
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-neutral-400">S/.</span>
                          <input
                            type="number"
                            step="1"
                            value={cashGiven}
                            onChange={(e) => setCashGiven(Number(e.target.value))}
                            className="w-24 px-2 py-1 bg-[#1e2330] border border-[#2e3547] rounded-lg font-mono font-bold text-right text-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#252a37] text-amber-400 font-bold">
                        <span>Vuelto a entregar al cliente:</span>
                        <span className="font-mono text-sm tabular-nums">S/. {change.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutModalTable(null)}
                      className="flex-1 py-2.5 rounded-xl border border-[#2d3242] text-neutral-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCheckout}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black shadow-md flex items-center justify-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Emitir Boleta & Liberar</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Table Status Modification Modal */}
      {editingTableStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#171a22] border border-[#2b303d] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-white">
            <h3 className="text-base font-bold text-white">
              Modificar Estado de {editingTableStatus.name}
            </h3>

            <div className="space-y-2">
              {(['libre', 'ocupada', 'reservada', 'no_disponible'] as TableStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setNewStatus(status)}
                  className={`w-full p-2.5 text-xs font-semibold rounded-xl border text-left capitalize flex items-center justify-between ${
                    newStatus === status
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                      : 'border-[#2d3242] text-neutral-300'
                  }`}
                >
                  <span>{status.replace('_', ' ')}</span>
                  {newStatus === status && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>

            {newStatus === 'ocupada' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">
                  Número de comensales sentados:
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={newDinersCount}
                  onChange={(e) => setNewDinersCount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-1.5 bg-[#111318] border border-[#2d3242] rounded-xl text-white"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTableStatus(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-[#2d3242] text-neutral-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveStatusChange}
                className="flex-1 py-2 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 shadow-md"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
