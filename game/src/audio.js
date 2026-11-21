// Tiny sounds, made with the Web Audio oscillator and nothing else: no sound files, no
// network, nothing to load. The context is created on the first user gesture (browsers
// refuse audio before one), and every call is safe when it is not there yet.

const NOTES = {
  find: [659.25, 880.0],
  wrong: [138.59],
  win: [523.25, 659.25, 783.99, 1046.5],
  click: [440.0],
  hint: [392.0, 523.25],
};

/** Milliseconds each note of a sound lasts, and the gap between notes. */
const NOTE_MS = 90;
const GAP_MS = 70;

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context !== null) return context;
    try {
      const Ctor = window.AudioContext ?? window.webkitAudioContext;
      if (Ctor === undefined) return null;
      context = new Ctor();
    } catch {
      context = null;
    }
    return context;
  }

  /** Call from a user gesture so the browser allows the context to start. */
  function unlock() {
    const ctx = ensure();
    if (ctx !== null && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }

  function play(name) {
    if (muted) return;
    const ctx = ensure();
    if (ctx === null) return;
    const notes = NOTES[name] ?? [];
    notes.forEach((frequency, index) => {
      const start = ctx.currentTime + (index * (NOTE_MS + GAP_MS)) / 1000;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = name === 'wrong' ? 'sawtooth' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(name === 'wrong' ? 0.08 : 0.16, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + NOTE_MS / 1000);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + NOTE_MS / 1000 + 0.05);
    });
  }

  return {
    unlock,
    play,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
  };
}
