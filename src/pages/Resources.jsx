import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  Bot,
  ArrowRight,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import ResourceCard from '../components/ResourceCard.jsx';
import Modal from '../components/Modal.jsx';
import { resources, resourceCategories } from '../data/resources.js';
import { fetchResourceTopicDetails } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Resources() {
  const navigate = useNavigate();
  const { language, speakText, stopSpeaking, isSpeaking } = useLanguage();

  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  // Real-time AI Modal states
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [isSpeakingContent, setIsSpeakingContent] = useState(false);

  const isTa = language === 'ta';

  const filtered = useMemo(() => {
    let list = resources;
    if (category !== 'All') list = list.filter((r) => r.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [category, query]);

  // Trigger real-time search & in-depth explanation
  const handleReadMore = async (resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
    setLoadingAI(true);
    setAiData(null);
    setIsSpeakingContent(false);

    try {
      const res = await fetchResourceTopicDetails({ resource, language });
      setAiData(res);
    } catch (err) {
      console.error('Failed to fetch real-time resource details:', err);
      setAiData({
        source: 'Farm AI Handbook',
        content: isTa
          ? `மன்னிக்கவும், தகவல்களைப் பெறுவதில் தாமதம் ஏற்பட்டுள்ளது. மீண்டும் முயலவும்.`
          : `Sorry, there was a delay fetching the latest details. Please try again.`,
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCloseModal = () => {
    if (isSpeakingContent) {
      stopSpeaking();
      setIsSpeakingContent(false);
    }
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  const handleToggleSpeak = () => {
    if (isSpeakingContent) {
      stopSpeaking();
      setIsSpeakingContent(false);
    } else {
      if (aiData?.content) {
        setIsSpeakingContent(true);
        speakText(aiData.content, () => {
          setIsSpeakingContent(false);
        });
      }
    }
  };

  const handleAskAssistant = () => {
    if (!selectedResource) return;
    handleCloseModal();
    const promptText = isTa
      ? `${selectedResource.title} குறித்து விரிவான விவசாய வழிகாட்டுதல் மற்றும் களப் பரிந்துரைகள் தருக.`
      : `Provide comprehensive farming and implementation advice regarding ${selectedResource.title}.`;
    navigate(`/assistant?q=${encodeURIComponent(promptText)}`);
  };

  // Helper to format inline bold formatting **text**
  const renderFormattedLine = (line) => {
    if (!line.includes('**')) return line;
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Render formatted markdown content
  const renderContentLines = (raw) => {
    if (!raw) return null;
    const lines = raw.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} style={{ height: 10 }} />;
      }

      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        const title = trimmed.replace(/^#+\s*/, '');
        return (
          <h4
            key={idx}
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginTop: 16,
              marginBottom: 8,
              color: 'var(--brand-green, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {renderFormattedLine(title)}
          </h4>
        );
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\./.test(trimmed)) {
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: 8,
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--text, #1e293b)',
              marginBottom: 6,
              paddingLeft: 4,
            }}
          >
            <span style={{ color: 'var(--brand-green, #16a34a)', fontWeight: 700 }}>•</span>
            <div>{renderFormattedLine(trimmed.replace(/^([•-]\s*|\d+\.\s*)/, ''))}</div>
          </div>
        );
      }

      return (
        <p
          key={idx}
          style={{
            fontSize: 14,
            lineHeight: 1.65,
            color: 'var(--text, #1e293b)',
            marginBottom: 10,
          }}
        >
          {renderFormattedLine(trimmed)}
        </p>
      );
    });
  };

  return (
    <>
      <div className="page-header">
        <h1>{isTa ? 'விவசாய கையேடுகள் & வழிகாட்டிகள்' : 'Agricultural Resources'}</h1>
        <p>
          {isTa
            ? 'பயிர் சாகுபடி, உரம், நீர்ப்பாசனம் மற்றும் பூச்சி மேலாண்மை குறித்த நேரடி AI வழிகாட்டுதல்கள்.'
            : 'Crop-specific knowledge, best practices, real-time AI research and expert guidance.'}
        </p>
      </div>

      <div className="res-toolbar">
        <div className="res-search">
          <Search size={17} />
          <input
            type="text"
            placeholder={isTa ? 'கையேடுகளைத் தேடுக...' : 'Search resources...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="res-tabs">
          {resourceCategories.map((c) => (
            <button
              key={c}
              className={`res-tab ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="res-grid">
        {filtered.length === 0 ? (
          <div className="res-empty">
            {isTa
              ? 'கையேடுகள் எதுவும் கிடைக்கவில்லை. வேறு தேடலை முயற்சிக்கவும்.'
              : 'No resources found. Try a different search or category.'}
          </div>
        ) : (
          filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} onReadMore={handleReadMore} />
          ))
        )}
      </div>

      {/* Real-time AI Resource Detail Modal */}
      {isModalOpen && selectedResource && (
        <Modal
          title={selectedResource.title}
          onClose={handleCloseModal}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {aiData?.content && (
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={handleToggleSpeak}
                    style={{
                      borderColor: isSpeakingContent ? 'var(--brand-green, #16a34a)' : undefined,
                      color: isSpeakingContent ? 'var(--brand-green, #16a34a)' : undefined,
                    }}
                  >
                    {isSpeakingContent ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    <span>{isSpeakingContent ? (isTa ? 'நிறுத்து' : 'Stop') : (isTa ? 'கேட்க (Listen)' : 'Listen')}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => handleReadMore(selectedResource)}
                  disabled={loadingAI}
                  title="Search & refresh latest AI updates"
                >
                  <RefreshCw size={14} className={loadingAI ? 'spin' : ''} />
                  <span>{isTa ? 'மீண்டும் தேடு' : 'Refresh'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={handleAskAssistant}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Bot size={15} />
                  <span>{isTa ? 'Farm AI-யிடம் கேளுங்கள்' : 'Ask Farm AI'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Banner with Image & Meta */}
            <div
              style={{
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                maxHeight: 220,
                border: '1px solid var(--border)',
              }}
            >
              <img
                src={selectedResource.image}
                alt={selectedResource.title}
                style={{ width: '100%', height: 220, objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80';
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 16,
                  color: '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      background: 'rgba(22, 163, 74, 0.9)',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      textTransform: 'uppercase',
                    }}
                  >
                    {selectedResource.category}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(0,0,0,0.5)',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                    }}
                  >
                    <Sparkles size={11} color="#4ade80" />
                    <span>Real-Time AI Research</span>
                  </span>
                </div>
                <h2 style={{ fontSize: 19, margin: 0, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                  {selectedResource.title}
                </h2>
              </div>
            </div>

            {/* AI Source & Status Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(22, 163, 74, 0.06)',
                border: '1px solid rgba(22, 163, 74, 0.2)',
                fontSize: 12,
                color: 'var(--text-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="#16a34a" />
                <span>
                  <strong>{isTa ? 'தகவல் ஆதாரம்:' : 'Source:'}</strong>{' '}
                  {aiData?.source || 'Gemini 2.5 Flash Real-Time Search'}
                </span>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  color: 'var(--brand-green, #16a34a)',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={13} />
                <span>{isTa ? 'நிகழ்நேர தரவு சரிபார்க்கப்பட்டது' : 'Verified Agronomy'}</span>
              </span>
            </div>

            {/* Content Area */}
            {loadingAI ? (
              <div style={{ padding: '30px 10px', textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(22, 163, 74, 0.1)',
                    color: 'var(--brand-green, #16a34a)',
                    marginBottom: 14,
                  }}
                >
                  <RefreshCw size={22} className="spin" />
                </div>
                <h4 style={{ fontSize: 15, marginBottom: 6 }}>
                  {isTa
                    ? 'நிகழ்நேர விவசாய தகவல்கள் தேடப்படுகிறது...'
                    : 'Searching Real-Time Agricultural Knowledge...'}
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 420, margin: '0 auto' }}>
                  {isTa
                    ? `ஜெமினி AI மூலம் ${selectedResource.title} பற்றிய விரிவான கள ஆய்வு மற்றும் அறிவியல் பரிந்துரைகள் பெறப்படுகின்றன.`
                    : `Fetching multi-paragraph agronomic guide, practical dosages, and field precautions for ${selectedResource.title}.`}
                </p>

                {/* Shimmer skeleton */}
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 14, background: 'var(--surface-2, #f1f5f9)', borderRadius: 4, width: '85%' }} />
                  <div style={{ height: 14, background: 'var(--surface-2, #f1f5f9)', borderRadius: 4, width: '95%' }} />
                  <div style={{ height: 14, background: 'var(--surface-2, #f1f5f9)', borderRadius: 4, width: '70%' }} />
                </div>
              </div>
            ) : (
              <div
                style={{
                  lineHeight: 1.65,
                  maxHeight: '52vh',
                  overflowY: 'auto',
                  paddingRight: 6,
                }}
              >
                {renderContentLines(aiData?.content)}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}