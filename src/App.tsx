import React, { useState, useEffect } from 'react';
import { RestaurantProvider, useRestaurant, AppView } from './context/RestaurantContext';
import { AccessibilityBar } from './components/common/AccessibilityBar';
import { Header } from './components/layout/Header';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { CartDrawer } from './components/customer/CartDrawer';
import { LoyaltyModal } from './components/customer/LoyaltyModal';
import { TablesGrid } from './components/admin/TablesGrid';
import { KdsKitchen } from './components/admin/KdsKitchen';
import { DailyClosing } from './components/admin/DailyClosing';
import { MonthlyReports } from './components/admin/MonthlyReports';
import { InventoryView } from './components/admin/InventoryView';
import { MenuManager } from './components/admin/MenuManager';
import { TicketModal } from './components/common/TicketModal';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    highContrast,
    largeFont,
    notifications,
    dismissNotification,
  } = useRestaurant();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);

  // Global Keyboard Navigation Shortcuts (Heuristics for efficiency)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '1') setCurrentView('cliente-menu');
      if (e.key === '2') setCurrentView('admin-mesas');
      if (e.key === '3') setCurrentView('admin-kds');
      if (e.key === '4') setCurrentView('admin-arqueo');
      if (e.key === '5') setCurrentView('admin-reportes');
      if (e.key === '6') setCurrentView('admin-inventario');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-all bg-[#0b1d16] text-[#ecfdf5] ${
        highContrast
          ? 'contrast-125 font-semibold'
          : ''
      } ${largeFont ? 'text-base' : 'text-sm'}`}
    >
      {/* Top Accessibility and System Status bar */}
      <AccessibilityBar />

      {/* Main Strict 3-zone Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
      />

      {/* Dynamic Viewport Content */}
      <main className="flex-1 pb-16">
        {currentView === 'cliente-menu' && (
          <CustomerPortal
            onOpenCart={() => setIsCartOpen(true)}
            onOpenLoyalty={() => setIsLoyaltyOpen(true)}
          />
        )}
        {currentView === 'cliente-perfil' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <CustomerPortal
              onOpenCart={() => setIsCartOpen(true)}
              onOpenLoyalty={() => setIsLoyaltyOpen(true)}
            />
          </div>
        )}
        {currentView === 'admin-mesas' && <TablesGrid />}
        {currentView === 'admin-kds' && <KdsKitchen />}
        {currentView === 'admin-arqueo' && <DailyClosing />}
        {currentView === 'admin-reportes' && <MonthlyReports />}
        {currentView === 'admin-inventario' && <InventoryView />}
        {currentView === 'admin-menu' && <MenuManager />}
      </main>

      {/* Global Interactive Modals */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoyaltyModal isOpen={isLoyaltyOpen} onClose={() => setIsLoyaltyOpen(false)} />
      <TicketModal />

      {/* Floating System Notifications (Nielsen Heuristic #1: Visibility of System Status) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start justify-between gap-3 text-xs transition-all animate-in slide-in-from-bottom-2 ${
              notif.type === 'success'
                ? 'bg-[#123626]/95 text-emerald-100 border-[#1f5a3f] backdrop-blur-md shadow-emerald-950/40'
                : notif.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-700/70 backdrop-blur-md shadow-amber-950/40'
                : 'bg-[#132c21]/95 text-emerald-200 border-[#234e3a] backdrop-blur-md'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {notif.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : notif.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium leading-tight">{notif.message}</p>
                <span className="text-[10px] opacity-70 font-mono mt-0.5 block">{notif.timestamp}</span>
              </div>
            </div>

            <button
              onClick={() => dismissNotification(notif.id)}
              className="opacity-70 hover:opacity-100 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <MainAppContent />
    </RestaurantProvider>
  );
}
