import {
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Clock,
  TrendingDown,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';
import { CurrentPollutants, WeatherData } from '../types';

export interface EnvironmentalMetricCard {
  label: string;
  val: string;
  unit: string;
  desc: string;
  icon: LucideIcon;
  status: string;
  isElevated: boolean;
}

export interface DashboardNavCard {
  tab: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  badge: string;
}

const PM25_ELEVATED_THRESHOLD = 60;
const PM10_ELEVATED_THRESHOLD = 100;
const OZONE_ELEVATED_THRESHOLD = 100;
const COOL_TRAP_TEMP_THRESHOLD = 15;
const HIGH_RH_THRESHOLD = 75;
const LOW_WIND_THRESHOLD = 6;

export const DASHBOARD_NAV_CARDS: DashboardNavCard[] = [
  {
    tab: 'timeline',
    title: 'Hourly Pollution Trend',
    desc: 'View 24-hour smog forecast curve and safe exercise windows.',
    icon: Clock,
    badge: 'Hourly',
  },
  {
    tab: 'comparator',
    title: 'Choose Cleaner Option',
    desc: 'Compare solo car vs metro vs carpool emissions & cost.',
    icon: TrendingDown,
    badge: 'Decision Tool',
  },
  {
    tab: 'indoor',
    title: 'Indoor Air Quality Hub',
    desc: 'Window timing, HEPA filtration hacks, and cooking checklist.',
    icon: ShieldCheck,
    badge: 'Checklist',
  },
  {
    tab: 'family',
    title: 'Family Air Safety',
    desc: 'Specific protective guidelines for kids, seniors, and asthma.',
    icon: Wind,
    badge: 'Family Mode',
  },
];

/** Builds live pollutant and meteorological metric cards for DashboardPage. */
export function buildEnvironmentalMetrics(
  airQuality: CurrentPollutants,
  weather: WeatherData
): EnvironmentalMetricCard[] {
  const isCoolTrap = weather.temperature < COOL_TRAP_TEMP_THRESHOLD;
  const isHighHumidity = weather.humidity > HIGH_RH_THRESHOLD;
  const isLowWind = weather.windSpeed < LOW_WIND_THRESHOLD;

  return [
    {
      label: 'PM2.5 (Fine Particles)',
      val: `${airQuality.pm2_5}`,
      unit: 'µg/m³',
      desc: 'Penetrates deep into lungs',
      icon: Wind,
      status: airQuality.pm2_5 > PM25_ELEVATED_THRESHOLD ? 'Elevated' : 'Normal',
      isElevated: airQuality.pm2_5 > PM25_ELEVATED_THRESHOLD,
    },
    {
      label: 'PM10 (Coarse Dust)',
      val: `${airQuality.pm10}`,
      unit: 'µg/m³',
      desc: 'Road & construction dust',
      icon: Wind,
      status: airQuality.pm10 > PM10_ELEVATED_THRESHOLD ? 'Elevated' : 'Normal',
      isElevated: airQuality.pm10 > PM10_ELEVATED_THRESHOLD,
    },
    {
      label: 'Ozone (O₃)',
      val: `${airQuality.ozone}`,
      unit: 'µg/m³',
      desc: 'Photochemical smog gas',
      icon: Gauge,
      status: airQuality.ozone > OZONE_ELEVATED_THRESHOLD ? 'Elevated' : 'Normal',
      isElevated: airQuality.ozone > OZONE_ELEVATED_THRESHOLD,
    },
    {
      label: 'Temperature',
      val: `${weather.temperature}`,
      unit: '°C',
      desc: 'Thermal boundary layer',
      icon: Thermometer,
      status: isCoolTrap ? 'Cool Trap' : 'Normal',
      isElevated: isCoolTrap,
    },
    {
      label: 'Relative Humidity',
      val: `${weather.humidity}`,
      unit: '%',
      desc: 'Aerosol moisture trap',
      icon: Droplets,
      status: isHighHumidity ? 'High RH' : 'Normal',
      isElevated: isHighHumidity,
    },
    {
      label: 'Wind Speed',
      val: `${weather.windSpeed}`,
      unit: 'km/h',
      desc: isLowWind ? 'Stagnant dispersion' : 'Active ventilation',
      icon: Wind,
      status: isLowWind ? 'Low Trap' : 'Normal',
      isElevated: isLowWind,
    },
  ];
}
