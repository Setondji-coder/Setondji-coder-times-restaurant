// Kitchen Audio Service using Web Audio API
// Generates realistic restaurant kitchen bell / order ding-dong alerts
// without relying on external network mp3 files that might fail.

class KitchenAudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public async resume(): Promise<boolean> {
    const ctx = this.getAudioContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx.state === 'running';
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Double chime alert: High bell ding-dong for kitchen tickets
  public playNewOrderAlert() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: High crisp chime (1320 Hz - E6)
      this.createChimeTone(ctx, 1320, now, 0.45, 0.35);

      // Note 2: Harmonious resonance (1760 Hz - A6)
      this.createChimeTone(ctx, 1760, now + 0.12, 0.65, 0.4);

      // Note 3: Rich sustain tone (880 Hz - A5)
      this.createChimeTone(ctx, 880, now + 0.14, 0.9, 0.25);
    } catch (err) {
      console.warn('Audio alert error:', err);
    }
  }

  // Quick confirmation blip when status is updated (En prépa / Prêt)
  public playSuccessBeep() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.createChimeTone(ctx, 1046.5, now, 0.25, 0.2); // C6
      this.createChimeTone(ctx, 1318.5, now + 0.08, 0.35, 0.25); // E6
    } catch {
      // ignore
    }
  }

  // Out of stock warning sound
  public playWarningBeep() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.createChimeTone(ctx, 440, now, 0.2, 0.3, 'sawtooth');
      this.createChimeTone(ctx, 330, now + 0.15, 0.3, 0.3, 'sawtooth');
    } catch {
      // ignore
    }
  }

  private createChimeTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine'
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}

export const kitchenAudio = new KitchenAudioService();
