import { Product, BrandInfo, ShoeCategory } from '../types/product';
import { Order, Customer } from '../types/admin';

// In Next.js client, requests to '/api/...' are proxied via next.config.ts rewrites to http://localhost:3001
const API_BASE = typeof window !== 'undefined' ? '' : 'http://localhost:3001';

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
  images?: Array<string | { url: string }>;
  brand?: { name: string; slug: string };
  category?: { name: string; slug: string };
  variants?: Array<{ size?: string; color?: string; stock?: number }>;
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

  const images: string[] = Array.isArray(bp.images) && bp.images.length > 0
    ? bp.images.map((img) => typeof img === 'string' ? img : img.url)
    : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'];

  const variantSizes = Array.isArray(bp.variants)
    ? Array.from(new Set(bp.variants.map((v) => v.size).filter((s): s is string => Boolean(s))))
    : ['39', '40', '41', '42', '43', '44'];

  const variantColors = Array.isArray(bp.variants)
    ? Array.from(new Set(bp.variants.map((v) => v.color).filter((c): c is string => Boolean(c)))).map((cName) => ({
        name: cName,
        hex: cName.toLowerCase().includes('white') ? '#FFFFFF' 
          : cName.toLowerCase().includes('red') ? '#DC2626'
          : cName.toLowerCase().includes('blue') || cName.toLowerCase().includes('navy') ? '#1E3A8A'
          : '#18181B'
      }))
    : [{ name: 'Black', hex: '#18181B' }];

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
    rating: bp.rating ? Number(bp.rating) : 4.8,
    reviewCount: bp._count?.reviews || bp.reviewCount || 12,
    description: bp.description || 'Crafted with premium materials and ergonomic precision.',
    features: bp.features || [
      'High-grade premium materials',
      'Ergonomic shock-absorbing insole',
      'Durable non-slip rubber outsole',
      'Breathable interior lining',
    ],
    images,
    sizes: variantSizes.length > 0 ? variantSizes : ['39', '40', '41', '42', '43', '44'],
    colors: variantColors.length > 0 ? variantColors : [{ name: 'Black', hex: '#18181B' }],
    inStock: bp.isActive !== false,
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
}): Promise<{ products: Product[]; pagination: ApiPagination | null }> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.q) query.set('q', params.q);
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.brandId) query.set('brandId', params.brandId);
    if (params?.gender) query.set('gender', params.gender);

    const qs = query.toString();
    const url = `${API_BASE}/api/products${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
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
 * Update an existing product in PostgreSQL database
 */
export async function updateApiProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; data?: unknown; message?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-key': 'zap@admin2026',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.price !== undefined) payload.price = Number(updates.price);
    if (updates.regularPrice !== undefined && updates.price === undefined) payload.price = Number(updates.regularPrice);
    if (updates.price !== undefined && updates.regularPrice !== undefined && updates.price < updates.regularPrice) {
      payload.salePrice = Number(updates.price);
      payload.price = Number(updates.regularPrice);
    }
    if (updates.sku !== undefined) payload.sku = updates.sku;
    if (updates.gender !== undefined) payload.gender = updates.gender;
    if (updates.isFeatured !== undefined) payload.isFeatured = updates.isFeatured;
    if (updates.inStock !== undefined) payload.isActive = updates.inStock;
    if (updates.category !== undefined) payload.categorySlug = updates.category;
    if (updates.brandSlug !== undefined) payload.brandSlug = updates.brandSlug;
    if (updates.images && updates.images.length > 0) {
      payload.images = updates.images.map((url, idx) => ({
        url,
        isPrimary: idx === 0,
        order: idx,
      }));
    }

    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    return {
      success: res.ok && json.success,
      data: json.data,
      message: json.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update product';
    return { success: false, message };
  }
}

/**
 * Create a new product in PostgreSQL database
 */
export async function createApiProduct(product: Product): Promise<{ success: boolean; data?: unknown; message?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-key': 'zap@admin2026',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const payload = {
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: product.regularPrice || product.price,
      salePrice: product.regularPrice > product.price ? product.price : null,
      gender: product.gender,
      isFeatured: !!product.isFeatured,
      isActive: product.inStock !== false,
      categorySlug: product.category,
      brandSlug: product.brandSlug || 'zap',
      images: product.images.map((url, idx) => ({
        url,
        isPrimary: idx === 0,
        order: idx,
      })),
      variants: product.sizes.flatMap((size) =>
        product.colors.map((c) => ({
          size,
          color: c.name,
          colorHex: c.hex,
          stock: 20,
        }))
      ),
    };

    const res = await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    return {
      success: res.ok && json.success,
      data: json.data,
      message: json.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return { success: false, message };
  }
}

/**
 * Delete / deactivate a product in PostgreSQL database
 */
export async function deleteApiProduct(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zap_access_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-key': 'zap@admin2026',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method: 'DELETE',
      headers,
    });

    const json = await res.json();
    return {
      success: res.ok && json.success,
      message: json.message,
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
    const headers: Record<string, string> = {
      'x-admin-key': 'zap@admin2026',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append('entityType', entityType);
    if (entityId) formData.append('entityId', entityId);

    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await fetch(`${API_BASE}/api/storage/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await res.json();
    return {
      success: res.ok && json.success,
      data: json.data as UploadedFileRecord[] | undefined,
      message: json.message || (res.ok ? 'Upload successful' : 'Upload failed'),
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-key': 'zap@admin2026',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = keyOrId.startsWith('uploads/')
      ? `${API_BASE}/api/storage/files/${keyOrId}`
      : `${API_BASE}/api/storage/${keyOrId}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    const json = await res.json();
    return {
      success: res.ok && json.success,
      message: json.message,
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

