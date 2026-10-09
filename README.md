# 🌱 Farm AI — Smart Farming. Better Decisions.

Farm AI is an intelligent agricultural advisory and farm management platform built to empower farmers with real-time AI assistance, localized crop diagnostics, FAO-56 irrigation planning, and weather forecasting.

---

## 🚀 Key Features

- **🌾 Multilingual AI Farming Assistant:**
  - Real-time conversation powered by Google Gemini.
  - Native support for **Tamil (தமிழ்)**, **English**, **Hindi (हिन्दी)**, and **Telugu (తెలుగు)**.
  - Voice input (Speech-to-Text) and Text-to-Speech audio readout for farmers.
- **🔍 Plant Disease Detection:**
  - Photo upload and camera capture support (optimized for mobile and desktop).
  - Instant disease identification, confidence score, treatment recommendations, and preventive steps.
- **💧 Smart Irrigation Guide & Calculations:**
  - Standardized FAO-56 Hargreaves evapotranspiration (ET₀) and crop-coefficient ($K_c$) calculations.
  - Exact daily irrigation targets (mm/day, Litres/acre) and drip pump run duration.
- **🚜 My Fields & Crop Management:**
  - Complete lifecycle tracking from Sowing to Harvest.
  - Growth stage tracking, fertilizer schedules, and irrigation logs for Paddy, Tomato, Chili, Maize, Cotton, and Groundnut.
- **🌤️ Real-Time Weather & Farming Advisory:**
  - Live local weather integration, temperature, humidity, rain chance, and field alerts.
- **📚 Smart Agricultural Resources:**
  - Curated cultivation guides with on-demand AI deep-dive search and multilingual audio support.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router 6
- **Styling:** Vanilla CSS with custom agricultural design system
- **Icons:** Lucide React
- **AI Engine:** Google Gemini 2.5 Flash
- **Calculations & Models:** FAO-56 Hargreaves Irrigation Model & Crop Coefficient Tables

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/rk2725q-star/fam-ai.git
cd fam-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production
```bash
npm run build
```

---

## 📄 License
MIT License
