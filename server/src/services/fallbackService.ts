import {
  AIDailyPlan,
  ComparatorResult,
  EnvironmentalContext,
  UserProfile,
} from '../types/index.js';
import { extractContextSummary, MEDICAL_QUERY_PATTERN } from '../utils/contextSummary.js';

/**
 * Deterministic Local Rule Engine Fallback.
 * Guarantees zero downtime, testability, and consistent schema when Gemini is unavailable.
 */
export function generateRuleBasedDailyPlan(
  profile: UserProfile,
  env: EnvironmentalContext
): AIDailyPlan {
  const ctx = extractContextSummary(profile, env);
  const isSevere = ctx.category === 'Severe' || ctx.category === 'Very Poor';

  return {
    summary: `Air quality in ${ctx.locationName} is currently ${ctx.category} (AQI ${ctx.aqi}, PM2.5 ${ctx.pm2_5} µg/m³). Prioritize indoor filtration during peak morning inversion and shift travel or exercise to ${ctx.bestWindowLabel}.`,
    air_quality_explanation: `Elevated particulate concentrations (${ctx.dominantPollutant}) are driven by stagnant low-level winds (${ctx.windSpeed} km/h) and urban thermal inversion. Ground-level emissions remain trapped close to street level, especially between ${ctx.peakWindowLabel}.`,
    actions: [
      {
        time: 'Morning',
        action: isSevere
          ? 'Keep windows sealed and run indoor air purifier on medium/high'
          : 'Limit early morning window ventilation until boundary layer warms up',
        reason: `Morning hours (${ctx.peakWindowLabel}) align with maximum ground inversion and peak tailpipe exhaust.`,
        impact: 'Prevents 60–80% of outdoor fine particulate infiltration into sleeping areas.',
        difficulty: 'Easy',
        estimatedBenefit: 'Substantially cleaner bedroom air for family members awakening.',
        whatNext: 'Check weather sealing around bedroom windows.',
      },
      {
        time: 'Commute',
        action:
          ctx.commuteMethod === 'Car'
            ? 'Opt for metro/bus transit or organize a 3+ carpool'
            : ctx.commuteMethod === 'Two-wheeler'
            ? 'Wear a certified N95 particulate respirator during transit'
            : 'Maintain safe buffer from congested arterial bottlenecks',
        reason: 'Single-occupancy vehicles generate ~142g CO2/km and concentrate roadside nitrogen dioxide.',
        impact: 'Reduces per-passenger emissions by up to 75% compared to solo driving.',
        difficulty: 'Moderate',
        estimatedBenefit: 'Reduces direct inhalation of fresh diesel soot and fine carbon particulates.',
        whatNext: 'Check public transit schedule or set vehicle cabin air to recirculation.',
      },
      {
        time: 'Work/Study',
        action:
          'Request flexible remote hours if feasible, or ensure indoor workspace ventilation filters are operating',
        reason: 'Midday urban traffic and ambient smog accumulate in poorly filtered commercial buildings.',
        impact: 'Eliminates peak-hour rush trips and lowers daily exposure hours.',
        difficulty: 'Easy',
        estimatedBenefit: 'Saves 1.5–2 kg of estimated vehicle CO2 per avoided commuting day.',
        whatNext: 'Place personal HEPA unit near desk or close perimeter drafts.',
      },
      {
        time: 'Outdoor activity',
        action:
          ctx.outdoorActivity !== 'None'
            ? `Shift physical workouts to the safer window: ${ctx.bestWindowLabel}`
            : `Schedule essential outdoor chores between ${ctx.bestWindowLabel}`,
        reason: `Afternoon solar heating deepens the atmospheric mixing layer, yielding lowest daily PM2.5 (${ctx.bestWindowDescription}).`,
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
      `Keep windows closed during early morning (${ctx.peakWindowLabel}) and open briefly only between ${ctx.bestWindowLabel} if air freshening is needed.`,
      'Use high-CFM kitchen ventilation during cooking; do not burn incense, dhoop, or unvented heating coils.',
      'Damp-wipe high-dust surfaces instead of dry sweeping to prevent particulate re-suspension.',
    ],
    commute_guidance: [
      'Switch your car AC to internal air recirculation mode to block up to 70% of roadside tailpipe intake.',
      'Two-wheeler riders and pedestrians should wear a well-fitted N95/FFP2 mask during peak congestion.',
    ],
    family_guidance: [
      ctx.childrenCount > 0
        ? 'Children breathe faster per kg of body weight; replace outdoor playground activities with indoor games during morning hours.'
        : 'Keep living areas well filtered.',
      ctx.elderlyCount > 0 || ctx.sensitiveCount > 0
        ? 'Seniors and individuals with asthma/allergies should strictly limit vigorous outdoor walking to afternoons only.'
        : 'Stay adequately hydrated to support natural mucosal barrier defense.',
    ],
    sustainability_tip:
      'Consolidate multiple short vehicle errands into a single trip, or switch one weekly commute to public transit to save an estimated 1.5 kg CO2.',
    safety_note:
      'This assistant provides general environmental guidance and is not medical advice. Individuals with pre-existing cardiopulmonary conditions should strictly adhere to physician advice and local health alerts.',
    generatedBy: 'rules-fallback',
    generatedAt: new Date().toISOString(),
  };
}

export function generateRuleBasedChatResponse(
  message: string,
  profile: UserProfile,
  env: EnvironmentalContext
): string {
  const lower = message.toLowerCase();
  const ctx = extractContextSummary(profile, env);

  if (MEDICAL_QUERY_PATTERN.test(message)) {
    return `### Respiratory Safety & Environmental Exposure Guidance for ${ctx.locationName}

Current measured air quality is **${ctx.aqi} (${ctx.category})** with PM2.5 at **${ctx.pm2_5} µg/m³**.

**Important Health Notice:**
AirWise Assistant provides general environmental exposure mitigation only—it cannot provide medical diagnoses, prescribe medication, or recommend inhaler dosages. **Please consult a qualified healthcare professional or physician promptly** for any asthma flare-ups, chest pain, or persistent respiratory symptoms.

**Immediate Environmental Exposure Reduction:**
- Move indoors into a sealed room and run a True HEPA air purifier if available.
- Avoid stepping outdoors during peak pollution (${ctx.peakWindowLabel}) and keep windows closed.`;
  }

  if (/\b(run|jog|exercise|walk)\b/.test(lower)) {
    return `### Outdoor Activity Guidance for ${ctx.locationName}

Current air quality is **${ctx.category}** with a PM2.5 level of **${ctx.pm2_5} µg/m³** (AQI ${ctx.aqi}).

**When is it safest?**
Your best outdoor window today is **${ctx.bestWindowLabel}**. During this time, solar heating helps disperse stagnant surface particles, making it substantially safer for moderate exercise than morning hours.

**What you should do:**
- Avoid running during peak morning inversion (${ctx.peakWindowLabel}) when vehicle exhaust is trapped near breathing height.
- If air quality remains in the ${ctx.category} category, consider an indoor workout, yoga, or treadmill session instead of strenuous outdoor cardio.
- Wear an N95 mask if you must be outdoors during congested rush hours.

*Notice: This is general environmental guidance, not medical advice. Those with asthma or heart conditions should consult their physician.*`;
  }

  if (/\b(window|ventilate|indoor|air purifier)\b/.test(lower)) {
    return `### Indoor Air & Ventilation Advice

In **${ctx.locationName}**, current outdoor PM2.5 is **${ctx.pm2_5} µg/m³** (${ctx.category}).

**Window Guidance:**
- **Keep windows closed** during early morning (${ctx.peakWindowLabel}) and late night when thermal inversion traps heavy pollutants.
- If you need fresh air exchange, crack windows open briefly during **${ctx.bestWindowLabel}** when outdoor particulate levels are lowest.

**Indoor Air Quality Hacks:**
1. Run your HEPA air purifier continuously on auto or medium mode in living and sleeping quarters.
2. Always turn on kitchen exhaust fans when cooking—frying and oil heating generate massive spikes in indoor PM2.5.
3. Use a damp microfiber cloth for dusting instead of dry brooms to avoid kicking settled particles back into the air.`;
  }

  if (/\b(car|commute|college|office|transit)\b/.test(lower)) {
    return `### Low-Emission Commute Alternatives

For your routine in **${ctx.locationName}**:

**The Cleaner Option:**
Taking the **metro or public bus** saves approximately **1.2 to 1.5 kg of CO2** per 12 km trip compared to driving alone in a petrol car. It also removes one vehicle from gridlocked street canyons where roadside particulate spikes highest.

**Practical Tips:**
- If you drive, switch your ventilation system to **Cabin Air Recirculation** to reduce tailpipe soot entering your vehicle.
- If taking a two-wheeler or walking near main roads, equip a well-sealed **N95 respirator**.
- Consider combining errands or coordinating a carpool with nearby colleagues or classmates.`;
  }

  return `### AirWise Guidance for ${ctx.locationName}

Current conditions report an AQI of **${ctx.aqi} (${ctx.category})** with PM2.5 at **${ctx.pm2_5} µg/m³** and temperature at **${ctx.temperature}°C**.

**Key Recommendations for Today:**
1. **Best Outdoor Window:** Plan non-essential outdoor movements around **${ctx.bestWindowLabel}**.
2. **Avoid Morning Inversion:** Peak pollution is highest around **${ctx.peakWindowLabel}**.
3. **Clean Choices:** Opt for public transit or carpooling to reduce street-level emissions, and keep indoor living areas protected with HEPA filtration.

Feel free to ask specific questions about your commute, family safety, or running timing!`;
}

export function generateRuleBasedComparison(
  optionA: string,
  optionB: string,
  profile: UserProfile,
  env: EnvironmentalContext
): ComparatorResult {
  const ctx = extractContextSummary(profile, env);
  const isTransit = /public|metro|walk|cycl/i.test(optionB);

  return {
    optionA: {
      mode: optionA,
      title: optionA,
      convenience: 'High personal door-to-door flexibility, but subjected to traffic delays and parking search.',
      relativeEmission: 'High (Approx. 142g CO2/km + localized nitrogen dioxide and brake dust)',
      emissionScore: 85,
      costIndication: 'High (Fuel, tolls, parking, vehicle wear & tear)',
      environmentalBenefit: 'Minimal. Increases congestion and localized urban street canyon pollution.',
      practicality: 'High independence, but vulnerable to smog exposure during vehicle entry and traffic jams.',
    },
    optionB: {
      mode: optionB,
      title: optionB,
      convenience: 'Moderate to High with predictable scheduled transit routes.',
      relativeEmission: isTransit ? 'Very Low (Approx. 18-32g CO2/passenger-km)' : 'Low',
      emissionScore: 22,
      costIndication: 'Low (Fraction of solo vehicle expense)',
      environmentalBenefit: 'Significant. Cuts per-capita emissions by 75-85% and relieves urban road gridlock.',
      practicality: 'Highly practical in urban centers with metro or dedicated bus rapid transit corridors.',
    },
    recommendation: `Choose ${optionB} today. In ${ctx.locationName}'s current ${ctx.category} conditions, reducing individual tailpipe emissions directly supports community-wide respiratory relief.`,
    whyItMatters:
      'Every car trip replaced by electrified transit or active mobility avoids approximately 1.5 kg of CO2 and prevents immediate ground-level particulate accumulation in residential zones.',
    assumptions:
      'Calculations modeled for a standard 12 km urban round-trip using CPCB & ICCT passenger transport emission benchmarks.',
    generatedBy: 'rules-fallback',
  };
}
