# 🌤️ OpenWeather API Integration

**Date:** October 18, 2025  
**Status:** ✅ API Key Configured

---

## 🔑 API Credentials

**API Key:** `01cc3473a65ef16a4092600deb0eda75`  
**Documentation:** https://openweathermap.org/api

---

## ✅ Environment Variables Set

Both repositories now have OpenWeather API key in `.env`:

```env
VITE_OPENWEATHER_API_KEY=01cc3473a65ef16a4092600deb0eda75
```

**Locations:**
- `/Users/cp5337/Developer/ctas7-command-center/.env`
- `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-gis-cesium-1/.env`

---

## 🌐 OpenWeather API Endpoints

### 1. Current Weather Data
```typescript
const lat = 39.7456;
const lon = -97.0892;
const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

const response = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
);
const data = await response.json();
```

**Response:**
```json
{
  "coord": {"lon": -97.0892, "lat": 39.7456},
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "main": {
    "temp": 20.5,
    "feels_like": 19.8,
    "temp_min": 18.2,
    "temp_max": 22.1,
    "pressure": 1013,
    "humidity": 65
  },
  "visibility": 10000,
  "wind": {
    "speed": 5.5,
    "deg": 180
  },
  "clouds": {
    "all": 0
  }
}
```

### 2. 5-Day Forecast
```typescript
const forecast = await fetch(
  `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
);
```

### 3. One Call API (Current + Forecast + Historical)
```typescript
const oneCall = await fetch(
  `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
);
```

---

## 🎯 Integration with Ground Stations

### Enhanced Weather Service

Update `src/services/weatherService.ts`:

```typescript
import { supabase } from '@/lib/supabase';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY; // NOAA
const WEATHER_API_EMAIL = import.meta.env.VITE_WEATHER_API_EMAIL;

interface WeatherData {
  temperature: number;
  cloudCover: number;
  precipitation: number;
  visibility: number;
  windSpeed: number;
  humidity: number;
  pressure: number;
  conditions: string;
  icon: string;
}

/**
 * Fetch weather from OpenWeather (primary) with NOAA fallback
 */
export async function getGroundStationWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  try {
    // Try OpenWeather first (more reliable, global coverage)
    return await getOpenWeatherData(lat, lon);
  } catch (error) {
    console.warn('OpenWeather failed, trying NOAA:', error);
    try {
      // Fallback to NOAA (US only, but more detailed)
      return await getNOAAWeatherData(lat, lon);
    } catch (noaaError) {
      console.error('Both weather APIs failed:', noaaError);
      // Return default clear weather
      return getDefaultWeather();
    }
  }
}

/**
 * Get weather from OpenWeather API
 */
async function getOpenWeatherData(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?` +
    `lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&` +
    `appid=${OPENWEATHER_API_KEY}&units=metric`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`OpenWeather API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    temperature: data.main.temp,
    cloudCover: data.clouds.all, // 0-100%
    precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0, // mm in last hour
    visibility: data.visibility / 1000, // Convert meters to km
    windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    conditions: data.weather[0].description,
    icon: data.weather[0].icon
  };
}

/**
 * Get weather from NOAA API (US only, fallback)
 */
async function getNOAAWeatherData(
  lat: number,
  lon: number
): Promise<WeatherData> {
  // Check if coordinates are in US
  if (lat < 24 || lat > 50 || lon < -125 || lon > -66) {
    throw new Error('NOAA only covers US territory');
  }

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

  return {
    temperature: (current.temperature - 32) * 5/9, // F to C
    cloudCover: parseCloudCover(current.shortForecast),
    precipitation: current.probabilityOfPrecipitation?.value || 0,
    visibility: 10, // NOAA doesn't provide visibility
    windSpeed: parseWindSpeed(current.windSpeed),
    humidity: current.relativeHumidity?.value || 50,
    pressure: 1013, // NOAA doesn't provide pressure in forecast
    conditions: current.shortForecast,
    icon: '01d' // Default
  };
}

/**
 * Calculate optical link quality based on weather
 * Returns 0.0 (blocked) to 1.0 (perfect)
 */
export function calculateLinkQuality(weather: WeatherData): number {
  let quality = 1.0;

  // Cloud cover penalty (0-100%)
  // Optical links need clear line of sight
  if (weather.cloudCover > 80) {
    quality *= 0.2; // Heavy overcast
  } else if (weather.cloudCover > 50) {
    quality *= 0.5; // Mostly cloudy
  } else if (weather.cloudCover > 20) {
    quality *= 0.8; // Partly cloudy
  }
  // else: clear sky, no penalty

  // Precipitation penalty (mm/hour)
  if (weather.precipitation > 10) {
    quality *= 0.1; // Heavy rain/snow - severe attenuation
  } else if (weather.precipitation > 5) {
    quality *= 0.3; // Moderate precipitation
  } else if (weather.precipitation > 1) {
    quality *= 0.7; // Light precipitation
  }

  // Visibility penalty (km)
  if (weather.visibility < 1) {
    quality *= 0.1; // Fog/heavy haze
  } else if (weather.visibility < 5) {
    quality *= 0.4; // Poor visibility
  } else if (weather.visibility < 10) {
    quality *= 0.7; // Moderate visibility
  }

  // Humidity penalty (affects atmospheric absorption)
  if (weather.humidity > 90) {
    quality *= 0.9; // Very humid
  } else if (weather.humidity > 70) {
    quality *= 0.95; // Humid
  }

  return Math.max(0, Math.min(1, quality));
}

/**
 * Get weather quality category
 */
export function getWeatherQualityCategory(quality: number): string {
  if (quality > 0.9) return 'Excellent';
  if (quality > 0.7) return 'Good';
  if (quality > 0.5) return 'Fair';
  if (quality > 0.3) return 'Poor';
  return 'Blocked';
}

/**
 * Get color for weather quality visualization
 */
export function getWeatherQualityColor(quality: number): string {
  if (quality > 0.9) return '#10b981'; // Green
  if (quality > 0.7) return '#84cc16'; // Lime
  if (quality > 0.5) return '#eab308'; // Yellow
  if (quality > 0.3) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

/**
 * Update weather data for all ground stations
 */
export async function updateAllStationWeather() {
  console.log('🌤️ Updating weather for all ground stations...');
  
  const { data: stations } = await supabase
    .from('ground_nodes')
    .select('id, name, latitude, longitude');

  if (!stations || stations.length === 0) {
    console.warn('No ground stations found');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const station of stations) {
    try {
      const weather = await getGroundStationWeather(
        station.latitude,
        station.longitude
      );

      const linkQuality = calculateLinkQuality(weather);

      // Update station weather score
      await supabase
        .from('ground_nodes')
        .update({ 
          weather_score: linkQuality,
          last_updated: new Date().toISOString()
        })
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
          humidity_percent: weather.humidity,
          pressure_hpa: weather.pressure,
          conditions: weather.conditions,
          link_quality_score: linkQuality
        });

      successCount++;
      console.log(`✅ ${station.name}: ${getWeatherQualityCategory(linkQuality)} (${(linkQuality * 100).toFixed(0)}%)`);

      // Rate limit: 60 calls/minute for free tier
      await new Promise(resolve => setTimeout(resolve, 1100));

    } catch (error) {
      failCount++;
      console.error(`❌ ${station.name}: ${error}`);
    }
  }

  console.log(`\n🌤️ Weather update complete: ${successCount} success, ${failCount} failed`);
}

/**
 * Get weather forecast for route planning
 */
export async function getWeatherForecast(
  lat: number,
  lon: number,
  hours: number = 24
): Promise<WeatherData[]> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?` +
    `lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&` +
    `appid=${OPENWEATHER_API_KEY}&units=metric`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`OpenWeather API error: ${response.status}`);
  }

  const data = await response.json();
  const maxPeriods = Math.ceil(hours / 3); // 3-hour intervals

  return data.list.slice(0, maxPeriods).map((period: any) => ({
    temperature: period.main.temp,
    cloudCover: period.clouds.all,
    precipitation: period.rain?.['3h'] || period.snow?.['3h'] || 0,
    visibility: period.visibility / 1000,
    windSpeed: period.wind.speed * 3.6,
    humidity: period.main.humidity,
    pressure: period.main.pressure,
    conditions: period.weather[0].description,
    icon: period.weather[0].icon
  }));
}

// Helper functions
function parseCloudCover(forecast: string): number {
  const lower = forecast.toLowerCase();
  if (lower.includes('clear') || lower.includes('sunny')) return 0;
  if (lower.includes('partly cloudy')) return 30;
  if (lower.includes('mostly cloudy')) return 70;
  if (lower.includes('cloudy') || lower.includes('overcast')) return 100;
  return 50;
}

function parseWindSpeed(windSpeed: string): number {
  const match = windSpeed.match(/(\d+)/);
  return match ? parseInt(match[1]) * 1.60934 : 0; // mph to km/h
}

function getDefaultWeather(): WeatherData {
  return {
    temperature: 20,
    cloudCover: 0,
    precipitation: 0,
    visibility: 10,
    windSpeed: 5,
    humidity: 50,
    pressure: 1013,
    conditions: 'Clear',
    icon: '01d'
  };
}
```

---

## 📊 Cesium Visualization

### Color Ground Stations by Weather

```typescript
import { getWeatherQualityColor } from '@/services/weatherService';

// Update entity colors based on weather
function updateStationWeatherColors(viewer: Cesium.Viewer) {
  viewer.entities.values
    .filter(e => e.properties?.type === 'ground_station')
    .forEach(entity => {
      const weatherScore = entity.properties.weather_score?.getValue();
      if (weatherScore !== undefined) {
        const color = Cesium.Color.fromCssColorString(
          getWeatherQualityColor(weatherScore)
        );
        entity.point.color = color;
        entity.billboard.color = color;
      }
    });
}
```

### Weather Info Panel

```typescript
<Card>
  <CardHeader>
    <CardTitle>Weather Conditions</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Clear Stations</div>
          <div className="text-2xl font-bold text-green-500">{clearCount}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Degraded</div>
          <div className="text-2xl font-bold text-orange-500">{degradedCount}</div>
        </div>
      </div>

      {/* Station List */}
      <div className="space-y-2">
        {stations.map(station => (
          <div key={station.id} className="flex items-center justify-between">
            <span className="text-sm">{station.name}</span>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getWeatherQualityColor(station.weather_score) }}
              />
              <span className="text-sm font-mono">
                {(station.weather_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 🔄 Automated Updates

### Setup Weather Refresh

```typescript
// In your main app or WebSocket server
let weatherUpdateInterval: NodeJS.Timeout;

export function startWeatherUpdates() {
  // Initial update
  updateAllStationWeather();

  // Update every 15 minutes
  weatherUpdateInterval = setInterval(() => {
    updateAllStationWeather();
  }, 15 * 60 * 1000);

  console.log('🌤️ Weather updates started (15-minute interval)');
}

export function stopWeatherUpdates() {
  if (weatherUpdateInterval) {
    clearInterval(weatherUpdateInterval);
    console.log('🌤️ Weather updates stopped');
  }
}
```

---

## 📈 API Rate Limits

### OpenWeather Free Tier
- **Calls per minute:** 60
- **Calls per day:** 1,000
- **Update frequency:** 10 minutes recommended

### Optimization for 289 Stations
```typescript
// Batch updates with rate limiting
async function updateStationsInBatches(batchSize = 50) {
  const { data: stations } = await supabase
    .from('ground_nodes')
    .select('*');

  if (!stations) return;

  for (let i = 0; i < stations.length; i += batchSize) {
    const batch = stations.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(station => 
        getGroundStationWeather(station.latitude, station.longitude)
          .then(weather => updateStationWeather(station.id, weather))
      )
    );

    // Wait 1 minute between batches (60 calls/minute limit)
    if (i + batchSize < stations.length) {
      console.log(`Processed ${i + batchSize}/${stations.length} stations, waiting...`);
      await new Promise(resolve => setTimeout(resolve, 61000));
    }
  }
}
```

---

## ✅ Testing

### Test OpenWeather API
```bash
# Test API call
curl "https://api.openweathermap.org/data/2.5/weather?lat=39.7456&lon=-97.0892&appid=01cc3473a65ef16a4092600deb0eda75&units=metric"
```

### Verify Integration
```typescript
// In browser console
import { getGroundStationWeather, calculateLinkQuality } from '@/services/weatherService';

const weather = await getGroundStationWeather(39.7456, -97.0892);
console.log('Weather:', weather);
console.log('Link Quality:', calculateLinkQuality(weather));
```

---

## 🎯 Next Steps

1. ✅ **API keys configured** - OpenWeather + NOAA
2. 🔄 **Update weatherService.ts** - Implement OpenWeather integration
3. 🔄 **Add weather visualization** - Color-code stations by weather
4. 🔄 **Create weather dashboard** - Display real-time conditions
5. 🔄 **Setup automated updates** - 15-minute refresh cycle
6. 🔄 **Integrate with routing** - Avoid stations with poor weather

---

**Status:** ✅ API Keys Configured  
**Primary API:** OpenWeather (global coverage)  
**Fallback API:** NOAA (US only, more detailed)  
**Rate Limit:** 60 calls/minute, 1000/day (free tier)  
**Update Frequency:** 15 minutes recommended

🌤️ **Ready to integrate real-time weather data!**

