'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { Sunrise, Sunset, Sun } from 'lucide-react';

export const SunScheduleCard: React.FC = () => {
  const { weather } = useWeather();

  if (!weather) return null;

  const d = weather.current.details;

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return timeStr.includes('T') ? timeStr.split('T')[1].substring(0, 5) : timeStr;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sun size={18} color="#f59e0b" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Sun & Solar Schedule</h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Day Length: <strong style={{ color: 'var(--text-primary)' }}>{d.dayLength}</strong>
        </span>
      </div>

      {/* Daylight Progression Visual Curve */}
      <div className="sun-curve-container">
        <div className="sun-progress-track">
          <div
            className="sun-progress-bar"
            style={{ width: `${d.dayProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Sunrise & Sunset Row */}
      <div className="sun-times-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
            }}
          >
            <Sunrise size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sunrise</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{formatTime(d.sunrise)}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solar Noon</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {d.isDay ? `${d.dayProgressPercent}% elapsed` : 'Night time'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>Sunset</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, textAlign: 'right' }}>
              {formatTime(d.sunset)}
            </div>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <Sunset size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};
