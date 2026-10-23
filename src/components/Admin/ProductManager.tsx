'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  X, 
  UploadCloud, 
  Image as ImageIcon, 
  ArrowUp, 
  ArrowDown, 
  Loader2, 
  Link2, 
  AlertCircle,
  Palette,
  Minus,
  Check,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, Gender, ShoeCategory, ProductVariant, ColorVariantGroup } from '../../types/product';
import { uploadApiFiles } from '../../services/api';

export interface ColorwayItem {
  id: string;
  color: string;
  colorHex: string;
  images: string[];
  sizes: Array<{
    size: string;
    stock: number;
  }>;
}

export const PRESET_COLORS = [
  { name: 'Classic Black', hex: '#09090B' },
  { name: 'Arctic White', hex: '#FFFFFF' },
  { name: 'Cognac Brown', hex: '#5D4037' },
  { name: 'Beige / Tan', hex: '#D7CCC8' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Olive Green', hex: '#4D7C0F' },
  { name: 'Slate Grey', hex: '#64748B' },
];

export const STANDARD_SHOE_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45', '46'];

export const ProductManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, brands } = useShop();

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // SeaweedFS Upload State
  const [uploadingColorwayId, setUploadingColorwayId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [colorwayUrlInput, setColorwayUrlInput] = useState<{ [id: string]: string }>({});
  const [showColorwayUrl, setShowColorwayUrl] = useState<{ [id: string]: boolean }>({});
  const [customSizeInput, setCustomSizeInput] = useState<{ [id: string]: string }>({});

  // Colorways State (with images & size-specific stock)
  const [colorways, setColorways] = useState<ColorwayItem[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: brands[0]?.name || 'ZAP Signature',
    category: 'formal' as ShoeCategory,
    categoryName: 'Formal Shoes',
    gender: 'MEN' as Gender,
    price: 0,
    regularPrice: 0,
    sku: '',
    description: '',
    inStock: true,
    isFeatured: false,
    isNewArrival: true,
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || p.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesGender = selectedGender === 'all' || p.gender === selectedGender;
    const matchesStock = 
      stockFilter === 'all' || 
      (stockFilter === 'in_stock' && p.inStock) || 
      (stockFilter === 'out_of_stock' && !p.inStock);
    return matchesSearch && matchesBrand && matchesGender && matchesStock;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      brand: brands[0]?.name || 'ZAP Signature',
      category: 'formal',
      categoryName: 'Formal Shoes',
      gender: 'MEN',
      price: 0,
      regularPrice: 0,
      sku: `ZAP-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '',
      inStock: true,
      isFeatured: false,
      isNewArrival: true,
    });
    setColorways([
      {
        id: `cw-${Date.now()}-1`,
        color: 'Classic Black',
        colorHex: '#09090B',
        images: [],
        sizes: [
          { size: '39', stock: 10 },
          { size: '40', stock: 10 },
          { size: '41', stock: 10 },
          { size: '42', stock: 10 },
          { size: '43', stock: 10 },
          { size: '44', stock: 5 },
        ],
      },
    ]);
    setUploadError(null);
    setColorwayUrlInput({});
    setShowColorwayUrl({});
    setCustomSizeInput({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      categoryName: product.categoryName,
      gender: product.gender,
      price: product.price,
      regularPrice: product.regularPrice,
      sku: product.sku,
      description: product.description,
      inStock: product.inStock,
      isFeatured: !!product.isFeatured,
      isNewArrival: !!product.isNewArrival,
    });

    if (product.colorVariants && product.colorVariants.length > 0) {
      setColorways(
        product.colorVariants.map((cv, idx) => ({
          id: `cw-${idx + 1}-${Date.now()}`,
          color: cv.color || 'Standard',
          colorHex: cv.colorHex || '#09090B',
          images: cv.images || [],
          sizes: cv.sizes.map((s) => ({ size: String(s.size), stock: Number(s.stock) || 0 })),
        }))
      );
    } else if (product.variants && product.variants.length > 0) {
      const grouped: { [col: string]: { colorHex: string; sizes: { size: string; stock: number }[] } } = {};
      product.variants.forEach((v) => {
        const col = v.color || 'Classic Black';
        if (!grouped[col]) {
          grouped[col] = { colorHex: v.colorHex || '#09090B', sizes: [] };
        }
        if (!grouped[col].sizes.some((s) => s.size === v.size)) {
          grouped[col].sizes.push({ size: v.size, stock: v.stock });
        }
      });
      const entries = Object.entries(grouped);
      setColorways(
        entries.map(([col, data], idx) => {
          const matchedImages = product.images.filter((img) =>
            img.toLowerCase().includes(col.toLowerCase())
          );
          return {
            id: `cw-${idx + 1}-${Date.now()}`,
            color: col,
            colorHex: data.colorHex,
            images: matchedImages.length > 0 ? matchedImages : (entries.length === 1 ? product.images : []),
            sizes: data.sizes,
          };
        })
      );
    } else {
      const cols = product.colors && product.colors.length > 0
        ? product.colors
        : [{ name: 'Classic Black', hex: '#09090B' }];
      const szs = product.sizes && product.sizes.length > 0
        ? product.sizes
        : ['39', '40', '41', '42', '43', '44'];
      setColorways(
        cols.map((c, idx) => ({
          id: `cw-${idx + 1}-${Date.now()}`,
          color: c.name,
          colorHex: c.hex,
          images: idx === 0 ? product.images : (c.images || []),
          sizes: szs.map((sz) => ({ size: sz, stock: 10 })),
        }))
      );
    }

    setUploadError(null);
    setColorwayUrlInput({});
    setShowColorwayUrl({});
    setCustomSizeInput({});
  };

  // Colorway handlers
  const handleAddColorway = () => {
    const lastCw = colorways[colorways.length - 1];
    const defaultSizes = lastCw
      ? lastCw.sizes.map((s) => ({ size: s.size, stock: 10 }))
      : [
          { size: '39', stock: 10 },
          { size: '40', stock: 10 },
          { size: '41', stock: 10 },
          { size: '42', stock: 10 },
          { size: '43', stock: 10 },
          { size: '44', stock: 5 },
        ];

    const nextColorIndex = colorways.length;
    const preset = PRESET_COLORS[nextColorIndex % PRESET_COLORS.length];

    setColorways((prev) => [
      ...prev,
      {
        id: `cw-${Date.now()}-${prev.length + 1}`,
        color: preset.name,
        colorHex: preset.hex,
        images: [],
        sizes: defaultSizes,
      },
    ]);
  };

  const handleRemoveColorway = (id: string) => {
    if (colorways.length <= 1) return;
    setColorways((prev) => prev.filter((cw) => cw.id !== id));
  };

  const handleUpdateColorway = (id: string, updates: Partial<ColorwayItem>) => {
    setColorways((prev) =>
      prev.map((cw) => (cw.id === id ? { ...cw, ...updates } : cw))
    );
  };

  const handleUpdateSizeStock = (colorwayId: string, sizeName: string, stock: number) => {
    const validStock = Math.max(0, isNaN(stock) ? 0 : Math.round(stock));
    setColorways((prev) =>
      prev.map((cw) =>
        cw.id === colorwayId
          ? {
              ...cw,
              sizes: cw.sizes.map((s) => (s.size === sizeName ? { ...s, stock: validStock } : s)),
            }
          : cw
      )
    );
  };

  const handleAddSizeToColorway = (colorwayId: string, sizeName: string, defaultStock: number = 10) => {
    const trimmed = sizeName.trim();
    if (!trimmed) return;
    setColorways((prev) =>
      prev.map((cw) => {
        if (cw.id !== colorwayId) return cw;
        if (cw.sizes.some((s) => s.size === trimmed)) return cw;
        return {
          ...cw,
          sizes: [...cw.sizes, { size: trimmed, stock: defaultStock }],
        };
      })
    );
  };

  const handleRemoveSizeFromColorway = (colorwayId: string, sizeName: string) => {
    setColorways((prev) =>
      prev.map((cw) =>
        cw.id === colorwayId
          ? {
              ...cw,
              sizes: cw.sizes.filter((s) => s.size !== sizeName),
            }
          : cw
      )
    );
  };

  const handleBulkSetStock = (colorwayId: string, stock: number) => {
    setColorways((prev) =>
      prev.map((cw) =>
        cw.id === colorwayId
          ? {
              ...cw,
              sizes: cw.sizes.map((s) => ({ ...s, stock })),
            }
          : cw
      )
    );
  };

  const handleColorwayFileUpload = async (colorwayId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadingColorwayId(colorwayId);
    setUploadError(null);

    const filesArray = Array.from(fileList);
    try {
      const res = await uploadApiFiles(filesArray, 'PRODUCT');
      if (res.success && res.data && res.data.length > 0) {
        const newUrls = res.data.map((item) => item.url);
        setColorways((prev) =>
          prev.map((cw) =>
            cw.id === colorwayId
              ? { ...cw, images: [...cw.images, ...newUrls] }
              : cw
          )
        );
      } else {
        setUploadError(res.message || 'Upload to SeaweedFS failed.');
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Network error during file upload');
    } finally {
      setUploadingColorwayId(null);
      e.target.value = '';
    }
  };

  const handleSetColorwayPrimaryImage = (colorwayId: string, imgIdx: number) => {
    if (imgIdx === 0) return;
    setColorways((prev) =>
      prev.map((cw) => {
        if (cw.id !== colorwayId) return cw;
        const updated = [...cw.images];
        const [picked] = updated.splice(imgIdx, 1);
        updated.unshift(picked);
        return { ...cw, images: updated };
      })
    );
  };

  const handleRemoveColorwayImage = (colorwayId: string, imgIdx: number) => {
    setColorways((prev) =>
      prev.map((cw) =>
        cw.id === colorwayId
          ? { ...cw, images: cw.images.filter((_, idx) => idx !== imgIdx) }
          : cw
      )
    );
  };

  const handleAddColorwayManualUrl = (colorwayId: string) => {
    const val = (colorwayUrlInput[colorwayId] || '').trim();
    if (!val) return;
    setColorways((prev) =>
      prev.map((cw) =>
        cw.id === colorwayId
          ? { ...cw, images: [...cw.images, val] }
          : cw
      )
    );
    setColorwayUrlInput((prev) => ({ ...prev, [colorwayId]: '' }));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // Flatten all images across colorways
    const allImages = colorways.flatMap((cw) => cw.images).filter(Boolean);
    const finalImages = allImages.length > 0
      ? Array.from(new Set(allImages))
      : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'];

    // Construct colors
    const finalColors = colorways.map((cw) => ({
      name: cw.color.trim() || 'Classic Black',
      hex: cw.colorHex || '#09090B',
      images: cw.images,
    }));

    // Construct distinct sizes
    const distinctSizes = Array.from(
      new Set(colorways.flatMap((cw) => cw.sizes.map((s) => String(s.size).trim())).filter(Boolean))
    );
    const finalSizes = distinctSizes.length > 0 ? distinctSizes : ['39', '40', '41', '42', '43', '44'];

    // Construct variants array with exact stock per size and color
    const variants: ProductVariant[] = colorways.flatMap((cw) =>
      cw.sizes.map((sz) => ({
        size: String(sz.size).trim(),
        color: cw.color.trim() || 'Classic Black',
        colorHex: cw.colorHex || '#09090B',
        stock: Math.max(0, Number(sz.stock) || 0),
        additionalPrice: 0,
      }))
    );

    // ColorVariantGroup representation
    const colorVariants: ColorVariantGroup[] = colorways.map((cw) => ({
      color: cw.color.trim() || 'Classic Black',
      colorHex: cw.colorHex || '#09090B',
      images: cw.images.length > 0 ? cw.images : finalImages,
      sizes: cw.sizes.map((s) => ({
        size: String(s.size).trim(),
        stock: Math.max(0, Number(s.stock) || 0),
      })),
    }));

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const finalInStock = totalStock > 0 && formData.inStock;

    const discountPercentage = Math.round(
      ((formData.regularPrice - formData.price) / formData.regularPrice) * 100
    );

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        categoryName: formData.categoryName,
        gender: formData.gender,
        price: Number(formData.price),
        regularPrice: Number(formData.regularPrice),
        discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
        sku: formData.sku,
        description: formData.description,
        inStock: finalInStock,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        images: finalImages,
        sizes: finalSizes,
        colors: finalColors,
        variants,
        colorVariants,
      };
      updateProduct(updated);
      setEditingProduct(null);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: formData.sku?.trim() || `ZAP-${Date.now().toString().slice(-6)}`,
        brand: formData.brand || 'ZAP Signature',
        brandSlug: (formData.brand || 'zap-signature').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: formData.category,
        categoryName: formData.categoryName,
        gender: formData.gender,
        price: Number(formData.price),
        regularPrice: Number(formData.regularPrice),
        discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        rating: 4.8,
        reviewCount: 1,
        description: formData.description,
        features: [
          'Genuine artisan finish',
          'Comfort ergonomic footbed',
          'High abrasion non-slip outsole',
        ],
        images: finalImages,
        sizes: finalSizes,
        colors: finalColors,
        inStock: finalInStock,
        variants,
        colorVariants,
      };
      addProduct(newProd);
      setIsAddOpen(false);
    }
  };

  const handleToggleFeatured = (product: Product) => {
    updateProduct({ ...product, isFeatured: !product.isFeatured });
  };

  const handleToggleStock = (product: Product) => {
    updateProduct({ ...product, inStock: !product.inStock });
  };

  return (
    <div>
      {/* Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1, width: '100%' }}>
          <div style={{ position: 'relative', minWidth: '200px', flex: 1, width: '100%' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by shoe name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="admin-input"
              style={{ flex: 1, minWidth: '95px' }}
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>

            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="admin-input"
              style={{ flex: 1, minWidth: '95px' }}
            >
              <option value="all">All Genders</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="KIDS">Kids</option>
              <option value="UNISEX">Unisex</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="admin-input"
              style={{ flex: 1, minWidth: '95px' }}
            >
              <option value="all">All Stock</option>
              <option value="in_stock">In Stock Only</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Add Product Button */}
        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ width: '100%', maxWidth: '100%', justifyContent: 'center', padding: '10px 16px' }}
        >
          <Plus size={16} />
          <span>Add New Footwear</span>
        </button>
      </div>

      {/* Products Catalog Container */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Catalog ({filteredProducts.length} Footwear Styles)
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, marginTop: '2px' }}>
              Full control over live storefront products, pricing, and stock status
            </p>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="admin-desktop-table-view" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Brand & Line</th>
                <th>Gender</th>
                <th>Price (BDT)</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        flexShrink: 0,
                        position: 'relative',
                      }}>
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          width={46}
                          height={46}
                          unoptimized
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ maxWidth: '240px' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {p.categoryName} • Sizes: {p.sizes.join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                    {p.sku}
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: '#F1F5F9',
                      color: '#0F172A',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {p.brand}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    {p.gender}
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#D32F2F', fontSize: '0.9rem' }}>
                      ৳ {p.price.toLocaleString()}
                    </div>
                    {p.regularPrice > p.price && (
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ৳ {p.regularPrice.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStock(p)}
                      style={{
                        backgroundColor: p.inStock ? '#DCFCE7' : '#FEE2E2',
                        color: p.inStock ? '#15803D' : '#B91C1C',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: p.isFeatured ? '#D97706' : '#CBD5E1',
                      }}
                      title={p.isFeatured ? 'Featured on Homepage' : 'Mark as Featured'}
                    >
                      <Star size={18} fill={p.isFeatured ? '#D97706' : 'none'} />
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        style={{
                          backgroundColor: '#F1F5F9',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          color: '#0F172A',
                        }}
                        title="Edit Footwear"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setDeletingProductId(p.id)}
                        style={{
                          backgroundColor: '#FEE2E2',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          color: '#DC2626',
                        }}
                        title="Delete Footwear"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="admin-mobile-cards-view" style={{ padding: '12px' }}>
          {filteredProducts.map((p) => (
            <div key={p.id} className="admin-item-card">
              {/* Top row: Image & Basic Info */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  flexShrink: 0,
                  position: 'relative',
                }}>
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    width={60}
                    height={60}
                    unoptimized
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                    <div style={{
                      fontWeight: 800,
                      color: '#0F172A',
                      fontSize: '0.88rem',
                      lineHeight: 1.25,
                      marginBottom: '4px',
                    }}>
                      {p.name}
                    </div>
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: p.isFeatured ? '#D97706' : '#CBD5E1',
                        flexShrink: 0,
                      }}
                      title={p.isFeatured ? 'Featured on Homepage' : 'Mark as Featured'}
                    >
                      <Star size={18} fill={p.isFeatured ? '#D97706' : 'none'} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{
                      backgroundColor: '#F1F5F9',
                      color: '#0F172A',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}>
                      {p.brand}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                      {p.gender} &bull; {p.categoryName}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    SKU: <strong>{p.sku}</strong>
                  </div>
                </div>
              </div>

              {/* Bottom row: Price, Stock toggle, Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '10px',
                borderTop: '1px solid #F1F5F9',
                marginTop: '4px',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontWeight: 900, color: '#D32F2F', fontSize: '0.98rem' }}>
                    ৳ {p.price.toLocaleString()}
                  </div>
                  {p.regularPrice > p.price && (
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                      ৳ {p.regularPrice.toLocaleString()}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleToggleStock(p)}
                    style={{
                      backgroundColor: p.inStock ? '#DCFCE7' : '#FEE2E2',
                      color: p.inStock ? '#15803D' : '#B91C1C',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.inStock ? 'IN STOCK' : 'OUT'}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(p)}
                    style={{
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      color: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                    title="Edit Footwear"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeletingProductId(p.id)}
                    style={{
                      backgroundColor: '#FEE2E2',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Delete Footwear"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddOpen || editingProduct) && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '880px', width: '95%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingProduct ? 'Edit Footwear Specifications' : 'Publish New Footwear to Store'}
              </h3>
              <button
                onClick={() => { setIsAddOpen(false); setEditingProduct(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Product Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZAP Signature Royal Oxford Derby Shoe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="admin-input"
                />
              </div>

              {/* SKU & Brand */}
              <div className="admin-grid-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Brand Line *
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="admin-input"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Gender */}
              <div className="admin-grid-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      category: e.target.value as ShoeCategory,
                      categoryName: e.target.value === 'formal' ? 'Formal Shoes' : e.target.value === 'sneakers' ? 'Sneakers' : 'Casual',
                    })}
                    className="admin-input"
                  >
                    <option value="formal">Formal Shoes</option>
                    <option value="sneakers">Sneakers & Runners</option>
                    <option value="sandals">Sandals & Chappals</option>
                    <option value="casual">Casual Loafers</option>
                    <option value="boots">Heritage Boots</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Target Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="admin-input"
                  >
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="KIDS">Kids</option>
                    <option value="UNISEX">Unisex</option>
                  </select>
                </div>
              </div>

              {/* Price & Regular Price */}
              <div className="admin-grid-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Selling Price (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Regular/MSRP Price (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.regularPrice}
                    onChange={(e) => setFormData({ ...formData, regularPrice: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Product Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe footwear construction, upper materials, insole comfort, ergonomics, and styling advice..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="admin-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* ─── COLORWAYS, PHOTOS & SIZE-WISE STOCK INVENTORY ─── */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderBottom: '1px solid #E2E8F0',
                  paddingBottom: '14px',
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <Palette size={18} color="#D32F2F" />
                      <span>Colorways, Photos & Size-Wise Stock</span>
                      <span style={{
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}>
                        {colorways.length} {colorways.length === 1 ? 'Color' : 'Colors'} Configured
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '4px 0 0 0' }}>
                      Upload shoe photos for each color, set sizes, and define exact stock per size (e.g. Size 40: 10 shoes, Size 41: 5 shoes).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddColorway}
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    <Plus size={14} color="#D32F2F" />
                    <span>Add Another Colorway</span>
                  </button>
                </div>

                {/* Upload Error Banner */}
                {uploadError && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Colorway Cards */}
                {colorways.map((cw, cwIdx) => {
                  const cwTotalStock = cw.sizes.reduce((sum, s) => sum + s.stock, 0);
                  const isUploadingThis = uploadingColorwayId === cw.id;
                  const isShowUrl = showColorwayUrl[cw.id] || false;
                  const manualUrl = colorwayUrlInput[cw.id] || '';
                  const customSize = customSizeInput[cw.id] || '';

                  return (
                    <div
                      key={cw.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      {/* Top Bar: Color Title, Swatch, Hex & Delete */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        borderBottom: '1px solid #F1F5F9',
                        paddingBottom: '12px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
                          <span style={{
                            backgroundColor: '#0F172A',
                            color: '#FFFFFF',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '4px',
                          }}>
                            COLORWAY #{cwIdx + 1}
                          </span>

                          {/* Color Swatch Picker */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: cw.colorHex || '#09090B',
                              border: '2px solid #CBD5E1',
                              overflow: 'hidden',
                              position: 'relative',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            }}>
                              <input
                                type="color"
                                value={cw.colorHex || '#09090B'}
                                onChange={(e) => handleUpdateColorway(cw.id, { colorHex: e.target.value })}
                                style={{
                                  position: 'absolute',
                                  top: -8,
                                  left: -8,
                                  width: 44,
                                  height: 44,
                                  opacity: 0,
                                  cursor: 'pointer',
                                }}
                                title="Pick hex color"
                              />
                            </div>

                            <input
                              type="text"
                              required
                              placeholder="Color name (e.g. Classic Black)"
                              value={cw.color}
                              onChange={(e) => handleUpdateColorway(cw.id, { color: e.target.value })}
                              className="admin-input"
                              style={{ width: '180px', fontWeight: 700 }}
                            />

                            <input
                              type="text"
                              value={cw.colorHex}
                              onChange={(e) => handleUpdateColorway(cw.id, { colorHex: e.target.value })}
                              className="admin-input"
                              style={{ width: '85px', fontSize: '0.75rem', fontFamily: 'monospace' }}
                              placeholder="#09090B"
                            />
                          </div>

                          {/* Total Stock in this Color */}
                          <span style={{
                            backgroundColor: cwTotalStock > 0 ? '#EFF6FF' : '#FEF2F2',
                            color: cwTotalStock > 0 ? '#1D4ED8' : '#DC2626',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: `1px solid ${cwTotalStock > 0 ? '#BFDBFE' : '#FECACA'}`,
                          }}>
                            {cwTotalStock} pairs total
                          </span>
                        </div>

                        {colorways.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColorway(cw.id)}
                            style={{
                              background: '#FEE2E2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                            title="Remove this colorway"
                          >
                            <Trash2 size={13} />
                            <span>Remove Color</span>
                          </button>
                        )}
                      </div>

                      {/* Quick Color Presets */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Quick presets:</span>
                        {PRESET_COLORS.map((pc) => (
                          <button
                            key={pc.name}
                            type="button"
                            onClick={() => handleUpdateColorway(cw.id, { color: pc.name, colorHex: pc.hex })}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: cw.color === pc.name ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
                              backgroundColor: cw.color === pc.name ? '#0F172A' : '#F8FAFC',
                              color: cw.color === pc.name ? '#FFFFFF' : '#334155',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: pc.hex,
                              border: '1px solid rgba(0,0,0,0.15)',
                            }} />
                            <span>{pc.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* ─── PHOTOS FOR THIS COLORWAY ─── */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ImageIcon size={14} color="#D32F2F" />
                            <span>Photos for {cw.color || 'this color'} ({cw.images.length})</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>• First photo is shown on customer selection</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setShowColorwayUrl((prev) => ({ ...prev, [cw.id]: !isShowUrl }))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#475569',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Link2 size={12} />
                            <span>{isShowUrl ? 'Hide URL' : 'Add External URL'}</span>
                          </button>
                        </div>

                        {/* Drag and Drop Zone */}
                        <div
                          style={{
                            border: '2px dashed #CBD5E1',
                            borderRadius: '8px',
                            padding: '14px',
                            textAlign: 'center',
                            backgroundColor: '#F8FAFC',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#D32F2F';
                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#CBD5E1';
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#CBD5E1';
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              const pseudoEvent = {
                                target: { files: e.dataTransfer.files, value: '' },
                              } as unknown as React.ChangeEvent<HTMLInputElement>;
                              handleColorwayFileUpload(cw.id, pseudoEvent);
                            }
                          }}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                            onChange={(e) => handleColorwayFileUpload(cw.id, e)}
                            disabled={isUploadingThis}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: isUploadingThis ? 'not-allowed' : 'pointer',
                            }}
                          />
                          {isUploadingThis ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#D32F2F' }}>
                              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
                              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                Uploading {cw.color} photos to SeaweedFS...
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <UploadCloud size={18} color="#D32F2F" />
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>
                                Click to browse or drag & drop photos of {cw.color || 'this color'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                (PNG, JPG, WebP)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Optional Manual URL Input */}
                        {isShowUrl && (
                          <div style={{
                            marginTop: '8px',
                            padding: '10px',
                            borderRadius: '6px',
                            backgroundColor: '#F1F5F9',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                          }}>
                            <input
                              type="url"
                              placeholder="https://... or /images/..."
                              value={manualUrl}
                              onChange={(e) => setColorwayUrlInput((prev) => ({ ...prev, [cw.id]: e.target.value }))}
                              className="admin-input"
                              style={{ flex: 1, backgroundColor: '#FFFFFF', fontSize: '0.8rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddColorwayManualUrl(cw.id)}
                              disabled={!manualUrl.trim()}
                              className="btn btn-secondary btn-sm"
                              style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                            >
                              Add Photo URL
                            </button>
                          </div>
                        )}

                        {/* Photos Thumbnail Strip */}
                        {cw.images.length > 0 && (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                            gap: '8px',
                            marginTop: '10px',
                          }}>
                            {cw.images.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                style={{
                                  position: 'relative',
                                  border: imgIdx === 0 ? '2px solid #D32F2F' : '1px solid #E2E8F0',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  backgroundColor: '#FFFFFF',
                                  aspectRatio: '1',
                                }}
                              >
                                <Image
                                  src={imgUrl}
                                  alt={`${cw.color} photo ${imgIdx + 1}`}
                                  fill
                                  sizes="90px"
                                  style={{ objectFit: 'cover' }}
                                  unoptimized={imgUrl.startsWith('/api/')}
                                />

                                {imgIdx === 0 ? (
                                  <div style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: '3px',
                                    backgroundColor: '#D32F2F',
                                    color: '#FFFFFF',
                                    fontSize: '0.58rem',
                                    fontWeight: 800,
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    zIndex: 2,
                                  }}>
                                    PRIMARY
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetColorwayPrimaryImage(cw.id, imgIdx)}
                                    style={{
                                      position: 'absolute',
                                      top: '3px',
                                      left: '3px',
                                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: '3px',
                                      padding: '1px 4px',
                                      fontSize: '0.58rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      zIndex: 2,
                                    }}
                                  >
                                    Primary
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRemoveColorwayImage(cw.id, imgIdx)}
                                  style={{
                                    position: 'absolute',
                                    bottom: '3px',
                                    right: '3px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '3px',
                                    padding: '2px 4px',
                                    cursor: 'pointer',
                                    zIndex: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  title="Delete photo"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* ─── SIZES & STOCK PER SIZE INVENTORY ─── */}
                      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Layers size={14} color="#2563EB" />
                            <span>Sizes & Stock Quantity in {cw.color || 'this color'}</span>
                          </label>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleBulkSetStock(cw.id, 10)}
                              style={{
                                background: 'none',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: '#475569',
                                cursor: 'pointer',
                              }}
                            >
                              Set All to 10 pcs
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                ['39', '40', '41', '42', '43', '44'].forEach((s) => handleAddSizeToColorway(cw.id, s, 10));
                              }}
                              style={{
                                background: 'none',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: '#475569',
                                cursor: 'pointer',
                              }}
                            >
                              + Standard 39-44
                            </button>
                          </div>
                        </div>

                        {/* Quick Size Add Pills & Custom Input */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexWrap: 'wrap',
                          marginBottom: '12px',
                          backgroundColor: '#F8FAFC',
                          padding: '8px 10px',
                          borderRadius: '6px',
                        }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Quick Add Size:</span>
                          {STANDARD_SHOE_SIZES.map((sz) => {
                            const alreadyAdded = cw.sizes.some((s) => s.size === sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => handleAddSizeToColorway(cw.id, sz, 10)}
                                style={{
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  border: alreadyAdded ? '1px solid #94A3B8' : '1px dashed #CBD5E1',
                                  backgroundColor: alreadyAdded ? '#F1F5F9' : '#FFFFFF',
                                  color: alreadyAdded ? '#64748B' : '#0F172A',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title={alreadyAdded ? `Size ${sz} already added` : `Add Size ${sz}`}
                              >
                                {alreadyAdded ? `✓ ${sz}` : `+ ${sz}`}
                              </button>
                            );
                          })}

                          {/* Custom size input */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                            <input
                              type="text"
                              placeholder="e.g. 47"
                              value={customSize}
                              onChange={(e) => setCustomSizeInput((prev) => ({ ...prev, [cw.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSizeToColorway(cw.id, customSize, 10);
                                  setCustomSizeInput((prev) => ({ ...prev, [cw.id]: '' }));
                                }
                              }}
                              style={{ width: '60px', padding: '3px 6px', fontSize: '0.72rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                handleAddSizeToColorway(cw.id, customSize, 10);
                                setCustomSizeInput((prev) => ({ ...prev, [cw.id]: '' }));
                              }}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#0F172A',
                                color: '#FFFFFF',
                                border: 'none',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Sizes Inventory List */}
                        {cw.sizes.length === 0 ? (
                          <div style={{
                            padding: '16px',
                            textAlign: 'center',
                            color: '#94A3B8',
                            fontSize: '0.78rem',
                            border: '1px dashed #CBD5E1',
                            borderRadius: '6px',
                          }}>
                            No sizes added yet for {cw.color}. Click the quick add size buttons above to configure inventory.
                          </div>
                        ) : (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '8px',
                          }}>
                            {cw.sizes.map((sz) => {
                              const isOutOfStock = sz.stock === 0;
                              const isLowStock = sz.stock > 0 && sz.stock <= 5;

                              return (
                                <div
                                  key={sz.size}
                                  style={{
                                    border: isOutOfStock ? '1px solid #FECACA' : '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    padding: '8px 10px',
                                    backgroundColor: isOutOfStock ? '#FEF2F2' : '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '6px',
                                  }}
                                >
                                  {/* Size Label */}
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                                      Size {sz.size}
                                    </span>
                                    <span style={{
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      color: isOutOfStock ? '#DC2626' : isLowStock ? '#D97706' : '#15803D',
                                    }}>
                                      {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? `${sz.stock} LOW` : `${sz.stock} in stock`}
                                    </span>
                                  </div>

                                  {/* Stock Stepper & Input */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSizeStock(cw.id, sz.size, sz.stock - 1)}
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '4px',
                                        border: '1px solid #CBD5E1',
                                        backgroundColor: '#F8FAFC',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <Minus size={11} />
                                    </button>

                                    <input
                                      type="number"
                                      min="0"
                                      value={sz.stock}
                                      onChange={(e) => handleUpdateSizeStock(cw.id, sz.size, parseInt(e.target.value, 10))}
                                      style={{
                                        width: '46px',
                                        padding: '3px 4px',
                                        fontSize: '0.82rem',
                                        fontWeight: 800,
                                        textAlign: 'center',
                                        borderRadius: '4px',
                                        border: '1px solid #CBD5E1',
                                      }}
                                    />

                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSizeStock(cw.id, sz.size, sz.stock + 1)}
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '4px',
                                        border: '1px solid #CBD5E1',
                                        backgroundColor: '#F8FAFC',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <Plus size={11} />
                                    </button>

                                    {/* Remove Size Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSizeFromColorway(cw.id, sz.size)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#94A3B8',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        marginLeft: '2px',
                                      }}
                                      title={`Remove size ${sz.size}`}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Bottom Total Inventory Banner */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={18} color="#D32F2F" />
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                        Total Product Inventory:{' '}
                        {colorways.reduce((sum, cw) => sum + cw.sizes.reduce((sSum, s) => sSum + s.stock, 0), 0)} pairs
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {colorways.map((cw) => `${cw.color}: ${cw.sizes.reduce((sSum, s) => sSum + s.stock, 0)}`).join(' • ')}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddColorway}
                    style={{
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={13} color="#D32F2F" />
                    <span>+ Add Another Colorway</span>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  />
                  <span>Mark as In Stock</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span>Highlight on Homepage (Featured)</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setEditingProduct(null); }}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Remove Footwear from Catalog?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              This product will be immediately removed from the live public storefront, search results, and brand showcases.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeletingProductId(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deletingProductId);
                  setDeletingProductId(null);
                }}
                className="btn btn-primary btn-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
