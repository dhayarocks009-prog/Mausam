'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { CloudRain, Thermometer, Wind, Cloud, MapPin, ZoomIn, ZoomOut, Layers } from 'lucide-react';

type MapLayerType = 'precipitation' | 'temperature' | 'wind' | 'clouds';

export const WeatherMap: React.FC = () => {
  const { location, weather, recordSectionInteraction } = useWeather();
  const [selectedLayer, setSelectedLayer] = useState<MapLayerType>('precipitation');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const weatherLayerRef = useRef<any>(null);

  useEffect(() => {
    recordSectionInteraction('map');
  }, [recordSectionInteraction]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        // Import CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!isMounted || !mapContainerRef.current) return;

        // Clean up previous map if exists
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [location.latitude, location.longitude],
          zoom: 9,
          zoomControl: false,
        });

        // Dark or light base map
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors & CARTO',
          maxZoom: 18,
        }).addTo(map);

        // Custom pulsing marker
        const customIcon = L.divIcon({
          className: 'mausam-map-marker',
          html: `<div style="
            width: 24px;
            height: 24px;
            background: #00d2ff;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 16px rgba(0,210,255,0.8);
            animation: pulseGlow 2s infinite;
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([location.latitude, location.longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="color: #0f172a; font-family: inherit; font-size: 13px; font-weight: 600;">
            📍 ${location.city}<br/>
            ${weather ? `${weather.current.condition} • ${Math.round(weather.current.tempC)}°C` : ''}
          </div>
        `);

        leafletMapRef.current = map;
        markerRef.current = marker;

        updateWeatherOverlay(L, map, selectedLayer);
      } catch (e) {
        console.warn('Leaflet initialization error:', e);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [location.latitude, location.longitude]);

  // Update overlay when selected layer changes
  const updateWeatherOverlay = async (L: any, map: any, layer: MapLayerType) => {
    if (weatherLayerRef.current) {
      map.removeLayer(weatherLayerRef.current);
      weatherLayerRef.current = null;
    }

    // Weather radar / precipitation overlay via Open-Meteo or RainViewer / OpenWeather tiles
    let tileUrl = '';
    if (layer === 'precipitation') {
      // RainViewer live precipitation radar tiles
      tileUrl = 'https://tilecache.rainviewer.com/v2/radar/nowcast_45/256/{z}/{x}/{y}/2/1_1.png';
    } else if (layer === 'clouds') {
      tileUrl = 'https://tilecache.rainviewer.com/v2/radar/nowcast_45/256/{z}/{x}/{y}/1/1_1.png';
    }

    if (tileUrl) {
      const overlay = L.tileLayer(tileUrl, {
        opacity: 0.65,
        maxZoom: 18,
      });
      overlay.addTo(map);
      weatherLayerRef.current = overlay;
    }
  };

  const handleLayerChange = async (layer: MapLayerType) => {
    setSelectedLayer(layer);
    if (leafletMapRef.current) {
      const L = (await import('leaflet')).default;
      updateWeatherOverlay(L, leafletMapRef.current, layer);
    }
  };

  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([location.latitude, location.longitude], 10);
    }
  };

  const getLayerColor = (layer: MapLayerType) => {
    switch (layer) {
      case 'precipitation':
        return '#38bdf8';
      case 'temperature':
        return '#f97316';
      case 'wind':
        return '#10b981';
      case 'clouds':
        return '#a855f7';
    }
  };

  return (
    <div className="glass-card map-view-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Interactive Weather Radar & Map</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time radar layers over {location.city}, {location.country}
          </p>
        </div>

        {/* Layer Switcher Controls */}
        <div className="map-layer-selector">
          <button
            className={`layer-chip-btn ${selectedLayer === 'precipitation' ? 'active' : ''}`}
            onClick={() => handleLayerChange('precipitation')}
          >
            <CloudRain size={16} />
            <span>🌧️ Rain Radar</span>
          </button>

          <button
            className={`layer-chip-btn ${selectedLayer === 'temperature' ? 'active' : ''}`}
            onClick={() => handleLayerChange('temperature')}
          >
            <Thermometer size={16} />
            <span>🌡️ Temperature</span>
          </button>

          <button
            className={`layer-chip-btn ${selectedLayer === 'wind' ? 'active' : ''}`}
            onClick={() => handleLayerChange('wind')}
          >
            <Wind size={16} />
            <span>💨 Wind Field</span>
          </button>

          <button
            className={`layer-chip-btn ${selectedLayer === 'clouds' ? 'active' : ''}`}
            onClick={() => handleLayerChange('clouds')}
          >
            <Cloud size={16} />
            <span>☁️ Clouds</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Frame */}
      <div className="map-frame">
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Custom Map Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 1000,
          }}
        >
          <button
            onClick={handleRecenter}
            className="header-icon-btn"
            style={{ background: 'rgba(10, 15, 30, 0.85)', backdropFilter: 'blur(10px)' }}
            title="Recenter on current city"
            aria-label="Recenter on current city"
          >
            <MapPin size={18} color="var(--accent-cyan)" />
          </button>
          <button
            onClick={handleZoomIn}
            className="header-icon-btn"
            style={{ background: 'rgba(10, 15, 30, 0.85)', backdropFilter: 'blur(10px)' }}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            className="header-icon-btn"
            style={{ background: 'rgba(10, 15, 30, 0.85)', backdropFilter: 'blur(10px)' }}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
        </div>

        {/* Dynamic Legend Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            zIndex: 1000,
            background: 'rgba(10, 15, 30, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: getLayerColor(selectedLayer),
            }}
          />
          <span style={{ textTransform: 'capitalize' }}>
            Active Layer: <strong>{selectedLayer}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
