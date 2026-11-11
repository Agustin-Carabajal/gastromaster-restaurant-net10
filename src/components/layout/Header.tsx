import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRestaurant, AppView } from '../../context/RestaurantContext';
import {
  ArrowLeft,
  ShoppingBag,
  ChefHat,
  User,
  ShieldAlert,
  Sparkles,
  Lock,
  KeyRound,
  X,
  LogOut,
  QrCode,
} from 'lucide-react';

export const Header: React.FC<{ onOpenCart: () => void; onOpenLoyalty: () => void }> = ({
  onOpenCart,
  onOpenLoyalty,
}) => {
  const {
    userRole,
    setUserRole,
    currentView,
    setCurrentView,
    goBack,
    canGoBack,
    cartItems,
    selectedTableId,
    setSelectedTableId,
    tables,
    currentCustomer,
    authenticatedStaffRole,
    loginStaffWithPin,
    logoutStaff,
    verifiedTable,
    clearTableVerification,
  } = useRestaurant();

  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [targetRole, setTargetRole] = useState<'mozo' | 'gerente'>('mozo');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Navigation tabs based on active role
  const getNavLinks = () => {
    if (userRole === 'cliente') {
      return [
        { id: 'cliente-menu' as AppView, label: 'Carta Digital' },
        { id: 'cliente-perfil' as AppView, label: 'Club GastroPuntos' },
      ];
    }
    if (userRole === 'mozo') {
      return [
        { id: 'admin-mesas' as AppView, label: 'Salón & Mesas' },
        { id: 'admin-kds' as AppView, label: 'Cocina & Barra' },
        { id: 'cliente-menu' as AppView, label: 'Toma de Pedidos' },
        { id: 'admin-inventario' as AppView, label: 'Stock Rápido' },
      ];
    }
    // Gerente (full administrative access)
    return [
      { id: 'admin-mesas' as AppView, label: 'Mesas & Cuentas' },
      { id: 'admin-kds' as AppView, label: 'Comandas KDS' },
      { id: 'admin-arqueo' as AppView, label: 'Arqueo del Día (VB6)' },
      { id: 'admin-reportes' as AppView, label: 'Reportes Mensuales' },
      { id: 'admin-inventario' as AppView, label: 'Inventario' },
      { id: 'admin-menu' as AppView, label: 'Gestión Menú' },
    ];
  };

  const navLinks = getNavLinks();
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleRoleSelection = (role: 'cliente' | 'mozo' | 'gerente') => {
    setShowRoleSelector(false);
    if (role === 'cliente') {
      setUserRole('cliente');
      setCurrentView('cliente-menu');
      return;
    }

    // If staff is already authenticated with adequate privileges
    if (authenticatedStaffRole === role || (authenticatedStaffRole === 'gerente' && role === 'mozo')) {
      setUserRole(role);
      setCurrentView('admin-mesas');
      return;
    }

    // Require Employee Security PIN
    setTargetRole(role);
    setPinInput('');
    setPinError(null);
    setShowPinModal(true);
  };

  const handlePinSubmit = (e?: React.FormEvent, customPin?: string) => {
    if (e) e.preventDefault();
    const pinToUse = (customPin !== undefined ? customPin : pinInput).trim();
    if (!pinToUse) return;

    const res = loginStaffWithPin(pinToUse);
    if (res.success) {
      setShowPinModal(false);
      setPinInput('');
      setPinError(null);
    } else {
      setPinError(res.message);
      setPinInput('');
    }
  };

  const handlePinKeyClick = (num: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + num;
      setPinInput(next);
      setPinError(null);
      if (next.length === 4) {
        setTimeout(() => {
          handlePinSubmit(undefined, next);
        }, 120);
      }
    }
  };

  const handleQuickRoleLogin = (role: 'mozo' | 'gerente') => {
    const pin = role === 'mozo' ? '1234' : '9999';
    handlePinSubmit(undefined, pin);
  };

  // Keyboard navigation inside the PIN modal
  useEffect(() => {
    if (!showPinModal) return;
    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinKeyClick(e.key);
      } else if (e.key === 'Backspace') {
        setPinInput((prev) => prev.slice(0, -1));
        setPinError(null);
      } else if (e.key === 'Escape') {
        setShowPinModal(false);
      } else if (e.key === 'Enter') {
        handlePinSubmit();
      }
    };

    window.addEventListener('keydown', handleModalKeyDown);
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [showPinModal, pinInput]);

  return (
    <header className="sticky top-0 z-40 bg-[#0f281e]/95 backdrop-blur-md border-b border-[#1b4332] text-emerald-50">
      {/* Strict One-Row Three-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setCurrentView(userRole === 'cliente' ? 'cliente-menu' : 'admin-mesas')}
          className="text-lg font-bold tracking-tight text-white hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5 text-left"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-neutral-950 font-black flex items-center justify-center text-sm shadow-md shadow-emerald-950/50">
            GM
          </span>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wide text-white leading-tight">GastroMaster</span>
            <span className="text-[10px] text-emerald-300 font-medium tracking-wider uppercase">Bistrot & Lounge</span>
          </div>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-emerald-100/90">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentView(link.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive
                    ? 'border-emerald-400 text-white font-bold'
                    : 'border-transparent text-emerald-200/70 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Role Switcher with PIN Guard */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-[#183e2f] transition-colors"
            title="Ver comanda activa de la mesa"
            aria-label="Carrito de compras"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-400 text-neutral-950 text-[11px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Role selector dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-2 border border-[#23533e] bg-[#143628] text-emerald-100 hover:border-emerald-400/80 shadow-xs"
            >
              {userRole === 'cliente' && <User className="w-3.5 h-3.5 text-emerald-400" />}
              {userRole === 'mozo' && <ChefHat className="w-3.5 h-3.5 text-teal-300" />}
              {userRole === 'gerente' && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
              <span className="capitalize">{userRole === 'gerente' ? 'Gerente General' : userRole === 'mozo' ? 'Mozo de Salón' : 'Comensal en Mesa'}</span>
              {userRole !== 'cliente' && <Lock className="w-3 h-3 text-emerald-400 ml-0.5" />}
            </button>

            {/* Role dropdown popover */}
            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-72 bg-[#122e23] rounded-2xl shadow-2xl border border-[#23533e] p-2 z-50 text-emerald-50">
                <div className="px-3 py-2 border-b border-[#1c4434] mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-300">Modo de Operación</span>
                  {authenticatedStaffRole && (
                    <button
                      onClick={logoutStaff}
                      className="text-[10px] text-red-300 hover:text-red-200 flex items-center gap-1 font-semibold"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Cerrar Turno</span>
                    </button>
                  )}
                </div>

                {/* Cliente */}
                <button
                  onClick={() => handleRoleSelection('cliente')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    userRole === 'cliente'
                      ? 'bg-emerald-900/60 text-emerald-200 font-bold border border-emerald-600/60'
                      : 'hover:bg-[#1a4030] text-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Portal Comensal</div>
                      <div className="text-[10px] text-emerald-300/80">Pide desde tu mesa y acumula puntos</div>
                    </div>
                  </div>
                </button>

                {/* Mozo */}
                <button
                  onClick={() => handleRoleSelection('mozo')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors mt-1 ${
                    userRole === 'mozo'
                      ? 'bg-teal-900/60 text-teal-200 font-bold border border-teal-600/60'
                      : 'hover:bg-[#1a4030] text-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ChefHat className="w-4 h-4 text-teal-300" />
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>Mozo / Camarero</span>
                        {!authenticatedStaffRole && <KeyRound className="w-3 h-3 text-emerald-300" />}
                      </div>
                      <div className="text-[10px] text-emerald-300/80">Plano de mesas, KDS, pedidos manuales</div>
                    </div>
                  </div>
                </button>

                {/* Gerente */}
                <button
                  onClick={() => handleRoleSelection('gerente')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors mt-1 ${
                    userRole === 'gerente'
                      ? 'bg-amber-950/60 text-amber-200 font-bold border border-amber-600/60'
                      : 'hover:bg-[#1a4030] text-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>Gerente / Administrador</span>
                        {authenticatedStaffRole !== 'gerente' && <KeyRound className="w-3 h-3 text-amber-300" />}
                      </div>
                      <div className="text-[10px] text-emerald-300/80">Arqueo VB6, reportes, inventario, precios</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Toolbar: Table verification & Nielsen Navigation Undo / Back */}
      <div className="bg-[#0b1f17] px-4 sm:px-6 py-2 border-t border-[#183d2e] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          {/* Nielsen Heuristic 3: User Control & Freedom (Back Button) */}
          {canGoBack && (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#143628] border border-[#23533e] text-emerald-200 hover:text-white hover:border-emerald-400 transition-colors font-medium shadow-xs"
              title="Regresar a la pantalla anterior"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
          )}

          {/* Context for Customer vs Staff */}
          {userRole === 'cliente' ? (
            <div className="flex items-center gap-2">
              {verifiedTable ? (
                <div className="flex items-center gap-2 bg-[#143828] border border-emerald-500/50 text-emerald-200 px-3 py-1 rounded-xl shadow-xs">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-white">Mesa #{verifiedTable.number} ({verifiedTable.name})</span>
                  <span className="text-[10px] bg-emerald-900/90 text-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                    Código: {verifiedTable.securityCode}
                  </span>
                  <button
                    onClick={clearTableVerification}
                    className="text-[10px] underline hover:text-white ml-1 text-emerald-400 font-medium"
                    title="Cambiar de mesa escaneando un nuevo código"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-600/50 text-amber-200 px-3 py-1 rounded-xl">
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium">Mesa no vinculada. Escanea el código QR de tu mesa.</span>
                </div>
              )}
            </div>
          ) : (
            /* Staff Mode: Can inspect any table */
            <div className="flex items-center gap-2">
              <span className="text-emerald-300 font-medium">Gestionando mesa:</span>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(Number(e.target.value))}
                className="bg-[#143628] border border-[#23533e] rounded-xl px-2.5 py-1 text-xs font-semibold text-emerald-100 focus:outline-hidden focus:border-emerald-400"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#122e23] text-white">
                    Mesa #{t.number} - {t.name} ({t.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Customer Loyalty Pill */}
        <div className="flex items-center gap-3">
          {currentCustomer ? (
            <button
              onClick={onOpenLoyalty}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-medium hover:bg-emerald-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentCustomer.name.split(' ')[0]}:</span>
              <span className="font-black font-mono text-emerald-300">{currentCustomer.points} pts</span>
              <span className="text-[10px] bg-emerald-400 text-neutral-950 font-black px-1.5 py-0.5 rounded">
                {currentCustomer.tier}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenLoyalty}
              className="text-emerald-300 hover:text-emerald-100 text-xs underline underline-offset-2"
            >
              Acceder con GastroPuntos
            </button>
          )}
        </div>
      </div>

      {/* Staff PIN Security Modal (Mounted in portal to escape header backdrop-blur and sticky boundaries) */}
      {showPinModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative bg-[#122e23] border border-[#23533e] rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 text-white my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c4434]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Autenticación de Personal
                  </h3>
                  <p className="text-[11px] text-emerald-300/80">
                    Ingreso para {targetRole === 'gerente' ? 'Gerente / Administrador' : 'Mozo / Camarero de Salón'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="text-emerald-300/70 hover:text-white p-1 rounded-lg hover:bg-[#194030] transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-700 text-red-200 text-xs text-center font-medium animate-pulse">
                {pinError}
              </div>
            )}

            {/* PIN Display Dots */}
            <div className="text-center space-y-1.5">
              <span className="text-xs text-emerald-300 font-medium">Ingresa tu código PIN de 4 dígitos:</span>
              <div className="h-12 bg-[#0b1f17] border border-[#23533e] rounded-xl flex items-center justify-center gap-3 shadow-inner">
                {[0, 1, 2, 3].map((index) => {
                  const hasDigit = index < pinInput.length;
                  return (
                    <span
                      key={index}
                      className={`w-3.5 h-3.5 rounded-full transition-all ${
                        hasDigit
                          ? 'bg-emerald-400 shadow-md shadow-emerald-400/50 scale-110'
                          : 'border-2 border-[#23533e] bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handlePinKeyClick(n)}
                  className="py-2.5 sm:py-3 rounded-xl bg-[#173b2d] hover:bg-[#1e4d3b] text-lg font-mono font-bold text-white transition-all active:scale-95 border border-[#255640] shadow-xs"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setPinInput(''); setPinError(null); }}
                className="py-2.5 sm:py-3 rounded-xl bg-[#173b2d] hover:bg-[#1e4d3b] text-xs font-semibold text-emerald-300/80 border border-[#255640] transition-all active:scale-95"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => handlePinKeyClick('0')}
                className="py-2.5 sm:py-3 rounded-xl bg-[#173b2d] hover:bg-[#1e4d3b] text-lg font-mono font-bold text-white border border-[#255640] transition-all active:scale-95 shadow-xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => { setPinInput((p) => p.slice(0, -1)); setPinError(null); }}
                className="py-2.5 sm:py-3 rounded-xl bg-[#173b2d] hover:bg-[#1e4d3b] text-xs font-semibold text-emerald-300/80 border border-[#255640] transition-all active:scale-95"
              >
                ⌫
              </button>
            </div>

            {/* Quick Demo Access Buttons - 1 tap instant login */}
            <div className="p-3 rounded-2xl bg-[#0b1f17] border border-[#1b4332] text-xs text-emerald-200 space-y-2">
              <div className="font-semibold text-emerald-300 flex items-center justify-between text-[11px]">
                <span>Accesos directos de prueba:</span>
                <span className="text-[10px] text-emerald-400/80 font-mono">1 toque</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('mozo')}
                  className="py-2 px-2.5 rounded-xl bg-[#14382a] hover:bg-[#1b4b38] border border-teal-500/40 text-teal-200 text-left font-medium transition-all flex flex-col gap-0.5 active:scale-95"
                >
                  <span className="text-[10px] uppercase tracking-wider text-teal-400 font-bold">Mozo (Camarero)</span>
                  <span className="font-mono text-xs font-bold text-white flex items-center justify-between">
                    <span>PIN: 1234</span>
                    <span className="text-[10px] text-teal-300">Entrar →</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('gerente')}
                  className="py-2 px-2.5 rounded-xl bg-[#14382a] hover:bg-[#1b4b38] border border-amber-500/40 text-amber-200 text-left font-medium transition-all flex flex-col gap-0.5 active:scale-95"
                >
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Gerente (Admin)</span>
                  <span className="font-mono text-xs font-bold text-white flex items-center justify-between">
                    <span>PIN: 9999</span>
                    <span className="text-[10px] text-amber-300">Entrar →</span>
                  </span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#23533e] text-xs font-medium text-emerald-200 hover:bg-[#183e2f] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handlePinSubmit()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-extrabold text-xs shadow-md shadow-emerald-950/40 transition-transform active:scale-95"
              >
                Verificar PIN
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
