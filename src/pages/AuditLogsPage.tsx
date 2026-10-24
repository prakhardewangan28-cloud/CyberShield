import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  User, 
  ShieldCheck, 
  Clock, 
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { auditApi, AuditFilterParams } from '../api/audit.api';
import { AuditLog } from '../types';
import { useApi } from '../context/ApiContext';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { EducationalCard } from '../components/common/EducationalCard';

export const AuditLogsPage: React.FC = () => {
  const { isDemoMode, refreshTrigger } = useApi();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params: AuditFilterParams = {
      search: searchQuery || undefined,
      action: filterAction !== 'all' ? filterAction : undefined,
      page,
      pageSize
    };

    auditApi.getAuditLogs(params, isDemoMode)
      .then((res) => {
        if (isMounted) {
          setLogs(res.items);
          setTotal(res.total);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load audit logs:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, refreshTrigger, searchQuery, filterAction, page, pageSize]);

  const getActionBadge = (action: string) => {
    if (action.includes('RESOLVED')) {
      return <span className="badge badge-sev-low">Resolved</span>;
    }
    if (action.includes('ACKNOWLEDGED')) {
      return <span className="badge badge-sev-medium">Acknowledged</span>;
    }
    if (action.includes('LOGIN')) {
      return <span className="badge badge-sev-info">Login</span>;
    }
    if (action.includes('WATCHLIST')) {
      return <span className="badge badge-demo">Watchlist</span>;
    }
    return <span className="badge badge-status-running">{action}</span>;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Info */}
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
            <History size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
              System & Security Operator Audit Trail
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Read-only immutable log of operator actions, alert updates, and configuration modifications.
            </div>
          </div>
        </div>

        <span className="badge badge-demo">
          Read-Only Compliance Trail
        </span>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div className="search-box">
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search action, user, resource..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="select-field"
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Action Types</option>
            <option value="ALERT_ACKNOWLEDGED">ALERT_ACKNOWLEDGED</option>
            <option value="ALERT_RESOLVED">ALERT_RESOLVED</option>
            <option value="ALERT_GENERATED">ALERT_GENERATED</option>
            <option value="WATCHLIST_ENTRY_UPDATED">WATCHLIST_ENTRY_UPDATED</option>
            <option value="WATCHLIST_ENTRY_ADDED">WATCHLIST_ENTRY_ADDED</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <History size={36} style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontWeight: 600, color: '#fff' }}>No Audit Records Found</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / User</th>
                  <th>Action</th>
                  <th>Target Resource</th>
                  <th>Result</th>
                  <th>Client IP</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {log.timestamp}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{log.actor}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.role}</div>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>
                      <code style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                        {log.target_resource}
                      </code>
                    </td>
                    <td>
                      {log.result === 'success' ? (
                        <span style={{ color: 'var(--sev-low)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                          <CheckCircle2 size={13} /> Success
                        </span>
                      ) : (
                        <span style={{ color: 'var(--sev-critical)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                          <XCircle size={13} /> Failure
                        </span>
                      )}
                    </td>
                    <td>
                      <code style={{ fontSize: '0.78rem' }}>{log.client_ip}</code>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Educational Card */}
      <EducationalCard
        title="Audit Logging & Non-Repudiation"
        concept="Security Governance"
        description="Whenever an operator acknowledges an alert, resolves an incident, or edits a watchlist IP, an audit log record is committed. Notice that passwords, sessions keys, and tokens are strictly excluded from audit payloads to avoid credential leakage while ensuring complete operator accountability."
        keyTakeaway="Audit logs provide forensic integrity: you can always trace which operator resolved an alert and when."
      />
    </div>
  );
};
