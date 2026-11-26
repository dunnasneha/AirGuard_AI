import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import App from './App';
import { AIDailyPlanPage } from './pages/AIDailyPlanPage';
import { AssistantPage } from './pages/AssistantPage';
import { IndoorAirPage } from './pages/IndoorAirPage';
import { ComparatorPage } from './pages/ComparatorPage';
import type { AIDailyPlan, EnvironmentalContext, UserProfile } from './types';

// JSDOM does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

const sampleContext: EnvironmentalContext = {
  location: { name: 'Hyderabad', country: 'India', latitude: 17.385, longitude: 78.4867 },
  airQuality: {
    aqi: 165,
    category: 'Poor',
    pm2_5: 85,
    pm10: 140,
    ozone: 35,
    dominantPollutant: 'PM2.5',
    healthAdvice: 'Air quality is poor. Sensitive individuals should limit outdoor exertion.',
  },
  hourly: [
    { time: '14:00', hour: 14, pm2_5: 45, pm10: 75, ozone: 30, aqi: 90 },
    { time: '18:00', hour: 18, pm2_5: 95, pm10: 150, ozone: 35, aqi: 180 },
  ],
  windows: {
    bestOutdoorWindow: { startHour: 14, endHour: 17, label: '2:00 PM – 5:00 PM', description: 'Lowest particulate levels' },
    peakPollutionWindow: { startHour: 6, endHour: 9, label: '6:00 AM – 9:00 AM', description: 'Morning inversion' },
  },
  weather: {
    temperature: 24,
    humidity: 55,
    windSpeed: 8,
    weatherCode: 1,
    conditionDescription: 'Mainly clear',
  },
  lastUpdated: new Date().toISOString(),
  isDemo: false,
};

const sampleProfile: UserProfile = {
  lifestyle: 'Student',
  householdMembers: { adults: 2, children: 0, elderly: 0, sensitive: 0 },
  commuteMethod: 'Public transport',
  outdoorActivity: 'Walking',
  indoorEnvironment: ['Natural ventilation'],
  location: sampleContext.location,
};

const samplePlan: AIDailyPlan = {
  summary: 'Moderate smog resilience plan for Hyderabad.',
  air_quality_explanation: 'Morning thermal inversion elevates PM2.5.',
  actions: [
    {
      time: 'Morning',
      action: 'Keep windows closed during inversion.',
      reason: 'PM2.5 is elevated.',
      impact: 'Reduces indoor haze.',
      difficulty: 'Easy',
      estimatedBenefit: 'Cleaner indoor air',
      whatNext: 'Ventilate at 2 PM',
    },
  ],
  indoor_guidance: ['Run kitchen exhaust fan'],
  commute_guidance: ['Take Metro transit'],
  family_guidance: ['Avoid morning roadside waits'],
  sustainability_tip: 'Combine errands into one trip.',
  safety_note: 'Consult your physician for respiratory symptoms.',
  generatedBy: 'rules-fallback',
  generatedAt: new Date().toISOString(),
};

// Mock fetch API globally
const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
  if (url.includes('/environmental-data')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(sampleContext),
    });
  }
  if (url.includes('/ai/daily-plan')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(samplePlan),
    });
  }
  if (url.includes('/ai/chat')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          reply: 'Avoid runs near traffic; `<script>alert("xss")</script>` should remain inert text.',
          generatedBy: 'rules-fallback',
          contextUsed: {
            location: 'Hyderabad',
            aqi: 165,
            category: 'Poor',
            lifestyle: 'Student',
          },
        }),
    });
  }
  if (url.includes('/ai/comparator')) {
    const body = init?.body ? (JSON.parse(String(init.body)) as { optionA: string; optionB: string }) : { optionA: 'Car', optionB: 'Metro' };
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          optionA: {
            mode: body.optionA,
            title: body.optionA,
            convenience: 'High convenience',
            relativeEmission: 'High',
            emissionScore: 85,
            costIndication: '₹₹',
            environmentalBenefit: 'Baseline',
            practicality: 'Door to door',
          },
          optionB: {
            mode: body.optionB,
            title: body.optionB,
            convenience: 'Good reliability',
            relativeEmission: 'Very Low',
            emissionScore: 15,
            costIndication: '₹',
            environmentalBenefit: 'Cuts street emissions',
            practicality: 'Fast corridor',
          },
          recommendation: `Choose ${body.optionB} today.`,
          whyItMatters: 'Lowers urban PM2.5.',
          assumptions: '12km commute.',
          generatedBy: 'rules-fallback',
        }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: 'ok' }),
  });
});

globalThis.fetch = mockFetch as unknown as typeof fetch;

describe('AirWise AI Frontend Application Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
  });

  it('renders landing page with headline, call to actions, and live snapshot', async () => {
    render(<App />);

    expect(await screen.findByText(/Know Your Air\./i)).toBeInTheDocument();
    expect(await screen.findByText(/Protect Your Day\./i)).toBeInTheDocument();
    expect(screen.getByText(/Check My Air/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore How It Works/i)).toBeInTheDocument();
    expect(await screen.findByText(/Live Conditions in Hyderabad/i)).toBeInTheDocument();
  });

  it('renders navigation bar with AirWise AI brand', async () => {
    render(<App />);
    expect(await screen.findByText(/Live Conditions in Hyderabad/i)).toBeInTheDocument();
    expect(screen.getAllByText(/AirWise AI/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Breathe smarter\. Live cleaner\./i)[0]).toBeInTheDocument();
  });

  it('opens and closes the profile setup modal via keyboard Escape', async () => {
    render(<App />);
    await screen.findByText(/Live Conditions in Hyderabad/i);

    const profileTrigger = screen.getByRole('button', { name: /Hyderabad/i });
    fireEvent.click(profileTrigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Location & Lifestyle Setup/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('recovers gracefully if localStorage contains invalid location data', async () => {
    localStorage.setItem('airwise_user_profile', JSON.stringify({ location: { name: '' } }));
    render(<App />);
    expect(await screen.findByText(/Live Conditions in Hyderabad/i)).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/environmental-data?lat=17.385&lon=78.4867'));
  });

  it('generates AI daily plan and shows alert banner with retry on failure', async () => {
    const onPlanGenerated = vi.fn();
    mockFetch.mockRejectedValueOnce(new Error('Network offline'));

    render(
      <AIDailyPlanPage
        context={sampleContext}
        profile={sampleProfile}
        plan={null}
        onPlanGenerated={onPlanGenerated}
      />
    );

    const generateBtn = screen.getByRole('button', { name: /Generate My AI Action Plan/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/Network offline/i);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Generate My AI Action Plan/i }));
    });

    expect(onPlanGenerated).toHaveBeenCalledWith(expect.objectContaining({ summary: samplePlan.summary }));
    expect(screen.getByRole('button', { name: /Generate My AI Action Plan/i })).not.toBeDisabled();
  });

  it('renders AssistantPage replies safely without injecting raw HTML script tags', async () => {
    const { container } = render(<AssistantPage context={sampleContext} profile={sampleProfile} />);

    const input = screen.getByPlaceholderText(/Ask AirWise Assistant about air quality in Hyderabad/i);
    fireEvent.change(input, { target: { value: 'Can I jog outside?' } });
    fireEvent.submit(input.closest('form')!);

    expect(await screen.findByText(/should remain inert text/i)).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
  });

  it('toggles IndoorAirPage checklist aria-checked state and updates count', () => {
    render(<IndoorAirPage context={sampleContext} profile={sampleProfile} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    const first = checkboxes[0];
    const initialChecked = first.getAttribute('aria-checked') === 'true';

    fireEvent.click(first);
    expect(first.getAttribute('aria-checked')).toBe(String(!initialChecked));
  });

  it('switches ComparatorPage presets and renders updated comparison', async () => {
    render(<ComparatorPage context={sampleContext} profile={sampleProfile} />);

    expect(await screen.findByText(/Choose Electrified Public Transit/i)).toBeInTheDocument();

    const carVsCyclingBtn = screen.getByRole('button', { name: /Car vs Cycling/i });
    fireEvent.click(carVsCyclingBtn);

    expect(carVsCyclingBtn).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByText(/Choose Cycling for Urban Commute/i)).toBeInTheDocument();
  });
});
