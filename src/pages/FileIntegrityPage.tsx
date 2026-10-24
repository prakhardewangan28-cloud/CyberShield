import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  FileCode, 
  FilePlus, 
  FileDiff, 
  FileX, 
  FolderLock, 
  ShieldAlert, 
  Hash, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { filesApi, FimSummary } from '../api/files.api';
import { FileIntegrityEntry } from '../types';
import { useApi } from '../context/ApiContext';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { EducationalCard } from '../components/common/EducationalCard';

export const FileIntegrityPage: React.FC = () => {
  const { isDemoMode, refreshTrigger } = useApi();
  const [files, setFiles] = useState<FileIntegrityEntry[]>([]);
  const [summary, setSummary] = useState<FimSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<FileIntegrityEntry | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      filesApi.getFiles(isDemoMode),
      filesApi.getFimSummary(isDemoMode)
    ])
      .then(([filesRes, summaryRes]) => {
        if (isMounted) {
          setFiles(filesRes);
          setSummary(summaryRes);
          if (filesRes.length > 0) setSelectedFile(filesRes[0]);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load FIM data:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, refreshTrigger]);

  const getStatusBadge = (status: FileIntegrityEntry['status']) => {
    switch (status) {
      case 'modified':
        return (
          <span className="badge badge-sev-high" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <FileDiff size={12} /> Modified
          </span>
        );
      case 'created':
        return (
          <span className="badge badge-sev-critical" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <FilePlus size={12} /> Created
          </span>
        );
      case 'deleted':
        return (
          <span className="badge badge-sev-critical" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <FileX size={12} /> Deleted
          </span>
        );
      case 'unchanged':
      default:
        return (
          <span className="badge badge-sev-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={12} /> Intact
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner Notice */}
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
            <FileCheck2 size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
              Host File Integrity Monitoring (FIM)
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Monitored on the host by Python backend worker threads via cryptographic SHA-256 baseline hashing.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-status-running">
            Worker: Active (Polling every 15s)
          </span>
          <span className="badge badge-demo">Algorithm: SHA-256</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Tracked Sensitive Files</span>
            <div className="metric-icon-box">
              <FolderLock size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-cyan)' }}>
            {summary?.total_files_tracked || 5}
          </div>
          <div className="metric-footer">
            <span>Critical PAM & Auth Configuration</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Hash Mismatches</span>
            <div className="metric-icon-box" style={{ background: 'rgba(255, 92, 56, 0.1)', color: 'var(--sev-high)' }}>
              <FileDiff size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--sev-high)' }}>
            {summary?.hash_mismatches_detected || 1}
          </div>
          <div className="metric-footer">
            <span style={{ color: 'var(--sev-high)' }}>/etc/security/pam_auth.conf</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Unauthorized Files Created</span>
            <div className="metric-icon-box" style={{ background: 'rgba(255, 59, 92, 0.1)', color: 'var(--sev-critical)' }}>
              <FilePlus size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--sev-critical)' }}>
            {summary?.new_files_created || 1}
          </div>
          <div className="metric-footer">
            <span style={{ color: 'var(--sev-critical)' }}>/etc/sudoers.d/99-wheel</span>
          </div>
        </div>
      </div>

      {/* Main Files Table & Hash Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }}>
        {/* Monitored Files Table */}
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: 'var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Monitored Files & Integrity Baseline</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click row to compare SHA-256 hashes</span>
          </div>

          {loading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : (
            <div className="table-responsive">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>File Path</th>
                    <th>Directory</th>
                    <th>Status</th>
                    <th>Last Checked</th>
                    <th>Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => {
                    const isSelected = selectedFile?.id === file.id;
                    return (
                      <tr 
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(0, 229, 255, 0.08)' : undefined
                        }}
                      >
                        <td>
                          <code style={{ fontSize: '0.82rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-main)' }}>
                            {file.file_path}
                          </code>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {(file.file_size_bytes / 1024).toFixed(1)} KB
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{file.directory}</td>
                        <td>{getStatusBadge(file.status)}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {file.last_checked.split(' ')[1]}
                        </td>
                        <td>
                          {file.alert_triggered ? (
                            <span className="badge badge-sev-critical">Triggered</span>
                          ) : (
                            <span className="badge badge-sev-low">Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected File SHA-256 Comparison Inspector */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0, marginBottom: '0.25rem' }}>Cryptographic Hash Verification</h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            SHA-256 baseline vs current disk hash
          </div>

          {selectedFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>File Path</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#fff', fontWeight: 600, marginTop: '0.2rem' }}>
                  {selectedFile.file_path}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Baseline Hash (Pre-Recorded)</div>
                <div 
                  style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.74rem', 
                    color: '#93c5fd', 
                    backgroundColor: '#070b14', 
                    padding: '0.5rem', 
                    borderRadius: 'var(--radius-sm)', 
                    wordBreak: 'break-all',
                    marginTop: '0.25rem',
                    border: 'var(--border-subtle)'
                  }}
                >
                  {selectedFile.baseline_hash}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Computed Hash</div>
                <div 
                  style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.74rem', 
                    color: selectedFile.status === 'unchanged' ? '#38D996' : '#FF3B5C', 
                    backgroundColor: '#070b14', 
                    padding: '0.5rem', 
                    borderRadius: 'var(--radius-sm)', 
                    wordBreak: 'break-all',
                    marginTop: '0.25rem',
                    border: selectedFile.status === 'unchanged' ? '1px solid rgba(56,217,150,0.3)' : '1px solid rgba(255,59,92,0.4)'
                  }}
                >
                  {selectedFile.current_hash}
                </div>
              </div>

              <div style={{ backgroundColor: selectedFile.status === 'unchanged' ? 'rgba(56,217,150,0.1)' : 'rgba(255,59,92,0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(148,163,184,0.1)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: selectedFile.status === 'unchanged' ? 'var(--sev-low)' : 'var(--sev-critical)' }}>
                  {selectedFile.status === 'unchanged' ? 'Integrity Verified: Match' : 'Integrity Mismatch Detected!'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {selectedFile.status === 'unchanged' 
                    ? 'Cryptographic digest identical to established baseline.' 
                    : 'The file was modified on disk without an approved change record. A high-severity alert was dispatched to the SOC.'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Select a file to inspect hash comparison.</div>
          )}
        </div>
      </div>

      {/* Educational Card */}
      <EducationalCard
        title="File Integrity Monitoring (FIM) in Python"
        concept="hashlib.sha256() & Host Baselines"
        description="FIM operates via a dedicated background Python thread. It periodically reads target files in chunks (e.g. 64KB blocks) using hashlib.sha256() to compute digital fingerprints. If the resulting hash differs from the stored baseline, a file_modified event is queued. Browser frontends cannot access local host files directly; all file monitoring is conducted by the Python backend."
        pythonSnippet={`# File Integrity Worker Snippet:
import hashlib

def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()`}
        keyTakeaway="Emphasize that the browser does not read system files—the Python backend monitors authorized directories and delivers JSON hash summaries through REST APIs."
      />
    </div>
  );
};
