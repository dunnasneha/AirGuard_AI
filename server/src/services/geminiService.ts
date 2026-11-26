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
import { extractContextSummary } from '../utils/contextSummary.js';
import {
  buildChatPrompt,
  buildComparatorPrompt,
  buildDailyPlanPrompt,
  SYSTEM_PROMPT,
} from '../utils/promptBuilders.js';
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

function parseJsonObject(raw: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(cleanJsonResponse(raw));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Expected JSON object response');
  }
  return parsed as Record<string, unknown>;
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
      const difficulty =
        item.difficulty === 'Easy' || item.difficulty === 'Moderate' || item.difficulty === 'Challenging'
          ? item.difficulty
          : fb.difficulty;
      return {
        time: (isNonEmptyString(item.time) ? item.time : fb.time) as PlanAction['time'],
        action: isNonEmptyString(item.action) ? item.action : fb.action,
        reason: isNonEmptyString(item.reason) ? item.reason : fb.reason,
        impact: isNonEmptyString(item.impact) ? item.impact : fb.impact,
        difficulty,
        estimatedBenefit: isNonEmptyString(item.estimatedBenefit) ? item.estimatedBenefit : fb.estimatedBenefit,
        whatNext: isNonEmptyString(item.whatNext) ? item.whatNext : fb.whatNext,
      };
    });

  return valid.length > 0 ? valid : fallbackActions;
}

function validateComparatorOption(raw: unknown, fallback: ComparatorOption): ComparatorOption {
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Record<string, unknown>;
  const score =
    typeof obj.emissionScore === 'number' && Number.isFinite(obj.emissionScore)
      ? Math.max(0, Math.min(100, Math.round(obj.emissionScore)))
      : fallback.emissionScore;

  return {
    mode: isNonEmptyString(obj.mode) ? obj.mode : fallback.mode,
    title: isNonEmptyString(obj.title) ? obj.title : fallback.title,
    convenience: isNonEmptyString(obj.convenience) ? obj.convenience : fallback.convenience,
    relativeEmission: isNonEmptyString(obj.relativeEmission) ? obj.relativeEmission : fallback.relativeEmission,
    emissionScore: score,
    costIndication: isNonEmptyString(obj.costIndication) ? obj.costIndication : fallback.costIndication,
    environmentalBenefit: isNonEmptyString(obj.environmentalBenefit)
      ? obj.environmentalBenefit
      : fallback.environmentalBenefit,
    practicality: isNonEmptyString(obj.practicality) ? obj.practicality : fallback.practicality,
  };
}

/**
 * Generates a 6-period personalized daily pollution action plan via Gemini,
 * falling back to the deterministic rule engine on missing key or invalid output.
 */
export async function generateDailyActionPlan(
  profile: UserProfile,
  env: EnvironmentalContext
): Promise<AIDailyPlan> {
  const fallback = generateRuleBasedDailyPlan(profile, env);
  const ai = getGeminiClient();
  if (!ai) return fallback;

  try {
    const prompt = buildDailyPlanPrompt(extractContextSummary(profile, env));
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { systemInstruction: SYSTEM_PROMPT, responseMimeType: 'application/json' },
    });

    const parsed = parseJsonObject(response.text ?? '');
    return {
      summary: isNonEmptyString(parsed.summary) ? parsed.summary : fallback.summary,
      air_quality_explanation: isNonEmptyString(parsed.air_quality_explanation)
        ? parsed.air_quality_explanation
        : fallback.air_quality_explanation,
      actions: validatePlanActions(parsed.actions, fallback.actions),
      indoor_guidance: toStringArray(parsed.indoor_guidance, fallback.indoor_guidance),
      commute_guidance: toStringArray(parsed.commute_guidance, fallback.commute_guidance),
      family_guidance: toStringArray(parsed.family_guidance, fallback.family_guidance),
      sustainability_tip: isNonEmptyString(parsed.sustainability_tip)
        ? parsed.sustainability_tip
        : fallback.sustainability_tip,
      safety_note: isNonEmptyString(parsed.safety_note) ? parsed.safety_note : fallback.safety_note,
      generatedBy: 'gemini',
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(
      'Gemini API daily plan generation failed, falling back to rule engine:',
      error instanceof Error ? error.message : error
    );
    return fallback;
  }
}

/**
 * Generates conversational guidance grounded in current AQI, weather, and profile,
 * returning both the message text and model provenance (`gemini` or `rules-fallback`).
 */
export async function getAirWiseChatWithSource(
  message: string,
  history: ChatMessage[],
  profile: UserProfile,
  env: EnvironmentalContext
): Promise<{ reply: string; generatedBy: GeneratedBySource }> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const fullPrompt = buildChatPrompt(message, history, extractContextSummary(profile, env));
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: fullPrompt,
        config: { systemInstruction: SYSTEM_PROMPT },
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
 * Generates side-by-side low-emission choice comparisons with strict schema validation
 * and rule-engine fallback.
 */
export async function getCleanerOptionComparison(
  optionA: string,
  optionB: string,
  profile: UserProfile,
  env: EnvironmentalContext
): Promise<ComparatorResult> {
  const fallback = generateRuleBasedComparison(optionA, optionB, profile, env);
  const ai = getGeminiClient();
  if (!ai) return fallback;

  try {
    const prompt = buildComparatorPrompt(optionA, optionB, extractContextSummary(profile, env));
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { systemInstruction: SYSTEM_PROMPT, responseMimeType: 'application/json' },
    });

    const parsed = parseJsonObject(response.text ?? '');
    return {
      optionA: validateComparatorOption(parsed.optionA, fallback.optionA),
      optionB: validateComparatorOption(parsed.optionB, fallback.optionB),
      recommendation: isNonEmptyString(parsed.recommendation) ? parsed.recommendation : fallback.recommendation,
      whyItMatters: isNonEmptyString(parsed.whyItMatters) ? parsed.whyItMatters : fallback.whyItMatters,
      assumptions: isNonEmptyString(parsed.assumptions) ? parsed.assumptions : fallback.assumptions,
      generatedBy: 'gemini',
    };
  } catch (err) {
    console.warn('Gemini comparator failed, using rule fallback:', err instanceof Error ? err.message : err);
    return fallback;
  }
}
