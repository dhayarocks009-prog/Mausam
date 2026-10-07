'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { WeatherIcon } from '@/components/UI/WeatherIcon';
import { Sparkles } from 'lucide-react';

export const PersonalizedRecommendations: React.FC = () => {
  const { weather } = useWeather();

  if (!weather || !weather.recommendations || weather.recommendations.length === 0) {
    return null;
  }

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '14px' }}>
        <Sparkles size={18} color="var(--accent-cyan)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Personalized Insights & Advice</h3>
      </div>

      <div className="recommendations-grid">
        {weather.recommendations.map((rec) => (
          <div key={rec.id} className="recommendation-card">
            <div className="recommendation-icon-box">
              <WeatherIcon name={rec.icon} size={20} />
            </div>
            <div>
              <h4 className="recommendation-title">{rec.title}</h4>
              <p className="recommendation-desc">{rec.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        * Informational weather suggestions tailored to current atmospheric readings.
      </div>
    </div>
  );
};
