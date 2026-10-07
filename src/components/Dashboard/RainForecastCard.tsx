'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { CloudRain, Droplets, Info } from 'lucide-react';
import { WeatherIcon } from '@/components/UI/WeatherIcon';
import { formatPrecipitation } from '@/utils/weatherHelpers';

export const RainForecastCard: React.FC = () => {
  const { weather, preferences, recordSectionInteraction } = useWeather();

  if (!weather) return null;

  const rain = weather.rainForecast;

  return (
    <div
      className="glass-card rain-forecast-card"
      onClick={() => recordSectionInteraction('rain')}
      style={{ cursor: 'pointer' }}
    >
      {/* Header */}
      <div className="rain-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <CloudRain size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Rain Forecast</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Chance: {rain.probability}% • Expected: {formatPrecipitation(rain.expectedRainfallMm, preferences.precipitationUnit)}
            </span>
          </div>
        </div>

        <div className="rain-timing-badge">
          <span>{rain.probability > 30 ? 'Rain Likely' : 'Dry Conditions'}</span>
        </div>
      </div>

      {/* Timing description note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}
      >
        <Droplets size={16} color="#38bdf8" />
        <span>{rain.rainTiming}</span>
      </div>

      {/* Hourly Rainfall Histogram */}
      <div className="rain-hourly-grid">
        {rain.hourly.map((item, idx) => (
          <div
            key={idx}
            className={`rain-hour-bar-item ${item.isPeak ? 'peak' : ''}`}
            title={`${item.hour}: ${item.probability}% rain probability (${item.amountMm}mm)`}
          >
            <span className="rain-hour-time">{item.hour}</span>
            <WeatherIcon name={item.icon} size={18} />
            
            {/* Visual Probability Fill Track */}
            <div className="rain-bar-track">
              <div
                className="rain-bar-fill"
                style={{
                  height: `${Math.max(8, item.probability)}%`,
                  background: item.isPeak
                    ? 'linear-gradient(180deg, #00d2ff 0%, #2563eb 100%)'
                    : undefined,
                }}
              />
            </div>

            <span
              className="rain-hour-percent"
              style={{ color: item.isPeak ? 'var(--accent-cyan)' : undefined }}
            >
              {item.probability}%
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {item.amountMm > 0 ? `${item.amountMm}mm` : '0mm'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
