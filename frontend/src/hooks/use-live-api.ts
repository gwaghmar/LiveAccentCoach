/**
 * use-live-api.ts
 * Manages Gemini Live WebSocket connection with auto-reconnect (exponential backoff).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GenAILiveClient } from "../lib/genai-live-client";
import { LiveClientOptions } from "../lib/genai-types";
import { AudioStreamer } from "../lib/audio-streamer";
import { audioContext } from "../lib/genai-utils";
import VolMeterWorket from "../lib/worklets/vol-meter";
import { LiveConnectConfig } from "@google/genai";

export type UseLiveAPIResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;
  model: string;
  setModel: (model: string) => void;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
};

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;

export function useLiveAPI(options: LiveClientOptions): UseLiveAPIResults {
  const client = useMemo(() => new GenAILiveClient(options), [options]);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [model, setModel] = useState<string>("gemini-2.5-flash-native-audio-preview-12-2025");
  const [config, setConfig] = useState<LiveConnectConfig>({});
  const [connected, setConnected] = useState(false);
  const [volume, setVolume] = useState(0);

  // Track intentional disconnect so auto-reconnect doesn't fire after user clicks Stop
  const intentionalRef = useRef(false);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modelRef = useRef(model);
  const configRef = useRef(config);
  useEffect(() => { modelRef.current = model; }, [model]);
  useEffect(() => { configRef.current = config; }, [config]);

  // Register audio pipeline
  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: "audio-out" }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current.addWorklet<any>("vumeter-out", VolMeterWorket, (ev: any) => {
          setVolume(ev.data.volume);
        });
      });
    }
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setConnected(true);
      retryCountRef.current = 0;
    };

    const onClose = () => {
      setConnected(false);
      // Auto-reconnect only if this was not intentional
      if (!intentionalRef.current && retryCountRef.current < MAX_RETRIES) {
        const delay = RETRY_BASE_MS * Math.pow(2, retryCountRef.current);
        retryCountRef.current += 1;
        console.log(`Connection dropped. Retrying in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
        retryTimerRef.current = setTimeout(() => {
          client.connect(modelRef.current, configRef.current).catch(console.error);
        }, delay);
      }
    };

    const onError = (error: ErrorEvent) => {
      console.error("Gemini Live error:", error);
    };

    const stopAudioStreamer = () => audioStreamerRef.current?.stop();
    const onAudio = (data: ArrayBuffer) => audioStreamerRef.current?.addPCM16(new Uint8Array(data));

    client
      .on("error", onError)
      .on("open", onOpen)
      .on("close", onClose)
      .on("interrupted", stopAudioStreamer)
      .on("audio", onAudio);

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      client
        .off("error", onError)
        .off("open", onOpen)
        .off("close", onClose)
        .off("interrupted", stopAudioStreamer)
        .off("audio", onAudio)
        .disconnect();
    };
  }, [client]);

  const connect = useCallback(async () => {
    if (!config) throw new Error("config has not been set");
    intentionalRef.current = false;
    retryCountRef.current = 0;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    client.disconnect();
    await client.connect(model, config);
  }, [client, config, model]);

  const disconnect = useCallback(async () => {
    intentionalRef.current = true;
    retryCountRef.current = MAX_RETRIES; // prevent any pending retry
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    client.disconnect();
    setConnected(false);
  }, [client]);

  return { client, config, setConfig, model, setModel, connected, connect, disconnect, volume };
}
