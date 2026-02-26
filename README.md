# UK Weather API

Simple, affordable weather data API for UK developers. A drop-in alternative to Met Office DataPoint.

## Why This Exists

The Met Office is retiring DataPoint API. This provides a simple replacement focused on UK weather data.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally

```bash
npm start
# or with auto-reload:
npm run dev
```

### 3. Test the API

```bash
# Health check
curl http://localhost:3000/

# Get supported cities
curl http://localhost:3000/weather/cities

# Get current weather (requires API key)
curl "http://localhost:3000/weather/current?city=london&api_key=YOUR_KEY"

# Get 7-day forecast
curl "http://localhost:3000/weather/forecast?city=manchester&api_key=YOUR_KEY"
```

## Deployment

### Option 1: One-Click Deploy to Render (Recommended)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/clawpinchybot/uk-weather-api)

Click the button above → Sign in with GitHub → Set ADMIN_KEY → Deploy.

Manual steps (if needed):
1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect your repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `ADMIN_KEY=your-secret-key`

### Option 2: Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway variables set ADMIN_KEY=your-secret-key
```

### Option 3: Vercel (Serverless)

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [{ "src": "src/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/index.js" }]
}
```

Then: `vercel deploy`

### Option 4: Fly.io

```bash
fly launch
fly secrets set ADMIN_KEY=your-secret-key
fly deploy
```

## API Reference

### Authentication

Include your API key as query parameter or header:

```bash
# Query parameter
curl "https://your-api.com/weather/current?city=london&api_key=ukw_xxx"

# Header
curl -H "X-API-Key: ukw_xxx" "https://your-api.com/weather/current?city=london"
```

### Endpoints

#### GET /weather/current

Get current weather for a city or coordinates.

**Parameters:**
- `city` (string) - UK city name (london, manchester, etc.)
- `lat` (number) - Latitude (alternative to city)
- `lon` (number) - Longitude (alternative to city)

**Example Response:**
```json
{
  "location": "london",
  "current": {
    "temperature": 12.5,
    "humidity": 78,
    "weather_code": 3,
    "wind_speed": 15.2,
    "wind_direction": 220
  },
  "units": {
    "temperature": "°C",
    "wind_speed": "km/h"
  },
  "rate_limit": { "remaining": 99 }
}
```

#### GET /weather/forecast

Get 7-day forecast for a city or coordinates.

**Parameters:**
- `city` (string) - UK city name
- `lat` (number) - Latitude
- `lon` (number) - Longitude  
- `days` (number) - Number of days (1-7, default 7)

#### GET /weather/cities

List all supported cities (no auth required).

### Admin Endpoints

Manage API keys with admin key.

#### POST /admin/keys

Create new API key.

```bash
curl -X POST https://your-api.com/admin/keys \
  -H "Content-Type: application/json" \
  -d '{"admin_key":"YOUR_ADMIN_KEY","name":"Customer Name","email":"customer@email.com"}'
```

#### GET /admin/keys

List all API keys.

#### DELETE /admin/keys/:key

Revoke an API key.

## Weather Codes

WMO weather codes used:

| Code | Description |
|------|-------------|
| 0 | Clear sky |
| 1-2 | Mainly clear / partly cloudy |
| 3 | Overcast |
| 45 | Foggy |
| 51-55 | Drizzle |
| 61-65 | Rain |
| 71-75 | Snow |
| 80-82 | Rain showers |
| 95 | Thunderstorm |

## Data Source

Weather data from [Open-Meteo](https://open-meteo.com/) - free, no API key required.

## Costs

Running this API:
- **Hosting**: Free tier (Render, Railway, Fly.io)
- **Data**: Free (Open-Meteo)
- **Total**: £0/month

Revenue potential:
- Pro plan @ £9/mo = break even at 0 customers
- 10 Pro customers = £90/mo
- 100 Pro customers = £900/mo

## Next Steps for Production

1. **Add database** - Replace in-memory API key store with PostgreSQL/Redis
2. **Add Stripe** - Payment integration for paid plans
3. **Add monitoring** - Logging, error tracking, uptime monitoring
4. **Add more cities** - Expand UK city coverage
5. **Add alerts** - Webhook notifications for weather changes

## License

MIT

---

Built by [Sterling](https://github.com/sterling) - Passive Income Agent
