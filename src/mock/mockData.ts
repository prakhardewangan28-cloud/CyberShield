import { 
  AlertItem, 
  AuditLog, 
  DashboardSummary, 
  DetectionThresholdConfig, 
  EventItem, 
  FileIntegrityEntry, 
  NetworkConnection, 
  QueueMetrics, 
  User, 
  WatchlistEntry, 
  WorkerItem 
} from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr_001',
    username: 'admin',
    name: 'Chief Security Officer',
    email: 'admin@cybershield.internal',
    role: 'admin',
    last_login: '2026-10-23 16:30:12'
  },
  {
    id: 'usr_002',
    username: 'analyst',
    name: 'SOC Analyst L2',
    email: 'analyst@cybershield.internal',
    role: 'analyst',
    last_login: '2026-10-23 15:45:00'
  },
  {
    id: 'usr_003',
    username: 'viewer',
    name: 'Student Auditor',
    email: 'viewer@cybershield.internal',
    role: 'viewer',
    last_login: '2026-10-23 14:10:05'
  }
];

export const mockWorkedExampleEvents: EventItem[] = [
  {
    event_id: 'evt_work_01',
    timestamp: '2026-10-23 12:00:05',
    event_type: 'login_failure',
    source: '192.0.2.10',
    destination: 'auth.cybershield.local:22',
    description: 'SSH authentication failure for user admin (invalid credentials)',
    severity: 'medium',
    processing_status: 'flagged',
    matched_rule: 'rule_auth_failed_logins_v1',
    related_alert_id: 'alt_001',
    metadata: { username: 'admin', service: 'sshd', auth_method: 'password', attempt: 1 },
    is_simulated: true
  },
  {
    event_id: 'evt_work_02',
    timestamp: '2026-10-23 12:00:17',
    event_type: 'login_failure',
    source: '192.0.2.10',
    destination: 'auth.cybershield.local:22',
    description: 'SSH authentication failure for user root (user not found)',
    severity: 'medium',
    processing_status: 'flagged',
    matched_rule: 'rule_auth_failed_logins_v1',
    related_alert_id: 'alt_001',
    metadata: { username: 'root', service: 'sshd', auth_method: 'password', attempt: 2 },
    is_simulated: true
  },
  {
    event_id: 'evt_work_03',
    timestamp: '2026-10-23 12:00:29',
    event_type: 'login_failure',
    source: '192.0.2.10',
    destination: 'auth.cybershield.local:22',
    description: 'SSH authentication failure for user admin (invalid credentials)',
    severity: 'medium',
    processing_status: 'flagged',
    matched_rule: 'rule_auth_failed_logins_v1',
    related_alert_id: 'alt_001',
    metadata: { username: 'admin', service: 'sshd', auth_method: 'password', attempt: 3 },
    is_simulated: true
  },
  {
    event_id: 'evt_work_04',
    timestamp: '2026-10-23 12:00:41',
    event_type: 'login_failure',
    source: '192.0.2.10',
    destination: 'auth.cybershield.local:22',
    description: 'SSH authentication failure for user sysadmin (invalid credentials)',
    severity: 'medium',
    processing_status: 'flagged',
    matched_rule: 'rule_auth_failed_logins_v1',
    related_alert_id: 'alt_001',
    metadata: { username: 'sysadmin', service: 'sshd', auth_method: 'password', attempt: 4 },
    is_simulated: true
  },
  {
    event_id: 'evt_work_05',
    timestamp: '2026-10-23 12:00:52',
    event_type: 'login_failure',
    source: '192.0.2.10',
    destination: 'auth.cybershield.local:22',
    description: 'SSH authentication failure for user postgres (invalid credentials)',
    severity: 'medium',
    processing_status: 'flagged',
    matched_rule: 'rule_auth_failed_logins_v1',
    related_alert_id: 'alt_001',
    metadata: { username: 'postgres', service: 'sshd', auth_method: 'password', attempt: 5 },
    is_simulated: true
  },
  {
    event_id: 'evt_work_06',
    timestamp: '2026-10-23 12:01:03',
    event_type: 'login_failure',
    source: '192.0.2.10',
    destination: 'auth.cybershield.local:22',
    description: 'SSH authentication failure for user admin (threshold exceeded)',
    severity: 'medium',
    processing_status: 'flagged',
    matched_rule: 'rule_auth_failed_logins_v1',
    related_alert_id: 'alt_001',
    metadata: { username: 'admin', service: 'sshd', auth_method: 'password', attempt: 6 },
    is_simulated: true
  }
];

export const mockGeneralEvents: EventItem[] = [
  ...mockWorkedExampleEvents,
  {
    event_id: 'evt_101',
    timestamp: '2026-10-23 12:05:40',
    event_type: 'watchlist_match',
    source: '203.0.113.45',
    destination: '10.0.0.4:443',
    description: 'Connection attempt from IP present in maintained threat watchlist',
    severity: 'high',
    processing_status: 'flagged',
    matched_rule: 'rule_ip_watchlist_match_v2',
    related_alert_id: 'alt_002',
    metadata: { watchlist_id: 'wl_002', protocol: 'TCP', port: 443 },
    is_simulated: true
  },
  {
    event_id: 'evt_102',
    timestamp: '2026-10-23 12:08:15',
    event_type: 'file_modified',
    source: 'worker:file_integrity',
    destination: '/etc/security/pam_auth.conf',
    description: 'SHA-256 hash mismatch detected in security configuration file',
    severity: 'high',
    processing_status: 'flagged',
    matched_rule: 'rule_fim_unauthorized_modification',
    related_alert_id: 'alt_003',
    metadata: {
      path: '/etc/security/pam_auth.conf',
      old_hash: 'a9f24d...e1',
      new_hash: '3bc109...f4'
    },
    is_simulated: true
  },
  {
    event_id: 'evt_103',
    timestamp: '2026-10-23 12:11:30',
    event_type: 'file_created',
    source: 'worker:file_integrity',
    destination: '/etc/sudoers.d/99-wheel',
    description: 'New privilege escalation file created in monitored directory',
    severity: 'critical',
    processing_status: 'flagged',
    matched_rule: 'rule_fim_sensitive_file_created',
    related_alert_id: 'alt_005',
    metadata: { path: '/etc/sudoers.d/99-wheel', permissions: '0440' },
    is_simulated: true
  },
  {
    event_id: 'evt_104',
    timestamp: '2026-10-23 12:14:02',
    event_type: 'connection_spike',
    source: '198.51.100.88',
    destination: '10.0.0.10:80',
    description: 'Rapid TCP SYN connection attempts exceeding baseline rate (85 conns/sec)',
    severity: 'low',
    processing_status: 'flagged',
    matched_rule: 'rule_network_rate_anomaly',
    related_alert_id: 'alt_004',
    metadata: { pps: 85, duration_sec: 15 },
    is_simulated: true
  },
  {
    event_id: 'evt_105',
    timestamp: '2026-10-23 12:15:20',
    event_type: 'login_success',
    source: '10.0.1.25',
    destination: 'auth.cybershield.local:443',
    description: 'Successful administrative login via SSO portal',
    severity: 'info',
    processing_status: 'processed',
    metadata: { user: 'admin', mfa_verified: true },
    is_simulated: true
  },
  {
    event_id: 'evt_106',
    timestamp: '2026-10-23 12:16:45',
    event_type: 'dns_query',
    source: '10.0.2.14',
    destination: '1.1.1.1:53',
    description: 'Standard DNS lookup query resolved for api.github.com',
    severity: 'info',
    processing_status: 'processed',
    metadata: { query: 'api.github.com', type: 'A' },
    is_simulated: true
  },
  {
    event_id: 'evt_107',
    timestamp: '2026-10-23 12:18:10',
    event_type: 'worker_heartbeat',
    source: 'worker:connection_monitor',
    destination: 'event_queue',
    description: 'Worker thread alive: 1,420 packets ingested across 3 interfaces',
    severity: 'info',
    processing_status: 'processed',
    metadata: { thread_id: 14032, buffer_utilization: '12%' },
    is_simulated: true
  },
  {
    event_id: 'evt_108',
    timestamp: '2026-10-23 12:20:00',
    event_type: 'file_modified',
    source: 'worker:file_integrity',
    destination: '/var/log/auth.log',
    description: 'Routine log rotation appended new log lines',
    severity: 'info',
    processing_status: 'processed',
    metadata: { bytes_added: 4096 },
    is_simulated: true
  }
];

export const mockAlerts: AlertItem[] = [
  {
    alert_id: 'alt_001',
    title: 'Repeated failed login attempts',
    severity: 'medium',
    status: 'open',
    source_ip: '192.0.2.10',
    count: 6,
    event_category: 'Authentication',
    detection_rule: 'rule_auth_failed_logins_v1',
    detection_reason: 'Configured threshold exceeded: 6 failed logins detected within 120-second sliding evaluation window.',
    time_detected: '2026-10-23 12:01:03',
    time_window_seconds: 120,
    observed_failures: 6,
    suggested_investigation_steps: [
      'Verify whether source IP 192.0.2.10 is internal or a public documentation address.',
      'Check if credentials used indicate password spraying across generic user accounts (admin, root, sysadmin).',
      'Correlate with VPN access logs and perimeter firewall drops.',
      'Confirm if account lockout policies were properly enforced by PAM.'
    ],
    related_event_ids: [
      'evt_work_01', 
      'evt_work_02', 
      'evt_work_03', 
      'evt_work_04', 
      'evt_work_05', 
      'evt_work_06'
    ],
    is_simulated: true
  },
  {
    alert_id: 'alt_002',
    title: 'IP Watchlist Indicator Match',
    severity: 'high',
    status: 'open',
    source_ip: '203.0.113.45',
    count: 1,
    event_category: 'Network Reconnaissance',
    detection_rule: 'rule_ip_watchlist_match_v2',
    detection_reason: 'Observed traffic source matches active indicator on the IP Watchlist table (Flagged as external vulnerability scanner).',
    time_detected: '2026-10-23 12:05:40',
    suggested_investigation_steps: [
      'Review destination ports and payload signatures from 203.0.113.45.',
      'Check if target web server returned HTTP 200 or 403 responses.',
      'Check border router access-control list status.'
    ],
    related_event_ids: ['evt_101'],
    is_simulated: true
  },
  {
    alert_id: 'alt_003',
    title: 'Critical PAM Configuration Hash Changed',
    severity: 'high',
    status: 'acknowledged',
    source_ip: 'worker:file_integrity',
    count: 1,
    event_category: 'File Integrity',
    detection_rule: 'rule_fim_unauthorized_modification',
    detection_reason: 'Monitored directory security rule violation: /etc/security/pam_auth.conf SHA-256 hash differs from stored baseline.',
    time_detected: '2026-10-23 12:08:15',
    suggested_investigation_steps: [
      'Compare local diff with version control or package manager baseline (e.g., dpkg -V).',
      'Inspect audit logs for sudo sessions active around 12:08.',
      'Contact system administrator to verify scheduled maintenance window.'
    ],
    related_event_ids: ['evt_102'],
    acknowledged_by: 'analyst',
    acknowledged_at: '2026-10-23 12:12:00',
    is_simulated: true
  },
  {
    alert_id: 'alt_004',
    title: 'TCP Connection Rate Anomaly',
    severity: 'low',
    status: 'resolved',
    source_ip: '198.51.100.88',
    count: 85,
    event_category: 'Network Activity',
    detection_rule: 'rule_network_rate_anomaly',
    detection_reason: 'Connection count exceeded temporary threshold of 50 connections/10s.',
    time_detected: '2026-10-23 12:14:02',
    suggested_investigation_steps: [
      'Investigate if source IP was running an internal automated test script.',
      'Verify web server keep-alive settings.'
    ],
    related_event_ids: ['evt_104'],
    acknowledged_by: 'analyst',
    acknowledged_at: '2026-10-23 12:15:00',
    resolved_by: 'admin',
    resolved_at: '2026-10-23 12:18:00',
    resolution_notes: 'Confirmed to be QA load testing from internal subnet. Alert marked resolved.',
    is_simulated: true
  },
  {
    alert_id: 'alt_005',
    title: 'Unauthorized Sudoers File Created',
    severity: 'critical',
    status: 'open',
    source_ip: 'worker:file_integrity',
    count: 1,
    event_category: 'Privilege Escalation',
    detection_rule: 'rule_fim_sensitive_file_created',
    detection_reason: 'A new file /etc/sudoers.d/99-wheel was created without pre-approved change authorization record.',
    time_detected: '2026-10-23 12:11:30',
    suggested_investigation_steps: [
      'Isolate the host or verify current active SSH sessions.',
      'Inspect process tree for parent PID of the file creator.',
      'Extract file contents into sandboxed memory for forensics.'
    ],
    related_event_ids: ['evt_103'],
    is_simulated: true
  }
];

export const mockWorkers: WorkerItem[] = [
  {
    id: 'wrk_01',
    name: 'Traffic & Connection Worker',
    task_type: 'connection_monitoring',
    status: 'running',
    thread_name: 'PyThread-NetworkMonitor-01',
    thread_id: 14032,
    last_activity: 'Just now (1.2s ago)',
    events_processed: 3842,
    error_count: 0,
    description: 'Reads network socket metadata from permitted interface and dispatches connection events to queue.'
  },
  {
    id: 'wrk_02',
    name: 'Login & Auth Monitor',
    task_type: 'login_monitoring',
    status: 'running',
    thread_name: 'PyThread-AuthWatcher-02',
    thread_id: 14033,
    last_activity: '2 seconds ago',
    events_processed: 914,
    error_count: 0,
    description: 'Tails permitted auth.log records, parses login_failure and login_success events into queue.'
  },
  {
    id: 'wrk_03',
    name: 'IP Watchlist Matcher',
    task_type: 'watchlist_checking',
    status: 'running',
    thread_name: 'PyThread-WatchlistMatcher-03',
    thread_id: 14034,
    last_activity: '5 seconds ago',
    events_processed: 2150,
    error_count: 0,
    description: 'Evaluates ingested IP addresses against in-memory trie of flagged indicators.'
  },
  {
    id: 'wrk_04',
    name: 'File Integrity Worker',
    task_type: 'file_integrity',
    status: 'running',
    thread_name: 'PyThread-FIMWorker-04',
    thread_id: 14035,
    last_activity: '12 seconds ago',
    events_processed: 480,
    error_count: 0,
    description: 'Periodically computes SHA-256 hashes of configured critical files and compares with baseline table.'
  },
  {
    id: 'wrk_05',
    name: 'Event Pipeline Processor',
    task_type: 'event_processing',
    status: 'running',
    thread_name: 'PyThread-PipelineConsumer-05',
    thread_id: 14036,
    last_activity: 'Just now (0.5s ago)',
    events_processed: 7386,
    error_count: 0,
    description: 'Pulls events from thread-safe queue.Queue(), validates fields, and applies detection rule engine.'
  },
  {
    id: 'wrk_06',
    name: 'DNS Query Anomaly Worker',
    task_type: 'connection_monitoring',
    status: 'stopped',
    thread_name: 'PyThread-DNSMonitor-06',
    thread_id: 14037,
    last_activity: '18 minutes ago',
    events_processed: 120,
    error_count: 2,
    last_error: 'Socket permission denied on raw DNS port 53 (requires elevated daemon privileges)',
    description: 'Optional experimental worker for monitoring recursive DNS queries.'
  }
];

export const mockQueueMetrics: QueueMetrics = {
  queue_size: 4,
  max_queue_size: 1000,
  throughput_per_sec: 42.8,
  average_latency_ms: 1.8,
  is_thread_safe: true,
  status: 'active'
};

export const mockWatchlist: WatchlistEntry[] = [
  {
    id: 'wl_001',
    ip_address: '198.51.100.22',
    description: 'Known automated credential brute-forcer',
    reason: 'Reported in CISA Advisory 2026-Q1 for persistent SSH probing.',
    created_at: '2026-10-15 09:20:00',
    status: 'active',
    match_count: 14,
    last_matched_at: '2026-10-23 11:42:10'
  },
  {
    id: 'wl_002',
    ip_address: '203.0.113.45',
    description: 'External Vulnerability Scanner',
    reason: 'Continuous HTTP directory busting detected across external gateway.',
    created_at: '2026-10-18 14:10:00',
    status: 'active',
    match_count: 3,
    last_matched_at: '2026-10-23 12:05:40'
  },
  {
    id: 'wl_003',
    ip_address: '192.0.2.10',
    description: 'Documented Classroom Demo Source IP',
    reason: 'RFC 5737 Test-Net-1 address used for 6 failed logins multithreading threshold test.',
    created_at: '2026-10-20 08:00:00',
    status: 'monitored',
    match_count: 6,
    last_matched_at: '2026-10-23 12:01:03'
  },
  {
    id: 'wl_004',
    ip_address: '198.51.100.99',
    description: 'Decommissioned Lab Test Host',
    reason: 'Retired subnet scanner previously used in testing environment.',
    created_at: '2026-09-01 10:00:00',
    status: 'inactive',
    match_count: 0
  }
];

export const mockFileIntegrity: FileIntegrityEntry[] = [
  {
    id: 'fim_001',
    file_path: '/etc/security/pam_auth.conf',
    directory: '/etc/security/',
    status: 'modified',
    baseline_hash: 'a9f24d8b5c901e1274bf30198d02914109841804812389148029384019283401',
    current_hash: '3bc109a80e192841098230194820914801928340192834019284019284019283',
    last_checked: '2026-10-23 12:08:15',
    alert_triggered: true,
    algorithm: 'SHA-256',
    file_size_bytes: 4128
  },
  {
    id: 'fim_002',
    file_path: '/etc/sudoers.d/99-wheel',
    directory: '/etc/sudoers.d/',
    status: 'created',
    baseline_hash: 'NONE (New file created)',
    current_hash: '7d891c0e98124019284019283401928401928340192840192840192834019284',
    last_checked: '2026-10-23 12:11:30',
    alert_triggered: true,
    algorithm: 'SHA-256',
    file_size_bytes: 256
  },
  {
    id: 'fim_003',
    file_path: '/etc/pam.d/common-auth',
    directory: '/etc/pam.d/',
    status: 'unchanged',
    baseline_hash: '8f9210e820194820194820194820194820194820194820194820194820194820',
    current_hash: '8f9210e820194820194820194820194820194820194820194820194820194820',
    last_checked: '2026-10-23 12:20:00',
    alert_triggered: false,
    algorithm: 'SHA-256',
    file_size_bytes: 2048
  },
  {
    id: 'fim_004',
    file_path: '/var/log/auth.log',
    directory: '/var/log/',
    status: 'modified',
    baseline_hash: '12ef45... (Append-only permitted)',
    current_hash: '45cd89... (Append-only permitted)',
    last_checked: '2026-10-23 12:20:00',
    alert_triggered: false,
    algorithm: 'SHA-256',
    file_size_bytes: 81920
  },
  {
    id: 'fim_005',
    file_path: '/etc/shadow.bak',
    directory: '/etc/',
    status: 'unchanged',
    baseline_hash: 'e45bc09182309184019284019284019284019284019284019284019284019284',
    current_hash: 'e45bc09182309184019284019284019284019284019284019284019284019284',
    last_checked: '2026-10-23 12:18:00',
    alert_triggered: false,
    algorithm: 'SHA-256',
    file_size_bytes: 1420
  }
];

export const mockNetworkConnections: NetworkConnection[] = [
  {
    id: 'net_01',
    timestamp: '2026-10-23 12:21:05',
    source_ip: '192.0.2.10',
    source_port: 52410,
    dest_ip: '10.0.0.4',
    dest_port: 22,
    protocol: 'TCP',
    bytes_transferred: 3420,
    flags: 'SYN, ACK, RST',
    status: 'flagged',
    process_name: 'sshd'
  },
  {
    id: 'net_02',
    timestamp: '2026-10-23 12:21:10',
    source_ip: '203.0.113.45',
    source_port: 44102,
    dest_ip: '10.0.0.10',
    dest_port: 443,
    protocol: 'TCP',
    bytes_transferred: 890,
    flags: 'SYN',
    status: 'flagged',
    process_name: 'nginx'
  },
  {
    id: 'net_03',
    timestamp: '2026-10-23 12:21:12',
    source_ip: '10.0.1.25',
    source_port: 58912,
    dest_ip: '10.0.0.5',
    dest_port: 5432,
    protocol: 'TCP',
    bytes_transferred: 145000,
    flags: 'ACK, PSH',
    status: 'established',
    process_name: 'postgres'
  },
  {
    id: 'net_04',
    timestamp: '2026-10-23 12:21:15',
    source_ip: '10.0.2.14',
    source_port: 60124,
    dest_ip: '1.1.1.1',
    dest_port: 53,
    protocol: 'UDP',
    bytes_transferred: 128,
    flags: 'None',
    status: 'established',
    process_name: 'systemd-resolved'
  },
  {
    id: 'net_05',
    timestamp: '2026-10-23 12:21:19',
    source_ip: '198.51.100.88',
    source_port: 49100,
    dest_ip: '10.0.0.10',
    dest_port: 80,
    protocol: 'TCP',
    bytes_transferred: 40210,
    flags: 'SYN, ACK',
    status: 'established',
    process_name: 'nginx'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'aud_001',
    timestamp: '2026-10-23 12:18:00',
    actor: 'admin',
    role: 'Administrator',
    action: 'ALERT_RESOLVED',
    target_resource: 'alt_004 (TCP Connection Rate Anomaly)',
    result: 'success',
    client_ip: '10.0.1.25',
    details: 'Resolution recorded: Confirmed QA load test from internal subnet.'
  },
  {
    id: 'aud_002',
    timestamp: '2026-10-23 12:15:00',
    actor: 'analyst',
    role: 'SOC Analyst',
    action: 'ALERT_ACKNOWLEDGED',
    target_resource: 'alt_004 (TCP Connection Rate Anomaly)',
    result: 'success',
    client_ip: '10.0.1.30',
    details: 'Status changed from OPEN to ACKNOWLEDGED.'
  },
  {
    id: 'aud_003',
    timestamp: '2026-10-23 12:12:00',
    actor: 'analyst',
    role: 'SOC Analyst',
    action: 'ALERT_ACKNOWLEDGED',
    target_resource: 'alt_003 (Critical PAM Configuration Hash Changed)',
    result: 'success',
    client_ip: '10.0.1.30',
    details: 'Investigation initiated on host server-01.'
  },
  {
    id: 'aud_004',
    timestamp: '2026-10-23 12:01:05',
    actor: 'system:detection_engine',
    role: 'System Worker',
    action: 'ALERT_GENERATED',
    target_resource: 'alt_001 (Repeated failed login attempts)',
    result: 'success',
    client_ip: '127.0.0.1',
    details: 'Automated alert created after 6 failed logins observed from 192.0.2.10 within 120s window.'
  },
  {
    id: 'aud_005',
    timestamp: '2026-10-23 11:45:00',
    actor: 'admin',
    role: 'Administrator',
    action: 'WATCHLIST_ENTRY_UPDATED',
    target_resource: 'wl_003 (192.0.2.10)',
    result: 'success',
    client_ip: '10.0.1.25',
    details: 'Watchlist label tagged for classroom demonstration test cases.'
  },
  {
    id: 'aud_006',
    timestamp: '2026-10-23 11:30:22',
    actor: 'admin',
    role: 'Administrator',
    action: 'USER_LOGIN',
    target_resource: 'auth_session',
    result: 'success',
    client_ip: '10.0.1.25',
    details: 'MFA authenticated session established.'
  }
];

export const mockDashboardSummary: DashboardSummary = {
  total_events: 8352,
  open_alerts: 3,
  high_severity_alerts: 2,
  failed_login_attempts: 6,
  workers_running: 5,
  workers_total: 6,
  api_health: 'healthy',
  uptime_seconds: 48920,
  events_trend: [
    { time: '11:30', events: 620, failures: 0, alerts: 0 },
    { time: '11:40', events: 740, failures: 1, alerts: 0 },
    { time: '11:50', events: 810, failures: 0, alerts: 0 },
    { time: '12:00', events: 1240, failures: 6, alerts: 1 },
    { time: '12:10', events: 1450, failures: 0, alerts: 3 },
    { time: '12:20', events: 980, failures: 0, alerts: 1 }
  ],
  severity_distribution: [
    { name: 'Critical', value: 1, color: '#FF3B5C' },
    { name: 'High', value: 2, color: '#FF5C38' },
    { name: 'Medium', value: 1, color: '#FFB020' },
    { name: 'Low', value: 1, color: '#38D996' }
  ],
  category_distribution: [
    { category: 'Authentication', count: 12 },
    { category: 'Watchlist Match', count: 4 },
    { category: 'File Integrity', count: 5 },
    { category: 'Network Rate', count: 3 },
    { category: 'DNS Anomaly', count: 1 }
  ],
  is_simulated: true
};

export const defaultDetectionConfig: DetectionThresholdConfig = {
  failed_login_threshold: 5,
  failed_login_window_seconds: 120,
  watchlist_matching_enabled: true,
  file_hash_polling_interval_seconds: 15,
  network_spike_threshold_connections: 50,
  log_level: 'INFO'
};
