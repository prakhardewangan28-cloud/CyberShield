import React from 'react';

interface SkeletonProps {
  height?: string | number;
  width?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = '20px',
  width = '100%',
  borderRadius = 'var(--radius-sm)',
  style,
  className = ''
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        height,
        width,
        borderRadius,
        ...style
      }}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 6
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '1rem' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="28px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '1rem' }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} height="36px" />
          ))}
        </div>
      ))}
    </div>
  );
};
