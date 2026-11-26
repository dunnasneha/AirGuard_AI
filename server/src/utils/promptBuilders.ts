import { ChatMessage } from '../types/index.js';
import { MEDICAL_QUERY_PATTERN, NormalizedPromptContext } from './contextSummary.js';

export const SYSTEM_PROMPT = `You are AirWise Assistant, an expert urban environmental advisor specializing in winter smog resilience, low-emission lifestyles, and indoor air safety.
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

/** Builds the structured JSON daily action-plan prompt grounded in live environmental context. */
export function buildDailyPlanPrompt(ctx: NormalizedPromptContext): string {
  const countrySuffix = ctx.locationCountry ? `, ${ctx.locationCountry}` : '';
  return `Generate a personalized daily pollution action plan based on the following verified environmental data and user profile.

ENVIRONMENTAL CONTEXT (DO NOT ALTER THESE VALUES):
- Location: ${ctx.locationName}${countrySuffix}
- Current AQI: ${ctx.aqi} (${ctx.category})
- Dominant Pollutant: ${ctx.dominantPollutant}
- PM2.5: ${ctx.pm2_5} µg/m³
- PM10: ${ctx.pm10} µg/m³
- Ozone: ${ctx.ozone} µg/m³
- Temperature: ${ctx.temperature}°C, Humidity: ${ctx.humidity}%, Wind: ${ctx.windSpeed} km/h
- Condition: ${ctx.conditionDescription}
- Better Outdoor Window: ${ctx.bestWindowLabel} (${ctx.bestWindowDescription})
- Higher Pollution Window: ${ctx.peakWindowLabel} (${ctx.peakWindowDescription})

USER PROFILE:
- Lifestyle: ${ctx.lifestyle}
- Household Members: Adults: ${ctx.adultsCount}, Children: ${ctx.childrenCount}, Elderly: ${ctx.elderlyCount}, Sensitive/Asthma: ${ctx.sensitiveCount}
- Daily Commute: ${ctx.commuteMethod}
- Outdoor Activity: ${ctx.outdoorActivity}
- Indoor Setup: ${ctx.indoorSetup}

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
}

/** Builds a multi-turn contextual prompt for conversational AirWise Assistant queries. */
export function buildChatPrompt(
  message: string,
  history: ChatMessage[],
  ctx: NormalizedPromptContext
): string {
  const isMedicalQuery = MEDICAL_QUERY_PATTERN.test(message);
  const countrySuffix = ctx.locationCountry ? `, ${ctx.locationCountry}` : '';
  const medicalNote = isMedicalQuery
    ? 'IMPORTANT: The user message mentions medical/health symptoms. Provide supportive general environmental reduction measures only, emphasize that this is not medical advice, and firmly recommend consulting a qualified healthcare professional.'
    : '';

  const contextPrompt = `You are AirWise Assistant.
CURRENT USER CONTEXT:
- Location: ${ctx.locationName}${countrySuffix}
- Air Quality: AQI ${ctx.aqi} (${ctx.category}), PM2.5: ${ctx.pm2_5} µg/m³, PM10: ${ctx.pm10} µg/m³
- Weather: ${ctx.temperature}°C, ${ctx.humidity}% humidity, Wind: ${ctx.windSpeed} km/h, ${ctx.conditionDescription}
- Optimal outdoor window: ${ctx.bestWindowLabel}
- Peak pollution window: ${ctx.peakWindowLabel}
- User Profile: ${ctx.lifestyle}, commute via ${ctx.commuteMethod}, household: ${ctx.childrenCount} children, ${ctx.elderlyCount} elderly, ${ctx.sensitiveCount} sensitive members.

USER MESSAGE: "${message}"

${medicalNote}

Provide a concise, direct, compassionate answer in 2-4 short paragraphs. Address WHAT, WHY, and WHAT TO DO NEXT. Ground your advice in the exact measured AQI, PM2.5, and weather figures above.`;

  const recentHistory = Array.isArray(history)
    ? history
        .slice(-6)
        .map((m) => `${m?.sender === 'user' ? 'User' : 'Assistant'}: ${String(m?.content || '').slice(0, 500)}`)
        .join('\n')
    : '';

  return recentHistory ? `${contextPrompt}\n\nRECENT CONVERSATION:\n${recentHistory}` : contextPrompt;
}

/** Builds the structured JSON comparison prompt for two urban commute/lifestyle choices. */
export function buildComparatorPrompt(
  optionA: string,
  optionB: string,
  ctx: NormalizedPromptContext
): string {
  return `Compare these two urban choices from an air quality, emissions, practicality, and personal exposure perspective:
Option A: "${optionA}"
Option B: "${optionB}"

Context: City: ${ctx.locationName}, AQI: ${ctx.aqi} (${ctx.category}), PM2.5: ${ctx.pm2_5} µg/m³, Wind: ${ctx.windSpeed} km/h, User: ${ctx.lifestyle}.

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
}
