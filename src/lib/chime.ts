// A short, synthesized "unlock" chime — no external audio asset, so
// there's nothing that can fail to load. Safe to call from any browser
// context; silently does nothing where Web Audio is unavailable.
//
// An ascending arpeggio (rather than a static chord) reads as a reward
// "ding" the way game/app achievement sounds do, at a quiet peak volume so
// it stays a subtle accent rather than an intrusive blast.
export function playAchievementChime(): void {
  if (typeof window === "undefined") return;
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;

  const ctx = new AudioCtor();
  const now = ctx.currentTime;
  const arpeggioHz = [523.25, 659.25, 783.99, 1046.5]; // C5-E5-G5-C6, ascending

  arpeggioHz.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.085;
    const isFinalShimmer = i === arpeggioHz.length - 1;
    const peak = isFinalShimmer ? 0.09 : 0.055;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + (isFinalShimmer ? 1.0 : 0.7));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 1.1);
  });

  setTimeout(() => ctx.close(), 1400);
}
