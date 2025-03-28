// 遊戲核心邏輯
class PuzzleGame {
  constructor(size, mode, imageSource, imageIdentifier) { // <-- 接收 imageIdentifier
    if (!size || size < 3 || size > 10) {
        console.error(`無效的遊戲尺寸: ${size}, 將使用預設值 4`);
        size = 4;
    }
    this.size = size;
    this.mode = mode; // 'number' 或 'image'
    // imageSource is expected to be null (number mode) or a preprocessed Data URL (image mode)
    this.imageSource = (mode === 'image' && imageSource) ? imageSource : null;
    this.imageIdentifier = imageIdentifier || ''; // <-- 存儲標識符 ('C1', 'custom', 'network', '')

    this.moves = 0;
    this.startTime = null; // Initialize as null, set in startTimer or resetGame
    this.timer = null;
    this.timerElement = document.getElementById('time'); // Cache the element

    this.board = [];
    this.emptyPos = { row: this.size - 1, col: this.size - 1 }; // Initial empty pos

    // 作弊模式相關屬性
    this.cheatCount = 0;
    this.cheatTimes = [];
    this.cheatEnabled = false; // 作弊模式初始為禁用

    this.initializeGame(); // Create and shuffle the board
    console.log(`遊戲實例已創建: ${this.size}x${this.size}, 模式: ${this.mode}, 標識符: '${this.imageIdentifier}'`);
  }

  initializeGame() {
    // 創建有序的遊戲板 (1 to size*size - 1, 0 for empty)
    this.board = [];
    let value = 1;
    for (let row = 0; row < this.size; row++) {
      const rowArray = [];
      for (let col = 0; col < this.size; col++) {
         // Place 0 at the last position
         if (row === this.size - 1 && col === this.size - 1) {
             rowArray.push(0);
         } else {
             rowArray.push(value++);
         }
      }
      this.board.push(rowArray);
    }
    // Set initial empty position correctly
    this.emptyPos = { row: this.size - 1, col: this.size - 1 };

    // 隨機打亂遊戲板
    this.shuffleBoard();

    // 重置遊戲狀態 (moves is reset separately in resetGame)
    // this.moves = 0; // Reset moves in resetGame or constructor call chain
  }

  shuffleBoard() {
    // Perform many random moves from the solved state to shuffle
    // Need enough moves for a good shuffle, e.g., size^3 or more
    const shuffleMoves = Math.max(100, Math.pow(this.size, 3) * 2); // Ensure sufficient moves
    let lastMoved = -1; // Prevent immediately moving back

    console.log(`Shuffling with ${shuffleMoves} moves...`);

    for (let i = 0; i < shuffleMoves; i++) {
      const adjacent = this.getAdjacentBlocks();
      const possibleMoves = adjacent.filter(move => {
          // Don't move the piece that was just moved back into the empty spot
          const pieceValue = this.board[move.row][move.col];
          return pieceValue !== lastMoved;
      });

      if (possibleMoves.length > 0) {
          const randomIndex = Math.floor(Math.random() * possibleMoves.length);
          const { row, col } = possibleMoves[randomIndex];
          lastMoved = this.board[row][col]; // Record the value of the piece being moved
          this.swapBlocks(row, col); // swapBlocks updates emptyPos
      } else if (adjacent.length > 0) {
          // If only one move possible (the one just made), allow it to prevent getting stuck
          const { row, col } = adjacent[0];
          lastMoved = this.board[row][col];
          this.swapBlocks(row, col);
      }
    }
     console.log("Shuffling complete.");

    // Ensure the generated puzzle is solvable
    if (!this.isSolvable()) {
        console.warn("Generated puzzle is unsolvable, attempting to fix...");
        this.makeGameSolvable();
        // Double-check after fixing
        if (!this.isSolvable()) {
            console.error("Failed to make the puzzle solvable. Resetting shuffle.");
            // Fallback: Re-initialize and shuffle again (could lead to infinite loop if issue persists)
            this.initializeGame(); // This will call shuffleBoard again
        } else {
             console.log("Puzzle fixed to be solvable.");
        }
    }
  }

  getAdjacentBlocks() {
    // Returns coordinates of blocks adjacent to the empty block
    const { row, col } = this.emptyPos;
    const adjacent = [];
    if (row > 0) adjacent.push({ row: row - 1, col }); // Up
    if (row < this.size - 1) adjacent.push({ row: row + 1, col }); // Down
    if (col > 0) adjacent.push({ row, col: col - 1 }); // Left
    if (col < this.size - 1) adjacent.push({ row, col: col + 1 }); // Right
    return adjacent;
  }

  swapBlocks(row, col) {
    // Swaps the block at (row, col) with the empty block
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return; // Bounds check

    const targetValue = this.board[row][col];
    // Put target value into the current empty position
    this.board[this.emptyPos.row][this.emptyPos.col] = targetValue;
    // Put 0 (empty) into the target position
    this.board[row][col] = 0;
    // Update the empty position
    this.emptyPos = { row, col };
  }

  isSolvable() {
    // Checks if the current board configuration is solvable.
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
      // Odd grid size: Solvable if the number of inversions is even.
      return inversions % 2 === 0;
    } else {
      // Even grid size: Solvable if (inversions + row of empty block from bottom) is even.
      // Row from bottom (1-based index): size - emptyPos.row
      const emptyRowFromBottom = this.size - this.emptyPos.row;
      return (inversions + emptyRowFromBottom) % 2 === 0;
    }
  }

  makeGameSolvable() {
    // If the puzzle is unsolvable, swap two non-empty tiles to change solvability.
    // Swapping any two non-empty tiles changes the inversion count by an odd number.
    // A simple strategy: swap tiles 1 and 2 if they exist and are not the empty tile.
     let pos1 = null, pos2 = null;
     for (let r = 0; r < this.size; r++) {
         for (let c = 0; c < this.size; c++) {
             if (this.board[r][c] === 1) pos1 = { r, c };
             if (this.board[r][c] === 2) pos2 = { r, c };
             if (pos1 && pos2) break;
         }
         if (pos1 && pos2) break;
     }

     if (pos1 && pos2) {
         console.log("Swapping tiles 1 and 2 to fix solvability.");
         const temp = this.board[pos1.r][pos1.c];
         this.board[pos1.r][pos1.c] = this.board[pos2.r][pos2.c];
         this.board[pos2.r][pos2.c] = temp;
     } else {
         // Fallback: swap first two non-empty tiles found in the top row
         console.log("Tiles 1/2 not found, swapping first two top-row tiles.");
          let first = null, second = null;
          for (let c = 0; c < this.size; c++) {
              if (this.board[0][c] !== 0) {
                  if (first === null) first = c;
                  else { second = c; break; }
              }
          }
          if (first !== null && second !== null) {
               const temp = this.board[0][first];
               this.board[0][first] = this.board[0][second];
               this.board[0][second] = temp;
          } else {
              console.error("Could not find two tiles to swap for solvability fix.");
              // This case should be rare after a proper shuffle.
          }
     }
  }

  isAdjacent(row, col) {
    // Checks if the block at (row, col) is adjacent to the empty block
    const { row: emptyRow, col: emptyCol } = this.emptyPos;
    return (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1);
  }

  moveBlock(row, col) {
    // Attempts to move the block at (row, col) into the empty space
    if (this.isAdjacent(row, col)) {
      this.swapBlocks(row, col); // Perform the swap
      this.moves++;
      // soundManager.playMoveSound(); // Sound played in UI layer after successful move
      // UI layer (ui.js) should call renderGameBoard and updateGameStats
      return true; // Move successful
    }
    return false; // Move invalid
  }

  checkWin() {
    // Checks if the board is in the solved state
    let expectedValue = 1;
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (row === this.size - 1 && col === this.size - 1) {
          // Last position should be empty (0)
          if (this.board[row][col] !== 0) return false;
        } else {
          // Other positions should match expected value
          if (this.board[row][col] !== expectedValue) return false;
          expectedValue++;
        }
      }
    }
    return true; // Board is solved
  }

  startTimer() {
    // Ensure timerElement is valid
    if (!this.timerElement) {
        console.error("計時器元素 'time' 未找到！無法啟動計時器。");
        return;
    }
    // Clear any existing timer
    this.stopTimer();
    // Set start time
    this.startTime = new Date();
    console.log("計時器啟動:", this.startTime);

    // Update timer display immediately
     this.timerElement.textContent = '00:00';

    // Start interval
    this.timer = setInterval(() => {
      const currentTime = new Date();
      // Use startTime if valid, otherwise default to prevent NaN
      const start = this.startTime instanceof Date ? this.startTime : currentTime;
      const elapsedTime = Math.floor((currentTime - start) / 1000); // in seconds

      if (elapsedTime >= 0) { // Ensure time is not negative
          const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
          const seconds = (elapsedTime % 60).toString().padStart(2, '0');
          this.timerElement.textContent = `${minutes}:${seconds}`;
      } else {
           this.timerElement.textContent = '00:00'; // Reset if time is invalid
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("計時器已停止");
    }
  }

  resetGame() {
    this.stopTimer();      // Stop current timer
    this.initializeGame(); // Re-create and shuffle board
    this.moves = 0;        // Reset move count
    this.cheatCount = 0;   // Reset cheat stats
    this.cheatTimes = [];
    this.cheatEnabled = false; // Disable cheat mode

    // Reset timer display (handled by UI layer calling updateGameStats after reset)
    // if (this.timerElement) this.timerElement.textContent = '00:00';

    // Restart timer
    this.startTimer();
  }

  // --- saveHighScore (修正版) ---
  saveHighScore() {
    // Use stored imageIdentifier for the key
    const key = `${this.mode}-${this.imageIdentifier}-${this.size}`;
    console.log("儲存高分榜，Key:", key); // Debugging

    // Get time from the timer element
    const currentTimeStr = this.timerElement ? this.timerElement.textContent : '00:00';
    // Validate time format (basic check)
    const isValidTime = /^\d{2,}:\d{2}$/.test(currentTimeStr);
    const finalTime = isValidTime ? currentTimeStr : '00:00';

    const currentMoves = this.moves;

    // Get existing scores from storage
    const highScores = StorageManager.getItem('puzzleHighScores', {});

    // Ensure array exists for the key
    if (!Array.isArray(highScores[key])) {
      highScores[key] = [];
    }

    // Determine Level Name and Difficulty string
    let levelName = '';
    if (this.mode === 'number') {
        levelName = '數字模式';
    } else if (this.imageIdentifier === 'custom') {
        levelName = '自定義圖片';
    } else if (this.imageIdentifier === 'network') {
        levelName = '網路圖片';
    } else {
        levelName = this.imageIdentifier || '未知圖片'; // Use identifier or fallback
    }
    const difficulty = `${this.size}x${this.size}`;

    // Create the new score object
    const currentScore = {
      levelName: levelName,         // Store readable level name
      difficulty: difficulty,       // Store difficulty string
      time: finalTime,              // Store validated time string
      moves: currentMoves,
      cheatUsed: this.cheatCount > 0,
      cheatCount: this.cheatCount,
      // cheatTimes: this.cheatTimes.map(time => time.toISOString()) // Optional: Store timestamps
    };

    // Check if the new score qualifies for the top 3
    let shouldAdd = highScores[key].length < 3 ||
                    highScores[key].some(existing => this.isNewHighScore(existing, currentScore));

    if (shouldAdd) {
      // Add the new score
      highScores[key].push(currentScore);

      // Sort the scores: No cheat > Less time > Fewer moves
      highScores[key].sort((a, b) => {
        // 1. Cheat status (non-cheaters first)
        if (a.cheatUsed !== b.cheatUsed) {
          return a.cheatUsed ? 1 : -1; // false (no cheat) comes first
        }

        // Helper to parse "MM:SS" to seconds
        const parseTimeToSeconds = (timeStr) => {
           if (!timeStr || !/^\d{2,}:\d{2}$/.test(timeStr)) return Infinity; // Handle invalid format
           const parts = timeStr.split(':').map(Number);
           return (parts[0] || 0) * 60 + (parts[1] || 0);
        };

        // 2. Time (less time is better)
        const aTimeSeconds = parseTimeToSeconds(a.time);
        const bTimeSeconds = parseTimeToSeconds(b.time);
        if (aTimeSeconds !== bTimeSeconds) {
          return aTimeSeconds - bTimeSeconds; // Smaller time comes first
        }

        // 3. Moves (fewer moves is better)
        return (a.moves || 0) - (b.moves || 0); // Smaller moves comes first
      });

      // Keep only the top 3 scores
      highScores[key] = highScores[key].slice(0, 3);

      // Save back to storage
      StorageManager.setItem('puzzleHighScores', highScores);
      console.log("高分已儲存:", highScores[key]); // Debugging
      return true;
    }

    console.log("當前分數未進入前三名");
    return false;
  }

  // --- isNewHighScore (修正版, 比較兩個分數物件) ---
  isNewHighScore(existingScore, newScore) {
    // Helper to parse "MM:SS" to seconds
    const parseTimeToSeconds = (timeStr) => {
        if (!timeStr || !/^\d{2,}:\d{2}$/.test(timeStr)) return Infinity;
        const parts = timeStr.split(':').map(Number);
        return (parts[0] || 0) * 60 + (parts[1] || 0);
    };

    const existingTimeSeconds = parseTimeToSeconds(existingScore.time);
    const newTimeSeconds = parseTimeToSeconds(newScore.time);

    const existingCheatUsed = existingScore.cheatUsed || false;
    const newCheatUsed = newScore.cheatUsed || false;

    // Priority 1: Non-cheat scores are always better than cheat scores
    if (!newCheatUsed && existingCheatUsed) {
      return true;
    }
    // If cheat status is the same, compare time and moves
    if (newCheatUsed === existingCheatUsed) {
      // Priority 2: Less time is better
      if (newTimeSeconds < existingTimeSeconds) {
        return true;
      }
      // Priority 3: If time is equal, fewer moves is better
      else if (newTimeSeconds === existingTimeSeconds && (newScore.moves || 0) < (existingScore.moves || 0)) {
        return true;
      }
    }

    // Otherwise, the new score is not better
    return false;
  }

  // --- cheatSwap (修正版) ---
  cheatSwap(row1, col1, row2, col2) {
    // 1. Check if cheat mode is actually enabled in the instance
    if (!this.cheatEnabled) {
        console.warn("嘗試在作弊模式禁用時進行交換 (內部檢查)");
        // Optionally alert the user via UI callback if needed
        return false;
    }

    // 2. Validate coordinates
    if (row1 < 0 || row1 >= this.size || col1 < 0 || col1 >= this.size ||
        row2 < 0 || row2 >= this.size || col2 < 0 || col2 >= this.size) {
      console.warn("作弊交換：無效的位置");
      return false;
    }

    // 3. Check if swapping the same block
    if (row1 === row2 && col1 === col2) {
       console.warn("作弊交換：選擇了相同的方塊");
       // No need to alert, just don't swap
      return false;
    }

    // 4. Check time limit (redundant check for safety)
    const currentTime = new Date();
    const startTime = this.startTime || currentTime;
    const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);
    const timeLimit = 5 * 60; // 5 minutes

    if (elapsedTimeInSeconds < timeLimit) {
      console.warn("作弊交換：時間限制未到 (內部檢查)");
      // Ensure cheat mode is disabled if attempted early
      this.cheatEnabled = false;
      // Let the UI layer handle the alert and button state update
      return false;
    }

    // 5. Check if trying to swap with the empty block (value 0)
    const value1 = this.board[row1][col1];
    const value2 = this.board[row2][col2];
    if (value1 === 0 || value2 === 0) {
      console.warn("作弊交換：不能選擇或交換空白方塊");
      // Alert is handled by UI layer based on return value
      return false; // Indicate swap failed
    }

    // 6. Perform the swap
    this.board[row1][col1] = value2;
    this.board[row2][col2] = value1;

    // 7. Update game state
    this.moves++;
    this.cheatCount++;
    this.cheatTimes.push(new Date()); // Record timestamp of cheat

    // soundManager.playCheatSound(); // Sound played in UI layer

    console.log("作弊交換成功:", `(${row1},${col1})[${value1}] <=> (${row2},${col2})[${value2}]`, "作弊次數:", this.cheatCount);
    // UI layer should call renderGameBoard and updateGameStats
    return true; // Indicate swap successful
  }

  getHint() {
    // Provides a hint for the next best move towards the solved state.
    // Uses Manhattan distance heuristic.

    if (this.checkWin()) {
      console.log("提示：遊戲已完成！");
      return null; // No hint needed if already solved
    }

    const adjacentBlocks = this.getAdjacentBlocks(); // Get possible moves
    if (adjacentBlocks.length === 0) {
        console.log("提示：沒有可移動的方塊？(異常)");
        return null; // Should not happen in a valid state
    }

    let bestMove = null;
    let minDistance = Infinity; // We want to minimize Manhattan distance

    // Simulate each possible move and evaluate the resulting board state
    for (const move of adjacentBlocks) {
      const { row, col } = move;

      // Temporarily make the move
      const valueToMove = this.board[row][col];
      this.swapBlocks(row, col);

      // Calculate the Manhattan distance of the new board state
      const currentDistance = this.calculateManhattanDistance();

      // Undo the move
      this.swapBlocks(this.emptyPos.row, this.emptyPos.col); // Swap back (original empty pos is where the value moved)
      // Need to find the moved piece to swap back correctly
      // Find where 'valueToMove' is now (should be at the original emptyPos)
      // Find where 0 is now (should be at 'move')
      // Let's redo the swap back carefully:
      // The empty spot is now at {row, col}. The moved piece is at original emptyPos.
      // Swap the piece at original emptyPos with the empty spot at {row, col}.
      const originalEmptyRow = this.emptyPos.row; // Capture before potential modification by swapBlocks
      const originalEmptyCol = this.emptyPos.col;
      // Swap back: (target row, target col) = (originalEmptyRow, originalEmptyCol)
      this.swapBlocks(originalEmptyRow, originalEmptyCol);


      // Check if this move leads to a state closer to the solution
      if (currentDistance < minDistance) {
        minDistance = currentDistance;
        bestMove = move; // Store the coordinates of the block TO CLICK
      }
    }

    console.log("提示：建議移動方塊在", bestMove);
    return bestMove; // Return the coordinates of the block to move
  }

  calculateManhattanDistance() {
    // Calculates the total Manhattan distance for the current board state.
    // Lower distance means closer to the solved state.
    let totalDistance = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const value = this.board[r][c];
        if (value !== 0) {
          // Calculate target position for this value
          const targetRow = Math.floor((value - 1) / this.size);
          const targetCol = (value - 1) % this.size;
          // Add distance for this tile
          totalDistance += Math.abs(r - targetRow) + Math.abs(c - targetCol);
        }
      }
    }
    return totalDistance;
  }

  // evaluatePosition() - Deprecated or unused, Manhattan distance is more standard
  // evaluatePosition() { ... }

} // End of PuzzleGame class