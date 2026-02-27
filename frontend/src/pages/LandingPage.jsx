import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BrainCircuit, Zap, BarChart3, ShieldAlert, Globe, ArrowRight, Github, Twitter, Linkedin, ChevronRight } from 'lucide-react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { indiaRiskData } from '../data/indiaRiskData';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState({});
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      title: "Real-Time Tracking & Visualization",
      desc: "Our high-precision dashboard monitors water levels, river currents, and rainfall patterns across India. By reducing latency to milliseconds, authorities can observe changing conditions instantly, allowing for rapid decision-making before a crisis escalates.",
      icon: <Activity className="w-8 h-8 text-blue-400" />,
    },
    {
      title: "Predictive AI Forecasting",
      desc: "Powered by advanced Machine Learning, JalRakshak analyzes historical and real-time topographical data. It forecasts potential flood risks up to 48 hours in advance with a 98% accuracy rate, turning reactive measures into proactive, life-saving strategies.",
      icon: <BrainCircuit className="w-8 h-8 text-teal-400" />,
    },
    {
      title: "Actionable Insights & Alerts",
      desc: "Raw data is useless without interpretation. Our engine automatically translates complex environmental metrics into automated evacuation routes, resource allocation suggestions, and tiered urgency alerts, directly delivered to your command center.",
      icon: <Zap className="w-8 h-8 text-amber-400" />,
    },
  ];

  const steps = [
    { num: "DATA-NODE", title: "Data Ingestion", desc: "We aggregate high-resolution satellite imagery, ground-level weather sensors, and historical topographical profiles in real-time." },
    { num: "AI-CORE", title: "AI Processing", desc: "Our proprietary deep learning models analyze the raw data feeds, recognizing historical patterns to formulate precise risk levels across affected regions." },
    { num: "CRISIS-NET", title: "Alert & Action", desc: "Local authorities receive tiered, actionable intelligence on their dashboards, enabling pre-emptive evacuations and optimized resource deployment." },
  ];

  const stats = [
    { value: "98%", label: "Prediction Accuracy", icon: <BarChart3 className="w-6 h-6 mb-3 text-blue-400 mx-auto" /> },
    { value: "<5s", label: "Alert Latency", icon: <ShieldAlert className="w-6 h-6 mb-3 text-red-400 mx-auto" /> },
    { value: "24/7", label: "Continuous Monitoring", icon: <Globe className="w-6 h-6 mb-3 text-emerald-400 mx-auto" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      {/* Inline styles for thematic animations */}
      <style>
        {`
          @keyframes border-radar {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .radar-sweep {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 800px;
            height: 800px;
            margin-left: -400px;
            margin-top: -400px;
            border-radius: 50%;
            background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(59, 130, 246, 0.15) 360deg);
            animation: border-radar 6s linear infinite;
            pointer-events: none;
          }
          @keyframes rain-drop {
            from { background-position: 0 0; }
            to { background-position: -100px 1000px; }
          }
          .rainfall-bg {
            background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10 L25 50 M120 40 L115 80 M180 130 L175 170 M70 150 L65 190 M10 120 L5 160 M150 10 L145 50 M90 90 L85 130' stroke='rgba(255,255,255,0.06)' stroke-width='0.5' fill='none' stroke-linecap='round' /%3E%3C/svg%3E");
            background-size: 200px 200px;
            animation: rain-drop 10s linear infinite;
          }
        `}
      </style>

      {/* Thematic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-slate-950">
        {/* Dark satellite terrain */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-luminosity bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage: 'url(/india-satellite-dark.png)',
            filter: 'blur(2px) contrast(1.2)'
          }}
        ></div>

        {/* Subtle blue gradient overlay to ensure text contrast and maintain SaaS aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-blue-950/90 mix-blend-multiply"></div>

        {/* Existing structural grid but more subtle */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30"></div>

        {/* Animated rainfall effect */}
        <div className="absolute inset-0 rainfall-bg opacity-70"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 shadow-2xl' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <img src="/logo.png" alt="JalRakshak AI Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 tracking-tight">
              JalRakshak<span className="text-blue-400">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300 hover:text-white">
            <button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-400 transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('stats')} className="hover:text-blue-400 transition-colors">Impact</button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="hidden md:block text-sm font-medium hover:text-white transition-colors"
            >
              Admin Login
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-bold tracking-wide transition-all shadow-md flex items-center gap-2 border border-blue-600 uppercase"
            >
              Access System <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-20 lg:pt-28 lg:pb-32 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-blue-500/30 text-blue-300 text-xs font-medium mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>JalRakshak Engine v2.0 is highly operational</span>
            </div>

            <div className="relative w-full overflow-visible">
              <div className="radar-sweep z-0 opacity-20"></div>
              <h1 className="relative z-10 text-4xl md:text-6xl font-bold tracking-tight mb-10 leading-[1.15] text-white">
                Anticipating Outcomes. <br className="hidden md:block" />
                <span className="text-blue-400">
                  Averting Disasters.
                </span>
              </h1>
            </div>

            <p className="max-w-2xl mx-auto text-slate-300 text-lg md:text-xl mb-14 leading-relaxed tracking-wide">
              India’s most advanced real-time predictive flood intelligence platform. Empowering command centers with localized topographical AI forecasts and instantaneous evacuation protocols.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold tracking-wide uppercase transition-all shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-blue-600"
              >
                Access Dashboard <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-semibold transition-all flex items-center justify-center">
                System Documentation
              </button>
            </div>

            {/* Credibility Stats Strip */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border border-slate-800 py-6 bg-slate-900/40 backdrop-blur-sm rounded-xl px-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">36+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Regions Monitored</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">2,450</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Active Sensors</div>
              </div>
              <div className="text-center border-t md:border-t-0 border-slate-800 md:border-l pt-4 md:pt-0">
                <div className="text-2xl font-bold text-white mb-1">10k+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Reports Processed</div>
              </div>
              <div className="text-center border-t md:border-t-0 border-slate-800 md:border-l pt-4 md:pt-0">
                <div className="text-2xl font-bold text-blue-400 mb-1">98.5%</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">AI Confidence</div>
              </div>
            </div>

            {/* Dashboard Abstract Preview */}
            <div className="mt-20 relative mx-auto max-w-5xl [perspective:1000px]">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 bottom-0 h-40 mt-auto"></div>
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-blue-900/20 transform [transform:rotateX(15deg)_scale(0.9)] hover:[transform:rotateX(0deg)_scale(1)] transition-transform duration-700 ease-out origin-bottom bg-slate-900">
                {/* Mockup Header */}
                <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5 border-r border-slate-700 pr-4">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono ml-2">jalrakshak.gov.in/intel-dashboard</div>
                </div>
                {/* Mockup Body Container */}
                <div className="relative h-[400px] w-full bg-slate-950 flex p-6 gap-6">
                  {/* Mock Map Area */}
                  <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-blue-500/5 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
                    <div className="w-full h-full pointer-events-none absolute inset-0 pt-12 transform scale-125">
                      <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{
                          scale: 650,
                          center: [80.9629, 22.5937]
                        }}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <Geographies geography="https://raw.githubusercontent.com/udit-001/india-maps-data/refs/heads/main/geojson/india.geojson">
                          {({ geographies }) =>
                            geographies.map((geo) => {
                              const stateName = geo.properties.st_nm;
                              const stateData = indiaRiskData[stateName];
                              let fillColor = "#334155"; // slate-700
                              if (stateData) {
                                if (stateData.risk === 'high') fillColor = "#ef4444";
                                else if (stateData.risk === 'medium') fillColor = "#f59e0b";
                                else if (stateData.risk === 'low') fillColor = "#10b981";
                              }
                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  fill={fillColor}
                                  stroke="#1e293b"
                                  strokeWidth={0.5}
                                  style={{
                                    default: { outline: "none" },
                                    hover: { outline: "none" },
                                    pressed: { outline: "none" }
                                  }}
                                />
                              );
                            })
                          }
                        </Geographies>
                      </ComposableMap>
                    </div>
                    {/* Overlay gradient to blend it nice with the mockup and soften the map */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent pointer-events-none"></div>
                  </div>
                  {/* Mock Sidebar Stats */}
                  <div className="w-64 space-y-4">
                    <div className="h-24 rounded-xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-xs font-mono text-slate-400">RIVER: BRAHMAPUTRA</div>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      </div>
                      <div className="w-full h-2 bg-red-500/20 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-red-500 rounded-full relative">
                          <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-[pulse_1s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-red-400 uppercase tracking-widest font-semibold flex justify-between">
                        <span>Critical Level</span>
                        <span>+2.4m</span>
                      </div>
                    </div>
                    <div className="h-40 rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                      <div className="text-xs font-mono text-slate-400 mb-2">REGIONAL RISK</div>
                      <div className="w-full h-8 bg-slate-800/50 rounded flex items-center px-3 border border-red-500/10"><div className="w-3 h-3 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div><div className="text-xs text-slate-300 font-mono">ASSAM</div></div>
                      <div className="w-full h-8 bg-slate-800/50 rounded flex items-center px-3 border border-amber-500/10"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div><div className="text-xs text-slate-300 font-mono">BIHAR</div></div>
                      <div className="w-full h-8 bg-slate-800/50 rounded flex items-center px-3 border border-emerald-500/10"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div><div className="text-xs text-slate-300 font-mono">PUNJAB</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-20 border-y border-slate-800/50 bg-slate-900/20 backdrop-blur-sm relative">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-on-scroll"
            style={{ opacity: isVisible['stats'] ? 1 : 0, transform: isVisible['stats'] ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease-out' }}>
            {stats.map((stat, i) => (
              <div key={i} className="p-6">
                {stat.icon}
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm font-medium tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 animate-on-scroll" id="features-header"
              style={{ opacity: isVisible['features-header'] ? 1 : 0, transition: 'all 0.8s ease-out' }}>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Enterprise-Grade Intelligence</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">Built from the ground up to handle massive, complex environmental datasets and transform them into instantaneous, life-saving insights.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} id={`feature-${i}`} className="animate-on-scroll group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-500 backdrop-blur-sm"
                  style={{ opacity: isVisible[`feature-${i}`] ? 1 : 0, transform: isVisible[`feature-${i}`] ? 'translateY(0)' : 'translateY(30px)', transition: `all 0.8s ease-out ${i * 0.2}s` }}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="mb-6 bg-slate-950 w-16 h-16 rounded-xl flex items-center justify-center border border-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm md:text-base">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-32 bg-slate-900/20 border-t border-slate-800/50 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 animate-on-scroll" id="hiw-header"
              style={{ opacity: isVisible['hiw-header'] ? 1 : 0, transition: 'all 0.8s ease-out' }}>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Data to Deployment Pipeline</h2>
              <p className="text-slate-400 text-lg">A mathematically robust sequence turning chaotic environmental signals into ordered rescue operations.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-[40px] left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-slate-800 via-blue-500/30 to-slate-800"></div>

              {steps.map((step, i) => (
                <div key={i} id={`step-${i}`} className="animate-on-scroll relative w-full md:w-1/3 p-6 text-center z-10"
                  style={{ opacity: isVisible[`step-${i}`] ? 1 : 0, transform: isVisible[`step-${i}`] ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.8s ease-out ${i * 0.2}s` }}>
                  <div className="w-auto px-6 h-12 mx-auto bg-slate-950 border-2 border-slate-800 rounded-lg flex items-center justify-center text-sm font-mono font-bold text-slate-400 mb-8 relative group hover:border-blue-500/50 transition-colors duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span> {step.num}
                    {/* Glowing effect under box */}
                    <div className="absolute -inset-2 bg-blue-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden border-t border-slate-800/50" id="cta-section">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-slate-950"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Ready to mitigate risks?</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">Join advanced command centers already using JalRakshak AI to predict, prepare, and protect.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white text-slate-950 hover:bg-slate-200 font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Access System <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-bold text-lg transition-all flex items-center justify-center gap-2">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-20 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 rounded-lg">
                  <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">JalRakshak<span className="text-blue-400">AI</span></span>
              </div>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                India's foundational AI infrastructure for intelligent flood detection and rapid automated disaster response.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> Dashboard</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> AI Forecasting</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> Real-time API</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> Research Papers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> Case Studies</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> Press</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><ChevronRight className="w-4 h-4 mr-1 opacity-50" /> Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>© 2026 JalRakshak AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
