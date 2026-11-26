import {
  CommuteMethod,
  HouseholdMembers,
  IndoorEnvironment,
  LifestyleType,
  LocationInfo,
  OutdoorActivity,
} from '../types';

export const PRESET_CITIES: LocationInfo[] = [
  { name: 'Hyderabad', country: 'India', admin1: 'Telangana', latitude: 17.385, longitude: 78.4867 },
  { name: 'Delhi', country: 'India', admin1: 'Delhi', latitude: 28.6139, longitude: 77.209 },
  { name: 'Bengaluru', country: 'India', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Mumbai', country: 'India', admin1: 'Maharashtra', latitude: 19.076, longitude: 72.8777 },
  { name: 'Chennai', country: 'India', admin1: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata', country: 'India', admin1: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Pune', country: 'India', admin1: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
];

export const LIFESTYLE_OPTIONS: LifestyleType[] = [
  'Student',
  'Office worker',
  'Remote worker',
  'Outdoor worker',
  'Senior citizen',
  'Parent/family',
  'Fitness enthusiast',
];

export const COMMUTE_OPTIONS: CommuteMethod[] = [
  'Walking',
  'Bicycle',
  'Public transport',
  'Two-wheeler',
  'Car',
  'Work from home',
];

export const OUTDOOR_ACTIVITY_OPTIONS: OutdoorActivity[] = [
  'Walking',
  'Running',
  'Cycling',
  'Sports',
  'None',
];

export const INDOOR_ENVIRONMENT_OPTIONS: IndoorEnvironment[] = [
  'Air purifier',
  'Natural ventilation',
  'AC',
  'Closed windows',
  'Indoor plants',
  'No purifier',
];

export interface HouseholdGroupOption {
  key: keyof HouseholdMembers;
  label: string;
  desc: string;
}

export const HOUSEHOLD_GROUP_OPTIONS: HouseholdGroupOption[] = [
  { key: 'adults', label: 'Adults', desc: 'Standard resilience' },
  { key: 'children', label: 'Children', desc: 'Higher breathing rate' },
  { key: 'elderly', label: 'Elderly (65+)', desc: 'Cardiovascular care' },
  { key: 'sensitive', label: 'Asthma / Sensitive', desc: 'Respiratory conditions' },
];
