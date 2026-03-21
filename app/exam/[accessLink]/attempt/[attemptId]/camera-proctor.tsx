"use client";

import { useEffect, useRef, useState } from "react";

export function CameraProctor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [videoActive, setVideoActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } },
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        setVideoActive(true);
      } catch {
        // Permission was already granted at the gate — silently ignore
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40 overflow-hidden rounded-xl border border-border shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 bg-black/90 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Live</span>
        </div>
        <span className="text-[10px] text-zinc-400">Proctored</span>
      </div>

      {/* Video feed */}
      <div className="relative bg-black">
        {!videoActive && (
          <div className="h-28 w-40 flex items-center justify-center bg-zinc-900">
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className={`h-28 w-40 object-cover [transform:scaleX(-1)] ${!videoActive ? "hidden" : ""}`}
          aria-label="Camera proctoring feed"
        />
      </div>
    </div>
  );
}
