import React, { useState } from 'react';
import { ArrowLeft, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroSection: React.FC = () => {
  const { products, setSelectedProduct, addToCart, setViewMode } = useStore();
  
  // Find featured shoes
  const heroProducts = products.filter(p => p.isHeroFeatured);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Only explicitly approved products may appear in the hero banner.
  const currentHero = heroProducts[activeHeroIndex];

  if (!currentHero) return null;

  const handleNext = () => {
    if (heroProducts.length === 0) return;
    setActiveHeroIndex((prev) => (prev + 1) % heroProducts.length);
  };

  const handlePrev = () => {
    if (heroProducts.length === 0) return;
    setActiveHeroIndex((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
  };

  return (
    <section className="relative overflow-hidden py-8 lg:py-14 px-4 lg:px-8">
      {/* Background Decorative Circles & Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-200/30 rounded-full filter blur-3xl pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        {/* Main Hero Card Container matching Image 2 */}
        <div className="bg-white rounded-3xl lg:rounded-[36px] p-6 lg:p-12 shadow-[0_20px_50px_rgba(0,180,216,0.12)] border border-cyan-100/80 relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Watermark background text */}
          <span className="absolute -bottom-8 left-4 text-[100px] lg:text-[180px] font-black text-slate-100/80 select-none pointer-events-none tracking-tighter leading-none dir-ltr">
            JORDAN
          </span>

          {/* Right Info Column (RTL Start) */}
          <div className="lg:col-span-6 z-10 space-y-4 lg:space-y-6">
            
            {/* Top Brand Tag */}
            <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200/80 px-4 py-1.5 rounded-full text-cyan-600 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>کالکشن برجسته ۲۰۲۶ {currentHero.brand}</span>
            </div>

            {/* Shoe Title */}
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight dir-ltr text-right">
                {currentHero.name}
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedProduct(currentHero)}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-cyan-500/30 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>مشاهده جزئیات و خرید</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Left Column: 3D Shoe Visual Stage matching Image 2 */}
          <div className="lg:col-span-6 z-10 flex flex-col items-center justify-center relative">
            
            {/* Carousel Control Arrows */}
            <div className="absolute top-0 right-0 z-20 flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-cyan-500 hover:text-white text-slate-700 flex items-center justify-center transition-all shadow-xs"
                title="قبلی"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-cyan-500 hover:text-white text-slate-700 flex items-center justify-center transition-all shadow-xs"
                title="بعدی"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Main Elevated 3D Shoe Floating Canvas */}
            <div className="relative w-full aspect-4/3 max-w-[520px] flex items-center justify-center py-6 [perspective:1000px]">
              {/* Radial Cyan Glow Platform */}
              <div className="absolute w-72 h-72 sm:w-80 sm:h-80 bg-cyan-200/50 rounded-full filter blur-2xl animate-pulse"></div>
              <div className="absolute bottom-6 w-64 h-8 bg-slate-900/10 rounded-full filter blur-md"></div>

              {/* Tilted 3D Floating Isolated Shoe Image */}
              <img
                src={currentHero.images[0]}
                alt={currentHero.name}
                className="relative z-10 w-full max-w-[460px] object-contain animate-hero-3d cursor-pointer mix-blend-multiply filter drop-shadow-2xl transition-transform duration-500 hover:[transform:translateY(-14px)_rotateY(-12deg)_rotateZ(-10deg)_scale(1.06)]"
                onClick={() => setSelectedProduct(currentHero)}
              />
            </div>



          </div>

        </div>
      </div>
    </section>
  );
};
