'use client';

import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { PersonalizationEngine, DashboardSectionId } from '@/services/personalization';
import { SkeletonLoader } from '@/components/UI/SkeletonLoader';
import { CurrentWeatherCard } from '@/components/Dashboard/CurrentWeatherCard';
import { RainForecastCard } from '@/components/Dashboard/RainForecastCard';
import { HourlyForecast } from '@/components/Dashboard/HourlyForecast';
import { DailyForecast } from '@/components/Dashboard/DailyForecast';
import { WeatherAlerts } from '@/components/Dashboard/WeatherAlerts';
import { PersonalizedRecommendations } from '@/components/Dashboard/PersonalizedRecommendations';
import { WeatherDetailsGrid } from '@/components/Dashboard/WeatherDetailsGrid';
import { SunScheduleCard } from '@/components/Dashboard/SunScheduleCard';
import { EmergencyContactCard } from '@/components/Emergency/EmergencyContactCard';
import { Sparkles, AlertCircle } from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const { weather, isLoading, error, preferences, location } = useWeather();

  if (isLoading && !weather) {
    return <SkeletonLoader />;
  }

  if (error && !weather) {
    return (
      <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--alert-critical)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Unable to Load Weather</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto' }}>{error}</p>
      </div>
    );
  }

  if (!weather) return null;

  // Calculate dynamic section order based on personalization engine
  const sectionOrder = PersonalizationEngine.getDynamicSectionOrder(weather, preferences);

  // Render individual component helper
  const renderSection = (id: DashboardSectionId) => {
    switch (id) {
      case 'alerts':
        return <WeatherAlerts key="alerts" />;
      case 'current':
        return <CurrentWeatherCard key="current" />;
      case 'recommendations':
        return <PersonalizedRecommendations key="recommendations" />;
      case 'rain':
        return <RainForecastCard key="rain" />;
      case 'hourly':
        return <HourlyForecast key="hourly" />;
      case 'daily':
        return <DailyForecast key="daily" />;
      case 'details':
        return <WeatherDetailsGrid key="details" />;
      case 'sun':
        return <SunScheduleCard key="sun" />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Dynamic Personalization Indicator Tag */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={13} color="var(--accent-cyan)" />
          <span>
            Personalized for <strong>{location.city}</strong> • Focus:{' '}
            <span style={{ textTransform: 'capitalize', color: 'var(--accent-cyan)' }}>
              {preferences.homepageFocus}
            </span>
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
          🛡️ Parent/Guardian Emergency Guard Active
        </span>
      </div>

      {/* Desktop Responsive Layout Split */}
      {/* On desktop (≥1024px), arrange into main column & secondary side-column */}
      <div className="dashboard-grid-two-col">
        {/* Main Column */}
        <div className="dashboard-col-stack">
          {sectionOrder
            .filter((id) => ['alerts', 'current', 'rain', 'hourly'].includes(id))
            .map((id) => renderSection(id))}
        </div>

        {/* Supporting Column (Daily, Recommendations, Details, Sun, Emergency Contact) */}
        <div className="dashboard-col-stack">
          {/* Emergency Guardian Card */}
          <EmergencyContactCard />

          {sectionOrder
            .filter((id) => ['daily', 'recommendations', 'details', 'sun'].includes(id))
            .map((id) => renderSection(id))}
        </div>
      </div>
    </div>
  );
};
