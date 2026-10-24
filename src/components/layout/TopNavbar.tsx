import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  RotateCw, 
  Search, 
  Bell, 
  Zap, 
  PlayCircle,
  HelpCircle
} from 'lucide-react';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface TopNavbarProps {
  onMobileMenuToggle: () => void;
}

const routeTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/': { title: 'Overview Dashboard', breadcrumb: 'Dashboard / Real-Time Overview' },
  '/network': { title: 'Network Activity & Topology', breadcrumb: 'Monitoring / Network Traffic' },
  '/events': { title: 'Security Event Explorer', breadcrumb: 'Analysis / Event Logs' },
  '/alerts': { title: 'Threat Alert Investigation', breadcrumb: 'Incidents / Alert Management' },
  '/watchlist': { title: 'IP Watchlist Management', breadcrumb: 'Intelligence / Watchlist' },
  '/files': { title: 'File Integrity Monitoring (FIM)', breadcrumb: 'Host Security / FIM Checks' },
  '/workers': { title: 'Multithreaded Monitoring Workers', breadcrumb: 'Architecture / Python Threads' },
  '/reports': { title: 'Security Reports & Analytics', breadcrumb: 'Reporting / Aggregates' },
  '/audit': { title: 'System & Security Audit Logs', breadcrumb: 'Governance / Audit Trail' },
  '/settings': { title: 'System Configuration', breadcrumb: 'Administration / Settings' },
};

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    isDemoMode, 
    isConnected, 
    toggleDemoMode, 
    triggerRefresh, 
    lastSyncTime,
    openWorkedExampleModal 
  } = useApi();
  const { user, switchRole } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const routeInfo = routeTitles[location.pathname] || {
    title: 'CyberShield SOC',
    breadcrumb: 'System / View'
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'rgba(10, 16, 32, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: 'var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
      className="top-navbar"
    >
      {/* Left: Mobile Toggle & Page Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMobileMenuToggle}
          className="btn-icon md:hidden"
          title="Open Menu"
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {routeInfo.breadcrumb}
          </div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
            {routeInfo.title}
          </h1>
        </div>
      </div>

      {/* Center: Search Box */}
      <form onSubmit={handleSearchSubmit} style={{ maxWidth: '300px', width: '100%', display: 'none' }} className="lg:block">
        <div className="search-box">
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search events, IPs, rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Right: Status Indicators & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Worked Example Showcase Button (Requirement 18) */}
        <button
          onClick={openWorkedExampleModal}
          className="btn btn-outline-cyan btn-sm"
          title="Click to view worked demonstration of 6 failed logins from 192.0.2.10"
        >
          <PlayCircle size={15} />
          <span>Worked Example (6 Logins)</span>
        </button>

        {/* Backend Connection Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card)',
            border: 'var(--border-subtle)',
            fontSize: '0.75rem'
          }}
          title={
            isConnected 
              ? 'Python REST Backend is online and responding' 
              : isDemoMode 
                ? 'Backend offline: Demo Mode active for safe presentation' 
                : 'Backend offline: Operating in simulation fallback mode'
          }
        >
          <span 
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? 'var(--sev-low)' : isDemoMode ? 'var(--accent-violet)' : 'var(--sev-medium)'
            }}
            className={isConnected ? 'pulse-indicator-green' : isDemoMode ? 'pulse-indicator-cyan' : 'pulse-indicator-amber'}
          />
          <span style={{ color: isConnected ? 'var(--sev-low)' : isDemoMode ? '#c4b5fd' : 'var(--sev-medium)', fontWeight: 500 }}>
            {isConnected ? 'API: Connected' : isDemoMode ? 'API: Demo Simulation' : 'API: Simulation Fallback'}
          </span>
        </div>

        {/* Demo Mode Toggle Switch */}
        <div
          onClick={toggleDemoMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isDemoMode ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-card)',
            border: isDemoMode ? '1px solid rgba(139, 92, 246, 0.4)' : 'var(--border-subtle)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: isDemoMode ? '#c4b5fd' : 'var(--text-secondary)'
          }}
          title="Toggle between Demo Mode (consistent mock dataset) and Live Backend API"
        >
          <Zap size={14} style={{ color: isDemoMode ? '#a78bfa' : 'var(--text-muted)' }} />
          <span>Demo Mode: <strong>{isDemoMode ? 'ON' : 'OFF'}</strong></span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={triggerRefresh}
          className="btn-icon"
          title={`Last synced: ${lastSyncTime}. Click to refresh.`}
          aria-label="Refresh data"
        >
          <RotateCw size={16} />
        </button>

        {/* Notifications Icon */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--sev-critical)'
              }}
            />
          </button>

          {showNotifications && (
            <div
              className="glass-panel-elevated"
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '320px',
                padding: '1rem',
                zIndex: 60
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid rgba(148,163,184,0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Live Alert Notifications</span>
                <span className="badge badge-sev-critical">3 Open</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,59,92,0.1)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: '#ff859b', fontWeight: 600 }}>Repeated failed login attempts</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Source: 192.0.2.10 (6 failures)</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,92,56,0.1)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: '#ffaa85', fontWeight: 600 }}>Watchlist IP Match</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Source: 203.0.113.45</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,59,92,0.1)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: '#ff859b', fontWeight: 600 }}>Sudoers File Created</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>/etc/sudoers.d/99-wheel</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Menu for Presentation */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="btn btn-secondary btn-sm"
            title="Switch user role for testing"
          >
            <span>Role: <strong>{user?.role.toUpperCase()}</strong></span>
          </button>

          {showRoleMenu && (
            <div
              className="glass-panel-elevated"
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '180px',
                padding: '0.5rem',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0.2rem 0.5rem' }}>
                Simulate Role Access:
              </div>
              {(['admin', 'analyst', 'viewer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '0.4rem 0.6rem',
                    background: user?.role === r ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: user?.role === r ? 'var(--accent-cyan)' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ textTransform: 'capitalize' }}>{r}</span>
                  {user?.role === r && <span style={{ fontSize: '0.65rem' }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
