import {
  ActionImpactEstimate,
  CommunityStats,
  ImpactSummary,
} from '../types/index.js';

export type { ActionImpactEstimate, ImpactSummary, CommunityStats };

export const COMMUNITY_DEMO_STATS: CommunityStats = {
  title: 'Community Air Actions',
  isDemoSample: true,
  notice: 'Demo community activity — collective urban smog reduction stats from community participants.',
  metrics: {
    cleanerChoices: 1240,
    carTripsAvoided: 680,
    indoorChecklistsCompleted: 430,
    estimatedCo2PreventedKg: 980,
    activeParticipatingHouseholds: 312,
  },
};

// Standard urban transport emission factors (g CO2 per passenger km)
// Reference: Central Pollution Control Board (CPCB) & International Council on Clean Transportation (ICCT)
export const EMISSION_FACTORS = {
  PETROL_CAR_SOLO: 142, // g CO2/km
  DIESEL_CAR_SOLO: 155, // g CO2/km
  TWO_WHEELER: 48,     // g CO2/km
  BUS_TRANSIT: 32,      // g CO2/passenger-km
  METRO_RAIL: 18,       // g CO2/passenger-km
  WALK_CYCLE: 0,        // zero operational emissions
  AVG_URBAN_TRIP_KM: 12 // average round-trip urban commute distance in km
};

export function calculateSingleActionImpact(actionType: string): ActionImpactEstimate {
  const tripKm = EMISSION_FACTORS.AVG_URBAN_TRIP_KM;

  switch (actionType) {
    case 'public_transport': {
      // Car solo (142g) vs Metro (18g) = 124g/km saved * 12km = ~1.49 kg CO2
      const savedKg = Math.round(((EMISSION_FACTORS.PETROL_CAR_SOLO - EMISSION_FACTORS.METRO_RAIL) * tripKm) / 1000 * 10) / 10;
      return {
        actionId: 'public_transport',
        actionTitle: 'Took Metro / Public Transit instead of Solo Car',
        category: 'commute',
        estimatedCo2SavedKg: savedKg,
        tripsAvoided: 1,
        exposureReductionPercent: 35,
        explanation: 'Transitioning from a single-occupancy petrol car to electrified metro transit drastically reduces per-capita street-level exhaust.'
      };
    }
    case 'cycling_walking': {
      const savedKg = Math.round((EMISSION_FACTORS.PETROL_CAR_SOLO * tripKm) / 1000 * 10) / 10;
      return {
        actionId: 'cycling_walking',
        actionTitle: 'Bicycled / Walked for Short Local Errands',
        category: 'commute',
        estimatedCo2SavedKg: savedKg,
        tripsAvoided: 1,
        exposureReductionPercent: 15,
        explanation: 'Zero direct tailpipe emissions for short trips under 5km prevents cold-engine combustion spikes in your neighborhood.'
      };
    }
    case 'carpool': {
      // 2 passengers sharing car = half emissions
      const savedKg = Math.round(((EMISSION_FACTORS.PETROL_CAR_SOLO * tripKm) / 2) / 1000 * 10) / 10;
      return {
        actionId: 'carpool',
        actionTitle: 'Carpooled with Colleagues or Neighbors',
        category: 'commute',
        estimatedCo2SavedKg: savedKg,
        tripsAvoided: 1,
        exposureReductionPercent: 20,
        explanation: 'Doubling vehicle occupancy directly halves tailpipe emissions per passenger journey.'
      };
    }
    case 'work_from_home': {
      const savedKg = Math.round((EMISSION_FACTORS.PETROL_CAR_SOLO * tripKm * 1.5) / 1000 * 10) / 10;
      return {
        actionId: 'work_from_home',
        actionTitle: 'Worked from Home on High Pollution Smog Day',
        category: 'lifestyle',
        estimatedCo2SavedKg: savedKg,
        tripsAvoided: 2,
        exposureReductionPercent: 65,
        explanation: 'Eliminates peak-hour rush traffic emissions entirely and avoids heavy roadside particulate exposure.'
      };
    }
    case 'combine_errands': {
      const savedKg = 0.9;
      return {
        actionId: 'combine_errands',
        actionTitle: 'Combined Multiple Local Errands into Single Trip',
        category: 'commute',
        estimatedCo2SavedKg: savedKg,
        tripsAvoided: 1,
        exposureReductionPercent: 25,
        explanation: 'Reduces multiple cold engine starts which generate 3x to 5x higher VOC and carbon emissions than a warm engine.'
      };
    }
    case 'indoor_purifier_timed': {
      return {
        actionId: 'indoor_purifier_timed',
        actionTitle: 'Scheduled HEPA Filtration During Peak Outdoor Inversion',
        category: 'indoor',
        estimatedCo2SavedKg: 0.2,
        tripsAvoided: 0,
        exposureReductionPercent: 75,
        explanation: 'Running HEPA filters during early morning and late night intercepts infiltrating ultrafine PM2.5 while optimizing energy use.'
      };
    }
    case 'sealed_cooking_vent': {
      return {
        actionId: 'sealed_cooking_vent',
        actionTitle: 'Used High-CFM Range Hood & Closed Kitchen Door',
        category: 'indoor',
        estimatedCo2SavedKg: 0.1,
        tripsAvoided: 0,
        exposureReductionPercent: 50,
        explanation: 'Kitchen oil combustion is one of the highest indoor PM2.5 sources; exhausting it directly prevents whole-house smog accumulation.'
      };
    }
    default: {
      return {
        actionId: actionType,
        actionTitle: 'Sustainable Environmental Choice',
        category: 'lifestyle',
        estimatedCo2SavedKg: 0.5,
        tripsAvoided: 1,
        exposureReductionPercent: 20,
        explanation: 'Every conscious choice to lower emissions compounds community-wide respiratory health benefits.'
      };
    }
  }
}

export function computeTotalImpact(actionKeys: string[], streakDays: number = 4): ImpactSummary {
  let totalCo2SavedKg = 0;
  let totalTripsAvoided = 0;
  let exposureAccumulator = 0;

  for (const key of actionKeys) {
    const item = calculateSingleActionImpact(key);
    totalCo2SavedKg += item.estimatedCo2SavedKg;
    totalTripsAvoided += item.tripsAvoided;
    exposureAccumulator += item.exposureReductionPercent;
  }

  // Calculate score (0 to 100) based purely on verified user actions and streak
  const safeStreakDays = Number.isFinite(streakDays) ? Math.max(0, Math.floor(streakDays)) : 0;
  const baseScore = 50;
  const actionBonus = Math.min(35, actionKeys.length * 7);
  const streakBonus = Math.min(15, safeStreakDays * 3);
  const airWiseScore = Math.min(100, baseScore + actionBonus + streakBonus);

  const avgExposureReduction = actionKeys.length > 0 
    ? Math.min(85, Math.round(exposureAccumulator / actionKeys.length * 1.2))
    : 0;

  return {
    totalCo2SavedKg: Math.round(totalCo2SavedKg * 10) / 10,
    totalTripsAvoided,
    estimatedExposureCutPercent: avgExposureReduction,
    airWiseScore,
    streakDays,
    actionsCompleted: actionKeys.length,
    assumptions: [
      'Average urban round-trip commute distance estimated at 12 km.',
      'Solo petrol car emission factor based on CPCB/ICCT average of 142g CO2/km.',
      'Electric metro rail factor based on urban grid benchmark of 18g CO2/passenger-km.',
      'Exposure reduction estimates indicate relative personal indoor/outdoor particulate defense, not guaranteed medical immunity.'
    ]
  };
}
