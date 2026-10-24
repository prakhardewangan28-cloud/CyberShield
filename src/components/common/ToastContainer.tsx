import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: 'var(--sev-low)' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--sev-medium)' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: 'var(--sev-critical)' }} />;
      case 'info':
      default:
        return <Info size={18} style={{ color: 'var(--accent-cyan)' }} />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <div style={{ marginTop: '2px' }}>{renderIcon(toast.type)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
              {toast.title}
            </div>
            {toast.message && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {toast.message}
              </div>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="btn-icon"
            style={{ padding: '0.2rem', color: 'var(--text-muted)' }}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
