'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { useAuthEmergency } from '@/context/AuthEmergencyContext';
import {
  CloudSun,
  Home,
  Map as MapIcon,
  Star,
  AlertTriangle,
  Settings,
  Sun,
  Moon,
  Laptop,
  User,
  ShieldAlert,
  Users,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, preferences, updatePreferences, weather } = useWeather();
  const {
    user,
    isLoggedIn,
    activeUserCount,
    setIsLoginModalOpen,
    setIsContactEditModalOpen,
    emergencyContact,
  } = useAuthEmergency();

  const alertCount = weather?.alerts?.length || 0;

  const handleThemeCycle = () => {
    if (preferences.theme === 'dark') updatePreferences({ theme: 'light' });
    else if (preferences.theme === 'light') updatePreferences({ theme: 'system' });
    else updatePreferences({ theme: 'dark' });
  };

  const getThemeIcon = () => {
    if (preferences.theme === 'light') return <Sun size={18} />;
    if (preferences.theme === 'dark') return <Moon size={18} />;
    return <Laptop size={18} />;
  };

  return (
    <aside className="mausam-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <CloudSun size={24} />
        </div>
        <div>
          <h1 className="brand-title">Mausam</h1>
          <div className="brand-tag">Personal Weather</div>
        </div>
      </div>

      {/* User Account Card */}
      <div
        onClick={() => setIsLoginModalOpen(true)}
        style={{
          margin: '14px 0 6px 0',
          padding: '10px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          transition: 'all var(--transition-fast)',
        }}
        title="Click to view user account or switch profile"
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: isLoggedIn ? 'var(--grad-primary)' : 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          {isLoggedIn ? user?.name?.charAt(0).toUpperCase() : <User size={16} />}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {isLoggedIn ? user?.name : 'Guest User'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
            {isLoggedIn ? (user?.mobile || user?.email || 'Logged In') : 'Click to Sign In'}
          </div>
        </div>
      </div>

      {/* Live Active Online Users Metric */}
      <div
        style={{
          padding: '6px 12px',
          margin: '0 0 10px 0',
          background: 'rgba(0, 210, 255, 0.06)',
          border: '1px solid rgba(0, 210, 255, 0.18)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
        }}
      >
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Users size={12} color="var(--accent-cyan)" />
          Active Users:
        </span>
        <strong style={{ color: 'var(--accent-cyan)' }}>{activeUserCount} online</strong>
      </div>

      {/* Navigation List */}
      <ul className="sidebar-nav-list">
        <li>
          <button
            className={`sidebar-nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
        </li>
        <li>
          <button
            className={`sidebar-nav-item ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <MapIcon size={20} />
            <span>Weather Map</span>
          </button>
        </li>
        <li>
          <button
            className={`sidebar-nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Star size={20} />
            <span>Favorites</span>
          </button>
        </li>
        <li>
          <button
            className={`sidebar-nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
            style={{ position: 'relative' }}
          >
            <AlertTriangle size={20} color={alertCount > 0 ? '#ef4444' : undefined} />
            <span>Weather Alerts</span>
            {alertCount > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '999px',
                }}
              >
                {alertCount}
              </span>
            )}
          </button>
        </li>
        <li>
          <button
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </li>
      </ul>

      {/* Emergency Guardian Quick Card in Sidebar */}
      <div
        onClick={() => setIsContactEditModalOpen(true)}
        style={{
          marginTop: 14,
          padding: '10px 12px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
        }}
        title="Emergency Parent/Guardian Contact"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--alert-critical)', fontSize: '0.78rem', fontWeight: 700 }}>
          <ShieldAlert size={14} />
          <span>Guardian Alert</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginTop: 2, fontWeight: 600 }}>
          {emergencyContact ? emergencyContact.guardianName : 'Add Contact'}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {emergencyContact ? (emergencyContact.alertsEnabled ? 'Alerts Enabled ✓' : 'Alerts Paused') : 'Click to setup'}
        </div>
      </div>

      {/* Footer: Theme Toggle & Info */}
      <div className="sidebar-footer">
        <button
          className="sidebar-nav-item"
          onClick={handleThemeCycle}
          title={`Current theme: ${preferences.theme}. Click to switch.`}
        >
          {getThemeIcon()}
          <span style={{ textTransform: 'capitalize' }}>{preferences.theme} Theme</span>
        </button>

        <div style={{ padding: '4px 14px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Auto-updates every 30m • Open-Meteo
        </div>
      </div>
    </aside>
  );
};
