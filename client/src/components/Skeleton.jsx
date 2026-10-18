import React from 'react';

export function Skeleton({ width = '100%', height = '18px', borderRadius = 'var(--radius-md)', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
        <Skeleton width="40%" height="20px" />
        <Skeleton width="60px" height="18px" borderRadius="var(--radius-full)" />
      </div>
      <Skeleton width="90%" height="15px" style={{ marginBottom: '8px' }} />
      <Skeleton width="75%" height="15px" style={{ marginBottom: '18px' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <Skeleton width="50px" height="20px" />
        <Skeleton width="60px" height="20px" />
      </div>
    </div>
  );
}

export default Skeleton;
