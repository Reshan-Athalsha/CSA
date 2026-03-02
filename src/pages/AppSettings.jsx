import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

import { Users, Loader2, Shield, RefreshCw, Plus, Edit2, Trash2, X, KeyRound, CheckCircle, XCircle } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/lib/AuthContext';

const ROLES = ['Admin', 'AssistantCoach', 'Parent', 'Swimmer'];
const ROLE_LABELS = { Admin: 'Head Coach / Admin', AssistantCoach: 'Assistant Coach', Parent: 'Parent', Swimmer: 'Swimmer' };
const STATUSES = ['approved', 'pending', 'rejected'];

// ─── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({ onClose, onAdded, showMsg }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'Parent', status: 'approved' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Create the auth account via Supabase signUp
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name, role: form.role } }
      });
      if (signUpError) throw signUpError;

      const userId = data?.user?.id;
      if (!userId) throw new Error('User creation failed — no user ID returned.');

      // Upsert the profile with chosen role & status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          full_name: form.full_name,
          email: form.email,
          role: form.role,
          status: form.status,
          updated_at: new Date().toISOString(),
        });
      if (profileError) throw profileError;

      onAdded({ id: userId, full_name: form.full_name, email: form.email, role: form.role, status: form.status });
      showMsg({ type: 'success', text: `User "${form.full_name}" created successfully.` });
      onClose();
    } catch (err) {
      showMsg({ type: 'error', text: err.message || 'Failed to create user.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black" style={{ color: 'var(--color-text-header)' }}>Add New User</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Full Name *</label>
            <input required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
              value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Email *</label>
            <input required type="email" className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Password *</label>
            <input required type="password" minLength={8} className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
              placeholder="Minimum 8 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Role *</label>
              <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
                value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Status</label>
              <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
                value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: '#ade8f4', color: 'var(--color-text-main)' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ backgroundColor: '#0096c7' }}>
              {saving ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating…</span> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit User Modal ───────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSaved, showMsg }) {
  const [form, setForm] = useState({ full_name: user.full_name || '', email: user.email || '', role: user.role || 'Parent', status: user.status || 'pending' });
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: form.full_name, email: form.email, role: form.role, status: form.status, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      onSaved({ ...user, ...form });
      showMsg({ type: 'success', text: 'User updated successfully.' });
      onClose();
    } catch (err) {
      showMsg({ type: 'error', text: err.message || 'Failed to update user.' });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email);
      if (error) throw error;
      showMsg({ type: 'success', text: `Password reset email sent to ${form.email}.` });
    } catch (err) {
      showMsg({ type: 'error', text: err.message || 'Failed to send reset email.' });
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black" style={{ color: 'var(--color-text-header)' }}>Edit User</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Full Name *</label>
            <input required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
              value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Email *</label>
            <input required type="email" className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Role</label>
              <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
                value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Status</label>
              <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
                value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Password reset */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fcff] border border-[#ade8f4]">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-header)' }}>Password Reset</p>
              <p className="text-[10px] text-gray-400">Send a reset link to this user's email</p>
            </div>
            <button type="button" onClick={handlePasswordReset} disabled={resetting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-50"
              style={{ borderColor: '#ade8f4', color: 'var(--color-primary)' }}>
              {resetting ? <Loader2 className="h-3 w-3 animate-spin" /> : <KeyRound className="h-3 w-3" />}
              Send Reset
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: '#ade8f4', color: 'var(--color-text-main)' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ backgroundColor: '#0096c7' }}>
              {saving ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving…</span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ user, onClose, onDeleted, showMsg }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const { error } = await supabase.from('user_profiles').delete().eq('id', user.id);
      if (error) throw error;
      onDeleted(user.id);
      showMsg({ type: 'success', text: `"${user.full_name}" removed from the system.` });
      onClose();
    } catch (err) {
      showMsg({ type: 'error', text: err.message || 'Failed to delete user.' });
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-red-600">Remove User</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-600 mb-1">Are you sure you want to remove:</p>
        <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-text-header)' }}>{user.full_name}</p>
        <p className="text-xs text-gray-400 mb-4">{user.email}</p>
        <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
          This removes the user's profile and access. Their authentication account remains in Supabase but they won't be able to log in.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: '#ade8f4', color: 'var(--color-text-main)' }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold bg-red-500 hover:bg-red-600 disabled:opacity-60">
            {deleting ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Removing…</span> : 'Remove User'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AppSettings() {
  return (
    <RoleGuard allowedRoles={['Admin']}>
      <AppSettingsContent />
    </RoleGuard>
  );
}

function AppSettingsContent() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState(null);
  const [modal, setModal] = useState(null); // 'add' | { type:'edit', user } | { type:'delete', user }
  const [search, setSearch] = useState('');

  useEffect(() => { loadUsers(); }, []);

  function showMsg(msg) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 4000);
  }

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setUsers(data || []);
    setLoading(false);
  }

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-600',
    rejected: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Modals */}
      {modal === 'add' && (
        <AddUserModal
          onClose={() => setModal(null)}
          onAdded={u => setUsers(prev => [u, ...prev])}
          showMsg={showMsg}
        />
      )}
      {modal?.type === 'edit' && (
        <EditUserModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={updated => setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))}
          showMsg={showMsg}
        />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirmModal
          user={modal.user}
          onClose={() => setModal(null)}
          onDeleted={id => setUsers(prev => prev.filter(u => u.id !== id))}
          showMsg={showMsg}
        />
      )}

      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>Manage users and roles</p>
      </div>

      {statusMsg && (
        <div className={`flex items-center gap-2 text-xs font-medium px-4 py-3 rounded-xl ${statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {statusMsg.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <XCircle className="h-4 w-4 flex-shrink-0" />}
          {statusMsg.text}
        </div>
      )}

      {/* User List */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#ade8f4] shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--color-text-header)' }}>
            <Users className="h-4 w-4" style={{ color: 'var(--color-primary)' }} /> Users ({users.length})
          </h2>
          <div className="flex items-center gap-2">
            <input
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded-xl px-3 py-2 text-xs focus:outline-none w-32 sm:w-40 min-h-[40px]"
              style={{ borderColor: '#ade8f4' }}
            />
            <button onClick={loadUsers} className="h-10 w-10 flex items-center justify-center rounded-xl border active:bg-[#f0fbff] transition" style={{ borderColor: '#ade8f4' }}>
              <RefreshCw className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} />
            </button>
            <button onClick={() => setModal('add')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold shadow-sm min-h-[40px]"
              style={{ backgroundColor: '#0096c7' }}>
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">No users found</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => {
              const isCurrentUser = u.id === currentUser?.id;
              return (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fcff] border border-[#ade8f4]">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
                    {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-header)' }}>
                        {u.full_name || 'No name'}
                        {isCurrentUser && <span className="ml-1 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">You</span>}
                      </p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${statusColors[u.status] || 'bg-gray-100 text-gray-500'}`}>
                        {u.status || 'pending'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>{ROLE_LABELS[u.role] || u.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setModal({ type: 'edit', user: u })}
                      className="h-10 w-10 flex items-center justify-center rounded-lg border active:bg-blue-50 transition"
                      style={{ borderColor: '#ade8f4' }}
                      title="Edit user"
                    >
                      <Edit2 className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                    </button>
                    <button
                      onClick={() => setModal({ type: 'delete', user: u })}
                      disabled={isCurrentUser}
                      className="h-10 w-10 flex items-center justify-center rounded-lg border active:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ borderColor: '#ade8f4' }}
                      title={isCurrentUser ? "Can't delete yourself" : "Remove user"}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Role Guide */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#ade8f4] shadow-sm">
        <h2 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-header)' }}>
          <Shield className="h-4 w-4" style={{ color: 'var(--color-primary)' }} /> Role Permissions
        </h2>
        <div className="space-y-2 text-xs text-gray-600">
          {[
            { role: 'Admin', label: 'Head Coach / Admin', perms: 'Full access — manage all swimmers, attendance, meets, notices, trial requests, and users.' },
            { role: 'AssistantCoach', label: 'Assistant Coach', perms: 'Mark attendance, log race times, view swimmer profiles.' },
            { role: 'Parent', label: 'Parent', perms: "View linked child's attendance, race times, and academy notices." },
            { role: 'Swimmer', label: 'Swimmer', perms: 'View own stats, personal bests, and notices.' },
          ].map(({ role, label, perms }) => (
            <div key={role} className="flex flex-col sm:flex-row gap-1 sm:gap-3 p-3 rounded-xl bg-[#f8fcff]">
              <div className="font-bold sm:w-36 flex-shrink-0" style={{ color: 'var(--color-primary-dark)' }}>{label}</div>
              <div className="text-gray-500">{perms}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}