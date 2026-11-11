import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import { Product, ProductCategory } from '../../types';
import {
  Search,
  Filter,
  AlertTriangle,
  Plus,
  Minus,
  Sparkles,
  Bell,
  Receipt,
  CheckCircle,
  X,
  QrCode,
  Lock,
  Camera,
  KeyRound,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const CustomerPortal: React.FC<{ onOpenCart: () => void; onOpenLoyalty: () => void }> = ({
  onOpenCart,
  onOpenLoyalty,
}) => {
  const {
    products,
    selectedTable,
    addToCart,
    cartItems,
    currentCustomer,
    checkoutTable,
    verifiedTableId,
    verifiedTable,
    verifyTableWithCode,
    clearTableVerification,
    tables,
  } = useRestaurant();

  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [glutenFreeOnly, setGlutenFreeOnly] = useState(false);

  // Table QR / Security Code Verification state
  const [codeInputValue, setCodeInputValue] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // Modal for customizing dish order (diner, notes, allergies)
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedDiner, setSelectedDiner] = useState<number>(1);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [hasAllergyNotice, setHasAllergyNotice] = useState<boolean>(false);
  const [allergyDetails, setAllergyDetails] = useState<string>('');

  // Call waiter feedback
  const [waiterCalled, setWaiterCalled] = useState(false);

  const categories: { id: ProductCategory | 'todos'; label: string }[] = [
    { id: 'todos', label: 'Todo el Menú' },
    { id: 'comidas', label: 'Platos & Entradas' },
    { id: 'bebidas', label: 'Bebidas & Bar' },
    { id: 'postres', label: 'Postres Artesanales' },
    { id: 'combos', label: 'Combos del Chef' },
    { id: 'promociones', label: 'Promos Especiales' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== 'todos' && p.category !== activeCategory) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }
      if (vegetarianOnly && !p.isVegetarian) return false;
      if (glutenFreeOnly && !p.isGlutenFree) return false;
      return true;
    });
  }, [products, activeCategory, searchQuery, vegetarianOnly, glutenFreeOnly]);

  const handleVerifyTable = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = codeInputValue.trim();
    if (!val) {
      setVerificationError('Por favor ingresa el código visible en tu mesa.');
      return;
    }

    const res = verifyTableWithCode(val);
    if (res.success) {
      setVerificationError(null);
      setCodeInputValue('');
      setIsScanningQr(false);
      setIsCameraScannerOpen(false);
    } else {
      setVerificationError(res.message);
    }
  };

  const handleSimulateScan = (tableCode: string) => {
    setIsScanningQr(true);
    setVerificationError(null);

    setTimeout(() => {
      try {
        const res = verifyTableWithCode(tableCode);
        if (res.success) {
          setVerificationError(null);
          setIsCameraScannerOpen(false);
        } else {
          setVerificationError(res.message);
        }
      } catch (err) {
        setVerificationError('Error al leer el código. Intenta nuevamente.');
      } finally {
        setIsScanningQr(false);
      }
    }, 600);
  };

  const handleOpenCustomize = (product: Product) => {
    setCustomizingProduct(product);
    setSelectedDiner(1);
    setOrderQuantity(1);
    setSpecialNotes('');
    setHasAllergyNotice(product.allergens.length > 0);
    setAllergyDetails(product.allergens.length > 0 ? `Atención a alérgenos presentes: ${product.allergens.join(', ')}` : '');
  };

  const handleConfirmAddToCart = () => {
    if (!customizingProduct) return;

    const allergensList = hasAllergyNotice && allergyDetails.trim()
      ? [allergyDetails.trim()]
      : customizingProduct.allergens;

    addToCart({
      productId: customizingProduct.id,
      productName: customizingProduct.name,
      price: customizingProduct.price,
      quantity: orderQuantity,
      dinerNumber: selectedDiner,
      notes: specialNotes.trim() || undefined,
      allergensAlert: allergensList.length > 0 ? allergensList : undefined,
      station: customizingProduct.preparationStation,
    });

    setCustomizingProduct(null);
  };

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 4000);
  };

  // If customer has NOT verified their physical table yet, display Table Verification Screen
  if (!verifiedTable) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-[#122e23] border border-[#23533e] rounded-3xl p-8 shadow-2xl text-emerald-50 space-y-6 text-center relative overflow-hidden">
          {/* Subtle verdant ambient glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <QrCode className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              GastroMaster · Verificación de Mesa
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Validación de Presencia en Mesa
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-md mx-auto leading-relaxed">
              Para garantizar que tus pedidos se preparen y entreguen exactamente en tu mesa, escanea el código QR del soporte físico o introduce su código de seguridad.
            </p>
          </div>

          {verificationError && (
            <div className="p-3 bg-red-950/70 border border-red-700 text-red-200 text-xs rounded-xl flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{verificationError}</span>
            </div>
          )}

          {/* Action buttons: Camera QR scan or Manual Code Entry */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => setIsCameraScannerOpen(true)}
              className="w-full sm:w-auto flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Camera className="w-4 h-4" />
              <span>Escanear Código QR con Cámara</span>
            </button>
          </div>

          {/* Form for manual Code Entry */}
          <form onSubmit={handleVerifyTable} className="space-y-3 max-w-sm mx-auto text-left pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-emerald-200 flex items-center justify-between">
                <span>O ingresa el código escrito en la mesa:</span>
                <span className="text-[10px] text-emerald-400 font-mono">Ej: M1-7892 o Mesa 1</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Ej: M1-7892, 7892 o 1"
                  value={codeInputValue}
                  onChange={(e) => {
                    setCodeInputValue(e.target.value);
                    setVerificationError(null);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0b1f17] border border-[#23533e] rounded-xl text-white font-mono text-sm uppercase placeholder-emerald-700 focus:outline-hidden focus:border-emerald-400 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#183e2f] hover:bg-[#1f4e3b] text-emerald-100 font-bold text-xs rounded-xl border border-[#2d624d] transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verificar Código Manual</span>
            </button>
          </form>

          {/* Quick simulator of physical table QR stands */}
          <div className="pt-6 border-t border-[#1b4332] space-y-3">
            <div className="flex items-center justify-between text-left">
              <div>
                <span className="text-[11px] text-emerald-300 font-bold block uppercase tracking-wider">
                  Acceso Rápido / Simular Mesas del Local:
                </span>
                <span className="text-[10px] text-emerald-400/80">
                  Haz clic en cualquier mesa física para simular el escaneo de su código QR:
                </span>
              </div>
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {tables.slice(0, 8).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSimulateScan(t.securityCode || `M${t.number}-789${t.id}`)}
                  disabled={isScanningQr}
                  className="p-3 rounded-2xl bg-[#143628] hover:bg-[#1c4735] border border-[#23533e] hover:border-emerald-400/70 text-left transition-all active:scale-95 space-y-1 shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white group-hover:text-emerald-300">
                      Mesa #{t.number}
                    </span>
                    <QrCode className="w-3.5 h-3.5 text-emerald-400 opacity-70 group-hover:opacity-100" />
                  </div>
                  <div className="text-[11px] font-mono text-emerald-300 font-bold">
                    {t.securityCode || `M${t.number}-789${t.id}`}
                  </div>
                  <div className="text-[9px] text-emerald-400/70 truncate">{t.zone}</div>
                </button>
              ))}
            </div>

            {isScanningQr && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse">
                <QrCode className="w-4 h-4 text-emerald-300 animate-spin" />
                <span>Escaneando código QR de la mesa física...</span>
              </div>
            )}
          </div>
        </div>

        {/* Realistic Simulated Camera Scanner Modal */}
        {isCameraScannerOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-[#122e23] border border-[#23533e] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#1c4434]">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Escáner de Código QR de Mesa</h3>
                </div>
                <button
                  onClick={() => setIsCameraScannerOpen(false)}
                  className="text-emerald-300 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Viewfinder Camera Simulation */}
              <div className="relative aspect-square w-full bg-[#08150f] rounded-2xl overflow-hidden border-2 border-emerald-500/40 flex items-center justify-center">
                {/* Laser scan line animation */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />

                {/* Corner reticle markers */}
                <div className="absolute inset-8 border border-emerald-500/30 rounded-xl pointer-events-none" />
                <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />

                <div className="text-center space-y-2 p-6 z-10">
                  <QrCode className="w-16 h-16 text-emerald-400/80 mx-auto animate-bounce" />
                  <p className="text-xs text-emerald-200 font-medium">
                    Apunta la cámara al código QR impreso en tu mesa
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-center">
                <span className="text-xs text-emerald-300 font-semibold block">
                  O pulsa directamente la mesa detectada:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {tables.slice(0, 4).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSimulateScan(t.securityCode)}
                      className="py-2 px-1 text-xs font-bold rounded-xl bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors shadow-md"
                    >
                      Mesa #{t.number}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsCameraScannerOpen(false)}
                className="w-full py-2.5 text-xs font-semibold rounded-xl border border-[#23533e] text-emerald-200 hover:bg-[#183e2f]"
              >
                Cerrar Escáner
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // Once Table is verified: Render Rich Customer Dining Portal
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 text-emerald-50">
      {/* Hero Banner / Dining Context with Dimmed Ambient Verdant Atmosphere */}
      <div className="relative rounded-3xl overflow-hidden bg-[#122e23] text-white min-h-[220px] sm:min-h-[260px] flex items-center shadow-xl border border-[#23533e]">
        <img
          src="/src/assets/images/hero_gourmet_table_1794350407666.jpg"
          alt="Experiencia Gastronómica"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f17] via-[#0b1f17]/85 to-transparent" />

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold tracking-wide uppercase">
            <span className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 rounded-lg text-emerald-200">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{verifiedTable.name} (Código {verifiedTable.securityCode})</span>
            </span>
            <span>·</span>
            <span className="text-teal-300 font-semibold">Comensal Verificado</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Descubre nuestra carta y ordena desde tu mesa
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 line-clamp-2">
            Disfruta de hamburguesas artesanales, platos criollos, bebidas heladas y postres de autor. Puedes personalizar cada plato por comensal y avisar cualquier alergia.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCallWaiter}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
                waiterCalled
                  ? 'bg-emerald-400 text-neutral-950 font-bold'
                  : 'bg-[#183e2f] hover:bg-[#1f4e3b] text-emerald-100 border border-[#2d624d] backdrop-blur-xs'
              }`}
            >
              <Bell className="w-4 h-4 text-emerald-300" />
              <span>{waiterCalled ? '¡Mozo notificado a tu mesa!' : 'Llamar al Camarero'}</span>
            </button>

            {verifiedTable && verifiedTable.activeOrderItems.length > 0 && (
              <button
                onClick={() => checkoutTable(verifiedTable.id, 'efectivo', 0, 0)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40"
              >
                <Receipt className="w-4 h-4" />
                <span>
                  Pedir la Cuenta (S/.{' '}
                  {verifiedTable.activeOrderItems
                    .reduce((s, i) => s + i.price * i.quantity, 0)
                    .toFixed(2)}
                  )
                </span>
              </button>
            )}

            {!currentCustomer && (
              <button
                onClick={onOpenLoyalty}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#143628] hover:bg-[#1a4534] text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Acumula GastroPuntos</span>
              </button>
            )}

            <button
              onClick={clearTableVerification}
              className="text-[11px] text-emerald-300 hover:text-white underline ml-2 font-medium"
            >
              Cambiar de mesa
            </button>
          </div>
        </div>
      </div>

      {/* Category Segmented Tabs and Live Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Functional Segmented Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#122e23] border border-[#23533e] rounded-2xl overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-neutral-950 shadow-md font-bold'
                    : 'text-emerald-200 hover:text-white hover:bg-[#183e2f]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box & Dietary Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-emerald-400" />
              <input
                type="text"
                placeholder="Buscar hamburguesa, sopa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#122e23] border border-[#23533e] rounded-xl text-white placeholder-emerald-700 focus:outline-hidden focus:border-emerald-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-emerald-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setVegetarianOnly(!vegetarianOnly)}
              className={`px-2.5 py-1.5 text-xs rounded-xl border transition-colors ${
                vegetarianOnly
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold'
                  : 'bg-[#122e23] border-[#23533e] text-emerald-200 hover:bg-[#183e2f]'
              }`}
            >
              Vegetariano
            </button>

            <button
              onClick={() => setGlutenFreeOnly(!glutenFreeOnly)}
              className={`px-2.5 py-1.5 text-xs rounded-xl border transition-colors ${
                glutenFreeOnly
                  ? 'bg-teal-500 text-neutral-950 border-teal-400 font-bold'
                  : 'bg-[#122e23] border-[#23533e] text-emerald-200 hover:bg-[#183e2f]'
              }`}
            >
              Sin Gluten
            </button>
          </div>
        </div>

        {/* Results Count & Quiet Info */}
        <div className="flex items-center justify-between text-xs text-emerald-300">
          <div>
            Mostrando {filteredProducts.length} opciones en carta
            {activeCategory !== 'todos' && ` para: ${activeCategory}`}
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span>Precios en Soles (S/.)</span>
            <span>·</span>
            <span>Incluye IGV (18%)</span>
          </div>
        </div>
      </div>

      {/* Product Cards Grid with Verdant Botanical Surfaces */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-[#122e23] border border-[#23533e] rounded-2xl overflow-hidden hover:border-emerald-400/60 transition-all flex flex-col justify-between shadow-md"
          >
            <div>
              {/* Product Image */}
              <div className="relative aspect-4/3 w-full bg-[#0a1b13] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-2.5 right-2.5 bg-[#0b1f17]/90 backdrop-blur-xs text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#23533e]">
                  {product.preparationStation === 'cocina' ? 'Cocina' : 'Barra'}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-emerald-300 transition-colors">
                    {product.name}
                  </h3>
                  <span className="font-mono font-black text-amber-300 text-base tabular-nums shrink-0">
                    S/. {product.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-emerald-100/80 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Unboxed Metadata */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-emerald-300">
                  {product.calories && <span>{product.calories} kcal</span>}
                  {product.isVegetarian && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-teal-300 font-semibold">Vegetariano</span>
                    </>
                  )}
                  {product.allergens.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-300 font-medium">Contiene: {product.allergens.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-5 pt-0">
              <button
                onClick={() => handleOpenCustomize(product)}
                disabled={!product.available || product.stock <= 0}
                className={`w-full py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  !product.available || product.stock <= 0
                    ? 'bg-[#183e2f] text-emerald-700 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black shadow-md shadow-emerald-950/40 active:scale-98'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {product.stock <= 0 ? 'Agotado' : 'Pedir para mi comensal'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dish Customization & Allergen Modal */}
      {customizingProduct && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#122e23] border border-[#23533e] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8 text-white">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#1c4434]">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Mesa #{verifiedTable.number} · Personalizar Plato
                </span>
                <h3 className="text-lg font-bold text-white">
                  {customizingProduct.name}
                </h3>
                <p className="text-xs text-emerald-300 font-mono">
                  Precio unitario: S/. {customizingProduct.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setCustomizingProduct(null)}
                className="text-emerald-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diner Assignment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-100 block">
                ¿Para cuál comensal en la mesa es este plato?
              </label>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedDiner(num)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                      selectedDiner === num
                        ? 'bg-emerald-500 border-emerald-400 text-neutral-950 font-black'
                        : 'bg-[#183e2f] border-[#255640] text-emerald-200 hover:border-emerald-400'
                    }`}
                  >
                    Comensal #{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-2 border-y border-[#1c4434]">
              <span className="text-xs font-semibold text-emerald-100">
                Cantidad a ordenar:
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                  className="w-8 h-8 rounded-xl bg-[#183e2f] text-emerald-100 flex items-center justify-center hover:bg-[#20513d] border border-[#255640]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-base text-amber-300 w-6 text-center tabular-nums">
                  {orderQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setOrderQuantity(orderQuantity + 1)}
                  className="w-8 h-8 rounded-xl bg-[#183e2f] text-emerald-100 flex items-center justify-center hover:bg-[#20513d] border border-[#255640]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Special Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-100 block">
                Notas especiales o preferencias culinarias:
              </label>
              <input
                type="text"
                placeholder="Ej: Término 3/4, sin mayonesa, papas bien doradas..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0b1f17] border border-[#23533e] rounded-xl text-white focus:outline-hidden focus:border-emerald-400 shadow-inner"
              />
            </div>

            {/* Dietary / Allergies Alert */}
            <div className="space-y-2 bg-red-950/40 p-3.5 rounded-2xl border border-red-800/70">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-300">
                    Alergias o Restricciones Médicas Alimentarias
                  </h4>
                  <p className="text-[11px] text-red-200/90 mt-0.5">
                    Notificaremos a la cocina inmediatamente para evitar contaminación cruzada de utensilios.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="allergy-check"
                  checked={hasAllergyNotice}
                  onChange={(e) => setHasAllergyNotice(e.target.checked)}
                  className="rounded text-red-500 focus:ring-red-400 w-4 h-4"
                />
                <label htmlFor="allergy-check" className="text-xs text-emerald-100 font-medium cursor-pointer">
                  Este comensal tiene alergias o intolerancias específicas
                </label>
              </div>

              {hasAllergyNotice && (
                <input
                  type="text"
                  placeholder="Detalla aquí: Alergia al maní / Sin mariscos / Celíaco estricto"
                  value={allergyDetails}
                  onChange={(e) => setAllergyDetails(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0b1f17] border border-red-800 rounded-xl text-white focus:outline-hidden focus:border-red-400"
                />
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-emerald-300 block">Subtotal</span>
                <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">
                  S/. {(customizingProduct.price * orderQuantity).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomizingProduct(null)}
                  className="px-4 py-2 text-xs font-medium text-emerald-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToCart}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 text-xs font-black rounded-xl shadow-md shadow-emerald-950/40 transition-all active:scale-98"
                >
                  Agregar a Mesa #{verifiedTable.number}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
