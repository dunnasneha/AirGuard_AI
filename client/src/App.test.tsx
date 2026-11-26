import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from './App';

// Mock fetch API globally
const mockFetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('/environmental-data')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
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
});
