import { AUDIO } from '../constants/timing';

/**
 * SoundManager - Uses Web Audio API for synthesized sounds and Seahawks audio clips.
 */
class SoundManagerClass {
  enabled = false; // Default OFF for elderly users
  private audioContext: AudioContext | null = null;

  private audioUrls = {
    intro: 'https://www2.seahawks.com/soundboard/audio/here-come-the-seahawks.mp3',
    random: [
      'https://www2.seahawks.com/soundboard/audio/touchdown-seahawks.mp3',
      'https://www2.seahawks.com/soundboard/audio/defensive-stop.mp3',
      'https://www2.seahawks.com/soundboard/audio/are-you-kidding-me.mp3',
    ],
  };

  init(): void {
    // Sound is always enabled (no toggle state)
    this.enabled = true;

    // Disable for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.enabled = false;
    }
  }

  private getContext(): AudioContext {
    this.audioContext ??= this.createAudioContext();
    return this.audioContext;
  }

  private createAudioContext(): AudioContext {
    // Standard AudioContext
    if (typeof window.AudioContext !== 'undefined') {
      return new window.AudioContext();
    }
    // Safari/webkit prefix fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-restricted-syntax
    const webkitAudioContext = (window as any).webkitAudioContext;
    if (typeof webkitAudioContext !== 'undefined') {
      return new webkitAudioContext();
    }
    throw new Error('AudioContext not supported');
  }

  /**
   * Play a random Seahawks chant. Called from the play sound button.
   */
  playRandom(): void {
    this.playRandomSound();
  }

  /**
   * Play an audio file from URL.
   */
  playAudio(url: string): void {
    if (!this.enabled) return;
    try {
      const audio = new Audio(url);
      audio.volume = AUDIO.VOLUME;
      audio.play().catch((e) => console.log('Audio play failed:', e));
    } catch {
      console.log('Audio not available');
    }
  }

  /**
   * Play intro sound for team registration (always plays, regardless of sound setting).
   */
  playIntro(): void {
    try {
      const audio = new Audio(this.audioUrls.intro);
      audio.volume = AUDIO.VOLUME;
      audio.play().catch((e) => console.log('Audio play failed:', e));
    } catch {
      console.log('Audio not available');
    }
  }

  /**
   * Play random Seahawks sound for toggle feedback.
   */
  playRandomSound(): void {
    const sounds = this.audioUrls.random;
    const randomIndex = Math.floor(Math.random() * sounds.length);
    this.playAudio(sounds[randomIndex]);
  }

  /**
   * Play a success beep using Web Audio API.
   */
  playSuccess(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = AUDIO.SUCCESS_FREQUENCY;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(AUDIO.SUCCESS_GAIN, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        AUDIO.FINAL_GAIN,
        ctx.currentTime + AUDIO.SUCCESS_DURATION
      );

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + AUDIO.SUCCESS_DURATION);
    } catch {
      console.log('Web Audio not available');
    }
  }

  /**
   * Play a click sound using Web Audio API.
   */
  playClick(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = AUDIO.CLICK_FREQUENCY;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(AUDIO.CLICK_GAIN, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        AUDIO.FINAL_GAIN,
        ctx.currentTime + AUDIO.CLICK_DURATION
      );

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + AUDIO.CLICK_DURATION);
    } catch {
      console.log('Web Audio not available');
    }
  }
}

// Export singleton instance
export const SoundManager = new SoundManagerClass();
