'use client';

import React, { useState } from 'react';
import { useWeather } from '@/context/WeatherContext';
import {
  Settings as SettingsIcon,
  Thermometer,
  Wind,
  Gauge,
  CloudRain,
  Moon,
  Bell,
  Trash2,
  Check,
  Shield,
  Sparkles,
} from 'lucide-react';
import { TempUnit, WindUnit, PressureUnit, PrecipitationUnit, ThemeOption, HomepageFocus } from '@/types/weather';
import { CacheService } from '@/services/cacheService';
import { EmergencyContactCard } from '@/components/Emergency/EmergencyContactCard';

export const SettingsView: React.FC = () => {
  const { preferences, updatePreferences, clearCache } = useWeather();
  const [cacheClearedMessage, setCacheClearedMessage] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const handleClearCache = () => {
    clearCache();
    setCacheClearedMessage(true);
    setTimeout(() => setCacheClearedMessage(false), 2500);
  };

  const handleClearHistory = () => {
    CacheService.clearSearchHistory();
    setCacheClearedMessage(true);
    setTimeout(() => setCacheClearedMessage(false), 2500);
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationStatus('Browser notifications are not supported on this device.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('Mausam Weather Alert', {
          body: 'Personalized weather notifications enabled for Mausam!',
          icon: '/favicon.ico',
        });
        setNotificationStatus('Notifications enabled! Sent test alert.');
      } else {
        setNotificationStatus('Notification permission was denied.');
      }
    } catch {
      setNotificationStatus('Could not request notification permission.');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '24px' }}>
        <SettingsIcon size={24} color="var(--accent-cyan)" />
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Settings & Preferences</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Configure measurement units, appearance, personalization focus, and cache
          </p>
        </div>
      </div>

      {/* --- Section 1: Weather Units --- */}
      <h3 className="settings-section-title">Measurement Units</h3>

      {/* Temperature */}
      <div className="settings-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Thermometer size={18} color="#f97316" />
          <span>Temperature Unit</span>
        </div>
        <div className="segmented-control">
          <button
            className={`segmented-btn ${preferences.temperatureUnit === 'celsius' ? 'active' : ''}`}
            onClick={() => updatePreferences({ temperatureUnit: 'celsius' })}
          >
            Celsius (°C)
          </button>
          <button
            className={`segmented-btn ${preferences.temperatureUnit === 'fahrenheit' ? 'active' : ''}`}
            onClick={() => updatePreferences({ temperatureUnit: 'fahrenheit' })}
          >
            Fahrenheit (°F)
          </button>
        </div>
      </div>

      {/* Wind */}
      <div className="settings-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Wind size={18} color="#38bdf8" />
          <span>Wind Speed Unit</span>
        </div>
        <div className="segmented-control">
          <button
            className={`segmented-btn ${preferences.windUnit === 'kmh' ? 'active' : ''}`}
            onClick={() => updatePreferences({ windUnit: 'kmh' })}
          >
            km/h
          </button>
          <button
            className={`segmented-btn ${preferences.windUnit === 'mph' ? 'active' : ''}`}
            onClick={() => updatePreferences({ windUnit: 'mph' })}
          >
            mph
          </button>
          <button
            className={`segmented-btn ${preferences.windUnit === 'ms' ? 'active' : ''}`}
            onClick={() => updatePreferences({ windUnit: 'ms' })}
          >
            m/s
          </button>
        </div>
      </div>

      {/* Atmospheric Pressure */}
      <div className="settings-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Gauge size={18} color="#94a3b8" />
          <span>Pressure Unit</span>
        </div>
        <div className="segmented-control">
          <button
            className={`segmented-btn ${preferences.pressureUnit === 'hpa' ? 'active' : ''}`}
            onClick={() => updatePreferences({ pressureUnit: 'hpa' })}
          >
            hPa (mb)
          </button>
          <button
            className={`segmented-btn ${preferences.pressureUnit === 'inhg' ? 'active' : ''}`}
            onClick={() => updatePreferences({ pressureUnit: 'inhg' })}
          >
            inHg
          </button>
        </div>
      </div>

      {/* Precipitation */}
      <div className="settings-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CloudRain size={18} color="#38bdf8" />
          <span>Precipitation Unit</span>
        </div>
        <div className="segmented-control">
          <button
            className={`segmented-btn ${preferences.precipitationUnit === 'mm' ? 'active' : ''}`}
            onClick={() => updatePreferences({ precipitationUnit: 'mm' })}
          >
            Millimeters (mm)
          </button>
          <button
            className={`segmented-btn ${preferences.precipitationUnit === 'inch' ? 'active' : ''}`}
            onClick={() => updatePreferences({ precipitationUnit: 'inch' })}
          >
            Inches (in)
          </button>
        </div>
      </div>

      {/* --- Section 2: Appearance --- */}
      <h3 className="settings-section-title">Appearance & Theme</h3>
      <div className="settings-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Moon size={18} color="var(--accent-indigo)" />
          <span>Application Theme</span>
        </div>
        <div className="segmented-control">
          {(['light', 'dark', 'system'] as ThemeOption[]).map((t) => (
            <button
              key={t}
              className={`segmented-btn ${preferences.theme === t ? 'active' : ''}`}
              onClick={() => updatePreferences({ theme: t })}
              style={{ textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* --- Section 3: Dynamic Personalization Focus --- */}
      <h3 className="settings-section-title">Dynamic Personalization Focus</h3>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
        Choose your primary dashboard priority. The homepage automatically adapts its card hierarchy.
      </div>
      <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%' }}>
          {[
            { id: 'balanced', label: '✨ Balanced Overview', desc: 'Default intelligent balance' },
            { id: 'rain', label: '🌧️ Rain Watcher', desc: 'Puts rain radar & timing top' },
            { id: 'temperature', label: '🌡️ Temperature & Hourly', desc: 'Focuses on 24-hr hourly temps' },
            { id: 'outdoor', label: '🏃 Outdoor & UV', desc: 'Highlights UV, wind, and outdoor scores' },
            { id: 'alerts', label: '⚠️ Severe Alerts First', desc: 'Pinpoint critical weather alerts' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => updatePreferences({ homepageFocus: item.id as HomepageFocus })}
              className="preset-pill"
              style={{
                padding: '8px 14px',
                fontSize: '0.85rem',
                background: preferences.homepageFocus === item.id ? 'var(--accent-cyan)' : undefined,
                color: preferences.homepageFocus === item.id ? '#050b17' : undefined,
                fontWeight: preferences.homepageFocus === item.id ? 700 : 500,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto Refresh 30 Min Toggle */}
      <div className="settings-row">
        <div>
          <div style={{ fontWeight: 600 }}>Automatic 30-Minute Updates</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Automatically fetch fresh data every 30 minutes while conserving data & battery
          </div>
        </div>
        <input
          type="checkbox"
          checked={preferences.autoRefresh30Min}
          onChange={(e) => updatePreferences({ autoRefresh30Min: e.target.checked })}
          style={{ width: 20, height: 20, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
        />
      </div>

      {/* --- Section 4: Notifications --- */}
      <h3 className="settings-section-title">Notification Alerts</h3>

      <div className="settings-row">
        <div>
          <div style={{ fontWeight: 600 }}>Severe Weather Alerts</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Thunderstorms, cyclones, gale winds, and extreme heat
          </div>
        </div>
        <input
          type="checkbox"
          checked={preferences.notifications.weatherAlerts}
          onChange={(e) =>
            updatePreferences({
              notifications: { ...preferences.notifications, weatherAlerts: e.target.checked },
            })
          }
          style={{ width: 20, height: 20, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
        />
      </div>

      <div className="settings-row">
        <div>
          <div style={{ fontWeight: 600 }}>Rain & Precipitation Alerts</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Notify when rain is forecasted within 60 minutes
          </div>
        </div>
        <input
          type="checkbox"
          checked={preferences.notifications.rainAlerts}
          onChange={(e) =>
            updatePreferences({
              notifications: { ...preferences.notifications, rainAlerts: e.target.checked },
            })
          }
          style={{ width: 20, height: 20, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <button
          onClick={requestNotificationPermission}
          className="layer-chip-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Bell size={16} />
          <span>Test / Enable System Push Notifications</span>
        </button>
        {notificationStatus && (
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: 6 }}>
            {notificationStatus}
          </div>
        )}
      </div>

      {/* --- Section 5: Cache & Storage --- */}
      <h3 className="settings-section-title">Cache & Privacy</h3>

      <div className="settings-row">
        <div>
          <div style={{ fontWeight: 600 }}>Weather Data Cache</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Clear local 30-minute offline snapshot and force fresh retrieval
          </div>
        </div>
        <button
          onClick={handleClearCache}
          className="header-icon-btn"
          style={{ width: 'auto', padding: '0 14px', fontSize: '0.8rem', gap: 6 }}
        >
          <Trash2 size={14} />
          <span>Clear Cache</span>
        </button>
      </div>

      <div className="settings-row">
        <div>
          <div style={{ fontWeight: 600 }}>Search History</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Remove recent search queries and location history
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          className="header-icon-btn"
          style={{ width: 'auto', padding: '0 14px', fontSize: '0.8rem', gap: 6 }}
        >
          <Trash2 size={14} />
          <span>Clear History</span>
        </button>
      </div>

      {cacheClearedMessage && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 16px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-sm)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.85rem',
          }}
        >
          <Check size={16} />
          <span>Cache successfully cleared! Fresh data will load.</span>
        </div>
      )}

      {/* --- Section 6: Emergency Contact --- */}
      <h3 className="settings-section-title" style={{ marginTop: 28 }}>
        🛡️ Parent / Guardian Emergency Contact
      </h3>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
        Configure your parent or guardian's contact details for automatic severe weather emergency alerts.
      </div>
      <EmergencyContactCard />
    </div>
  );
};
