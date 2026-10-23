import { Product, BrandInfo, ShoeCategory, ProductVariant, ColorVariantGroup } from '../types/product';
import { Order, Customer } from '../types/admin';
import { HeroSlide, PromoBanner } from '../types/banner';


// Dokploy VPS Backend URL (default fallback ensures direct connection from both client and server)
const DOKPLOY_VPS_API_URL = 'https://zap-api-s07dc5-55b9e4-185-209-229-28.sslip.io';
const API_BASE = (
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  DOKPLOY_VPS_API_URL
).replace(/\/+$/, '');

export interface ApiHealthResponse {
  status: string;
  timestamp: string;
  version?: string;
  services: {
    database: string;
    api: string;
  };
  error?: string;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RawBackendProduct {
  id: string;
  name?: string;
  slug?: string;
  sku?: string;
  price?: string | number;
  salePrice?: string | number | null;
  gender?: 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX';
  isActive?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  description?: string | null;
  features?: string[];
  images?: Array<string | { url: string; alt?: string; isPrimary?: boolean; order?: number }>;
  brand?: { name: string; slug: string };
  category?: { name: string; slug: string };
  variants?: Array<{ id?: string; size?: string; color?: string; colorHex?: string; stock?: number; additionalPrice?: number }>;
  _count?: { reviews?: number };
}

export interface RawBackendBrand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  _count?: { products?: number };
}

export interface RawBackendCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  children?: RawBackendCategory[];
  _count?: { products?: number };
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Checks backend health and PostgreSQL connection
 */
export async function checkApiHealth(): Promise<ApiHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const json = await res.json().catch(() => null);
    if (json && json.services) {
      return json as ApiHealthResponse;
    }
    return null;
  } catch (err) {
    console.warn('Backend API currently unreachable:', err);
    return null;
  }
}

/**
 * Transforms a backend Prisma product into the frontend Product interface
 */
export function transformBackendProduct(bp: RawBackendProduct): Product {
  const regularPrice = typeof bp.price === 'string' ? parseFloat(bp.price) : Number(bp.price || 0);
  const salePrice = bp.salePrice ? (typeof bp.salePrice === 'string' ? parseFloat(bp.salePrice) : Number(bp.salePrice)) : null;
  const currentPrice = salePrice !== null && salePrice > 0 ? salePrice : regularPrice;
  const discountPercentage = salePrice && regularPrice > salePrice 
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) 
    : undefined;

  const rawImages = Array.isArray(bp.images) && bp.images.length > 0
    ? bp.images.map((img) => typeof img === 'string' ? { url: img, alt: '' } : { url: img.url, alt: img.alt || '' })
    : [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', alt: '' }];
  const images: string[] = rawImages.map(img => img.url);

  const variants: ProductVariant[] = Array.isArray(bp.variants)
    ? bp.variants.map((v) => ({
        id: v.id,
        size: String(v.size || '').trim(),
        color: (v.color || 'Classic Black').trim(),
        colorHex: v.colorHex || '#18181B',
        stock: typeof v.stock === 'number' ? v.stock : Number(v.stock) || 0,
        additionalPrice: typeof v.additionalPrice === 'number' ? v.additionalPrice : Number(v.additionalPrice) || 0,
      })).filter((v) => v.size)
    : [];

  // Group variants into ColorVariantGroup
  const colorMap = new Map<string, { colorHex: string; sizes: Array<{ size: string; stock: number }> }>();
  for (const v of variants) {
    const key = v.color || 'Classic Black';
    if (!colorMap.has(key)) {
      colorMap.set(key, { colorHex: v.colorHex || '#18181B', sizes: [] });
    }
    const group = colorMap.get(key)!;
    if (!group.sizes.some(s => s.size === v.size)) {
      group.sizes.push({ size: v.size, stock: v.stock });
    }
  }

  // Parse per-color descriptions if encoded in description
  let parsedDescription = bp.description || '';
  let colorDescriptions: Record<string, string> = {};
  if (bp.description && typeof bp.description === 'string' && bp.description.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(bp.description);
      if (parsed && typeof parsed === 'object') {
        if ('main' in parsed) parsedDescription = parsed.main || '';
        if ('colors' in parsed && typeof parsed.colors === 'object') {
          colorDescriptions = parsed.colors;
        }
      }
    } catch {
      parsedDescription = bp.description || '';
    }
  }

  const colorVariants: ColorVariantGroup[] = [];
  colorMap.forEach((val, cName) => {
    const matchedImages = rawImages
      .filter(img => img.alt && img.alt.toLowerCase().includes(cName.toLowerCase()))
      .map(img => img.url);
    colorVariants.push({
      color: cName,
      colorHex: val.colorHex,
      images: matchedImages.length > 0 ? matchedImages : images,
      sizes: val.sizes,
      description: colorDescriptions[cName] || undefined,
    });
  });

  const variantSizes = variants.length > 0
    ? Array.from(new Set(variants.map((v) => v.size)))
    : ['39', '40', '41', '42', '43', '44'];

  const variantColors = colorMap.size > 0
    ? Array.from(colorMap.entries()).map(([cName, info]) => {
        const matchedImages = rawImages
          .filter(img => img.alt && img.alt.toLowerCase().includes(cName.toLowerCase()))
          .map(img => img.url);
        return {
          name: cName,
          hex: info.colorHex,
          images: matchedImages.length > 0 ? matchedImages : undefined,
        };
      })
    : [{ name: 'Classic Black', hex: '#18181B' }];

  const totalVariantStock = variants.length > 0
    ? variants.reduce((sum, v) => sum + v.stock, 0)
    : 100;
  const inStock = bp.isActive !== false && totalVariantStock > 0;

  return {
    id: String(bp.id),
    name: bp.name || 'Unnamed Product',
    slug: bp.slug || String(bp.id),
    sku: bp.sku || `ZAP-${bp.id.slice(-6)}`,
    brand: bp.brand?.name || 'ZAP Signature',
    brandSlug: bp.brand?.slug || 'zap-signature',
    category: (bp.category?.slug?.toLowerCase() as ShoeCategory) || 'sneakers',
    categoryName: bp.category?.name || 'Footwear',
    gender: bp.gender || 'UNISEX',
    price: currentPrice,
    regularPrice: regularPrice,
    discountPercentage,
    isNewArrival: bp.isNewArrival ?? false,
    isBestseller: bp.isBestseller ?? true,
    isFeatured: bp.isFeatured ?? false,
    rating: bp.rating ? Number(bp.rating) : 0,
    reviewCount: bp._count?.reviews || bp.reviewCount || 0,
    description: parsedDescription,
    features: bp.features || [
      'High-grade premium materials',
      'Ergonomic shock-absorbing insole',
      'Durable non-slip rubber outsole',
      'Breathable interior lining',
    ],
    images,
    sizes: variantSizes,
    colors: variantColors,
    inStock,
    variants,
    colorVariants,
  };
}

/**
 * Fetch all products from PostgreSQL backend
 */
export async function fetchApiProducts(params?: {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  brandId?: string;
  gender?: string;
  includeInactive?: boolean;
}): Promise<{ products: Product[]; pagination: ApiPagination | null }> {
  try {
    const query = new URLSearchParams();
    query.set('limit', String(params?.limit || 100));
    if (params?.page) query.set('page', String(params.page));
    if (params?.q) query.set('q', params.q);
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.brandId) query.set('brandId', params.brandId);
    if (params?.gender) query.set('gender', params.gender);
    query.set('includeInactive', 'true'); // Allow admin & catalog to see in-stock & out-of-stock items

    const qs = query.toString();
    const endpoint = `/api/products${qs ? `?${qs}` : ''}`;

    let res: Response | null = null;
    // 1. Try direct VPS backend URL first
    try {
      res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
    } catch {
      res = null;
    }

    // 2. If direct call failed, fallback to relative Next.js proxy route
    if (!res || !res.ok) {
      try {
        const fallbackRes = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        if (fallbackRes.ok) res = fallbackRes;
      } catch {
        // keep res as is
      }
    }

    if (!res || !res.ok) {
      throw new Error(`Failed to fetch products: ${res?.statusText || 'Server unreachable'}`);
    }

    const json = await res.json();
    const rawList: RawBackendProduct[] = json.data?.data || json.data || [];
    const products = rawList.map(transformBackendProduct);

    return {
      products,
      pagination: json.data?.pagination || null,
    };
  } catch (err) {
    console.warn('[API fetchApiProducts Error]:', err);
    return { products: [], pagination: null };
  }
}

/**
 * Fetch a single product by ID or Slug from backend
 */
export async function fetchApiProduct(idOrSlug: string): Promise<Product | null> {
  try {
    const endpoint = `/api/products/${encodeURIComponent(idOrSlug)}`;
    let res: Response | null = null;
    try {
      res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
    } catch {
      res = null;
    }

    if (!res || !res.ok) {
      try {
        const fallbackRes = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        if (fallbackRes.ok) res = fallbackRes;
      } catch {
        // ignore
      }
    }

    if (!res || !res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;
    return transformBackendProduct(json.data);
  } catch (err) {
    console.warn('[API fetchApiProduct Error]:', err);
    return null;
  }
}

/**
 * Fetch all brands from backend
 */
export async function fetchApiBrands(): Promise<BrandInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/api/brands`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const json = await res.json();
    const rawList: RawBackendBrand[] = json.data || [];

    return rawList.map((b) => ({
      id: String(b.id),
      name: b.name,
      slug: b.slug,
      tagline: b.description || 'Premium Footwear Collection',
      description: b.description || 'Official brand catalog',
      logoText: b.name.toUpperCase(),
      badgeColor: '#1E293B',
      accentColor: '#D32F2F',
    }));
  } catch (err) {
    console.warn('[API fetchApiBrands Error]:', err);
    return [];
  }
}

/**
 * Fetch all categories from backend
 */
export async function fetchApiCategories(): Promise<RawBackendCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const json = await res.json();
    return (json.data as RawBackendCategory[]) || [];
  } catch (err) {
    console.warn('[API fetchApiCategories Error]:', err);
    return [];
  }
}

/**
 * Authenticate with backend API (JWT)
 */
export async function apiLogin(email: string, password: string): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: ApiUser;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, message: json.message || 'Login failed' };
    }

    if (typeof window !== 'undefined' && json.data?.accessToken) {
      localStorage.setItem('zap_access_token', json.data.accessToken);
      if (json.data.user) {
        localStorage.setItem('zap_user', JSON.stringify(json.data.user));
      }
    }

    return {
      success: true,
      accessToken: json.data?.accessToken,
      refreshToken: json.data?.refreshToken,
      user: json.data?.user as ApiUser | undefined,
      message: json.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error connecting to API';
    return { success: false, message };
  }
}

/**
 * Fetch Admin Dashboard Metrics from PostgreSQL backend
 */
export async function fetchApiAdminDashboard(): Promise<Record<string, unknown> | null> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as Record<string, unknown>) || null;
  } catch {
    return null;
  }
}

/**
 * Create Order on the backend
 */
export async function createApiOrder(orderData: {
  addressId?: string;
  items: Array<{ productId: string; quantity: number; variantId?: string }>;
  paymentMethod: string;
  notes?: string;
  couponCode?: string;
}): Promise<{ success: boolean; data?: unknown; message?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });

    const json = await res.json();
    return {
      success: res.ok && json.success,
      data: json.data,
      message: json.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to connect to order API';
    return { success: false, message };
  }
}



/**
 * Resilient API request executor:
 * 1. Tries direct Dokploy VPS API_BASE first (CORS fully enabled)
 * 2. Falls back to relative Next.js route if direct call fails
 * 3. Extracts detailed error message from JSON/text
 */
async function resilientApiFetch(
  endpoint: string,
  options: RequestInit
): Promise<{ ok: boolean; status: number; data?: unknown; message?: string }> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const directUrl = `${API_BASE}${cleanEndpoint}`;
  const relativeUrl = cleanEndpoint;

  let res: Response | null = null;

  // 1. Try direct VPS backend URL first
  try {
    res = await fetch(directUrl, options);
  } catch {
    res = null;
  }

  // 2. If direct call failed (e.g. DNS or network), fallback to relative Next.js proxy route
  if (!res || (!res.ok && res.status >= 500)) {
    try {
      const fallbackRes = await fetch(relativeUrl, options);
      if (fallbackRes.ok || !res) {
        res = fallbackRes;
      }
    } catch {
      // keep initial res
    }
  }

  if (!res) {
    return {
      ok: false,
      status: 0,
      message: 'Unable to reach backend database server. Please check internet connection.',
    };
  }

  let json: any = null;
  let rawText = '';
  try {
    rawText = await res.text();
    try {
      json = JSON.parse(rawText);
    } catch {
      json = null;
    }
  } catch {
    json = null;
  }

  const extractedMessage =
    json?.message ||
    json?.error ||
    (json?.errors && typeof json.errors === 'object'
      ? Object.values(json.errors).flat().join(', ')
      : null) ||
    (!rawText.startsWith('<') && rawText.length < 120 ? rawText.trim() : null) ||
    (res.ok ? 'Success' : `Server responded with status ${res.status}`);

  return {
    ok: Boolean(res.ok && (json ? json.success !== false : true)),
    status: res.status,
    data: json?.data,
    message: extractedMessage,
  };
}

/**
 * Create a new product in PostgreSQL database
 */
export async function createApiProduct(product: Product): Promise<{ success: boolean; data?: unknown; message?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const adminPasskey = typeof window !== 'undefined' ? (sessionStorage.getItem('zap_admin_pass') || 'zap@admin2026') : 'zap@admin2026';
    const authToken = token || adminPasskey;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'x-admin-key': adminPasskey,
    };

    const numPrice = Number(product.price) || 0;
    const numRegularPrice = Number(product.regularPrice) || numPrice;
    const finalPrice = numRegularPrice > 0 ? numRegularPrice : (numPrice > 0 ? numPrice : 100);
    const finalSalePrice = (numPrice > 0 && numPrice < numRegularPrice) ? numPrice : null;

    // Deduplicate sizes
    const rawSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['39', '40', '41', '42', '43'];
    const uniqueSizes = Array.from(new Set(rawSizes.map((s) => String(s).trim()).filter(Boolean)));
    const finalSizes = uniqueSizes.length > 0 ? uniqueSizes : ['40', '41', '42'];

    // Deduplicate colors
    const rawColors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : [{ name: 'Classic Black', hex: '#18181B' }];
    const uniqueColors = Array.from(
      new Map(rawColors.map((c) => [(c.name || 'Classic Black').trim().toLowerCase(), c])).values()
    );

    // Build variants: use product.variants if provided, or build from sizes & colors
    const variants = product.variants && product.variants.length > 0
      ? product.variants.map((v) => ({
          size: String(v.size).trim(),
          color: (v.color || 'Classic Black').trim(),
          colorHex: v.colorHex || '#18181B',
          stock: typeof v.stock === 'number' ? v.stock : Number(v.stock) || 0,
          additionalPrice: typeof v.additionalPrice === 'number' ? v.additionalPrice : Number(v.additionalPrice) || 0,
        }))
      : finalSizes.flatMap((size) =>
          uniqueColors.map((c) => ({
            size: String(size),
            color: c.name || 'Classic Black',
            colorHex: c.hex || '#18181B',
            stock: 20,
            additionalPrice: 0,
          }))
        );

    const images = (product.images || [])
      .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
      .map((url, idx) => {
        let matchedColor = '';
        if (product.colorVariants && product.colorVariants.length > 0) {
          const cv = product.colorVariants.find((c) => c.images?.includes(url));
          if (cv) matchedColor = cv.color;
        } else if (product.colors && product.colors.length > 0) {
          const matched = product.colors.find((c) => c.images?.includes(url));
          if (matched) matchedColor = matched.name;
        }
        return {
          url: url.trim(),
          alt: matchedColor || product.name || 'Footwear',
          isPrimary: idx === 0,
          order: idx,
        };
      });

    const cleanCategorySlug = (product.category || 'formal').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const cleanBrandSlug = (product.brandSlug || (product.brand ? product.brand.toLowerCase().replace(/[^a-z0-9-]+/g, '-') : 'zap-signature'));

    // Encode per-color descriptions if configured
    let finalDescription = product.description || '';
    const hasColorDescriptions = product.colorVariants?.some(
      (cv) => cv.description && cv.description.trim().length > 0
    );
    if (hasColorDescriptions) {
      const colorMap: Record<string, string> = {};
      product.colorVariants?.forEach((cv) => {
        if (cv.description && cv.description.trim().length > 0) {
          colorMap[cv.color] = cv.description.trim();
        }
      });
      finalDescription = JSON.stringify({
        main: product.description || '',
        colors: colorMap,
      });
    }

    const payload = {
      name: product.name || 'Unnamed Footwear',
      slug: product.slug,
      sku: product.sku || `ZAP-${Date.now().toString().slice(-6)}`,
      description: finalDescription,
      price: finalPrice,
      salePrice: finalSalePrice,
      gender: product.gender || 'UNISEX',
      isFeatured: !!product.isFeatured,
      isActive: product.inStock !== false,
      categorySlug: cleanCategorySlug || 'formal',
      brandSlug: cleanBrandSlug || 'zap-signature',
      images,
      variants,
    };

    const res = await resilientApiFetch('/api/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    return {
      success: res.ok,
      data: res.data,
      message: res.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return { success: false, message };
  }
}

/**
 * Update an existing product in PostgreSQL database
 */
export async function updateApiProduct(id: string, product: Partial<Product>): Promise<{ success: boolean; data?: unknown; message?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const adminPasskey = typeof window !== 'undefined' ? (sessionStorage.getItem('zap_admin_pass') || 'zap@admin2026') : 'zap@admin2026';
    const authToken = token || adminPasskey;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'x-admin-key': adminPasskey,
    };

    const payload: Record<string, unknown> = {};
    if (product.name) payload.name = product.name;
    if (product.slug) payload.slug = product.slug;
    if (product.sku) payload.sku = product.sku;

    if (product.description !== undefined || product.colorVariants !== undefined) {
      const hasColorDescriptions = product.colorVariants?.some(
        (cv) => cv.description && cv.description.trim().length > 0
      );
      if (hasColorDescriptions) {
        const colorMap: Record<string, string> = {};
        product.colorVariants?.forEach((cv) => {
          if (cv.description && cv.description.trim().length > 0) {
            colorMap[cv.color] = cv.description.trim();
          }
        });
        payload.description = JSON.stringify({
          main: product.description || '',
          colors: colorMap,
        });
      } else if (product.description !== undefined) {
        payload.description = product.description;
      }
    }
    if (product.price !== undefined) {
      payload.price = product.regularPrice || product.price;
      payload.salePrice = (product.regularPrice && product.regularPrice > product.price) ? product.price : null;
    }
    if (product.gender) payload.gender = product.gender;
    if (product.isFeatured !== undefined) payload.isFeatured = product.isFeatured;
    if (product.inStock !== undefined) payload.isActive = product.inStock;
    if (product.category) payload.categorySlug = product.category;
    if (product.brandSlug) payload.brandSlug = product.brandSlug;
    if (product.variants && Array.isArray(product.variants)) {
      payload.variants = product.variants.map((v) => ({
        size: String(v.size).trim(),
        color: (v.color || 'Classic Black').trim(),
        colorHex: v.colorHex || '#18181B',
        stock: typeof v.stock === 'number' ? v.stock : Number(v.stock) || 0,
        additionalPrice: typeof v.additionalPrice === 'number' ? v.additionalPrice : Number(v.additionalPrice) || 0,
      }));
    }
    if (product.images && product.images.length > 0) {
      payload.images = product.images.map((url, idx) => {
        let matchedColor = '';
        if (product.colorVariants && product.colorVariants.length > 0) {
          const cv = product.colorVariants.find((c) => c.images?.includes(url));
          if (cv) matchedColor = cv.color;
        } else if (product.colors && product.colors.length > 0) {
          const matched = product.colors.find((c) => c.images?.includes(url));
          if (matched) matchedColor = matched.name;
        }
        return {
          url,
          alt: matchedColor || product.name || 'Footwear',
          isPrimary: idx === 0,
          order: idx,
        };
      });
    }

    const res = await resilientApiFetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });

    return {
      success: res.ok,
      data: res.data,
      message: res.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update product';
    return { success: false, message };
  }
}

/**
 * Fetch approved customer reviews for a product from the backend
 */
export async function fetchProductReviews(productId: string): Promise<{ success: boolean; data?: any[]; avgRating?: number; total?: number; message?: string }> {
  try {
    const res = await resilientApiFetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
    if (res.ok && res.data) {
      const payloadData = res.data as { items?: any[]; data?: any[]; avgRating?: number; total?: number };
      const items = Array.isArray(res.data) 
        ? res.data 
        : (payloadData.items || payloadData.data || []);
      return {
        success: true,
        data: items,
        avgRating: payloadData.avgRating ?? 0,
        total: payloadData.total ?? items.length,
      };
    }
    return { success: false, data: [], message: res.message };
  } catch (err) {
    return { success: false, data: [], message: err instanceof Error ? err.message : 'Failed to fetch reviews' };
  }
}

/**
 * Submit an authentic customer review
 */
export async function submitProductReview(reviewData: {
  productId: string;
  rating: number;
  title: string;
  body: string;
}): Promise<{ success: boolean; data?: unknown; message?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const adminPasskey = typeof window !== 'undefined' ? (sessionStorage.getItem('zap_admin_pass') || 'zap@admin2026') : 'zap@admin2026';
    const authToken = token || adminPasskey;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'x-admin-key': adminPasskey,
    };

    const res = await resilientApiFetch('/api/reviews', {
      method: 'POST',
      headers,
      body: JSON.stringify(reviewData),
    });

    return {
      success: res.ok,
      data: res.data,
      message: res.message,
    };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Failed to submit review' };
  }
}

/**
 * Delete / deactivate a product in PostgreSQL database
 */
export async function deleteApiProduct(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const adminPasskey = typeof window !== 'undefined' ? (sessionStorage.getItem('zap_admin_pass') || 'zap@admin2026') : 'zap@admin2026';
    const authToken = token || adminPasskey;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'x-admin-key': adminPasskey,
    };

    const res = await resilientApiFetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers,
    });

    return {
      success: res.ok,
      message: res.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete product';
    return { success: false, message };
  }
}

export interface UploadedFileRecord {
  id: string;
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  entityType?: string;
  createdAt?: string;
}

/**
 * Upload one or multiple files to self-hosted SeaweedFS S3 storage through the backend
 */
export async function uploadApiFiles(
  files: File[],
  entityType = 'PRODUCT',
  entityId?: string
): Promise<{ success: boolean; data?: UploadedFileRecord[]; message?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const adminPasskey = typeof window !== 'undefined' ? (sessionStorage.getItem('zap_admin_pass') || 'zap@admin2026') : 'zap@admin2026';
    const authToken = token || adminPasskey;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
      'x-admin-key': adminPasskey,
    };

    const formData = new FormData();
    formData.append('entityType', entityType);
    if (entityId) formData.append('entityId', entityId);

    files.forEach((file) => {
      formData.append('files', file);
    });

    // Strategy 1: Try relative Next.js proxy route /api/storage/upload (same-origin, bypasses browser CORS)
    let res: Response | null = null;
    let json: any = null;

    try {
      res = await fetch('/api/storage/upload', {
        method: 'POST',
        headers,
        body: formData,
      });
      if (res.ok || res.status === 400 || res.status === 401 || res.status === 403 || res.status === 500) {
        json = await res.json().catch(() => null);
      }
    } catch {
      res = null;
    }

    // Strategy 2: If relative route not handled or 404, call API_BASE directly
    if (!res || !json || res.status === 404) {
      res = await fetch(`${API_BASE}/api/storage/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      json = await res.json().catch(() => null);
    }

    let records = json?.data as UploadedFileRecord[] | undefined;
    if (records && Array.isArray(records)) {
      records = records.map((r) => ({
        ...r,
        url: r.url && r.url.startsWith('/') && !r.url.startsWith('//') ? `${API_BASE}${r.url}` : r.url,
      }));
    }

    return {
      success: Boolean(res?.ok && json?.success),
      data: records,
      message: json?.message || (res?.ok ? 'Upload successful' : `Upload failed (${res?.status || 'Unknown error'})`),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error uploading file to storage';
    return { success: false, message };
  }
}


/**
 * Delete a file from SeaweedFS S3 storage and remove its metadata
 */
export async function deleteApiFile(keyOrId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const adminPasskey = typeof window !== 'undefined' ? (sessionStorage.getItem('zap_admin_pass') || 'zap@admin2026') : 'zap@admin2026';
    const authToken = token || adminPasskey;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'x-admin-key': adminPasskey,
    };

    const relativeUrl = keyOrId.startsWith('uploads/')
      ? `/api/storage/files/${keyOrId}`
      : `/api/storage/${keyOrId}`;

    let res: Response | null = null;
    try {
      res = await fetch(relativeUrl, {
        method: 'DELETE',
        headers,
      });
    } catch {
      res = null;
    }

    if (!res || res.status === 404) {
      const directUrl = keyOrId.startsWith('uploads/')
        ? `${API_BASE}/api/storage/files/${keyOrId}`
        : `${API_BASE}/api/storage/${keyOrId}`;
      res = await fetch(directUrl, {
        method: 'DELETE',
        headers,
      });
    }

    const json = await res.json().catch(() => null);
    return {
      success: Boolean(res?.ok && json?.success),
      message: json?.message || (res?.ok ? 'File deleted successfully' : 'Delete failed'),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete file from storage';
    return { success: false, message };
  }
}

/**
 * Fetch all orders from PostgreSQL backend (Admin)
 */
export async function fetchApiOrders(): Promise<Order[]> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-key': 'zap@admin2026',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/admin/orders`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const json = await res.json();
    const rawOrders: Array<Record<string, unknown>> = json.data?.data || json.data || [];

    return rawOrders.map((o) => {
      const user = (o.user as Record<string, unknown>) || {};
      const addr = (o.address as Record<string, unknown>) || {};
      return {
        id: String(o.id || ''),
        orderNumber: String(o.orderNumber || `ZAP-${String(o.id).slice(-6)}`),
        customerName: String(user.name || 'Customer'),
        customerEmail: String(user.email || ''),
        customerPhone: String(user.phone || ''),
        shippingAddress: String(addr.street || ''),
        city: String(addr.city || 'Dhaka'),
        division: String(addr.state || 'Dhaka'),
        items: [],
        subtotal: Number(o.subtotal || o.total || 0),
        shippingCost: Number(o.shippingCost || 0),
        discount: Number(o.discount || 0),
        total: Number(o.total || 0),
        status: (o.status as Order['status']) || 'PENDING',
        paymentStatus: (o.paymentStatus as Order['paymentStatus']) || 'UNPAID',
        paymentMethod: (o.paymentMethod as Order['paymentMethod']) || 'cod',
        createdAt: String(o.createdAt || new Date().toISOString()),
        updatedAt: String(o.updatedAt || new Date().toISOString()),
        notes: o.notes ? String(o.notes) : undefined,
      };
    });
  } catch (err) {
    console.warn('[API fetchApiOrders Error]:', err);
    return [];
  }
}

/**
 * Fetch registered users/customers from PostgreSQL backend (Admin)
 */
export async function fetchApiCustomers(): Promise<Customer[]> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-key': 'zap@admin2026',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/admin/users`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const json = await res.json();
    const rawUsers: Array<Record<string, unknown>> = json.data?.data || json.data || [];

    return rawUsers.map((u) => {
      const counts = (u._count as Record<string, number>) || {};
      return {
        id: String(u.id || ''),
        name: String(u.name || 'Customer'),
        email: String(u.email || ''),
        phone: String(u.phone || ''),
        city: 'Dhaka',
        division: 'Dhaka',
        totalOrders: counts.orders || 0,
        totalSpent: 0,
        loyaltyPoints: (counts.orders || 0) * 20,
        status: u.role === 'ADMIN' ? 'vip' : 'active',
        joinedDate: String(u.createdAt || new Date().toISOString()).slice(0, 10),
      };
    });
  } catch (err) {
    console.warn('[API fetchApiCustomers Error]:', err);
    return [];
  }
}

export interface ApiBannersResponse {
  heroSlides: HeroSlide[];
  promoBanners?: PromoBanner[];
}

/**
 * Fetch all banners (hero slides & promotional cards) from PostgreSQL backend
 */
export async function fetchApiBanners(): Promise<ApiBannersResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/banners`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as ApiBannersResponse;
    }
    return null;
  } catch (err) {
    console.warn('[API fetchApiBanners Error]:', err);
    return null;
  }
}

/**
 * Bulk synchronize all banners with PostgreSQL backend (Admin)
 */
export async function saveAllApiBanners(
  heroSlides: HeroSlide[],
  promoBanners: PromoBanner[] = []
): Promise<boolean> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-key': 'zap@admin2026',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/banners`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ heroSlides, promoBanners }),
    });

    return res.ok;
  } catch (err) {
    console.warn('[API saveAllApiBanners Error]:', err);
    return false;
  }
}

/**
 * Save single banner (Hero or Promo) to PostgreSQL backend (Admin)
 */
export async function createOrUpdateApiBanner(banner: Partial<HeroSlide & PromoBanner>): Promise<boolean> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-key': 'zap@admin2026',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/banners`, {
      method: 'POST',
      headers,
      body: JSON.stringify(banner),
    });

    return res.ok;
  } catch (err) {
    console.warn('[API createOrUpdateApiBanner Error]:', err);
    return false;
  }
}

/**
 * Delete a banner by id from PostgreSQL backend (Admin)
 */
export async function deleteApiBanner(bannerId: string): Promise<boolean> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-key': 'zap@admin2026',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/banners/${bannerId}`, {
      method: 'DELETE',
      headers,
    });

    return res.ok;
  } catch (err) {
    console.warn('[API deleteApiBanner Error]:', err);
    return false;
  }
}


