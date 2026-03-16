/**
 * StatusBar.tsx
 * Top bar showing: connection status, model name, session timer, turn counter, backend health.
 * Theme and console toggles are inline here (no floating overlay).
 */
import { useEffect, useState, useRef } from "react";
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";
import cn from "classnames";

const MODEL_DISPLAY = "gemini-2.5-flash";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const HEALTH_POLL_MS = 30_000;

type HealthStatus = 'ok' | 'warn' | 'err' | 'unknown';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type Props = {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  showConsole: boolean;
  onToggleConsole: () => void;
};

export default function StatusBar({ theme, onToggleTheme, showConsole, onToggleConsole }: Props) {
  const { connected, client } = useLiveAPIContext();
  const [elapsed, setElapsed] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [health, setHealth] = useState<HealthStatus>('unknown');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  // Session timer
  useEffect(() => {
    if (connected) {
      startRef.current = Date.now();
      setElapsed(0);
      setTurnCount(0);
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [connected]);

  // Count turns
  useEffect(() => {
    const onContent = () => setTurnCount((c) => c + 1);
    client.on("content", onContent);
    return () => { client.off("content", onContent); };
  }, [client]);

  // Backend health polling
  useEffect(() => {
    const checkHealth = () => {
      fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) })
        .then((r) => setHealth(r.ok ? 'ok' : 'warn'))
        .catch(() => setHealth('err'));
    };
    checkHealth();
    const id = setInterval(checkHealth, HEALTH_POLL_MS);
    return () => clearInterval(id);
  }, []);

  const healthLabel: Record<HealthStatus, string> = {
    ok: 'Backend OK',
    warn: 'Backend degraded',
    err: 'Backend offline',
    unknown: 'Checking backend…',
  };

  return (
    <div className="status-bar">
      <div className="status-bar__left">
        <span className={`status-dot ${connected ? "status-dot--online" : "status-dot--offline"}`} />
        <span className="status-bar__label">{connected ? "Online" : "Offline"}</span>
      </div>

      <div className="status-bar__center">
        <span className="status-bar__model">
          <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>psychology</span>
          {MODEL_DISPLAY}
        </span>
      </div>

      <div className="status-bar__right">
        {connected && (
          <>
            <span className="status-bar__stat">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>forum</span>
              {turnCount} turns
            </span>
            <span className="status-bar__divider">|</span>
            <span className="status-bar__stat">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>timer</span>
              {formatDuration(elapsed)}
            </span>
            <span className="status-bar__divider">|</span>
          </>
        )}
        <span className="status-bar__stat" title={healthLabel[health]}>
          <span className={`health-dot health-dot--${health === 'unknown' ? 'warn' : health}`} />
          {health === 'ok' ? 'API' : health === 'err' ? 'down' : '…'}
        </span>
        <span className="status-bar__divider">|</span>
        <button
          className="status-bar__icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button
          className={cn("status-bar__icon-btn", { "status-bar__icon-btn--active": showConsole })}
          onClick={onToggleConsole}
          title="Toggle Console"
        >
          <span className="material-symbols-outlined">terminal</span>
        </button>
        <span className="status-bar__app-name">Northstack</span>
      </div>
    </div>
  );
}
