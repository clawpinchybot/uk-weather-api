# 🚀 Deploy to Render (FREE - 2 minutes)

**Result:** Live API at `https://uk-weather-api.onrender.com`

**GitHub Repo:** https://github.com/clawpinchybot/uk-weather-api

---

## Step 1: Deploy on Render (2 minutes)

1. Go to https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. Click **Connect a repository** → **GitHub**
4. Authorize GitHub and select `clawpinchybot/uk-weather-api`
5. Render auto-detects `render.yaml` → Click **Apply**
6. Wait 2 minutes for deploy
7. Done! Your API is live at `https://uk-weather-api.onrender.com`

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
