/**
 * Farm AI Irrigation Service
 * Powered by trained model metadata (irrigation_metadata.json),
 * crop reference table (crop_reference.csv), soil reference table (soil_reference.csv),
 * and weather data (weather_hyderabad.csv).
 */

export const IRRIGATION_METADATA = {
  modelName: 'Farm AI Irrigation Estimator',
  version: '0.1',
  location: 'Hyderabad, Telangana (South India)',
  latitude: 17.385,
  longitude: 78.4867,
  target: 'irrigation_target_mm',
  et0Method: 'Hargreaves approximation (FAO-56)',
  metrics: {
    r2: 0.99889,
    maeMmDay: 0.0282,
    rmseMmDay: 0.0645,
  },
  supportedCrops: ['paddy', 'tomato', 'chili', 'maize', 'cotton', 'groundnut'],
  supportedStages: ['initial', 'development', 'mid', 'late'],
  supportedSoils: ['sandy', 'loamy', 'clay'],
};

/**
 * Crop coefficients (Kc) from crop_reference.csv & training dataset
 */
export const CROP_REFERENCE = {
  paddy: {
    id: 'paddy',
    names: {
      en: 'Paddy / Rice',
      ta: 'நெல் (Paddy)',
      hi: 'धान (Paddy)',
      te: 'వరి (Paddy)',
    },
    kc: {
      initial: 1.05,
      development: 1.10,
      mid: 1.20,
      late: 0.90,
    },
    rootDepthM: 0.3,
    allowableDepletion: 0.4,
    notes: {
      ta: 'நடுப்பருவத்தில் (mid stage) அதிகபட்ச நீர் தேவை (Kc 1.20). பூக்கும் மற்றும் பால் பிடிக்கும் தருணத்தில் நீர் பற்றாக்குறை இருக்கக்கூடாது.',
      en: 'Peak water requirement during mid-season (Kc 1.20). Critical during panicle initiation and flowering.',
      hi: 'मध्य अवस्था (फूल आते समय) में सबसे अधिक पानी की आवश्यकता (Kc 1.20).',
      te: 'పూత మరియు గింజ పాలు పోసుకునే దశలో అత్యధిక నీటి అవసరం (Kc 1.20).',
    },
  },
  tomato: {
    id: 'tomato',
    names: {
      en: 'Tomato',
      ta: 'தக்காளி (Tomato)',
      hi: 'टमाटर (Tomato)',
      te: 'టమాటా (Tomato)',
    },
    kc: {
      initial: 0.60,
      development: 0.90,
      mid: 1.15,
      late: 0.80,
    },
    rootDepthM: 0.3,
    allowableDepletion: 0.4,
    notes: {
      ta: 'பூக்கும் மற்றும் காய் பிடிக்கும் நடுப்பருவத்தில் Kc 1.15. சீரான சொட்டு நீர் பாசனம் காய் வெடிப்பை (fruit cracking) தடுக்கும்.',
      en: 'Peak requirement during flowering and fruit setting (Kc 1.15). Consistent drip irrigation avoids fruit cracking and blossom end rot.',
      hi: 'फूल व फल लगने के समय Kc 1.15. नियमित ड्रिप सिंचाई से फल फटने से बचते हैं।',
      te: 'పూత మరియు కాయ దశలో Kc 1.15. స్థిరమైన డ్రిప్ సాగు ద్వారా కాయలు పగలకుండా కాపాడవచ్చు.',
    },
  },
  chili: {
    id: 'chili',
    names: {
      en: 'Chili',
      ta: 'மிளகாய் (Chili)',
      hi: 'मिर्च (Chili)',
      te: 'మిరప (Chili)',
    },
    kc: {
      initial: 0.60,
      development: 0.90,
      mid: 1.05,
      late: 0.80,
    },
    rootDepthM: 0.3,
    allowableDepletion: 0.4,
    notes: {
      ta: 'வளர்ச்சி மற்றும் காய்க்கும் பருவத்தில் மிதமான பாசனம் சிறந்தது. அதிக நீர் தேங்கினால் இலைக்கொட்டுதல் மற்றும் வேர் அழுகல் ஏற்படும்.',
      en: 'Sensitive to waterlogging. Moderate steady moisture ensures heavy flowering and prevents blossom drop.',
      hi: 'जलभराव से बचें, मध्यम और नियमित सिंचाई से फूल नहीं झड़ते।',
      te: 'నీరు నిల్వ ఉండకుండా చూసుకోవాలి. తేమ సమతుల్యంగా ఉంటే పూత రాలదు.',
    },
  },
  maize: {
    id: 'maize',
    names: {
      en: 'Maize / Corn',
      ta: 'மக்காச்சோளம் (Maize)',
      hi: 'मक्का (Maize)',
      te: 'మొక్కజొన్న (Maize)',
    },
    kc: {
      initial: 0.30,
      development: 0.75,
      mid: 1.20,
      late: 0.60,
    },
    rootDepthM: 0.3,
    allowableDepletion: 0.4,
    notes: {
      ta: 'பூக்கும் பருவம் (Tasseling) மற்றும் கதிர் பிடிக்கும் பருவத்தில் Kc 1.20. இந்த தருணத்தில் நீர் பற்றாக்குறை மகசூலை 40% வரை குறைக்கும்.',
      en: 'Critical moisture stages: silking and grain filling (Kc 1.20). Moisture stress causes poor cob filling.',
      hi: 'मंजरी आने (tasseling) और दाना बनने पर Kc 1.20, इस समय सिंचाई बेहद जरूरी है।',
      te: 'కంకి మరియు గింజ కట్టే దశలో Kc 1.20, ఈ సమయంలో నీటి ఎద్దడి ఉండకూడదు.',
    },
  },
  cotton: {
    id: 'cotton',
    names: {
      en: 'Cotton',
      ta: 'பருத்தி (Cotton)',
      hi: 'कपास (Cotton)',
      te: 'పత్తి (Cotton)',
    },
    kc: {
      initial: 0.35,
      development: 0.75,
      mid: 1.15,
      late: 0.70,
    },
    rootDepthM: 0.3,
    allowableDepletion: 0.4,
    notes: {
      ta: 'பூக்கும் மற்றும் சப்பைகள் பிடிக்கும் பருவத்தில் (Square and boll formation) Kc 1.15. அறுவடைக்கு முன் (Late stage) பாசனத்தைக் குறைக்க வேண்டும்.',
      en: 'Peak water at square formation and boll development (Kc 1.15). Reduce watering near boll bursting.',
      hi: 'टिंडे बनने के समय Kc 1.15, चुनाई से पहले सिंचाई कम करें।',
      te: 'కాయలు (bolls) ఏర్పడే దశలో Kc 1.15, పత్తి తీత సమయంలో నీటిని తగ్గించాలి.',
    },
  },
  groundnut: {
    id: 'groundnut',
    names: {
      en: 'Groundnut / Peanut',
      ta: 'வேர்க்கடலை / நிலக்கடலை (Groundnut)',
      hi: 'मूंगफली (Groundnut)',
      te: 'వేరుశనగ (Groundnut)',
    },
    kc: {
      initial: 0.40,
      development: 0.75,
      mid: 1.15,
      late: 0.60,
    },
    rootDepthM: 0.3,
    allowableDepletion: 0.4,
    notes: {
      ta: 'ஊடு இறங்கும் பருவம் (Pegging) மற்றும் காய் பிடிக்கும் பருவத்தில் நிலத்தில் போதுமான ஈரம் அவசியம் (Kc 1.15).',
      en: 'Critical stages: flowering, peg penetration into soil, and pod development (Kc 1.15).',
      hi: 'सुइयां बनते (pegging) और फलियां भरते समय सिंचाई अनिवार्य (Kc 1.15).',
      te: 'ఊడలు నేలలోకి దిగే దశ మరియు కాయ తయారయ్యే సమయంలో తేమ చాలా అవసరం (Kc 1.15).',
    },
  },
};

/**
 * Soil water holding capacity from soil_reference.csv
 */
export const SOIL_REFERENCE = {
  sandy: {
    id: 'sandy',
    names: {
      en: 'Sandy Soil',
      ta: 'மணல் பாங்கான மண் (Sandy)',
      hi: 'रेतीली मिट्टी (Sandy)',
      te: 'ఇసుక నేల (Sandy)',
    },
    availableWaterMmM: 80,
    storageAllowanceMm: 80 * 0.3 * 0.4, // 9.6 mm
    waterRetention: 'Low (குறைந்த நீர் தக்கவைப்பு)',
    frequencyAdvice: {
      ta: 'மணல் நிலத்தில் நீர் விரைவாக வடிகிறது. குறைந்த அளவு நீரை 1-2 நாட்களுக்கு ஒருமுறை அடிக்கடி பாய்ச்ச வேண்டும்.',
      en: 'Low water holding capacity. Requires frequent, smaller irrigation doses (every 1-2 days).',
      hi: 'रेतीली मिट्टी में बार-बार कम मात्रा में पानी दें (1-2 दिन के अंतर पर)।',
      te: 'ఇసుక నేలలో త్వరగా నీరు ఇంకిపోతుంది, కాబట్టి తక్కువ మోతాదులో తరచుగా నీరివ్వాలి.',
    },
  },
  loamy: {
    id: 'loamy',
    names: {
      en: 'Loamy / Red Loam Soil',
      ta: 'வண்டல் / செம்மண் (Loamy)',
      hi: 'दोमट मिट्टी (Loamy)',
      te: 'ఒండ్రు నేల / ఎర్ర నేల (Loamy)',
    },
    availableWaterMmM: 150,
    storageAllowanceMm: 150 * 0.3 * 0.4, // 18.0 mm
    waterRetention: 'Optimal (மிதமான சமச்சீர் நீர் தக்கவைப்பு)',
    frequencyAdvice: {
      ta: 'வண்டல் மண் சிறந்த ஈரப்பதம் கொண்டது. பயிரின் தேவைக்கேற்ப 2-3 நாட்களுக்கு ஒருமுறை பாசனம் சிறந்தது.',
      en: 'Optimal water retention and aeration. Typical irrigation frequency is every 2-3 days.',
      hi: 'दोमट मिट्टी में नमी अच्छी टिकती है, 2-3 दिन के अंतर पर सिंचाई करें।',
      te: 'ఒండ్రు నేలలో తేమ నిల్వ బాగుంటుంది, 2-3 రోజులకు ఒకసారి సరిపోతుంది.',
    },
  },
  clay: {
    id: 'clay',
    names: {
      en: 'Clay / Black Cotton Soil',
      ta: 'களிமண் / கரிசல் மண் (Clay)',
      hi: 'काली / चिकनी मिट्टी (Clay)',
      te: 'నల్ల రేగడి నేల (Clay)',
    },
    availableWaterMmM: 180,
    storageAllowanceMm: 180 * 0.3 * 0.4, // 21.6 mm
    waterRetention: 'High (அதிக நீர் தக்கவைப்பு)',
    frequencyAdvice: {
      ta: 'களிமண் அதிக நீரை தக்கவைக்கும். அதிக நீர் பாய்ச்சினால் வேர் அழுகும். 3-4 நாட்களுக்கு ஒருமுறை மண்ணை பரிசோதித்து பாய்ச்சவும்.',
      en: 'High water retention. Prone to waterlogging; avoid over-irrigation. Water every 3-4 days after soil check.',
      hi: 'चिकनी/काली मिट्टी में पानी ज्यादा देर टिकता है। जलभराव से बचें, 3-4 दिन में पानी दें।',
      te: 'నల్ల రేగడి నేలలో తేమ ఎక్కువ కాలం ఉంటుంది. నీరు ఎక్కువైతే వేరు కుళ్లు వస్తుంది, 3-4 రోజులకు ఒకసారి చాలు.',
    },
  },
};

/**
 * Growth Stages metadata
 */
export const GROWTH_STAGES = {
  initial: {
    id: 'initial',
    names: {
      en: 'Initial (Seedling / Germination)',
      ta: 'தொடக்க நிலை (முளைப்பு / நாற்று)',
      hi: 'प्रारंभिक अवस्था (अंकुरण / रोपाई)',
      te: 'ప్రారంభ దశ (మొలక / నాటు)',
    },
    stageProgress: '0% - 20%',
  },
  development: {
    id: 'development',
    names: {
      en: 'Development (Vegetative Growth)',
      ta: 'வளர்ச்சி நிலை (தழைப்பருவம்)',
      hi: 'विकास अवस्था (वानस्पतिक वृद्धि)',
      te: 'వృద్ధి దశ (శాఖీయ దశ)',
    },
    stageProgress: '20% - 50%',
  },
  mid: {
    id: 'mid',
    names: {
      en: 'Mid-Season (Flowering & Fruiting)',
      ta: 'நடுப்பருவம் (பூக்கும் & காய்க்கும் பருவம்)',
      hi: 'मध्य मौसम (फूल व फल लगना)',
      te: 'మధ్య దశ (పూత మరియు కాత దశ)',
    },
    stageProgress: '50% - 85%',
  },
  late: {
    id: 'late',
    names: {
      en: 'Late Season (Ripening & Harvest)',
      ta: 'முதிர்ச்சி நிலை (முதிர்ச்சி & அறுவடை)',
      hi: 'अंतिम अवस्था (पकाव व कटाई)',
      te: 'చివరి దశ (పక్వత మరియు కోత)',
    },
    stageProgress: '85% - 100%',
  },
};

/**
 * Computes Extraterrestrial Radiation Ra (MJ/m2/day) according to FAO-56
 */
export function computeRa(latitudeDeg = 17.385, dayOfYear = null) {
  if (!dayOfYear) {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) || 1;
  }
  const phi = (latitudeDeg * Math.PI) / 180;
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365);
  const delta = 0.409 * Math.sin(((2 * Math.PI * dayOfYear) / 365) - 1.39);
  const ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(delta))));
  const ra = (24 * 60 / Math.PI) * 0.0820 * dr * (
    ws * Math.sin(phi) * Math.sin(delta) +
    Math.cos(phi) * Math.cos(delta) * Math.sin(ws)
  );
  return ra;
}

/**
 * Computes Reference Evapotranspiration (ET0) using Hargreaves approximation
 * (exact formula from model training)
 */
export function computeET0({
  temperatureAvg = 28.0,
  temperatureMax = 33.0,
  temperatureMin = 23.0,
  latitude = 17.385,
  dayOfYear = null,
}) {
  const ra = computeRa(latitude, dayOfYear);
  const tDiff = Math.max(0.1, temperatureMax - temperatureMin);
  const et0 = 0.0023 * 0.408 * ra * (temperatureAvg + 17.8) * Math.sqrt(tDiff);
  return Number(et0.toFixed(2));
}

/**
 * Primary calculation engine reproducing trained model target:
 * Target (mm) = max(0, ETc - Effective Rainfall)
 */
export function calculateIrrigationRecommendation({
  crop = 'tomato',
  growthStage = 'mid',
  soilType = 'loamy',
  weather = {},
}) {
  const cropKey = crop.toLowerCase().trim();
  const stageKey = growthStage.toLowerCase().trim();
  const soilKey = soilType.toLowerCase().trim();

  const cropData = CROP_REFERENCE[cropKey] || CROP_REFERENCE.tomato;
  const soilData = SOIL_REFERENCE[soilKey] || SOIL_REFERENCE.loamy;
  const stageData = GROWTH_STAGES[stageKey] || GROWTH_STAGES.mid;

  const kc = cropData.kc[stageKey] ?? 1.0;

  // Extract weather or provide defaults based on training data
  const tempAvg = Number(weather.temperatureAvg ?? weather.temperature ?? 28.5);
  const tempMax = Number(weather.temperatureMax ?? (tempAvg + 4.5));
  const tempMin = Number(weather.temperatureMin ?? (tempAvg - 4.5));
  const rainfall = Number(weather.rainfall ?? weather.rain ?? 0.0);
  const humidity = Number(weather.humidity ?? 65);

  // Compute ET0 via model Hargreaves formula
  const et0 = computeET0({
    temperatureAvg: tempAvg,
    temperatureMax: tempMax,
    temperatureMin: tempMin,
    latitude: IRRIGATION_METADATA.latitude,
  });

  // ETc = ET0 * Kc
  const etc = Number((et0 * kc).toFixed(2));

  // Effective Rainfall formula: min(0.8 * rainfall, 0.8 * etc)
  const effectiveRainfall = Number(Math.min(0.8 * rainfall, 0.8 * etc).toFixed(2));

  // Target irrigation in mm/day
  const irrigationTargetMm = Number(Math.max(0, etc - effectiveRainfall).toFixed(2));

  // Volumetric conversions: 1 mm depth over 1 acre = 4,046.86 Litres
  const litresPerAcre = Math.round(irrigationTargetMm * 4046.86);

  // Drip system run time: assuming standard 6,000 L/hr pump capacity per acre
  const dripFlowRateLph = 6000;
  const totalMinutes = Math.round((litresPerAcre / dripFlowRateLph) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const dripDurationFormatted = hours > 0 ? `${hours} மணி ${mins} நிமிடம் (${hours}h ${mins}m)` : `${mins} நிமிடம் (${mins}m)`;

  // Soil Storage buffer
  const soilBufferMm = Number(soilData.storageAllowanceMm.toFixed(1));

  // Determine priority & status
  let priority = 'Medium';
  let recommendationTa = 'இன்று வழக்கமான பாசனம் செய்யவும்';
  let recommendationEn = 'Irrigate Today as Scheduled';
  let soilStatusTa = 'மிதமான ஈரப்பதம்';
  let soilStatusEn = 'Moderate Moisture';

  if (rainfall >= soilBufferMm || irrigationTargetMm === 0) {
    priority = 'Skip';
    recommendationTa = 'இன்று பாசனம் தேவையில்லை (மழை போதுமானது)';
    recommendationEn = 'Skip Irrigation Today (Rainfall Sufficient)';
    soilStatusTa = 'மண்ணில் அதிக ஈரப்பதம் (Saturated)';
    soilStatusEn = 'Soil Saturated';
  } else if (irrigationTargetMm > 5.0) {
    priority = 'High';
    recommendationTa = 'உடனடி பாசனம் தேவை (அதிக நீர் பற்றாக்குறை)';
    recommendationEn = 'Immediate Irrigation Needed (High Water Deficit)';
    soilStatusTa = 'வறண்ட நிலை (Dry)';
    soilStatusEn = 'Low Soil Moisture';
  } else {
    priority = 'Normal';
    recommendationTa = 'பரிந்துரைக்கப்பட்ட அளவு பாசனம் செய்யவும்';
    recommendationEn = 'Standard Maintenance Irrigation';
    soilStatusTa = 'சமச்சீர் ஈரம் (Adequate)';
    soilStatusEn = 'Adequate';
  }

  return {
    model: {
      name: IRRIGATION_METADATA.modelName,
      version: IRRIGATION_METADATA.version,
      r2: IRRIGATION_METADATA.metrics.r2,
      mae: IRRIGATION_METADATA.metrics.maeMmDay,
    },
    inputs: {
      crop: cropData.names,
      cropId: cropData.id,
      growthStage: stageData.names,
      growthStageId: stageData.id,
      soilType: soilData.names,
      soilTypeId: soilData.id,
      weather: {
        tempAvg,
        tempMax,
        tempMin,
        rainfall,
        humidity,
      },
    },
    calculations: {
      kc,
      et0MmDay: et0,
      etcMmDay: etc,
      effectiveRainfallMm: effectiveRainfall,
      irrigationTargetMm,
      litresPerAcre,
      dripDurationMinutes: totalMinutes,
      dripDurationFormatted,
      soilBufferMm,
    },
    advisory: {
      priority,
      recommendation: {
        ta: recommendationTa,
        en: recommendationEn,
      },
      soilStatus: {
        ta: soilStatusTa,
        en: soilStatusEn,
      },
      cropNotes: cropData.notes,
      soilAdvice: soilData.frequencyAdvice,
    },
  };
}

/**
 * Returns a rich markdown knowledge block detailing the trained model and data
 * for inclusion in the Gemini Farm AI Assistant prompt.
 */
export function getIrrigationKnowledgeForPrompt() {
  return `
[FARM AI TRAINED IRRIGATION MODEL KNOWLEDGE - MANDATORY TO USE]
Model Identity: "${IRRIGATION_METADATA.modelName}" (v0.1, R²: 0.9989, MAE: 0.028 mm/day).
Dataset: Hyderabad & South India Agro-Climate (weather_hyderabad.csv, irrigation_training_data.csv).

SUPPORTED CROPS & EXACT Kc COEFFICIENTS (FROM crop_reference.csv):
• Paddy (நெல்): Initial Kc=1.05, Development Kc=1.10, Mid-Season Kc=1.20, Late Kc=0.90
• Tomato (தக்காளி): Initial Kc=0.60, Development Kc=0.90, Mid-Season Kc=1.15, Late Kc=0.80
• Chili (மிளகாய்): Initial Kc=0.60, Development Kc=0.90, Mid-Season Kc=1.05, Late Kc=0.80
• Maize (மக்காச்சோளம்): Initial Kc=0.30, Development Kc=0.75, Mid-Season Kc=1.20, Late Kc=0.60
• Cotton (பருத்தி): Initial Kc=0.35, Development Kc=0.75, Mid-Season Kc=1.15, Late Kc=0.70
• Groundnut (வேர்க்கடலை): Initial Kc=0.40, Development Kc=0.75, Mid-Season Kc=1.15, Late Kc=0.60

SUPPORTED SOIL TYPES & WATER STORAGE (FROM soil_reference.csv):
• Sandy Soil (மணல் மண்): 80 mm/m water holding capacity, storage allowance = 9.6 mm (low retention, water every 1-2 days).
• Loamy Soil (வண்டல் / செம்மண்): 150 mm/m capacity, storage allowance = 18.0 mm (optimal retention, water every 2-3 days).
• Clay Soil (களிமண் / கரிசல் மண்): 180 mm/m capacity, storage allowance = 21.6 mm (high retention, avoid waterlogging).

MATHEMATICAL ESTIMATION FORMULA:
1. ET0 (Reference Evapotranspiration): Hargreaves formula using solar radiation & temperatures (typically 3.5 to 6.5 mm/day).
2. ETc (Crop Evapotranspiration): ETc = ET0 × Kc.
3. Effective Rainfall: min(0.8 × Rain, 0.8 × ETc).
4. Daily Irrigation Target (mm): Net Target = max(0, ETc - Effective Rainfall).
5. Volumetric Conversion: 1 mm/acre = 4,047 Litres/Acre (approx. 4,050 L).
6. Drip Pump Duration: Target Litres / 6,000 L/hour.

INSTRUCTION FOR ASSISTANT RESPONSES:
Whenever a user asks about irrigation, watering, soil moisture, or crop growth stages:
- Always reference our trained Farm AI Irrigation Estimator model!
- State the exact Kc value for the crop and growth stage.
- Give concrete figures: mm/day, Litres per acre, and drip pump operating hours.
- Mention soil type considerations (Sandy vs Loamy vs Clay).
- Respond in the user's selected language (Tamil, English, Hindi, Telugu).
`;
}

/**
 * Detects if a user message is inquiring about irrigation, water, or supported crops.
 */
export function analyzeUserQueryForIrrigation(query = '') {
  if (!query) return null;
  const q = query.toLowerCase();

  const irrigationKeywords = [
    'water', 'irrigate', 'irrigation', 'தண்ணீர்', 'நீர்ப்பாசனம்', 'பாசனம்', 'சொட்டு நீர்',
    'पानी', 'सिंचाई', 'ड्रिप', 'నీరు', 'నీటిపారుదల', 'డ్రిప్', 'moisture', 'ஈரப்பதம்', 'ஈரம்'
  ];

  const hasIrrigationIntent = irrigationKeywords.some((kw) => q.includes(kw));

  // Check crop
  let crop = null;
  if (q.includes('tomato') || q.includes('தக்காளி') || q.includes('टमाटर') || q.includes('టమాటా')) crop = 'tomato';
  else if (q.includes('paddy') || q.includes('rice') || q.includes('நெல்') || q.includes('धान') || q.includes('వరి')) crop = 'paddy';
  else if (q.includes('chili') || q.includes('chilli') || q.includes('மிளகாய்') || q.includes('मिर्च') || q.includes('మిరప')) crop = 'chili';
  else if (q.includes('maize') || q.includes('corn') || q.includes('மக்காச்சோளம்') || q.includes('मक्का') || q.includes('మొక్కజొన్న')) crop = 'maize';
  else if (q.includes('cotton') || q.includes('பருத்தி') || q.includes('कपास') || q.includes('పత్తి')) crop = 'cotton';
  else if (q.includes('groundnut') || q.includes('peanut') || q.includes('வேர்க்கடலை') || q.includes('நிலக்கடலை') || q.includes('मूंगफली') || q.includes('వేరుశనగ')) crop = 'groundnut';

  // Check stage
  let stage = 'mid';
  if (q.includes('initial') || q.includes('seedling') || q.includes('நாற்று') || q.includes('முளைப்பு') || q.includes('शुरुआती') || q.includes('మొలక')) stage = 'initial';
  else if (q.includes('development') || q.includes('vegetative') || q.includes('வளர்ச்சி') || q.includes('तழை') || q.includes('विकास') || q.includes('వృద్ధి')) stage = 'development';
  else if (q.includes('late') || q.includes('harvest') || q.includes('முதிர்ச்சி') || q.includes('அறுவடை') || q.includes('कटाई') || q.includes('కోత')) stage = 'late';
  else if (q.includes('flower') || q.includes('fruit') || q.includes('பூக்கும்') || q.includes('காய்') || q.includes('நடுப்பருவம்') || q.includes('मध्य')) stage = 'mid';

  // Check soil
  let soil = 'loamy';
  if (q.includes('sandy') || q.includes('மணல்') || q.includes('रेतीली') || q.includes('ఇసుక')) soil = 'sandy';
  else if (q.includes('clay') || q.includes('black') || q.includes('களிமண்') || q.includes('கரிசல்') || q.includes('काली') || q.includes('నల్ల రేగడి')) soil = 'clay';
  else if (q.includes('loam') || q.includes('red') || q.includes('வண்டல்') || q.includes('செம்மண்') || q.includes('दोमट') || q.includes('ఎర్ర')) soil = 'loamy';

  if (hasIrrigationIntent || crop) {
    return {
      crop: crop || 'tomato',
      stage,
      soil,
      isExplicitIrrigation: hasIrrigationIntent,
    };
  }

  return null;
}
