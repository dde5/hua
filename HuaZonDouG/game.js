// game.js (最終修正版 - 修改 saveHighScore 以處理檔名顯示)
class PuzzleGame {
  constructor(size, mode, imageSource) {
    this.size = size;
    this.mode = mode;
    this.imageSource = imageSource;
    this.moves = 0;
    this.startTime = null;
    this.timer = null;
    this.timerElement = document.getElementById('time');
    this.board = [];
    this.emptyPos = { row: size - 1, col: size - 1 };
    this.cheatCount = 0;
    this.cheatTimes = [];
    this.cheatEnabled = false;
    // imageIdentifier 會在 ui.js 的 startGame 中設置
    this.imageIdentifier = ''; // 初始化為空
    this.initializeGame();
  }

  // determineImageIdentifier 函數不再需要在 game.js 中，因為標識符由 ui.js 傳入
  /*
  determineImageIdentifier(imgSrc) { ... }
  */

  initializeGame() {
    this.board = [];
    let value = 1;
    this.emptyPos = { row: this.size - 1, col: this.size - 1 };
    for (let row = 0; row < this.size; row++) {
      const rowArray = [];
      for (let col = 0; col < this.size; col++) {
        if (row === this.size - 1 && col === this.size - 1) rowArray.push(0);
        else rowArray.push(value++);
      }
      this.board.push(rowArray);
    }
    this.shuffleBoard();
    this.moves = 0;
    if (this.timerElement) this.timerElement.textContent = '00:00';
    this.cheatCount = 0;
    this.cheatTimes = [];
    this.cheatEnabled = false;
    this.stopTimer();
    this.startTime = null;
  }

  shuffleBoard() {
    const totalTiles = this.size * this.size;
    let allTiles = Array.from({ length: totalTiles }, (_, i) => i);
    for (let i = totalTiles - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
    }
    this.board = [];
    let k = 0;
    for (let row = 0; row < this.size; row++) {
        const rowArray = [];
        for (let col = 0; col < this.size; col++) {
            const tileValue = allTiles[k];
            rowArray.push(tileValue);
            if (tileValue === 0) {
                this.emptyPos = { row, col };
            }
            k++;
        }
        this.board.push(rowArray);
    }
    if (!this.isSolvable()) {
      console.log("初始狀態不可解，嘗試修復...");
      this.makeGameSolvable();
      if (!this.isSolvable()) {
          console.error("無法修復為可解狀態！考慮重新生成。");
      } else {
          console.log("已修復為可解狀態。");
      }
    } else {
        console.log("初始狀態可解。");
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
    const targetValue = this.board[row][col];
    const oldEmptyRow = this.emptyPos.row;
    const oldEmptyCol = this.emptyPos.col;
    this.board[oldEmptyRow][oldEmptyCol] = targetValue;
    this.board[row][col] = 0;
    this.emptyPos = { row, col };
  }

  isSolvable() {
    const flatBoard = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] !== 0) {
          flatBoard.push(this.board[r][c]);
        }
      }
    }
    let inversions = 0;
    for (let i = 0; i < flatBoard.length; i++) {
      for (let j = i + 1; j < flatBoard.length; j++) {
        if (flatBoard[i] > flatBoard[j]) {
          inversions++;
        }
      }
    }
    if (this.size % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRowFromBottom = this.size - this.emptyPos.row;
      return (inversions % 2 === 0 && emptyRowFromBottom % 2 === 1) ||
             (inversions % 2 === 1 && emptyRowFromBottom % 2 === 0);
    }
  }

  makeGameSolvable() {
      let r1 = -1, c1 = -1, r2 = -1, c2 = -1;
      let found = 0;
      loop:
      for (let r = 0; r < this.size; r++) {
          for (let c = 0; c < this.size; c++) {
              if (this.board[r][c] !== 0) {
                  if (found === 0) { r1 = r; c1 = c; found++; }
                  else if (found === 1) { r2 = r; c2 = c; found++; break loop; }
              }
          }
      }
      if (found === 2) {
          console.log(`makeGameSolvable: 交換 (${r1},${c1})[${this.board[r1][c1]}] 和 (${r2},${c2})[${this.board[r2][c2]}]`);
          [this.board[r1][c1], this.board[r2][c2]] = [this.board[r2][c2], this.board[r1][c1]];
          let foundEmpty = false;
          for (let r = 0; r < this.size; r++) {
              for (let c = 0; c < this.size; c++) {
                  if (this.board[r][c] === 0) { this.emptyPos = { row: r, col: c }; foundEmpty = true; break; }
              } if (foundEmpty) break;
          }
      } else {
          console.warn("makeGameSolvable: 未找到兩個非空塊進行交換。");
      }
  }

  isAdjacent(row, col) {
    const { row: emptyRow, col: emptyCol } = this.emptyPos;
    return (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1);
  }

  moveBlock(row, col) {
    if (!this.isAdjacent(row, col)) {
      return false;
    }
    this.swapBlocks(row, col);
    this.moves++;
    return true;
  }

  checkWin() {
    let value = 1;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (r === this.size - 1 && c === this.size - 1) {
          if (this.board[r][c] !== 0) return false;
        } else {
          if (this.board[r][c] !== value++) return false;
        }
      }
    }
    return true;
  }

  startTimer() {
    if (!this.timerElement) { console.error("Timer element not found"); return; }
    this.stopTimer();
    this.startTime = new Date(); // 設置 startTime
    console.log("Timer started:", this.startTime);
    this.timerElement.textContent = '00:00';

    this.timer = setInterval(() => {
      const now = new Date();
      // --- 確保 startTime 存在再計算 ---
      if (!this.startTime) {
          this.stopTimer(); // 如果 startTime 不存在，停止計時器
          return;
      }
      // ---------------------------------
      const elapsed = Math.floor((now - this.startTime) / 1000);
      if (elapsed >= 0) {
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (this.timerElement) { this.timerElement.textContent = formattedTime; }
      } else {
        if (this.timerElement) { this.timerElement.textContent = '00:00'; }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("Timer stopped");
    }
  }

  resetGame() {
    this.stopTimer();
    this.initializeGame(); // 會重置 startTime 為 null
  }

  // --- 修改 saveHighScore: 處理檔名顯示 ---
  saveHighScore() {
    // 使用 gameInstance 上的 imageIdentifier
    const identifier = this.imageIdentifier || 'unknown';
    const key = `${this.mode}-${identifier}-${this.size}`;
    console.log("儲存高分榜，Key:", key);

    const currentTimeStr = this.timerElement ? this.timerElement.textContent : '00:00';
    const isValidTime = /^\d{2,}:\d{2}$/.test(currentTimeStr);
    const finalTime = isValidTime ? currentTimeStr : 'N/A';
    const currentMoves = this.moves;
    const highScores = StorageManager.getItem('puzzleHighScores', {});
    if (!Array.isArray(highScores[key])) { highScores[key] = []; }

    // --- 確定顯示名稱 (levelName) ---
    let levelName = '';
    const presetNames = presetImages.map(p => p.name); // 獲取所有預設圖片名稱

    if (this.mode === 'number') {
      levelName = '數字模式';
    } else if (identifier.startsWith('net_')) {
      // 嘗試從清理後的網路圖片標識符還原一點可讀性
      levelName = '網路: ' + identifier.substring(4).replace(/_/g, ' ').substring(0, 30); // 限制長度
    } else if (presetNames.includes(identifier)) {
      levelName = identifier; // 使用預設圖片名稱
    } else if (identifier === 'custom') { // 保留對舊數據或意外情況的處理
        levelName = '自定義(舊)';
    } else if (identifier === 'unknown') {
        levelName = '未知圖片';
    }
    else {
      // 認為是清理後的檔名，直接使用（或稍微美化）
      levelName = identifier.replace(/_/g, ' '); // 將底線換回空格顯示
    }
    // --------------------------------

    const difficulty = `${this.size}x${this.size}`;
    const currentScore = {
        levelName: levelName, // 使用新確定的 levelName
        difficulty: difficulty,
        time: finalTime,
        moves: currentMoves,
        cheatUsed: this.cheatCount > 0,
        cheatCount: this.cheatCount
    };

    let shouldAdd = highScores[key].length < 3 || highScores[key].some(existing => this.isNewHighScore(existing, currentScore));
    if (shouldAdd) {
      highScores[key].push(currentScore);
      highScores[key].sort((a, b) => {
        if (a.cheatUsed !== b.cheatUsed) { return a.cheatUsed ? 1 : -1; }
        const parseTime = (t) => { if (!t || typeof t !== 'string' || !t.includes(':')) return Infinity; const parts = t.split(':').map(Number); if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return Infinity; return parts[0] * 60 + parts[1]; };
        const timeA = parseTime(a.time); const timeB = parseTime(b.time);
        if (timeA !== timeB) { return timeA - timeB; }
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
  // --- 修改結束 ---

  isNewHighScore(existingScore, newScore) {
    const parseTime = (t) => { if (!t || typeof t !== 'string' || !t.includes(':')) return Infinity; const parts = t.split(':').map(Number); if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return Infinity; return parts[0] * 60 + parts[1]; };
    const timeExist = parseTime(existingScore.time); const timeNew = parseTime(newScore.time);
    const cheatExist = existingScore.cheatUsed || false; const cheatNew = newScore.cheatUsed || false;
    if (!cheatNew && cheatExist) return true;
    if (cheatNew === cheatExist) {
      if (timeNew < timeExist) return true;
      else if (timeNew === timeExist && (newScore.moves || 0) < (existingScore.moves || 0)) return true;
    }
    return false;
  }

  // cheatSwap: 返回 boolean
  cheatSwap(row1, col1, row2, col2) {
    if (row1 < 0 || row1 >= this.size || col1 < 0 || col1 >= this.size ||
        row2 < 0 || row2 >= this.size || col2 < 0 || col2 >= this.size) {
      console.warn("作弊交換：座標超出邊界");
      return false;
    }
    if (row1 === row2 && col1 === col2) {
      console.warn("作弊交換：不能交換同一個方塊");
      return false;
    }
    const currentTime = new Date();
    // --- 確保 startTime 存在 ---
    if (!this.startTime) {
        console.warn("作弊交換：計時器未啟動");
        return false;
    }
    // -------------------------
    const elapsed = Math.floor((currentTime - this.startTime) / 1000);
    const timeLimit = 5 * 60;
    if (this.cheatCount === 0 && elapsed < timeLimit) {
      const remainingSeconds = timeLimit - elapsed;
      const remMin = Math.floor(remainingSeconds / 60);
      const remS = remainingSeconds % 60;
      alert(`作弊模式將在 ${remMin}分${remS}秒 後可用`);
      return false;
    }
    const value1 = this.board[row1][col1];
    const value2 = this.board[row2][col2];
    if (value1 === 0 || value2 === 0) {
      alert('作弊模式不能交換空白方塊，請選擇其他方塊');
      return false;
    }
    this.board[row1][col1] = value2;
    this.board[row2][col2] = value1;
    this.moves++;
    if(document.getElementById('moves')) {
        document.getElementById('moves').textContent = this.moves;
    }
    this.cheatCount++;
    this.cheatTimes.push(new Date());
    console.log(`作弊交換成功: (${row1},${col1})[${value2}] <-> (${row2},${col2})[${value1}]. 作弊次數: ${this.cheatCount}`);
    return true; // 交換成功
  }

  getHint() {
    if (this.checkWin()) return null;
    const adjacentBlocks = this.getAdjacentBlocks();
    if (adjacentBlocks.length === 0) return null;
    let bestMove = null;
    let minDistance = Infinity;
    const originalBoard = JSON.parse(JSON.stringify(this.board));
    const originalEmptyPos = { ...this.emptyPos };

    for (const move of adjacentBlocks) {
      const { row, col } = move;
      // 模擬內部狀態變化
      const tempValue = this.board[row][col];
      this.board[this.emptyPos.row][this.emptyPos.col] = tempValue;
      this.board[row][col] = 0;
      const tempEmptyPos = { ...this.emptyPos };
      this.emptyPos = { row, col };

      const currentDistance = this.calculateManhattanDistance();

      // 恢復內部狀態
      this.board[row][col] = tempValue;
      this.board[tempEmptyPos.row][tempEmptyPos.col] = 0;
      this.emptyPos = { ...tempEmptyPos };

      if (currentDistance < minDistance) {
        minDistance = currentDistance;
        bestMove = move;
      }
    }
    return bestMove;
  }

  calculateManhattanDistance() {
    let totalDistance = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const value = this.board[r][c];
        if (value !== 0) {
          const targetRow = Math.floor((value - 1) / this.size);
          const targetCol = (value - 1) % this.size;
          totalDistance += Math.abs(r - targetRow) + Math.abs(c - targetCol);
        }
      }
    }
    return totalDistance;
  }
}