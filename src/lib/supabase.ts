import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  premium_until: string | null;
  points: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type UserSkill = {
  id: string;
  user_id: string;
  skill_name: string;
  category: string | null;
  description: string | null;
  proficiency_level: string | null;
  is_paid: boolean;
  price_per_hour: number;
  is_featured: boolean;
  featured_until: string | null;
  online_available: boolean;
  created_at: string;
};

export type WantedSkill = {
  id: string;
  user_id: string;
  skill_name: string;
  category: string | null;
  description: string | null;
  willing_to_pay: boolean;
  max_price: number;
  online_preferred: boolean;
  created_at: string;
};

export type Listing = {
  id: string;
  user_id: string;
  kind: 'offer' | 'want' | 'course';
  title: string;
  description: string;
  tags: string[];
  price: number;
  is_featured: boolean;
  is_online: boolean;
  created_at: string;
};

export type Swap = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  listing_a_id: string | null;
  listing_b_id: string | null;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  price: number;
  platform_fee: number;
  created_at: string;
  completed_at: string | null;
};

export type Conversation = {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type Rating = {
  id: string;
  rated_user_id: string;
  rater_user_id: string;
  rating: number;
  review: string;
  swap_type: string;
  created_at: string;
};

export type FeedPost = {
  id: string;
  user_id: string;
  post_type: 'post' | 'listing' | 'swap' | 'course';
  content: string;
  metadata: Record<string, unknown>;
  likes_count: number;
  created_at: string;
};

export type Badge = {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  earned_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  platform_fee: number;
  status: string;
  stripe_payment_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};
