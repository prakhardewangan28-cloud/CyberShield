import React from 'react';
import { PlayCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { useApi } from '../../context/ApiContext';

export const WorkedBanner: React.FC = () => {
  const { openWorkedExampleModal } = useApi();

  return (
    <div className="worked-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div 
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(255, 176, 32, 0.15)',
            border: '1px solid rgba(255, 176, 32, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--sev-medium)'
          }}
        >
          <ShieldAlert size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Worked College Demo: 6 Repeated Failed Logins in 120 Seconds</span>
            <span className="badge badge-sev-medium" style={{ fontSize: '0.65rem' }}>Rule Example</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Simulated host <code>192.0.2.10</code> exceeded threshold of 5 attempts within 120s sliding window &rarr; generated alert <code>alt_001</code>.
          </div>
        </div>
      </div>

      <button
        onClick={openWorkedExampleModal}
        className="btn btn-outline-cyan btn-sm"
        style={{ flexShrink: 0 }}
      >
        <PlayCircle size={15} />
        <span>Demonstrate Scenario</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
};
