const express = require('express');
const NodeCache = require('node-cache');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache for 15 minutes
const cache = new NodeCache({ stdTTL: 900 });

// Rate limiting (simple in-memory)
const rateLimits = new Map();
const RATE_LIMIT_FREE = 100; // requests per hour

// API keys (in production, use database)
const apiKeys = new Map([
  ['demo', { tier: 'free', name: 'Demo Key' }],
  ['sk_test_sterling123', { tier: 'pro', name: 'Test Pro Key' }]
]);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rate limit check
function checkRateLimit(apiKey) {
  const now = Date.now();
  const hourAgo = now - 3600000;
  const key = apiKeys.has(apiKey) ? apiKey : 'anonymous';
  
  if (!rateLimits.has(key)) {
    rateLimits.set(key, []);
  }
  
  const requests = rateLimits.get(key).filter(t => t > hourAgo);
  rateLimits.set(key, requests);
  
  const limit = apiKeys.get(key)?.tier === 'pro' ? 1000 : RATE_LIMIT_FREE;
  
  if (requests.length >= limit) {
    return { allowed: false, remaining: 0, limit };
  }
  
  requests.push(now);
  rateLimits.set(key, requests);
  return { allowed: true, remaining: limit - requests.length, limit };
}

// Fetch from Open-Meteo
async function fetchWeather(lat, lon) {
  const cacheKey = `${lat},${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe/London`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather API error');
  
  const data = await response.json();
  cache.set(cacheKey, data);
  return data;
}

// UK Cities
const UK_CITIES = {
  london: { lat: 51.5074, lon: -0.1278 },
  manchester: { lat: 53.4808, lon: -2.2426 },
  birmingham: { lat: 52.4862, lon: -1.8904 },
  edinburgh: { lat: 55.9533, lon: -3.1883 },
  bristol: { lat: 51.4545, lon: -2.5879 },
  leeds: { lat: 53.8008, lon: -1.5491 },
  liverpool: { lat: 53.4084, lon: -2.9916 },
  newcastle: { lat: 54.9783, lon: -1.6178 },
  sheffield: { lat: 53.3811, lon: -1.4701 },
  cardiff: { lat: 51.4816, lon: -3.1791 },
  glasgow: { lat: 55.8642, lon: -4.2518 },
  belfast: { lat: 54.5973, lon: -5.9301 },
  nottingham: { lat: 52.9548, lon: -1.1581 },
  southampton: { lat: 50.9097, lon: -1.4044 },
  brighton: { lat: 50.8225, lon: -0.1372 }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Current weather
app.get('/current', async (req, res) => {
  const apiKey = req.query.key || req.headers['x-api-key'] || 'demo';
  const city = req.query.city?.toLowerCase();
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  
  // Rate limit check
  const rateCheck = checkRateLimit(apiKey);
  res.set('X-RateLimit-Limit', rateCheck.limit);
  res.set('X-RateLimit-Remaining', rateCheck.remaining);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded', upgrade: 'https://weatherapi.sterling.dev/pricing' });
  }
  
  // Validate API key
  if (!apiKeys.has(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  try {
    let coords;
    
    if (city && UK_CITIES[city]) {
      coords = UK_CITIES[city];
    } else if (!isNaN(lat) && !isNaN(lon)) {
      // Pro feature: custom coordinates
      if (apiKeys.get(apiKey)?.tier !== 'pro') {
        return res.status(403).json({ error: 'Custom coordinates require Pro plan', upgrade: 'https://weatherapi.sterling.dev/pricing' });
      }
      coords = { lat, lon };
    } else {
      return res.status(400).json({ error: 'Provide city or lat/lon', cities: Object.keys(UK_CITIES) });
    }
    
    const data = await fetchWeather(coords.lat, coords.lon);
    
    res.json({
      location: city || `${lat},${lon}`,
      current: {
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        weather_code: data.current.weather_code,
        wind_speed: data.current.wind_speed_10m,
        wind_direction: data.current.wind_direction_10m
      },
      timestamp: data.current.time
    });
  } catch (error) {
    res.status(500).json({ error: 'Weather data unavailable' });
  }
});

// 7-day forecast
app.get('/forecast', async (req, res) => {
  const apiKey = req.query.key || req.headers['x-api-key'] || 'demo';
  const city = req.query.city?.toLowerCase();
  
  const rateCheck = checkRateLimit(apiKey);
  res.set('X-RateLimit-Limit', rateCheck.limit);
  res.set('X-RateLimit-Remaining', rateCheck.remaining);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  if (!apiKeys.has(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  if (!city || !UK_CITIES[city]) {
    return res.status(400).json({ error: 'City required', cities: Object.keys(UK_CITIES) });
  }
  
  try {
    const coords = UK_CITIES[city];
    const data = await fetchWeather(coords.lat, coords.lon);
    
    const forecast = data.daily.time.map((date, i) => ({
      date,
      max_temp: data.daily.temperature_2m_max[i],
      min_temp: data.daily.temperature_2m_min[i],
      weather_code: data.daily.weather_code[i]
    }));
    
    res.json({
      location: city,
      forecast
    });
  } catch (error) {
    res.status(500).json({ error: 'Forecast unavailable' });
  }
});

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Weather API running on port ${PORT}`);
});
