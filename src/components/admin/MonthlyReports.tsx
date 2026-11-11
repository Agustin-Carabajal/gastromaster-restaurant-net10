import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Download,
  Users,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export const MonthlyReports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('Noviembre 2026');
  const [hoveredDay, setHoveredDay] = useState<{ day: number; sales: number } | null>(null);

  // Mock 30 days of dynamic sales for November 2026
  const dailySales = [
    { day: 1, sales: 840, diners: 95 },
    { day: 2, sales: 620, diners: 72 },
    { day: 3, sales: 710, diners: 80 },
    { day: 4, sales: 950, diners: 110 },
    { day: 5, sales: 1120, diners: 130 },
    { day: 6, sales: 1450, diners: 165 }, // Friday
    { day: 7, sales: 1890, diners: 210 }, // Saturday
    { day: 8, sales: 1650, diners: 190 }, // Sunday
    { day: 9, sales: 580, diners: 65 },
    { day: 10, sales: 672.50, diners: 86 }, // Today (coincides with legacy image!)
    { day: 11, sales: 740, diners: 88 },
    { day: 12, sales: 810, diners: 94 },
    { day: 13, sales: 1280, diners: 145 },
    { day: 14, sales: 1720, diners: 195 },
    { day: 15, sales: 1540, diners: 175 },
    { day: 16, sales: 600, diners: 70 },
    { day: 17, sales: 730, diners: 82 },
    { day: 18, sales: 790, diners: 89 },
    { day: 19, sales: 910, diners: 102 },
    { day: 20, sales: 1390, diners: 158 },
    { day: 21, sales: 1940, diners: 220 },
    { day: 22, sales: 1680, diners: 185 },
    { day: 23, sales: 620, diners: 71 },
    { day: 24, sales: 750, diners: 84 },
    { day: 25, sales: 840, diners: 96 },
    { day: 26, sales: 960, diners: 108 },
    { day: 27, sales: 1420, diners: 160 },
    { day: 28, sales: 2050, diners: 235 },
    { day: 29, sales: 1750, diners: 195 },
    { day: 30, sales: 890, diners: 100 },
  ];

  const totalMonthlyGross = dailySales.reduce((s, d) => s + d.sales, 0);
  const totalMonthlyTax = +(totalMonthlyGross * 0.18).toFixed(2);
  const totalMonthlyNet = +(totalMonthlyGross - totalMonthlyTax).toFixed(2);
  const totalMonthlyDiners = dailySales.reduce((s, d) => s + d.diners, 0);
  const averageTicketPerDiner = +(totalMonthlyGross / totalMonthlyDiners).toFixed(2);
  const averageTicketPerTable = +(averageTicketPerDiner * 2.8).toFixed(2);
  const estimatedCost = +(totalMonthlyGross * 0.38).toFixed(2); // 38% COGS
  const operatingProfit = +(totalMonthlyNet - estimatedCost).toFixed(2);

  // Peak hours distribution
  const peakHours = [
    { label: 'Almuerzo Temprano (12:00 - 13:30)', percentage: 22, color: 'bg-emerald-400' },
    { label: 'Pico Almuerzos (13:30 - 15:30)', percentage: 38, color: 'bg-teal-500' },
    { label: 'Tarde / Cafetería (16:00 - 19:00)', percentage: 10, color: 'bg-emerald-700' },
    { label: 'Pico Cenas & Bar (20:00 - 23:00)', percentage: 30, color: 'bg-amber-400' },
  ];

  // Category breakdown
  const categoryBreakdown = [
    { name: 'Platos & Comidas', percentage: 48, revenue: (totalMonthlyGross * 0.48).toFixed(2) },
    { name: 'Cervezas & Bebidas', percentage: 26, revenue: (totalMonthlyGross * 0.26).toFixed(2) },
    { name: 'Combos & Promos', percentage: 16, revenue: (totalMonthlyGross * 0.16).toFixed(2) },
    { name: 'Postres & Cafetería', percentage: 10, revenue: (totalMonthlyGross * 0.10).toFixed(2) },
  ];

  // Menu Engineering Matrix (BCG Matrix for Restaurant)
  const menuMatrix = [
    { type: 'Estrellas ⭐', desc: 'Alta Rentabilidad + Alta Popularidad', items: 'Hamburguesa Artesanal Angus, Cusqueña Trigo', action: 'Mantener estándar y destacar en carta' },
    { type: 'Caballos de Batalla 🐴', desc: 'Baja Rentabilidad + Alta Popularidad', items: 'Hamburguesa Simple Económica, Gaseosa 500ml', action: 'Optimizar costos o crear combos' },
    { type: 'Rompecabezas 🧩', desc: 'Alta Rentabilidad + Baja Popularidad', items: 'Postre Volcán de Chocolate, Cóctel de Pisco', action: 'Promocionar con GastroPuntos y fotos' },
    { type: 'Perros 🐕', desc: 'Baja Rentabilidad + Baja Popularidad', items: 'Sopa Criolla (temporada cálida)', action: 'Reemplazar por plato de estación' },
  ];

  // Chart math
  const maxDaySale = Math.max(...dailySales.map((d) => d.sales));
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  const points = dailySales.map((d, index) => {
    const x = paddingX + (index / (dailySales.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.sales / maxDaySale) * (svgHeight - paddingY * 2);
    return { x, y, day: d.day, sales: d.sales };
  });

  const pathD = points.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-emerald-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Reportes Mensuales & Rendimiento Financiero
          </h2>
          <p className="text-xs text-emerald-300/80">
            Análisis de rentabilidad, comportamiento de comensales, ticket promedio y matriz de ingeniería de menú
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs px-3 py-1.5 bg-[#122e23] border border-[#23533e] text-emerald-100 rounded-xl font-semibold focus:outline-hidden focus:border-emerald-400"
          >
            <option>Noviembre 2026 (Mes Actual)</option>
            <option>Octubre 2026</option>
            <option>Septiembre 2026</option>
          </select>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Imprimir Informe</span>
          </button>
        </div>
      </div>

      {/* Financial Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#122e23] rounded-3xl border border-[#23533e] shadow-md">
        <div>
          <span className="text-xs text-emerald-300/80">Facturación Bruta Mensual</span>
          <div className="text-2xl font-black font-mono text-white tabular-nums">
            S/. {totalMonthlyGross.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+14.2% vs mes anterior</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-emerald-300/80">Utilidad Operativa Neta</span>
          <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
            S/. {operatingProfit.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-0.5">Margen neto operativo ~34%</div>
        </div>

        <div>
          <span className="text-xs text-emerald-300/80">Ticket Promedio por Mesa</span>
          <div className="text-2xl font-black font-mono text-amber-300 tabular-nums">
            S/. {averageTicketPerTable.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-0.5">S/. {averageTicketPerDiner.toFixed(2)} por comensal</div>
        </div>

        <div>
          <span className="text-xs text-emerald-300/80">Comensales Totales</span>
          <div className="text-2xl font-black font-mono text-white tabular-nums">
            {totalMonthlyDiners.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-0.5">~120 personas / día promedio</div>
        </div>
      </div>

      {/* Interactive Sales Curve Chart (SVG Tabular Figures) */}
      <div className="bg-[#122e23] rounded-3xl border border-[#23533e] p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Tendencia de Ventas Diarias - {selectedMonth}
            </h3>
            <p className="text-xs text-emerald-300/80">
              Pase el cursor sobre los puntos para inspeccionar la recaudación diaria en Soles (S/.)
            </p>
          </div>

          {hoveredDay && (
            <div className="bg-[#0b1f17] border border-emerald-500/50 text-emerald-200 px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-md">
              Día {hoveredDay.day}: S/. {hoveredDay.sales.toFixed(2)}
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[650px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#1b4434" strokeDasharray="4 4" />
              <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#1b4434" strokeDasharray="4 4" />
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#23533e" />

              {/* Area */}
              <path d={areaD} fill="url(#salesGrad)" />

              {/* Line */}
              <path d={pathD} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Points */}
              {points.map((p) => (
                <circle
                  key={p.day}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredDay?.day === p.day ? 6 : 3.5}
                  fill={hoveredDay?.day === p.day ? '#10b981' : '#0b1f17'}
                  stroke="#34d399"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredDay({ day: p.day, sales: p.sales })}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between px-10 text-[10px] text-emerald-400/80 font-mono pt-1">
              <span>Día 1</span>
              <span>Día 7</span>
              <span className="text-emerald-300 font-bold">Día 10 (Hoy)</span>
              <span>Día 15</span>
              <span>Día 21</span>
              <span>Día 28</span>
              <span>Día 30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Peak Hours and Category Sales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Peak Hours Analysis */}
        <div className="bg-[#122e23] rounded-3xl border border-[#23533e] p-5 shadow-md space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Distribución de Flujo por Horas Pico
          </h3>

          <div className="space-y-3">
            {peakHours.map((hour) => (
              <div key={hour.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-100 font-medium">{hour.label}</span>
                  <span className="font-mono font-bold text-emerald-300">{hour.percentage}% del total</span>
                </div>
                <div className="w-full bg-[#0b1f17] h-2 rounded-full overflow-hidden border border-[#1b4434]">
                  <div className={`${hour.color} h-full rounded-full`} style={{ width: `${hour.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-emerald-300/80 pt-2 border-t border-[#1c4434]">
            Recomendación gerencial: Reforzar el personal de cocina entre 13:00 y 15:00 horas para reducir tiempos de espera a menos de 12 minutos.
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#122e23] rounded-3xl border border-[#23533e] p-5 shadow-md space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            Participación de Ingresos por Categoría
          </h3>

          <div className="space-y-2.5">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.name}
                className="p-3 rounded-2xl bg-[#163a2c] border border-[#23533e] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-white">{cat.name}</span>
                  <span className="text-[11px] text-emerald-300/80 block">S/. {Number(cat.revenue).toLocaleString('es-PE')}</span>
                </div>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Engineering (Matriz BCG Gastronómica) */}
      <div className="bg-[#122e23] rounded-3xl border border-[#23533e] p-5 shadow-md space-y-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Ingeniería de Menú (Matriz de Rentabilidad vs Popularidad)
          </h3>
          <p className="text-xs text-emerald-300/80">
            Clasificación estratégica para maximizar la rentabilidad sin sacrificar satisfacción
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuMatrix.map((quadrant) => (
            <div
              key={quadrant.type}
              className="p-3.5 rounded-2xl border border-[#23533e] bg-[#163a2c] space-y-1.5"
            >
              <h4 className="font-bold text-white text-xs">
                {quadrant.type}
              </h4>
              <p className="text-[11px] text-emerald-300/80 font-medium">{quadrant.desc}</p>
              <div className="text-xs font-semibold text-amber-300 py-1">
                {quadrant.items}
              </div>
              <p className="text-[11px] text-emerald-200/90 italic border-t border-[#1c4434] pt-1">
                Estrategia: {quadrant.action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
