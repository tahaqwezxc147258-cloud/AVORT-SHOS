import React, { useState } from 'react';
import { X, Heart, ShoppingBag, ChevronLeft, ChevronRight, Check, Star, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { toggleWishlist, isWishlisted, addToCart } = useStore();
  const wishlisted = isWishlisted(product.id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number>(product.sizes[0] || 42);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      
      {/* Modal Container matching Image 1 detail screen */}
      <div className="relative w-full max-w-2xl bg-[#eaf7f9] rounded-3xl sm:rounded-[36px] shadow-2xl overflow-hidden my-auto border border-white/80 max-h-[92vh] flex flex-col">
        
        {/* Top Floating Navigation Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between z-10 shrink-0">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/30 hover:bg-cyan-600 transition-colors"
            title="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-cyan-100">
            {product.brand} • {product.category}
          </span>

          <button
            onClick={() => toggleWishlist(product.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              wishlisted
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white text-slate-400 hover:text-rose-500 shadow-xs'
            }`}
          >
            <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 pt-0 space-y-6 flex-1 no-scrollbar">
          
          {/* Shoe Name & Subtitle */}
          <div>
            <span className="text-xs font-extrabold text-cyan-600 uppercase tracking-widest block">
              {product.brand}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dir-ltr text-right mt-1">
              {product.name}
            </h2>
            <p className="text-sm font-bold text-slate-600 mt-1">
              {product.nameFa}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-black text-cyan-600">
                {product.priceToman.toLocaleString('fa-IR')} <span className="text-xs font-bold">تومان</span>
              </span>
            </div>
          </div>

          {/* Elevated 3D Shoe Canvas with Navigation Carousel (< >) */}
          <div className="relative py-8 bg-transparent rounded-3xl border border-white/20 flex items-center justify-center">
            
            {/* Carousel Arrow Left */}
            {product.images.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-3 w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Main Shoe Image in 3D perspective angle */}
            <div className="relative w-full max-w-[320px] h-52 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsImageZoomed(true)}
                className="relative z-10 max-h-48 max-w-full cursor-zoom-in"
                title="Enlarge image"
              >
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className="max-h-48 max-w-full w-auto object-contain transition-transform duration-300 hover:scale-105"
                />
              </button>
            </div>

            {/* Carousel Arrow Right */}
            {product.images.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-3 w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Dots indicator */}
            {product.images.length > 1 && (
              <div className="absolute bottom-2 flex items-center gap-1.5">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeImageIndex ? 'w-6 bg-cyan-500' : 'w-2 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* White Description Box matching Image 1 */}
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3 border border-cyan-100">
            <h3 className="font-extrabold text-slate-900 text-sm">توضیحات و مشخصات فنی</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {product.resellPriceRange && (
              <div className="pt-2 text-xs border-t border-slate-100 flex flex-wrap gap-4 text-slate-500 font-medium">
                <div>
                  قیمت نمایندگی رسمی: <span className="font-bold text-slate-800">{product.priceToman.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div>
                  محدوده ارزش جهانی (Resell): <span className="font-bold text-cyan-600">{product.resellPriceRange}</span>
                </div>
              </div>
            )}
          </div>

          {/* Size Selector matching user screenshot */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-cyan-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm sm:text-base">
                انتخاب سایز:
              </span>
              <span className="text-xs font-extrabold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
                سایز انتخاب شده: {selectedSize}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {product.sizes.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-110 ring-2 ring-cyan-300'
                        : 'bg-slate-200/90 hover:bg-slate-300 text-slate-900 active:scale-95'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-cyan-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm sm:text-base">
                انتخاب رنگ:
              </span>
              <span className="text-xs font-extrabold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
                رنگ انتخاب شده: {selectedColor?.name || 'اصلی'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {product.colors.map((c) => {
                const isSelected = selectedColor?.name === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105 ring-2 ring-cyan-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/80 inline-block shadow-xs shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector Bar */}
          <div className="bg-cyan-50/80 rounded-3xl p-4 flex items-center justify-between border border-cyan-100">
            <span className="font-black text-slate-900 text-xs sm:text-sm">تعداد سفارش:</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setQuantity(qty)}
                  className={`w-9 h-9 rounded-2xl font-black text-xs transition-all ${
                    quantity === qty
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-cyan-100'
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>

          {/* Add To Bag Action Button matching Image 1 */}
          <button
            onClick={handleAddToCart}
            disabled={addedAnimation}
            className={`w-full py-4 rounded-3xl font-extrabold text-sm sm:text-base text-white flex items-center justify-center gap-3 shadow-xl transition-all duration-300 ${
              addedAnimation
                ? 'bg-emerald-500 shadow-emerald-500/30'
                : 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/30 active:scale-98'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-5 h-5" />
                <span>با موفقیت به سبد افزوده شد</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>افزودن به سبد خرید</span>
              </>
            )}
          </button>

        </div>

      </div>

      {isImageZoomed && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={() => setIsImageZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
        >
          <button
            type="button"
            onClick={() => setIsImageZoomed(false)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg hover:bg-cyan-50"
            aria-label="Close enlarged image"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={product.images[activeImageIndex] || product.images[0]}
            alt={product.name}
            onClick={(event) => event.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-2xl bg-white/95 p-3 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
