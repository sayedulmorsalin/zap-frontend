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
  AlertCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, Gender, ShoeCategory } from '../../types/product';
import { uploadApiFiles } from '../../services/api';

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'ZAP Signature',
    category: 'formal' as ShoeCategory,
    categoryName: 'Formal Shoes',
    gender: 'MEN' as Gender,
    price: 3999,
    regularPrice: 5499,
    sku: '',
    description: '',
    inStock: true,
    isFeatured: false,
    isNewArrival: true,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'] as string[],
    sizesStr: '39, 40, 41, 42, 43, 44',
    colorsStr: 'Black, Dark Brown',
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
      brand: 'ZAP Signature',
      category: 'formal',
      categoryName: 'Formal Shoes',
      gender: 'MEN',
      price: 3999,
      regularPrice: 5499,
      sku: `ZAP-${Math.floor(1000 + Math.random() * 9000)}`,
      description: 'Handcrafted premium footwear with reinforced stitching and cushioned insole.',
      inStock: true,
      isFeatured: false,
      isNewArrival: true,
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'],
      sizesStr: '39, 40, 41, 42, 43, 44',
      colorsStr: 'Black, Dark Brown',
    });
    setUploadError(null);
    setManualUrlInput('');
    setShowManualUrl(false);
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
      images: product.images && product.images.length > 0 ? [...product.images] : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'],
      sizesStr: product.sizes.join(', '),
      colorsStr: product.colors.map(c => c.name).join(', '),
    });
    setUploadError(null);
    setManualUrlInput('');
    setShowManualUrl(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const filesArray = Array.from(fileList);
    try {
      const res = await uploadApiFiles(filesArray, 'PRODUCT');
      if (res.success && res.data && res.data.length > 0) {
        const newUrls = res.data.map((item) => item.url);
        setFormData((prev) => {
          // If previous images only had the generic default placeholder, replace it with newly uploaded images
          const isOnlyPlaceholder =
            prev.images.length === 1 &&
            prev.images[0].includes('unsplash.com/photo-1549298916');
          return {
            ...prev,
            images: isOnlyPlaceholder ? newUrls : [...prev.images, ...newUrls],
          };
        });
      } else {
        setUploadError(res.message || 'Upload to SeaweedFS failed.');
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Network error during file upload');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const updated = [...prev.images];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return { ...prev, images: updated };
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: updated.length > 0 ? updated : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'],
      };
    });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const updated = [...prev.images];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, images: updated };
    });
  };

  const handleAddManualUrl = () => {
    const trimmed = manualUrlInput.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const isOnlyPlaceholder =
        prev.images.length === 1 &&
        prev.images[0].includes('unsplash.com/photo-1549298916');
      return {
        ...prev,
        images: isOnlyPlaceholder ? [trimmed] : [...prev.images, trimmed],
      };
    });
    setManualUrlInput('');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const sizes = formData.sizesStr.split(',').map((s) => s.trim()).filter(Boolean);
    const colors = formData.colorsStr.split(',').map((c) => ({
      name: c.trim(),
      hex: c.toLowerCase().includes('black') ? '#09090B' : c.toLowerCase().includes('brown') ? '#451A03' : '#64748B',
    })).filter((c) => c.name);

    const discountPercentage = Math.round(
      ((formData.regularPrice - formData.price) / formData.regularPrice) * 100
    );

    const validImages = formData.images.filter(Boolean);
    const finalImages = validImages.length > 0
      ? validImages
      : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'];

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
        inStock: formData.inStock,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        images: finalImages,
        sizes: sizes.length ? sizes : ['40', '41', '42'],
        colors: colors.length ? colors : [{ name: 'Standard', hex: '#000000' }],
      };
      updateProduct(updated);
      setEditingProduct(null);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: formData.sku,
        brand: formData.brand,
        brandSlug: formData.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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
        sizes: sizes.length ? sizes : ['39', '40', '41', '42', '43'],
        colors: colors.length ? colors : [{ name: 'Classic Black', hex: '#09090B' }],
        inStock: formData.inStock,
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
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '360px' }}>
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

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="admin-input"
            style={{ width: 'auto' }}
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
            style={{ width: 'auto' }}
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
            style={{ width: 'auto' }}
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Add Product Button */}
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>Add New Footwear</span>
        </button>
      </div>

      {/* Products Table */}
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

        <div style={{ overflowX: 'auto' }}>
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
      </div>

      {/* Add / Edit Modal */}
      {(isAddOpen || editingProduct) && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '640px', padding: '28px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

              {/* Product Images (SeaweedFS S3 Upload & Gallery) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} color="#D32F2F" />
                    <span>Product Images ({formData.images.length})</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>• First image is primary</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Link2 size={13} />
                    <span>{showManualUrl ? 'Hide URL Input' : 'Add External URL'}</span>
                  </button>
                </div>

                {/* SeaweedFS Drag-and-Drop / Upload Zone */}
                <div
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '12px',
                    padding: '20px',
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
                      handleFileUpload(pseudoEvent);
                    }
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                    }}
                  />
                  {isUploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#D32F2F' }}>
                      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        Uploading to SeaweedFS Storage...
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        Verifying magic bytes and registering metadata
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#FEE2E2',
                        color: '#D32F2F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4px',
                      }}>
                        <UploadCloud size={22} />
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                        Click to browse or drag & drop shoe photos
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        PNG, JPG, WebP, GIF, or SVG • Stored on self-hosted SeaweedFS S3
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Error Banner */}
                {uploadError && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <AlertCircle size={14} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Optional Manual URL Input */}
                {showManualUrl && (
                  <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or /images/..."
                      value={manualUrlInput}
                      onChange={(e) => setManualUrlInput(e.target.value)}
                      className="admin-input"
                      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      disabled={!manualUrlInput.trim()}
                      className="btn btn-secondary btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Add URL
                    </button>
                  </div>
                )}

                {/* Image Thumbnails Gallery */}
                {formData.images.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                    gap: '10px',
                    marginTop: '12px',
                  }}>
                    {formData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          border: idx === 0 ? '2px solid #D32F2F' : '1px solid #E2E8F0',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#FFFFFF',
                          aspectRatio: '1',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        }}
                      >
                        <Image
                          src={imgUrl}
                          alt={`Product preview ${idx + 1}`}
                          fill
                          sizes="110px"
                          style={{ objectFit: 'cover' }}
                          unoptimized={imgUrl.startsWith('/api/')}
                        />

                        {/* Primary Badge */}
                        {idx === 0 ? (
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            backgroundColor: '#D32F2F',
                            color: '#FFFFFF',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            zIndex: 2,
                          }}>
                            <Star size={10} fill="#FFFFFF" />
                            <span>PRIMARY</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            title="Set as Primary"
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              backgroundColor: 'rgba(15, 23, 42, 0.75)',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 5px',
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              zIndex: 2,
                            }}
                          >
                            Set Primary
                          </button>
                        )}

                        {/* Action buttons (Delete & Reorder) */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                          padding: '6px 4px 4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          zIndex: 2,
                        }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 'up')}
                                title="Move Earlier"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  cursor: 'pointer',
                                  padding: '2px',
                                }}
                              >
                                <ArrowUp size={12} />
                              </button>
                            )}
                            {idx < formData.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 'down')}
                                title="Move Later"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  cursor: 'pointer',
                                  padding: '2px',
                                }}
                              >
                                <ArrowDown size={12} />
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove Photo"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sizes & Colors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Sizes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sizesStr}
                    onChange={(e) => setFormData({ ...formData, sizesStr: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Colors (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.colorsStr}
                    onChange={(e) => setFormData({ ...formData, colorsStr: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="admin-input"
                  style={{ resize: 'vertical' }}
                />
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
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
