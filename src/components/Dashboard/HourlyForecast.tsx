'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { WeatherIcon } from '@/components/UI/WeatherIcon';
import { formatTemp, formatWind } from '@/utils/weatherHelpers';
import { Clock, Droplets, Wind } from 'lucide-react';

export const HourlyForecast: React.FC = () => {
  const { weather, preferences, recordSectionInteraction } = useWeather();

  if (!weather || !weather.hourly.length) return null;

  return (
    <div
      className="glass-card"
      onClick={() => recordSectionInteraction('hourly')}
      style={{ padding: '20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>24-Hour Forecast</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scroll horizontally →</span>
      </div>

      <div className="hourly-scroll-container">
        {weather.hourly.map((item, idx) => (
          <div key={idx} className="hourly-card-item">
            <span className="hourly-card-time">{item.hourLabel}</span>
            <WeatherIcon name={item.icon} size={28} />
            <span className="hourly-card-temp">
              {formatTemp(item.tempC, preferences.temperatureUnit)}
            </span>
            
            <div className="hourly-card-rain" title="Precipitation probability">
              <Droplets size={12} />
              <span>{item.rainProbability}%</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}
              title="Wind speed"
            >
              <Wind size={11} />
              <span>{formatWind(item.windSpeedKmh, preferences.windUnit)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
