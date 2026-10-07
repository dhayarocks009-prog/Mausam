import { TempUnit, WindUnit, PressureUnit, PrecipitationUnit } from '@/types/weather';

export function getWindCardinal(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

export function formatTemp(tempC: number, unit: TempUnit = 'celsius'): string {
  if (unit === 'fahrenheit') {
    const f = Math.round((tempC * 9) / 5 + 32);
    return `${f}°F`;
  }
  return `${Math.round(tempC)}°C`;
}

export function formatTempNumber(tempC: number, unit: TempUnit = 'celsius'): number {
  if (unit === 'fahrenheit') {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
}

export function formatWind(speedKmh: number, unit: WindUnit = 'kmh'): string {
  if (unit === 'mph') {
    return `${Math.round(speedKmh * 0.621371)} mph`;
  }
  if (unit === 'ms') {
    return `${(speedKmh / 3.6).toFixed(1)} m/s`;
  }
  return `${Math.round(speedKmh)} km/h`;
}

export function formatPressure(pressureHpa: number, unit: PressureUnit = 'hpa'): string {
  if (unit === 'inhg') {
    return `${(pressureHpa * 0.02953).toFixed(2)} inHg`;
  }
  return `${Math.round(pressureHpa)} hPa`;
}

export function formatPrecipitation(amountMm: number, unit: PrecipitationUnit = 'mm'): string {
  if (unit === 'inch') {
    return `${(amountMm * 0.0393701).toFixed(2)} in`;
  }
  return `${amountMm.toFixed(1)} mm`;
}

export function getUVDescription(uv: number): { text: string; level: 'low' | 'moderate' | 'high' | 'very-high' | 'extreme'; color: string } {
  if (uv < 3) return { text: 'Low', level: 'low', color: '#10b981' };
  if (uv < 6) return { text: 'Moderate', level: 'moderate', color: '#f59e0b' };
  if (uv < 8) return { text: 'High', level: 'high', color: '#f97316' };
  if (uv < 11) return { text: 'Very High', level: 'very-high', color: '#ef4444' };
  return { text: 'Extreme', level: 'extreme', color: '#9333ea' };
}

export function getWMOInterpretation(code: number, isDay: boolean = true): {
  condition: string;
  description: string;
  icon: string;
  weatherType: 'clear' | 'partly-cloudy' | 'cloudy' | 'rain' | 'thunderstorm' | 'snow' | 'fog';
} {
  switch (code) {
    case 0:
      return {
        condition: isDay ? 'Sunny' : 'Clear',
        description: isDay ? 'Clear blue sky with abundant sunshine' : 'Clear night sky with visible stars',
        icon: isDay ? 'sun' : 'moon',
        weatherType: 'clear',
      };
    case 1:
      return {
        condition: isDay ? 'Mainly Sunny' : 'Mainly Clear',
        description: 'Mostly clear with faint, scattered clouds',
        icon: isDay ? 'sun' : 'moon',
        weatherType: 'clear',
      };
    case 2:
      return {
        condition: 'Partly Cloudy',
        description: 'Scattered clouds with periods of sun',
        icon: isDay ? 'cloud-sun' : 'cloud-moon',
        weatherType: 'partly-cloudy',
      };
    case 3:
      return {
        condition: 'Overcast',
        description: 'Dense cloud cover spanning the sky',
        icon: 'cloud',
        weatherType: 'cloudy',
      };
    case 45:
    case 48:
      return {
        condition: 'Foggy',
        description: 'Mist and fog reducing ground visibility',
        icon: 'cloud-fog',
        weatherType: 'fog',
      };
    case 51:
    case 53:
    case 55:
      return {
        condition: 'Drizzle',
        description: 'Light, steady misting drizzle',
        icon: 'cloud-drizzle',
        weatherType: 'rain',
      };
    case 61:
      return {
        condition: 'Light Rain',
        description: 'Light rainfall with damp streets',
        icon: 'cloud-rain',
        weatherType: 'rain',
      };
    case 63:
      return {
        condition: 'Moderate Rain',
        description: 'Steady rainfall across the area',
        icon: 'cloud-rain',
        weatherType: 'rain',
      };
    case 65:
      return {
        condition: 'Heavy Rain',
        description: 'Intense, heavy downpour with puddling',
        icon: 'cloud-rain',
        weatherType: 'rain',
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        condition: 'Snow',
        description: 'Snowfall accumulating on surfaces',
        icon: 'snowflake',
        weatherType: 'snow',
      };
    case 80:
    case 81:
    case 82:
      return {
        condition: 'Rain Showers',
        description: 'Intermittent rain showers with changing intensity',
        icon: 'cloud-rain',
        weatherType: 'rain',
      };
    case 85:
    case 86:
      return {
        condition: 'Snow Showers',
        description: 'Passing snow flurries and showers',
        icon: 'snowflake',
        weatherType: 'snow',
      };
    case 95:
      return {
        condition: 'Thunderstorm',
        description: 'Thunderstorm with gusty winds and lightning',
        icon: 'cloud-lightning',
        weatherType: 'thunderstorm',
      };
    case 96:
    case 99:
      return {
        condition: 'Severe Thunderstorm',
        description: 'Violent thunderstorm with potential hail and gale winds',
        icon: 'cloud-lightning',
        weatherType: 'thunderstorm',
      };
    default:
      return {
        condition: 'Partly Cloudy',
        description: 'Moderate cloud cover with variable conditions',
        icon: 'cloud-sun',
        weatherType: 'partly-cloudy',
      };
  }
}

export function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  if (diffMs < 60000) return 'Just now';
  const mins = Math.floor(diffMs / 60000);
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return '1 hour ago';
  return `${hours} hours ago`;
}

export function calculateDayProgress(sunrise: string, sunset: string): { dayLength: string; progress: number } {
  try {
    const parseTimeToMinutes = (str: string) => {
      // accepts "06:02" or ISO datetime
      let timePart = str;
      if (str.includes('T')) {
        timePart = str.split('T')[1].substring(0, 5);
      }
      const [h, m] = timePart.split(':').map(Number);
      return h * 60 + m;
    };

    const sunriseMins = parseTimeToMinutes(sunrise);
    const sunsetMins = parseTimeToMinutes(sunset);
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    let lengthMins = sunsetMins - sunriseMins;
    if (lengthMins < 0) lengthMins += 24 * 60;
    const hours = Math.floor(lengthMins / 60);
    const mins = lengthMins % 60;
    const dayLength = `${hours}h ${mins}m`;

    let progress = 0;
    if (nowMins >= sunriseMins && nowMins <= sunsetMins) {
      progress = Math.round(((nowMins - sunriseMins) / lengthMins) * 100);
    } else if (nowMins > sunsetMins) {
      progress = 100;
    }

    return { dayLength, progress: Math.min(100, Math.max(0, progress)) };
  } catch {
    return { dayLength: '12h 16m', progress: 50 };
  }
}
