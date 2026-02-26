# Weather API - Deployment Checklist

## Pre-Deployment

- [x] Core API built (Express.js)
- [x] Caching implemented (15-min TTL)
- [x] Rate limiting (100 req/hour)
- [x] API key authentication
- [x] Admin key management
- [x] Landing page created
- [x] Documentation written

## Deployment Steps

### Step 1: Choose Platform

Recommended: **Render.com** (free tier, easy setup)

Alternatives:
- Railway.app (free tier)
- Fly.io (free tier)
- Vercel (serverless)

### Step 2: Create Account

1. Go to render.com
2. Sign up with GitHub
3. Verify email

### Step 3: Deploy

1. Click "New +" → "Web Service"
2. Connect GitHub repo (or use public repo)
3. Configure:
   - Name: `uk-weather-api`
   - Region: Frankfurt (closest to UK)
   - Branch: main
   - Root Directory: `sterling-products/weather-api`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add Environment Variable:
   - Key: `ADMIN_KEY`
   - Value: [generate strong random key]
5. Click "Deploy Web Service"

### Step 4: Get URL

Render will provide a URL like:
`https://uk-weather-api.onrender.com`

### Step 5: Create First API Key

```bash
curl -X POST https://uk-weather-api.onrender.com/admin/keys \
  -H "Content-Type: application/json" \
  -d '{"admin_key":"YOUR_ADMIN_KEY","name":"Test User","email":"test@example.com"}'
```

### Step 6: Test

```bash
curl "https://uk-weather-api.onrender.com/weather/current?city=london&api_key=YOUR_API_KEY"
```

## Custom Domain (Optional)

1. In Render dashboard, go to Settings → Custom Domain
2. Add your domain (e.g., `api.ukweather.xyz`)
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

## Payment Integration (Stripe)

When ready to accept payments:

1. Create Stripe account
2. Get API keys from dashboard
3. Add to environment:
   - `STRIPE_SECRET_KEY=sk_xxx`
   - `STRIPE_WEBHOOK_SECRET=whsec_xxx`
4. Create checkout session endpoint
5. Handle webhook for subscription events

## Monitoring

Add these free services:
- **Uptime Robot** - Ping every 5 min, alert on downtime
- **Sentry** - Error tracking
- **LogRail/Papertrail** - Log aggregation (Render includes basic logs)

## Costs

| Item | Cost |
|------|------|
| Hosting (Render free) | £0 |
| Domain (.xyz) | ~£1/year |
| Stripe fees | 1.4% + 20p per transaction |
| **Total** | ~£1/year + payment fees |

## Revenue Projections

| Customers | Plan | Monthly Revenue |
|-----------|------|-----------------|
| 10 | Pro @ £9 | £90 |
| 50 | Pro @ £9 | £450 |
| 100 | Mixed | £750 |
| 500 | Mixed | £3,500 |

---

*Ready to deploy. Just needs Lewis to create account and provide domain.*
