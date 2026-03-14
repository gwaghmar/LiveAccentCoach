/**
 * useAudioStream hook
 * Captures microphone audio and encodes it for transmission
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { AudioProcessor, AudioWorkletProcessor } from '../utils/audioProcessor';
import { AUDIO_CONFIG } from '../utils/constants';

export function useAudioStream(onAudioChunk: (data: Uint8Array) => void) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const audioProcessorRef = useRef<AudioWorkletProcessor | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startStream = useCallback(async () => {
    try {
      // Ensure any existing stream is cleaned before starting a new one.
      if (audioContextRef.current || mediaStreamRef.current) {
        if (scriptProcessorRef.current) {
          scriptProcessorRef.current.onaudioprocess = null;
          scriptProcessorRef.current.disconnect();
        }
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
        if (audioContextRef.current) {
          await audioContextRef.current.close();
        }
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
      });
      audioContextRef.current = audioContext;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
        },
      });
      mediaStreamRef.current = stream;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      const scriptProcessor = audioContext.createScriptProcessor(AUDIO_CONFIG.CHUNK_SIZE, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      // Create analyzer for volume visualization
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;
      source.connect(analyzer);
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      scriptProcessor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Calculate volume
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setVolume(Math.min(100, rms * 500));

        // Convert to PCM
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        const bytes = new Uint8Array(int16Data.buffer);
        onAudioChunk(bytes);
      };

      setIsStreaming(true);
      setError(null);
    } catch (err) {
      setError(`Failed to start audio stream: ${err}`);
      console.error('Audio stream error:', err);
    }
  }, [onAudioChunk]);

  const stopStream = useCallback(() => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsStreaming(false);
    setVolume(0);
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    isStreaming,
    error,
    volume,
    startStream,
    stopStream,
  };
}
