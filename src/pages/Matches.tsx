import { useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { Avatar, Button, Badge, EmptyState } from '../components/ui';
import { computeMatches, averageRating, reviewCount, formatDate, platformFee } from '../lib/matching';
import { uid } from '../lib/db';
import { Heart, MessageSquare, ArrowRight, Crown, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import type { Page } from '../components/Header';

export function Matches({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { user, db, mutate } = useAuth();

  const matches = useMemo(() => {
    if (!user) return [];
    return computeMatches(user, db.skills, db.users);
  }, [user, db.skills, db.users]);

  if (!user) return null;

  const startConversation = (otherId: string) => {
    const existing = db.conversations.find(
      (c) => c.participantIds.includes(user.id) && c.participantIds.includes(otherId)
    );
    if (existing) {
      onNavigate('messages');
      return;
    }
    const newConvo = {
      id: uid(),
      participantIds: [user.id, otherId],
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
    };
    mutate((d) => ({ ...d, conversations: [...d.conversations, newConvo] }));
    onNavigate('messages');
  };

  const initiateSwap = (otherId: string) => {
    const newSwap = {
      id: uid(),
      userAId: user.id,
      userBId: otherId,
      listingAId: null,
      listingBId: null,
      status: 'pending' as const,
      price: 0,
      platformFee: 0,
      createdAt: Date.now(),
      completedAt: null,
    };
    mutate((d) => ({ ...d, swaps: [...d.swaps, newSwap] }));
  };

  if (matches.length === 0) {
    const hasSkills = db.skills.some((s) => s.userId === user.id);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Matches</h1>
        <EmptyState
          icon={Heart}
          title={hasSkills ? "No matches yet" : "Add skills to get matched"}
          subtitle={hasSkills
            ? "We couldn't find any compatible swap partners right now. Try adding more skills to your profile."
            : "Add skills you can teach and skills you want to learn to your profile, and we'll find swap partners for you."}
        />
        {!hasSkills && <div className="text-center"><Button onClick={() => onNavigate('profile')}><ArrowRight className="w-4 h-4" /> Go to Profile</Button></div>}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Your Matches</h1>
        <p className="text-slate-500 mt-1">We found {matches.length} compatible skill swap partners based on your profile</p>
      </div>

      <div className="space-y-4">
        {matches.map((match, idx) => {
          const rating = averageRating(db.reviews, match.user.id);
          const reviews = reviewCount(db.reviews, match.user.id);
          const existingSwap = db.swaps.find(
            (s) => (s.userAId === user.id && s.userBId === match.user.id) ||
                   (s.userBId === user.id && s.userAId === match.user.id)
          );

          return (
            <div key={match.user.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Score ring */}
                <div className="flex lg:flex-col items-center gap-3 lg:gap-2 lg:w-20 flex-shrink-0">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                      <circle
                        cx="32" cy="32" r="28" fill="none" stroke="#0d9488" strokeWidth="4"
                        strokeDasharray={`${Math.min(match.score / 100, 1) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-lg font-bold text-slate-900">{match.score}</span>
                  </div>
                  {idx === 0 && <Badge color="amber"><Sparkles className="w-3 h-3" /> Best</Badge>}
                  <span className="text-xs text-slate-400 hidden lg:block">match score</span>
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <Avatar name={match.user.name} color={match.user.avatarColor} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => onNavigate('profile')} className="font-bold text-slate-900 hover:text-teal-600">
                          {match.user.name}
                        </button>
                        {match.user.isPremium && <Crown className="w-4 h-4 text-amber-500" />}
                      </div>
                      {match.user.location && <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5"><MapPin className="w-3 h-3" /> {match.user.location}</div>}
                      {rating > 0 && (
                        <div className="text-xs text-slate-500 mt-0.5">{rating.toFixed(1)} ★ ({reviews} reviews)</div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mt-3 bg-slate-50 rounded-xl p-3">
                    <TrendingUp className="w-4 h-4 inline mr-1 text-teal-600" />
                    {match.reason}
                  </p>

                  {/* Skill overlap */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {match.sharedOffer.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium">Can teach: {s}</span>
                    ))}
                    {match.sharedWant.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">Wants: {s}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:w-36 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => startConversation(match.user.id)} className="flex-1 lg:w-full">
                    <MessageSquare className="w-4 h-4" /> Message
                  </Button>
                  {existingSwap ? (
                    <Button size="sm" disabled className="flex-1 lg:w-full">
                      <Heart className="w-4 h-4" /> Swap Sent
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => initiateSwap(match.user.id)} className="flex-1 lg:w-full">
                      <Heart className="w-4 h-4" /> Request Swap
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
