"use client";

import { useState } from "react";
import { MessageCircleWarning, X } from "lucide-react";

type SendState = "idle" | "sending" | "sent" | "error";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SendState>("idle");

  async function send() {
    if (!message.trim() || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error();
      setState("sent");
      setMessage("");
      setTimeout(() => {
        setOpen(false);
        setState("idle");
      }, 1500);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-64 rounded-2xl border border-black/10 bg-white/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700">Feedback or issue?</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close feedback"
              className="text-zinc-400 transition-colors hover:text-zinc-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {state === "sent" ? (
            <p className="py-2 text-center text-xs font-medium text-emerald-600">Sent — thank you!</p>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's wrong, or what should we build?"
                rows={3}
                className="w-full resize-none rounded-lg border border-black/10 bg-white px-2.5 py-2 text-xs text-zinc-900 outline-none focus:border-[#8B7EC8]"
              />
              {state === "error" && (
                <p className="mt-1 text-[11px] font-medium text-rose-600">Couldn&apos;t send — try again.</p>
              )}
              <button
                onClick={send}
                disabled={!message.trim() || state === "sending"}
                className="mt-2 w-full rounded-lg bg-[#5D4E9E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#4a3f80] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {state === "sending" ? "Sending…" : "Send"}
              </button>
            </>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Send feedback"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/60 text-zinc-500 opacity-60 shadow-sm backdrop-blur-md transition-all hover:opacity-100 hover:text-[#5D4E9E]"
      >
        <MessageCircleWarning className="h-4 w-4" />
      </button>
    </div>
  );
}
