import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import collections from '@/api/supabaseClient';
import { localCache } from '@/lib/cache';
import { formatTime } from '@/utils';
import {
  Plus, Calendar, MapPin, Edit2, Trash2, Loader2, X,
  ChevronDown, ChevronUp, Star, TrendingDown,
} from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

// ── Per-meet expandable results panel ───────────────────────────────────────
function MeetResults({ meet, isAdmin }) {
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [pbSaving, setPbSaving] = useState({});

  async function load() {
    const { data, error } = await supabase
      .from('racetimes')
      .select('*, swimmers(first_name, last_name)')
      .eq('meet_id', meet.id)
      .order('event')
      .order('time_seconds');
    if (!error) setResults(data || []);
  }

  function toggle() {
    if (!open && results === null) load();
    setOpen(o => !o);
  }

  async function togglePB(rt) {
    const newVal = !rt.is_personal_best;
    // Optimistic update — instant feedback
    setResults(prev => prev.map(r => r.id === rt.id ? { ...r, is_personal_best: newVal } : r));
    setPbSaving(s => ({ ...s, [rt.id]: true }));
    const { error } = await supabase
      .from('racetimes')
      .update({ is_personal_best: newVal })
      .eq('id', rt.id);
    if (error) {
      // Revert on failure
      setResults(prev => prev.map(r => r.id === rt.id ? { ...r, is_personal_best: rt.is_personal_best } : r));
    }
    setPbSaving(s => ({ ...s, [rt.id]: false }));
  }

  const grouped = results
    ? results.reduce((acc, rt) => {
        if (!acc[rt.event]) acc[rt.event] = [];
        acc[rt.event].push(rt);
        return acc;
      }, {})
    : {};

  const participantCount = results ? new Set(results.map(r => r.swimmer_id)).size : 0;

  return (
    <div className="mt-3 border-t border-[#f0f0f0] pt-3">
      <button
        onClick={toggle}
        className="flex items-center gap-2 text-xs font-semibold transition hover:opacity-70"
        style={{ color: 'var(--color-primary)' }}
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {open ? 'Hide Results' : 'View Results & Participants'}
        {results !== null && (
          <span className="ml-1 text-[10px] text-gray-400">
            {participantCount} participant{participantCount !== 1 ? 's' : ''} · {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {results === null ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
          ) : results.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No results logged for this meet yet.</p>
          ) : (
            Object.entries(grouped).map(([event, times]) => (
              <div key={event}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{event}</p>
                <div className="space-y-1">
                  {times.map((rt, idx) => (
                    <div
                      key={rt.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm"
                      style={{
                        backgroundColor: idx === 0 ? '#f0fbff' : '#fafafa',
                        border: rt.is_personal_best ? '1px solid #16a34a' : '1px solid transparent',
                      }}
                    >
                      <span className="text-[10px] font-bold w-4 text-gray-400">{idx + 1}</span>
                      <span className="flex-1 font-semibold truncate" style={{ color: 'var(--color-text-header)' }}>
                        {rt.swimmers ? `${rt.swimmers.first_name} ${rt.swimmers.last_name}` : '–'}
                      </span>
                      <span className="font-black" style={{ color: 'var(--color-primary)' }}>
                        {formatTime(rt.time_seconds)}
                      </span>
                      {rt.is_personal_best && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                          <TrendingDown className="h-3 w-3" /> PB
                        </span>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => togglePB(rt)}
                          disabled={!!pbSaving[rt.id]}
                          title={rt.is_personal_best ? 'Unmark PB' : 'Mark as Personal Best'}
                          className="h-6 w-6 flex items-center justify-center rounded-lg transition disabled:opacity-40 flex-shrink-0"
                          style={{
                            backgroundColor: rt.is_personal_best ? '#16a34a' : '#f3f4f6',
                            color: rt.is_personal_best ? 'white' : '#9ca3af',
                          }}
                        >
                          {pbSaving[rt.id]
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Star className="h-3 w-3" fill={rt.is_personal_best ? 'currentColor' : 'none'} />
                          }
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const STATUS_COLORS = { Upcoming: '#0096c7', Completed: '#16a34a', Cancelled: '#dc2626' };

function MeetModal({ meet, onClose, onSave }) {
  const [form, setForm] = useState(meet || { meet_name: '', date: '', location: '', status: 'Upcoming', description: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (meet?.id) {
      const updated = await collections.meets.update(meet.id, form);
      onSave(updated);
    } else {
      const created = await collections.meets.create(form);
      onSave(created);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black" style={{ color: 'var(--color-text-header)' }}>{meet ? 'Edit Meet' : 'Add Meet'}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Meet Name *</label>
            <input required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
              value={form.meet_name} onChange={e => setForm({ ...form, meet_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Date *</label>
              <input required type="date" className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Status</label>
              <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
                value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {['Upcoming', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Location</label>
            <input className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
              value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Description</label>
            <textarea rows={2} className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" style={{ borderColor: '#ade8f4' }}
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: '#ade8f4', color: 'var(--color-text-main)' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ backgroundColor: '#0096c7' }}>
              {saving ? 'Saving…' : 'Save Meet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Meets() {
  return (
    <RoleGuard allowedRoles={['Admin', 'AssistantCoach', 'Parent', 'Swimmer']}>
      {(user) => <MeetsContent user={user} />}
    </RoleGuard>
  );
}

function MeetsContent({ user }) {
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const CACHE_KEY = 'meets_list';
    const cached = localCache.getStale(CACHE_KEY);
    if (cached) { setMeets(cached); setLoading(false); }
    collections.meets.findAll().then(m => {
      m.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localCache.set(CACHE_KEY, m);
      setMeets(m);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id) {
    setDeleting(id);
    setMeets(prev => {
      const next = prev.filter(x => x.id !== id);
      localCache.set('meets_list', next);
      return next;
    });
    await collections.meets.delete(id);
    setDeleting(null);
  }

  function handleSaved(saved) {
    setMeets(prev => {
      const idx = prev.findIndex(m => m.id === saved.id);
      const next = idx >= 0
        ? prev.map(m => m.id === saved.id ? { ...m, ...saved } : m)
        : [saved, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localCache.set('meets_list', next);
      return next;
    });
  }

  const filtered = meets.filter(m => statusFilter === 'All' || m.status === statusFilter);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {(modal === 'add' || (modal && modal.id)) && (
        <MeetModal meet={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSaved} />
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>Meets & Competitions</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>{meets.length} total meets</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal('add')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm" style={{ backgroundColor: '#0096c7' }}>
            <Plus className="h-4 w-4" /> Add Meet
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['All', 'Upcoming', 'Completed', 'Cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            style={{ backgroundColor: statusFilter === s ? '#0096c7' : '#f0fbff', color: statusFilter === s ? 'white' : 'var(--color-primary-dark)', border: '1px solid #ade8f4' }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No meets found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(meet => (
            <div key={meet.id} className="bg-white rounded-2xl p-5 border border-[#ade8f4] shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-base truncate" style={{ color: 'var(--color-text-header)' }}>{meet.meet_name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[meet.status] }}>
                      {meet.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{meet.date}</span>
                    {meet.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{meet.location}</span>}
                  </div>
                  {meet.description && <p className="text-xs text-gray-500 mt-2">{meet.description}</p>}
                </div>
                {isAdmin && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => setModal(meet)} className="h-8 w-8 flex items-center justify-center rounded-lg border hover:bg-[#f0fbff] transition" style={{ borderColor: '#ade8f4', color: 'var(--color-primary)' }}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(meet.id)} disabled={deleting === meet.id} className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-200 hover:bg-red-50 text-red-500 transition disabled:opacity-40">
                      {deleting === meet.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Results panel — visible to all roles */}
              {meet.status !== 'Upcoming'
                ? <MeetResults meet={meet} isAdmin={isAdmin} />
                : <p className="mt-3 text-[10px] text-gray-400 border-t border-[#f0f0f0] pt-3">
                    Results will appear here once the meet is completed.
                  </p>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}