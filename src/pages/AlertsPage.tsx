import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Search, 
  Eye, 
  UserCheck, 
  FileText, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  AlertOctagon, 
  Info,
  Check,
  RotateCcw
} from 'lucide-react';
import { alertsApi, AlertFilterParams } from '../api/alerts.api';
import { auditApi } from '../api/audit.api';
import { AlertItem, AlertStatus, Severity } from '../types';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { EducationalCard } from '../components/common/EducationalCard';

export const AlertsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDemoMode, refreshTrigger, triggerRefresh } = useApi();
  const { user, isAdmin, isAnalyst } = useAuth();
  const { addToast } = useToast();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Confirmation Modals State
  const [confirmActionModal, setConfirmActionModal] = useState<{
    type: 'acknowledge' | 'resolve';
    alert: AlertItem;
  } | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const params: AlertFilterParams = {
        search: searchQuery || undefined,
        severity: filterSeverity !== 'all' ? (filterSeverity as Severity) : undefined,
        status: filterStatus !== 'all' ? (filterStatus as AlertStatus) : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
      };

      const res = await alertsApi.getAlerts(params, isDemoMode);
      setAlerts(res.items);

      // Auto-open alert if query param ?id= exists
      const targetId = searchParams.get('id');
      if (targetId) {
        const found = res.items.find(a => a.alert_id === targetId);
        if (found) {
          setSelectedAlert(found);
        }
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [isDemoMode, refreshTrigger, searchQuery, filterSeverity, filterStatus, filterCategory, searchParams]);

  const handleAcknowledge = async (alert: AlertItem) => {
    try {
      const updated = await alertsApi.acknowledgeAlert(alert.alert_id, user?.username || 'analyst', isDemoMode);
      auditApi.logAction({
        actor: user?.username || 'analyst',
        role: user?.role || 'SOC Analyst',
        action: 'ALERT_ACKNOWLEDGED',
        target_resource: `${alert.alert_id} (${alert.title})`,
        result: 'success',
        client_ip: '127.0.0.1',
        details: `Operator changed alert status to ACKNOWLEDGED`
      });

      addToast('success', 'Alert Acknowledged', `${alert.alert_id} status updated to ACKNOWLEDGED.`);
      setConfirmActionModal(null);
      setSelectedAlert(updated);
      triggerRefresh();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      addToast('error', 'Update Failed', errorObj.message || 'Could not acknowledge alert.');
    }
  };

  const handleResolve = async (alert: AlertItem) => {
    if (!resolutionNotes.trim()) {
      addToast('warning', 'Notes Required', 'Please provide investigation resolution notes.');
      return;
    }

    try {
      const updated = await alertsApi.resolveAlert(
        alert.alert_id, 
        user?.username || 'admin', 
        resolutionNotes.trim(), 
        isDemoMode
      );

      auditApi.logAction({
        actor: user?.username || 'admin',
        role: user?.role || 'Administrator',
        action: 'ALERT_RESOLVED',
        target_resource: `${alert.alert_id} (${alert.title})`,
        result: 'success',
        client_ip: '127.0.0.1',
        details: `Resolved: ${resolutionNotes.trim()}`
      });

      addToast('success', 'Alert Resolved', `${alert.alert_id} marked as RESOLVED.`);
      setConfirmActionModal(null);
      setResolutionNotes('');
      setSelectedAlert(updated);
      triggerRefresh();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      addToast('error', 'Resolution Failed', errorObj.message || 'Could not resolve alert.');
    }
  };

  const getSeverityBadgeClass = (sev: Severity) => {
    switch (sev) {
      case 'critical': return 'badge-sev-critical';
      case 'high': return 'badge-sev-high';
      case 'medium': return 'badge-sev-medium';
      case 'low': return 'badge-sev-low';
      default: return 'badge-sev-info';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Informative Header Banner */}
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
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
              Threat Alert Management & Investigation
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Alerts indicate activity requiring investigation; they do not automatically prove that an attack succeeded.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              alertsApi.resetDemoState();
              triggerRefresh();
              addToast('info', 'Reset Completed', 'Alert statuses reset to demo baseline.');
            }}
            className="btn btn-secondary btn-sm"
            title="Reset alerts back to initial open state"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Alerts</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div className="search-box">
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search alert title, rule, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-field"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="select-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open (Unresolved)</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            className="select-field"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Authentication">Authentication</option>
            <option value="Network Reconnaissance">Network Reconnaissance</option>
            <option value="File Integrity">File Integrity</option>
            <option value="Privilege Escalation">Privilege Escalation</option>
            <option value="Network Activity">Network Activity</option>
          </select>
        </div>
      </div>

      {/* Alert List Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} style={{ margin: '0 auto 0.75rem auto', color: 'var(--sev-low)' }} />
            <div style={{ fontWeight: 600, color: '#fff' }}>No Threat Alerts Found</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>All clear or no alerts match current filter criteria.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Alert ID & Title</th>
                  <th>Severity</th>
                  <th>Source Indicator</th>
                  <th>Detection Rule</th>
                  <th>Detected At</th>
                  <th>Evidence Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.alert_id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{alert.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {alert.alert_id} &bull; {alert.event_category}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getSeverityBadgeClass(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', color: alert.source_ip?.includes('192.0.2.10') ? 'var(--sev-medium)' : 'var(--text-main)' }}>
                        {alert.source_ip || 'Internal'}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {alert.detection_rule}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {alert.time_detected}
                    </td>
                    <td>
                      <span className="badge badge-sev-info">
                        {alert.related_event_ids.length} event(s)
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`badge ${alert.status === 'open' ? 'badge-sev-critical' : alert.status === 'acknowledged' ? 'badge-sev-medium' : 'badge-sev-low'}`}
                      >
                        {alert.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.6rem' }}
                      >
                        <Eye size={13} />
                        <span>Investigate</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Alert Investigation Drawer */}
      {selectedAlert && (
        <>
          <div className="drawer-backdrop" onClick={() => setSelectedAlert(null)} />
          <div className="drawer-panel" style={{ maxWidth: '640px' }}>
            {/* Drawer Header */}
            <div 
              style={{ 
                padding: '1.25rem 1.5rem', 
                borderBottom: 'var(--border-subtle)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span className="badge badge-sev-info">{selectedAlert.alert_id}</span>
                  <span className={`badge ${getSeverityBadgeClass(selectedAlert.severity)}`}>
                    {selectedAlert.severity} Severity
                  </span>
                  <span 
                    className={`badge ${selectedAlert.status === 'open' ? 'badge-sev-critical' : selectedAlert.status === 'acknowledged' ? 'badge-sev-medium' : 'badge-sev-low'}`}
                  >
                    {selectedAlert.status.toUpperCase()}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{selectedAlert.title}</h3>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="btn-icon" aria-label="Close details">
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Detection Reason */}
              <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.7)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Detection Engine Trigger Reason
                </div>
                <div style={{ fontSize: '0.86rem', color: '#fff', lineHeight: 1.5 }}>
                  {selectedAlert.detection_reason}
                </div>
              </div>

              {/* Source & Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Source Metadata</label>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                    {selectedAlert.source_ip || 'Internal'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detection Timestamp</label>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {selectedAlert.time_detected}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detection Rule</label>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {selectedAlert.detection_rule}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event Category</label>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {selectedAlert.event_category}
                  </div>
                </div>
              </div>

              {/* Worked Example Callout if alt_001 */}
              {selectedAlert.alert_id === 'alt_001' && (
                <div style={{ backgroundColor: 'rgba(255, 176, 32, 0.1)', border: '1px solid rgba(255, 176, 32, 0.35)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--sev-medium)', fontSize: '0.84rem', marginBottom: '0.25rem' }}>
                    Worked Demonstration Scenario
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>
                    Triggered by 6 failed logins from RFC 5737 test address <code>192.0.2.10</code> within a 120-second window, exceeding the configured limit of 5.
                  </div>
                </div>
              )}

              {/* Related Events Evidence */}
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  Associated Event Evidence ({selectedAlert.related_event_ids.length} records)
                </label>
                <div style={{ backgroundColor: '#070b14', border: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {selectedAlert.related_event_ids.map(id => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>{id}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Status: Flagged by Rule</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Investigation Steps */}
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  Suggested SOC Analyst Investigation Steps
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedAlert.suggested_investigation_steps.map((step, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.5rem', 
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'rgba(21, 31, 50, 0.4)',
                        padding: '0.45rem 0.65rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History / Audit Trail */}
              {selectedAlert.acknowledged_by && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Acknowledged by <strong>{selectedAlert.acknowledged_by}</strong> at {selectedAlert.acknowledged_at}
                </div>
              )}
              {selectedAlert.resolved_by && (
                <div style={{ backgroundColor: 'rgba(56, 217, 150, 0.1)', border: '1px solid rgba(56, 217, 150, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ color: 'var(--sev-low)', fontWeight: 600 }}>Resolved by {selectedAlert.resolved_by} ({selectedAlert.resolved_at})</div>
                  <div style={{ color: 'var(--text-main)', marginTop: '0.2rem' }}>Notes: {selectedAlert.resolution_notes}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: 'var(--border-subtle)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                {selectedAlert.status === 'open' && (
                  <button
                    onClick={() => setConfirmActionModal({ type: 'acknowledge', alert: selectedAlert })}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    <Check size={15} />
                    <span>Acknowledge Alert</span>
                  </button>
                )}

                {selectedAlert.status !== 'resolved' && (
                  <button
                    onClick={() => setConfirmActionModal({ type: 'resolve', alert: selectedAlert })}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Resolve Alert</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Dialogs for Status Changes */}
      {confirmActionModal && (
        <div className="modal-backdrop" onClick={() => setConfirmActionModal(null)}>
          <div 
            className="modal-content"
            style={{ maxWidth: '480px', padding: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
              Confirm Alert Status Change
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {confirmActionModal.type === 'acknowledge'
                ? `Change status of ${confirmActionModal.alert.alert_id} to ACKNOWLEDGED? This records your operator ID into the audit log.`
                : `Resolve alert ${confirmActionModal.alert.alert_id}? Provide closure notes explaining root cause or remediation.`}
            </p>

            {confirmActionModal.type === 'resolve' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Resolution Notes (Required):
                </label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  placeholder="e.g. Verified with sysadmin: legitimate testing or blocked IP at firewall."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setConfirmActionModal(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmActionModal.type === 'acknowledge') {
                    handleAcknowledge(confirmActionModal.alert);
                  } else {
                    handleResolve(confirmActionModal.alert);
                  }
                }}
                className="btn btn-primary"
              >
                Confirm {confirmActionModal.type === 'acknowledge' ? 'Acknowledgement' : 'Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Educational Card */}
      <EducationalCard
        title="Detection Engine & Alert Correlation"
        concept="Stateful Sliding Time Windows"
        description="A stateless rule only looks at single isolated events. The CyberShield Detection Engine maintains stateful evaluation windows (e.g. 120 seconds). When failed login events arrive, the engine groups them by source IP. If the count exceeds threshold = 5, an Alert entity is generated and committed to the database, leaving individual events intact for forensic traceability."
        keyTakeaway="An alert is a prioritized notification to investigate, not instant proof of a compromise. In real SOCs, false-positive tuning is critical."
      />
    </div>
  );
};
