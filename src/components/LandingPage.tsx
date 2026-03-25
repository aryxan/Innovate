import React, { useRef, useEffect, Suspense, useState } from 'react';
import { motion } from 'motion/react';
import { Waves, Droplets, Shield, Radio, ArrowRight, Activity, Globe as GlobeIcon, Users } from 'lucide-react';
import { Logo } from './Logo';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

interface LandingPageProps {
  onLaunch: () => void;
  onAdminPortal: () => void;
}

// --- Rain Background Component with Lightning ---
const RainBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const raindrops: { x: number; y: number; length: number; speed: number }[] = [];
    const count = 150;

    for (let i = 0; i < count; i++) {
      raindrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 5,
      });
    }

    let lightningOpacity = 0;
    let lightningBolts: { segments: { x: number; y: number }[] }[] = [];

    const createLightning = () => {
      const startX = Math.random() * width;
      const segments = [{ x: startX, y: 0 }];
      let currX = startX;
      let currY = 0;

      while (currY < height) {
        currX += (Math.random() - 0.5) * 100;
        currY += Math.random() * 50 + 20;
        segments.push({ x: currX, y: currY });
      }
      return { segments };
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Random Lightning - Made more rare and subtle
      if (Math.random() > 0.998) {
        lightningOpacity = 0.25;
        lightningBolts = [createLightning()];
        if (Math.random() > 0.8) lightningBolts.push(createLightning());
      }

      if (lightningOpacity > 0) {
        // Screen Flash - Reduced intensity
        ctx.fillStyle = `rgba(255, 255, 255, ${lightningOpacity * 0.2})`;
        ctx.fillRect(0, 0, width, height);

        // Draw Bolts - Thinner and more transparent
        ctx.strokeStyle = `rgba(255, 255, 255, ${lightningOpacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'white';

        lightningBolts.forEach((bolt) => {
          ctx.beginPath();
          ctx.moveTo(bolt.segments[0].x, bolt.segments[0].y);
          bolt.segments.forEach((seg) => {
            ctx.lineTo(seg.x, seg.y);
          });
          ctx.stroke();
        });

        ctx.shadowBlur = 0;
        lightningOpacity -= 0.02;
      }

      ctx.strokeStyle = 'rgba(174, 194, 224, 0.2)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      raindrops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
      });

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />;
};

// --- Satellite Component ---
const Satellite = () => {
  const satRef = useRef<THREE.Group>(null);
  const panelRef1 = useRef<THREE.MeshStandardMaterial>(null);
  const panelRef2 = useRef<THREE.MeshStandardMaterial>(null);
  
  // Light source position for glint calculation
  const lightPos = new THREE.Vector3(10, 10, 10);
  const tempVec = new THREE.Vector3();
  const tempNormal = new THREE.Vector3();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (satRef.current) {
      const orbitSpeed = t * 0.4;
      // Elliptical Orbit
      satRef.current.position.x = Math.cos(orbitSpeed) * 3.8;
      satRef.current.position.z = Math.sin(orbitSpeed) * 2.6;
      
      // Gentle bobbing
      satRef.current.position.y = Math.sin(t * 0.8) * 0.15 + Math.cos(t * 0.5) * 0.1;
      
      // Rotation & slight tilt
      satRef.current.rotation.y = orbitSpeed + Math.PI / 2; // Adjust rotation to face movement direction better
      satRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;

      // Dynamic Glint Calculation
      // Calculate direction from satellite to light source
      tempVec.copy(lightPos).sub(satRef.current.position).normalize();
      
      // Panel 1 Glint (Local normal is [1, 0, 0])
      tempNormal.set(1, 0, 0).applyQuaternion(satRef.current.quaternion);
      const dot1 = Math.max(0, tempNormal.dot(tempVec));
      const glint1 = Math.pow(dot1, 12) * 5; // High power for sharp "flash"
      if (panelRef1.current) panelRef1.current.emissiveIntensity = 0.4 + glint1;

      // Panel 2 Glint (Local normal is [-1, 0, 0])
      tempNormal.set(-1, 0, 0).applyQuaternion(satRef.current.quaternion);
      const dot2 = Math.max(0, tempNormal.dot(tempVec));
      const glint2 = Math.pow(dot2, 12) * 5;
      if (panelRef2.current) panelRef2.current.emissiveIntensity = 0.4 + glint2;
    }
  });

  return (
    <group ref={satRef}>
      {/* Satellite Body */}
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.15]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Solar Panels */}
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.25, 0.08, 0.01]} />
        <meshStandardMaterial ref={panelRef1} color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.25, 0.08, 0.01]} />
        <meshStandardMaterial ref={panelRef2} color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} />
      </mesh>
      {/* Signal Light */}
      <pointLight color="#3b82f6" intensity={2} distance={2} />
    </group>
  );
};

// --- Interactive Globe Component ---
const Globe = ({ scrollY }: { scrollY: number }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  // Responsive scale based on viewport
  const scale = Math.min(viewport.width / 8, 1.2);

  // Using high-quality world map textures
  const texture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
  const bumpMap = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
  const specMap = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
  const cloudsTexture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (globeRef.current) {
      globeRef.current.rotation.y = t * 0.05 + scrollY * 0.001;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = t * 0.07 + scrollY * 0.0015;
    }
    if (groupRef.current) {
      // Parallax effect on scroll
      groupRef.current.position.y = scrollY * 0.002;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Earth Mesh */}
      <mesh ref={globeRef} receiveShadow castShadow>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshPhongMaterial 
          map={texture} 
          normalMap={bumpMap}
          specularMap={specMap}
          specular={new THREE.Color('#333333')} // Darker specular for subtle highlights
          shininess={5} // Reduced shininess
          emissive="#050505" // Darker self-illumination
        />
      </mesh>
      
      {/* Clouds Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.53, 64, 64]} />
        <meshPhongMaterial 
          map={cloudsTexture}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[2.65, 64, 64]} />
        <meshPhongMaterial 
          color="#3b82f6"
          transparent
          opacity={0.1} // Reduced atmosphere opacity
          side={THREE.BackSide}
        />
      </mesh>

      <Satellite />
    </group>
  );
};

export default function LandingPage({ onLaunch, onAdminPortal }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(onLaunch, 1200); // Delay to allow animation to play
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden transition-opacity duration-1000 ${isLaunching ? 'opacity-0' : 'opacity-100'}`}>
      <RainBackground />

      {/* Atmospheric Depth Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-blue-600/10 blur-[160px] rounded-full opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/5 blur-[140px] rounded-full opacity-30"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
            <img 
              src="/logo.png" 
              alt="JalRakshak AI Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl md:text-2xl font-display tracking-tight uppercase leading-none">
            JalRakshak <span className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-white/60">
          <a href="#features" className="nav-link hover:text-white">Technology</a>
          <a href="#impact" className="nav-link hover:text-white">Impact</a>
          <button 
            onClick={handleLaunch}
            className="px-4 py-2 bg-white text-black rounded-full font-semibold hover:bg-blue-500 hover:text-white hover:scale-105 transition-all duration-300 active:scale-95"
          >
            Launch Dashboard
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-4 pb-12 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-20 text-center lg:text-left"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold tracking-[0.2em] uppercase mb-6"
            >
              <Activity className="w-3 h-3" />
              Pre-Monsoon Readiness 2026
            </motion.div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display leading-[0.85] uppercase mb-6 tracking-[-0.04em]">
              <motion.span 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="block"
              >
                Predict.
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="block text-blue-600"
              >
                Protect.
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="block"
              >
                Prevail.
              </motion.span>
            </h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-sm md:text-base text-white/50 max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed font-light"
            >
              The first AI-powered urban flood prediction platform designed for ward-level readiness. 
              Integrating satellite SAR data and citizen signals to save lives.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              <button 
                onClick={handleLaunch}
                className="group px-6 md:px-8 py-4 bg-blue-600 rounded-xl font-bold flex items-center gap-3 hover:bg-blue-700 hover:scale-105 hover-glow transition-all active:scale-95 text-sm"
              >
                Launch Citizen Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 40 },
                visible: { 
                  opacity: 1, 
                  scale: 1,
                  y: 0,
                  transition: { 
                    staggerChildren: 0.15,
                    delayChildren: 0.6,
                    duration: 0.8,
                    ease: "easeOut"
                  }
                }
              }}
              initial="hidden"
              animate="visible"
              className="mt-10 md:mt-12 grid grid-cols-3 gap-4 md:gap-6 border-t border-white/10 pt-6"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <div className="text-xl md:text-2xl font-bold font-mono">98%</div>
                <div className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-wider mt-1">Accuracy</div>
              </motion.div>
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <div className="text-xl md:text-2xl font-bold font-mono">45m</div>
                <div className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-wider mt-1">Lead Time</div>
              </motion.div>
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <div className="text-xl md:text-2xl font-bold font-mono">24/7</div>
                <div className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-wider mt-1">Monitoring</div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Interactive Globe Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className={`relative h-[350px] md:h-[450px] lg:h-[550px] w-full cursor-grab active:cursor-grabbing transition-transform duration-1000 ${isLaunching ? 'scale-[2.5] translate-x-[-20%]' : ''}`}
          >
            <div className="absolute inset-0 z-0">
              <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <ambientLight intensity={0.3} /> {/* Dimmer ambient light */}
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" castShadow /> {/* Dimmer point light */}
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
                <Suspense fallback={null}>
                  <Globe scrollY={scrollY} />
                </Suspense>
                <OrbitControls 
                  enableZoom={false} 
                  autoRotate 
                  autoRotateSpeed={0.5}
                  minPolarAngle={Math.PI / 3}
                  maxPolarAngle={Math.PI / 1.5}
                />
              </Canvas>
            </div>
            
            {/* Overlay Data Points */}
            <div className="absolute bottom-1/4 left-0 glass p-3 md:p-4 rounded-xl z-10 hidden sm:block">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-widest">Sentinel-1 Sync</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] md:text-xs font-mono">Active Connection</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-24 border-t border-white/5">
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-8 md:gap-12"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}>
            <FeatureCard 
              icon={<GlobeIcon className="w-6 h-6 text-blue-400" />}
              title="Satellite SAR Ingestion"
              description="Nightly soil moisture data from ISRO Bhuvan & Sentinel-1 SAR to predict instant runoff triggers."
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}>
            <FeatureCard 
              icon={<Radio className="w-6 h-6 text-blue-400" />}
              title="Social Signal Detection"
              description="Multilingual NLP pipeline scraping complaints in Hindi, Marathi, and Tamil for 45-min lead time."
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}>
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-blue-400" />}
              title="Proactive Response"
              description="Automatic Priority 1 escalation for hospitals and schools within 500m of predicted hotspots."
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-white/40 text-sm">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          <span>JalRakshak AI — India Innovates Hackathon 2026</span>
        </div>
        <div className="flex gap-4 md:gap-8">
          <a href="#" className="hover:text-white">Documentation</a>
          <a href="#" className="hover:text-white">Team</a>
          <button 
            onClick={onAdminPortal}
            className="hover:text-white opacity-50 hover:opacity-100 transition-opacity"
          >
            Admin Portal
          </button>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group p-8 md:p-10 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all hover:bg-white/[0.02] glass hover-lift relative overflow-hidden">
      {/* Hardware Style Dashed Border */}
      <div className="absolute inset-0 border border-dashed border-white/10 opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-blue-600/20 group-hover:scale-110 transition-all border border-white/10">
          {icon}
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-1 bg-blue-500 rounded-full group-hover:animate-pulse"></div>
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">System Module</span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors tracking-tight">{title}</h3>
        <p className="text-white/40 leading-relaxed text-sm font-light">{description}</p>
        
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">Status: Nominal</span>
          <div className="w-8 h-[1px] bg-white/10"></div>
        </div>
      </div>
    </div>
  );
}
