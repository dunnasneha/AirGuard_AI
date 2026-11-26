import { GoogleGenAI } from '@google/genai';
import {
  AIDailyPlan,
  ChatMessage,
  ComparatorOption,
  ComparatorResult,
  EnvironmentalContext,
  GeneratedBySource,
  PlanAction,
  UserProfile,
} from '../types/index.js';
import {
  generateRuleBasedChatResponse,
  generateRuleBasedComparison,
  generateRuleBasedDailyPlan,
} from './fallbackService.js';

const GEMINI_MODEL = 'gemini-4-hydrogen';

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
    console.error('Failed to initialize GoogleGenAI client:', err instanceof Error ? err.message : err);
    return null;
  }
}

export function resetGeminiClientCache(): void {
  cachedAI = null;
  cachedKey = null;
}

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

function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

function toStringArray(val: unknown, fallback: string[]): string[] {
  if (!Array.isArray(val)) return fallback;
  const cleaned = val.filter((item): item is string => isNonEmptyString(item)).map((s) => s.trim());
  return cleaned.length > 0 ? cleaned : fallback;
}

function validatePlanActions(rawActions: unknown, fallbackActions: PlanAction[]): PlanAction[] {
  if (!Array.isArray(rawActions) || rawActions.length === 0) {
    return fallbackActions;
  }

  const valid = rawActions
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item, idx) => {
      const fb = fallbackActions[idx] || fallbackActions[0];
      return {
        time: (isNonEmptyString(item.time) ? item.time : fb.time) as PlanAction['time'],
        action: isNonEmptyString(item.action) ? item.action : fb.action,
        reason: isNonEmptyString(item.reason) ? item.reason : fb.reason,
        impact: isNonEmptyString(item.impact) ? item.impact : fb.impact,
        difficulty: (item.difficulty === 'Easy' || item.difficulty === 'Moderate' || item.difficulty === 'Challenging'
          ? item.difficulty
          : fb.difficulty) as PlanAction['difficulty'],
        estimatedBenefit: isNonEmptyString(item.estimatedBenefit) ? item.estimatedBenefit : fb.estimatedBenefit,
        whatNext: isNonEmptyString(item.whatNext) ? item.whatNext : fb.whatNext,
      };
    });

  return valid.length > 0 ? valid : fallbackActions;
}

function validateComparatorOption(raw: unknown, fallback: ComparatorOption): ComparatorOption {
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Record<string, unknown>;
  const score = typeof obj.emissionScore === 'number' && Number.isFinite(obj.emissionScore)
    ? Math.max(0, Math.min(100, Math.round(obj.emissionScore)))
    : fallback.emissionScore;

  return {
    mode: isNonEmptyString(obj.mode) ? obj.mode : fallback.mode,
    title: isNonEmptyString(obj.title) ? obj.title : fallback.title,
    convenience: isNonEmptyString(obj.convenience) ? obj.convenience : fallback.convenience,
    relativeEmission: isNonEmptyString(obj.relativeEmission) ? obj.relativeEmission : fallback.relativeEmission,
    emissionScore: score,
    costIndication: isNonEmptyString(obj.costIndication) ? obj.costIndication : fallback.costIndication,
    environmentalBenefit: isNonEmptyString(obj.environmentalBenefit) ? obj.environmentalBenefit : fallback.environmentalBenefit,
    practicality: isNonEmptyString(obj.practicality) ? obj.practicality : fallback.practicality,
  };
}

/**
 * Generates Personalized Daily Pollution Action Plan using Gemini with rule-engine fallback.
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
  const indoorSetup =
    Array.isArray(profile?.indoorEnvironment) && profile.indoorEnvironment.length > 0
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
  "summary": "1-2 sentence high-level overview referencing today's AQI, weather, and primary recommendation",
  "air_quality_explanation": "Clear explanation of why today's air is at this level and what weather/wind conditions mean for smog dispersion",
  "actions": [
    {
      "time": "Morning",
      "action": "Specific low-emission / exposure-reduction action",
      "reason": "Why this matters given current particulate levels",
      "impact": "Direct environmental or personal benefit",
      "difficulty": "Easy",
      "estimatedBenefit": "Practical outcome",
      "whatNext": "Immediate actionable next step"
    }
  ],
  "indoor_guidance": ["Concrete ventilation/filtration tip 1", "Concrete cooking/dust tip 2"],
  "commute_guidance": ["Safer commute timing/mode tip 1", "Cabin air/mask usage tip 2"],
  "family_guidance": ["Targeted advice for children/elderly/sensitive members in this household"],
  "sustainability_tip": "One low-emission habit the household can adopt today",
  "safety_note": "Medical disclaimer reminding users to follow health authority protocols"
}
Include all 6 periods in "actions": Morning, Commute, Work/Study, Outdoor activity, Evening, Night.`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const cleaned = cleanJsonResponse(response.text ?? '');
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      const fallback = generateRuleBasedDailyPlan(profile, env);

      return {
        summary: isNonEmptyString(parsed?.summary) ? parsed.summary : fallback.summary,
        air_quality_explanation: isNonEmptyString(parsed?.air_quality_explanation)
          ? parsed.air_quality_explanation
          : fallback.air_quality_explanation,
        actions: validatePlanActions(parsed?.actions, fallback.actions),
        indoor_guidance: toStringArray(parsed?.indoor_guidance, fallback.indoor_guidance),
        commute_guidance: toStringArray(parsed?.commute_guidance, fallback.commute_guidance),
        family_guidance: toStringArray(parsed?.family_guidance, fallback.family_guidance),
        sustainability_tip: isNonEmptyString(parsed?.sustainability_tip)
          ? parsed.sustainability_tip
          : fallback.sustainability_tip,
        safety_note: isNonEmptyString(parsed?.safety_note) ? parsed.safety_note : fallback.safety_note,
        generatedBy: 'gemini',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.warn(
        'Gemini API daily plan generation failed, falling back to rule engine:',
        error instanceof Error ? error.message : error
      );
    }
  }

  return generateRuleBasedDailyPlan(profile, env);
}

/**
 * AirWise Conversational Assistant returning reply text and model provenance.
 */
export async function getAirWiseChatWithSource(
  message: string,
  history: ChatMessage[],
  profile: UserProfile,
  env: EnvironmentalContext
): Promise<{ reply: string; generatedBy: GeneratedBySource }> {
  const isMedicalQuery = /\b(cure|disease|medicine|prescription|inhaler dosage|doctor|symptom|chest pain|attack)\b/i.test(
    message
  );

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

${
  isMedicalQuery
    ? 'IMPORTANT: The user message mentions medical/health symptoms. Provide supportive general environmental reduction measures only, emphasize that this is not medical advice, and firmly recommend consulting a qualified healthcare professional.'
    : ''
}

Provide a concise, direct, compassionate answer in 2-4 short paragraphs. Address WHAT, WHY, and WHAT TO DO NEXT. Ground your advice in the exact measured AQI, PM2.5, and weather figures above.`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const safeHistory = Array.isArray(history) ? history : [];
      const recentHistory = safeHistory
        .slice(-6)
        .map((m) => `${m?.sender === 'user' ? 'User' : 'Assistant'}: ${String(m?.content || '').slice(0, 500)}`)
        .join('\n');
      const fullPrompt = recentHistory ? `${contextPrompt}\n\nRECENT CONVERSATION:\n${recentHistory}` : contextPrompt;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: fullPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
      });

      if (isNonEmptyString(response.text)) {
        return { reply: response.text.trim(), generatedBy: 'gemini' };
      }
    } catch (error) {
      console.warn(
        'Gemini chat failed, using local rule-based assistant:',
        error instanceof Error ? error.message : error
      );
    }
  }

  return {
    reply: generateRuleBasedChatResponse(message, profile, env),
    generatedBy: 'rules-fallback',
  };
}

export async function getAirWiseChatResponse(
  message: string,
  history: ChatMessage[],
  profile: UserProfile,
  env: EnvironmentalContext
): Promise<string> {
  const result = await getAirWiseChatWithSource(message, history, profile, env);
  return result.reply;
}

/**
 * Cleaner Option Comparator with strict JSON validation and deterministic fallback.
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

Context: City: ${env?.location?.name || 'your city'}, AQI: ${env?.airQuality?.aqi ?? 100} (${env?.airQuality?.category || 'Moderate'}), PM2.5: ${env?.airQuality?.pm2_5 ?? 45} µg/m³, Wind: ${env?.weather?.windSpeed ?? 8} km/h, User: ${profile?.lifestyle || 'Student'}.

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

  const fallback = generateRuleBasedComparison(optionA, optionB, profile, env);
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const cleaned = cleanJsonResponse(response.text ?? '');
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;

      return {
        optionA: validateComparatorOption(parsed?.optionA, fallback.optionA),
        optionB: validateComparatorOption(parsed?.optionB, fallback.optionB),
        recommendation: isNonEmptyString(parsed?.recommendation) ? parsed.recommendation : fallback.recommendation,
        whyItMatters: isNonEmptyString(parsed?.whyItMatters) ? parsed.whyItMatters : fallback.whyItMatters,
        assumptions: isNonEmptyString(parsed?.assumptions) ? parsed.assumptions : fallback.assumptions,
        generatedBy: 'gemini',
      };
    } catch (err) {
      console.warn('Gemini comparator failed, using rule fallback:', err instanceof Error ? err.message : err);
    }
  }

  return fallback;
}
