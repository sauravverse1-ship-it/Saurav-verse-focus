
import { AmbientTrack } from '../types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
const activeNodes: Record<string, { stop: () => void, setVolume?: (vol: number) => void }> = {};

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        masterGain.gain.value = 0.6;
    }
}

export const setMasterVolume = (volume: number) => {
    if (masterGain) {
       masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), audioCtx!.currentTime, 0.1);
    }
}

// Procedural brown noise for Rain / Waterfall
function createBrownNoise() {
    initAudio();
    const bufferSize = 2 * audioCtx!.sampleRate;
    const noiseBuffer = audioCtx!.createBuffer(1, bufferSize, audioCtx!.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate for gain loss
    }
    const noiseSource = audioCtx!.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    // Add LPF to make it sound like rain
    const filter = audioCtx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    noiseSource.connect(filter);
    
    const gain = audioCtx!.createGain();
    gain.gain.value = 0.5;
    filter.connect(gain);
    gain.connect(masterGain!);
    
    noiseSource.start();
    
    return {
        stop: () => {
            noiseSource.stop();
            noiseSource.disconnect();
        }
    }
}

// Procedural Binaural Beat for Deep Focus
function createBinauralBeats() {
    initAudio();
    const oscL = audioCtx!.createOscillator();
    const oscR = audioCtx!.createOscillator();
    const merger = audioCtx!.createChannelMerger(2);
    
    oscL.frequency.value = 200; // Base freq
    oscR.frequency.value = 204; // 4Hz Theta wave beat
    
    const gainSource = audioCtx!.createGain();
    gainSource.gain.value = 0.15;
    
    oscL.connect(merger, 0, 0); // Left
    oscR.connect(merger, 0, 1); // Right
    
    merger.connect(gainSource);
    gainSource.connect(masterGain!);
    
    oscL.start();
    oscR.start();
    
    return {
        stop: () => {
            oscL.stop();
            oscR.stop();
            oscL.disconnect();
            oscR.disconnect();
        }
    }
}

// Lofi Beats (Kick, snare, hh loop with sine chords)
function createLofiBeats() {
    initAudio();
    let playing = true;
    
    const playKick = (time: number) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.connect(gain);
        gain.connect(masterGain!);
        
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        
        osc.start(time);
        osc.stop(time + 0.5);
    };

    const playSnare = (time: number) => {
        const bufferSize = audioCtx!.sampleRate * 0.2;
        const noiseBuffer = audioCtx!.createBuffer(1, bufferSize, audioCtx!.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noiseSource = audioCtx!.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        const filter = audioCtx!.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        const gain = audioCtx!.createGain();
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain!);
        
        noiseSource.start(time);
    };

    const playHihat = (time: number) => {
        const bufferSize = audioCtx!.sampleRate * 0.1;
        const noiseBuffer = audioCtx!.createBuffer(1, bufferSize, audioCtx!.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noiseSource = audioCtx!.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        const filter = audioCtx!.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;
        
        const gain = audioCtx!.createGain();
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain!);
        
        noiseSource.start(time);
    };

    const playChord = (time: number) => {
        const freqs = [261.63, 329.63, 392.00, 493.88]; // Cmaj7
        const gain = audioCtx!.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.1, time + 0.1);
        gain.gain.linearRampToValueAtTime(0, time + 1);
        gain.connect(masterGain!);
        
        freqs.forEach(f => {
            const osc = audioCtx!.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = f;
            osc.connect(gain);
            osc.start(time);
            osc.stop(time + 1);
        });
    }
    
    let nextNoteTime = audioCtx!.currentTime + 0.1;
    let step = 0;
    const tempo = 80;
    const secondsPerBeat = 60.0 / tempo;
    const secondsPer16th = secondsPerBeat / 4;
    
    let timerID: number;
    
    function scheduler() {
        while (nextNoteTime < audioCtx!.currentTime + 0.1) {
            if (playing) {
                if (step % 8 === 0) playKick(nextNoteTime);
                if (step % 8 === 4) playSnare(nextNoteTime);
                if (step % 2 === 0) playHihat(nextNoteTime);
                else if (step % 4 === 3) playHihat(nextNoteTime + secondsPer16th * 0.2); 
                
                if (step % 16 === 0 || step % 16 === 10) playChord(nextNoteTime);
            }
            
            nextNoteTime += secondsPer16th;
            step++;
            if (step >= 16) step = 0;
        }
        timerID = window.setTimeout(scheduler, 25.0);
    }
    
    scheduler();
    
    return {
        stop: () => {
            playing = false;
            window.clearTimeout(timerID);
        }
    }
}

export const playAmbientSound = (url: string | undefined, trackId: string) => {
  if (activeNodes[trackId]) return;
  initAudio();
  audioCtx!.resume();
  
  if (trackId === 'deep-focus' || trackId === 'white-noise') {
      activeNodes[trackId] = createBinauralBeats();
  } else if (trackId === 'lofi') {
      activeNodes[trackId] = createLofiBeats();
  } else {
      activeNodes[trackId] = createBrownNoise();
  }
};

export const stopAmbientSound = (trackId: string) => {
  if (activeNodes[trackId]) {
      activeNodes[trackId].stop();
      delete activeNodes[trackId];
  }
};
