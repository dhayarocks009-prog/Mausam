'use client';

import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Snowflake,
  Wind,
  Droplets,
  Umbrella,
  Thermometer,
  Compass,
  Eye,
  Activity,
  Zap,
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  name,
  size = 24,
  className = '',
  color,
}) => {
  const iconProps = {
    size,
    className,
    style: color ? { color } : undefined,
  };

  switch (name.toLowerCase()) {
    case 'sun':
      return <Sun {...iconProps} color={color || '#f59e0b'} />;
    case 'moon':
      return <Moon {...iconProps} color={color || '#93c5fd'} />;
    case 'cloud-sun':
      return <CloudSun {...iconProps} color={color || '#38bdf8'} />;
    case 'cloud-moon':
      return <CloudMoon {...iconProps} color={color || '#818cf8'} />;
    case 'cloud':
      return <Cloud {...iconProps} color={color || '#94a3b8'} />;
    case 'cloud-drizzle':
      return <CloudDrizzle {...iconProps} color={color || '#38bdf8'} />;
    case 'cloud-rain':
      return <CloudRain {...iconProps} color={color || '#0284c7'} />;
    case 'cloud-lightning':
      return <CloudLightning {...iconProps} color={color || '#eab308'} />;
    case 'cloud-fog':
      return <CloudFog {...iconProps} color={color || '#cbd5e1'} />;
    case 'snowflake':
      return <Snowflake {...iconProps} color={color || '#a5f3fc'} />;
    case 'wind':
      return <Wind {...iconProps} color={color || '#38bdf8'} />;
    case 'droplets':
      return <Droplets {...iconProps} color={color || '#38bdf8'} />;
    case 'umbrella':
      return <Umbrella {...iconProps} color={color || '#00d2ff'} />;
    case 'thermometer':
      return <Thermometer {...iconProps} color={color || '#f97316'} />;
    case 'compass':
      return <Compass {...iconProps} color={color || '#00d2ff'} />;
    case 'eye':
      return <Eye {...iconProps} color={color || '#94a3b8'} />;
    case 'activity':
      return <Activity {...iconProps} color={color || '#10b981'} />;
    case 'zap':
      return <Zap {...iconProps} color={color || '#eab308'} />;
    default:
      return <Sun {...iconProps} color={color || '#f59e0b'} />;
  }
};
