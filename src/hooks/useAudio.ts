import { useCallback, useRef } from 'react';

// Interface for cross-browser AudioContext support
interface WindowWithWebkitAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const GAIN_EPSILON = 0.001;
const AGITATION_START_DELAY = 0.1; // Convert to seconds
const COMPLETION_SECOND_DELAY = 0.2; // Convert to seconds
const COMPLETION_THIRD_DELAY = 0.4; // Convert to seconds
const REPEAT_DELAY = 0.3; // Convert to seconds

// Validate GAIN_EPSILON to ensure it's never zero (required for exponentialRampToValueAtTime)
if (GAIN_EPSILON <= 0) {
  throw new Error('GAIN_EPSILON must be greater than 0 for exponentialRampToValueAtTime to work properly');
}

export interface AudioHook {
  playAgitationStart: () => void;
  playAgitationEnd: () => void;
  playCompletion: () => void;
  initializeAudio: () => void;
}

export const useAudio = (): AudioHook => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isInitializedRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      } else {
        throw new Error('AudioContext not supported');
      }
    }
    return audioContextRef.current;
  }, []);

  const initializeAudio = useCallback(() => {
    const audioContext = getAudioContext();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    isInitializedRef.current = true;
  }, [getAudioContext]);

  const createEnhancedSound = useCallback((
    frequency: number,
    duration: number,
    volume: number,
    startTime: number,
    waveform: OscillatorType = 'sine',
    envelope?: { attack: number; decay: number; sustain: number; release: number }
  ) => {
    const audioContext = getAudioContext();
    
    if (!isInitializedRef.current) {
      initializeAudio();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 2, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = startTime;
    
    if (envelope) {
      const { attack, decay, sustain, release } = envelope;
      const attackEnd = now + attack;
      const decayEnd = attackEnd + decay;
      const sustainEnd = now + duration - release;
      const releaseEnd = now + duration;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, attackEnd);
      gainNode.gain.exponentialRampToValueAtTime(volume * sustain, decayEnd);
      gainNode.gain.setValueAtTime(volume * sustain, sustainEnd);
      gainNode.gain.exponentialRampToValueAtTime(GAIN_EPSILON, releaseEnd);
    } else {
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(GAIN_EPSILON, now + duration);
    }

    oscillator.start(now);
    oscillator.stop(now + duration);
  }, [getAudioContext, initializeAudio]);

  const createChordSound = useCallback((
    frequencies: number[],
    duration: number,
    volume: number,
    startTime: number,
    waveform: OscillatorType = 'sine'
  ) => {
    frequencies.forEach(freq => {
      createEnhancedSound(freq, duration, volume / frequencies.length, startTime, waveform);
    });
  }, [createEnhancedSound]);

  const playAgitationStart = useCallback(() => {
    const audioContext = getAudioContext();
    const now = audioContext.currentTime;
    
    // Play three times in a row using Web Audio API scheduling
    for (let i = 0; i < 3; i++) {
      const repeatStartTime = now + (i * REPEAT_DELAY);
      createChordSound([800, 1000, 1200], 0.6, 0.4, repeatStartTime, 'triangle');
      createEnhancedSound(1000, 0.2, 0.3, repeatStartTime + AGITATION_START_DELAY, 'sine');
    }
  }, [createChordSound, createEnhancedSound, getAudioContext]);

  const playAgitationEnd = useCallback(() => {
    const audioContext = getAudioContext();
    const now = audioContext.currentTime;
    
    // Play three times in a row using Web Audio API scheduling
    for (let i = 0; i < 3; i++) {
      const repeatStartTime = now + (i * REPEAT_DELAY);
      createEnhancedSound(600, 0.4, 0.25, repeatStartTime, 'sine', {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.7,
        release: 0.25
      });
    }
  }, [createEnhancedSound, getAudioContext]);

  const playCompletion = useCallback(() => {
    const audioContext = getAudioContext();
    const now = audioContext.currentTime;
    
    // Play three times in a row using Web Audio API scheduling
    for (let i = 0; i < 3; i++) {
      const repeatStartTime = now + (i * REPEAT_DELAY * 2); // Longer delay for completion since it's a longer sequence
      createChordSound([523, 659, 784], 0.8, 0.35, repeatStartTime, 'sine');
      createChordSound([523, 659, 784], 0.6, 0.25, repeatStartTime + COMPLETION_SECOND_DELAY, 'sine');
      createChordSound([523, 659, 784], 0.4, 0.15, repeatStartTime + COMPLETION_THIRD_DELAY, 'sine');
    }
  }, [createChordSound, getAudioContext]);

  return {
    playAgitationStart,
    playAgitationEnd,
    playCompletion,
    initializeAudio
  };
};