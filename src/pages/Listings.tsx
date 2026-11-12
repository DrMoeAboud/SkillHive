import { useState, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { Avatar, Button, Badge, Tag, Modal, Input, EmptyState } from '../components/ui';
import { formatDate, formatPrice, FREE_TIER_LIMITS, FEATURED_PRICE } from '../lib/matching';
import { uid } from '../lib/db';
import { Search, Plus, Sparkles, Star, MapPin, Wifi, Crown, Filter, X, BookOpen, Tag as TagIcon } from 'lucide-react';
import type { Page } from '../components/Header';
import type { Listing, ListingKind, Filters } from '../lib/types';

export function Listings({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { user, db, mutate } = useAuth();
  const [filters, setFilters] = useState<Filters>({ search: '', kind: 'all', tags: [], location: '', onlineOnly: false, premiumOnly: false });
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Create form state
  const [form, setForm] = useState({
    kind: 'offer' as ListingKind,
    title: '',
    description: '',
    tags: '',
    price: '',
    isOnline: true,
  });

  const allTags = useMemo(() => {
    const set = new Set<string>();
    db.listings.forEach((l) => l.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [db.listings]);

  const filtered = useMemo(() => {
    let result = [...db.listings];
    // Featured listings first
    result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.createdAt - a.createdAt;
    });
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.tags.some((t) => t.toLowerCase().includes(q)));
    }
    if (filters.kind !== 'all') result = result.filter((l) => l.kind === filters.kind);
    if (filters.tags.length > 0) result = result.filter((l) => filters.tags.some((t) => l.tags.includes(t)));
    if (filters.location) {
      const q = filters.location.toLowerCase();
      result = result.filter((l) => {
        const owner = db.users.find((u) => u.id === l.userId);
        return owner?.location.toLowerCase().includes(q);
      });
    }
    if (filters.onlineOnly) result = result.filter((l) => l.isOnline);
    if (filters.premiumOnly) result = result.filter((l) => {
      const owner = db.users.find((u) => u.id === l.userId);
      return owner?.isPremium;
    });
    return result;
  }, [db.listings, db.users, filters]);

  const toggleTag = (tag: string) => {
    setFilters((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag] }));
  };

  const myListings = user ? db.listings.filter((l) => l.userId === user.id) : [];
  const canCreate = user && (user.isPremium || myListings.length < FREE_TIER_LIMITS.maxListings);

  const createListing = () => {
    if (!user || !canCreate) return;
    if (!form.title.trim()) return;
    const newListing: Listing = {
      id: uid(),
      userId: user.id,
      kind: form.kind,
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      price: form.price ? parseFloat(form.price) : 0,
      isFeatured: false,
      isOnline: form.isOnline,
      createdAt: Date.now(),
    };
    const feedPost = { id: uid(), userId: user.id, content: '', type: form.kind === 'course' ? 'course' as const : 'listing' as const, refId: newListing.id, createdAt: Date.now() };
    mutate((d) => ({ ...d, listings: [newListing, ...d.listings], feed: [feedPost, ...d.feed] }));
    setForm({ kind: 'offer', title: '', description: '', tags: '', price: '', isOnline: true });
    setShowCreate(false);
  };

  const featureListing = (listingId: string) => {
    if (!user) return;
    mutate((d) => ({
      ...d,
      listings: d.listings.map((l) => l.id === listingId ? { ...l, isFeatured: true } : l),
      users: d.users.map((u) => u.id === user.id ? { ...u, points: u.points - 10 } : u),
    }));
  };

  const deleteListing = (listingId: string) => {
    mutate((d) => ({
      ...d,
      listings: d.listings.filter((l) => l.id !== listingId),
      feed: d.feed.filter((f) => f.refId !== listingId),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Skills</h1>
          <p className="text-slate-500 mt-1">Discover skills to learn and teach in the community</p>
        </div>
        {user && (
          <Button onClick={() => canCreate ? setShowCreate(true) : onNavigate('premium')}>
            <Plus className="w-4 h-4" /> {canCreate ? 'Post a Listing' : 'Upgrade to Post'}
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search skills, tags, or descriptions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex-shrink-0">
          <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'offer', 'want', 'course'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilters({ ...filters, kind: k })}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filters.kind === k ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {k === 'all' ? 'All Types' : k + 's'}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Filter by location..."
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 cursor-pointer text-sm">
              <input type="checkbox" checked={filters.onlineOnly} onChange={(e) => setFilters({ ...filters, onlineOnly: e.target.checked })} className="rounded accent-teal-600" />
              Online only
            </label>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 cursor-pointer text-sm">
              <input type="checkbox" checked={filters.premiumOnly} onChange={(e) => setFilters({ ...filters, premiumOnly: e.target.checked })} className="rounded accent-teal-600" />
              Premium sellers
            </label>
          </div>
          {allTags.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">Popular tags</div>
              <div className="flex flex-wrap gap-1.5">
                {allTags.slice(0, 15).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filters.tags.includes(tag) ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          {(filters.tags.length > 0 || filters.location || filters.onlineOnly || filters.premiumOnly || filters.kind !== 'all') && (
            <button onClick={() => setFilters({ search: '', kind: 'all', tags: [], location: '', onlineOnly: false, premiumOnly: false })} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active filter badges */}
      {(filters.tags.length > 0 || filters.location || filters.onlineOnly || filters.premiumOnly) && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.tags.map((t) => <Badge key={t} color="teal">{t}</Badge>)}
          {filters.location && <Badge color="slate">Location: {filters.location}</Badge>}
          {filters.onlineOnly && <Badge color="blue">Online only</Badge>}
          {filters.premiumOnly && <Badge color="amber">Premium only</Badge>}
        </div>
      )}

      {/* Listings grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No listings found" subtitle="Try adjusting your search or filters to find more results." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((listing) => {
            const owner = db.users.find((u) => u.id === listing.userId);
            if (!owner) return null;
            const isOwn = user?.id === listing.userId;
            return (
              <div key={listing.id} className={`bg-white rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 ${listing.isFeatured ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200 hover:border-slate-300'}`}>
                {listing.isFeatured && (
                  <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Featured
                  </div>
                )}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 leading-snug">{listing.title}</h3>
                  <Badge color={listing.kind === 'offer' ? 'teal' : listing.kind === 'want' ? 'amber' : 'blue'}>
                    {listing.kind === 'course' ? <><BookOpen className="w-3 h-3" /> Course</> : listing.kind}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{listing.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {listing.tags.slice(0, 3).map((tag) => <Tag key={tag} label={tag} />)}
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 min-w-0">
                    <Avatar name={owner.name} color={owner.avatarColor} size="sm" />
                    <div className="text-left min-w-0">
                      <div className="text-xs font-medium text-slate-700 truncate flex items-center gap-1">
                        {owner.name}
                        {owner.isPremium && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        {owner.location && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{owner.location.split(',')[0]}</span>}
                        {listing.isOnline && <span className="flex items-center gap-0.5"><Wifi className="w-2.5 h-2.5" />Online</span>}
                      </div>
                    </div>
                  </button>
                  <span className="text-lg font-bold text-slate-900">{formatPrice(listing.price)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{formatDate(listing.createdAt)}</span>
                  {isOwn ? (
                    <div className="flex gap-2">
                      {!listing.isFeatured && (
                        <button onClick={() => featureListing(listing.id)} className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" /> Feature (${FEATURED_PRICE})
                        </button>
                      )}
                      <button onClick={() => deleteListing(listing.id)} className="text-xs font-medium text-rose-500 hover:text-rose-600">Delete</button>
                    </div>
                  ) : (
                    <button onClick={() => onNavigate('messages')} className="text-xs font-semibold text-teal-600 hover:text-teal-700">Contact →</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Listing Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Post a New Listing" maxWidth="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
            <div className="flex gap-2">
              {(['offer', 'want', 'course'] as const).map((k) => (
                <button key={k} onClick={() => setForm({ ...form, kind: k })} className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border capitalize transition-colors ${form.kind === k ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600'}`}>
                  {k === 'offer' ? 'Offering' : k === 'want' ? 'Wanting' : 'Course'}
                </button>
              ))}
            </div>
          </div>
          <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Advanced React Patterns" required />
          <Input label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea rows={3} placeholder="Describe what you're offering or looking for..." />
          <Input label="Tags (comma-separated)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} placeholder="React, JavaScript, Frontend" />
          <div className="flex gap-3">
            <div className="flex-1">
              <Input label="Price ($)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" placeholder="0 for free swap" />
            </div>
            <label className="flex items-end gap-2 pb-2.5 px-4 rounded-xl border border-slate-200 cursor-pointer text-sm whitespace-nowrap">
              <input type="checkbox" checked={form.isOnline} onChange={(e) => setForm({ ...form, isOnline: e.target.checked })} className="rounded accent-teal-600" />
              Available online
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createListing}>Create Listing</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
