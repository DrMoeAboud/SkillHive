import type { ReactNode } from 'react';
import { Star, X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-4 pt-12" onClick={onClose}>
      <div className={`w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-slate-200/80 animate-[fadeIn_0.2s_ease]`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${cls} ${n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </div>
  );
}

const AVATAR_GRADIENTS = [
  'from-teal-400 to-emerald-500',
  'from-orange-400 to-rose-500',
  'from-blue-400 to-cyan-500',
  'from-pink-400 to-fuchsia-500',
  'from-emerald-400 to-green-600',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-sky-500',
  'from-rose-400 to-red-500',
  'from-indigo-400 to-blue-500',
  'from-lime-400 to-emerald-500',
];

function pickGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function Avatar({ name, size = 'md', avatarUrl }: { name: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; avatarUrl?: string | null }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };
  const init = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const gradient = pickGradient(name);

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm`} />;
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold flex-shrink-0 ring-2 ring-white shadow-sm`}>
      {init}
    </div>
  );
}

export function Badge({ children, color = 'slate' }: { children: ReactNode; color?: 'slate' | 'teal' | 'amber' | 'blue' | 'green' | 'rose' | 'emerald' }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    teal: 'bg-teal-100 text-teal-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
}

export function Tag({ label }: { label: string }) {
  return <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">{label}</span>;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-600/20',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400',
    amber: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  textarea = false,
  rows = 3,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
}) {
  const base = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all';
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>}
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} rows={rows} className={base} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className={base} />
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-sm">{subtitle}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );
}

export function Logo({ size = 'md', showText = true }: { size?: 'sm' | 'md' | 'lg'; showText?: boolean }) {
  const dims = { sm: 'w-8 h-8', md: 'w-9 h-9', lg: 'w-12 h-12' };
  const iconSize = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };
  const textSize = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };

  return (
    <div className="flex items-center gap-2">
      <div className={`${dims[size]} rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
        <svg className={`${iconSize[size]} text-white relative z-10`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      {showText && (
        <span className={`${textSize[size]} font-bold tracking-tight text-slate-900`}>
          Skill<span className="text-teal-600">Hive</span>
        </span>
      )}
    </div>
  );
}
