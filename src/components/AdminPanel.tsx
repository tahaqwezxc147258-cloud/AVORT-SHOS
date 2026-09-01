import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldAlert, Plus, Trash2, Edit3, Package, DollarSign, ShoppingBag, CheckCircle, Save, Image as ImageIcon, Search, RefreshCw, Clock3 } from 'lucide-react';
import { Brand, Category, OrderStatus, Product, ProductGender } from '../types';
import { BannerManager } from './BannerManager';

export const AdminPanel: React.FC = () => {
  const { user, products, orders, addProduct, updateProduct, deleteProduct, deleteOrder, updateOrderStatus, refreshOrders, setIsLoginModalOpen } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'add-product' | 'banners'>('products');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSort, setOrderSort] = useState<'newest' | 'oldest'>('newest');
  const [orderError, setOrderError] = useState('');
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

  // New Product Form State
  const [name, setName] = useState('');
  const [nameFa, setNameFa] = useState('');
  const [brand, setBrand] = useState<Brand>('جردن');
  const [category, setCategory] = useState<Category>('جردن');
  const [gender, setGender] = useState<ProductGender>('یونیسکس');
  const [subtitle, setSubtitle] = useState('کتانی تخصصی و اورجینال');
  const [priceToman, setPriceToman] = useState<number>(11000000);
  const [imageUrls, setImageUrls] = useState('https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800');
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [stockCount, setStockCount] = useState<number>(10);
  const [isHeroFeatured, setIsHeroFeatured] = useState(false);
  const [description, setDescription] = useState('طراحی رترو با چرم طبیعی درجه یک و بالشتک Nike Air...');
  const [specialBoxAvailable, setSpecialBoxAvailable] = useState(false);
  const [specialBoxPrice, setSpecialBoxPrice] = useState(350000);

  const productImageUrls = selectedImageFiles.length > 0
    ? imagePreviews
    : imageUrls
        .split(/[,\n]/)
        .map((url) => url.trim())
        .filter(Boolean);

  const rawFileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error('خطا در خواندن فایل تصویر'));
    reader.readAsDataURL(file);
  });

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        // Vercel serverless requests have a small payload limit. Do not send
        // original camera-sized images as base64 in the product JSON.
        const maxDimension = 1400;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) return resolve(reader.result as string);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = pixels;
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];
        for (let x = 0; x < width; x += 1) queue.push(x, (height - 1) * width + x);
        for (let y = 1; y < height - 1; y += 1) queue.push(y * width, y * width + width - 1);
        const isBackground = (index: number) => data[index * 4 + 3] > 0 && data[index * 4] > 238 && data[index * 4 + 1] > 238 && data[index * 4 + 2] > 238;
        while (queue.length) {
          const index = queue.pop() as number;
          if (index < 0 || index >= width * height || visited[index] || !isBackground(index)) continue;
          visited[index] = 1;
          data[index * 4 + 3] = 0;
          const x = index % width;
          if (x > 0) queue.push(index - 1);
          if (x < width - 1) queue.push(index + 1);
          if (index >= width) queue.push(index - width);
          if (index < width * (height - 1)) queue.push(index + width);
        }
        context.putImageData(pixels, 0, 0);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      image.onerror = () => resolve(reader.result as string);
      image.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Unable to read image'));
    reader.readAsDataURL(file);
  });

  const handleImageFilesChange = (files: FileList | null) => {
    const fileArray = files ? Array.from(files) : [];
    if (fileArray.length === 0) return;

    // Keep previously selected images when the user adds more files later.
    setSelectedImageFiles((previous) => [...previous, ...fileArray]);
    setImageUrls('');
    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setImagePreviews((previous) => [...previous, ...previews]);
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Available Sizes and Colors Selection
  const allPossibleSizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];
  const [selectedSizes, setSelectedSizes] = useState<number[]>([40, 41, 42, 43, 44, 45]);

  const presetColors = [
    { name: 'مشکی', hex: '#0f172a' },
    { name: 'سفید', hex: '#ffffff' },
    { name: 'فیروزه‌ای', hex: '#06b6d4' },
    { name: 'قرمز', hex: '#ef4444' },
    { name: 'آبی', hex: '#3b82f6' },
    { name: 'طوسی', hex: '#64748b' },
    { name: 'کرم', hex: '#fef3c7' },
    { name: 'سبز', hex: '#10b981' },
    { name: 'زرد', hex: '#eab308' },
  ];
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: 'مشکی', hex: '#0f172a' },
    { name: 'فیروزه‌ای', hex: '#06b6d4' }
  ]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#1e293b');

  const toggleSize = (size: number) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter(s => s !== size));
      }
    } else {
      setSelectedSizes([...selectedSizes, size].sort((a, b) => a - b));
    }
  };

  const toggleColor = (c: { name: string; hex: string }) => {
    const exists = selectedColors.some(col => col.name === c.name);
    if (exists) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter(col => col.name !== c.name));
      }
    } else {
      setSelectedColors([...selectedColors, c]);
    }
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    if (!selectedColors.some(c => c.name === customColorName.trim())) {
      setSelectedColors([...selectedColors, { name: customColorName.trim(), hex: customColorHex }]);
    }
    setCustomColorName('');
  };

  // Permission Guard: rely on server-side role
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    const timer = window.setInterval(() => { reloadOrders().catch(() => {}); }, 15000);
    return () => window.clearInterval(timer);
  }, [isAdmin]);

  const reloadOrders = async () => {
    if (!isAdmin) return;
    setIsRefreshingOrders(true);
    setOrderError('');
    try {
      await refreshOrders();
    } catch (error) { setOrderError(error instanceof Error ? error.message : 'خطا در دریافت سفارش‌ها'); }
    finally { setIsRefreshingOrders(false); }
  };


  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-lg shadow-rose-100">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">دسترسی به پنل مدیریت امکان‌پذیر نیست</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          برای دسترسی به پنل مدیریت، باید با یک حساب کاربری دارای نقش `admin` وارد شوید. دسترسی و نقش‌ها توسط سرور مدیریت می‌شوند.
        </p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="bg-cyan-500 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-cyan-500/25 active:scale-95 transition-all text-xs"
        >
          ورود
        </button>
      </div>
    );
  }

  // Stats calculation
  const totalSales = orders.reduce((sum, o) => o.status !== 'CANCELLED' ? sum + o.totalAmountToman : sum, 0);
  const paidOrdersCount = orders.filter(o => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED').length;
  const successfulOrders = orders.filter(o => ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'].includes(o.status));
  const lowStockCount = products.filter(p => p.stockCount <= 3).length;
  const visibleOrders = [...orders]
    .filter(o => orderStatusFilter === 'ALL' || o.status === orderStatusFilter)
    .filter(o => `${o.customerName} ${o.customerPhone} ${o.id} ${o.trackingCode}`.toLowerCase().includes(orderSearch.toLowerCase()))
    .sort((a, b) => orderSort === 'newest' ? String(b.createdAt).localeCompare(String(a.createdAt)) : String(a.createdAt).localeCompare(String(b.createdAt)));

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nameFa || !priceToman || productImageUrls.length === 0) {
      alert('لطفا نام، قیمت و حداقل یک تصویر محصول را وارد کنید.');
      return;
    }

    const finalImages = selectedImageFiles.length > 0
      ? await Promise.all(selectedImageFiles.map(fileToDataUrl))
      : productImageUrls;

    try {
      await addProduct({
      name,
      nameFa,
      brand,
      category,
      gender,
      subtitle,
      priceToman: Number(priceToman),
      originalPriceToman: Number(priceToman) + 1500000,
      rating: 5.0,
      reviewsCount: 1,
      images: finalImages,
      colors: selectedColors.length > 0 ? selectedColors : [{ name: 'مشکی', hex: '#0f172a' }],
      sizes: selectedSizes.length > 0 ? selectedSizes : [40, 41, 42, 43, 44, 45],
      inStock: stockCount > 0,
      stockCount: Number(stockCount),
      description,
      specialBoxAvailable,
      specialBoxPrice,
      isHeroFeatured
      });
    } catch (error) {
      console.error('Product creation failed:', error);
      const detail = error instanceof Error ? error.message : 'خطای ناشناخته';
      alert(`ذخیره محصول انجام نشد: ${detail}`);
      return;
    }

    alert('محصول جدید با موفقیت به فروشگاه اضافه شد.');
    setName('');
    setNameFa('');
    setImageUrls('');
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setIsHeroFeatured(false);
    setActiveTab('products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header & Stats Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">پنل مدیریت فروشگاه اِی‌وُرت</h1>
              <p className="text-xs text-cyan-400 font-bold">مدیریت محصولات، موجودی انبار و وضعیت سفارشات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'products' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              لیست محصولات ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'orders' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              سفارشات ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('add-product')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'add-product' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>افزودن محصول</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
            <span className="text-xs text-slate-400 block font-bold">مجموع کل فروش</span>
            <span className="text-xl font-black text-cyan-400 mt-1 block">
              {totalSales.toLocaleString('fa-IR')} <span className="text-xs font-bold text-slate-300">تومان</span>
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
            <span className="text-xs text-slate-400 block font-bold">سفارشات موفق</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {paidOrdersCount} سفارش
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
            <span className="text-xs text-slate-400 block font-bold">تعداد مدلهای کتانی</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">
              {products.length} مدل
            </span>
          </div>
        </div>
      </div>

      <button onClick={() => setActiveTab('banners')} className="rounded-xl bg-cyan-50 px-4 py-2 text-xs font-bold text-cyan-700">مدیریت بنرها</button>

      {/* TAB 1: Products Table */}
      {activeTab === 'banners' && <BannerManager />}

      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-cyan-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">مدیریت کاتالوگ محصولات</h2>
              <p className="text-xs text-slate-500 mt-0.5">ویرایش سریع تصویر، نام لاتین و فارسی، قیمت و موجودی انبار</p>
            </div>
            <button
              onClick={() => setActiveTab('add-product')}
              className="bg-cyan-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1 shadow-md hover:bg-cyan-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن محصول جدید</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-100">
                <tr>
                  <th className="p-3">تصویر محصول</th>
                  <th className="p-3">نام فارسی و انگلیسی</th>
                  <th className="p-3">سایزهای موجود (کلیک برای فعال/غیرفعال)</th>
                  <th className="p-3">رنگ‌های موجود</th>
                  <th className="p-3">قیمت (تومان)</th>
                  <th className="p-3">موجودی انبار</th>
                  <th className="p-3 text-center">بنر اصلی</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    {/* Image preview + Image URL Editor */}
                    <td className="p-3 max-w-[180px]">
                      <div className="flex items-center gap-2">
                        <img src={p.images[0]} alt="" className="w-12 h-12 object-contain bg-slate-50 rounded-xl p-1 border border-slate-200 shrink-0" />
                        <input
                          type="text"
                          value={(p.images || []).join('\n')}
                          onChange={(e) => updateProduct(p.id, { images: e.target.value.split(/[\n,]/).map(url => url.trim()).filter(Boolean) })}
                          placeholder="آدرس عکس..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] dir-ltr text-left"
                          title="برای تغییر عکس، لینک جدید را جایگزین کنید"
                        />
                      </div>
                    </td>

                    {/* Name & NameFa Editor */}
                    <td className="p-3 space-y-1 max-w-[180px]">
                      <input
                        type="text"
                        value={p.nameFa}
                        onChange={(e) => updateProduct(p.id, { nameFa: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-bold text-xs"
                        placeholder="نام فارسی"
                      />
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 dir-ltr text-right text-[11px]"
                        placeholder="English Name"
                      />
                    </td>

                    <td className="p-3 min-w-[150px]"><label className="flex items-center gap-2 text-[10px] font-bold"><input type="checkbox" checked={Boolean(p.specialBoxAvailable)} onChange={e => updateProduct(p.id, { specialBoxAvailable: e.target.checked, specialBoxPrice: p.specialBoxPrice || 350000 })} className="accent-amber-500" /> جعبه خاص</label><input type="number" value={p.specialBoxPrice || 350000} onChange={e => updateProduct(p.id, { specialBoxPrice: Number(e.target.value) })} className="mt-2 w-28 rounded-lg border border-slate-200 px-2 py-1 text-[10px]" /></td>

                    {/* Sizes Toggle Column */}
                    <td className="p-3 max-w-[220px]">
                      <div className="flex flex-wrap gap-1">
                        {allPossibleSizes.map((sz) => {
                          const isAvailable = (p.sizes || []).includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                const current = p.sizes || [];
                                let next: number[];
                                if (isAvailable) {
                                  if (current.length <= 1) return;
                                  next = current.filter(s => s !== sz);
                                } else {
                                  next = [...current, sz].sort((a, b) => a - b);
                                }
                                updateProduct(p.id, { sizes: next });
                              }}
                              className={`w-6 h-6 rounded-md font-black text-[10px] transition-all cursor-pointer ${
                                isAvailable
                                  ? 'bg-cyan-500 text-white shadow-xs scale-105'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                              title={isAvailable ? `غیرفعال‌سازی سایز ${sz}` : `فعال‌سازی سایز ${sz}`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Colors Editor Column */}
                    <td className="p-3 max-w-[200px]">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1">
                          {(p.colors || []).map((c) => (
                            <span
                              key={c.name}
                              className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-slate-800"
                            >
                              <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: c.hex }} />
                              <span>{c.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if ((p.colors || []).length <= 1) return;
                                  const nextColors = (p.colors || []).filter(col => col.name !== c.name);
                                  updateProduct(p.id, { colors: nextColors });
                                }}
                                className="text-slate-400 hover:text-rose-500 font-black text-[9px] mr-0.5"
                                title="حذف این رنگ"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Quick Color Add Dropdown */}
                        <select
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const found = presetColors.find(pc => pc.name === val);
                            if (found && !(p.colors || []).some(c => c.name === found.name)) {
                              updateProduct(p.id, { colors: [...(p.colors || []), found] });
                            }
                          }}
                          className="w-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-bold rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                        >
                          <option value="">+ افزودن رنگ جدید...</option>
                          {presetColors.map((pc) => (
                            <option key={pc.name} value={pc.name}>
                              {pc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Price Editor */}
                    <td className="p-3">
                      <input
                        type="number"
                        value={p.priceToman}
                        onChange={(e) => updateProduct(p.id, { priceToman: Number(e.target.value) })}
                        className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-extrabold text-xs"
                      />
                    </td>

                    {/* Stock Editor */}
                    <td className="p-3">
                      <input
                        type="number"
                        value={p.stockCount}
                        onChange={(e) => updateProduct(p.id, { stockCount: Number(e.target.value), inStock: Number(e.target.value) > 0 })}
                        className="w-14 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center text-xs font-bold"
                      />
                    </td>

                    {/* Hero carousel toggle */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => updateProduct(p.id, { isHeroFeatured: !p.isHeroFeatured })}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors ${
                          p.isHeroFeatured
                            ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title={p.isHeroFeatured ? 'حذف از اسلایدر بنر' : 'نمایش در اسلایدر بنر'}
                      >
                        {p.isHeroFeatured ? 'فعال' : 'غیرفعال'}
                      </button>
                    </td>

                    {/* Delete action */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`آیا از حذف محصول ${p.nameFa} اطمینان دارید؟`)) {
                            deleteProduct(p.id).catch((error) => {
                              console.error('Product deletion failed:', error);
                              const detail = error instanceof Error ? error.message : 'خطای ناشناخته';
                              alert(`حذف محصول انجام نشد: ${detail}`);
                            });
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 p-2 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                        title="حذف محصول"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Order Management */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-cyan-100 shadow-sm space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-slate-900 p-4 text-white"><span className="text-xs text-slate-300">فروش موفق</span><strong className="mt-2 block text-lg">{successfulOrders.reduce((s, o) => s + o.totalAmountToman, 0).toLocaleString('fa-IR')} تومان</strong></div>
            <div className="rounded-2xl bg-amber-50 p-4 text-amber-900"><span className="text-xs">در انتظار پرداخت</span><strong className="mt-2 block text-lg">{orders.filter(o => o.status === 'PENDING_PAYMENT').length} سفارش</strong></div>
            <div className="rounded-2xl bg-cyan-50 p-4 text-cyan-900"><span className="text-xs">آماده‌سازی</span><strong className="mt-2 block text-lg">{orders.filter(o => o.status === 'PREPARING').length} سفارش</strong></div>
            <div className="rounded-2xl bg-rose-50 p-4 text-rose-900"><span className="text-xs">موجودی کم</span><strong className="mt-2 block text-lg">{lowStockCount} محصول</strong></div>
          </div>
          <div className="flex flex-wrap gap-2"><div className="relative flex-1 min-w-[220px]"><Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" /><input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="جست‌وجوی نام، تلفن یا کد..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-9 pl-3 text-xs" /></div><select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold"><option value="ALL">همه وضعیت‌ها</option><option value="PENDING_PAYMENT">در انتظار پرداخت</option><option value="PAID">پرداخت موفق</option><option value="PREPARING">در حال آماده‌سازی</option><option value="SHIPPED">ارسال‌شده</option><option value="DELIVERED">تحویل‌شده</option><option value="CANCELLED">لغوشده</option></select><button onClick={() => reloadOrders().catch(() => {})} className="flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700"><RefreshCw className="h-4 w-4" />بروزرسانی</button></div>
          <h2 className="font-extrabold text-slate-900 text-base">مدیریت سفارشات خریداران</h2>

          <div className="space-y-4">
            {visibleOrders.map((o) => (
              <div key={o.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-extrabold text-slate-900">خریدار: {o.customerName} ({o.customerPhone})</span>
                    <span className="text-slate-500 mr-3">کد پیگیری: {o.trackingCode}</span>
                  </div>

                  {/* Change Order Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">تغییر وضعیت:</span>
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1 font-bold text-xs text-slate-800"
                    >
                      <option value="PENDING_PAYMENT">در انتظار پرداخت</option>
                      <option value="PAID">پرداخت موفق (آماده‌سازی)</option>
                      <option value="PREPARING">در حال آماده‌سازی در انبار</option>
                      <option value="SHIPPED">تحویل به پست (ارسال شده)</option>
                      <option value="DELIVERED">تحویل داده شد</option>
                    </select>
                    <button type="button" onClick={() => { if (confirm('حذف این سفارش انجام شود؟')) deleteOrder(o.id).catch((e) => alert(`حذف سفارش انجام نشد: ${e instanceof Error ? e.message : 'خطا'}`)); }} className="rounded-xl bg-rose-50 p-2 text-rose-600" title="حذف سفارش"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="text-slate-600 font-bold">آدرس تحویل: {o.city || '—'}، {o.shippingAddress} · کدپستی: {o.postalCode || '—'}</div>
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  {(o.items || []).map((item, index) => (
                    <div key={`${o.id}-${item.productId}-${index}`} className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-2 border border-slate-100">
                      <img src={item.productImage} alt="" className="h-14 w-14 rounded-lg bg-slate-50 object-contain" />
                      <div className="min-w-[150px] flex-1"><p className="font-black text-slate-900">{item.productName}</p><p className="text-[10px] text-slate-500">{item.productNameEn || ''} · برند: {item.brand || '—'}</p></div>
                      <span className="rounded-lg bg-slate-100 px-2 py-1 font-black">سایز {item.size}</span>
                      <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 font-black"><i className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: item.colorHex || '#cbd5e1' }} />{item.colorName}</span>
                      <span className="font-black">×{item.quantity}</span><span className="font-black text-cyan-700">{(item.priceToman * item.quantity).toLocaleString('fa-IR')} تومان</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1 font-black text-sm text-slate-900">
                  <span>مبلغ فاکتور: {o.totalAmountToman.toLocaleString('fa-IR')} تومان</span>
                  <span className="text-cyan-600 font-bold text-xs">روش پرداخت: {o.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Add New Product */}
      {activeTab === 'add-product' && (
        <div className="bg-white rounded-3xl p-6 border border-cyan-100 shadow-sm space-y-6">
          <h2 className="font-extrabold text-slate-900 text-base">افزودن محصول جدید به فروشگاه</h2>

          <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">نام انگلیسی (English Title) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Air Jordan 1 Low Golf"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">نام فارسی محصول *</label>
              <input
                type="text"
                required
                placeholder="مانند: ایر جردن ۱ لو گلف"
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">برند *</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as Brand)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
              >
                <option value="جردن">جردن</option>
                <option value="نایک">نایک</option>
                <option value="آدیداس">آدیداس</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">جنسیت محصول *</label>
              <select value={gender} onChange={e => setGender(e.target.value as ProductGender)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900">
                <option value="مردانه">مردانه</option><option value="زنانه">زنانه</option><option value="یونیسکس">یونیسکس</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">قیمت به تومان *</label>
              <input
                type="number"
                required
                value={priceToman}
                onChange={(e) => setPriceToman(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 mb-1">آپلود تصاویر محصول *</label>
              <div className="space-y-3">
                <label className="group flex flex-col gap-2 border border-dashed border-slate-300 rounded-3xl p-4 text-center cursor-pointer hover:border-cyan-400 transition-colors bg-slate-50">
                  <span className="text-slate-600 text-sm font-bold">برای انتخاب چند تصویر، کلیک کنید یا فایل‌ها را بکشید و رها کنید.</span>
                  <span className="text-xs text-slate-400">برای نمایش حرفه‌ای در بنر، عکس کفش را به‌صورت PNG یا WebP شفاف (بدون پس‌زمینه) آپلود کنید. JPG پس‌زمینه را حفظ می‌کند.</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageFilesChange(e.target.files)}
                    className="hidden"
                  />
                </label>

                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={preview} className="relative rounded-3xl overflow-hidden border border-slate-200 bg-transparent">
                    <img src={preview} alt={`پیش‌نمایش تصویر ${index + 1}`} className="h-24 w-full object-contain bg-transparent p-1" />
                        <button
                          type="button"
                          onClick={() => {
                            const nextFiles = selectedImageFiles.filter((_, idx) => idx !== index);
                            const nextPreviews = imagePreviews.filter((_, idx) => idx !== index);
                            setSelectedImageFiles(nextFiles);
                            setImagePreviews(nextPreviews);
                          }}
                          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center text-sm"
                          title="حذف تصویر"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-4 text-center text-slate-500 text-[11px] bg-slate-50">
                    تصویری انتخاب نشده است. اگر می‌خواهید از لینک استفاده کنید، می‌توانید در اینجا کپی کنید، ولی آپلود فایل اولویت دارد.
                  </div>
                )}
              </div>
            </div>

            <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 cursor-pointer">
              <div>
                <span className="block text-slate-900 font-extrabold">نمایش در بنر اصلی</span>
                <span className="block mt-1 text-[11px] text-slate-500">محصول در اسلایدر صفحهٔ اصلی نمایش داده می‌شود.</span>
              </div>
              <input
                type="checkbox"
                checked={isHeroFeatured}
                onChange={(e) => setIsHeroFeatured(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 cursor-pointer">
              <div><span className="block text-slate-900 font-extrabold">امکان ارسال با جعبه خاص</span><span className="block mt-1 text-[11px] text-slate-600">جعبه خاص به همراه جعبه عادی ارسال می‌شود.</span></div>
              <input type="checkbox" checked={specialBoxAvailable} onChange={e => setSpecialBoxAvailable(e.target.checked)} className="w-5 h-5 accent-amber-500" />
            </label>
            <div><label className="block text-slate-700 mb-1">هزینه جعبه خاص (تومان)</label><input type="number" value={specialBoxPrice} onChange={e => setSpecialBoxPrice(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900" /></div>

            <div>
              <label className="block text-slate-700 mb-1">تعداد موجودی اولیه</label>
              <input
                type="number"
                value={stockCount}
                onChange={(e) => setStockCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            {/* Select Available Sizes */}
            <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <label className="block text-slate-900 font-extrabold text-xs">
                سایزهای موجود (برای فعال/غیرفعال کردن روی سایزها کلیک کنید):
              </label>
              <div className="flex flex-wrap gap-2">
                {allPossibleSizes.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                        isSelected
                          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 scale-105'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500">
                سایزهای انتخاب‌شده: {selectedSizes.join('، ')}
              </p>
            </div>

            {/* Select Available Colors */}
            <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="block text-slate-900 font-extrabold text-xs">
                رنگ‌های موجود (انتخاب رنگ‌های پیشنهادی یا افزودن رنگ جدید):
              </label>
              
              {/* Preset Colors */}
              <div className="flex flex-wrap gap-2">
                {presetColors.map((c) => {
                  const isSelected = selectedColors.some(col => col.name === c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleColor(c)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Input */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-600 font-bold">افزودن رنگ دلخواه:</span>
                <input
                  type="text"
                  placeholder="نام رنگ (مثلا: طلایی)"
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900"
                />
                <input
                  type="color"
                  value={customColorHex}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 bg-white p-0.5"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                >
                  + افزودن
                </button>
              </div>

              {/* Selected Colors List */}
              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                <span className="font-bold">رنگ‌های ثبت‌شده برای این محصول:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedColors.map((sc) => (
                    <span key={sc.name} className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                      {sc.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 mb-1">توضیحات محصول</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 text-sm"
              >
                ذخیره و افزودن به فروشگاه
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
