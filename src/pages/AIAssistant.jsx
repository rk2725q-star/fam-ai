import { useRef, useState, useEffect } from 'react';
import {
  Send,
  ImagePlus,
  Sparkles,
  Bot,
  BookOpen,
  Mic,
  MicOff,
  Camera,
  X,
} from 'lucide-react';
import ChatMessage from '../components/ChatMessage.jsx';
import { sendChatMessage } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const SUGGESTED_BY_LANG = {
  ta: [
    '🍅 தக்காளிக்கு நடுப்பருவத்தில் சொட்டு நீர் பாசன அளவு என்ன?',
    '🌾 நெற்பயிருக்கு பரிந்துரைக்கப்பட்ட பாசன அளவு என்ன?',
    '🌽 மக்காச்சோளத்திற்கு மணல் நிலத்தில் எவ்வளவு நேரம் தண்ணீர் பாய்ச்ச வேண்டும்?',
    'தக்காளி இலைகள் மஞ்சள் நிறமாக மாறுகிறது, என்ன செய்ய வேண்டும்?',
    'நெற்பயிருக்கு யூரியா மற்றும் டி.ஏ.பி எப்போது இட வேண்டும்?',
    'இயற்கை முறையில் வேப்ப எண்ணெய் கொண்டு பூச்சிகளை கட்டுப்படுத்துவது எப்படி?',
  ],
  en: [
    '🍅 Tomato (Mid-Season) — What is the daily irrigation requirement in Litres?',
    '🌾 What is the recommended irrigation schedule for paddy?',
    '🌽 How many hours of drip irrigation for maize in sandy soil?',
    '🌱 Groundnut pegging stage water requirement and schedule',
    'My tomato leaves are turning yellow. What should I do?',
    'When should I apply fertilizers to paddy crop?',
  ],
  hi: [
    '🍅 टमाटर (मध्य अवस्था) के लिए ड्रिप सिंचाई की दैनिक मात्रा क्या है?',
    '🌾 धान की फसल के लिए सिंचाई की अनुशंसित मात्रा क्या है?',
    '🌽 रेतीली मिट्टी में मक्का के लिए कितने घंटे सिंचाई करें?',
    'टमाटर की पत्तियां पीली पड़ रही हैं, क्या उपाय करें?',
    'धान की फसल में यूरिया कब डालना चाहिए?',
  ],
  te: [
    '🍅 టమాటా (మధ్య దశ) పంటకు రోజువారీ డ్రిప్ నీటి పరిమాణం ఎంత?',
    '🌾 వరి పంటకు సిఫార్సు చేయబడిన నీటిపారుదల పరిమాణం ఎంత?',
    '🌽 ఇసుక నేలలో మొక్కజొన్నకు ఎన్ని గంటలు డ్రిప్ నడపాలి?',
    'వరి పంటకు యూరియా ఎప్పుడు వేయాలి?',
    'సేంద్రీయ పద్ధతిలో చీడపీడలను ఎలా నియంత్రించాలి?',
  ],
};

const INITIAL_GREETINGS = {
  ta: {
    role: 'ai',
    text: `வணக்கம்! நான் உங்கள் Farm AI (விவசாய தோழன்). 🌱
உங்களின் பயிர்கள், பாசன அளவு, உரம், மற்றும் பூச்சி நோய் கட்டுப்பாடு பற்றி நீங்கள் எதையும் கேட்கலாம்.

பாதிக்கப்பட்ட பயிரின் புகைப்படத்தையும் பதிவேற்றலாம். உங்களுக்கு இன்று என்ன உதவி வேண்டும்?`,
  },
  en: {
    role: 'ai',
    text: `Welcome to Farm AI Assistant! 🌱
I am here to help you optimize crop yield, manage irrigation, plan fertilizer schedules, and diagnose plant diseases.

Feel free to ask a question or upload a photo of your crop!`,
  },
  hi: {
    role: 'ai',
    text: `नमस्ते! मैं आपका Farm AI (किसान मित्र) हूँ। 🌱
आप अपनी फसलों, खाद, सिंचाई और कीट नियंत्रण के बारे में कुछ भी पूछ सकते हैं। आज मैं आपकी क्या मदद करूँ?`,
  },
  te: {
    role: 'ai',
    text: `నమస్కారం! నేను మీ Farm AI వ్యవసాయ సలహాదారుని. 🌱
మీ పంటలు, ఎరువులు, నీటిపారుదల மற்றும் తెగుళ్ల నివారణ గురించి నన్ను అడగవచ్చు. మీకు ఎలా సహాయపడగలను?`,
  },
};

export default function AIAssistant() {
  const {
    language,
    setLanguage,
    languages,
    currentLangObj,
    isListening,
    startListening,
    stopListening,
    isSpeaking,
    speakingTextId,
    speakText,
    stopSpeaking,
  } = useLanguage();

  const now = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [messages, setMessages] = useState(() => {
    const greeting = INITIAL_GREETINGS[language] || INITIAL_GREETINGS.ta;
    return [{ ...greeting, time: now(), id: 'init-1' }];
  });

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);


  const [isMobile, setIsMobile] = useState(false);

  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-fill query if passed from Irrigation Guide or other pages
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get('q');
      if (queryParam) {
        setInput(decodeURIComponent(queryParam));
        inputRef.current?.focus();
      }
    } catch (_) {}
  }, []);

  // Detect mobile device
  useEffect(() => {
    const check = () => {
      const hasTouch = navigator.maxTouchPoints > 0;
      const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isNarrow = window.innerWidth <= 768;
      setIsMobile(uaMobile || (hasTouch && isNarrow));
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Update greeting when language changes if only 1 message exists
  useEffect(() => {
    if (messages.length <= 1) {
      const greeting = INITIAL_GREETINGS[language] || INITIAL_GREETINGS.ta;
      setMessages([{ ...greeting, time: now(), id: 'init-1' }]);
    }
  }, [language]);

  const scrollBottom = () => {
    setTimeout(() => {
      bodyRef.current?.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 60);
  };

  const handleSend = async (overrideText = null) => {
    const textToSend = (overrideText !== null ? overrideText : input).trim();
    if ((!textToSend && !selectedImage) || sending) return;

    const userMsgId = 'u-' + Date.now();
    const currentImg = selectedImage;
    const currentPreview = imagePreview;

    // Reset inputs
    setInput('');
    setSelectedImage(null);
    setImagePreview(null);

    setMessages((m) => [
      ...m,
      {
        id: userMsgId,
        role: 'user',
        text: textToSend || (language === 'ta' ? '📷 இலை புகைப்படம்' : '📷 Crop image analysis'),
        image: currentPreview,
        time: now(),
      },
    ]);

    setSending(true);
    scrollBottom();

    try {
      const reply = await sendChatMessage(textToSend, {
        history: messages,
        imageFile: currentImg,
        language,
      });

      const aiMsgId = 'ai-' + Date.now();
      setMessages((m) => [
        ...m,
        {
          id: aiMsgId,
          role: 'ai',
          text: reply,
          time: now(),
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: 'err-' + Date.now(),
          role: 'ai',
          text:
            language === 'ta'
              ? 'மன்னிக்கவும், தகவலைப் பெறுவதில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சி செய்யவும்.'
              : 'Sorry, there was an error connecting to the AI. Please try again.',
          time: now(),
        },
      ]);
    } finally {
      setSending(false);
      scrollBottom();
    }
  };

  // Voice Speech-To-Text toggle
  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening({
        onResult: (transcript) => {
          setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
          inputRef.current?.focus();
        },
        onError: () => {
          stopListening();
        },
      });
    }
  };

  // Image Upload handler
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };



  const activeQuestions =
    SUGGESTED_BY_LANG[language] || SUGGESTED_BY_LANG.ta;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>
            {language === 'ta'
              ? 'AI விவசாய ஆலோசகர்'
              : 'AI Farming Assistant'}
          </h1>
          <p>
            {language === 'ta'
              ? 'பயிர், மண், நீர், உரம் மற்றும் பூச்சிக் கட்டுப்பாடு குறித்து உங்கள் மொழியில் கேளுங்கள்.'
              : 'Ask questions about crops, soil, water, fertilizer, pests or farming.'}
          </p>
        </div>
      </div>



      <div className="chat-shell">
        <div className="chat">
          {/* Chat Header */}
          <div className="chat__head">
            <div className="chat__head-icon">
              <Bot size={20} />
            </div>
            <div>
              <h3>Farm AI Assistant</h3>
              <p>
                {language === 'ta'
                  ? 'விவசாய தோழன்'
                  : 'Smart Farming Assistant'}
              </p>
            </div>

            <div className="chat__status">
              <span className="chat__status-dot chat__status-dot--pulse" />
              <span>{language === 'ta' ? 'ஆன்லைன்' : 'Online'}</span>
            </div>
          </div>

          {/* Chat Body */}
          <div className="chat__body" ref={bodyRef}>
            {messages.map((m) => (
              <ChatMessage
                key={m.id || m.time}
                id={m.id}
                role={m.role}
                text={m.text}
                time={m.time}
                image={m.image}
                isSpeaking={isSpeaking && speakingTextId === m.id}
                onSpeak={speakText}
              />
            ))}

            {sending && (
              <div className="msg msg--ai">
                <div className="msg__avatar">
                  <Bot size={17} />
                </div>
                <div className="msg__bubble msg__bubble--thinking">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span>
                    {language === 'ta'
                      ? 'Farm AI பதிலளிக்கிறது...'
                      : 'Farm AI is thinking...'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Wrap */}
          <div className="chat__input-wrap">
            {/* Image Preview Thumbnail if attached */}
            {imagePreview && (
              <div className="chat__preview-bar">
                <div className="chat__preview-chip">
                  <img src={imagePreview} alt="Selected preview" />
                  <span>{selectedImage?.name}</span>
                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    className="chat__preview-remove"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
                <span className="chat__preview-hint">
                  {language === 'ta'
                    ? 'புகைப்படம் தயாராக உள்ளது. கேள்வியை தட்டச்சு செய்யவும் அல்லது அனுப்புக.'
                    : 'Image attached for Gemini vision analysis'}
                </span>
              </div>
            )}

            {/* Quick Suggestions */}
            <div className="chat__suggestions">
              {activeQuestions.slice(0, 3).map((q) => (
                <button
                  key={q}
                  className="suggestion-chip"
                  onClick={() => handleSend(q)}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="chat__input">
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  isListening
                    ? language === 'ta'
                      ? 'கேட்கிறது... பேசுங்கள்...'
                      : 'Listening... please speak...'
                    : language === 'ta'
                    ? 'உங்கள் விவசாய கேள்வியை கேளுங்கள்...'
                    : 'Type your farming question...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />

              {/* Voice Input (Speech to Text) */}
              <button
                type="button"
                className={`chat__icon-btn ${isListening ? 'chat__icon-btn--mic-active' : ''}`}
                onClick={toggleVoiceInput}
                title={
                  isListening
                    ? 'நிறுத்து (Stop listening)'
                    : `குரலில் பேச (Talk in ${currentLangObj.label})`
                }
                aria-label="Voice input"
              >
                {isListening ? <MicOff size={19} color="#dc2626" /> : <Mic size={19} />}
              </button>

              {/* Mobile: Camera Button (Take photo directly) */}
              {isMobile && (
                <>
                  <button
                    type="button"
                    className={`chat__icon-btn ${selectedImage ? 'chat__icon-btn--has-file' : ''}`}
                    onClick={() => cameraRef.current?.click()}
                    title={language === 'ta' ? 'கேமராவில் படம் எடுக்க (Camera)' : 'Take Photo directly'}
                  >
                    <Camera size={19} />
                  </button>
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={handleImageSelect}
                  />
                </>
              )}

              {/* Upload Image from Gallery/Files (Available on both, primary on PC) */}
              <button
                type="button"
                className={`chat__icon-btn ${selectedImage ? 'chat__icon-btn--has-file' : ''}`}
                onClick={() => fileRef.current?.click()}
                title={isMobile 
                  ? (language === 'ta' ? 'கேலரியில் இருந்து படம் தேர்வு (Gallery)' : 'Upload from Gallery')
                  : (language === 'ta' ? 'படம் பதிவேற்றம் (Upload Image)' : 'Upload crop image')}
              >
                <ImagePlus size={19} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageSelect}
              />

              {/* Send Button */}
              <button
                className="chat__send"
                onClick={() => handleSend()}
                disabled={(!input.trim() && !selectedImage) || sending}
                aria-label="Send"
              >
                <Send size={17} />
              </button>
            </div>

            {/* Active Voice Listening banner */}
            {isListening && (
              <div className="chat__listening-banner">
                <span className="listening-pulse" />
                <span>
                  {language === 'ta'
                    ? `Farm AI கேட்கிறது (${currentLangObj.label})... உங்கள் கேள்வியைப் பேசுங்கள்.`
                    : `Listening in ${currentLangObj.label}... speak now.`}
                </span>
                <button
                  type="button"
                  className="btn btn--xs"
                  onClick={stopListening}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <aside className="chat__side">
          <div className="side-card">
            <h4>
              <Sparkles size={16} />
              {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட கேள்விகள்' : 'Suggested Questions'}
            </h4>
            <div className="side-list">
              {activeQuestions.map((q) => (
                <button key={q} onClick={() => handleSend(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="side-card">
            <h4>
              <Bot size={16} />
              {language === 'ta' ? 'மொழி & குரல் வசதிகள்' : 'Language & Voice AI'}
            </h4>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-2)' }}>
              {language === 'ta'
                ? 'Farm AI-யிடம் நீங்கள் குரல் வழியாக (Mic) பேசலாம், AI அளிக்கும் பதில்களை ஸ்பீக்கர் (Listen) ஐகானை அழுத்தி தமிழில் கேட்கலாம்.'
                : 'Speak to Farm AI using the mic icon in your native language, or click Listen on any response to hear it read aloud!'}
            </p>
          </div>

          <div className="side-card">
            <h4><BookOpen size={16} /> {language === 'ta' ? 'முக்கிய கையேடுகள்' : 'Related Resources'}</h4>
            <div className="side-list">
              <button onClick={() => handleSend(language === 'ta' ? 'நெல் சாகுபடி மற்றும் நீர் மேலாண்மை வழிகாட்டி தருக' : 'Paddy cultivation and irrigation schedule guide')}>
                {language === 'ta' ? 'நெல் சாகுபடி வழிகாட்டி' : 'Paddy Cultivation Guide'}
              </button>
              <button onClick={() => handleSend(language === 'ta' ? 'தக்காளி சொட்டு நீர் பாசனம் மற்றும் உரம் அட்டவணை' : 'Tomato drip irrigation and fertigation schedule')}>
                {language === 'ta' ? 'தக்காளி சொட்டு நீர் அட்டவணை' : 'Tomato Drip Schedule'}
              </button>
              <button onClick={() => handleSend(language === 'ta' ? 'மக்காச்சோளம் மற்றும் பருத்தி நீர் தேவை' : 'Maize and Cotton water requirement')}>
                {language === 'ta' ? 'மக்காச்சோளம் & பருத்தி நீர் தேவை' : 'Maize & Cotton Water Needs'}
              </button>
            </div>
          </div>
        </aside>
      </div>


    </>
  );
}