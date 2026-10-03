import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  MapPin,
  CheckCircle2,
  Gem,
  Award,
} from 'lucide-react';
import { UserProfile } from '../types';

interface Brand3DMotionIntroProps {
  currentUser: UserProfile;
  onComplete: () => void;
  isReplay?: boolean;
}

interface OrbitalCraft {
  title: string;
  hindi: string;
  region: string;
  image: string;
  tag: string;
  color: string;
}

const ORBITAL_CRAFTS: OrbitalCraft[] = [
  {
    title: 'Blue Pottery',
    hindi: 'ब्लू पॉटरी',
    region: 'Jaipur, Rajasthan',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    tag: 'GI Tagged',
    color: '#1E6F8C',
  },
  {
    title: 'Ajrakh Blockprint',
    hindi: 'अजरक प्रिंट',
    region: 'Kutch, Gujarat',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80',
    tag: 'Natural Indigo',
    color: '#8D2B1D',
  },
  {
    title: 'Walnut Woodcraft',
    hindi: 'अखरोट की नक्काशी',
    region: 'Srinagar, Kashmir',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    tag: 'Hand-carved',
    color: '#654321',
  },
  {
    title: 'Dhokra Bell Metal',
    hindi: 'ढोकरा धातु शिल्प',
    region: 'Bastar, Chhattisgarh',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=600&q=80',
    tag: 'Lost-Wax Bronze',
    color: '#A2672B',
  },
];

export const Brand3DMotionIntro: React.FC<Brand3DMotionIntroProps> = ({
  currentUser,
  onComplete,
  isReplay = false,
}) => {
  // Phase state: 0 = 3D assemble, 1 = Brand name typography glow, 2 = Welcome & portal warp, 3 = Complete
  const [phase, setPhase] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax mouse movement calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  // Timeline orchestration
  useEffect(() => {
    // Stage 0 -> 1: Brand Name illumination
    const timer1 = setTimeout(() => {
      setPhase(1);
    }, 700);

    // Stage 1 -> 2: Personalized Welcome
    const timer2 = setTimeout(() => {
      setPhase(2);
    }, 1500);

    // Stage 2 -> 3: Final camera push-through & transition to home page
    const timer3 = setTimeout(() => {
      setPhase(3);
    }, 2400);

    const timerComplete = setTimeout(() => {
      onComplete();
    }, 2800);

    // Progress bar ticker
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerComplete);
      clearInterval(interval);
    };
  }, [onComplete]);

  // Derived 3D rotation angles based on mouse
  const tiltX = mousePos.y * -18;
  const tiltY = mousePos.x * 22;

  // Personalized subtitle based on role
  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'artisan':
        return { label: 'Master Artisan Studio', desc: 'AI Voice Cataloging & Direct Wholesale Orders' };
      case 'support_operator':
        return { label: 'Assisted Support Operator', desc: 'Onboarding & Phone Listing Dispatch' };
      case 'admin':
        return { label: 'Platform Administrator', desc: 'Catalog Governance & Artisan Verification' };
      case 'customer':
      default:
        return currentUser.business_name
          ? { label: 'B2B Wholesale Enterprise', desc: 'Volume Quotes & Crating Logistics' }
          : { label: 'Heritage Craft Patron', desc: 'Direct Artisan Commerce & 360° Inspection' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-b from-[#140E0A] via-[#221610] to-[#120D09] text-white flex flex-col items-center justify-center select-none"
      style={{ perspective: '1400px' }}
      id="brand-3d-motion-intro"
    >
      {/* Instant Skip Button */}
      <div className="absolute top-5 right-5 z-50">
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white tracking-wide transition-all shadow-lg backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
        >
          <span>Skip to Marketplace</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FFD285]" />
        </button>
      </div>

      {/* Background Animated Atmosphere: Glowing warm terracotta & gold dust */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radial ambient glow centered behind 3D logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-[#C85A32]/25 via-[#E27D26]/20 to-[#C99738]/15 rounded-full blur-3xl opacity-75 animate-pulse" />
        
        {/* Subtle Indian Geometric Mandala Lattice Watermark */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(#FAF7F2 1px, transparent 1px), radial-gradient(#C85A32 1.5px, transparent 1.5px)`,
            backgroundSize: '48px 48px',
            backgroundPosition: '0 0, 24px 24px',
          }}
        />

        {/* Floating golden embers / particles */}
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-tr from-[#E27D26] to-[#FCE77D]"
            style={{
              width: Math.random() * 5 + 2,
              height: Math.random() * 5 + 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(0.5px)',
            }}
            animate={{
              y: [0, -70, 0],
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 4 + (i % 3) * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i * 0.2) % 3,
            }}
          />
        ))}
      </div>

      {/* Top Controls: Skip & Brand Status */}
      <div className="absolute top-6 left-0 right-0 px-6 sm:px-12 flex items-center justify-between z-40">
        <div className="flex items-center gap-2 text-xs text-[#EAD8C7]/70 font-mono tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#E27D26] animate-ping" />
          <span>PORTAL ACTIVE</span>
          <span className="text-[#8C7A6B]">•</span>
          <span className="hidden sm:inline">AUTHENTIC INDIAN HANDICRAFTS</span>
        </div>

        <button
          onClick={onComplete}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-xs font-semibold text-white tracking-wide transition-all cursor-pointer shadow-lg hover:shadow-[#C85A32]/20 hover:scale-105"
          id="btn-skip-3d-intro"
        >
          <span>Skip to Home</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Primary 3D Stage Container */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl"
        style={{
          transformStyle: 'preserve-3d',
          rotateX: tiltX,
          rotateY: tiltY,
          transition: 'transform 0.15s ease-out',
        }}
        animate={{
          scale: phase === 3 ? 1.6 : 1,
          opacity: phase === 3 ? 0 : 1,
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* ========================================================================= */}
        {/* 3D FLOATING ORBITAL CRAFT CARDS */}
        {/* ========================================================================= */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {ORBITAL_CRAFTS.map((craft, idx) => {
            // Distribute 4 craft cards in an elliptical 3D orbit
            const angle = (idx / ORBITAL_CRAFTS.length) * Math.PI * 2;
            const radiusX = 260; // Horizontal radius
            const radiusY = 110; // Vertical tilt

            const posX = Math.cos(angle) * radiusX;
            const posY = Math.sin(angle) * radiusY;
            const posZ = Math.sin(angle) * 120; // 3D depth position

            return (
              <motion.div
                key={craft.title}
                className="hidden md:flex absolute flex-col items-center p-2 rounded-2xl bg-[#2A1D16]/80 border border-[#E27D26]/30 shadow-2xl backdrop-blur-md w-36 text-left transition-transform"
                style={{
                  transformStyle: 'preserve-3d',
                  left: `calc(50% + ${posX}px - 72px)`,
                  top: `calc(50% + ${posY}px - 60px)`,
                  transform: `translateZ(${posZ}px) rotateY(${-tiltY * 0.5}deg) rotateX(${-tiltX * 0.5}deg)`,
                }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{
                  opacity: phase >= 1 ? 0.88 : 0,
                  scale: phase >= 1 ? 1 : 0.4,
                  y: [0, -8, 0],
                }}
                transition={{
                  opacity: { duration: 0.7, delay: 0.2 + idx * 0.15 },
                  scale: { duration: 0.7, delay: 0.2 + idx * 0.15 },
                  y: { duration: 3.5 + idx, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <div className="relative w-full h-20 rounded-xl overflow-hidden mb-2 bg-[#1C140E]">
                  <img
                    src={craft.image}
                    alt={craft.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-[#EAD8C7] border border-white/20">
                    {craft.tag}
                  </span>
                </div>
                <div className="w-full px-1">
                  <p className="text-[10px] font-bold text-[#E27D26] uppercase tracking-wider leading-none">
                    {craft.hindi}
                  </p>
                  <p className="text-xs font-semibold text-white truncate mt-0.5">
                    {craft.title}
                  </p>
                  <p className="text-[10px] text-[#A69485] truncate">
                    {craft.region}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 3D SANSKRIT EMBLEM: Rotating "क" (Kala) */}
        {/* ========================================================================= */}
        <motion.div
          className="relative mb-6 cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          initial={{ rotateY: -180, scale: 0.4, opacity: 0 }}
          animate={{
            rotateY: [0, 15, -15, 0],
            scale: 1,
            opacity: 1,
          }}
          transition={{
            rotateY: { duration: 4, ease: 'easeInOut', repeat: Infinity },
            scale: { duration: 0.9, ease: 'easeOut' },
            opacity: { duration: 0.8 },
          }}
        >
          {/* Multi-layered 3D golden bevel box */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#E27D26] via-[#C85A32] to-[#782811] p-[3px] shadow-[0_20px_50px_rgba(200,90,50,0.5)] flex items-center justify-center relative"
            style={{
              transform: 'translateZ(40px)',
              boxShadow: '0 25px 50px -12px rgba(226, 125, 38, 0.45), 0 0 40px rgba(200, 90, 50, 0.3)',
            }}
          >
            {/* Inner golden glow plate */}
            <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#2E1A11] via-[#1B110B] to-[#120905] flex items-center justify-center border border-[#E27D26]/40 relative overflow-hidden">
              {/* Dynamic light reflection sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                animate={{ x: ['-150%', '200%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              />

              {/* Sanskrit "क" Calligraphy with multi-step 3D text extrusion */}
              <span
                className="font-serif text-5xl sm:text-6xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2D6] via-[#F8C168] to-[#D47E35] select-none"
                style={{
                  filter: 'drop-shadow(0 4px 10px rgba(226, 125, 38, 0.7))',
                  transform: 'translateZ(30px)',
                }}
              >
                क
              </span>
            </div>

            {/* Glowing corner accent jewels */}
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FFE5A3] shadow-[0_0_10px_#FFE5A3]" />
            <span className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-[#E27D26] shadow-[0_0_10px_#E27D26]" />
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3D WEBSITE NAME TYPOGRAPHY: KalaSetu (कलासेतु) */}
        {/* ========================================================================= */}
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
          {/* Devanagari Script Overhead with golden aura */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: phase >= 1 ? 1 : 0,
              y: phase >= 1 ? 0 : 15,
            }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-1"
            style={{ transform: 'translateZ(35px)' }}
          >
            <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#E27D26]" />
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-[#E89C4C] drop-shadow-[0_2px_8px_rgba(226,125,38,0.5)]">
              कलासेतु
            </span>
            <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#E27D26]" />
          </motion.div>

          {/* Majestic 3D English Title: KalaSetu */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.85, z: -50 }}
            animate={{
              opacity: phase >= 1 ? 1 : 0,
              scale: phase >= 1 ? 1 : 0.85,
              z: 60,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-serif text-5xl sm:text-7xl md:text-8xl font-black tracking-tight"
            style={{
              transform: 'translateZ(60px)',
              textShadow: `
                0 1px 0 #A84924,
                0 2px 0 #923C1A,
                0 3px 0 #7D3013,
                0 4px 0 #67250E,
                0 6px 1px rgba(0,0,0,0.4),
                0 15px 30px rgba(200,90,50,0.4)
              `,
            }}
          >
            <span className="text-white">Kala</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7A667] via-[#FFD285] to-[#E27D26]">
              Setu
            </span>
          </motion.h1>

          {/* Tagline: Heritage Provenance & Global Reach */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: phase >= 1 ? 1 : 0,
              y: phase >= 1 ? 0 : 15,
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-[#E8D8CA] font-medium tracking-wide max-w-xl mx-auto mt-3"
            style={{ transform: 'translateZ(25px)' }}
          >
            Bridging India’s Master Artisans Directly to the World
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* PERSONALIZED USER GREETING & ROLE WORKSPACE */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="mt-6 flex flex-col items-center"
              style={{ transform: 'translateZ(45px)' }}
            >
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C85A32]/30 via-[#E27D26]/20 to-[#C99738]/30 border border-[#E27D26]/40 backdrop-blur-md shadow-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-[#52B788] animate-pulse" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    Namaste, <span className="text-[#FFD285]">{currentUser.full_name}</span>!
                  </p>
                </div>
                <span className="text-[#A69485] text-xs">|</span>
                <span className="text-xs font-bold text-[#FFD285] uppercase tracking-wider">
                  {roleInfo.label}
                </span>
              </div>

              <p className="text-xs text-[#B5A593] mt-2 max-w-md">
                {roleInfo.desc} • Preparing your curated artisan marketplace...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* PROGRESS BAR & LAUNCH INDICATOR */}
        {/* ========================================================================= */}
        <div className="w-full max-w-xs mt-8" style={{ transform: 'translateZ(20px)' }}>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-[1px] border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#C85A32] via-[#E27D26] to-[#FFE082] rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#A69485] font-mono mt-2">
            <span>SYNCHRONIZING KILNS & LOOMS</span>
            <span className="text-[#FFD285] font-bold">{Math.round(progress)}%</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom Certifications & Trust Badges */}
      <div className="absolute bottom-6 left-0 right-0 px-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-[#A69485]/80 z-30">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#E27D26]" />
          <span>100% Certified Master Craftspeople</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#E27D26]" />
          <span>GI Tagged Indian Heritage</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Gem className="w-4 h-4 text-[#E27D26]" />
          <span>Direct Fair Trade & Zero Middleman</span>
        </div>
      </div>
    </div>
  );
};
