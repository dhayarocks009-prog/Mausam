'use client';

import React, { useState } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { useAuthEmergency } from '@/context/AuthEmergencyContext';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, X, Send } from 'lucide-react';
import { SeverityLevel } from '@/types/weather';

export const WeatherAlerts: React.FC = () => {
  const { weather, recordSectionInteraction } = useWeather();
  const { triggerEmergencyModalForAlert } = useAuthEmergency();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  if (!weather || !weather.alerts || weather.alerts.length === 0) {
    return null;
  }

  const activeAlerts = weather.alerts.filter((a) => !dismissedIds.includes(a.id));
  if (activeAlerts.length === 0) return null;

  const getAlertIcon = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return <ShieldAlert size={22} className="pulse-glow" />;
      case 'warning':
        return <AlertTriangle size={22} />;
      case 'advisory':
        return <AlertCircle size={22} />;
      case 'info':
        return <Info size={22} />;
    }
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, id]);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      onClick={() => recordSectionInteraction('alerts')}
    >
      {activeAlerts.map((alert) => (
        <div key={alert.id} className={`alert-banner ${alert.severity}`}>
          <div className="alert-header">
            <div className="alert-title-wrap">
              {getAlertIcon(alert.severity)}
              <span>WEATHER ALERT: {alert.title.toUpperCase()}</span>
            </div>

            <button
              onClick={(e) => handleDismiss(alert.id, e)}
              style={{
                color: 'inherit',
                opacity: 0.7,
                padding: 4,
                borderRadius: '50%',
              }}
              title="Dismiss alert"
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
          </div>

          <p className="alert-desc">{alert.description}</p>

          {alert.instruction && (
            <div className="alert-instruction">
              💡 {alert.instruction}
            </div>
          )}

          {/* Alert Footer with Alert Parent/Guardian Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 6,
              paddingTop: 8,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {alert.startTime && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Timing: {alert.startTime} {alert.endTime ? `– ${alert.endTime}` : ''} • Source: {alert.source || 'Mausam Service'}
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerEmergencyModalForAlert(alert);
              }}
              className="layer-chip-btn active"
              style={{
                background: alert.severity === 'critical' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #f97316, #ea580c)',
                borderColor: alert.severity === 'critical' ? '#ef4444' : '#f97316',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              }}
              title="Send automated emergency SMS alert to your registered guardian"
            >
              <Send size={13} />
              <span>Alert Parent / Guardian</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
