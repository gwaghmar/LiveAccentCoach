/**
 * AvatarDisplay component
 * Renders 3D avatar with mouth-sync animation
 */

'use client';

import React, { useEffect } from 'react';
import { useThreeJsAvatar } from '../hooks/useThreeJsAvatar';
import { BlendShape } from '../types';
import { AvatarSync } from '../utils/avatarSync';

interface AvatarDisplayProps {
  blendShapes: BlendShape[] | null;
}

export default function AvatarDisplay({ blendShapes }: AvatarDisplayProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { isReady, error, applyBlendShapes } = useThreeJsAvatar(containerRef);

  useEffect(() => {
    if (!isReady || !blendShapes) return;

    // Convert blendshapes to morph targets
    const morphTargets = AvatarSync.convertBlendShapesToMorphTargets(blendShapes);

    // Apply to avatar
    applyBlendShapes(morphTargets);
  }, [isReady, blendShapes, applyBlendShapes]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-bg-dark to-black rounded-[32px] overflow-hidden border border-white/5 ring-1 ring-white/10 shadow-3xl group">
      <div ref={containerRef} className="w-full h-full transition-transform duration-700 group-hover:scale-105" />

      {/* Neural Link Status Indicator */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
         <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-primary' : 'bg-white/20 animate-pulse'} shadow-[0_0_12px_var(--primary-glow)]`} />
         <p className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
           {isReady ? 'Neural Link Established' : 'Establishing Link...'}
         </p>
      </div>

      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-dark/80 backdrop-blur-sm">
           <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
           <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">Loading Entity</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 backdrop-blur-md p-8 text-center">
          <p className="text-red-400 font-bold mb-2">INTEGRITY FAILURE</p>
          <p className="text-white/40 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
