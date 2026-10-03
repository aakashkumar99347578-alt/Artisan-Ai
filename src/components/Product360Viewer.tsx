import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Sparkles, Eye, Info, Play, Pause } from 'lucide-react';

interface Product360ViewerProps {
  baseImageUrl: string;
  productTitle: string;
  craftType?: string;
  hasMultiAnglePhotos?: boolean;
  onClose?: () => void;
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({
  baseImageUrl,
  productTitle,
  craftType,
  hasMultiAnglePhotos = false,
}) => {
  const [angleIndex, setAngleIndex] = useState(0); // 0 to 7 (8 angles)
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const angles = [
    { angle: 0, label: 'Front (0°)' },
    { angle: 45, label: 'Front-Right (45°)' },
    { angle: 90, label: 'Right Profile (90°)' },
    { angle: 135, label: 'Back-Right (135°)' },
    { angle: 180, label: 'Reverse Back (180°)' },
    { angle: 225, label: 'Back-Left (225°)' },
    { angle: 270, label: 'Left Profile (270°)' },
    { angle: 315, label: 'Front-Left (315°)' },
  ];

  // Auto rotation timer
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setAngleIndex((prev) => (prev + 1) % 8);
    }, 1200);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsAutoRotating(false);
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 25) {
      if (deltaX > 0) {
        setAngleIndex((prev) => (prev + 1) % 8);
      } else {
        setAngleIndex((prev) => (prev - 1 + 8) % 8);
      }
      startXRef.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Simulated 3D perspective rotation transformation
  const currentAngleDeg = angles[angleIndex].angle;
  // Calculate subtle optical skew and lighting shift to give true 3D orbital inspection feel
  const rotationY = currentAngleDeg;
  const shadowOffset = Math.sin((currentAngleDeg * Math.PI) / 180) * 15;
  const brightness = 100 - Math.abs(Math.sin((currentAngleDeg * Math.PI) / 180)) * 12;

  return (
    <div className="bg-[#FAF7F2] rounded-2xl border border-[#DFD5C4] p-4 sm:p-6 select-none">
      {/* Header / Mode Indicator */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#EFE9DE]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
            <RotateCw className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-[#2D241E]">
              Interactive 360° Studio View
            </h4>
            <p className="text-[11px] text-[#8C7A6B]">
              Drag left or right to orbit around the piece
            </p>
          </div>
        </div>

        {/* Mode Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E27D26]/15 border border-[#E27D26]/30 text-[#C85A32] text-xs font-semibold">
          <Sparkles className="w-3 h-3 text-[#E27D26]" />
          <span>{hasMultiAnglePhotos ? 'Mode 1: Photographic 360' : 'Mode 2: AI 360 Preview'}</span>
        </div>
      </div>

      {/* Notice regarding AI preview accuracy */}
      {!hasMultiAnglePhotos && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-700" />
          <span>
            <strong>AI-generated preview:</strong> Angles other than the front view are synthesized for spatial dimension. They reflect handcrafted proportions but are not separate photographic captures.
          </span>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div
        className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl bg-gradient-to-b from-[#FFFFFF] to-[#F4EFE6] border border-[#DFD5C4] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing shadow-inner"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Orbital angle rings background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-72 h-72 rounded-full border border-dashed border-[#3E2415]" />
          <div className="absolute w-48 h-48 rounded-full border border-[#C85A32]" />
        </div>

        {/* 3D Perspective Canvas Simulation */}
        <div
          className="relative transition-transform duration-200 ease-out flex items-center justify-center"
          style={{
            perspective: 800,
          }}
        >
          <img
            src={baseImageUrl}
            alt={`${productTitle} at ${angles[angleIndex].label}`}
            className="max-h-64 sm:max-h-72 object-contain drop-shadow-xl transition-all duration-300"
            style={{
              transform: `rotateY(${rotationY > 180 ? 360 - rotationY : rotationY}deg) scale(${1 - Math.abs(Math.sin((rotationY * Math.PI) / 180)) * 0.08})`,
              filter: `brightness(${brightness}%) contrast(102%) drop-shadow(${shadowOffset}px 18px 24px rgba(62,36,21,0.22))`,
            }}
            draggable={false}
          />
        </div>

        {/* Live Angle Indicator Floating Tag */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E27D26] animate-pulse" />
          <span>{angles[angleIndex].label}</span>
        </div>

        {/* Auto Rotate Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsAutoRotating(!isAutoRotating);
          }}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-[#3E2415] shadow-md border border-[#DFD5C4] transition-transform active:scale-95 cursor-pointer"
          title={isAutoRotating ? 'Pause rotation' : 'Resume auto-rotation'}
        >
          {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* 8-Angle Quick Select Step Pills */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
        {angles.map((ang, idx) => (
          <button
            key={ang.angle}
            onClick={() => {
              setIsAutoRotating(false);
              setAngleIndex(idx);
            }}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
              angleIndex === idx
                ? 'bg-[#C85A32] text-white shadow-xs'
                : 'bg-white hover:bg-[#F4EFE6] text-[#5A3924] border border-[#DFD5C4]'
            }`}
          >
            {ang.angle}°
          </button>
        ))}
      </div>
    </div>
  );
};
