// game.js (完整修正版 - 增加洗牌次數)
class PuzzleGame {
  constructor(size, mode, imageSource, imageIdentifier) { // <-- imageSource is preprocessed DataURL or null
    if (!size || size < 3 || size > 10) {
        console.error(`無效的遊戲尺寸: ${size}, 將使用預設值 4`);
        size = 4;
    }
    this.size = size;
    this.mode = mode;
    this.imageSource = (mode === 'image' && imageSource) ? imageSource : null;
    this.imageIdentifier = imageIdentifier || '';

    this.moves = 0;
    this.startTime = null;
    this.timer = null;
    this.timerElement = document.getElementById('time');

    this.board = [];
    this.emptyPos = { row: this.size - 1, col: this.size - 1 };

    this.cheatCount = 0;
    this.cheatTimes = [];
    this.cheatEnabled = false;

    this.initializeGame();
    console.log(`遊戲實例已創建: ${this.size}x${this.size}, 模式: ${this.mode}, 標識符: '${this.imageIdentifier}'`);
  }

  initializeGame() {
    this.board = [];
    let value = 1;
    for (let row = 0; row < this.size; row++) {
      const rowArray = [];
      for (let col = 0; col < this.size; col++) {
         if (row === this.size - 1 && col === this.size - 1) rowArray.push(0);
         else rowArray.push(value++);
      }
      this.board.push(rowArray);
    }
    this.emptyPos = { row: this.size - 1, col: this.size - 1 };
    this.shuffleBoard();
  }

  shuffleBoard() {
    // **增加隨機移動次數**
    const shuffleMoves = Math.max(200, Math.pow(this.size, 4)); // <--- 增加次數 (e.g., size^4)
    let lastMoved = -1;
    console.log(`Shuffling with ${shuffleMoves} moves...`);

    for (let i = 0; i < shuffleMoves; i++) {
      const adjacent = this.getAdjacentBlocks();
      const possibleMoves = adjacent.filter(move => {
          const pieceValue = this.board[move.row][move.col];
          return pieceValue !== lastMoved;
      });

      let moveTarget;
      if (possibleMoves.length > 0) {
          const randomIndex = Math.floor(Math.random() * possibleMoves.length);
          moveTarget = possibleMoves[randomIndex];
      } else if (adjacent.length > 0) {
          // Allow moving back if it's the only option
          moveTarget = adjacent[0];
      } else {
          continue; // Should not happen if board is valid
      }

      lastMoved = this.board[moveTarget.row][moveTarget.col];
      this.swapBlocks(moveTarget.row, moveTarget.col);
    }
     console.log("Shuffling complete.");

    if (!this.isSolvable()) {
        console.warn("Generated puzzle is unsolvable, attempting to fix...");
        this.makeGameSolvable();
        if (!this.isSolvable()) {
            console.error("Failed to make the puzzle solvable after fix attempt. Re-shuffling.");
            // Avoid infinite loop by just initializing again (should shuffle differently)
            this.initializeGame();
        } else {
             console.log("Puzzle fixed to be solvable.");
        }
    }
  }

  getAdjacentBlocks() {
    const { row, col } = this.emptyPos;
    const adjacent = [];
    if (row > 0) adjacent.push({ row: row - 1, col });
    if (row < this.size - 1) adjacent.push({ row: row + 1, col });
    if (col > 0) adjacent.push({ row, col: col - 1 });
    if (col < this.size - 1) adjacent.push({ row, col: col + 1 });
    return adjacent;
  }

  swapBlocks(row, col) {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return;
    const targetValue = this.board[row][col];
    this.board[this.emptyPos.row][this.emptyPos.col] = targetValue;
    this.board[row][col] = 0;
    this.emptyPos = { row, col };
  }

  isSolvable() {
    const flatBoard = [];
    for (let r = 0; r < this.size; r++) { for (let c = 0; c < this.size; c++) { if (this.board[r][c] !== 0) flatBoard.push(this.board[r][c]); } }
    let inversions = 0;
    for (let i = 0; i < flatBoard.length; i++) { for (let j = i + 1; j < flatBoard.length; j++) { if (flatBoard[i] > flatBoard[j]) inversions++; } }
    if (this.size % 2 === 1) return inversions % 2 === 0;
    else { const emptyRowFromBottom = this.size - this.emptyPos.row; return (inversions + emptyRowFromBottom) % 2 === 0; }
  }

  makeGameSolvable() {
     let pos1 = null, pos2 = null;
     for (let r = 0; r < this.size; r++) { for (let c = 0; c < this.size; c++) { if (this.board[r][c] === 1) pos1 = { r, c }; if (this.board[r][c] === 2) pos2 = { r, c }; if (pos1 && pos2) break; } if (pos1 && pos2) break; }
     if (pos1 && pos2) {
         console.log("交換方塊 1 和 2 以修復可解性。");
         const temp = this.board[pos1.r][pos1.c]; this.board[pos1.r][pos1.c] = this.board[pos2.r][pos2.c]; this.board[pos2.r][pos2.c] = temp;
     } else {
          console.log("後備交換：交換第一行的前兩個非空方塊。");
          let first = null, second = null;
          for (let c = 0; c < this.size; c++) { if (this.board[0][c] !== 0) { if (first === null) first = c; else { second = c; break; } } }
          if (first !== null && second !== null) { const temp = this.board[0][first]; this.board[0][first] = this.board[0][second]; this.board[0][second] = temp; }
          else { console.error("無法找到兩個方塊進行交換以修復可解性。"); }
     }
     // Optional: Check solvability again after swap for debugging
     // console.log(`交換後可解性: ${this.isSolvable()}`);
  }

  isAdjacent(row, col) {
    const { row: emptyRow, col: emptyCol } = this.emptyPos;
    return (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1);
  }

  moveBlock(row, col) {
    if (this.isAdjacent(row, col)) {
      this.swapBlocks(row, col);
      this.moves++;
      // UI layer handles sound, render, stats update
      return true;
    }
    return false;
  }

  checkWin() {
    let expectedValue = 1;
    for (let row = 0; row < this.size; row++) { for (let col = 0; col < this.size; col++) { if (row === this.size - 1 && col === this.size - 1) { if (this.board[row][col] !== 0) return false; } else { if (this.board[row][col] !== expectedValue) return false; expectedValue++; } } }
    return true;
  }

  startTimer() {
    if (!this.timerElement) { console.error("計時器元素 'time' 未找到！"); return; }
    this.stopTimer();
    this.startTime = new Date();
    console.log("計時器啟動:", this.startTime);
    this.timerElement.textContent = '00:00';
    this.timer = setInterval(() => {
      const currentTime = new Date(); const start = this.startTime instanceof Date ? this.startTime : currentTime; const elapsedTime = Math.floor((currentTime - start) / 1000);
      if (elapsedTime >= 0) { const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0'); const seconds = (elapsedTime % 60).toString().padStart(2, '0'); this.timerElement.textContent = `${minutes}:${seconds}`; }
      else { this.timerElement.textContent = '00:00'; }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; console.log("計時器已停止"); }
  }

  resetGame() {
    this.stopTimer();
    this.initializeGame(); // Re-shuffle
    this.moves = 0;
    this.cheatCount = 0; this.cheatTimes = []; this.cheatEnabled = false;
    // UI layer should reset timer display
    this.startTimer(); // Restart timer with new startTime
  }

  // saveHighScore (與上次修正相同)
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
    else if (this.imageIdentifier === 'custom') levelName = '自定義圖片';
    else if (this.imageIdentifier === 'network') levelName = '網路圖片';
    else levelName = this.imageIdentifier || '未知圖片';
    const difficulty = `${this.size}x${this.size}`;
    const currentScore = { levelName, difficulty, time: finalTime, moves: currentMoves, cheatUsed: this.cheatCount > 0, cheatCount: this.cheatCount };
    let shouldAdd = highScores[key].length < 3 || highScores[key].some(existing => this.isNewHighScore(existing, currentScore));
    if (shouldAdd) {
      highScores[key].push(currentScore);
      highScores[key].sort((a, b) => {
        if (a.cheatUsed !== b.cheatUsed) return a.cheatUsed ? 1 : -1;
        const parseTimeToSeconds = (timeStr) => { if (!timeStr || !/^\d{2,}:\d{2}$/.test(timeStr)) return Infinity; const parts = timeStr.split(':').map(Number); return (parts[0] || 0) * 60 + (parts[1] || 0); };
        const aTimeSeconds = parseTimeToSeconds(a.time); const bTimeSeconds = parseTimeToSeconds(b.time);
        if (aTimeSeconds !== bTimeSeconds) return aTimeSeconds - bTimeSeconds;
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

  // isNewHighScore (與上次修正相同)
  isNewHighScore(existingScore, newScore) {
    const parseTimeToSeconds = (timeStr) => { if (!timeStr || !/^\d{2,}:\d{2}$/.test(timeStr)) return Infinity; const parts = timeStr.split(':').map(Number); return (parts[0] || 0) * 60 + (parts[1] || 0); };
    const existingTimeSeconds = parseTimeToSeconds(existingScore.time); const newTimeSeconds = parseTimeToSeconds(newScore.time);
    const existingCheatUsed = existingScore.cheatUsed || false; const newCheatUsed = newScore.cheatUsed || false;
    if (!newCheatUsed && existingCheatUsed) return true;
    if (newCheatUsed === existingCheatUsed) { if (newTimeSeconds < existingTimeSeconds) return true; else if (newTimeSeconds === existingTimeSeconds && (newScore.moves || 0) < (existingScore.moves || 0)) return true; }
    return false;
  }

  // cheatSwap (與上次修正相同)
  cheatSwap(row1, col1, row2, col2) {
    if (!this.cheatEnabled) { console.warn("嘗試在作弊模式禁用時進行交換 (內部檢查)"); return false; }
    if (row1 < 0 || row1 >= this.size || col1 < 0 || col1 >= this.size || row2 < 0 || row2 >= this.size || col2 < 0 || col2 >= this.size) { console.warn("作弊交換：無效的位置"); return false; }
    if (row1 === row2 && col1 === col2) { console.warn("作弊交換：選擇了相同的方塊"); return false; }
    const currentTime = new Date(); const startTime = this.startTime || currentTime; const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000); const timeLimit = 5 * 60;
    if (elapsedTimeInSeconds < timeLimit) { console.warn("作弊交換：時間限制未到 (內部檢查)"); this.cheatEnabled = false; return false; }
    const value1 = this.board[row1][col1]; const value2 = this.board[row2][col2];
    if (value1 === 0 || value2 === 0) { console.warn("作弊交換：不能選擇或交換空白方塊"); return false; }
    this.board[row1][col1] = value2; this.board[row2][col2] = value1;
    this.moves++; this.cheatCount++; this.cheatTimes.push(new Date());
    console.log("作弊交換成功:", `(${row1},${col1})[${value1}] <=> (${row2},${col2})[${value2}]`, "作弊次數:", this.cheatCount);
    // UI layer handles sound, render, stats update
    return true;
  }

  // getHint (與上次修正相同)
  getHint() {
    if (this.checkWin()) { console.log("提示：遊戲已完成！"); return null; }
    const adjacentBlocks = this.getAdjacentBlocks(); if (adjacentBlocks.length === 0) { console.log("提示：沒有可移動的方塊？(異常)"); return null; }
    let bestMove = null; let minDistance = Infinity;
    const originalEmptyPos = { row: this.emptyPos.row, col: this.emptyPos.col }; // Store original empty pos

    for (const move of adjacentBlocks) {
      const { row, col } = move;
      // Simulate move
      this.swapBlocks(row, col);
      const currentDistance = this.calculateManhattanDistance();
      // Undo move: the empty spot is now at {row, col}. The original empty spot is where the tile moved FROM. Swap that original empty spot tile.
      this.swapBlocks(originalEmptyPos.row, originalEmptyPos.col); // Swap back using the original empty position

      if (currentDistance < minDistance) { minDistance = currentDistance; bestMove = move; }
    }
    console.log("提示：建議移動方塊在", bestMove);
    return bestMove;
  }

  // calculateManhattanDistance (與上次修正相同)
  calculateManhattanDistance() {
    let totalDistance = 0;
    for (let r = 0; r < this.size; r++) { for (let c = 0; c < this.size; c++) { const value = this.board[r][c]; if (value !== 0) { const targetRow = Math.floor((value - 1) / this.size); const targetCol = (value - 1) % this.size; totalDistance += Math.abs(r - targetRow) + Math.abs(c - targetCol); } } }
    return totalDistance;
  }

} // End of PuzzleGame class