import { useCallback, useRef, useState } from 'react';

/**
 * Custom hook for playing sound effects
 * Uses Web Audio API for better performance and control
 */
export function useSound() {
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context lazily
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a beep sound using oscillator (for countdown)
  const playBeep = useCallback((frequency: number = 800, duration: number = 200) => {
    if (isMuted) return;

    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Failed to play beep:', error);
    }
  }, [isMuted, getAudioContext]);

  // Play success sound (ascending notes)
  const playSuccess = useCallback(() => {
    if (isMuted) return;

    try {
      const ctx = getAudioContext();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
      
      notes.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        const startTime = ctx.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (error) {
      console.warn('Failed to play success sound:', error);
    }
  }, [isMuted, getAudioContext]);

  // Play game start sound (rising tone)
  const playGameStart = useCallback(() => {
    if (isMuted) return;

    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.warn('Failed to play game start sound:', error);
    }
  }, [isMuted, getAudioContext]);

  // Play game end sound (descending tone)
  const playGameEnd = useCallback(() => {
    if (isMuted) return;

    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1);
    } catch (error) {
      console.warn('Failed to play game end sound:', error);
    }
  }, [isMuted, getAudioContext]);

  // Play countdown beep (higher pitch for urgency)
  const playCountdownBeep = useCallback(() => {
    playBeep(1200, 150); // Higher frequency, shorter duration
  }, [playBeep]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    playSuccess,
    playBeep,
    playGameStart,
    playGameEnd,
    playCountdownBeep,
    toggleMute,
    isMuted,
  };
}
