// 遊戲核心邏輯
class PuzzleGame {
  constructor(size, mode, imageSource) {
    this.size = size;
    this.mode = mode; // 'number' 或 'image'
    this.imageSource = imageSource;
    this.moves = 0;
    this.startTime = new Date(); // 確保每次創建新遊戲時都重置開始時間
    this.timer = null;
    this.board = [];
    this.emptyPos = { row: size - 1, col: size - 1 };
    
    // 作弊模式相關屬性
    this.cheatCount = 0; // 作弊次數
    this.cheatTimes = []; // 記錄每次作弊的時間
    this.cheatEnabled = false; // 作弊模式是否啟用
    
    this.initializeGame();
  }
  
  initializeGame() {
    // 創建有序的遊戲板
    this.board = [];
    let value = 1;
    
    // 重置空白方塊位置到右下角
    this.emptyPos = { row: this.size - 1, col: this.size - 1 };
    
    for (let row = 0; row < this.size; row++) {
      const rowArray = [];
      for (let col = 0; col < this.size; col++) {
        if (row === this.size - 1 && col === this.size - 1) {
          rowArray.push(0); // 空白方塊
        } else {
          rowArray.push(value++);
        }
      }
      this.board.push(rowArray);
    }
    
    // 隨機打亂遊戲板
    this.shuffleBoard();
    
    // 重置遊戲狀態
    this.moves = 0;
    document.getElementById('moves').textContent = '0';
  }
  
  shuffleBoard() {
    // 執行隨機移動來打亂遊戲板
    // 通常需要1000次以上的隨機移動來確保充分打亂
    const moves = 1000 + Math.floor(Math.random() * 1000);
    
    for (let i = 0; i < moves; i++) {
      // 獲取空白方塊的相鄰方塊
      const adjacentBlocks = this.getAdjacentBlocks();
      
      if (adjacentBlocks.length > 0) {
        // 隨機選擇一個相鄰方塊進行移動
        const randomIndex = Math.floor(Math.random() * adjacentBlocks.length);
        const { row, col } = adjacentBlocks[randomIndex];
        
        // 交換位置
        this.swapBlocks(row, col);
      }
    }
    
    // 確保生成的謎題可解
    if (!this.isSolvable()) {
      // 如果不可解，交換任意兩個非空方塊
      this.makeGameSolvable();
    }
  }
  
  getAdjacentBlocks() {
    const { row, col } = this.emptyPos;
    const adjacent = [];
    
    // 上方方塊
    if (row > 0) adjacent.push({ row: row - 1, col });
    // 下方方塊
    if (row < this.size - 1) adjacent.push({ row: row + 1, col });
    // 左側方塊
    if (col > 0) adjacent.push({ row, col: col - 1 });
    // 右側方塊
    if (col < this.size - 1) adjacent.push({ row, col: col + 1 });
    
    return adjacent;
  }
  
  swapBlocks(row, col) {
    // 交換指定位置的方塊與空白方塊
    const temp = this.board[row][col];
    this.board[row][col] = 0;
    this.board[this.emptyPos.row][this.emptyPos.col] = temp;
    
    // 更新空白方塊位置
    this.emptyPos = { row, col };
  }
  
  isSolvable() {
    // 檢查當前遊戲板是否可解
    // 對於N×N的遊戲板，當N為奇數時，逆序數必須為偶數才可解
    // 當N為偶數時，逆序數+空白方塊所在行數（從底部數）的奇偶性必須與初始狀態相同才可解
    
    // 將二維數組轉為一維數組，忽略空白方塊
    const flatBoard = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] !== 0) {
          flatBoard.push(this.board[row][col]);
        }
      }
    }
    
    // 計算逆序數
    let inversions = 0;
    for (let i = 0; i < flatBoard.length; i++) {
      for (let j = i + 1; j < flatBoard.length; j++) {
        if (flatBoard[i] > flatBoard[j]) {
          inversions++;
        }
      }
    }
    
    // 根據遊戲板尺寸判斷是否可解
    if (this.size % 2 === 1) {
      // 奇數尺寸：逆序數必須為偶數
      return inversions % 2 === 0;
    } else {
      // 偶數尺寸：逆序數+空白方塊所在行數（從底部數）的奇偶性必須為偶數
      const emptyRowFromBottom = this.size - this.emptyPos.row;
      return (inversions + emptyRowFromBottom) % 2 === 0;
    }
  }
  
  makeGameSolvable() {
    // 如果遊戲不可解，交換任意兩個非空方塊使其可解
    if (this.board[0][0] !== 0 && this.board[0][1] !== 0) {
      // 交換左上角的兩個方塊
      const temp = this.board[0][0];
      this.board[0][0] = this.board[0][1];
      this.board[0][1] = temp;
    } else {
      // 如果左上角有空方塊，交換右下角的兩個方塊
      const row = this.size - 1;
      const col = this.size - 2;
      if (this.board[row][col] !== 0 && this.board[row][col-1] !== 0) {
        const temp = this.board[row][col];
        this.board[row][col] = this.board[row][col-1];
        this.board[row][col-1] = temp;
      }
    }
  }
  
  isAdjacent(row, col) {
    // 檢查指定位置的方塊是否與空白方塊相鄰
    const { row: emptyRow, col: emptyCol } = this.emptyPos;
    
    // 水平或垂直相鄰
    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  }
  
  moveBlock(row, col) {
    if (this.isAdjacent(row, col)) {
      // 交換方塊
      this.swapBlocks(row, col);
      
      // 增加移動次數
      this.moves++;
      document.getElementById('moves').textContent = this.moves;
      
      // 播放移動音效
      soundManager.playMoveSound();
      
      return true;
    }
    return false;
  }
  
  checkWin() {
    // 檢查遊戲是否完成
    let value = 1;
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        // 最後一個位置應該是空白方塊
        if (row === this.size - 1 && col === this.size - 1) {
          if (this.board[row][col] !== 0) {
            return false;
          }
        } else {
          // 其他位置應該是按順序排列的數字
          if (this.board[row][col] !== value++) {
            return false;
          }
        }
      }
    }
    
    return true;
  }
  
  startTimer() {
    this.startTime = new Date();
    this.timerElement = document.getElementById('time');
    
    this.timer = setInterval(() => {
      const currentTime = new Date();
      const elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
      
      const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
      const seconds = (elapsedTime % 60).toString().padStart(2, '0');
      
      this.timerElement.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }
  
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  resetGame() {
    // 停止當前計時器
    this.stopTimer();
    
    // 重新初始化遊戲
    this.initializeGame();
    
    // 重置作弊模式相關屬性
    this.cheatCount = 0;
    this.cheatTimes = [];
    this.cheatEnabled = false; // 確保作弊模式被禁用
    
    // 重新設置開始時間，確保作弊模式時間限制重置
    this.startTime = new Date();
    
    // 重置計時器顯示
    document.getElementById('time').textContent = '00:00';
    
    // 重新開始計時
    this.startTimer();
  }
  
  saveHighScore() {
    // 獲取當前遊戲模式、圖片和尺寸的鍵
    let imageName = '';
    if (this.mode === 'image' && this.imageSource) {
      // 從圖片路徑中提取圖片名稱
      const match = this.imageSource.match(/images\/([^.]+)\./i);
      if (match && match[1]) {
        imageName = match[1];
      } else {
        // 如果是自定義上傳或網絡圖片，使用通用名稱
        imageName = 'custom';
      }
    }
    
    const key = `${this.mode}-${imageName}-${this.size}`;
    
    // 獲取當前時間和移動次數
    const currentTime = this.timerElement.textContent;
    const currentMoves = this.moves;
    
    // 從本地存儲中獲取現有的高分記錄
    const highScores = JSON.parse(localStorage.getItem('puzzleHighScores') || '{}');
    
    // 確保該關卡有記錄陣列
    if (!highScores[key]) {
      highScores[key] = [];
    }
    
    // 確保記錄是陣列類型
    if (!Array.isArray(highScores[key])) {
      highScores[key] = [];
    }
    
    // 創建當前成績記錄
    const currentScore = {
      time: currentTime,
      moves: currentMoves,
      cheatUsed: this.cheatCount > 0,
      cheatCount: this.cheatCount,
      cheatTimes: this.cheatTimes.map(time => time.toISOString())
    };
    
    // 檢查是否應該將當前成績添加到記錄中
    let shouldAdd = false;
    
    // 如果記錄少於3個，直接添加
    if (highScores[key].length < 3) {
      shouldAdd = true;
    } else {
      // 檢查當前成績是否比任何現有記錄更好
      for (let i = 0; i < highScores[key].length; i++) {
        if (this.isNewHighScore(highScores[key][i], currentTime, currentMoves)) {
          shouldAdd = true;
          break;
        }
      }
    }
    
    if (shouldAdd) {
      // 添加新記錄
      highScores[key].push(currentScore);
      
      // 根據成績排序（無作弊優先，然後是時間，最後是移動次數）
      highScores[key].sort((a, b) => {
        // 無作弊記錄優先於有作弊記錄
        if (a.cheatUsed !== b.cheatUsed) {
          return a.cheatUsed ? 1 : -1;
        }
        
        // 解析時間字符串為秒數
        const parseTimeToSeconds = (timeStr) => {
          const [minutes, seconds] = timeStr.split(':').map(Number);
          return minutes * 60 + seconds;
        };
        
        const aTimeSeconds = parseTimeToSeconds(a.time);
        const bTimeSeconds = parseTimeToSeconds(b.time);
        
        // 時間相同則比較移動次數
        if (aTimeSeconds === bTimeSeconds) {
          return a.moves - b.moves;
        }
        
        // 時間較短的排前面
        return aTimeSeconds - bTimeSeconds;
      });
      
      // 只保留前三名
      if (highScores[key].length > 3) {
        highScores[key] = highScores[key].slice(0, 3);
      }
      
      // 保存到本地存儲
      localStorage.setItem('puzzleHighScores', JSON.stringify(highScores));
      
      return true;
    }
    
    return false;
  }
  
  isNewHighScore(existingScore, currentTime, currentMoves) {
    // 解析時間字符串為秒數
    const parseTimeToSeconds = (timeStr) => {
      const [minutes, seconds] = timeStr.split(':').map(Number);
      return minutes * 60 + seconds;
    };
    
    const existingTimeSeconds = parseTimeToSeconds(existingScore.time);
    const currentTimeSeconds = parseTimeToSeconds(currentTime);
    
    // 檢查作弊模式使用情況
    const existingCheatUsed = existingScore.cheatUsed || false;
    const currentCheatUsed = this.cheatCount > 0;
    
    // 無作弊的記錄優先於有作弊的記錄
    if (!currentCheatUsed && existingCheatUsed) {
      return true;
    }
    
    // 如果兩者作弊狀態相同，則比較時間和移動次數
    if (currentCheatUsed === existingCheatUsed) {
      // 首先比較時間，如果時間相同則比較移動次數
      if (currentTimeSeconds < existingTimeSeconds) {
        return true;
      } else if (currentTimeSeconds === existingTimeSeconds && currentMoves < existingScore.moves) {
        return true;
      }
    }
    
    return false;
  }
  
  // 作弊模式 - 交換任意兩個方塊
  cheatSwap(row1, col1, row2, col2) {
    // 檢查位置是否有效
    if (row1 < 0 || row1 >= this.size || col1 < 0 || col1 >= this.size ||
        row2 < 0 || row2 >= this.size || col2 < 0 || col2 >= this.size) {
      return false;
    }
    
    // 檢查是否選擇了相同的方塊
    if (row1 === row2 && col1 === col2) {
      return false;
    }
    
    // 檢查是否已經過了5分鐘的時間限制
    const currentTime = new Date();
    const elapsedTimeInSeconds = Math.floor((currentTime - this.startTime) / 1000);
    const timeLimit = 5 * 60; // 5分鐘，單位為秒
    
    if (elapsedTimeInSeconds < timeLimit) {
      const remainingMinutes = Math.floor((timeLimit - elapsedTimeInSeconds) / 60);
      const remainingSeconds = (timeLimit - elapsedTimeInSeconds) % 60;
      alert(`作弊模式將在 ${remainingMinutes}分${remainingSeconds}秒 後可用`);
      return false;
    }
    
    // 獲取方塊值
    const value1 = this.board[row1][col1];
    const value2 = this.board[row2][col2];
    
    // 檢查是否有空白方塊，如果有，則不進行交換
    if (value1 === 0 || value2 === 0) {
      alert('作弊模式不能交換空白方塊，請選擇其他方塊');
      return false;
    }
    
    // 交換方塊
    this.board[row1][col1] = value2;
    this.board[row2][col2] = value1;
    
    // 增加移動次數
    this.moves++;
    document.getElementById('moves').textContent = this.moves;
    
    // 記錄作弊使用信息
    this.cheatCount++;
    this.cheatTimes.push(new Date());
    
    // 播放作弊音效
    soundManager.playCheatSound();
    
    return true;
  }
  
  getHint() {
    // 使用廣度優先搜索找到最短路徑到目標狀態
    // 由於完整的解決方案可能需要大量計算，這裡只提供下一步的提示
    
    // 檢查是否已經完成
    if (this.checkWin()) {
      return null; // 已經完成，不需要提示
    }
    
    // 獲取當前可移動的方塊
    const adjacentBlocks = this.getAdjacentBlocks();
    
    // 評估每個可能的移動
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (const move of adjacentBlocks) {
      // 臨時移動方塊
      const { row, col } = move;
      const originalBoard = JSON.parse(JSON.stringify(this.board));
      const originalEmptyPos = {...this.emptyPos};
      
      // 執行移動
      this.swapBlocks(row, col);
      
      // 計算移動後的得分（曼哈頓距離）
      const score = this.evaluatePosition();
      
      // 恢復原始狀態
      this.board = originalBoard;
      this.emptyPos = originalEmptyPos;
      
      // 更新最佳移動
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
  
  evaluatePosition() {
    // 使用曼哈頓距離評估當前位置
    // 曼哈頓距離越小，表示越接近目標狀態
    let score = 0;
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const value = this.board[row][col];
        if (value !== 0) {
          // 計算當前位置與目標位置的曼哈頓距離
          const targetRow = Math.floor((value - 1) / this.size);
          const targetCol = (value - 1) % this.size;
          const distance = Math.abs(row - targetRow) + Math.abs(col - targetCol);
          
          // 距離越小，得分越高
          score -= distance;
        }
      }
    }
    
    return score;
  }
}