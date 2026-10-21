import { Product } from './product';

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 
  | 'UNPAID'
  | 'PAID'
  | 'REFUNDED';

export type PaymentMethod = 
  | 'cod'
  | 'bkash'
  | 'nagad'
  | 'card';

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  division: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  courierName?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  couponCode?: string;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minSpend: number;
  maxDiscount?: number;
  isActive: boolean;
  usedCount: number;
  expiresAt: string;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  division: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  status: 'active' | 'vip' | 'blocked';
  joinedDate: string;
  avatarUrl?: string;
}

export interface StoreSettings {
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  announcementTicker: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  centralWarehouse: string;
  currencySymbol: string;
  isMaintenanceMode: boolean;
  taxPercent: number;
}

export type AdminTab = 
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'brands'
  | 'coupons'
  | 'customers'
  | 'banners'
  | 'settings';

