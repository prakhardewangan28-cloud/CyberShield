import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface EducationalCardProps {
  title: string;
  concept: string;
  description: string;
  pythonSnippet?: string;
  keyTakeaway: string;
}

export const EducationalCard: React.FC<EducationalCardProps> = ({
  title,
  concept,
  description,
  pythonSnippet,
  keyTakeaway
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <div className="edu-card">
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer' 
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="edu-header">
          <BookOpen size={18} />
          <span>Student Presentation Guide: {title}</span>
          <span className="badge badge-demo" style={{ fontSize: '0.65rem' }}>Concept: {concept}</span>
        </div>
        <button className="btn-icon" aria-label="Toggle explanation">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: '0.65rem' }} className="animate-fade-in">
          <p className="edu-content" style={{ marginBottom: '0.75rem' }}>
            {description}
          </p>

          {pythonSnippet && (
            <div 
              style={{
                backgroundColor: '#070b14',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: '#93c5fd',
                overflowX: 'auto',
                marginBottom: '0.75rem',
                lineHeight: 1.5
              }}
            >
              <pre style={{ margin: 0 }}>{pythonSnippet}</pre>
            </div>
          )}

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontSize: '0.78rem',
              color: '#d8b4fe',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(139, 92, 246, 0.25)'
            }}
          >
            <Sparkles size={14} style={{ minWidth: '14px' }} />
            <span><strong>Viva / Demo Talking Point:</strong> {keyTakeaway}</span>
          </div>
        </div>
      )}
    </div>
  );
};
