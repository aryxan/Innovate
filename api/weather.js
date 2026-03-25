/**
 * Vercel Serverless Function: Weather API
 * Fetches weather data from IMD or OpenWeather with fallbacks
 */

const WEATHER_TIMEOUT_MS = 7000;
const MAX_RETRIES = 2;

const weatherCache = {
  data: null,
  source: null,
  updatedAt: null,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJsonWithTimeoutRetry(url, options = {}, config = {}) {
  const timeoutMs = config.timeoutMs ?? 7000;
  const retries = config.retries ?? 2;
  const label = config.label ?? "API";
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { lat, lon, city } = req.query;

  // Try IMD first
  try {
    const imdUrl = `https://ibm.nightskyimg.com/api/imdweather?type=1&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&_=${Date.now()}`;
    
    const imdRaw = await fetchJsonWithTimeoutRetry(
      imdUrl,
      {},
      {
        timeoutMs: WEATHER_TIMEOUT_MS,
        retries: MAX_RETRIES,
        label: "IMD",
      }
    );

    const imdData = mapImdPayload(imdRaw);
    if (imdData) {
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
    }

    throw new Error("IMD payload invalid");
  } catch (imdError) {
    console.error("IMD failed, trying OpenWeather fallback");

    // Try OpenWeather fallback
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
        }
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
      console.error("OpenWeather fallback failed");

      // Return cached data if available
      if (weatherCache.data) {
        return res.json({
          success: true,
          source: weatherCache.source || "cache",
          cached: true,
          data: weatherCache.data,
          updatedAt: weatherCache.updatedAt,
        });
      }

      // Return mock data as last resort
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
}
