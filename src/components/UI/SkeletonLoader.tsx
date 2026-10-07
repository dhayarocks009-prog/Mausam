'use client';

import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Card Skeleton */}
      <div className="glass-card" style={{ padding: '28px', minHeight: '260px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton-shimmer" style={{ width: 140, height: 24, borderRadius: 20 }} />
            <div className="skeleton-shimmer" style={{ width: 220, height: 32 }} />
            <div className="skeleton-shimmer" style={{ width: 180, height: 16 }} />
          </div>
          <div className="skeleton-shimmer" style={{ width: 70, height: 70, borderRadius: '50%' }} />
        </div>

        <div className="skeleton-shimmer" style={{ width: 160, height: 72, margin: '20px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24 }}>
          <div className="skeleton-shimmer" style={{ height: 44 }} />
          <div className="skeleton-shimmer" style={{ height: 44 }} />
          <div className="skeleton-shimmer" style={{ height: 44 }} />
          <div className="skeleton-shimmer" style={{ height: 44 }} />
        </div>
      </div>

      {/* Rain Card Skeleton */}
      <div className="glass-card" style={{ padding: '20px', minHeight: '160px' }}>
        <div className="skeleton-shimmer" style={{ width: 180, height: 24, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: 100 }} />
          ))}
        </div>
      </div>

      {/* Hourly Card Skeleton */}
      <div className="glass-card" style={{ padding: '20px', minHeight: '140px' }}>
        <div className="skeleton-shimmer" style={{ width: 160, height: 20, marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer" style={{ width: 88, height: 100, flexShrink: 0 }} />
          ))}
        </div>
      </div>
    </div>
  );
};
