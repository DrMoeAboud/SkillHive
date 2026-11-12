import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { Button, Avatar, Logo } from '../components/ui';
import { fetchProfiles, fetchListings, fetchFeedPosts } from '../lib/data';
import { Search, Heart, MessageSquare, Crown, ArrowRight, Users, TrendingUp, Shield, Sparkles, Star, Zap } from 'lucide-react';
import type { Page } from '../components/Header';
import type { Profile, Listing, FeedPost } from '../lib/supabase';

export function Landing({ onNavigate, onViewProfile }: { onNavigate: (page: Page) => void; onViewProfile: (userId: string) => void }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, listings: 0, swaps: 0 });
  const [featuredListings, setFeaturedListings] = useState<(Listing & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profiles, listings] = await Promise.all([fetchProfiles(), fetchListings()]);
        setStats({
          users: profiles.filter((p) => !p.is_admin).length,
          listings: listings.length,
          swaps: 0,
        });

        const featured = listings.filter((l) => l.is_featured).slice(0, 3);
        const withProfiles = await Promise.all(
          featured.map(async (l) => {
            const p = profiles.find((pr) => pr.id === l.user_id);
            return { ...l, profile: p };
          })
        );
        setFeaturedListings(withProfiles);
      } catch (err) {
        console.error('Error loading landing data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(20,184,166,0.10),transparent)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-200/15 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {stats.users > 0 ? `Join ${stats.users}+ learners and teachers` : 'Join the skill-swapping community'}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Swap skills,{' '}
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                grow together
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              SkillHive is a community marketplace where you trade what you know for what you want to learn.
              Teach guitar, learn Spanish. Offer design, master coding. No money required — just skills.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => onNavigate(profile ? 'listings' : 'signup')}>
                {profile ? 'Browse Skills' : 'Get Started Free'}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate('listings')}>
                <Search className="w-4 h-4" />
                Explore Listings
              </Button>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900">{stats.users}</div>
              <div className="text-sm text-slate-500">Active members</div>
            </div>
            <div className="w-px bg-slate-200" />
            <div>
              <div className="text-3xl font-bold text-slate-900">{stats.listings}</div>
              <div className="text-sm text-slate-500">Skill listings</div>
            </div>
            <div className="w-px bg-slate-200" />
            <div>
              <div className="text-3xl font-bold text-slate-900">100%</div>
              <div className="text-sm text-slate-500">Free to join</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {!loading && featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Listings</h2>
              <p className="text-slate-500 mt-1">Top picks from the community</p>
            </div>
            <button onClick={() => onNavigate('listings')} className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featuredListings.map((listing) => {
              const ownerName = listing.profile?.full_name || listing.profile?.username || 'Unknown';
              return (
                <div key={listing.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-teal-200 transition-all duration-300 group">
                  <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold mb-3">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> Featured
                  </div>
                  <h3 className="font-bold text-slate-900 leading-snug mb-2 group-hover:text-teal-600 transition-colors">{listing.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{listing.description}</p>
                  <div className="flex items-center justify-between">
                    {listing.profile && (
                      <button onClick={() => onViewProfile(listing.profile!.id)} className="flex items-center gap-2">
                        <Avatar name={ownerName} avatarUrl={listing.profile.avatar_url} size="sm" />
                        <span className="text-xs font-medium text-slate-700">{ownerName}</span>
                      </button>
                    )}
                    <span className="text-lg font-bold text-slate-900">{listing.price === 0 ? 'Free' : `$${listing.price}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900">How SkillHive works</h2>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto">Three simple steps to start swapping skills with people who match your goals.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Users, title: 'Create your profile', desc: 'List skills you can teach and skills you want to learn. Add a bio and your location.', color: 'from-teal-500 to-emerald-600' },
            { icon: Heart, title: 'Get matched', desc: 'Our matching engine suggests swap partners based on complementary skills and interests.', color: 'from-blue-500 to-cyan-600' },
            { icon: MessageSquare, title: 'Connect & swap', desc: 'Chat with your matches, arrange a swap, and rate each other after completing it.', color: 'from-amber-500 to-orange-600' },
          ].map((f, i) => (
            <div key={i} className="group relative bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-xl hover:border-slate-300 transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}>
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              <div className="absolute top-6 right-6 text-5xl font-bold text-slate-100 group-hover:text-teal-50 transition-colors">{i + 1}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 sm:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(50%_100%_at_80%_0%,rgba(245,158,11,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_80%_at_10%_100%,rgba(20,184,166,0.10),transparent)]" />
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
                <Crown className="w-4 h-4" />
                Premium Membership
              </div>
              <h2 className="text-3xl font-bold text-white">Unlock the full SkillHive experience</h2>
              <p className="mt-3 text-slate-300 leading-relaxed">
                Unlimited listings, advanced search, priority matching, and premium swap badges.
                From just <span className="text-amber-400 font-semibold">$9/month</span>.
              </p>
              <div className="mt-6 flex gap-3">
                <Button variant="amber" onClick={() => onNavigate('premium')}>
                  <Crown className="w-4 h-4" />
                  Go Premium
                </Button>
                <Button variant="outline" onClick={() => onNavigate('signup')} className="border-slate-600 text-white hover:bg-slate-700">
                  Start Free
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:flex-shrink-0">
              {[
                { label: 'Unlimited', value: 'Listings' },
                { label: 'Priority', value: 'Matching' },
                { label: 'Advanced', value: 'Search' },
                { label: 'Lower', value: 'Fees' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center min-w-[120px]">
                  <div className="text-sm font-bold text-amber-400">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Safe & Secure', desc: 'In-app messaging keeps your contact info private. Rate every swap to build trust.' },
            { icon: TrendingUp, title: 'Earn Points', desc: 'Complete swaps and contribute to the community to earn points and unlock perks.' },
            { icon: Zap, title: 'Featured Listings', desc: 'Boost your listing to the top of search results with a small micro-fee.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-6 rounded-3xl bg-slate-50/80 border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                <item.icon className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
