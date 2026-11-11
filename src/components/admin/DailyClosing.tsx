import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { DailySaleItemSummary, DailyClosingData } from '../../types';
import {
  Calculator,
  Printer,
  Download,
  DollarSign,
  CreditCard,
  Smartphone,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  RotateCcw,
  Eye,
  X,
  TrendingUp,
} from 'lucide-react';

export const DailyClosing: React.FC = () => {
  const { dailyClosing, saveDailyClosing } = useRestaurant();

  const [activeItems, setActiveItems] = useState<DailySaleItemSummary[]>(dailyClosing.itemsSummary);
  const [cashCounted, setCashCounted] = useState<number>(dailyClosing.cashCounted);
  const [showLegacyComparison, setShowLegacyComparison] = useState<boolean>(false);
  const [closingSaved, setClosingSaved] = useState<boolean>(false);

  // Recalculate totals dynamically
  const totalSales = activeItems.reduce((sum, item) => sum + item.quantitySold * item.unitPrice, 0);
  const taxIGV = +(totalSales * 0.18).toFixed(2);
  const netSales = +(totalSales - taxIGV).toFixed(2);
  const totalCost = activeItems.reduce((sum, item) => sum + item.quantitySold * item.cost, 0);
  const grossProfit = +(totalSales - totalCost).toFixed(2);
  const profitMargin = totalSales > 0 ? +((grossProfit / totalSales) * 100).toFixed(1) : 0;

  // Cash discrepancy
  const cashDifference = +(cashCounted - dailyClosing.cashExpected).toFixed(2);

  const handleQuantityChange = (productName: string, newQty: number) => {
    setActiveItems((prev) =>
      prev.map((item) =>
        item.productName === productName
          ? {
              ...item,
              quantitySold: Math.max(0, newQty),
              totalSales: +(Math.max(0, newQty) * item.unitPrice).toFixed(2),
            }
          : item
      )
    );
  };

  const handleResetToLegacy = () => {
    // Reset to the exact values in the user's image attachment
    const legacyReset: DailySaleItemSummary[] = [
      { productName: 'Hamburguesa', category: 'comidas', quantitySold: 43, unitPrice: 2.50, totalSales: 107.50, cost: 43.00 },
      { productName: 'Cerveza', category: 'bebidas', quantitySold: 72, unitPrice: 4.00, totalSales: 288.00, cost: 144.00 },
      { productName: 'Gaseosa', category: 'bebidas', quantitySold: 28, unitPrice: 3.00, totalSales: 84.00, cost: 33.60 },
      { productName: 'Ensalada', category: 'comidas', quantitySold: 15, unitPrice: 1.50, totalSales: 22.50, cost: 7.50 },
      { productName: 'Salchichas', category: 'comidas', quantitySold: 39, unitPrice: 2.00, totalSales: 78.00, cost: 31.20 },
      { productName: 'Refresco', category: 'bebidas', quantitySold: 34, unitPrice: 1.00, totalSales: 34.00, cost: 10.20 },
      { productName: 'Sopa', category: 'comidas', quantitySold: 17, unitPrice: 1.50, totalSales: 25.50, cost: 8.50 },
      { productName: 'Postre', category: 'postres', quantitySold: 22, unitPrice: 1.50, totalSales: 33.00, cost: 11.00 },
    ];
    setActiveItems(legacyReset);
    setCashCounted(380.50);
  };

  const handleSaveClosing = () => {
    const updated: DailyClosingData = {
      ...dailyClosing,
      itemsSummary: activeItems,
      totalGrossSales: +totalSales.toFixed(2),
      totalTax: taxIGV,
      totalNetSales: netSales,
      cashCounted: cashCounted,
      cashDifference: cashDifference,
    };
    saveDailyClosing(updated);
    setClosingSaved(true);
    setTimeout(() => setClosingSaved(false), 3000);
  };

  const handleExportCSV = () => {
    const headers = 'Producto,Categoría,Cantidad Vendida,Precio Unitario S/.,Total Ventas S/.,Costo S/.\n';
    const rows = activeItems
      .map(
        (i) =>
          `"${i.productName}","${i.category}",${i.quantitySold},${i.unitPrice.toFixed(2)},${i.totalSales.toFixed(2)},${i.cost.toFixed(2)}`
      )
      .join('\n');
    const totals = `\nTotal Venta Bruta,${totalSales.toFixed(2)}\nImpuesto IGV (18%),${taxIGV.toFixed(2)}\nVenta Neta,${netSales.toFixed(2)}`;

    const blob = new Blob([headers + rows + totals], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Arqueo_Ventas_${dailyClosing.date}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-emerald-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Arqueo Diario & Conteo Automatizado de Ventas
            </h2>
          </div>
          <p className="text-xs text-emerald-300/80">
            Evolución moderna del formulario de control diario con liquidación en tiempo real y cuadre de caja
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Legacy VB6 Comparison Modal Button */}
          <button
            onClick={() => setShowLegacyComparison(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#143828] hover:bg-[#1a4534] text-emerald-100 flex items-center gap-1.5 transition-colors border border-[#23533e] shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Comparar con Formulario Original (VB6)</span>
          </button>

          <button
            onClick={handleResetToLegacy}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#23533e] hover:bg-[#183e2f] text-emerald-200 flex items-center gap-1.5 transition-colors"
            title="Restablecer a los valores exactos de la imagen adjunta"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
            <span>Cargar Datos Imagen S/. 672.50</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {closingSaved && (
        <div className="bg-emerald-950/70 border border-emerald-500 p-3 rounded-2xl flex items-center gap-2 text-xs text-emerald-200 shadow-md">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>¡Arqueo diario y balance de caja guardados con éxito en el sistema!</span>
        </div>
      )}

      {/* Modern vs Legacy Comparative Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#122e23] rounded-3xl border border-[#23533e] shadow-md">
        <div>
          <span className="text-xs text-emerald-300/80">Venta Total Bruta</span>
          <div className="text-2xl font-black font-mono text-white tabular-nums">
            S/. {totalSales.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400/80">Total facturado del día</span>
        </div>

        <div>
          <span className="text-xs text-emerald-300/80">Impuesto IGV (18.00%)</span>
          <div className="text-2xl font-black font-mono text-amber-300 tabular-nums">
            S/. {taxIGV.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400/80">Obligación tributaria estimada</span>
        </div>

        <div>
          <span className="text-xs text-emerald-300/80">Venta Neta del Negocio</span>
          <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
            S/. {netSales.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400/80">Ingreso sin impuestos</span>
        </div>

        <div>
          <span className="text-xs text-emerald-300/80">Margen Bruto Estimado</span>
          <div className="text-2xl font-black font-mono text-teal-300 tabular-nums">
            {profitMargin}%
          </div>
          <span className="text-[11px] text-emerald-400/80">Ganancia bruta: S/. {grossProfit.toFixed(2)}</span>
        </div>
      </div>

      {/* Main Grid: Itemized Product Sales Table & Cash Drawer Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Clean Tabular Breakdown of Products */}
        <div className="lg:col-span-2 bg-[#122e23] rounded-3xl border border-[#23533e] overflow-hidden shadow-md">
          <div className="p-4 border-b border-[#1c4434] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">
                Conteo Detallado de Platos & Bebidas Vendidas
              </h3>
              <p className="text-xs text-emerald-300/80">
                Se sincroniza automáticamente con las órdenes entregadas. Puedes ajustar cantidades si hubo mermas.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300 font-bold">
              {activeItems.reduce((s, i) => s + i.quantitySold, 0)} unidades vendidas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0e241c] text-emerald-200 font-semibold border-b border-[#1c4434]">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-right">Cant. Vendida</th>
                  <th className="px-4 py-3 text-right">Precio Unit.</th>
                  <th className="px-4 py-3 text-right">Total S/.</th>
                  <th className="px-4 py-3 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#183b2d]">
                {activeItems.map((item) => {
                  const itemMargin =
                    item.totalSales > 0
                      ? +(((item.totalSales - item.quantitySold * item.cost) / item.totalSales) * 100).toFixed(0)
                      : 0;

                  return (
                    <tr
                      key={item.productName}
                      className="hover:bg-[#16382a] transition-colors text-emerald-100"
                    >
                      <td className="px-4 py-2.5 font-semibold text-white">
                        {item.productName}
                      </td>
                      <td className="px-4 py-2.5 text-emerald-300/80 capitalize">{item.category}</td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        <input
                          type="number"
                          min="0"
                          value={item.quantitySold}
                          onChange={(e) => handleQuantityChange(item.productName, Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 text-right bg-[#0b1f17] border border-[#23533e] rounded-lg font-mono font-bold text-amber-300 focus:outline-hidden focus:border-emerald-400"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-emerald-200">
                        S/. {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold tabular-nums text-white">
                        S/. {item.totalSales.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-emerald-400 font-bold">
                        {itemMargin}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[#0e241c] font-bold border-t-2 border-[#1c4434]">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-white">
                    TOTAL DEL DÍA (S/.)
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-300">
                    {activeItems.reduce((s, i) => s + i.quantitySold, 0)} u.
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right font-mono text-base text-amber-300 tabular-nums font-black">
                    S/. {totalSales.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">
                    {profitMargin}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Right Column (1 span): Cash Drawer Reconciliation (Cuadre de Caja) & Payment Breakdown */}
        <div className="space-y-6">
          {/* Payment Methods Breakdown */}
          <div className="bg-[#122e23] rounded-3xl border border-[#23533e] p-5 shadow-md space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Desglose por Métodos de Pago
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#163a2c] border border-[#23533e] rounded-2xl">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-emerald-100">Efectivo en Gaveta</span>
                </div>
                <span className="font-mono font-bold text-white tabular-nums">S/. {dailyClosing.cashExpected.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#163a2c] border border-[#23533e] rounded-2xl">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-300" />
                  <span className="font-medium text-emerald-100">Tarjetas POS (Visa/MC)</span>
                </div>
                <span className="font-mono font-bold text-white tabular-nums">S/. {dailyClosing.cardSales.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#163a2c] border border-[#23533e] rounded-2xl">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-300" />
                  <span className="font-medium text-emerald-100">Billeteras (Yape / Plin)</span>
                </div>
                <span className="font-mono font-bold text-white tabular-nums">S/. {dailyClosing.digitalWalletSales.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#163a2c] border border-[#23533e] rounded-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-emerald-100">GastroPuntos Canjeados</span>
                </div>
                <span className="font-mono font-bold tabular-nums text-amber-300">S/. {dailyClosing.pointsDiscountTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cash Drawer Count (Arqueo Ciego) */}
          <div className="bg-[#122e23] rounded-3xl border border-[#23533e] p-5 shadow-md space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Arqueo Físico de Gaveta (Efectivo)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-emerald-200 block mb-1">
                  Efectivo contado físicamente en caja:
                </label>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-emerald-300">S/.</span>
                  <input
                    type="number"
                    step="0.10"
                    value={cashCounted}
                    onChange={(e) => setCashCounted(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0b1f17] border border-[#23533e] rounded-xl font-mono font-bold text-base text-white focus:outline-hidden focus:border-emerald-400 shadow-inner"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-[#23533e] space-y-1.5 bg-[#0e241c]">
                <div className="flex justify-between text-emerald-300/80 text-[11px]">
                  <span>Efectivo esperado por sistema:</span>
                  <span className="font-mono tabular-nums text-white">S/. {dailyClosing.cashExpected.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs">
                  <span className="text-emerald-100">Diferencia de Caja:</span>
                  <span
                    className={`font-mono tabular-nums ${
                      cashDifference === 0
                        ? 'text-emerald-400'
                        : cashDifference > 0
                        ? 'text-teal-300'
                        : 'text-red-400'
                    }`}
                  >
                    {cashDifference === 0
                      ? 'Exacto (S/. 0.00)'
                      : cashDifference > 0
                      ? `Sobrante +S/. ${cashDifference.toFixed(2)}`
                      : `Faltante -S/. ${Math.abs(cashDifference).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSaveClosing}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 font-black text-xs rounded-xl shadow-md shadow-emerald-950/40 transition-colors flex items-center justify-center gap-2 active:scale-98"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Cerrar Caja & Guardar Z Diario</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legacy Comparison Modal (User Attachment image_90b2f684.png) */}
      {showLegacyComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#122e23] border border-[#23533e] rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c4434]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  Comparativa: Formulario Original VB6 vs GastroMaster Pro Modernizado
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Análisis de redundancias eliminadas y automatización de procesos
                </p>
              </div>
              <button
                onClick={() => setShowLegacyComparison(false)}
                className="text-emerald-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded image and explanations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                  Captura Original Adjunta (Windows 95 / VB6):
                </span>
                <div className="border-2 border-[#23533e] rounded-xl overflow-hidden bg-neutral-200 p-1">
                  <img
                    src="/public/assets/aistudio/image_90b2f684.png"
                    alt="Formulario clásico de restaurante en Visual Basic"
                    className="w-full h-auto object-contain rounded"
                  />
                </div>
                <div className="text-[11px] text-emerald-300/80 italic text-center">
                  Cálculo original: Hamburguesa (43 x 2.50), Cerveza (72 x 4.00)... Total S/. 672.50, IGV S/. 121.05
                </div>
              </div>

              <div className="space-y-3 text-xs text-emerald-100">
                <h4 className="font-bold text-white text-sm">
                  Mejoras y Redundancias Eliminadas:
                </h4>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#163a2c] border border-[#23533e]">
                    <span className="font-bold text-white block">
                      1. Suma 100% Automática
                    </span>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">
                      En el sistema anterior, el cajero debía contar a mano los tickets o escribir 8 campos numéricos manualmente. En GastroMaster se acumulan automáticamente conforme las mesas se liquidan.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#163a2c] border border-[#23533e]">
                    <span className="font-bold text-white block">
                      2. Eliminación de Tabla Estática Redundante
                    </span>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">
                      En la imagen original el Menú y sus Precios se duplicaban en una cuadrícula estática al lado de las cajas de texto. Aquí está unificado en una sola tabla reactiva con márgenes y costos.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#163a2c] border border-[#23533e]">
                    <span className="font-bold text-white block">
                      3. Cuadre Ciego de Caja y Métodos de Pago
                    </span>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">
                      El original solo calculaba el total teórico. GastroMaster desglosa efectivo, tarjetas y billeteras (Yape/Plin), calculando sobrantes o faltantes en gaveta.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowLegacyComparison(false)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black rounded-xl shadow-md"
                  >
                    Cerrar Comparativa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
