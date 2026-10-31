import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryTabs } from './components/CategoryTabs';
import { PopularProducts } from './components/PopularProducts';
import { ShopView } from './components/ShopView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NewsletterFooter } from './components/NewsletterFooter';
import { SeoHead } from './components/SeoHead';
import { SeoContent } from './components/SeoContent';

const CartView = React.lazy(() => import('./components/CartView').then(module => ({ default: module.CartView })));
const AdminPanel = React.lazy(() => import('./components/AdminPanel').then(module => ({ default: module.AdminPanel })));
const ProductDetailModal = React.lazy(() => import('./components/ProductDetailModal').then(module => ({ default: module.ProductDetailModal })));
const LoginModal = React.lazy(() => import('./components/LoginModal').then(module => ({ default: module.LoginModal })));
const ProfileModal = React.lazy(() => import('./components/ProfileModal').then(module => ({ default: module.ProfileModal })));
const ZarinpalGatewayModal = React.lazy(() => import('./components/ZarinpalGatewayModal').then(module => ({ default: module.ZarinpalGatewayModal })));
const ProfileView = React.lazy(() => import('./components/ProfileView').then(module => ({ default: module.ProfileView })));
const SeoPages = React.lazy(() => import('./components/SeoPages').then(module => ({ default: module.SeoPages })));

const MainContent: React.FC = () => {
  const {
    viewMode,
    locationPath,
    selectedProduct,
    setSelectedProduct,
    isLoginModalOpen,
    isProfileModalOpen,
    isZarinpalModalOpen,
  } = useStore();
  const path = locationPath.replace(/\/$/, '') || '/';
  const isBrandCollection = path.startsWith('/collection/');
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

      {isLoginModalOpen && <LoginModal />}
      {isProfileModalOpen && <ProfileModal />}
      {isZarinpalModalOpen && <ZarinpalGatewayModal />}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-cyan-100 border-t-cyan-500 animate-spin" /></div>}>
        <MainContent />
      </React.Suspense>
    </StoreProvider>
  );
}
