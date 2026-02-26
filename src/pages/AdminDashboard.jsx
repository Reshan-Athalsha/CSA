import { useState, useEffect } from 'react';
import collections from '@/api/supabaseClient';
import { localCache } from '@/lib/cache';
import { Users, ClipboardCheck, Trophy, Bell, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import RoleGuard from '@/components/RoleGuard';

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-[#ade8f4] flex items-center gap-3 sm:gap-4">
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '22' }}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>
          {loading ? <div className="h-6 w-10 bg-gray-200 rounded animate-pulse" /> : value}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard allowedRoles={['Admin']}>
      <AdminDashboardContent />
    </RoleGuard>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState(null);
  const [recentNotices, setRecentNotices] = useState([]);
  const [upcomingMeets, setUpcomingMeets] = useState([]);
  const [recentTrials, setRecentTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const CACHE_KEY = 'admin_dashboard';

      // Show cached data instantly on low bandwidth
      const cached = localCache.get(CACHE_KEY, 2 * 60 * 1000); // 2-min TTL
      if (cached) {
        setStats(cached.stats);
        setUpcomingMeets(cached.upcomingMeets);
        setRecentNotices(cached.recentNotices);
        setRecentTrials(cached.recentTrials);
        setLoading(false);
        return; // skip network if fresh cache available
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        // BUG FIX: only fetch TODAY's attendance, not all records
        const [swimmers, todayAtt, meets, notices, trials] = await Promise.all([
          collections.swimmers.findAll(),
          collections.attendance.findAll({ date: today }),
          collections.meets.findAll({ status: 'Upcoming' }),
          collections.notices.findAll(),
          collections.trialrequests.findAll({ status: 'New' }),
        ]);

        const dashStats = {
          swimmers: swimmers.length,
          todayPresent: todayAtt.filter(a => a.status === 'Present').length,
          upcomingMeets: meets.length,
          newTrials: trials.length,
        };
        const upMeets = meets.slice(0, 5);
        const recNotices = notices.slice(0, 3);
        const recTrials = trials.slice(0, 5);

        setStats(dashStats);
        setUpcomingMeets(upMeets);
        setRecentNotices(recNotices);
        setRecentTrials(recTrials);

        // Cache it for next visit
        localCache.set(CACHE_KEY, { stats: dashStats, upcomingMeets: upMeets, recentNotices: recNotices, recentTrials: recTrials });
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        // Try stale cache as fallback
        const stale = localCache.getStale(CACHE_KEY);
        if (stale) {
          setStats(stale.stats);
          setUpcomingMeets(stale.upcomingMeets);
          setRecentNotices(stale.recentNotices);
          setRecentTrials(stale.recentTrials);
        }
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-header)' }}>Admin Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary-dark)' }}>Ceylon Swimming Academy — Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Swimmers" value={stats?.swimmers} color="#0096c7" loading={loading} />
        <StatCard icon={ClipboardCheck} label="Present Today" value={stats?.todayPresent} color="#00b4d8" loading={loading} />
        <StatCard icon={Trophy} label="Upcoming Meets" value={stats?.upcomingMeets} color="#023e8a" loading={loading} />
        <StatCard icon={Bell} label="New Trial Requests" value={stats?.newTrials} color="#48cae4" loading={loading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Upcoming Meets */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ade8f4]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ color: 'var(--color-text-header)' }}>Upcoming Meets</h2>
            <Link to={createPageUrl('Meets')} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}</div>
          ) : upcomingMeets.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No upcoming meets</p>
          ) : (
            <div className="space-y-2">
              {upcomingMeets.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#f0fbff]">
                  <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-header)' }}>{m.meet_name}</p>
                    <p className="text-[10px] text-gray-400">{m.date} • {m.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notices */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ade8f4]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ color: 'var(--color-text-header)' }}>Recent Notices</h2>
            <Link to={createPageUrl('Notices')} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}</div>
          ) : recentNotices.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No notices yet</p>
          ) : (
            <div className="space-y-2">
              {recentNotices.map(n => (
                <div key={n.id} className="p-3 rounded-xl bg-[#f0fbff]">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${n.priority === 'Urgent' ? 'bg-red-100 text-red-600' : n.priority === 'Important' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      {n.priority}
                    </span>
                  </div>
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-header)' }}>{n.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Trial Requests */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ade8f4]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ color: 'var(--color-text-header)' }}>New Trial Requests</h2>
            <Link to={createPageUrl('TrialRequests')} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}</div>
          ) : recentTrials.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No new trial requests</p>
          ) : (
            <div className="space-y-2">
              {recentTrials.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#f0fbff]">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-header)' }}>{t.child_name}</p>
                    <p className="text-[10px] text-gray-400">{t.parent_name} • {t.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Mark Attendance', page: 'PoolsideCheckIn', icon: ClipboardCheck, color: '#0096c7' },
          { label: 'Add Swimmer', page: 'Swimmers', icon: Users, color: '#00b4d8' },
          { label: 'Post Notice', page: 'Notices', icon: Bell, color: '#023e8a' },
          { label: 'Log Race Times', page: 'RaceTimes', icon: Trophy, color: '#48cae4' },
        ].map(({ label, page, icon: Icon, color }) => (
          <Link key={page} to={createPageUrl(page)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#ade8f4] shadow-sm active:scale-95 transition text-center min-h-[80px] justify-center">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-header)' }}>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}