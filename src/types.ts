export type Brand = 'نایک' | 'جردن' | 'آدیداس' | 'پوما' | 'بالنسیاگا' | 'کانورس';

export type Category = 'همه' | 'جردن' | 'نایک' | 'باشگاه' | 'رانینگ' | 'کلاسیک';

export interface ShoeColor {
  name: string;
  hex: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  nameFa: string;
  brand: Brand;
  category: Category;
  subtitle: string;
  priceToman: number;
  originalPriceToman?: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  colors: ShoeColor[];
  sizes: number[];
  inStock: boolean;
  stockCount: number;
  description: string;
  isPopular?: boolean;
  isSpecialOffer?: boolean;
  isHeroFeatured?: boolean;
  resellPriceRange?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: number;
  selectedColor: ShoeColor;
  quantity: number;
}

export interface Address {
  id: string;
  title: string;
  receiverName: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  phone: string;
  fullName: string;
  avatar: string;
  addresses: Address[];
  role: 'user' | 'admin';
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: number;
  colorName: string;
  priceToman: number;
  quantity: number;
}

export interface Order {
  id: string;
  trackingCode: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmountToman: number;
  shippingFeeToman: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: 'زری‌ن‌پال' | 'کارت به کارت';
}

export type ViewMode = 'home' | 'shop' | 'cart' | 'admin' | 'profile';
