import React, { useState } from 'react';
import { 
  Activity, 
  Wifi, 
  Server, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Filter, 
  Clock, 
  Layers,
  ArrowUpRight,
  Database,
  Globe
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { mockNetworkConnections } from '../mock/mockData';
import { NetworkConnection } from '../types';
import { EducationalCard } from '../components/common/EducationalCard';
import { useApi } from '../context/ApiContext';

export const NetworkMonitoringPage: React.FC = () => {
  const { isDemoMode, lastSyncTime } = useApi();
  const [selectedNode, setSelectedNode] = useState<string | null>('node_auth');
  const [connections, setConnections] = useState<NetworkConnection[]>(mockNetworkConnections);
  const [filterProtocol, setFilterProtocol] = useState<string>('all');

  const filteredConnections = connections.filter(conn => {
    if (filterProtocol !== 'all' && conn.protocol !== filterProtocol) return false;
    return true;
  });

  const topologyNodes = [
    {
      id: 'node_ext_1',
      label: '192.0.2.10',
      role: 'External Source (Classroom Demo)',
      status: 'flagged',
      x: 120,
      y: 90,
      type: 'external',
      desc: 'Observed 6 failed SSH login attempts within 120s window'
    },
    {
      id: 'node_ext_2',
      label: '203.0.113.45',
      role: 'External Source (Watchlist)',
      status: 'flagged',
      x: 120,
      y: 200,
      type: 'external',
      desc: 'Active IP on Watchlist: Rapid port probes'
    },
    {
      id: 'node_ext_3',
      label: '198.51.100.88',
      role: 'External Source (QA Host)',
      status: 'normal',
      x: 120,
      y: 310,
      type: 'external',
      desc: 'Observed HTTP bursts, resolved as test traffic'
    },
    {
      id: 'node_firewall',
      label: 'Perimeter Gateway / FW',
      role: 'Edge Filter & Router',
      status: 'normal',
      x: 380,
      y: 200,
      type: 'gateway',
      desc: 'Ingests socket connection metadata across external interface'
    },
    {
      id: 'node_auth',
      label: 'Auth Server (10.0.0.4)',
      role: 'SSH / PAM Authentication',
      status: 'flagged',
      x: 640,
      y: 90,
      type: 'server',
      desc: 'Target of repeated failed logins from 192.0.2.10'
    },
    {
      id: 'node_web',
      label: 'App Server (10.0.0.10)',
      role: 'Web & API Gateway',
      status: 'normal',
      x: 640,
      y: 200,
      type: 'server',
      desc: 'Processes HTTPS requests on ports 80/443'
    },
    {
      id: 'node_db',
      label: 'Database Cluster (10.0.0.5)',
      role: 'Event & Alert Storage',
      status: 'normal',
      x: 640,
      y: 310,
      type: 'database',
      desc: 'Stores parsed security events and generated alerts'
    }
  ];

  const topologyLinks = [
    { from: 'node_ext_1', to: 'node_firewall', flagged: true },
    { from: 'node_ext_2', to: 'node_firewall', flagged: true },
    { from: 'node_ext_3', to: 'node_firewall', flagged: false },
    { from: 'node_firewall', to: 'node_auth', flagged: true },
    { from: 'node_firewall', to: 'node_web', flagged: false },
    { from: 'node_web', to: 'node_db', flagged: false },
  ];

  const selectedNodeInfo = topologyNodes.find(n => n.id === selectedNode);

  const trafficData = [
    { time: '12:00', connections: 42, volume_kb: 1200 },
    { time: '12:05', connections: 58, volume_kb: 1650 },
    { time: '12:10', connections: 125, volume_kb: 3400 },
    { time: '12:15', connections: 92, volume_kb: 2800 },
    { time: '12:20', connections: 64, volume_kb: 1900 },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Status Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1rem 1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Monitoring State</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--sev-low)' }}>
              <span className="pulse-indicator-green" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--sev-low)' }} />
              Active Connection Collector
            </div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(148,163,184,0.15)', paddingLeft: '1.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Last Collection</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
              {lastSyncTime}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(148,163,184,0.15)', paddingLeft: '1.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Monitored Protocols</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
              TCP &bull; UDP &bull; ICMP
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filter Protocol:</span>
          {(['all', 'TCP', 'UDP'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterProtocol(p)}
              className={`btn btn-sm ${filterProtocol === p ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.6rem' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Topology Graph Canvas */}
      <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Observed Network Topology & Activity Map</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Interactive topology showing observed source-to-destination connection relationships
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--sev-low)' }} /> Normal Traffic
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--sev-critical)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--sev-critical)' }} /> Flagged / Suspicious
            </span>
          </div>
        </div>

        {/* SVG Topology Visualization */}
        <div 
          style={{ 
            width: '100%', 
            height: '420px', 
            backgroundColor: '#070b14', 
            borderRadius: 'var(--radius-md)', 
            border: 'var(--border-subtle)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="scanline-overlay" />

          <svg width="100%" height="100%" viewBox="0 0 850 420" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="flaggedLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF3B5C" />
                <stop offset="100%" stopColor="#FFB020" />
              </linearGradient>
              <linearGradient id="normalLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#38D996" />
              </linearGradient>
            </defs>

            {/* Connection Links */}
            {topologyLinks.map((link, idx) => {
              const fromNode = topologyNodes.find(n => n.id === link.from)!;
              const toNode = topologyNodes.find(n => n.id === link.to)!;
              return (
                <g key={idx}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={link.flagged ? 'url(#flaggedLineGrad)' : 'url(#normalLineGrad)'}
                    strokeWidth={link.flagged ? 2.5 : 1.5}
                    opacity={0.65}
                    className="flowing-packet-line"
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {topologyNodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const isFlagged = node.status === 'flagged';
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode(node.id)}
                >
                  <circle
                    r={isSelected ? 26 : 22}
                    fill="#0d1424"
                    stroke={isFlagged ? '#FF3B5C' : '#00E5FF'}
                    strokeWidth={isSelected ? 3 : 1.8}
                    filter={isSelected ? 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.6))' : 'none'}
                  />
                  <circle
                    r={isSelected ? 10 : 8}
                    fill={isFlagged ? '#FF3B5C' : '#00E5FF'}
                    opacity={0.8}
                  />
                  <text
                    y={36}
                    textAnchor="middle"
                    fill="#EAF2FF"
                    fontSize="11"
                    fontFamily="var(--font-heading)"
                    fontWeight="600"
                  >
                    {node.label}
                  </text>
                  <text
                    y={48}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="9"
                  >
                    {node.role}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Node Detail Popup Overlay */}
          {selectedNodeInfo && (
            <div
              className="glass-panel-elevated"
              style={{
                position: 'absolute',
                bottom: '15px',
                right: '15px',
                width: '320px',
                padding: '1rem',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>{selectedNodeInfo.label}</span>
                <span className={`badge ${selectedNodeInfo.status === 'flagged' ? 'badge-sev-critical' : 'badge-sev-low'}`}>
                  {selectedNodeInfo.status}
                </span>
              </div>
              <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                {selectedNodeInfo.role}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                {selectedNodeInfo.desc}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lower Row: Traffic Over Time & Connection Metadata Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Connection Rate Graph */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', margin: 0, marginBottom: '0.25rem' }}>Connection Rate (Conns/min)</h3>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Metadata rate observed by NetworkMonitor worker
          </div>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101827',
                    border: '1px solid rgba(0, 229, 255, 0.2)',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                />
                <Area type="monotone" dataKey="connections" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Connection Metadata Table */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', margin: 0, marginBottom: '0.25rem' }}>Recent Observed Connections</h3>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Metadata extracted from authorized interface socket collectors
          </div>

          <div className="table-responsive">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Proto</th>
                  <th>Bytes</th>
                  <th>Flags</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredConnections.map((conn) => (
                  <tr key={conn.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {conn.timestamp.split(' ')[1]}
                    </td>
                    <td>
                      <code style={{ color: conn.source_ip.includes('192.0.2.10') ? 'var(--sev-medium)' : 'var(--text-main)' }}>
                        {conn.source_ip}:{conn.source_port}
                      </code>
                    </td>
                    <td>
                      <code style={{ color: 'var(--accent-cyan)' }}>
                        {conn.dest_ip}:{conn.dest_port}
                      </code>
                    </td>
                    <td><span className="badge badge-sev-info">{conn.protocol}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{conn.bytes_transferred.toLocaleString()} B</td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{conn.flags}</td>
                    <td>
                      <span className={`badge ${conn.status === 'flagged' ? 'badge-sev-critical' : 'badge-sev-low'}`}>
                        {conn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Educational Panel */}
      <EducationalCard
        title="Network Metadata Monitoring vs Deep Packet Inspection"
        concept="Connection Socket Collection"
        description="CyberShield monitors connection metadata (Source IP, Destination Port, Protocol, TCP flags, byte volume) rather than performing heavy deep-packet inspection (DPI). A dedicated Python worker thread continuously reads socket descriptors or interface counters and pushes metadata payloads into a synchronized Queue, allowing real-time rate anomaly checks without high CPU overhead."
        pythonSnippet={`# Example Network Monitor Worker Thread:
class NetworkMonitorWorker(threading.Thread):
    def run(self):
        while not self.shutdown_flag.is_set():
            conn_data = read_permitted_socket_metadata()
            self.event_queue.put({
                'event_type': 'connection_observed',
                'source': conn_data.src_ip,
                'dest': conn_data.dest_ip,
                'protocol': conn_data.proto
            })`}
        keyTakeaway="Clarify to examiners that CyberShield monitors connection metadata from authorized endpoints, rather than claiming unauthorized full packet capture."
      />
    </div>
  );
};
