/**
 * useGeminiAudioPlayback
 * Plays raw 16-bit PCM 24 kHz audio from Gemini Live using an
 * AudioWorklet ring-buffer processor for gap-free, zero-glitch playback.
 *
 * Usage:
 *   const { playPcmChunk, stopPlayback } = useGeminiAudioPlayback();
 *   playPcmChunk(arrayBuffer);   // call with raw Int16 PCM bytes
 */

import { useCallback, useRef } from 'react';

const GEMINI_SAMPLE_RATE = 24000;

export function useGeminiAudioPlayback() {
  const ctxRef    = useRef<AudioContext | null>(null);
  const nodeRef   = useRef<AudioWorkletNode | null>(null);
  const readyRef  = useRef<Promise<void> | null>(null);

  /** Lazily initialise the AudioContext and worklet node */
  const ensureReady = useCallback(async () => {
    if (readyRef.current) return readyRef.current;

    readyRef.current = (async () => {
      const ctx = new AudioContext({ sampleRate: GEMINI_SAMPLE_RATE });
      ctxRef.current = ctx;

      await ctx.audioWorklet.addModule('/pcm-player-processor.js');

      const node = new AudioWorkletNode(ctx, 'pcm-player-processor');
      node.connect(ctx.destination);
      nodeRef.current = node;
    })();

    return readyRef.current;
  }, []);

  /**
   * Feed a chunk of Gemini audio to the ring-buffer player.
   * @param data  ArrayBuffer containing Int16 little-endian PCM @ 24 kHz
   */
  const playPcmChunk = useCallback(async (data: ArrayBuffer) => {
    await ensureReady();

    const ctx = ctxRef.current;
    const node = nodeRef.current;
    if (!ctx || !node) return;

    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') await ctx.resume();

    // Forward the Int16 buffer directly to the worklet (zero-copy transfer)
    // We must clone because transferring makes the original unusable
    const copy = data.slice(0);
    node.port.postMessage(copy, [copy]);
  }, [ensureReady]);

  const stopPlayback = useCallback(() => {
    if (nodeRef.current) {
      nodeRef.current.port.postMessage({ command: 'endOfAudio' });
      nodeRef.current.disconnect();
      nodeRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    readyRef.current = null;
  }, []);

  return { playPcmChunk, stopPlayback };
}
