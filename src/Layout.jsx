import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import useCurrentUser from '@/components/useCurrentUser';
import { useAuth } from '@/lib/AuthContext';
import { useState } from 'react';
import { Menu, X, Home, Users, ClipboardCheck, Trophy, Bell, BarChart3, LogOut, Settings, Globe, Heart } from 'lucide-react';

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
  const { user, loading, isAuthenticated, role } = useCurrentUser();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublicPage = PUBLIC_PAGES.includes(currentPageName);

  // Public pages: render without chrome
  if (isPublicPage || (!loading && !isAuthenticated)) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <style>{`
          :root {
            --color-bg-primary: #caf0f8;
            --color-bg-secondary: #ade8f4;
            --color-card: #90e0ef;
            --color-accent-light: #48cae4;
            --color-accent-main: #00b4d8;
            --color-primary: #0096c7;
            --color-primary-dark: #0077b6;
            --color-text-header: #023e8a;
            --color-text-main: #03045e;
          }
        `}</style>
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <style>{`
          :root {
            --color-bg-primary: #caf0f8;
            --color-bg-secondary: #ade8f4;
            --color-card: #90e0ef;
            --color-accent-light: #48cae4;
            --color-accent-main: #00b4d8;
            --color-primary: #0096c7;
            --color-primary-dark: #0077b6;
            --color-text-header: #023e8a;
            --color-text-main: #03045e;
          }
        `}</style>
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
      <style>{`
        :root {
          --color-bg-primary: #caf0f8;
          --color-bg-secondary: #ade8f4;
          --color-card: #90e0ef;
          --color-accent-light: #48cae4;
          --color-accent-main: #00b4d8;
          --color-primary: #0096c7;
          --color-primary-dark: #0077b6;
          --color-text-header: #023e8a;
          --color-text-main: #03045e;
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 transform transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:z-auto ${
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'text-white shadow-sm' : 'hover:bg-white/40'
                  }`}
                  style={isActive
                    ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                    : { color: 'var(--color-text-header)' }
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--color-accent-light)' }}>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-main)' }}>
                  {user?.full_name || 'User'}
                </p>
                <p className="text-[10px] capitalize" style={{ color: 'var(--color-primary-dark)' }}>
                  {role === 'Admin' ? 'Head Coach' : role?.replace(/([A-Z])/g, ' $1')?.trim()}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md hover:bg-white/40 transition"
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
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-white/60 backdrop-blur-sm" style={{ borderColor: 'var(--color-accent-light)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu className="h-5 w-5" style={{ color: 'var(--color-text-header)' }} />
          </button>
          <span className="font-semibold text-sm" style={{ color: 'var(--color-text-header)' }}>
            Ceylon Swimming Academy
          </span>
          <div className="w-6" />
        </header>

        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}