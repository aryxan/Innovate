import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const WEATHER_TIMEOUT_MS = 7000;
const FLOOD_TIMEOUT_MS = 7000;
const MAX_RETRIES = 2;
const isDev = process.env.NODE_ENV !== "production";

const weatherCache = {
  data: null,
  source: null,
  updatedAt: null,
};

const floodCache = {
  data: null,
  source: null,
  updatedAt: null,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const devLog = (...args) => {
  if (isDev) {
    console.log(...args);
  }
};

async function fetchJsonWithTimeoutRetry(url, options = {}, config = {}) {
  const timeoutMs = config.timeoutMs ?? 7000;
  const retries = config.retries ?? 2;
  const label = config.label ?? "API";
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      devLog(`-> ${label} attempt ${attempt + 1}: ${url}`);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`${label} HTTP ${response.status}`);
      }

      const data = await response.json();
      clearTimeout(timeoutId);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt < retries) {
        await sleep(300 * (attempt + 1));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error(`${label} unknown fetch error`);
}

function buildMockWeather(lat, lon) {
  const now = new Date();
  const hour = now.getHours();
  const isNowDay = hour >= 6 && hour < 19;
  const daily = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(now.getTime() + index * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString(),
      weatherCode: index % 2 === 0 ? 800 : 801,
      tempMax: 31 - (index % 3),
      tempMin: 24 - (index % 2),
    };
  });

  return {
    current: {
      temp: 28,
      weatherCode: 800,
      isDay: isNowDay,
      windSpeed: 12,
      humidity: 65,
      rain24h: 0,
      pressure: 1008,
      isIMD: false,
      lat: Number(lat) || null,
      lon: Number(lon) || null,
    },
    daily,
  };
}

function mapImdPayload(imdRaw) {
  const station = Array.isArray(imdRaw) ? imdRaw[0] : null;
  if (!station) return null;

  const hour = new Date().getHours();
  const isNowDay = hour >= 6 && hour < 19;

  return {
    current: {
      temp: Number(station.Temperature) || 0,
      weatherCode: Number(station.Weather_Code) || 0,
      isDay: isNowDay,
      windSpeed: Number(station.Wind_Speed) || 0,
      humidity: Number(station.Humidity) || 0,
      rain24h: Number(station.Last_24_hrs_Rainfall) || 0,
      pressure: Number(station.M_S_L_P) || 0,
      isIMD: true,
    },
    daily: [],
  };
}

function mapOpenWeatherForecastPayload(openWeatherForecast) {
  if (!openWeatherForecast?.list?.length) return null;

  const first = openWeatherForecast.list[0];
  return {
    current: {
      temp: Number(first.main?.temp) || 0,
      weatherCode: Number(first.weather?.[0]?.id) || 800,
      isDay: first.sys?.pod === "d",
      windSpeed: (Number(first.wind?.speed) || 0) * 3.6,
      humidity: Number(first.main?.humidity) || 0,
      rain24h: Number(first.rain?.["3h"] || 0),
      pressure: Number(first.main?.pressure) || 0,
      isIMD: false,
    },
    daily: openWeatherForecast.list
      .filter((_, index) => index % 8 === 0)
      .slice(0, 5)
      .map((entry) => ({
        date: entry.dt_txt,
        weatherCode: Number(entry.weather?.[0]?.id) || 800,
        tempMax: Number(entry.main?.temp_max) || 0,
        tempMin: Number(entry.main?.temp_min) || 0,
      })),
  };
}

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
  }),
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: `JalRakshak backend proxy running on ${PORT}`,
  });
});

app.get("/api/weather", async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const city = String(req.query.city || "Mumbai");

  try {
    const imdUrl = `https://mausam.imd.gov.in/api/nowcastapi.php?id=${encodeURIComponent(city)}`;
    const imdRaw = await fetchJsonWithTimeoutRetry(
      imdUrl,
      {},
      {
        timeoutMs: WEATHER_TIMEOUT_MS,
        retries: MAX_RETRIES,
        label: "IMD",
      },
    );

    const imdData = mapImdPayload(imdRaw);
    if (!imdData) {
      throw new Error("IMD payload invalid");
    }

    weatherCache.data = imdData;
    weatherCache.source = "imd";
    weatherCache.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      source: "imd",
      cached: false,
      data: imdData,
      updatedAt: weatherCache.updatedAt,
    });
  } catch (imdError) {
    devLog(
      "IMD failed, trying OpenWeather fallback",
      imdError?.message || imdError,
    );
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey || !lat || !lon) {
        throw new Error("OpenWeather fallback missing api key or coordinates");
      }

      const owmUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&units=metric&appid=${encodeURIComponent(apiKey)}`;
      const owmRaw = await fetchJsonWithTimeoutRetry(
        owmUrl,
        {},
        {
          timeoutMs: WEATHER_TIMEOUT_MS,
          retries: MAX_RETRIES,
          label: "OpenWeather",
        },
      );

      const owmData = mapOpenWeatherForecastPayload(owmRaw);
      if (!owmData) {
        throw new Error("OpenWeather payload invalid");
      }

      weatherCache.data = owmData;
      weatherCache.source = "openweather";
      weatherCache.updatedAt = new Date().toISOString();

      return res.json({
        success: true,
        source: "openweather",
        cached: false,
        data: owmData,
        updatedAt: weatherCache.updatedAt,
      });
    } catch (owmError) {
      devLog("OpenWeather fallback failed", owmError?.message || owmError);
      if (weatherCache.data) {
        return res.json({
          success: true,
          source: weatherCache.source || "cache",
          cached: true,
          data: weatherCache.data,
          updatedAt: weatherCache.updatedAt,
        });
      }

      const mockData = buildMockWeather(lat, lon);
      return res.json({
        success: true,
        source: "mock",
        cached: false,
        data: mockData,
        updatedAt: new Date().toISOString(),
      });
    }
  }
});

app.get("/api/flood-data", async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  
  try {
    // 1. Fetch Water Levels (CWC/WRIS)
    const waterLevelUrl = "https://ffs.india-water.gov.in/ffm/api/station-water-level-above-warning/";
    const rainfallUrl = "https://ffs.india-water.gov.in/ffm/api/station-rainfall-above-warning/";
    
    devLog("-> Syncing Hydro-Meteorological Data...");

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Origin": "https://ffs.india-water.gov.in",
      "Referer": "https://ffs.india-water.gov.in/"
    };

    const [waterLevelRaw, rainfallRaw] = await Promise.allSettled([
      fetchJsonWithTimeoutRetry(waterLevelUrl, {
        headers: { ...headers, "class-name": "StationWaterLevelAboveWarningDto" }
      }, { timeoutMs: 8000, label: "WRIS-Level" }),
      fetchJsonWithTimeoutRetry(rainfallUrl, {
        headers: { ...headers, "class-name": "StationRainfallAboveWarningDto" }
      }, { timeoutMs: 8000, label: "WRIS-Rain" })
    ]);

    const waterLevels = waterLevelRaw.status === 'fulfilled' ? waterLevelRaw.value : [];
    const rainfallData = rainfallRaw.status === 'fulfilled' ? rainfallRaw.value : [];

    // 2. Fetch Real-time OpenWeather Rainfall if coordinates provided
    let owmPrecipitation = 0;
    if (lat && lon && process.env.OPENWEATHER_API_KEY) {
      try {
        const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
        const owmRaw = await fetchJsonWithTimeoutRetry(owmUrl, {}, { timeoutMs: 3000, label: "OWM-Rain-Sync" });
        owmPrecipitation = owmRaw?.rain?.['1h'] || owmRaw?.rain?.['3h'] || 0;
      } catch (e) {
        devLog("OWM Rain Sync failed, skipping merge");
      }
    }

    // 3. Normalize and Merge
    const normalizedData = (Array.isArray(waterLevels) ? waterLevels : []).map(station => {
      // Find matching rainfall data for this station if available
      const rainMatch = (Array.isArray(rainfallData) ? rainfallData : []).find(r => r.stationCode === station.stationCode);
      
      return {
        stationName: station.stationName || "Unknown",
        river: station.riverName || station.basinName || "N/A",
        level: Number(station.waterLevel) || 0,
        warningLevel: Number(station.warningLevel) || 0,
        dangerLevel: Number(station.dangerLevel) || 0,
        trend: station.trend || "Steady",
        rainfall: Number(rainMatch?.rainfall || 0) + (station.isUserLocation ? owmPrecipitation : 0),
        location: {
          lat: station.latitude,
          lon: station.longitude
        },
        basin: station.basinName,
        status: station.status || "NORMAL"
      };
    });

    floodCache.data = normalizedData;
    floodCache.source = "wris-merged";
    floodCache.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      source: "wris-merged",
      cached: false,
      data: normalizedData,
      updatedAt: floodCache.updatedAt,
      localRainfall: owmPrecipitation
    });
  } catch (error) {
    devLog("Integrated Flood API failed", error?.message || error);
    if (floodCache.data) {
      return res.json({
        success: true,
        source: floodCache.source || "cache",
        cached: true,
        data: floodCache.data,
        updatedAt: floodCache.updatedAt
      });
    }

    return res.status(503).json({
      success: false,
      message: "Hydro-Meteorological service unavailable",
      fallback: true
    });
  }
});

app.get("/api/cwc-flood-data", (_req, res) => {
  res.redirect(307, "/api/flood-data");
});

app.listen(PORT, () => {
  console.log(`JalRakshak backend proxy running on port ${PORT}`);
});
