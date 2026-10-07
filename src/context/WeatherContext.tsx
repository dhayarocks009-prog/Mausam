'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  FullWeatherData,
  LocationData,
  FavoriteLocation,
  UserPreferences,
} from '@/types/weather';
import {
  CacheService,
  DEFAULT_PREFERENCES,
  INITIAL_FAVORITES,
} from '@/services/cacheService';

type TabType = 'home' | 'map' | 'favorites' | 'alerts' | 'settings';

interface WeatherContextType {
  weather: FullWeatherData | null;
  location: LocationData;
  isLoading: boolean;
  isRefreshing: boolean;
  isOffline: boolean;
  error: string | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  favorites: FavoriteLocation[];
  preferences: UserPreferences;
  timeUntilNextUpdate: string;
  fetchWeatherForLocation: (loc: LocationData, forceRefresh?: boolean) => Promise<void>;
  refreshCurrentWeather: () => Promise<void>;
  detectUserLocation: () => Promise<boolean>;
  addFavorite: (loc: LocationData, customName?: string) => void;
  removeFavorite: (id: string) => void;
  renameFavorite: (id: string, newName: string) => void;
  reorderFavorites: (newFavorites: FavoriteLocation[]) => void;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  recordSectionInteraction: (section: 'rain' | 'hourly' | 'daily' | 'details' | 'map' | 'alerts') => void;
  clearCache: () => void;
}

const DEFAULT_LOCATION: LocationData = {
  city: 'Puducherry',
  state: 'Puducherry',
  country: 'India',
  latitude: 11.9416,
  longitude: 79.8083,
};

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<FullWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>(INITIAL_FAVORITES);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<string>('30m');

  const locationRef = useRef<LocationData>(location);
  locationRef.current = location;
  const weatherRef = useRef<FullWeatherData | null>(weather);
  weatherRef.current = weather;
  const preferencesRef = useRef<UserPreferences>(preferences);
  preferencesRef.current = preferences;

  // Initialize preferences, favorites, onboarding, and online listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Online/Offline status
    setIsOffline(!navigator.onLine);
    const handleOnline = () => {
      setIsOffline(false);
      // If returning online, check if update interval elapsed
      if (weatherRef.current && Date.now() - weatherRef.current.lastUpdated >= 30 * 60 * 1000) {
        fetchWeatherForLocation(locationRef.current, true);
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load stored preferences & favorites
    const savedPrefs = CacheService.getPreferences();
    setPreferences(savedPrefs);
    applyTheme(savedPrefs.theme);

    const savedFavs = CacheService.getFavorites();
    setFavorites(savedFavs);

    const hasSeen = CacheService.getHasSeenOnboarding();
    if (!hasSeen) {
      setIsOnboardingOpen(true);
    }

    // Initial weather fetch with cache verification
    fetchWeatherForLocation(DEFAULT_LOCATION, false);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme application helper
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', isSystemDark ? 'dark' : 'light');
    }
  };

  // 30-Minute Automatic Weather Updater & Countdown Timer
  useEffect(() => {
    const updateCountdown = () => {
      if (!weatherRef.current) return;
      const elapsedMs = Date.now() - weatherRef.current.lastUpdated;
      const remainingMs = Math.max(0, 30 * 60 * 1000 - elapsedMs);
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

      if (remainingMinutes <= 0) {
        setTimeUntilNextUpdate('Due now');
        if (preferencesRef.current.autoRefresh30Min && !isRefreshing && navigator.onLine) {
          fetchWeatherForLocation(locationRef.current, true);
        }
      } else {
        setTimeUntilNextUpdate(`${remainingMinutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 10000); // Check every 10s

    // Tab visibility change: refresh if > 30 mins while in background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && weatherRef.current) {
        const elapsed = Date.now() - weatherRef.current.lastUpdated;
        if (elapsed >= 30 * 60 * 1000 && preferencesRef.current.autoRefresh30Min && navigator.onLine) {
          fetchWeatherForLocation(locationRef.current, true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRefreshing]);

  // Main Weather Fetch function with 30-minute caching logic
  const fetchWeatherForLocation = useCallback(
    async (loc: LocationData, forceRefresh = false) => {
      setError(null);
      setLocation(loc);

      // Check client cache first
      const { data: cached, isExpired } = CacheService.getCachedWeather(loc.latitude, loc.longitude);

      // 1. If we have fresh cached data and it's not a forced refresh, use immediately
      if (cached && !isExpired && !forceRefresh) {
        setWeather(cached);
        setIsLoading(false);
        return;
      }

      // 2. If we have cached data (even if slightly expired or offline), display it immediately for instant UI
      if (cached) {
        setWeather(cached);
      }

      // 3. If offline, keep showing cached data and inform the user
      if (!navigator.onLine) {
        setIsOffline(true);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // 4. Otherwise or if forced/expired, request fresh data from secure backend proxy
      if (forceRefresh) {
        setIsRefreshing(true);
      } else if (!cached) {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams({
          lat: loc.latitude.toString(),
          lon: loc.longitude.toString(),
          city: loc.city,
          state: loc.state || '',
          country: loc.country,
          refresh: forceRefresh ? 'true' : 'false',
        });

        const res = await fetch(`/api/weather?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Weather API error (${res.status})`);
        }

        const freshData: FullWeatherData = await res.json();
        setWeather(freshData);
        CacheService.setCachedWeather(freshData);
      } catch (err: any) {
        console.error('Fetch weather error:', err);
        // If we have cached data, don't break the UI, just show notice
        if (!cached) {
          setError('Unable to retrieve the latest weather information. Please check your connection and try again.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Manual Refresh
  const refreshCurrentWeather = useCallback(async () => {
    if (isRefreshing) return;
    await fetchWeatherForLocation(location, true);
  }, [location, isRefreshing, fetchWeatherForLocation]);

  // GPS Geolocation Detection
  const detectUserLocation = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Location services are not supported on this browser.');
      return false;
    }

    setIsLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            // Reverse geocode via server proxy
            const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
            const data = await res.json();
            const first = data.results?.[0];

            const detectedLocation: LocationData = {
              city: first?.name || 'Current Location',
              state: first?.admin1 || '',
              country: first?.country || 'Detected via GPS',
              latitude: lat,
              longitude: lon,
            };

            await fetchWeatherForLocation(detectedLocation, true);
            resolve(true);
          } catch {
            const fallbackLoc: LocationData = {
              city: 'Detected Location',
              country: 'GPS Coordinates',
              latitude: lat,
              longitude: lon,
            };
            await fetchWeatherForLocation(fallbackLoc, true);
            resolve(true);
          }
        },
        (geoError) => {
          setIsLoading(false);
          console.warn('Geolocation denied or failed:', geoError.message);
          setError('Location access was denied or unavailable. Please search for your city manually.');
          resolve(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }, [fetchWeatherForLocation]);

  // Favorites Management
  const addFavorite = useCallback(
    (loc: LocationData, customName?: string) => {
      const newFav: FavoriteLocation = {
        ...loc,
        id: `fav-${Date.now()}`,
        customName,
        createdAt: Date.now(),
      };
      const updated = [newFav, ...favorites.filter((f) => f.latitude !== loc.latitude || f.longitude !== loc.longitude)];
      setFavorites(updated);
      CacheService.saveFavorites(updated);
    },
    [favorites]
  );

  const removeFavorite = useCallback(
    (id: string) => {
      const updated = favorites.filter((f) => f.id !== id);
      setFavorites(updated);
      CacheService.saveFavorites(updated);
    },
    [favorites]
  );

  const renameFavorite = useCallback(
    (id: string, newName: string) => {
      const updated = favorites.map((f) => (f.id === id ? { ...f, customName: newName } : f));
      setFavorites(updated);
      CacheService.saveFavorites(updated);
    },
    [favorites]
  );

  const reorderFavorites = useCallback((newFavorites: FavoriteLocation[]) => {
    setFavorites(newFavorites);
    CacheService.saveFavorites(newFavorites);
  }, []);

  // Preferences Management
  const updatePreferences = useCallback(
    (newPrefs: Partial<UserPreferences>) => {
      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);
      CacheService.savePreferences(updated);
      if (newPrefs.theme) {
        applyTheme(newPrefs.theme);
      }
    },
    [preferences]
  );

  // Interaction tracking for personalization
  const recordSectionInteraction = useCallback(
    (section: 'rain' | 'hourly' | 'daily' | 'details' | 'map' | 'alerts') => {
      const counts = { ...preferences.viewCounts, [section]: (preferences.viewCounts[section] || 0) + 1 };
      updatePreferences({ viewCounts: counts });
    },
    [preferences, updatePreferences]
  );

  const clearCache = useCallback(() => {
    CacheService.clearAllWeatherCache();
    if (location) {
      fetchWeatherForLocation(location, true);
    }
  }, [location, fetchWeatherForLocation]);

  return (
    <WeatherContext.Provider
      value={{
        weather,
        location,
        isLoading,
        isRefreshing,
        isOffline,
        error,
        activeTab,
        setActiveTab,
        isSearchOpen,
        setIsSearchOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        favorites,
        preferences,
        timeUntilNextUpdate,
        fetchWeatherForLocation,
        refreshCurrentWeather,
        detectUserLocation,
        addFavorite,
        removeFavorite,
        renameFavorite,
        reorderFavorites,
        updatePreferences,
        recordSectionInteraction,
        clearCache,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
