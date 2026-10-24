import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  ListFilter, 
  FileCheck2, 
  Cpu, 
  FileSpreadsheet, 
  History, 
  Settings, 
  LogOut, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../context/ApiContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { user, logout } = useAuth();
  const { isDemoMode, isConnected } = useApi();

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Network Monitoring', path: '/network', icon: Activity },
    { name: 'Security Events', path: '/events', icon: ShieldAlert },
    { name: 'Threat Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'IP Watchlist', path: '/watchlist', icon: ListFilter },
    { name: 'File Integrity', path: '/files', icon: FileCheck2 },
    { name: 'Monitoring Workers', path: '/workers', icon: Cpu },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Audit Logs', path: '/audit', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="drawer-backdrop md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        style={{
          width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
          minWidth: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: 'var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100vh',
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          zIndex: 50,
          position: 'sticky',
          top: 0
        }}
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand / Logo Section */}
        <div>
          <div
            style={{
              padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              borderBottom: 'var(--border-subtle)',
              height: 'var(--topbar-height)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(139, 92, 246, 0.2))',
                  border: 'var(--border-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)'
                }}
              >
                <Shield size={20} />
              </div>

              {!collapsed && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-heading)', 
                        fontWeight: 700, 
                        fontSize: '1.05rem', 
                        letterSpacing: '0.02em',
                        color: '#fff'
                      }}
                    >
                      CYBER<span style={{ color: 'var(--accent-cyan)' }}>SHIELD</span>
                    </span>
                    <span 
                      className={`badge ${isDemoMode ? 'badge-demo' : isConnected ? 'badge-sev-low' : 'badge-sev-critical'}`}
                      style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}
                    >
                      {isDemoMode ? 'DEMO' : isConnected ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    SOC Network Monitor
                  </div>
                </div>
              )}
            </div>

            {/* Collapse button on desktop */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="btn-icon"
              style={{ display: collapsed ? 'none' : 'flex' }}
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: collapsed ? '0.7rem' : '0.65rem 0.85rem',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 'var(--radius-sm)',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                    textDecoration: 'none',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all var(--transition-fast)'
                  })}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon size={18} style={{ minWidth: '18px' }} />
                  {!collapsed && <span style={{ fontSize: '0.86rem' }}>{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile and Expand Button */}
        <div style={{ padding: '0.75rem 0.5rem', borderTop: 'var(--border-subtle)' }}>
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="btn-icon"
              style={{ width: '100%', marginBottom: '0.5rem' }}
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <ChevronRight size={16} />
            </button>
          )}

          {user && !collapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.6rem',
                backgroundColor: 'rgba(21, 31, 50, 0.6)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-violet-dim)',
                    border: '1px solid var(--accent-violet)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c4b5fd'
                  }}
                >
                  <UserCheck size={16} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span 
                      className={`badge ${user.role === 'admin' ? 'badge-sev-critical' : user.role === 'analyst' ? 'badge-sev-medium' : 'badge-sev-info'}`}
                      style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem' }}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="btn-icon"
                title="Log Out"
                aria-label="Log out"
                style={{ color: 'var(--sev-critical)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {user && collapsed && (
            <button
              onClick={() => logout()}
              className="btn-icon"
              style={{ width: '100%', color: 'var(--sev-critical)' }}
              title={`Logged in as ${user.name} (${user.role}). Click to log out.`}
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
