import React, { useEffect, useState, useCallback } from 'react';
import { KironMood } from '../types';

interface KironAvatarProps {
  mood: KironMood;
  animation: string; // 'none' | 'bounce' | 'blink'
  name: string;
}

const KironAvatar: React.FC<KironAvatarProps> = ({ mood, animation, name }) => {
  const [blink, setBlink] = useState(false);

  const doBlink = useCallback(() => {
    if (mood === KironMood.OFFLINE) return;
    setBlink(true);
    setTimeout(() => setBlink(false), 150);
  }, [mood]);

  // Auto-blink logic
  useEffect(() => {
    if (mood === KironMood.OFFLINE) return;
    
    const randomBlink = () => {
      doBlink();
      // Schedule next blink
      timeoutId = setTimeout(randomBlink, 3000 + Math.random() * 4000);
    };

    let timeoutId = setTimeout(randomBlink, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [mood, doBlink]);

  // Handle manual interaction
  const handleInteraction = () => {
    if (!blink) doBlink();
  };

  // Colors based on image: White body, Cyan accents
  const white = '#FFFFFF';
  const black = '#111827'; // Dark gray/black for face
  const cyan = '#22D3EE'; // Cyan for light/eyes
  
  // Eye color changes with mood
  const getEyeColor = () => {
    switch (mood) {
      case KironMood.OFFLINE: return '#374151'; // Dark gray
      case KironMood.SAD: return '#3B82F6'; // Blue
      case KironMood.NEUTRAL: return cyan;
      case KironMood.HAPPY: return '#67E8F9'; // Bright cyan
      default: return cyan;
    }
  };

  const eyeColor = getEyeColor();
  const isBounce = animation === 'bounce';

  // Truncate name if too long for the chest
  const displayName = name.length > 10 ? name.substring(0, 9) + '.' : name;

  return (
    <div 
      onClick={handleInteraction}
      className={`relative w-64 h-64 transition-transform duration-300 cursor-pointer ${isBounce ? 'animate-bounce-short' : 'animate-float'}`}
    >
      <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        {/* Shadow/Base */}
        <ellipse cx="100" cy="200" rx="60" ry="10" fill="#E5E7EB" opacity="0.6" />

        {/* --- BODY --- */}
        {/* Main Body (Teardrop shape) */}
        <path d="M60 130 C50 160 70 195 100 195 C130 195 150 160 140 130" fill={white} stroke="#E5E7EB" strokeWidth="1" />
        
        {/* Branding Text */}
        <text x="100" y="165" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5" transform="rotate(0 100 165)">
          {displayName.toUpperCase()}
        </text>

        {/* --- ARMS --- */}
        {/* Right Arm (Viewer's Right) */}
        <path d="M142 135 C155 140 160 160 155 175 C152 182 142 175 138 160 C136 150 138 140 142 135 Z" fill={white} stroke="#E5E7EB" strokeWidth="1" />
        <path d="M145 142 C152 145 155 160 152 170 C150 174 145 170 142 160 C140 150 142 145 145 142 Z" fill={cyan} fillOpacity="0.2" />

        {/* Left Arm (Viewer's Left) */}
        <path d="M58 135 C45 140 40 160 45 175 C 48 182 58 175 62 160 C 64 150 62 140 58 135 Z" fill={white} stroke="#E5E7EB" strokeWidth="1" />
        <path d="M55 142 C48 145 45 160 48 170 C 50 174 55 170 58 160 C 60 150 58 145 55 142 Z" fill={cyan} fillOpacity="0.2" />

        {/* --- NECK/COLLAR --- */}
        {/* Cyan bib/collar */}
        <path d="M68 120 Q100 145 132 120 L132 130 Q100 155 68 130 Z" fill={cyan} />

        {/* --- HEAD --- */}
        {/* Head Shape (Rounded Bulb) */}
        <path d="M45 50 C45 10 155 10 155 50 C155 90 145 125 100 125 C55 125 45 90 45 50 Z" fill={white} stroke="#F3F4F6" strokeWidth="1" />
        
        {/* Top Accent (Fin/Light) */}
        <path d="M85 15 Q100 5 115 15" fill={cyan} opacity="0.8" />

        {/* Face Screen (Large Black rounded shape) */}
        <path d="M55 55 C55 25 145 25 145 55 C145 85 135 105 100 105 C65 105 55 85 55 55 Z" fill={black} />

        {/* --- EYES --- */}
        {mood === KironMood.OFFLINE ? (
          <g stroke="#374151" strokeWidth="3" strokeLinecap="round" opacity="0.5">
             <path d="M75 65 L95 65" />
             <path d="M105 65 L125 65" />
          </g>
        ) : (
          <g 
            className={`transition-all duration-150 ease-in-out ${blink ? 'scale-y-0' : 'scale-y-100'}`} 
            style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
          >
            {/* Left Eye */}
            <path d="M70 65 Q80 55 90 65 Q80 75 70 65 Z" fill={eyeColor} filter="url(#glow)" />
            
            {/* Right Eye */}
            <path d="M110 65 Q120 55 130 65 Q120 75 110 65 Z" fill={eyeColor} filter="url(#glow)" />

            {/* Reflections */}
            <circle cx="75" cy="62" r="2.5" fill="white" opacity="0.9" />
            <circle cx="115" cy="62" r="2.5" fill="white" opacity="0.9" />
          </g>
        )}

        {/* Mouth/Expression (optional for Sad) */}
         {mood === KironMood.SAD && (
             <path d="M95 90 Q100 85 105 90" stroke={eyeColor} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        )}

        {/* Glow Filter Definition */}
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

      </svg>
    </div>
  );
};

export default KironAvatar;