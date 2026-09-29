// Synthesized sounds — no external audio asset, so there's nothing that can
// fail to load. Safe to call from any browser context; silently does
// nothing where Web Audio is unavailable.

function getAudioCtor(): typeof AudioContext | undefined {
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

// One bowed, cello-like note: a sawtooth (richer harmonics than a sine)
// softened through a lowpass filter for warmth, a slow attack instead of a
// pluck, and a light vibrato — the wobble that actually reads as "a string
// being played" rather than a synth pad.
function playCelloNote(ctx: AudioContext, freq: number, start: number, duration: number, peak: number) {
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = freq * 4.5;
  filter.Q.value = 0.7;

  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 5.4;
  const vibratoGain = ctx.createGain();
  vibratoGain.gain.value = freq * 0.006; // a few cents of depth — subtle, not warbly
  vibrato.connect(vibratoGain);
  vibratoGain.connect(osc.frequency);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.09);
  gain.gain.linearRampToValueAtTime(peak * 0.85, start + duration * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  vibrato.start(start);
  osc.stop(start + duration + 0.05);
  vibrato.stop(start + duration + 0.05);
}

// A short, warm cello phrase for the rare "everything's cleared" milestone
// moment — three overlapping (legato, not hard-cut) bowed notes rising to a
// held final note, reading as one small musical gesture rather than a
// game-y arpeggio. Fittingly understated for a museum/art-themed unlock.
export function playAchievementChime(): void {
  if (typeof window === "undefined") return;
  const AudioCtor = getAudioCtor();
  if (!AudioCtor) return;

  const ctx = new AudioCtor();
  const now = ctx.currentTime;
  const phrase = [
    { freq: 164.81, start: 0, duration: 0.55, peak: 0.05 }, // E3
    { freq: 196.0, start: 0.4, duration: 0.55, peak: 0.06 }, // G3
    { freq: 261.63, start: 0.8, duration: 1.1, peak: 0.075 }, // C4 — held to land the phrase
  ];
  phrase.forEach((n) => playCelloNote(ctx, n.freq, now + n.start, n.duration, n.peak));

  setTimeout(() => ctx.close(), 2400);
}

// A bright, cheerful two-note "ding" for checking off a single to-do —
// Duolingo/Apple-style positive feedback (quick attack, short decay, a
// rounder triangle wave rather than a plain sine). Fires far more often
// than the milestone chime above, so it stays snappy rather than musical.
export function playGlassChime(): void {
  if (typeof window === "undefined") return;
  const AudioCtor = getAudioCtor();
  if (!AudioCtor) return;

  const ctx = new AudioCtor();
  const now = ctx.currentTime;
  const tonesHz = [1046.5, 1318.51]; // C6, E6 — a bright ascending major third

  tonesHz.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const start = now + i * 0.07;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.05, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.32);
  });

  setTimeout(() => ctx.close(), 500);
}
