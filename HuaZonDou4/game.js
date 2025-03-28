// game.js (完整修正版 - 僅加入高分功能)
class PuzzleGame {
  constructor(size, mode, imageSource) {
    // --- 原始屬性 ---
    this.size = size;
    this.mode = mode; // 'number' 或 'image'
    this.imageSource = imageSource; // 可能為原始路徑或預處理過的 DataURL
    this.moves = 0;
    this.startTime = new Date(); // 確保每次創建新遊戲時都重置開始時間
    this.timer = null;
    this.timerElement = document.getElementById('time'); // 獲取一次DOM元素
    this.board = [];
    this.emptyPos = { row: size - 1, col: size - 1 };
    this.cheatCount = 0; // 作弊次數
    this.cheatTimes = []; // 記錄每次作弊的時間
    this.cheatEnabled = false; // 作弊模式是否啟用
    // --- 原始屬性結束 ---

    // --- 新增：關卡標識符 ---
    this.imageIdentifier = this.determineImageIdentifier(this.imageSource);
    // --- 新增結束 ---

    this.initializeGame();
    console.log(`遊戲實例已創建: ${this.size}x${this.size}, 模式: ${this.mode}, 標識符: '${this.imageIdentifier}'`);
  }

  // --- 新增：輔助函數來確定標識符 (基於傳入的 imageSource) ---
  determineImageIdentifier(imgSrc) {
    if (this.mode === 'number') {
      return ''; // 數字模式無標識符
    }
    if (!imgSrc) {
      return 'unknown'; // 無圖片來源
    }

    // 優先處理 Data URL
    if (imgSrc.startsWith('data:')) {
      return 'custom'; // 自定義圖片統一標識
    }
    // 處理網路圖片
    if (imgSrc.startsWith('http')) {
       // 嘗試從 URL 末尾提取名稱 (不含擴展名)
       try {
           const urlParts = imgSrc.split('/');
           const lastPart = urlParts[urlParts.length - 1];
           const nameParts = lastPart.split('.');
           if (nameParts.length > 1) nameParts.pop(); // 移除擴展名
           const name = nameParts.join('.');
           // 避免過長的 URL 片段作為標識符
           return 'net_' + (name ? name.substring(0, 20) : 'image'); // 加上前綴並限制長度
       } catch (e) {
           return 'network'; // 提取失敗則返回通用標識
       }
    }
    // 嘗試從相對路徑提取 (如 'images/C1.jpg')
    const match = imgSrc.match(/images\/([^.]+)\.[^.]+$/i); // 匹配 images/文件名.擴展名
    if (match && match[1]) {
      return match[1]; // 返回文件名部分，例如 'C1'
    }

    // 如果以上都不匹配，返回未知
    return 'unknown';
  }
  // --- 新增結束 ---

  initializeGame() {
    // 創建有序的遊戲板
    this.board = [];
    let value = 1;
    this.emptyPos = { row: this.size - 1, col: this.size - 1 }; // 重置空塊位置
    for (let row = 0; row < this.size; row++) {
      const rowArray = [];
      for (let col = 0; col < this.size; col++) {
        if (row === this.size - 1 && col === this.size - 1) rowArray.push(0);
        else rowArray.push(value++);
      }
      this.board.push(rowArray);
    }
    this.shuffleBoard(); // 打亂
    this.moves = 0; // 重置步數
    if (this.timerElement) this.timerElement.textContent = '00:00'; // 重置計時器顯示
    console.log("遊戲初始化完成");
  }

  shuffleBoard() {
    // 使用 Fisher-Yates (Knuth) Shuffle 來打亂一維數組，然後轉換回二維
    // 這樣更容易確保可解性
    const totalTiles = this.size * this.size;
    let tiles = Array.from({ length: totalTiles }, (_, i) => i); // 0 到 N*N-1

    // Fisher-Yates Shuffle
    for (let i = totalTiles - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]]; // 交換元素
    }

    // 將打亂後的一維數組轉換回二維 board
    this.board = [];
    let k = 0;
    for (let row = 0; row < this.size; row++) {
      const rowArray = [];
      for (let col = 0; col < this.size; col++) {
        rowArray.push(tiles[k]);
        if (tiles[k] === 0) { // 找到空塊 (值為 0)
          this.emptyPos = { row, col }; // 更新空塊位置
        }
        k++;
      }
      this.board.push(rowArray);
    }
    console.log("Shuffle 完成，新 emptyPos:", this.emptyPos);

    // 確保可解
    if (!this.isSolvable()) {
      console.warn("生成的謎題不可解，正在嘗試修復...");
      // 如果不可解，通常交換兩個非空塊即可（如果空塊不在最後一行）
      // 簡單修復：如果不是 0 和 1，交換 board[0][0] 和 board[0][1]
      if (this.board[0][0] !== 0 && this.board[0][1] !== 0) {
          [this.board[0][0], this.board[0][1]] = [this.board[0][1], this.board[0][0]];
           console.log("交換了 board[0][0] 和 board[0][1]");
      } else { // 如果前兩個有空塊，嘗試交換最後兩個
          const r = this.size - 1;
          if (this.board[r][this.size - 2] !== 0 && this.board[r][this.size - 3] !== 0) {
             [this.board[r][this.size - 2], this.board[r][this.size - 3]] = [this.board[r][this.size - 3], this.board[r][this.size - 2]];
              console.log("交換了最後一行的兩個塊");
          } else {
               console.warn("無法執行簡單修復，謎題可能仍不可解");
          }
      }
      // 再次檢查 (可選)
      // if (!this.isSolvable()) console.error("修復後仍然不可解！");
      // else console.log("謎題已修復為可解");
    }
  }

  getAdjacentBlocks() {
    const { row, col } = this.emptyPos; const adjacent = [];
    if (row > 0) adjacent.push({ row: row - 1, col });
    if (row < this.size - 1) adjacent.push({ row: row + 1, col });
    if (col > 0) adjacent.push({ row, col: col - 1 });
    if (col < this.size - 1) adjacent.push({ row, col: col + 1 });
    return adjacent;
  }

  swapBlocks(row, col) {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return;
    const targetValue = this.board[row][col];
    const oldEmptyRow = this.emptyPos.row; const oldEmptyCol = this.emptyPos.col;
    this.board[oldEmptyRow][oldEmptyCol] = targetValue;
    this.board[row][col] = 0;
    this.emptyPos = { row, col };
    console.log(`  swapBlocks: 將 (${row},${col}) 的值 ${targetValue} 移到 (${oldEmptyRow},${oldEmptyCol}), 空塊移到 (${row},${col})。 新 emptyPos: ${JSON.stringify(this.emptyPos)}`);
  }

  isSolvable() {
    const flatBoard = [];
    for (let r = 0; r < this.size; r++) for (let c = 0; c < this.size; c++) if (this.board[r][c] !== 0) flatBoard.push(this.board[r][c]);
    let inversions = 0;
    for (let i = 0; i < flatBoard.length; i++) for (let j = i + 1; j < flatBoard.length; j++) if (flatBoard[i] > flatBoard[j]) inversions++;
    if (this.size % 2 === 1) return inversions % 2 === 0;
    else { const emptyRowFromBottom = this.size - this.emptyPos.row; return (inversions + emptyRowFromBottom) % 2 === 0; }
  }

  makeGameSolvable() { // 簡單修復邏輯
    if (this.board[0][0] !== 0 && this.board[0][1] !== 0) {
      console.log("makeGameSolvable: 交換 board[0][0] 和 board[0][1]");
      [this.board[0][0], this.board[0][1]] = [this.board[0][1], this.board[0][0]];
    } else {
      const r = this.size - 1;
      const c1 = this.size - 1;
      const c2 = this.size - 2;
      // 確保要交換的位置存在且非空
      if (c2 >= 0 && this.board[r][c1] !== 0 && this.board[r][c2] !== 0) {
          console.log(`makeGameSolvable: 交換 board[${r}][${c1}] 和 board[${r}][${c2}]`);
         [this.board[r][c1], this.board[r][c2]] = [this.board[r][c2], this.board[r][c1]];
      } else if (c2 >= 0 && this.board[r-1][c1] !== 0 && this.board[r-1][c2] !== 0){ // 嘗試倒數第二行
           console.log(`makeGameSolvable: 交換 board[${r-1}][${c1}] 和 board[${r-1}][${c2}]`);
           [this.board[r-1][c1], this.board[r-1][c2]] = [this.board[r-1][c2], this.board[r-1][c1]];
      } else {
           console.warn("makeGameSolvable: 無法找到合適的兩個方塊進行交換。");
      }
    }
  }

  isAdjacent(row, col) {
    const { row: emptyRow, col: emptyCol } = this.emptyPos;
    const adjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1);
    console.log(`    isAdjacent: 比較 (${row},${col}) 與 emptyPos (${emptyRow},${emptyCol}) -> ${adjacent}`);
    return adjacent;
  }

  moveBlock(row, col) {
    // isAdjacent 應該在 ui.js 中檢查過了
    this.swapBlocks(row, col);
    this.moves++;
    // ui.js 會更新顯示和播放聲音
    return true;
  }

  checkWin() {
    let value = 1; // 原始是從 1 開始檢查
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (r === this.size - 1 && c === this.size - 1) {
          if (this.board[r][c] !== 0) return false; // 最後一個是 0
        } else {
          if (this.board[r][c] !== value++) return false; // 其他按順序是 1, 2, ...
        }
      }
    }
    return true;
  }

  startTimer() {
    if (!this.timerElement) { console.error("Timer element not found"); return; }
    this.stopTimer(); // 清除舊計時器
    this.startTime = new Date(); // 重置開始時間
    console.log("Timer started:", this.startTime);
    this.timerElement.textContent = '00:00'; // 立即更新顯示
    this.timer = setInterval(() => {
      const now = new Date();
      const start = this.startTime instanceof Date ? this.startTime : now;
      const elapsed = Math.floor((now - start) / 1000);
      if (elapsed >= 0) {
        const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const s = (elapsed % 60).toString().padStart(2, '0');
        this.timerElement.textContent = `${m}:${s}`;
      } else {
        this.timerElement.textContent = '00:00';
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; console.log("Timer stopped"); }
  }

  resetGame() {
    this.stopTimer();
    this.initializeGame(); // 會重置 board, emptyPos, shuffle, moves
    // 重置作弊狀態
    this.cheatCount = 0; this.cheatTimes = []; this.cheatEnabled = false;
    this.startTime = new Date(); // 確保重置開始時間
    // ui.js 會更新顯示和重置作弊按鈕視覺
    this.startTimer(); // 重新開始計時
  }

  // --- 新增/修改：高分榜儲存邏輯 ---
  saveHighScore() {
    const key = `${this.mode}-${this.imageIdentifier}-${this.size}`;
    console.log("儲存高分榜，Key:", key);
    const currentTimeStr = this.timerElement ? this.timerElement.textContent : '00:00';
    const isValidTime = /^\d{2,}:\d{2}$/.test(currentTimeStr);
    const finalTime = isValidTime ? currentTimeStr : '00:00';
    const currentMoves = this.moves;
    const highScores = StorageManager.getItem('puzzleHighScores', {});
    if (!Array.isArray(highScores[key])) highScores[key] = [];

    let levelName = '';
    if (this.mode === 'number') levelName = '數字模式';
    else if (this.imageIdentifier === 'custom') levelName = '自定義';
    else if (this.imageIdentifier === 'network') levelName = '網路圖片';
    // **修正：如果標識符包含路徑，只取文件名部分**
    else levelName = this.imageIdentifier.includes('/') ? this.imageIdentifier.substring(this.imageIdentifier.lastIndexOf('/') + 1) : (this.imageIdentifier || '未知圖片');

    const difficulty = `${this.size}x${this.size}`;
    const currentScore = { levelName, difficulty, time: finalTime, moves: currentMoves, cheatUsed: this.cheatCount > 0, cheatCount: this.cheatCount };
    let shouldAdd = highScores[key].length < 3 || highScores[key].some(existing => this.isNewHighScore(existing, currentScore));
    if (shouldAdd) {
      highScores[key].push(currentScore);
      highScores[key].sort((a, b) => {
        if (a.cheatUsed !== b.cheatUsed) return a.cheatUsed ? 1 : -1;
        const parseTime = (t) => { if(!t || !t.includes(':')) return Infinity; const p=t.split(':').map(Number); return (p[0]||0)*60+(p[1]||0); };
        const timeA = parseTime(a.time); const timeB = parseTime(b.time);
        if (timeA !== timeB) return timeA - timeB;
        return (a.moves || 0) - (b.moves || 0);
      });
      highScores[key] = highScores[key].slice(0, 3);
      StorageManager.setItem('puzzleHighScores', highScores);
      console.log("高分已儲存:", highScores[key]);
      return true;
    }
    console.log("當前分數未進入前三名");
    return false;
  }

  // 比較分數是否更好
  isNewHighScore(existingScore, newScore) {
    const parseTime = (t) => { if(!t || !t.includes(':')) return Infinity; const p=t.split(':').map(Number); return (p[0]||0)*60+(p[1]||0); };
    const timeExist = parseTime(existingScore.time); const timeNew = parseTime(newScore.time);
    const cheatExist = existingScore.cheatUsed || false; const cheatNew = newScore.cheatUsed || false;
    if (!cheatNew && cheatExist) return true;
    if (cheatNew === cheatExist) { if (timeNew < timeExist) return true; else if (timeNew === timeExist && (newScore.moves || 0) < (existingScore.moves || 0)) return true; }
    return false;
  }
  // --- 新增/修改結束 ---

  cheatSwap(row1, col1, row2, col2) {
    if (row1 < 0 || row1 >= this.size || col1 < 0 || col1 >= this.size || row2 < 0 || row2 >= this.size || col2 < 0 || col2 >= this.size) return false;
    if (row1 === row2 && col1 === col2) return false;
    const currentTime = new Date(); const elapsed = Math.floor((currentTime - this.startTime) / 1000); const timeLimit = 5 * 60;
    if (elapsed < timeLimit) { const remSec = timeLimit - elapsed; const remMin = Math.floor(remSec / 60); const remS = remSec % 60; alert(`作弊模式將在 ${remMin}分${remS}秒 後可用`); return false; }
    const value1 = this.board[row1][col1]; const value2 = this.board[row2][col2];
    if (value1 === 0 || value2 === 0) { alert('作弊模式不能交換空白方塊，請選擇其他方塊'); return false; }
    this.board[row1][col1] = value2; this.board[row2][col2] = value1;
    this.moves++; if(document.getElementById('moves')) document.getElementById('moves').textContent = this.moves; // 更新顯示
    this.cheatCount++; this.cheatTimes.push(new Date());
    // ui.js 中播放聲音
    return true;
  }

  getHint() {
    if (this.checkWin()) return null;
    const adjacentBlocks = this.getAdjacentBlocks(); if (adjacentBlocks.length === 0) return null;
    let bestMove = null; let minDistance = Infinity;
    const originalBoard = JSON.parse(JSON.stringify(this.board)); // 深拷貝
    const originalEmptyPos = { ...this.emptyPos };

    for (const move of adjacentBlocks) {
      const { row, col } = move;
      this.swapBlocks(row, col); // 模擬移動
      const currentDistance = this.calculateManhattanDistance();
      // 恢復狀態 - **關鍵**：必須正確恢復 board 和 emptyPos
      this.board = JSON.parse(JSON.stringify(originalBoard)); // 恢復 board
      this.emptyPos = { ...originalEmptyPos };               // 恢復 emptyPos

      if (currentDistance < minDistance) { minDistance = currentDistance; bestMove = move; }
    }
    return bestMove;
  }

  calculateManhattanDistance() {
    let totalDistance = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const value = this.board[r][c];
        if (value !== 0) {
          const targetRow = Math.floor((value - 1) / this.size); // value 從 1 開始
          const targetCol = (value - 1) % this.size;
          totalDistance += Math.abs(r - targetRow) + Math.abs(c - targetCol);
        }
      }
    }
    return totalDistance;
  }

  // evaluatePosition() - 可以移除，如果 getHint 使用 ManhattanDistance
}