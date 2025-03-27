// 音效管理類
class SoundManager {
  constructor() {
    // 初始化音效
    this.sounds = {
      move: new Audio('sounds/hitted.mp3'),
      cheat: new Audio('sounds/cheating.mp3'),
      win: new Audio('sounds/done-perfect.mp3'),
      colorChange: new Audio('sounds/color-change.mp3'),
      gameStart: new Audio('sounds/game-start.mp3')
    };
    
    // 設置音量
    this.setVolume(0.5);
    
    // 音效開關狀態，預設為開啟
    this.muted = false;
  }
  
  // 設置所有音效的音量
  setVolume(volume) {
    for (const sound in this.sounds) {
      this.sounds[sound].volume = this.muted ? 0 : volume;
    }
  }
  
  // 切換靜音狀態
  toggleMute() {
    this.muted = !this.muted;
    
    // 更新所有音效的音量
    for (const sound in this.sounds) {
      this.sounds[sound].volume = this.muted ? 0 : 0.5;
    }
    
    return this.muted;
  }
  
  // 播放移動方塊音效
  playMoveSound() {
    this.playSound('move');
  }
  
  // 播放作弊模式音效
  playCheatSound() {
    this.playSound('cheat');
  }
  
  // 播放勝利音效
  playWinSound() {
    this.playSound('win');
  }
  
  // 播放換色音效
  playColorChangeSound() {
    this.playSound('colorChange');
  }
  
  // 播放遊戲開始音效
  playGameStartSound() {
    this.playSound('gameStart');
  }
  
  // 通用播放音效方法
  playSound(soundName) {
    if (this.sounds[soundName]) {
      try {
        // 重置音效，以便可以連續播放
        this.sounds[soundName].currentTime = 0;
        // 確保音量設置正確
        this.sounds[soundName].volume = this.muted ? 0 : 0.5;
        // 如果靜音狀態，不播放音效
        if (this.muted) return;
        
        // 嘗試播放音效
        const playPromise = this.sounds[soundName].play();
        
        // 處理播放Promise
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // 處理可能的播放錯誤（例如用戶尚未與頁面互動）
            console.log(`無法播放音效 ${soundName}:`, error);
          });
        }
      } catch (error) {
        console.log(`播放音效時發生錯誤 ${soundName}:`, error);
      }
    }
  }
}

// 創建全局音效管理器實例
const soundManager = new SoundManager();