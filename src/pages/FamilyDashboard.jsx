import { useState, useEffect } from 'react';
import collections from '@/api/supabaseClient';
import { localCache } from '@/lib/cache';
import { Users, ClipboardCheck, Trophy, Bell, Loader2, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RoleGuard from '@/components/RoleGuard';

function formatTime(secs) {
  if (!secs) return '–';
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toFixed(2).padStart(5, '0');
  return m > 0 ? `${m}:${s}` : `${parseFloat(s).toFixed(2)}s`;
}

const STATUS_COLORS = { Present: '#0096c7', Absent: '#dc2626', Excused: '#d97706' };

// ── Progress Chart ────────────────────────────────────────────────────────────
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
      <div className="bg-white px-2 py-4" style={{ minHeight: 200 }}>
        {chartData.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No entries yet for this event</p>
        ) : chartData.length < 2 ? (
          <p className="text-xs text-gray-400 text-center py-6">Add more entries to see the progress trend</p>
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="famGrad" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#famGrad)" dot={(props) => <CustomDot {...props} />}
                activeDot={{ r: 6, fill: '#023e8a', stroke: 'white', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function AttendanceCalendar({ records }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const attMap = {};
  records.forEach(r => { attMap[r.date] = r.status; });

  const firstDay = new Date(year, month, 1).getDay();
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
        <h3 className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-header)' }}>
          <ClipboardCheck className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} /> Attendance
        </h3>
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
      <div className="grid grid-cols-7 mb-0.5">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-[8px] text-center text-gray-400 font-semibold">{d}</div>
        ))}
      </div>
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
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
        {[['P', '#0096c7'], ['A', '#dc2626'], ['E', '#d97706']].map(([s, c], i) => (
          <span key={s} className="flex items-center gap-1 text-[9px] text-gray-500">
            <span className="h-2 w-2 rounded-sm flex-shrink-0" style={{ backgroundColor: c }} />
            {['Present','Absent','Excused'][i]}
          </span>
        ))}
        <span className="ml-auto text-[9px] font-semibold" style={{ color: '#0096c7' }}>
          {presentCount}P · {absentCount}A
        </span>
      </div>
    </div>
  );
}

export default function FamilyDashboard() {
  return (
    <RoleGuard allowedRoles={['Parent']}>
      {(user) => <FamilyContent user={user} />}
    </RoleGuard>
  );
}

function FamilyContent({ user }) {
  const [swimmers, setSwimmers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [raceTimes, setRaceTimes] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const CACHE_KEY = `family_${user.id}`;

      // Show stale cache instantly — critical for poolside
      const cached = localCache.getStale(CACHE_KEY);
      if (cached) {
        setSwimmers(cached.swimmers);
        setAttendance(cached.attendance);
        setRaceTimes(cached.raceTimes);
        setNotices(cached.notices);
        setLoading(false);
        // Skip network if fresh enough (3-min TTL)
        if (localCache.get(CACHE_KEY, 3 * 60 * 1000)) return;
      }

      try {
        // Fetch only this parent's swimmers (scoped by parent_email)
        const mySwimmers = await collections.swimmers.findAll({ parent_email: user.email });
        const swimmerIds = mySwimmers.map(s => s.id);

        if (!swimmerIds.length) {
          const nts = await collections.notices.findAll();
          const payload = { swimmers: [], attendance: [], raceTimes: [], notices: nts.slice(0, 5) };
          setSwimmers([]);
          setNotices(payload.notices);
          localCache.set(CACHE_KEY, payload);
          setLoading(false);
          return;
        }

        // SECURITY: query each swimmer individually — never fetch all records then filter client-side
        const [attArrays, rtArrays, nts] = await Promise.all([
          Promise.all(swimmerIds.map(id => collections.attendance.findAll({ swimmer_id: id }))),
          Promise.all(swimmerIds.map(id => collections.racetimes.findAll({ swimmer_id: id }))),
          collections.notices.findAll(),
        ]);

        const att = attArrays.flat();
        const rt = rtArrays.flat();
        const notices = nts.slice(0, 5);

        setSwimmers(mySwimmers);
        setAttendance(att);
        setRaceTimes(rt);
        setNotices(notices);
        localCache.set(CACHE_KEY, { swimmers: mySwimmers, attendance: att, raceTimes: rt, notices });
      } catch {
        // Network failed — stale cache already applied above
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-48 bg-gray-200 rounded" />
      {[0, 1].map(i => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-[#ade8f4] space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded-full w-1/5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-28 bg-gray-100 rounded-2xl" />
            <div className="h-28 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      ))}
      <div className="h-40 bg-white rounded-2xl border border-[#ade8f4]" />
    </div>
  );

  if (swimmers.length === 0) return (
    <div className="text-center py-20">
      <Users className="h-12 w-12 mx-auto mb-3 text-gray-200" />
      <p className="text-gray-400 text-sm">No swimmers linked to your account yet.</p>
      <p className="text-gray-300 text-xs mt-1">Contact the academy to link your child.</p>
    </div>
  );

  // PB map
  const pbMap = {};
  raceTimes.forEach(rt => {
    const key = `${rt.swimmer_id}-${rt.event}`;
    if (!pbMap[key] || rt.time_seconds < pbMap[key]) pbMap[key] = { time: rt.time_seconds, event: rt.event, date: rt.date };
  });

  const last30days = [...Array(30)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>Family Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>Welcome, {user.full_name}</p>
      </div>

      {swimmers.map(swimmer => {
        const myAtt = attendance.filter(a => a.swimmer_id === swimmer.id);
        const presentCount = myAtt.filter(a => a.status === 'Present').length;
        const myTimes = raceTimes.filter(r => r.swimmer_id === swimmer.id);
        const myPBs = Object.values(pbMap).filter(pb =>
          raceTimes.find(rt => rt.swimmer_id === swimmer.id && rt.event === pb.event && rt.time_seconds === pb.time)
        );

        return (
          <div key={swimmer.id} className="space-y-4">
            {/* Swimmer header */}
            <div className="bg-white rounded-2xl p-5 border border-[#ade8f4] shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-full flex items-center justify-center font-black text-lg text-white" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
                {swimmer.first_name.charAt(0)}
              </div>
              <div>
                <h2 className="font-black text-lg" style={{ color: 'var(--color-text-header)' }}>{swimmer.first_name} {swimmer.last_name}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: { Beginner: '#48cae4', Intermediate: '#0096c7', Elite: '#023e8a' }[swimmer.squad] }}>
                  {swimmer.squad}
                </span>
              </div>
              <div className="ml-auto grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-black" style={{ color: '#0096c7' }}>{presentCount}</div>
                  <div className="text-[10px] text-gray-400">Sessions (30d)</div>
                </div>
                <div>
                  <div className="text-xl font-black" style={{ color: '#023e8a' }}>{myPBs.length}</div>
                  <div className="text-[10px] text-gray-400">PBs</div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Attendance */}
              <div className="bg-white rounded-2xl p-5 border border-[#ade8f4] shadow-sm">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-header)' }}>
                  <ClipboardCheck className="h-4 w-4" style={{ color: 'var(--color-primary)' }} /> Recent Attendance
                </h3>
                {myAtt.length === 0 ? (
                  <p className="text-xs text-gray-400">No attendance records yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {myAtt.slice(0, 8).map(a => (
                      <div key={a.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{a.date}</span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${a.status === 'Present' ? 'bg-blue-100 text-blue-700' : a.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PBs */}
              <div className="bg-white rounded-2xl p-5 border border-[#ade8f4] shadow-sm">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-header)' }}>
                  <Trophy className="h-4 w-4" style={{ color: '#023e8a' }} /> Personal Bests
                </h3>
                {myTimes.length === 0 ? (
                  <p className="text-xs text-gray-400">No race times logged yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(
                      myTimes.reduce((acc, rt) => {
                        if (!acc[rt.event] || rt.time_seconds < acc[rt.event].time_seconds) acc[rt.event] = rt;
                        return acc;
                      }, {})
                    ).slice(0, 6).map(([event, rt]) => (
                      <div key={event} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 truncate pr-2">{event}</span>
                        <span className="font-black flex-shrink-0 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                          <TrendingDown className="h-3 w-3 text-emerald-500" /> {formatTime(rt.time_seconds)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Chart */}
            {myTimes.length > 0 && <ProgressChart raceTimes={myTimes} />}

            {/* Full Attendance Calendar */}
            <AttendanceCalendar records={myAtt} />
          </div>
        );
      })}

      {/* Notices */}
      <div className="bg-white rounded-2xl p-5 border border-[#ade8f4] shadow-sm">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-header)' }}>
          <Bell className="h-4 w-4" style={{ color: '#00b4d8' }} /> Latest Notices
        </h3>
        {notices.length === 0 ? (
          <p className="text-xs text-gray-400">No notices</p>
        ) : (
          <div className="space-y-2">
            {notices.map(n => (
              <div key={n.id} className="p-3 rounded-xl bg-[#f0fbff]">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${n.priority === 'Urgent' ? 'bg-red-100 text-red-600' : n.priority === 'Important' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    {n.priority}
                  </span>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text-header)' }}>{n.title}</p>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}