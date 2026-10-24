import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Activity, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  Server, 
  LayoutDashboard, 
  GitCommit, 
  ShieldCheck, 
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { workersApi, WorkersResponse } from '../api/workers.api';
import { WorkerItem, QueueMetrics } from '../types';
import { useApi } from '../context/ApiContext';
import { EducationalCard } from '../components/common/EducationalCard';
import { Skeleton } from '../components/common/SkeletonLoader';

export const WorkersPage: React.FC = () => {
  const { isDemoMode, refreshTrigger } = useApi();
  const [data, setData] = useState<WorkersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    workersApi.getWorkers(isDemoMode)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load workers data:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, refreshTrigger]);

  const pipelineSteps = [
    { title: 'Observation', desc: 'Permitted logs & sockets', icon: Activity, color: '#00E5FF' },
    { title: 'Monitoring Worker', desc: 'Python background thread', icon: Cpu, color: '#38D996' },
    { title: 'Thread-Safe Queue', desc: 'queue.Queue() buffer', icon: Layers, color: '#8B5CF6' },
    { title: 'Event Processor', desc: 'Validation & normalization', icon: GitCommit, color: '#FFB020' },
    { title: 'Detection Engine', desc: 'Sliding window evaluation', icon: ShieldCheck, color: '#FF5C38' },
    { title: 'Database Store', desc: 'SQLite / PostgreSQL', icon: Database, color: '#FF3B5C' },
    { title: 'REST API', desc: 'FastAPI / Flask endpoints', icon: Server, color: '#00E5FF' },
    { title: 'Dashboard', desc: 'React & Recharts interface', icon: LayoutDashboard, color: '#38D996' }
  ];

  const getStatusBadge = (status: WorkerItem['status']) => {
    switch (status) {
      case 'running':
        return (
          <span className="badge badge-status-running">
            <span className="pulse-indicator-green" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--sev-low)' }} />
            Running
          </span>
        );
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
      {/* Top Banner */}
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
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
              Multithreaded Monitoring Architecture
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Independent Python threads run concurrently. Events are passed to a thread-safe queue for centralized processing.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem' }}>
          <span className="badge badge-demo">Runtime: Python 3 threading.Thread</span>
          <span className="badge badge-sev-info">Queue: queue.Queue()</span>
        </div>
      </div>

      {/* Visual Processing Pipeline */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', margin: 0, marginBottom: '0.25rem' }}>End-to-End Event Processing Pipeline</h3>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Visualizing data hand-off from source observation to dashboard presentation
        </div>

        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            overflowX: 'auto',
            padding: '0.5rem 0 1rem 0',
            gap: '0.5rem'
          }}
        >
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.title}>
                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    minWidth: '110px',
                    textAlign: 'center' 
                  }}
                >
                  <div 
                    style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: 'var(--radius-md)', 
                      backgroundColor: 'rgba(21, 31, 50, 0.9)', 
                      border: `1.5px solid ${step.color}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: step.color,
                      boxShadow: `0 0 12px ${step.color}33`,
                      marginBottom: '0.5rem'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {step.desc}
                  </div>
                </div>

                {idx < pipelineSteps.length - 1 && (
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)', minWidth: '16px', opacity: 0.5 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Queue Metrics Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', margin: 0, marginBottom: '0.25rem' }}>Inter-Thread Event Queue Metrics</h3>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Thread-safe FIFO handoff between producers (workers) and consumer (processor)
        </div>

        {data?.queue_metrics ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Queue Depth</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {data.queue_metrics.queue_size} / {data.queue_metrics.max_queue_size}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Buffered events in memory</div>
            </div>

            <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Processing Throughput</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--sev-low)' }}>
                {data.queue_metrics.throughput_per_sec} <span style={{ fontSize: '1rem', fontWeight: 500 }}>events/sec</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Consumer dequeue rate</div>
            </div>

            <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Average Latency</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-violet)' }}>
                {data.queue_metrics.average_latency_ms} ms
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Enqueue to detection delay</div>
            </div>

            <div style={{ backgroundColor: 'rgba(21, 31, 50, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Thread Safety</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--sev-low)', marginTop: '0.35rem' }}>
                Lock-Guarded (FIFO)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Mutex protected queue.Queue</div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Queue metrics not currently exposed by backend.
          </div>
        )}
      </div>

      {/* Individual Worker Thread Cards */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', margin: 0, marginBottom: '0.25rem' }}>Configured Python Monitoring Worker Threads</h3>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Real status of backend background tasks. Notice: thread lifecycles are governed on the Python backend.
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="140px" />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
            {data?.workers.map((worker) => (
              <div 
                key={worker.id}
                style={{
                  backgroundColor: 'rgba(16, 24, 39, 0.75)',
                  border: worker.status === 'error' ? '1px solid rgba(255, 59, 92, 0.4)' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff' }}>{worker.name}</div>
                    {getStatusBadge(worker.status)}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                    {worker.description}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.74rem', borderTop: '1px solid rgba(148,163,184,0.08)', paddingTop: '0.6rem', color: 'var(--text-muted)' }}>
                    <div>Thread: <code style={{ color: 'var(--accent-cyan)' }}>{worker.thread_name}</code></div>
                    <div>TID: <span style={{ fontFamily: 'var(--font-mono)' }}>{worker.thread_id || 'N/A'}</span></div>
                    <div>Events: <strong style={{ color: 'var(--text-main)' }}>{worker.events_processed.toLocaleString()}</strong></div>
                    <div>Errors: <strong style={{ color: worker.error_count > 0 ? 'var(--sev-critical)' : 'var(--sev-low)' }}>{worker.error_count}</strong></div>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={11} />
                    <span>Last heartbeat: {worker.last_activity}</span>
                  </div>

                  {worker.last_error && (
                    <div style={{ marginTop: '0.6rem', backgroundColor: 'rgba(255, 59, 92, 0.1)', border: '1px solid rgba(255, 59, 92, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', fontSize: '0.72rem', color: '#ff859b' }}>
                      <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {worker.last_error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational Card */}
      <EducationalCard
        title="Why Multithreading Matters in Python Security Applications"
        concept="I/O Concurrency & GIL Explanation"
        description="Python features a Global Interpreter Lock (GIL), but multithreading (threading.Thread) is ideal for I/O-bound tasks such as listening on network sockets, tailing authentication log files, and checking disk file hashes. Because these operations spend most of their time waiting on system calls and kernel I/O, Python releases the GIL during I/O operations, allowing all 5 monitoring workers to collect data simultaneously without blocking the main REST API."
        pythonSnippet={`# Starting Concurrency in CyberShield:
import threading, queue

event_queue = queue.Queue(maxsize=1000)
shutdown_event = threading.Event()

workers = [
    threading.Thread(target=network_worker, args=(event_queue, shutdown_event)),
    threading.Thread(target=auth_worker, args=(event_queue, shutdown_event)),
    threading.Thread(target=fim_worker, args=(event_queue, shutdown_event)),
    threading.Thread(target=pipeline_processor, args=(event_queue, shutdown_event))
]

for w in workers:
    w.daemon = True
    w.start()`}
        keyTakeaway="When asked by teachers about the GIL: clarify that network and disk monitoring are I/O bound, so Python threads run concurrently with high efficiency during I/O wait times."
      />
    </div>
  );
};
