import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Avatar, Button, Input, Badge, Stars, Tag, Modal, EmptyState } from '../components/ui';
import { averageRating, reviewCount, formatDate } from '../lib/matching';
import { uid } from '../lib/db';
import { MapPin, Plus, Trash2, Edit3, Crown, Award, Star as StarIcon, MessageSquare } from 'lucide-react';
import type { Page } from '../components/Header';

export function Profile({ onNavigate, userId }: { onNavigate: (page: Page) => void; userId?: string }) {
  const { user, db, mutate, updateProfile } = useAuth();
  const profileId = userId || user?.id;
  const profile = db.users.find((u) => u.id === profileId);
  const [editing, setEditing] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillType, setNewSkillType] = useState<'offer' | 'want'>('offer');
  const [showAddSkill, setShowAddSkill] = useState(false);

  if (!profile) return <EmptyState icon={StarIcon} title="Profile not found" />;
  const isOwn = user?.id === profile.id;
  const skills = db.skills.filter((s) => s.userId === profile.id);
  const offers = skills.filter((s) => s.type === 'offer');
  const wants = skills.filter((s) => s.type === 'want');
  const userListings = db.listings.filter((l) => l.userId === profile.id);
  const userReviews = db.reviews.filter((r) => r.revieweeId === profile.id);
  const rating = averageRating(db.reviews, profile.id);
  const completedSwaps = db.swaps.filter((s) => (s.userAId === profile.id || s.userBId === profile.id) && s.status === 'completed');

  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editLocation, setEditLocation] = useState(profile.location);

  const saveProfile = () => {
    updateProfile({ name: editName, bio: editBio, location: editLocation });
    setEditing(false);
  };

  const addSkill = () => {
    if (!newSkillName.trim() || !user) return;
    const newSkill = { id: uid(), name: newSkillName.trim(), type: newSkillType, userId: user.id, createdAt: Date.now() };
    mutate((d) => ({ ...d, skills: [...d.skills, newSkill] }));
    setNewSkillName('');
    setShowAddSkill(false);
  };

  const removeSkill = (skillId: string) => {
    mutate((d) => ({ ...d, skills: d.skills.filter((s) => s.id !== skillId) }));
  };

  const startConversation = () => {
    if (!user || !profile) return;
    const existing = db.conversations.find(
      (c) => c.participantIds.includes(user.id) && c.participantIds.includes(profile.id)
    );
    if (existing) {
      onNavigate('messages');
      return;
    }
    const newConvo = {
      id: uid(),
      participantIds: [user.id, profile.id],
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
    };
    mutate((d) => ({ ...d, conversations: [...d.conversations, newConvo] }));
    onNavigate('messages');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar name={profile.name} color={profile.avatarColor} size="lg" />
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                {profile.isPremium && <Badge color="amber"><Crown className="w-3 h-3" /> Premium</Badge>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.location}</span>}
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {isOwn ? (
                <Button variant="outline" onClick={() => setEditing(true)}><Edit3 className="w-4 h-4" /> Edit Profile</Button>
              ) : (
                <Button onClick={startConversation}><MessageSquare className="w-4 h-4" /> Message</Button>
              )}
            </div>
          </div>

          {profile.bio && <p className="mt-5 text-slate-600 leading-relaxed">{profile.bio}</p>}

          <div className="mt-5 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Stars rating={rating} size="lg" />
              <span className="text-sm text-slate-600">{rating > 0 ? rating.toFixed(1) : 'New'} ({reviewCount(db.reviews, profile.id)} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Award className="w-4 h-4 text-teal-600" /> {completedSwaps.length} swaps completed
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <StarIcon className="w-4 h-4 text-amber-500" /> {profile.points} points
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Can Teach</h2>
            {isOwn && <button onClick={() => { setNewSkillType('offer'); setShowAddSkill(true); }} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {offers.length === 0 ? (
              <p className="text-sm text-slate-400">No skills listed yet.</p>
            ) : offers.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 bg-teal-50 rounded-lg pl-3 pr-1.5 py-1.5">
                <Tag label={s.name} />
                {isOwn && <button onClick={() => removeSkill(s.id)} className="p-0.5 text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Wants to Learn</h2>
            {isOwn && <button onClick={() => { setNewSkillType('want'); setShowAddSkill(true); }} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {wants.length === 0 ? (
              <p className="text-sm text-slate-400">No skills listed yet.</p>
            ) : wants.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 bg-amber-50 rounded-lg pl-3 pr-1.5 py-1.5">
                <Tag label={s.name} />
                {isOwn && <button onClick={() => removeSkill(s.id)} className="p-0.5 text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">
        <h2 className="font-bold text-slate-900 mb-4">Listings by {profile.name}</h2>
        {userListings.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No listings yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {userListings.map((l) => (
              <div key={l.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800 text-sm">{l.title}</h3>
                  {l.isFeatured && <Badge color="amber">Featured</Badge>}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{l.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge color={l.kind === 'offer' ? 'teal' : l.kind === 'want' ? 'amber' : 'blue'}>{l.kind}</Badge>
                  <span className="text-sm font-semibold text-slate-700">{l.price === 0 ? 'Free' : `$${l.price}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">
        <h2 className="font-bold text-slate-900 mb-4">Reviews ({userReviews.length})</h2>
        {userReviews.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {userReviews.map((r) => {
              const reviewer = db.users.find((u) => u.id === r.reviewerId);
              return (
                <div key={r.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0">
                  {reviewer && <Avatar name={reviewer.name} color={reviewer.avatarColor} size="sm" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{reviewer?.name}</span>
                      <Stars rating={r.rating} />
                      <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{r.comment}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input label="Full name" value={editName} onChange={setEditName} />
          <Input label="Location" value={editLocation} onChange={setEditLocation} placeholder="City, State" />
          <Input label="Bio" value={editBio} onChange={setEditBio} textarea rows={4} placeholder="Tell the community about yourself..." />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={saveProfile}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Add Skill Modal */}
      <Modal open={showAddSkill} onClose={() => setShowAddSkill(false)} title="Add Skill">
        <div className="space-y-4">
          <Input label="Skill name" value={newSkillName} onChange={setNewSkillName} placeholder="e.g. Photography" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setNewSkillType('offer')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${newSkillType === 'offer' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600'}`}
              >
                I can teach this
              </button>
              <button
                onClick={() => setNewSkillType('want')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${newSkillType === 'want' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600'}`}
              >
                I want to learn this
              </button>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAddSkill(false)}>Cancel</Button>
            <Button onClick={addSkill}>Add Skill</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
