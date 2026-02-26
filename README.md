# UK Weather API

Simple weather API for UK developers. Built as an alternative to the retiring Met Office DataPoint API.

## Features

- Current weather for 15 UK cities
- 7-day forecast
- Open-Meteo data source (free, reliable)
- 15-minute caching
- Rate limiting (100 req/hour free, 1,000 req/hour pro)
- Simple API key authentication

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm start

# API will be available at http://localhost:3000
```

## Endpoints

### GET /current

Get current weather for a UK city.

**Parameters:**
- `city` (required) - UK city name (london, manchester, birmingham, etc.)
- `key` (optional) - API key (defaults to demo key)

**Example:**
```bash
curl "http://localhost:3000/current?city=london&key=demo"
```

### GET /forecast

Get 7-day forecast for a UK city.

**Parameters:**
- `city` (required) - UK city name
- `key` (optional) - API key

**Example:**
```bash
curl "http://localhost:3000/forecast?city=manchester&key=demo"
```

### GET /health

Health check endpoint.

## Supported Cities

- london
- manchester
- birmingham
- edinburgh
- bristol
- leeds
- liverpool
- newcastle
- sheffield
- cardiff
- glasgow
- belfast
- nottingham
- southampton
- brighton

## Deployment

### Render.com (Recommended - Free Tier)

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables:
   - `PORT` (auto-set by Render)

### Railway (Alternative)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`

### Environment Variables

- `PORT` - Server port (default: 3000)

## Pricing Tiers

| Tier | Price | Requests/Hour | Locations |
|------|-------|---------------|-----------|
| Free | £0 | 100 | 15 UK cities |
| Pro | £9/mo | 1,000 | Any UK location |
| Business | £49/mo | Unlimited | Worldwide |

## License

MIT
