'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { Home, Map as MapIcon, Star, AlertTriangle, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, weather } = useWeather();
  const alertCount = weather?.alerts?.length || 0;

  return (
    <nav className="mausam-bottom-nav">
      <button
        className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
        aria-label="Home"
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'map' ? 'active' : ''}`}
        onClick={() => setActiveTab('map')}
        aria-label="Weather Map"
      >
        <MapIcon size={20} />
        <span>Map</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
        onClick={() => setActiveTab('favorites')}
        aria-label="Favorites"
      >
        <Star size={20} />
        <span>Favorites</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
        onClick={() => setActiveTab('alerts')}
        aria-label="Alerts"
        style={{ position: 'relative' }}
      >
        <AlertTriangle size={20} color={alertCount > 0 ? '#ef4444' : undefined} />
        <span>Alerts</span>
        {alertCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '16px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
            }}
          />
        )}
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveTab('settings')}
        aria-label="Settings"
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </nav>
  );
};
