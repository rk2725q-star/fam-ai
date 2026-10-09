/**
 * Real Live Weather Service for Farm AI
 * Powered by Open-Meteo (100% Free, No API Key Required, Worldwide Live Data)
 */

import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
} from 'lucide-react';

export const DEFAULT_LOCATION = {
  name: 'Coimbatore',
  region: 'Tamil Nadu',
  country: 'India',
  lat: 11.0055,
  lon: 76.9661,
};

export function getSavedLocation() {
  try {
    const raw = localStorage.getItem('farm_ai_weather_location');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_LOCATION;
}

export function saveLocation(loc) {
  try {
    localStorage.setItem('farm_ai_weather_location', JSON.stringify(loc));
  } catch (e) {}
}

/**
 * WMO Weather code mapper
 */
export function interpretWeatherCode(code, isDay = 1, lang = 'en') {
  const isTa = lang === 'ta';

  if (code === 0) {
    return {
      condition: isTa ? 'தெளிவான வெயில்' : 'Clear & Sunny',
      icon: Sun,
    };
  }
  if (code === 1 || code === 2) {
    return {
      condition: isTa ? 'பகுதி மேகமூட்டம்' : 'Partly Cloudy',
      icon: CloudSun,
    };
  }
  if (code === 3) {
    return {
      condition: isTa ? 'முழு மேகமூட்டம்' : 'Overcast',
      icon: Cloud,
    };
  }
  if (code === 45 || code === 48) {
    return {
      condition: isTa ? 'பனிமூட்டம்' : 'Foggy',
      icon: Cloud,
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      condition: isTa ? 'சாரல் மழை' : 'Light Drizzle',
      icon: CloudDrizzle,
    };
  }
  if (code >= 61 && code <= 67) {
    return {
      condition: isTa ? 'மழை' : 'Rain',
      icon: CloudRain,
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      condition: isTa ? 'கனமழை பொழிவு' : 'Heavy Showers',
      icon: CloudRain,
    };
  }
  if (code >= 95 && code <= 99) {
    return {
      condition: isTa ? 'இடியுடன் கூடிய மழை' : 'Thunderstorm',
      icon: CloudLightning,
    };
  }

  return {
    condition: isTa ? 'மிதமான வானிலை' : 'Fair Weather',
    icon: CloudSun,
  };
}

/**
 * Fetch real live weather from Open-Meteo
 */
export async function fetchLiveWeatherData(location = null, lang = 'en') {
  const loc = location || getSavedLocation();
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather service returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;
  const daily = data.daily;

  const currentInfo = interpretWeatherCode(current.weather_code, current.is_day, lang);
  const isTa = lang === 'ta';

  // Format 7-Day Forecast
  const daysList = [];
  const dayNames = isTa
    ? ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (daily && daily.time) {
    for (let i = 0; i < daily.time.length && i < 7; i++) {
      const dateObj = new Date(daily.time[i]);
      let dayLabel = i === 0 ? (isTa ? 'இன்று' : 'Today') : i === 1 ? (isTa ? 'நாளை' : 'Tomorrow') : dayNames[dateObj.getDay()];
      const dayCode = daily.weather_code[i];
      const dayInfo = interpretWeatherCode(dayCode, 1, lang);
      const maxT = Math.round(daily.temperature_2m_max[i]);
      const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : Math.round(daily.precipitation_sum[i] * 10);

      daysList.push({
        day: dayLabel,
        date: dateObj.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', { day: 'numeric', month: 'short' }),
        temp: maxT,
        rain: rainProb || 0,
        icon: dayInfo.icon,
        condition: dayInfo.condition,
      });
    }
  }

  // Dynamic Agricultural Advisory
  const temp = Math.round(current.temperature_2m);
  const humidity = current.relative_humidity_2m;
  const wind = Math.round(current.wind_speed_10m);
  const rainProb = daysList[0]?.rain || 0;

  let advisoryText = '';
  if (rainProb >= 50) {
    advisoryText = isTa
      ? 'இன்று மழைக்கு அதிக வாய்ப்பு உள்ளது. உரம் இடுதல் மற்றும் பூச்சிக்கொல்லி தெளிப்பதை தள்ளிப்போடவும். வயலில் வடிகால் வசதியை உறுதி செய்யவும்.'
      : 'High rain chance expected today. Postpone fertilizer/pesticide spraying and ensure proper drainage in your fields.';
  } else if (temp >= 35) {
    advisoryText = isTa
      ? 'வெப்பம் அதிகமாக உள்ளது. பயிர்களுக்கு அதிகாலை அல்லது மாலை வேளையில் நீர் பாய்ச்சுவது சிறந்தது.'
      : 'High temperatures recorded. Irrigate during early morning or evening hours to minimize evaporation.';
  } else if (wind >= 18) {
    advisoryText = isTa
      ? 'காற்று வேகமாக வீசுகிறது. மருந்து தெளிப்பதை தவிர்க்கவும், வாழை போன்ற பயிர்களுக்கு முட்டு கொடுக்கவும்.'
      : 'Strong winds detected. Avoid spraying activities to prevent spray drift; provide support to banana or tall crops.';
  } else {
    advisoryText = isTa
      ? 'வயல் வேலைகளுக்கு சாதகமான வானிலை நிலவுகிறது. உரம் இடுதல், பூச்சி கண்காணிப்பு மற்றும் வழக்கமான பாசனத்தை தொடரலாம்.'
      : 'Favorable field conditions today. Good time for regular irrigation, fertilizer top-dressing, and crop scouting.';
  }

  const considerations = [
    {
      icon: CloudRain,
      title: isTa ? 'மழை வாய்ப்பு' : 'Rain Risk',
      detail: isTa ? `${rainProb}% வாய்ப்பு இன்று.` : `${rainProb}% probability today.`,
    },
    {
      icon: Droplets,
      title: isTa ? 'ஈரப்பதம்' : 'Air Humidity',
      detail: humidity > 75 
        ? (isTa ? `${humidity}% — பூஞ்சான நோய் அபாயம் அதிகம்.` : `${humidity}% — elevated fungal risk.`)
        : (isTa ? `${humidity}% — சாதகமான நிலை.` : `${humidity}% — optimal range.`),
    },
    {
      icon: Thermometer,
      title: isTa ? 'வெப்பநிலை' : 'Temperature',
      detail: isTa ? `${temp}°C நிலவுகிறது.` : `${temp}°C currently.`,
    },
    {
      icon: Wind,
      title: isTa ? 'காற்று வேகம்' : 'Wind Speed',
      detail: wind > 15
        ? (isTa ? `${wind} km/h — மருந்து தெளிப்பதை தவிர்க்கவும்.` : `${wind} km/h — avoid chemical spraying.`)
        : (isTa ? `${wind} km/h — தெளிப்புக்கு உகந்தது.` : `${wind} km/h — safe for spraying.`),
    },
  ];

  return {
    location: `${loc.name}${loc.region ? ', ' + loc.region : ''}`,
    locationObj: loc,
    temperature: temp,
    condition: currentInfo.condition,
    conditionIcon: currentInfo.icon,
    humidity,
    rainChance: rainProb,
    wind,
    advisory: advisoryText,
    forecast: daysList,
    considerations,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Geocoding search for any city or region worldwide
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((r) => ({
      name: r.name,
      region: r.admin1 || '',
      country: r.country || '',
      lat: r.latitude,
      lon: r.longitude,
    }));
  } catch (err) {
    console.warn('City search failed:', err);
    return [];
  }
}

/**
 * Intelligent hybrid live location detection:
 * 1. Attempts browser GPS with reverse-geocoding (high accuracy when permitted)
 * 2. Falls back to GeoJS / BigDataCloud IP geolocation (100% reliable on PC/mobile without permission prompts)
 */
export async function detectLiveCurrentLocation() {
  // Strategy 1: Try browser GPS (navigator.geolocation)
  const tryGps = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            // Reverse geocode via BigDataCloud to get real city name
            const revRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            const revData = await revRes.json();
            const cityName =
              revData.city ||
              revData.locality ||
              revData.localityInfo?.administrative?.[2]?.name ||
              revData.principalSubdivision ||
              'Current Location';
            const region = revData.principalSubdivision || '';
            resolve({
              name: cityName,
              region,
              country: revData.countryName || 'India',
              lat,
              lon,
              source: 'GPS',
            });
          } catch (e) {
            resolve({
              name: 'Current Location',
              region: '',
              country: '',
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              source: 'GPS',
            });
          }
        },
        (err) => reject(err),
        { timeout: 4500, maximumAge: 300000, enableHighAccuracy: false }
      );
    });

  try {
    const gpsLocation = await tryGps();
    if (gpsLocation && gpsLocation.lat) {
      return gpsLocation;
    }
  } catch (gpsError) {
    console.info('GPS unavailable or denied, falling back to IP network location:', gpsError?.message);
  }

  // Strategy 2: Fast & reliable IP-based geolocation via GeoJS (Never prompts, works 100% on PC & Mobile)
  try {
    const geoRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (geoRes.ok) {
      const geo = await geoRes.json();
      const lat = parseFloat(geo.latitude);
      const lon = parseFloat(geo.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        return {
          name: geo.city || geo.region || 'Current Location',
          region: geo.region || '',
          country: geo.country || 'India',
          lat,
          lon,
          source: 'Network',
        };
      }
    }
  } catch (geoErr) {
    console.warn('GeoJS IP lookup failed:', geoErr);
  }

  // Strategy 3: BigDataCloud IP fallback
  try {
    const bdcRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
    if (bdcRes.ok) {
      const bdc = await bdcRes.json();
      if (bdc.latitude && bdc.longitude) {
        return {
          name: bdc.city || bdc.locality || 'Current Location',
          region: bdc.principalSubdivision || '',
          country: bdc.countryName || 'India',
          lat: bdc.latitude,
          lon: bdc.longitude,
          source: 'Network',
        };
      }
    }
  } catch (bdcErr) {
    console.warn('BigDataCloud IP lookup failed:', bdcErr);
  }

  // Fallback to default
  return DEFAULT_LOCATION;
}

