'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, ShieldCheck, PhoneCall } from 'lucide-react';
import { WeatherAlerts } from '@/components/Dashboard/WeatherAlerts';

export const AlertsView: React.FC = () => {
  const { weather, location } = useWeather();
  const alerts = weather?.alerts || [];

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '20px' }}>
        <ShieldAlert size={24} color={alerts.length > 0 ? '#ef4444' : 'var(--accent-cyan)'} />
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Severe Weather & Alert Center</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Active bulletins, watches, warnings, and safety guidelines for {location.city}
          </p>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 ? (
        <div style={{ marginBottom: 28 }}>
          <WeatherAlerts />
        </div>
      ) : (
        <div
          style={{
            padding: '28px 20px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <ShieldCheck size={32} color="#10b981" />
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981' }}>
              All Clear in {location.city}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              No critical severe weather warnings or immediate hazards detected at this time.
            </div>
          </div>
        </div>
      )}

      {/* Alert Severity Guide */}
      <h3 className="settings-section-title">Alert Classification Levels</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="alert-banner critical" style={{ margin: 0 }}>
          <div className="alert-title-wrap">
            <ShieldAlert size={18} />
            <span>Critical (Red)</span>
          </div>
          <p className="alert-desc" style={{ fontSize: '0.8rem' }}>
            Life-threatening conditions such as extreme cyclone, flash floods, violent thunderstorm or tornado. Immediate shelter required.
          </p>
        </div>

        <div className="alert-banner warning" style={{ margin: 0 }}>
          <div className="alert-title-wrap">
            <AlertTriangle size={18} />
            <span>Warning (Orange)</span>
          </div>
          <p className="alert-desc" style={{ fontSize: '0.8rem' }}>
            Dangerous weather imminent: heavy downpours, extreme heat waves, localized waterlogging. Be prepared and avoid outdoor hazards.
          </p>
        </div>

        <div className="alert-banner advisory" style={{ margin: 0 }}>
          <div className="alert-title-wrap">
            <AlertCircle size={18} />
            <span>Advisory (Yellow)</span>
          </div>
          <p className="alert-desc" style={{ fontSize: '0.8rem' }}>
            High wind gusts, elevated UV radiation, dense fog, or sudden temperature drops that require caution during travel.
          </p>
        </div>

        <div className="alert-banner info" style={{ margin: 0 }}>
          <div className="alert-title-wrap">
            <Info size={18} />
            <span>Information (Blue)</span>
          </div>
          <p className="alert-desc" style={{ fontSize: '0.8rem' }}>
            General meteorological bulletins, changing air pressure trends, and seasonal atmospheric updates.
          </p>
        </div>
      </div>

      {/* Emergency Helpline Box */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <PhoneCall size={20} color="var(--accent-cyan)" />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Emergency Helpline & Assistance</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              National Disaster Management & Emergency Services: <strong>112</strong> / <strong>1070</strong>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Updated every 30 mins
        </div>
      </div>
    </div>
  );
};
