import { FullWeatherData, HomepageFocus, UserPreferences } from '@/types/weather';

export type DashboardSectionId = 'alerts' | 'current' | 'recommendations' | 'rain' | 'hourly' | 'daily' | 'details' | 'sun';

export class PersonalizationEngine {
  /**
   * Computes the prioritized order of dashboard sections based on:
   * 1. Active severe weather alerts (always floats to top if critical/warning)
   * 2. High imminent rain probability (floats rain card right under current)
   * 3. User's explicit focus preference
   * 4. User's recorded interaction frequency (viewCounts)
   */
  static getDynamicSectionOrder(weather: FullWeatherData | null, preferences: UserPreferences): DashboardSectionId[] {
    const defaultOrder: DashboardSectionId[] = [
      'alerts',
      'current',
      'recommendations',
      'rain',
      'hourly',
      'daily',
      'details',
      'sun',
    ];

    if (!weather) return defaultOrder;

    const sections: DashboardSectionId[] = [...defaultOrder];
    const hasActiveAlerts = weather.alerts && weather.alerts.length > 0;
    const hasImminentRain = weather.rainForecast && (weather.rainForecast.probability >= 50 || weather.rainForecast.expectedRainfallMm >= 5);

    // Rule 1: Severe Weather Alert is top priority when active
    if (!hasActiveAlerts) {
      // If no alerts, alerts section can stay at top or be hidden
    }

    // Rule 2: User explicit focus setting
    const focus = preferences.homepageFocus;

    if (focus === 'rain' || hasImminentRain) {
      // Elevate rain forecast to immediately after current weather & recommendations
      const rainIdx = sections.indexOf('rain');
      if (rainIdx > -1) {
        sections.splice(rainIdx, 1);
        const insertPos = sections.indexOf('current') + 1;
        sections.splice(insertPos, 0, 'rain');
      }
    } else if (focus === 'temperature') {
      // Elevate hourly and daily right under current
      const hourlyIdx = sections.indexOf('hourly');
      if (hourlyIdx > -1) {
        sections.splice(hourlyIdx, 1);
        const currentIdx = sections.indexOf('current');
        sections.splice(currentIdx + 1, 0, 'hourly');
      }
    } else if (focus === 'outdoor') {
      // Elevate recommendations and details (UV/Wind)
      const recIdx = sections.indexOf('recommendations');
      const detailsIdx = sections.indexOf('details');
      if (recIdx > -1 && detailsIdx > -1) {
        sections.splice(detailsIdx, 1);
        sections.splice(sections.indexOf('current') + 1, 0, 'details');
      }
    } else if (focus === 'alerts' && hasActiveAlerts) {
      // Keep alerts at index 0
      const alertIdx = sections.indexOf('alerts');
      if (alertIdx > 0) {
        sections.splice(alertIdx, 1);
        sections.unshift('alerts');
      }
    }

    // Rule 3: Implicit frequency bias (if user views rain card more than 5 times)
    const counts = preferences.viewCounts;
    if (counts.rain > counts.hourly && counts.rain > 5 && !sections.slice(0, 3).includes('rain')) {
      const rIdx = sections.indexOf('rain');
      if (rIdx > -1) {
        sections.splice(rIdx, 1);
        sections.splice(2, 0, 'rain');
      }
    }

    return sections;
  }

  /**
   * Generates a greeting string based on local time and weather condition
   */
  static getPersonalizedGreeting(city: string, condition: string, isDay: boolean): string {
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon';
    else if (hour >= 17 && hour < 22) timeGreeting = 'Good Evening';
    else if (hour >= 22 || hour < 5) timeGreeting = 'Good Night';

    return `${timeGreeting} • Weather in ${city}`;
  }
}
