import { useState, useEffect } from 'react';
import { CloudSun, Droplets, CloudRain, Wind } from 'lucide-react';
import { fetchLiveWeatherData } from '../services/weatherService.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function WeatherCard() {
  const { language } = useLanguage();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchLiveWeatherData(null, language)
      .then((data) => {
        if (mounted) setWeather(data);
      })
      .catch((err) => console.warn('Weather card fetch error:', err));
    return () => {
      mounted = false;
    };
  }, [language]);

  const IconComp = weather?.conditionIcon || CloudSun;
  const temp = weather ? weather.temperature : 28;
  const cond = weather ? weather.condition : (language === 'ta' ? 'பகுதி மேகமூட்டம்' : 'Partly Cloudy');
  const humidity = weather ? weather.humidity : 68;
  const rain = weather ? weather.rainChance : 20;
  const wind = weather ? weather.wind : 12;
  const msg = weather ? weather.advisory : (language === 'ta' ? 'அடுத்த 3 நாட்களுக்கு கனமழை இல்லை.' : 'No heavy rain expected in the next 3 days.');

  return (
    <div className="weather-mini">
      <div className="weather-mini__top">
        <div>
          <div className="weather-mini__temp">{temp}°C</div>
          <div className="weather-mini__cond">{cond}</div>
        </div>
        <IconComp size={42} strokeWidth={1.6} />
      </div>

      <div className="weather-mini__stats">
        <div className="weather-mini__stat">
          <span><Droplets size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> {language === 'ta' ? 'ஈரப்பதம்' : 'Humidity'}</span>
          <strong>{humidity}%</strong>
        </div>
        <div className="weather-mini__stat">
          <span><CloudRain size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> {language === 'ta' ? 'மழை' : 'Rain'}</span>
          <strong>{rain}%</strong>
        </div>
        <div className="weather-mini__stat">
          <span><Wind size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> {language === 'ta' ? 'காற்று' : 'Wind'}</span>
          <strong>{wind} km/h</strong>
        </div>
      </div>

      <div className="weather-mini__msg">
        <CloudRain size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{msg}</span>
      </div>
    </div>
  );
}