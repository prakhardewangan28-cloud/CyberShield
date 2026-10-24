import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  UserX, 
  FileCheck2, 
  ListFilter, 
  Cpu,
  Clock
} from 'lucide-react';
import { reportsApi, ReportData } from '../api/reports.api';
import { useApi } from '../context/ApiContext';
import { useToast } from '../context/ToastContext';
import { EducationalCard } from '../components/common/EducationalCard';
import { Skeleton } from '../components/common/SkeletonLoader';

export const ReportsPage: React.FC = () => {
  const { isDemoMode, refreshTrigger } = useApi();
  const { addToast } = useToast();

  const [range, setRange] = useState<string>('7d');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    reportsApi.getReport(range, isDemoMode)
      .then((data) => {
        if (isMounted) {
          setReport(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load report:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [range, isDemoMode, refreshTrigger]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!report) return;

    let csv = `CyberShield Security Monitoring Summary Report\n`;
    csv += `Timeframe,${report.timeframe}\n`;
    csv += `Generated At,${report.generated_at}\n`;
    csv += `Data Source,${report.is_simulated ? 'Demonstration Simulation' : 'Live Python Backend'}\n\n`;
    csv += `Metric,Value\n`;
    csv += `Total Events Observed,${report.total_events}\n`;
    csv += `Total Threat Alerts,${report.total_alerts}\n`;
    csv += `Failed Login Attempts,${report.failed_login_count}\n`;
    csv += `Watchlist Matches,${report.watchlist_match_count}\n`;
    csv += `File Integrity Hash Mismatches,${report.fim_modifications_count}\n\n`;
    csv += `Severity,Count\n`;
    report.alerts_by_severity.forEach(s => {
      csv += `${s.severity},${s.count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cybershield_report_${range}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'CSV Exported', 'Security audit report downloaded as CSV.');
  };

  const handleExportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cybershield_report_${range}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'JSON Exported', 'Security report downloaded in JSON format.');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Action Toolbar */}
      <div 
        className="glass-panel no-print" 
        style={{ 
          padding: '1.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem' 
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.15rem', margin: 0 }}>SOC Security Reports & Analytics</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Audit compliance, event statistics, and multithreaded worker operational summaries
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Time range selector */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {(['24h', '7d', '30d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-secondary'}`}
              >
                {r === '24h' ? 'Last 24 Hours' : r === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print friendly report">
            <Printer size={15} />
            <span>Print Report</span>
          </button>

          <button onClick={handleExportCsv} className="btn btn-secondary btn-sm" title="Download CSV spreadsheet">
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>

          <button onClick={handleExportJson} className="btn btn-outline-cyan btn-sm" title="Download raw JSON report">
            <Download size={15} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '2rem', 
          backgroundColor: '#0a1020',
          border: '1px solid rgba(0, 229, 255, 0.25)' 
        }}
      >
        {/* Report Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148,163,184,0.15)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              CYBER<span style={{ color: 'var(--accent-cyan)' }}>SHIELD</span>
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Cybersecurity Network Monitoring System Report
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Timeframe: <strong>{report?.timeframe}</strong> &bull; Generated: {report?.generated_at}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${report?.is_simulated ? 'badge-demo' : 'badge-sev-low'}`}>
              {report?.is_simulated ? 'DEMO SIMULATION DATA' : 'AUTHENTICATED API DATA'}
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Classification: SOC Internal Audit
            </div>
          </div>
        </div>

        {/* Aggregated Totals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.5)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Events Ingested</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {report?.total_events.toLocaleString()}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.5)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Threat Alerts Triggered</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--sev-medium)' }}>
              {report?.total_alerts}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.5)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Failed Login Failures</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--sev-high)' }}>
              {report?.failed_login_count}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.5)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Watchlist Matches</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--accent-violet)' }}>
              {report?.watchlist_match_count}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.5)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>File Integrity Breaches</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--sev-critical)' }}>
              {report?.fim_modifications_count}
            </div>
          </div>
        </div>

        {/* Breakdown Tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Alerts Grouped by Severity</h3>
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Severity Level</th>
                  <th>Count</th>
                  <th>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {report?.alerts_by_severity.map(s => {
                  const pct = Math.round((s.count / (report.total_alerts || 1)) * 100);
                  return (
                    <tr key={s.severity}>
                      <td style={{ fontWeight: 600 }}>{s.severity}</td>
                      <td>{s.count}</td>
                      <td style={{ width: '120px' }}>
                        <div style={{ height: '6px', background: 'rgba(148,163,184,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${pct}%`, 
                              height: '100%', 
                              backgroundColor: s.severity === 'Critical' ? '#FF3B5C' : s.severity === 'High' ? '#FF5C38' : s.severity === 'Medium' ? '#FFB020' : '#38D996' 
                            }} 
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Events Grouped by Category</h3>
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {report?.events_by_category.map(c => (
                  <tr key={c.category}>
                    <td>{c.category}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{c.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Worker Health Audit */}
        <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.4)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: 'var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            Background Worker Daemon Operational Audit
          </h4>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Total Configured Threads: <strong>{report?.worker_health_summary.total}</strong> &bull; Healthy: <strong style={{ color: 'var(--sev-low)' }}>{report?.worker_health_summary.healthy}</strong> &bull; Stopped: <strong style={{ color: 'var(--sev-critical)' }}>{report?.worker_health_summary.stopped}</strong>
          </div>
        </div>
      </div>

      {/* Educational Card */}
      <EducationalCard
        title="Responsible Cybersecurity Reporting"
        concept="Audit Integrity"
        description="Notice how CyberShield strictly computes report metrics from actual backend records (event counts, detected alert levels, worker heartbeats). We deliberately avoid making up marketing claims like '$100,000 saved' or '99.9% cyber attacks prevented' which are unrealistic in genuine academic engineering demonstrations."
        keyTakeaway="College project presentations shine when metrics are realistic, verifiable, and transparently grounded in the event queue and database."
      />
    </div>
  );
};
