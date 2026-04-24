const AudioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

export function playTick() {
  if (!AudioCtx) return;
  const osc = AudioCtx.createOscillator();
  const gain = AudioCtx.createGain();
  osc.connect(gain);
  gain.connect(AudioCtx.destination);
  osc.frequency.setValueAtTime(880, AudioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, AudioCtx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.06, AudioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, AudioCtx.currentTime + 0.1);
  osc.start();
  osc.stop(AudioCtx.currentTime + 0.12);
}

export function playBell() {
  if (!AudioCtx) return;
  const osc = AudioCtx.createOscillator();
  const gain = AudioCtx.createGain();
  osc.connect(gain);
  gain.connect(AudioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, AudioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, AudioCtx.currentTime + 1);
  gain.gain.setValueAtTime(0.3, AudioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, AudioCtx.currentTime + 1.2);
  osc.start();
  osc.stop(AudioCtx.currentTime + 1.5);
}

export function playWhoosh() {
  if (!AudioCtx) return;
  const buf = AudioCtx.createBuffer(1, AudioCtx.sampleRate * 0.4, AudioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = AudioCtx.createBufferSource();
  const filter = AudioCtx.createBiquadFilter();
  const gain = AudioCtx.createGain();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  src.buffer = buf;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(AudioCtx.destination);
  gain.gain.setValueAtTime(0.15, AudioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, AudioCtx.currentTime + 0.4);
  src.start();
}
