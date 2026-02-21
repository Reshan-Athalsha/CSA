import { useState, useEffect } from 'react';
import collections from '@/api/supabaseClient';
import { Search, Loader2, Phone, Mail, ChevronDown } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

const STATUS_CONFIG = {
  New: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Contacted: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Scheduled: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Completed: { bg: 'bg-green-100', text: 'text-green-700' },
  Declined: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function TrialRequests() {
  return (
    <RoleGuard allowedRoles={['Admin']}>
      <TrialRequestsContent />
    </RoleGuard>
  );
}

function TrialRequestsContent() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    collections.trialrequests.findAll().then(r => { 
      r.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRequests(r); 
      setLoading(false); 
    });
  }, []);

  async function updateStatus(id, status) {
    setUpdating(id);
    await collections.trialrequests.update(id, { status });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setUpdating(null);
  }

  const filtered = requests.filter(r =>
    (statusFilter === 'All' || r.status === statusFilter) &&
    (r.child_name?.toLowerCase().includes(search.toLowerCase()) ||
     r.parent_name?.toLowerCase().includes(search.toLowerCase()) ||
     r.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = Object.fromEntries(
    ['New', 'Contacted', 'Scheduled', 'Completed', 'Declined'].map(s => [s, requests.filter(r => r.status === s).length])
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>Trial Requests</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>{requests.length} total requests</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(counts).map(([status, count]) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <button key={status} onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
              className={`rounded-xl p-3 text-center border transition ${statusFilter === status ? 'border-[#0096c7] ring-2 ring-[#0096c7]/20' : 'border-[#ade8f4] bg-white hover:bg-[#f0fbff]'}`}>
              <div className={`text-lg font-black ${cfg.text}`}>{count}</div>
              <div className="text-[9px] text-gray-500 font-semibold mt-0.5">{status}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No trial requests found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.New;
            return (
              <div key={req.id} className="bg-white rounded-2xl p-5 border border-[#ade8f4] shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-base" style={{ color: 'var(--color-text-header)' }}>{req.child_name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>{req.status}</span>
                      {req.swimming_experience && req.swimming_experience !== 'None' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">{req.swimming_experience}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Age: {req.child_age || 'N/A'} · Parent: <strong>{req.parent_name}</strong></p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <a href={`mailto:${req.email}`} className="flex items-center gap-1 hover:text-blue-600 transition">
                        <Mail className="h-3 w-3" />{req.email}
                      </a>
                      <a href={`tel:${req.phone}`} className="flex items-center gap-1 hover:text-blue-600 transition">
                        <Phone className="h-3 w-3" />{req.phone}
                      </a>
                    </div>
                    {req.message && <p className="text-xs text-gray-400 mt-2 italic">"{req.message}"</p>}
                    <p className="text-[10px] text-gray-300 mt-2">{req.created_at ? new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <select value={req.status} onChange={e => updateStatus(req.id, e.target.value)}
                      disabled={updating === req.id}
                      className="border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none bg-white cursor-pointer disabled:opacity-50"
                      style={{ borderColor: '#ade8f4', color: 'var(--color-primary-dark)' }}>
                      {['New', 'Contacted', 'Scheduled', 'Completed', 'Declined'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}