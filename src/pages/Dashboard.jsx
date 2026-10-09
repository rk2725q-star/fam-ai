import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, ScanLine, Droplets, BookOpen, ArrowRight,
  CloudRain, Droplet, Thermometer, MapPin,
  ScanSearch, Sprout, CalendarCheck, Plus, ChevronRight,
  CheckCircle2, Info, Leaf, Wind, CloudSun
} from 'lucide-react';
import { fields } from '../data/fields.js';
import { resources } from '../data/resources.js';
import { fetchLiveWeatherData } from '../services/weatherService.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const activities = [
  {
    type: 'image',
    img: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=100&q=80',
    title: 'Disease detection completed',
    detail: 'Tomato - Possible leaf spot',
    time: '2 hours ago',
  },
  {
    type: 'icon',
    icon: Bot,
    title: 'Asked about fertilizer schedule',
    detail: 'Paddy - Tillering stage',
    time: '5 hours ago',
  },
  {
    type: 'icon',
    icon: Droplets,
    title: 'Checked irrigation advice',
    detail: 'Paddy (Field 1)',
    time: '1 day ago',
  },
  {
    type: 'icon-amber',
    icon: BookOpen,
    title: 'Viewed resource',
    detail: 'Pest management in tomato',
    time: '2 days ago',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchLiveWeatherData(null, language)
      .then((data) => {
        if (mounted) setWeather(data);
      })
      .catch((err) => console.warn('Dashboard weather fetch error:', err));
    return () => {
      mounted = false;
    };
  }, [language]);

  const isTa = language === 'ta';
  const temp = weather ? weather.temperature : 28;
  const cond = weather ? weather.condition : (isTa ? 'பகுதி மேகமூட்டம்' : 'Partly Cloudy');
  const humidity = weather ? weather.humidity : 68;
  const rainChance = weather ? weather.rainChance : 20;
  const wind = weather ? weather.wind : 12;
  const advisory = weather ? weather.advisory : (isTa ? 'அடுத்த 3 நாட்களுக்கு கனமழை இல்லை. களப்பணிகளுக்கு உகந்தது.' : 'No heavy rain expected in the next 3 days. Good conditions for field activities.');
  const locName = weather ? weather.location : (isTa ? 'கோயம்புத்தூர், தமிழ்நாடு' : 'Coimbatore, Tamil Nadu');

  const actions = [
    
    {
      icon: Bot,
      title: 'Ask AI Assistant',
      description: 'Get instant farming guidance',
      variant: 'green',
      onClick: () => navigate('/assistant'),
    },
    {
  icon: Leaf,
  title: 'Detect Crop Disease',
  description: 'Upload leaf or plant image',
  variant: 'red',
  onClick: () => navigate('/disease-detection'),
},
    {
      icon: Droplets,
      title: 'Irrigation Guide',
      description: 'Check when to irrigate',
      variant: 'blue',
      onClick: () => navigate('/irrigation'),
    },
    {
      icon: BookOpen,
      title: 'Browse Resources',
      description: 'Learn crop-specific knowledge',
      variant: 'yellow',
      onClick: () => navigate('/resources'),
    },
  ];

  const recommended = resources.slice(0, 4);

  return (
    <>
      {/* HERO + WEATHER */}
      <div className="dash-grid-hero">
        <section className="hero">
          <img
            className="hero__img"
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1400&q=80"
            alt="Farm"
          />
          <div className="hero__overlay" />
          <div className="hero__content">
            <h1>Good Morning,<br />Ramesh!</h1>
            <p>Let's make better farming decisions today with Farm AI.</p>
          </div>
          <div className="hero__quote">
            Smarter decisions<br />today for a better<br />harvest tomorrow.
          </div>
        </section>

        <aside className="weather-box">
          <div className="weather-box__head">
            <h3>{isTa ? 'இன்றைய நேரலை வானிலை' : "Today's Live Weather"}</h3>
            <a onClick={() => navigate('/weather')} style={{ cursor: 'pointer' }}>
              {isTa ? 'முழு விபரம்' : 'View Details'} <ArrowRight size={13} />
            </a>
          </div>

          <div className="weather-box__main">
            <div className="weather-box__icon">
              <CloudSun size={48} color="var(--green-700)" strokeWidth={1.6} />
            </div>
            <div>
              <div className="weather-box__temp">{temp}°C</div>
              <div className="weather-box__cond">{cond}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                <MapPin size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {locName}
              </div>
            </div>
            <div className="weather-box__stats">
              <div className="weather-stat-line">
                <span><Droplets size={13} /> {isTa ? 'ஈரப்பதம்' : 'Humidity'}</span>
                <strong>{humidity}%</strong>
              </div>
              <div className="weather-stat-line">
                <span><CloudRain size={13} /> {isTa ? 'மழை' : 'Rain'}</span>
                <strong>{rainChance}%</strong>
              </div>
              <div className="weather-stat-line">
                <span><Wind size={13} /> {isTa ? 'காற்று' : 'Wind'}</span>
                <strong>{wind} km/h</strong>
              </div>
            </div>
          </div>

          <div className="weather-box__note">
            <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{advisory}</span>
          </div>
        </aside>
      </div>

      {/* ACTIONS */}
      <div className="section-head">
        <h2>What would you like to do today?</h2>
      </div>
      <section className="dash-actions">
        {actions.map((a) => (
          <button
            key={a.title}
            className={`dash-action dash-action--${a.variant}`}
            onClick={a.onClick}
          >
            <div className="dash-action__icon">
              <a.icon size={24} strokeWidth={2} />
            </div>
            <div className="dash-action__body">
              <h3>{a.title}</h3>
              <p>{a.description}</p>
            </div>
            <ArrowRight size={18} className="dash-action__arrow" />
          </button>
        ))}
      </section>

      {/* 3-COLUMN ROW */}
      <div className="dash-row-3">
        {/* MY FIELDS */}
        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2>My Fields</h2>
            <a onClick={() => navigate('/fields')} style={{ cursor: 'pointer' }}>
              View All <ArrowRight size={13} />
            </a>
          </div>
          <div className="dash-field-list">
            {fields.slice(0, 2).map((f) => (
              <div
                key={f.id}
                className="dash-field"
                onClick={() => navigate('/fields')}
              >
                <img
                  className="dash-field__thumb"
                  src={f.image}
                  alt={f.crop}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80';
                  }}
                />
                <div className="dash-field__body">
                  <h4>{f.name}</h4>
                  <p>{f.cropFull} · {f.area}</p>
                </div>
                <span className={`badge badge--${f.status}`}>
                  <span className="badge__dot" />
                  {f.status === 'healthy' ? 'Healthy' : 'Needs Attention'}
                </span>
                <ChevronRight size={16} className="dash-field__chev" />
              </div>
            ))}
          </div>
          <button className="dash-add-field" onClick={() => navigate('/fields')}>
            <Plus size={15} /> Add New Field
          </button>
        </section>

        {/* IRRIGATION */}
        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2>Irrigation Recommendation</h2>
            <a onClick={() => navigate('/irrigation')} style={{ cursor: 'pointer' }}>
              View Details <ArrowRight size={13} />
            </a>
          </div>
          <div className="dash-irrigation">
            <div className="irr-top">
              <div className="irr-top__icon">
                <Droplets size={26} />
              </div>
              <div>
                <h3>Paddy (Field 1)</h3>
                <p>Based on weather, soil and crop stage</p>
              </div>
            </div>

            <div className="irr-photo">
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80"
                alt="Irrigation"
              />
              <div className="irr-photo__overlay" />
              <div className="irr-photo__caption">Field 1 — Paddy at Tillering stage</div>
            </div>

            <div className="irr-reco">
              <div className="irr-reco__head">
                <CalendarCheck size={13} /> Recommended Action
              </div>
              <div className="irr-reco__title">Irrigate tomorrow</div>
              <div className="irr-reco__desc">
                Soil moisture is adequate today. Light irrigation recommended tomorrow morning.
              </div>
            </div>

            <div className="irr-metrics">
              <div className="irr-metric">
                <div className="irr-metric__label"><Droplet size={11} /> Soil Moisture</div>
                <div className="irr-metric__value">Adequate</div>
              </div>
              <div className="irr-metric">
                <div className="irr-metric__label"><CloudRain size={11} /> Rain Chance</div>
                <div className="irr-metric__value">20%</div>
              </div>
              <div className="irr-metric">
                <div className="irr-metric__label"><Thermometer size={11} /> Temp</div>
                <div className="irr-metric__value">28°C</div>
              </div>
            </div>
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2>Recent Activity</h2>
            <a style={{ cursor: 'pointer' }}>View All <ArrowRight size={13} /></a>
          </div>
          <div className="dash-activity">
            {activities.map((a, i) => (
              <div key={i} className="dash-activity__item">
                <div
                  className={`dash-activity__thumb ${
                    a.type === 'icon-amber' ? 'dash-activity__thumb--amber' : ''
                  }`}
                >
                  {a.type === 'image' ? (
                    <img src={a.img} alt="" />
                  ) : (
                    <a.icon size={17} />
                  )}
                </div>
                <div className="dash-activity__body">
                  <h4>{a.title}</h4>
                  <p>{a.detail}</p>
                  <span className="dash-activity__time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RECOMMENDED FOR YOU */}
      <div className="section-head">
        <h2>Recommended for You</h2>
        <a
          onClick={() => navigate('/resources')}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--green-700)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          View All <ArrowRight size={14} />
        </a>
      </div>
      <section className="recommend-grid">
        {recommended.map((r) => (
          <article
            key={r.id}
            className="recommend-card"
            onClick={() => navigate('/resources')}
          >
            <div className="recommend-card__img">
              <img src={r.image} alt={r.title} />
            </div>
            <div className="recommend-card__body">
              <h3>{r.title}</h3>
              <p>{r.description}</p>
              <span className="recommend-card__link">
                Read More <ArrowRight size={12} />
              </span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}