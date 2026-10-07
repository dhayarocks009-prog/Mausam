export type SeverityLevel = 'critical' | 'warning' | 'advisory' | 'info';

export interface WeatherAlert {
  id: string;
  title: string;
  severity: SeverityLevel;
  description: string;
  instruction?: string;
  startTime: string;
  endTime?: string;
  source?: string;
}

export interface RainHourly {
  time: string;
  hour: string;
  probability: number; // 0-100%
  amountMm: number;
  condition: string;
  icon: string;
  isPeak?: boolean;
}

export interface RainForecast {
  probability: number;
  expectedRainfallMm: number;
  rainTiming: string;
  hourly: RainHourly[];
  condition: string;
  summary: string;
}

export interface HourlyForecastItem {
  time: string;
  hourLabel: string;
  tempC: number;
  feelsLikeC: number;
  condition: string;
  icon: string;
  rainProbability: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  humidity: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  dayLabel: string;
  condition: string;
  icon: string;
  maxTempC: number;
  minTempC: number;
  rainProbability: number;
  precipitationMm: number;
  windSpeedKmh: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherDetails {
  humidity: number; // %
  feelsLikeC: number;
  minTempC: number;
  maxTempC: number;
  pressureHpa: number;
  visibilityKm: number;
  uvIndex: number;
  uvDescription: string;
  dewPointC: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windDirectionCardinal: string;
  windGustKmh: number;
  cloudCoverage: number; // %
  precipitationMm: number;
  sunrise: string;
  sunset: string;
  dayLength: string; // e.g. "12h 16m"
  dayProgressPercent: number; // 0 - 100
  isDay: boolean;
  airQualityIndex?: number;
  airQualityLabel?: string;
}

export interface LocationData {
  city: string;
  state?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  tempC: number;
  condition: string;
  icon: string;
  description: string;
  weatherCode: number;
  details: WeatherDetails;
}

export interface WeatherRecommendation {
  id: string;
  type: 'rain' | 'uv' | 'heat' | 'wind' | 'outdoor' | 'general';
  icon: string;
  title: string;
  description: string;
  priority: number;
}

export interface FullWeatherData {
  location: LocationData;
  current: CurrentWeather;
  rainForecast: RainForecast;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  alerts: WeatherAlert[];
  recommendations: WeatherRecommendation[];
  lastUpdated: number; // Unix timestamp ms
  nextUpdate: number; // Unix timestamp ms
  cachedAt: number;
  fromCache?: boolean;
}

export interface FavoriteLocation extends LocationData {
  id: string;
  customName?: string;
  createdAt: number;
}

export type ThemeOption = 'light' | 'dark' | 'system';
export type TempUnit = 'celsius' | 'fahrenheit';
export type WindUnit = 'kmh' | 'mph' | 'ms';
export type PressureUnit = 'hpa' | 'inhg';
export type PrecipitationUnit = 'mm' | 'inch';
export type HomepageFocus = 'balanced' | 'rain' | 'temperature' | 'outdoor' | 'alerts';

export interface UserPreferences {
  temperatureUnit: TempUnit;
  windUnit: WindUnit;
  pressureUnit: PressureUnit;
  precipitationUnit: PrecipitationUnit;
  theme: ThemeOption;
  homepageFocus: HomepageFocus;
  autoRefresh30Min: boolean;
  notifications: {
    weatherAlerts: boolean;
    rainAlerts: boolean;
    dailySummary: boolean;
    favoriteAlerts: boolean;
  };
  sectionOrder?: string[];
  viewCounts: {
    rain: number;
    hourly: number;
    daily: number;
    details: number;
    map: number;
    alerts: number;
  };
}

export interface GeocodingResult {
  id: number | string;
  name: string;
  admin1?: string; // state
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}
