import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Avatar, Button, Badge, Tag, EmptyState, Modal, Input } from '../components/ui';
import { formatDate } from '../lib/matching';
import { uid } from '../lib/db';
import { Newspaper, Heart, Sparkles, BookOpen, Send, ArrowRight } from 'lucide-react';
import type { Page } from '../components/Header';

export function Feed({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { user, db, mutate } = useAuth();
  const [postText, setPostText] = useState('');
  const [showPost, setShowPost] = useState(false);

  const createPost = () => {
    if (!user || !postText.trim()) return;
    const newPost = { id: uid(), userId: user.id, content: postText.trim(), type: 'post' as const, refId: null, createdAt: Date.now() };
    mutate((d) => ({ ...d, feed: [newPost, ...d.feed] }));
    setPostText('');
    setShowPost(false);
  };

  const renderFeedItem = (item: typeof db.feed[0]) => {
    const author = db.users.find((u) => u.id === item.userId);
    if (!author) return null;

    if (item.type === 'listing' || item.type === 'course') {
      const listing = db.listings.find((l) => l.id === item.refId);
      if (!listing) return null;
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={author.name} color={author.avatarColor} size="sm" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-slate-800">{author.name}</span>
              <span className="text-sm text-slate-500"> {item.type === 'course' ? 'published a course' : 'posted a listing'}</span>
              <div className="text-xs text-slate-400">{formatDate(item.createdAt)}</div>
            </div>
            <Badge color={listing.kind === 'offer' ? 'teal' : listing.kind === 'want' ? 'amber' : 'blue'}>
              {listing.kind === 'course' ? <><BookOpen className="w-3 h-3" /> Course</> : listing.kind}
            </Badge>
          </div>
          <h3 className="font-bold text-slate-900 mb-1">{listing.title}</h3>
          <p className="text-sm text-slate-600 mb-3">{listing.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {listing.tags.map((t) => <Tag key={t} label={t} />)}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-lg font-bold text-slate-900">{listing.price === 0 ? 'Free' : `$${listing.price}`}</span>
            <Button size="sm" variant="outline" onClick={() => onNavigate('listings')}>View <ArrowRight className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      );
    }

    if (item.type === 'swap') {
      const swap = db.swaps.find((s) => s.id === item.refId);
      if (!swap) return null;
      const userA = db.users.find((u) => u.id === swap.userAId);
      const userB = db.users.find((u) => u.id === swap.userBId);
      if (!userA || !userB) return null;
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex -space-x-2">
              <Avatar name={userA.name} color={userA.avatarColor} size="sm" />
              <div className="ring-2 ring-white rounded-full"><Avatar name={userB.name} color={userB.avatarColor} size="sm" /></div>
            </div>
            <div className="flex-1">
              <span className="text-sm"><b className="text-slate-800">{userA.name}</b> <span className="text-slate-500">swapped skills with</span> <b className="text-slate-800">{userB.name}</b></span>
              <div className="text-xs text-slate-400 flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" /> {formatDate(item.createdAt)}</div>
            </div>
            <Badge color="green">Completed</Badge>
          </div>
        </div>
      );
    }

    // Regular post
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <Avatar name={author.name} color={author.avatarColor} size="md" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate('profile')} className="text-sm font-semibold text-slate-800 hover:text-teal-600">{author.name}</button>
              {author.isPremium && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">{item.content}</p>
            <div className="mt-3 flex items-center gap-4">
              <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors">
                <Heart className="w-4 h-4" /> Like
              </button>
              <span className="text-xs text-slate-400">{author.points} points earned</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community Feed</h1>
          <p className="text-slate-500 mt-1">Recent listings, swaps, and posts from the SkillHive community</p>
        </div>
        {user && (
          <Button onClick={() => setShowPost(true)}>
            <Send className="w-4 h-4" /> <span className="hidden sm:inline">Share Post</span>
          </Button>
        )}
      </div>

      {user && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} color={user.avatarColor} size="sm" />
            <button onClick={() => setShowPost(true)} className="flex-1 text-left px-4 py-2.5 rounded-xl bg-slate-50 text-slate-400 text-sm hover:bg-slate-100 transition-colors">
              Share something with the community...
            </button>
          </div>
        </div>
      )}

      {db.feed.length === 0 ? (
        <EmptyState icon={Newspaper} title="No activity yet" subtitle="Be the first to share something with the community!" />
      ) : (
        <div className="space-y-4">
          {db.feed.map((item) => <div key={item.id}>{renderFeedItem(item)}</div>)}
        </div>
      )}

      <Modal open={showPost} onClose={() => setShowPost(false)} title="Share a Post">
        <div className="space-y-4">
          <Input label="What's on your mind?" value={postText} onChange={setPostText} textarea rows={4} placeholder="Share a win, ask for advice, or start a discussion..." />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowPost(false)}>Cancel</Button>
            <Button onClick={createPost} disabled={!postText.trim()}>Post</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
