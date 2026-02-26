import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';
import collections from '@/api/supabaseClient';
import { formatTime } from '@/utils';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { CheckCircle, XCircle, Clock, Search, Loader2, FileDown, Plus, Star, TrendingDown, X, WifiOff, RefreshCw } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';
import { localCache } from '@/lib/cache';
import { offlineQueue } from '@/lib/offlineQueue';

const EVENTS = [
  '50m Freestyle', '100m Freestyle', '200m Freestyle', '400m Freestyle',
  '50m Backstroke', '100m Backstroke', '200m Backstroke',
  '50m Breaststroke', '100m Breaststroke', '200m Breaststroke',
  '50m Butterfly', '100m Butterfly', '200m Butterfly',
  '200m Individual Medley', '400m Individual Medley',
];

const STATUS_CONFIG = {
  Present: { color: '#0096c7', bg: '#f0fbff', icon: CheckCircle },
  Absent: { color: '#dc2626', bg: '#fef2f2', icon: XCircle },
  Excused: { color: '#d97706', bg: '#fffbeb', icon: Clock },
};

export default function PoolsideCheckIn() {
  return (
    <RoleGuard allowedRoles={['Admin', 'AssistantCoach']}>
      {(user) => <CheckInContent user={user} />}
    </RoleGuard>
  );
}

function CheckInContent({ user }) {
  const today = new Date().toISOString().split('T')[0];
  const [tab, setTab] = useState('attendance'); // 'attendance' | 'times'
  const [date, setDate] = useState(today);
  const [squad, setSquad] = useState('All');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [swimmers, setSwimmers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ── Session Times state ────
  const [sessionTimes, setSessionTimes] = useState([]); // racetimes logged on `date`
  const [timesLoading, setTimesLoading] = useState(false);
  const [logForm, setLogForm] = useState(null); // { swimmerId, swimmerName } or null
  const [logData, setLogData] = useState({ event: EVENTS[0], time_seconds: '', is_personal_best: false, notes: '' });
  const [logSaving, setLogSaving] = useState(false);
  const [pbSaving, setPbSaving] = useState({});

  useEffect(() => {
    loadData();
  }, [date, squad]);

  // ── Online/offline + queue tracking ────
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Track pending queue count for the UI badge
    const updateCount = () => offlineQueue.count().then(setPendingCount);
    updateCount(); // initial
    const unsub = offlineQueue.subscribe(updateCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
    };
  }, []);

  // ── Supabase Realtime — live attendance sync between coaches ────
  useEffect(() => {
    const channel = supabase
      .channel('attendance-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance', filter: `date=eq.${date}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const record = payload.new;
            setAttendance(prev => {
              // Only update if we don't have a temp/optimistic record for this swimmer
              const existing = Object.values(prev).find(a => a.swimmer_id === record.swimmer_id);
              if (existing?.id?.startsWith?.('temp-')) return prev; // don't overwrite our pending optimistic write
              return { ...prev, [record.swimmer_id]: record };
            });
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old;
            setAttendance(prev => {
              const next = { ...prev };
              // Find and remove the deleted record
              for (const [key, val] of Object.entries(next)) {
                if (val.id === old.id) { delete next[key]; break; }
              }
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [date]);

  // Reload session times whenever date changes or tab switches to 'times'
  useEffect(() => {
    if (tab === 'times') loadSessionTimes();
  }, [tab, date]);

  async function loadSessionTimes() {
    setTimesLoading(true);
    const { data, error } = await supabase
      .from('racetimes')
      .select('*, swimmers(first_name, last_name)')
      .eq('date', date)
      .is('meet_id', null)
      .order('created_at', { ascending: false });
    if (!error) setSessionTimes(data || []);
    setTimesLoading(false);
  }

  async function handleLogTime(e) {
    e.preventDefault();
    if (!logForm || !logData.time_seconds) return;
    setLogSaving(true);
    const { data, error } = await supabase
      .from('racetimes')
      .insert({
        swimmer_id: logForm.swimmerId,
        meet_id: null,
        event: logData.event,
        time_seconds: parseFloat(logData.time_seconds),
        date,
        is_personal_best: logData.is_personal_best,
        notes: logData.notes,
      })
      .select('*, swimmers(first_name, last_name)')
      .single();
    if (!error && data) setSessionTimes(prev => [data, ...prev]);
    setLogSaving(false);
    setLogForm(null);
    setLogData({ event: EVENTS[0], time_seconds: '', is_personal_best: false, notes: '' });
  }

  async function togglePB(rt) {
    const newVal = !rt.is_personal_best;
    // Optimistic update — instant feedback
    setSessionTimes(prev => prev.map(r => r.id === rt.id ? { ...r, is_personal_best: newVal } : r));
    setPbSaving(s => ({ ...s, [rt.id]: true }));
    const { error } = await supabase
      .from('racetimes')
      .update({ is_personal_best: newVal })
      .eq('id', rt.id);
    if (error) {
      // Revert on failure
      setSessionTimes(prev => prev.map(r => r.id === rt.id ? { ...r, is_personal_best: rt.is_personal_best } : r));
    }
    setPbSaving(s => ({ ...s, [rt.id]: false }));
  }

  async function deleteTime(id) {
    await supabase.from('racetimes').delete().eq('id', id);
    setSessionTimes(prev => prev.filter(r => r.id !== id));
  }

  async function loadData() {
    const cacheKey = `checkin_swimmers_${squad}`;

    // Offline-first: show cached swimmers immediately while fetching fresh data
    const cached = localCache.getStale(cacheKey);
    if (cached) {
      setSwimmers(cached);
      setLoading(false); // show stale data instantly, refresh silently
    } else {
      setLoading(true);
    }

    try {
      const filter = squad !== 'All' ? { squad } : {};
      const [swimmerList, attList] = await Promise.all([
        collections.swimmers.findAll(filter),
        collections.attendance.findAll({ date }),
      ]);
      swimmerList.sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      );
      localCache.set(cacheKey, swimmerList); // persist for offline use
      setSwimmers(swimmerList);
      const attMap = {};
      attList.forEach(a => { attMap[a.swimmer_id] = a; });
      setAttendance(attMap);
    } catch (err) {
      console.warn('[CSA] Network unavailable, using cached swimmer list:', err);
      // stale data already displayed — do nothing
    }
    setLoading(false);
  }

  async function setStatus(swimmer, status) {
    const existing = attendance[swimmer.id];
    
    // Haptic feedback for poolside tapping (short pulse)
    try { navigator.vibrate?.(30); } catch {}
    
    // OPTIMISTIC UI: Update UI immediately before API call
    const optimisticRecord = existing
      ? { ...existing, status }
      : { id: `temp-${swimmer.id}`, swimmer_id: swimmer.id, date, status };
    
    // Update UI instantly — no waiting for network
    setAttendance(a => ({ ...a, [swimmer.id]: optimisticRecord }));
    // Don't show spinner — the tap itself gives visual feedback via color change
    
    // Sync to server in background
    try {
      let serverRecord;
      if (existing && !existing.id?.startsWith('temp-')) {
        serverRecord = await collections.attendance.update(existing.id, { status });
      } else {
        serverRecord = await collections.attendance.create({
          swimmer_id: swimmer.id,
          date,
          status,
        });
      }
      // Update with server response to ensure sync
      setAttendance(a => ({ ...a, [swimmer.id]: serverRecord }));
    } catch (error) {
      // OFFLINE QUEUE: instead of reverting, queue the operation for later sync
      console.warn('[CSA] Network error, queuing attendance for sync:', error.message || error);
      try {
        await offlineQueue.enqueue({
          table: 'attendance',
          op: existing && !existing.id?.startsWith('temp-') ? 'update' : 'create',
          data: {
            swimmer_id: swimmer.id,
            date,
            status,
            existingId: existing?.id?.startsWith('temp-') ? null : existing?.id,
          },
        });
      } catch (queueErr) {
        console.error('[CSA] Failed to queue offline operation:', queueErr);
        // Last resort: revert the optimistic UI
        if (existing) {
          setAttendance(a => ({ ...a, [swimmer.id]: existing }));
        } else {
          setAttendance(a => {
            const newState = { ...a };
            delete newState[swimmer.id];
            return newState;
          });
        }
      }
    }
  }

  // Manual sync retry
  const handleManualSync = useCallback(async () => {
    const result = await offlineQueue.flush(supabase);
    if (result.synced > 0) {
      // Reload fresh data from server after sync
      loadData();
    }
  }, [date, squad]);

  const filtered = swimmers.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const counts = useMemo(() => {
    const vals = Object.values(attendance);
    const matched = Object.keys(attendance).filter(id => swimmers.find(s => s.id === id)).length;
    return {
      Present: vals.filter(a => a.status === 'Present').length,
      Absent: vals.filter(a => a.status === 'Absent').length,
      Excused: vals.filter(a => a.status === 'Excused').length,
      Unmarked: swimmers.length - matched,
    };
  }, [attendance, swimmers]);

  const markedCount = useMemo(
    () => Object.keys(attendance).filter(id => swimmers.find(s => s.id === id)).length,
    [attendance, swimmers]
  );

  // Swimmers present on the selected date (for Session Times tab)
  const presentSwimmers = swimmers.filter(s => attendance[s.id]?.status === 'Present');

  function printAttendancePDF() {
    const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const rows = swimmers.map(s => {
      const att = attendance[s.id];
      const status = att?.status || 'Unmarked';
      const color = status === 'Present' ? '#0096c7' : status === 'Absent' ? '#dc2626' : status === 'Excused' ? '#d97706' : '#9ca3af';
      return `
        <tr>
          <td>${s.first_name} ${s.last_name}</td>
          <td>${s.squad || '—'}</td>
          <td style="color:${color};font-weight:600">${status}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Attendance – ${dateLabel}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
    h1 { font-size: 20px; margin-bottom: 4px; color: #023e8a; }
    p.sub { font-size: 13px; color: #555; margin-bottom: 20px; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; }
    .chip { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #023e8a; color: white; text-align: left; padding: 8px 12px; }
    td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f8fafc; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Ceylon Swimming Academy — Attendance</h1>
  <p class="sub">${dateLabel}${squad !== 'All' ? ' &nbsp;·&nbsp; ' + squad + ' Squad' : ''}</p>
  <div class="summary">
    <span class="chip" style="background:#e0f7ff;color:#0096c7">Present: ${counts.Present}</span>
    <span class="chip" style="background:#fef2f2;color:#dc2626">Absent: ${counts.Absent}</span>
    <span class="chip" style="background:#fffbeb;color:#d97706">Excused: ${counts.Excused}</span>
    <span class="chip" style="background:#f3f4f6;color:#6b7280">Unmarked: ${counts.Unmarked}</span>
  </div>
  <table>
    <thead><tr><th>Swimmer</th><th>Squad</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>Poolside Check-In</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>Mark attendance and log session times</p>
      </div>

      {/* Offline / pending sync indicator */}
      {(!isOnline || pendingCount > 0) && (
        <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold ${
          !isOnline ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          <div className="flex items-center gap-2">
            {!isOnline && <WifiOff className="h-3.5 w-3.5" />}
            {!isOnline
              ? `Offline mode — ${pendingCount} change${pendingCount !== 1 ? 's' : ''} queued`
              : `${pendingCount} change${pendingCount !== 1 ? 's' : ''} waiting to sync`
            }
          </div>
          {isOnline && pendingCount > 0 && (
            <button onClick={handleManualSync} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 active:bg-blue-200 transition">
              <RefreshCw className="h-3 w-3" /> Sync now
            </button>
          )}
        </div>
      )}

      {/* Date / squad / search controls — shared between tabs */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white min-h-[44px]" style={{ borderColor: '#ade8f4' }} />
        <select value={squad} onChange={e => setSquad(e.target.value)}
          className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white min-h-[44px]" style={{ borderColor: '#ade8f4' }}>
          <option value="All">All Squads</option>
          {['Beginner', 'Intermediate', 'Elite'].map(s => <option key={s}>{s}</option>)}
        </select>
        {tab === 'attendance' && (
          <div className="col-span-2 sm:flex-1 sm:min-w-[160px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input placeholder="Search swimmer…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none bg-white min-h-[44px]" style={{ borderColor: '#ade8f4' }} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f0fbff] p-1 rounded-xl border border-[#ade8f4]">
        {[['attendance', 'Attendance'], ['times', 'Session Times']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition min-h-[44px]"
            style={{
              backgroundColor: tab === key ? 'var(--color-primary)' : 'transparent',
              color: tab === key ? 'white' : 'var(--color-primary-dark)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── ATTENDANCE TAB ─────────────────────────────────────────────── */}
      {tab === 'attendance' && (<>
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(counts).map(([k, v]) => (
            <div key={k} className="rounded-xl p-3 text-center bg-white border border-[#ade8f4]">
              <div className="text-2xl sm:text-xl font-black" style={{ color: k === 'Present' ? '#0096c7' : k === 'Absent' ? '#dc2626' : k === 'Excused' ? '#d97706' : '#9ca3af' }}>{v}</div>
              <div className="text-xs sm:text-[10px] text-gray-500 font-medium">{k}</div>
            </div>
          ))}
        </div>

        {/* Swimmer list */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl px-4 py-3 border border-[#ade8f4] flex items-center gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/5" />
                </div>
                <div className="flex gap-1.5">{[0, 1, 2].map(j => <div key={j} className="h-8 w-8 rounded-xl bg-gray-100" />)}</div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No swimmers found</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(swimmer => {
              const att = attendance[swimmer.id];
              const currentStatus = att?.status || null;
              return (
                <div key={swimmer.id} className="bg-white rounded-2xl px-3 sm:px-4 py-3 shadow-sm border border-[#ade8f4] flex items-center gap-2 sm:gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
                    {`${swimmer.first_name} ${swimmer.last_name}`.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-header)' }}>{swimmer.first_name} {swimmer.last_name}</p>
                    <p className="text-[10px] text-gray-400">{swimmer.squad}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {['Present', 'Absent', 'Excused'].map(status => {
                      const cfg = STATUS_CONFIG[status];
                      const Icon = cfg.icon;
                      const active = currentStatus === status;
                      return (
                        <button key={status} onClick={() => setStatus(swimmer, status)}
                          title={status}
                          className="h-11 w-11 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center transition active:scale-95"
                          style={{ backgroundColor: active ? cfg.color : '#f3f4f6', color: active ? 'white' : '#9ca3af' }}>
                          <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Download PDF */}
        {!loading && markedCount > 0 && (
          <div className="flex justify-end pt-2 pb-4">
            <button onClick={printAttendancePDF}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition active:scale-95 min-h-[48px] w-full sm:w-auto justify-center"
              style={{ backgroundColor: 'var(--color-primary-dark)' }}>
              <FileDown className="h-4 w-4" /> Download Attendance PDF
            </button>
          </div>
        )}
      </>)}

      {/* ── SESSION TIMES TAB ──────────────────────────────────────────── */}
      {tab === 'times' && (<>
        {/* Log time modal / inline form */}
        {logForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-base" style={{ color: 'var(--color-text-header)' }}>Log Practice Time</h3>
                  <p className="text-xs text-gray-400">{logForm.swimmerName}</p>
                </div>
                <button onClick={() => setLogForm(null)}><X className="h-5 w-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleLogTime} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Event *</label>
                  <select required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" style={{ borderColor: '#ade8f4' }}
                    value={logData.event} onChange={e => setLogData(d => ({ ...d, event: e.target.value }))}>
                    {EVENTS.map(ev => <option key={ev}>{ev}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Time (seconds) *</label>
                  <input required type="number" min="0" step="0.01" placeholder="e.g. 28.54"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                    value={logData.time_seconds} onChange={e => setLogData(d => ({ ...d, time_seconds: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Notes</label>
                  <input className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ borderColor: '#ade8f4' }}
                    placeholder="Optional"
                    value={logData.notes} onChange={e => setLogData(d => ({ ...d, notes: e.target.value }))} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="rounded"
                    checked={logData.is_personal_best}
                    onChange={e => setLogData(d => ({ ...d, is_personal_best: e.target.checked }))} />
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5" /> Mark as Personal Best
                  </span>
                </label>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setLogForm(null)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: '#ade8f4', color: 'var(--color-text-main)' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={logSaving}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ backgroundColor: '#0096c7' }}>
                    {logSaving ? 'Saving…' : 'Log Time'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Present swimmers — click + to log a time */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Present swimmers on {date}</p>
          {presentSwimmers.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs">
              No swimmers marked Present yet. Mark attendance first.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {presentSwimmers.map(s => (
                <button key={s.id}
                  onClick={() => {
                    setLogForm({ swimmerId: s.id, swimmerName: `${s.first_name} ${s.last_name}` });
                    setLogData({ event: EVENTS[0], time_seconds: '', is_personal_best: false, notes: '' });
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition active:scale-95 active:bg-[#e0f7ff] min-h-[44px]"
                  style={{ borderColor: '#ade8f4', color: 'var(--color-text-header)' }}>
                  <Plus className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                  {s.first_name} {s.last_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Session times logged for this date */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Times logged for {date}</p>
          {timesLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
          ) : sessionTimes.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs">No times logged for this session yet.</div>
          ) : (
            <>
              {/* Mobile card layout */}
              <div className="space-y-2 sm:hidden">
                {sessionTimes.map(rt => (
                  <div key={rt.id} className="bg-white rounded-2xl p-3 border border-[#ade8f4] shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm" style={{ color: 'var(--color-text-header)' }}>
                        {rt.swimmers ? `${rt.swimmers.first_name} ${rt.swimmers.last_name}` : '–'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePB(rt)}
                          disabled={!!pbSaving[rt.id]}
                          className="h-9 w-9 flex items-center justify-center rounded-lg transition"
                          style={{
                            backgroundColor: rt.is_personal_best ? '#16a34a' : '#f3f4f6',
                            color: rt.is_personal_best ? 'white' : '#9ca3af',
                          }}
                        >
                          {pbSaving[rt.id]
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Star className="h-4 w-4" fill={rt.is_personal_best ? 'currentColor' : 'none'} />
                          }
                        </button>
                        <button onClick={() => deleteTime(rt.id)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 text-red-400 active:bg-red-100">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{rt.event}</span>
                      <span className="font-black text-sm" style={{ color: 'var(--color-primary)' }}>{formatTime(rt.time_seconds)}</span>
                    </div>
                    {rt.notes && <p className="text-[10px] text-gray-400 mt-1 truncate">{rt.notes}</p>}
                  </div>
                ))}
              </div>
              {/* Desktop table layout */}
              <div className="hidden sm:block bg-white rounded-2xl border border-[#ade8f4] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#f0f0f0] bg-[#f8fcff]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Swimmer</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Event</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Time</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">PB</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Notes</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {sessionTimes.map(rt => (
                        <tr key={rt.id} className="border-b border-[#f0f0f0] hover:bg-[#f8fcff]">
                          <td className="px-4 py-3 font-semibold text-xs" style={{ color: 'var(--color-text-header)' }}>
                            {rt.swimmers ? `${rt.swimmers.first_name} ${rt.swimmers.last_name}` : '–'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{rt.event}</td>
                          <td className="px-4 py-3 font-black text-xs" style={{ color: 'var(--color-primary)' }}>
                            {formatTime(rt.time_seconds)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => togglePB(rt)}
                              disabled={!!pbSaving[rt.id]}
                              title={rt.is_personal_best ? 'Unmark PB' : 'Mark as Personal Best'}
                              className="h-6 w-6 flex items-center justify-center rounded-lg transition disabled:opacity-40"
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
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 max-w-[120px] truncate">{rt.notes || '–'}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => deleteTime(rt.id)} className="text-red-400 hover:text-red-600 transition">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </>)}
    </div>
  );
}