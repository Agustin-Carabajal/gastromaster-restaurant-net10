import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Product, ProductCategory } from '../../types';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Check,
  X,
  Sparkles,
  Search,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const MenuManager: React.FC = () => {
  const { products, saveProduct } = useRestaurant();
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'todos'>('todos');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('comidas');
  const [price, setPrice] = useState<number>(15.0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(true);
  const [stock, setStock] = useState<number>(30);
  const [allergens, setAllergens] = useState('');
  const [station, setStation] = useState<'cocina' | 'barra'>('cocina');
  const [isVegetarian, setIsVegetarian] = useState(false);

  const categories: { id: ProductCategory | 'todos'; label: string }[] = [
    { id: 'todos', label: 'Todos los Platos' },
    { id: 'comidas', label: 'Comidas' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'postres', label: 'Postres' },
    { id: 'combos', label: 'Combos' },
    { id: 'promociones', label: 'Promociones' },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeCategory !== 'todos' && p.category !== activeCategory) return false;
    return true;
  });

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsNew(false);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setDescription(p.description);
    setImage(p.image);
    setAvailable(p.available);
    setStock(p.stock);
    setAllergens(p.allergens.join(', '));
    setStation(p.preparationStation);
    setIsVegetarian(!!p.isVegetarian);
  };

  const handleOpenCreate = () => {
    setEditingProduct({
      id: 'prod-' + Date.now(),
      name: '',
      category: 'comidas',
      price: 18.0,
      description: '',
      image: '/src/assets/images/hero_gourmet_table_1794350407666.jpg',
      available: true,
      stock: 40,
      minStock: 10,
      allergens: [],
      preparationStation: 'cocina',
    });
    setIsNew(true);
    setName('');
    setCategory('comidas');
    setPrice(18.0);
    setDescription('');
    setImage('/src/assets/images/hero_gourmet_table_1794350407666.jpg');
    setAvailable(true);
    setStock(40);
    setAllergens('');
    setStation('cocina');
    setIsVegetarian(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !name.trim()) return;

    const updated: Product = {
      ...editingProduct,
      name: name.trim(),
      category,
      price: Number(price),
      description: description.trim(),
      image: image || '/src/assets/images/hero_gourmet_table_1794350407666.jpg',
      available,
      stock: Number(stock),
      allergens: allergens
        ? allergens
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean)
        : [],
      preparationStation: station,
      isVegetarian,
    };

    saveProduct(updated);
    setEditingProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-emerald-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
            Gestión de Carta, Precios y Promociones
          </h2>
          <p className="text-xs text-emerald-300/80">
            Administración del catálogo, asignación a cocina o barra, combos especiales y control de alérgenos
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 shadow-md shadow-emerald-950/40 flex items-center gap-2 transition-all self-start sm:self-auto active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Plato / Combo</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#122e23] border border-[#23533e] rounded-2xl overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              activeCategory === c.id
                ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid of Dishes for Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-[#122e23] border border-[#23533e] rounded-3xl p-4 flex flex-col justify-between shadow-md space-y-3"
          >
            <div className="flex gap-3">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-[#0a1c14] border border-[#23533e]"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-bold text-white text-xs truncate">
                    {product.name}
                  </h4>
                  <span className="font-mono font-black text-xs text-amber-300 shrink-0">
                    S/. {product.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-[11px] text-emerald-200/80 line-clamp-2">{product.description}</p>

                <div className="text-[10px] text-emerald-400/80 flex items-center gap-1.5 pt-0.5">
                  <span className="capitalize">{product.category}</span>
                  <span>·</span>
                  <span className="uppercase">{product.preparationStation}</span>
                  <span>·</span>
                  <span>Stock: {product.stock}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1c4434] text-xs">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                  product.available && product.stock > 0
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/60'
                    : 'bg-red-950/70 text-red-300 border-red-700/60'
                }`}
              >
                {product.available && product.stock > 0 ? 'Disponible' : 'Agotado'}
              </span>

              <button
                onClick={() => handleOpenEdit(product)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#183e2f] hover:bg-[#20513d] text-emerald-100 flex items-center gap-1 transition-colors border border-[#255640]"
              >
                <Edit2 className="w-3 h-3 text-emerald-400" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Dish Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#122e23] border border-[#23533e] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c4434]">
              <h3 className="text-base font-bold text-white">
                {isNew ? 'Registrar Nuevo Plato o Combo' : `Editar: ${editingProduct.name}`}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-emerald-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-emerald-200 block mb-1">
                  Nombre del Plato:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1f17] border border-[#23533e] rounded-xl text-white focus:outline-hidden focus:border-emerald-400 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-emerald-200 block mb-1">
                    Categoría:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-[#0b1f17] border border-[#23533e] rounded-xl text-white focus:outline-hidden focus:border-emerald-400"
                  >
                    <option value="comidas" className="bg-[#0e241c]">Comidas / Platos</option>
                    <option value="bebidas" className="bg-[#0e241c]">Bebidas & Bar</option>
                    <option value="postres" className="bg-[#0e241c]">Postres</option>
                    <option value="combos" className="bg-[#0e241c]">Combos</option>
                    <option value="promociones" className="bg-[#0e241c]">Promociones</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-emerald-200 block mb-1">
                    Precio en Soles (S/.):
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0b1f17] border border-[#23533e] rounded-xl font-mono font-bold text-amber-300 focus:outline-hidden focus:border-emerald-400 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-emerald-200 block mb-1">
                  Descripción e Ingredientes:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1f17] border border-[#23533e] rounded-xl text-white focus:outline-hidden focus:border-emerald-400 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-emerald-200 block mb-1">
                    Estación de Preparación:
                  </label>
                  <select
                    value={station}
                    onChange={(e) => setStation(e.target.value as 'cocina' | 'barra')}
                    className="w-full px-3 py-2 bg-[#0b1f17] border border-[#23533e] rounded-xl text-white focus:outline-hidden focus:border-emerald-400"
                  >
                    <option value="cocina" className="bg-[#0e241c]">Cocina Caliente</option>
                    <option value="barra" className="bg-[#0e241c]">Barra / Bebidas</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-emerald-200 block mb-1">
                    Stock en Porciones:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0b1f17] border border-[#23533e] rounded-xl font-mono text-white focus:outline-hidden focus:border-emerald-400 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-emerald-200 block mb-1">
                  Alérgenos (separados por coma):
                </label>
                <input
                  type="text"
                  placeholder="Gluten, Lácteos, Maní..."
                  value={allergens}
                  onChange={(e) => setAllergens(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1f17] border border-[#23533e] rounded-xl text-white focus:outline-hidden focus:border-emerald-400 shadow-inner"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="rounded text-emerald-500 w-4 h-4"
                  />
                  <span className="font-medium text-emerald-100">
                    Disponible para pedir
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    className="rounded text-teal-400 w-4 h-4"
                  />
                  <span className="font-medium text-emerald-100">
                    Apto para vegetarianos
                  </span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-[#23533e] text-emerald-200 hover:bg-[#183e2f]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-neutral-950 shadow-md shadow-emerald-950/40"
                >
                  Guardar Plato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
