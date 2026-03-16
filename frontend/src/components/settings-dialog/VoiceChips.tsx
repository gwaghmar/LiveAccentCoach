/**
 * VoiceChips — compact inline voice selector shown in the control tray.
 * Shows Aoede / Charon / Fenrir / Kore / Puck as pill buttons.
 * Disabled while connected (changes take effect on next connect).
 */
import { useCallback, useEffect, useState } from 'react';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';

const VOICES = ['Aoede', 'Charon', 'Fenrir', 'Kore', 'Puck'];

export default function VoiceChips() {
  const { config, setConfig, connected } = useLiveAPIContext();
  const [selected, setSelected] = useState('Aoede');

  useEffect(() => {
    const v = config.speechConfig?.voiceConfig?.prebuiltVoiceConfig?.voiceName;
    if (v && VOICES.includes(v)) setSelected(v);
  }, [config]);

  const pick = useCallback((voice: string) => {
    if (connected) return; // can't change mid-session
    setSelected(voice);
    setConfig({
      ...config,
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
      },
    });
  }, [config, setConfig, connected]);

  return (
    <div className="voice-chips" title={connected ? 'Disconnect to change voice' : 'Select voice'}>
      {VOICES.map((v) => (
        <button
          key={v}
          className={`voice-chip ${selected === v ? 'voice-chip--active' : ''}`}
          onClick={() => pick(v)}
          disabled={connected}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
