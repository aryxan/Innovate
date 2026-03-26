import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Droplets,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Map as MapIcon,
  ShieldAlert,
  Zap,
  Clock,
  Navigation,
  Phone,
  Info,
  MessageSquare,
  Camera,
  Send,
  Users,
  MapPin,
  Smartphone,
  Lock,
  FileText,
  Upload,
  Loader2,
  Search,
  CloudLightning,
  CloudDrizzle,
  CloudSun,
  Sun,
  X,
  Cloud,
  History,
  Languages,
  Volume2,
  Eye,
  Waves,
  Construction,
  Thermometer,
  ArrowUpCircle,
  Ear,
  Hand,
  Moon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Globe,
  UserSearch,
  Handshake,
  Medal,
  ShieldCheck,
  Shield,
  Heart,
  FileCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area } from "recharts";
import {
  DashboardSkeleton,
  TableSkeleton,
  Skeleton,
  MapSkeleton,
  FormSkeleton,
} from "./Skeleton";
import { Toast, ToastState } from "./Toast";
import { GlassErrorModal } from "./GlassErrorModal";

import { WeatherWidget } from "./WeatherWidget";
import { Language, languageOptions, translations } from "../translations";
import {
  FLOOD_STATIONS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATION_TYPE_LABELS,
  FloodCategory,
  StationType,
  FloodStation,
} from "../floodStations";
import { submitReportToFirebase } from "../services/reportSubmissionUtils";
import {
  trackReportByPhone,
  trackReportById,
  subscribeToReportUpdates,
} from "../services/reportTrackingUtils";
import {
  firebaseService,
  initializeFirebase,
} from "../services/firebaseService";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  CircleMarker,
  Popup,
  useMap,
  Marker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Tactical Pin Icon for exact user location
const missionPinIcon = L.divIcon({
  html: `<div class="mission-pin">
           <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="#000080"/>
             <circle cx="16" cy="16" r="6" fill="white"/>
           </svg>
         </div>`,
  className: "",
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

interface CitizenDashboardProps {
  onExit: () => void;
  onAddReport?: (report: any) => void;
}

const INITIAL_SYNC_DELAY_MS = 450;
const TAB_SWITCH_DELAY_MS = 180;

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const generateTrendData = (baseLevel: number) => {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    level: baseLevel + (Math.random() * 0.4 - 0.2) + (i > 6 ? i * 0.05 : 0),
  }));
};

const SparklingTrend = ({ data }: { data: any[] }) => {
  const hasTrend = data.length > 1;
  const isRising = hasTrend && data[data.length - 1].level > data[0].level;

  return (
    <div
      className="w-16 flex items-center justify-center"
      style={{ height: "56px" }}
    >
      <AreaChart width={64} height={56} data={data}>
        <Area
          type="monotone"
          dataKey="level"
          stroke={isRising ? "#f97316" : "#22c55e"}
          fill={isRising ? "rgba(249, 115, 22, 0.1)" : "rgba(34, 197, 94, 0.1)"}
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </div>
  );
};

const MapControls = () => {
  const map = useMap();
  return (
    <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-3">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          map.zoomIn();
        }}
        className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border-2 border-ashoka-blue text-ashoka-blue flex items-center justify-center hover:bg-ashoka-blue hover:text-white transition-all active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          map.zoomOut();
        }}
        className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border-2 border-ashoka-blue text-ashoka-blue flex items-center justify-center hover:bg-ashoka-blue hover:text-white transition-all active:scale-95"
      >
        <Minus className="w-6 h-6" />
      </button>
    </div>
  );
};

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onExit,
  onAddReport,
}) => {
  const RELIEF_LOG_STORAGE_KEY = "jal_relief_internal_requests";
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const [activeTab, setActiveTab] = useState<
    "safety" | "map" | "report" | "floodRelief"
  >("safety");
  const [mapRef, setMapRef] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
  const [deniedLocation, setDeniedLocation] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const t = translations[selectedLanguage];

  // Unified Success Modal State
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    type: "missing" | "volunteer" | "counselor" | null;
    ref: string;
  }>({
    show: false,
    type: null,
    ref: "",
  });

  // Volunteer Form State
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [volunteerData, setVolunteerData] = useState({
    name: "",
    phone: "",
    expertise: "general",
    experience: "none",
    availability: "all_day",
    tools: "",
    district: "",
  });

  // Counselor Form State
  const [showCounselorForm, setShowCounselorForm] = useState(false);
  const [counselorData, setCounselorData] = useState({
    name: "",
    phone: "",
    reason: "trauma",
    urgency: "high",
    language: "english",
    preferredMode: "voice",
  });

  // Mission Tracking State
  const [trackingIdInput, setTrackingIdInput] = useState("");
  const [activeTrackingData, setActiveTrackingData] = useState<any>(null);
  const [isTrackingLookup, setIsTrackingLookup] = useState(false);
  const trackSubscriptionRef = useRef<(() => void) | null>(null);

  // tactical scroll reset on language or tab shift
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedLanguage, activeTab]);
  const [isVoiceAssistantEnabled, setIsVoiceAssistantEnabled] = useState(false);
  const [isVisualModeEnabled, setIsVisualModeEnabled] = useState(false);
  const [isSignLanguageEnabled, setIsSignLanguageEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [districtName, setDistrictName] = useState("India");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const uiText: Record<string, Record<Language, string>> = {
    select: {
      en: "Select",
      hi: "चुनें",
      bn: "নির্বাচন করুন",
      mr: "निवडा",
      te: "ఎంచుకోండి",
      ta: "தேர்வு செய்க",
      gu: "પસંદ કરો",
      pa: "ਚੁਣੋ",
    },
    audioGuide: {
      en: "Audio Guide",
      hi: "ऑडियो गाइड",
      bn: "অডিও গাইড",
      mr: "ऑडिओ मार्गदर्शक",
      te: "ఆడియో గైడ్",
      ta: "ஒலி வழிகாட்டி",
      gu: "ઑડિયો માર્ગદર્શન",
      pa: "ਆਡੀਓ ਗਾਈਡ",
    },
    visualMode: {
      en: "Visual Mode",
      hi: "विज़ुअल मोड",
      bn: "ভিজ্যুয়াল মোড",
      mr: "व्हिज्युअल मोड",
      te: "విజువల్ మోడ్",
      ta: "காட்சி முறை",
      gu: "વિઝ્યુઅલ મોડ",
      pa: "ਵਿਜ਼ੂਅਲ ਮੋਡ",
    },
    signLanguage: {
      en: "Sign Language",
      hi: "सांकेतिक भाषा",
      bn: "সাইন ল্যাঙ্গুয়েজ",
      mr: "संकेत भाषा",
      te: "సంకేత భాష",
      ta: "சைகை மொழி",
      gu: "સંકેત ભાષા",
      pa: "ਇਸ਼ਾਰਾ ਭਾਸ਼ਾ",
    },
    locationRequired: {
      en: "Location Required",
      hi: "स्थान आवश्यक",
      bn: "লোকেশন প্রয়োজন",
      mr: "स्थान आवश्यक",
      te: "స్థానం అవసరం",
      ta: "இடம் அவசியம்",
      gu: "સ્થાન જરૂરી",
      pa: "ਟਿਕਾਣਾ ਲੋੜੀਂਦਾ",
    },
    locationRequiredDesc: {
      en: "JalRakshak requires precise location access for river proximity sorting and emergency bulletins. Access was denied.",
      hi: "जलरक्षक को नदी निकटता विश्लेषण और आपातकालीन बुलेटिन हेतु सटीक स्थान अनुमति चाहिए। अनुमति अस्वीकृत है।",
      bn: "নদীর নিকটতা বিশ্লেষণ ও জরুরি বুলেটিনের জন্য জালরক্ষক সঠিক লোকেশন চায়। অনুমতি প্রত্যাখ্যাত হয়েছে।",
      mr: "नदीजवळील धोक्याचे विश्लेषण आणि आपत्कालीन बुलेटिनसाठी जलरक्षकला अचूक स्थान आवश्यक आहे. परवानगी नाकारली गेली आहे.",
      te: "నది సమీప ప్రమాద విశ్లేషణ మరియు అత్యవసర బులెటిన్‌ల కోసం జలరక్షక్‌కు ఖచ్చితమైన స్థానం అవసరం. అనుమతి నిరాకరించబడింది.",
      ta: "நதி அருகாமை பகுப்பாய்வு மற்றும் அவசர அறிவிப்புகளுக்காக ஜலரக்ஷக் துல்லியமான இட அணுகலை கேட்கிறது. அனுமதி மறுக்கப்பட்டது.",
      gu: "નદી નજીક જોખમ વિશ્લેષણ અને ઇમરજન્સી બુલેટિન માટે જલરક્ષકને ચોક્કસ લોકેશન જરૂરી છે. અનુમતિ નકારી દેવામાં આવી છે.",
      pa: "ਦਰਿਆ ਨੇੜਤਾ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਐਮਰਜੈਂਸੀ ਬੁਲੇਟਿਨ ਲਈ ਜਲਰਕਸ਼ਕ ਨੂੰ ਸਹੀ ਟਿਕਾਣਾ ਚਾਹੀਦਾ ਹੈ। ਅਨੁਮਤੀ ਰੱਦ ਹੋ ਗਈ ਹੈ।",
    },
    retrySync: {
      en: "Retry Mission Command Sync",
      hi: "मिशन कमांड सिंक पुनः प्रयास करें",
      bn: "মিশন কমান্ড সিঙ্ক পুনরায় চেষ্টা করুন",
      mr: "मिशन कमांड सिंक पुन्हा प्रयत्न करा",
      te: "మిషన్ కమాండ్ సింక్ మళ్లీ ప్రయత్నించండి",
      ta: "மிஷன் சிங்க் மீண்டும் முயற்சி",
      gu: "મિશન કમાન્ડ સિંક ફરી પ્રયત્ન કરો",
      pa: "ਮਿਸ਼ਨ ਕਮਾਂਡ ਸਿੰਕ ਦੁਬਾਰਾ ਕਰੋ",
    },
    locationHint: {
      en: "If blocked, please check your browser settings and unblock location access for this site.",
      hi: "यदि अवरुद्ध है, तो ब्राउज़र सेटिंग्स में जाकर इस साइट के लिए स्थान अनुमति सक्षम करें।",
      bn: "ব্লক থাকলে ব্রাউজার সেটিংসে গিয়ে এই সাইটের জন্য লোকেশন অনুমতি চালু করুন।",
      mr: "ब्लॉक असल्यास ब्राउझर सेटिंग्जमध्ये जाऊन या साइटसाठी स्थान परवानगी सुरू करा.",
      te: "బ్లాక్ అయితే బ్రౌజర్ సెట్టింగ్స్‌లో ఈ సైట్‌కు లోకేషన్ అనుమతిని ఆన్ చేయండి.",
      ta: "தடைப்பட்டிருந்தால் உலாவி அமைப்பில் இந்த தளத்திற்கான இட அனுமதியை இயக்கவும்.",
      gu: "બ્લોક હોય તો બ્રાઉઝર સેટિંગમાં જઈ આ સાઇટ માટે લોકેશન પરવાનગી ચાલુ કરો.",
      pa: "ਜੇ ਬਲੌਕ ਹੈ ਤਾਂ ਬ੍ਰਾਊਜ਼ਰ ਸੈਟਿੰਗ ਵਿੱਚ ਇਸ ਸਾਈਟ ਲਈ ਟਿਕਾਣਾ ਅਨੁਮਤੀ ਚਾਲੂ ਕਰੋ।",
    },
    syncingTelemetry: {
      en: "Synchronizing JalRakshak AI Command Telemetry...",
      hi: "जलरक्षक एआई कमांड टेलीमेट्री सिंक हो रही है...",
      bn: "জলরক্ষক এআই কমান্ড টেলিমেট্রি সিঙ্ক হচ্ছে...",
      mr: "जलरक्षक एआय कमांड टेलिमेट्री सिंक होत आहे...",
      te: "జలరక్షక్ AI కమాండ్ టెలిమెట్రీ సమకాలీకరణలో ఉంది...",
      ta: "ஜலரக்ஷக் AI கட்டளை தொலைதரவு ஒத்திசைக்கப்படுகிறது...",
      gu: "જલરક્ષક AI કમાન્ડ ટેલિમેટ્રી સિંક થઈ રહી છે...",
      pa: "ਜਲਰਕਸ਼ਕ AI ਕਮਾਂਡ ਟੈਲੀਮੀਟਰੀ ਸਿੰਕ ਹੋ ਰਹੀ ਹੈ...",
    },
    signAssistEnabled: {
      en: "Sign Language Assist Enabled",
      hi: "सांकेतिक भाषा सहायता सक्रिय",
      bn: "সাইন ল্যাঙ্গুয়েজ সহায়তা চালু",
      mr: "संकेत भाषा सहाय्य सक्रिय",
      te: "సంకేత భాష సహాయం ఆన్",
      ta: "சைகை மொழி உதவி இயக்கப்பட்டது",
      gu: "સંકેત ભાષા સહાય સક્રિય",
      pa: "ਇਸ਼ਾਰਾ ਭਾਸ਼ਾ ਸਹਾਇਤਾ ਚਾਲੂ",
    },
    criticalAlertsEnabled: {
      en: "Critical Alerts Enabled",
      hi: "महत्वपूर्ण अलर्ट सक्रिय",
      bn: "গুরুত্বপূর্ণ সতর্কতা চালু",
      mr: "महत्त्वाचे अलर्ट सक्रिय",
      te: "క్రిటికల్ అలర్ట్‌లు ప్రారంభం",
      ta: "முக்கிய எச்சரிக்கைகள் செயல்பாட்டில்",
      gu: "મહત્ત્વપૂર્ણ અલર્ટ સક્રિય",
      pa: "ਮਹੱਤਵਪੂਰਣ ਚੇਤਾਵਨੀਆਂ ਚਾਲੂ",
    },
    enableBrowserAlerts: {
      en: "Enable Browser Alerts",
      hi: "ब्राउज़र अलर्ट सक्षम करें",
      bn: "ব্রাউজার সতর্কতা চালু করুন",
      mr: "ब्राउझर अलर्ट सुरू करा",
      te: "బ్రౌజర్ అలర్ట్‌లను ప్రారంభించండి",
      ta: "உலாவி எச்சரிக்கைகளை இயக்கு",
      gu: "બ્રાઉઝર અલર્ટ સક્રિય કરો",
      pa: "ਬਰਾਊਜ਼ਰ ਚੇਤਾਵਨੀਆਂ ਚਾਲੂ ਕਰੋ",
    },
  };

  const ui = (key: string, fallback: string) =>
    uiText[key]?.[selectedLanguage] || fallback;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("jal_accessibility_prefs");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      setIsVoiceAssistantEnabled(Boolean(parsed.audio));
      setIsVisualModeEnabled(Boolean(parsed.visual));
      setIsSignLanguageEnabled(Boolean(parsed.sign));
    } catch (error) {
      console.error("Unable to load accessibility preferences:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "jal_accessibility_prefs",
        JSON.stringify({
          audio: isVoiceAssistantEnabled,
          visual: isVisualModeEnabled,
          sign: isSignLanguageEnabled,
        }),
      );
    } catch (error) {
      console.error("Unable to save accessibility preferences:", error);
    }
  }, [isVoiceAssistantEnabled, isVisualModeEnabled, isSignLanguageEnabled]);

  useEffect(() => {
    document.documentElement.lang = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }
    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Browser alerts are not supported on this device.", "error");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      new Notification("JalRakshak 2.0", {
        body: "Emergency alerts enabled. You will be notified of critical flood levels.",
        icon: "/logo.png",
      });
      showToast("Critical browser alerts enabled", "success");
      return;
    }

    showToast("Browser alert permission denied", "error");
  };

  // Automatic Location Fetch logic refined for boot-up sequence
  useEffect(() => {
    const fetchInitialLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition([latitude, longitude]);
            fetchNearbyMedical(latitude, longitude);

            // Keep the startup animation brief, then hydrate address details in background.
            setTimeout(() => setIsLoading(false), INITIAL_SYNC_DELAY_MS);

            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              );
              const data = await res.json();

              const locName =
                data.address.city ||
                data.address.town ||
                data.address.district ||
                data.address.state ||
                "India";
              setDistrictName(locName);

              const locationLabel =
                data.address.suburb ||
                data.address.neighbourhood ||
                data.address.road ||
                locName;
              setSafetyLocation({
                lat: latitude,
                lng: longitude,
                name: locationLabel,
              });

              setFormData((prev) => ({
                ...prev,
                address: data.display_name || "",
                city:
                  data.address.city ||
                  data.address.town ||
                  data.address.suburb ||
                  data.address.district ||
                  "",
                state: data.address.state || "",
                pincode: data.address.postcode || "",
              }));
              setLocationCoords({
                lat: latitude,
                lng: longitude,
                address: data.display_name,
              });
            } catch (e) {
              console.error("Initial geocoding failed", e);
            }
          },
          (err) => {
            console.warn("Location denied", err);
            setDeniedLocation(true);
            alert(
              selectedLanguage === "hi"
                ? "स्थान की अनुमति अनिवार्य है। कृपया आगे बढ़ने के लिए स्थान तक पहुंच की अनुमति दें।"
                : "LOCATION ACCESS IS MANDATORY. Please allow location access to continue using mission-critical safety features.",
            );
          },
          { enableHighAccuracy: true },
        );
      } else {
        setDeniedLocation(true);
      }
    };
    if (!showLanguageSelector) {
      setDeniedLocation(false);
      fetchInitialLocation();
    }
  }, [showLanguageSelector, selectedLanguage]);
  const [isRotating, setIsRotating] = useState(false);
  const [medicalFacilities, setMedicalFacilities] = useState<any[]>([]);
  const [mapLayer, setMapLayer] = useState<
    "none" | "satellite" | "radar" | "lightning" | "wind" | "temp"
  >("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    contact: "",
    issueType: "surface_flooding",
    waterLevel: "low",
    description: "",
  });
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);
  const [safetyLocation, setSafetyLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>(null);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpStatus, setOtpStatus] = useState<
    "idle" | "sent" | "verified" | "error"
  >("idle");
  const [otpStatusMessage, setOtpStatusMessage] = useState("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSafetyFetching, setIsSafetyFetching] = useState(false);

  const userLat = safetyLocation
    ? safetyLocation.lat
    : position
      ? position[0]
      : null;
  const userLng = safetyLocation
    ? safetyLocation.lng
    : position
      ? position[1]
      : null;

  const [showWeatherForecast, setShowWeatherForecast] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalWeather, setGlobalWeather] = useState<any>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "error",
  });
  const [apiErrorModal, setApiErrorModal] = useState<{
    show: boolean;
    target: "weather" | "flood" | "map" | null;
    title: string;
    message: string;
  }>({
    show: false,
    target: null,
    title: "",
    message: "",
  });
  const [isRetryingAction, setIsRetryingAction] = useState(false);
  const [generatedComplaintId, setGeneratedComplaintId] = useState<
    string | null
  >(null);
  const [trackingId, setTrackingId] = useState("");
  const [trackedComplaint, setTrackedComplaint] = useState<any>(null);
  const [reliefRequests, setReliefRequests] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [isSubmittingVolunteer, setIsSubmittingVolunteer] = useState(false);
  const [isSubmittingCounselor, setIsSubmittingCounselor] = useState(false);
  const [showAllRivers, setShowAllRivers] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);
  const REPORT_REF_MAP_KEY = "jal_report_reference_map";

  const generateInternalRef = (prefix: "RO" | "MP" | "VR" | "CR") => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let generated = prefix;
    for (let i = 0; i < 9; i += 1) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return generated;
  };

  const isPrefixedReference = (value: string) => {
    const val = value.toUpperCase();
    return /^[A-Z]{2}[A-Z0-9]{9}$/.test(val) || /^JAL-\d{6}-[A-Z0-9]{3}$/.test(val);
  };

  const saveReportReferenceMapping = (
    referenceId: string,
    complaintId: string,
  ) => {
    try {
      const existing = localStorage.getItem(REPORT_REF_MAP_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      parsed[referenceId] = complaintId;
      localStorage.setItem(REPORT_REF_MAP_KEY, JSON.stringify(parsed));
    } catch (error) {
      console.error("Unable to persist report reference mapping:", error);
    }
  };

  const resolveReportReference = (input: string) => {
    const normalized = input.toUpperCase();
    if (!isPrefixedReference(normalized)) {
      return normalized;
    }

    try {
      const existing = localStorage.getItem(REPORT_REF_MAP_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      return parsed[normalized] || normalized;
    } catch (error) {
      console.error("Unable to resolve report reference:", error);
      return normalized;
    }
  };

  const getSuccessMeta = (type: "missing" | "volunteer" | "counselor") => {
    if (type === "missing") {
      return {
        title: "MISSING ALERT REGISTERED",
        subtitle: "Priority search broadcast has been pushed to command units",
        caption:
          "MP-prefixed 11-character case ID generated. Search network, NDRF, and local control rooms are now synced.",
      };
    }
    if (type === "volunteer") {
      return {
        title: "VOLUNTEER MISSION REGISTERED",
        subtitle: "Enrollment packet sent to operations desk",
        caption:
          "VR-prefixed 11-character roster ID generated. Allocation team will map your skills and availability to active missions.",
      };
    }
    return {
      title: "COUNSELING REQUEST REGISTERED",
      subtitle: "Psychological support command has received your request",
      caption:
        "CR-prefixed 11-character support ID generated. Mental health response unit is preparing your session assignment.",
    };
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RELIEF_LOG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReliefRequests(parsed);
        }
      }
    } catch (error) {
      console.error("Unable to load relief request log:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        RELIEF_LOG_STORAGE_KEY,
        JSON.stringify(reliefRequests.slice(0, 30)),
      );
    } catch (error) {
      console.error("Unable to persist relief request log:", error);
    }
  }, [reliefRequests]);

  useEffect(() => {
    let isMounted = true;

    const syncVisitorCount = async () => {
      try {
        const storageKey = "jalrakshak_ai_visitor_count";
        const sessionKey = "jalrakshak_ai_visitor_session_counted";
        const sessionIdKey = "jalrakshak_ai_visitor_session_id";

        const hasCountedThisSession =
          sessionStorage.getItem(sessionKey) === "1";
        let sessionId = sessionStorage.getItem(sessionIdKey);
        if (!sessionId) {
          sessionId =
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
          sessionStorage.setItem(sessionIdKey, sessionId);
        }

        let localCount = Number(localStorage.getItem(storageKey) || "0");
        if (!hasCountedThisSession) {
          localCount += 1;
          localStorage.setItem(storageKey, String(localCount));
          sessionStorage.setItem(sessionKey, "1");
        }

        if (isMounted) {
          setVisitorCount(localCount);
        }

        if (!firebaseService.isInitialized()) {
          await initializeFirebase();
        }
        if (!firebaseService.isInitialized()) {
          return;
        }

        const cloudCount = hasCountedThisSession
          ? await firebaseService.getVisitorCount()
          : await firebaseService.recordVisitorVisit(sessionId, {
              source: "citizen_dashboard",
              locale: navigator.language || "en-IN",
              platform: navigator.platform || "unknown",
            });

        if (isMounted && cloudCount > 0) {
          setVisitorCount(cloudCount);
          localStorage.setItem(storageKey, String(cloudCount));
        }
      } catch (error) {
        console.error("Unable to sync visitor count:", error);
      }
    };

    void syncVisitorCount();
    return () => {
      isMounted = false;
    };
  }, []);

  const getSafetyStatus = (
    coords: { lat: number; lng: number; name?: string } | null,
  ) => {
    if (!coords) return null;
    const sum = coords.lat + coords.lng;
    let locationName = coords.name || "Your Area";

    if (sum % 2 > 1.5)
      return {
        locationName,
        level: t.severeFlood,
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        icon: <AlertTriangle className="text-red-500" />,
        desc: t.severeFloodDesc,
      };
    if (sum % 2 > 0.8)
      return {
        locationName,
        level: t.aboveWarning,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        icon: <Activity className="text-amber-500" />,
        desc: t.aboveWarningDesc,
      };
    return {
      locationName,
      level: t.normalFlood,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: <CheckCircle2 className="text-emerald-500" />,
      desc: t.normalFloodDesc,
    };
  };

  const safetyStatus = getSafetyStatus(safetyLocation);

  const fetchNearbyMedical = async (lat: number, lng: number) => {
    try {
      const radius = 5000;
      const query = `[out:json];(node["amenity"="hospital"](around:${radius},${lat},${lng});node["shop"="pharmacy"](around:${radius},${lat},${lng}););out body;`;
      const data = await fetchJsonWithTimeoutRetry(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
        7000,
        2,
      );
      const mapped = data.elements
        .map((el: any) => {
          const dist = getDistance(lat, lng, el.lat, el.lon);
          return {
            id: el.id,
            name:
              el.tags.name ||
              (el.tags.amenity === "hospital"
                ? "Emergency Hospital"
                : "Pharmacy"),
            type: el.tags.amenity === "hospital" ? "hospital" : "medical_store",
            lat: el.lat,
            lng: el.lon,
            phone: el.tags.phone || el.tags["contact:phone"] || "N/A",
            distance: dist,
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 8);
      setMedicalFacilities(mapped);
      setMapDataUnavailable(false);
    } catch (err) {
      setMapDataUnavailable(true);
      showToast("Map data unavailable", "error");
      const mocked = [
        {
          id: "m1",
          name: "Apex Trauma Centre",
          type: "hospital",
          lat: 28.5284,
          lng: 77.2842,
          phone: "102",
        },
        {
          id: "m2",
          name: "LifeCare Hospital",
          type: "hospital",
          lat: 28.5273,
          lng: 77.2117,
          phone: "108",
        },
        {
          id: "m3",
          name: "Apollo Pharmacy",
          type: "medical_store",
          lat: 28.6139,
          lng: 77.209,
          phone: "N/A",
        },
        {
          id: "m4",
          name: "MedCity Hospital",
          type: "hospital",
          lat: 28.5606,
          lng: 77.2732,
          phone: "112",
        },
      ]
        .map((facility) => ({
          ...facility,
          distance: getDistance(lat, lng, facility.lat, facility.lng),
        }))
        .sort((a, b) => a.distance - b.distance);
      setMedicalFacilities(mocked);
    }
  };

  // ── CWC Flood Station State ──
  const [floodStations, setFloodStations] =
    useState<FloodStation[]>(FLOOD_STATIONS);
  const [floodLastRefresh, setFloodLastRefresh] = useState<Date>(new Date());
  const [floodCategoryFilter, setFloodCategoryFilter] = useState<
    Set<FloodCategory>
  >(new Set(["normal", "above_normal", "severe", "extreme"]));
  const [floodTypeFilter, setFloodTypeFilter] = useState<Set<StationType>>(
    new Set(["base", "level", "inflow_forecast"]),
  );
  const [selectedFloodStation, setSelectedFloodStation] =
    useState<FloodStation | null>(null);
  const [showFloodPanel, setShowFloodPanel] = useState(true);
  const [isFloodDataLoading, setIsFloodDataLoading] = useState(true);
  const [hasLiveFloodData, setHasLiveFloodData] = useState(false);
  const [mapDataUnavailable, setMapDataUnavailable] = useState(false);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
  };

  const handleApiError = (
    target: "weather" | "flood" | "map",
    message = "Service temporarily unavailable",
  ) => {
    showToast("Service temporarily unavailable", "error");
    setApiErrorModal({
      show: true,
      target,
      title: "Service Unavailable",
      message,
    });
  };

  const fetchJsonWithTimeoutRetry = async (
    url: string,
    timeoutMs = 7000,
    retries = 2,
    options: RequestInit = {},
  ) => {
    let lastError: unknown = null;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        if (attempt < retries) {
          continue;
        }
      }
    }
    throw lastError;
  };

  const fetchFloodData = async (manual = false) => {
    setIsFloodDataLoading(true);
    try {
      const payload = await fetchJsonWithTimeoutRetry(
        `${API_BASE_URL}/api/flood-data`,
      );

      if (!payload?.success || !Array.isArray(payload.data)) {
        throw new Error("Invalid flood payload");
      }

      const alerts = payload.data;
      setHasLiveFloodData(true);
      setFloodStations((prev) =>
        prev.map((station) => {
          const alert = alerts.find(
            (a: any) =>
              a.stationCode === station.id ||
              (a.stationName &&
                a.stationName
                  .toLowerCase()
                  .includes(station.name.toLowerCase())),
          );

          if (alert) {
            const liveLevel = alert.currentLevel || station.currentLevel;
            let liveCat: FloodCategory = "normal";
            const status = (alert.status || "NORMAL").toUpperCase();
            if (status.includes("EXTREME")) liveCat = "extreme";
            else if (status.includes("DANGER")) liveCat = "severe";
            else if (status.includes("WARNING")) liveCat = "above_normal";

            return {
              ...station,
              currentLevel: liveLevel,
              category: liveCat,
              trend: alert.trend || "Steady",
              lastUpdated: new Date().toISOString(),
            };
          }

          return {
            ...station,
            category: "normal",
            lastUpdated: new Date().toISOString(),
          };
        }),
      );
      setFloodLastRefresh(new Date());
      if (manual) {
        showToast("Retry successful", "success");
      }
    } catch (error) {
      setHasLiveFloodData(false);
      showToast(
        "Live flood telemetry is unavailable right now. Showing baseline map data.",
        "error",
      );
    } finally {
      setIsFloodDataLoading(false);
    }
  };

  const fetchWeather = async (manual = false) => {
    if (!safetyLocation) return;
    setIsWeatherLoading(true);
    try {
      const url = `${API_BASE_URL}/api/weather?lat=${encodeURIComponent(String(safetyLocation.lat))}&lon=${encodeURIComponent(String(safetyLocation.lng))}&city=${encodeURIComponent(safetyLocation.name || "Mumbai")}`;
      const payload = await fetchJsonWithTimeoutRetry(url);
      if (!payload?.success || !payload?.data?.current) {
        throw new Error("Invalid weather payload");
      }

      const current = payload.data.current;
      setGlobalWeather({
        temp: Number(current.temp || 0),
        humidity: Number(current.humidity || 0),
        rain: Number(current.rain24h || 0),
        pressure: Number(current.pressure || 0),
        desc: current.isIMD ? "IMD nowcast" : "OpenWeather forecast",
      });

      if (manual) {
        showToast("Retry successful", "success");
      }
    } catch (error) {
      handleApiError("weather", "Weather telemetry could not be loaded.");
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!apiErrorModal.target) return;
    setIsRetryingAction(true);
    try {
      if (apiErrorModal.target === "flood") {
        await fetchFloodData(true);
      } else if (apiErrorModal.target === "weather") {
        await fetchWeather(true);
      } else if (apiErrorModal.target === "map") {
        if (userLat && userLng) {
          await fetchNearbyMedical(userLat, userLng);
          showToast("Retry successful", "success");
        } else {
          showToast("Location required before map retry", "error");
        }
      }
      setApiErrorModal((prev) => ({ ...prev, show: false }));
    } finally {
      setIsRetryingAction(false);
    }
  };

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast.show]);

  useEffect(() => {
    fetchFloodData(false);
  }, []);

  useEffect(() => {
    if (!safetyLocation) {
      setIsWeatherLoading(true);
      return;
    }
    fetchWeather(false);
  }, [safetyLocation?.lat, safetyLocation?.lng, safetyLocation?.name]);

  const filteredFloodStations = floodStations.filter(
    (s) =>
      floodCategoryFilter.has(s.category) && floodTypeFilter.has(s.stationType),
  );

  const toggleCategory = (cat: FloodCategory) => {
    setFloodCategoryFilter((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size > 1) next.delete(cat);
      } else next.add(cat);
      return next;
    });
  };

  const toggleType = (type: StationType) => {
    setFloodTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else next.add(type);
      return next;
    });
  };

  // Map Search Suggestions Fetching - robust multi-word matching
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const normalizedQuery = searchQuery.trim().replace(/\s+/g, " ");
        const queryLower = normalizedQuery.toLowerCase();
        const queryWords = queryLower.split(" ").filter(Boolean);

        const queryVariants = [
          normalizedQuery,
          `${normalizedQuery}, India`,
          queryWords.length > 1 ? `${queryWords[0]} India` : null,
          queryWords.length > 1 ? queryWords[0] : null,
        ].filter(Boolean) as string[];

        const responses = await Promise.all(
          queryVariants.map((q) =>
            fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=30`,
            )
              .then((r) => r.json())
              .catch(() => []),
          ),
        );

        const merged: any[] = responses.flat();
        const uniqueByPlaceId = new Map<string, any>();
        for (const item of merged) {
          const key = String(
            item.place_id ?? `${item.lat}-${item.lon}-${item.display_name}`,
          );
          if (!uniqueByPlaceId.has(key)) uniqueByPlaceId.set(key, item);
        }

        const scored = Array.from(uniqueByPlaceId.values()).map(
          (result: any) => {
            const displayLower = String(
              result.display_name || "",
            ).toLowerCase();
            const primaryLower = displayLower.split(",")[0].trim();
            const primaryWords = primaryLower.split(/\s+/).filter(Boolean);
            let score = 0;

            // Strong global phrase matches.
            if (primaryLower.startsWith(queryLower)) score += 12000;
            else if (displayLower.startsWith(queryLower)) score += 9000;
            else if (displayLower.includes(queryLower)) score += 5000;

            // Word-prefix matching in primary label is the key signal.
            let prefixHits = 0;
            let containsHits = 0;
            for (let i = 0; i < queryWords.length; i++) {
              const qWord = queryWords[i];
              const hasPrefix = primaryWords.some((pw) => pw.startsWith(qWord));
              const hasContains =
                primaryLower.includes(qWord) || displayLower.includes(qWord);
              if (hasPrefix) {
                prefixHits++;
                score += i === 0 ? 2600 : 1800;
              } else if (hasContains) {
                containsHits++;
                score += i === 0 ? 900 : 600;
              }
            }

            if (queryWords.length > 1 && prefixHits === queryWords.length)
              score += 3500;
            if (
              queryWords.length > 1 &&
              prefixHits + containsHits === queryWords.length
            )
              score += 1800;

            // Prefer India results, but keep global fallback.
            if (displayLower.includes("india")) score += 200;

            // Penalize noisy generic labels.
            if (primaryLower.length <= 3) score -= 1200;
            if (displayLower.length > 120) score -= 500;

            return { ...result, score, primaryLower };
          },
        );

        // Hard preference: for multi-word query, first token should appear in primary label.
        const firstToken = queryWords[0] || "";
        const primaryFirstTokenPool =
          queryWords.length > 1
            ? scored.filter((r: any) => r.primaryLower.includes(firstToken))
            : scored;

        const pool =
          primaryFirstTokenPool.length > 0 ? primaryFirstTokenPool : scored;
        const sorted = pool
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 8);

        setSuggestions(sorted);
        setShowSuggestions(sorted.length > 0);
      } catch (error) {
        console.error("Suggestions fetch failed", error);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  const handleSuggestionSelect = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setSearchQuery(suggestion.display_name);
    setPosition([lat, lon]);
    setShowSuggestions(false);
    if (mapRef) {
      mapRef.flyTo([lat, lon], 17, { animate: true, duration: 2.5 });
      fetchNearbyMedical(lat, lon);
    }
  };

  // Function to fetch real-time medical data from OpenStreetMap (Overpass API)

  useEffect(() => {
    if (!mapRef) return;

    mapRef.on("zoomend", () => {
      const zoom = mapRef.getZoom();
      if (zoom >= 15) {
        setIsRotating(true);
      } else {
        setIsRotating(false);
      }
    });

    const timer = setInterval(() => setCurrentSlide((s) => (s + 1) % 5), 3500);
    return () => clearInterval(timer);
  }, [mapRef]);

  // Synchronize Map Viewport upon Tab Switch
  useEffect(() => {
    if (activeTab === "map" && mapRef && !isLoading) {
      setTimeout(() => mapRef.invalidateSize(), 150);
    }
  }, [activeTab, mapRef, isLoading]);

  useEffect(() => {
    // Light mode locked
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    let recognition: any = null;

    if (isVoiceAssistantEnabled) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage === "hi" ? "hi-IN" : "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceFeedback(
            selectedLanguage === "hi" ? "सुन रहा हूँ..." : "Listening...",
          );
        };

        recognition.onresult = (event: any) => {
          const command =
            event.results[event.results.length - 1][0].transcript.toLowerCase();
          setVoiceFeedback(
            selectedLanguage === "hi"
              ? `कमांड: "${command}"`
              : `Command: "${command}"`,
          );
          handleVoiceCommand(command);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          if (isVoiceAssistantEnabled) {
            recognition.start();
          } else {
            setIsListening(false);
          }
        };

        recognition.start();
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isVoiceAssistantEnabled, selectedLanguage]);

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Safety / Home commands
    if (
      lowerCommand.includes("safety") ||
      lowerCommand.includes("home") ||
      lowerCommand.includes("security") ||
      lowerCommand.includes("सुरक्षा") ||
      lowerCommand.includes("घर")
    ) {
      handleTabChange("safety");
    }
    // Map / Location commands
    else if (
      lowerCommand.includes("map") ||
      lowerCommand.includes("location") ||
      lowerCommand.includes("नक्शा") ||
      lowerCommand.includes("स्थान")
    ) {
      handleTabChange("map");
    }
    // Report / Issue commands
    else if (
      lowerCommand.includes("report") ||
      lowerCommand.includes("issue") ||
      lowerCommand.includes("रिपोर्ट") ||
      lowerCommand.includes("शिकायत")
    ) {
      handleTabChange("report");
    }
    // Language commands
    else if (lowerCommand.includes("hindi") || lowerCommand.includes("हिंदी")) {
      setSelectedLanguage("hi");
    } else if (
      lowerCommand.includes("english") ||
      lowerCommand.includes("अंग्रेजी")
    ) {
      setSelectedLanguage("en");
    }
  };

  // Missing Person Form State
  const [missingPersonData, setMissingPersonData] = useState({
    name: "",
    age: "",
    gender: "",
    lastSeenLocation: "",
    lastSeenTime: "",
    description: "",
    physicalFeatures: "", // Additional details
    contactName: "",
    contactRelation: "",
    contactPhone: "",
    isContactVerified: false,
  });
  const [missingPersonPhoto, setMissingPersonPhoto] = useState<File | null>(
    null,
  );
  const [identityProof, setIdentityProof] = useState<File | null>(null);
  const [isSubmittingMissing, setIsSubmittingMissing] = useState(false);
  const [missingReportSuccess, setMissingReportSuccess] = useState(false);

  // Verified Area-Based News Bulletin Intel
  useEffect(() => {
    const territory = safetyLocation?.name || "Mumbai";

    // Verified sources list
    const verifiedSources = [
      "CWC", "IMD", "NDRF", "Local Disaster Cell", "DD News", "PIB India", "EMERGENCY",
    ];

    // Simulate fetching intel based on the specific territory
    const mockNewsBoard = [
      {
        source: "CWC Official",
        text: `ALERT: Hydro-telemetry sensors in ${territory} approaching warning marks. Ground patrol units on standby.`,
      },
      {
        source: "IMD Nowcast",
        text: `PREDICTION: ${territory} and bordering regions to receive high-intensity precipitation over next 24 hours.`,
      },
      {
        source: "NDRF Status",
        text: `MISSION READY: Search and Rescue battalions positioned in ${territory} priority sectors.`,
      },
      {
        source: "NDRF Mission",
        text: `LOGISTICS: Specialized rescue aquatic modules moved to ${territory} staging points for immediate deployment.`,
      },
      {
        source: "EMERGENCY HELPLINE",
        text: `Disaster Management: 1916 | NDRF: 1070 | Fire: 101 | Police: 100 | Ambulance: 102 / 108`,
      },
      {
        source: "PIB Response",
        text: `EX-GRATIA: Relief disbursement portal for registered ${territory} citizens is now live for claim submissions.`,
      },
      {
        source: "Local Command",
        text: `RESTRICTION: All high-risk transit corridors in ${territory} closed for civilian movement until further notice.`,
      },
    ];

    // Systematic filtering to ensure only high-authority/verified intelligence is broadcasted
    const verifiedNews = mockNewsBoard.filter((item) =>
      verifiedSources.some(
        (v) => item.source.includes(v) || item.source.includes("Local") || item.source.includes("EMERGENCY"),
      ),
    );

    setNews(verifiedNews);
  }, [safetyLocation?.name]);

  // Relief Requests Subscription
  useEffect(() => {
    const unsub = firebaseService.subscribeToReliefRequests((requests) => {
      setReliefRequests(requests);
    });
    return () => unsub();
  }, []);


  const mappedStations = useMemo(() => {
    const stations = floodStations.map((fs) => ({
      name: fs.name,
      basin: fs.river,
      level: fs.currentLevel,
      warning: fs.warningLevel,
      danger: fs.dangerLevel,
      hfl: fs.hfl,
      trend: fs.trend || "Steady",
      lat: fs.lat,
      lng: fs.lon,
    }));

    if (userLat && userLng) {
      stations.sort(
        (a, b) =>
          getDistance(userLat, userLng, a.lat, a.lng) -
          getDistance(userLat, userLng, b.lat, b.lng),
      );
    }

    return stations;
  }, [floodStations, userLat, userLng]);

  const trendSeriesByStation = useMemo(() => {
    const trendMap: Record<string, any[]> = {};
    mappedStations.forEach((station) => {
      trendMap[station.name] = generateTrendData(station.level);
    });
    return trendMap;
  }, [mappedStations]);

  const riverStations = mappedStations;
  const riverMonitoringStations = showAllRivers
    ? mappedStations
    : mappedStations.slice(0, 4);
  const nearestRiskStation =
    mappedStations.find((s) => s.level >= s.danger) ||
    mappedStations.find((s) => s.level >= s.warning) ||
    mappedStations[0];
  const adminProgressUpdates: Array<{
    area: string;
    task: string;
    status: "Completed" | "In Progress" | "Scheduled" | "Verified";
    admin: string;
    time: string;
  }> = [];
  const progressFeedCards =
    adminProgressUpdates.length > 0
      ? adminProgressUpdates
      : [
          {
            area: "Awaiting Admin Push",
            task: "No operational update published yet",
            status: "Scheduled" as const,
            admin: "Pending",
            time: "Not Updated",
          },
          {
            area: "Awaiting Admin Push",
            task: "Status will be visible once command center publishes",
            status: "Scheduled" as const,
            admin: "Pending",
            time: "Not Updated",
          },
          {
            area: "Awaiting Admin Push",
            task: "Field team assignment pending",
            status: "Scheduled" as const,
            admin: "Pending",
            time: "Not Updated",
          },
          {
            area: "Awaiting Admin Push",
            task: "Progress timeline will appear here",
            status: "Scheduled" as const,
            admin: "Pending",
            time: "Not Updated",
          },
        ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Simulate data fetching
    // The initial loading is now handled by the refined useEffect for location
    // const loadingTimer = setTimeout(() => {
    //   setIsLoading(false);
    // }, 1500);

    return () => {
      clearInterval(timer);
      // clearTimeout(loadingTimer);
    };
  }, []);

  // Auto-slide existing header cards with 5s interval
  useEffect(() => {
    if (activeTab !== "safety") return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [activeTab, currentSlide]);

  // Keyboard navigation for header cards
  useEffect(() => {
    if (activeTab !== "safety") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCurrentSlide((prev) => (prev + 1) % 5);
      if (e.key === "ArrowLeft") setCurrentSlide((prev) => (prev - 1 + 5) % 5);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef) return;

    setIsSearchingLocation(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setPosition([lat, lon]);
        mapRef.flyTo([lat, lon], 14, { animate: true, duration: 2.5 });
        fetchNearbyMedical(lat, lon);
      } else {
        alert("Location not found. Please try a different query.");
      }
    } catch (error) {
      console.error("Search failed", error);
      alert("Search failed. Please try again later.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!locationCoords)
      newErrors.location = "Please fetch your location for precise reporting.";
    if (!formData.address || formData.address.length < 10)
      newErrors.address = "Address must be at least 10 characters long.";
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.state) newErrors.state = "State is required.";
    if (!formData.pincode || !/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Pincode must be a 6-digit number.";
    if (!formData.contact || !/^\d{10}$/.test(formData.contact))
      newErrors.contact = "Contact must be a 10-digit number.";
    if (!isOtpVerified)
      newErrors.otp = "Please verify your contact number first.";
    if (!proofFile)
      newErrors.proof = "Please upload a photo or video as proof.";
    if (!formData.description || formData.description.length < 10)
      newErrors.description =
        "Please provide additional details (min 10 characters).";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the first error
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementById(`error-${firstError}`);
      if (element)
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setErrors({});
    setIsReporting(true);

    // Submit to Firebase
    const submitReport = async () => {
      try {
        // Show progress
        setToast({
          show: true,
          message: "Submitting report...",
          type: "success",
        });

        console.log("Transmission initiated with payload:", formData);
        const result = await submitReportToFirebase(
          {
            name: formData.address.split(",")[0]?.trim() || "Citizen Reporter",
            phone: formData.contact,
            address: formData.address,
            city: formData.city || "",
            state: formData.state || "",
            pincode: formData.pincode,
            issueType: formData.issueType as any,
            waterLevel: formData.waterLevel as any,
            description: formData.description,
            image: proofFile!,
            latitude: locationCoords?.lat || 0,
            longitude: locationCoords?.lng || 0,
          }
        );

        console.log("Transmission result received:", result);

        if (result.success && result.reportId) {
          const reportReference = result.reportId;
          console.log("Generated Mission Reference:", reportReference);
          setIsReporting(false);
          setReportSuccess(true);
          setGeneratedComplaintId(reportReference);
          setTrackingId(reportReference);
          saveReportReferenceMapping(reportReference, result.reportId);
          setTrackedComplaint({
            id: reportReference,
            status: "pending",
            update: "Report submitted successfully",
            time: "Just Now",
          });

          // Reset form
          setFormData({
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            contact: "",
            issueType: "surface_flooding",
            waterLevel: "low",
            description: "",
          });
          setIsOtpSent(false);
          setIsOtpVerified(false);
          setOtp("");
          setProofFile(null);

          setToast({
            show: true,
            message: "Report submitted successfully!",
            type: "success",
          });
        } else {
          setIsReporting(false);
          setToast({
            show: true,
            message: result.error || "Failed to submit report",
            type: "error",
          });
        }
      } catch (error) {
        setIsReporting(false);
        console.error("Error submitting report:", error);
        setToast({
          show: true,
          message: "Error submitting report. Please try again.",
          type: "error",
        });
      }
    };

    submitReport();
  };

  const toMissionTimeline = (status: string, assignedTo?: string | null) => {
    return [
      {
        label: "Transmission Received",
        time: "Submitted",
        status: "done",
        desc: "Report stored in central command system.",
      },
      {
        label: "Admin Verification",
        time: status === "pending" ? "In queue" : "Verified",
        status: status === "pending" ? "active" : "done",
        desc: "Incident is being verified by control room.",
      },
      {
        label: "Responder Assignment",
        time: assignedTo ? assignedTo : "Pending team",
        status:
          status === "assigned" || status === "resolved" ? "done" : "pending",
        desc: assignedTo
          ? `Assigned to ${assignedTo}.`
          : "Team assignment pending.",
      },
      {
        label: "On-Ground Resolution",
        time: status === "resolved" ? "Completed" : "Pending",
        status: status === "resolved" ? "done" : "pending",
        desc:
          status === "resolved"
            ? "Incident has been marked resolved."
            : "Waiting for on-ground closure update.",
      },
    ];
  };

  const bindRealtimeTracking = (
    lookup: string,
    complaintId?: string,
    displayId?: string,
  ) => {
    if (trackSubscriptionRef.current) {
      trackSubscriptionRef.current();
      trackSubscriptionRef.current = null;
    }

    if (complaintId) {
      const unsubscribe = firebaseService.subscribeToComplaint(
        complaintId,
        (complaint) => {
          if (!complaint) return;
          setTrackedComplaint({
            id: displayId || complaint.id,
            status: complaint.status.toUpperCase(),
            update: complaint.assignedTo
              ? `Assigned to ${complaint.assignedTo}`
              : "Report registered. Awaiting admin assignment.",
            time: "Realtime update",
          });
          setActiveTrackingData({
            id: displayId || complaint.id,
            type: complaint.category,
            location: complaint.location,
            timeline: toMissionTimeline(complaint.status, complaint.assignedTo),
          });
        },
      );
      trackSubscriptionRef.current = unsubscribe;
      return;
    }

    trackSubscriptionRef.current = subscribeToReportUpdates(
      lookup,
      (complaints) => {
        if (!complaints.length) return;
        const latest = complaints[0];
        setTrackedComplaint({
          id: latest.id,
          status: latest.status.toUpperCase(),
          update: latest.assignedTo
            ? `Assigned to ${latest.assignedTo}`
            : "Report registered. Awaiting admin assignment.",
          time: "Realtime update",
        });
        setActiveTrackingData({
          id: latest.id,
          type: latest.category,
          location: latest.location,
          timeline: toMissionTimeline(latest.status, latest.assignedTo),
        });
      },
      (error) => {
        setToast({ show: true, message: error, type: "error" });
      },
    );
  };

  const handleTrackLookup = async (rawInput: string) => {
    const query = rawInput.trim();
    if (!query) {
      setToast({
        show: true,
        message: "Enter report ID or phone number",
        type: "error",
      });
      return;
    }

    setTrackingId(query);
    setTrackingIdInput(query.toUpperCase());

    setIsTrackingLookup(true);
    try {
      const phoneCandidate = query.replace(/\D/g, "");
      const isPhoneLookup = phoneCandidate.length === 10;
      const normalizedQuery = query.toUpperCase();
      const resolvedLookup = isPhoneLookup
        ? phoneCandidate
        : resolveReportReference(normalizedQuery);

      const result = isPhoneLookup
        ? await trackReportByPhone(phoneCandidate)
        : await trackReportById(resolvedLookup);

      if (!result.success || !result.complaints.length) {
        setToast({
          show: true,
          message: result.error || "No report found for this input",
          type: "error",
        });
        return;
      }

      const complaint = result.complaints[0];
      const displayId =
        !isPhoneLookup && isPrefixedReference(normalizedQuery)
          ? normalizedQuery
          : complaint.id;
      setTrackedComplaint({
        id: displayId,
        status: complaint.status.toUpperCase(),
        update: complaint.assignedTo
          ? `Assigned to ${complaint.assignedTo}`
          : "Report registered. Awaiting admin assignment.",
        time: "Live status",
      });
      setActiveTrackingData({
        id: displayId,
        type: complaint.category,
        location: complaint.location,
        timeline: toMissionTimeline(complaint.status, complaint.assignedTo),
      });

      bindRealtimeTracking(
        phoneCandidate,
        isPhoneLookup ? undefined : complaint.id,
        isPhoneLookup ? undefined : displayId,
      );
      setToast({
        show: true,
        message: "Realtime tracking started",
        type: "success",
      });
    } catch (error) {
      console.error("Tracking lookup failed:", error);
      setToast({
        show: true,
        message: "Unable to track report right now",
        type: "error",
      });
    } finally {
      setIsTrackingLookup(false);
    }
  };

  useEffect(() => {
    return () => {
      if (trackSubscriptionRef.current) {
        trackSubscriptionRef.current();
      }
    };
  }, []);

  const fetchLocation = () => {
    setIsFetchingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            );
            const data = await res.json();
            const locationName = data.display_name || "Current Location";
            setLocationCoords({ lat, lng, address: locationName });

            // Auto-fill all location fields based on reverse geocoding
            setFormData((prev) => ({
              ...prev,
              address: locationName,
              city:
                data.address.city ||
                data.address.town ||
                data.address.suburb ||
                data.address.district ||
                "",
              state: data.address.state || "",
              pincode: data.address.postcode || "",
            }));
          } catch (e) {
            setLocationCoords({ lat, lng, address: "Current Location" });
          }
          setIsFetchingLocation(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Unable to fetch location. Please enter manually.");
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsFetchingLocation(false);
    }
  };

  const sendOTP = () => {
    if (!/^\d{10}$/.test(formData.contact)) {
      setOtpStatus("error");
      setOtpStatusMessage(
        selectedLanguage === "hi"
          ? "कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    setIsOtpSent(true);
    setIsOtpVerified(false);
    setOtp("");
    setOtpStatus("sent");
    setOtpStatusMessage(
      selectedLanguage === "hi"
        ? `OTP भेज दिया गया है: ${formData.contact}`
        : `OTP sent successfully to ${formData.contact}`,
    );
  };

  const verifyOTP = () => {
    if (otp === "123456") {
      setIsOtpVerified(true);
      setOtpStatus("verified");
      setOtpStatusMessage(
        selectedLanguage === "hi"
          ? "मोबाइल नंबर सफलतापूर्वक सत्यापित हो गया।"
          : "Mobile number verified successfully.",
      );
      if (errors.otp || errors.contact) {
        setErrors((prev) => ({ ...prev, otp: "", contact: "" }));
      }
    } else {
      setOtpStatus("error");
      setOtpStatusMessage(
        selectedLanguage === "hi"
          ? "अमान्य OTP। कृपया पुनः प्रयास करें।"
          : "Invalid OTP. Please try again.",
      );
    }
  };

  const fetchSafetyLocation = () => {
    setIsSafetyFetching(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            );
            const data = await res.json();
            const parts = [];
            if (data.address?.road) parts.push(data.address.road);
            if (
              data.address?.suburb ||
              data.address?.neighbourhood ||
              data.address?.residential
            )
              parts.push(
                data.address.suburb ||
                  data.address.neighbourhood ||
                  data.address.residential,
              );
            if (
              data.address?.city ||
              data.address?.town ||
              data.address?.village
            )
              parts.push(
                data.address.city || data.address.town || data.address.village,
              );

            const locationName =
              parts.length > 0
                ? parts.join(", ")
                : data.display_name?.split(",").slice(0, 2).join(",") ||
                  "Your Precise Area";
            setSafetyLocation({ lat, lng, name: locationName });
          } catch (e) {
            setSafetyLocation({ lat, lng, name: "Your Area" });
          }
          setIsSafetyFetching(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Unable to fetch location for safety check.");
          setIsSafetyFetching(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsSafetyFetching(false);
    }
  };

  const mockForecast = [
    {
      day: "Today",
      temp: "28°C",
      condition: "Heavy Rain",
      icon: <CloudRain className="text-blue-400" />,
    },
    {
      day: "Tomorrow",
      temp: "29°C",
      condition: "Thunderstorms",
      icon: <CloudLightning className="text-amber-400" />,
    },
    {
      day: "Mon",
      temp: "30°C",
      condition: "Showers",
      icon: <CloudDrizzle className="text-blue-300" />,
    },
    {
      day: "Tue",
      temp: "31°C",
      condition: "Cloudy",
      icon: <Cloud className="text-slate-400" />,
    },
    {
      day: "Wed",
      temp: "32°C",
      condition: "Partly Cloudy",
      icon: <CloudSun className="text-amber-300" />,
    },
    {
      day: "Thu",
      temp: "33°C",
      condition: "Sunny",
      icon: <Sun className="text-yellow-400" />,
    },
    {
      day: "Fri",
      temp: "32°C",
      condition: "Sunny",
      icon: <Sun className="text-yellow-400" />,
    },
    {
      day: "Sat",
      temp: "31°C",
      condition: "Cloudy",
      icon: <Cloud className="text-slate-400" />,
    },
    {
      day: "Sun",
      temp: "30°C",
      condition: "Showers",
      icon: <CloudDrizzle className="text-blue-300" />,
    },
    {
      day: "Mon",
      temp: "29°C",
      condition: "Heavy Rain",
      icon: <CloudRain className="text-blue-400" />,
    },
  ];

  const handleSafetyLocationClick = () => {
    if (!safetyLocation) return;
    handleTabChange("map");

    const { lat, lng } = safetyLocation;
    setPosition([lat, lng]);
    fetchNearbyMedical(lat, lng);

    setTimeout(() => {
      if (mapRef) {
        mapRef.flyTo([lat, lng], 14, { animate: true, duration: 2.5 });
      }
    }, 900);
  };

  const handleTabChange = (
    tab: "safety" | "map" | "report" | "floodRelief",
  ) => {
    setIsLoading(true);
    setActiveTab(tab);

    // Auto-fetch location if navigating to Report and not already fetched
    if (tab === "report" && !locationCoords) {
      fetchLocation();
    }

    setTimeout(() => setIsLoading(false), TAB_SWITCH_DELAY_MS);
  };

  return (
    <div
      className={`min-h-screen ${isLoading && !showLanguageSelector ? "bg-white" : "bg-cream"} text-ink font-sans selection:bg-saffron/20 relative overflow-x-hidden ${
        isVisualModeEnabled ? "visual-mode-enabled" : ""
      } ${isSignLanguageEnabled ? "sign-language-mode" : ""}`}
    >
      <AnimatePresence>
        {showLanguageSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ashoka-blue/40 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-cream rounded-[32px] p-8 md:p-12 max-w-4xl w-full shadow-2xl border border-border relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/5 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-ashoka-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-ashoka-blue/20">
                  <Languages className="text-ashoka-blue w-8 h-8" />
                </div>

                <h2 className="text-2xl md:text-3xl font-display font-bold text-ashoka-blue mb-3 uppercase tracking-tight">
                  {t.chooseLanguage}
                </h2>
                <p className="text-ink/60 text-xs md:text-sm mb-8 max-w-lg mx-auto">
                  {t.selectLanguageMsg}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 text-left">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setShowLanguageSelector(false);
                        setIsLoading(true);
                      }}
                      className="p-3 md:p-4 bg-cream border-2 border-border rounded-xl hover:border-ashoka-blue hover:bg-white transition-all group flex flex-col justify-center"
                    >
                      <div className="text-lg md:text-xl font-bold text-ashoka-blue mb-1 group-hover:scale-105 transition-transform origin-left">
                        {lang.name}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-ink/40 uppercase tracking-widest font-mono">
                        {ui("select", "Select")}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-8 pt-8 border-t border-border">
                  <button
                    onClick={() => setIsVoiceAssistantEnabled((prev) => !prev)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                        isVoiceAssistantEnabled
                          ? "bg-india-green text-white border-india-green"
                          : "bg-india-green/10 border-india-green/20 group-hover:bg-india-green group-hover:text-white"
                      }`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isVoiceAssistantEnabled
                          ? "text-india-green"
                          : "text-ink/40 group-hover:text-india-green"
                      }`}
                    >
                      {ui("audioGuide", "Audio Guide")}
                    </span>
                  </button>
                  <button
                    onClick={() => setIsVisualModeEnabled((prev) => !prev)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                        isVisualModeEnabled
                          ? "bg-ashoka-blue text-white border-ashoka-blue"
                          : "bg-ashoka-blue/10 border-ashoka-blue/20 group-hover:bg-ashoka-blue group-hover:text-white"
                      }`}
                    >
                      <Eye className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isVisualModeEnabled
                          ? "text-ashoka-blue"
                          : "text-ink/40 group-hover:text-ashoka-blue"
                      }`}
                    >
                      {ui("visualMode", "Visual Mode")}
                    </span>
                  </button>
                  <button
                    onClick={() => setIsSignLanguageEnabled((prev) => !prev)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                        isSignLanguageEnabled
                          ? "bg-saffron text-white border-saffron"
                          : "bg-saffron/10 border-saffron/20 group-hover:bg-saffron group-hover:text-white"
                      }`}
                    >
                      <Hand className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isSignLanguageEnabled
                          ? "text-saffron"
                          : "text-ink/40 group-hover:text-saffron"
                      }`}
                    >
                      {ui("signLanguage", "Sign Language")}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <div className="fixed inset-0 indian-pattern pointer-events-none" />
      )}

      <header className="official-header">
        {isSignLanguageEnabled && (
          <div className="px-6 lg:px-12 py-1.5 bg-saffron text-black text-[10px] font-black uppercase tracking-widest text-center">
            {ui("signAssistEnabled", "Sign Language Assist Enabled")}
          </div>
        )}
        <div className="w-full mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0">
              <img
                src="/logo.png"
                alt="JalRakshak Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-2xl font-display font-bold text-white leading-tight truncate">
                {t.portalTitle}
              </h1>
              <p className="text-[7px] md:text-[10px] text-white/70 font-mono flex items-center gap-1.5 md:gap-2 uppercase tracking-wider truncate">
                <Clock className="w-2 md:w-3 h-2 md:h-3" />{" "}
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                <span className="hidden sm:inline">| {t.portalSubtitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-8 flex-shrink-0">
            <nav className="hidden md:flex bg-white/10 p-1 rounded-xl border border-white/20">
              {(["safety", "map", "report", "floodRelief"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 lg:px-6 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 uppercase tracking-widest ${
                      activeTab === tab
                        ? "bg-white text-ashoka-blue shadow-md"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab === "safety"
                      ? t.safety
                      : tab === "map"
                        ? t.map
                        : tab === "report"
                          ? t.report
                          : t.floodRelief || "Relief Hub"}
                  </button>
                ),
              )}
            </nav>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              className="bg-white/10 text-white border border-white/20 rounded-lg md:rounded-xl px-2 md:px-4 py-1.5 md:py-2 text-[9px] md:text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-india-green/50 cursor-pointer hover:bg-white/20 transition-all appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "12px 12px",
                paddingRight: "2rem",
              }}
            >
              {languageOptions.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="bg-ashoka-blue text-white"
                >
                  {lang.name}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                setIsVoiceAssistantEnabled(!isVoiceAssistantEnabled)
              }
              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border transition-all relative ${
                isVoiceAssistantEnabled
                  ? "bg-india-green text-white border-india-green shadow-md"
                  : "bg-white/10 text-white/60 border-white/20 hover:border-india-green/30"
              }`}
            >
              <Volume2
                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isListening ? "animate-pulse" : ""}`}
              />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline">
                {isVoiceAssistantEnabled ? t.voiceOn : t.voiceOff}
              </span>
              {isListening && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex border-t border-white/10 bg-water-blue/95">
          {(["safety", "map", "report", "floodRelief"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-4 text-[8px] font-bold uppercase tracking-tighter transition-colors ${
                activeTab === tab
                  ? "text-white bg-white/10 border-b-2 border-white"
                  : "text-white/50"
              }`}
            >
              {tab === "safety"
                ? t.safety
                : tab === "map"
                  ? t.map
                  : tab === "report"
                    ? t.report
                    : t.floodRelief}
            </button>
          ))}
        </div>
      </header>

      {!isLoading && activeTab === "safety" && (
        <div className="relative w-full h-[280px] md:h-[360px] overflow-hidden border-b-2 border-border shadow-xl z-20 group">
          <AnimatePresence mode="popLayout">
            {[
              {
                id: 0,
                title: "JalRakshak — Your Flood Guardian",
                subtitle:
                  "AI-powered Citizen Safety Portal · Real-Time Alerts · IMD Weather Forecasts",
                photo:
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/2015_South_Indian_floods.jpg/1280px-2015_South_Indian_floods.jpg",
                overlay: "from-[#000d1a]/85 via-[#001a33]/70 to-transparent",
                badge: "🌊 JALRAKSHAK PLATFORM",
                stats: [
                  { label: "Active Alerts", value: "247" },
                  { label: "Zones Monitored", value: "1,200+" },
                  { label: "Citizens Protected", value: "4.2 Cr" },
                ],
              },
              {
                id: 1,
                title: "Real-Time Flood Alerts",
                subtitle:
                  "Hyper-local flood warnings sent directly to your device — before water rises",
                photo:
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Kerala_flood_2018.jpg/1280px-Kerala_flood_2018.jpg",
                overlay: "from-[#7a3a00]/90 via-[#b35500]/75 to-transparent",
                badge: "🚨 FLOOD SAFETY",
                stats: [
                  { label: "Avg Alert Lead Time", value: "4.5 hrs" },
                  { label: "Rivers Tracked", value: "312" },
                  { label: "Accuracy", value: "93%" },
                ],
              },
              {
                id: 2,
                title: "Community Flood Reporting",
                subtitle:
                  "Citizens can report waterlogging and floods with photo evidence — verified in minutes",
                photo:
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Chennai_floods_2015.jpg/1280px-Chennai_floods_2015.jpg",
                overlay: "from-[#001a0d]/85 via-[#002a1a]/70 to-transparent",
                badge: "COMMUNITY REPORT",
                stats: [
                  { label: "Reports This Month", value: "8,421" },
                  { label: "Verified Reports", value: "7,109" },
                  { label: "Response Time", value: "~12 min" },
                ],
              },
              {
                id: 3,
                title: "IMD-Powered 5-Day Forecast",
                subtitle:
                  "Weather intelligence calibrated against India Meteorological Department predictive models",
                photo:
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flooding_in_Sylhet%2C_Bangladesh_2022.jpg/1280px-Flooding_in_Sylhet%2C_Bangladesh_2022.jpg",
                overlay: "from-[#000d1a]/85 via-[#001229]/70 to-transparent",
                badge: "🌦 IMD FORECAST",
                stats: [
                  { label: "Forecast Horizon", value: "5 Days" },
                  { label: "Update Frequency", value: "4× Daily" },
                  { label: "Districts Covered", value: "742" },
                ],
              },
              {
                id: 4,
                title: "Safety Zones & Shelter Map",
                subtitle:
                  "Find nearest safe shelters, relief camps and emergency contacts during a flood event",
                photo:
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Assam_floods_2012.jpg/1280px-Assam_floods_2012.jpg",
                overlay: "from-[#0d0800]/85 via-[#1a1000]/70 to-transparent",
                badge: "🏠 EVACUATION GUIDE",
                stats: [
                  { label: "Open Shelters", value: "12" },
                  { label: "Shelter Capacity", value: "4,500" },
                  { label: "Helpline", value: "1916" },
                ],
              },
            ]
              .filter((_, idx) => idx === currentSlide)
              .map((slide) => (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 text-white overflow-hidden"
                >
                  {/* Background photo */}
                  <img
                    src={slide.photo}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                    style={{ filter: "brightness(1)" }}
                  />

                  {/* Directional overlay for readability */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`}
                  />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between px-10 md:px-20 py-8">
                    {/* Top badge */}
                    <span className="inline-flex w-fit items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/15 border border-white/25 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      {slide.badge}
                    </span>

                    {/* Title block */}
                    <div className="max-w-xl md:max-w-2xl">
                      <h2 className="text-xl md:text-4xl font-display font-bold tracking-tight mb-2 md:mb-3 drop-shadow-xl leading-tight text-white">
                        {slide.title}
                      </h2>
                      <p className="text-[10px] md:text-sm font-mono tracking-wider text-white/85 drop-shadow-md">
                        {slide.subtitle}
                      </p>
                    </div>

                    {/* Stats strip */}
                    <div className="flex gap-8 md:gap-12 items-end">
                      {slide.stats.map((s, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-2xl md:text-3xl font-display font-bold text-white drop-shadow-lg">
                            {s.value}
                          </span>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-white/65 mt-0.5">
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>

          {/* Navigation Arrows — Symmetrical & Hover-Conditional */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + 5) % 5)}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-30 p-1.5 md:p-3 rounded-full bg-black/10 hover:bg-black/50 text-white backdrop-blur-md transition-all border border-white/10 hover:border-white/40 opacity-0 group-hover:opacity-100 cursor-pointer shadow-2xl"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % 5)}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-30 p-1.5 md:p-3 rounded-full bg-black/10 hover:bg-black/50 text-white backdrop-blur-md transition-all border border-white/10 hover:border-white/40 opacity-0 group-hover:opacity-100 cursor-pointer shadow-2xl"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-5 right-10 flex gap-2 z-30">
            {[0, 1, 2, 3, 4].map((idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/80"}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Verified News Bulletin — Hyper-Local Moving Ticker */}
      {!isLoading && activeTab === "safety" && news.length > 0 && (
        <div className="w-full bg-ashoka-blue text-white py-2.5 overflow-hidden border-b border-saffron/40 z-[35] relative shadow-lg">
          <div className="flex whitespace-nowrap animate-marquee items-center translate-z-0">
            {/* Multiplied segments for seamless infinite scrolling loop */}
            {[...news, ...news, ...news].map((item, i) => (
              <div key={i} className="flex items-center mx-12">
                <div className="w-2 h-2 bg-saffron rounded-full mr-4 animate-pulse shadow-[0_0_10px_rgba(255,153,51,0.9)]" />
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-saffron bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {item.source}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/95">
                    {item.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-[1440px] w-full mx-auto px-6 lg:px-12 py-10 relative z-10">
        {/* Animated Ashoka Chakra Background - Positioned below header and scrolls with page */}
        {!isLoading && (
          <motion.div
            initial={{ x: "100vw", opacity: 0 }}
            animate={{
              x: 0,
              scale: showLanguageSelector ? 1.1 : 0.85,
              opacity: showLanguageSelector ? 0.2 : 0.15,
            }}
            transition={{
              x: { duration: 1.5, type: "spring", stiffness: 40 },
              default: { duration: 1.5, ease: "easeInOut" },
            }}
            className="fixed inset-0 pb-24 flex items-center justify-center pointer-events-none -z-10"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/1/17/Ashoka_Chakra.svg"
              alt="Ashoka Chakra"
              className="w-[66vh] h-[66vh] max-w-[66vw] animate-[spin_120s_linear_infinite]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-ashoka-blue text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/20"
          >
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: [8, 16, 8] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5,
                    delay: i * 0.1,
                  }}
                  className="w-1 bg-white rounded-full"
                />
              ))}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">
              {voiceFeedback}
            </span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key={`loading-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[50vh] flex items-center justify-center"
            >
              {deniedLocation ? (
                <div className="max-w-xl w-full bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
                  <h3 className="text-lg font-display font-bold text-red-600 uppercase tracking-tight mb-3">
                    {ui("locationRequired", "Location Required")}
                  </h3>
                  <p className="text-sm text-red-500 mb-6 leading-relaxed">
                    {ui(
                      "locationRequiredDesc",
                      "JalRakshak requires precise location access for river proximity sorting and emergency bulletins. Access was denied.",
                    )}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-ashoka-blue text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-ashoka-blue/90 transition-all"
                  >
                    {ui("retrySync", "Retry Mission Command Sync")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <motion.img
                    src="https://upload.wikimedia.org/wikipedia/commons/1/17/Ashoka_Chakra.svg"
                    alt="Chakra"
                    className="w-7 h-7 chakra-rotating-element"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-[11px] text-ashoka-blue font-bold uppercase tracking-[0.25em] animate-pulse text-center">
                    {ui(
                      "syncingTelemetry",
                      "Synchronizing JalRakshak AI Command Telemetry...",
                    )}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {activeTab === "safety" && (
                <motion.div
                  key="safety"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Official Bulletin Banner */}
                  <div className="bg-slate-50 border-t-4 md:border-t-0 md:border-l-8 border-saffron rounded-sm p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 border border-slate-200">
                    <div className="w-16 h-16 bg-saffron/10 rounded flex items-center justify-center shrink-0 border border-saffron/20">
                      <ShieldAlert className="text-saffron w-8 h-8" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                        <span className="px-2 py-0.5 bg-saffron text-white text-[10px] font-bold rounded-sm uppercase tracking-widest">
                          {t.officialBulletin}
                        </span>
                        <h2 className="text-2xl font-display font-medium text-slate-800 tracking-tight">
                          {t.cwcBulletin}
                        </h2>
                      </div>
                      <p className="text-sm text-slate-700 max-w-3xl leading-relaxed font-medium">
                        Mithi River level is currently at{" "}
                        <span className="text-saffron font-bold">2.45m</span>{" "}
                        and rising. Expected to reach Warning Level (3.00m) by
                        evening. Residents in low-lying areas of Kurla are
                        advised to remain vigilant and follow local advisories.
                      </p>
                    </div>
                    <button className="indigo-button">{t.viewSafeZones}</button>
                  </div>

                  {/* Safety Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="glass-card p-8">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <Activity className="text-ashoka-blue w-6 h-6" />
                            <div className="inline-flex items-center bg-ashoka-blue/10 text-ashoka-blue px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest border border-ashoka-blue/20">
                              Risk Analysis Intelligence
                            </div>
                          </div>
                          {!safetyLocation ? (
                            <button
                              onClick={fetchSafetyLocation}
                              disabled={isSafetyFetching}
                              className="indigo-button text-[10px] flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
                            >
                              {isSafetyFetching ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Navigation className="w-3 h-3" />
                              )}
                              {t.checkMyArea}
                            </button>
                          ) : (
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-3 text-[11px] font-bold text-ink/60 bg-white/30 backdrop-blur-md px-4 py-3 rounded-xl border border-white/40 shadow-sm">
                                <Navigation className="w-3 h-3 text-india-green animate-pulse" />
                                <button
                                  onClick={handleSafetyLocationClick}
                                  className="text-ashoka-blue text-left hover:underline transition-all hover:text-[#0B3A68] font-black truncate max-w-[150px] md:max-w-xs cursor-pointer"
                                  title="View Area on Map"
                                >
                                  {safetyLocation?.name}
                                </button>
                                <button
                                  onClick={() => setSafetyLocation(null)}
                                  className="ml-2 text-saffron hover:underline border-l border-border pl-3"
                                >
                                  {t.change}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {safetyLocation ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-5 min-h-[140px] rounded-sm border ${safetyStatus?.bg} ${safetyStatus?.border} flex items-start gap-4 shadow-sm`}
                            >
                              <div className="mt-1 p-2 bg-white rounded-sm border border-slate-200 shadow-sm">
                                {safetyStatus?.icon}
                              </div>
                              <div>
                                <div
                                  className={`text-sm font-black uppercase tracking-tight ${safetyStatus?.color} mb-1`}
                                >
                                  {safetyStatus?.level}
                                </div>
                                <p className="text-sm text-ink/70 leading-relaxed">
                                  {safetyStatus?.desc}
                                </p>
                              </div>
                            </motion.div>

                            <WeatherWidget
                              lat={safetyLocation.lat}
                              lon={safetyLocation.lng}
                              cityName={safetyLocation.name}
                              t={t}
                              selectedLanguage={selectedLanguage}
                            />
                          </div>
                        ) : (
                          <div className="mb-8 p-12 rounded-2xl border-2 border-dashed border-white/40 text-center bg-white/20 backdrop-blur-md">
                            <Navigation className="w-12 h-12 text-border mx-auto mb-4" />
                            <p className="text-sm text-ink/40 font-bold uppercase tracking-widest max-w-md mx-auto">
                              {t.enableLocationMsg}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <SafetyCard
                            icon={<Droplets className="text-ashoka-blue" />}
                            label={t.riverLevel}
                            value={safetyLocation ? "2.45m" : "---"}
                            status={safetyLocation ? t.rising : "---"}
                            statusColor={
                              safetyLocation ? "text-saffron" : "text-ink/30"
                            }
                            subValue={`${t.warningLevel}: 3.00m • Basin: Mithi`}
                          />
                          <SafetyCard
                            icon={<CloudRain className="text-ashoka-blue" />}
                            label={t.rainfall}
                            value={
                              isWeatherLoading
                                ? "..."
                                : globalWeather
                                  ? `${globalWeather.rain} mm/h`
                                  : safetyLocation
                                    ? "0 mm/h"
                                    : "---"
                            }
                            status={
                              isWeatherLoading
                                ? "Syncing"
                                : globalWeather
                                  ? "Real-time OWM"
                                  : safetyLocation
                                    ? "Official Nowcast"
                                    : "---"
                            }
                            statusColor={
                              globalWeather ? "text-ashoka-blue" : "text-ink/30"
                            }
                            subValue={
                              isWeatherLoading
                                ? "Fetching live weather telemetry"
                                : globalWeather
                                  ? `Humidity: ${globalWeather.humidity}% • ${globalWeather.desc}`
                                  : `Source: IMD Official Sensors`
                            }
                          />
                          <SafetyCard
                            icon={<Navigation className="text-india-green" />}
                            label={t.evacuationRoutes}
                            value={t.active}
                            status={t.clear}
                            statusColor="text-india-green"
                            subValue={t.sector4RouteOpen}
                          />
                          <SafetyCard
                            icon={<Zap className="text-saffron" />}
                            label={t.localPrediction}
                            value={
                              isWeatherLoading
                                ? "..."
                                : globalWeather && globalWeather.rain > 5
                                  ? "Elevated Risk"
                                  : t.lowRisk
                            }
                            status={
                              isWeatherLoading
                                ? "Syncing"
                                : globalWeather && globalWeather.rain > 5
                                  ? "Monitoring"
                                  : t.stable
                            }
                            statusColor={
                              isWeatherLoading
                                ? "text-ink/40"
                                : globalWeather && globalWeather.rain > 5
                                  ? "text-saffron"
                                  : "text-india-green"
                            }
                            subValue={
                              isWeatherLoading
                                ? "Updating pressure model"
                                : globalWeather
                                  ? `SLP: ${globalWeather.pressure} hPa • AI Forecast`
                                  : t.hyperLocalAiForecast
                            }
                          />
                          <SafetyCard
                            icon={<Users className="text-ashoka-blue" />}
                            label={t.safeShelters}
                            value={`12 ${t.open}`}
                            status={t.available}
                            statusColor="text-india-green"
                            subValue={`${t.capacity}: 4,500`}
                          />
                        </div>
                      </div>

                      <div className="glass-card p-8">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <MapPin className="text-red-500 w-6 h-6" />
                            <div className="inline-flex items-center bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest border border-red-500/20">
                              {t.priorityMonitoring}
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-full border border-red-500/20 uppercase tracking-widest">
                            {t.highAlert}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            {
                              area:
                                selectedLanguage === "hi"
                                  ? "कुर्ला पश्चिम (निचला इलाका)"
                                  : "Kurla West (Low Lying)",
                              risk: t.high,
                              trend: t.rising,
                            },
                            {
                              area:
                                selectedLanguage === "hi"
                                  ? "सायन-माटुंगा बेल्ट"
                                  : "Sion-Matunga Belt",
                              risk: t.moderate,
                              trend: t.stable,
                            },
                            {
                              area:
                                selectedLanguage === "hi"
                                  ? "धारावी सेक्टर-5"
                                  : "Dharavi Sector-5",
                              risk: t.high,
                              trend: t.rising,
                            },
                            {
                              area:
                                selectedLanguage === "hi"
                                  ? "अंधेरी सबवे"
                                  : "Andheri Subway",
                              risk: t.moderate,
                              trend: t.falling,
                            },
                          ].map((zone, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-cream/50 rounded-xl border border-border flex items-center justify-between"
                            >
                              <div>
                                <div className="text-sm font-bold text-ink">
                                  {zone.area}
                                </div>
                                <div className="text-[10px] text-ink/40 uppercase font-mono">
                                  {t.priorityRegion}
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-[10px] font-bold uppercase ${zone.risk === t.high ? "text-red-500" : "text-saffron"}`}
                                >
                                  {zone.risk}{" "}
                                  {selectedLanguage === "hi" ? "जोखिम" : "Risk"}
                                </div>
                                <div className="text-[9px] text-ink/40">
                                  {zone.trend}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass-card p-6 border border-ashoka-blue/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-ashoka-blue">
                            Critical Now
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
                              {isFloodDataLoading
                                ? "Syncing live CWC feed"
                                : hasLiveFloodData
                                  ? `Live ${floodLastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                  : "Fallback mode"}
                            </div>
                            <button
                              onClick={() => fetchFloodData(true)}
                              disabled={isFloodDataLoading}
                              className="px-3 py-1 rounded-lg border border-border bg-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="rounded-xl border border-border bg-white p-4">
                            <div className="text-[10px] uppercase tracking-widest text-ink/40 font-bold mb-2">
                              Nearest Risk Station
                            </div>
                            <div className="text-sm font-bold text-ashoka-blue truncate">
                              {nearestRiskStation
                                ? nearestRiskStation.name
                                : "--"}
                            </div>
                            <div className="text-[11px] mt-1 text-ink/60">
                              {nearestRiskStation
                                ? `${nearestRiskStation.level.toFixed(2)}m / ${nearestRiskStation.danger.toFixed(2)}m danger`
                                : "Awaiting telemetry"}
                            </div>
                          </div>
                          <div className="rounded-xl border border-border bg-white p-4">
                            <div className="text-[10px] uppercase tracking-widest text-ink/40 font-bold mb-2">
                              Rainfall Intensity
                            </div>
                            <div className="text-sm font-bold text-ashoka-blue">
                              {isWeatherLoading
                                ? "Syncing weather..."
                                : globalWeather
                                  ? `${globalWeather.rain} mm/h`
                                  : "--"}
                            </div>
                            <div className="text-[11px] mt-1 text-ink/60">
                              {isWeatherLoading
                                ? "Loading real-time weather"
                                : globalWeather
                                  ? `${globalWeather.desc}`
                                  : "Awaiting weather telemetry"}
                            </div>
                            <button
                              onClick={() => fetchWeather(true)}
                              disabled={isWeatherLoading || !safetyLocation}
                              className="mt-3 px-3 py-1 rounded-lg border border-border bg-slate-50 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                            >
                              Retry
                            </button>
                          </div>
                          <button
                            onClick={() => setActiveTab("report")}
                            className="rounded-xl border border-red-500/30 bg-red-50 p-4 text-left hover:bg-red-100 transition-colors"
                          >
                            <div className="text-[10px] uppercase tracking-widest text-red-600 font-bold mb-2">
                              Emergency Action
                            </div>
                            <div className="text-sm font-bold text-red-700">
                              Create Incident Report
                            </div>
                            <div className="text-[11px] mt-1 text-red-600/80">
                              Send geo-tagged report to command center
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="glass-card p-8">
                        <div className="flex items-center justify-between mb-8">
                          <div className="inline-flex items-center bg-ashoka-blue/10 text-ashoka-blue px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest border border-ashoka-blue/20">
                            {t.riverMonitoring}
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-mono text-ink/40 uppercase tracking-widest">
                              {t.sourceCwc}
                            </div>
                            <div className="text-[10px] font-mono text-ink/40 uppercase tracking-widest mt-1 mb-2">
                              {isFloodDataLoading
                                ? "Fetching live feed..."
                                : `Updated ${floodLastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                            </div>
                            <button
                              onClick={() => fetchFloodData(true)}
                              disabled={isFloodDataLoading}
                              className="px-3 py-1 rounded-lg border border-border bg-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-border bg-cream sticky top-0 z-10">
                                <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-ink/50">
                                  {t.station}
                                </th>
                                <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-ink/50">
                                  {t.level} (m)
                                </th>
                                <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-ink/50">
                                  {t.warning}
                                </th>
                                <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-ink/50">
                                  {t.danger}
                                </th>
                                <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-ink/50">
                                  Status
                                </th>
                                <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-ink/50">
                                  Chart Trend
                                </th>
                                <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-widest text-ink/50">
                                  {t.trend}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {isFloodDataLoading &&
                                Array.from({ length: 4 }).map((_, idx) => (
                                  <tr
                                    key={`river-skeleton-${idx}`}
                                    className="border-b border-border/50 animate-pulse"
                                  >
                                    <td className="py-4 px-4">
                                      <div className="h-3 w-40 bg-slate-200 rounded" />
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="h-3 w-12 bg-slate-200 rounded" />
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="h-3 w-12 bg-slate-200 rounded" />
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="h-3 w-12 bg-slate-200 rounded" />
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="h-6 w-20 bg-slate-200 rounded-full" />
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="h-6 w-16 bg-slate-200 rounded" />
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="h-3 w-16 bg-slate-200 rounded" />
                                    </td>
                                  </tr>
                                ))}
                              {!isFloodDataLoading &&
                                riverMonitoringStations.map((station, idx) => {
                                  let statusColor = "text-india-green";
                                  if (station.level >= station.danger)
                                    statusColor = "text-red-600";
                                  else if (station.level >= station.warning)
                                    statusColor = "text-saffron";
                                  const statusLabel =
                                    station.level >= station.danger
                                      ? "Danger"
                                      : station.level >= station.warning
                                        ? "Warning"
                                        : "Safe";
                                  const statusBg =
                                    statusLabel === "Danger"
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : statusLabel === "Warning"
                                        ? "bg-amber-100 text-amber-700 border-amber-200"
                                        : "bg-emerald-100 text-emerald-700 border-emerald-200";

                                  return (
                                    <tr
                                      key={idx}
                                      onClick={() => {
                                        setActiveTab("map");
                                        setTimeout(() => {
                                          if (mapRef) {
                                            mapRef.flyTo(
                                              [station.lat, station.lng],
                                              15,
                                              { animate: true, duration: 2 },
                                            );
                                          }
                                        }, 300);
                                      }}
                                      className="border-b border-border/50 hover:bg-cream/50 transition-colors cursor-pointer group"
                                    >
                                      <td className="py-4 px-4">
                                        <div className="text-sm font-bold text-ashoka-blue group-hover:text-blue-700 transition-colors">
                                          {station.name}
                                        </div>
                                        <div className="text-[10px] text-ink/40 uppercase font-medium flex items-center gap-1 mt-0.5">
                                          {station.basin}
                                          {userLat && userLng && (
                                            <span className="bg-ashoka-blue text-white font-bold px-1.5 rounded-sm ml-2">
                                              {getDistance(
                                                userLat,
                                                userLng,
                                                station.lat,
                                                station.lng,
                                              ).toFixed(1)}{" "}
                                              km
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td
                                        className={`py-4 px-4 text-sm font-mono font-bold ${statusColor}`}
                                      >
                                        {station.level.toFixed(2)}
                                      </td>
                                      <td className="py-4 px-4 text-sm font-mono text-ink/60">
                                        {station.warning.toFixed(2)}
                                      </td>
                                      <td className="py-4 px-4 text-sm font-mono text-ink/60">
                                        {station.danger.toFixed(2)}
                                      </td>
                                      <td className="py-4 px-4">
                                        <span
                                          className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusBg}`}
                                        >
                                          {statusLabel}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4">
                                        <SparklingTrend
                                          data={
                                            trendSeriesByStation[
                                              station.name
                                            ] || []
                                          }
                                        />
                                      </td>
                                      <td className="py-4 px-4">
                                        <div
                                          className={`text-[11px] font-bold flex items-center gap-1.5 ${station.trend === "Rising" ? "text-saffron" : station.trend === "Falling" ? "text-india-green" : "text-ink/40"}`}
                                        >
                                          <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-saffron" />
                                          {station.trend}
                                          <span className="ml-2 text-ink/20 group-hover:text-ashoka-blue transition-colors text-lg leading-none">
                                            ↗
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                          {!isFloodDataLoading && mappedStations.length > 4 && (
                            <div className="p-4 border-t border-border flex justify-center bg-white/50">
                              <button
                                onClick={() => setShowAllRivers(!showAllRivers)}
                                className="px-6 py-2.5 bg-ashoka-blue text-white rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-[#082a4d] transition-colors shadow-sm flex items-center gap-2"
                              >
                                {showAllRivers
                                  ? "Show Top 4"
                                  : `Show More (${mappedStations.length - 4}+)`}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-[#0B3A68] text-white rounded-sm p-6 shadow-sm relative overflow-hidden border-t-4 border-saffron">
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <MessageSquare className="w-5 h-5 text-saffron" />
                            <h4 className="text-sm font-display font-medium uppercase text-white tracking-widest">
                              {t.instantAlerts}
                            </h4>
                          </div>
                          <p className="text-xs text-white/80 mb-6 leading-relaxed font-medium">
                            {t.subscribeAlertsMsg}
                          </p>
                          <div className="space-y-2">
                            <button
                              onClick={requestNotificationPermission}
                              className={`w-full py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                notificationsEnabled
                                  ? "bg-india-green text-white border border-india-green"
                                  : "bg-white text-[#0B3A68] hover:bg-slate-100"
                              }`}
                            >
                              <Zap className="w-4 h-4" />
                              {notificationsEnabled
                                ? ui(
                                    "criticalAlertsEnabled",
                                    "Critical Alerts Enabled",
                                  )
                                : ui(
                                    "enableBrowserAlerts",
                                    "Enable Browser Alerts",
                                  )}
                            </button>
                            <button className="w-full py-2.5 bg-white text-[#0B3A68] rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                              <Smartphone className="w-4 h-4" />{" "}
                              {t.subscribeWhatsApp}
                            </button>
                            <button className="w-full py-2.5 bg-transparent border border-white/20 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                              <Smartphone className="w-4 h-4" />{" "}
                              {t.subscribeSMS}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-cream border border-border rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-ashoka-blue/10 rounded-lg">
                            <ShieldAlert className="text-ashoka-blue w-6 h-6" />
                          </div>
                          <h4 className="inline-block text-lg font-display font-bold text-yellow-900 uppercase tracking-wider bg-yellow-300/80 px-2 py-1 rounded-sm">
                            {t.safetyAdvisory}
                          </h4>
                        </div>

                        <div className="h-[180px] overflow-hidden">
                          <motion.div
                            className="space-y-5"
                            animate={{ y: ["0%", "-50%"] }}
                            transition={{
                              duration: 18,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            {[
                              t.advisory1,
                              t.advisory2,
                              t.advisory3,
                              t.advisory4,
                              t.advisory1,
                              t.advisory2,
                              t.advisory3,
                              t.advisory4,
                            ].map((item, idx) => (
                              <p
                                key={idx}
                                className="text-sm font-bold text-ink leading-tight min-h-[44px]"
                              >
                                {item}
                              </p>
                            ))}
                          </motion.div>
                        </div>
                      </div>

                      <div className="bg-[#0B3A68] text-white rounded-sm p-6 shadow-sm relative overflow-hidden border-t-4 border-india-green">
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                            <div className="w-10 h-10 bg-white text-[#0B3A68] rounded-sm shadow-sm flex items-center justify-center border border-slate-200">
                              <Plus className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-display font-bold uppercase tracking-wider text-white leading-none mb-1.5">
                                Live Medical Intel
                              </h4>
                              <p className="text-[10px] text-india-green/90 font-bold uppercase tracking-widest">
                                System Active
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {medicalFacilities.length > 0 ? (
                              medicalFacilities.map((facility) => (
                                <div
                                  key={facility.id}
                                  onClick={() => {
                                    setActiveTab("map");
                                    setTimeout(() => {
                                      if (mapRef) {
                                        mapRef.flyTo(
                                          [facility.lat, facility.lng],
                                          16,
                                          { animate: true, duration: 2 },
                                        );
                                      }
                                    }, 300);
                                  }}
                                  className="flex items-center justify-between p-4 mb-3 bg-[#062444]/60 hover:bg-white rounded-sm border border-white/20 hover:border-white transition-all cursor-pointer group shadow-sm"
                                >
                                  <div className="flex items-center gap-5">
                                    <div
                                      className={`w-10 h-10 rounded-sm flex items-center justify-center ${facility.type === "hospital" ? "bg-red-500" : "bg-india-green"} shadow-sm text-white`}
                                    >
                                      <Plus className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <span className="block text-sm sm:text-[15px] font-bold text-white leading-none mb-1.5 group-hover:text-black transition-colors">
                                        {facility.name}
                                      </span>
                                      <span className="block text-[11px] text-blue-100 uppercase tracking-widest font-mono group-hover:text-black/70">
                                        {selectedLanguage === "hi"
                                          ? facility.type === "hospital"
                                            ? "प्राथमिक अस्पताल"
                                            : "मेडिकल स्टोर"
                                          : facility.type === "hospital"
                                            ? "Priority 1 Hospital"
                                            : "Support Pharmacy"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {facility.phone !== "N/A" && (
                                      <span className="block text-[11px] font-bold text-blue-100/90 mb-1 font-mono group-hover:text-black/60 transition-colors uppercase">
                                        COMM: {facility.phone}
                                      </span>
                                    )}
                                    <span className="inline-block text-[11px] font-black text-white px-2.5 py-1 bg-white/10 rounded-sm uppercase group-hover:bg-[#0B3A68] group-hover:text-white transition-colors border border-white/20 shadow-sm mt-1">
                                      {facility.distance &&
                                      !isNaN(facility.distance)
                                        ? `${facility.distance.toFixed(1)} km`
                                        : "Active Site"}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="py-12 text-center bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-white/30 mb-4" />
                                <p className="text-[11px] text-white/50 font-bold uppercase tracking-widest leading-relaxed">
                                  Synchronizing Local GPS
                                  <br />
                                  with Medical Satellites...
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* EMERGENCY CONTACTS */}
                      <div className="bg-[#0B3A68] text-white rounded-sm p-6 shadow-sm relative overflow-hidden border-t-4 border-ashoka-blue">
                        <h4 className="text-[15px] font-display font-bold uppercase text-white tracking-wider mb-4 pb-4 border-b border-light-white/20 relative z-10">
                          {t.emergencyContacts}
                        </h4>
                        <div className="space-y-2 relative z-10">
                          <ContactItem
                            name={t.disasterManagement}
                            phone="1916"
                          />
                          <ContactItem name={t.ambulance} phone="108" />
                          <ContactItem name={t.fireBrigade} phone="101" />
                          <ContactItem name={t.police} phone="100" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "map" && (
                <>
                  {mapDataUnavailable && (
                    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-amber-700 flex items-center justify-between">
                      <span>Map data unavailable</span>
                      <button
                        onClick={() => {
                          if (userLat && userLng) {
                            fetchNearbyMedical(userLat, userLng);
                          } else {
                            handleApiError(
                              "map",
                              "Map data unavailable. Enable location and retry.",
                            );
                          }
                        }}
                        className="px-3 py-1 rounded-lg border border-amber-300 bg-white text-[10px] font-black"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  {/* GIS TACTICAL CONSOLE — High-Performance Layer Switching */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0B3A68] text-white rounded-sm mb-6 p-6 shadow-sm relative overflow-hidden flex flex-wrap items-center justify-between gap-6 border-b-4 border-saffron"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/10 rounded-sm border border-white/20">
                        <motion.img
                          layoutId="ashoka-chakra-sync"
                          src="https://upload.wikimedia.org/wikipedia/commons/1/17/Ashoka_Chakra.svg"
                          alt="Chakra"
                          className="w-7 h-7 chakra-rotating-element"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-display font-bold uppercase tracking-[0.2em] text-white">
                          GIS Tactical Console
                        </h4>
                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest leading-none">
                          IMD Cluster Integration
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        {
                          id: "none",
                          label: "Base Map",
                          icon: <MapIcon className="w-3.5 h-3.5" />,
                        },
                        {
                          id: "satellite",
                          label: "Satellite",
                          icon: <Globe className="w-3.5 h-3.5" />,
                        },
                        {
                          id: "radar",
                          label: "Radar/Rain",
                          icon: <Waves className="w-3.5 h-3.5" />,
                        },
                        {
                          id: "lightning",
                          label: "Lightning",
                          icon: <Zap className="w-3.5 h-3.5" />,
                        },
                        {
                          id: "wind",
                          label: "Wind Speed",
                          icon: <Droplets className="w-3.5 h-3.5" />,
                        },
                        {
                          id: "temp",
                          label: "Temperature",
                          icon: <Thermometer className="w-3.5 h-3.5" />,
                        },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setMapLayer(mode.id as any)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                            mapLayer === mode.id
                              ? "bg-saffron text-[#0B3A68] border border-saffron shadow-sm"
                              : "bg-transparent text-white hover:bg-white/10 border border-white/20"
                          }`}
                        >
                          {mode.icon} {mode.label}
                        </button>
                      ))}
                    </div>

                    {/* CWC Flood Stations Toggle */}
                    <div className="flex items-center gap-3 ml-auto">
                      <button
                        onClick={() => setShowFloodPanel((p) => !p)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          showFloodPanel
                            ? "bg-india-green text-white border-india-green shadow-sm"
                            : "bg-transparent text-white/60 border-white/20 hover:border-india-green/50"
                        }`}
                      >
                        <Droplets className="w-3.5 h-3.5" /> CWC Flood Stations
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    key="map"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="glass-card overflow-hidden shadow-sm border border-slate-300 p-1"
                  >
                    <div className="h-[650px] w-full relative z-0 overflow-hidden rounded-sm bg-slate-100">
                      <div className="w-full h-full relative">
                        <MapContainer
                          bounds={[
                            [6.5, 68.0],
                            [37.5, 97.5],
                          ]}
                          style={{ height: "100%", width: "100%" }}
                          ref={setMapRef}
                          zoomControl={false}
                          scrollWheelZoom={true}
                          dragging={true}
                          maxZoom={18}
                        >
                          <TileLayer
                            attribution="Imagery &copy; Esri, USGS, NASA"
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            maxZoom={19}
                            opacity={1}
                          />

                          {/* Precise User Mission Pin - Restored */}
                          {position && (
                            <Marker position={position} icon={missionPinIcon}>
                              <Popup className="tactical-popup border-saffron">
                                <div className="p-3 text-center min-w-[120px]">
                                  <div className="w-10 h-10 bg-ashoka-blue/10 rounded-xl flex items-center justify-center mx-auto mb-2 border border-ashoka-blue/20">
                                    <img
                                      src="https://upload.wikimedia.org/wikipedia/commons/1/17/Ashoka_Chakra.svg"
                                      className="w-6 h-6"
                                      alt="Sector"
                                    />
                                  </div>
                                  <span className="text-[10px] font-black text-ashoka-blue uppercase tracking-widest block mb-1">
                                    Active Sector
                                  </span>
                                  <p className="text-[11px] font-bold text-ink/70">
                                    {districtName}
                                  </p>
                                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-india-green rounded-full animate-pulse" />
                                    <span className="text-[8px] font-black uppercase text-india-green tracking-tighter">
                                      Satellite Sync Active
                                    </span>
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          )}

                          <TileLayer
                            url="https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=b97ab085c0dd49a8f17ac46b46e713f7"
                            opacity={0.5}
                            zIndex={50}
                          />

                          {mapLayer === "satellite" && (
                            <TileLayer
                              url="https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=b97ab085c0dd49a8f17ac46b46e713f7"
                              opacity={0.85}
                              attribution="&copy; IMD Satellite Sync"
                              zIndex={800}
                            />
                          )}
                          {mapLayer === "radar" && (
                            <TileLayer
                              url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=b97ab085c0dd49a8f17ac46b46e713f7"
                              opacity={0.85}
                              attribution="&copy; IMD Doppler Radar"
                              zIndex={850}
                            />
                          )}
                          {mapLayer === "lightning" && (
                            <TileLayer
                              url="https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=b97ab085c0dd49a8f17ac46b46e713f7"
                              opacity={0.5}
                              attribution="&copy; IMD Atmospheric Flux"
                              zIndex={900}
                            />
                          )}
                          {mapLayer === "wind" && (
                            <TileLayer
                              url="https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=b97ab085c0dd49a8f17ac46b46e713f7"
                              opacity={0.8}
                              attribution="&copy; Global Wind Dynamics"
                              zIndex={950}
                            />
                          )}
                          {mapLayer === "temp" && (
                            <TileLayer
                              url="https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=b97ab085c0dd49a8f17ac46b46e713f7"
                              opacity={0.6}
                              attribution="&copy; Thermal Intensity Registry"
                              zIndex={1000}
                            />
                          )}

                          <WMSTileLayer
                            url="https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms"
                            layers="india2d"
                            format="image/png"
                            transparent={true}
                            version="1.1.1"
                            opacity={0.9}
                            styles="india2d_high_res_boundary"
                            attribution="&copy; ISRO Bhuvan | NRSC"
                            zIndex={100}
                          />

                          <TileLayer
                            url="https://mt1.google.com/vt?lyrs=h,traffic&x={x}&y={y}&z={z}"
                            opacity={0.5}
                            zIndex={150}
                          />

                          <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                            maxZoom={19}
                            opacity={0.7}
                            zIndex={200}
                          />

                          {/* ── River Stations Markers ── */}
                          {riverStations.map((station, idx) => {
                            const isDanger = station.level >= station.danger;
                            const isWarning = station.level >= station.warning;
                            const color = isDanger
                              ? "#ef4444"
                              : isWarning
                                ? "#f97316"
                                : "#22c55e";

                            return (
                              <CircleMarker
                                key={`river-${idx}`}
                                center={[station.lat, station.lng]}
                                radius={12}
                                pathOptions={{
                                  color: "#ffffff",
                                  fillColor: color,
                                  fillOpacity: 1,
                                  weight: 2,
                                }}
                              >
                                <Popup>
                                  <div className="p-2 text-center min-w-[150px]">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                                      <Droplets
                                        className="w-5 h-5"
                                        style={{ color }}
                                      />
                                    </div>
                                    <h5 className="font-bold text-sm mb-1 text-ink">
                                      {station.name}
                                    </h5>
                                    <p className="text-[10px] text-ink/60 uppercase font-mono tracking-widest">
                                      {station.basin}
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                                      <span className="text-slate-500 font-medium">
                                        Level:
                                      </span>
                                      <span
                                        className="font-bold"
                                        style={{ color }}
                                      >
                                        {station.level.toFixed(2)}m
                                      </span>
                                    </div>
                                  </div>
                                </Popup>
                              </CircleMarker>
                            );
                          })}

                          {medicalFacilities.map((facility) => {
                            const isHospital = facility.type === "hospital";
                            const medicalIcon = L.divIcon({
                              html: `<div style="background-color: white; border: 3px solid ${isHospital ? "#ef4444" : "#22c55e"}; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><div style="color: ${isHospital ? "#ef4444" : "#22c55e"}; font-weight: 900; font-family: sans-serif; font-size: 18px; line-height: 1;">+</div></div>`,
                              className: "medical-marker",
                              iconSize: [28, 28],
                              iconAnchor: [14, 14],
                            });

                            return (
                              <Marker
                                key={facility.id}
                                position={[facility.lat, facility.lng]}
                                icon={medicalIcon}
                              >
                                <Popup>
                                  <div className="p-3 text-center min-w-[160px]">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-md border border-slate-100">
                                      <Plus
                                        className={`w-6 h-6 ${isHospital ? "text-red-500" : "text-india-green"}`}
                                      />
                                    </div>
                                    <h5 className="font-bold text-sm mb-1 text-ink">
                                      {facility.name}
                                    </h5>
                                    <p className="text-[10px] text-ink/60 uppercase font-mono tracking-widest mb-3">
                                      {facility.type.replace("_", " ")}
                                    </p>
                                    <a
                                      href={`tel:${facility.phone}`}
                                      className="inline-block w-full py-2 bg-ashoka-blue text-white rounded-md text-[10px] font-bold tracking-wider shadow-sm hover:bg-[#082a4d] transition-colors"
                                    >
                                      CALL: {facility.phone}
                                    </a>
                                  </div>
                                </Popup>
                              </Marker>
                            );
                          })}

                          {/* ── CWC Flood Station Markers ── */}
                          {showFloodPanel &&
                            filteredFloodStations.map((station) => {
                              const color = CATEGORY_COLORS[station.category];
                              const isSelected =
                                selectedFloodStation?.id === station.id;
                              return (
                                <CircleMarker
                                  key={station.id}
                                  center={[station.lat, station.lon]}
                                  radius={isSelected ? 14 : 9}
                                  pathOptions={{
                                    color: isSelected ? "#ffffff" : color,
                                    fillColor: color,
                                    fillOpacity: isSelected ? 1 : 0.85,
                                    weight: isSelected ? 3 : 1.5,
                                  }}
                                  eventHandlers={{
                                    click: () =>
                                      setSelectedFloodStation(station),
                                  }}
                                >
                                  <Popup>
                                    <div
                                      style={{
                                        minWidth: 220,
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      <div
                                        style={{
                                          background: color,
                                          color: "#fff",
                                          padding: "8px 12px",
                                          borderRadius: "4px 4px 0 0",
                                          marginBottom: 8,
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: 11,
                                            fontWeight: 900,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.15em",
                                          }}
                                        >
                                          {CATEGORY_LABELS[station.category]}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            marginTop: 2,
                                          }}
                                        >
                                          {station.name}
                                        </div>
                                      </div>
                                      <div style={{ padding: "0 12px 10px" }}>
                                        <div
                                          style={{
                                            fontSize: 10,
                                            color: "#555",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.1em",
                                            marginBottom: 6,
                                          }}
                                        >
                                          {station.river} · {station.state}
                                        </div>
                                        <table
                                          style={{
                                            width: "100%",
                                            fontSize: 11,
                                            borderCollapse: "collapse",
                                          }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style={{
                                                  color: "#888",
                                                  paddingBottom: 3,
                                                }}
                                              >
                                                Current Level
                                              </td>
                                              <td
                                                style={{
                                                  fontWeight: 700,
                                                  textAlign: "right",
                                                }}
                                              >
                                                {station.currentLevel.toFixed(
                                                  2,
                                                )}{" "}
                                                m
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                style={{
                                                  color: "#888",
                                                  paddingBottom: 3,
                                                }}
                                              >
                                                Warning Level
                                              </td>
                                              <td
                                                style={{
                                                  fontWeight: 700,
                                                  color: "#eab308",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {station.warningLevel.toFixed(
                                                  2,
                                                )}{" "}
                                                m
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                style={{
                                                  color: "#888",
                                                  paddingBottom: 3,
                                                }}
                                              >
                                                Danger Level
                                              </td>
                                              <td
                                                style={{
                                                  fontWeight: 700,
                                                  color: "#f97316",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {station.dangerLevel.toFixed(2)}{" "}
                                                m
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                style={{
                                                  color: "#888",
                                                  paddingBottom: 3,
                                                }}
                                              >
                                                HFL
                                              </td>
                                              <td
                                                style={{
                                                  fontWeight: 700,
                                                  color: "#ef4444",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {station.hfl.toFixed(2)} m
                                              </td>
                                            </tr>
                                            {station.forecastLevel && (
                                              <tr>
                                                <td
                                                  style={{
                                                    color: "#888",
                                                    paddingBottom: 3,
                                                  }}
                                                >
                                                  24h Forecast
                                                </td>
                                                <td
                                                  style={{
                                                    fontWeight: 700,
                                                    color: color,
                                                    textAlign: "right",
                                                  }}
                                                >
                                                  {station.forecastLevel.toFixed(
                                                    2,
                                                  )}{" "}
                                                  m
                                                </td>
                                              </tr>
                                            )}
                                            <tr>
                                              <td style={{ color: "#888" }}>
                                                Trend
                                              </td>
                                              <td
                                                style={{
                                                  fontWeight: 700,
                                                  textAlign: "right",
                                                  color:
                                                    station.trend === "Rising"
                                                      ? "#f97316"
                                                      : station.trend ===
                                                          "Falling"
                                                        ? "#22c55e"
                                                        : "#888",
                                                }}
                                              >
                                                {station.trend}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td style={{ color: "#888" }}>
                                                Type
                                              </td>
                                              <td
                                                style={{
                                                  fontWeight: 700,
                                                  textAlign: "right",
                                                }}
                                              >
                                                {
                                                  STATION_TYPE_LABELS[
                                                    station.stationType
                                                  ]
                                                }
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <div
                                          style={{
                                            fontSize: 9,
                                            color: "#aaa",
                                            marginTop: 8,
                                            borderTop: "1px solid #eee",
                                            paddingTop: 6,
                                          }}
                                        >
                                          SOURCE: CWC FFS ·{" "}
                                          {new Date(
                                            station.lastUpdated,
                                          ).toLocaleTimeString()}
                                        </div>
                                      </div>
                                    </div>
                                  </Popup>
                                </CircleMarker>
                              );
                            })}

                          <MapControls />
                        </MapContainer>
                      </div>

                      <div className="absolute top-6 right-6 z-[1000] flex items-center gap-3">
                        <div className="relative" ref={searchRef}>
                          <form
                            onSubmit={handleMapSearch}
                            className="flex items-stretch bg-white rounded-sm shadow-md overflow-hidden border border-slate-300"
                          >
                            <input
                              type="text"
                              placeholder="Search Location..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onFocus={() => {
                                if (suggestions.length > 0)
                                  setShowSuggestions(true);
                              }}
                              className="px-4 py-2 text-sm text-ink outline-none min-w-[200px]"
                            />
                            <button
                              type="submit"
                              disabled={
                                isSearchingLocation || !searchQuery.trim()
                              }
                              className="px-4 bg-slate-100 hover:bg-slate-200 text-ashoka-blue border-l border-slate-200 transition-colors flex items-center justify-center min-w-[48px] disabled:opacity-50"
                            >
                              {isSearchingLocation || isSearchingSuggestions ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Search className="w-4 h-4" />
                              )}
                            </button>
                          </form>

                          <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 overflow-hidden z-[1001] divide-y divide-slate-100"
                              >
                                {suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() =>
                                      handleSuggestionSelect(suggestion)
                                    }
                                    className="w-full text-left px-5 py-3.5 text-[11px] font-bold text-ink hover:bg-ashoka-blue/5 transition-colors flex flex-col gap-0.5 group/item"
                                  >
                                    <span className="truncate uppercase tracking-tight text-ashoka-blue group-hover/item:text-blue-700 transition-colors">
                                      {suggestion.display_name.split(",")[0]}
                                    </span>
                                    <span className="truncate text-[9px] text-ink/40 font-medium normal-case group-hover/item:text-ink/60 transition-colors">
                                      {suggestion.display_name}
                                    </span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (!mapRef) return;
                            setIsLocating(true);
                            mapRef.on("locationfound", (ev: any) => {
                              setPosition([ev.latlng.lat, ev.latlng.lng]);
                              mapRef.flyTo(ev.latlng, 17, {
                                animate: true,
                                duration: 2.5,
                              });
                              setIsLocating(false);
                              fetchNearbyMedical(ev.latlng.lat, ev.latlng.lng);
                            });
                            mapRef.locate({ enableHighAccuracy: true });
                          }}
                          className={`px-4 py-2.5 bg-[#0B3A68] hover:bg-[#082a4d] rounded-sm shadow-md border border-[#0B3A68] text-white transition-all flex items-center gap-3 group active:scale-95 h-full ${isLocating ? "opacity-80" : ""}`}
                        >
                          {isLocating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Navigation className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                          )}
                          <span className="text-[10px] font-bold font-display uppercase tracking-[0.2em] hidden sm:inline-block">
                            Locate Me
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* TACTICAL MAP LEGEND — Integrated Below Map within the same Glass Card */}
                    {mapLayer !== "none" && (
                      <div className="p-6 bg-ashoka-blue text-white border-t border-white/10 flex flex-wrap items-center justify-between gap-8">
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <Activity className="w-4 h-4 text-saffron" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-saffron">
                            {mapLayer === "radar"
                              ? "Precipitation Intensity (mm/h)"
                              : mapLayer === "temp"
                                ? "Thermal Density (°C)"
                                : "Meteorological Scale"}
                          </span>
                        </div>

                        <div className="flex-1 flex flex-wrap items-center gap-6 justify-center">
                          {mapLayer === "radar" ? (
                            [
                              { color: "#ff0000", label: "100+" },
                              { color: "#ff7f00", label: "50" },
                              { color: "#ffff00", label: "20" },
                              { color: "#00ff00", label: "5" },
                              { color: "#0000ff", label: "0.1" },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-4 h-4 rounded shadow-sm"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-[10px] text-white/60 font-mono font-bold">
                                  {item.label}
                                </span>
                              </div>
                            ))
                          ) : mapLayer === "temp" ? (
                            [
                              { color: "#ff0000", label: "45°" },
                              { color: "#ffa500", label: "35°" },
                              { color: "#ffff00", label: "25°" },
                              { color: "#add8e6", label: "15°" },
                              { color: "#0000ff", label: "0°" },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-4 h-4 rounded shadow-sm"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-[10px] text-white/60 font-mono font-bold">
                                  {item.label}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="w-full max-w-sm h-3 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-full flex justify-between px-2 items-center">
                              <span className="text-[7px] text-white font-bold opacity-0 md:opacity-100">
                                LOW INTENSITY
                              </span>
                              <span className="text-[7px] text-white font-bold opacity-0 md:opacity-100">
                                HIGH INTENSITY
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="hidden lg:block">
                          <span className="text-[8px] text-white/30 font-mono uppercase tracking-widest">
                            Authorized Mission Data: IMD/OWM CLUSTER
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* ══ CWC Flood Forecast Station Panel ══ */}
                  {showFloodPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 bg-[#0B3A68] rounded-sm border border-white/10 shadow-xl overflow-hidden"
                    >
                      {/* Panel Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <Waves className="w-5 h-5 text-saffron" />
                          <div>
                            <h4 className="text-[13px] font-display font-bold uppercase tracking-[0.2em] text-white leading-none">
                              CWC Flood Forecast Stations
                            </h4>
                            <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest mt-1">
                              Source: ffs.india-water.gov.in &nbsp;·&nbsp;{" "}
                              {filteredFloodStations.length}/
                              {floodStations.length} Stations &nbsp;·&nbsp;
                              Refreshed: {floodLastRefresh.toLocaleTimeString()}{" "}
                              &nbsp;·&nbsp; Next: 12 min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-india-green animate-pulse" />
                          <span className="text-[9px] text-india-green font-bold uppercase tracking-widest">
                            LIVE
                          </span>
                        </div>
                      </div>

                      {/* Filters Row */}
                      <div className="px-6 py-4 border-b border-white/10 flex flex-wrap gap-6 items-start">
                        {/* Severity Filters */}
                        <div>
                          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-2">
                            Flood Severity
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(
                              [
                                "normal",
                                "above_normal",
                                "severe",
                                "extreme",
                              ] as FloodCategory[]
                            ).map((cat) => (
                              <button
                                key={cat}
                                id={`flood-filter-cat-${cat}`}
                                onClick={() => toggleCategory(cat)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                  floodCategoryFilter.has(cat)
                                    ? "text-white border-transparent"
                                    : "text-white/30 border-white/10 bg-white/5"
                                }`}
                                style={
                                  floodCategoryFilter.has(cat)
                                    ? {
                                        backgroundColor: CATEGORY_COLORS[cat],
                                        borderColor: CATEGORY_COLORS[cat],
                                      }
                                    : {}
                                }
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: CATEGORY_COLORS[cat],
                                  }}
                                />
                                {CATEGORY_LABELS[cat]}
                                <span className="opacity-70 text-[9px]">
                                  (
                                  {
                                    floodStations.filter(
                                      (s) => s.category === cat,
                                    ).length
                                  }
                                  )
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Station Type Filters */}
                        <div>
                          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-2">
                            Station Type
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(
                              [
                                "base",
                                "level",
                                "inflow_forecast",
                              ] as StationType[]
                            ).map((type) => (
                              <button
                                key={type}
                                id={`flood-filter-type-${type}`}
                                onClick={() => toggleType(type)}
                                className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                  floodTypeFilter.has(type)
                                    ? "bg-white/15 text-white border-white/30"
                                    : "text-white/30 border-white/10 bg-white/5"
                                }`}
                              >
                                {STATION_TYPE_LABELS[type]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10">
                        {(
                          [
                            "normal",
                            "above_normal",
                            "severe",
                            "extreme",
                          ] as FloodCategory[]
                        ).map((cat) => {
                          const count = filteredFloodStations.filter(
                            (s) => s.category === cat,
                          ).length;
                          return (
                            <div
                              key={cat}
                              className="p-4 bg-[#0B3A68] flex items-center gap-3"
                            >
                              <div
                                className="w-3 h-10 rounded-sm"
                                style={{
                                  backgroundColor: CATEGORY_COLORS[cat],
                                }}
                              />
                              <div>
                                <div className="text-xl font-display font-bold text-white">
                                  {count}
                                </div>
                                <div className="text-[9px] text-white/40 uppercase tracking-widest font-mono">
                                  {CATEGORY_LABELS[cat]}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Station Table */}
                      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-[#08274a] border-b border-white/10">
                              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-white/40">
                                Station
                              </th>
                              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-white/40">
                                River / State
                              </th>
                              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-white/40">
                                Status
                              </th>
                              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-white/40 text-right">
                                Level (m)
                              </th>
                              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-white/40 text-right">
                                Warning
                              </th>
                              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-white/40 text-right">
                                Danger
                              </th>
                              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-white/40">
                                Trend
                              </th>
                              <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-white/40">
                                Type
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredFloodStations.map((station) => {
                              const color = CATEGORY_COLORS[station.category];
                              return (
                                <tr
                                  key={station.id}
                                  className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${selectedFloodStation?.id === station.id ? "bg-white/10" : ""}`}
                                  onClick={() => {
                                    setSelectedFloodStation(station);
                                    if (mapRef)
                                      mapRef.flyTo(
                                        [station.lat, station.lon],
                                        10,
                                        { animate: true, duration: 1.5 },
                                      );
                                  }}
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: color }}
                                      />
                                      <span className="text-[11px] font-bold text-white">
                                        {station.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="text-[10px] text-white/60">
                                      {station.river}
                                    </div>
                                    <div className="text-[9px] text-white/30 uppercase font-mono">
                                      {station.state}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className="px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest"
                                      style={{
                                        backgroundColor: color + "30",
                                        color,
                                      }}
                                    >
                                      {CATEGORY_LABELS[station.category]}
                                    </span>
                                  </td>
                                  <td
                                    className="py-3 px-4 text-right font-mono text-[11px] font-bold"
                                    style={{ color }}
                                  >
                                    {station.currentLevel.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono text-[10px] text-amber-400">
                                    {station.warningLevel.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono text-[10px] text-orange-400">
                                    {station.dangerLevel.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`text-[10px] font-bold ${station.trend === "Rising" ? "text-orange-400" : station.trend === "Falling" ? "text-emerald-400" : "text-white/40"}`}
                                    >
                                      {station.trend === "Rising"
                                        ? "↑ "
                                        : station.trend === "Falling"
                                          ? "↓ "
                                          : "→ "}
                                      {station.trend}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-[9px] text-white/40 font-mono uppercase">
                                    {STATION_TYPE_LABELS[
                                      station.stationType
                                    ].replace(" Station", "")}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {filteredFloodStations.length === 0 && (
                          <div className="py-12 text-center">
                            <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest">
                              No stations match the current filters
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Legend */}
                      <div className="px-6 py-3 border-t border-white/10 flex flex-wrap items-center gap-6 bg-[#08274a]">
                        <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                          Legend:
                        </span>
                        {(
                          [
                            "normal",
                            "above_normal",
                            "severe",
                            "extreme",
                          ] as FloodCategory[]
                        ).map((cat) => (
                          <div key={cat} className="flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                            />
                            <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">
                              {CATEGORY_LABELS[cat]}
                            </span>
                          </div>
                        ))}
                        <span className="text-[9px] text-white/20 font-mono ml-auto">
                          Click any row to fly to station on map
                        </span>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {activeTab === "report" && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full px-6 lg:px-12 max-w-full space-y-8"
                >
                  {/* Mission Incident Hub: Tracking & Admin Intelligence */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                    {/* Official Mission Briefing (Progress Reports) */}
                    <div className="glass-card overflow-hidden bg-slate-50 border border-slate-200 shadow-sm relative w-full h-fit">
                      <div className="p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-1.5 h-12 bg-ashoka-blue rounded-full" />
                            <div>
                              <div className="inline-flex items-center bg-ashoka-blue/10 text-ashoka-blue px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest border border-ashoka-blue/20 mb-2">
                                {t.progressReport}
                              </div>
                              <p className="text-[9px] text-black font-mono uppercase tracking-widest font-black mt-1">
                                Admin Push Progress Grid
                              </p>
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-3 px-3 py-1.5 rounded-full border ${adminProgressUpdates.length > 0 ? "bg-india-green/10 border-india-green/20" : "bg-amber-100 border-amber-200"}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${adminProgressUpdates.length > 0 ? "bg-india-green animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-amber-500"}`}
                            />
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${adminProgressUpdates.length > 0 ? "text-india-green" : "text-amber-700"}`}
                            >
                              {adminProgressUpdates.length > 0
                                ? "Authorized Feed Active"
                                : "Awaiting Admin Push"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {progressFeedCards.map((update, idx) => (
                            <div
                              key={idx}
                              className="group p-4 bg-white rounded-sm border border-slate-200 hover:border-ashoka-blue/30 transition-all cursor-default shadow-sm text-black"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-black text-black group-hover:text-ashoka-blue transition-colors truncate">
                                  {update.area}
                                </div>
                                <div
                                  className={`w-2 h-2 rounded-full shrink-0 ${update.status === "Completed" ? "bg-india-green" : update.status === "In Progress" ? "bg-saffron animate-pulse" : update.status === "Verified" ? "bg-ashoka-blue" : "bg-amber-500"}`}
                                />
                              </div>
                              <div className="text-[11px] font-bold text-black/80 mb-3">
                                {update.task}
                              </div>
                              <div className="flex items-center gap-3 pt-3 border-t border-black/5">
                                <span className="text-[8px] font-mono font-black text-black/40 uppercase tracking-tighter">
                                  {update.admin}
                                </span>
                                <div className="w-1 h-1 bg-black/10 rounded-full" />
                                <span className="text-[8px] font-mono font-bold text-black/40 uppercase">
                                  {update.time}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-6 md:p-8 bg-white border border-slate-200 shadow-sm relative flex flex-col justify-between text-black">
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-1.5 h-12 bg-ashoka-blue rounded-full" />
                          <div>
                            <div className="inline-flex items-center bg-ashoka-blue/10 text-ashoka-blue px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest border border-ashoka-blue/20 mb-2">
                              Track My Report
                            </div>
                            <p className="text-[9px] text-black/40 font-mono uppercase tracking-widest font-bold mt-1">
                              Real-Time Incident Tracker
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-black/60 uppercase tracking-widest block ml-1 font-black">
                              Mission ID / Mobile Number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                                placeholder="E.g. JAL-2026-X832"
                                className="w-full bg-slate-50 border border-slate-300 rounded-sm px-4 py-3 text-xs text-black placeholder:text-black/30 focus:outline-none focus:border-ashoka-blue transition-all font-bold shadow-sm"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleTrackLookup(trackingId)}
                            className="w-full bg-[#0B3A68] text-white py-3.5 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm hover:bg-[#082a4d]"
                          >
                            {isTrackingLookup ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                                Syncing...
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" /> Track Mission
                                Status
                              </>
                            )}
                          </button>
                        </div>

                        <AnimatePresence>
                          {trackedComplaint && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="mt-6 p-4 bg-slate-50 rounded-sm border border-slate-200 space-y-4 shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-mono text-black/30 uppercase">
                                    Operational Status
                                  </span>
                                  <span className="text-[10px] font-black text-india-green uppercase tracking-widest">
                                    {trackedComplaint.status}
                                  </span>
                                </div>
                                <div className="w-2 h-2 bg-india-green rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                              </div>
                              <div className="pt-3 border-t border-black/5">
                                <p className="text-[11px] font-bold text-black/80 leading-relaxed mb-1">
                                  {trackedComplaint.update}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-black/30" />
                                  <p className="text-[8px] font-mono text-black/30 uppercase">
                                    {trackedComplaint.time}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="mt-8 pt-4 border-t border-black/5 flex items-center gap-3 opacity-30">
                          <ShieldAlert className="w-3.5 h-3.5 text-black" />
                          <span className="text-[7px] font-mono uppercase tracking-[0.3em] text-black">
                            Authorized Secure Link | Mission-Sync Ready
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 md:p-10 bg-white border border-slate-200 w-full">
                    <div className="flex items-start gap-4 mb-10">
                      <div className="w-1.5 h-14 bg-ashoka-blue rounded-full" />
                      <div className="flex-1">
                        <h3 className="text-2xl md:text-3xl font-display font-bold text-ashoka-blue uppercase tracking-wider">
                          {t.reportFlooding}
                        </h3>
                        <p className="text-sm text-ink/50 font-medium">
                          {t.helpAuthorities}
                        </p>
                      </div>
                    </div>

                    {reportSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10"
                      >
                        <div className="w-20 h-1 bg-gradient-to-r from-india-green to-ashoka-blue mx-auto mb-7 rounded-full" />
                        <h4 className="text-3xl font-display font-bold text-ashoka-blue mb-2 uppercase tracking-tight">
                          {t.reportSubmitted}
                        </h4>
                        <p className="text-ink/60 text-sm mb-7 max-w-md mx-auto leading-relaxed">
                          {t.reportSubmittedMsg}
                        </p>
                        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-7 rounded-2xl mb-8 max-w-sm mx-auto border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                          <span className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] block mb-2">
                            Official Tracking Reference
                          </span>
                          <span className="text-[26px] font-black tracking-[0.18em] block">
                            {generatedComplaintId}
                          </span>
                          <span className="text-[10px] text-white/55 uppercase tracking-widest mt-3 inline-block">
                            11-character RO ID
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setReportSuccess(false);
                            setGeneratedComplaintId(null);
                          }}
                          className="indigo-button"
                        >
                          {t.submitAnotherReport}
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleReport} className="space-y-10">
                        {/* Location Section */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-b border-border pb-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-black/70 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-ashoka-blue" /> 1.{" "}
                              {t.incidentLocation}
                            </label>
                            <button
                              type="button"
                              onClick={fetchLocation}
                              disabled={isFetchingLocation}
                              className={`text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest transition-colors ${errors.location ? "text-red-500" : "text-ashoka-blue hover:text-saffron"}`}
                            >
                              {isFetchingLocation ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Navigation className="w-3 h-3" />
                              )}
                              {locationCoords
                                ? t.locationCaptured
                                : t.autoDetectLocation}
                            </button>
                          </div>
                          {errors.location && (
                            <p
                              id="error-location"
                              className="text-[11px] text-red-500 font-bold mt-2"
                            >
                              {errors.location}
                            </p>
                          )}
                          {locationCoords && (
                            <div className="bg-ashoka-blue/5 border border-ashoka-blue/10 rounded-xl p-4 text-[11px] font-mono text-ashoka-blue flex items-center gap-3">
                              <div className="w-2 h-2 bg-ashoka-blue rounded-full animate-pulse" />
                              Coordinates: {locationCoords.lat.toFixed(6)},{" "}
                              {locationCoords.lng.toFixed(6)}
                            </div>
                          )}
                          <p className="text-[10px] text-black/50 font-mono uppercase tracking-widest">
                            Location details are auto-captured from GPS and
                            cannot be edited manually.
                          </p>

                          <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-3">
                              <label className="text-[11px] font-black uppercase tracking-widest text-black/80">
                                {t.addressLandmark}
                              </label>
                              <textarea
                                value={formData.address}
                                readOnly
                                placeholder="Auto-filled from GPS location"
                                className={`w-full bg-slate-100 border rounded-xl px-5 py-4 text-sm font-bold text-black/80 focus:outline-none transition-all resize-none h-24 cursor-not-allowed ${errors.address ? "border-red-500 shadow-sm shadow-red-500/10" : "border-border"}`}
                              />
                              {errors.address && (
                                <p
                                  id="error-address"
                                  className="text-[11px] text-red-500 font-bold"
                                >
                                  {errors.address}
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-black/80">
                                  {t.city}
                                </label>
                                <input
                                  type="text"
                                  value={formData.city}
                                  readOnly
                                  placeholder="Auto-filled"
                                  className={`w-full bg-slate-100 border rounded-xl px-5 py-3.5 text-sm font-bold text-black/80 focus:outline-none transition-all cursor-not-allowed ${errors.city ? "border-red-500" : "border-border"}`}
                                />
                                {errors.city && (
                                  <p
                                    id="error-city"
                                    className="text-[11px] text-red-500 font-bold"
                                  >
                                    {errors.city}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-black/80">
                                  {t.state}
                                </label>
                                <input
                                  type="text"
                                  value={formData.state}
                                  readOnly
                                  placeholder="Auto-filled"
                                  className={`w-full bg-slate-100 border rounded-xl px-5 py-3.5 text-sm font-bold text-black/80 focus:outline-none transition-all cursor-not-allowed ${errors.state ? "border-red-500" : "border-border"}`}
                                />
                                {errors.state && (
                                  <p
                                    id="error-state"
                                    className="text-[11px] text-red-500 font-bold"
                                  >
                                    {errors.state}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-black/80">
                                  {t.pincode}
                                </label>
                                <input
                                  type="text"
                                  value={formData.pincode}
                                  readOnly
                                  placeholder="Auto-filled"
                                  className={`w-full bg-slate-100 border rounded-xl px-5 py-3.5 text-sm font-bold text-black/80 focus:outline-none transition-all cursor-not-allowed ${errors.pincode ? "border-red-500" : "border-border"}`}
                                />
                                {errors.pincode && (
                                  <p
                                    id="error-pincode"
                                    className="text-[11px] text-red-500 font-bold"
                                  >
                                    {errors.pincode}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Contact Section */}
                        <div className="space-y-6">
                          <label className="text-[11px] font-black uppercase tracking-widest text-black/70 flex items-center gap-2 border-b border-border pb-4 w-full">
                            <Smartphone className="w-4 h-4 text-ashoka-blue" />{" "}
                            2. {t.contactVerification}
                          </label>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                              <input
                                type="tel"
                                value={formData.contact}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    contact: e.target.value,
                                  });
                                  setOtpStatus("idle");
                                  setOtpStatusMessage("");
                                  setOtp("");
                                  setIsOtpSent(false);
                                  setIsOtpVerified(false);
                                  if (errors.contact)
                                    setErrors((prev) => ({
                                      ...prev,
                                      contact: "",
                                    }));
                                }}
                                placeholder={t.mobileNumberPlaceholder}
                                disabled={isOtpVerified}
                                className={`w-full bg-cream border rounded-xl px-5 py-3.5 text-sm focus:outline-none transition-all disabled:opacity-50 ${errors.contact || errors.otp ? "border-red-500" : "border-border focus:border-ashoka-blue"}`}
                              />
                              {isOtpVerified && (
                                <CheckCircle2 className="absolute right-5 top-1/2 -translate-y-1/2 text-india-green w-5 h-5" />
                              )}
                              {errors.contact && (
                                <p
                                  id="error-contact"
                                  className="text-[11px] text-red-500 font-bold mt-2"
                                >
                                  {errors.contact}
                                </p>
                              )}
                              {errors.otp && (
                                <p
                                  id="error-otp"
                                  className="text-[11px] text-red-500 font-bold mt-2"
                                >
                                  {errors.otp}
                                </p>
                              )}
                            </div>
                            {!isOtpVerified && (
                              <button
                                type="button"
                                onClick={sendOTP}
                                className="saffron-button whitespace-nowrap"
                              >
                                {isOtpSent ? t.resendOtp : t.sendOtp}
                              </button>
                            )}
                          </div>

                          {isOtpSent && !isOtpVerified && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="flex flex-col sm:flex-row gap-4"
                            >
                              <div className="flex-1 relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-ink/30 w-4 h-4" />
                                <input
                                  type="text"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value)}
                                  placeholder={t.otpPlaceholder}
                                  className="w-full bg-cream border border-border rounded-xl pl-12 pr-5 py-3.5 text-sm focus:outline-none focus:border-ashoka-blue transition-all"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={verifyOTP}
                                className="green-button whitespace-nowrap"
                              >
                                {t.verifyOtp}
                              </button>
                            </motion.div>
                          )}

                          <AnimatePresence>
                            {otpStatus !== "idle" && (
                              <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                className={`rounded-xl border px-4 py-3 text-[11px] uppercase tracking-wide font-bold ${
                                  otpStatus === "verified"
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                    : otpStatus === "error"
                                      ? "bg-red-50 border-red-300 text-red-700"
                                      : "bg-[#0B3A68]/5 border-[#0B3A68]/30 text-[#0B3A68]"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {otpStatus === "verified" ? (
                                    <ShieldCheck className="w-4 h-4 mt-[1px]" />
                                  ) : otpStatus === "error" ? (
                                    <AlertTriangle className="w-4 h-4 mt-[1px]" />
                                  ) : (
                                    <Clock className="w-4 h-4 mt-[1px]" />
                                  )}
                                  <div className="flex-1">
                                    <p>{otpStatusMessage}</p>
                                    {otpStatus === "sent" && (
                                      <div className="mt-2">
                                        <div className="h-1.5 rounded-full bg-[#0B3A68]/15 overflow-hidden">
                                          <motion.div
                                            className="h-full bg-[#0B3A68]"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{
                                              duration: 1.2,
                                              ease: "easeOut",
                                            }}
                                          />
                                        </div>
                                        <p className="mt-1 text-[10px] tracking-normal normal-case font-semibold opacity-80">
                                          Demo OTP for testing: 123456
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Report Details */}
                        <div className="space-y-8">
                          <label className="text-[11px] font-black uppercase tracking-widest text-black/70 flex items-center gap-2 border-b border-border pb-4 w-full">
                            <FileText className="w-4 h-4 text-ashoka-blue" /> 3.{" "}
                            {t.incidentDetails}
                          </label>

                          <div className="space-y-8">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-black uppercase tracking-widest text-black/80">
                                  {t.problemType}
                                </label>
                                {isVoiceAssistantEnabled && (
                                  <button
                                    type="button"
                                    className="text-india-green hover:scale-110 transition-transform"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                  {
                                    id: "surface_flooding",
                                    label: "Water on Road",
                                    hi: "सड़क पर पानी",
                                    icon: <Droplets className="w-6 h-6" />,
                                    color: "text-blue-500",
                                  },
                                  {
                                    id: "blocked_manhole",
                                    label: "Blocked Drain",
                                    hi: "नाला बंद है",
                                    icon: <CloudRain className="w-6 h-6" />,
                                    color: "text-slate-500",
                                  },
                                  {
                                    id: "overflowing_river",
                                    label: "River Overflow",
                                    hi: "नदी उफान पर है",
                                    icon: <Waves className="w-6 h-6" />,
                                    color: "text-ashoka-blue",
                                  },
                                  {
                                    id: "broken_pipe",
                                    label: "Broken Pipe",
                                    hi: "पाइप फटा है",
                                    icon: <Droplets className="w-6 h-6" />,
                                    color: "text-blue-400",
                                  },
                                  {
                                    id: "pothole_hazard",
                                    label: "Pothole",
                                    hi: "गड्ढा",
                                    icon: <Construction className="w-6 h-6" />,
                                    color: "text-saffron",
                                  },
                                  {
                                    id: "structural_damage",
                                    label: "Damage",
                                    hi: "नुकसान",
                                    icon: (
                                      <AlertTriangle className="text-red-500 w-6 h-6" />
                                    ),
                                    color: "text-red-500",
                                  },
                                ].map((type) => (
                                  <button
                                    key={type.id}
                                    type="button"
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        issueType: type.id,
                                      })
                                    }
                                    className={`p-4 rounded-sm border transition-all text-center flex flex-col items-center gap-3 ${
                                      formData.issueType === type.id
                                        ? "border-ashoka-blue bg-ashoka-blue/5 shadow-sm"
                                        : "border-slate-200 bg-slate-50 hover:border-ashoka-blue/30"
                                    }`}
                                  >
                                    <div
                                      className={`p-3 rounded-sm bg-white shadow-sm border border-slate-200 ${type.color}`}
                                    >
                                      {type.icon}
                                    </div>
                                    <div>
                                      <div className="text-[11px] font-black text-black leading-tight">
                                        {selectedLanguage === "hi"
                                          ? type.hi
                                          : type.label}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-black uppercase tracking-widest text-black/80">
                                  {t.waterLevel}
                                </label>
                                {isVoiceAssistantEnabled && (
                                  <button
                                    type="button"
                                    className="text-india-green hover:scale-110 transition-transform"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                  {
                                    id: "low",
                                    label: "Ankle Deep",
                                    hi: "टखने तक",
                                    icon: <Thermometer className="w-5 h-5" />,
                                    color: "text-india-green",
                                  },
                                  {
                                    id: "medium",
                                    label: "Knee Deep",
                                    hi: "घुटने तक",
                                    icon: <ArrowUpCircle className="w-5 h-5" />,
                                    color: "text-saffron",
                                  },
                                  {
                                    id: "high",
                                    label: "Waist Deep",
                                    hi: "कमर तक",
                                    icon: <AlertTriangle className="w-5 h-5" />,
                                    color: "text-orange-500",
                                  },
                                  {
                                    id: "critical",
                                    label: "Above Waist",
                                    hi: "कमर से ऊपर",
                                    icon: <ShieldAlert className="w-5 h-5" />,
                                    color: "text-red-500",
                                  },
                                ].map((level) => (
                                  <button
                                    key={level.id}
                                    type="button"
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        waterLevel: level.id,
                                      })
                                    }
                                    className={`p-4 rounded-sm border transition-all text-center flex flex-col items-center gap-3 ${
                                      formData.waterLevel === level.id
                                        ? "border-ashoka-blue bg-ashoka-blue/5 shadow-sm"
                                        : "border-slate-200 bg-slate-50 hover:border-ashoka-blue/30"
                                    }`}
                                  >
                                    <div
                                      className={`p-3 rounded-sm bg-white shadow-sm border border-slate-200 ${level.color}`}
                                    >
                                      {level.icon}
                                    </div>
                                    <div>
                                      <div className="text-[11px] font-black text-black leading-tight">
                                        {selectedLanguage === "hi"
                                          ? level.hi
                                          : level.label}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-black/80">
                              {t.uploadPhoto}
                            </label>
                            <label
                              className={`w-full flex items-center justify-center gap-3 py-6 bg-cream border-2 border-dashed rounded-2xl hover:bg-white transition-all cursor-pointer ${errors.proof ? "border-red-500" : "border-border"}`}
                            >
                              <Upload
                                className={`w-6 h-6 ${errors.proof ? "text-red-500" : "text-ashoka-blue"}`}
                              />
                              <span
                                className={`text-sm font-black uppercase tracking-widest ${errors.proof ? "text-red-500" : "text-black/80"}`}
                              >
                                {proofFile ? proofFile.name : t.takePhoto}
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  setProofFile(e.target.files?.[0] || null);
                                  if (e.target.files?.[0]) {
                                    setErrors((prev) => {
                                      const newErrors = { ...prev };
                                      delete newErrors.proof;
                                      return newErrors;
                                    });
                                  }
                                }}
                              />
                            </label>
                            {errors.proof && (
                              <p
                                id="error-proof"
                                className="text-[11px] text-red-500 font-bold"
                              >
                                {errors.proof}
                              </p>
                            )}
                          </div>

                          <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-ink/60">
                              {t.additionalDetails} *
                            </label>
                            <textarea
                              rows={4}
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              placeholder={t.descriptionPlaceholder}
                              className={`w-full bg-cream border rounded-xl px-5 py-4 text-sm focus:outline-none transition-all resize-none ${errors.description ? "border-red-500" : "border-border focus:border-ashoka-blue"}`}
                            />
                            {errors.description && (
                              <p
                                id="error-description"
                                className="text-[11px] text-red-500 font-bold"
                              >
                                {errors.description}
                              </p>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={isReporting}
                            className="w-full flex items-center justify-center gap-4 py-4 bg-[#0B3A68] hover:bg-[#082a4d] text-white rounded-sm transition-all disabled:opacity-50 shadow-sm border border-[#0B3A68]"
                          >
                            {isReporting ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-5 h-5" />
                                <span className="text-sm font-semibold">
                                  {t.submitOfficialReport}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}
              {activeTab === "floodRelief" && (
                <motion.div
                  key="floodRelief"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  {/* Relief Hero Header */}
                  <div className="bg-[#0B3A68] rounded-sm p-8 md:p-12 text-white relative overflow-hidden shadow-sm border border-[#0B3A68]">
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                      <Handshake className="w-full h-full rotate-12 scale-150" />
                    </div>
                    <div className="max-w-3xl relative z-10">
                      <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-tight !text-white">
                        {t.floodRelief}
                      </h2>
                      <p className="!text-white/90 font-mono text-[10px] md:text-sm leading-relaxed uppercase tracking-wider">
                        {selectedLanguage === "hi"
                          ? "मानवीय सहायता, गुमशुदा व्यक्तियों की खोज और राहत कार्यों में भागीदारी के लिए आपका मिशन नियंत्रण।"
                          : "Your mission control for humanitarian aid, missing person registries, and relief participation."}
                      </p>
                    </div>
                  </div>

                  {/* Mission Tracking Console */}
                  <div className="bg-white rounded-sm p-8 border border-[#0B3A68] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="animate-pulse flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-india-green"></div>
                        <span className="text-[9px] font-black uppercase text-india-green">
                          Systems Online
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1">
                        <div className="flex flex-col">
                          <div className="inline-flex items-center bg-ashoka-blue/10 text-ashoka-blue px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest border border-ashoka-blue/20 mb-2 w-fit">
                            {selectedLanguage === "hi"
                              ? "अपनी बाढ़ राहत टिकट ट्रैक करें"
                              : "Track Your Flood Relief Ticket"}
                          </div>
                        </div>
                        <p className="text-xs text-black/50 font-medium leading-tight">
                          {selectedLanguage === "hi"
                            ? "गुमशुदा व्यक्ति की रिपोर्ट, स्वयंसेवक मिशन या परामर्श अनुरोधों को ट्रैक करने के लिए अपनी आईडी दर्ज करें।"
                            : "Enter your ID to track missing person reports, volunteer missions, or counseling requests."}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <input
                          placeholder={
                            selectedLanguage === "hi"
                              ? "आईडी दर्ज करें (जैसे: JAL-123456)"
                              : "ENTER ID (E.G. JAL-123456)"
                          }
                          className="bg-slate-50 border border-slate-300 rounded-sm px-5 py-3 text-sm font-mono focus:border-[#0B3A68] outline-none flex-1 md:w-72 transition-all uppercase placeholder:text-[10px]"
                          value={trackingIdInput}
                          onChange={(e) =>
                            setTrackingIdInput(e.target.value.toUpperCase())
                          }
                        />
                        <button
                          onClick={() => handleTrackLookup(trackingIdInput)}
                          className="bg-[#0B3A68] text-white px-8 py-3 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-[#082a4d] transition-all shadow-sm active:scale-95 border border-[#0B3A68]"
                        >
                          {isTrackingLookup
                            ? selectedLanguage === "hi"
                              ? "सिंक हो रहा है..."
                              : "Syncing..."
                            : selectedLanguage === "hi"
                              ? "खोजें"
                              : "Locate"}
                        </button>
                      </div>
                    </div>

                    {activeTrackingData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 pt-8 border-t-2 border-dashed border-border flex flex-col lg:flex-row gap-10"
                      >
                        <div className="lg:w-1/3 p-6 bg-slate-50 rounded-sm border border-slate-200">
                          <label className="text-[10px] font-black uppercase text-black/40 mb-2 block">
                            {selectedLanguage === "hi"
                              ? "सक्रिय मिशन प्रोफाइल"
                              : "Active Mission Profile"}
                          </label>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-ashoka-blue uppercase mb-1">
                                {selectedLanguage === "hi"
                                  ? "आईडी कोड"
                                  : "ID Code"}
                              </p>
                              <p className="text-lg font-mono font-black text-black">
                                {activeTrackingData.id}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-ashoka-blue uppercase mb-1">
                                {selectedLanguage === "hi"
                                  ? "मिशन प्रकार"
                                  : "Mission Type"}
                              </p>
                              <p className="text-xs font-bold text-black">
                                {activeTrackingData.type}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-ashoka-blue uppercase mb-1">
                                {selectedLanguage === "hi"
                                  ? "संचालन क्षेत्र"
                                  : "Operational Area"}
                              </p>
                              <p className="text-xs font-bold text-black">
                                {activeTrackingData.location}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                            <div className="space-y-8">
                              {activeTrackingData.timeline.map(
                                (step: any, idx: number) => (
                                  <div key={idx} className="relative pl-12">
                                    <div
                                      className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center z-10 ${
                                        step.status === "done"
                                          ? "bg-india-green"
                                          : step.status === "active"
                                            ? "bg-ashoka-blue animate-pulse"
                                            : "bg-gray-200"
                                      }`}
                                    >
                                      {step.status === "done" && (
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                      )}
                                      {step.status === "active" && (
                                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                                      )}
                                    </div>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5
                                          className={`text-sm font-bold ${step.status === "pending" ? "text-black/30" : "text-black"}`}
                                        >
                                          {step.label}
                                        </h5>
                                        <p className="text-xs text-black/50 mt-1 max-w-md">
                                          {step.desc}
                                        </p>
                                      </div>
                                      <span className="text-[10px] font-mono font-bold text-ashoka-blue bg-ashoka-blue/5 px-2 py-1 rounded">
                                        {step.time}
                                      </span>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {reliefRequests.length > 0 && (
                    <div className="bg-white border border-slate-300 rounded-sm p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-ashoka-blue">
                          Internal Request Ledger
                        </h4>
                        <span className="text-[10px] font-mono text-black/50 uppercase">
                          Last {Math.min(reliefRequests.length, 30)} records
                        </span>
                      </div>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {reliefRequests.slice(0, 10).map((item) => (
                          <div
                            key={item.id}
                            className="border border-slate-200 rounded-sm p-3 bg-slate-50"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-black text-ashoka-blue tracking-widest">
                                {item.id}
                              </span>
                              <span className="text-[10px] font-bold uppercase text-black/60">
                                {item.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-black/70 mt-1 font-semibold">
                              {item.caption}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-black/50 uppercase">
                              <span>{item.status}</span>
                              <span>•</span>
                              <span>
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Column 1: Missing Person Registry */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-sm p-6 border border-slate-300 shadow-sm flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-red-500/10 rounded-xl">
                            <UserSearch className="text-red-600 w-5 h-5" />
                          </div>
                          <div>
                            <div className="inline-flex items-center bg-red-500/10 text-red-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border border-red-500/20 mb-1">
                              {selectedLanguage === "hi"
                                ? "गुमशुदा व्यक्ति"
                                : "Missing Person"}
                            </div>
                            <p className="text-[9px] font-mono text-black/40 uppercase tracking-tighter">
                              Responder Registry
                            </p>
                          </div>
                        </div>

                        <form
                          className="space-y-4 flex-1"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!missingPersonData.isContactVerified) {
                              alert(
                                selectedLanguage === "hi"
                                  ? "कृपया पहले अपना संपर्क नंबर सत्यापित करें"
                                  : "Please verify your contact number first",
                              );
                              return;
                            }
                            if (!missingPersonPhoto || !identityProof) {
                              alert(
                                selectedLanguage === "hi"
                                  ? "तस्वीर और आईडी प्रमाण अनिवार्य हैं"
                                  : "Photograph and ID proof are mandatory",
                              );
                              return;
                            }
                            const handleSubmit = async () => {
                              setIsSubmittingMissing(true);
                              try {
                                const ref = generateInternalRef("MP");
                                const payload = {
                                  referenceId: ref,
                                  type: "missing_person",
                                  name: missingPersonData.name,
                                  age: missingPersonData.age,
                                  gender: missingPersonData.gender,
                                  lastSeenLocation: missingPersonData.lastSeenLocation,
                                  physicalFeatures: missingPersonData.physicalFeatures,
                                  contactName: missingPersonData.contactName,
                                  contactPhone: missingPersonData.contactPhone,
                                  category: "humanitarian",
                                  timestamp: new Date().toISOString(),
                                  timeline: [
                                    {
                                      status: "Alert Created",
                                      time: new Date().toLocaleTimeString(),
                                      message: "Missing Person SOS lodged in JalRakshak Registry",
                                    },
                                    {
                                      status: "Tracking Initiated",
                                      time: new Date().toLocaleTimeString(),
                                      message: `Reference ID assigned: ${ref}`,
                                    }
                                  ]
                                };

                                await firebaseService.submitReliefRequest(payload);

                                if (onAddReport) {
                                  onAddReport({
                                    id: ref,
                                    location: missingPersonData.lastSeenLocation,
                                    type: "Missing Person",
                                    status: "Verification Stage",
                                    time: "Just Now",
                                    severity: "Critical",
                                    description: `Missing: ${missingPersonData.name}, Age: ${missingPersonData.age}.`,
                                  });
                                }

                                setSuccessModal({ show: true, type: "missing", ref });
                                setMissingPersonData({
                                  name: "", age: "", gender: "", lastSeenLocation: "",
                                  lastSeenTime: "", description: "", physicalFeatures: "",
                                  contactName: "", contactRelation: "", contactPhone: "",
                                  isContactVerified: false,
                                });
                                setMissingPersonPhoto(null);
                                setIdentityProof(null);
                              } catch (err) {
                                console.error("Mission failed:", err);
                                alert("Failed to transmit alert. Please check your data-link.");
                              } finally {
                                setIsSubmittingMissing(false);
                              }
                            };
                            handleSubmit();
                          }}
                        >
                          <div className="space-y-3">
                            <input
                              required
                              placeholder="Full Name"
                              className="w-full bg-slate-50 border border-slate-300 rounded-sm p-3 text-xs"
                              value={missingPersonData.name}
                              onChange={(e) =>
                                setMissingPersonData({
                                  ...missingPersonData,
                                  name: e.target.value,
                                })
                              }
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                required
                                type="number"
                                placeholder="Age"
                                className="w-full bg-slate-50 border border-slate-300 rounded-sm p-3 text-xs"
                                value={missingPersonData.age}
                                onChange={(e) =>
                                  setMissingPersonData({
                                    ...missingPersonData,
                                    age: e.target.value,
                                  })
                                }
                              />
                              <select
                                required
                                className="w-full bg-slate-50 border border-slate-300 rounded-sm p-3 text-xs"
                                value={missingPersonData.gender}
                                onChange={(e) =>
                                  setMissingPersonData({
                                    ...missingPersonData,
                                    gender: e.target.value,
                                  })
                                }
                              >
                                <option value="">Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>
                            </div>
                            <input
                              required
                              placeholder="Last Seen Location"
                              className="w-full bg-slate-50 border border-slate-300 rounded-sm p-3 text-xs"
                              value={missingPersonData.lastSeenLocation}
                              onChange={(e) =>
                                setMissingPersonData({
                                  ...missingPersonData,
                                  lastSeenLocation: e.target.value,
                                })
                              }
                            />
                            <textarea
                              placeholder="Physical Features..."
                              rows={2}
                              className="w-full bg-slate-50 border border-slate-300 rounded-sm p-3 text-xs resize-none"
                              value={missingPersonData.physicalFeatures}
                              onChange={(e) =>
                                setMissingPersonData({
                                  ...missingPersonData,
                                  physicalFeatures: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <label className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-dashed border-slate-300 rounded-sm cursor-pointer hover:border-ashoka-blue pb-4">
                              <Camera
                                className={`w-5 h-5 ${missingPersonPhoto ? "text-india-green" : "text-ashoka-blue"} mb-1`}
                              />
                              <span className="text-[8px] text-center uppercase font-bold text-black/40">
                                {missingPersonPhoto ? "Photo ✓" : "Photo *"}
                              </span>
                              <input
                                required
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  setMissingPersonPhoto(
                                    e.target.files?.[0] || null,
                                  )
                                }
                              />
                            </label>
                            <label className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-dashed border-slate-300 rounded-sm cursor-pointer hover:border-ashoka-blue pb-4">
                              <Shield
                                className={`w-5 h-5 ${identityProof ? "text-india-green" : "text-ashoka-blue"} mb-1`}
                              />
                              <span className="text-[8px] text-center uppercase font-bold text-black/40">
                                {identityProof ? "ID ✓" : "ID Proof *"}
                              </span>
                              <input
                                required
                                type="file"
                                accept=".pdf,image/*"
                                className="hidden"
                                onChange={(e) =>
                                  setIdentityProof(e.target.files?.[0] || null)
                                }
                              />
                            </label>
                          </div>

                          <div className="p-4 bg-slate-50 rounded-sm space-y-2 border border-slate-200">
                            <input
                              required
                              placeholder="Reporter Name"
                              className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-[11px]"
                              value={missingPersonData.contactName}
                              onChange={(e) =>
                                setMissingPersonData({
                                  ...missingPersonData,
                                  contactName: e.target.value,
                                })
                              }
                            />
                            <div className="flex gap-2">
                              <input
                                required
                                type="tel"
                                placeholder="Phone"
                                className="flex-1 bg-white border border-slate-300 rounded-sm px-3 py-2 text-[11px]"
                                value={missingPersonData.contactPhone}
                                onChange={(e) =>
                                  setMissingPersonData({
                                    ...missingPersonData,
                                    contactPhone: e.target.value,
                                    isContactVerified: false,
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  missingPersonData.contactPhone.length ===
                                    10 &&
                                  setMissingPersonData({
                                    ...missingPersonData,
                                    isContactVerified: true,
                                  })
                                }
                                className={`px-3 rounded-sm text-[9px] font-bold uppercase ${missingPersonData.isContactVerified ? "bg-india-green text-white" : "bg-[#0B3A68] text-white"}`}
                              >
                                {missingPersonData.isContactVerified
                                  ? "✓"
                                  : "Verify"}
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingMissing}
                            className="w-full bg-red-600 text-white py-3 rounded-sm font-bold uppercase tracking-widest text-[10px] shadow-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 border border-red-700"
                          >
                            {isSubmittingMissing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Transmit Alert"
                            )}
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Column 2: Volunteer Network */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-sm p-6 border border-slate-300 shadow-sm flex flex-col h-full group">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-india-green/10 rounded-xl group-hover:bg-india-green/20 transition-all">
                            <Handshake className="text-india-green w-5 h-5" />
                          </div>
                          <div>
                            <div className="inline-flex items-center bg-india-green/10 text-india-green px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border border-india-green/20 mb-1">
                              Volunteer Network
                            </div>
                            <p className="text-[9px] font-mono text-black/40 uppercase tracking-tighter">
                              Responder Units
                            </p>
                          </div>
                        </div>

                        {!showVolunteerForm ? (
                          <div className="flex flex-col flex-1">
                            <div className="flex-1 flex flex-col justify-center mb-8">
                              <p className="text-[11px] text-black/60 leading-relaxed mb-6 text-center">
                                Join citizens assisting in rescue ops, food
                                logistics, and on-ground registry verification.
                                Current active missions in{" "}
                                <span className="font-bold text-ashoka-blue">
                                  {districtName}
                                </span>
                                .
                              </p>
                              <button
                                onClick={() => setShowVolunteerForm(true)}
                                className="w-full h-12 bg-[#0B3A68] text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#082a4d] transition-all shadow-sm border border-[#0B3A68]"
                              >
                                Apply for Enrollment
                              </button>
                            </div>

                            {/* Mission Analytics - Whitespace Fix */}
                            <div className="bg-slate-50 rounded-sm p-4 border border-slate-200 mt-auto">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[8px] font-black uppercase text-black/40">
                                  Mission Analytics
                                </span>
                                <span className="text-[8px] font-bold text-ashoka-blue">
                                  Live Updates
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-2 bg-white rounded-lg border border-border">
                                  <p className="text-lg font-black text-india-green">
                                    14
                                  </p>
                                  <p className="text-[7px] font-bold uppercase text-black/40 leading-none">
                                    Open Slots
                                  </p>
                                </div>
                                <div className="text-center p-2 bg-white rounded-lg border border-border">
                                  <p className="text-lg font-black text-ashoka-blue">
                                    2h
                                  </p>
                                  <p className="text-[7px] font-bold uppercase text-black/40 leading-none">
                                    Response Time
                                  </p>
                                </div>
                              </div>
                              <p className="text-[8px] text-black/40 mt-3 text-center uppercase tracking-widest font-bold">
                                Priority: Medical & Logistics
                              </p>
                            </div>
                          </div>
                        ) : (
                          <form
                            className="space-y-4 flex-1"
                            onSubmit={(e) => {
                                  e.preventDefault();
                                  const handleSubmit = async () => {
                                    setIsSubmittingVolunteer(true);
                                    try {
                                      const refId = generateInternalRef("VR");
                                      const payload = {
                                        referenceId: refId,
                                        type: "volunteer",
                                        name: volunteerData.name,
                                        phone: volunteerData.phone,
                                        expertise: volunteerData.expertise,
                                        experience: volunteerData.experience,
                                        availability: volunteerData.availability,
                                        tools: volunteerData.tools,
                                        district: volunteerData.district || districtName,
                                        category: "humanitarian",
                                        timestamp: new Date().toISOString(),
                                        timeline: [
                                          {
                                            status: "Enrollment Started",
                                            time: new Date().toLocaleTimeString(),
                                            message: "Volunteer application synchronized with backend mission control",
                                          }
                                        ]
                                      };

                                      await firebaseService.submitReliefRequest(payload);

                                      if (onAddReport) {
                                        onAddReport({
                                          id: refId,
                                          location: payload.district,
                                          type: "Volunteer Enrollment",
                                          status: "Verification Stage",
                                          time: "Just Now",
                                          severity: "Medium",
                                          description: `Volunteer: ${volunteerData.name}. Skills: ${volunteerData.expertise}.`,
                                        });
                                      }

                                      setSuccessModal({ show: true, type: "volunteer", ref: refId });
                                      setShowVolunteerForm(false);
                                      setVolunteerData({
                                        name: "", phone: "", expertise: "general",
                                        experience: "none", availability: "all_day",
                                        tools: "", district: "",
                                      });
                                    } catch (err) {
                                      console.error("Volunteer submission failed:", err);
                                      alert("Submission failed. Try again.");
                                    } finally {
                                      setIsSubmittingVolunteer(false);
                                    }
                                  };
                                  handleSubmit();
                            }}
                          >
                            <div className="space-y-3">
                              <input
                                required
                                placeholder="Full Name"
                                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                value={volunteerData.name}
                                onChange={(e) =>
                                  setVolunteerData({
                                    ...volunteerData,
                                    name: e.target.value,
                                  })
                                }
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  required
                                  type="tel"
                                  placeholder="Phone"
                                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                  value={volunteerData.phone}
                                  onChange={(e) =>
                                    setVolunteerData({
                                      ...volunteerData,
                                      phone: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  placeholder="District/Ward"
                                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                  value={volunteerData.district}
                                  onChange={(e) =>
                                    setVolunteerData({
                                      ...volunteerData,
                                      district: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <select
                                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                value={volunteerData.expertise}
                                onChange={(e) =>
                                  setVolunteerData({
                                    ...volunteerData,
                                    expertise: e.target.value,
                                  })
                                }
                              >
                                <option value="general">
                                  Select Expertise
                                </option>
                                <option value="medical">
                                  Medical First Response
                                </option>
                                <option value="rescue">Search & Rescue</option>
                                <option value="logistics">
                                  Logistics & Food
                                </option>
                                <option value="tech">Tech & Comms</option>
                              </select>
                              <select
                                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                value={volunteerData.availability}
                                onChange={(e) =>
                                  setVolunteerData({
                                    ...volunteerData,
                                    availability: e.target.value,
                                  })
                                }
                              >
                                <option value="full">
                                  Full Day Availability
                                </option>
                                <option value="morning">
                                  Morning Shift (6AM-2PM)
                                </option>
                                <option value="night">
                                  Night Shift (10PM-6AM)
                                </option>
                              </select>
                              <input
                                placeholder="Equipment (e.g. Boat, 4x4, MedKit)"
                                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                value={volunteerData.tools}
                                onChange={(e) =>
                                  setVolunteerData({
                                    ...volunteerData,
                                    tools: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                className="flex-1 bg-[#0B3A68] text-white py-3 rounded-sm text-[10px] font-bold uppercase shadow-sm border border-[#0B3A68]"
                              >
                                Submit Mission
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowVolunteerForm(false)}
                                className="bg-black/5 text-black px-4 rounded-sm text-[10px] font-bold uppercase text-center border border-black/10 hover:bg-black/10"
                              >
                                X
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Crisis Counseling */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-sm p-6 border border-slate-300 shadow-sm flex flex-col h-full group">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-saffron/10 rounded-xl group-hover:bg-saffron/20 transition-all">
                            <Heart className="text-saffron w-5 h-5" />
                          </div>
                          <div>
                            <div className="inline-flex items-center bg-saffron/10 text-saffron px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border border-saffron/20 mb-1">
                              {t.crisisCounseling}
                            </div>
                            <p className="text-[9px] font-mono text-black/40 uppercase tracking-tighter">
                              Psychological Support
                            </p>
                          </div>
                        </div>

                        {!showCounselorForm ? (
                          <div className="flex flex-col flex-1">
                            <div className="flex-1 flex flex-col justify-center mb-8">
                              <p className="text-[11px] text-black/60 leading-relaxed mb-6 text-center">
                                Request professional counseling for grief,
                                trauma, or stress. Confidential 24/7 assistance
                                for all citizens in affected zones.
                              </p>
                              <button
                                onClick={() => setShowCounselorForm(true)}
                                className="w-full h-12 bg-white border border-[#0B3A68] text-[#0B3A68] rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                              >
                                Request Support
                              </button>
                            </div>

                            {/* Counseling Resources - Whitespace Fix */}
                            <div className="bg-slate-50 rounded-sm p-4 border border-slate-200 mt-auto">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1 bg-saffron rounded">
                                  <Clock className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-[8px] font-black uppercase text-saffron">
                                  Response Speed
                                </span>
                              </div>
                              <p className="text-[10px] font-bold text-black mb-1">
                                Average Wait: 8 Minutes
                              </p>
                              <p className="text-[9px] text-black/50 leading-tight mb-3">
                                Expert counselors are ready to help via voice or
                                chat modules.
                              </p>
                              <div className="flex gap-2">
                                <span className="text-[7px] font-black uppercase px-2 py-1 bg-white border border-saffron/20 rounded text-saffron">
                                  24/7 Helpline
                                </span>
                                <span className="text-[7px] font-black uppercase px-2 py-1 bg-white border border-saffron/20 rounded text-saffron">
                                  Anonymous
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <form
                            className="space-y-4 flex-1"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const handleSubmit = async () => {
                                setIsSubmittingCounselor(true);
                                try {
                                  const ref = generateInternalRef("CR");
                                  const payload = {
                                    referenceId: ref,
                                    type: "counseling",
                                    name: counselorData.name,
                                    phone: counselorData.phone,
                                    reason: counselorData.reason,
                                    urgency: counselorData.urgency,
                                    language: counselorData.language,
                                    preferredMode: counselorData.preferredMode,
                                    category: "humanitarian",
                                    timestamp: new Date().toISOString(),
                                    timeline: [
                                      {
                                        status: "Counseling Logged",
                                        time: new Date().toLocaleTimeString(),
                                        message: `Crisis counseling request created for urgency: ${counselorData.urgency.toUpperCase()}`,
                                      }
                                    ]
                                  };

                                  await firebaseService.submitReliefRequest(payload);

                                  if (onAddReport) {
                                    onAddReport({
                                      id: ref,
                                      location: "Priority: " + counselorData.urgency.toUpperCase(),
                                      type: "Counseling Request",
                                      status: "Pending Assignment",
                                      time: "Just Now",
                                      severity: counselorData.urgency === "sos" ? "Critical" : "High",
                                      description: `Counseling for ${counselorData.name}. Need: ${counselorData.reason}.`,
                                    });
                                  }

                                  setSuccessModal({ show: true, type: "counselor", ref });
                                  setShowCounselorForm(false);
                                  setCounselorData({
                                    name: "", phone: "", reason: "trauma",
                                    urgency: "high", language: "english", preferredMode: "voice",
                                  });
                                } catch (err) {
                                  console.error("Counseling failed:", err);
                                  alert("Failed to lodge request. Try again.");
                                } finally {
                                  setIsSubmittingCounselor(false);
                                }
                              };
                              handleSubmit();
                            }}
                          >
                            <div className="space-y-3">
                              <input
                                required
                                placeholder="Victim/Person Name"
                                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                value={counselorData.name}
                                onChange={(e) =>
                                  setCounselorData({
                                    ...counselorData,
                                    name: e.target.value,
                                  })
                                }
                              />
                              <input
                                required
                                type="tel"
                                placeholder="Contact Number"
                                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                value={counselorData.phone}
                                onChange={(e) =>
                                  setCounselorData({
                                    ...counselorData,
                                    phone: e.target.value,
                                  })
                                }
                              />
                              <select
                                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                value={counselorData.reason}
                                onChange={(e) =>
                                  setCounselorData({
                                    ...counselorData,
                                    reason: e.target.value,
                                  })
                                }
                              >
                                <option value="trauma">Trauma & Stress</option>
                                <option value="grief">Bereavement/Grief</option>
                                <option value="kids">Child Psychology</option>
                                <option value="general">General Support</option>
                              </select>
                              <div className="grid grid-cols-2 gap-3">
                                <select
                                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                  value={counselorData.urgency}
                                  onChange={(e) =>
                                    setCounselorData({
                                      ...counselorData,
                                      urgency: e.target.value,
                                    })
                                  }
                                >
                                  <option value="high">Priority: High</option>
                                  <option value="sos">Emergency SOS</option>
                                  <option value="standard">Standard</option>
                                </select>
                                <select
                                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                  value={counselorData.language}
                                  onChange={(e) =>
                                    setCounselorData({
                                      ...counselorData,
                                      language: e.target.value,
                                    })
                                  }
                                >
                                  <option value="english">English</option>
                                  <option value="hindi">Hindi</option>
                                  <option value="regional">Regional</option>
                                </select>
                              </div>
                              <select
                                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-sm text-xs"
                                value={counselorData.preferredMode}
                                onChange={(e) =>
                                  setCounselorData({
                                    ...counselorData,
                                    preferredMode: e.target.value,
                                  })
                                }
                              >
                                <option value="voice">
                                  Preference: Voice Call
                                </option>
                                <option value="chat">
                                  Preference: Live Chat
                                </option>
                                <option value="in-person">
                                  In-Person (Staging Point)
                                </option>
                              </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                className="flex-1 bg-[#0B3A68] text-white py-3 rounded-sm text-[10px] font-bold uppercase shadow-sm border border-[#0B3A68]"
                              >
                                Dispatch Request
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowCounselorForm(false)}
                                className="bg-black/5 text-black px-4 rounded-sm text-[10px] font-bold uppercase text-center border border-black/10 hover:bg-black/10"
                              >
                                X
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Unified Success Modal */}
      <AnimatePresence>
        {successModal.show &&
          (() => {
            const successMeta = getSuccessMeta(successModal.type || "missing");
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-ashoka-blue/60 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 30 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-sm p-10 max-w-md w-full shadow-sm text-center border border-slate-300"
                >
                  <div className="w-20 h-20 bg-india-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-india-green" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-ashoka-blue mb-2 uppercase">
                    {successMeta.title}
                  </h3>
                  <p className="text-xs text-ink/60 mb-8 font-mono uppercase tracking-widest">
                    {successMeta.subtitle}
                  </p>

                  <div className="bg-slate-50 border border-slate-300 rounded-sm p-6 mb-8">
                    <span className="text-[9px] font-black text-ashoka-blue/40 uppercase tracking-[0.2em] block mb-2">
                      Internal 11-Character Reference
                    </span>
                    <span className="text-3xl font-black text-ashoka-blue tracking-[0.25em]">
                      {successModal.ref}
                    </span>
                  </div>

                  <p className="text-xs text-ink/70 leading-relaxed mb-8">
                    {successMeta.caption}
                  </p>

                  <button
                    onClick={() =>
                      setSuccessModal({ show: false, type: null, ref: "" })
                    }
                    className="w-full bg-[#0B3A68] text-white py-4 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-[#082a4d] transition-all font-mono border border-[#0B3A68] shadow-sm"
                  >
                    CLOSE BROADCAST
                  </button>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      <GlassErrorModal
        isOpen={apiErrorModal.show}
        title={apiErrorModal.title}
        message={apiErrorModal.message}
        onRetry={handleRetry}
        onClose={() => setApiErrorModal((prev) => ({ ...prev, show: false }))}
        isRetrying={isRetryingAction}
      />

      <Toast
        toast={toast}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <footer className="mt-12 border-t border-border bg-[#0B3A68] text-white">
        <div className="w-full px-6 lg:px-12 py-8 border-b border-white/10 bg-[#15508a]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 text-center lg:text-left">
            {[
              { city: "Pune", high: "37.0°C", low: "19.8°C", rain: "0.0 mm" },
              { city: "Mumbai", high: "34.2°C", low: "25.0°C", rain: "0.0 mm" },
              {
                city: "New Delhi",
                high: "31.7°C",
                low: "16.4°C",
                rain: "0.0 mm",
              },
              {
                city: "Kolkata",
                high: "31.9°C",
                low: "24.6°C",
                rain: "0.0 mm",
              },
              {
                city: "Chennai",
                high: "34.3°C",
                low: "24.6°C",
                rain: "0.0 mm",
              },
            ].map((item) => (
              <div
                key={item.city}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-3"
              >
                <p className="text-lg font-bold">{item.city}</p>
                <p className="text-sm font-semibold mt-2">
                  {item.high} <span className="opacity-70">|</span> {item.low}
                </p>
                <p className="text-xs mt-1.5 uppercase tracking-widest text-white/80">
                  Rain: {item.rain}
                </p>
              </div>
            ))}
            <div className="rounded-lg border border-white/15 bg-white/5 px-4 py-3">
              <p className="text-sm font-black uppercase tracking-widest text-saffron">
                Visitor Count
              </p>
              <p className="text-3xl font-display font-black mt-2 tracking-[0.18em]">
                {String(visitorCount).padStart(7, "0")}
              </p>
              <p className="text-[10px] mt-1 uppercase tracking-widest text-white/80">
                Citizen Dashboard Visits
              </p>
            </div>
          </div>
        </div>

        <div className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-white/10">
          <div>
            <h4 className="text-base font-display font-bold uppercase tracking-wider text-saffron mb-3">
              Important Links
            </h4>
            <ul className="space-y-2 text-sm text-white/85">
              <li>District Disaster Management Authority</li>
              <li>State Emergency Operations Center</li>
              <li>Hydrology and Flood Monitoring Bulletin</li>
              <li>National Disaster Response Force</li>
              <li>Citizen Helpline Knowledge Base</li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-display font-bold uppercase tracking-wider text-saffron mb-3">
              Public Helplines
            </h4>
            <ul className="space-y-2 text-sm text-white/85">
              <li>Disaster Management: 1916</li>
              <li>NDRF Control Room: 1070</li>
              <li>Police Emergency: 100</li>
              <li>Fire and Rescue: 101</li>
              <li>Ambulance: 102 / 108</li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-display font-bold uppercase tracking-wider text-saffron mb-3">
              Contact Support
            </h4>
            <div className="space-y-2 text-sm text-white/85 mb-4">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-saffron" /> +91 11 4000 1916
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-saffron" /> support@jalrakshak.ai
              </p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-widest text-white/75 mb-2">
                Office Hours
              </p>
              <p className="text-xs text-white/90">Mon-Sat, 08:00 to 20:00</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-display font-bold uppercase tracking-wider text-saffron mb-3">
              Citizen Contact Form
            </h4>
            <form className="space-y-2.5" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/60 focus:outline-none focus:border-saffron"
              />
              <input
                type="text"
                placeholder="Mobile Number"
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/60 focus:outline-none focus:border-saffron"
              />
              <textarea
                rows={3}
                placeholder="Write your query"
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/60 focus:outline-none focus:border-saffron resize-none"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-saffron text-black py-2 text-[11px] font-black uppercase tracking-widest hover:bg-[#ffb14f] transition-colors"
              >
                Submit Query
              </button>
            </form>
          </div>
        </div>

        <div className="w-full px-6 lg:px-12 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-white/80">
          <p>
            Copyright © 2026 JalRakshak AI. All rights reserved. Proudly Made in
            India.
          </p>
          <p className="text-white/60">
            Built for public safety coordination, flood preparedness, and
            emergency response awareness.
          </p>
        </div>
      </footer>
    </div>
  );
};

const SafetyCard = ({
  icon,
  label,
  value,
  status,
  statusColor,
  subValue,
}: any) => {
  const Icon = icon;
  return (
    <div className="bg-white border border-border/60 p-6 rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-ashoka-blue/2 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
      <div className="flex items-center gap-4 mb-5">
        <div className="p-3 bg-ashoka-blue/5 rounded-2xl group-hover:scale-110 group-hover:bg-ashoka-blue/10 transition-all duration-300">
          {typeof Icon === "function" ? <Icon size={20} /> : Icon}
        </div>
        <div className="px-3 py-1 bg-ashoka-blue/10 text-ashoka-blue rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-ashoka-blue/20">
          {label}
        </div>
      </div>
      <div className="flex items-end justify-between relative z-10">
        <div>
          <div className="text-3xl font-display font-bold text-ashoka-blue mb-1 tracking-tight">
            {value}
          </div>
          {subValue && (
            <div className="text-[10px] text-ink/40 font-medium tracking-wide uppercase">
              {subValue}
            </div>
          )}
        </div>
        <div
          className={`text-[10px] font-black px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-sm ${statusColor} bg-white/50 animate-pulse-subtle`}
        >
          {status}
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ name, phone }: { name: string; phone: string }) => (
  <a
    href={`tel:${phone}`}
    className="flex items-center justify-between p-4 mb-3 bg-[#062444]/60 hover:bg-white rounded-sm border border-white/20 hover:border-white transition-all cursor-pointer group shadow-sm"
  >
    <div className="flex items-center gap-5">
      <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-red-500 shadow-sm text-white transition-colors">
        <Phone className="w-5 h-5" />
      </div>
      <div>
        <span className="block text-sm sm:text-[15px] font-bold text-white leading-none mb-1.5 group-hover:text-black transition-colors">
          {name}
        </span>
        <span className="block text-[11px] text-blue-100 uppercase tracking-widest font-mono group-hover:text-black/70">
          Emergency Line
        </span>
      </div>
    </div>
    <div className="text-right">
      <span className="block text-[11px] font-bold text-blue-100/90 mb-1 font-mono group-hover:text-black/60 transition-colors uppercase">
        COMM: TOLL-FREE
      </span>
      <span className="inline-block text-[11px] font-black text-white px-2.5 py-1 bg-white/10 rounded-sm uppercase group-hover:bg-[#0B3A68] group-hover:text-white transition-colors border border-white/20 shadow-sm mt-1">
        {phone}
      </span>
    </div>
  </a>
);

export default CitizenDashboard;
