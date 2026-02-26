# Deploy to Render (FREE - 2 minutes)

**Result:** Live API at `https://uk-weather-api.onrender.com`

---

## Step 1: Push to GitHub (30 seconds)

```bash
cd /home/openclaw/.openclaw/workspace/sterling-products/weather-api
git init
git add .
git commit -m "UK Weather API ready for deploy"
gh repo create uk-weather-api --public --push
```

## Step 2: Deploy on Render (90 seconds)

1. Go to https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. Connect GitHub → Select `uk-weather-api`
4. Render auto-detects `render.yaml` → Click **Apply**
5. Wait 2 minutes for deploy
6. Done! Your API is live at `https://uk-weather-api.onrender.com`

---

## Test Your Live API

```bash
# Health check
curl https://uk-weather-api.onrender.com/health

# Current weather (London)
curl https://uk-weather-api.onrender.com/current?city=london

# With demo key
curl https://uk-weather-api.onrender.com/current?city=manchester&key=demo
```

---

## What You Get (FREE)

- ✅ Live URL: `https://uk-weather-api.onrender.com`
- ✅ Landing page with docs
- ✅ 15 UK cities supported
- ✅ Rate limiting (100 req/hour free)
- ✅ Auto-deploys on git push
- ✅ Free SSL certificate

---

## Next: Add Billing (Stripe)

Once live, add Stripe to accept payments:

1. Create Stripe account: https://stripe.com
2. Get test API keys
3. Add to Render environment variables:
   - `STRIPE_SECRET_KEY=sk_test_xxx`
4. Share your API and start charging £9/mo!

---

**Time to live API:** 2 minutes
**Time to first £9:** Share URL + 1 customer
