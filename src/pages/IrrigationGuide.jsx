import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  CloudRain,
  Droplet,
  Thermometer,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Sparkles,
} from 'lucide-react';
import { fetchIrrigationRecommendation } from '../services/api.js';
import {
  CROP_REFERENCE,
  SOIL_REFERENCE,
  GROWTH_STAGES,
  IRRIGATION_METADATA,
} from '../services/irrigationService.js';
import { irrigationForecast } from '../data/weather.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function IrrigationGuide() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [crop, setCrop] = useState('tomato');
  const [stage, setStage] = useState('mid');
  const [soil, setSoil] = useState('loamy');

  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (selectedCrop = crop, selectedStage = stage, selectedSoil = soil) => {
    setLoading(true);
    try {
      const res = await fetchIrrigationRecommendation({
        crop: selectedCrop,
        stage: selectedStage,
        soil: selectedSoil,
        weather: {
          temperature: 29.5,
          rainChance: 15,
          rainfall: 0.0,
          humidity: 62,
        },
      });
      setRec(res);
    } catch (err) {
      console.error('Irrigation recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate('tomato', 'mid', 'loamy');
  }, []);

  const handleGet = () => {
    calculate(crop, stage, soil);
  };

  const handleAskAssistant = () => {
    const cropName = CROP_REFERENCE[crop]?.names[language] || crop;
    const stageName = GROWTH_STAGES[stage]?.names[language] || stage;
    const soilName = SOIL_REFERENCE[soil]?.names[language] || soil;

    const query =
      language === 'ta'
        ? `${cropName} பயிருக்கு ${stageName} மற்றும் ${soilName} நிலத்தில் பயிற்சி பெற்ற மாதிரி மூலம் விரிவான பாசன ஆலோசனை தருக.`
        : `Provide detailed irrigation advisory for ${cropName} in ${stageName} and ${soilName} based on the trained Farm AI model.`;

    navigate(`/assistant?q=${encodeURIComponent(query)}`);
  };

  const maxRain = Math.max(...irrigationForecast.map((d) => d.rain));

  const isTa = language === 'ta';

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>{isTa ? 'நீர்ப்பாசன வழிகாட்டி & AI மாதிரி' : 'Irrigation Guide & AI Model'}</h1>
            <p>
              {isTa
                ? 'பயிற்சி பெற்ற Farm AI Irrigation Estimator (v0.1, R² 0.9989) மூலம் கணக்கிடப்பட்ட துல்லியமான பாசன பரிந்துரைகள்.'
                : 'Data-driven irrigation requirements calculated using the trained Farm AI Irrigation Estimator (v0.1, R² 0.9989).'}
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'rgba(22, 163, 74, 0.08)',
              border: '1px solid rgba(22, 163, 74, 0.3)',
              color: 'var(--brand-green, #16a34a)',
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            <Cpu size={14} />
            <span>Model: FAO-56 Hargreaves (R² 0.999)</span>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="controls-bar" style={{ flexWrap: 'wrap', gap: 14 }}>
        <div className="field-group" style={{ minWidth: 160 }}>
          <label>{isTa ? 'பயிர் தேர்வு' : 'Crop'}</label>
          <select value={crop} onChange={(e) => setCrop(e.target.value)}>
            <option value="paddy">{isTa ? 'நெல் (Paddy / Rice)' : 'Paddy / Rice'}</option>
            <option value="tomato">{isTa ? 'தக்காளி (Tomato)' : 'Tomato'}</option>
            <option value="chili">{isTa ? 'மிளகாய் (Chili)' : 'Chili'}</option>
            <option value="maize">{isTa ? 'மக்காச்சோளம் (Maize)' : 'Maize / Corn'}</option>
            <option value="cotton">{isTa ? 'பருத்தி (Cotton)' : 'Cotton'}</option>
            <option value="groundnut">{isTa ? 'வேர்க்கடலை (Groundnut)' : 'Groundnut / Peanut'}</option>
          </select>
        </div>

        <div className="field-group" style={{ minWidth: 180 }}>
          <label>{isTa ? 'வளர்ச்சி நிலை' : 'Growth Stage'}</label>
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="initial">{isTa ? 'தொடக்க நிலை (Initial)' : 'Initial / Seedling'}</option>
            <option value="development">{isTa ? 'வளர்ச்சி நிலை (Development)' : 'Crop Development'}</option>
            <option value="mid">{isTa ? 'நடுப்பருவம் (Mid-Season)' : 'Mid-Season (Flowering)'}</option>
            <option value="late">{isTa ? 'முதிர்ச்சி நிலை (Late Season)' : 'Late Season / Maturity'}</option>
          </select>
        </div>

        <div className="field-group" style={{ minWidth: 160 }}>
          <label>{isTa ? 'மண் வகை' : 'Soil Type'}</label>
          <select value={soil} onChange={(e) => setSoil(e.target.value)}>
            <option value="sandy">{isTa ? 'மணல் மண் (Sandy - 80 mm/m)' : 'Sandy Soil (80 mm/m)'}</option>
            <option value="loamy">{isTa ? 'வண்டல் / செம்மண் (Loamy - 150 mm/m)' : 'Loamy Soil (150 mm/m)'}</option>
            <option value="clay">{isTa ? 'களிமண் / கரிசல் (Clay - 180 mm/m)' : 'Clay Soil (180 mm/m)'}</option>
          </select>
        </div>

        <button className="btn btn--primary" onClick={handleGet} disabled={loading} style={{ alignSelf: 'flex-end' }}>
          <Droplets size={17} />
          {loading ? (isTa ? 'கணக்கிடுகிறது...' : 'Calculating...') : (isTa ? 'கணக்கிடு' : 'Calculate')}
        </button>
      </div>

      {rec && (
        <div className="irrigation-main">
          {/* Main Hero Card */}
          <div className="water-hero">
            <div className="water-hero__icon">
              <Droplets size={28} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, opacity: 0.8, marginBottom: 4 }}>
                {isTa ? 'இன்றைய பாசன முடிவு (AI Model Recommendation)' : "Today's Model Recommendation"}
              </div>
              <h3 style={{ fontSize: 20 }}>{isTa ? rec.recommendationTa : rec.recommendation}</h3>
            </div>
            <span className="water-hero__priority">
              <Info size={13} /> {isTa ? 'முன்னுரிமை' : 'Priority'}: {rec.priority}
            </span>
            <p style={{ fontSize: 13.5, opacity: 0.95, lineHeight: 1.6 }}>
              {isTa ? rec.reasonTa : rec.reason}
            </p>

            <button
              className="btn btn--outline btn--sm"
              onClick={handleAskAssistant}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                marginTop: 10,
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={14} />
              {isTa ? 'Farm AI உதவியாளரிடம் விரிவாக கேட்க' : 'Discuss with Farm AI Assistant'}
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Model Metrics Card */}
          <div className="rec-card">
            <div className="section-head" style={{ marginBottom: 14 }}>
              <h2 style={{ fontSize: 16 }}>
                {isTa ? 'பயிற்சி பெற்ற மாதிரி கணக்கீடுகள்' : 'Model Calculations & Water Demand'}
              </h2>
            </div>

            <div className="rec-metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
              <div className="rec-metric">
                <div className="rec-metric__label">
                  <Layers size={12} /> {isTa ? 'பயிர் குணகம் (Kc)' : 'Crop Factor (Kc)'}
                </div>
                <div className="rec-metric__value" style={{ color: 'var(--brand-green, #16a34a)' }}>
                  {rec.kc}
                </div>
              </div>

              <div className="rec-metric">
                <div className="rec-metric__label">
                  <Droplet size={12} /> {isTa ? 'தேவை (மி.மீ/நாள்)' : 'Target Depth'}
                </div>
                <div className="rec-metric__value">
                  {rec.targetMm} <span style={{ fontSize: 12, fontWeight: 400 }}>mm/day</span>
                </div>
              </div>

              <div className="rec-metric">
                <div className="rec-metric__label">
                  <Droplets size={12} /> {isTa ? 'ஏக்கருக்கு நீர்' : 'Volume / Acre'}
                </div>
                <div className="rec-metric__value">
                  {rec.litresPerAcre?.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400 }}>Litres</span>
                </div>
              </div>

              <div className="rec-metric">
                <div className="rec-metric__label">
                  <Clock size={12} /> {isTa ? 'சொட்டு நீர் நேரம்' : 'Drip Pump Time'}
                </div>
                <div className="rec-metric__value" style={{ fontSize: 15 }}>
                  {rec.dripDurationFormatted}
                </div>
              </div>

              <div className="rec-metric">
                <div className="rec-metric__label">
                  <CloudRain size={12} /> {isTa ? 'மழை வரவு' : 'Eff. Rainfall'}
                </div>
                <div className="rec-metric__value">
                  {rec.effectiveRainfall} <span style={{ fontSize: 12, fontWeight: 400 }}>mm</span>
                </div>
              </div>

              <div className="rec-metric">
                <div className="rec-metric__label">
                  <Database size={12} /> {isTa ? 'மண் தாங்குதிறன்' : 'Soil Buffer'}
                </div>
                <div className="rec-metric__value">
                  {rec.soilBufferMm} <span style={{ fontSize: 12, fontWeight: 400 }}>mm</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, padding: 12, background: 'var(--surface-2)', borderRadius: 8, fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-2)' }}>
              <div><strong>{isTa ? 'மாதிரி சூத்திரம்' : 'Model Formula'}:</strong> ETc = ET0 ({rec.et0} mm) × Kc ({rec.kc}) = {rec.etc} mm/day.</div>
              <div><strong>{isTa ? 'பாசன அளவு' : 'Target'}:</strong> max(0, ETc - Eff.Rain) = {rec.targetMm} mm ({rec.litresPerAcre?.toLocaleString()} L/Acre).</div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      <section className="forecast" style={{ marginTop: 24 }}>
        <div className="section-head">
          <h2 style={{ fontSize: 16 }}>
            {isTa ? '7-நாள் வானிலை முன்னறிவிப்பு & பாசன திட்டம்' : '7-Day Forecast & Irrigation Schedule'}
          </h2>
        </div>

        <div className="forecast__chart">
          {irrigationForecast.map((d) => {
            const height = Math.max((d.rain / maxRain) * 100, 8);
            const cls =
              d.rain >= 60 ? 'forecast__rain--high' : d.rain >= 30 ? 'forecast__rain--med' : '';
            return (
              <div className="forecast__col" key={d.day}>
                <span className="forecast__val">{d.rain}%</span>
                <div
                  className={`forecast__rain ${cls}`}
                  style={{ height: `${height}%` }}
                  title={`${d.rain}% rain`}
                />
              </div>
            );
          })}
        </div>

        <div className="forecast__labels">
          {irrigationForecast.map((d) => (
            <div className="forecast__label" key={d.day}>{d.day}</div>
          ))}
        </div>

        <div className="forecast__rec">
          {irrigationForecast.map((d) => (
            <span
              key={d.day}
              className={`rec-pill ${d.recommendation === 'Irrigate' ? 'rec-pill--yes' : 'rec-pill--no'}`}
            >
              {d.recommendation === 'Irrigate' ? (
                <CheckCircle2 size={13} />
              ) : (
                <XCircle size={13} />
              )}
              {d.day} — {d.recommendation}
            </span>
          ))}
        </div>

        <div className="disclaimer disclaimer--info" style={{ marginTop: 18 }}>
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>
            {isTa
              ? 'பரிந்துரைகள் ஹைதராபாத் மற்றும் தென்னிந்திய விவசாய காலநிலை மாதிரி அடிப்படையில் கணக்கிடப்பட்டுள்ளது. வயல்வெளி ஈரப்பதத்திற்கேற்ப மாற்றிக் கொள்ளலாம்.'
              : 'Estimations derived from Farm AI regional agro-climatic model (v0.1). Adjust according to actual sensor or soil touch test.'}
          </span>
        </div>
      </section>
    </>
  );
}