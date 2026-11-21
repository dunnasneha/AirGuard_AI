export type AQICategory = 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

export interface LocationInfo {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentPollutants {
  aqi: number;
  category: AQICategory;
  pm2_5: number;
  pm10: number;
  ozone: number;
  no2?: number;
  so2?: number;
  co?: number;
  dominantPollutant: string;
  healthAdvice: string;
}

export interface HourlyDataPoint {
  time: string;
  hour: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  aqi: number;
}

export interface PollutionWindows {
  bestOutdoorWindow: {
    startHour: number;
    endHour: number;
    description: string;
    label: string;
  };
  peakPollutionWindow: {
    startHour: number;
    endHour: number;
    description: string;
    label: string;
  };
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  conditionDescription: string;
}

export interface EnvironmentalContext {
  location: LocationInfo;
  airQuality: CurrentPollutants;
  hourly: HourlyDataPoint[];
  windows: PollutionWindows;
  weather: WeatherData;
  lastUpdated: string;
  isDemo?: boolean;
  demoNotice?: string;
}

export type LifestyleType =
  | 'Student'
  | 'Office worker'
  | 'Remote worker'
  | 'Outdoor worker'
  | 'Senior citizen'
  | 'Parent/family'
  | 'Fitness enthusiast';

export type CommuteMethod =
  | 'Walking'
  | 'Bicycle'
  | 'Public transport'
  | 'Two-wheeler'
  | 'Car'
  | 'Work from home';

export type OutdoorActivity =
  | 'Walking'
  | 'Running'
  | 'Cycling'
  | 'Sports'
  | 'None';

export type IndoorEnvironment =
  | 'Air purifier'
  | 'Natural ventilation'
  | 'AC'
  | 'Closed windows'
  | 'Indoor plants'
  | 'No purifier';

export interface HouseholdMembers {
  adults: number;
  children: number;
  elderly: number;
  sensitive: number;
}

export interface UserProfile {
  lifestyle: LifestyleType;
  householdMembers: HouseholdMembers;
  commuteMethod: CommuteMethod;
  outdoorActivity: OutdoorActivity;
  indoorEnvironment: IndoorEnvironment[];
  sensitivities?: string;
  location: LocationInfo;
}

export interface PlanAction {
  time: 'Morning' | 'Commute' | 'Work/Study' | 'Outdoor activity' | 'Evening' | 'Night';
  action: string;
  reason: string;
  impact: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  estimatedBenefit: string;
  whatNext: string;
}

export interface AIDailyPlan {
  summary: string;
  air_quality_explanation: string;
  actions: PlanAction[];
  indoor_guidance: string[];
  commute_guidance: string[];
  family_guidance: string[];
  sustainability_tip: string;
  safety_note: string;
  generatedBy: 'gemini' | 'rules-fallback';
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  contextUsed?: {
    location: string;
    aqi: number;
    category: AQICategory;
    lifestyle: string;
  };
}

export interface ComparatorOption {
  mode: string;
  title: string;
  convenience: string;
  relativeEmission: string;
  emissionScore: number;
  costIndication: string;
  environmentalBenefit: string;
  practicality: string;
}

export interface ComparatorResult {
  optionA: ComparatorOption;
  optionB: ComparatorOption;
  recommendation: string;
  whyItMatters: string;
  assumptions: string;
}

export interface ImpactSummary {
  totalCo2SavedKg: number;
  totalTripsAvoided: number;
  estimatedExposureCutPercent: number;
  airWiseScore: number;
  streakDays: number;
  actionsCompleted: number;
  assumptions: string[];
}
