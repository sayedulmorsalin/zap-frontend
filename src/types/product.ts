export type Gender = 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX';

export type ShoeCategory = 
  | 'formal' 
  | 'casual' 
  | 'sneakers' 
  | 'sandals' 
  | 'boots' 
  | 'heels' 
  | 'flats' 
  | 'school' 
  | 'bags';

export interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  colorHex?: string;
  stock: number;
  additionalPrice?: number;
}

export interface ColorVariantGroup {
  color: string;
  colorHex: string;
  images: string[];
  sizes: Array<{
    size: string;
    stock: number;
  }>;
  description?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  location?: string;
  rating: number;
  date: string;
  verified?: boolean;
  title?: string;
  comment: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  brandSlug: string;
  category: ShoeCategory;
  categoryName: string;
  gender: Gender;
  price: number;
  regularPrice: number;
  discountPercentage?: number;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string; images?: string[] }[];
  inStock: boolean;
  variants?: ProductVariant[];
  colorVariants?: ColorVariantGroup[];
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface BrandInfo {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoText: string;
  badgeColor: string;
  accentColor: string;
  logoUrl?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedBrands: string[];
  selectedGenders: Gender[];
  priceRange: [number, number];
  selectedSizes: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  inStockOnly: boolean;
}
