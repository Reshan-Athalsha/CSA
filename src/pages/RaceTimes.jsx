import { useState, useEffect } from 'react';
import collections, { supabase } from '@/api/supabaseClient';
import { localCache } from '@/lib/cache';
import { Plus, Trophy, Search, Loader2, X, TrendingDown, Star } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

const EVENTS = [
  '50m Freestyle', '100m Freestyle', '200m Freestyle', '400m Freestyle',
  '50m Backstroke', '100m Backstroke', '200m Backstroke',
  '50m Breaststroke', '100m Breaststroke', '200m Breaststroke',
  '50m Butterfly', '100m Butterfly', '200m Butterfly',
  '200m Individual Medley', '400m Individual Medley'
];

function formatTime(secs) {
  if (!secs) return '–';
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toFixed(2).padStart(5, '0');
  return m > 0 ? `${m}:${s}` : `${parseFloat(s).toFixed(2)}s`;
}

function RaceTimeModal({ onClose, onSave, onReplace, onRemove, swimmers, meets }) {
  const [form, setForm] = useState({
    swimmer_id: '', meet_id: '', event: EVENTS[0], time_seconds: '', date: new Date().toISOString().split('T')[0], notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Build an optimistic record so the UI updates instantly
    const swimmer = swimmers.find(s => s.id === form.swimmer_id);
    const meet = meets.find(m => m.id === form.meet_id) || null;
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      swimmer_id: form.swimmer_id,
      meet_id: form.meet_id || null,
      event: form.event,
      time_seconds: parseFloat(form.time_seconds),
      date: form.date,
      notes: form.notes,
      is_personal_best: false,
      created_at: new Date().toISOString(),
      swimmers: swimmer,
      meets: meet,
    };

    // Show the new entry and close the modal right away
    onSave(optimistic);
    onClose();

    // Persist to DB — replace temp record with real one on success
    try {
      const real = await collections.racetimes.create({
        swimmer_id: form.swimmer_id,
        meet_id: form.meet_id || null,
        event: form.event,
        time_seconds: parseFloat(form.time_seconds),
        date: form.date,
        is_personal_best: false,
        notes: form.notes,
      });
      onReplace(tempId, real);
    } catch (err) {
      console.error('Failed to save race time:', err);
      onRemove(tempId);
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black" style={{ color: 'var(--color-text-header)' }}>Log Race Time</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Swimmer *</label>
            <select required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
              value={form.swimmer_id} onChange={e => setForm({ ...form, swimmer_id: e.target.value })}>
              <option value="">Select swimmer…</option>
              {swimmers.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Event *</label>
            <select required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
              value={form.event} onChange={e => setForm({ ...form, event: e.target.value })}>
              {EVENTS.map(ev => <option key={ev}>{ev}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Time (seconds) *</label>
              <input required type="number" min="0" step="0.01" className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                placeholder="e.g. 28.54"
                value={form.time_seconds} onChange={e => setForm({ ...form, time_seconds: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Date *</label>
              <input required type="date" className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Meet (optional)</label>
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
              value={form.meet_id} onChange={e => setForm({ ...form, meet_id: e.target.value })}>
              <option value="">No meet / training</option>
              {meets.map(m => <option key={m.id} value={m.id}>{m.meet_name} ({m.date})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Notes</label>
            <input className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: '#ade8f4', color: 'var(--color-text-main)' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ backgroundColor: '#0096c7' }}>
              {saving ? 'Saving…' : 'Log Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RaceTimes() {
  return (
    <RoleGuard allowedRoles={['Admin', 'AssistantCoach', 'Parent', 'Swimmer']}>
      {(user) => <RaceTimesContent user={user} />}
    </RoleGuard>
  );
}

function RaceTimesContent({ user }) {
  const [raceTimes, setRaceTimes] = useState([]);
  const [swimmers, setSwimmers] = useState([]);
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [pbSaving, setPbSaving] = useState({});
  const canEdit = ['Admin', 'AssistantCoach'].includes(user?.role);

  useEffect(() => {
    async function load() {
      // Serve cached swimmers/meets immediately; race times always fresh
      const cachedSw = localCache.getStale('swimmers_list');
      const cachedMt = localCache.getStale('meets_list');
      if (cachedSw) setSwimmers(cachedSw);
      if (cachedMt) setMeets(cachedMt);

      try {
        const [rt, sw, mt] = await Promise.all([
          collections.racetimes.findAll(),
          cachedSw ? Promise.resolve(cachedSw) : collections.swimmers.findAll(),
          cachedMt ? Promise.resolve(cachedMt) : collections.meets.findAll(),
        ]);
        setRaceTimes(rt);
        setSwimmers(sw);
        setMeets(mt);
        if (!cachedSw) localCache.set('swimmers_list', sw);
        if (!cachedMt) localCache.set('meets_list', mt);
      } catch (err) {
        console.warn('[CSA] Using cached race times data');
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleSaved(saved) {
    setRaceTimes(prev => [saved, ...prev]);
  }
  function handleReplace(tempId, real) {
    setRaceTimes(prev => prev.map(r => r.id === tempId ? real : r));
  }
  function handleRemove(tempId) {
    setRaceTimes(prev => prev.filter(r => r.id !== tempId));
  }

  async function togglePB(rt) {
    if (rt.id?.toString().startsWith('temp-')) return; // not persisted yet
    const newVal = !rt.is_personal_best;
    // Optimistic update
    setRaceTimes(prev => prev.map(r => r.id === rt.id ? { ...r, is_personal_best: newVal } : r));
    setPbSaving(s => ({ ...s, [rt.id]: true }));
    const { error } = await supabase
      .from('racetimes')
      .update({ is_personal_best: newVal })
      .eq('id', rt.id);
    if (error) {
      // Revert on failure
      setRaceTimes(prev => prev.map(r => r.id === rt.id ? { ...r, is_personal_best: rt.is_personal_best } : r));
    }
    setPbSaving(s => ({ ...s, [rt.id]: false }));
  }

  const filtered = raceTimes.filter(rt => {
    const sName = rt.swimmers ? `${rt.swimmers.first_name} ${rt.swimmers.last_name}` : '';
    return (eventFilter === 'All' || rt.event === eventFilter) &&
      sName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-5">
      {showModal && (
        <RaceTimeModal onClose={() => setShowModal(false)} onSave={handleSaved} onReplace={handleReplace} onRemove={handleRemove} swimmers={swimmers} meets={meets} />
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>Race Times</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>Track PBs and race results</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm" style={{ backgroundColor: '#0096c7' }}>
            <Plus className="h-4 w-4" /> Log Time
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input placeholder="Search swimmer…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }} />
        </div>
        <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}>
          <option value="All">All Events</option>
          {EVENTS.map(ev => <option key={ev}>{ev}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No race times logged yet</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#ade8f4] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f0f0] bg-[#f8fcff]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Swimmer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Meet</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">PB</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rt => (
                  <tr key={rt.id} className="border-b border-[#f0f0f0] hover:bg-[#f8fcff] transition">
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-header)' }}>{rt.swimmers ? `${rt.swimmers.first_name} ${rt.swimmers.last_name}` : '–'}</td>
                    <td className="px-4 py-3 text-gray-600">{rt.event}</td>
                    <td className="px-4 py-3 font-black" style={{ color: 'var(--color-primary)' }}>{formatTime(rt.time_seconds)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{rt.date}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{rt.meets?.meet_name || '–'}</td>
                    <td className="px-4 py-3">
                      {canEdit ? (
                        <button
                          onClick={() => togglePB(rt)}
                          disabled={!!pbSaving[rt.id]}
                          title={rt.is_personal_best ? 'Unmark PB' : 'Mark as Personal Best'}
                          className="h-7 w-7 flex items-center justify-center rounded-lg transition disabled:opacity-40"
                          style={{
                            backgroundColor: rt.is_personal_best ? '#16a34a' : '#f3f4f6',
                            color: rt.is_personal_best ? 'white' : '#9ca3af',
                          }}
                        >
                          {pbSaving[rt.id]
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Star className="h-3.5 w-3.5" fill={rt.is_personal_best ? 'currentColor' : 'none'} />}
                        </button>
                      ) : (
                        rt.is_personal_best && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                            <TrendingDown className="h-3 w-3" /> PB
                          </span>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}