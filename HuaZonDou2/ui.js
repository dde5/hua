// UI交互逻辑
document.addEventListener('DOMContentLoaded', () => {
  // 游戏设置变量
  let selectedMode = null;
  let selectedSize = null;
  let selectedImage = null;
  let gameInstance = null;
  
  // 预设图片
  const presetImages = [
    { name: '米奇老鼠', src: 'images/mickey.jpg' },
    { name: '唐老鸭', src: 'images/donald.jpg' },
    { name: '小熊维尼', src: 'images/pooh.jpg' },
    { name: '冰雪奇缘艾莎', src: 'images/elsa.jpg' },
    { name: '狮子王辛巴', src: 'images/simba.jpg' }
  ];
  
  // 初始化图片选择区域
  function initImageSelection() {
    const imageOptions = document.querySelector('.image-options');
    presetImages.forEach(image => {
      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.name;
      img.title = image.name;
      img.addEventListener('click', () => {
        document.querySelectorAll('.image-options img').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        selectedImage = image.src;
      });
      imageOptions.appendChild(img);
    });
  }
  
  // 初始化模式选择
  function initModeSelection() {
    document.getElementById('number-mode').addEventListener('click', () => {
      selectedMode = 'number';
      document.getElementById('image-selection').classList.add('hidden');
      highlightSelectedButton('number-mode');
    });
    
    document.getElementById('image-mode').addEventListener('click', () => {
      selectedMode = 'image';
      document.getElementById('image-selection').classList.remove('hidden');
      highlightSelectedButton('image-mode');
    });
  }
  
  // 高亮选中的按钮
  function highlightSelectedButton(id) {
    const buttons = document.querySelectorAll('.mode-options button, .size-options button');
    buttons.forEach(button => button.classList.remove('selected'));
    document.getElementById(id).classList.add('selected');
  }
  
  // 初始化尺寸选择
  function initSizeSelection() {
    const sizeButtons = document.querySelectorAll('.size-options button');
    sizeButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedSize = parseInt(button.dataset.size);
        highlightSelectedButton(button.id);
      });
    });
    
    // 自定义尺寸
    document.getElementById('custom-size-input').addEventListener('change', (e) => {
      const value = parseInt(e.target.value);
      if (value >= 3 && value <= 10) {
        selectedSize = value;
      } else {
        alert('请输入3到10之间的数字');
        e.target.value = 4;
      }
    });
  }
  
  // 初始化开始游戏按钮
  function initStartGameButton() {
    document.getElementById('start-game').addEventListener('click', () => {
      if (!selectedMode) {
        alert('请选择游戏模式');
        return;
      }
      
      if (!selectedSize) {
        selectedSize = parseInt(document.getElementById('custom-size-input').value);
      }
      
      if (selectedMode === 'image' && !selectedImage) {
        const customImage = document.getElementById('custom-image').files[0];
        if (customImage) {
          const reader = new FileReader();
          reader.onload = (e) => {
            startGame(e.target.result);
          };
          reader.readAsDataURL(customImage);
        } else {
          alert('请选择一张图片');
          return;
        }
      } else {
        startGame(selectedImage);
      }
    });
  }
  
  // 开始游戏
  function startGame(imageSource) {
    document.getElementById('game-setup').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');
    
    gameInstance = new PuzzleGame(selectedSize, selectedMode, imageSource);
    renderGameBoard();
    gameInstance.startTimer();
    
    // 加载最高分
    loadHighScores();
  }
  
  // 渲染游戏板
  function renderGameBoard() {
    const puzzleContainer = document.querySelector('.puzzle-container');
    puzzleContainer.innerHTML = '';
    puzzleContainer.style.gridTemplateColumns = `repeat(${selectedSize}, 1fr)`;
    
    for (let row = 0; row < selectedSize; row++) {
      for (let col = 0; col < selectedSize; col++) {
        const block = document.createElement('div');
        block.className = 'puzzle-block';
        
        const value = gameInstance.board[row][col];
        if (value === 0) {
          block.classList.add('empty');
        } else if (selectedMode === 'number') {
          block.textContent = value;
        } else {
          block.classList.add('image-block');
          // 设置背景图片位置 - 将整张图片切割成小块
          // 计算这个值对应的原始位置
          const originalCol = (value - 1) % selectedSize;
          const originalRow = Math.floor((value - 1) / selectedSize);
          
          // 计算精确的背景位置
          // 使用准确的百分比计算，确保每个方块显示的是图片的正确部分，没有重叠
          // 每个方块应该显示图片的 1/size 部分，所以位置应该是 0%, 100/size%, 200/size%, ...
          const bgPositionX = (originalCol * 100) / (selectedSize - 1);
          const bgPositionY = (originalRow * 100) / (selectedSize - 1);
          
          block.style.backgroundImage = `url(${gameInstance.imageSource})`;
          block.style.backgroundPosition = `${bgPositionX}% ${bgPositionY}%`;
          block.style.backgroundSize = `${selectedSize * 100}%`; // 设置背景尺寸为原图的N倍，确保每个方块只显示图片的一部分
        }
        
        block.addEventListener('click', () => {
          if (gameInstance.isAdjacent(row, col)) {
            gameInstance.moveBlock(row, col);
            updateGameStats();
            renderGameBoard();
            
            if (gameInstance.checkWin()) {
              gameComplete();
            }
          }
        });
        
        puzzleContainer.appendChild(block);
      }
    }
  }
  
  // 更新游戏统计
  function updateGameStats() {
    document.getElementById('moves').textContent = gameInstance.moves;
    // 时间更新由计时器处理
  }
  
  // 游戏完成
  function gameComplete() {
    gameInstance.stopTimer();
    
    document.getElementById('game-board').classList.add('hidden');
    document.getElementById('game-complete').classList.remove('hidden');
    
    document.getElementById('completion-time').textContent = document.getElementById('time').textContent;
    document.getElementById('completion-moves').textContent = gameInstance.moves;
    
    // 保存高分
    gameInstance.saveHighScore();
    
    // 初始化完成界面按钮
    document.getElementById('play-again').addEventListener('click', () => {
      document.getElementById('game-complete').classList.add('hidden');
      startGame(gameInstance.imageSource);
    });
    
    document.getElementById('back-to-menu').addEventListener('click', () => {
      document.getElementById('game-complete').classList.add('hidden');
      document.getElementById('game-setup').classList.remove('hidden');
      resetGameSettings();
    });
  }
  
  // 重置游戏设置
  function resetGameSettings() {
    selectedMode = null;
    selectedSize = null;
    selectedImage = null;
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('image-selection').classList.add('hidden');
  }
  
  // 加载最高分
  function loadHighScores() {
    const highScoresList = document.getElementById('high-scores-list');
    highScoresList.innerHTML = '';
    
    const scores = JSON.parse(localStorage.getItem('puzzleHighScores') || '{}');
    const key = `${selectedMode}-${selectedSize}`;
    const modeScores = scores[key] || { time: '无记录', moves: '无记录' };
    
    const timeScore = document.createElement('div');
    timeScore.innerHTML = `<strong>最短时间:</strong> ${modeScores.time}`;
    
    const movesScore = document.createElement('div');
    movesScore.innerHTML = `<strong>最少步数:</strong> ${modeScores.moves}`;
    
    highScoresList.appendChild(timeScore);
    highScoresList.appendChild(movesScore);
  }
  
  // 初始化游戏控制按钮
  function initGameControls() {
    document.getElementById('reset-game').addEventListener('click', () => {
      gameInstance.resetGame();
      renderGameBoard();
    });
    
    document.getElementById('new-game').addEventListener('click', () => {
      document.getElementById('game-board').classList.add('hidden');
      document.getElementById('game-setup').classList.remove('hidden');
      gameInstance.stopTimer();
      resetGameSettings();
    });
    
    // 添加提示按钮功能
    document.getElementById('hint-button').addEventListener('click', () => {
      const hintMove = gameInstance.getHint();
      if (hintMove) {
        // 高亮提示的方块
        highlightHintBlock(hintMove.row, hintMove.col);
      }
    });
  }
  
  // 高亮提示的方块
  function highlightHintBlock(row, col) {
    // 移除之前的提示高亮
    document.querySelectorAll('.puzzle-block').forEach(block => {
      block.classList.remove('hint');
    });
    
    // 计算方块索引
    const index = row * selectedSize + col;
    const blocks = document.querySelectorAll('.puzzle-block');
    
    if (blocks[index]) {
      blocks[index].classList.add('hint');
      
      // 3秒后移除高亮
      setTimeout(() => {
        blocks[index].classList.remove('hint');
      }, 3000);
    }
  }
  
  // 初始化自定义图片上传
  function initCustomImageUpload() {
    document.getElementById('custom-image').addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          selectedImage = event.target.result;
          
          // 显示预览
          const preview = document.createElement('img');
          preview.src = selectedImage;
          preview.alt = '自定义图片';
          preview.classList.add('selected');
          
          const imageOptions = document.querySelector('.image-options');
          document.querySelectorAll('.image-options img').forEach(img => img.classList.remove('selected'));
          
          // 移除之前的自定义图片预览
          const existingPreview = document.querySelector('.image-options .custom-preview');
          if (existingPreview) {
            imageOptions.removeChild(existingPreview);
          }
          
          preview.classList.add('custom-preview');
          imageOptions.appendChild(preview);
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }
  
  // 初始化所有UI组件
  function initUI() {
    initModeSelection();
    initImageSelection();
    initSizeSelection();
    initStartGameButton();
    initGameControls();
    initCustomImageUpload();
    
    // 添加CSS类
    document.querySelectorAll('.mode-options button, .size-options button').forEach(button => {
      button.classList.add('option-button');
    });
  }
  
  // 启动UI初始化
  initUI();
});