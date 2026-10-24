import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  Terminal, 
  CheckCircle2, 
  Cpu, 
  Database 
} from 'lucide-react';
import { useApi } from '../../context/ApiContext';
import { mockWorkedExampleEvents } from '../../mock/mockData';

export const WorkedExampleModal: React.FC = () => {
  const { isWorkedExampleModalOpen, closeWorkedExampleModal } = useApi();
  const navigate = useNavigate();

  if (!isWorkedExampleModalOpen) return null;

  const handleInspectAlert = () => {
    closeWorkedExampleModal();
    navigate('/alerts?id=alt_001');
  };

  const handleInspectEvents = () => {
    closeWorkedExampleModal();
    navigate('/events?search=192.0.2.10');
  };

  return (
    <div className="modal-backdrop" onClick={closeWorkedExampleModal}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '780px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-sev-medium">College Mini-Project Worked Example</span>
              <span className="badge badge-demo">Simulated Scenario</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={22} style={{ color: 'var(--sev-medium)' }} />
              Repeated Failed Logins Detection (6 Attempts in 120s)
            </h2>
          </div>
          <button 
            onClick={closeWorkedExampleModal}
            className="btn-icon"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Rule Specification Banner */}
        <div 
          style={{
            backgroundColor: 'rgba(255, 176, 32, 0.08)',
            border: '1px solid rgba(255, 176, 32, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.86rem'
          }}
        >
          <strong style={{ color: 'var(--sev-medium)' }}>Detection Rule Specification:</strong>
          <span style={{ color: 'var(--text-main)', marginLeft: '0.4rem' }}>
            Alert when at least <strong>five (5) failed logins</strong> from one source occur within a <strong>120-second</strong> sliding window.
          </span>
        </div>

        {/* Input Events Sequence */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <Terminal size={15} style={{ color: 'var(--accent-cyan)' }} />
            Input Event Stream Recorded by Python Monitoring Worker:
          </div>

          <div 
            style={{ 
              backgroundColor: '#070b14', 
              border: 'var(--border-subtle)', 
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}
          >
            {mockWorkedExampleEvents.map((evt, idx) => (
              <div 
                key={evt.event_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.2rem 0',
                  borderBottom: idx < 5 ? '1px dashed rgba(148, 163, 184, 0.1)' : 'none'
                }}
              >
                <span style={{ color: 'var(--accent-cyan)' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {evt.timestamp.split(' ')[1]}
                </span>
                <span style={{ color: '#ff859b', fontWeight: 600 }}>login_failure</span>
                <span style={{ color: 'var(--text-main)' }}>source={evt.source}</span>
                <span style={{ color: 'var(--text-muted)' }}>target={String(evt.metadata?.username || 'user')}</span>
                <span 
                  className="badge badge-sev-info"
                  style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}
                >
                  Attempt #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Pipeline Explanation */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.75rem', 
            marginBottom: '1.25rem',
            fontSize: '0.78rem' 
          }}
        >
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.25rem' }}>
              <Cpu size={14} /> 1. Ingest & Queue
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              PyThread-AuthWatcher parses log lines and pushes to thread-safe <code>queue.Queue</code>.
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--sev-medium)', fontWeight: 600, marginBottom: '0.25rem' }}>
              <Clock size={14} /> 2. Sliding Window
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Engine groups attempts by <code>source=192.0.2.10</code>. 6 events &gt; 5 in 120s window.
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--sev-low)', fontWeight: 600, marginBottom: '0.25rem' }}>
              <Database size={14} /> 3. Alert Generated
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Creates <code>alt_001</code> (Medium), commits to DB, and broadcasts via REST API.
            </div>
          </div>
        </div>

        {/* Resulting Alert Box */}
        <div 
          style={{
            backgroundColor: 'rgba(21, 31, 50, 0.7)',
            border: '1px solid rgba(255, 176, 32, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                Resulting Alert: Repeated failed login attempts
              </span>
              <span className="badge badge-sev-medium">Medium Severity</span>
              <span className="badge badge-status-running">Status: Open</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
              alt_001
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div>Source: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>192.0.2.10</strong></div>
            <div>Observed Failures: <strong style={{ color: 'var(--sev-critical)' }}>6 attempts</strong></div>
            <div>Evaluation Window: <strong style={{ color: 'var(--text-main)' }}>120 seconds</strong></div>
            <div>Threshold Limit: <strong style={{ color: 'var(--text-main)' }}>5 attempts</strong></div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Reason: Configured threshold exceeded (Rule: <code>rule_auth_failed_logins_v1</code>)
          </div>
        </div>

        {/* Educational Disclaimer */}
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
          * <strong>192.0.2.10</strong> is a documentation-only example address (RFC 5737 Test-Net-1). In a live deployment, thresholds are tuned against real user authentication logs to prevent false alarms.
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button 
            onClick={handleInspectEvents}
            className="btn btn-secondary"
          >
            <span>View 6 Events in Explorer</span>
          </button>
          <button 
            onClick={handleInspectAlert}
            className="btn btn-primary"
          >
            <span>Investigate Alert alt_001</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
