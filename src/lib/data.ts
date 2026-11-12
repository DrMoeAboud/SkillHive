import { supabase, type Profile, type UserSkill, type WantedSkill, type Listing, type Swap, type Conversation, type Message, type Rating, type FeedPost } from './supabase';

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return data as Profile[];
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function fetchUserSkills(): Promise<UserSkill[]> {
  const { data, error } = await supabase.from('user_skills').select('*');
  if (error) throw error;
  return data as UserSkill[];
}

export async function fetchWantedSkills(): Promise<WantedSkill[]> {
  const { data, error } = await supabase.from('wanted_skills').select('*');
  if (error) throw error;
  return data as WantedSkill[];
}

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Listing[];
}

export async function fetchSwaps(): Promise<Swap[]> {
  const { data, error } = await supabase.from('swaps').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Swap[];
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return data as Conversation[];
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Message[];
}

export async function fetchRatings(): Promise<Rating[]> {
  const { data, error } = await supabase.from('ratings').select('*');
  if (error) throw error;
  return data as Rating[];
}

export async function fetchFeedPosts(): Promise<FeedPost[]> {
  const { data, error } = await supabase.from('feed_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as FeedPost[];
}

export async function findOrCreateConversation(userId: string, otherUserId: string): Promise<Conversation | null> {
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(participant1_id.eq.${userId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${userId})`)
    .maybeSingle();

  if (existing) return existing as Conversation;

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant1_id: userId,
      participant2_id: otherUserId,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Conversation | null;
}

export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<void> {
  const { error: msgError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
  });
  if (msgError) throw msgError;

  const { error: convError } = await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);
  if (convError) throw convError;
}

export async function createSwap(userAId: string, userBId: string): Promise<Swap | null> {
  const { data, error } = await supabase
    .from('swaps')
    .insert({
      user_a_id: userAId,
      user_b_id: userBId,
      status: 'pending',
      price: 0,
      platform_fee: 0,
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Swap | null;
}

export async function createFeedPost(userId: string, content: string, postType: string = 'post', metadata: Record<string, unknown> = {}): Promise<void> {
  const { error } = await supabase.from('feed_posts').insert({
    user_id: userId,
    content,
    post_type: postType,
    metadata,
  });
  if (error) throw error;
}

export async function createListing(
  userId: string,
  kind: 'offer' | 'want' | 'course',
  title: string,
  description: string,
  tags: string[],
  price: number,
  isOnline: boolean
): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('listings')
    .insert({
      user_id: userId,
      kind,
      title,
      description,
      tags,
      price,
      is_online: isOnline,
      is_featured: false,
    })
    .select()
    .maybeSingle();
  if (error) throw error;

  if (data) {
    await createFeedPost(userId, '', kind === 'course' ? 'course' : 'listing', { listing_id: (data as Listing).id });
  }

  return data as Listing | null;
}

export async function deleteListing(listingId: string): Promise<void> {
  await supabase.from('feed_posts').delete().eq('metadata->>listing_id', listingId);
  const { error } = await supabase.from('listings').delete().eq('id', listingId);
  if (error) throw error;
}

export async function featureListing(listingId: string): Promise<void> {
  const { error } = await supabase.from('listings').update({ is_featured: true }).eq('id', listingId);
  if (error) throw error;
}

export async function addUserSkill(userId: string, skillName: string): Promise<void> {
  const { error } = await supabase.from('user_skills').insert({
    user_id: userId,
    skill_name: skillName,
    category: 'general',
  });
  if (error) throw error;
}

export async function addWantedSkill(userId: string, skillName: string): Promise<void> {
  const { error } = await supabase.from('wanted_skills').insert({
    user_id: userId,
    skill_name: skillName,
    category: 'general',
  });
  if (error) throw error;
}

export async function removeUserSkill(skillId: string): Promise<void> {
  const { error } = await supabase.from('user_skills').delete().eq('id', skillId);
  if (error) throw error;
}

export async function removeWantedSkill(skillId: string): Promise<void> {
  const { error } = await supabase.from('wanted_skills').delete().eq('id', skillId);
  if (error) throw error;
}

export { supabase };
