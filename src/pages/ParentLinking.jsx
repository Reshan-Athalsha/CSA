import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import collections from '@/api/supabaseClient';
import { Users, Search, CheckCircle, Loader2, Link2, AlertCircle } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

export default function ParentLinking() {
  return (
    <RoleGuard allowedRoles={['Admin']}>
      <ParentLinkingContent />
    </RoleGuard>
  );
}

function ParentLinkingContent() {
  const [swimmers, setSwimmers] = useState([]);
  const [parents, setParents] = useState([]);
  const [swimmerAccounts, setSwimmerAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [sw, profilesRes] = await Promise.all([
        collections.swimmers.findAll(),
        supabase.from('user_profiles').select('*').eq('status', 'approved').order('full_name'),
      ]);
      const profiles = profilesRes.data || [];
      setSwimmers(sw);
      setParents(profiles.filter(p => p.role === 'Parent'));
      setSwimmerAccounts(profiles.filter(p => p.role === 'Swimmer'));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function linkParent(swimmerId, parentEmail) {
    const key = `parent-${swimmerId}`;
    setSaving(s => ({ ...s, [key]: true }));
    try {
      // Also update parent_id if we can map email → profile id
      const parentProfile = parents.find(p => p.email === parentEmail);
      const updates = { parent_email: parentEmail || null };
      if (parentProfile) updates.parent_id = parentProfile.id;
      else updates.parent_id = null;

      await collections.swimmers.update(swimmerId, updates);
      setSwimmers(sw =>
        sw.map(s => s.id === swimmerId ? { ...s, parent_email: parentEmail || null, parent_id: parentProfile?.id || null } : s)
      );
      showToast(parentEmail ? 'Parent linked successfully' : 'Parent unlinked');
    } catch (err) {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  }

  async function linkSwimmerAccount(swimmerId, swimmerUserId) {
    const key = `swimmer-${swimmerId}`;
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await collections.swimmers.update(swimmerId, { swimmer_user_id: swimmerUserId || null });
      setSwimmers(sw =>
        sw.map(s => s.id === swimmerId ? { ...s, swimmer_user_id: swimmerUserId || null } : s)
      );
      showToast(swimmerUserId ? 'Swimmer account linked' : 'Swimmer account unlinked');
    } catch (err) {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  }

  const filtered = swimmers.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const linkedCount = swimmers.filter(s => s.parent_email || s.parent_id).length;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition-all ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-[#0096c7]'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>Family Pairing</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>
          Link each swimmer to a parent account and their own swimmer login
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Swimmers', value: swimmers.length, color: '#0096c7' },
          { label: 'Parent Linked', value: linkedCount, color: '#023e8a' },
          { label: 'Unlinked', value: swimmers.length - linkedCount, color: '#9ca3af' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-3 text-center border border-[#ade8f4]">
            <div className="text-xl font-black" style={{ color }}>{value}</div>
            <div className="text-[10px] text-gray-500 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Info banner if no parent accounts yet */}
      {parents.length === 0 && !loading && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            No approved parent accounts found. Parents need to sign up and be approved before they can be linked.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          placeholder="Search swimmer…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none bg-white"
          style={{ borderColor: '#ade8f4' }}
        />
      </div>

      {/* Swimmer cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-[#ade8f4] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No swimmers found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(swimmer => (
            <div key={swimmer.id} className="bg-white rounded-2xl p-4 border border-[#ade8f4] shadow-sm">
              {/* Swimmer info */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary-dark)' }}
                >
                  {swimmer.first_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--color-text-header)' }}>
                    {swimmer.first_name} {swimmer.last_name}
                  </p>
                  <p className="text-[10px] text-gray-400">{swimmer.squad}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {(swimmer.parent_email || swimmer.parent_id) && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Link2 className="h-2.5 w-2.5" /> Parent
                    </span>
                  )}
                  {swimmer.swimmer_user_id && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Link2 className="h-2.5 w-2.5" /> Swimmer
                    </span>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {/* ── Parent Account ── */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Parent Account
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={swimmer.parent_email || ''}
                      onChange={e => linkParent(swimmer.id, e.target.value)}
                      disabled={saving[`parent-${swimmer.id}`]}
                      className="flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none bg-white disabled:opacity-60"
                      style={{ borderColor: (swimmer.parent_email || swimmer.parent_id) ? '#0096c7' : '#ade8f4' }}
                    >
                      <option value="">— Not linked —</option>
                      {parents.map(p => (
                        <option key={p.id} value={p.email}>
                          {p.full_name} ({p.email})
                        </option>
                      ))}
                    </select>
                    {saving[`parent-${swimmer.id}`]
                      ? <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" />
                      : (swimmer.parent_email || swimmer.parent_id)
                        ? <CheckCircle className="h-4 w-4 text-[#0096c7] flex-shrink-0" />
                        : null
                    }
                  </div>
                </div>

                {/* ── Swimmer Account ── */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Swimmer Login (Child)
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={swimmer.swimmer_user_id || ''}
                      onChange={e => linkSwimmerAccount(swimmer.id, e.target.value)}
                      disabled={saving[`swimmer-${swimmer.id}`]}
                      className="flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none bg-white disabled:opacity-60"
                      style={{ borderColor: swimmer.swimmer_user_id ? '#023e8a' : '#ade8f4' }}
                    >
                      <option value="">— Not linked —</option>
                      {swimmerAccounts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.email})
                        </option>
                      ))}
                    </select>
                    {saving[`swimmer-${swimmer.id}`]
                      ? <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" />
                      : swimmer.swimmer_user_id
                        ? <CheckCircle className="h-4 w-4 text-[#023e8a] flex-shrink-0" />
                        : null
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note about swimmer accounts */}
      <div className="bg-[#f0fbff] rounded-xl px-4 py-3 text-xs text-gray-500 border border-[#ade8f4]">
        <strong className="text-[#023e8a]">How it works:</strong> Link a <em>Parent Account</em> so parents can see their child's
        attendance and performance in the Family Dashboard. Link a <em>Swimmer Login</em> so the child can sign in with their own
        account (role: Swimmer) and view their own stats. Both require the person to have signed up and been approved first.
      </div>
    </div>
  );
}
