import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout | ZAP Footwear Bangladesh',
  description: 'Complete your order with ZAP Footwear. Fast nationwide delivery, Cash on Delivery across 64 districts in Bangladesh, and 7-day exchange guarantee.',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
