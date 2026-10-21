export type BannerTargetType = 'brand' | 'category' | 'gender' | 'all';

export interface HeroSlide {
  id: string;
  tag: string;
  headline: string;
  subheadline: string;
  description: string;
  image: string;
  badgeText?: string;
  badgeSubtext?: string;
  ctaText: string;
  ctaTargetType: BannerTargetType;
  ctaTargetValue: string;
  secondaryCtaText: string;
  secondaryCtaTargetType: BannerTargetType;
  secondaryCtaTargetValue: string;
  accentColor: string;
  isActive: boolean;
  order: number;
}

export interface PromoBanner {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  badgeColor: string;
  ctaText: string;
  targetType: BannerTargetType;
  targetValue: string;
  isActive: boolean;
  order: number;
}
