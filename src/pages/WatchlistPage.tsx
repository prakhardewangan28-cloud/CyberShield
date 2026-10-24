import React, { useState, useEffect } from 'react';
import { 
  ListFilter, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye, 
  X, 
  ShieldAlert, 
  Layers,
  Database
} from 'lucide-react';
import { watchlistApi } from '../api/watchlist.api';
import { auditApi } from '../api/audit.api';
import { WatchlistEntry } from '../types';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { EducationalCard } from '../components/common/EducationalCard';

export const WatchlistPage: React.FC = () => {
  const { isDemoMode, refreshTrigger, triggerRefresh } = useApi();
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newIp, setNewIp] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'monitored'>('active');

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<WatchlistEntry | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await watchlistApi.getWatchlist(isDemoMode);
      setWatchlist(data);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDemoMode, refreshTrigger]);

  const filteredWatchlist = watchlist.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.ip_address.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate IP format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
    if (!ipRegex.test(newIp.trim())) {
      addToast('error', 'Invalid IP Address', 'Please provide a valid IPv4 or CIDR address.');
      return;
    }

    if (!newReason.trim() || !newDesc.trim()) {
      addToast('warning', 'Missing Fields', 'Please supply a description and reason for inclusion.');
      return;
    }

    try {
      await watchlistApi.addEntry({
        ip_address: newIp.trim(),
        description: newDesc.trim(),
        reason: newReason.trim(),
        status: newStatus
      }, isDemoMode);

      auditApi.logAction({
        actor: user?.username || 'admin',
        role: user?.role || 'Administrator',
        action: 'WATCHLIST_ENTRY_ADDED',
        target_resource: `IP: ${newIp.trim()}`,
        result: 'success',
        client_ip: '127.0.0.1',
        details: `Reason: ${newReason.trim()}`
      });

      addToast('success', 'Watchlist Updated', `Indicator ${newIp.trim()} added.`);
      setIsAddModalOpen(false);
      setNewIp('');
      setNewDesc('');
      setNewReason('');
      triggerRefresh();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      addToast('error', 'Operation Failed', errorObj.message || 'Could not add entry.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmTarget) return;

    try {
      await watchlistApi.deleteEntry(deleteConfirmTarget.id, isDemoMode);
      auditApi.logAction({
        actor: user?.username || 'admin',
        role: user?.role || 'Administrator',
        action: 'WATCHLIST_ENTRY_DELETED',
        target_resource: `IP: ${deleteConfirmTarget.ip_address}`,
        result: 'success',
        client_ip: '127.0.0.1',
        details: `Removed indicator ${deleteConfirmTarget.ip_address} from active watchlist.`
      });

      addToast('success', 'Watchlist Entry Removed', `${deleteConfirmTarget.ip_address} removed.`);
      setDeleteConfirmTarget(null);
      triggerRefresh();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      addToast('error', 'Deletion Failed', errorObj.message || 'Could not remove entry.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Informative Header */}
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
            <ListFilter size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
              IP Watchlist & Threat Indicators
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Note: An IP watchlist match indicates activity requiring investigation, not an automatic proof of malicious attack.
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={15} />
          <span>Add IP Indicator</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div className="search-box">
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search IP, description, advisory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Evaluating)</option>
            <option value="monitored">Monitored (Classroom Demo)</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <TableSkeleton rows={4} columns={6} />
        ) : filteredWatchlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <ListFilter size={36} style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontWeight: 600, color: '#fff' }}>No Watchlist Indicators Found</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>IP Address / Prefix</th>
                  <th>Description</th>
                  <th>Reason for Inclusion</th>
                  <th>Created At</th>
                  <th>Matches Observed</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWatchlist.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <code style={{ fontSize: '0.85rem', color: item.ip_address.includes('192.0.2.10') ? 'var(--sev-medium)' : 'var(--accent-cyan)' }}>
                        {item.ip_address}
                      </code>
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.description}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '300px' }}>
                      {item.reason}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {item.created_at}
                    </td>
                    <td>
                      <span className="badge badge-sev-info">
                        {item.match_count} match(es)
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`badge ${item.status === 'active' ? 'badge-sev-critical' : item.status === 'monitored' ? 'badge-sev-medium' : 'badge-status-stopped'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setDeleteConfirmTarget(item)}
                        className="btn-icon"
                        style={{ color: 'var(--sev-critical)' }}
                        title="Remove Indicator"
                        aria-label="Remove indicator"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="modal-content"
            style={{ maxWidth: '520px', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Add IP Watchlist Indicator</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  IP Address or CIDR Range
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 198.51.100.45 or 10.0.0.0/24"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Indicator Description
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Automated scanning script or external brute force bot"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Reason for Inclusion (Forensic Evidence / Advisory)
                </label>
                <textarea
                  className="textarea-field"
                  rows={2}
                  placeholder="e.g. Flagged during pen-test exercise or documented threat feed match."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Status
                </label>
                <select
                  className="select-field"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                >
                  <option value="active">Active (Evaluating incoming streams)</option>
                  <option value="monitored">Monitored (Passive tracking)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Indicator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmTarget(null)}>
          <div 
            className="modal-content"
            style={{ maxWidth: '450px', padding: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.5rem' }}>
              Confirm Watchlist Removal
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Are you sure you want to remove <code>{deleteConfirmTarget.ip_address}</code> from the watchlist? Future connection events from this IP will not trigger watchlist match alerts.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setDeleteConfirmTarget(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-danger">
                Remove IP Indicator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Educational Card */}
      <EducationalCard
        title="Watchlist Matching via In-Memory Trie / Hash Sets"
        concept="O(1) Indicator Matching in Python"
        description="The IP Watchlist Matcher thread caches active indicator IPs in an in-memory set or prefix Trie. When incoming events pass through the pipeline, source and destination IPs are looked up in O(1) time. When a match is found, the worker tags the event as watchlist_match and enqueues it for the detection engine to generate an alert."
        pythonSnippet={`# In-Memory Watchlist Evaluation:
active_watchlist_ips = set(["198.51.100.22", "203.0.113.45", "192.0.2.10"])

def check_ip_watchlist(event):
    if event.get("source") in active_watchlist_ips:
        event["processing_status"] = "flagged"
        event["matched_rule"] = "rule_ip_watchlist_match_v2"`}
        keyTakeaway="Explain to professors that IP watchlist checks run in memory for microsecond latency rather than querying the SQL database for every single network packet."
      />
    </div>
  );
};
