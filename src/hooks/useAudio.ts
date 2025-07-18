import { useCallback, useRef } from 'react';

const GAIN_EPSILON = 0.001;
const AGITATION_START_DELAY = 100;
const COMPLETION_SECOND_DELAY = 200;
const COMPLETION_THIRD_DELAY = 400;
const REPEAT_DELAY = 300;

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
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

    const now = audioContext.currentTime;
    
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
    waveform: OscillatorType = 'sine'
  ) => {
    frequencies.forEach(freq => {
      createEnhancedSound(freq, duration, volume / frequencies.length, waveform);
    });
  }, [createEnhancedSound]);

  const playAgitationStart = useCallback(() => {
    // Play three times in a row
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createChordSound([800, 1000, 1200], 0.6, 0.4, 'triangle');
        
        setTimeout(() => {
          createEnhancedSound(1000, 0.2, 0.3, 'sine');
        }, AGITATION_START_DELAY);
      }, i * REPEAT_DELAY);
    }
  }, [createChordSound, createEnhancedSound]);

  const playAgitationEnd = useCallback(() => {
    // Play three times in a row
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createEnhancedSound(600, 0.4, 0.25, 'sine', {
          attack: 0.05,
          decay: 0.1,
          sustain: 0.7,
          release: 0.25
        });
      }, i * REPEAT_DELAY);
    }
  }, [createEnhancedSound]);

  const playCompletion = useCallback(() => {
    // Play three times in a row
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createChordSound([523, 659, 784], 0.8, 0.35, 'sine');
        
        setTimeout(() => {
          createChordSound([523, 659, 784], 0.6, 0.25, 'sine');
        }, COMPLETION_SECOND_DELAY);
        
        setTimeout(() => {
          createChordSound([523, 659, 784], 0.4, 0.15, 'sine');
        }, COMPLETION_THIRD_DELAY);
      }, i * REPEAT_DELAY * 2); // Longer delay for completion since it's a longer sequence
    }
  }, [createChordSound]);

  return {
    playAgitationStart,
    playAgitationEnd,
    playCompletion,
    initializeAudio
  };
};