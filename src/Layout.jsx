import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import useCurrentUser from '@/components/useCurrentUser';
import { useAuth } from '@/lib/AuthContext';
import { useState } from 'react';
import { Menu, X, Users, ClipboardCheck, Trophy, Bell, BarChart3, LogOut, Settings, Globe, Heart, Home } from 'lucide-react';

const ROLE_NAV = {
  Admin: [
    { label: 'Dashboard', page: 'AdminDashboard', icon: BarChart3 },
    { label: 'Swimmers', page: 'Swimmers', icon: Users },
    { label: 'Attendance', page: 'PoolsideCheckIn', icon: ClipboardCheck },
    { label: 'Family Pairing', page: 'ParentLinking', icon: Heart },
    { label: 'Meets', page: 'Meets', icon: Trophy },
    { label: 'Notices', page: 'Notices', icon: Bell },
    { label: 'Trial Requests', page: 'TrialRequests', icon: Globe },
    { label: 'Settings', page: 'AppSettings', icon: Settings },
  ],
  AssistantCoach: [
    { label: 'Attendance', page: 'PoolsideCheckIn', icon: ClipboardCheck },
    { label: 'Swimmers', page: 'Swimmers', icon: Users },
    { label: 'Race Times', page: 'RaceTimes', icon: Trophy },
    { label: 'Notices', page: 'Notices', icon: Bell },
  ],
  Parent: [
    { label: 'My Dashboard', page: 'FamilyDashboard', icon: Home },
    { label: 'Meets', page: 'Meets', icon: Trophy },
    { label: 'Notices', page: 'Notices', icon: Bell },
  ],
  Swimmer: [
    { label: 'My Stats', page: 'SwimmerStats', icon: BarChart3 },
    { label: 'Meets', page: 'Meets', icon: Trophy },
    { label: 'Notices', page: 'Notices', icon: Bell },
  ],
};

// Public pages that don't need the sidebar layout
const PUBLIC_PAGES = ['Landing', 'PublicLanding'];

export default function Layout({ children, currentPageName }) {
  const { user, loading, isAuthenticated, role, profile } = useCurrentUser();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublicPage = PUBLIC_PAGES.includes(currentPageName);

  // Public pages: render without chrome
  if (isPublicPage || (!loading && !isAuthenticated)) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>Loading…</span>
        </div>
      </div>
    );
  }

  const navItems = ROLE_NAV[role] || ROLE_NAV['Parent'] || [];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 transform transition-transform duration-200 ease-out will-change-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="px-5 py-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-accent-light)' }}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
                CSA
              </div>
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text-header)' }}>
                Ceylon Swimming
              </span>
            </div>
            <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" style={{ color: 'var(--color-text-header)' }} />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                    isActive ? 'text-white shadow-sm' : 'hover:bg-white/40'
                  }`}
                  style={isActive
                    ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                    : { color: 'var(--color-text-header)' }
                  }
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--color-accent-light)' }}>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-main)' }}>
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-[10px] capitalize" style={{ color: 'var(--color-primary-dark)' }}>
                  {role === 'Admin' ? 'Head Coach' : role?.replace(/([A-Z])/g, ' $1')?.trim()}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-white/40 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Logout"
              >
                <LogOut className="h-4 w-4" style={{ color: 'var(--color-text-header)' }} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-white/60 backdrop-blur-sm sticky top-0 z-20" style={{ borderColor: 'var(--color-accent-light)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-1 rounded-lg active:bg-black/5 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Menu className="h-5 w-5" style={{ color: 'var(--color-text-header)' }} />
          </button>
          <span className="font-bold text-sm" style={{ color: 'var(--color-text-header)' }}>
            {navItems.find(i => i.page === currentPageName)?.label || 'CSA'}
          </span>
          <div className="w-10" />
        </header>

        <div className="flex-1 p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}