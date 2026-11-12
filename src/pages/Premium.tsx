import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Button, Badge, Modal } from '../components/ui';
import { PREMIUM_TIERS, FEATURED_PRICE } from '../lib/matching';
import { Crown, Check, Zap, X, CreditCard, Star, TrendingUp } from 'lucide-react';
import type { Page } from '../components/Header';

export function Premium({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { user, mutate } = useAuth();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);

  const upgrade = () => {
    if (!user) return;
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      mutate((d) => ({
        ...d,
        users: d.users.map((u) => u.id === user.id ? { ...u, isPremium: true, points: u.points + 50 } : u),
      }));
      setProcessing(false);
      setShowCheckout(false);
      onNavigate('dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {user?.isPremium && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center gap-4">
          <Crown className="w-8 h-8 text-amber-500" />
          <div>
            <h3 className="font-bold text-amber-900">You're a Premium member!</h3>
            <p className="text-sm text-amber-700">Enjoy unlimited listings, advanced search, and priority matching.</p>
          </div>
        </div>
      )}

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-sm font-medium mb-4">
          <Crown className="w-4 h-4" /> Premium Membership
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Unlock everything SkillHive has to offer</h1>
        <p className="mt-3 text-slate-600 max-w-xl mx-auto">Upgrade for unlimited listings, advanced search, priority matching, and lower platform fees on paid swaps.</p>
      </div>

      {/* Pricing tiers */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {PREMIUM_TIERS.map((tier, idx) => (
          <div
            key={tier.name}
            className={`relative bg-white rounded-2xl border-2 p-8 transition-all ${selectedTier === idx ? 'border-teal-500 shadow-lg' : 'border-slate-200 hover:border-slate-300'}`}
          >
            {tier.name === 'Yearly' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge color="amber"><Zap className="w-3 h-3" /> Best Value</Badge>
              </div>
            )}
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
              <div className="mt-3 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-slate-900">${tier.price}</span>
                <span className="text-slate-500">/{tier.period}</span>
              </div>
              {tier.billedAs && <p className="text-xs text-slate-400 mt-1">{tier.billedAs}</p>}
            </div>
            <ul className="mt-6 space-y-3">
              {tier.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <Button
              className="w-full mt-6"
              variant={tier.name === 'Yearly' ? 'primary' : 'outline'}
              disabled={user?.isPremium}
              onClick={() => { setSelectedTier(idx); setShowCheckout(true); }}
            >
              {user?.isPremium ? 'Current Plan' : `Choose ${tier.name}`}
            </Button>
          </div>
        ))}
      </div>

      {/* Comparison */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-4 text-center">Free vs Premium</h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left p-4 font-semibold text-slate-700">Feature</th>
                <th className="text-center p-4 font-semibold text-slate-500">Free</th>
                <th className="text-center p-4 font-semibold text-amber-600">Premium</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feat: 'Skill listings', free: '3 max', premium: 'Unlimited' },
                { feat: 'Messages', free: '10 max', premium: 'Unlimited' },
                { feat: 'Advanced search & filters', free: false, premium: true },
                { feat: 'Priority matching', free: false, premium: true },
                { feat: 'Premium swap badges', free: false, premium: true },
                { feat: 'Lower platform fees', free: '10%', premium: '5%' },
                { feat: 'Featured listing credit', free: false, premium: true },
              ].map((row) => (
                <tr key={row.feat} className="border-b border-slate-50 last:border-0">
                  <td className="p-4 text-slate-700">{row.feat}</td>
                  <td className="p-4 text-center">
                    {typeof row.free === 'boolean' ? (
                      row.free ? <Check className="w-4 h-4 text-slate-400 inline" /> : <X className="w-4 h-4 text-slate-300 inline" />
                    ) : <span className="text-slate-500">{row.free}</span>}
                  </td>
                  <td className="p-4 text-center">
                    {typeof row.premium === 'boolean' ? (
                      row.premium ? <Check className="w-4 h-4 text-amber-500 inline" /> : <X className="w-4 h-4 text-slate-300 inline" />
                    ) : <span className="font-semibold text-amber-600">{row.premium}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional revenue features */}
      <div className="mt-12 grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-bold text-slate-900">Featured Listings</h3>
          <p className="text-sm text-slate-600 mt-1">Boost your listing to the top of search results and the community feed for just <b className="text-slate-800">${FEATURED_PRICE}</b>.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="font-bold text-slate-900">Platform Fees</h3>
          <p className="text-sm text-slate-600 mt-1">When a paid swap or course sale occurs, we collect a small fee — <b className="text-slate-800">10%</b> for free users, <b className="text-slate-800">5%</b> for premium members.</p>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal open={showCheckout} onClose={() => !processing && setShowCheckout(false)} title="Complete Your Purchase">
        {selectedTier !== null && (
          <div className="space-y-5">
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">SkillHive {PREMIUM_TIERS[selectedTier].name}</div>
                <div className="text-sm text-slate-500">{PREMIUM_TIERS[selectedTier].billedAs || `Billed ${PREMIUM_TIERS[selectedTier].period}ly`}</div>
              </div>
              <div className="text-2xl font-bold text-slate-900">${PREMIUM_TIERS[selectedTier].name === 'Yearly' ? 108 : 12}</div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Payment Method</span>
              </div>
              <div className="space-y-2">
                <input type="text" placeholder="Card number" disabled={processing} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
                <div className="flex gap-2">
                  <input type="text" placeholder="MM/YY" disabled={processing} className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
                  <input type="text" placeholder="CVC" disabled={processing} className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Demo checkout — no real payment will be processed. Stripe integration requires configuration.</p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCheckout(false)} disabled={processing}>Cancel</Button>
              <Button onClick={upgrade} disabled={processing} className="bg-amber-500 hover:bg-amber-600">
                {processing ? 'Processing...' : <>Pay & Upgrade</>}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
