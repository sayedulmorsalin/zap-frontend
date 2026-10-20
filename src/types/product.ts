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
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
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
  colors: { name: string; hex: string }[];
  inStock: boolean;
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
