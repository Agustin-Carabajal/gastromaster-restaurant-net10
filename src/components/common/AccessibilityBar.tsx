import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import { Eye, Type, Keyboard, HelpCircle, X, Check } from 'lucide-react';

export const AccessibilityBar: React.FC = () => {
  const { highContrast, setHighContrast, largeFont, setLargeFont, setCurrentView } = useRestaurant();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNielsenGuide, setShowNielsenGuide] = useState(false);

  return (
    <>
      <div className="bg-[#081812] text-emerald-300/80 text-xs px-4 py-1.5 flex items-center justify-between border-b border-[#143527]">
        <div className="flex items-center gap-4">
          <span className="font-extrabold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GastroMaster Pro
          </span>
          <span className="text-emerald-700 hidden sm:inline">|</span>
          <span className="text-emerald-300/70 hidden md:inline">
            Sistema Gastronómico & POS de Salón
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Contrast Toggle */}
          <button
            onClick={() => setHighContrast((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
              highContrast ? 'bg-emerald-400 text-neutral-950 font-bold' : 'hover:text-white hover:bg-[#102e21]'
            }`}
            title="Alternar modo de alto contraste para accesibilidad visual"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Alto Contraste</span>
          </button>

          {/* Large Font Toggle */}
          <button
            onClick={() => setLargeFont((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
              largeFont ? 'bg-emerald-400 text-neutral-950 font-bold' : 'hover:text-white hover:bg-[#102e21]'
            }`}
            title="Aumentar tamaño de texto para mayor legibilidad"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Texto Grande</span>
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:text-white hover:bg-[#102e21] transition-colors"
            title="Atajos de teclado rápidos"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Atajos</span>
          </button>

          {/* Nielsen Heuristics Guide */}
          <button
            onClick={() => setShowNielsenGuide(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:text-white hover:bg-[#102e21] transition-colors text-emerald-300 font-medium"
            title="Ver cumplimiento de Heurísticas de Nielsen"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guía UX</span>
          </button>
        </div>
      </div>

      {/* Shortcuts Modal */}
      {showShortcuts && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#122e23] border border-[#23533e] rounded-3xl p-6 max-w-md w-full shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c4434] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-emerald-400" />
                Atajos de Teclado del Sistema
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-emerald-300 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-2 px-3 bg-[#183e2f] border border-[#255640] rounded-xl">
                <span className="text-emerald-100">Menú Comensal / Pedidos</span>
                <kbd className="px-2.5 py-0.5 bg-[#0b1f17] text-emerald-300 rounded-lg font-mono font-bold border border-[#23533e]">1</kbd>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#183e2f] border border-[#255640] rounded-xl">
                <span className="text-emerald-100">Plano de Mesas & Comandas</span>
                <kbd className="px-2.5 py-0.5 bg-[#0b1f17] text-emerald-300 rounded-lg font-mono font-bold border border-[#23533e]">2</kbd>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#183e2f] border border-[#255640] rounded-xl">
                <span className="text-emerald-100">Pantalla KDS Cocina & Barra</span>
                <kbd className="px-2.5 py-0.5 bg-[#0b1f17] text-emerald-300 rounded-lg font-mono font-bold border border-[#23533e]">3</kbd>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#183e2f] border border-[#255640] rounded-xl">
                <span className="text-emerald-100">Arqueo Diario (VB6 Modernizado)</span>
                <kbd className="px-2.5 py-0.5 bg-[#0b1f17] text-emerald-300 rounded-lg font-mono font-bold border border-[#23533e]">4</kbd>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#183e2f] border border-[#255640] rounded-xl">
                <span className="text-emerald-100">Reportes Financieros Mensuales</span>
                <kbd className="px-2.5 py-0.5 bg-[#0b1f17] text-emerald-300 rounded-lg font-mono font-bold border border-[#23533e]">5</kbd>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#183e2f] border border-[#255640] rounded-xl">
                <span className="text-emerald-100">Inventario y Stock</span>
                <kbd className="px-2.5 py-0.5 bg-[#0b1f17] text-emerald-300 rounded-lg font-mono font-bold border border-[#23533e]">6</kbd>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-emerald-300/80">
              Presione los números indicados en el teclado en cualquier momento para saltar velozmente entre pantallas.
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* Nielsen Heuristics Guide Modal */}
      {showNielsenGuide && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#122e23] border border-[#23533e] rounded-3xl p-6 max-w-2xl w-full shadow-2xl my-8 max-h-[85vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c4434] mb-4 sticky top-0 bg-[#122e23] z-10">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Heurísticas de Usabilidad de Nielsen en GastroMaster Pro
                </h3>
                <p className="text-xs text-emerald-300/80">Diseño centrado en la velocidad operativa y claridad del usuario</p>
              </div>
              <button
                onClick={() => setShowNielsenGuide(false)}
                className="text-emerald-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-emerald-100">
              <div className="border border-[#23533e] p-3.5 rounded-2xl bg-[#163a2c]">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  1. Visibilidad del estado del sistema
                </h4>
                <p className="mt-1 text-emerald-200/80">
                  El sistema indica claramente el estado de cada mesa (Libre, Ocupada, Reservada), el avance en cocina de cada plato y notificaciones toast confirmando pedidos.
                </p>
              </div>

              <div className="border border-[#23533e] p-3.5 rounded-2xl bg-[#163a2c]">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  2. Relación entre el sistema y el mundo real
                </h4>
                <p className="mt-1 text-emerald-200/80">
                  Terminología culinaria y de salón auténtica: comandas, comensales por mesa, arqueo de caja (Z de cierre), estación de cocina vs barra e IGV oficial en Soles (S/.).
                </p>
              </div>

              <div className="border border-[#23533e] p-3.5 rounded-2xl bg-[#163a2c]">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  3. Control y libertad del usuario (Navegación reversible)
                </h4>
                <p className="mt-1 text-emerald-200/80">
                  Botón siempre visible &quot;Volver / Regresar&quot; con historial de navegación; posibilidad de modificar cantidades o retirar items antes del envío a cocina.
                </p>
              </div>

              <div className="border border-[#23533e] p-3.5 rounded-2xl bg-[#163a2c]">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  4. Consistencia y estándares
                </h4>
                <p className="mt-1 text-emerald-200/80">
                  Top Bar Contract estricto, paleta armónica verdosa, cifras financieras con tipografía tabular fija (JetBrains Mono) que nunca desalinea decimales.
                </p>
              </div>

              <div className="border border-[#23533e] p-3.5 rounded-2xl bg-[#163a2c]">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  5. Prevención de errores y reconocimiento
                </h4>
                <p className="mt-1 text-emerald-200/80">
                  Alerta destacada de alergias alimentarias en rojo para evitar incidentes en cocina; verificación de presencia física en mesa con código QR antes de pedir; confirmación de cierre de mesa.
                </p>
              </div>

              <div className="border border-[#23533e] p-3.5 rounded-2xl bg-[#163a2c]">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  6. Modernización del Arqueo Clásico (Imagen Adjunta)
                </h4>
                <p className="mt-1 text-emerald-200/80">
                  Transformamos la ventana clásica en gris (Visual Basic) en un módulo dinámico que auto-totaliza ventas, cruza efectivo con POS/Yape, y calcula impuestos automáticamente sin redundancias manuales.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowNielsenGuide(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 text-xs font-black rounded-xl shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
