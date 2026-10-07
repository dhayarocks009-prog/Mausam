import { FullWeatherData, FavoriteLocation, UserPreferences } from '@/types/weather';

const STORAGE_PREFIX = 'mausam_weather_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in ms

export interface StoredCache {
  data: FullWeatherData;
  timestamp: number;
  locationKey: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  temperatureUnit: 'celsius',
  windUnit: 'kmh',
  pressureUnit: 'hpa',
  precipitationUnit: 'mm',
  theme: 'system',
  homepageFocus: 'balanced',
  autoRefresh30Min: true,
  notifications: {
    weatherAlerts: true,
    rainAlerts: true,
    dailySummary: false,
    favoriteAlerts: true,
  },
  viewCounts: {
    rain: 0,
    hourly: 0,
    daily: 0,
    details: 0,
    map: 0,
    alerts: 0,
  },
};

export const INITIAL_FAVORITES: FavoriteLocation[] = [
  {
    id: 'fav-puducherry',
    city: 'Puducherry',
    state: 'Puducherry',
    country: 'India',
    latitude: 11.9416,
    longitude: 79.8083,
    createdAt: Date.now(),
  },
  {
    id: 'fav-chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    createdAt: Date.now() - 1000,
  },
  {
    id: 'fav-bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    createdAt: Date.now() - 2000,
  },
];

export class CacheService {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  static getLocationKey(lat: number, lon: number): string {
    return `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  }

  static getCachedWeather(lat: number, lon: number): { data: FullWeatherData | null; isExpired: boolean; ageMs: number } {
    if (!this.isClient()) return { data: null, isExpired: true, ageMs: Infinity };

    try {
      const key = `${STORAGE_PREFIX}cache_${this.getLocationKey(lat, lon)}`;
      const storedJson = localStorage.getItem(key);
      if (!storedJson) {
        // Check for any most recent cached data as a fallback
        const lastKnownJson = localStorage.getItem(`${STORAGE_PREFIX}last_known`);
        if (lastKnownJson) {
          const parsed = JSON.parse(lastKnownJson) as StoredCache;
          return { data: parsed.data, isExpired: true, ageMs: Date.now() - parsed.timestamp };
        }
        return { data: null, isExpired: true, ageMs: Infinity };
      }

      const cache: StoredCache = JSON.parse(storedJson);
      const ageMs = Date.now() - cache.timestamp;
      const isExpired = ageMs >= CACHE_TTL_MS;

      return {
        data: cache.data,
        isExpired,
        ageMs,
      };
    } catch (e) {
      console.error('Error reading weather cache:', e);
      return { data: null, isExpired: true, ageMs: Infinity };
    }
  }

  static setCachedWeather(data: FullWeatherData): void {
    if (!this.isClient()) return;
    try {
      const locationKey = this.getLocationKey(data.location.latitude, data.location.longitude);
      const cachePayload: StoredCache = {
        data,
        timestamp: Date.now(),
        locationKey,
      };

      localStorage.setItem(`${STORAGE_PREFIX}cache_${locationKey}`, JSON.stringify(cachePayload));
      // Also store as universal last known weather
      localStorage.setItem(`${STORAGE_PREFIX}last_known`, JSON.stringify(cachePayload));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  static getFavorites(): FavoriteLocation[] {
    if (!this.isClient()) return INITIAL_FAVORITES;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}favorites`);
      if (!raw) return INITIAL_FAVORITES;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FAVORITES;
    } catch {
      return INITIAL_FAVORITES;
    }
  }

  static saveFavorites(favorites: FavoriteLocation[]): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}favorites`, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites:', e);
    }
  }

  static getPreferences(): UserPreferences {
    if (!this.isClient()) return DEFAULT_PREFERENCES;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}preferences`);
      if (!raw) return DEFAULT_PREFERENCES;
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  static savePreferences(preferences: UserPreferences): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}preferences`, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save preferences:', e);
    }
  }

  static getSearchHistory(): string[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}search_history`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static addToSearchHistory(query: string): void {
    if (!this.isClient() || !query) return;
    try {
      const current = this.getSearchHistory().filter((item) => item.toLowerCase() !== query.toLowerCase());
      current.unshift(query);
      localStorage.setItem(`${STORAGE_PREFIX}search_history`, JSON.stringify(current.slice(0, 8)));
    } catch (e) {
      console.warn('Failed to save search history:', e);
    }
  }

  static clearSearchHistory(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(`${STORAGE_PREFIX}search_history`);
  }

  static clearAllWeatherCache(): void {
    if (!this.isClient()) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(`${STORAGE_PREFIX}cache_`) || key === `${STORAGE_PREFIX}last_known`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  }

  static getHasSeenOnboarding(): boolean {
    if (!this.isClient()) return true;
    return localStorage.getItem(`${STORAGE_PREFIX}onboarding_seen`) === 'true';
  }

  static setHasSeenOnboarding(seen: boolean): void {
    if (!this.isClient()) return;
    localStorage.setItem(`${STORAGE_PREFIX}onboarding_seen`, seen ? 'true' : 'false');
  }
}
