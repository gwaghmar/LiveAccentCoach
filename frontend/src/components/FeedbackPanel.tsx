/**
 * FeedbackPanel component
 * Displays coaching feedback and pronunciation score
 */

'use client';

import React from 'react';
import { CoachingResponse } from '../types';

interface FeedbackPanelProps {
  response: CoachingResponse | null;
  isLoading: boolean;
}

export default function FeedbackPanel({
  response,
  isLoading,
}: FeedbackPanelProps) {
  return (
    <div className="w-full h-full flex flex-col">
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
             <div className="relative">
               <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
               <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
             </div>
             <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
               Analyzing Phonetics
             </p>
        </div>
      ) : response ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Accuracy Score Card */}
          <div className="p-6 glass-card border-l-4 border-primary shadow-xl">
             <div className="flex items-end justify-between mb-4">
               <div>
                 <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1">Authenticity Score</p>
                 <h2 className="text-6xl font-black gradient-text">
                   {response.accuracyScore || 0}%
                 </h2>
               </div>
               <div className="pb-2">
                  <div className={`px-2 py-1 rounded text-[8px] font-bold tracking-tighter uppercase ${
                    (response.accuracyScore || 0) > 80 ? 'bg-green-500/20 text-green-400' : 
                    (response.accuracyScore || 0) > 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {(response.accuracyScore || 0) > 80 ? 'Master' : (response.accuracyScore || 0) > 60 ? 'Developing' : 'Novice'}
                  </div>
               </div>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div
                 className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-1000"
                 style={{ width: `${response.accuracyScore || 0}%` }}
               />
             </div>
          </div>

          {/* Transcript Section */}
          {response.transcript && (
            <div className="px-2">
              <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-3">Live Transcript</p>
              <p className="text-lg font-light text-white/90 leading-relaxed italic border-l-2 border-white/10 pl-4">
                "{response.transcript}"
              </p>
            </div>
          )}

          {/* Coaching Insights */}
          {(response.feedback || response.type === 'coach_transcript') && (
            <div className="px-2">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_var(--secondary-glow)]" />
                 <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Lumina Intelligence</p>
              </div>
              <p className="text-sm font-medium text-white/70 leading-loose">
                {response.feedback || response.text}
              </p>
            </div>
          )}

          {/* Precision Corrections */}
          {response.corrections && response.corrections.length > 0 && (
            <div className="p-4 glass-card bg-red-500/5 border-red-500/10">
              <p className="text-[10px] font-bold text-red-400 tracking-widest uppercase mb-4">Precision Corrections</p>
              <div className="space-y-3">
                {response.corrections.map((correction, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="flex-none w-1 h-1 rounded-full bg-red-500" />
                    <span>{correction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Tips */}
          {response.tips && response.tips.length > 0 && (
            <div className="p-4 glass-card bg-green-500/5 border-green-500/10">
              <p className="text-[10px] font-bold text-green-400 tracking-widest uppercase mb-4">Somatic Cues</p>
              <div className="space-y-3">
                {response.tips.map((tip, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="flex-none w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center text-[8px] text-green-400">✓</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-30">
          <div className="text-6xl mb-6 grayscale saturate-50">✦</div>
          <p className="text-xs tracking-[0.3em] font-light uppercase text-center max-w-[200px] leading-relaxed">
            Neural link ready. Use gestures to activate Lumina.
          </p>
        </div>
      )}
    </div>
  );
}
