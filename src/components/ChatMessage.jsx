import { useState } from 'react';
import { Bot, User, Volume2, VolumeX, Copy, Check } from 'lucide-react';

export default function ChatMessage({
  id,
  role,
  text,
  time,
  image,
  isSpeaking,
  onSpeak,
}) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className={`msg msg--${isUser ? 'user' : 'ai'}`}>
      <div className="msg__avatar">
        {isUser ? <User size={17} /> : <Bot size={17} />}
      </div>
      <div style={{ maxWidth: '100%' }}>
        {image && (
          <div className="msg__image-wrap">
            <img src={image} alt="Crop sample" className="msg__image-preview" />
          </div>
        )}
        <div className="msg__bubble">
          {text.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
              return (
                <div key={i} className="msg__bullet">
                  <span className="msg__bullet-dot">•</span>
                  <span>{renderFormattedLine(trimmed.replace(/^[•-]\s*/, ''))}</span>
                </div>
              );
            }
            if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
              return (
                <div key={i} className="msg__heading">
                  {renderFormattedLine(trimmed.replace(/^#+\s*/, ''))}
                </div>
              );
            }
            return (
              <div key={i} className="msg__line">
                {renderFormattedLine(line) || '\u00A0'}
              </div>
            );
          })}
        </div>

        <div className="msg__footer">
          {time && <span className="msg__time">{time}</span>}

          {!isUser && (
            <div className="msg__actions">
              {onSpeak && (
                <button
                  type="button"
                  className={`msg__action-btn ${isSpeaking ? 'msg__action-btn--active' : ''}`}
                  onClick={() => onSpeak(text, id)}
                  title={isSpeaking ? 'பேசுவதை நிறுத்து (Stop)' : 'குரலில் கேட்க (Listen in Voice)'}
                  aria-label="Listen response in voice"
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>
              )}

              <button
                type="button"
                className="msg__action-btn"
                onClick={handleCopy}
                title="நகலெடு (Copy text)"
                aria-label="Copy response"
              >
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}