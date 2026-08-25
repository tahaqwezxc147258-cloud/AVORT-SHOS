import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryTabs } from './components/CategoryTabs';
import { PopularProducts } from './components/PopularProducts';
import { FeatureBanners } from './components/FeatureBanners';
import { ShopView } from './components/ShopView';
import { CartView } from './components/CartView';
import { AdminPanel } from './components/AdminPanel';
import { ProductDetailModal } from './components/ProductDetailModal';
import { LoginModal } from './components/LoginModal';
import { ProfileModal } from './components/ProfileModal';
import { ZarinpalGatewayModal } from './components/ZarinpalGatewayModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NewsletterFooter } from './components/NewsletterFooter';
import { ProfileView } from './components/ProfileView';
import { SeoHead } from './components/SeoHead';
import { SeoContent } from './components/SeoContent';
import { SeoPages } from './components/SeoPages';

const MainContent: React.FC = () => {
  const { viewMode, selectedProduct, setSelectedProduct } = useStore();
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const isBrandCollection = path === '/collection/jordan' || path === '/collection/nike';
  const isProductPage = path.startsWith('/product/');
  const isSeoPage = !isBrandCollection && !isProductPage && path !== '/' && path !== '/shop' && path !== '/cart' && path !== '/profile' && path !== '/admin';

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <SeoHead />
      <div>
        <Header />

        <main className="pb-16 md:pb-0">
          {isSeoPage && <SeoPages path={path} />}
          {viewMode === 'home' && path === '/' && (
            <>
              <HeroSection />
              <CategoryTabs />
              <PopularProducts />
              <FeatureBanners />
              <SeoContent />
              <NewsletterFooter />
            </>
          )}

          {viewMode === 'shop' && (path === '/shop' || isBrandCollection) && (
            <>
              <ShopView />
              <NewsletterFooter />
            </>
          )}

          {viewMode === 'cart' && <CartView />}

          {viewMode === 'admin' && <AdminPanel />}

          {viewMode === 'profile' && <ProfileView />}
        </main>
      </div>

      {/* Floating Bottom Navigation Bar for Mobile View */}
      <MobileBottomNav />

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <LoginModal />
      <ProfileModal />
      <ZarinpalGatewayModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
