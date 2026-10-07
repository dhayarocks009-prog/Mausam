'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { WeatherIcon } from '@/components/UI/WeatherIcon';
import { formatTemp } from '@/utils/weatherHelpers';
import { Calendar, Droplets } from 'lucide-react';

export const DailyForecast: React.FC = () => {
  const { weather, preferences, recordSectionInteraction } = useWeather();

  if (!weather || !weather.daily.length) return null;

  // Compute min and max across all 7 days for normalized temperature bar
  let overallMin = Infinity;
  let overallMax = -Infinity;
  weather.daily.forEach((d) => {
    if (d.minTempC < overallMin) overallMin = d.minTempC;
    if (d.maxTempC > overallMax) overallMax = d.maxTempC;
  });
  const tempRange = Math.max(1, overallMax - overallMin);

  return (
    <div
      className="glass-card"
      onClick={() => recordSectionInteraction('daily')}
      style={{ padding: '20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '12px' }}>
        <Calendar size={18} color="var(--accent-cyan)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>7-Day Forecast</h3>
      </div>

      <div className="daily-forecast-list">
        {weather.daily.map((item, idx) => {
          // Normalize bar offset and width
          const leftPercent = Math.max(0, Math.min(80, ((item.minTempC - overallMin) / tempRange) * 100));
          const widthPercent = Math.max(15, Math.min(100 - leftPercent, ((item.maxTempC - item.minTempC) / tempRange) * 100));

          return (
            <div key={idx} className="daily-row-item">
              <span className="daily-day-label">{item.dayLabel}</span>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WeatherIcon name={item.icon} size={24} />
              </div>

              {/* Min-to-Max Visual Temperature Bar */}
              <div className="daily-temp-bar-container">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>
                  {item.rainProbability > 0 ? (
                    <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Droplets size={10} />
                      {item.rainProbability}%
                    </span>
                  ) : (
                    ''
                  )}
                </span>
                
                <div className="daily-temp-bar-track">
                  <div
                    className="daily-temp-bar-fill"
                    style={{
                      marginLeft: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
              </div>

              <div className="daily-temp-minmax">
                <span style={{ color: 'var(--text-primary)' }}>
                  {formatTemp(item.maxTempC, preferences.temperatureUnit)}
                </span>
                <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {formatTemp(item.minTempC, preferences.temperatureUnit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
