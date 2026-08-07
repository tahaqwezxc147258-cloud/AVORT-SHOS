import React from 'react';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ShoeCardProps {
  product: Product;
  badge?: string;
}

export const ShoeCard: React.FC<ShoeCardProps> = ({ product, badge }) => {
  const { toggleWishlist, isWishlisted, setSelectedProduct, addToCart } = useStore();
  const wishlisted = isWishlisted(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0] || 42, product.colors[0], 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative bg-white rounded-3xl p-4 shadow-[0_10px_25px_-5px_rgba(0,180,216,0.12)] hover:shadow-[0_20px_35px_rgba(0,180,216,0.22)] transition-all duration-300 cursor-pointer flex flex-col justify-between border border-cyan-100/60 hover:-translate-y-1.5"
    >
      {/* Top Header: Price Tag & Favorite Heart */}
      <div className="flex items-center justify-between z-10">
        <div className="bg-cyan-50 border border-cyan-100 px-3 py-1 rounded-full text-cyan-600 font-bold text-sm shadow-xs">
          {product.priceToman.toLocaleString('fa-IR')} <span className="text-xs font-medium">تومان</span>
        </div>

        <button
          onClick={handleToggleWishlist}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            wishlisted
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
              : 'bg-slate-100/80 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
          }`}
          title="افزودن به علاقه‌مندی‌ها"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* 3D Elevated Shoe Display Area */}
      <div className="relative my-3 py-4 flex items-center justify-center min-h-[160px] bg-transparent">
        {/* Soft cyan gradient shadow aura */}
        <div className="absolute w-28 h-28 bg-cyan-200/40 rounded-full filter blur-xl group-hover:scale-125 transition-all duration-500"></div>
        
        {/* Badge if present */}
        {badge && (
          <span className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10 shadow-xs">
            {badge}
          </span>
        )}

        {/* Shoe Image in 3D perspective angle with drop shadow */}
        <img
          src={product.images[0]}
          alt={product.nameFa}
          onClick={() => setSelectedProduct(product)}
          className="relative w-full max-w-[200px] h-36 object-contain filter drop-shadow-[0_15px_15px_rgba(14,116,144,0.3)] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6"
          loading="lazy"
        />
      </div>

      {/* Product Details & Actions */}
      <div className="space-y-2 mt-1">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[11px] font-bold text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-md">
            {product.brand} • {product.category}
          </span>
        </div>

        <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-cyan-600 transition-colors dir-ltr text-right">
          {product.name}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-1">
          {product.nameFa}
        </p>

        {/* Action Button Row */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white py-2 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>افزودن سریع</span>
          </button>

          <button
            onClick={() => setSelectedProduct(product)}
            className="w-8 h-8 rounded-2xl bg-slate-100 hover:bg-cyan-100 text-slate-600 hover:text-cyan-600 flex items-center justify-center transition-colors"
            title="مشاهده جزئیات"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
