'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import {
  Droplets,
  Gauge,
  Eye,
  Sun,
  Wind,
  Compass,
  Cloud,
  Thermometer,
  CloudRain,
  ShieldCheck,
} from 'lucide-react';
import {
  formatWind,
  formatPressure,
  formatPrecipitation,
  formatTemp,
  getUVDescription,
} from '@/utils/weatherHelpers';

export const WeatherDetailsGrid: React.FC = () => {
  const { weather, preferences, recordSectionInteraction } = useWeather();

  if (!weather) return null;

  const d = weather.current.details;
  const uvInfo = getUVDescription(d.uvIndex);

  return (
    <div
      className="glass-card"
      onClick={() => recordSectionInteraction('details')}
      style={{ padding: '20px' }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
        Atmospheric Conditions & Details
      </h3>

      <div className="details-bento-grid">
        {/* UV Index Tile */}
        <div className="detail-tile">
          <div className="detail-tile-header">
            <Sun size={15} color={uvInfo.color} />
            <span>UV Index</span>
          </div>
          <div>
            <div className="detail-tile-value" style={{ color: uvInfo.color }}>
              {d.uvIndex.toFixed(1)}
            </div>
            <div className="detail-tile-sub">{uvInfo.text} intensity</div>
          </div>
        </div>

        {/* Humidity Tile */}
        <div className="detail-tile">
          <div className="detail-tile-header">
            <Droplets size={15} color="#38bdf8" />
            <span>Humidity</span>
          </div>
          <div>
            <div className="detail-tile-value">{d.humidity}%</div>
            <div className="detail-tile-sub">
              Dew point: {formatTemp(d.dewPointC, preferences.temperatureUnit)}
            </div>
          </div>
        </div>

        {/* Wind & Compass Tile */}
        <div className="detail-tile">
          <div className="detail-tile-header">
            <Wind size={15} color="#38bdf8" />
            <span>Wind & Direction</span>
          </div>
          <div>
            <div className="detail-tile-value">
              {formatWind(d.windSpeedKmh, preferences.windUnit)}
            </div>
            <div className="detail-tile-sub">
              Direction: {d.windDirectionCardinal} ({d.windDirectionDeg}°)
            </div>
          </div>
        </div>

        {/* Pressure Tile */}
        <div className="detail-tile">
          <div className="detail-tile-header">
            <Gauge size={15} color="#94a3b8" />
            <span>Pressure</span>
          </div>
          <div>
            <div className="detail-tile-value">
              {formatPressure(d.pressureHpa, preferences.pressureUnit)}
            </div>
            <div className="detail-tile-sub">Atmospheric sea-level</div>
          </div>
        </div>

        {/* Visibility Tile */}
        <div className="detail-tile">
          <div className="detail-tile-header">
            <Eye size={15} color="#94a3b8" />
            <span>Visibility</span>
          </div>
          <div>
            <div className="detail-tile-value">{d.visibilityKm} km</div>
            <div className="detail-tile-sub">
              {d.visibilityKm >= 10 ? 'Clear horizon' : 'Moderate visibility'}
            </div>
          </div>
        </div>

        {/* Cloud Cover Tile */}
        <div className="detail-tile">
          <div className="detail-tile-header">
            <Cloud size={15} color="#94a3b8" />
            <span>Cloud Cover</span>
          </div>
          <div>
            <div className="detail-tile-value">{d.cloudCoverage}%</div>
            <div className="detail-tile-sub">Sky area coverage</div>
          </div>
        </div>

        {/* Precipitation Amount */}
        <div className="detail-tile">
          <div className="detail-tile-header">
            <CloudRain size={15} color="#38bdf8" />
            <span>Precipitation</span>
          </div>
          <div>
            <div className="detail-tile-value">
              {formatPrecipitation(d.precipitationMm, preferences.precipitationUnit)}
            </div>
            <div className="detail-tile-sub">Accumulated last hour</div>
          </div>
        </div>

        {/* Air Quality Index */}
        <div className="detail-tile">
          <div className="detail-tile-header">
            <ShieldCheck size={15} color="#10b981" />
            <span>Air Quality</span>
          </div>
          <div>
            <div className="detail-tile-value" style={{ color: '#10b981' }}>
              {d.airQualityIndex || 42} AQI
            </div>
            <div className="detail-tile-sub">{d.airQualityLabel || 'Satisfactory & Good'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
