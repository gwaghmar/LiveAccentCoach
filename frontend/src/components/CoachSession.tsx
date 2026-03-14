/**
 * CoachSession component
 * Main orchestrator for coaching session
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import VideoCanvas from './VideoCanvas';
import AvatarDisplay from './AvatarDisplay';
import HandGestureOverlay from './HandGestureOverlay';
import FeedbackPanel from './FeedbackPanel';
import ControlButtons from './ControlButtons';
import GestureHint from './GestureHint';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioStream } from '../hooks/useAudioStream';
import { useHandGesture } from '../hooks/useHandGesture';
import { CoachingResponse } from '../types';

export default function CoachSession() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioChunksRef = useRef<Uint8Array[]>([]);
  const audioBytesTotalRef = useRef(0);

  const [isCoachingActive, setIsCoachingActive] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<CoachingResponse | null>(null);
  const [visualAid, setVisualAid] = useState<{url: string, prompt: string, type: string} | null>(null);
  const [isStoryMode, setIsStoryMode] = useState(false);

  // Hooks
  const { faceLandmarks, handLandmarks, isReady: isMediaPipeReady, error: mediaPipeError } = useMediaPipe(videoRef);
  const { gesture, isThumbsUp, isThumbsDown } = useHandGesture(handLandmarks);
  const { isConnected: wsConnected, lastResponse, sendAudioChunk, sendImageFrame, endSession } = useWebSocket();
  const { isStreaming: isAudioStreaming, startStream, stopStream, volume } = useAudioStream(
    (chunk) => {
      if (isCoachingActive) {
        audioChunksRef.current.push(chunk);
        audioBytesTotalRef.current += chunk.length;
        sendAudioChunk(chunk);
      }
    }
  );
  // Handle coaching activation via thumbs gestures
  useEffect(() => {
    if (isThumbsUp && gesture.holdDuration >= 500 && !isCoachingActive) {
      handleStartCoaching();
    } else if (isThumbsDown && gesture.holdDuration >= 500 && isCoachingActive) {
      handleStopCoaching();
    }
  }, [isThumbsUp, isThumbsDown, gesture.holdDuration, isCoachingActive]);

  // Handle feedback updates from WebSocket
  useEffect(() => {
    if (lastResponse) {
      if (lastResponse.type === 'visual_aid' && lastResponse.visual) {
        setVisualAid(lastResponse.visual);
      } else {
        setFeedback(lastResponse);
        setIsLoading(false);
      }
    }
  }, [lastResponse]);

  // Handle Video Frame Capture (1 FPS) for Multimodal Coaching
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isCoachingActive && wsConnected) {
      const captureFrame = () => {
        if (!videoRef.current) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const base64Image = canvas.toDataURL('image/jpeg', 0.6); // Reduced quality for bandwidth
          sendImageFrame(base64Image);
        }
      };

      // Initial capture
      captureFrame();
      
      // Setup interval (1 FPS)
      interval = setInterval(captureFrame, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCoachingActive, wsConnected, sendImageFrame]);

  const handleStartCoaching = async () => {
    setIsCoachingActive(true);
    setIsLoading(true);
    setIsMicEnabled(true);
    setFeedback(null);
    audioChunksRef.current = [];
    audioBytesTotalRef.current = 0;
    
    if (!isAudioStreaming) {
      await startStream();
    }
  };

  const handleStopCoaching = () => {
    setIsCoachingActive(false);
    setIsMicEnabled(false);
    stopStream();

    // Build a final contiguous payload to persist session recording.
    const totalLength = audioBytesTotalRef.current;
    let finalAudio: Uint8Array | undefined;

    if (totalLength > 0) {
      finalAudio = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of audioChunksRef.current) {
        finalAudio.set(chunk, offset);
        offset += chunk.length;
      }
    }

    endSession(finalAudio);

    // Reset buffers for next run.
    audioChunksRef.current = [];
    audioBytesTotalRef.current = 0;
  };

  const handleMicToggle = () => {
    if (isMicEnabled) {
      stopStream();
      setIsMicEnabled(false);
    } else {
      startStream();
      setIsMicEnabled(true);
    }
  };

  return (
    <div className="w-full h-screen relative flex flex-col overflow-hidden bg-[#0f172a] text-white">
      {/* Dynamic Background Blobs */}
      <div className="bg-blob blob-1 animate-pulse-glow" />
      <div className="bg-blob blob-2" style={{ animationDelay: '-2s' }} />
      <div className="bg-blob blob-3 animate-float" />

      {/* Header */}
      <header className="z-10 px-8 py-6 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter gradient-text uppercase">
            Lumina <span className="text-white/50 text-xl font-light">AI Coach</span>
          </h1>
          <p className="text-blue-200/60 text-sm font-medium tracking-wide mt-1">
            {isStoryMode ? '✦ NARRATIVE IMMERSION ACTIVE' : '✦ PRECISION MULTIMODAL COACHING'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsStoryMode(!isStoryMode)}
            className={`btn-premium-outline !py-2 !px-4 text-xs ${isStoryMode ? 'bg-primary/20 border-primary' : 'border-white/20 text-white/60'}`}
          >
            {isStoryMode ? 'EXIT STORY MODE' : 'ENTER STORY MODE'}
          </button>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${wsConnected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {wsConnected ? 'System Online' : 'System Offline'}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden z-10">
        
        {/* Left Column: Vision & Performance */}
        <div className="col-span-3 flex flex-col gap-6 h-full">
          <div className="flex-1 glass-panel p-4 flex flex-col">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Neural Vision Input</h3>
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/5 bg-black/40">
              {mediaPipeError && (
                <div className="absolute inset-0 flex items-center justify-center text-red-400 p-4 text-center text-sm">
                  Neural Sync Error: {mediaPipeError}
                </div>
              )}
              {isMediaPipeReady && videoRef.current ? (
                <VideoCanvas
                  videoRef={videoRef}
                  faceLandmarks={faceLandmarks}
                  handLandmarks={handLandmarks}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-white/30 text-xs tracking-widest animate-pulse">Initializing MediaPipe...</p>
                </div>
              )}
              
              {/* Internal Overlay for Gestures */}
              {handLandmarks && (
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <HandGestureOverlay
                    gesture={gesture}
                    isThumbsUp={isThumbsUp}
                    isThumbsDown={isThumbsDown}
                  />
                </div>
              )}
            </div>
            
            {!isCoachingActive && (
              <div className="mt-4">
                <GestureHint />
              </div>
            )}
            
            {isMicEnabled && (
              <div className="mt-6 p-4 glass-card">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Sonic Amplitude</p>
                  <span className="text-[10px] text-green-400 font-mono">{Math.round(volume)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150"
                    style={{ width: `${Math.min(100, volume)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Interactive Visuals & Avatar */}
        <div className="col-span-5 flex flex-col gap-6">
          <div className="flex-1 glass-panel relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            {/* Visual Aid / Background Layer */}
            {visualAid && (
              <div className="absolute inset-0 z-0 transition-opacity duration-1000">
                <img 
                  src={visualAid.url} 
                  alt={visualAid.prompt} 
                  className="w-full h-full object-cover opacity-30 grayscale mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-transparent to-bg-dark/80" />
              </div>
            )}

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
              {visualAid && isStoryMode && (
                <div className="absolute top-8 left-8 right-8 animate-float">
                  <div className="glass-card p-4 border border-primary/20">
                    <img src={visualAid.url} className="w-full aspect-video object-cover rounded-lg shadow-2xl" />
                    <p className="text-[10px] text-white/40 mt-3 italic">Generated Scene: {visualAid.prompt}</p>
                  </div>
                </div>
              )}
              
              <div className={`transition-all duration-700 ${isStoryMode && visualAid ? 'mt-24' : ''}`}>
                <AvatarDisplay blendShapes={faceLandmarks?.blendShapes || null} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Intelligence & Insights */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="flex-1 glass-panel p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Real-time Intelligence</h3>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                <div className="w-1 h-1 rounded-full bg-accent animate-ping" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <FeedbackPanel response={feedback} isLoading={isLoading} />
              
              {visualAid && !isStoryMode && (
                <div className="mt-6 glass-card p-4 border border-accent/20 animate-float">
                  <p className="text-[10px] font-bold text-accent tracking-widest uppercase mb-3">Visual Guide Generated</p>
                  <img src={visualAid.url} alt="Visual Aid" className="w-full rounded-lg shadow-xl" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="z-20 p-8 flex justify-center items-center backdrop-blur-xl bg-black/40 border-t border-white/5">
        <ControlButtons
          isCoachingActive={isCoachingActive}
          onStart={handleStartCoaching}
          onStop={handleStopCoaching}
          isMicEnabled={isMicEnabled}
          onMicToggle={handleMicToggle}
          isLoading={isLoading}
        />
        
        {isCoachingActive && (
          <div className="absolute right-12 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
             <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Live Loop Active</span>
          </div>
        )}
      </footer>
    </div>
  );
}
