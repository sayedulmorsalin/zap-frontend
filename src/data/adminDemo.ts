import { Order, Coupon, Customer, StoreSettings } from '../types/admin';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'ZAP Footwear Bangladesh',
  supportPhone: '+880 9666 777 222',
  supportEmail: 'care@zapfootwearbd.com',
  announcementTicker: '⚡ EID & SPRING DROP: FLAT 15% OFF USE CODE "ZAP15" • COMPLIMENTARY EXPRESS DELIVERY NATIONWIDE ON ORDERS OVER TK 2,500',
  freeShippingThreshold: 2500,
  standardShippingFee: 70,
  deliveryFeeInsideDhaka: 70,
  deliveryFeeOutsideDhaka: 130,
  centralWarehouse: 'ZAP Central Logistics Hub, Tongi Industrial Zone, Gazipur, Dhaka',
  currencySymbol: '৳',
  isMaintenanceMode: false,
  taxPercent: 0,
};

// Real coupons, customers, and orders are retrieved from PostgreSQL
export const INITIAL_COUPONS: Coupon[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_ORDERS: Order[] = [];
