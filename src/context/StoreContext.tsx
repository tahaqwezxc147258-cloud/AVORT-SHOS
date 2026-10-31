import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem, User, Order, Category, ViewMode, ShoeColor, OrderStatus, Address, Banner } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import api from '../api';

export type OtpResult = { success: boolean; message?: string; retryAfter?: number };

interface StoreContextType {
  products: Product[];
  banners: Banner[];
  isProductsLoading: boolean;
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  isLoggedIn: boolean;
  viewMode: ViewMode;
  locationPath: string;
  activeCategory: Category;
  searchQuery: string;
  selectedProduct: Product | null;
  orders: Order[];
  isLoginModalOpen: boolean;
  isProfileModalOpen: boolean;
  isZarinpalModalOpen: boolean;
  pendingOrder: Order | null;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  openBrandCollection: (brand: 'جردن' | 'نایک') => void;
  openWomenCollection: () => void;
  setActiveCategory: (cat: Category) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (p: Product | null) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  setIsZarinpalModalOpen: (open: boolean) => void;
  
  addToCart: (product: Product, size: number, color: ShoeColor, quantity?: number, withSpecialBox?: boolean) => Promise<void> | void;
  removeFromCart: (productId: string, size: number, colorName: string) => Promise<void> | void;
  updateCartQuantity: (productId: string, size: number, colorName: string, delta: number) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  
  requestOtp: (phone: string) => Promise<OtpResult>;
  verifyOtp: (phone: string, code: string) => Promise<OtpResult>;
  loginWithPhone: (phone: string, name?: string) => Promise<boolean>;
  updateUserProfile: (updatedFields: Partial<User>) => void;
  logout: () => void;
  
  initiateCheckout: (receiverName: string, phone: string, city: string, address: string, postalCode: string) => Promise<Order | null>;
  completeZarinpalPayment: (orderId: string, success: boolean) => Promise<boolean>;
  
  // Admin actions
  addProduct: (p: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  refreshOrders: () => Promise<void>;
  refreshBanners: () => Promise<void>;
  addBanner: (banner: Omit<Banner, 'id'>) => Promise<Banner>;
  updateBanner: (id: string, fields: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  updateProfile: (updates: Pick<User, 'fullName' | 'avatar'>) => Promise<void>;
  saveAddress: (address: Omit<Address, 'id'> & { id?: string }) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);
const PRODUCT_CACHE_KEY = 'noir_products';

const readCachedProducts = (): Product[] => {
  try {
    const cached = localStorage.getItem(PRODUCT_CACHE_KEY);
    if (!cached) return [];
    const parsed: unknown = JSON.parse(cached);
    if (Array.isArray(parsed)) return parsed as Product[];
    console.warn('Cached products have an invalid format.');
  } catch (error) {
    console.warn('Could not read cached products:', error);
  }
  return [];
};

const getPathFromViewMode = (mode: ViewMode) => {
  switch (mode) {
    case 'shop': return '/shop';
    case 'cart': return '/cart';
    case 'profile': return '/profile';
    case 'admin': return '/admin';
    case 'home':
    default: return '/';
  }
};

const getViewModeFromPath = (path: string): ViewMode => {
  const normalized = path.replace(/\/$/, '') || '/';
  if (normalized.startsWith('/collection/')) return 'shop';

  switch (normalized) {
    case '/shop': return 'shop';
    case '/cart': return 'cart';
    case '/profile': return 'profile';
    case '/admin': return 'admin';
    case '/':
    default: return 'home';
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(readCachedProducts);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(() => products.length === 0);
  const productsLoaded = useRef(false);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('noir_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('noir_user');
    if (!savedUser) return null;
    const parsedUser = JSON.parse(savedUser);
    return { ...parsedUser, addresses: Array.isArray(parsedUser.addresses) ? parsedUser.addresses : [] };
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const productUpdateTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingProductUpdates = useRef<Record<string, Partial<Product>>>({});

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('noir_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const ordersLoadedForToken = useRef<string | null>(null);

  const [viewMode, setViewModeState] = useState<ViewMode>(() => getViewModeFromPath(window.location.pathname));
  const [locationPath, setLocationPath] = useState(window.location.pathname);
  const [activeCategory, setActiveCategory] = useState<Category>('همه');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const selectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    const current = window.location.pathname;
    if (product) {
      const next = `/product/${encodeURIComponent(product.id)}`;
      if (current !== next) window.history.pushState({}, '', next);
    } else if (current.startsWith('/product/')) {
      window.history.pushState({}, '', '/shop');
    }
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isZarinpalModalOpen, setIsZarinpalModalOpen] = useState<boolean>(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  // Sync state with localStorage
  // persist token and user locally (consider HttpOnly cookie in future)
  useEffect(() => {
    if (token) localStorage.setItem('noir_token', token);
    else localStorage.removeItem('noir_token');
  }, [token]);

  const refreshOrders = async () => {
    if (!token) return;
    const res: any = await api.get('/orders');
    setOrders(res.orders || []);
  };
  const refreshBanners = async () => { const res: any = await api.get('/banners/all'); setBanners(res.banners || []); };
  const addBanner = async (banner: Omit<Banner, 'id'>) => { const res: any = await api.post('/banners', banner); const created = res.banner as Banner; setBanners(prev => [...prev, created].sort((a,b) => a.sortOrder - b.sortOrder)); return created; };
  const updateBanner = async (id: string, fields: Partial<Banner>) => { const res: any = await api.put(`/banners/${id}`, fields); setBanners(prev => prev.map(b => b.id === id ? { ...b, ...(res.banner || fields) } : b)); };
  const deleteBanner = async (id: string) => { await api.del(`/banners/${id}`); setBanners(prev => prev.filter(b => b.id !== id)); };

  useEffect(() => {
    if (user) localStorage.setItem('noir_user', JSON.stringify(user));
    else localStorage.removeItem('noir_user');
  }, [user]);

  useEffect(() => {
    if (!productsLoaded.current) return;
    try {
      const serialized = JSON.stringify(products);
      if (serialized.length > 1_500_000) {
        localStorage.removeItem(PRODUCT_CACHE_KEY);
        console.warn('Product cache was skipped because it exceeds the safe browser storage size.');
        return;
      }
      localStorage.setItem(PRODUCT_CACHE_KEY, serialized);
    } catch (error) {
      console.warn('Could not cache products:', error);
    }
  }, [products]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      setIsLoginModalOpen(true);
    };
    window.addEventListener('noir:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('noir:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const syncViewModeFromLocation = () => {
      setLocationPath(window.location.pathname);
      const nextViewMode = getViewModeFromPath(window.location.pathname);
      setViewModeState(prev => (prev === nextViewMode ? prev : nextViewMode));
    };

    syncViewModeFromLocation();
    window.addEventListener('popstate', syncViewModeFromLocation);

    return () => window.removeEventListener('popstate', syncViewModeFromLocation);
  }, []);
  useEffect(() => { api.get('/banners').then((res: any) => setBanners(res.banners || [])).catch(() => {}); }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    const nextPath = getPathFromViewMode(mode);
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

    if (currentPath !== nextPath) {
      window.history.pushState({}, '', nextPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const openBrandCollection = (brand: 'جردن' | 'نایک') => {
    const slug = brand === 'جردن' ? 'jordan' : 'nike';
    setActiveCategory(brand);
    setSearchQuery('');
    setViewModeState('shop');
    const nextPath = `/collection/${slug}`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const openWomenCollection = () => {
    setActiveCategory('همه');
    setSearchQuery('');
    setViewModeState('shop');
    const nextPath = '/collection/women';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // fetch products on mount
  useEffect(() => {
    let mounted = true;
    api.get('/products')
      .then((res: any) => {
        if (!mounted) return;
        const loadedProducts = res.products || [];
        productsLoaded.current = true;
        setProducts(loadedProducts);
        const match = window.location.pathname.match(/^\/product\/([^/]+)/);
        if (match) {
          const product = loadedProducts.find((item: Product) => item.id === decodeURIComponent(match[1]));
          if (product) setSelectedProduct(product);
        }
      })
      .catch(error => {
        console.error('Product refresh failed:', error);
        productsLoaded.current = true;
        if (products.length === 0) setProducts(INITIAL_PRODUCTS);
      })
      .finally(() => {
        if (mounted) setIsProductsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // when logged in, fetch cart and orders from server
  useEffect(() => {
    if (!token) return;
    let active = true;
    api.get('/me')
      .then((res: any) => {
        if (active && res.user) {
          setUser({ ...res.user, addresses: Array.isArray(res.user.addresses) ? res.user.addresses : [] });
        }
      })
      .catch(error => console.error('Profile refresh failed:', error));
    api.get('/cart')
      .then((res: any) => setCart(res.items || []))
      .catch(() => {});
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (!token || (viewMode !== 'profile' && viewMode !== 'admin') || ordersLoadedForToken.current === token) return;
    let active = true;
    api.get('/orders')
      .then((res: any) => {
        if (!active) return;
        setOrders(res.orders || []);
        ordersLoadedForToken.current = token;
      })
      .catch(error => console.error('Order refresh failed:', error));
    return () => { active = false; };
  }, [token, viewMode]);

  // Actions
  const addToCart = async (product: Product, size: number, color: ShoeColor, quantity = 1, withSpecialBox = false) => {
    const availableStock = Math.max(0, Number(product.stockCount) || 0);
    const existing = cart.find(item =>
      item.product.id === product.id &&
      item.selectedSize === size &&
      item.selectedColor.name === color.name
    );
    if (!product.inStock || availableStock < 1 || (existing?.quantity || 0) + quantity > availableStock) {
      alert(!product.inStock || availableStock < 1
        ? 'این محصول موجود نیست و امکان سفارش آن وجود ندارد.'
        : 'تعداد انتخاب‌شده بیشتر از موجودی محصول است.');
      return;
    }

    const specialBoxPrice = withSpecialBox && product.specialBoxAvailable ? (product.specialBoxPrice || 350000) : 0;
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === size && item.selectedColor.name === color.name
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + quantity, withSpecialBox, specialBoxPrice };
        return updated;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity, withSpecialBox, specialBoxPrice }];
    });

    if (token) {
      try {
        await api.post('/cart', { productId: product.id, quantity, selectedSize: size, colorName: color.name, withSpecialBox });
      } catch (error) {
        console.error('Adding product to cart failed:', error);
        try {
          const latest: any = await api.get('/cart');
          setCart(latest.items || []);
        } catch (refreshError) {
          console.error('Cart refresh failed:', refreshError);
        }
        alert(`افزودن محصول به سبد خرید انجام نشد: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
      }
    }
  };

  const removeFromCart = async (productId: string, size: number, colorName: string) => {
    setCart(prev => prev.filter(
      item => !(item.product.id === productId && item.selectedSize === size && item.selectedColor.name === colorName)
    ));
    if (token) {
      try {
        await api.del(`/cart/${productId}`, { selectedSize: size, colorName });
      } catch (error) {
        console.error('Removing cart item failed:', error);
        try {
          const latest: any = await api.get('/cart');
          setCart(latest.items || []);
        } catch (refreshError) {
          console.error('Cart refresh failed:', refreshError);
        }
        alert(`حذف محصول از سبد خرید انجام نشد: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
      }
    }
  };

  const updateCartQuantity = async (productId: string, size: number, colorName: string, delta: number) => {
    const item = cart.find(entry => entry.product.id === productId && entry.selectedSize === size && entry.selectedColor.name === colorName);
    if (!item) return;
    const nextQuantity = item.quantity + delta;
    const availableStock = Math.max(0, Number(item.product.stockCount) || 0);
    if (nextQuantity > availableStock) {
      alert('تعداد انتخاب‌شده بیشتر از موجودی محصول است.');
      return;
    }
    setCart(prev => prev.flatMap(entry => {
      if (entry.product.id !== productId || entry.selectedSize !== size || entry.selectedColor.name !== colorName) return [entry];
      return nextQuantity > 0 ? [{ ...entry, quantity: nextQuantity }] : [];
    }));

    if (token) {
      try {
        await api.post('/cart', { productId, quantity: delta, selectedSize: size, colorName });
      } catch (error) {
        console.error('Updating cart quantity failed:', error);
        try {
          const latest: any = await api.get('/cart');
          setCart(latest.items || []);
        } catch (refreshError) {
          console.error('Cart refresh failed:', refreshError);
        }
        alert(`به‌روزرسانی تعداد محصول انجام نشد: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    if (token) {
      try {
        await api.del('/cart');
      } catch (error) {
        console.error('Clearing cart failed:', error);
        try {
          const latest: any = await api.get('/cart');
          setCart(latest.items || []);
        } catch (refreshError) {
          console.error('Cart refresh failed:', refreshError);
        }
        alert(`خالی‌کردن سبد خرید انجام نشد: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
      }
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const requestOtp = async (phone: string): Promise<OtpResult> => {
    try {
      const res: any = await api.post('/request-otp', { phone });
      return { success: Boolean(res?.success), message: res?.message, retryAfter: res?.retryAfter };
    } catch (e) {
      const error = e as Error & { retryAfter?: number };
      return { success: false, message: error instanceof Error ? error.message.replace(/^\d+\s*/, '') : 'ارسال کد تأیید انجام نشد.', retryAfter: error.retryAfter };
    }
  };

  const verifyOtp = async (phone: string, code: string): Promise<OtpResult> => {
    const normalizedPhone = phone
      .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/[\s-]/g, '');
    try {
      const res: any = await api.post('/verify-otp', { phone, code });
      if (res && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        setIsLoginModalOpen(false);
        return { success: true };
      }
      return { success: false, message: 'پاسخ ورود معتبر نیست.' };
    } catch (e) {
      // Never create a fake local session in production: it cannot be
      // authorized by the API and causes every protected request to return 401.
      console.error('OTP verification failed:', e);
      return { success: false, message: e instanceof Error ? e.message.replace(/^\d+\s*/, '') : 'تأیید کد انجام نشد.' };
    }
  };

  const updateUserProfile = (updatedFields: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updatedFields };
    });
  };
  
  const initiateCheckout = async (receiverName: string, phone: string, city: string, address: string, postalCode: string): Promise<Order | null> => {
    if (cart.length === 0) return null;

    try {
      const orderRes: any = await api.post('/orders', {
        receiverName, phone, city, address, postalCode,
        items: cart.map(item => ({
          product: { ...item.product, images: [] },
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          withSpecialBox: item.withSpecialBox,
          quantity: item.quantity,
        })),
      });
      const order = orderRes.order || orderRes;
      const payRes: any = await api.post('/payments/create', { orderId: order.id });
      if (!payRes?.paymentUrl || payRes.orderId !== order.id) throw new Error('Payment session could not be created');
      window.location.assign(payRes.paymentUrl);
      return order;
    } catch (e) {
      console.error('Checkout error:', e);
      const message = e instanceof Error ? e.message.replace(/^\d+\s*/, '') : 'خطا در اتصال به درگاه پرداخت';
      alert(`پرداخت انجام نشد: ${message}`);
      return null;
    }
  };

  const completeZarinpalPayment = async (orderId: string, success: boolean): Promise<boolean> => {
    if (!pendingOrder || pendingOrder.id !== orderId) return false;

    // If logged in, ask the server to verify and update order state
    if (token) {
      try {
        const res: any = await api.post('/payments/verify', { orderId, success });
        const updatedOrder: Order = res.order || res;

        // refresh orders and cart from server
        try {
          const or: any = await api.get('/orders');
          setOrders(or.orders || []);
        } catch {}
        try {
          const cr: any = await api.get('/cart');
          setCart(cr.items || []);
        } catch {}

        setPendingOrder(null);
        setIsZarinpalModalOpen(false);
        setViewMode('home');
        return updatedOrder.status === 'PAID' || success;
      } catch (e) {
        console.error('Payment verification failed', e);
        // fallback to local handling below
      }
    }

    // Fallback: local-only mode (guest flow)
    if (success) {
      if (!token && pendingOrder.trackingCode) {
        try {
          await api.post(`/orders/${pendingOrder.id}/confirm`, { trackingCode: pendingOrder.trackingCode });
        } catch (error) {
          console.error('Guest order confirmation failed:', error);
        }
      }
      const paidOrder: Order = {
        ...pendingOrder,
        status: 'PAID'
      };

      setOrders(prev => [paidOrder, ...prev]);
      // reduce product stock
      setProducts(prevProducts => {
        return prevProducts.map(p => {
          const orderedItem = paidOrder.items.find(i => i.productId === p.id);
          if (orderedItem) {
            const newStock = Math.max(0, p.stockCount - orderedItem.quantity);
            return { ...p, stockCount: newStock, inStock: newStock > 0 };
          }
          return p;
        });
      });

      clearCart();
      setPendingOrder(null);
      setIsZarinpalModalOpen(false);
      setViewMode('home');
      return true;
    } else {
      setPendingOrder(null);
      setIsZarinpalModalOpen(false);
      return false;
    }
  };

  // Admin Actions
  const addProduct = async (p: Omit<Product, 'id'>) => {
    const res: any = await api.post('/products', p);
    const created = res.product || res;
    setProducts(prev => [...prev, created]);
    return created as Product;
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    pendingProductUpdates.current[id] = { ...(pendingProductUpdates.current[id] || {}), ...updatedFields };
    if (productUpdateTimers.current[id]) clearTimeout(productUpdateTimers.current[id]);
    productUpdateTimers.current[id] = setTimeout(async () => {
      const fields = pendingProductUpdates.current[id];
      delete pendingProductUpdates.current[id];
      try {
        const res: any = await api.put(`/products/${id}`, fields);
        const saved = res.product || res;
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...saved } : p));
      } catch (error) {
        console.error('Product update failed:', error);
        const latest: any = await api.get('/products').catch(() => null);
        if (latest?.products) setProducts(latest.products);
        alert(`ذخیره تغییرات محصول انجام نشد: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
      } finally {
        delete productUpdateTimers.current[id];
      }
    }, 450);
  };

  const deleteProduct = async (id: string) => {
    await api.del(`/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const deleteOrder = async (id: string) => {
    await api.del(`/orders/${id}`);
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    (async () => {
      try {
        await api.put(`/orders/${orderId}`, { status });
        const res: any = await api.get('/orders');
        setOrders(res.orders || []);
      } catch (e) {
        console.error('Order status update failed', e);
        alert(`تغییر وضعیت سفارش انجام نشد: ${e instanceof Error ? e.message : 'خطای ناشناخته'}`);
      }
    })();
  };

  const updateProfile = async (updates: Pick<User, 'fullName' | 'avatar'>) => {
    try {
      const res: any = await api.put('/me', updates);
      setUser(res.user || res);
    } catch {
      setUser(prev => prev ? { ...prev, ...updates } : prev);
    }
  };

  const saveAddress = async (address: Omit<Address, 'id'> & { id?: string }) => {
    try {
      const res: any = address.id ? await api.put(`/me/addresses/${address.id}`, address) : await api.post('/me/addresses', address);
      setUser(prev => prev ? { ...prev, addresses: res.addresses || prev.addresses } : prev);
    } catch {
      setUser(prev => {
        if (!prev) return prev;
        const next = { ...address, id: address.id || `address-${Date.now()}` } as Address;
        const addresses = address.id ? prev.addresses.map(item => item.id === address.id ? next : item) : [...prev.addresses, next];
        return { ...prev, addresses };
      });
    }
  };

  const removeAddress = async (addressId: string) => {
    try {
      const res: any = await api.del(`/me/addresses/${addressId}`);
      setUser(prev => prev ? { ...prev, addresses: res.addresses || prev.addresses.filter(a => a.id !== addressId) } : prev);
    } catch {
      setUser(prev => prev ? { ...prev, addresses: prev.addresses.filter(a => a.id !== addressId) } : prev);
    }
  };

  // exposed auth helpers
  const loginWithPhone = async (phone: string): Promise<boolean> => (await requestOtp(phone)).success;

  return (
    <StoreContext.Provider
      value={{
        products,
        banners,
        isProductsLoading,
        cart,
        wishlist,
        user,
        isLoggedIn: !!user,
        viewMode,
        locationPath,
        activeCategory,
        searchQuery,
        selectedProduct,
        orders,
        isLoginModalOpen,
        isProfileModalOpen,
        isZarinpalModalOpen,
        pendingOrder,
        setViewMode,
        openBrandCollection,
        openWomenCollection,
        setActiveCategory,
        setSearchQuery,
        setSelectedProduct: selectProduct,
        setIsLoginModalOpen,
        setIsProfileModalOpen,
        setIsZarinpalModalOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        requestOtp,
        verifyOtp,
        loginWithPhone,
        updateUserProfile,
        logout: () => { setToken(null); setUser(null); },
        initiateCheckout,
        completeZarinpalPayment,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteOrder,
        updateOrderStatus
        ,refreshOrders
        ,refreshBanners, addBanner, updateBanner, deleteBanner
        ,updateProfile
        ,saveAddress
        ,removeAddress
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
