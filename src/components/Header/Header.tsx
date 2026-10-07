'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { useAuthEmergency } from '@/context/AuthEmergencyContext';
import { MapPin, Navigation, RefreshCw, Search, WifiOff, Clock, User, Users } from 'lucide-react';
import { formatTimeAgo } from '@/utils/weatherHelpers';

export const Header: React.FC = () => {
  const {
    location,
    weather,
    isRefreshing,
    isOffline,
    timeUntilNextUpdate,
    refreshCurrentWeather,
    detectUserLocation,
    setIsSearchOpen,
  } = useWeather();

  const {
    user,
    isLoggedIn,
    activeUserCount,
    setIsLoginModalOpen,
  } = useAuthEmergency();

  const formattedTime = weather
    ? new Date(weather.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <>
      {isOffline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>Offline – Showing last available weather data</span>
        </div>
      )}

      <header className="mausam-header">
        {/* Location Selector */}
        <div className="header-location-box" onClick={() => setIsSearchOpen(true)} title="Search and switch location">
          <div className="header-location-icon">
            <MapPin size={22} />
          </div>
          <div>
            <div className="header-city-title">
              <span>{location.city}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>▾</span>
            </div>
            <div className="header-region-subtitle">
              {location.state ? `${location.state}, ` : ''}{location.country}
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="header-actions">
          {/* Active Online Users Badge */}
          <div
            className="header-update-badge"
            title={`${activeUserCount} active weather watchers connected now`}
            style={{ display: 'flex', background: 'rgba(0, 210, 255, 0.08)', borderColor: 'rgba(0, 210, 255, 0.25)' }}
          >
            <Users size={13} color="var(--accent-cyan)" />
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{activeUserCount} Active</span>
          </div>

          {/* 30-Min Update Badge */}
          {weather && (
            <div className="header-update-badge" title={`Last updated at ${formattedTime}`}>
              <Clock size={13} />
              <span>{formatTimeAgo(weather.lastUpdated)}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: 'var(--accent-cyan)' }}>Next: {timeUntilNextUpdate}</span>
            </div>
          )}

          {/* User Profile / Login Button */}
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="header-icon-btn"
            style={{
              width: 'auto',
              padding: '0 12px',
              gap: 6,
              background: isLoggedIn ? 'rgba(0, 210, 255, 0.12)' : undefined,
              borderColor: isLoggedIn ? 'rgba(0, 210, 255, 0.3)' : undefined,
            }}
            title={isLoggedIn ? `Signed in as ${user?.name}` : 'Sign In'}
            aria-label="User Account"
          >
            <User size={16} color={isLoggedIn ? 'var(--accent-cyan)' : 'inherit'} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isLoggedIn ? user?.name : 'Sign In'}
            </span>
          </button>

          {/* GPS Location Button */}
          <button
            className="header-icon-btn"
            onClick={detectUserLocation}
            title="Use current GPS location"
            aria-label="Use current GPS location"
          >
            <Navigation size={18} />
          </button>

          {/* Manual Refresh Button */}
          <button
            className={`header-icon-btn ${isRefreshing ? 'active-glow' : ''}`}
            onClick={refreshCurrentWeather}
            disabled={isRefreshing}
            title="Refresh weather data"
            aria-label="Refresh weather data"
          >
            <RefreshCw size={18} className={isRefreshing ? 'spin-anim' : ''} />
          </button>

          {/* Search Trigger */}
          <button
            className="header-icon-btn"
            onClick={() => setIsSearchOpen(true)}
            title="Search city"
            aria-label="Search city"
          >
            <Search size={18} />
          </button>
        </div>
      </header>
    </>
  );
};
