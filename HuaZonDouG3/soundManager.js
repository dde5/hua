// soundManager.js (Web Audio API 示例)
class SoundManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.soundBuffers = {}; // 存儲加載的 AudioBuffer
    this.muted = false;
    this.globalVolume = 0.5;
    this.gainNode = this.audioContext.createGain(); // 主增益節點控制音量
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = this.globalVolume;

    this.soundsToLoad = {
      move: 'sounds/hitted.mp3',
      cheat: 'sounds/cheating.mp3',
      win: 'sounds/done-perfect.mp3',
      colorChange: 'sounds/color-change.mp3',
      gameStart: 'sounds/game-start.mp3'
    };
    this.loadAllSounds();
  }

  async loadSound(name, url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      // decodeAudioData 是異步的
      this.audioContext.decodeAudioData(arrayBuffer, (buffer) => {
        this.soundBuffers[name] = buffer;
        console.log(`Sound ${name} loaded and decoded.`);
      }, (error) => {
        console.error(`Error decoding audio data for ${name}:`, error);
      });
    } catch (error) {
      console.error(`Error fetching sound ${name}:`, error);
    }
  }

  loadAllSounds() {
    for (const name in this.soundsToLoad) {
      this.loadSound(name, this.soundsToLoad[name]);
    }
  }

  setVolume(volume) {
    this.globalVolume = volume;
    if (this.muted) {
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    } else {
      this.gainNode.gain.setValueAtTime(this.globalVolume, this.audioContext.currentTime);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.setVolume(this.globalVolume);
    return this.muted;
  }

  playSound(soundName) {
    if (this.muted || !this.soundBuffers[soundName]) {
      if (!this.soundBuffers[soundName] && !this.muted) {
        console.warn(`Sound buffer for ${soundName} not loaded yet.`);
      }
      return;
    }
    // iOS 需要在用戶交互後恢復 AudioContext
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = this.soundBuffers[soundName];
    source.connect(this.gainNode); // 連接到增益節點，再到揚聲器
    source.start(0); // 立即播放
  }

  // 便捷方法
  playMoveSound() { this.playSound('move'); }
  playCheatSound() { this.playSound('cheat'); }
  playWinSound() { this.playSound('win'); }
  playColorChangeSound() { this.playSound('colorChange'); }
  playGameStartSound() { this.playSound('gameStart'); }
}

const soundManager = new SoundManager();