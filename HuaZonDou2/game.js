// 游戏核心逻辑
class PuzzleGame {
  constructor(size, mode, imageSource) {
    this.size = size;
    this.mode = mode; // 'number' 或 'image'
    this.imageSource = imageSource;
    this.moves = 0;
    this.startTime = null;
    this.timer = null;
    this.board = [];
    this.emptyPos = { row: size - 1, col: size - 1 };
    
    this.initializeGame();
  }
  
  initializeGame() {
    // 创建有序的游戏板
    this.board = [];
    let value = 1;
    
    for (let row = 0; row < this.size; row++) {
      const rowArray = [];
      for (let col = 0; col < this.size; col++) {
        if (row === this.size - 1 && col === this.size - 1) {
          rowArray.push(0); // 空白方块
        } else {
          rowArray.push(value++);
        }
      }
      this.board.push(rowArray);
    }
    
    // 随机打乱游戏板
    this.shuffleBoard();
    
    // 重置游戏状态
    this.moves = 0;
    document.getElementById('moves').textContent = '0';
  }
  
  shuffleBoard() {
    // 执行随机移动来打乱游戏板
    // 通常需要1000次以上的随机移动来确保充分打乱
    const moves = 1000 + Math.floor(Math.random() * 1000);
    
    for (let i = 0; i < moves; i++) {
      // 获取空白方块的相邻方块
      const adjacentBlocks = this.getAdjacentBlocks();
      
      if (adjacentBlocks.length > 0) {
        // 随机选择一个相邻方块进行移动
        const randomIndex = Math.floor(Math.random() * adjacentBlocks.length);
        const { row, col } = adjacentBlocks[randomIndex];
        
        // 交换位置
        this.swapBlocks(row, col);
      }
    }
    
    // 确保生成的谜题可解
    if (!this.isSolvable()) {
      // 如果不可解，交换任意两个非空方块
      this.makeGameSolvable();
    }
  }
  
  getAdjacentBlocks() {
    const { row, col } = this.emptyPos;
    const adjacent = [];
    
    // 上方方块
    if (row > 0) adjacent.push({ row: row - 1, col });
    // 下方方块
    if (row < this.size - 1) adjacent.push({ row: row + 1, col });
    // 左侧方块
    if (col > 0) adjacent.push({ row, col: col - 1 });
    // 右侧方块
    if (col < this.size - 1) adjacent.push({ row, col: col + 1 });
    
    return adjacent;
  }
  
  swapBlocks(row, col) {
    // 交换指定位置的方块与空白方块
    const temp = this.board[row][col];
    this.board[row][col] = 0;
    this.board[this.emptyPos.row][this.emptyPos.col] = temp;
    
    // 更新空白方块位置
    this.emptyPos = { row, col };
  }
  
  isSolvable() {
    // 检查当前游戏板是否可解
    // 对于N×N的游戏板，当N为奇数时，逆序数必须为偶数才可解
    // 当N为偶数时，逆序数+空白方块所在行数（从底部数）的奇偶性必须与初始状态相同才可解
    
    // 将二维数组转为一维数组，忽略空白方块
    const flatBoard = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] !== 0) {
          flatBoard.push(this.board[row][col]);
        }
      }
    }
    
    // 计算逆序数
    let inversions = 0;
    for (let i = 0; i < flatBoard.length; i++) {
      for (let j = i + 1; j < flatBoard.length; j++) {
        if (flatBoard[i] > flatBoard[j]) {
          inversions++;
        }
      }
    }
    
    // 根据游戏板尺寸判断是否可解
    if (this.size % 2 === 1) {
      // 奇数尺寸：逆序数必须为偶数
      return inversions % 2 === 0;
    } else {
      // 偶数尺寸：逆序数+空白方块所在行数（从底部数）的奇偶性必须为偶数
      const emptyRowFromBottom = this.size - this.emptyPos.row;
      return (inversions + emptyRowFromBottom) % 2 === 0;
    }
  }
  
  makeGameSolvable() {
    // 如果游戏不可解，交换任意两个非空方块使其可解
    if (this.board[0][0] !== 0 && this.board[0][1] !== 0) {
      // 交换左上角的两个方块
      const temp = this.board[0][0];
      this.board[0][0] = this.board[0][1];
      this.board[0][1] = temp;
    } else {
      // 如果左上角有空方块，交换右下角的两个方块
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
    // 检查指定位置的方块是否与空白方块相邻
    const { row: emptyRow, col: emptyCol } = this.emptyPos;
    
    // 水平或垂直相邻
    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  }
  
  moveBlock(row, col) {
    if (this.isAdjacent(row, col)) {
      // 交换方块
      this.swapBlocks(row, col);
      
      // 增加移动次数
      this.moves++;
      document.getElementById('moves').textContent = this.moves;
      
      return true;
    }
    return false;
  }
  
  checkWin() {
    // 检查游戏是否完成
    let value = 1;
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        // 最后一个位置应该是空白方块
        if (row === this.size - 1 && col === this.size - 1) {
          if (this.board[row][col] !== 0) {
            return false;
          }
        } else {
          // 其他位置应该是按顺序排列的数字
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
    // 停止当前计时器
    this.stopTimer();
    
    // 重新初始化游戏
    this.initializeGame();
    
    // 重新开始计时
    this.startTimer();
  }
  
  saveHighScore() {
    // 获取当前游戏模式和尺寸的键
    const key = `${this.mode}-${this.size}`;
    
    // 获取当前时间和移动次数
    const currentTime = this.timerElement.textContent;
    const currentMoves = this.moves;
    
    // 从本地存储中获取现有的高分记录
    const highScores = JSON.parse(localStorage.getItem('puzzleHighScores') || '{}');
    
    // 如果没有该模式和尺寸的记录，或者当前成绩更好，则更新记录
    if (!highScores[key] || this.isNewHighScore(highScores[key], currentTime, currentMoves)) {
      highScores[key] = {
        time: currentTime,
        moves: currentMoves
      };
      
      // 保存到本地存储
      localStorage.setItem('puzzleHighScores', JSON.stringify(highScores));
      
      return true;
    }
    
    return false;
  }
  
  isNewHighScore(existingScore, currentTime, currentMoves) {
    // 解析时间字符串为秒数
    const parseTimeToSeconds = (timeStr) => {
      const [minutes, seconds] = timeStr.split(':').map(Number);
      return minutes * 60 + seconds;
    };
    
    const existingTimeSeconds = parseTimeToSeconds(existingScore.time);
    const currentTimeSeconds = parseTimeToSeconds(currentTime);
    
    // 首先比较时间，如果时间相同则比较移动次数
    if (currentTimeSeconds < existingTimeSeconds) {
      return true;
    } else if (currentTimeSeconds === existingTimeSeconds && currentMoves < existingScore.moves) {
      return true;
    }
    
    return false;
  }
  
  getHint() {
    // 使用广度优先搜索找到最短路径到目标状态
    // 由于完整的解决方案可能需要大量计算，这里只提供下一步的提示
    
    // 检查是否已经完成
    if (this.checkWin()) {
      return null; // 已经完成，不需要提示
    }
    
    // 获取当前可移动的方块
    const adjacentBlocks = this.getAdjacentBlocks();
    
    // 评估每个可能的移动
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (const move of adjacentBlocks) {
      // 临时移动方块
      const { row, col } = move;
      const originalBoard = JSON.parse(JSON.stringify(this.board));
      const originalEmptyPos = {...this.emptyPos};
      
      // 执行移动
      this.swapBlocks(row, col);
      
      // 计算移动后的得分（曼哈顿距离）
      const score = this.evaluatePosition();
      
      // 恢复原始状态
      this.board = originalBoard;
      this.emptyPos = originalEmptyPos;
      
      // 更新最佳移动
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
  
  evaluatePosition() {
    // 使用曼哈顿距离评估当前位置
    // 曼哈顿距离越小，表示越接近目标状态
    let score = 0;
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const value = this.board[row][col];
        if (value !== 0) {
          // 计算当前位置与目标位置的曼哈顿距离
          const targetRow = Math.floor((value - 1) / this.size);
          const targetCol = (value - 1) % this.size;
          const distance = Math.abs(row - targetRow) + Math.abs(col - targetCol);
          
          // 距离越小，得分越高
          score -= distance;
        }
      }
    }
    
    return score;
  }
}