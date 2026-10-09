/**
 * Gemini AI Service for Farm AI
 * Direct integration with Google Gemini 2.5 Flash API with multilingual farming expertise.
 */

// Default fallback key from environment
const DEFAULT_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';

/**
 * Sanitizes and normalizes an API key.
 * Fixes accidental whitespace or copied line breaks.
 */
export function cleanApiKey(raw) {
  if (!raw || typeof raw !== 'string') return '';
  // In Google AI Studio keys, spaces often occur due to copy-pasting hyphens/linebreaks
  return raw.trim().replace(/\s+/g, '-');
}

/**
 * Auto-fetches the Gemini API key from:
 * 1. User's localStorage preference (if set)
 * 2. Vite environment variable VITE_GEMINI_API_KEY
 * 3. Default embedded key
 */
export function getGeminiApiKey() {
  const localKey = localStorage.getItem('farm_ai_gemini_key');
  if (localKey && localKey.trim()) {
    return cleanApiKey(localKey);
  }

  const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) {
    return cleanApiKey(envKey);
  }

  return cleanApiKey(DEFAULT_KEY);
}

/**
 * Sets or updates the Gemini API key in localStorage.
 */
export function setGeminiApiKey(key) {
  if (!key) {
    localStorage.removeItem('farm_ai_gemini_key');
  } else {
    localStorage.setItem('farm_ai_gemini_key', cleanApiKey(key));
  }
}

/**
 * Checks if a Gemini API key is available.
 */
export function isGeminiConfigured() {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 10);
}

/**
 * Language instructions mapped to user choice
 */
const LANGUAGE_PROMPTS = {
  ta: {
    name: 'Tamil (தமிழ்)',
    speechCode: 'ta-IN',
    instruction: `You MUST respond exclusively in natural, fluent, and respectful TAMIL (தமிழ்).
Use terminology that Tamil Nadu farmers readily understand (e.g., நெல், தக்காளி, மாவுப்பூச்சி, இலைக்கருகல் நோய், வேர் அழுகல், வேப்ப எண்ணெய் கரைசல், சொட்டு நீர் பாசனம், யூரியா, டி.ஏ.பி).
Provide dosage per acre or per litre where applicable (எ.கா. 1 லிட்டர் தண்ணீருக்கு 2 மி.லி).
Be warm, encouraging, practical, and clear.`,
  },
  hi: {
    name: 'Hindi (हिन्दी)',
    speechCode: 'hi-IN',
    instruction: `You MUST respond exclusively in clear, respectful, and practical HINDI (हिन्दी).
Use farming terminology that Indian farmers readily understand (उदा. फसल सुरक्षा, उर्वरक प्रबंधन, ड्रिप सिंचाई, कीटनाशक, जैविक खाद).
Provide precise dosage per acre or litre (उदा. 1 लीटर पानी में 2 मिली).`,
  },
  te: {
    name: 'Telugu (తెలుగు)',
    speechCode: 'te-IN',
    instruction: `You MUST respond exclusively in clear, respectful, and practical TELUGU (తెలుగు).
Use farming terms familiar to farmers in Andhra Pradesh and Telangana (ఉదా. పంట రక్షణ, ఎరువుల యాజమాన్యం, సూక్ష్మ పోషకాలు, పురుగుల మందు).
Provide dosages per acre or litre.`,
  },
  en: {
    name: 'English',
    speechCode: 'en-IN',
    instruction: `You MUST respond in clear, accessible, and structured English.
Keep scientific jargon minimal and explain in practical terms suitable for farmers. Provide measurements in metric units (litres, kg, acres).`,
  },
};

/**
 * Helper to convert a File/Blob into base64 data and mimeType
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const [header, base64] = dataUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type || 'image/jpeg';
      resolve({ base64, mimeType });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

import {
  getIrrigationKnowledgeForPrompt,
  analyzeUserQueryForIrrigation,
  calculateIrrigationRecommendation,
  IRRIGATION_METADATA,
} from './irrigationService.js';

/**
 * Builds the system prompt for Farm AI
 */
function buildSystemPrompt(languageCode = 'en', calculatedContext = null) {
  const langConfig = LANGUAGE_PROMPTS[languageCode] || LANGUAGE_PROMPTS.en;
  const irrigationModelKnowledge = getIrrigationKnowledgeForPrompt();

  let dynamicCalculationBlock = '';
  if (calculatedContext) {
    dynamicCalculationBlock = `
======================================================================
[LIVE COMPUTATION FROM FARM AI IRRIGATION ESTIMATOR MODEL (v0.1, R² 0.9989)]
Based on the farmer's query, here are the exact figures calculated by our trained model:
• Crop: ${calculatedContext.inputs.crop.en} (${calculatedContext.inputs.crop.ta} / ${calculatedContext.inputs.crop.hi})
• Growth Stage: ${calculatedContext.inputs.growthStage.en} (${calculatedContext.inputs.growthStage.ta}) -> Crop Coefficient (Kc) = ${calculatedContext.calculations.kc}
• Soil Type: ${calculatedContext.inputs.soilType.en} (${calculatedContext.inputs.soilType.ta}) -> Storage Buffer = ${calculatedContext.calculations.soilBufferMm} mm
• Reference Evapotranspiration (ET0): ${calculatedContext.calculations.et0MmDay} mm/day
• Crop Evapotranspiration (ETc = ET0 × Kc): ${calculatedContext.calculations.etcMmDay} mm/day
• Effective Rainfall: ${calculatedContext.calculations.effectiveRainfallMm} mm
• Net Irrigation Target: ${calculatedContext.calculations.irrigationTargetMm} mm/day
• Volumetric Water Volume: ${calculatedContext.calculations.litresPerAcre.toLocaleString()} Litres / Acre / Day
• Recommended Drip Pump Duration (6,000 L/hr capacity): ${calculatedContext.calculations.dripDurationFormatted}
• Irrigation Priority: ${calculatedContext.advisory.priority} (${calculatedContext.advisory.recommendation.en} / ${calculatedContext.advisory.recommendation.ta})
• Soil-Specific Water Advice: ${calculatedContext.advisory.soilAdvice.ta} | ${calculatedContext.advisory.soilAdvice.en}
• Stage-Specific Note: ${calculatedContext.advisory.cropNotes.ta} | ${calculatedContext.advisory.cropNotes.en}

MANDATORY RESPONSE RULE FOR THIS QUERY:
1. You MUST incorporate these EXACT calculations (Kc factor, mm/day, Litres/acre, pump operating time) directly into your response!
2. Explicitly cite that this advisory comes from our trained "Farm AI Irrigation Estimator" model (v0.1, R² 0.9989) using regional agro-climatic data.
3. Present the steps clearly using bullet points in the user's chosen language (${langConfig.name}).
======================================================================`;
  }

  return `You are "Farm AI" (விவசாய தோழன் / Kisan Mitra / Farm Companion), an expert agricultural AI assistant designed specifically for Indian and global farmers.

Your core expertise covers:
1. Crop cultivation & schedule: Paddy (நெல்), Tomato (தக்காளி), Chilli (மிளகாய்), Maize (மக்காச்சோளம்), Cotton (பருத்தி), Groundnut (வேர்க்கடலை), Sugarcane, Banana, Vegetables, Pulses, Fruits.
2. Soil Health & Fertilizer: Soil test interpretation, N-P-K ratios, organic manure (panchagavya, jeevamrutham, vermicompost), micronutrients.
3. Pest & Disease Diagnosis: Identifying symptoms (leaf spots, blight, root rot, stem borer, thrips, aphids, mites) and prescribing integrated pest management (IPM) + organic remedies + chemical sprays with safety precautions.
4. Irrigation & Water Management: Drip irrigation, sprinkler, scheduling by growth stage and weather, calculated using our trained Farm AI Irrigation Estimator model.
5. Weather & Season Advisory: Kharif, Rabi, Zaid seasons, monsoon precautions.

CRITICAL LANGUAGE REQUIREMENT:
${langConfig.instruction}

If the user types in Tamil even when another language is selected, adapt naturally and reply in that language!

FORMATTING RULES:
- Use bullet points (•) for actionable steps.
- Keep recommendations clear, concise, and structured.
- Include organic/natural options alongside conventional methods whenever possible.
- Include safe application guidelines.

${irrigationModelKnowledge}
${dynamicCalculationBlock}`;
}

/**
 * Primary chat generation with Gemini 2.5 Flash
 */
export async function sendGeminiChatMessage({
  message,
  history = [],
  imageFile = null,
  imageBase64 = null,
  imageMimeType = null,
  language = 'en',
}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please configure it in settings.');
  }

  // Handle image preparation
  let inlineImage = null;
  if (imageFile) {
    try {
      const converted = await fileToBase64(imageFile);
      inlineImage = {
        mimeType: converted.mimeType,
        data: converted.base64,
      };
    } catch (e) {
      console.warn('Failed to parse image file for Gemini:', e);
    }
  } else if (imageBase64) {
    inlineImage = {
      mimeType: imageMimeType || 'image/jpeg',
      data: imageBase64,
    };
  }

  // Format conversational contents for Gemini API
  const contents = [];

  // Add recent history (up to last 8 turns)
  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-8);
    for (const h of recent) {
      if (h.role === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: h.text }],
        });
      } else if (h.role === 'ai' || h.role === 'model') {
        contents.push({
          role: 'model',
          parts: [{ text: h.text }],
        });
      }
    }
  }

  // Current turn parts
  const currentParts = [];
  if (message && message.trim()) {
    currentParts.push({ text: message.trim() });
  } else if (inlineImage) {
    currentParts.push({
      text: 'Please examine this crop/leaf image. Identify any disease, deficiency, or pest symptoms, and provide management advice.',
    });
  }

  if (inlineImage) {
    currentParts.push({
      inlineData: {
        mimeType: inlineImage.mimeType,
        data: inlineImage.data,
      },
    });
  }

  contents.push({
    role: 'user',
    parts: currentParts,
  });

  // Check if user is inquiring about irrigation or supported crops
  let calculatedContext = null;
  try {
    const analysis = analyzeUserQueryForIrrigation(message);
    if (analysis) {
      calculatedContext = calculateIrrigationRecommendation({
        crop: analysis.crop,
        growthStage: analysis.stage,
        soilType: analysis.soil,
      });
    }
  } catch (err) {
    console.warn('Error computing live irrigation recommendation:', err);
  }

  const systemInstruction = buildSystemPrompt(language, calculatedContext);

  // Models to attempt: primary gemini-2.5-flash, fallback to gemini-flash-latest
  const modelEndpoints = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
  ];

  let lastError = null;

  for (const endpoint of modelEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${response.status}`;
        console.warn(`Gemini endpoint ${endpoint} failed: ${errMsg}`);
        lastError = new Error(errMsg);
        continue; // try next fallback model
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const replyText = candidate?.content?.parts?.[0]?.text;

      if (replyText) {
        return replyText.trim();
      }
    } catch (err) {
      console.warn(`Network/call failure on ${endpoint}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API');
}

/**
 * Real Gemini-powered Crop Disease Detection
 */
export async function detectCropDiseaseWithGemini(imageFile, language = 'en') {
  const apiKey = getGeminiApiKey();
  if (!apiKey || !imageFile) {
    return null;
  }

  const { base64, mimeType } = await fileToBase64(imageFile);
  const langConfig = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.en;

  const prompt = `You are a crop pathology specialist. Analyze this crop/leaf image carefully.
Respond strictly in JSON format with NO markdown wrapping, conforming to this schema:
{
  "possibleIssue": "Name of the disease, pest or nutrient deficiency (in ${langConfig.name})",
  "confidence": number between 50 and 98,
  "status": "Healthy" or "Needs Attention" or "Critical Issue" (in ${langConfig.name}),
  "nextSteps": [
    "Step 1 actionable advice (in ${langConfig.name})",
    "Step 2 treatment or organic remedy (in ${langConfig.name})",
    "Step 3 prevention tip (in ${langConfig.name})"
  ],
  "disclaimer": "AI-assisted guidance — verify with local agricultural officer when needed (in ${langConfig.name})"
}`;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType, data: base64 } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    return parsed;
  } catch (e) {
    console.warn('Gemini disease detection fallback:', e);
    return null;
  }
}

/**
 * Real-time AI research & comprehensive guide generator for agricultural resources.
 * Generates an in-depth, multi-paragraph guide with actionable farmer steps and dosage.
 */
export async function searchResourceTopicWithAI({
  title,
  category = 'Crop Guide',
  description = '',
  language = 'en',
}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const langConfig = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.en;

  const prompt = `You are a Senior Agricultural Scientist & Agronomist at Farm AI.
Perform an in-depth, real-time agronomic analysis and complete farmer handbook guide on this topic:

TOPIC: "${title}"
CATEGORY: "${category}"
CONTEXT: "${description}"

LANGUAGE REQUIREMENT:
${langConfig.instruction}

PLEASE ORGANIZE YOUR EXPLANATION INTO CLEAR, PRACTICAL SECTIONS:

1. 🌾 விரிவான மேலோட்டம் & முக்கியத்துவம் (In-Depth Overview & Principles):
Write 2 to 3 rich, informative paragraphs explaining the foundational concepts, scientific reasoning, why this topic is essential for farmers, and its direct effect on crop yield, profitability, and soil sustainability.

2. 📋 படிப்படியான வழிகாட்டுதல் & செய்முறை (Step-by-Step Implementation):
Provide 4-5 numbered actionable steps that a farmer can execute in the field, including exact timings, per-acre or per-litre dosages (e.g., specific fertilizer or biopesticide grams/millilitres), water requirements, and field preparation.

3. 🌧️ பருவநிலை, பாசனம் & மேலாண்மை (Climate, Irrigation & Management):
Provide critical tips on seasonal considerations (Kharif, Rabi, Summer), water scheduling (drip/flooding), and moisture management.

4. ⭐ முக்கிய நன்மைகள் & தவிர்க்க வேண்டிய தவறுகள் (Key Advantages & Common Mistakes to Avoid):
List 3 key agronomic benefits and 2 costly mistakes farmers commonly make and how to prevent them.

TONE & FORMAT:
- Structured with clear headings and bullet points.
- Farmer-first, practical, respectful, and authoritative.
- Specific measurements in metric units (acres, kg, litres, ml/L).`;

  const modelEndpoints = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
  ];

  let lastErr = null;

  for (const endpoint of modelEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        lastErr = new Error(`Gemini API error (${response.status}): ${JSON.stringify(errJson)}`);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (e) {
      lastErr = e;
      console.warn(`Endpoint ${endpoint} failed for resource search:`, e);
    }
  }

  throw lastErr || new Error('Failed to generate real-time resource details.');
}

export { LANGUAGE_PROMPTS };
