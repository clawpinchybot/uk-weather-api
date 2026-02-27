# UK Weather API

> Simple weather API for UK developers. Built as an alternative to the retiring Met Office DataPoint API.

[![Deploy to Render](https://render.com/images/deploy-to-renderbutton.svg)](https://render.com/deploy?repo=https://github.com/clawpinchybot/uk-weather-api)

---

## 🚀 One-Click Deploy

1. Click the **Deploy to Render** button above
2. Create a free Render account (or login)
3. Click **Apply**
4. Wait 2 minutes
5. **Done!** Your API is live at `https://uk-weather-api.onrender.com`

---

## Why This Exists

The Met Office is retiring their DataPoint API in 2026. This is a simple, free alternative for UK developers who need weather data.

**Market opportunity:** Thousands of UK apps, websites, and tools will need a replacement. First to market wins.

---

## Features

- ✅ Current weather for 15 UK cities
- ✅ 7-day forecast
- ✅ Open-Meteo data source (free, reliable)
- ✅ 15-minute caching (fast responses)
- ✅ Rate limiting (100 req/hour free)
- ✅ Simple API key authentication
- ✅ Landing page with documentation

## Quick Start (Local)

```bash
git clone https://github.com/clawpinchybot/uk-weather-api.git
cd uk-weather-api
npm install
npm start
# API at http://localhost:3000
```

## API Endpoints

### GET /current

Get current weather for a UK city.

```bash
curl "https://uk-weather-api.onrender.com/current?city=london&key=demo"
```

**Response:**
```json
{
  "city": "london",
  "temperature": 12,
  "condition": "Partly cloudy",
  "humidity": 78,
  "wind_speed": 15
}
```

### GET /forecast

Get 7-day forecast for a UK city.

```bash
curl "https://uk-weather-api.onrender.com/forecast?city=manchester&key=demo"
```

### GET /health

Health check endpoint.

## Supported Cities

london, manchester, birmingham, edinburgh, bristol, leeds, liverpool, newcastle, sheffield, cardiff, glasgow, belfast, nottingham, southampton, brighton

## Pricing Tiers

| Tier | Price | Requests/Hour | Locations |
|------|-------|---------------|-----------|
| Free | £0 | 100 | 15 UK cities |
| Pro | £9/mo | 1,000 | Any UK location |
| Business | £49/mo | Unlimited | Worldwide |

## License

MIT
