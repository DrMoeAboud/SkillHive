import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Avatar, Badge, Button, EmptyState, Stars } from '../components/ui';
import { averageRating, formatDate, formatPrice, platformFee } from '../lib/matching';
import { Shield, Users, ListChecks, CreditCard, Flag, Crown, Ban, Trash2, TrendingUp, DollarSign } from 'lucide-react';

type Tab = 'overview' | 'users' | 'listings' | 'payments' | 'reports';

export function Admin() {
  const { user, db, mutate } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');

  if (!user?.isAdmin) {
    return <EmptyState icon={Shield} title="Access denied" subtitle="You need admin privileges to view this page." />;
  }

  const totalUsers = db.users.filter((u) => !u.isAdmin).length;
  const premiumUsers = db.users.filter((u) => u.isPremium && !u.isAdmin).length;
  const totalListings = db.listings.length;
  const featuredListings = db.listings.filter((l) => l.isFeatured).length;
  const completedSwaps = db.swaps.filter((s) => s.status === 'completed');
  const totalRevenue = completedSwaps.reduce((sum, s) => sum + s.platformFee, 0) + featuredListings * 3 + premiumUsers * 12;
  const courses = db.listings.filter((l) => l.kind === 'course');
  const courseRevenue = courses.reduce((sum, c) => sum + c.price * 0.1, 0);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'listings', label: 'Listings', icon: ListChecks },
    { key: 'payments', label: 'Payments', icon: CreditCard },
    { key: 'reports', label: 'Reports', icon: Flag },
  ];

  const togglePremium = (userId: string) => {
    mutate((d) => ({
      ...d,
      users: d.users.map((u) => u.id === userId ? { ...u, isPremium: !u.isPremium } : u),
    }));
  };

  const deleteUser = (userId: string) => {
    mutate((d) => ({
      ...d,
      users: d.users.filter((u) => u.id !== userId),
      skills: d.skills.filter((s) => s.userId !== userId),
      listings: d.listings.filter((l) => l.userId !== userId),
    }));
  };

  const deleteListing = (listingId: string) => {
    mutate((d) => ({ ...d, listings: d.listings.filter((l) => l.id !== listingId) }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
          <Shield className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Manage users, listings, payments, and reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
              { label: 'Premium Users', value: premiumUsers, icon: Crown, color: 'text-amber-600 bg-amber-50' },
              { label: 'Total Listings', value: totalListings, icon: ListChecks, color: 'text-teal-600 bg-teal-50' },
              { label: 'Est. Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Recent Users</h3>
              <div className="space-y-3">
                {db.users.filter((u) => !u.isAdmin).slice(-5).reverse().map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <Avatar name={u.name} color={u.avatarColor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{u.name}</div>
                      <div className="text-xs text-slate-400">{formatDate(u.createdAt)}</div>
                    </div>
                    {u.isPremium && <Crown className="w-4 h-4 text-amber-500" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Revenue Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Premium subscriptions</span>
                  <span className="font-semibold text-slate-900">${(premiumUsers * 12).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Featured listings</span>
                  <span className="font-semibold text-slate-900">${(featuredListings * 3).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Swap platform fees</span>
                  <span className="font-semibold text-slate-900">${completedSwaps.reduce((sum, s) => sum + s.platformFee, 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Course commissions</span>
                  <span className="font-semibold text-slate-900">${courseRevenue.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Total estimated</span>
                  <span className="font-bold text-emerald-600">${totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-600">User</th>
                <th className="text-left p-4 font-semibold text-slate-600">Location</th>
                <th className="text-center p-4 font-semibold text-slate-600">Plan</th>
                <th className="text-center p-4 font-semibold text-slate-600">Points</th>
                <th className="text-center p-4 font-semibold text-slate-600">Rating</th>
                <th className="text-center p-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {db.users.filter((u) => !u.isAdmin).map((u) => {
                const rating = averageRating(db.reviews, u.id);
                return (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={u.name} color={u.avatarColor} size="sm" />
                        <div>
                          <div className="font-medium text-slate-800">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{u.location || '—'}</td>
                    <td className="p-4 text-center">{u.isPremium ? <Badge color="amber"><Crown className="w-3 h-3" /> Premium</Badge> : <Badge>Free</Badge>}</td>
                    <td className="p-4 text-center text-slate-600">{u.points}</td>
                    <td className="p-4 text-center">{rating > 0 ? <Stars rating={rating} /> : <span className="text-slate-300">—</span>}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => togglePremium(u.id)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50" title="Toggle premium"><Crown className="w-4 h-4" /></button>
                        <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50" title="Delete user"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Listings */}
      {tab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-600">Title</th>
                <th className="text-left p-4 font-semibold text-slate-600">Author</th>
                <th className="text-center p-4 font-semibold text-slate-600">Type</th>
                <th className="text-center p-4 font-semibold text-slate-600">Price</th>
                <th className="text-center p-4 font-semibold text-slate-600">Featured</th>
                <th className="text-center p-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {db.listings.map((l) => {
                const owner = db.users.find((u) => u.id === l.userId);
                return (
                  <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-800 max-w-xs truncate">{l.title}</td>
                    <td className="p-4 text-slate-600">{owner?.name || '—'}</td>
                    <td className="p-4 text-center"><Badge color={l.kind === 'offer' ? 'teal' : l.kind === 'want' ? 'amber' : 'blue'}>{l.kind}</Badge></td>
                    <td className="p-4 text-center text-slate-600">{formatPrice(l.price)}</td>
                    <td className="p-4 text-center">{l.isFeatured ? <Badge color="amber">Yes</Badge> : <span className="text-slate-300">No</span>}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => deleteListing(l.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments */}
      {tab === 'payments' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Premium Revenue', value: `$${(premiumUsers * 12).toFixed(2)}`, icon: Crown },
              { label: 'Featured Revenue', value: `$${(featuredListings * 3).toFixed(2)}`, icon: TrendingUp },
              { label: 'Fee Revenue', value: `$${(completedSwaps.reduce((sum, s) => sum + s.platformFee, 0) + courseRevenue).toFixed(2)}`, icon: DollarSign },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
                <s.icon className="w-5 h-5 text-teal-600 mb-2" />
                <div className="text-xl font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {db.swaps.filter((s) => s.price > 0).map((swap) => {
                const userA = db.users.find((u) => u.id === swap.userAId);
                const userB = db.users.find((u) => u.id === swap.userBId);
                return (
                  <div key={swap.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                      <div className="text-sm font-medium text-slate-800">Swap payment: {userA?.name} ↔ {userB?.name}</div>
                      <div className="text-xs text-slate-400">{formatDate(swap.createdAt)} · Fee: ${swap.platformFee.toFixed(2)}</div>
                    </div>
                    <span className="font-semibold text-slate-900">{formatPrice(swap.price)}</span>
                  </div>
                );
              })}
              {courses.map((c) => {
                const owner = db.users.find((u) => u.id === c.userId);
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                      <div className="text-sm font-medium text-slate-800">Course: {c.title}</div>
                      <div className="text-xs text-slate-400">by {owner?.name} · Commission: ${(c.price * 0.1).toFixed(2)}</div>
                    </div>
                    <span className="font-semibold text-slate-900">{formatPrice(c.price)}</span>
                  </div>
                );
              })}
              {featuredListings > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <div className="text-sm font-medium text-slate-800">Featured listing boosts</div>
                    <div className="text-xs text-slate-400">{featuredListings} listings × $3.00</div>
                  </div>
                  <span className="font-semibold text-slate-900">${(featuredListings * 3).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports */}
      {tab === 'reports' && (
        <EmptyState icon={Flag} title="No reports yet" subtitle="User reports will appear here for review. The community is behaving well!" />
      )}
    </div>
  );
}
