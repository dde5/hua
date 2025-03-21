// UI交互逻辑
document.addEventListener('DOMContentLoaded', () => {
  // 游戏设置变量
  let selectedMode = null;
  let selectedSize = null;
  let selectedImage = null;
  let gameInstance = null;
  
  // 预设图片
  const presetImages = [
    { name: '米老鼠', src: 'images/mickey.jpg' },
    { name: '唐老鴨', src: 'images/donald.jpg' },
    { name: '小熊維尼', src: 'images/pooh.jpg' },
    { name: '愛紗', src: 'images/elsa.jpg' },
    { name: '辛巴', src: 'images/simba.jpg' }
  ];
  
  // 处理后的预设图片
  let processedPresetImages = [];
  
  // 初始化图片选择区域
  async function initImageSelection() {
    const imageOptions = document.querySelector('.image-options');
    
    // 预处理所有预设图片
    processedPresetImages = await preprocessPresetImages(presetImages);
    
    processedPresetImages.forEach(image => {
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
        alert('請輸入3~10中間數字');
        e.target.value = 4;
      }
    });
  }
  
  // 初始化开始游戏按钮
  function initStartGameButton() {
    document.getElementById('start-game').addEventListener('click', () => {
      if (!selectedMode) {
        alert('請選擇遊戲模式');
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
          alert('請選擇一張圖片');
          return;
        }
      } else {
        startGame(selectedImage);
      }
    });
  }
  
  // 开始游戏
  async function startGame(imageSource) {
    document.getElementById('game-setup').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');
    
    // 确保图片已经过预处理
    try {
      // 如果是自定义上传的图片，它已经在上传时预处理过了
      // 如果是预设图片，确保使用处理后的版本
      if (selectedMode === 'image' && imageSource) {
        // 查找是否是预设图片中的一个
        const isPreset = presetImages.some(img => img.src === imageSource);
        
        if (isPreset) {
          // 找到对应的处理后的图片
          const processedImage = processedPresetImages.find(img => {
            const originalSrc = presetImages.find(original => original.name === img.name)?.src;
            return originalSrc === imageSource;
          });
          
          if (processedImage) {
            imageSource = processedImage.src;
          } else {
            // 如果找不到处理后的图片，重新处理一次
            imageSource = await preprocessImage(imageSource, selectedSize);
          }
        }
      }
      
      gameInstance = new PuzzleGame(selectedSize, selectedMode, imageSource);
      renderGameBoard();
      gameInstance.startTimer();
      
      // 加载最高分
      loadHighScores();
    } catch (error) {
      console.error('遊戲初始化失敗:', error);
      alert('遊戲初始化失敗，請重試');
      document.getElementById('game-board').classList.add('hidden');
      document.getElementById('game-setup').classList.remove('hidden');
    }
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
          // 使用更精确的计算方法，确保每个方块显示的是图片的正确部分，没有重叠
          // 每个方块应该显示图片的 1/size 部分
          
          // 使用clip方法解决图片重叠问题
          // 每个方块只显示图片的一个特定部分
          
          // 创建一个包含图片的容器
          block.style.position = 'relative';
          block.style.overflow = 'hidden';
          
          // 创建一个内部容器来放置完整图片
          const imgContainer = document.createElement('div');
          imgContainer.style.position = 'absolute';
          imgContainer.style.width = `${selectedSize * 100}%`;
          imgContainer.style.height = `${selectedSize * 100}%`;
          imgContainer.style.backgroundImage = `url(${gameInstance.imageSource})`;
          imgContainer.style.backgroundSize = 'cover';
          imgContainer.style.backgroundRepeat = 'no-repeat';
          
          // 计算偏移量，使图片的正确部分显示在方块中
          const offsetX = -originalCol * 100;
          const offsetY = -originalRow * 100;
          
          // 设置偏移量，将图片的正确部分定位到方块中
          imgContainer.style.left = `${offsetX}%`;
          imgContainer.style.top = `${offsetY}%`;
          
          // 添加图片容器到方块中
          block.appendChild(imgContainer);
          
          // 添加边框以便于区分各个方块
          block.style.boxSizing = 'border-box';
          block.style.border = '1px solid rgba(255,255,255,0.2)';
          block.style.backgroundRepeat = 'no-repeat'; // 确保背景不重复
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
    const modeScores = scores[key] || { time: '無紀錄', moves: '無紀錄' };
    
    const timeScore = document.createElement('div');
    timeScore.innerHTML = `<strong>最短時間:</strong> ${modeScores.time}`;
    
    const movesScore = document.createElement('div');
    movesScore.innerHTML = `<strong>最少步數:</strong> ${modeScores.moves}`;
    
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
        reader.onload = async (event) => {
          // 预处理上传的图片
          try {
            // 使用当前选择的尺寸或默认尺寸4进行预处理
            const size = selectedSize || 4;
            const processedImage = await preprocessImage(event.target.result, size);
            selectedImage = processedImage;
            
            // 显示预览
            const preview = document.createElement('img');
            preview.src = selectedImage;
            preview.alt = '自定義圖片';
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
          } catch (error) {
            console.error('處理圖片失敗:', error);
            alert('處理圖片失敗，請嘗試其他圖片');
          }
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