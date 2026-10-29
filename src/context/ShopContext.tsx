'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, BrandInfo } from '../types/product';
import { PRODUCTS_DATA } from '../data/products';
import { BRANDS_DATA } from '../data/brands';
import { 
  Order, 
  Coupon, 
  Customer, 
  StoreSettings, 
  OrderStatus 
} from '../types/admin';
import { 
  INITIAL_SETTINGS, 
  INITIAL_COUPONS, 
  INITIAL_CUSTOMERS, 
  INITIAL_ORDERS 
} from '../data/adminDemo';
import { HeroSlide, PromoBanner } from '../types/banner';
import { INITIAL_HERO_SLIDES, INITIAL_PROMO_BANNERS } from '../data/banners';

import { 
  checkApiHealth, 
  fetchApiProducts, 
  fetchApiBrands, 
  fetchApiOrders,
  fetchApiCustomers,
  createApiOrder,
  updateApiOrderStatus,
  deleteApiOrder,
  createApiProduct,
  updateApiProduct,
  deleteApiProduct,
  fetchApiBanners,
  saveAllApiBanners,
  deleteApiBanner,
  transformBackendProduct,
  RawBackendProduct
} from '../services/api';


interface ShopContextType {
  // Backend API
  apiStatus: 'connected' | 'db_disconnected' | 'offline' | 'checking';
  isApiConnected: boolean;
  apiInfo: { database: string; version: string; port: number; error?: string } | null;
  refreshFromApi: () => Promise<void>;

  // Products & Brands
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => Promise<boolean | void> | void;
  brands: BrandInfo[];
  addBrand: (brand: BrandInfo) => void;
  updateBrand: (brand: BrandInfo) => void;
  deleteBrand: (brandId: string) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, courierName?: string, trackingNumber?: string) => void;
  deleteOrder: (orderId: string) => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;

  // Store Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  resetToDefaults: () => void;

  // Banners & Promos
  heroSlides: HeroSlide[];
  promoBanners: PromoBanner[];
  addHeroSlide: (slide: HeroSlide) => void;
  updateHeroSlide: (slide: HeroSlide) => void;
  deleteHeroSlide: (slideId: string) => void;
  reorderHeroSlides: (slides: HeroSlide[]) => void;
  addPromoBanner: (banner: PromoBanner) => void;
  updatePromoBanner: (banner: PromoBanner) => void;
  deletePromoBanner: (bannerId: string) => void;
  resetBannersToDefaults: () => void;


  // Cart & Wishlist
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  wishlistCount: number;
  cartSubtotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  freeShippingPercent: number;
  appliedCoupon: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Delivery Charge & Location
  deliveryLocation: 'inside_dhaka' | 'outside_dhaka';
  setDeliveryLocation: (loc: 'inside_dhaka' | 'outside_dhaka') => void;
  deliveryFeeInsideDhaka: number;
  deliveryFeeOutsideDhaka: number;
  deliveryFee: number;
  getDeliveryFee: (loc?: 'inside_dhaka' | 'outside_dhaka') => number;
  
  // Modals & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackOrderOpen: boolean;
  setIsTrackOrderOpen: (open: boolean) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Catalog Filters
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priceFilter: string;
  setPriceFilter: (price: string) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Backend API Integration State ──
  const [apiStatus, setApiStatus] = useState<'connected' | 'db_disconnected' | 'offline' | 'checking'>('checking');
  const [apiInfo, setApiInfo] = useState<{ database: string; version: string; port: number; error?: string } | null>(null);

  // ── Products ──
  const [products, setProducts] = useState<Product[]>([]);

  // ── Brands ──
  const [brands, setBrands] = useState<BrandInfo[]>([]);

  // ── Orders ──
  const [orders, setOrders] = useState<Order[]>([]);

  // ── Coupons ──
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // ── Customers ──
  const [customers, setCustomers] = useState<Customer[]>([]);

  // ── Settings ──
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  // ── Banners & Promos ──
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(INITIAL_HERO_SLIDES);
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>(INITIAL_PROMO_BANNERS);


  // ── Cart & Wishlist ──
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Delivery Location (Inside Dhaka: ৳70, Outside Dhaka: ৳130)
  const [deliveryLocation, setDeliveryLocationState] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');

  const setDeliveryLocation = useCallback((loc: 'inside_dhaka' | 'outside_dhaka') => {
    setDeliveryLocationState(loc);
    try {
      localStorage.setItem('zap_delivery_location', loc);
    } catch {
      // ignore
    }
  }, []);

  // Modals & UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Hydration safety flag
  const isHydratedRef = React.useRef(false);

  // Safely restore cached state from localStorage after initial hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Purge legacy dummy data from earlier versions
        const isCleaned = localStorage.getItem('zap_clean_v2');
        if (!isCleaned) {
          localStorage.removeItem('zap_products');
          localStorage.removeItem('zap_brands');
          localStorage.removeItem('zap_orders');
          localStorage.removeItem('zap_coupons');
          localStorage.removeItem('zap_customers');
          localStorage.setItem('zap_clean_v2', 'true');
        } else {
          const savedCart = localStorage.getItem('zap_cart');
          if (savedCart) setCart(JSON.parse(savedCart));

          const savedWishlist = localStorage.getItem('zap_wishlist');
          if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

          const savedProducts = localStorage.getItem('zap_products');
          if (savedProducts) setProducts(JSON.parse(savedProducts));

          const savedBrands = localStorage.getItem('zap_brands');
          if (savedBrands) setBrands(JSON.parse(savedBrands));

          const savedOrders = localStorage.getItem('zap_orders');
          if (savedOrders) setOrders(JSON.parse(savedOrders));

          const savedCoupons = localStorage.getItem('zap_coupons');
          if (savedCoupons) setCoupons(JSON.parse(savedCoupons));

          const savedCustomers = localStorage.getItem('zap_customers');
          if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

          const savedSettings = localStorage.getItem('zap_settings');
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setStoreSettings({
              ...INITIAL_SETTINGS,
              ...parsed,
              deliveryFeeInsideDhaka: parsed.deliveryFeeInsideDhaka ?? 70,
              deliveryFeeOutsideDhaka: parsed.deliveryFeeOutsideDhaka ?? 130,
            });
          }

          const savedLocation = localStorage.getItem('zap_delivery_location');
          if (savedLocation === 'inside_dhaka' || savedLocation === 'outside_dhaka') {
            setDeliveryLocationState(savedLocation);
          }

          const savedSlides = localStorage.getItem('zap_hero_slides');
          if (savedSlides) setHeroSlides(JSON.parse(savedSlides));

          const savedBanners = localStorage.getItem('zap_promo_banners');
          if (savedBanners) setPromoBanners(JSON.parse(savedBanners));

        }
      } catch {
        // Safe fallback if local storage parse fails
      } finally {
        isHydratedRef.current = true;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Sync to localStorage only after initial client hydration has completed
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('zap_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('zap_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('zap_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('zap_brands', JSON.stringify(brands));
    } catch {}
  }, [brands]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('zap_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('zap_coupons', JSON.stringify(coupons));
    } catch {}
  }, [coupons]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('zap_customers', JSON.stringify(customers));
    } catch {}
  }, [customers]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('zap_settings', JSON.stringify(storeSettings));
    } catch {}
  }, [storeSettings]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('zap_hero_slides', JSON.stringify(heroSlides));
    } catch {}
  }, [heroSlides]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem('zap_promo_banners', JSON.stringify(promoBanners));
    } catch {}
  }, [promoBanners]);


  // Synchronize with PostgreSQL Backend API on User Request
  const refreshFromApi = useCallback(async () => {
    try {
      const health = await checkApiHealth();
      if (health && health.services?.api === 'running') {
        const isDbConnected = health.services?.database === 'connected';
        setApiStatus(isDbConnected ? 'connected' : 'db_disconnected');
        setApiInfo({
          database: health.services?.database || 'disconnected',
          version: health.version || '0.1.0',
          port: 3001,
          error: health.error,
        });

        if (isDbConnected) {
          const [apiProdData, apiBrandData, apiOrdersData, apiUsersData, apiBanners] = await Promise.all([
            fetchApiProducts(),
            fetchApiBrands(),
            fetchApiOrders(),
            fetchApiCustomers(),
            fetchApiBanners(),
          ]);

          setProducts(apiProdData.products);
          setBrands(apiBrandData);
          if (apiOrdersData.length > 0) {
            setOrders(apiOrdersData);
          }
          if (apiUsersData.length > 0) {
            setCustomers(apiUsersData);
          }
          if (apiBanners) {
            if (apiBanners.heroSlides?.length > 0) setHeroSlides(apiBanners.heroSlides);
          }

        }
      } else {
        setApiStatus('offline');
        setApiInfo(null);
      }
    } catch {
      setApiStatus('offline');
      setApiInfo(null);
    }
  }, []);

  // Initial Asynchronous Hydration from Backend
  useEffect(() => {
    let active = true;
    checkApiHealth()
      .then(async (health) => {
        if (!active) return;
        if (health && health.services?.api === 'running') {
          const isDbConnected = health.services?.database === 'connected';
          setApiStatus(isDbConnected ? 'connected' : 'db_disconnected');
          setApiInfo({
            database: health.services?.database || 'disconnected',
            version: health.version || '0.1.0',
            port: 3001,
            error: health.error,
          });

          if (isDbConnected) {
            const [apiProdData, apiBrandData, apiOrdersData, apiUsersData, apiBanners] = await Promise.all([
              fetchApiProducts(),
              fetchApiBrands(),
              fetchApiOrders(),
              fetchApiCustomers(),
              fetchApiBanners(),
            ]);

            if (active) {
              setProducts(apiProdData.products);
              setBrands(apiBrandData);
              if (apiOrdersData.length > 0) setOrders(apiOrdersData);
              if (apiUsersData.length > 0) setCustomers(apiUsersData);
              if (apiBanners) {
                if (apiBanners.heroSlides?.length > 0) setHeroSlides(apiBanners.heroSlides);
              }
            }
          }

        } else {
          setApiStatus('offline');
          setApiInfo(null);
        }
      })
      .catch(() => {
        if (active) {
          setApiStatus('offline');
          setApiInfo(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // ── Products CRUD ──
  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    showToast(`Publishing "${product.name.slice(0, 24)}..." to database...`);
    createApiProduct(product)
      .then((res) => {
        if (res.success && res.data) {
          const rawBackend = res.data as RawBackendProduct;
          const savedProd = transformBackendProduct(rawBackend);
          // Replace optimistic product with actual saved product with real database ID
          setProducts((prev) => prev.map((p) => (p.id === product.id ? savedProd : p)));
          showToast(`Product "${savedProd.name.slice(0, 24)}" published to storefront & database!`);
        } else {
          console.error('Backend product creation failed:', res.message);
          // Rollback optimistic product so it doesn't linger only in this browser's localStorage
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          showToast(`Failed to publish: ${res.message || 'Database rejected product'}`);
        }
      })
      .catch((err) => {
        console.error('Failed to sync created product with PostgreSQL:', err);
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        showToast('Error syncing product to database. Check network.');
      });
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    showToast(`Updating "${product.name.slice(0, 24)}..." in database...`);
    updateApiProduct(product.id, product)
      .then((res) => {
        if (res.success && res.data) {
          const rawBackend = res.data as RawBackendProduct;
          const savedProd = transformBackendProduct(rawBackend);
          setProducts((prev) => prev.map((p) => (p.id === product.id ? savedProd : p)));
          showToast(`Product "${savedProd.name.slice(0, 24)}" updated in database!`);
        } else if (!res.success) {
          console.warn('Backend product update warning:', res.message);
        }
      })
      .catch((err) => {
        console.error('Failed to sync updated product with PostgreSQL:', err);
      });
  };

  const deleteProduct = async (productId: string) => {
    const productToDelete = products.find((p) => p.id === productId);
    // Optimistic removal from active catalog
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    // Clean up cart and wishlist if item was stored
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    setWishlist((prev) => prev.filter((id) => id !== productId));
    showToast('Deleting product from database...');

    try {
      const res = await deleteApiProduct(productId);
      if (res.success) {
        showToast('Product successfully deleted from catalog.');
        return true;
      } else {
        console.warn('Backend product deletion warning:', res.message);
        showToast(`Failed to delete product: ${res.message || 'Server error'}`);
        // Revert local state if server deletion failed
        if (productToDelete) {
          setProducts((prev) => [productToDelete, ...prev.filter((p) => p.id !== productId)]);
        }
        return false;
      }
    } catch (err) {
      console.error('Failed to sync deleted product with PostgreSQL:', err);
      showToast('Error syncing product deletion with database.');
      if (productToDelete) {
        setProducts((prev) => [productToDelete, ...prev.filter((p) => p.id !== productId)]);
      }
      return false;
    }
  };

  // ── Brands CRUD ──
  const addBrand = (brand: BrandInfo) => {
    setBrands((prev) => [...prev, brand]);
    showToast(`Brand "${brand.name}" added!`);
  };

  const updateBrand = (brand: BrandInfo) => {
    setBrands((prev) => prev.map((b) => (b.id === brand.id ? brand : b)));
    showToast(`Brand "${brand.name}" updated.`);
  };

  const deleteBrand = (brandId: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== brandId));
    showToast('Brand deleted.');
  };

  // ── Orders CRUD ──
  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    // Synchronize full order details to PostgreSQL backend
    createApiOrder({
      ...order,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      city: order.city,
      division: order.division,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderNumber: order.orderNumber,
      notes: order.notes,
      couponCode: order.couponCode,
      courierName: order.courierName,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      items: order.items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        size: it.size,
        color: it.color,
        unitPrice: it.unitPrice,
        name: it.product?.name,
        image: typeof it.product?.images?.[0] === 'string' 
          ? it.product.images[0] 
          : (it.product?.images?.[0] as unknown as { url?: string })?.url || '',
      })),
    })
      .then((res) => {
        if (res.success) {
          console.log('[Order Sync] Successfully synchronized order to PostgreSQL backend:', res.data);
        } else {
          console.warn('[Order Sync Notice]:', res.message);
        }
      })
      .catch((err) => {
        console.warn('[Order Sync Error]:', err);
      });
  };

  const updateOrderStatus = (
    orderId: string, 
    status: OrderStatus, 
    courierName?: string, 
    trackingNumber?: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status,
          courierName: courierName || ord.courierName,
          trackingNumber: trackingNumber || ord.trackingNumber,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    updateApiOrderStatus(orderId, status, courierName, trackingNumber).catch(() => {});
    showToast(`Order status updated to ${status}`);
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    deleteApiOrder(orderId).catch(() => {});
    showToast('Order record removed.');
  };

  // ── Coupons CRUD ──
  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev]);
    showToast(`Coupon "${coupon.code}" activated!`);
  };

  const updateCoupon = (coupon: Coupon) => {
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? coupon : c)));
    showToast(`Coupon "${coupon.code}" updated.`);
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    showToast('Coupon removed.');
  };

  // ── Customers CRUD ──
  const addCustomer = (customer: Customer) => {
    setCustomers((prev) => [customer, ...prev]);
    showToast(`Customer "${customer.name}" created.`);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
    showToast(`Customer record updated.`);
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    showToast('Customer record removed.');
  };

  // ── Store Settings ──
  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      try {
        localStorage.setItem('zap_settings', JSON.stringify(merged));
      } catch (err) {
        console.error('Failed to save zap_settings to localStorage:', err);
      }
      return merged;
    });
    showToast('Store settings saved successfully!');
  };

  // ── Banners & Promos ──
  const addHeroSlide = (slide: HeroSlide) => {
    const updated = [...heroSlides, slide];
    setHeroSlides(updated);
    saveAllApiBanners(updated, []);
    showToast('Hero slide added and synced to database.');
  };

  const updateHeroSlide = (slide: HeroSlide) => {
    const updated = heroSlides.map((s) => (s.id === slide.id ? slide : s));
    setHeroSlides(updated);
    saveAllApiBanners(updated, []);
    showToast('Hero slide updated and synced to database.');
  };

  const deleteHeroSlide = (slideId: string) => {
    const updated = heroSlides.filter((s) => s.id !== slideId);
    setHeroSlides(updated);
    deleteApiBanner(slideId);
    showToast('Hero slide removed from database.');
  };

  const reorderHeroSlides = (newSlides: HeroSlide[]) => {
    setHeroSlides(newSlides);
    saveAllApiBanners(newSlides, promoBanners);
    showToast('Hero slides reordered and synced.');
  };

  const addPromoBanner = (banner: PromoBanner) => {
    const updated = [...promoBanners, banner];
    setPromoBanners(updated);
    saveAllApiBanners(heroSlides, updated);
    showToast('Promotional banner added and synced to database.');
  };

  const updatePromoBanner = (banner: PromoBanner) => {
    const updated = promoBanners.map((b) => (b.id === banner.id ? banner : b));
    setPromoBanners(updated);
    saveAllApiBanners(heroSlides, updated);
    showToast('Promotional banner updated and synced to database.');
  };

  const deletePromoBanner = (bannerId: string) => {
    const updated = promoBanners.filter((b) => b.id !== bannerId);
    setPromoBanners(updated);
    deleteApiBanner(bannerId);
    showToast('Promotional banner removed from database.');
  };

  const resetBannersToDefaults = () => {
    setHeroSlides(INITIAL_HERO_SLIDES);
    setPromoBanners(INITIAL_PROMO_BANNERS);
    saveAllApiBanners(INITIAL_HERO_SLIDES, INITIAL_PROMO_BANNERS);
    try {
      localStorage.removeItem('zap_hero_slides');
      localStorage.removeItem('zap_promo_banners');
    } catch {}
    showToast('Banners restored to factory design and synced to database.');
  };


  const resetToDefaults = () => {
    setProducts(PRODUCTS_DATA);
    setBrands(BRANDS_DATA);
    setOrders(INITIAL_ORDERS);
    setCoupons(INITIAL_COUPONS);
    setCustomers(INITIAL_CUSTOMERS);
    setStoreSettings(INITIAL_SETTINGS);
    setHeroSlides(INITIAL_HERO_SLIDES);
    setPromoBanners(INITIAL_PROMO_BANNERS);
    try {
      localStorage.removeItem('zap_products');
      localStorage.removeItem('zap_brands');
      localStorage.removeItem('zap_orders');
      localStorage.removeItem('zap_coupons');
      localStorage.removeItem('zap_customers');
      localStorage.removeItem('zap_settings');
      localStorage.removeItem('zap_hero_slides');
      localStorage.removeItem('zap_promo_banners');
    } catch {}
    showToast('Demo data reset to factory defaults.');
  };


  // ── Cart Operations ──
  const addToCart = (product: Product, size?: string, color?: string, quantity: number = 1) => {
    const chosenSize = size || product.sizes[0] || '41';
    const chosenColor = color || product.colors[0]?.name || 'Standard';
    const itemId = `${product.id}-${chosenSize}-${chosenColor}`;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === itemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prevCart,
        {
          id: itemId,
          product,
          selectedSize: chosenSize,
          selectedColor: chosenColor,
          quantity,
        },
      ];
    });

    showToast(`Added "${product.name.slice(0, 28)}..." to Cart!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart.');
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountPercent(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to your Wishlist!');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const cartSubtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const freeShippingThreshold = storeSettings.freeShippingThreshold;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingPercent = Math.min(
    100,
    Math.round((cartSubtotal / freeShippingThreshold) * 100)
  );

  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);

  const deliveryFeeInsideDhaka = storeSettings.deliveryFeeInsideDhaka ?? 70;
  const deliveryFeeOutsideDhaka = storeSettings.deliveryFeeOutsideDhaka ?? 130;

  const getDeliveryFee = useCallback(
    (loc?: 'inside_dhaka' | 'outside_dhaka') => {
      if (cartSubtotal >= freeShippingThreshold || cart.length === 0) return 0;
      const targetLoc = loc || deliveryLocation;
      return targetLoc === 'outside_dhaka' ? deliveryFeeOutsideDhaka : deliveryFeeInsideDhaka;
    },
    [cartSubtotal, freeShippingThreshold, cart.length, deliveryLocation, deliveryFeeInsideDhaka, deliveryFeeOutsideDhaka]
  );

  const deliveryFee = getDeliveryFee(deliveryLocation);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    
    // Check against active coupons in state
    const matchedCoupon = coupons.find(
      (c) => c.code.toUpperCase() === cleanCode && c.isActive
    );

    if (matchedCoupon) {
      if (cartSubtotal < matchedCoupon.minSpend) {
        showToast(`Minimum order of ৳ ${matchedCoupon.minSpend.toLocaleString()} required for "${matchedCoupon.code}"`);
        return { 
          success: false, 
          message: `Min spend ৳ ${matchedCoupon.minSpend.toLocaleString()} required.` 
        };
      }
      setAppliedCoupon(matchedCoupon.code);
      setDiscountPercent(matchedCoupon.discountPercent);
      showToast(`🎉 Promo code applied: ${matchedCoupon.discountPercent}% off!`);
      return { 
        success: true, 
        message: `Coupon "${matchedCoupon.code}" applied! ${matchedCoupon.discountPercent}% off.` 
      };
    }

    showToast('Invalid or expired coupon code.');
    return { success: false, message: 'Invalid or expired coupon.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
    showToast('Coupon removed');
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedGender('ALL');
    setSearchQuery('');
    setPriceFilter('all');
    setSelectedSize('all');
    setSortBy('featured');
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        brands,
        addBrand,
        updateBrand,
        deleteBrand,

        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,

        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,

        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,

        storeSettings,
        updateStoreSettings,
        resetToDefaults,

        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        cartCount,
        wishlistCount,
        cartSubtotal,
        freeShippingThreshold,
        freeShippingRemaining,
        freeShippingPercent,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,

        deliveryLocation,
        setDeliveryLocation,
        deliveryFeeInsideDhaka,
        deliveryFeeOutsideDhaka,
        deliveryFee,
        getDeliveryFee,

        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isSearchOpen,
        setIsSearchOpen,
        quickViewProduct,
        setQuickViewProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackOrderOpen,
        setIsTrackOrderOpen,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        toastMessage,
        showToast,

        selectedCategory,
        setSelectedCategory,
        selectedBrand,
        setSelectedBrand,
        selectedGender,
        setSelectedGender,
        searchQuery,
        setSearchQuery,
        priceFilter,
        setPriceFilter,
        selectedSize,
        setSelectedSize,
        sortBy,
        setSortBy,
        resetFilters,

        // Banners & Promos
        heroSlides,
        promoBanners,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        reorderHeroSlides,
        addPromoBanner,
        updatePromoBanner,
        deletePromoBanner,
        resetBannersToDefaults,

        // Backend API
        apiStatus,
        isApiConnected: apiStatus === 'connected',
        apiInfo,
        refreshFromApi,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
