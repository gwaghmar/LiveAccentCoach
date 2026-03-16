/**
 * WaveformVisualizer — animated bar waveform that reacts to live audio volume.
 * Replaces the basic AudioPulse with a more visually impressive display.
 */
import { useEffect, useRef } from 'react';

const BAR_COUNT = 20;
const BAR_GAP = 2;
const BAR_WIDTH = 3;
const CANVAS_HEIGHT = 32;
const CANVAS_WIDTH = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP;

type Props = {
  volume: number;   // 0–1 from audio streamer
  active: boolean;  // true when connected & audio flowing
};

export default function WaveformVisualizer({ volume, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const barsRef = useRef<number[]>(Array(BAR_COUNT).fill(0));
  const volRef = useRef(volume);

  // Keep volRef in sync without restarting animation loop
  useEffect(() => { volRef.current = volume; }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      const v = active ? volRef.current : 0;

      // Shift bars left and push new value at the right end
      barsRef.current.shift();
      // Add some natural randomness around the volume level
      const noise = active ? (Math.random() - 0.5) * 0.15 : 0;
      barsRef.current.push(Math.max(0, Math.min(1, v * 3.5 + noise)));

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      barsRef.current.forEach((h, i) => {
        const barH = Math.max(2, h * CANVAS_HEIGHT);
        const x = i * (BAR_WIDTH + BAR_GAP);
        const y = (CANVAS_HEIGHT - barH) / 2;

        // Gradient: blue when active, gray when idle
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        if (active) {
          grad.addColorStop(0, 'rgba(128, 193, 255, 0.9)');
          grad.addColorStop(1, 'rgba(31, 148, 255, 0.6)');
        } else {
          grad.addColorStop(0, 'rgba(112, 117, 119, 0.5)');
          grad.addColorStop(1, 'rgba(64, 69, 71, 0.3)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, BAR_WIDTH, barH, 1.5);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ display: 'block' }}
    />
  );
}
