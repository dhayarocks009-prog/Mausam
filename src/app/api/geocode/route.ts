import { NextRequest, NextResponse } from 'next/server';
import { GeocodingResult } from '@/types/weather';

const POPULAR_PRESETS: GeocodingResult[] = [
  { id: 'preset-puducherry', name: 'Puducherry', admin1: 'Puducherry', country: 'India', countryCode: 'IN', latitude: 11.9416, longitude: 79.8083 },
  { id: 'preset-chennai', name: 'Chennai', admin1: 'Tamil Nadu', country: 'India', countryCode: 'IN', latitude: 13.0827, longitude: 80.2707 },
  { id: 'preset-coimbatore', name: 'Coimbatore', admin1: 'Tamil Nadu', country: 'India', countryCode: 'IN', latitude: 11.0168, longitude: 76.9558 },
  { id: 'preset-bengaluru', name: 'Bengaluru', admin1: 'Karnataka', country: 'India', countryCode: 'IN', latitude: 12.9716, longitude: 77.5946 },
  { id: 'preset-madurai', name: 'Madurai', admin1: 'Tamil Nadu', country: 'India', countryCode: 'IN', latitude: 9.9252, longitude: 78.1198 },
  { id: 'preset-mumbai', name: 'Mumbai', admin1: 'Maharashtra', country: 'India', countryCode: 'IN', latitude: 19.076, longitude: 72.8777 },
  { id: 'preset-delhi', name: 'Delhi', admin1: 'Delhi', country: 'India', countryCode: 'IN', latitude: 28.6139, longitude: 77.209 },
  { id: 'preset-hyderabad', name: 'Hyderabad', admin1: 'Telangana', country: 'India', countryCode: 'IN', latitude: 17.385, longitude: 78.4867 },
  { id: 'preset-london', name: 'London', admin1: 'England', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278 },
  { id: 'preset-tokyo', name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503 },
  { id: 'preset-new-york', name: 'New York', admin1: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.006 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    // Reverse Geocoding (coordinates -> city)
    if (latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      try {
        const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;
        const res = await fetch(reverseUrl, {
          headers: { 'User-Agent': 'MausamWeatherApp/1.0 (contact: support@mausam.app)' },
          next: { revalidate: 86400 },
        });

        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || 'Detected Location';
          const state = addr.state || '';
          const country = addr.country || 'India';
          const countryCode = (addr.country_code || 'in').toUpperCase();

          const result: GeocodingResult = {
            id: `geo-${lat.toFixed(4)}-${lon.toFixed(4)}`,
            name: city,
            admin1: state,
            country,
            countryCode,
            latitude: lat,
            longitude: lon,
          };
          return NextResponse.json({ results: [result] });
        }
      } catch (err) {
        console.warn('Reverse geocoding error:', err);
      }

      // Fallback if nominatim has an issue
      return NextResponse.json({
        results: [
          {
            id: `gps-${lat.toFixed(2)}-${lon.toFixed(2)}`,
            name: 'Current Location',
            admin1: '',
            country: 'Detected via GPS',
            latitude: lat,
            longitude: lon,
          },
        ],
      });
    }

    // Direct search by query text
    if (!query || query.length < 2) {
      return NextResponse.json({ results: POPULAR_PRESETS });
    }

    // Query Open-Meteo Geocoding
    const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const res = await fetch(searchUrl, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      // Return filtered popular presets on error
      const filtered = POPULAR_PRESETS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.country.toLowerCase().includes(query.toLowerCase())
      );
      return NextResponse.json({ results: filtered });
    }

    const data = await res.json();
    const results: GeocodingResult[] = (data.results || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      admin1: item.admin1,
      country: item.country,
      countryCode: item.country_code,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Geocode route error:', error);
    return NextResponse.json({ results: POPULAR_PRESETS });
  }
}
