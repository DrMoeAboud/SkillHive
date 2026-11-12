import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Avatar, Logo } from './ui';
import { Search, LogOut, Menu, X, Shield, LayoutDashboard, Heart, MessageSquare, Newspaper, Crown, Zap } from 'lucide-react';

type Page = 'home' | 'dashboard' | 'profile' | 'listings' | 'matches' | 'messages' | 'feed' | 'premium' | 'admin';

interface HeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { key: Page; label: string; icon: React.ElementType; authRequired?: boolean }[] = [
  { key: 'listings', label: 'Browse', icon: Search },
  { key: 'feed', label: 'Community', icon: Newspaper },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, authRequired: true },
  { key: 'matches', label: 'Matches', icon: Heart, authRequired: true },
  { key: 'messages', label: 'Messages', icon: MessageSquare, authRequired: true },
  { key: 'premium', label: 'Premium', icon: Crown },
];

export function Header({ page, onNavigate }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => !item.authRequired || profile);

  const navigate = (p: Page) => {
    onNavigate(p);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate('home')} className="flex-shrink-0 transition-transform hover:scale-[1.02]">
            <Logo />
          </button>

          <nav className="hidden lg:flex items-center gap-0.5">
            {visibleItems.map((item) => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  page === item.key
                    ? 'text-teal-700 bg-teal-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.key === 'premium' && !profile?.is_premium && (
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                )}
              </button>
            ))}
            {profile?.is_admin && (
              <button
                onClick={() => navigate('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  page === 'admin' ? 'text-rose-700 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {profile ? (
              <div className="hidden lg:flex items-center gap-3">
                <button
                  onClick={() => navigate('profile')}
                  className="flex items-center gap-2 hover:bg-slate-50 rounded-xl p-1 pr-3 transition-colors"
                >
                  <Avatar name={profile.full_name || profile.username || 'User'} avatarUrl={profile.avatar_url} size="sm" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-800 leading-tight">{profile.full_name || profile.username}</div>
                    <div className="text-xs text-slate-500 leading-tight flex items-center gap-1">
                      {profile.is_premium && <Crown className="w-3 h-3 text-amber-500" />}
                      {profile.points} pts
                    </div>
                  </div>
                </button>
                <button onClick={signOut} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" title="Sign out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <button onClick={() => navigate('signin')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                  Sign In
                </button>
                <button onClick={() => navigate('signup')} className="px-4 py-2 text-sm font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-sm shadow-teal-600/20 active:scale-[0.98]">
                  Get Started
                </button>
              </div>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100">
            <nav className="flex flex-col gap-0.5">
              {visibleItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                    page === item.key ? 'text-teal-700 bg-teal-50/80' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              {profile?.is_admin && (
                <button onClick={() => navigate('admin')} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Shield className="w-4 h-4" /> Admin
                </button>
              )}
              {profile ? (
                <>
                  <button onClick={() => navigate('profile')} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Avatar name={profile.full_name || 'User'} avatarUrl={profile.avatar_url} size="xs" /> My Profile
                  </button>
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('signin')} className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 text-left">Sign In</button>
                  <button onClick={() => navigate('signup')} className="px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-teal-600 text-white text-left">Get Started</button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export type { Page };
