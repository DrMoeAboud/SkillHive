import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { Avatar, EmptyState } from '../components/ui';
import { uid } from '../lib/db';
import { formatDate } from '../lib/matching';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import type { Page } from '../components/Header';

export function Messages({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { user, db, mutate } = useAuth();
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myConvos = useMemo(() => {
    if (!user) return [];
    return db.conversations
      .filter((c) => c.participantIds.includes(user.id))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }, [db.conversations, user]);

  useEffect(() => {
    if (myConvos.length > 0 && !activeConvoId) {
      setActiveConvoId(myConvos[0].id);
    }
  }, [myConvos, activeConvoId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvoId, db.messages]);

  if (!user) return null;

  const activeConvo = db.conversations.find((c) => c.id === activeConvoId);
  const otherUserId = activeConvo?.participantIds.find((id) => id !== user.id);
  const otherUser = db.users.find((u) => u.id === otherUserId);
  const convoMessages = activeConvo
    ? db.messages.filter((m) => m.conversationId === activeConvo.id).sort((a, b) => a.createdAt - b.createdAt)
    : [];

  const sendMessage = () => {
    if (!messageText.trim() || !activeConvo) return;
    const newMsg = {
      id: uid(),
      conversationId: activeConvo.id,
      senderId: user.id,
      text: messageText.trim(),
      createdAt: Date.now(),
    };
    mutate((d) => ({
      ...d,
      messages: [...d.messages, newMsg],
      conversations: d.conversations.map((c) => c.id === activeConvo.id ? { ...c, lastMessageAt: Date.now() } : c),
    }));
    setMessageText('');
  };

  if (myConvos.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>
        <EmptyState icon={MessageSquare} title="No conversations yet" subtitle="Start a conversation from a profile page or your matches to begin chatting." />
        <div className="text-center mt-4">
          <button onClick={() => onNavigate('matches')} className="text-teal-600 font-semibold hover:text-teal-700">Find matches →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex h-[600px]">
        {/* Conversation list */}
        <div className={`w-full sm:w-72 border-r border-slate-200 flex flex-col ${activeConvoId && 'hidden sm:flex'}`}>
          <div className="p-3 border-b border-slate-100 text-sm font-semibold text-slate-500">Conversations</div>
          <div className="flex-1 overflow-y-auto">
            {myConvos.map((convo) => {
              const otherId = convo.participantIds.find((id) => id !== user.id);
              const other = db.users.find((u) => u.id === otherId);
              if (!other) return null;
              const lastMsg = db.messages
                .filter((m) => m.conversationId === convo.id)
                .sort((a, b) => b.createdAt - a.createdAt)[0];
              return (
                <button
                  key={convo.id}
                  onClick={() => setActiveConvoId(convo.id)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors ${activeConvoId === convo.id ? 'bg-teal-50 border-l-2 border-teal-600' : 'border-l-2 border-transparent'}`}
                >
                  <Avatar name={other.name} color={other.avatarColor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{other.name}</div>
                    <div className="text-xs text-slate-400 truncate">{lastMsg?.text || 'No messages yet'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${!activeConvoId && 'hidden sm:flex'}`}>
          {activeConvo && otherUser ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                <button onClick={() => setActiveConvoId(null)} className="sm:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar name={otherUser.name} color={otherUser.avatarColor} size="sm" />
                <div>
                  <button onClick={() => onNavigate('profile')} className="text-sm font-semibold text-slate-800 hover:text-teal-600">{otherUser.name}</button>
                  <div className="text-xs text-slate-400">Started {formatDate(activeConvo.createdAt)}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {convoMessages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-teal-600 text-white rounded-br-md' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'}`}>
                          {msg.text}
                        </div>
                        <div className={`text-xs text-slate-400 mt-1 ${isMe ? 'text-right' : ''}`}>{formatDate(msg.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
