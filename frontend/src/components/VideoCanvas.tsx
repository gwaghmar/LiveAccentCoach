/**
 * VideoCanvas component
 * Renders camera feed with MediaPipe overlays (hand skeleton, mouth landmarks)
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { FaceLandmarks, HandLandmarks } from '../types';

interface VideoCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  faceLandmarks: FaceLandmarks | null;
  handLandmarks: HandLandmarks | null;
}

export default function VideoCanvas({
  videoRef,
  faceLandmarks,
  handLandmarks,
}: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const render = () => {
      if (video.readyState === 4) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        if (faceLandmarks) {
          const landmarks = faceLandmarks.landmarks.map(l => ({
            x: l.x * canvas.width,
            y: l.y * canvas.height,
            z: l.z,
          }));

          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 2;
          for (let i = 61; i < 80; i++) {
            const curr = landmarks[i];
            const next = landmarks[i + 1] || landmarks[61];
            if (curr && next) {
              ctx.beginPath();
              ctx.moveTo(curr.x, curr.y);
              ctx.lineTo(next.x, next.y);
              ctx.stroke();
            }
          }

          ctx.fillStyle = '#00FF00';
          for (let i = 61; i <= 80; i++) {
            const pt = landmarks[i];
            if (pt) {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }

        if (handLandmarks) {
          const landmarks = handLandmarks.landmarks.map(l => ({
            x: l.x * canvas.width,
            y: l.y * canvas.height,
            z: l.z,
          }));

          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
          ];

          ctx.strokeStyle = '#FF00FF';
          ctx.lineWidth = 2;
          connections.forEach(([start, end]) => {
            const p1 = landmarks[start];
            const p2 = landmarks[end];
            if (p1 && p2) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });

          ctx.fillStyle = '#FF00FF';
          landmarks.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
            ctx.fill();
          });

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '16px Arial';
          ctx.fillText(
            `Hand: ${Math.round(handLandmarks.confidence * 100)}%`,
            10,
            30
          );
        }
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frameId);
  }, [videoRef, faceLandmarks, handLandmarks]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="absolute w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full top-0 left-0"
      />
    </div>
  );
}
