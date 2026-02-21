import { useState, useEffect } from 'react';
import collections from '@/api/supabaseClient';
import { localCache } from '@/lib/cache';
import { Trophy, ClipboardCheck, Bell, Loader2, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RoleGuard from '@/components/RoleGuard';

function formatTime(secs) {
  if (!secs) return '–';
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toFixed(2).padStart(5, '0');
  return m > 0 ? `${m}:${s}` : `${parseFloat(s).toFixed(2)}s`;
}

// ── Progress Chart ──────────────────────────────────────────────────────────
function ProgressChart({ raceTimes }) {
  const events = [...new Set(raceTimes.map(r => r.event))];
  const [selectedEvent, setSelectedEvent] = useState(events[0] || null);

  const chartData = selectedEvent
    ? raceTimes
        .filter(r => r.event === selectedEvent)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(r => ({ date: r.date.slice(5), time: r.time_seconds, pb: r.is_personal_best }))
    : [];

  const best = chartData.length ? Math.min(...chartData.map(d => d.time)) : null;
  const first = chartData[0]?.time;
  const last = chartData[chartData.length - 1]?.time;
  const improvement = first != null && last != null && chartData.length >= 2 ? first - last : null;

  const CustomDot = ({ cx, cy, payload }) => {
    if (!cx || !cy) return null;
    if (payload.pb) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="#16a34a" stroke="white" strokeWidth={2} />
          <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={9}>★</text>
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill="#0096c7" stroke="white" strokeWidth={2} />;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: 'white', border: '1px solid #ade8f4', borderRadius: 12, padding: '8px 12px', boxShadow: '0 4px 20px rgba(0,150,199,0.18)' }}>
        <p style={{ color: '#023e8a', fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#0096c7', fontWeight: 900, fontSize: 16 }}>{formatTime(d.time)}</p>
        {d.pb && <p style={{ color: '#16a34a', fontSize: 10, fontWeight: 700, marginTop: 2 }}>★ Personal Best</p>}
        {d.time === best && !d.pb && <p style={{ color: '#16a34a', fontSize: 10, fontWeight: 600, marginTop: 2 }}>⬡ Fastest</p>}
      </div>
    );
  };

  if (!events.length) return null;

  return (
    <div className="rounded-2xl border border-[#ade8f4] shadow-sm overflow-hidden">
      {/* Gradient header */}
      <div className="px-5 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #023e8a 0%, #0096c7 100%)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>Progress Chart</p>
            {improvement != null && (
              <p style={{ color: improvement > 0 ? '#90e0ef' : '#fca5a5', fontSize: 11, marginTop: 2 }}>
                {improvement > 0 ? `↓ Improved by ${formatTime(improvement)} overall` : `↑ ${formatTime(Math.abs(improvement))} slower overall`}
              </p>
            )}
          </div>
          {best != null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600 }}>Best Time</div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 20 }}>{formatTime(best)}</div>
            </div>
          )}
        </div>
        {/* Event pill tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {events.slice(0, 5).map(ev => (
            <button key={ev} onClick={() => setSelectedEvent(ev)}
              style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                backgroundColor: selectedEvent === ev ? 'white' : 'rgba(255,255,255,0.15)',
                color: selectedEvent === ev ? '#023e8a' : 'rgba(255,255,255,0.85)',
              }}>
              {ev}
            </button>
          ))}
          {events.length > 5 && (
            <select
              value={events.slice(5).includes(selectedEvent) ? selectedEvent : ''}
              onChange={e => e.target.value && setSelectedEvent(e.target.value)}
              style={{ fontSize: 10, borderRadius: 20, padding: '3px 8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>
              <option value="">More…</option>
              {events.slice(5).map(ev => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Chart area */}
      <div className="bg-white px-2 py-4" style={{ minHeight: 200 }}>
        {chartData.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No entries yet for this event</p>
        ) : chartData.length < 2 ? (
          <p className="text-xs text-gray-400 text-center py-6">Add more entries to see the progress trend</p>
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="swGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0096c7" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0096c7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f8ff" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                tickFormatter={v => `${v}s`} reversed domain={['auto', 'auto']} width={38} />
              <Tooltip content={CustomTooltip} />
              <Area type="monotone" dataKey="time" stroke="#0096c7" strokeWidth={2.5}
                fill="url(#swGrad)" dot={(props) => <CustomDot {...props} />}
                activeDot={{ r: 6, fill: '#023e8a', stroke: 'white', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ── Mini attendance calendar ──────────────────────────────────────────────
const STATUS_COLORS = {
  Present: '#0096c7',
  Absent: '#dc2626',
  Excused: '#d97706',
};

function AttendanceCalendar({ records }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-based

  const attMap = {};
  records.forEach(r => { attMap[r.date] = r.status; });

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function next() {
    const n = new Date(year, month + 1, 1);
    if (n <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      if (month === 11) { setYear(y => y + 1); setMonth(0); }
      else setMonth(m => m + 1);
    }
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const presentCount = records.filter(r => {
    const d = new Date(r.date + 'T00:00:00');
    return r.status === 'Present' && d.getMonth() === month && d.getFullYear() === year;
  }).length;

  const absentCount = records.filter(r => {
    const d = new Date(r.date + 'T00:00:00');
    return r.status === 'Absent' && d.getMonth() === month && d.getFullYear() === year;
  }).length;

  return (
    <div className="bg-white rounded-2xl p-3 border border-[#ade8f4] shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-header)' }}>
          <ClipboardCheck className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} /> Attendance
        </h2>
        <div className="flex items-center gap-0.5">
          <button onClick={prev} className="p-0.5 rounded hover:bg-gray-100">
            <ChevronLeft className="h-3 w-3 text-gray-400" />
          </button>
          <span className="text-[10px] font-semibold px-1" style={{ color: 'var(--color-text-header)' }}>{monthLabel}</span>
          <button onClick={next} className="p-0.5 rounded hover:bg-gray-100">
            <ChevronRight className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-0.5">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-[8px] text-center text-gray-400 font-semibold">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const status = attMap[iso];
          const isToday = iso === today.toISOString().split('T')[0];
          return (
            <div
              key={iso}
              title={status || 'No record'}
              className="h-5 flex items-center justify-center rounded text-[9px] font-semibold"
              style={{
                backgroundColor: status ? STATUS_COLORS[status] : isToday ? '#e0f7ff' : '#f9fafb',
                color: status ? 'white' : isToday ? '#0096c7' : '#c4c4c4',
                border: isToday && !status ? '1px solid #0096c7' : 'none',
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
        {[['Present', '#0096c7'], ['Absent', '#dc2626'], ['Excused', '#d97706']].map(([s, c]) => (
          <span key={s} className="flex items-center gap-1 text-[9px] text-gray-500">
            <span className="h-2 w-2 rounded-sm flex-shrink-0" style={{ backgroundColor: c }} />{s}
          </span>
        ))}
        <span className="ml-auto text-[9px] font-semibold" style={{ color: '#0096c7' }}>
          {presentCount}P · {absentCount}A
        </span>
      </div>
    </div>
  );
}

export default function SwimmerStats() {
  return (
    <RoleGuard allowedRoles={['Swimmer']}>
      {(user) => <StatsContent user={user} />}
    </RoleGuard>
  );
}

function StatsContent({ user }) {
  const [swimmer, setSwimmer] = useState(null);
  const [raceTimes, setRaceTimes] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const CACHE_KEY = `swimmer_stats_${user.id}`;

      // Show stale cache instantly — critical for poolside low bandwidth
      const cached = localCache.getStale(CACHE_KEY);
      if (cached) {
        setSwimmer(cached.swimmer);
        setRaceTimes(cached.raceTimes);
        setAttendance(cached.attendance);
        setNotices(cached.notices);
        setLoading(false);
        // Skip network if fresh enough (3-min TTL)
        if (localCache.get(CACHE_KEY, 3 * 60 * 1000)) return;
      }

      try {
        // SECURITY: query by swimmer_user_id first, never fetch all swimmers
        const [byUserId, nts] = await Promise.all([
          collections.swimmers.findAll({ swimmer_user_id: user.id }),
          collections.notices.findAll(),
        ]);
        let me = byUserId[0] || null;
        // Fall back: swimmer account linked by parent_email (legacy)
        if (!me) {
          const byEmail = await collections.swimmers.findAll({ parent_email: user.email });
          me = byEmail[0] || null;
        }
        let rt = [];
        let att = [];
        if (me) {
          [rt, att] = await Promise.all([
            collections.racetimes.findAll({ swimmer_id: me.id }),
            collections.attendance.findAll({ swimmer_id: me.id }),
          ]);
          setSwimmer(me);
          setRaceTimes(rt);
          setAttendance(att);
        }
        const notices = nts.slice(0, 5);
        setNotices(notices);
        localCache.set(CACHE_KEY, { swimmer: me, raceTimes: rt, attendance: att, notices });
      } catch {
        // Network failed — stale cache already applied above
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return (
    <div className="space-y-6 max-w-2xl mx-auto animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-[#ade8f4]" />)}
      </div>
      <div className="h-64 bg-white rounded-2xl border border-[#ade8f4]" />
      <div className="h-48 bg-white rounded-2xl border border-[#ade8f4]" />
    </div>
  );

  const presentCount = attendance.filter(a => a.status === 'Present').length;

  // PBs per event
  const pbMap = raceTimes.reduce((acc, rt) => {
    if (!acc[rt.event] || rt.time_seconds < acc[rt.event]) acc[rt.event] = rt.time_seconds;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full flex items-center justify-center font-black text-xl text-white" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
          {swimmer?.first_name?.charAt(0) || user.full_name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>{swimmer ? `${swimmer.first_name} ${swimmer.last_name}` : user.full_name}</h1>
          {swimmer && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: { Beginner: '#48cae4', Intermediate: '#0096c7', Elite: '#023e8a' }[swimmer.squad] }}>
              {swimmer.squad}
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sessions (30d)', value: presentCount, color: '#0096c7' },
          { label: 'Races Logged', value: raceTimes.length, color: '#00b4d8' },
          { label: 'Events w/ PB', value: Object.keys(pbMap).length, color: '#023e8a' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-[#ade8f4] shadow-sm text-center">
            <div className="text-2xl font-black" style={{ color }}>{value}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      {raceTimes.length > 0 && <ProgressChart raceTimes={raceTimes} />}

      {/* PB Table */}
      <div className="bg-white rounded-2xl p-5 border border-[#ade8f4] shadow-sm">
        <h2 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-header)' }}>
          <Trophy className="h-4 w-4" style={{ color: '#023e8a' }} /> Personal Bests
        </h2>
        {Object.keys(pbMap).length === 0 ? (
          <p className="text-xs text-gray-400">No race times recorded yet</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(pbMap).map(([event, time]) => (
              <div key={event} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{event}</span>
                <span className="font-black flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-500" /> {formatTime(time)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Calendar */}
      {swimmer && <AttendanceCalendar records={attendance} />}

      {/* Notices */}
      <div className="bg-white rounded-2xl p-5 border border-[#ade8f4] shadow-sm">
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-header)' }}>
          <Bell className="h-4 w-4" style={{ color: '#00b4d8' }} /> Latest Notices
        </h2>
        {notices.length === 0 ? (
          <p className="text-xs text-gray-400">No notices</p>
        ) : (
          <div className="space-y-2">
            {notices.map(n => (
              <div key={n.id} className="p-3 rounded-xl bg-[#f0fbff]">
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text-header)' }}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}