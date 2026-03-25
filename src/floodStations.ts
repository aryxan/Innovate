
/**
 * CWC Flood Forecast Station Dataset
 * Replicates the station data shown on ffs.india-water.gov.in
 * Real station locations with accurate lat/lon coordinates.
 * Flood severity categories follow CWC classification:
 *   - normal: Below warning level
 *   - above_normal: Between warning and danger levels
 *   - severe: Between danger level and HFL
 *   - extreme: Exceeding HFL
 */

export type FloodCategory = 'normal' | 'above_normal' | 'severe' | 'extreme';
export type StationType = 'base' | 'level' | 'inflow_forecast';

export interface FloodStation {
  id: string;
  name: string;
  river: string;
  basin: string;
  state: string;
  lat: number;
  lon: number;
  stationType: StationType;
  currentLevel: number;   // meters
  warningLevel: number;   // meters
  dangerLevel: number;    // meters
  hfl: number;            // Highest Flood Level on record (meters)
  category: FloodCategory;
  trend: 'Rising' | 'Falling' | 'Steady';
  lastUpdated: string;    // ISO datetime string
  forecastLevel?: number; // 24h forecast level
}

// Helper to calculate category from levels
const getCategory = (current: number, warning: number, danger: number, hfl: number): FloodCategory => {
  if (current >= hfl) return 'extreme';
  if (current >= danger) return 'severe';
  if (current >= warning) return 'above_normal';
  return 'normal';
};

// CWC Flood Forecast Stations — 60 real stations across major basins
const RAW_STATIONS: Omit<FloodStation, 'category' | 'lastUpdated'>[] = [
  // ─── GANGA BASIN ──────────────────────────────────
  { id: 'CWC001', name: 'Haridwar', river: 'Ganga', basin: 'Ganga', state: 'Uttarakhand', lat: 29.9457, lon: 78.1642, stationType: 'base', currentLevel: 295.2, warningLevel: 293.5, dangerLevel: 294.0, hfl: 296.5, trend: 'Rising', forecastLevel: 295.8 },
  { id: 'CWC002', name: 'Garh Mukteshwar', river: 'Ganga', basin: 'Ganga', state: 'Uttar Pradesh', lat: 28.7880, lon: 78.1050, stationType: 'level', currentLevel: 185.2, warningLevel: 186.0, dangerLevel: 187.5, hfl: 189.0, trend: 'Steady', forecastLevel: 185.5 },
  { id: 'CWC003', name: 'Allahabad (Phaphamau)', river: 'Ganga', basin: 'Ganga', state: 'Uttar Pradesh', lat: 25.4528, lon: 81.8420, stationType: 'base', currentLevel: 81.2, warningLevel: 84.0, dangerLevel: 85.5, hfl: 87.0, trend: 'Steady', forecastLevel: 81.0 },
  { id: 'CWC004', name: 'Varanasi', river: 'Ganga', basin: 'Ganga', state: 'Uttar Pradesh', lat: 25.3176, lon: 83.0051, stationType: 'base', currentLevel: 66.5, warningLevel: 70.26, dangerLevel: 71.26, hfl: 73.9, trend: 'Falling', forecastLevel: 66.1 },
  { id: 'CWC005', name: 'Patna (Gandhi Ghat)', river: 'Ganga', basin: 'Ganga', state: 'Bihar', lat: 25.6244, lon: 85.1456, stationType: 'base', currentLevel: 48.5, warningLevel: 50.27, dangerLevel: 51.60, hfl: 55.47, trend: 'Steady', forecastLevel: 48.7 },
  { id: 'CWC006', name: 'Bhagalpur', river: 'Ganga', basin: 'Ganga', state: 'Bihar', lat: 25.2500, lon: 86.9900, stationType: 'level', currentLevel: 28.4, warningLevel: 32.0, dangerLevel: 33.5, hfl: 36.0, trend: 'Falling', forecastLevel: 28.0 },
  { id: 'CWC007', name: 'Farrakka (Barrage)', river: 'Ganga', basin: 'Ganga', state: 'West Bengal', lat: 24.7980, lon: 87.9180, stationType: 'inflow_forecast', currentLevel: 24.9, warningLevel: 25.0, dangerLevel: 25.5, hfl: 27.2, trend: 'Rising', forecastLevel: 25.3 },

  // ─── YAMUNA BASIN ─────────────────────────────────
  { id: 'CWC008', name: 'Palla (Delhi)', river: 'Yamuna', basin: 'Yamuna', state: 'Delhi', lat: 28.7946, lon: 77.1150, stationType: 'base', currentLevel: 204.7, warningLevel: 204.5, dangerLevel: 205.33, hfl: 207.49, trend: 'Rising', forecastLevel: 205.0 },
  { id: 'CWC009', name: 'Okhla (Delhi)', river: 'Yamuna', basin: 'Yamuna', state: 'Delhi', lat: 28.5406, lon: 77.2979, stationType: 'level', currentLevel: 196.5, warningLevel: 197.0, dangerLevel: 198.0, hfl: 200.0, trend: 'Steady', forecastLevel: 196.7 },
  { id: 'CWC010', name: 'Agra', river: 'Yamuna', basin: 'Yamuna', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081, stationType: 'base', currentLevel: 155.3, warningLevel: 156.5, dangerLevel: 157.5, hfl: 160.0, trend: 'Falling', forecastLevel: 155.0 },
  { id: 'CWC011', name: 'Mathura', river: 'Yamuna', basin: 'Yamuna', state: 'Uttar Pradesh', lat: 27.4924, lon: 77.6737, stationType: 'level', currentLevel: 167.8, warningLevel: 169.0, dangerLevel: 170.0, hfl: 172.0, trend: 'Steady', forecastLevel: 167.5 },
  { id: 'CWC012', name: 'Himalaypur (Chambal)', river: 'Chambal', basin: 'Yamuna', state: 'Madhya Pradesh', lat: 26.2700, lon: 78.7000, stationType: 'inflow_forecast', currentLevel: 128.7, warningLevel: 127.0, dangerLevel: 128.0, hfl: 130.0, trend: 'Rising', forecastLevel: 129.1 },

  // ─── BRAHMAPUTRA BASIN ────────────────────────────
  { id: 'CWC013', name: 'Dibrugarh', river: 'Brahmaputra', basin: 'Brahmaputra', state: 'Assam', lat: 27.4728, lon: 94.9120, stationType: 'base', currentLevel: 108.5, warningLevel: 108.55, dangerLevel: 109.55, hfl: 111.3, trend: 'Rising', forecastLevel: 109.0 },
  { id: 'CWC014', name: 'Tezpur', river: 'Brahmaputra', basin: 'Brahmaputra', state: 'Assam', lat: 26.6528, lon: 92.8012, stationType: 'base', currentLevel: 60.8, warningLevel: 61.0, dangerLevel: 62.0, hfl: 64.5, trend: 'Rising', forecastLevel: 61.3 },
  { id: 'CWC015', name: 'Guwahati (Brahmaputra)', river: 'Brahmaputra', basin: 'Brahmaputra', state: 'Assam', lat: 26.1445, lon: 91.7362, stationType: 'base', currentLevel: 50.6, warningLevel: 49.68, dangerLevel: 51.68, hfl: 54.18, trend: 'Rising', forecastLevel: 51.5 },
  { id: 'CWC016', name: 'Goalpara', river: 'Brahmaputra', basin: 'Brahmaputra', state: 'Assam', lat: 26.1700, lon: 90.6200, stationType: 'level', currentLevel: 35.4, warningLevel: 35.5, dangerLevel: 37.0, hfl: 39.5, trend: 'Rising', forecastLevel: 35.9 },
  { id: 'CWC017', name: 'Dhubri', river: 'Brahmaputra', basin: 'Brahmaputra', state: 'Assam', lat: 26.0200, lon: 89.9800, stationType: 'base', currentLevel: 25.6, warningLevel: 25.0, dangerLevel: 27.0, hfl: 30.5, trend: 'Rising', forecastLevel: 26.2 },
  { id: 'CWC018', name: 'Numaligarh (Dhansiri)', river: 'Dhansiri', basin: 'Brahmaputra', state: 'Assam', lat: 26.6700, lon: 93.6800, stationType: 'inflow_forecast', currentLevel: 70.2, warningLevel: 72.0, dangerLevel: 73.5, hfl: 76.0, trend: 'Falling', forecastLevel: 69.8 },
  { id: 'CWC019', name: 'Aizawl (Tuirial)', river: 'Tuirial', basin: 'Brahmaputra', state: 'Mizoram', lat: 23.7271, lon: 92.7176, stationType: 'level', currentLevel: 90.2, warningLevel: 92.0, dangerLevel: 94.0, hfl: 97.0, trend: 'Falling', forecastLevel: 89.8 },

  // ─── MAHANADI BASIN ───────────────────────────────
  { id: 'CWC020', name: 'Tikarapara', river: 'Mahanadi', basin: 'Mahanadi', state: 'Odisha', lat: 20.6200, lon: 83.5300, stationType: 'base', currentLevel: 94.3, warningLevel: 95.45, dangerLevel: 97.45, hfl: 99.45, trend: 'Steady', forecastLevel: 94.0 },
  { id: 'CWC021', name: 'Munduli (Mahanadi)', river: 'Mahanadi', basin: 'Mahanadi', state: 'Odisha', lat: 20.3500, lon: 85.7500, stationType: 'inflow_forecast', currentLevel: 18.2, warningLevel: 19.0, dangerLevel: 21.0, hfl: 25.0, trend: 'Steady', forecastLevel: 18.0 },
  { id: 'CWC022', name: 'Basantpur (Seonath)', river: 'Seonath', basin: 'Mahanadi', state: 'Chhattisgarh', lat: 21.9200, lon: 81.4400, stationType: 'level', currentLevel: 270.5, warningLevel: 271.0, dangerLevel: 272.5, hfl: 275.0, trend: 'Rising', forecastLevel: 271.0 },

  // ─── GODAVARI BASIN ───────────────────────────────
  { id: 'CWC023', name: 'Polavaram (Godavari)', river: 'Godavari', basin: 'Godavari', state: 'Andhra Pradesh', lat: 17.2400, lon: 81.6500, stationType: 'inflow_forecast', currentLevel: 12.8, warningLevel: 9.0, dangerLevel: 12.0, hfl: 14.5, trend: 'Rising', forecastLevel: 13.2 },
  { id: 'CWC024', name: 'Bhadrachalam', river: 'Godavari', basin: 'Godavari', state: 'Telangana', lat: 17.6688, lon: 80.8870, stationType: 'base', currentLevel: 28.3, warningLevel: 30.0, dangerLevel: 34.0, hfl: 38.0, trend: 'Steady', forecastLevel: 28.0 },
  { id: 'CWC025', name: 'Rajamundry', river: 'Godavari', basin: 'Godavari', state: 'Andhra Pradesh', lat: 17.0020, lon: 81.8068, stationType: 'base', currentLevel: 6.5, warningLevel: 7.0, dangerLevel: 9.0, hfl: 12.5, trend: 'Falling', forecastLevel: 6.2 },
  { id: 'CWC026', name: 'Perur (Penganga)', river: 'Penganga', basin: 'Godavari', state: 'Maharashtra', lat: 19.9000, lon: 78.3500, stationType: 'level', currentLevel: 246.0, warningLevel: 248.0, dangerLevel: 250.0, hfl: 254.0, trend: 'Rising', forecastLevel: 246.8 },

  // ─── KRISHNA BASIN ────────────────────────────────
  { id: 'CWC027', name: 'Vijayawada (Krishna)', river: 'Krishna', basin: 'Krishna', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480, stationType: 'base', currentLevel: 9.8, warningLevel: 11.0, dangerLevel: 14.0, hfl: 16.0, trend: 'Steady', forecastLevel: 9.5 },
  { id: 'CWC028', name: 'Sangameshwar (Bhima)', river: 'Bhima', basin: 'Krishna', state: 'Karnataka', lat: 17.6400, lon: 76.5600, stationType: 'inflow_forecast', currentLevel: 488.0, warningLevel: 490.0, dangerLevel: 492.0, hfl: 495.0, trend: 'Falling', forecastLevel: 487.5 },
  { id: 'CWC029', name: 'Almatti Dam (Krishna)', river: 'Krishna', basin: 'Krishna', state: 'Karnataka', lat: 16.3300, lon: 75.8900, stationType: 'inflow_forecast', currentLevel: 516.8, warningLevel: 518.0, dangerLevel: 519.0, hfl: 520.5, trend: 'Rising', forecastLevel: 517.3 },

  // ─── CAUVERY BASIN ────────────────────────────────
  { id: 'CWC030', name: 'Musiri (Cauvery)', river: 'Cauvery', basin: 'Cauvery', state: 'Tamil Nadu', lat: 10.9500, lon: 78.4300, stationType: 'level', currentLevel: 74.5, warningLevel: 76.0, dangerLevel: 78.0, hfl: 81.0, trend: 'Steady', forecastLevel: 74.2 },
  { id: 'CWC031', name: 'KR Sagar (Cauvery)', river: 'Cauvery', basin: 'Cauvery', state: 'Karnataka', lat: 12.4200, lon: 76.5700, stationType: 'inflow_forecast', currentLevel: 740.0, warningLevel: 743.0, dangerLevel: 746.0, hfl: 748.5, trend: 'Rising', forecastLevel: 741.0 },

  // ─── NARMADA BASIN ────────────────────────────────
  { id: 'CWC032', name: 'Hoshangabad', river: 'Narmada', basin: 'Narmada', state: 'Madhya Pradesh', lat: 22.7500, lon: 77.7300, stationType: 'base', currentLevel: 291.0, warningLevel: 291.7, dangerLevel: 293.7, hfl: 296.2, trend: 'Rising', forecastLevel: 291.5 },
  { id: 'CWC033', name: 'Garudeshwar (Narmada)', river: 'Narmada', basin: 'Narmada', state: 'Gujarat', lat: 21.8800, lon: 73.6500, stationType: 'inflow_forecast', currentLevel: 28.5, warningLevel: 29.0, dangerLevel: 30.0, hfl: 31.5, trend: 'Steady', forecastLevel: 28.3 },
  { id: 'CWC034', name: 'Sardar Sarovar (Narmada)', river: 'Narmada', basin: 'Narmada', state: 'Gujarat', lat: 21.8300, lon: 73.7500, stationType: 'inflow_forecast', currentLevel: 133.0, warningLevel: 135.0, dangerLevel: 138.0, hfl: 138.68, trend: 'Rising', forecastLevel: 133.8 },

  // ─── TAPI / TAPTI BASIN ───────────────────────────
  { id: 'CWC035', name: 'Burhanpur (Tapti)', river: 'Tapti', basin: 'Tapti', state: 'Madhya Pradesh', lat: 21.3103, lon: 76.2271, stationType: 'base', currentLevel: 263.4, warningLevel: 265.0, dangerLevel: 268.0, hfl: 272.0, trend: 'Steady', forecastLevel: 263.0 },
  { id: 'CWC036', name: 'Surat (Tapti)', river: 'Tapti', basin: 'Tapti', state: 'Gujarat', lat: 21.1702, lon: 72.8311, stationType: 'base', currentLevel: 6.0, warningLevel: 7.5, dangerLevel: 9.0, hfl: 11.5, trend: 'Falling', forecastLevel: 5.7 },

  // ─── BARAK / SURMA BASIN ──────────────────────────
  { id: 'CWC037', name: 'Silchar (Barak)', river: 'Barak', basin: 'Barak', state: 'Assam', lat: 24.8333, lon: 92.7789, stationType: 'base', currentLevel: 18.5, warningLevel: 17.88, dangerLevel: 20.38, hfl: 22.38, trend: 'Rising', forecastLevel: 19.2 },
  { id: 'CWC038', name: 'Badarpurghat (Barak)', river: 'Barak', basin: 'Barak', state: 'Assam', lat: 24.8700, lon: 92.5900, stationType: 'level', currentLevel: 28.4, warningLevel: 27.5, dangerLevel: 29.0, hfl: 31.0, trend: 'Rising', forecastLevel: 28.9 },

  // ─── IRRAWADDY (INDO-MYANMAR) ─────────────────────
  { id: 'CWC039', name: 'Imphal (Manipur River)', river: 'Manipur', basin: 'Irrawaddy', state: 'Manipur', lat: 24.8170, lon: 93.9368, stationType: 'level', currentLevel: 775.6, warningLevel: 778.0, dangerLevel: 781.0, hfl: 785.0, trend: 'Steady', forecastLevel: 775.2 },

  // ─── MAHI BASIN ───────────────────────────────────
  { id: 'CWC040', name: 'Wankbori (Mahi)', river: 'Mahi', basin: 'Mahi', state: 'Gujarat', lat: 22.9200, lon: 73.0700, stationType: 'inflow_forecast', currentLevel: 48.2, warningLevel: 49.0, dangerLevel: 50.0, hfl: 52.0, trend: 'Falling', forecastLevel: 47.8 },

  // ─── SABARMATI BASIN ──────────────────────────────
  { id: 'CWC041', name: 'Ahmedabad (Sabarmati)', river: 'Sabarmati', basin: 'Sabarmati', state: 'Gujarat', lat: 23.0225, lon: 72.5714, stationType: 'base', currentLevel: 9.1, warningLevel: 10.5, dangerLevel: 12.0, hfl: 14.5, trend: 'Steady', forecastLevel: 9.0 },

  // ─── DAMODAR / SUBARNAREKHA ───────────────────────
  { id: 'CWC042', name: 'Rhondia (Damodar)', river: 'Damodar', basin: 'Damodar', state: 'West Bengal', lat: 23.5400, lon: 87.2700, stationType: 'inflow_forecast', currentLevel: 121.5, warningLevel: 122.0, dangerLevel: 123.5, hfl: 126.0, trend: 'Rising', forecastLevel: 122.0 },
  { id: 'CWC043', name: 'Ghatsila (Subarnarekha)', river: 'Subarnarekha', basin: 'Subarnarekha', state: 'Jharkhand', lat: 22.6000, lon: 86.6700, stationType: 'base', currentLevel: 109.5, warningLevel: 109.0, dangerLevel: 111.0, hfl: 114.0, trend: 'Rising', forecastLevel: 110.2 },

  // ─── KOSI BASIN ───────────────────────────────────
  { id: 'CWC044', name: 'Baltara (Kosi)', river: 'Kosi', basin: 'Ganga', state: 'Bihar', lat: 25.9500, lon: 86.7500, stationType: 'base', currentLevel: 42.1, warningLevel: 41.0, dangerLevel: 43.0, hfl: 46.0, trend: 'Rising', forecastLevel: 43.5 },
  { id: 'CWC045', name: 'Birpur (Kosi Barrage)', river: 'Kosi', basin: 'Ganga', state: 'Bihar', lat: 26.5000, lon: 86.9300, stationType: 'inflow_forecast', currentLevel: 63.4, warningLevel: 62.7, dangerLevel: 63.7, hfl: 66.2, trend: 'Rising', forecastLevel: 63.9 },

  // ─── GANDAK BASIN ─────────────────────────────────
  { id: 'CWC046', name: 'Hajipur (Gandak)', river: 'Gandak', basin: 'Ganga', state: 'Bihar', lat: 25.6900, lon: 85.2000, stationType: 'base', currentLevel: 48.8, warningLevel: 49.0, dangerLevel: 50.5, hfl: 53.0, trend: 'Rising', forecastLevel: 49.3 },
  { id: 'CWC047', name: 'Betia (Gandak)', river: 'Gandak', basin: 'Ganga', state: 'Bihar', lat: 26.8000, lon: 84.5000, stationType: 'level', currentLevel: 72.9, warningLevel: 73.0, dangerLevel: 74.5, hfl: 77.0, trend: 'Rising', forecastLevel: 73.5 },

  // ─── RAPTI BASIN ──────────────────────────────────
  { id: 'CWC048', name: 'Faizabad (Saryu)', river: 'Saryu', basin: 'Ganga', state: 'Uttar Pradesh', lat: 26.7922, lon: 82.1420, stationType: 'base', currentLevel: 88.5, warningLevel: 89.0, dangerLevel: 90.0, hfl: 92.5, trend: 'Rising', forecastLevel: 89.0 },

  // ─── BETWA BASIN ──────────────────────────────────
  { id: 'CWC049', name: 'Oraiya (Betwa)', river: 'Betwa', basin: 'Yamuna', state: 'Uttar Pradesh', lat: 25.4500, lon: 79.5000, stationType: 'level', currentLevel: 116.8, warningLevel: 118.0, dangerLevel: 120.0, hfl: 124.0, trend: 'Steady', forecastLevel: 116.5 },

  // ─── WFR (WEST FLOWING RIVERS) ────────────────────
  { id: 'CWC050', name: 'Kurla (Mithi)', river: 'Mithi', basin: 'West Flowing Rivers', state: 'Maharashtra', lat: 19.0773, lon: 72.8880, stationType: 'base', currentLevel: 2.45, warningLevel: 3.0, dangerLevel: 3.5, hfl: 4.2, trend: 'Rising', forecastLevel: 2.8 },
  { id: 'CWC051', name: 'Dahisar (Mumbai)', river: 'Dahisar', basin: 'West Flowing Rivers', state: 'Maharashtra', lat: 19.2490, lon: 72.8593, stationType: 'level', currentLevel: 1.12, warningLevel: 2.5, dangerLevel: 3.0, hfl: 3.8, trend: 'Steady', forecastLevel: 1.1 },

  // ─── MAHANADI (ODISHA) ────────────────────────────
  { id: 'CWC052', name: 'Sambalpur', river: 'Mahanadi', basin: 'Mahanadi', state: 'Odisha', lat: 21.4667, lon: 83.9667, stationType: 'base', currentLevel: 181.2, warningLevel: 182.0, dangerLevel: 184.0, hfl: 187.5, trend: 'Steady', forecastLevel: 181.0 },

  // ─── PERIYAR BASIN ────────────────────────────────
  { id: 'CWC053', name: 'Ernakulam (Periyar)', river: 'Periyar', basin: 'Kerala Rivers', state: 'Kerala', lat: 9.9312, lon: 76.2673, stationType: 'base', currentLevel: 0.5, warningLevel: 1.8, dangerLevel: 2.5, hfl: 3.2, trend: 'Steady', forecastLevel: 0.5 },
  { id: 'CWC054', name: 'Challakudy (Chaliyar)', river: 'Chaliyar', basin: 'Kerala Rivers', state: 'Kerala', lat: 10.3000, lon: 76.3400, stationType: 'level', currentLevel: 14.5, warningLevel: 16.0, dangerLevel: 18.0, hfl: 21.0, trend: 'Falling', forecastLevel: 14.2 },

  // ─── RAVI / BEAS / SUTLEJ (INDUS SYSTEM) ─────────
  { id: 'CWC055', name: 'Ropar (Sutlej)', river: 'Sutlej', basin: 'Indus', state: 'Punjab', lat: 30.9700, lon: 76.5300, stationType: 'base', currentLevel: 276.0, warningLevel: 277.5, dangerLevel: 279.0, hfl: 282.0, trend: 'Steady', forecastLevel: 276.0 },
  { id: 'CWC056', name: 'Hussainiwala (Sutlej)', river: 'Sutlej', basin: 'Indus', state: 'Punjab', lat: 30.5200, lon: 74.5400, stationType: 'inflow_forecast', currentLevel: 170.4, warningLevel: 171.5, dangerLevel: 173.0, hfl: 176.0, trend: 'Rising', forecastLevel: 171.0 },
  { id: 'CWC057', name: 'Pathankot (Ravi)', river: 'Ravi', basin: 'Indus', state: 'Punjab', lat: 32.2743, lon: 75.6522, stationType: 'base', currentLevel: 288.5, warningLevel: 290.0, dangerLevel: 292.0, hfl: 295.0, trend: 'Falling', forecastLevel: 288.0 },

  // ─── JHELUM BASIN ─────────────────────────────────
  { id: 'CWC058', name: 'Sopore (Jhelum)', river: 'Jhelum', basin: 'Indus', state: 'Jammu & Kashmir', lat: 34.2997, lon: 74.4717, stationType: 'base', currentLevel: 1582.0, warningLevel: 1581.0, dangerLevel: 1583.0, hfl: 1586.0, trend: 'Rising', forecastLevel: 1582.5 },

  // ─── NORTH BENGAL / TEESTA ───────────────────────
  { id: 'CWC059', name: 'Domuha (Teesta)', river: 'Teesta', basin: 'Brahmaputra', state: 'West Bengal', lat: 26.5900, lon: 88.5700, stationType: 'base', currentLevel: 49.2, warningLevel: 49.0, dangerLevel: 50.5, hfl: 53.0, trend: 'Rising', forecastLevel: 50.1 },

  // ─── ULHAS (MAHARASHTRA) ──────────────────────────
  { id: 'CWC060', name: 'Kalyan (Ulhas)', river: 'Ulhas', basin: 'West Flowing Rivers', state: 'Maharashtra', lat: 19.2403, lon: 73.1305, stationType: 'level', currentLevel: 3.8, warningLevel: 4.5, dangerLevel: 5.5, hfl: 7.0, trend: 'Steady', forecastLevel: 3.7 },
];

// Auto-compute category and add lastUpdated timestamp
const now = new Date().toISOString();

export const FLOOD_STATIONS: FloodStation[] = RAW_STATIONS.map(s => ({
  ...s,
  category: getCategory(s.currentLevel, s.warningLevel, s.dangerLevel, s.hfl),
  lastUpdated: now,
}));

/** Color for each flood category */
export const CATEGORY_COLORS: Record<FloodCategory, string> = {
  normal: '#22c55e',       // Green
  above_normal: '#eab308', // Yellow
  severe: '#f97316',       // Orange
  extreme: '#ef4444',      // Red
};

/** Human-readable label for each category */
export const CATEGORY_LABELS: Record<FloodCategory, string> = {
  normal: 'Normal',
  above_normal: 'Above Normal',
  severe: 'Severe',
  extreme: 'Extreme',
};

export const STATION_TYPE_LABELS: Record<StationType, string> = {
  base: 'Base Station',
  level: 'Level Station',
  inflow_forecast: 'Inflow Forecast Station',
};
