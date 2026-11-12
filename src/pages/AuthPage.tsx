import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Button, Input, Logo } from '../components/ui';
import { AlertCircle, Mail, Lock, User, Chrome } from 'lucide-react';
import type { Page } from '../components/Header';

export function AuthPage({ mode, onNavigate }: { mode: 'signin' | 'signup'; onNavigate: (page: Page) => void }) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignup) {
      if (name.trim().length < 2) { setError('Please enter your name.'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
      const result = await signUp(email, password, name);
      if (!result.ok) { setError(result.error || 'Sign up failed.'); setLoading(false); return; }
      onNavigate('dashboard');
    } else {
      const result = await signIn(email, password);
      if (!result.ok) { setError(result.error || 'Sign in failed.'); setLoading(false); return; }
      onNavigate('dashboard');
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    if (!result.ok) {
      setError(result.error || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-teal-50/40 via-white to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex mb-5"><Logo size="lg" showText={false} /></div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSignup ? 'Join SkillHive' : 'Welcome back'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isSignup ? 'Start swapping skills today' : 'Sign in to your account'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            {googleLoading ? 'Connecting...' : `Continue with Google`}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? 'At least 6 characters' : '••••••••'}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => onNavigate(isSignup ? 'signin' : 'signup')} className="font-semibold text-teal-600 hover:text-teal-700">
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
