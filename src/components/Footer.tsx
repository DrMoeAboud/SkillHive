import { Logo } from './ui';
import type { Page } from './Header';

export function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const linkCls = 'text-sm text-slate-500 hover:text-teal-600 transition-colors cursor-pointer';

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="text-sm text-slate-500 max-w-xs mt-3 leading-relaxed">
              A community marketplace for swapping skills. Teach what you know, learn what you love.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Platform</h4>
            <ul className="space-y-2">
              <li className={linkCls} onClick={() => onNavigate('listings')}>Browse Skills</li>
              <li className={linkCls} onClick={() => onNavigate('feed')}>Community Feed</li>
              <li className={linkCls} onClick={() => onNavigate('premium')}>Premium Membership</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Account</h4>
            <ul className="space-y-2">
              <li className={linkCls} onClick={() => onNavigate('signup')}>Sign Up</li>
              <li className={linkCls} onClick={() => onNavigate('signin')}>Sign In</li>
              <li className={linkCls} onClick={() => onNavigate('dashboard')}>Dashboard</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Company</h4>
            <ul className="space-y-2">
              <li className={linkCls} onClick={() => onNavigate('home')}>About Us</li>
              <li className="text-sm text-slate-400">Privacy Policy</li>
              <li className="text-sm text-slate-400">Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-400">© 2026 SkillHive. All rights reserved.</p>
          <p className="text-xs text-slate-400">Built with care for lifelong learners.</p>
        </div>
      </div>
    </footer>
  );
}
