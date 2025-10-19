# 🌦️ NOAA Weather API Integration

**Date:** October 18, 2025  
**Status:** ✅ Credentials Configured

---

## 🔑 API Credentials

**Email:** `usneodcp@gmail.com`  
**Token:** `CcBtkVXKkMcRrbQfTrldWsEnLLBsBJHg`

**API Documentation:** https://www.weather.gov/documentation/services-web-api

---

## ✅ Environment Variables Set

Both repositories now have `.env` files with:

```env
VITE_WEATHER_API_KEY=CcBtkVXKkMcRrbQfTrldWsEnLLBsBJHg
VITE_WEATHER_API_EMAIL=usneodcp@gmail.com
```

**Locations:**
- `/Users/cp5337/Developer/ctas7-command-center/.env`
- `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-gis-cesium-1/.env`

---

## 🌐 NOAA Weather API Endpoints

### 1. Points API (Get Forecast Grid)
```typescript
// Get forecast grid for a location
const lat = 39.7456;
const lon = -97.0892;
const response = await fetch(
  `https://api.weather.gov/points/${lat},${lon}`,
  {
    headers: {
      'User-Agent': '(usneodcp@gmail.com)',
      'Accept': 'application/geo+json'
    }
  }
);
```

### 2. Forecast API
```typescript
// Get 7-day forecast
const forecastUrl = pointData.properties.forecast;
const forecast = await fetch(forecastUrl, {
  headers: {
    'User-Agent': '(usneodcp@gmail.com)',
    'Accept': 'application/geo+json'
  }
});
```

### 3. Hourly Forecast
```typescript
// Get hourly forecast
const hourlyUrl = pointData.properties.forecastHourly;
const hourly = await fetch(hourlyUrl, {
  headers: {
    'User-Agent': '(usneodcp@gmail.com)',
    'Accept': 'application/geo+json'
  }
});
```

### 4. Alerts API
```typescript
// Get active weather alerts
const alerts = await fetch(
  'https://api.weather.gov/alerts/active?area=US',
  {
    headers: {
      'User-Agent': '(usneodcp@gmail.com)',
      'Accept': 'application/geo+json'
    }
  }
);
```

---

## 🎯 Integration with Ground Stations

### Use Case: Optical Link Quality
Weather affects optical/laser communication links between ground stations and satellites.

**Key Metrics:**
- **Cloud Cover** - Blocks optical links
- **Precipitation** - Degrades signal quality
- **Visibility** - Affects link reliability
- **Wind Speed** - Can affect antenna pointing

### Implementation in `weatherService.ts`

```typescript
import { supabase } from '@/lib/supabase';

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_API_EMAIL = import.meta.env.VITE_WEATHER_API_EMAIL;

interface WeatherData {
  temperature: number;
  cloudCover: number;
  precipitation: number;
  visibility: number;
  windSpeed: number;
  conditions: string;
}

/**
 * Fetch current weather for a ground station
 */
export async function getGroundStationWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  try {
    // Step 1: Get forecast grid
    const pointResponse = await fetch(
      `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
      {
        headers: {
          'User-Agent': `(${WEATHER_API_EMAIL})`,
          'Accept': 'application/geo+json'
        }
      }
    );
    
    if (!pointResponse.ok) {
      throw new Error(`NOAA API error: ${pointResponse.status}`);
    }
    
    const pointData = await pointResponse.json();
    
    // Step 2: Get current conditions from forecast
    const forecastResponse = await fetch(
      pointData.properties.forecastHourly,
      {
        headers: {
          'User-Agent': `(${WEATHER_API_EMAIL})`,
          'Accept': 'application/geo+json'
        }
      }
    );
    
    const forecastData = await forecastResponse.json();
    const current = forecastData.properties.periods[0];
    
    // Step 3: Parse weather data
    return {
      temperature: current.temperature,
      cloudCover: parseCloudCover(current.shortForecast),
      precipitation: current.probabilityOfPrecipitation?.value || 0,
      visibility: 10, // NOAA doesn't provide visibility in forecast
      windSpeed: parseWindSpeed(current.windSpeed),
      conditions: current.shortForecast
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    // Return default clear weather
    return {
      temperature: 20,
      cloudCover: 0,
      precipitation: 0,
      visibility: 10,
      windSpeed: 5,
      conditions: 'Clear'
    };
  }
}

/**
 * Calculate optical link quality based on weather
 * Returns 0.0 (blocked) to 1.0 (perfect)
 */
export function calculateLinkQuality(weather: WeatherData): number {
  let quality = 1.0;
  
  // Cloud cover penalty (0-100%)
  quality *= (1 - weather.cloudCover / 100);
  
  // Precipitation penalty
  if (weather.precipitation > 50) {
    quality *= 0.3; // Heavy rain/snow
  } else if (weather.precipitation > 20) {
    quality *= 0.6; // Moderate precipitation
  } else if (weather.precipitation > 5) {
    quality *= 0.9; // Light precipitation
  }
  
  // Visibility penalty
  if (weather.visibility < 5) {
    quality *= 0.5; // Poor visibility
  } else if (weather.visibility < 8) {
    quality *= 0.8; // Moderate visibility
  }
  
  return Math.max(0, Math.min(1, quality));
}

/**
 * Update weather data for all ground stations
 */
export async function updateAllStationWeather() {
  const { data: stations } = await supabase
    .from('ground_nodes')
    .select('id, latitude, longitude');
  
  if (!stations) return;
  
  for (const station of stations) {
    const weather = await getGroundStationWeather(
      station.latitude,
      station.longitude
    );
    
    const linkQuality = calculateLinkQuality(weather);
    
    // Update station weather score
    await supabase
      .from('ground_nodes')
      .update({ weather_score: linkQuality })
      .eq('id', station.id);
    
    // Store historical weather data
    await supabase
      .from('weather_data')
      .insert({
        ground_node_id: station.id,
        temperature_c: weather.temperature,
        cloud_cover_percent: weather.cloudCover,
        precipitation_mm: weather.precipitation,
        visibility_km: weather.visibility,
        wind_speed_kmh: weather.windSpeed,
        conditions: weather.conditions,
        link_quality_score: linkQuality
      });
  }
}

// Helper functions
function parseCloudCover(forecast: string): number {
  const lower = forecast.toLowerCase();
  if (lower.includes('clear') || lower.includes('sunny')) return 0;
  if (lower.includes('partly cloudy')) return 30;
  if (lower.includes('mostly cloudy')) return 70;
  if (lower.includes('cloudy') || lower.includes('overcast')) return 100;
  return 50; // Default
}

function parseWindSpeed(windSpeed: string): number {
  const match = windSpeed.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}
```

---

## 🔄 Automated Weather Updates

### Cron Job Setup

```typescript
// Run every 15 minutes
setInterval(async () => {
  console.log('Updating weather data for all stations...');
  await updateAllStationWeather();
  console.log('Weather update complete');
}, 15 * 60 * 1000);
```

### WebSocket Integration

```typescript
// Broadcast weather updates to connected clients
wss.on('connection', (ws) => {
  // Send initial weather data
  sendWeatherUpdate(ws);
  
  // Subscribe to weather changes
  const weatherInterval = setInterval(() => {
    sendWeatherUpdate(ws);
  }, 60000); // Every minute
  
  ws.on('close', () => {
    clearInterval(weatherInterval);
  });
});
```

---

## 📊 Visualization

### Weather Overlay on Cesium Globe

```typescript
// Color ground stations by weather quality
const getWeatherColor = (weatherScore: number) => {
  if (weatherScore > 0.8) return Cesium.Color.GREEN;      // Clear
  if (weatherScore > 0.5) return Cesium.Color.YELLOW;     // Partly cloudy
  if (weatherScore > 0.2) return Cesium.Color.ORANGE;     // Cloudy
  return Cesium.Color.RED;                                 // Poor conditions
};

// Update entity colors
viewer.entities.values
  .filter(e => e.properties?.type === 'ground_station')
  .forEach(entity => {
    const weatherScore = entity.properties.weather_score;
    entity.point.color = getWeatherColor(weatherScore);
  });
```

### Weather Dashboard

```typescript
// Display weather stats
<Card>
  <CardHeader>
    <CardTitle>Weather Conditions</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div>Clear Stations: {clearCount}</div>
      <div>Degraded Stations: {degradedCount}</div>
      <div>Blocked Stations: {blockedCount}</div>
      <div>Avg Link Quality: {avgQuality.toFixed(2)}</div>
    </div>
  </CardContent>
</Card>
```

---

## 🚨 Weather Alerts Integration

### Monitor Severe Weather

```typescript
/**
 * Check for weather alerts affecting ground stations
 */
export async function checkWeatherAlerts() {
  const response = await fetch(
    'https://api.weather.gov/alerts/active?area=US',
    {
      headers: {
        'User-Agent': `(${WEATHER_API_EMAIL})`,
        'Accept': 'application/geo+json'
      }
    }
  );
  
  const data = await response.json();
  const alerts = data.features;
  
  // Check if any stations are in alert zones
  const { data: stations } = await supabase
    .from('ground_nodes')
    .select('*');
  
  for (const alert of alerts) {
    const affectedStations = stations?.filter(station =>
      isStationInAlertZone(station, alert.geometry)
    );
    
    if (affectedStations?.length) {
      console.warn(`Weather alert: ${alert.properties.event}`);
      console.warn(`Affected stations: ${affectedStations.length}`);
      
      // Update station status
      for (const station of affectedStations) {
        await supabase
          .from('ground_nodes')
          .update({ status: 'degraded' })
          .eq('id', station.id);
      }
    }
  }
}
```

---

## 📈 Performance Considerations

### Rate Limiting
- NOAA API has no official rate limit
- Best practice: 1 request per second per endpoint
- Cache responses for 15 minutes

### Optimization
```typescript
// Batch requests by region
const regionGroups = groupStationsByRegion(stations);

for (const region of regionGroups) {
  // Use one forecast for nearby stations
  const centerPoint = calculateRegionCenter(region.stations);
  const weather = await getGroundStationWeather(
    centerPoint.lat,
    centerPoint.lon
  );
  
  // Apply to all stations in region
  region.stations.forEach(station => {
    updateStationWeather(station, weather);
  });
  
  // Rate limit
  await sleep(1000);
}
```

---

## ✅ Testing

### Test Weather Fetch
```bash
# Test NOAA API
curl -H "User-Agent: (usneodcp@gmail.com)" \
     -H "Accept: application/geo+json" \
     "https://api.weather.gov/points/39.7456,-97.0892"
```

### Verify Integration
```typescript
// In browser console
const weather = await getGroundStationWeather(39.7456, -97.0892);
console.log('Weather:', weather);
console.log('Link Quality:', calculateLinkQuality(weather));
```

---

## 🎯 Next Steps

1. ✅ **Environment variables set** - NOAA credentials configured
2. 🔄 **Implement weatherService.ts** - Add weather fetching logic
3. 🔄 **Update ground station colors** - Visual weather indicators
4. 🔄 **Add weather dashboard** - Display weather stats
5. 🔄 **Setup automated updates** - 15-minute refresh cycle
6. 🔄 **Integrate with routing** - Avoid stations with poor weather

---

**Status:** ✅ Credentials Configured  
**API:** NOAA Weather API  
**Rate Limit:** None (best practice: 1 req/sec)  
**Update Frequency:** 15 minutes recommended

🌦️ **Ready to integrate weather data into ground station network!**

