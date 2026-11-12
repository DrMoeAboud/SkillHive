import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { Avatar, Button, Badge, Stars, Spinner } from '../components/ui';
import { averageRating, reviewCount, formatDate, FREE_TIER_LIMITS } from '../lib/matching';
import { fetchProfiles, fetchListings, fetchSwaps, fetchConversations, fetchRatings, fetchFeedPosts } from '../lib/data';
import { ListChecks, Heart, MessageSquare, Star, Crown, TrendingUp, Plus, ArrowRight, Award } from 'lucide-react';
import type { Page } from '../components/Header';
import type { Profile, Listing, Swap, Conversation, Rating, FeedPost } from '../lib/supabase';

export function Dashboard({ onNavigate, onViewProfile }: { onNavigate: (page: Page) => void; onViewProfile: (userId: string) => void }) {
  const { profile, user } = useAuth();
  const [data, setData] = useState<{
    profiles: Profile[];
    listings: Listing[];
    swaps: Swap[];
    convos: Conversation[];
    ratings: Rating[];
    feed: FeedPost[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [profiles, listings, swaps, convos, ratings, feed] = await Promise.all([
          fetchProfiles(),
          fetchListings(),
          fetchSwaps(),
          fetchConversations(user.id),
          fetchRatings(),
          fetchFeedPosts(),
        ]);
        setData({ profiles, listings, swaps, convos, ratings, feed });
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!profile) return null;
  if (loading || !data) return <Spinner />;

  const myListings = data.listings.filter((l) => l.user_id === profile.id);
  const mySwaps = data.swaps.filter((s) => s.user_a_id === profile.id || s.user_b_id === profile.id);
  const completedSwaps = mySwaps.filter((s) => s.status === 'completed');
  const myReviews = data.ratings.filter((r) => r.rated_user_id === profile.id);
  const rating = averageRating(data.ratings, profile.id);
  const recentFeed = data.feed.slice(0, 5);

  const stats = [
    { label: 'Listings', value: myListings.length, icon: ListChecks, color: 'text-teal-600 bg-teal-50', limit: profile.is_premium ? null : FREE_TIER_LIMITS.maxListings },
    { label: 'Matches', value: mySwaps.length, icon: Heart, color: 'text-rose-600 bg-rose-50' },
    { label: 'Conversations', value: data.convos.length, icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
    { label: 'Completed', value: completedSwaps.length, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Reviews', value: myReviews.length, icon: Star, color: 'text-amber-600 bg-amber-50' },
    { label: 'Points', value: profile.points, icon: Award, color: 'text-teal-600 bg-teal-50' },
  ];

  const pendingSwaps = mySwaps.filter((s) => s.status === 'pending' || s.status === 'accepted');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar name={profile.full_name || profile.username || 'User'} avatarUrl={profile.avatar_url} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {(profile.full_name || profile.username || 'User').split(' ')[0]}</h1>
            <div className="flex items-center gap-2 mt-1">
              {profile.is_premium ? (
                <Badge color="amber"><Crown className="w-3 h-3" /> Premium</Badge>
              ) : (
                <Badge color="slate">Free Plan</Badge>
              )}
              {rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Stars rating={rating} />
                  <span className="text-sm text-slate-500">({reviewCount(data.ratings, profile.id)})</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => onNavigate('listings')} className="hidden sm:inline-flex">
          <Plus className="w-4 h-4" /> New Listing
        </Button>
      </div>

      {!profile.is_premium && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              You're on the free plan: {myListings.length}/{FREE_TIER_LIMITS.maxListings} listings used.
            </p>
          </div>
          <Button size="sm" variant="amber" onClick={() => onNavigate('premium')}>Upgrade</Button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              {stat.limit !== null && stat.limit !== undefined && (
                <span className="text-xs text-slate-400">/ {stat.limit}</span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending swaps */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Active Swaps</h2>
            <button onClick={() => onNavigate('matches')} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {pendingSwaps.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No active swaps yet. Check your matches to get started!</p>
          ) : (
            <div className="space-y-3">
              {pendingSwaps.map((swap) => {
                const otherId = swap.user_a_id === profile.id ? swap.user_b_id : swap.user_a_id;
                const other = data.profiles.find((p) => p.id === otherId);
                if (!other) return null;
                return (
                  <div key={swap.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => onViewProfile(other.id)}>
                    <Avatar name={other.full_name || other.username || 'User'} avatarUrl={other.avatar_url} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{other.full_name || other.username}</div>
                      <div className="text-xs text-slate-500">Status: <span className="capitalize font-medium">{swap.status}</span></div>
                    </div>
                    <Badge color={swap.status === 'accepted' ? 'green' : 'amber'}>{swap.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent community */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Community Activity</h2>
            <button onClick={() => onNavigate('feed')} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View feed <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentFeed.map((post) => {
              const author = data.profiles.find((p) => p.id === post.user_id);
              if (!author) return null;
              let label = '';
              if (post.post_type === 'listing') label = 'posted a new listing';
              else if (post.post_type === 'swap') label = 'completed a skill swap';
              else if (post.post_type === 'course') label = 'published a course';
              else label = 'shared a post';
              return (
                <div key={post.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-xl p-1 -m-1 transition-colors" onClick={() => onViewProfile(author.id)}>
                  <Avatar name={author.full_name || author.username || 'User'} avatarUrl={author.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-700"><b>{author.full_name || author.username}</b> {label}</span>
                    <div className="text-xs text-slate-400">{formatDate(post.created_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
