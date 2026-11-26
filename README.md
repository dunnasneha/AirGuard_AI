# AirWise AI

> **"Breathe smarter. Live cleaner."**  
> *A GenAI-powered urban air quality decision-support assistant helping families and communities navigate severe winter smog and urban air pollution with actionable low-emission routines, indoor air quality hacks, and transparent impact tracking.*

---

## Problem

During severe winter smog episodes in urban centers, thermal inversion layers trap vehicular exhaust, industrial emissions, and construction dust close to street level. Families and citizens face critical everyday dilemmas:

- *When is it genuinely safe for children or seniors to step outside?*
- *Should windows remain closed, and when should living spaces be ventilated?*
- *What low-emission transit choices actually reduce personal exposure and community emissions?*
- *How can households distinguish real-time meteorological data from actionable daily steps without panic or fear-based messaging?*

Conventional air-quality apps merely display a colored number (AQI) with generic warnings, leaving households uninformed on practical mitigation.

---

## Solution

**AirWise AI** transforms raw air-quality data into an intelligent, personalized decision-support engine. By fusing:

1. **Real-Time Environmental Data** (Open-Meteo Air Quality & Weather models worldwide),
2. **Atmospheric Physics** (diurnal boundary layer heights and thermal inversion windows),
3. **Hyper-Personalized Household Profiles** (lifestyle, commute mode, indoor equipment, and vulnerable family members), and
4. **Google Gemini Generative AI**,

AirWise AI generates conservative, structured daily routines, provides side-by-side low-emission choice evaluations, and guides families through indoor safety protocols—all while transparently calculating personal and community impact.

---

## Features

| Feature | Description |
| :--- | :--- |
| **Environmental Dashboard** | Real-time NAQI AQI, PM2.5, PM10, Ozone, Temperature, Humidity, and Wind speed with text, icons, and WCAG-conscious indicators. |
| **Pollution Timeline** | 24-hour hourly curve identifying the **Better Outdoor Window** (optimal afternoon mixing) and **Higher Pollution Window** (morning/night thermal inversion). |
| **GenAI Daily Action Plan** | Hour-by-hour schedule across 6 diurnal phases (*Morning, Commute, Work/Study, Outdoor, Evening, Night*) answering **WHAT**, **WHY**, **IMPACT**, and **NEXT STEP**. |
| **Cleaner Option Comparator** | Side-by-side evaluation of transit alternatives (e.g. Solo Car vs Metro, Car vs Walking) with convenience, cost, relative emissions, and AI rationale. |
| **Indoor Air Quality Hub** | Dynamic window ventilation directives, cooking exhaust protocols, dust control guidelines, and an interactive daily checklist. |
| **Family Air Safety** | Tailored protection protocols for children (elevated respiration rates), seniors (cardiovascular care), and individuals with asthma/allergies. |
| **AirWise Conversational Assistant** | Context-aware AI chatbot answering everyday queries grounded in current local AQI and household parameters with strict medical disclaimers. |
| **Impact Calculator** | Transparent emissions math showing avoided solo car trips, estimated CO2 prevented (kg), and personal exposure reductions based on CPCB/ICCT factors. |
| **Weekly AirWise Score** | Gamified 0–100 score driven strictly by verified user actions and streaks—not fabricated environmental measurements. |
| **Community View** | Anonymous aggregate stats (*1,240 cleaner choices, 680 avoided car trips*) encouraging collective civic responsibility. |

---

## GenAI Integration

Google Gemini is integrated directly into the product workflow through a secure, rate-limited backend service. **Gemini is never exposed in client-side code.**

### Where Gemini is Used:
1. **Personalized Daily Action Plan**: Synthesizes verified PM2.5 and meteorological factors with the user's lifestyle to generate practical routines.
2. **Lifestyle-Based Recommendations**: Adjusts guidance whether the user is a student, office commuter, remote worker, or fitness enthusiast.
3. **Indoor Air-Quality Recommendations**: Analyzes ambient outdoor particulate levels against the home's filtration setup.
4. **Low-Emission Alternative Suggestions**: Compares transportation choices and highlights collective urban smog reduction.
5. **Contextual "Why It Matters" Explanations**: Explains the chemical and atmospheric mechanism behind each recommendation.
6. **Natural-Language Interpretation**: Translates complex meteorological concepts (wind stagnation, boundary layers) into plain language.
7. **Family-Specific Guidance**: Tailors advice for children, elderly relatives, and sensitive respiratory profiles.
8. **Conversational Assistant**: Context-aware chat grounded in the user's location, current AQI, and profile.
9. **Weekly Sustainability Habit Plan**: Generates weekly behavioral nudges for continuous improvement.

### Operational Guardrails & Prompt Engineering:
- **Never Inventions**: Gemini never invents or alters real-time AQI or weather figures provided in context.
- **Medical Disclaimers**: Explicitly avoids medical diagnoses or drug prescriptions; always directs users with respiratory conditions to healthcare professionals.
- **Fact vs Recommendation**: Clearly demarcates measured environmental data from AI-synthesized advice.
- **No Alarmism**: Replaces fear-based messaging with empowering, actionable steps.
- **Resilient Fallback**: If the Gemini API key is not supplied or network issues occur, an intelligent deterministic rule engine generates identical structured responses with zero downtime.

---

## Architecture

```
                          ┌─────────────────────────────────────┐
                          │         Client (React + Vite)       │
                          │   - Responsive UI (Tailwind CSS)    │
                          │   - Recharts Visualizations         │
                          │   - LocalStorage Profile State      │
                          └──────────────────┬──────────────────┘
                                             │ HTTP / JSON
                                             ▼
                          ┌─────────────────────────────────────┐
                          │       Backend (Express + TS)        │
                          │   - Security Headers & Rate Limiter │
                          │   - Bounded TTL Cache (Open-Meteo)  │
                          │   - NAQI / EPA Composite Calculator │
                          │   - Impact Math (CPCB / ICCT)       │
                          └──────────┬──────────────────┬───────┘
                                     │                  │
                ┌────────────────────┴───┐          ┌───┴────────────────────┐
                ▼                        ▼          ▼                        ▼
     ┌─────────────────────┐  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
     │ Open-Meteo Air API  │  │ Open-Meteo Weath │ │ Open-Meteo Geoc  │ │ Google Gemini AI │
     │  (PM2.5, PM10, O3)  │  │ (Temp, Wind, RH) │ │  (Global Search) │ │ (Backend API Key)│
     └─────────────────────┘  └──────────────────┘ └──────────────────┘ └──────────────────┘
```

### API Endpoints Contract

| Method & Path | Purpose | Validation & Guardrails |
| :--- | :--- | :--- |
| `GET /api/health` | Service liveness & Gemini key readiness (`aiReady`) | Public health probe |
| `GET /api/cities?q=` | Global city search & Indian metro presets | Query trimmed & capped at 100 chars; 15-min TTL cache |
| `GET /api/environmental-data` | Live AQI, weather, 24h curve & pollution windows | `lat` (`-90..90`), `lon` (`-180..180`); 5-min TTL cache |
| `POST /api/ai/daily-plan` | 6-phase GenAI daily schedule + `generatedBy` source | Rate-limited (40/min), schema validation & rule fallback |
| `POST /api/ai/chat` | Context-grounded assistant + `contextUsed` provenance | Rate-limited, history sanitized (max 10 turns) |
| `POST /api/ai/comparator` | Side-by-side low-emission choice evaluation | Rate-limited, strict JSON field normalization |
| `POST /api/impact/calculate` | Transparent CO₂, trip & exposure calculations | Clamped streak (`0..365`), capped action array (`<=50`) |
| `GET /api/community/stats` | Transparently labeled demo community benchmarks | Read-only static demo aggregate |

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Recharts
- **Backend**: Node.js, Express, TypeScript, Axios, CORS, Dotenv
- **AI Engine**: Google Gemini API (`@google/genai`), `gemini-4-hydrogen`
- **External Data**: Open-Meteo Air Quality API, Open-Meteo Weather Forecast API, Open-Meteo Geocoding API (free, open, no GCP credits required)
- **Testing**: Vitest, React Testing Library, JSDOM

---

## APIs & Data Sources

1. **Open-Meteo Air Quality API**: `https://air-quality-api.open-meteo.com/v1/air-quality`
   - Real-time and 24-hr hourly PM2.5, PM10, Ozone, NO2, SO2, CO.
2. **Open-Meteo Weather API**: `https://api.open-meteo.com/v1/forecast`
   - Temperature, Relative Humidity, Wind Speed at 10m, Weather Codes.
3. **Open-Meteo Geocoding API**: `https://geocoding-api.open-meteo.com/v1/search`
   - Global city search with built-in presets for major Indian metros (Delhi, Hyderabad, Bengaluru, Mumbai, Chennai, Kolkata, Pune).
4. **Google Gemini API**: `generativelanguage.googleapis.com`
   - Secure server-side generative inference.

---

## Environment Variables

Copy `.env.example` to `.env` in the root or server directory:

```env
# Server Port
PORT=3000
NODE_ENV=development

# Google Gemini API Key (Backend Only — NEVER exposed to browser)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional API endpoints
AIR_QUALITY_API_URL=https://air-quality-api.open-meteo.com/v1/air-quality
WEATHER_API_URL=https://api.open-meteo.com/v1/forecast
GEOCODING_API_URL=https://geocoding-api.open-meteo.com/v1/search
```

> **Note**: If `GEMINI_API_KEY` is omitted, AirWise AI runs in offline **High-Fidelity Demo Mode** using its built-in rule engine, guaranteeing the app never crashes.

---

## Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation
Clone the repository and install all dependencies:

```bash
# Install server and client dependencies
npm run install:all
```

---

```bash
npm run dev
```
This builds the React client (`client/dist`) and starts the Express backend on `http://localhost:3000`, serving both the frontend and `/api/*` endpoints.
Verify health: `http://localhost:3000/api/health`

For separate frontend/backend dev servers during local development:
```bash
npm run dev:server
npm run dev:client
```

---

## Testing

Run unit and integration tests across both client and server:

```bash
# Run all tests
npm test

# Run server tests only
npm run test:server

# Run client tests only
npm run test:client
```

All unit and integration tests validate:
- AQI breakpoint mathematics, boundary clamping (`NaN`, negative, `>500`), timezone rollover, and decimal classification
- Transparent transport emissions, all 7 action definitions, score ceiling, and CO₂ savings
- Bounded `TtlCache` eviction/expiry and full Express HTTP API routes (`400`/`429` enforcement & headers)
- Input validation, chat history sanitization, malformed payload rejection, and mocked Gemini SDK + fallback resilience
- Frontend render integrity, XSS-safe markdown rendering, ARIA states, and error recovery

---

## Deployment

### Full-Stack (Recommended Single-Origin: Render / Railway / Cloud Run)
1. Build client and server: `npm run build`
2. Start server: `npm start` (serves both `client/dist` and `/api/*` on the same origin)
3. Configure environment variable: `GEMINI_API_KEY=...`

### Split Deployment: Frontend (Netlify) + Backend (Render / Railway)
Because `client/dist` is static-only, `/api/*` requests on Netlify require connecting a live backend:
1. Deploy `server/` on Render/Railway (`Build: npm install && npm run build`, `Start: node dist/index.js`, `Env: GEMINI_API_KEY=...`, `Health: /api/health`).
2. Deploy via root `netlify.toml` (`publish = "client/dist"`).
3. Either set `VITE_API_URL=https://<your-backend>.onrender.com/api` in Netlify Environment Variables, **or** uncomment the `/api/*` proxy redirect in `netlify.toml`.

---

## Security & Best Practices

- **Zero Client-Side Secrets**: Gemini API keys reside exclusively in backend environment variables.
- **HTTP Hardening**: Disables `X-Powered-By`, sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`, and hides internal error stack details in `500` responses.
- **Input Validation**: Coordinate boundaries (`-90..90`, `-180..180`), chat history arrays, and query strings are validated and sanitized.
- **In-Memory Rate Limiting & Bounded Caching**: AI endpoints are rate-limited to 40 requests/min per IP, and Open-Meteo responses use bounded `TtlCache` (`maxEntries = 200`) to prevent unbounded memory growth.
- **Payload Limits**: Express JSON parser enforces a strict 500 KB limit.
- **Zero Sensitive Data Stored**: User profile preferences are kept exclusively in client-side `localStorage`.

---

## Accessibility (WCAG Conscious)

- **Semantic HTML5**: Native `<header>`, `<main>`, `<nav>`, `<section>`, and `<button>` elements.
- **Multi-Modal Indicators**: Statuses never rely solely on color; every category contains explicit textual labels, numeric values, and descriptive icons.
- **Keyboard Navigation**: Full tab ordering with visible focus rings (`focus-visible`).
- **Screen Reader Support**: Data tables and descriptive ARIA labels accompany Recharts visualizations.
- **Responsive & Contrast-Checked**: Tailored for mobile screens with dark mode and high-contrast color palettes.

---

## Demonstration Script (Video Walkthrough)

1. **Landing Page**: View hero banner ("Know Your Air. Protect Your Day.") and click **"Check My Air"**.
2. **Setup Location & Profile**: Select **Hyderabad**, choose **Student**, and select **Public transport / Two-wheeler**.
3. **Live Dashboard**: View real-time NAQI AQI, PM2.5, PM10, temperature, and atmospheric dispersion conditions.
4. **Pollution Timeline**: Identify the **Better Outdoor Window** (2:00 PM – 5:00 PM) vs morning inversion.
5. **AI Plan**: Click **"Generate My AI Action Plan"** to produce structured, hour-by-hour routines.
6. **Cleaner Option Comparator**: Compare **Driving Alone vs Metro Transit** and review the GenAI rationale.
7. **Indoor Hub**: Review ventilation rules and check off items on the **Quick Indoor Checklist**.
8. **AirWise Assistant**: Ask *"Can I go for a run this evening?"* and observe context-grounded AI advice.
9. **Impact Calculator & Score**: Select cleaner actions to see your estimated CO2 savings update live alongside your weekly AirWise Score.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
