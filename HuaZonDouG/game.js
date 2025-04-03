// game.js (最終修正版 - 接收並儲存 levelName)
class PuzzleGame {
  // --- 修改 constructor: 接收 identifier 和 displayName ---
  constructor(size, mode, imageSource, identifier, displayName) {
    this.size = size;
    this.mode = mode;
    this.imageSource = imageSource; // 可能是原始路徑或處理過的 DataURL
    this.moves = 0;
    this.startTime = null;
    this.timer = null;
    this.timerElement = document.getElementById('time');
    this.board = [];
    this.emptyPos = { row: size - 1, col: size - 1 };
    this.cheatCount = 0;
    this.cheatTimes = [];
    this.cheatEnabled = false;

    // --- 直接使用傳入的值 ---
    this.imageIdentifier = identifier !== undefined ? identifier : this.determineImageIdentifierFallback(imageSource);
    this.imageDisplayName = displayName !== undefined ? displayName : this.determineDisplayNameFallback(this.imageIdentifier);
    // -----------------------

    console.log(`Game Instance Created: ID='${this.imageIdentifier}', Name='${this.imageDisplayName}'`);
    this.initializeGame();
  }
  // --- 修改結束 ---

  // 保留 Fallback 函數以防萬一，但正常流程不應調用它們
  determineImageIdentifierFallback(imgSrc) { /* ...保持原樣... */
    if (this.mode === 'number') { return ''; }
    if (!imgSrc) { return 'unknown'; }
    if (imgSrc.startsWith('data:')) { return 'custom_fallback'; } // Fallback ID
    if (imgSrc.startsWith('http')) { return 'network_fallback'; }
    const match = imgSrc.match(/images\/([^./]+)\.[^.]+$/i);
    if (match && match[1]) { return match[1]; }
    return 'unknown';
  }
  determineDisplayNameFallback(identifier) { /* ...簡單的 fallback ... */
      if (identifier === '') return '數字模式';
      if (identifier.startsWith('custom_')) return '自定義圖片';
      if (identifier.startsWith('net_')) return '網路圖片';
      return identifier || '未知關卡';
  }


  initializeGame() { /* ...保持原樣... */
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

  shuffleBoard() { /* ...保持原樣... */
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
            if (tileValue === 0) { this.emptyPos = { row, col }; }
            k++;
        }
        this.board.push(rowArray);
    }
    if (!this.isSolvable()) {
      console.log("初始狀態不可解，嘗試修復...");
      this.makeGameSolvable();
      if (!this.isSolvable()) { console.error("無法修復為可解狀態！"); }
      else { console.log("已修復為可解狀態。"); }
    } else { console.log("初始狀態可解。"); }
  }

  getAdjacentBlocks() { /* ...保持原樣... */
    const { row, col } = this.emptyPos; const adjacent = [];
    if (row > 0) adjacent.push({ row: row - 1, col });
    if (row < this.size - 1) adjacent.push({ row: row + 1, col });
    if (col > 0) adjacent.push({ row, col: col - 1 });
    if (col < this.size - 1) adjacent.push({ row, col: col + 1 });
    return adjacent;
   }

  swapBlocks(row, col) { /* ...保持原樣... */
    const targetValue = this.board[row][col];
    const oldEmptyRow = this.emptyPos.row;
    const oldEmptyCol = this.emptyPos.col;
    this.board[oldEmptyRow][oldEmptyCol] = targetValue;
    this.board[row][col] = 0;
    this.emptyPos = { row, col };
   }

  isSolvable() { /* ...保持原樣... */
    const flatBoard = [];
    for (let r = 0; r < this.size; r++) { for (let c = 0; c < this.size; c++) { if (this.board[r][c] !== 0) { flatBoard.push(this.board[r][c]); } } }
    let inversions = 0;
    for (let i = 0; i < flatBoard.length; i++) { for (let j = i + 1; j < flatBoard.length; j++) { if (flatBoard[i] > flatBoard[j]) { inversions++; } } }
    if (this.size % 2 === 1) { return inversions % 2 === 0; }
    else { const emptyRowFromBottom = this.size - this.emptyPos.row; return (inversions % 2 === 0 && emptyRowFromBottom % 2 === 1) || (inversions % 2 === 1 && emptyRowFromBottom % 2 === 0); }
   }

  makeGameSolvable() { /* ...保持原樣... */
    let r1 = -1, c1 = -1, r2 = -1, c2 = -1; let found = 0;
    loop: for (let r = 0; r < this.size; r++) { for (let c = 0; c < this.size; c++) { if (this.board[r][c] !== 0) { if (found === 0) { r1 = r; c1 = c; found++; } else if (found === 1) { r2 = r; c2 = c; found++; break loop; } } } }
    if (found === 2) { console.log(`makeGameSolvable: 交換 (${r1},${c1})[${this.board[r1][c1]}] 和 (${r2},${c2})[${this.board[r2][c2]}]`); [this.board[r1][c1], this.board[r2][c2]] = [this.board[r2][c2], this.board[r1][c1]]; let foundEmpty = false; for (let r = 0; r < this.size; r++) { for (let c = 0; c < this.size; c++) { if (this.board[r][c] === 0) { this.emptyPos = { row: r, col: c }; foundEmpty = true; break; } } if (foundEmpty) break; } }
    else { console.warn("makeGameSolvable: 未找到兩個非空塊進行交換。"); }
   }

  isAdjacent(row, col) { /* ...保持原樣... */
    const { row: emptyRow, col: emptyCol } = this.emptyPos;
    return (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1);
   }

  moveBlock(row, col) { /* ...保持原樣... */
    if (!this.isAdjacent(row, col)) { return false; }
    this.swapBlocks(row, col);
    this.moves++;
    return true;
   }

  checkWin() { /* ...保持原樣... */
    let value = 1;
    for (let r = 0; r < this.size; r++) { for (let c = 0; c < this.size; c++) { if (r === this.size - 1 && c === this.size - 1) { if (this.board[r][c] !== 0) return false; } else { if (this.board[r][c] !== value++) return false; } } }
    return true;
   }

  startTimer() { /* ...保持原樣... */
    if (!this.timerElement) { console.error("Timer element not found"); return; }
    this.stopTimer();
    this.startTime = new Date();
    console.log("Timer started:", this.startTime);
    this.timerElement.textContent = '00:00';
    this.timer = setInterval(() => { const now = new Date(); const start = this.startTime instanceof Date ? this.startTime : now; const elapsed = Math.floor((now - start) / 1000); if (elapsed >= 0) { const minutes = Math.floor(elapsed / 60); const seconds = elapsed % 60; const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; if (this.timerElement) { this.timerElement.textContent = formattedTime; } } else { if (this.timerElement) { this.timerElement.textContent = '00:00'; } } }, 1000);
   }

  stopTimer() { /* ...保持原樣... */
    if (this.timer) { clearInterval(this.timer); this.timer = null; console.log("Timer stopped"); }
   }

  resetGame() { /* ...保持原樣... */
    this.stopTimer();
    this.initializeGame();
   }

  // --- 修改 saveHighScore: 使用 this.imageDisplayName ---
  saveHighScore() {
    const key = `${this.mode}-${this.imageIdentifier}-${this.size}`; // 使用標識符作為 key
    console.log("儲存高分榜，Key:", key, "DisplayName:", this.imageDisplayName);
    const currentTimeStr = this.timerElement ? this.timerElement.textContent : '00:00';
    const isValidTime = /^\d{2,}:\d{2}$/.test(currentTimeStr);
    const finalTime = isValidTime ? currentTimeStr : 'N/A';
    const currentMoves = this.moves;
    const highScores = StorageManager.getItem('puzzleHighScores', {});
    if (!Array.isArray(highScores[key])) { highScores[key] = []; }

    // --- 使用 this.imageDisplayName 作為 levelName ---
    const levelName = this.imageDisplayName || '未知關卡';
    // ---------------------------------------------
    const difficulty = `${this.size}x${this.size}`;
    const currentScore = {
        levelName: levelName, // 存儲用於顯示的名稱
        difficulty: difficulty,
        time: finalTime,
        moves: currentMoves,
        cheatUsed: this.cheatCount > 0,
        cheatCount: this.cheatCount
        // 可以考慮也存儲 imageIdentifier 以便調試，但非必需
        // identifier: this.imageIdentifier
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

  isNewHighScore(existingScore, newScore) { /* ...保持原樣... */
    const parseTime = (t) => { if (!t || typeof t !== 'string' || !t.includes(':')) return Infinity; const parts = t.split(':').map(Number); if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return Infinity; return parts[0] * 60 + parts[1]; };
    const timeExist = parseTime(existingScore.time); const timeNew = parseTime(newScore.time);
    const cheatExist = existingScore.cheatUsed || false; const cheatNew = newScore.cheatUsed || false;
    if (!cheatNew && cheatExist) return true;
    if (cheatNew === cheatExist) { if (timeNew < timeExist) return true; else if (timeNew === timeExist && (newScore.moves || 0) < (existingScore.moves || 0)) return true; }
    return false;
   }

  cheatSwap(row1, col1, row2, col2) { /* ...保持原樣 (返回 boolean)... */
    if (row1 < 0 || row1 >= this.size || col1 < 0 || col1 >= this.size || row2 < 0 || row2 >= this.size || col2 < 0 || col2 >= this.size) { console.warn("作弊交換：座標超出邊界"); return false; }
    if (row1 === row2 && col1 === col2) { console.warn("作弊交換：不能交換同一個方塊"); return false; }
    const currentTime = new Date(); const start = this.startTime instanceof Date ? this.startTime : currentTime; const elapsed = Math.floor((currentTime - start) / 1000); const timeLimit = 5 * 60;
    if (this.cheatCount === 0 && elapsed < timeLimit) { const remainingSeconds = timeLimit - elapsed; const remMin = Math.floor(remainingSeconds / 60); const remS = remainingSeconds % 60; alert(`作弊模式將在 ${remMin}分${remS}秒 後可用`); return false; }
    const value1 = this.board[row1][col1]; const value2 = this.board[row2][col2];
    if (value1 === 0 || value2 === 0) { alert('作弊模式不能交換空白方塊，請選擇其他方塊'); return false; }
    this.board[row1][col1] = value2; this.board[row2][col2] = value1;
    this.moves++; if(document.getElementById('moves')) { document.getElementById('moves').textContent = this.moves; }
    this.cheatCount++; this.cheatTimes.push(new Date()); console.log(`作弊交換成功: (${row1},${col1})[${value2}] <-> (${row2},${col2})[${value1}]. 作弊次數: ${this.cheatCount}`);
    return true;
   }

  getHint() { /* ...保持原樣... */
    if (this.checkWin()) return null;
    const adjacentBlocks = this.getAdjacentBlocks(); if (adjacentBlocks.length === 0) return null;
    let bestMove = null; let minDistance = Infinity;
    const originalBoard = JSON.parse(JSON.stringify(this.board)); const originalEmptyPos = { ...this.emptyPos };
    for (const move of adjacentBlocks) { const { row, col } = move; const tempValue = this.board[row][col]; this.board[this.emptyPos.row][this.emptyPos.col] = tempValue; this.board[row][col] = 0; const tempEmptyPos = { ...this.emptyPos }; this.emptyPos = { row, col }; const currentDistance = this.calculateManhattanDistance(); this.board[row][col] = tempValue; this.board[tempEmptyPos.row][tempEmptyPos.col] = 0; this.emptyPos = { ...tempEmptyPos }; if (currentDistance < minDistance) { minDistance = currentDistance; bestMove = move; } }
    return bestMove;
   }

  calculateManhattanDistance() { /* ...保持原樣... */
    let totalDistance = 0;
    for (let r = 0; r < this.size; r++) { for (let c = 0; c < this.size; c++) { const value = this.board[r][c]; if (value !== 0) { const targetRow = Math.floor((value - 1) / this.size); const targetCol = (value - 1) % this.size; totalDistance += Math.abs(r - targetRow) + Math.abs(c - targetCol); } } }
    return totalDistance;
   }
}