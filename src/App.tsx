import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { Header, type Page } from './components/Header';
import { Footer } from './components/Footer';
import { Landing } from './pages/Landing';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Listings } from './pages/Listings';
import { Matches } from './pages/Matches';
import { Messages } from './pages/Messages';
import { Feed } from './pages/Feed';
import { Premium } from './pages/Premium';
import { Admin } from './pages/Admin';
import { Button } from './components/ui';
import { Lock, Spinner } from 'lucide-react';

function AppContent() {
  const { profile, loading } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);

  const navigate = (next: Page) => {
    if (!profile && ['dashboard', 'profile', 'matches', 'messages', 'admin'].includes(next)) {
      setPage('signin');
      return;
    }
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProfile = (userId: string) => {
    setViewProfileId(userId);
    setPage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (page) {
      case 'home': return <Landing onNavigate={navigate} onViewProfile={viewProfile} />;
      case 'signin': return <AuthPage mode="signin" onNavigate={navigate} />;
      case 'signup': return <AuthPage mode="signup" onNavigate={navigate} />;
      case 'dashboard': return profile ? <Dashboard onNavigate={navigate} onViewProfile={viewProfile} /> : <AuthPage mode="signin" onNavigate={navigate} />;
      case 'profile': return profile ? <Profile onNavigate={navigate} userId={viewProfileId || profile.id} onViewProfile={viewProfile} /> : <AuthPage mode="signin" onNavigate={navigate} />;
      case 'listings': return <Listings onNavigate={navigate} onViewProfile={viewProfile} />;
      case 'matches': return profile ? <Matches onNavigate={navigate} onViewProfile={viewProfile} /> : <AuthPage mode="signin" onNavigate={navigate} />;
      case 'messages': return profile ? <Messages onNavigate={navigate} /> : <AuthPage mode="signin" onNavigate={navigate} />;
      case 'feed': return <Feed onNavigate={navigate} onViewProfile={viewProfile} />;
      case 'premium': return <Premium onNavigate={navigate} />;
      case 'admin': return profile?.is_admin ? <Admin onNavigate={navigate} /> : (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <Lock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Admin access required.</p>
          <Button variant="outline" onClick={() => navigate('signin')} className="mt-4">Sign In as Admin</Button>
        </div>
      );
      default: return <Landing onNavigate={navigate} onViewProfile={viewProfile} />;
    }
  };

  const showFooter = page !== 'signin' && page !== 'signup' && page !== 'messages';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header page={page} onNavigate={navigate} />
        <main className="flex-1 flex items-center justify-center">
          <Spinner className="w-8 h-8 text-teal-600" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header page={page} onNavigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      {showFooter && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
