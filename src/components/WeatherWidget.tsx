import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Clock3,
  Calendar,
  X,
  ChevronRight,
  CloudSun,
  CloudMoon,
} from "lucide-react";

interface WeatherData {
  current: {
    temp: number;
    weatherCode: number;
    isDay: boolean;
    windSpeed: number;
    humidity: number;
    rain24h?: number;
    pressure?: number;
    isIMD?: boolean;
  };
  daily: {
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
  }[];
}

interface WeatherWidgetProps {
  lat: number;
  lon: number;
  cityName?: string;
  t: any;
  selectedLanguage: string;
}

const isCurrentHourDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 19;
};

const getIMDWeatherIcon = (code: number, isDay: boolean = true) => {
  if (code >= 1 && code <= 3)
    return isDay ? (
      <CloudSun className="text-amber-300 w-8 h-8" />
    ) : (
      <CloudMoon className="text-slate-400 w-8 h-8" />
    );

  if (code >= 10 && code <= 12)
    return isDay ? (
      <Cloud className="text-slate-400 w-8 h-8" />
    ) : (
      <CloudMoon className="text-slate-400 w-8 h-8" />
    );

  if (code === 13)
    return <CloudLightning className="text-yellow-400 w-8 h-8" />;

  if (code >= 20 && code <= 21)
    return <CloudRain className="text-blue-300 w-8 h-8" />;

  if (code >= 50 && code <= 65)
    return <CloudRain className="text-blue-500 w-8 h-8" />;

  if (code >= 80 && code <= 82)
    return <Droplets className="text-blue-600 w-8 h-8" />;

  if (code >= 95 && code <= 99)
    return <CloudLightning className="text-purple-500 w-8 h-8" />;

  return isDay ? (
    <Sun className="text-saffron w-8 h-8" />
  ) : (
    <Moon className="text-ashoka-blue w-8 h-8" />
  );
};

const getIMDDesc = (code: number, t: any) => {
  const codeStr = code.toString().padStart(2, "0");
  const codeMap: Record<string, string> = {
    "01": "Fair Weather",
    "02": "Sky Unchanged",
    "03": "Developing Clouds",
    "05": "Haze",
    "10": "Mist",
    "13": "Lightning Visible",
    "17": "Thunderstorm",
    "21": "Continuous Rain",
    "25": "Rain Showers",
    "29": "Thunderstorm with Rain",
    "63": "Continuous Moderate Rain",
    "81": "Heavy Rain Showers",
    "95": "Severe Thunderstorm",
  };
  return codeMap[codeStr] || t.clear;
};

const getOWMDesc = (code: number, t: any) => {
  if (code >= 200 && code < 300) return t.thunderstorm;
  if (code >= 300 && code < 600) return t.rainShowers;
  if (code >= 600 && code < 700) return t.snow;
  if (code >= 700 && code < 800) return t.foggy;
  if (code === 800) return t.clearSky;
  if (code > 800) return t.partlyCloudy;
  return t.clear;
};

const getWeatherIcon = (
  code: number,
  isDay: boolean = true,
  isIMD: boolean = false,
) => {
  if (isIMD) return getIMDWeatherIcon(code, isDay);

  if (code === 800)
    return isDay ? (
      <Sun className="text-amber-400 w-8 h-8" />
    ) : (
      <Moon className="text-slate-300 w-8 h-8" />
    );

  if (code > 800)
    return isDay ? (
      <CloudSun className="text-slate-400 w-8 h-8" />
    ) : (
      <CloudMoon className="text-slate-400 w-8 h-8" />
    );

  if (code >= 700 && code < 800)
    return <Cloud className="text-slate-500 w-8 h-8" />;

  if (code >= 300 && code < 600)
    return <CloudRain className="text-blue-400 w-8 h-8" />;

  if (code >= 200 && code < 300)
    return <CloudLightning className="text-purple-400 w-8 h-8" />;

  return isDay ? (
    <Sun className="text-amber-400 w-8 h-8" />
  ) : (
    <Moon className="text-slate-300 w-8 h-8" />
  );
};

const getWeatherDesc = (code: number, t: any, isIMD: boolean = false) => {
  if (isIMD) return getIMDDesc(code, t);
  return getOWMDesc(code, t);
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  lat,
  lon,
  cityName,
  t,
  selectedLanguage,
}) => {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    setFetchError(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/weather?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&city=${encodeURIComponent(cityName || "Mumbai")}`,
      );
      const payload = await response.json();

      if (!response.ok || !payload?.success || !payload?.data) {
        throw new Error(payload?.message || "Weather service unavailable");
      }

      setWeather(payload.data);
    } catch (error) {
      setFetchError(true);
      setWeather({
        current: {
          temp: 28,
          weatherCode: 800,
          isDay: isCurrentHourDaytime(),
          windSpeed: 12,
          humidity: 65,
          rain24h: 0,
          pressure: 1008,
          isIMD: false,
        },
        daily: [
          {
            date: new Date().toISOString(),
            weatherCode: 800,
            tempMax: 31,
            tempMin: 25,
          },
          {
            date: new Date(Date.now() + 86400000).toISOString(),
            weatherCode: 801,
            tempMax: 30,
            tempMin: 24,
          },
          {
            date: new Date(Date.now() + 172800000).toISOString(),
            weatherCode: 500,
            tempMax: 29,
            tempMin: 23,
          },
          {
            date: new Date(Date.now() + 259200000).toISOString(),
            weatherCode: 800,
            tempMax: 32,
            tempMin: 26,
          },
          {
            date: new Date(Date.now() + 345600000).toISOString(),
            weatherCode: 802,
            tempMax: 30,
            tempMin: 25,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [lat, lon, cityName]);

  if (loading || !weather) {
    return (
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse h-32 flex items-center justify-center">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          {t.syncingWeatherData || "Syncing Meteorological Data..."}
        </div>
      </div>
    );
  }

  const displayIsDay = isCurrentHourDaytime();

  const isCloudyCondition = weather.current.isIMD
    ? (weather.current.weatherCode >= 1 && weather.current.weatherCode <= 12) ||
      (weather.current.weatherCode >= 20 &&
        weather.current.weatherCode <= 21) ||
      (weather.current.weatherCode >= 50 && weather.current.weatherCode <= 65)
    : (weather.current.weatherCode > 800 &&
        weather.current.weatherCode < 900) ||
      (weather.current.weatherCode >= 200 && weather.current.weatherCode < 700);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowForecast(true)}
        className={`rounded-[22px] p-5 border cursor-pointer transition-all group relative overflow-hidden min-h-[150px] ${
          displayIsDay
            ? "bg-gradient-to-br from-sky-100 via-sky-50 to-blue-200 border-sky-200/70"
            : "bg-gradient-to-br from-[#091833] via-[#10264a] to-[#1c355f] border-slate-500/40"
        }`}
      >
        <div className="absolute inset-0 pointer-events-none">
          {displayIsDay ? (
            <>
              <div className="absolute -top-8 -right-6 w-28 h-28 rounded-full bg-yellow-200/55 blur-2xl" />
              <div className="absolute top-4 right-8 w-8 h-8 rounded-full bg-yellow-300/80 shadow-[0_0_20px_rgba(253,224,71,0.7)]" />
            </>
          ) : (
            <>
              <div className="absolute -top-8 -right-6 w-28 h-28 rounded-full bg-blue-200/20 blur-2xl" />
              <div className="absolute top-5 right-9 w-7 h-7 rounded-full bg-slate-100/90 shadow-[0_0_14px_rgba(226,232,240,0.7)]" />
            </>
          )}

          {isCloudyCondition && (
            <>
              <motion.div
                className={`absolute -bottom-4 -left-10 w-44 h-20 rounded-full blur-md ${displayIsDay ? "bg-white/70" : "bg-slate-200/35"}`}
                animate={{ x: [0, 24, 0] }}
                transition={{
                  duration: 11,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className={`absolute  bottom-1 right-[-30px] w-48 h-24 rounded-full blur-md ${displayIsDay ? "bg-white/65" : "bg-slate-100/28"}`}
                animate={{ x: [0, -18, 0] }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className={`absolute bottom-8 right-8 w-24 h-10 rounded-full blur-sm ${displayIsDay ? "bg-white/70" : "bg-slate-200/28"}`}
                animate={{ x: [0, 10, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
        </div>

        {fetchError && (
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <span
              className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                displayIsDay
                  ? "text-amber-700 bg-amber-100 border-amber-200"
                  : "text-amber-200 bg-amber-950/40 border-amber-800/40"
              }`}
            >
              Service temporarily unavailable
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchWeather();
              }}
              className="text-[8px] font-black uppercase tracking-widest text-white bg-ashoka-blue px-2 py-0.5 rounded"
            >
              Retry
            </button>
          </div>
        )}

        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight
            className={`w-4 h-4 ${displayIsDay ? "text-ashoka-blue" : "text-slate-200"}`}
          />
        </div>

        {weather.current.isIMD && (
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-50 group-hover:opacity-100">
            <div className="w-1.5 h-1.5 bg-india-green rounded-full animate-pulse" />
            <span className="text-[7px] font-black uppercase text-india-green tracking-tighter">
              IMD Official
            </span>
          </div>
        )}

        <div className="flex items-start gap-4 relative z-10">
          <motion.div
            animate={
              weather.current.weatherCode === 800
                ? { rotate: [0, 360], scale: [1, 1.1, 1] }
                : { y: [0, -8, 0], scale: [1, 1.05, 1] }
            }
            transition={{
              repeat: Infinity,
              duration: weather.current.weatherCode === 800 ? 10 : 3,
              ease: "linear",
            }}
          >
            {getWeatherIcon(
              weather.current.weatherCode,
              displayIsDay,
              weather.current.isIMD,
            )}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[52px] leading-none font-display ${
                  displayIsDay ? "text-ashoka-blue" : "text-white"
                }`}
              >
                {Math.round(weather.current.temp)}°
              </span>
              <span
                className={`text-[10px] font-mono uppercase tracking-widest pr-2 ${
                  displayIsDay ? "text-ashoka-blue/70" : "text-slate-200/90"
                }`}
              >
                {getWeatherDesc(
                  weather.current.weatherCode,
                  t,
                  weather.current.isIMD,
                )}
              </span>
            </div>

            <div
              className={`flex items-center gap-4 text-[10px] font-mono ${
                displayIsDay ? "text-ink/50" : "text-slate-200/75"
              }`}
            >
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3" />{" "}
                {weather.current.windSpeed.toFixed(1)}
                km/h
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-3 h-3" /> {weather.current.humidity}%
              </div>
              {weather.current.rain24h !== undefined &&
                weather.current.rain24h > 0 && (
                  <div className="flex items-center gap-1 text-blue-500 font-bold">
                    <CloudRain className="w-3 h-3" /> {weather.current.rain24h}
                    mm
                  </div>
                )}
            </div>

            <div
              className={`inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full text-[10px] font-semibold ${
                displayIsDay
                  ? "bg-white/55 text-slate-700 border border-white/70"
                  : "bg-white/10 text-slate-100 border border-white/20"
              }`}
            >
              <Clock3 className="w-3.5 h-3.5" />
              Hourly forecast
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForecast && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForecast(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-cream border border-border rounded-3xl p-5 md:p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-ashoka-blue/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ashoka-blue/10 rounded-xl flex items-center justify-center border border-ashoka-blue/20">
                    <Calendar className="text-ashoka-blue w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display uppercase tracking-wider text-ashoka-blue">
                      {t.fiveDayForecast}
                    </h3>
                    <p className="text-[10px] text-ink/40 font-mono flex items-center gap-2 uppercase tracking-widest">
                      {t.atmosphericProjections}
                      <span className="bg-india-green/10 text-india-green px-1.5 py-0.5 rounded font-bold border border-india-green/20">
                        IMD Models
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForecast(false)}
                  className="w-10 h-10 bg-ashoka-blue/5 hover:bg-ashoka-blue/10 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-ashoka-blue" />
                </button>
              </div>

              <div className="space-y-4 relative z-10">
                {weather.daily.slice(0, 5).map((day, i) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-cream/50 border border-border hover:border-ashoka-blue/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-xs font-mono text-ink/40 w-12">
                        {i === 0
                          ? t.today
                          : new Date(day.date).toLocaleDateString(
                              selectedLanguage === "hi" ? "hi-IN" : "en-US",
                              { weekday: "short" },
                            )}
                      </div>
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        {getWeatherIcon(
                          day.weatherCode,
                          true,
                          weather.current.isIMD,
                        )}
                      </div>
                      <div className="text-xs text-ink/60 font-medium">
                        {getWeatherDesc(
                          day.weatherCode,
                          t,
                          weather.current.isIMD,
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-saffron opacity-50" />
                        <span className="text-sm font-bold text-ink">
                          {Math.round(day.tempMax)}°
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-ashoka-blue opacity-50" />
                        <span className="text-sm font-bold text-ink/40">
                          {Math.round(day.tempMin)}°
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-ashoka-blue/5 border border-ashoka-blue/10 flex items-center gap-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-ashoka-blue flex items-center justify-center shrink-0">
                  <Wind className="text-white w-4 h-4" />
                </div>
                <p className="text-[10px] text-ashoka-blue/70 leading-relaxed font-medium">
                  {t.weatherInsights}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
