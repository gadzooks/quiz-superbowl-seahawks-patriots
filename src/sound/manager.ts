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
    // Load preference from localStorage
    const saved = localStorage.getItem('soundEnabled');
    this.enabled = saved === 'true';
    this.updateButton();

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.enabled = false;
      localStorage.setItem('soundEnabled', 'false');
    }
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext)();
    }
    return this.audioContext;
  }

  toggle(): void {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled.toString());
    this.updateButton();

    // Play a random Seahawks sound when enabling
    if (this.enabled) {
      this.playRandomSound();
    }
  }

  /**
   * Play an audio file from URL.
   */
  playAudio(url: string): void {
    if (!this.enabled) return;
    try {
      const audio = new Audio(url);
      audio.volume = 0.7;
      audio.play().catch((e) => console.log('Audio play failed:', e));
    } catch (e) {
      console.log('Audio not available');
    }
  }

  /**
   * Play intro sound for team registration (always plays, regardless of sound setting).
   */
  playIntro(): void {
    try {
      const audio = new Audio(this.audioUrls.intro);
      audio.volume = 0.7;
      audio.play().catch((e) => console.log('Audio play failed:', e));
    } catch (e) {
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
   * Update the sound toggle button text.
   */
  updateButton(): void {
    const btn = document.getElementById('soundToggle');
    if (btn) {
      btn.textContent = this.enabled ? '🔊' : '🔇';
      btn.title = this.enabled ? 'Sound On (click to mute)' : 'Sound Off (click to unmute)';
    }
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

      oscillator.frequency.value = 880;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
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

      oscillator.frequency.value = 440;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.log('Web Audio not available');
    }
  }
}

// Export singleton instance
export const SoundManager = new SoundManagerClass();
