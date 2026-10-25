import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Server, 
  User, 
  Sliders, 
  Bell, 
  Palette, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Lock 
} from 'lucide-react';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { defaultDetectionConfig } from '../mock/mockData';
import { EducationalCard } from '../components/common/EducationalCard';

export const SettingsPage: React.FC = () => {
  const { 
    backendUrl, 
    setBackendUrl, 
    checkConnection, 
    isConnected, 
    isDemoMode, 
    toggleDemoMode 
  } = useApi();
  const { user, switchRole } = useAuth();
  const { addToast } = useToast();

  const [inputUrl, setInputUrl] = useState<string>(backendUrl);
  const [testingPing, setTestingPing] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Appearance preferences
  const [accentColor, setAccentColor] = useState<string>('cyan');
  const [enableSound, setEnableSound] = useState<boolean>(false);

  // Detection thresholds
  const [thresholds, setThresholds] = useState(defaultDetectionConfig);

  const handleTestConnection = async () => {
    setTestingPing(true);
    setPingResult(null);
    try {
      setBackendUrl(inputUrl);
      const ok = await checkConnection();
      if (ok) {
        setPingResult({ ok: true, message: `Connected to Python backend at ${inputUrl}. Health endpoint responded 200 OK.` });
        addToast('success', 'Backend Reachable', 'FastAPI/Flask health check passed.');
      } else {
        setPingResult({ 
          ok: false, 
          message: `Cannot connect to ${inputUrl}. Ensure your Python backend server is running (e.g. python receiver.py on port 5000).` 
        });
        addToast('warning', 'Backend Offline', 'Could not reach server. Demo mode remains available for presentation.');
      }
    } catch {
      setPingResult({ ok: false, message: 'Connection attempt timed out.' });
    } finally {
      setTestingPing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div 
        style={{
          backgroundColor: 'rgba(21, 31, 50, 0.65)',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--accent-cyan)' }}>
            <SettingsIcon size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
              System Configuration & Preferences
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Manage Python backend connection parameters, operator profile, and presentation simulation flags.
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Section 1: Backend API Connection */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Server size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Python Backend API Connection</h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Configure the REST API endpoint used by Axios service layers to fetch events, alerts, and worker health.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Backend REST Base URL
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-field"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="http://127.0.0.1:5000"
                />
                <button
                  onClick={handleTestConnection}
                  disabled={testingPing}
                  className="btn btn-primary"
                  style={{ flexShrink: 0 }}
                >
                  {testingPing ? <RefreshCw size={14} className="radar-spinner" /> : <RefreshCw size={14} />}
                  <span>Test Ping</span>
                </button>
              </div>
            </div>

            {pingResult && (
              <div
                style={{
                  backgroundColor: pingResult.ok ? 'rgba(56, 217, 150, 0.1)' : 'rgba(255, 59, 92, 0.1)',
                  border: pingResult.ok ? '1px solid rgba(56, 217, 150, 0.3)' : '1px solid rgba(255, 59, 92, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  fontSize: '0.78rem',
                  color: pingResult.ok ? '#5cf0b4' : '#ff859b',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}
              >
                {pingResult.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{pingResult.message}</span>
              </div>
            )}

            <div style={{ borderTop: 'var(--border-subtle)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Demo Presentation Mode
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  When enabled, feeds the consistent 6-logins dataset regardless of backend status.
                </div>
              </div>
              <button
                onClick={toggleDemoMode}
                className={`btn btn-sm ${isDemoMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                {isDemoMode ? 'Demo Mode Active' : 'Live API Active'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Operator User Profile */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <User size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Operator Profile & RBAC Role</h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Role-based access control. Permissions are enforced by the Python backend.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Username:</span>
                <div style={{ fontWeight: 600, color: '#fff', marginTop: '0.2rem' }}>{user?.username}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Role:</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <span className="badge badge-sev-info">{user?.role}</span>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{user?.email}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Session Type:</span>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>In-Memory Token</div>
              </div>
            </div>

            <div style={{ borderTop: 'var(--border-subtle)', paddingTop: '0.75rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>
                Simulate Role Change (for presentation demonstration):
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['admin', 'analyst', 'viewer'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      addToast('info', 'Role Switched', `Now operating as ${r.toUpperCase()}`);
                    }}
                    className={`btn btn-sm ${user?.role === r ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, textTransform: 'capitalize' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Detection Engine Thresholds */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Sliders size={18} style={{ color: 'var(--sev-medium)' }} />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Detection Engine Rule Thresholds</h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Current backend correlation rule parameters. (Enforced server-side in Python).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'rgba(7, 11, 20, 0.4)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Failed Login Threshold</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Min failures before triggering alert</div>
              </div>
              <span className="badge badge-sev-medium">5 attempts</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'rgba(7, 11, 20, 0.4)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Sliding Time Window</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Evaluation window for attempts</div>
              </div>
              <span className="badge badge-sev-info">120 seconds</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'rgba(7, 11, 20, 0.4)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>FIM Polling Interval</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Disk SHA-256 hash recalculation cycle</div>
              </div>
              <span className="badge badge-sev-low">15 seconds</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'rgba(7, 11, 20, 0.4)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Network Burst Anomaly</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Threshold for rapid SYN connection bursts</div>
              </div>
              <span className="badge badge-demo">50 conns / 10s</span>
            </div>
          </div>
        </div>

        {/* Section 4: Appearance & Alerts */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Palette size={18} style={{ color: 'var(--accent-violet)' }} />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>SOC Appearance & Theme</h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Customize Security Operations Centre visual indicators and telemetry styles.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>
                Primary Accent Color:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setAccentColor('cyan')}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#00E5FF22',
                    border: '1px solid #00E5FF',
                    color: '#00E5FF',
                    flex: 1
                  }}
                >
                  Electric Cyan
                </button>
                <button
                  onClick={() => setAccentColor('violet')}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#8B5CF622',
                    border: '1px solid #8B5CF6',
                    color: '#c4b5fd',
                    flex: 1
                  }}
                >
                  Neon Violet
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 'var(--border-subtle)', paddingTop: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Audio Alerts on High Severity</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Play subtle chime when critical alerts trigger</div>
              </div>
              <input
                type="checkbox"
                checked={enableSound}
                onChange={(e) => {
                  setEnableSound(e.target.checked);
                  addToast('info', 'Sound Settings Updated', `Sound ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Educational Card */}
      <EducationalCard
        title="Frontend vs Backend Security Responsibilities"
        concept="Client-Side Boundaries"
        description="A golden rule in cybersecurity development: never trust the client. While the React dashboard provides convenient controls (filters, threshold displays, test pingers), actual detection rules, database mutations, and authentication validation are strictly enforced in Python. Secrets and long-lived private keys are never stored in browser localStorage."
        keyTakeaway="Reiterate during presentation that disabling a button or filtering in React does not constitute backend security."
      />
    </div>
  );
};
