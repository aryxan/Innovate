/**
 * Vercel Serverless Function: Flood Data API
 * Fetches water level data from CWC (Central Water Commission)
 */

const FLOOD_TIMEOUT_MS = 7000;
const MAX_RETRIES = 2;

const floodCache = {
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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const cwcUrl =
      "https://ffs.india-water.gov.in/ffm/api/station-water-level-above-warning/";

    const cwcData = await fetchJsonWithTimeoutRetry(
      cwcUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          Accept: "application/json",
          "class-name": "StationWaterLevelAboveWarningDto",
        },
      },
      {
        timeoutMs: FLOOD_TIMEOUT_MS,
        retries: MAX_RETRIES,
        label: "CWC",
      },
    );

    floodCache.data = Array.isArray(cwcData) ? cwcData : [];
    floodCache.source = "cwc";
    floodCache.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      source: "cwc",
      cached: false,
      data: floodCache.data,
      updatedAt: floodCache.updatedAt,
    });
  } catch (error) {
    console.error("Flood API error:", error?.message || error);

    // Return cached data if available
    if (floodCache.data) {
      return res.json({
        success: true,
        source: floodCache.source || "cache",
        cached: true,
        data: floodCache.data,
        updatedAt: floodCache.updatedAt,
      });
    }

    // Return safe empty payload so the UI can stay usable during upstream outages.
    return res.json({
      success: true,
      source: "fallback-empty",
      cached: false,
      data: [],
      updatedAt: new Date().toISOString(),
      warning: "Flood data service temporarily unavailable",
    });
  }
}
