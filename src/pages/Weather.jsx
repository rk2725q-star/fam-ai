import { useState, useEffect } from 'react';
import {
  MapPin,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  CloudSun,
  RefreshCw,
  Search,
  Navigation,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Modal from '../components/Modal.jsx';
import {
  fetchLiveWeatherData,
  getSavedLocation,
  saveLocation,
  searchCities,
  detectLiveCurrentLocation,
  DEFAULT_LOCATION,
} from '../services/weatherService.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Weather() {
  const { language } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(getSavedLocation());

  // Location Modal State
  const [showLocModal, setShowLocModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const loadWeather = async (loc = location) => {
    try {
      setLoading(true);
      const data = await fetchLiveWeatherData(loc, language);
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(location);
  }, [location, language]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWeather(location);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchCities(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSelectLocation = (loc) => {
    saveLocation(loc);
    setLocation(loc);
    setShowLocModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDetectLiveLocation = async () => {
    setGpsLoading(true);
    try {
      const loc = await detectLiveCurrentLocation();
      handleSelectLocation(loc);
    } catch (err) {
      console.warn('Live location detection error:', err);
      alert(
        language === 'ta'
          ? 'நேரலை இருப்பிடத்தை கண்டறிய இயலவில்லை. கீழே உள்ள நகரத்தைத் தேர்வு செய்யவும்.'
          : 'Could not auto-detect location. Please select your city from the list.'
      );
    } finally {
      setGpsLoading(false);
    }
  };

  const isTa = language === 'ta';
  const IconComponent = weather?.conditionIcon || CloudSun;

  return (
    <>
      <div className="page-header page-header__row">
        <div>
          <h1>{isTa ? 'நேரலை வானிலை தகவல்' : 'Live Weather Information'}</h1>
          <p>
            {isTa
              ? 'உங்கள் பண்ணை இருப்பிடத்திற்கான நேரலை வானிலை மற்றும் முன்னறிவிப்பு.'
              : 'Real-time conditions and 7-day forecast powered by Open-Meteo.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 13.5,
              color: 'var(--text-2)',
              fontWeight: 500,
            }}
          >
            <MapPin size={15} color="var(--green-700)" /> {weather?.location || location.name}
          </span>
          <button
            className="btn btn--outline btn--sm"
            onClick={() => setShowLocModal(true)}
          >
            {isTa ? 'இருப்பிடம் மாற்றுக' : 'Change Location'}
          </button>
          <button
            className="btn btn--outline btn--sm"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh live weather"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? (isTa ? 'புதுப்பிக்கிறது...' : 'Updating...') : (isTa ? 'புதுப்பி' : 'Refresh')}</span>
          </button>
        </div>
      </div>

      {loading && !weather ? (
        <div className="card card--pad" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px', color: 'var(--green-700)' }} />
          <p style={{ color: 'var(--text-2)' }}>
            {isTa ? 'நேரலை வானிலை தகவலைப் பெறுகிறது...' : 'Fetching live weather data...'}
          </p>
        </div>
      ) : weather ? (
        <>
          {/* Current Weather Card */}
          <section className="weather-now">
            <div className="weather-now__main">
              <div className="weather-now__icon">
                <IconComponent size={48} strokeWidth={1.5} />
              </div>
              <div>
                <div className="weather-now__temp">{weather.temperature}°C</div>
                <div className="weather-now__cond">{weather.condition}</div>
                <div className="weather-now__loc">
                  <MapPin size={13} /> {weather.location}
                  {weather.lastUpdated && (
                    <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.8 }}>
                      • {isTa ? 'புதுப்பிக்கப்பட்டது:' : 'Updated:'} {weather.lastUpdated}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="weather-now__stats">
              <div className="weather-stat">
                <div className="weather-stat__label">
                  <Droplets size={12} /> {isTa ? 'ஈரப்பதம்' : 'Humidity'}
                </div>
                <div className="weather-stat__value">{weather.humidity}%</div>
              </div>
              <div className="weather-stat">
                <div className="weather-stat__label">
                  <CloudRain size={12} /> {isTa ? 'மழை வாய்ப்பு' : 'Rain Chance'}
                </div>
                <div className="weather-stat__value">{weather.rainChance}%</div>
              </div>
              <div className="weather-stat">
                <div className="weather-stat__label">
                  <Wind size={12} /> {isTa ? 'காற்று' : 'Wind'}
                </div>
                <div className="weather-stat__value">{weather.wind} km/h</div>
              </div>
            </div>
          </section>

          {/* 7-Day Forecast */}
          <div className="section-head" style={{ marginTop: 24 }}>
            <h2>{isTa ? '7-நாள் வானிலை முன்னறிவிப்பு' : '7-Day Forecast'}</h2>
          </div>
          <section className="forecast-grid">
            {weather.forecast.map((d, index) => {
              const DayIcon = d.icon || CloudSun;
              return (
                <div className="forecast-day" key={index}>
                  <div className="forecast-day__name">{d.day}</div>
                  <div className="forecast-day__date">{d.date}</div>
                  <div className="forecast-day__icon">
                    <DayIcon size={24} />
                  </div>
                  <div className="forecast-day__temp">{d.temp}°C</div>
                  <div className="forecast-day__rain">
                    <CloudRain size={12} /> {d.rain}%
                  </div>
                </div>
              );
            })}
          </section>

          {/* Agricultural Advisory */}
          <section className="advisory" style={{ marginTop: 24 }}>
            <div className="advisory__banner">
              <div className="advisory__banner-icon">
                <CloudSun size={22} />
              </div>
              <div>
                <h3>{isTa ? 'விவசாய வானிலை வழிகாட்டி' : 'Agricultural Advisory'}</h3>
                <p>{weather.advisory}</p>
              </div>
            </div>

            <div className="advisory__grid">
              {weather.considerations.map((f, i) => {
                const ItemIcon = f.icon || CloudRain;
                return (
                  <div className="advisory__item" key={i}>
                    <div className="advisory__item-icon">
                      <ItemIcon size={18} />
                    </div>
                    <div>
                      <h4>{f.title}</h4>
                      <p>{f.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : null}

      {/* Change Location Modal */}
      {showLocModal && (
        <Modal
          title={isTa ? 'இருப்பிடம் தேர்வு செய்க' : 'Select Farm Location'}
          onClose={() => setShowLocModal(false)}
          footer={
            <button className="btn btn--outline" onClick={() => setShowLocModal(false)}>
              {isTa ? 'மூடு' : 'Close'}
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Live Location Button (Hybrid GPS + Network) */}
            <button
              type="button"
              className="btn btn--primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 600,
              }}
              onClick={handleDetectLiveLocation}
              disabled={gpsLoading}
            >
              <Navigation size={17} className={gpsLoading ? 'spin' : ''} />
              <span>
                {gpsLoading
                  ? (isTa ? 'நேரலை இருப்பிடம் கண்டறியப்படுகிறது...' : 'Detecting Live Location...')
                  : (isTa ? 'நேரலை இருப்பிடத்தைப் பயன்படுத்துக (Auto-Detect Live Location)' : 'Auto-Detect My Live Location')}
              </span>
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-2)' }}>
              {isTa ? '— அல்லது நகரத்தின் பெயரைத் தேடுக —' : '— or search city/town —'}
            </div>

            {/* City Search Input */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder={isTa ? 'எ.கா. Coimbatore, Thanjavur, Madurai, Salem...' : 'e.g. Coimbatore, Madurai, Salem, Delhi...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn--outline" disabled={searching}>
                <Search size={15} />
                <span>{searching ? '...' : (isTa ? 'தேடு' : 'Search')}</span>
              </button>
            </form>

            {/* Search Results List */}
            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                {searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="side-list-btn"
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelectLocation(res)}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: 14 }}>{res.name}</strong>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        {[res.region, res.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                    <CheckCircle2 size={16} color="var(--green-700)" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Popular Tamil Nadu Locations */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                {isTa ? 'பிரபலமான மாவட்டங்கள் / நகரங்கள்:' : 'Quick Select Locations:'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { name: 'Coimbatore', region: 'Tamil Nadu', country: 'India', lat: 11.0055, lon: 76.9661 },
                  { name: 'Madurai', region: 'Tamil Nadu', country: 'India', lat: 9.9252, lon: 78.1198 },
                  { name: 'Thanjavur', region: 'Tamil Nadu', country: 'India', lat: 10.7870, lon: 79.1378 },
                  { name: 'Salem', region: 'Tamil Nadu', country: 'India', lat: 11.6643, lon: 78.1460 },
                  { name: 'Chennai', region: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707 },
                  { name: 'Trichy', region: 'Tamil Nadu', country: 'India', lat: 10.7905, lon: 78.7047 },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => handleSelectLocation(item)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}