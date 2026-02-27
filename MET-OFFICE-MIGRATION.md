# Met Office DataPoint Migration Guide

**Status:** DataPoint retired December 1, 2025
**Replacement:** UK Weather API (this project)
**Target:** Home Assistant users, developers, IoT projects

---

## Quick Migration for Home Assistant

### Old DataPoint Integration
```yaml
# Old configuration (no longer works)
sensor:
  - platform: metoffice
    api_key: YOUR_DATAPOINT_KEY
    monitored_conditions:
      - temperature
      - weather
      - humidity
```

### New REST Integration
```yaml
# New configuration using UK Weather API
sensor:
  - platform: rest
    name: Weather London
    resource: https://uk-weather-api.onrender.com/current?city=london&key=YOUR_KEY
    json_attributes:
      - temperature
      - condition
      - humidity
      - wind_speed
    value_template: '{{ value_json.temperature }}'
    unit_of_measurement: '°C'
```

---

## API Endpoint Mapping

| DataPoint Endpoint | UK Weather API Equivalent |
|-------------------|--------------------------|
| `/val/wxfcs/all/json/{location}` | `/current?city={city}` |
| `/val/wxfcs/all/json/{location}?res=3hourly` | `/forecast?city={city}` |
| `/val/wxfcs/all/json/{location}?res=daily` | `/forecast?city={city}` |
| `/txt/wxfcs/regionalforecast/json/{region}` | Not supported (use `/current`) |

---

## Parameter Changes

### Location
- **Old:** 3-hourly location ID (e.g., `350562`)
- **New:** City name (e.g., `london`, `manchester`)

### Supported Cities
```
london, manchester, birmingham, edinburgh, bristol, leeds,
liverpool, newcastle, sheffield, cardiff, glasgow, belfast,
nottingham, southampton, brighton
```

### Data Fields

| DataPoint Field | UK Weather API Field |
|----------------|---------------------|
| `D` (wind direction) | `wind_direction` |
| `F` (feels like temp) | `feels_like` |
| `G` (wind gust) | `wind_gust` |
| `H` (humidity) | `humidity` |
| `T` (temperature) | `temperature` |
| `V` (visibility) | `visibility` |
| `W` (weather type) | `condition` |

---

## Example: Python Migration

### Old Code (DataPoint)
```python
import requests

url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/350562"
params = {"key": "YOUR_DATAPOINT_KEY", "res": "3hourly"}
response = requests.get(url, params=params)
data = response.json()
temp = data["SiteRep"]["DV"]["Location"]["Period"][0]["Rep"][0]["T"]
```

### New Code (UK Weather API)
```python
import requests

url = "https://uk-weather-api.onrender.com/current"
params = {"city": "london", "key": "YOUR_API_KEY"}
response = requests.get(url, params=params)
data = response.json()
temp = data["temperature"]
```

---

## Why Use This Instead of Alternatives?

| Feature | UK Weather API | OpenWeatherMap | WeatherAPI.com |
|---------|---------------|----------------|----------------|
| **Free tier** | 100 req/hour | 60 req/min | 1M req/month |
| **UK-focused** | ✅ Yes | ❌ Global | ❌ Global |
| **UK cities** | ✅ 15 pre-configured | ❌ By coordinates | ❌ By coordinates |
| **Simple pricing** | ✅ £9/mo Pro | ❌ Complex tiers | ❌ Complex tiers |
| **DataPoint replacement** | ✅ Built for this | ❌ Generic | ❌ Generic |

---

## Home Assistant Automation Example

```yaml
automation:
  - alias: "Alert when rain expected"
    trigger:
      - platform: state
        entity_id: sensor.weather_london
    condition:
      - condition: template
        value_template: >
          {{ 'rain' in states('sensor.weather_london_condition') | lower }}
    action:
      - service: notify.mobile_app
        data:
          message: "Rain expected! Close your windows."
```

---

## Getting Started

1. **Deploy your own API** (2 minutes)
   ```bash
   git clone https://github.com/clawpinchybot/uk-weather-api
   cd uk-weather-api
   npm install
   npm start
   ```

2. **Or use hosted version** (coming soon)
   - Sign up for API key
   - Point your integrations to `https://uk-weather-api.onrender.com`

3. **Update your Home Assistant config**
   - Replace Met Office integration with REST sensors
   - Test and deploy

---

## Support

- **GitHub Issues:** https://github.com/clawpinchybot/uk-weather-api/issues
- **Home Assistant Community:** [Link to thread]
- **Discord:** #weather-api-support

---

## FAQ

**Q: Is this free?**
A: Yes, 100 requests per hour. Pro tier (£9/month) for higher limits.

**Q: What data source do you use?**
A: Open-Meteo (free, reliable, UK Met Office data where available).

**Q: Can I deploy my own instance?**
A: Yes! One-click deploy to Render, or run locally with `npm start`.

**Q: Will you support my town?**
A: Pro tier supports any UK location via coordinates.

---

*Migrated from Met Office DataPoint? Let us know!*
*Created: 2026-02-27*
