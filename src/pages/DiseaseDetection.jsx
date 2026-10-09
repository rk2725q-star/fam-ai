import { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Camera,
  FolderOpen,
} from 'lucide-react';
import orangeLeaf from '../orange-leaf.png';
import { detectDisease } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const examples = [
  { name: 'Healthy Leaf', img: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&q=80' },
  { name: 'Early Blight', img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&q=80' },
  { name: 'Late Blight', img: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&q=80' },
  { name: 'Leaf Spot', img: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&q=80' },
  { name: 'Yellow Leaf Curl', img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80' },
];

export default function DiseaseDetection() {
  const { language } = useLanguage();
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const pcInputRef = useRef(null);
  const mobileCameraRef = useRef(null);
  const mobileGalleryRef = useRef(null);

  // Device detection: check for mobile/touch
  useEffect(() => {
    const checkDevice = () => {
      const hasTouch = navigator.maxTouchPoints > 0;
      const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(uaMobile || (hasTouch && isSmallScreen));
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const processFile = async (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(language === 'ta' ? 'தயவுசெய்து JPG அல்லது PNG படத்தை பதிவேற்றவும்.' : 'Please upload a JPG or PNG image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(language === 'ta' ? 'படத்தின் அளவு 5MB க்குள் இருக்க வேண்டும்.' : 'Image must be under 5MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name || 'Captured Photo');
    setResult(null);
    setLoading(true);
    const res = await detectDisease(file, language);
    setResult(res);
    setLoading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const reset = () => {
    setPreview(null);
    setFileName('');
    setResult(null);
    setError('');
  };

  const isTa = language === 'ta';

  return (
    <>
      <div className="page-header">
        <h1>{isTa ? 'பயிர் நோய் கண்டறிதல்' : 'Crop Disease Detection'}</h1>
        <p>
          {isTa
            ? 'பாதிக்கப்பட்ட இலை அல்லது பயிரின் படத்தை எடுத்து AI மூலம் நோயை கண்டறியுங்கள்.'
            : 'Upload or capture a clear crop image to get AI-assisted disease identification.'}
        </p>
      </div>

      <div className="detect-grid">
        {/* LEFT: Upload / Camera */}
        <div>
          {!preview ? (
            <div
              className={`dropzone ${dragging ? 'dropzone--active' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => {
                if (!isMobile) {
                  pcInputRef.current?.click();
                }
              }}
              style={{ cursor: isMobile ? 'default' : 'pointer' }}
            >
              <div className="dropzone__icon">
                <img
                  src={orangeLeaf}
                  alt="Orange leaf"
                  style={{ width: 72, height: 72, objectFit: 'contain' }}
                />
              </div>

              <div className="dropzone__text">
                <h3>{isTa ? 'பயிர் நோய் கண்டறிதல்' : 'Detect Crop Disease'}</h3>
                <p>
                  {isMobile
                    ? isTa
                      ? 'கேமரா மூலம் படம் எடுக்கவும் அல்லது கேலரியில் இருந்து தேர்வு செய்யவும்'
                      : 'Take a live photo or upload from your gallery'
                    : isTa
                    ? 'படத்தை கிளிக் செய்து பதிவேற்றவும் (அல்லது Drag & Drop)'
                    : 'Click to upload leaf image or drag & drop'}
                </p>
              </div>

              {/* Mobile: Dual Actions (Take Photo directly OR Upload from Gallery) */}
              {isMobile ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    width: '100%',
                    marginTop: 16,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="btn btn--primary"
                    style={{
                      justifyContent: 'center',
                      padding: '12px 18px',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                    onClick={() => mobileCameraRef.current?.click()}
                  >
                    <Camera size={18} />
                    <span>{isTa ? 'கேமராவில் படம் எடுக்க (Take Photo)' : 'Take Photo with Camera'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn--outline"
                    style={{
                      justifyContent: 'center',
                      padding: '12px 18px',
                      fontSize: 14,
                      background: 'var(--white)',
                    }}
                    onClick={() => mobileGalleryRef.current?.click()}
                  >
                    <FolderOpen size={18} />
                    <span>{isTa ? 'கேலரியில் இருந்து பதிவேற்ற (Gallery)' : 'Upload from Gallery / Files'}</span>
                  </button>

                  {/* Hidden inputs for Mobile */}
                  <input
                    ref={mobileCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={(e) => processFile(e.target.files?.[0])}
                  />
                  <input
                    ref={mobileGalleryRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => processFile(e.target.files?.[0])}
                  />
                </div>
              ) : (
                /* PC / Desktop: Upload only as requested */
                <>
                  <div className="dropzone__arrow" aria-hidden="true">
                    <ArrowRight size={28} />
                  </div>
                  <input
                    ref={pcInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => processFile(e.target.files?.[0])}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="preview">
              <img src={preview} alt="Uploaded crop" />
              <div className="preview__bar">
                <div>
                  <h4>{fileName}</h4>
                  <p>{isTa ? 'ஆய்வு செய்ய தயாராக உள்ளது' : 'Ready for analysis'}</p>
                </div>
                <button className="btn btn--outline btn--sm" onClick={reset}>
                  <X size={14} /> {isTa ? 'நீக்கு' : 'Remove'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="disclaimer" style={{ marginTop: 16 }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Examples */}
          <div className="card card--pad" style={{ marginTop: 20 }}>
            <h3 className="card__title" style={{ marginBottom: 12 }}>
              {isTa ? 'மாதிரி படங்கள்' : 'Example Images'}
            </h3>
            <div className="examples-grid">
              {examples.map((ex) => (
                <div className="example-card" key={ex.name}>
                  <img src={ex.img} alt={ex.name} />
                  <p>{ex.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Result */}
        <div>
          <div className="result">
            <div className="section-head" style={{ marginBottom: 14 }}>
              <h2 style={{ fontSize: 16 }}>
                {isTa ? 'கண்டறிதல் முடிவுகள்' : 'Detection Result'}
              </h2>
            </div>

            {!result && !loading && (
              <div className="result__empty">
                <div className="result__empty-icon">
                  <ImageIcon size={26} />
                </div>
                <p>
                  {isTa
                    ? 'முடிவுகளைப் பெற ஒரு பயிர் இலையின் படத்தை பதிவேற்றவும் அல்லது கேமராவில் எடுக்கவும்.'
                    : 'Upload or capture an image to get disease detection results.'}
                </p>
              </div>
            )}

            {loading && (
              <div className="result__empty">
                <div className="result__empty-icon">
                  <Upload size={26} className="spin" />
                </div>
                <p>
                  {isTa
                    ? 'Gemini AI படத்தை ஆய்வு செய்கிறது...'
                    : 'Analyzing image with Gemini AI...'}
                </p>
              </div>
            )}

            {result && !loading && (
              <>
                <div className="result__head">
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>
                      {isTa ? 'கண்டறியப்பட்ட பிரச்சனை' : 'Possible Issue'}
                    </div>
                    <div className="result__issue">{result.possibleIssue}</div>
                  </div>
                  <span className="badge badge--warning">
                    <span className="badge__dot" />
                    {result.status}
                  </span>
                </div>

                <div className="result__confidence">
                  <div className="result__confidence-row">
                    <span>{isTa ? 'நம்பகத்தன்மை' : 'Confidence'}</span>
                    <strong>{result.confidence}%</strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress__bar"
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                  {isTa ? 'பரிந்துரைக்கப்படும் அடுத்த நடவடிக்கைகள்' : 'Possible Next Steps'}
                </div>
                <ul className="result__steps">
                  {result.nextSteps.map((s, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={16} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>

                <div className="disclaimer">
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{result.disclaimer}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}