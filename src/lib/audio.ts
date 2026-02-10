// Audio Service for Sound Effects and Music
class AudioService {
  private clickSound: HTMLAudioElement | null = null;
  private successSound: HTMLAudioElement | null = null;
  private errorSound: HTMLAudioElement | null = null;
  private welcomeMusic: HTMLAudioElement | null = null;
  private bgMusic: HTMLAudioElement | null = null;
  private isInitialized = false;

  // Sound URLs - using reliable CDN sources from Mixkit
  private readonly SOUNDS = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
    notification: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    hover: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    swipe: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
    pop: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
    toggle: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
    tab: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
    type: 'https://assets.mixkit.co/active_storage/sfx/2547/2547-preview.mp3',
    achievement: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    whoosh: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
    tick: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
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

  playClick(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    if (this.clickSound) {
      this.clickSound.currentTime = 0;
      this.clickSound.play().catch(() => {});
    }
  }

  playSuccess(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    if (this.successSound) {
      this.successSound.currentTime = 0;
      this.successSound.play().catch(() => {});
    }
  }

  playError(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    if (this.errorSound) {
      this.errorSound.currentTime = 0;
      this.errorSound.play().catch(() => {});
    }
  }

  playNotification(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    try {
      const notificationSound = new Audio(this.SOUNDS.notification);
      notificationSound.volume = 0.4;
      notificationSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  playHover(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    try {
      const hoverSound = new Audio(this.SOUNDS.hover);
      hoverSound.volume = 0.1;
      hoverSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play hover sound:', error);
    }
  }

  playSwipe(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    try {
      const swipeSound = new Audio(this.SOUNDS.swipe);
      swipeSound.volume = 0.2;
      swipeSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play swipe sound:', error);
    }
  }

  playPop(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    try {
      const popSound = new Audio(this.SOUNDS.pop);
      popSound.volume = 0.3;
      popSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play pop sound:', error);
    }
  }

  playToggle(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    try {
      const toggleSound = new Audio(this.SOUNDS.toggle);
      toggleSound.volume = 0.2;
      toggleSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play toggle sound:', error);
    }
  }

  playTab(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    try {
      const tabSound = new Audio(this.SOUNDS.tab);
      tabSound.volume = 0.15;
      tabSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play tab sound:', error);
    }
  }

  playType(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    try {
      const typeSound = new Audio(this.SOUNDS.type);
      typeSound.volume = 0.1;
      typeSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play type sound:', error);
    }
  }

  playAchievement(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    try {
      const achievementSound = new Audio(this.SOUNDS.achievement);
      achievementSound.volume = 0.5;
      achievementSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play achievement sound:', error);
    }
  }

  playWhoosh(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    try {
      const whooshSound = new Audio(this.SOUNDS.whoosh);
      whooshSound.volume = 0.3;
      whooshSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play whoosh sound:', error);
    }
  }

  playTick(soundEnabled = true) {
    if (!soundEnabled) return;
    if (!this.isInitialized) this.initialize();
    try {
      const tickSound = new Audio(this.SOUNDS.tick);
      tickSound.volume = 0.2;
      tickSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play tick sound:', error);
    }
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
