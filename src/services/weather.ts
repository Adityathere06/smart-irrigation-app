// ═══════════════════════════════════════════════════════════════════
//  Weather Service — fetches real data from OpenWeatherMap (free plan)
//
//  Exports:
//    geocodeCity(city)   → { lat, lon, displayName }
//    getCurrentWeather(lat, lon) → raw API + forecast combined
//    mapToWeatherUI(raw) → shape that the home screen expects
//
//  The API key is read from the EXPO_PUBLIC_OPENWEATHER_API_KEY
//  environment variable. It is NEVER hardcoded or logged.
// ═══════════════════════════════════════════════════════════════════

// ── Configuration ──────────────────────────────────────────────────
// Change these to switch city. Fallback coords are for Nagpur, India.
export const DEFAULT_CITY = 'Nagpur,IN';
export const FALLBACK_LAT = 21.1458;
export const FALLBACK_LON = 79.0882;
export const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Read the API key from env (Expo injects EXPO_PUBLIC_ vars at build time)
const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? '';

// ── Types ──────────────────────────────────────────────────────────

/** What the UI needs to display */
export interface WeatherUIData {
  temperature: number;      // °C, rounded
  feelsLike: number;        // °C, rounded
  humidity: number;         // %
  windSpeed: number;        // km/h, rounded
  condition: string;        // e.g. "Clouds", "Rain"
  iconCode: string;         // OWM icon code like "04d"
  chanceOfRain: number;     // 0–100 %, rounded
  location: string;         // e.g. "Nagpur, Maharashtra"
  sunrise: string;          // formatted local time e.g. "6:34 AM"
  sunset: string;           // formatted local time e.g. "5:58 PM"
  lastUpdated: string;      // formatted timestamp
}

/** Geocode result */
export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;      // "City, State" or just "City"
}

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Format a UNIX timestamp (seconds) to a readable time string
 * using the timezone offset (seconds) from OWM, so it shows
 * the correct local time for the city (not the device).
 */
function formatTime(unixSec: number, tzOffsetSec: number): string {
  // Create date at UTC, then shift by the city's offset
  const dateMs = (unixSec + tzOffsetSec) * 1000;
  const d = new Date(dateMs);

  let hours = d.getUTCHours();
  const mins = d.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // convert 0 → 12

  const mm = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hours}:${mm} ${ampm}`;
}

/** Format a Date to "20 Oct 2026, 12:00 PM" style string */
function formatDateTime(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const day = date.getDate();
  const mon = months[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const mins = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  const mm = mins < 10 ? `0${mins}` : `${mins}`;
  return `${day} ${mon} ${year}, ${hours}:${mm} ${ampm}`;
}

// ── API functions ──────────────────────────────────────────────────

/**
 * 1. Geocode a city name → lat/lon.
 *    Falls back to hardcoded Nagpur coords if the API call fails.
 */
export async function geocodeCity(city: string = DEFAULT_CITY): Promise<GeoResult> {
  if (!API_KEY) {
    throw new Error('Weather API key is not set.');
  }

  try {
    const url =
      `https://api.openweathermap.org/geo/1.0/direct` +
      `?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;

    const res = await fetch(url);

    if (res.status === 401) {
      throw new Error('Invalid API key. Check your .env file.');
    }
    if (!res.ok) {
      throw new Error(`Geocoding failed (HTTP ${res.status}).`);
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      throw new Error(`City "${city}" not found.`);
    }

    const place = data[0];
    const displayName = place.state
      ? `${place.name}, ${place.state}`
      : place.name;

    return { lat: place.lat, lon: place.lon, displayName };
  } catch (err) {
    // If it's our own error (bad key, city not found) — rethrow
    if (err instanceof Error && (
      err.message.includes('API key') ||
      err.message.includes('not found')
    )) {
      throw err;
    }
    // Network error → use fallback coords
    console.warn('Geocoding failed, using fallback coords.');
    return {
      lat: FALLBACK_LAT,
      lon: FALLBACK_LON,
      displayName: 'Nagpur, Maharashtra',
    };
  }
}

/**
 * 2. Fetch current weather + short forecast for given coords.
 *    Returns the raw JSON from both endpoints.
 */
export async function getWeather(lat: number, lon: number) {
  if (!API_KEY) {
    throw new Error('Weather API key is not set.');
  }

  const baseParams = `lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  // Fetch current weather and forecast in parallel
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?${baseParams}`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${baseParams}&cnt=8`),
  ]);

  // Check for auth errors first
  if (currentRes.status === 401 || forecastRes.status === 401) {
    throw new Error('Invalid API key. Check your .env file.');
  }
  if (!currentRes.ok) {
    throw new Error(`Weather request failed (HTTP ${currentRes.status}).`);
  }

  const current = await currentRes.json();

  // Forecast is optional — if it fails we just won't have rain probability
  let forecast = null;
  if (forecastRes.ok) {
    forecast = await forecastRes.json();
  }

  return { current, forecast };
}

/**
 * 3. Map raw API data → the shape the home screen UI expects.
 */
export function mapToWeatherUI(
  raw: { current: any; forecast: any },
  displayName: string,
): WeatherUIData {
  const c = raw.current;
  const tz = c.timezone ?? 19800; // default IST offset in seconds

  // Temperature & basics
  const temperature = Math.round(c.main.temp);
  const feelsLike = Math.round(c.main.feels_like);
  const humidity = Math.round(c.main.humidity);

  // Wind: API gives m/s, we need km/h → multiply by 3.6
  const windSpeed = Math.round(c.wind.speed * 3.6);

  // Condition text + icon code
  const weatherInfo = c.weather?.[0] ?? {};
  const condition = weatherInfo.main ?? 'Unknown';
  const iconCode = weatherInfo.icon ?? '01d';

  // Rain probability: highest "pop" across forecast entries × 100
  let chanceOfRain = 0;
  if (raw.forecast?.list) {
    const maxPop = raw.forecast.list.reduce(
      (max: number, item: any) => Math.max(max, item.pop ?? 0),
      0,
    );
    chanceOfRain = Math.round(maxPop * 100);
  }

  // Sunrise & sunset using the timezone offset from the API
  const sunrise = formatTime(c.sys.sunrise, tz);
  const sunset = formatTime(c.sys.sunset, tz);

  // "Last updated" uses device local time
  const lastUpdated = formatDateTime(new Date());

  return {
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    condition,
    iconCode,
    chanceOfRain,
    location: displayName,
    sunrise,
    sunset,
    lastUpdated,
  };
}

/**
 * Pick an emoji icon based on OWM icon code.
 * Keeps it simple — no image downloads needed.
 */
export function getWeatherEmoji(iconCode: string): string {
  // OWM icon codes: https://openweathermap.org/weather-conditions
  const map: Record<string, string> = {
    '01d': '☀️',   '01n': '🌙',   // clear
    '02d': '⛅',   '02n': '☁️',   // few clouds
    '03d': '☁️',   '03n': '☁️',   // scattered clouds
    '04d': '☁️',   '04n': '☁️',   // broken/overcast
    '09d': '🌧️',  '09n': '🌧️',  // shower rain
    '10d': '🌦️',  '10n': '🌧️',  // rain
    '11d': '⛈️',   '11n': '⛈️',   // thunderstorm
    '13d': '❄️',   '13n': '❄️',   // snow
    '50d': '🌫️',  '50n': '🌫️',  // mist/fog
  };
  return map[iconCode] ?? '🌤️';
}
