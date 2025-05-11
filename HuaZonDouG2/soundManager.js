// soundManager.js (修改版 - 使用音頻對象池)

class SoundManager {
  constructor(poolSize = 3) { // poolSize 可以根據需要調整，3-5 個通常足夠
    this.soundConfigs = {
      move: { src: 'sounds/hitted.mp3', pool: [], poolIndex: 0 },
      cheat: { src: 'sounds/cheating.mp3', pool: [], poolIndex: 0 },
      win: { src: 'sounds/done-perfect.mp3', pool: [], poolIndex: 0 },
      colorChange: { src: 'sounds/color-change.mp3', pool: [], poolIndex: 0 },
      gameStart: { src: 'sounds/game-start.mp3', pool: [], poolIndex: 0 }
    };
    this.poolSize = poolSize;
    this.muted = false;
    this.globalVolume = 0.5; // 初始音量

    this.initSoundPools();
    this.setVolume(this.globalVolume); // 應用初始音量
  }

  initSoundPools() {
    for (const soundName in this.soundConfigs) {
      const config = this.soundConfigs[soundName];
      for (let i = 0; i < this.poolSize; i++) {
        const audio = new Audio(config.src);
        audio.preload = 'auto'; // 建議預加載
        // 監聽 canplaythrough 事件確保音頻已準備好，但對於短音效可能不是必須
        // audio.addEventListener('canplaythrough', () => {
        //   console.log(`${soundName} pool item ${i} ready.`);
        // });
        config.pool.push(audio);
      }
    }
  }

  setVolume(volume) {
    this.globalVolume = volume;
    for (const soundName in this.soundConfigs) {
      const config = this.soundConfigs[soundName];
      config.pool.forEach(audio => {
        audio.volume = this.muted ? 0 : this.globalVolume;
      });
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.setVolume(this.globalVolume); // 重新應用音量（會考慮靜音狀態）
    return this.muted;
  }

  playSound(soundName) {
    if (this.muted) return;

    const config = this.soundConfigs[soundName];
    if (!config || config.pool.length === 0) {
      console.warn(`Sound config or pool not found for: ${soundName}`);
      return;
    }

    // 從池中選擇一個音頻對象（輪詢方式）
    const audio = config.pool[config.poolIndex];
    config.poolIndex = (config.poolIndex + 1) % config.pool.length;

    try {
      // 如果音頻正在播放，先停止它。
      // 但對於池化，我們期望每個對象是獨立的，所以這個檢查可能不是首要的。
      // 更好的做法是檢查 audio.paused。如果 !audio.paused，可以選擇跳過或選擇下一個。
      // 為了簡單起見，我們先直接嘗試播放。
      // if (!audio.paused) {
      //   audio.pause(); // 可選：如果希望打斷之前的同一個池對象的播放
      // }
      audio.currentTime = 0; // 總是從頭開始播放
      audio.volume = this.globalVolume; // 確保音量正確（靜音已在頂部處理）

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // 忽略用戶未交互錯誤，其他錯誤打印
          if (error.name !== 'NotAllowedError') {
            console.error(`Error playing sound ${soundName}:`, error);
          }
        });
      }
    } catch (error) {
      console.error(`Exception playing sound ${soundName}:`, error);
    }
  }

  // 便捷方法保持不變
  playMoveSound() { this.playSound('move'); }
  playCheatSound() { this.playSound('cheat'); }
  playWinSound() { this.playSound('win'); }
  playColorChangeSound() { this.playSound('colorChange'); }
  playGameStartSound() { this.playSound('gameStart'); }
}

// 創建全局音效管理器實例
const soundManager = new SoundManager(3); // 使用大小為 3 的池