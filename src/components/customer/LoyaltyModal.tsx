import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  X,
  Sparkles,
  Award,
  Gift,
  Clock,
  CheckCircle,
  LogIn,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export const LoyaltyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentCustomer,
    loginCustomer,
    logoutCustomer,
    redeemCustomerPoints,
  } = useRestaurant();

  const [inputCredential, setInputCredential] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const rewards = [
    {
      id: 'rew-1',
      title: 'Postre Volcán de Chocolate de Cortesía',
      pointsCost: 300,
      description: 'Disfruta de un exquisito fondant de cacao con helado de vainilla.',
      icon: Gift,
    },
    {
      id: 'rew-2',
      title: '10% de Descuento en tu Cuenta Total',
      pointsCost: 200,
      description: 'Aplicable directamente sobre el subtotal del pedido actual.',
      icon: Award,
    },
    {
      id: 'rew-3',
      title: 'Cerveza Cusqueña o Cóctel Artesanal Gratis',
      pointsCost: 250,
      description: 'Una bebida helada servida en tu mesa sin costo adicional.',
      icon: Sparkles,
    },
    {
      id: 'rew-4',
      title: 'Refresco Natural Grande de Chicha Morada',
      pointsCost: 150,
      description: 'Vaso de 500ml de chicha morada tradicional recién preparada.',
      icon: Gift,
    },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCredential.trim()) {
      loginCustomer(inputCredential.trim());
      setInputCredential('');
    }
  };

  const handleRedeem = (cost: number, title: string) => {
    const success = redeemCustomerPoints(cost, title);
    if (success) {
      setSuccessNotice(`¡Has canjeado con éxito: "${title}"! Se agregará al servicio de tu mesa.`);
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#122e23] border border-[#23533e] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1c4434]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Club GastroPuntos & Fidelidad
              </h3>
              <p className="text-xs text-emerald-300/80">
                Gana 10 puntos por cada S/. 1 consumido en nuestras mesas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successNotice && (
          <div className="bg-emerald-950/70 border border-emerald-500 p-3 rounded-2xl flex items-center gap-2 text-xs text-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Guest vs Logged User */}
        {!currentCustomer ? (
          <div className="space-y-4 bg-[#0e241c] p-5 rounded-2xl border border-[#1e4c38]">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <LogIn className="w-4 h-4 text-emerald-400" />
                Ingresa con tu Correo o Teléfono
              </h4>
              <p className="text-xs text-emerald-200/80 mt-1">
                No es obligatorio registrarte para pedir comida en la mesa, pero al identificarte acumularás puntos canjeables por comida y bebidas gratis.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Ingresa tu email (ej: agustin@restaurante.pe) o teléfono"
                value={inputCredential}
                onChange={(e) => setInputCredential(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-[#0b1f17] border border-[#23533e] rounded-xl text-white placeholder-emerald-700 focus:outline-hidden focus:border-emerald-400 shadow-inner"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 font-black text-xs rounded-xl shadow-md shadow-emerald-950/40 transition-colors"
                >
                  Identificarme / Crear Cuenta
                </button>
                <button
                  type="button"
                  onClick={() => loginCustomer('carabajal.agustin.ezequiel@gmail.com')}
                  className="py-2.5 px-3 bg-[#183e2f] hover:bg-[#20513d] text-emerald-200 text-xs rounded-xl font-bold border border-[#255640]"
                  title="Cargar perfil demo"
                >
                  Demo Agustín
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Customer Profile Card */}
            <div className="bg-gradient-to-br from-[#163a2c] to-[#0f281e] text-white p-5 rounded-2xl shadow-md border border-[#23533e] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    Socio GastroMaster · Nivel {currentCustomer.tier}
                  </span>
                  <h4 className="text-lg font-extrabold text-white">
                    {currentCustomer.name}
                  </h4>
                  <div className="text-xs text-emerald-300/80">{currentCustomer.email}</div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-emerald-300/80 block">Balance Disponible</span>
                  <span className="text-2xl font-black font-mono text-amber-300 tabular-nums">
                    {currentCustomer.points}
                  </span>
                  <span className="text-[10px] text-emerald-400 block">puntos activos</span>
                </div>
              </div>

              {/* Tier Progress */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-emerald-200">
                  <span>Progreso a Nivel Platino</span>
                  <span className="font-mono text-emerald-300">850 / 1000 pts</span>
                </div>
                <div className="w-full bg-[#0b1f17] h-2 rounded-full overflow-hidden border border-[#1b4332]">
                  <div className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1e4c38] text-xs text-emerald-300/80">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentCustomer.visitCount} visitas registradas</span>
                </div>
                <button
                  onClick={logoutCustomer}
                  className="text-emerald-400 hover:text-red-300 flex items-center gap-1 text-[11px]"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>

            {/* Catalog of redeemable rewards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                Recompensas Disponibles para Canje Inmediato
              </h4>

              <div className="space-y-2">
                {rewards.map((reward) => {
                  const canAfford = currentCustomer.points >= reward.pointsCost;
                  const Icon = reward.icon;

                  return (
                    <div
                      key={reward.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                        canAfford
                          ? 'border-[#23533e] bg-[#143828] hover:border-emerald-400/60'
                          : 'border-[#1b3d2d] bg-[#0d2218]/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            canAfford
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-[#183e2f] text-emerald-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-white">
                            {reward.title}
                          </h5>
                          <p className="text-[11px] text-emerald-200/80">{reward.description}</p>
                          <div className="text-[11px] font-mono font-bold text-amber-300 pt-0.5">
                            Requiere {reward.pointsCost} pts
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRedeem(reward.pointsCost, reward.title)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors shrink-0 ${
                          canAfford
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black shadow-md'
                            : 'bg-[#183e2f] text-emerald-700 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Canjear' : 'Faltan pts'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
