/**
 * Vercel Serverless Function: Model Signals API
 * Fetches soil moisture and rainfall signals from data.gov.in XML resources.
 */

const API_TIMEOUT_MS = 9000;
const MAX_RETRIES = 2;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTextWithTimeoutRetry(url, options = {}, config = {}) {
  const timeoutMs = config.timeoutMs ?? API_TIMEOUT_MS;
  const retries = config.retries ?? MAX_RETRIES;
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

      const text = await response.text();
      clearTimeout(timeoutId);
      return text;
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

function extractNumericTagValues(xml, tagName) {
  const regex = new RegExp(`<${tagName}>([^<]+)</${tagName}>`, "g");
  const values = [];
  let match;

  while ((match = regex.exec(xml)) !== null) {
    const parsed = Number(match[1]);
    if (Number.isFinite(parsed)) {
      values.push(parsed);
    }
  }

  return values;
}

function avg(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default async function handler(req, res) {
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
    const apiKey =
      process.env.SOIL_MOISTURE_API_KEY ||
      process.env.RAINFALL_API_KEY ||
      "579b464db66ec23bdd0000015c329c8f705141aa5ee7bb933250257a";

    const soilUrl =
      process.env.SOIL_MOISTURE_API_URL ||
      `https://api.data.gov.in/resource/4554a3c8-74e3-4f93-8727-8fd92161e345?api-key=${encodeURIComponent(apiKey)}&format=xml`;

    const rainfallUrl =
      process.env.RAINFALL_API_URL ||
      `https://api.data.gov.in/resource/6c05cd1b-ed59-40c2-bc31-e314f39c6971?api-key=${encodeURIComponent(apiKey)}&format=xml`;

    const [soilXml, rainfallXml] = await Promise.all([
      fetchTextWithTimeoutRetry(soilUrl, {}, { label: "Soil Moisture" }),
      fetchTextWithTimeoutRetry(rainfallUrl, {}, { label: "Rainfall" }),
    ]);

    const soilValues = extractNumericTagValues(soilXml, "Avg_smlvl_at15cm");
    const rainfallValues = extractNumericTagValues(rainfallXml, "Avg_rainfall");

    const soilMoistureAvg = Number(avg(soilValues).toFixed(3));
    const rainfallAvg = Number(avg(rainfallValues).toFixed(3));

    return res.json({
      success: true,
      source: "data.gov.in",
      data: {
        soil_moisture_avg: soilMoistureAvg,
        rainfall_avg: rainfallAvg,
        soil_samples: soilValues.length,
        rainfall_samples: rainfallValues.length,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Model signals API error:", error?.message || error);
    return res.status(502).json({
      success: false,
      source: "data.gov.in",
      error: "Unable to fetch model signals",
      updatedAt: new Date().toISOString(),
    });
  }
}
