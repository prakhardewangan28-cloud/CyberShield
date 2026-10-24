import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  X, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Database, 
  Layers, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { eventsApi, EventFilterParams } from '../api/events.api';
import { EventItem, Severity, ProcessingStatus } from '../types';
import { useApi } from '../context/ApiContext';
import { Skeleton, TableSkeleton } from '../components/common/SkeletonLoader';
import { EducationalCard } from '../components/common/EducationalCard';

export const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDemoMode, refreshTrigger } = useApi();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(8);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Detail Drawer State
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params: EventFilterParams = {
      search: searchQuery || undefined,
      eventType: selectedType !== 'all' ? selectedType : undefined,
      severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      page,
      pageSize
    };

    eventsApi.getEvents(params, isDemoMode)
      .then((res) => {
        if (isMounted) {
          setEvents(res.items);
          setTotal(res.total);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, refreshTrigger, page, pageSize, searchQuery, selectedType, selectedSeverity, selectedStatus]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
    setSearchParams({});
    setPage(1);
  };

  const getSeverityBadgeClass = (sev: Severity) => {
    switch (sev) {
      case 'critical': return 'badge-sev-critical';
      case 'high': return 'badge-sev-high';
      case 'medium': return 'badge-sev-medium';
      case 'low': return 'badge-sev-low';
      case 'info':
      default:
        return 'badge-sev-info';
    }
  };

  const getStatusBadge = (status: ProcessingStatus) => {
    switch (status) {
      case 'flagged':
        return <span className="badge badge-sev-critical">Flagged</span>;
      case 'processed':
        return <span className="badge badge-sev-low">Processed</span>;
      case 'queued':
        return <span className="badge badge-sev-info">Queued</span>;
      default:
        return <span className="badge badge-status-stopped">{status}</span>;
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Filter Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Security Event Explorer</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Search, filter, and inspect raw event payloads ingested from multithreaded queues
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-demo">Total Matched: {total}</span>
            <button
              onClick={handleClearFilters}
              className="btn btn-secondary btn-sm"
            >
              <X size={14} />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '0.75rem' 
          }}
        >
          {/* Search Box */}
          <div className="search-box">
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search ID, source IP, text..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Event Type Filter */}
          <select 
            className="select-field"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Event Types</option>
            <option value="login_failure">login_failure</option>
            <option value="login_success">login_success</option>
            <option value="file_modified">file_modified</option>
            <option value="file_created">file_created</option>
            <option value="watchlist_match">watchlist_match</option>
            <option value="connection_spike">connection_spike</option>
            <option value="dns_query">dns_query</option>
            <option value="worker_heartbeat">worker_heartbeat</option>
          </select>

          {/* Severity Filter */}
          <select 
            className="select-field"
            value={selectedSeverity}
            onChange={(e) => {
              setSelectedSeverity(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Informational</option>
          </select>

          {/* Processing Status Filter */}
          <select 
            className="select-field"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Processing States</option>
            <option value="flagged">Flagged for Alert</option>
            <option value="processed">Processed (Normal)</option>
            <option value="queued">Queued in Buffer</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={36} style={{ margin: '0 auto 0.75rem auto', color: 'var(--text-muted)' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>No Security Events Found</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try clearing filters or search terms.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Description</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <tr key={evt.event_id}>
                    <td>
                      <code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                        {evt.event_id}
                      </code>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {evt.timestamp}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: evt.event_type.includes('failure') ? 'var(--sev-critical)' : 'var(--text-main)' }}>
                        {evt.event_type}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', color: evt.source === '192.0.2.10' ? 'var(--sev-medium)' : 'var(--text-main)' }}>
                        {evt.source}
                      </code>
                    </td>
                    <td style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {evt.description}
                    </td>
                    <td>
                      <span className={`badge ${getSeverityBadgeClass(evt.severity)}`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td>{getStatusBadge(evt.processing_status)}</td>
                    <td>
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.55rem' }}
                        title="View Complete Event Information"
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
        )}

        {/* Pagination Footer */}
        <div 
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: 'var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total records)
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-secondary btn-sm"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out Event Detail Drawer */}
      {selectedEvent && (
        <>
          <div className="drawer-backdrop" onClick={() => setSelectedEvent(null)} />
          <div className="drawer-panel">
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span className="badge badge-sev-info">{selectedEvent.event_id}</span>
                  <span className={`badge ${getSeverityBadgeClass(selectedEvent.severity)}`}>
                    {selectedEvent.severity}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Event Record Inspector</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="btn-icon" aria-label="Close inspector">
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event Description</label>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500, marginTop: '0.2rem' }}>
                  {selectedEvent.description}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</label>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {selectedEvent.timestamp}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Source Address / Entity</label>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                    {selectedEvent.source}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event Type</label>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {selectedEvent.event_type}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Processing Status</label>
                  <div style={{ marginTop: '0.2rem' }}>
                    {getStatusBadge(selectedEvent.processing_status)}
                  </div>
                </div>
              </div>

              {selectedEvent.matched_rule && (
                <div style={{ backgroundColor: 'rgba(255, 176, 32, 0.08)', border: '1px solid rgba(255, 176, 32, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sev-medium)', marginBottom: '0.2rem' }}>
                    Matched Detection Rule:
                  </div>
                  <code style={{ fontSize: '0.82rem', color: '#fff' }}>{selectedEvent.matched_rule}</code>
                </div>
              )}

              {selectedEvent.related_alert_id && (
                <div style={{ backgroundColor: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.2rem' }}>
                    Correlated Alert:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#fff' }}>
                    Linked to Incident Alert <code>{selectedEvent.related_alert_id}</code>
                  </div>
                </div>
              )}

              {/* Raw JSON Payload (Safe representation without secrets) */}
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Complete Structured JSON (Validated)
                </label>
                <div
                  style={{
                    backgroundColor: '#070b14',
                    border: 'var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#93c5fd',
                    overflowX: 'auto',
                    marginTop: '0.35rem',
                    maxHeight: '220px'
                  }}
                >
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(selectedEvent, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Educational Card */}
      <EducationalCard
        title="Event Validation and Queue Serialization"
        concept="Event Ingestion & Normalization"
        description="When background monitoring workers encounter an event (e.g. an SSH auth log failure), they create a standardized dictionary or Pydantic model with fields like timestamp, source, event_type, and severity. This payload is passed through the thread-safe queue.Queue into the Event Processor, ensuring thread isolation and avoiding race conditions."
        keyTakeaway="Sensitive credentials (passwords, auth tokens) are stripped before event serialization so that security dashboards never receive plain-text secrets."
      />
    </div>
  );
};
