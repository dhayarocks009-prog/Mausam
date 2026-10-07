'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { Search, MapPin, Navigation, X, History, Loader2 } from 'lucide-react';
import { GeocodingResult, LocationData } from '@/types/weather';
import { CacheService } from '@/services/cacheService';

const PRESET_CITIES: LocationData[] = [
  { city: 'Puducherry', state: 'Puducherry', country: 'India', latitude: 11.9416, longitude: 79.8083 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707 },
  { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558 },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { city: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198 },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.076, longitude: 72.8777 },
  { city: 'Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 },
  { city: 'London', state: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { city: 'Tokyo', state: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
];

export const LocationSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    fetchWeatherForLocation,
    detectUserLocation,
    setActiveTab,
  } = useWeather();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setHistory(CacheService.getSearchHistory());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Geocode search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleSelect = (loc: LocationData) => {
    CacheService.addToSearchHistory(loc.city);
    fetchWeatherForLocation(loc, false);
    setIsSearchOpen(false);
    setActiveTab('home');
    setQuery('');
  };

  const handleGPS = async () => {
    setIsSearchOpen(false);
    setActiveTab('home');
    await detectUserLocation();
  };

  return (
    <div className="modal-overlay" onClick={() => setIsSearchOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Search Location</h3>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="header-icon-btn"
            style={{ width: 32, height: 32 }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Wrap */}
        <div className="search-input-wrap">
          <Search size={18} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search city, region, or country..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <Loader2
              size={18}
              className="spin-anim"
              style={{ position: 'absolute', right: 14, color: 'var(--accent-cyan)' }}
            />
          )}
        </div>

        {/* GPS Button */}
        <button
          onClick={handleGPS}
          className="search-result-item"
          style={{ background: 'rgba(0, 210, 255, 0.1)', borderColor: 'rgba(0, 210, 255, 0.3)', marginBottom: 12 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-cyan)' }}>
            <Navigation size={18} />
            <span style={{ fontWeight: 600 }}>Use Current GPS Location</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Detect device</span>
        </button>

        {/* Search Results */}
        {results.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Search Results
            </div>
            <div className="search-results-list">
              {results.map((r) => (
                <button
                  key={r.id}
                  className="search-result-item"
                  onClick={() =>
                    handleSelect({
                      city: r.name,
                      state: r.admin1,
                      country: r.country,
                      latitude: r.latitude,
                      longitude: r.longitude,
                      timezone: r.timezone,
                    })
                  }
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MapPin size={16} color="var(--accent-cyan)" />
                    <div>
                      <span style={{ fontWeight: 600 }}>{r.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                        {r.admin1 ? `${r.admin1}, ` : ''}{r.country}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Preset Cities */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            Popular Cities
          </div>
          <div className="search-presets-row">
            {PRESET_CITIES.map((p, idx) => (
              <button
                key={idx}
                className="preset-pill"
                onClick={() => handleSelect(p)}
              >
                📍 {p.city}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Search History */}
        {history.length > 0 && (
          <div style={{ marginTop: 12, borderTop: '1px solid var(--card-border)', paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={13} />
                Recent Searches
              </span>
              <button
                onClick={() => {
                  CacheService.clearSearchHistory();
                  setHistory([]);
                }}
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
              >
                Clear
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {history.map((h, i) => (
                <button
                  key={i}
                  className="preset-pill"
                  onClick={() => setQuery(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
