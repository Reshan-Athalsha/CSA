import { useState, useEffect } from 'react';
import collections from '@/api/supabaseClient';
import { localCache } from '@/lib/cache';
import { Plus, Bell, Edit2, Trash2, Loader2, X } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

const PRIORITY_CONFIG = {
  Urgent: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
  Important: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' },
  Normal: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-400' },
};

function NoticeModal({ notice, onClose, onSave, user }) {
  const [form, setForm] = useState(notice || { title: '', content: '', target_audience: 'All', priority: 'Normal', author_name: user?.profile?.full_name || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (notice?.id) {
      // Optimistic update using form data (update returns { id, ...updates })
      const optimistic = { ...notice, ...form };
      onSave(optimistic);
      onClose();
      await collections.notices.update(notice.id, form);
    } else {
      const created = await collections.notices.create({ ...form, author_name: user?.profile?.full_name || 'Admin' });
      onSave(created);
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black" style={{ color: 'var(--color-text-header)' }}>{notice ? 'Edit Notice' : 'Post Notice'}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Title *</label>
            <input required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Content *</label>
            <textarea required rows={4} className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" style={{ borderColor: '#ade8f4' }}
              value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Audience</label>
              <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
                value={form.target_audience} onChange={e => setForm({ ...form, target_audience: e.target.value })}>
                {['All', 'Beginner', 'Intermediate', 'Elite', 'Parents', 'Coaches'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Priority</label>
              <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
                value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {['Normal', 'Important', 'Urgent'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: '#ade8f4', color: 'var(--color-text-main)' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ backgroundColor: '#0096c7' }}>
              {saving ? 'Posting…' : 'Post Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Notices() {
  return (
    <RoleGuard allowedRoles={['Admin', 'AssistantCoach', 'Parent', 'Swimmer']}>
      {(user) => <NoticesContent user={user} />}
    </RoleGuard>
  );
}

function NoticesContent({ user }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const CACHE_KEY = 'notices_list';
    // Show cached notices instantly
    const cached = localCache.getStale(CACHE_KEY);
    if (cached) {
      setNotices(cached);
      setLoading(false);
    }
    collections.notices.findAll().then(n => {
      n.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      localCache.set(CACHE_KEY, n);
      setNotices(n);
      setLoading(false);
    });
  }, []);

  function handleSaved(saved) {
    setNotices(prev => {
      const idx = prev.findIndex(n => n.id === saved.id);
      const next = idx >= 0 ? prev.map(n => n.id === saved.id ? { ...n, ...saved } : n) : [saved, ...prev];
      localCache.set('notices_list', next);
      return next;
    });
  }

  async function handleDelete(id) {
    setDeleting(id);
    // Optimistic: remove from list immediately
    setNotices(prev => {
      const next = prev.filter(n => n.id !== id);
      localCache.set('notices_list', next);
      return next;
    });
    await collections.notices.delete(id);
    setDeleting(null);
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {(modal === 'add' || (modal && modal.id)) && (
        <NoticeModal notice={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSaved} user={user} />
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>Notices</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>Academy announcements</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal('add')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm" style={{ backgroundColor: '#0096c7' }}>
            <Plus className="h-4 w-4" /> Post Notice
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>
      ) : notices.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 text-sm">No notices yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map(notice => {
            const cfg = PRIORITY_CONFIG[notice.priority] || PRIORITY_CONFIG.Normal;
            return (
              <div key={notice.id} className={`bg-white rounded-2xl p-5 border shadow-sm ${cfg.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {notice.priority}
                      </span>
                      {notice.target_audience && notice.target_audience !== 'All' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">{notice.target_audience}</span>
                      )}
                    </div>
                    <h3 className="font-black text-base mb-1" style={{ color: 'var(--color-text-header)' }}>{notice.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                    <p className="text-[10px] text-gray-400 mt-3">
                      {notice.author_name && `Posted by ${notice.author_name} · `}
                      {notice.created_at ? new Date(notice.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => setModal(notice)} className="h-8 w-8 flex items-center justify-center rounded-lg border hover:bg-[#f0fbff] transition" style={{ borderColor: '#ade8f4', color: 'var(--color-primary)' }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(notice.id)} disabled={deleting === notice.id} className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-200 hover:bg-red-50 text-red-500 transition disabled:opacity-40">
                        {deleting === notice.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}