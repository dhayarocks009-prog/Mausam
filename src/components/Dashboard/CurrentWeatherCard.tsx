'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { WeatherIcon } from '@/components/UI/WeatherIcon';
import {
  formatTemp,
  formatWind,
  formatPressure,
  getUVDescription,
} from '@/utils/weatherHelpers';
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Gauge,
  Eye,
  Sun,
  Star,
} from 'lucide-react';

export const CurrentWeatherCard: React.FC = () => {
  const { weather, location, preferences, favorites, addFavorite, removeFavorite } = useWeather();

  if (!weather) return null;

  const current = weather.current;
  const details = current.details;
  const uvInfo = getUVDescription(details.uvIndex);

  const isFavorited = favorites.some(
    (f) =>
      Math.abs(f.latitude - location.latitude) < 0.05 &&
      Math.abs(f.longitude - location.longitude) < 0.05
  );

  const toggleFavorite = () => {
    if (isFavorited) {
      const match = favorites.find(
        (f) =>
          Math.abs(f.latitude - location.latitude) < 0.05 &&
          Math.abs(f.longitude - location.longitude) < 0.05
      );
      if (match) removeFavorite(match.id);
    } else {
      addFavorite(location);
    }
  };

  return (
    <div className="glass-card hero-weather-card">
      <div className="hero-weather-bg-glow" />

      {/* Header Row */}
      <div className="hero-header-row">
        <div>
          <div className="hero-location-badge">
            <span>📍 {location.city}, {location.country}</span>
          </div>
          <h2 className="hero-condition-text">{current.condition}</h2>
          <p className="hero-description">{current.description}</p>
        </div>

        {/* Favorite Pin Button & Big Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <button
            onClick={toggleFavorite}
            className="header-icon-btn"
            style={{
              color: isFavorited ? '#f59e0b' : 'var(--text-muted)',
              background: isFavorited ? 'rgba(245, 158, 11, 0.15)' : undefined,
              borderColor: isFavorited ? 'rgba(245, 158, 11, 0.4)' : undefined,
            }}
            title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
            aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Star size={18} fill={isFavorited ? '#f59e0b' : 'none'} />
          </button>

          <div style={{ filter: 'drop-shadow(0 8px 24px rgba(0, 210, 255, 0.3))' }}>
            <WeatherIcon name={current.icon} size={68} />
          </div>
        </div>
      </div>

      {/* Primary Temperature Row */}
      <div className="hero-temp-row">
        <span className="hero-temp-large">
          {formatTemp(current.tempC, preferences.temperatureUnit)}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 8 }}>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Feels like {formatTemp(details.feelsLikeC, preferences.temperatureUnit)}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ↑ {formatTemp(details.maxTempC, preferences.temperatureUnit)} • ↓ {formatTemp(details.minTempC, preferences.temperatureUnit)}
          </span>
        </div>
      </div>

      {/* Weather Metrics Grid */}
      <div className="hero-stats-row">
        <div className="hero-stat-item">
          <span className="hero-stat-label">Humidity</span>
          <span className="hero-stat-val">
            <Droplets size={16} color="#38bdf8" />
            {details.humidity}%
          </span>
        </div>

        <div className="hero-stat-item">
          <span className="hero-stat-label">Wind</span>
          <span className="hero-stat-val">
            <Wind size={16} color="#38bdf8" />
            {formatWind(details.windSpeedKmh, preferences.windUnit)} {details.windDirectionCardinal}
          </span>
        </div>

        <div className="hero-stat-item">
          <span className="hero-stat-label">UV Index</span>
          <span className="hero-stat-val" style={{ color: uvInfo.color }}>
            <Sun size={16} color={uvInfo.color} />
            {details.uvIndex.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>({uvInfo.text})</span>
          </span>
        </div>

        <div className="hero-stat-item">
          <span className="hero-stat-label">Visibility</span>
          <span className="hero-stat-val">
            <Eye size={16} color="#94a3b8" />
            {details.visibilityKm} km
          </span>
        </div>

        <div className="hero-stat-item">
          <span className="hero-stat-label">Pressure</span>
          <span className="hero-stat-val">
            <Gauge size={16} color="#94a3b8" />
            {formatPressure(details.pressureHpa, preferences.pressureUnit)}
          </span>
        </div>

        <div className="hero-stat-item">
          <span className="hero-stat-label">Wind Gusts</span>
          <span className="hero-stat-val">
            <Compass size={16} color="#38bdf8" />
            {formatWind(details.windGustKmh, preferences.windUnit)}
          </span>
        </div>
      </div>
    </div>
  );
};
