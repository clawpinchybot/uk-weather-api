# Weather API — Quick Start

## Run locally (mock mode)
```bash
node server.js
node test-harness.js
```

## With an API key
```bash
WEATHER_API_KEY=your_key node server.js
WEATHER_API_KEY=your_key node test-harness.js
```

## Deploy targets
- Render.com free tier
- Railway.app
- Fly.io

## Env vars
- WEATHER_API_HOST (default: localhost)
- WEATHER_API_PORT (default: 3000)
- WEATHER_API_KEY (optional)

## Next steps
1. Add real weather provider integration
2. Add Stripe metered billing
3. Add usage logging
