export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

export type WorkerStatus = 'running' | 'idle' | 'stopped' | 'error' | 'unknown';

export type ProcessingStatus = 'queued' | 'processed' | 'flagged' | 'dropped';

export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  last_login?: string;
}

export interface EventItem {
  event_id: string;
  timestamp: string;
  event_type: 
    | 'login_failure' 
    | 'login_success' 
    | 'file_created' 
    | 'file_modified' 
    | 'file_deleted' 
    | 'watchlist_match' 
    | 'connection_spike' 
    | 'port_scan' 
    | 'dns_query' 
    | 'worker_heartbeat';
  source: string;
  destination?: string;
  description: string;
  severity: Severity;
  processing_status: ProcessingStatus;
  matched_rule?: string;
  related_alert_id?: string;
  metadata?: Record<string, unknown>;
  is_simulated: boolean;
}

export interface AlertItem {
  alert_id: string;
  title: string;
  severity: Severity;
  status: AlertStatus;
  source_ip?: string;
  count?: number;
  event_category: string;
  detection_rule: string;
  detection_reason: string;
  time_detected: string;
  time_window_seconds?: number;
  observed_failures?: number;
  suggested_investigation_steps: string[];
  related_event_ids: string[];
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  is_simulated: boolean;
}

export interface WorkerItem {
  id: string;
  name: string;
  task_type: 
    | 'connection_monitoring' 
    | 'login_monitoring' 
    | 'watchlist_checking' 
    | 'file_integrity' 
    | 'event_processing';
  status: WorkerStatus;
  thread_name: string;
  thread_id?: number;
  last_activity: string;
  events_processed: number;
  error_count: number;
  last_error?: string;
  description: string;
}

export interface QueueMetrics {
  queue_size: number;
  max_queue_size: number;
  throughput_per_sec: number;
  average_latency_ms: number;
  is_thread_safe: boolean;
  status: 'active' | 'draining' | 'idle';
}

export interface WatchlistEntry {
  id: string;
  ip_address: string;
  description: string;
  reason: string;
  created_at: string;
  status: 'active' | 'inactive' | 'monitored';
  match_count: number;
  last_matched_at?: string;
}

export interface FileIntegrityEntry {
  id: string;
  file_path: string;
  directory: string;
  status: 'created' | 'modified' | 'deleted' | 'unchanged';
  baseline_hash: string;
  current_hash: string;
  last_checked: string;
  alert_triggered: boolean;
  algorithm: 'SHA-256';
  file_size_bytes: number;
}

export interface NetworkConnection {
  id: string;
  timestamp: string;
  source_ip: string;
  source_port: number;
  dest_ip: string;
  dest_port: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  bytes_transferred: number;
  flags: string;
  status: 'established' | 'closed' | 'blocked' | 'flagged';
  process_name?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target_resource: string;
  result: 'success' | 'failure';
  client_ip: string;
  details: string;
}

export interface DashboardSummary {
  total_events: number;
  open_alerts: number;
  high_severity_alerts: number;
  failed_login_attempts: number;
  workers_running: number;
  workers_total: number;
  api_health: 'healthy' | 'degraded' | 'offline';
  uptime_seconds: number;
  events_trend: {
    time: string;
    events: number;
    failures: number;
    alerts: number;
  }[];
  severity_distribution: {
    name: string;
    value: number;
    color: string;
  }[];
  category_distribution: {
    category: string;
    count: number;
  }[];
  is_simulated: boolean;
}

export interface DetectionThresholdConfig {
  failed_login_threshold: number;
  failed_login_window_seconds: number;
  watchlist_matching_enabled: boolean;
  file_hash_polling_interval_seconds: number;
  network_spike_threshold_connections: number;
  log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
}
