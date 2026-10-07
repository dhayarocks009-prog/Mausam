'use client';

import React, { useState } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { CloudSun, MapPin, Navigation, ArrowRight, Check } from 'lucide-react';
import { CacheService } from '@/services/cacheService';
import { TempUnit, ThemeOption } from '@/types/weather';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    preferences,
    updatePreferences,
    detectUserLocation,
  } = useWeather();

  const [step, setStep] = useState<number>(1);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  if (!isOnboardingOpen) return null;

  const handleComplete = () => {
    CacheService.setHasSeenOnboarding(true);
    setIsOnboardingOpen(false);
  };

  const handleEnableLocation = async () => {
    setIsDetecting(true);
    await detectUserLocation();
    setIsDetecting(false);
    setStep(2);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ textAlign: 'center', padding: '36px 28px' }}>
        {step === 1 ? (
          <div>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--grad-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#fff',
                boxShadow: '0 8px 30px rgba(0, 210, 255, 0.4)',
              }}
            >
              <CloudSun size={38} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
              Welcome to Mausam 🌦️
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
              Your intelligent, personalized weather companion for mobile and desktop.
              Accurate atmospheric forecasts tailored dynamically to your habits and location.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleEnableLocation}
                disabled={isDetecting}
                className="layer-chip-btn active"
                style={{
                  padding: '14px 24px',
                  fontSize: '1rem',
                  justifyContent: 'center',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Navigation size={18} />
                <span>{isDetecting ? 'Detecting Location...' : 'Use My Current Location'}</span>
              </button>

              <button
                onClick={() => setStep(2)}
                className="header-icon-btn"
                style={{ width: '100%', padding: '12px 20px', fontSize: '0.9rem' }}
              >
                <span>Search Location Manually</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
              Quick Preferences
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Customize your units and appearance
            </p>

            {/* Temperature Unit */}
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Temperature Unit
              </label>
              <div className="segmented-control" style={{ width: '100%' }}>
                <button
                  style={{ flex: 1 }}
                  className={`segmented-btn ${preferences.temperatureUnit === 'celsius' ? 'active' : ''}`}
                  onClick={() => updatePreferences({ temperatureUnit: 'celsius' })}
                >
                  Celsius (°C)
                </button>
                <button
                  style={{ flex: 1 }}
                  className={`segmented-btn ${preferences.temperatureUnit === 'fahrenheit' ? 'active' : ''}`}
                  onClick={() => updatePreferences({ temperatureUnit: 'fahrenheit' })}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            {/* Theme */}
            <div style={{ marginBottom: 24, textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Theme Appearance
              </label>
              <div className="segmented-control" style={{ width: '100%' }}>
                {(['dark', 'light', 'system'] as ThemeOption[]).map((t) => (
                  <button
                    key={t}
                    style={{ flex: 1, textTransform: 'capitalize' }}
                    className={`segmented-btn ${preferences.theme === t ? 'active' : ''}`}
                    onClick={() => updatePreferences({ theme: t })}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="layer-chip-btn active"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                justifyContent: 'center',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
