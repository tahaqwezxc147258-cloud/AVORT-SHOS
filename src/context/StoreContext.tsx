import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem, User, Order, Category, ViewMode, ShoeColor, OrderStatus, Address } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import api from '../api';

export type OtpResult = { success: boolean; message?: string; retryAfter?: number };

interface StoreContextType {
  products: Product[];
  isProductsLoading: boolean;
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  isLoggedIn: boolean;
  viewMode: ViewMode;
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
  openBrandCollection: (brand: 'Ø¬Ø±Ø¯Ù†' | 'Ù†Ø§ÛŒÚ©') => void;
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
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  refreshOrders: () => Promise<void>;
  updateProfile: (updates: Pick<User, 'fullName' | 'avatar'>) => Promise<void>;
  saveAddress: (address: Omit<Address, 'id'> & { id?: string }) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('noir_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('noir_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const productUpdateTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('noir_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>([]);

  const [viewMode, setViewModeState] = useState<ViewMode>(() => getViewModeFromPath(window.location.pathname));
  const [activeCategory, setActiveCategory] = useState<Category>('همه');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  useEffect(() => {
    if (user) localStorage.setItem('noir_user', JSON.stringify(user));
    else localStorage.removeItem('noir_user');
  }, [user]);

  useEffect(() => {
    const syncViewModeFromLocation = () => {
      const nextViewMode = getViewModeFromPath(window.location.pathname);
      setViewModeState(prev => (prev === nextViewMode ? prev : nextViewMode));
    };

    syncViewModeFromLocation();
    window.addEventListener('popstate', syncViewModeFromLocation);

    return () => window.removeEventListener('popstate', syncViewModeFromLocation);
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    const nextPath = getPathFromViewMode(mode);
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

    if (currentPath !== nextPath) {
      window.history.pushState({}, '', nextPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const openBrandCollection = (brand: 'Ø¬Ø±Ø¯Ù†' | 'Ù†Ø§ÛŒÚ©') => {
    const slug = brand === 'Ø¬Ø±Ø¯Ù†' ? 'jordan' : 'nike';
    setActiveCategory(brand);
    setSearchQuery('');
    setViewModeState('shop');
    const nextPath = `/collection/${slug}`;
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
        setProducts(res.products || []);
      })
      .catch(() => {
        setProducts(INITIAL_PRODUCTS);
      })
      .finally(() => {
        if (mounted) setIsProductsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // when logged in, fetch cart and orders from server
  useEffect(() => {
    if (!token) return;
    api.get('/cart')
      .then((res: any) => setCart(res.items || []))
      .catch(() => {});
    api.get('/orders')
      .then((res: any) => setOrders(res.orders || []))
      .catch(() => {});
  }, [token]);

  // Actions
  const addToCart = async (product: Product, size: number, color: ShoeColor, quantity = 1, withSpecialBox = false) => {
    const specialBoxPrice = withSpecialBox && product.specialBoxAvailable ? (product.specialBoxPrice || 350000) : 0;
    if (token) {
      try {
        const res = await api.post('/cart', { productId: product.id, quantity, selectedSize: size, colorName: color.name, withSpecialBox });
        setCart(res.items || []);
      } catch {
        // fallback to client-side
        setCart(prev => [...prev, { product, selectedSize: size, selectedColor: color, quantity, withSpecialBox, specialBoxPrice }]);
      }
    } else {
      setCart(prev => {
        const existingIndex = prev.findIndex(
          item => item.product.id === product.id && item.selectedSize === size && item.selectedColor.name === color.name
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        } else {
          return [...prev, { product, selectedSize: size, selectedColor: color, quantity, withSpecialBox, specialBoxPrice }];
        }
      });
    }
  };

  const removeFromCart = async (productId: string, size: number, colorName: string) => {
    if (token) {
      try {
        await api.del(`/cart/${productId}`);
        const res = await api.get('/cart');
        setCart(res.items || []);
        return;
      } catch {
        // fallback
      }
    }
    setCart(prev => prev.filter(
      item => !(item.product.id === productId && item.selectedSize === size && item.selectedColor.name === colorName)
    ));
  };

  const updateCartQuantity = async (productId: string, size: number, colorName: string, delta: number) => {
    if (token) {
      try {
        // naive: set quantity by sending quantity delta; backend replaces quantity
        const item = cart.find(entry => entry.product.id === productId && entry.selectedSize === size && entry.selectedColor.name === colorName);
        const res = await api.post('/cart', { productId, quantity: delta, selectedSize: size, colorName, currentQuantity: item?.quantity });
        setCart(res.items || []);
        return;
      } catch {
        // fallback
      }
    }
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.selectedSize === size && item.selectedColor.name === colorName) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const clearCart = async () => {
    if (token) {
      try {
        await api.del('/cart');
        setCart([]);
        return;
      } catch {}
    }
    setCart([]);
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

      const subtotal = cart.reduce((sum, item) => sum + ((item.product.priceToman + (item.withSpecialBox ? (item.product.specialBoxPrice || 350000) : 0)) * item.quantity), 0);
    const shippingFee = subtotal >= 10000000 ? 0 : 85000;

    // Create every order on the server so the admin CRM can see member and guest orders.
    try {
      const orderRes: any = await api.post('/orders', {
        receiverName, phone, city, address, postalCode,
        items: token ? undefined : cart.map(item => ({
          product: item.product,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          withSpecialBox: item.withSpecialBox,
          quantity: item.quantity,
        })),
      });
      const order = orderRes.order || orderRes;
      if (true) {
        const payRes: any = await api.post('/payments/create', { orderId: order.id });
        if (!payRes?.paymentUrl || payRes.orderId !== order.id) throw new Error('Payment session could not be created');
        window.location.assign(payRes.paymentUrl);
        return order;
      }
      setPendingOrder(order);
      setIsZarinpalModalOpen(true);
      return order;
    } catch (e) {
      console.error('Checkout error:', e);
      const message = e instanceof Error ? e.message.replace(/^\d+\s*/, '') : 'خطا در اتصال به درگاه پرداخت';
      alert(`پرداخت انجام نشد: ${message}`);
    }

    /* Legacy local fallback for offline/demo mode. */
    if (token) {
      try {
        // create order on server (server uses server-side cart)
        const orderRes: any = await api.post('/orders', { receiverName, phone, city, address, postalCode });
        const order = orderRes.order || orderRes;

        // create payment
        const payRes: any = await api.post('/payments/create', { orderId: order.id });
        if (!payRes?.paymentUrl || payRes.orderId !== order.id) throw new Error('Payment session could not be created');
        window.location.assign(payRes.paymentUrl);
        return order;
        setPendingOrder(order);
        setIsZarinpalModalOpen(true);
        return order;
      } catch (e) {
        console.error('Checkout error', e);
      }
      return null;
    }

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingCode: `AVORI-${Date.now().toString().slice(-7)}`,
      userId: user?.id || 'guest',
      customerName: receiverName,
      customerPhone: phone,
      city,
      postalCode,
      shippingAddress: `${city}، ${address} (کدپستی: ${postalCode})`,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.nameFa,
        productImage: item.product.images[0],
        size: item.selectedSize,
        colorName: item.selectedColor.name,
        priceToman: item.product.priceToman,
        quantity: item.quantity
      })),
      totalAmountToman: subtotal + shippingFee,
      shippingFeeToman: shippingFee,
      status: 'PENDING_PAYMENT',
      createdAt: new Date().toLocaleDateString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'زری‌ن‌پال'
    };

    setPendingOrder(newOrder);
    setIsZarinpalModalOpen(true);
    return newOrder;
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
    const list: any = await api.get('/products');
    setProducts(list.products || []);
    return res.product || res;
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    if (productUpdateTimers.current[id]) clearTimeout(productUpdateTimers.current[id]);
    productUpdateTimers.current[id] = setTimeout(async () => {
      try {
        await api.put(`/products/${id}`, updatedFields);
      } catch (error) {
        console.error('Product update failed:', error);
      }
    }, 450);
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.del(`/products/${id}`);
      const list: any = await api.get('/products');
      setProducts(list.products || []);
    } catch (e) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    (async () => {
      try {
        await api.put(`/orders/${orderId}`, { status });
        const res: any = await api.get('/orders');
        setOrders(res.orders || []);
      } catch (e) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
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
  const loginWithPhone = requestOtp;

  return (
    <StoreContext.Provider
      value={{
        products,
        isProductsLoading,
        cart,
        wishlist,
        user,
        isLoggedIn: !!user,
        viewMode,
        activeCategory,
        searchQuery,
        selectedProduct,
        orders,
        isLoginModalOpen,
        isZarinpalModalOpen,
        pendingOrder,
        setViewMode,
        openBrandCollection,
        setActiveCategory,
        setSearchQuery,
        setSelectedProduct,
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
        updateOrderStatus
        ,refreshOrders
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
