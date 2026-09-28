"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function WelcomeVideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [closing, setClosing] = useState(false);

  if (!open) return null;

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 300);
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-black/85 p-4 backdrop-blur-md transition-opacity duration-300 ease-out ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      <button
        onClick={handleClose}
        className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md transition-colors duration-150 hover:bg-white/20"
      >
        Skip Tour <X className="h-3.5 w-3.5" />
      </button>

      <h1 className="font-sans text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        Welcome to taskFolio<span className="text-[#8B7EC8]">.</span>
      </h1>

      <div
        className={`w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out ${
          closing ? "scale-[0.98]" : "scale-100"
        }`}
      >
        <video
          className="w-full"
          src="/media/brag.mp4"
          poster="/media/brag.jpg"
          autoPlay
          muted
          controls
          playsInline
          onEnded={handleClose}
        />
      </div>
    </div>
  );
}
