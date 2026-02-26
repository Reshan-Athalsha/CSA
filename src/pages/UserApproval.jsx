import { useState, useEffect } from 'react';
import { auth } from '../api/authService';
import RoleGuard from '../components/RoleGuard';
import { CheckCircle2, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';

const ROLE_LABELS = { Admin: 'Head Coach', AssistantCoach: 'Asst. Coach', Parent: 'Parent', Swimmer: 'Swimmer' };

export default function UserApproval() {
  return (
    <RoleGuard allowedRoles={['Admin']}>
      <UserApprovalContent />
    </RoleGuard>
  );
}

function UserApprovalContent() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => { loadPendingUsers(); }, []);

  function showMsg(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  }

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      const users = await auth.getPendingUsers();
      setPendingUsers(users);
    } catch {
      showMsg({ type: 'error', text: 'Failed to load pending users' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(userId);
      await auth.approveUser(userId);
      showMsg({ type: 'success', text: 'User approved successfully' });
      await loadPendingUsers();
    } catch {
      showMsg({ type: 'error', text: 'Failed to approve user' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    try {
      setActionLoading(userId);
      await auth.rejectUser(userId);
      showMsg({ type: 'success', text: 'User rejected' });
      await loadPendingUsers();
    } catch {
      showMsg({ type: 'error', text: 'Failed to reject user' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>User Approval</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>
            {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting for approval
          </p>
        </div>
        <button onClick={loadPendingUsers}
          className="h-10 w-10 flex items-center justify-center rounded-xl border active:bg-[#f0fbff] transition"
          style={{ borderColor: '#ade8f4' }}>
          <RefreshCw className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 text-xs font-medium px-4 py-3 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <XCircle className="h-4 w-4 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-[#ade8f4] animate-pulse" />
          ))}
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-[#ade8f4] shadow-sm text-center">
          <Clock className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-400">No pending users</p>
          <p className="text-xs text-gray-300 mt-1">New sign-ups will appear here for approval</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingUsers.map(user => {
            const isActioning = actionLoading === user.id;
            return (
              <div key={user.id} className="bg-white rounded-2xl p-4 border border-[#ade8f4] shadow-sm">
                {/* User info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary-dark)' }}>
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--color-text-header)' }}>
                      {user.full_name || 'No name'}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-600 font-semibold flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-2.5 w-2.5" /> Pending
                  </span>
                </div>

                {/* Role + date row */}
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                  <span className="px-2 py-0.5 rounded bg-[#f0fbff] font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                  <span>{user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                </div>

                {/* Action buttons — full width on mobile */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={actionLoading !== null}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition active:scale-95 disabled:opacity-50 min-h-[48px]"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    {isActioning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={actionLoading !== null}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold bg-red-500 transition active:scale-95 disabled:opacity-50 min-h-[48px]"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
