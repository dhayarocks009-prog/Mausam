import { NextRequest, NextResponse } from 'next/server';
import {
  FullWeatherData,
  WeatherAlert,
  WeatherRecommendation,
  HourlyForecastItem,
  DailyForecastItem,
  RainHourly,
} from '@/types/weather';
import {
  getWindCardinal,
  getUVDescription,
  getWMOInterpretation,
  calculateDayProgress,
} from '@/utils/weatherHelpers';

// In-memory 30-minute server cache
interface ServerCacheEntry {
  data: FullWeatherData;
  cachedAt: number;
}
const serverCache = new Map<string, ServerCacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // Exactly 30 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');
    const city = searchParams.get('city') || 'Puducherry';
    const state = searchParams.get('state') || '';
    const country = searchParams.get('country') || 'India';
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Default coordinates: Puducherry (11.9416, 79.8083)
    const lat = latStr ? parseFloat(latStr) : 11.9416;
    const lon = lonStr ? parseFloat(lonStr) : 79.8083;

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: 'Invalid coordinates provided' }, { status: 400 });
    }

    const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const now = Date.now();

    // Check 30-minute server cache unless forced refresh
    if (!forceRefresh && serverCache.has(cacheKey)) {
      const cached = serverCache.get(cacheKey)!;
      if (now - cached.cachedAt < CACHE_TTL_MS) {
        return NextResponse.json({
          ...cached.data,
          fromCache: true,
        });
      }
    }

    // Secure server-side request to Open-Meteo
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lon.toString());
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m'
    );
    url.searchParams.set(
      'hourly',
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,uv_index,dew_point_2m'
    );
    url.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max'
    );
    url.searchParams.set('timezone', 'auto');

    const res = await fetch(url.toString(), {
      next: { revalidate: 1800 }, // 30 minutes
      headers: {
        'User-Agent': 'MausamWeatherApp/1.0 (mausam-weather-app.internal)',
      },
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const apiData = await res.json();

    // Parse current weather
    const currentRaw = apiData.current;
    const dailyRaw = apiData.daily;
    const hourlyRaw = apiData.hourly;

    const weatherCode = currentRaw.weather_code ?? 0;
    const isDay = currentRaw.is_day === 1;
    const wmo = getWMOInterpretation(weatherCode, isDay);

    // Parse Sunrise & Sunset
    const todaySunrise = dailyRaw.sunrise?.[0] || '2026-09-10T06:02';
    const todaySunset = dailyRaw.sunset?.[0] || '2026-09-10T18:18';
    const { dayLength, progress: dayProgressPercent } = calculateDayProgress(todaySunrise, todaySunset);

    // Determine current hour index in hourly
    const currentIsoHour = currentRaw.time?.substring(0, 13) || '';
    let currentHourIndex = hourlyRaw.time.findIndex((t: string) => t.startsWith(currentIsoHour));
    if (currentHourIndex === -1) currentHourIndex = 0;

    const currentUv = hourlyRaw.uv_index?.[currentHourIndex] ?? (isDay ? 6.5 : 0);
    const uvInfo = getUVDescription(currentUv);
    const currentVisibilityM = hourlyRaw.visibility?.[currentHourIndex] ?? 10000;
    const visibilityKm = Math.round((currentVisibilityM / 1000) * 10) / 10;
    const dewPointC = Math.round(hourlyRaw.dew_point_2m?.[currentHourIndex] ?? 22);

    // 24-hour hourly forecast
    const hourly: HourlyForecastItem[] = [];
    const maxHourlyItems = Math.min(24, hourlyRaw.time.length - currentHourIndex);

    for (let i = 0; i < maxHourlyItems; i++) {
      const idx = currentHourIndex + i;
      const timeStr = hourlyRaw.time[idx];
      const hourDate = new Date(timeStr);
      const hourLabel = i === 0 ? 'Now' : hourDate.toLocaleTimeString([], { hour: 'numeric', hour12: true });
      const hCode = hourlyRaw.weather_code[idx] ?? 0;
      const hIsDay = hourDate.getHours() >= 6 && hourDate.getHours() < 18;
      const hWmo = getWMOInterpretation(hCode, hIsDay);

      hourly.push({
        time: timeStr,
        hourLabel,
        tempC: Math.round(hourlyRaw.temperature_2m[idx]),
        feelsLikeC: Math.round(hourlyRaw.apparent_temperature[idx]),
        condition: hWmo.condition,
        icon: hWmo.icon,
        rainProbability: Math.round(hourlyRaw.precipitation_probability[idx] ?? 0),
        windSpeedKmh: Math.round(hourlyRaw.wind_speed_10m[idx] ?? 0),
        windDirectionDeg: Math.round(hourlyRaw.wind_direction_10m[idx] ?? 0),
        humidity: Math.round(hourlyRaw.relative_humidity_2m[idx] ?? 50),
        uvIndex: hourlyRaw.uv_index?.[idx] ?? 0,
      });
    }

    // 7-day forecast
    const daily: DailyForecastItem[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totalDays = Math.min(7, dailyRaw.time.length);

    for (let i = 0; i < totalDays; i++) {
      const dDate = new Date(dailyRaw.time[i]);
      let dayLabel = dayNames[dDate.getDay()];
      if (i === 0) dayLabel = 'Today';
      else if (i === 1) dayLabel = 'Tomorrow';

      const dCode = dailyRaw.weather_code[i] ?? 0;
      const dWmo = getWMOInterpretation(dCode, true);

      daily.push({
        date: dailyRaw.time[i],
        dayLabel,
        condition: dWmo.condition,
        icon: dWmo.icon,
        maxTempC: Math.round(dailyRaw.temperature_2m_max[i]),
        minTempC: Math.round(dailyRaw.temperature_2m_min[i]),
        rainProbability: Math.round(dailyRaw.precipitation_probability_max[i] ?? 0),
        precipitationMm: Math.round((dailyRaw.precipitation_sum[i] ?? 0) * 10) / 10,
        windSpeedKmh: Math.round(dailyRaw.wind_speed_10m_max[i] ?? 0),
        uvIndex: Math.round(dailyRaw.uv_index_max[i] ?? 5),
        sunrise: dailyRaw.sunrise[i],
        sunset: dailyRaw.sunset[i],
      });
    }

    // Rain Forecast specific analysis
    const rainHourly: RainHourly[] = [];
    const rainItemsCount = Math.min(8, hourly.length);
    let peakRainProb = 0;
    let peakRainHour = '';
    let totalExpectedRainMm = 0;

    for (let i = 0; i < rainItemsCount; i++) {
      const h = hourly[i];
      const rawIdx = currentHourIndex + i;
      const rainMm = hourlyRaw.precipitation?.[rawIdx] ?? 0;
      totalExpectedRainMm += rainMm;

      if (h.rainProbability > peakRainProb) {
        peakRainProb = h.rainProbability;
        peakRainHour = h.hourLabel;
      }

      rainHourly.push({
        time: h.time,
        hour: h.hourLabel,
        probability: h.rainProbability,
        amountMm: Math.round(rainMm * 10) / 10,
        condition: h.condition,
        icon: h.icon,
        isPeak: false,
      });
    }

    // Mark peak rain
    if (peakRainProb > 30 && peakRainHour) {
      const peakItem = rainHourly.find((r) => r.hour === peakRainHour);
      if (peakItem) peakItem.isPeak = true;
    }

    let rainTiming = 'No precipitation expected in the next few hours';
    if (peakRainProb >= 70) {
      rainTiming = `Heavy rainfall likely around ${peakRainHour}`;
    } else if (peakRainProb >= 40) {
      rainTiming = `Rain showers expected around ${peakRainHour}`;
    } else if (peakRainProb >= 20) {
      rainTiming = `Low chance of passing drizzle around ${peakRainHour}`;
    }

    const currentRainProb = hourly[0]?.rainProbability ?? 0;

    // Severe Weather Alert Engine
    const alerts: WeatherAlert[] = [];
    const currentTemp = currentRaw.temperature_2m;
    const windGust = currentRaw.wind_gusts_10m;
    const currentWindSpeed = currentRaw.wind_speed_10m;

    if (weatherCode >= 95 || weatherCode === 96 || weatherCode === 99) {
      alerts.push({
        id: 'alert-thunderstorm',
        title: 'Severe Thunderstorm Warning',
        severity: 'critical',
        description: `Severe thunderstorm with potential lightning and heavy gusts detected in ${city}.`,
        instruction: 'Stay indoors, keep away from windows, and avoid unnecessary travel.',
        startTime: 'Active now',
        endTime: 'Next 3 hours',
        source: 'Mausam Meteorological Service',
      });
    } else if (peakRainProb >= 75 || totalExpectedRainMm >= 25) {
      alerts.push({
        id: 'alert-heavy-rain',
        title: 'Heavy Rainfall Warning',
        severity: 'warning',
        description: `Intense rainfall expected in ${city} between ${peakRainHour} and later this evening.`,
        instruction: 'Stay alert for localized water-logging and avoid low-lying roads.',
        startTime: 'Today',
        endTime: 'Evening',
        source: 'Mausam Meteorological Service',
      });
    } else if (currentTemp >= 38) {
      alerts.push({
        id: 'alert-extreme-heat',
        title: 'Extreme Heat Advisory',
        severity: 'warning',
        description: `Temperatures have reached ${Math.round(currentTemp)}°C with high heat index.`,
        instruction: 'Stay well hydrated, wear lightweight clothing, and limit direct sun exposure.',
        startTime: '11:00 AM',
        endTime: '5:00 PM',
        source: 'Mausam Meteorological Service',
      });
    } else if (windGust >= 55 || currentWindSpeed >= 40) {
      alerts.push({
        id: 'alert-strong-wind',
        title: 'Strong Wind Warning',
        severity: 'advisory',
        description: `High wind gusts up to ${Math.round(windGust)} km/h expected in the area.`,
        instruction: 'Secure loose outdoor items and exercise caution when driving high-sided vehicles.',
        startTime: 'Active',
        source: 'Mausam Meteorological Service',
      });
    } else if (currentUv >= 8) {
      alerts.push({
        id: 'alert-very-high-uv',
        title: 'Very High UV Radiation Alert',
        severity: 'advisory',
        description: `UV Index is currently ${currentUv.toFixed(1)} (${uvInfo.text}). Sunburn can occur rapidly.`,
        instruction: 'Apply SPF 50+ sunscreen, wear UV sunglasses, and seek shade during midday.',
        startTime: '10:00 AM',
        endTime: '4:00 PM',
        source: 'Mausam Health & Climate Desk',
      });
    }

    // Personalized Recommendations Engine
    const recommendations: WeatherRecommendation[] = [];

    if (currentRainProb >= 40 || peakRainProb >= 50) {
      recommendations.push({
        id: 'rec-rain',
        type: 'rain',
        icon: 'umbrella',
        title: 'Carry an Umbrella',
        description: `Rain probability is ${Math.max(currentRainProb, peakRainProb)}% around ${peakRainHour || 'afternoon'}. Carry waterproof gear.`,
        priority: 1,
      });
    }

    if (currentUv >= 6 && isDay) {
      recommendations.push({
        id: 'rec-uv',
        type: 'uv',
        icon: 'sun',
        title: 'UV Protection Recommended',
        description: `UV Index is ${currentUv.toFixed(1)} (${uvInfo.text}). Consider sunglasses and sun protection.`,
        priority: 2,
      });
    }

    if (currentTemp >= 32) {
      recommendations.push({
        id: 'rec-heat',
        type: 'heat',
        icon: 'droplets',
        title: 'Stay Hydrated',
        description: `Current temperature is ${Math.round(currentTemp)}°C (feels like ${Math.round(currentRaw.apparent_temperature)}°C). Drink plenty of water.`,
        priority: 3,
      });
    } else if (currentTemp <= 12) {
      recommendations.push({
        id: 'rec-cold',
        type: 'general',
        icon: 'thermometer',
        title: 'Wear Warm Layers',
        description: `Chilly weather at ${Math.round(currentTemp)}°C. Keep a warm jacket or sweater handy.`,
        priority: 3,
      });
    }

    if (currentWindSpeed >= 25) {
      recommendations.push({
        id: 'rec-wind',
        type: 'wind',
        icon: 'wind',
        title: 'Breezy & Gusty',
        description: `Wind is blowing at ${Math.round(currentWindSpeed)} km/h ${getWindCardinal(currentRaw.wind_direction_10m)}. Take care when cycling.`,
        priority: 4,
      });
    } else if (currentRainProb < 20 && currentTemp >= 20 && currentTemp <= 30 && currentWindSpeed < 20) {
      recommendations.push({
        id: 'rec-outdoor',
        type: 'outdoor',
        icon: 'activity',
        title: 'Ideal Outdoor Weather',
        description: `Pleasant conditions at ${Math.round(currentTemp)}°C with mild wind. Great time for a walk or outdoor workout.`,
        priority: 5,
      });
    }

    const payload: FullWeatherData = {
      location: {
        city,
        state,
        country,
        latitude: lat,
        longitude: lon,
        timezone: apiData.timezone,
      },
      current: {
        tempC: currentRaw.temperature_2m,
        condition: wmo.condition,
        icon: wmo.icon,
        description: wmo.description,
        weatherCode,
        details: {
          humidity: Math.round(currentRaw.relative_humidity_2m),
          feelsLikeC: Math.round(currentRaw.apparent_temperature),
          minTempC: Math.round(dailyRaw.temperature_2m_min?.[0] ?? currentRaw.temperature_2m - 4),
          maxTempC: Math.round(dailyRaw.temperature_2m_max?.[0] ?? currentRaw.temperature_2m + 4),
          pressureHpa: Math.round(currentRaw.pressure_msl ?? currentRaw.surface_pressure ?? 1012),
          visibilityKm,
          uvIndex: currentUv,
          uvDescription: uvInfo.text,
          dewPointC,
          windSpeedKmh: Math.round(currentRaw.wind_speed_10m),
          windDirectionDeg: Math.round(currentRaw.wind_direction_10m),
          windDirectionCardinal: getWindCardinal(currentRaw.wind_direction_10m),
          windGustKmh: Math.round(currentRaw.wind_gusts_10m),
          cloudCoverage: Math.round(currentRaw.cloud_cover),
          precipitationMm: currentRaw.precipitation ?? 0,
          sunrise: todaySunrise,
          sunset: todaySunset,
          dayLength,
          dayProgressPercent,
          isDay,
          airQualityIndex: 42,
          airQualityLabel: 'Good',
        },
      },
      rainForecast: {
        probability: currentRainProb,
        expectedRainfallMm: Math.round(totalExpectedRainMm * 10) / 10,
        rainTiming,
        hourly: rainHourly,
        condition: wmo.condition,
        summary: `${Math.round(currentRainProb)}% chance of rain right now, peaking at ${Math.round(peakRainProb)}% ${peakRainHour ? `around ${peakRainHour}` : ''}`,
      },
      hourly,
      daily,
      alerts,
      recommendations,
      lastUpdated: now,
      nextUpdate: now + CACHE_TTL_MS,
      cachedAt: now,
      fromCache: false,
    };

    // Store in server cache
    serverCache.set(cacheKey, {
      data: payload,
      cachedAt: now,
    });

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Weather API Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve weather data', details: error?.message || 'Network error' },
      { status: 500 }
    );
  }
}
