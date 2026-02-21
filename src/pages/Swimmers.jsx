import { useState, useEffect } from 'react';
import collections from '@/api/supabaseClient';
import { localCache } from '@/lib/cache';
import { Plus, Search, Edit2, Trash2, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

const SQUADS = ['Beginner', 'Intermediate', 'Elite'];

export default function Swimmers() {
  return (
    <RoleGuard allowedRoles={['Admin', 'AssistantCoach']}>
      {(user) => <SwimmersContent user={user} />}
    </RoleGuard>
  );
}

function SwimmerModal({ swimmer, onClose, onSave }) {
  const [form, setForm] = useState(swimmer || {
    first_name: '', last_name: '', parent_email: '', parent_name: '', parent_phone: '', 
    date_of_birth: '', squad: 'Beginner',
    medical_notes: '', emergency_contact: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (swimmer?.id) {
      const updated = await collections.swimmers.update(swimmer.id, form);
      onSave(updated);
    } else {
      const created = await collections.swimmers.create(form);
      onSave(created);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black" style={{ color: 'var(--color-text-header)' }}>{swimmer ? 'Edit Swimmer' : 'Add Swimmer'}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>First Name *</label>
              <input required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Last Name *</label>
              <input required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Squad Level *</label>
              <select required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
                value={form.squad} onChange={e => setForm({ ...form, squad: e.target.value })}>
                {SQUADS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Date of Birth</label>
              <input type="date" className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Parent Name</label>
              <input className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                value={form.parent_name} onChange={e => setForm({ ...form, parent_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Parent Email</label>
              <input type="email" className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                value={form.parent_email} onChange={e => setForm({ ...form, parent_email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Parent Phone</label>
              <input className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Emergency Contact</label>
              <input className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Medical Information</label>
            <textarea rows={2} className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" style={{ borderColor: '#ade8f4' }}
              value={form.medical_notes} onChange={e => setForm({ ...form, medical_notes: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: '#ade8f4', color: 'var(--color-text-main)' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ backgroundColor: '#0096c7' }}>
              {saving ? 'Saving…' : 'Save Swimmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SwimmersContent({ user }) {
  const [swimmers, setSwimmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [squadFilter, setSquadFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | swimmer obj
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadSwimmers();
  }, []);

  async function loadSwimmers() {
    const CACHE_KEY = 'swimmers_list';
    // Show cached data instantly, then refresh silently
    const cached = localCache.getStale(CACHE_KEY);
    if (cached) {
      setSwimmers(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const list = await collections.swimmers.findAll();
      list.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
      localCache.set(CACHE_KEY, list);
      setSwimmers(list);
    } catch (err) {
      console.warn('[CSA] Using cached swimmers list');
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    setDeleting(id);
    await collections.swimmers.delete(id);
    setSwimmers(s => s.filter(x => x.id !== id));
    setDeleting(null);
  }

  function handleSaved(saved) {
    setSwimmers(prev => {
      const idx = prev.findIndex(s => s.id === saved.id);
      const next = idx >= 0
        ? prev.map((s, i) => i === idx ? { ...s, ...saved } : s)
        : [...prev, saved];
      const sorted = next.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
      localCache.set('swimmers_list', sorted); // keep cache in sync
      return sorted;
    });
  }

  const filtered = swimmers.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    return (squadFilter === 'All' || s.squad === squadFilter) &&
      fullName.includes(search.toLowerCase());
  });

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="space-y-5">
      {(modal === 'add' || (modal && modal.id)) && (
        <SwimmerModal swimmer={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSaved} />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>Swimmers</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>{swimmers.length} registered swimmers</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal('add')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: '#0096c7' }}>
            <Plus className="h-4 w-4" /> Add Swimmer
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input placeholder="Search swimmers…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }} />
        </div>
        <select value={squadFilter} onChange={e => setSquadFilter(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}>
          <option value="All">All Squads</option>
          {SQUADS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Squad group counts */}
      <div className="grid grid-cols-3 gap-3">
        {SQUADS.map(sq => {
          const count = swimmers.filter(s => s.squad === sq).length;
          const colors = { Beginner: '#48cae4', Intermediate: '#0096c7', Elite: '#023e8a' };
          return (
            <div key={sq} className="bg-white rounded-xl p-3 border border-[#ade8f4] text-center cursor-pointer hover:bg-[#f0fbff] transition"
              onClick={() => setSquadFilter(squadFilter === sq ? 'All' : sq)}>
              <div className="text-xl font-black" style={{ color: colors[sq] }}>{count}</div>
              <div className="text-[11px] font-semibold text-gray-500">{sq}</div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No swimmers found</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(swimmer => {
            const fullName = `${swimmer.first_name} ${swimmer.last_name}`;
            return (
            <div key={swimmer.id} className="bg-white rounded-2xl p-4 border border-[#ade8f4] shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
                  {swimmer.first_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: 'var(--color-text-header)' }}>{fullName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white"
                      style={{ backgroundColor: { Beginner: '#48cae4', Intermediate: '#0096c7', Elite: '#023e8a' }[swimmer.squad] }}>
                      {swimmer.squad}
                    </span>
                  </div>
                  {swimmer.date_of_birth && <p className="text-[10px] text-gray-400 mt-1">DOB: {swimmer.date_of_birth}</p>}
                  {swimmer.parent_email && <p className="text-[10px] text-gray-400 truncate">{swimmer.parent_email}</p>}
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[#f0f0f0]">
                  <button onClick={() => setModal(swimmer)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold border hover:bg-[#f0fbff] transition"
                    style={{ borderColor: '#ade8f4', color: 'var(--color-primary)' }}>
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(swimmer.id)} disabled={deleting === swimmer.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold border hover:bg-red-50 transition text-red-500 border-red-200 disabled:opacity-40">
                    {deleting === swimmer.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Trash2 className="h-3.5 w-3.5" /> Delete</>}
                  </button>
                </div>
              )}
            </div>
          )})}
        </div>
      )}
    </div>
  );
}