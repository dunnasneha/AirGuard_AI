import { GoogleGenAI } from '@google/genai';
import {
  AIDailyPlan,
  ChatMessage,
  ComparatorResult,
  EnvironmentalContext,
  UserProfile,
} from '../types/index.js';

let cachedAI: GoogleGenAI | null = null;
let cachedKey: string | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return null;
  if (cachedAI && cachedKey === apiKey) return cachedAI;

  try {
    cachedAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    cachedKey = apiKey;
    return cachedAI;
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

/**
 * System Instructions for Gemini
 */
const SYSTEM_PROMPT = `You are AirWise Assistant, an expert urban environmental advisor specializing in winter smog resilience, low-emission lifestyles, and indoor air safety.
Your mission is to translate real environmental data and user lifestyle context into conservative, actionable, empowering guidance.

STRICT OPERATIONAL RULES:
1. Never invent or alter real-time AQI or weather figures provided in context.
2. Never provide medical diagnoses or prescribe medications. Always include a brief note advising those with respiratory or cardiac conditions to consult their physician.
3. Clearly distinguish environmental facts (measured PM2.5, AQI, wind, temperature) from AI-generated recommendations.
4. Provide structured, actionable steps: WHAT to do, WHY it helps, POLLUTION IMPACT, and WHAT TO DO NEXT.
5. Emphasize low-emission alternatives (walking/cycling in safe windows, public transit, carpooling, combining errands).
6. Avoid alarmist or fear-based language. Foster practical resilience.
7. Tailor recommendations to user lifestyle, commute mode, and family vulnerabilities (children, elderly, sensitive members).
8. Respect outdoor activity windows: recommend outdoor tasks during the lowest particulate window and advise staying indoors during thermal inversion spikes.
9. Return strictly valid JSON when structured output is requested.
`;

/**
 * Generates Personalized Daily Pollution Action Plan using Gemini
 */
export async function generateDailyActionPlan(
  profile: UserProfile,
  env: EnvironmentalContext
): Promise<AIDailyPlan> {
  const locName = env?.location?.name || 'your city';
  const locCountry = env?.location?.country || '';
  const aqiVal = env?.airQuality?.aqi ?? 100;
  const aqiCat = env?.airQuality?.category || 'Moderate';
  const domPollutant = env?.airQuality?.dominantPollutant || 'PM2.5';
  const pm25Val = env?.airQuality?.pm2_5 ?? 45;
  const pm10Val = env?.airQuality?.pm10 ?? 75;
  const ozoneVal = env?.airQuality?.ozone ?? 30;
  const tempVal = env?.weather?.temperature ?? 24;
  const humidityVal = env?.weather?.humidity ?? 55;
  const windVal = env?.weather?.windSpeed ?? 8;
  const condDesc = env?.weather?.conditionDescription || 'Clear';
  const bestLabel = env?.windows?.bestOutdoorWindow?.label || '2:00 PM – 5:00 PM';
  const bestDesc = env?.windows?.bestOutdoorWindow?.description || 'Lower afternoon particulate window';
  const peakLabel = env?.windows?.peakPollutionWindow?.label || '6:00 AM – 9:00 AM';
  const peakDesc = env?.windows?.peakPollutionWindow?.description || 'Morning thermal inversion peak';

  const adultsCount = profile?.householdMembers?.adults ?? 1;
  const childrenCount = profile?.householdMembers?.children ?? 0;
  const elderlyCount = profile?.householdMembers?.elderly ?? 0;
  const sensitiveCount = profile?.householdMembers?.sensitive ?? 0;
  const indoorSetup = Array.isArray(profile?.indoorEnvironment) && profile.indoorEnvironment.length > 0
    ? profile.indoorEnvironment.join(', ')
    : 'Standard ventilation';

  const prompt = `Generate a personalized daily pollution action plan based on the following verified environmental data and user profile.

ENVIRONMENTAL CONTEXT (DO NOT ALTER THESE VALUES):
- Location: ${locName}${locCountry ? `, ${locCountry}` : ''}
- Current AQI: ${aqiVal} (${aqiCat})
- Dominant Pollutant: ${domPollutant}
- PM2.5: ${pm25Val} µg/m³
- PM10: ${pm10Val} µg/m³
- Ozone: ${ozoneVal} µg/m³
- Temperature: ${tempVal}°C, Humidity: ${humidityVal}%, Wind: ${windVal} km/h
- Condition: ${condDesc}
- Better Outdoor Window: ${bestLabel} (${bestDesc})
- Higher Pollution Window: ${peakLabel} (${peakDesc})

USER PROFILE:
- Lifestyle: ${profile?.lifestyle || 'Student'}
- Household Members: Adults: ${adultsCount}, Children: ${childrenCount}, Elderly: ${elderlyCount}, Sensitive/Asthma: ${sensitiveCount}
- Daily Commute: ${profile?.commuteMethod || 'Public transport'}
- Outdoor Activity: ${profile?.outdoorActivity || 'Walking'}
- Indoor Setup: ${indoorSetup}

Respond with ONLY a raw JSON object (no markdown quotes, no triple backticks) matching this exact schema:
{
  "summary": "1-2 sentence high-level overview of today's air and primary recommendation",
  "air_quality_explanation": "Clear, non-technical explanation of why today's air is at this level and what the meteorological conditions mean for smog dispersion",
  "actions": [
    {
      "time": "Morning",
      "action": "Specific low-emission / exposure-reduction action",
      "reason": "Why this matters given current particulate levels",
      "impact": "Direct environmental or personal benefit",
      "difficulty": "Easy",
      "estimatedBenefit": "Practical outcome (e.g. avoided peak smog inhalation, reduced localized vehicle idle)",
      "whatNext": "Immediate actionable next step"
    },
    {
      "time": "Commute",
      "action": "...",
      "reason": "...",
      "impact": "...",
      "difficulty": "Easy",
      "estimatedBenefit": "...",
      "whatNext": "..."
    },
    {
      "time": "Work/Study",
      "action": "...",
      "reason": "...",
      "impact": "...",
      "difficulty": "Easy",
      "estimatedBenefit": "...",
      "whatNext": "..."
    },
    {
      "time": "Outdoor activity",
      "action": "...",
      "reason": "...",
      "impact": "...",
      "difficulty": "Moderate",
      "estimatedBenefit": "...",
      "whatNext": "..."
    },
    {
      "time": "Evening",
      "action": "...",
      "reason": "...",
      "impact": "...",
      "difficulty": "Easy",
      "estimatedBenefit": "...",
      "whatNext": "..."
    },
    {
      "time": "Night",
      "action": "...",
      "reason": "...",
      "impact": "...",
      "difficulty": "Easy",
      "estimatedBenefit": "...",
      "whatNext": "..."
    }
  ],
  "indoor_guidance": [
    "Concrete tip 1 for ventilation/filtration based on current outdoor PM2.5",
    "Concrete tip 2 for cooking and dust control"
  ],
  "commute_guidance": [
    "Concrete tip 1 for safer commute timing and mode choice",
    "Concrete tip 2 for cabin air / mask usage during transport"
  ],
  "family_guidance": [
    "Targeted advice for children/elderly/sensitive members in this household"
  ],
  "sustainability_tip": "One low-emission habit the household can adopt today",
  "safety_note": "Medical disclaimer reminding users to follow health authority protocols"
}
`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text ?? '';
      const cleaned = cleanJsonResponse(text);
      const parsed = JSON.parse(cleaned);
      const fallback = generateRuleBasedDailyPlan(profile, env);

      return {
        summary: typeof parsed?.summary === 'string' ? parsed.summary : fallback.summary,
        air_quality_explanation: typeof parsed?.air_quality_explanation === 'string' ? parsed.air_quality_explanation : fallback.air_quality_explanation,
        actions: Array.isArray(parsed?.actions) && parsed.actions.length > 0 ? parsed.actions : fallback.actions,
        indoor_guidance: Array.isArray(parsed?.indoor_guidance) ? parsed.indoor_guidance : fallback.indoor_guidance,
        commute_guidance: Array.isArray(parsed?.commute_guidance) ? parsed.commute_guidance : fallback.commute_guidance,
        family_guidance: Array.isArray(parsed?.family_guidance) ? parsed.family_guidance : fallback.family_guidance,
        sustainability_tip: typeof parsed?.sustainability_tip === 'string' ? parsed.sustainability_tip : fallback.sustainability_tip,
        safety_note: typeof parsed?.safety_note === 'string' ? parsed.safety_note : fallback.safety_note,
        generatedBy: 'gemini',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('Gemini API daily plan generation failed, falling back to rule engine:', error instanceof Error ? error.message : error);
    }
  }

  // Deterministic rule engine fallback
  return generateRuleBasedDailyPlan(profile, env);
}

/**
 * AirWise Conversational Assistant
 */
export async function getAirWiseChatResponse(
  message: string,
  history: ChatMessage[],
  profile: UserProfile,
  env: EnvironmentalContext
): Promise<string> {
  const isMedicalQuery = /\b(cure|disease|medicine|prescription|inhaler dosage|doctor|symptom|chest pain|attack)\b/i.test(message);

  const locName = env?.location?.name || 'your city';
  const locCountry = env?.location?.country || '';
  const aqiVal = env?.airQuality?.aqi ?? 100;
  const aqiCat = env?.airQuality?.category || 'Moderate';
  const pm25Val = env?.airQuality?.pm2_5 ?? 45;
  const pm10Val = env?.airQuality?.pm10 ?? 75;
  const tempVal = env?.weather?.temperature ?? 24;
  const humidityVal = env?.weather?.humidity ?? 55;
  const windVal = env?.weather?.windSpeed ?? 8;
  const condDesc = env?.weather?.conditionDescription || 'Clear';
  const bestLabel = env?.windows?.bestOutdoorWindow?.label || '2:00 PM – 5:00 PM';
  const peakLabel = env?.windows?.peakPollutionWindow?.label || '6:00 AM – 9:00 AM';

  const contextPrompt = `You are AirWise Assistant.
CURRENT USER CONTEXT:
- Location: ${locName}${locCountry ? `, ${locCountry}` : ''}
- Air Quality: AQI ${aqiVal} (${aqiCat}), PM2.5: ${pm25Val} µg/m³, PM10: ${pm10Val} µg/m³
- Weather: ${tempVal}°C, ${humidityVal}% humidity, Wind: ${windVal} km/h, ${condDesc}
- Optimal outdoor window: ${bestLabel}
- Peak pollution window: ${peakLabel}
- User Profile: ${profile?.lifestyle || 'Student'}, commute via ${profile?.commuteMethod || 'Public transport'}, household: ${profile?.householdMembers?.children ?? 0} children, ${profile?.householdMembers?.elderly ?? 0} elderly, ${profile?.householdMembers?.sensitive ?? 0} sensitive members.

USER MESSAGE: "${message}"

${isMedicalQuery ? 'IMPORTANT: The user message mentions medical/health symptoms. Provide supportive general environmental reduction measures only, emphasize that this is not medical advice, and firmly recommend consulting a qualified healthcare professional.' : ''}

Provide a concise, direct, compassionate answer in 2-4 short paragraphs. Address WHAT, WHY, and WHAT TO DO NEXT. Distinguish live measurements from recommendations.`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const safeHistory = Array.isArray(history) ? history : [];
      const recentHistory = safeHistory
        .slice(-6)
        .map((m) => `${m?.sender === 'user' ? 'User' : 'Assistant'}: ${String(m?.content || '').slice(0, 500)}`)
        .join('\n');
      const fullPrompt = recentHistory
        ? `${contextPrompt}\n\nRECENT CONVERSATION:\n${recentHistory}`
        : contextPrompt;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: fullPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (error) {
      console.warn('Gemini chat failed, using local rule-based assistant:', error instanceof Error ? error.message : error);
    }
  }

  return generateRuleBasedChatResponse(message, profile, env);
}

/**
 * Cleaner Option Comparator with GenAI explanation
 */
export async function getCleanerOptionComparison(
  optionA: string,
  optionB: string,
  profile: UserProfile,
  env: EnvironmentalContext
): Promise<ComparatorResult> {
  const prompt = `Compare these two urban choices from an air quality, emissions, practicality, and personal exposure perspective:
Option A: "${optionA}"
Option B: "${optionB}"

Context: City: ${env?.location?.name || 'your city'}, AQI: ${env?.airQuality?.aqi ?? 100} (${env?.airQuality?.category || 'Moderate'}), User: ${profile?.lifestyle || 'Student'}.

Return ONLY a JSON object:
{
  "optionA": {
    "mode": "${optionA}",
    "title": "Clean title for Option A",
    "convenience": "High / Medium / Low with 1 sentence",
    "relativeEmission": "Very Low / Medium / High",
    "emissionScore": 80,
    "costIndication": "₹ / $$ indication",
    "environmentalBenefit": "Specific environmental impact",
    "practicality": "Practical considerations"
  },
  "optionB": {
    "mode": "${optionB}",
    "title": "Clean title for Option B",
    "convenience": "High / Medium / Low with 1 sentence",
    "relativeEmission": "Very Low / Medium / High",
    "emissionScore": 25,
    "costIndication": "₹ / $$ indication",
    "environmentalBenefit": "Specific environmental impact",
    "practicality": "Practical considerations"
  },
  "recommendation": "Which option is recommended today and why",
  "whyItMatters": "Concise GenAI explanation of the collective impact on urban smog",
  "assumptions": "Standard 10-15km urban trip based on ICCT transport emission benchmarks"
}`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const text = cleanJsonResponse(response.text ?? '');
      return JSON.parse(text);
    } catch (err) {
      console.warn('Gemini comparator failed, using rule fallback:', err instanceof Error ? err.message : err);
    }
  }

  return generateRuleBasedComparison(optionA, optionB, profile, env);
}

// Helper to strip markdown code blocks
function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Intelligent Local Rule Engine Fallback
 * Guarantees zero downtime, instant testing, and adherence to all requirements
 */
function generateRuleBasedDailyPlan(profile: UserProfile, env: EnvironmentalContext): AIDailyPlan {
  const locName = env?.location?.name || 'your city';
  const aqiCat = env?.airQuality?.category || 'Moderate';
  const aqiVal = env?.airQuality?.aqi ?? 100;
  const pm25Val = env?.airQuality?.pm2_5 ?? 45;
  const domPollutant = env?.airQuality?.dominantPollutant || 'PM2.5';
  const windVal = env?.weather?.windSpeed ?? 8;
  const isSevere = aqiCat === 'Severe' || aqiCat === 'Very Poor';
  const bestWin = env?.windows?.bestOutdoorWindow?.label || '2:00 PM – 5:00 PM';
  const bestDesc = env?.windows?.bestOutdoorWindow?.description || 'Lowest daytime particulate concentration';
  const peakWin = env?.windows?.peakPollutionWindow?.label || '6:00 AM – 9:00 AM';
  const commuteMethod = profile?.commuteMethod || 'Public transport';
  const outdoorActivity = profile?.outdoorActivity || 'Walking';
  const childrenCount = profile?.householdMembers?.children ?? 0;
  const elderlyCount = profile?.householdMembers?.elderly ?? 0;
  const sensitiveCount = profile?.householdMembers?.sensitive ?? 0;

  return {
    summary: `Air quality in ${locName} is currently ${aqiCat} (AQI ${aqiVal}, PM2.5 ${pm25Val} µg/m³). Prioritize indoor filtration during peak morning inversion and shift travel or exercise to ${bestWin}.`,
    air_quality_explanation: `Elevated particulate concentrations (${domPollutant}) are driven by stagnant low-level winds (${windVal} km/h) and urban thermal inversion. Ground-level emissions remain trapped close to street level, especially between ${peakWin}.`,
    actions: [
      {
        time: 'Morning',
        action: isSevere ? 'Keep windows sealed and run indoor air purifier on medium/high' : 'Limit early morning window ventilation until boundary layer warms up',
        reason: `Morning hours (${peakWin}) align with maximum ground inversion and peak tailpipe exhaust.`,
        impact: 'Prevents 60–80% of outdoor fine particulate infiltration into sleeping areas.',
        difficulty: 'Easy',
        estimatedBenefit: 'Substantially cleaner bedroom air for family members awakening.',
        whatNext: 'Check weather sealing around bedroom windows.',
      },
      {
        time: 'Commute',
        action: commuteMethod === 'Car' ? 'Opt for metro/bus transit or organize a 3+ carpool' : (commuteMethod === 'Two-wheeler' ? 'Wear a certified N95 particulate respirator during transit' : 'Maintain safe buffer from congested arterial bottlenecks'),
        reason: 'Single-occupancy vehicles generate ~142g CO2/km and concentrate roadside nitrogen dioxide.',
        impact: 'Reduces per-passenger emissions by up to 75% compared to solo driving.',
        difficulty: 'Moderate',
        estimatedBenefit: 'Reduces direct inhalation of fresh diesel soot and fine carbon particulates.',
        whatNext: 'Check public transit schedule or set vehicle cabin air to recirculation.',
      },
      {
        time: 'Work/Study',
        action: 'Request flexible remote hours if feasible, or ensure indoor workspace ventilation filters are operating',
        reason: 'Midday urban traffic and ambient smog accumulate in poorly filtered commercial buildings.',
        impact: 'Eliminates peak-hour rush trips and lowers daily exposure hours.',
        difficulty: 'Easy',
        estimatedBenefit: 'Saves 1.5–2 kg of estimated vehicle CO2 per avoided commuting day.',
        whatNext: 'Place personal HEPA unit near desk or close perimeter drafts.',
      },
      {
        time: 'Outdoor activity',
        action: outdoorActivity !== 'None' ? `Shift physical workouts to the safer window: ${bestWin}` : 'Schedule essential outdoor chores between 2:00 PM and 5:00 PM',
        reason: `Afternoon solar heating deepens the atmospheric mixing layer, yielding lowest daily PM2.5 (${bestDesc}).`,
        impact: 'Deep lung ventilation during intense cardio takes in 4x to 6x less PM2.5 when timed properly.',
        difficulty: 'Moderate',
        estimatedBenefit: 'Enables safe cardiovascular exercise without triggering bronchial irritation.',
        whatNext: 'Check live AQI widget 15 minutes before stepping outdoors.',
      },
      {
        time: 'Evening',
        action: 'Turn on kitchen exhaust fan before cooking and avoid unventilated oil frying or incense burning',
        reason: 'Cooking oil fumes and domestic combustion create indoor PM2.5 spikes often exceeding outdoor smog.',
        impact: 'Maintains healthy indoor particulate baseline (< 25 µg/m³).',
        difficulty: 'Easy',
        estimatedBenefit: 'Zero accumulation of VOCs and carbon soot in indoor living rooms.',
        whatNext: 'Keep kitchen door closed while cooking is underway.',
      },
      {
        time: 'Night',
        action: 'Run bedroom air purifier on quiet night mode and seal doorway gaps with a draft stopper',
        reason: 'Nighttime temperatures drop, causing ground pollution to re-concentrate till sunrise.',
        impact: 'Protects 7-8 hours of continuous resting respiratory cycle.',
        difficulty: 'Easy',
        estimatedBenefit: 'Restful, uninterrupted sleep free from throat irritation or nocturnal coughing.',
        whatNext: 'Verify purifier filter indicator light is green.',
      },
    ],
    indoor_guidance: [
      `Keep windows closed during early morning (${peakWin}) and open briefly only between ${bestWin} if air freshening is needed.`,
      'Use high-CFM kitchen ventilation during cooking; do not burn incense, dhoop, or unvented heating coils.',
      'Damp-wipe high-dust surfaces instead of dry sweeping to prevent particulate re-suspension.',
    ],
    commute_guidance: [
      'Switch your car AC to internal air recirculation mode to block up to 70% of roadside tailpipe intake.',
      'Two-wheeler riders and pedestrians should wear a well-fitted N95/FFP2 mask during peak congestion.',
    ],
    family_guidance: [
      childrenCount > 0 ? 'Children breathe faster per kg of body weight; replace outdoor playground activities with indoor games during morning hours.' : 'Keep living areas well filtered.',
      elderlyCount > 0 || sensitiveCount > 0 ? 'Seniors and individuals with asthma/allergies should strictly limit vigorous outdoor walking to afternoons only.' : 'Stay adequately hydrated to support natural mucosal barrier defense.',
    ],
    sustainability_tip: 'Consolidate multiple short vehicle errands into a single trip, or switch one weekly commute to public transit to save an estimated 1.5 kg CO2.',
    safety_note: 'This assistant provides general environmental guidance and is not medical advice. Individuals with pre-existing cardiopulmonary conditions should strictly adhere to physician advice and local health alerts.',
    generatedBy: 'rules-fallback',
    generatedAt: new Date().toISOString(),
  };
}

function generateRuleBasedChatResponse(
  message: string,
  profile: UserProfile,
  env: EnvironmentalContext
): string {
  const lower = message.toLowerCase();
  const locName = env?.location?.name || 'your city';
  const aqiCat = env?.airQuality?.category || 'Moderate';
  const aqiVal = env?.airQuality?.aqi ?? 100;
  const pm25Val = env?.airQuality?.pm2_5 ?? 45;
  const tempVal = env?.weather?.temperature ?? 24;
  const bestWin = env?.windows?.bestOutdoorWindow?.label || '2:00 PM – 5:00 PM';
  const peakWin = env?.windows?.peakPollutionWindow?.label || '6:00 AM – 9:00 AM';

  if (lower.includes('run') || lower.includes('jog') || lower.includes('exercise') || lower.includes('walk')) {
    return `### Outdoor Activity Guidance for ${locName}

Current air quality is **${aqiCat}** with a PM2.5 level of **${pm25Val} µg/m³** (AQI ${aqiVal}).

**When is it safest?**
Your best outdoor window today is **${bestWin}**. During this time, solar heating helps disperse stagnant surface particles, making it substantially safer for moderate exercise than morning hours.

**What you should do:**
- Avoid running during peak morning inversion (${peakWin}) when vehicle exhaust is trapped near breathing height.
- If air quality remains in the ${aqiCat} category, consider an indoor workout, yoga, or treadmill session instead of strenuous outdoor cardio.
- Wear an N95 mask if you must be outdoors during congested rush hours.

*Notice: This is general environmental guidance, not medical advice. Those with asthma or heart conditions should consult their physician.*`;
  }

  if (lower.includes('window') || lower.includes('ventilate') || lower.includes('indoor') || lower.includes('air purifier')) {
    return `### Indoor Air & Ventilation Advice

In **${locName}**, current outdoor PM2.5 is **${pm25Val} µg/m³** (${aqiCat}).

**Window Guidance:**
- **Keep windows closed** during early morning (${peakWin}) and late night when thermal inversion traps heavy pollutants.
- If you need fresh air exchange, crack windows open briefly during **${bestWin}** when outdoor particulate levels are lowest.

**Indoor Air Quality Hacks:**
1. Run your HEPA air purifier continuously on auto or medium mode in living and sleeping quarters.
2. Always turn on kitchen exhaust fans when cooking—frying and oil heating generate massive spikes in indoor PM2.5.
3. Use a damp microfiber cloth for dusting instead of dry brooms to avoid kicking settled particles back into the air.`;
  }

  if (lower.includes('car') || lower.includes('commute') || lower.includes('college') || lower.includes('office') || lower.includes('transit')) {
    return `### Low-Emission Commute Alternatives

For your routine in **${locName}**:

**The Cleaner Option:**
Taking the **metro or public bus** saves approximately **1.2 to 1.5 kg of CO2** per 12 km trip compared to driving alone in a petrol car. It also removes one vehicle from gridlocked street canyons where roadside particulate spikes highest.

**Practical Tips:**
- If you drive, switch your ventilation system to **Cabin Air Recirculation** to reduce tailpipe soot entering your vehicle.
- If taking a two-wheeler or walking near main roads, equip a well-sealed **N95 respirator**.
- Consider combining errands or coordinating a carpool with nearby colleagues or classmates.`;
  }

  return `### AirWise Guidance for ${locName}

Current conditions report an AQI of **${aqiVal} (${aqiCat})** with PM2.5 at **${pm25Val} µg/m³** and temperature at **${tempVal}°C**.

**Key Recommendations for Today:**
1. **Best Outdoor Window:** Plan non-essential outdoor movements around **${bestWin}**.
2. **Avoid Morning Inversion:** Peak pollution is highest around **${peakWin}**.
3. **Clean Choices:** Opt for public transit or carpooling to reduce street-level emissions, and keep indoor living areas protected with HEPA filtration.

Feel free to ask specific questions about your commute, family safety, or running timing!`;
}

function generateRuleBasedComparison(
  optionA: string,
  optionB: string,
  profile: UserProfile,
  env: EnvironmentalContext
): ComparatorResult {
  const isTransit = optionB.toLowerCase().includes('public') || optionB.toLowerCase().includes('metro') || optionB.toLowerCase().includes('walk') || optionB.toLowerCase().includes('cycl');
  const locName = env?.location?.name || 'your city';
  const aqiCat = env?.airQuality?.category || 'Moderate';

  return {
    optionA: {
      mode: optionA,
      title: optionA,
      convenience: 'High personal door-to-door flexibility, but subjected to traffic delays and parking search.',
      relativeEmission: 'High (Approx. 142g CO2/km + localized nitrogen dioxide and brake dust)',
      emissionScore: 85,
      costIndication: 'High (Fuel, tolls, parking, vehicle wear & tear)',
      environmentalBenefit: 'Minimal. Increases congestion and localized urban street canyon pollution.',
      practicality: 'High independence, but vulnerable to smog exposure during vehicle entry and traffic jams.'
    },
    optionB: {
      mode: optionB,
      title: optionB,
      convenience: 'Moderate to High with predictable scheduled transit routes.',
      relativeEmission: isTransit ? 'Very Low (Approx. 18-32g CO2/passenger-km)' : 'Low',
      emissionScore: 22,
      costIndication: 'Low (Fraction of solo vehicle expense)',
      environmentalBenefit: 'Significant. Cuts per-capita emissions by 75-85% and relieves urban road gridlock.',
      practicality: 'Highly practical in urban centers with metro or dedicated bus rapid transit corridors.'
    },
    recommendation: `Choose ${optionB} today. In ${locName}'s current ${aqiCat} conditions, reducing individual tailpipe emissions directly supports community-wide respiratory relief.`,
    whyItMatters: 'Every car trip replaced by electrified transit or active mobility avoids approximately 1.5 kg of CO2 and prevents immediate ground-level particulate accumulation in residential zones.',
    assumptions: 'Calculations modeled for a standard 12 km urban round-trip using CPCB & ICCT passenger transport emission benchmarks.'
  };
}
