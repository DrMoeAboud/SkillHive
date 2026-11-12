import { supabase, type Profile, type UserSkill, type WantedSkill, type Listing, type Swap, type Conversation, type Message, type Rating, type FeedPost } from './supabase';
import type { Match } from './types';

const SKILL_SYNONYMS: Record<string, string[]> = {
  'web development': ['coding', 'programming', 'react', 'typescript', 'front-end', 'frontend'],
  'graphic design': ['design', 'branding', 'ui design'],
  'photography': ['photo', 'dslr', 'portraits'],
  'video editing': ['video', 'premiere', 'editing'],
  'guitar': ['music', 'acoustic guitar'],
  'yoga': ['fitness', 'wellness'],
};

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function skillsMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  for (const [key, syns] of Object.entries(SKILL_SYNONYMS)) {
    const inA = na === key || syns.some((s) => na.includes(s));
    const inB = nb === key || syns.some((s) => nb.includes(s));
    if (inA && inB) return true;
  }
  if (na.length > 3 && nb.length > 3 && (na.includes(nb) || nb.includes(na))) return true;
  return false;
}

export function computeMatches(
  currentUserId: string,
  myOffers: UserSkill[],
  myWants: WantedSkill[],
  allUsers: Profile[],
  allOffers: UserSkill[],
  allWants: WantedSkill[]
): Match[] {
  const matches: Match[] = [];

  for (const other of allUsers) {
    if (other.id === currentUserId) continue;
    if (other.is_admin) continue;

    const theirOffers = allOffers.filter((s) => s.user_id === other.id);
    const theirWants = allWants.filter((s) => s.user_id === other.id);

    const sharedOffer: string[] = [];
    for (const want of myWants) {
      for (const offer of theirOffers) {
        if (skillsMatch(want.skill_name, offer.skill_name)) {
          sharedOffer.push(want.skill_name);
          break;
        }
      }
    }

    const sharedWant: string[] = [];
    for (const offer of myOffers) {
      for (const want of theirWants) {
        if (skillsMatch(offer.skill_name, want.skill_name)) {
          sharedWant.push(offer.skill_name);
          break;
        }
      }
    }

    if (sharedOffer.length === 0 && sharedWant.length === 0) continue;

    let score = sharedOffer.length * 30 + sharedWant.length * 30;
    if (sharedOffer.length > 0 && sharedWant.length > 0) {
      score += 40;
    }
    if (other.is_premium) score += 5;

    let reason: string;
    if (sharedOffer.length > 0 && sharedWant.length > 0) {
      reason = `Perfect mutual swap! They can teach you ${sharedOffer.join(', ')} and want to learn ${sharedWant.join(', ')}.`;
    } else if (sharedOffer.length > 0) {
      reason = `They can teach you ${sharedOffer.join(', ')}.`;
    } else {
      reason = `They want to learn ${sharedWant.join(', ')} — offer your skills!`;
    }

    matches.push({ user: other, score, sharedOffer, sharedWant, reason });
  }

  return matches.sort((a, b) => b.score - a.score);
}

export function averageRating(reviews: Rating[], userId: string): number {
  const userReviews = reviews.filter((r) => r.rated_user_id === userId);
  if (userReviews.length === 0) return 0;
  return userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
}

export function reviewCount(reviews: Rating[], userId: string): number {
  return reviews.filter((r) => r.rated_user_id === userId).length;
}

export function formatDate(isoString: string): string {
  const ts = new Date(isoString).getTime();
  const diff = Date.now() - ts;
  const day = 86400000;
  const hour = 3600000;
  const min = 60000;
  if (diff < min) return 'just now';
  if (diff < hour) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return `$${price.toFixed(2)}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function platformFee(price: number, rate = 0.1): number {
  return Math.round(price * rate * 100) / 100;
}

export { supabase };
export type { Profile, UserSkill, WantedSkill, Listing, Swap, Conversation, Message, Rating, FeedPost };
