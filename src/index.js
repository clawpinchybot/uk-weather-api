/**
 * UK Weather API - Simple Met Office DataPoint Replacement
 * 
 * Uses Open-Meteo (free, no API key required) as data source
 * Adds caching, rate limiting, and simple API key auth
 */

const express = require('express');
const NodeCache = require('node-cache');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache weather data for 15 minutes (reasonable for weather updates)
const cache = new NodeCache({ stdTTL: 900, checkperiod: 60 });

// Simple in-memory API key store (replace with database in production)
const API_KEYS = new Map();
const RATE_LIMITS = new Map(); // apiKey -> { count, resetTime }

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting: 100 requests per hour per API key
const RATE_LIMIT_PER_HOUR = 100;
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour

function checkRateLimit(apiKey) {
  const now = Date.now();
  const limit = RATE_LIMITS.get(apiKey);
  
  if (!limit || now > limit.resetTime) {
    RATE_LIMITS.set(apiKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_PER_HOUR - 1 };
  }
  
  if (limit.count >= RATE_LIMIT_PER_HOUR) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((limit.resetTime - now) / 1000) };
  }
  
  limit.count++;
  return { allowed: true, remaining: RATE_LIMIT_PER_HOUR - limit.count };
}

// API Key authentication middleware
function authenticate(req, res, next) {
  const apiKey = req.query.api_key || req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required', 
      message: 'Include api_key query parameter or X-API-Key header' 
    });
  }
  
  const keyData = API_KEYS.get(apiKey);
  if (!keyData) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  const rateCheck = checkRateLimit(apiKey);
  if (!rateCheck.allowed) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      resetIn: rateCheck.resetIn 
    });
  }
  
  req.apiKey = apiKey;
  req.rateLimit = rateCheck;
  next();
}

// Fetch weather from Open-Meteo (free, no API key)
async function fetchWeatherData(latitude, longitude) {
  const cacheKey = `${latitude},${longitude}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Europe/London&forecast_days=7`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
  
  const data = await response.json();
  cache.set(cacheKey, data);
  return data;
}

// UK city coordinates (popular locations)
const UK_CITIES = {
  'london': { lat: 51.5074, lon: -0.1278 },
  'manchester': { lat: 53.4808, lon: -2.2426 },
  'birmingham': { lat: 52.4862, lon: -1.8904 },
  'edinburgh': { lat: 55.9533, lon: -3.1883 },
  'bristol': { lat: 51.4545, lon: -2.5879 },
  'leeds': { lat: 53.8008, lon: -1.5491 },
  'glasgow': { lat: 55.8642, lon: -4.2518 },
  'liverpool': { lat: 53.4084, lon: -2.9916 },
  'newcastle': { lat: 54.9783, lon: -1.6178 },
  'sheffield': { lat: 53.3811, lon: -1.4701 },
  'cardiff': { lat: 51.4816, lon: -3.1791 },
  'belfast': { lat: 54.5973, lon: -5.9301 },
  'nottingham': { lat: 52.9548, lon: -1.1581 },
  'southampton': { lat: 50.9097, lon: -1.4044 },
  'brighton': { lat: 50.8225, lon: -0.1372 }
};

// === PUBLIC ROUTES ===

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'UK Weather API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      current: '/weather/current?city={city}',
      forecast: '/weather/forecast?city={city}&days={1-7}',
      cities: '/weather/cities'
    },
    docs: 'https://github.com/sterling/uk-weather-api'
  });
});

// List supported cities
app.get('/weather/cities', (req, res) => {
  res.json({ cities: Object.keys(UK_CITIES) });
});

// === AUTHENTICATED ROUTES ===

// Current weather
app.get('/weather/current', authenticate, async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    
    let latitude, longitude;
    
    if (city) {
      const cityData = UK_CITIES[city.toLowerCase()];
      if (!cityData) {
        return res.status(400).json({ 
          error: 'City not supported',
          hint: 'Use /weather/cities to see available cities, or provide lat/lon'
        });
      }
      latitude = cityData.lat;
      longitude = cityData.lon;
    } else if (lat && lon) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    } else {
      return res.status(400).json({ error: 'Provide city or lat/lon' });
    }
    
    const data = await fetchWeatherData(latitude, longitude);
    
    res.json({
      location: city || `${latitude}, ${longitude}`,
      current: {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        weather_code: data.current.weather_code,
        wind_speed: data.current.wind_speed_10m,
        wind_direction: data.current.wind_direction_10m
      },
      units: data.current_units,
      rate_limit: { remaining: req.rateLimit.remaining }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7-day forecast
app.get('/weather/forecast', authenticate, async (req, res) => {
  try {
    const { city, lat, lon, days = 7 } = req.query;
    
    let latitude, longitude;
    
    if (city) {
      const cityData = UK_CITIES[city.toLowerCase()];
      if (!cityData) {
        return res.status(400).json({ 
          error: 'City not supported',
          hint: 'Use /weather/cities to see available cities, or provide lat/lon'
        });
      }
      latitude = cityData.lat;
      longitude = cityData.lon;
    } else if (lat && lon) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    } else {
      return res.status(400).json({ error: 'Provide city or lat/lon' });
    }
    
    const data = await fetchWeatherData(latitude, longitude);
    const numDays = Math.min(parseInt(days), 7);
    
    res.json({
      location: city || `${latitude}, ${longitude}`,
      daily: {
        dates: data.daily.time.slice(0, numDays),
        weather_codes: data.daily.weather_code.slice(0, numDays),
        temp_max: data.daily.temperature_2m_max.slice(0, numDays),
        temp_min: data.daily.temperature_2m_min.slice(0, numDays),
        sunrise: data.daily.sunrise.slice(0, numDays),
        sunset: data.daily.sunset.slice(0, numDays)
      },
      hourly_today: {
        time: data.hourly.time.slice(0, 24),
        temperature: data.hourly.temperature_2m.slice(0, 24),
        precipitation_probability: data.hourly.precipitation_probability.slice(0, 24)
      },
      units: data.daily_units,
      rate_limit: { remaining: req.rateLimit.remaining }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ADMIN ROUTES (for managing API keys) ===

const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me-in-production';

app.post('/admin/keys', (req, res) => {
  const { admin_key, name, email } = req.body;
  
  if (admin_key !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  
  const apiKey = `ukw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  API_KEYS.set(apiKey, { 
    name, 
    email, 
    created: new Date().toISOString(),
    plan: 'free'
  });
  
  res.json({ api_key: apiKey, message: 'API key created' });
});

app.get('/admin/keys', (req, res) => {
  const { admin_key } = req.query;
  
  if (admin_key !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  
  const keys = Array.from(API_KEYS.entries()).map(([key, data]) => ({
    key: key.substr(0, 10) + '...',
    ...data
  }));
  
  res.json({ keys });
});

app.delete('/admin/keys/:key', (req, res) => {
  const { admin_key } = req.body;
  
  if (admin_key !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  
  const deleted = API_KEYS.delete(req.params.key);
  res.json({ deleted });
});

// Start server
app.listen(PORT, () => {
  console.log(`UK Weather API running on port ${PORT}`);
  console.log(`Endpoints: http://localhost:${PORT}/`);
});
