// game.js (完整 - 與前次相同，增加洗牌次數版本)
class PuzzleGame {
  constructor(size, mode, imageSource, imageIdentifier) { // imageSource is original path or raw DataURL
    if (!size || size < 3 || size > 10) { size = 4; }
    this.size = size;
    this.mode = mode;
    this.imageSource = (mode === 'image' && imageSource) ? imageSource : null;
    this.imageIdentifier = imageIdentifier || '';
    this.moves = 0; this.startTime = null; this.timer = null;
    this.timerElement = document.getElementById('time');
    this.board = []; this.emptyPos = { row: this.size - 1, col: this.size - 1 };
    this.cheatCount = 0; this.cheatTimes = []; this.cheatEnabled = false;
    this.initializeGame();
    console.log(`遊戲實例已創建: ${this.size}x${this.size}, 模式: ${this.mode}, 標識符: '${this.imageIdentifier}'`);
  }

  initializeGame() {
    this.board = []; let value = 1;
    for (let r=0; r<this.size; r++){ const row=[]; for(let c=0; c<this.size; c++){ if(r===this.size-1 && c===this.size-1)row.push(0); else row.push(value++);} this.board.push(row);}
    this.emptyPos = { row: this.size - 1, col: this.size - 1 };
    this.shuffleBoard();
  }

  shuffleBoard() {
    const shuffleMoves = Math.max(200, Math.pow(this.size, 4)); // Increased moves
    let lastMoved = -1; console.log(`Shuffling with ${shuffleMoves} moves...`);
    for (let i = 0; i < shuffleMoves; i++) {
      const adjacent = this.getAdjacentBlocks();
      const possibleMoves = adjacent.filter(m => this.board[m.row][m.col] !== lastMoved);
      let moveTarget = (possibleMoves.length > 0) ? possibleMoves[Math.floor(Math.random() * possibleMoves.length)] : (adjacent.length > 0 ? adjacent[0] : null);
      if (!moveTarget) continue;
      lastMoved = this.board[moveTarget.row][moveTarget.col]; this.swapBlocks(moveTarget.row, moveTarget.col);
    }
    console.log("Shuffling complete.");
    if (!this.isSolvable()) { console.warn("Generated puzzle unsolvable, fixing..."); this.makeGameSolvable(); if (!this.isSolvable()) { console.error("Fix failed. Re-shuffling."); this.initializeGame(); } else { console.log("Puzzle fixed."); } }
  }

  getAdjacentBlocks() { const {row,col}=this.emptyPos; const adj=[]; if(row>0)adj.push({row:row-1,col}); if(row<this.size-1)adj.push({row:row+1,col}); if(col>0)adj.push({row,col:col-1}); if(col<this.size-1)adj.push({row,col:col+1}); return adj; }
  swapBlocks(row, col) { if(row<0||row>=this.size||col<0||col>=this.size)return; const val=this.board[row][col]; this.board[this.emptyPos.row][this.emptyPos.col]=val; this.board[row][col]=0; this.emptyPos={row,col}; }
  isSolvable() { const flat=[]; for(let r=0;r<this.size;r++)for(let c=0;c<this.size;c++)if(this.board[r][c]!==0)flat.push(this.board[r][c]); let inv=0; for(let i=0;i<flat.length;i++)for(let j=i+1;j<flat.length;j++)if(flat[i]>flat[j])inv++; if(this.size%2===1)return inv%2===0; else {const emptyRowFromBottom=this.size-this.emptyPos.row; return(inv+emptyRowFromBottom)%2===0;} }
  makeGameSolvable() { let p1=null,p2=null; for(let r=0;r<this.size;r++)for(let c=0;c<this.size;c++){if(this.board[r][c]===1)p1={r,c};if(this.board[r][c]===2)p2={r,c};if(p1&&p2)break;} if(p1&&p2){console.log("Swapping 1 & 2"); const t=this.board[p1.r][p1.c]; this.board[p1.r][p1.c]=this.board[p2.r][p2.c]; this.board[p2.r][p2.c]=t;} else {console.log("Fallback swap"); let f=null,s=null; for(let c=0;c<this.size;c++)if(this.board[0][c]!==0){if(f===null)f=c;else{s=c;break;}} if(f!==null&&s!==null){const t=this.board[0][f];this.board[0][f]=this.board[0][s];this.board[0][s]=t;}else{console.error("Cannot find tiles to swap.");}} }
  isAdjacent(row, col) { const {row:er,col:ec}=this.emptyPos; return(Math.abs(row-er)+Math.abs(col-ec)===1); }
  moveBlock(row, col) { if(this.isAdjacent(row,col)){this.swapBlocks(row,col);this.moves++;return true;}return false; }
  checkWin() { let exp=1; for(let r=0;r<this.size;r++)for(let c=0;c<this.size;c++){if(r===this.size-1&&c===this.size-1){if(this.board[r][c]!==0)return false;}else{if(this.board[r][c]!==exp)return false;exp++;}}return true; }
  startTimer() { if(!this.timerElement){console.error("Timer element not found"); return;} this.stopTimer(); this.startTime=new Date(); console.log("Timer started:", this.startTime); this.timerElement.textContent='00:00'; this.timer=setInterval(()=>{const now=new Date(); const start=this.startTime instanceof Date?this.startTime:now; const elapsed=Math.floor((now-start)/1000); if(elapsed>=0){const m=Math.floor(elapsed/60).toString().padStart(2,'0'); const s=(elapsed%60).toString().padStart(2,'0'); this.timerElement.textContent=`${m}:${s}`;}else{this.timerElement.textContent='00:00';}},1000); }
  stopTimer() { if(this.timer){clearInterval(this.timer);this.timer=null;console.log("Timer stopped");} }
  resetGame() { this.stopTimer(); this.initializeGame(); this.moves=0; this.cheatCount=0; this.cheatTimes=[]; this.cheatEnabled=false; this.startTimer(); }

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