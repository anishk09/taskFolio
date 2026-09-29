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

// One bass-forward layered tone: a low sub layer for weight, a root an
// octave up for body, and a soft filtered overtone on top — the Bose-style
// warmth. Shared by the two-step rise below.
function playBassTone(ctx: AudioContext, root: number, start: number, peakScale: number) {
  const layers: { freq: number; type: OscillatorType; peak: number }[] = [
    { freq: root / 2, type: "sine", peak: 0.09 * peakScale }, // sub — the bass weight
    { freq: root, type: "sine", peak: 0.07 * peakScale }, // body
    { freq: root * 1.5, type: "triangle", peak: 0.02 * peakScale }, // soft overtone on top
  ];

  layers.forEach(({ freq, type, peak }) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.45);
  });
}

// A bass-forward, Bose-startup-style tone for checking off a single to-do —
// but rising low-to-high across two quick steps rather than a single static
// chord, for a small dopamine "lift" (the way a reward ding climbs in
// pitch) instead of just a warm thud. Fires often, so it stays short.
export function playGlassChime(): void {
  if (typeof window === "undefined") return;
  const AudioCtor = getAudioCtor();
  if (!AudioCtor) return;

  const ctx = new AudioCtor();
  const now = ctx.currentTime;
  playBassTone(ctx, 130.81, now, 1); // C3
  playBassTone(ctx, 164.81, now + 0.11, 0.9); // E3 — quick rise up a major third

  setTimeout(() => ctx.close(), 700);
}
