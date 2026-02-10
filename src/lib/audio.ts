// Audio Service for Sound Effects and Music
class AudioService {
  private clickSound: HTMLAudioElement | null = null;
  private successSound: HTMLAudioElement | null = null;
  private errorSound: HTMLAudioElement | null = null;
  private welcomeMusic: HTMLAudioElement | null = null;
  private bgMusic: HTMLAudioElement | null = null;
  private isInitialized = false;

  // Sound URLs - using reliable CDN sources
  private readonly SOUNDS = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
    notification: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    hover: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  };

  private readonly MUSIC = {
    welcome: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    bg: 'https://assets.mixkit.co/music/preview/mixkit-ambient-piano-1065.mp3',
  };

  initialize() {
    if (this.isInitialized) return;
    
    try {
      // Preload sounds
      this.clickSound = new Audio(this.SOUNDS.click);
      this.clickSound.volume = 0.3;
      
      this.successSound = new Audio(this.SOUNDS.success);
      this.successSound.volume = 0.4;
      
      this.errorSound = new Audio(this.SOUNDS.error);
      this.errorSound.volume = 0.3;

      // Music
      this.welcomeMusic = new Audio(this.MUSIC.welcome);
      this.welcomeMusic.volume = 0.2;
      this.welcomeMusic.loop = true;

      this.bgMusic = new Audio(this.MUSIC.bg);
      this.bgMusic.volume = 0.15;
      this.bgMusic.loop = true;

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  playClick() {
    if (!this.isInitialized) this.initialize();
    if (this.clickSound) {
      this.clickSound.currentTime = 0;
      this.clickSound.play().catch(() => {});
    }
  }

  playSuccess() {
    if (!this.isInitialized) this.initialize();
    if (this.successSound) {
      this.successSound.currentTime = 0;
      this.successSound.play().catch(() => {});
    }
  }

  playError() {
    if (!this.isInitialized) this.initialize();
    if (this.errorSound) {
      this.errorSound.currentTime = 0;
      this.errorSound.play().catch(() => {});
    }
  }

  playNotification() {
    if (!this.isInitialized) this.initialize();
    const notificationSound = new Audio(this.SOUNDS.notification);
    notificationSound.volume = 0.4;
    notificationSound.play().catch(() => {});
  }

  playHover() {
    if (!this.isInitialized) this.initialize();
    const hoverSound = new Audio(this.SOUNDS.hover);
    hoverSound.volume = 0.1;
    hoverSound.play().catch(() => {});
  }

  playWelcomeMusic() {
    if (!this.isInitialized) this.initialize();
    if (this.welcomeMusic) {
      this.welcomeMusic.play().catch(() => {});
    }
  }

  stopWelcomeMusic() {
    if (this.welcomeMusic) {
      this.welcomeMusic.pause();
      this.welcomeMusic.currentTime = 0;
    }
  }

  playBackgroundMusic() {
    if (!this.isInitialized) this.initialize();
    if (this.bgMusic) {
      this.bgMusic.play().catch(() => {});
    }
  }

  stopBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }

  stopAllMusic() {
    this.stopWelcomeMusic();
    this.stopBackgroundMusic();
  }
}

export const audioService = new AudioService();
