import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  UserX, 
  Cpu, 
  Server, 
  Clock, 
  ExternalLink, 
  Activity, 
  CheckCircle2, 
  AlertOctagon, 
  XCircle,
  Eye,
  Filter,
  ArrowRight,
  Database,
  Zap,
  RotateCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { useApi } from '../context/ApiContext';
import { dashboardApi, getTrendForTimeRange } from '../api/dashboard.api';
import { alertsApi } from '../api/alerts.api';
import { workersApi } from '../api/workers.api';
import { eventsApi } from '../api/events.api';
import { AlertItem, DashboardSummary, EventItem, WorkerItem } from '../types';
import { mockDashboardSummary, mockAlerts, mockWorkers, mockGeneralEvents } from '../mock/mockData';
import { WorkedBanner } from '../components/common/WorkedBanner';
import { EducationalCard } from '../components/common/EducationalCard';
import { Skeleton } from '../components/common/SkeletonLoader';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isDemoMode, 
    isConnected, 
    toggleDemoMode, 
    checkConnection, 
    refreshTrigger, 
    openWorkedExampleModal 
  } = useApi();

  const [summary, setSummary] = useState<DashboardSummary>(() => mockDashboardSummary);
  const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>(() => mockAlerts.slice(0, 5));
  const [workers, setWorkers] = useState<WorkerItem[]>(() => mockWorkers);
  const [recentEvents, setRecentEvents] = useState<EventItem[]>(() => mockGeneralEvents.slice(0, 6));
  const [loading, setLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>('24h');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [sumRes, alertsRes, workersRes, eventsRes] = await Promise.all([
          dashboardApi.getSummary(isDemoMode, timeRange),
          alertsApi.getAlerts({ pageSize: 5 }, isDemoMode),
          workersApi.getWorkers(isDemoMode),
          eventsApi.getEvents({ pageSize: 6 }, isDemoMode)
        ]);

        if (isMounted) {
          setSummary(sumRes || mockDashboardSummary);
          setRecentAlerts(alertsRes?.items?.length ? alertsRes.items : mockAlerts.slice(0, 5));
          setWorkers(workersRes?.workers?.length ? workersRes.workers : mockWorkers);
          setRecentEvents(eventsRes?.items?.length ? eventsRes.items : mockGeneralEvents.slice(0, 6));
          setLoading(false);
        }
      } catch (err) {
        console.warn('Dashboard data fetch failed, applying simulation fallback:', err);
        if (isMounted) {
          setSummary({
            ...mockDashboardSummary,
            events_trend: getTrendForTimeRange(timeRange)
          });
          setRecentAlerts(mockAlerts.slice(0, 5));
          setWorkers(mockWorkers);
          setRecentEvents(mockGeneralEvents.slice(0, 6));
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, refreshTrigger, timeRange]);

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'critical': return 'badge-sev-critical';
      case 'high': return 'badge-sev-high';
      case 'medium': return 'badge-sev-medium';
      case 'low': return 'badge-sev-low';
      default: return 'badge-sev-info';
    }
  };

  const getWorkerStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <span className="badge badge-status-running">Running</span>;
      case 'stopped':
        return <span className="badge badge-status-stopped">Stopped</span>;
      case 'error':
        return <span className="badge badge-status-error">Error</span>;
      default:
        return <span className="badge badge-status-stopped">Unknown</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Worked Demonstration Launch Banner */}
      <WorkedBanner />

      {/* Backend Offline Guidance Banner */}
      {!isConnected && (
        <div 
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(255, 176, 32, 0.08)',
            border: '1px solid rgba(255, 176, 32, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: 'rgba(255, 176, 32, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sev-medium)',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Live Python Backend Offline (http://127.0.0.1:8000)</span>
                <span className="badge badge-sev-medium" style={{ fontSize: '0.65rem' }}>Simulation Active</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                All charts, metric cards, workers, and threat alerts are rendering in demonstration mode so you can test all features safely.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!isDemoMode && (
              <button 
                onClick={toggleDemoMode}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                <Zap size={13} />
                <span>Switch to Demo Mode</span>
              </button>
            )}
            <button 
              onClick={() => checkConnection()}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              <RotateCw size={13} />
              <span>Retry API Ping</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* Total Events */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Events Ingested</span>
            <div className="metric-icon-box">
              <Activity size={18} />
            </div>
          </div>
          {loading && !summary ? (
            <Skeleton height="36px" width="100px" />
          ) : (
            <div className="metric-value" style={{ color: 'var(--accent-cyan)' }}>
              {(summary?.total_events ?? 8352).toLocaleString()}
            </div>
          )}
          <div className="metric-footer">
            <Clock size={12} />
            <span>Across 5 Multithreaded Queues</span>
          </div>
        </div>

        {/* Open Alerts */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active Threat Alerts</span>
            <div className="metric-icon-box" style={{ background: 'rgba(255, 176, 32, 0.1)', color: 'var(--sev-medium)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          {loading && !summary ? (
            <Skeleton height="36px" width="70px" />
          ) : (
            <div className="metric-value" style={{ color: 'var(--sev-medium)' }}>
              {summary?.open_alerts ?? 3}
            </div>
          )}
          <div className="metric-footer">
            <span>Requiring Operator Review</span>
          </div>
        </div>

        {/* High / Critical Alerts */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Critical / High Severity</span>
            <div className="metric-icon-box" style={{ background: 'rgba(255, 59, 92, 0.1)', color: 'var(--sev-critical)' }}>
              <Flame size={18} />
            </div>
          </div>
          {loading && !summary ? (
            <Skeleton height="36px" width="70px" />
          ) : (
            <div className="metric-value" style={{ color: 'var(--sev-critical)' }}>
              {summary?.high_severity_alerts ?? 2}
            </div>
          )}
          <div className="metric-footer">
            <span style={{ color: 'var(--sev-critical)' }}>Immediate Investigation</span>
          </div>
        </div>

        {/* Failed Login Attempts */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Failed Login Attempts</span>
            <div className="metric-icon-box" style={{ background: 'rgba(255, 92, 56, 0.1)', color: 'var(--sev-high)' }}>
              <UserX size={18} />
            </div>
          </div>
          {loading && !summary ? (
            <Skeleton height="36px" width="70px" />
          ) : (
            <div className="metric-value" style={{ color: 'var(--sev-high)' }}>
              {summary?.failed_login_attempts ?? 6}
            </div>
          )}
          <div className="metric-footer">
            <span>6 From 192.0.2.10 (Demo Rule)</span>
          </div>
        </div>

        {/* Workers Running */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Python Worker Threads</span>
            <div className="metric-icon-box" style={{ background: 'rgba(56, 217, 150, 0.1)', color: 'var(--sev-low)' }}>
              <Cpu size={18} />
            </div>
          </div>
          {loading && !summary ? (
            <Skeleton height="36px" width="80px" />
          ) : (
            <div className="metric-value" style={{ color: 'var(--sev-low)' }}>
              {summary?.workers_running ?? 5} / {summary?.workers_total ?? 6}
            </div>
          )}
          <div className="metric-footer">
            <span>5 Active &bull; 1 Stopped</span>
          </div>
        </div>

        {/* Backend / API Health */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">API & Engine Health</span>
            <div className="metric-icon-box" style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)' }}>
              <Server size={18} />
            </div>
          </div>
          {loading && !summary ? (
            <Skeleton height="36px" width="100px" />
          ) : (
            <div className="metric-value" style={{ fontSize: '1.4rem', textTransform: 'capitalize', color: isConnected ? 'var(--sev-low)' : 'var(--accent-cyan)' }}>
              {isConnected ? 'healthy' : isDemoMode ? 'simulation' : 'fallback'}
            </div>
          )}
          <div className="metric-footer">
            <span>{isConnected ? 'Uptime: ~13.5 hours' : 'Operating in Safe Mode'}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Events & Failures Over Time */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Security Events Ingested Over Time</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isConnected 
                  ? 'Live stream from /api/v1/dashboard/summary' 
                  : 'Demonstration telemetry from multithreaded queue'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {(['1h', '24h', '7d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`btn btn-sm ${timeRange === r ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={260} minWidth={200}>
              <AreaChart 
                data={summary?.events_trend?.length ? summary.events_trend : getTrendForTimeRange(timeRange)} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="eventGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="failureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B5C" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#FF3B5C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101827',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="events" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#eventGrad)" name="Events" />
                <Area type="monotone" dataKey="failures" stroke="#FF3B5C" strokeWidth={2} fillOpacity={1} fill="url(#failureGrad)" name="Failed Logins" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity & Category Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Donut Chart: Severity Distribution */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '0.95rem', margin: 0, marginBottom: '0.25rem' }}>Alerts by Severity</h2>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Active unresolved threats
            </div>

            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={180} minWidth={150}>
                <PieChart>
                  <Pie
                    data={summary?.severity_distribution?.length ? summary.severity_distribution : mockDashboardSummary.severity_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(summary?.severity_distribution?.length ? summary.severity_distribution : mockDashboardSummary.severity_distribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101827',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
              {(summary?.severity_distribution?.length ? summary.severity_distribution : mockDashboardSummary.severity_distribution).map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart: Categories */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '0.95rem', margin: 0, marginBottom: '0.25rem' }}>Events by Category</h2>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Rule classifications
            </div>

            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={150}>
                <BarChart 
                  data={summary?.category_distribution?.length ? summary.category_distribution : mockDashboardSummary.category_distribution} 
                  layout="vertical" 
                  margin={{ top: 0, right: 15, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={10} />
                  <YAxis type="category" dataKey="category" stroke="#94A3B8" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101827',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bottom Section: Recent Alerts & System Health / Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }} className="responsive-dashboard-grid">
        {/* Left: Recent Alerts Table */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Recent Threat Alerts</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Signals requiring operator investigation (not automatic proof of breach)
              </div>
            </div>

            <button
              onClick={() => navigate('/alerts')}
              className="btn btn-outline-cyan btn-sm"
            >
              <span>View All Alerts</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Alert Title</th>
                  <th>Severity</th>
                  <th>Category</th>
                  <th>Source Indicator</th>
                  <th>Detected At</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(recentAlerts?.length ? recentAlerts : mockAlerts.slice(0, 5)).map((alert) => (
                  <tr key={alert.alert_id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{alert.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {alert.alert_id} &bull; Rule: {alert.detection_rule}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getSeverityBadgeClass(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{alert.event_category}</td>
                    <td>
                      <code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                        {alert.source_ip || 'Internal'}
                      </code>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {alert.time_detected.split(' ')[1]}
                    </td>
                    <td>
                      <span 
                        className={`badge ${alert.status === 'open' ? 'badge-sev-critical' : alert.status === 'acknowledged' ? 'badge-sev-medium' : 'badge-sev-low'}`}
                        style={{ fontSize: '0.68rem' }}
                      >
                        {alert.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/alerts?id=${alert.alert_id}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem' }}
                        title="Investigate Alert Details"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Monitoring Workers Health & Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Worker Health Quick Panel */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Python Worker Threads</h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Multithreaded background collectors
                </div>
              </div>
              <button 
                onClick={() => navigate('/workers')}
                className="btn-icon"
                title="View full worker architecture"
              >
                <ExternalLink size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {(workers?.length ? workers : mockWorkers).slice(0, 5).map((w) => (
                <div
                  key={w.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.65rem',
                    backgroundColor: 'rgba(21, 31, 50, 0.6)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(148, 163, 184, 0.08)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-main)' }}>
                      {w.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {w.thread_name}
                    </div>
                  </div>
                  <div>{getWorkerStatusBadge(w.status)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Recent Activity Stream</h3>
              <button 
                onClick={() => navigate('/events')} 
                className="btn-icon"
                title="Go to Event Explorer"
              >
                <ExternalLink size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(recentEvents?.length ? recentEvents : mockGeneralEvents).slice(0, 4).map((evt) => (
                <div
                  key={evt.event_id}
                  style={{
                    padding: '0.45rem 0.6rem',
                    backgroundColor: 'rgba(7, 11, 20, 0.5)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    borderLeft: evt.severity === 'critical' 
                      ? '3px solid var(--sev-critical)' 
                      : evt.severity === 'high' 
                        ? '3px solid var(--sev-high)' 
                        : evt.severity === 'medium'
                          ? '3px solid var(--sev-medium)'
                          : '3px solid var(--accent-cyan)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    <span>{evt.timestamp.split(' ')[1]}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{evt.source}</span>
                  </div>
                  <div style={{ color: 'var(--text-main)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {evt.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Educational Panel for Students */}
      <EducationalCard
        title="Frontend-to-Backend Architecture in CyberShield"
        concept="REST API & Multithreading Decoupling"
        description="The CyberShield Python backend manages multi-threaded collectors (reading auth logs, network connections, file integrity) which push events into a synchronized thread-safe queue.Queue. The detection engine evaluates events, writes records to the database, and exposes REST endpoints. The React frontend interacts solely via HTTP API calls (e.g. GET /api/v1/dashboard/summary) to render data into responsive charts and tables."
        pythonSnippet={`# Python Backend Concept:
worker_queue = queue.Queue(maxsize=1000)

def auth_monitor_worker():
    while not shutdown_event.is_set():
        event = tail_auth_log()
        worker_queue.put(event)  # Thread-safe handoff`}
        keyTakeaway="Separating background collectors from the REST API prevents network I/O or log parsing bottlenecks from blocking web requests or crashing the user interface."
      />
    </div>
  );
};
