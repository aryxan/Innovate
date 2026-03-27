import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Waves,
  Activity,
  Users,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  Globe,
  CheckCircle2,
} from "lucide-react";

interface LandingPageProps {
  onLaunch: () => void;
}

const capabilityCards = [
  {
    title: "Citizen Incident Reporting",
    desc: "Submit flood incidents with geolocation, timestamp watermark, and proof media in one secure flow.",
    icon: ShieldCheck,
  },
  {
    title: "Live River And Weather Pulse",
    desc: "Track alerts, flood indicators, and safety intelligence from integrated map and telemetry layers.",
    icon: Waves,
  },
  {
    title: "Mission Control For Admin",
    desc: "Review complaints, trust score, and response timeline from a centralized emergency dashboard.",
    icon: Activity,
  },
];

const missionStats = [
  { label: "Avg Incident Intake", value: "2m 40s" },
  { label: "Reports Triaged", value: "12,840" },
  { label: "Districts Covered", value: "412" },
  { label: "Live Alerts Synced", value: "98.6%" },
];

const workflowSteps = [
  {
    title: "Citizen Upload",
    detail: "Geotagged report with timestamped evidence is submitted from the field.",
  },
  {
    title: "Validation And Trust",
    detail: "Image integrity and trust score are computed before response dispatch.",
  },
  {
    title: "Response Tracking",
    detail: "Command center and citizens follow the same live status timeline.",
  },
];

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visitorCount, setVisitorCount] = useState(1124387);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const key = "jalrakshak-visitor-count";
    const existing = localStorage.getItem(key);
    if (existing) {
      const parsed = Number(existing);
      if (!Number.isNaN(parsed)) {
        setVisitorCount(parsed + 1);
        localStorage.setItem(key, String(parsed + 1));
        return;
      }
    }
    localStorage.setItem(key, String(visitorCount));
  }, []);

  return (
    <div className="min-h-screen bg-[#eef1f5] text-ink relative overflow-hidden">
      <div className="absolute inset-0 indian-pattern pointer-events-none" />

      <header className="official-header relative z-10">
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
                JalRakshak - Citizen Dashboard
              </h1>
              <p className="text-[7px] md:text-[10px] text-white/70 font-mono flex items-center gap-1.5 md:gap-2 uppercase tracking-wider truncate">
                <Clock className="w-2 md:w-3 h-2 md:h-3" />
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <span className="hidden sm:inline">
                  | Flood Monitoring & Safety Guidance Platform
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onLaunch}
            className="indigo-button !bg-white !text-ashoka-blue hover:!bg-slate-100 text-[10px] md:text-[11px]"
          >
            Enter Citizen Dashboard
          </button>
        </div>
      </header>

      <main className="relative z-10 w-full px-6 lg:px-12 py-10 md:py-14">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card relative overflow-hidden bg-white/86 backdrop-blur-[2px] border border-border p-8 md:p-12"
        >
          <div className="max-w-4xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-ashoka-blue/10 border border-ashoka-blue/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-ashoka-blue mb-5">
              <MapPin className="w-3.5 h-3.5" /> Citizen Emergency Interface
            </div>

            <h2 className="text-3xl md:text-5xl font-display font-bold text-ashoka-blue leading-tight tracking-tight">
              Flood Reporting And Response, Built For Ground Reality
            </h2>

            <p className="mt-5 text-sm md:text-base text-ink/80 max-w-3xl leading-relaxed">
              Report incidents quickly, attach verified evidence, and receive tracking updates from a mission-focused public safety workflow.
              JalRakshak connects citizens and response teams through a single command-grade experience.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onLaunch}
                className="indigo-button text-[11px] !px-7 !py-3 flex items-center justify-center gap-2"
              >
                Enter Citizen Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {[
                "Watermarked, geotagged complaint evidence",
                "Blank-photo rejection and trust scoring",
                "Citizen to control-room synchronized tracking",
                "Emergency escalation ready in one flow",
              ].map((point) => (
                <div
                  key={point}
                  className="bg-ashoka-blue/5 border border-ashoka-blue/15 rounded-sm px-3 py-2 text-[11px] text-ashoka-blue/90 font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-india-green shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <section className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {missionStats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card bg-white/80 border border-border px-4 py-4"
            >
              <p className="text-[10px] uppercase tracking-widest text-ink/45 font-bold">
                {stat.label}
              </p>
              <p className="text-2xl font-display font-bold text-ashoka-blue mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4">
          {capabilityCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                className="glass-card bg-white/78 backdrop-blur-[2px] border border-border p-6"
              >
                <div className="w-11 h-11 rounded-sm border border-ashoka-blue/20 bg-ashoka-blue/5 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-ashoka-blue" />
                </div>
                <h3 className="text-base font-display font-bold text-ashoka-blue uppercase tracking-tight">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-ink/75 leading-relaxed">{card.desc}</p>
              </motion.article>
            );
          })}
        </section>

        <section className="mt-7 glass-card bg-white/82 border border-border p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-10 bg-ashoka-blue rounded-full" />
            <div>
              <h3 className="text-xl md:text-2xl font-display font-bold text-ashoka-blue uppercase tracking-tight">
                How JalRakshak Works
              </h3>
              <p className="text-xs text-ink/55 uppercase tracking-widest font-bold">
                Citizen To Response Lifecycle
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {workflowSteps.map((step, idx) => (
              <div
                key={step.title}
                className="rounded-sm border border-ashoka-blue/15 bg-ashoka-blue/[0.03] p-4"
              >
                <div className="w-8 h-8 rounded-full bg-ashoka-blue text-white text-xs font-black flex items-center justify-center mb-3">
                  {idx + 1}
                </div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-ashoka-blue">
                  {step.title}
                </h4>
                <p className="text-sm text-ink/75 mt-2 leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-border bg-[#0B3A68] text-white relative z-10">
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
                <p className="text-lg font-bold text-white">{item.city}</p>
                <p className="text-sm font-semibold mt-2 text-white">
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
              <p className="text-3xl font-display font-black mt-2 tracking-[0.18em] text-white">
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
}
