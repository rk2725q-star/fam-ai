import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  Wind,
  Droplets,
  Thermometer,
} from 'lucide-react';

export const currentWeather = {
  location: 'Coimbatore, TN',
  temperature: 28,
  condition: 'Partly Cloudy',
  humidity: 68,
  rainChance: 20,
  wind: 12,
  message: 'No heavy rain expected in the next 3 days.',
};

export const forecast = [
  { day: 'Today', date: '12 Jul', temp: 28, rain: 20, icon: CloudSun, condition: 'Partly Cloudy' },
  { day: 'Tomorrow', date: '13 Jul', temp: 29, rain: 15, icon: Sun, condition: 'Sunny' },
  { day: 'Day 3', date: '14 Jul', temp: 27, rain: 35, icon: Cloud, condition: 'Cloudy' },
  { day: 'Day 4', date: '15 Jul', temp: 26, rain: 60, icon: CloudRain, condition: 'Light Rain' },
  { day: 'Day 5', date: '16 Jul', temp: 25, rain: 70, icon: CloudRain, condition: 'Rain' },
  { day: 'Day 6', date: '17 Jul', temp: 27, rain: 40, icon: CloudDrizzle, condition: 'Drizzle' },
  { day: 'Day 7', date: '18 Jul', temp: 28, rain: 25, icon: CloudSun, condition: 'Partly Cloudy' },
];

export const farmingConsiderations = [
  {
    icon: CloudRain,
    title: 'Rain',
    detail: '20% chance today. No heavy rain in 3 days.',
  },
  {
    icon: Droplets,
    title: 'Soil Moisture',
    detail: 'Adequate. Light irrigation tomorrow.',
  },
  {
    icon: Thermometer,
    title: 'Temperature',
    detail: '28°C — favorable for most crops.',
  },
  {
    icon: Wind,
    title: 'Wind',
    detail: '12 km/h — low risk of drift.',
  },
];

export const irrigationForecast = [
  { day: 'Mon', rain: 20, recommendation: 'No Need' },
  { day: 'Tue', rain: 15, recommendation: 'Irrigate' },
  { day: 'Wed', rain: 35, recommendation: 'No Need' },
  { day: 'Thu', rain: 60, recommendation: 'No Need' },
  { day: 'Fri', rain: 70, recommendation: 'No Need' },
  { day: 'Sat', rain: 40, recommendation: 'Irrigate' },
  { day: 'Sun', rain: 25, recommendation: 'No Need' },
];