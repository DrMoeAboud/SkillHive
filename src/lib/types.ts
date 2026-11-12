export type SkillType = 'offer' | 'want';

export type ListingKind = 'offer' | 'want' | 'course';

export type SwapStatus = 'pending' | 'accepted' | 'completed' | 'rejected';

export interface Match {
  user: import('./supabase').Profile;
  score: number;
  sharedOffer: string[];
  sharedWant: string[];
  reason: string;
}

export interface Filters {
  search: string;
  kind: ListingKind | 'all';
  tags: string[];
  location: string;
  onlineOnly: boolean;
  premiumOnly: boolean;
}

export const FREE_TIER_LIMITS = {
  maxListings: 3,
  maxMessages: 10,
};

export const PREMIUM_TIERS = [
  {
    name: 'Monthly',
    price: 12,
    period: 'month',
    priceId: 'price_monthly',
    features: [
      'Unlimited skill listings',
      'Unlimited messaging',
      'Advanced search & filters',
      'Priority matching',
      'Premium swap badges',
      '5% lower platform fees',
    ],
  },
  {
    name: 'Yearly',
    price: 9,
    period: 'month',
    billedAs: '$108 billed annually',
    priceId: 'price_yearly',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Featured listing credit each month',
      'Early access to new features',
      'Exclusive community events',
    ],
  },
];

export const FEATURED_PRICE = 3;
