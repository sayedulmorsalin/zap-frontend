import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchApiProduct, fetchApiProducts } from '../../../services/api';
import { ANCHOR_CREST_PRODUCT } from '../../../data/anchorCrest';
import { ProductDetailView } from '../../../components/Product/ProductDetailView';
import { Product } from '../../../types/product';
import { stripHtml } from '../../../components/Common/FormattedText';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  let product: Product | null = null;
  if (slug === 'anchor-crest-casual-shoes' || slug.includes('anchor-crest')) {
    product = ANCHOR_CREST_PRODUCT;
  } else {
    product = await fetchApiProduct(slug);
  }

  if (!product) {
    product = ANCHOR_CREST_PRODUCT;
  }

  const cleanName = stripHtml(product.name);
  const cleanDesc = stripHtml(product.description || '');

  return {
    title: `${cleanName} | ZAP Footwear Bangladesh`,
    description: `Shop ${cleanName} at ZAP Footwear. Premium quality shoes with Cash on Delivery and nationwide shipping across Bangladesh.`,
    openGraph: {
      title: `${cleanName} - BDT ${product.price}`,
      description: cleanDesc,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  let product: Product | null = null;
  if (slug === 'anchor-crest-casual-shoes' || slug.includes('anchor-crest')) {
    product = ANCHOR_CREST_PRODUCT;
  } else {
    product = await fetchApiProduct(slug);
  }

  // Graceful fallback to Anchor Crest demo if requested product is not found
  if (!product) {
    product = ANCHOR_CREST_PRODUCT;
  }

  // Fetch related products
  let related: Product[] = [];
  try {
    const res = await fetchApiProducts({ limit: 6 });
    related = res.products.filter(p => p.id !== product!.id && p.slug !== slug).slice(0, 4);
  } catch {
    related = [];
  }

  return (
    <ProductDetailView 
      initialProduct={product} 
      relatedProducts={related} 
    />
  );
}
