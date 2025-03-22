// UI互動邏輯
document.addEventListener('DOMContentLoaded', () => {
  // 遊戲設置變數
  let selectedMode = null;
  let selectedSize = null;
  let selectedImage = null;
  let selectedColor = 'default'; // 預設為暗灰條紋
  let gameInstance = null;
  
  // 預設圖片
  const presetImages = [
    { name: '米奇老鼠', src: 'images/mickey.jpg' },
    { name: '唐老鴨', src: 'images/donald.jpg' },
    { name: '小熊維尼', src: 'images/pooh.jpg' },
    { name: '冰雪奇緣艾莎', src: 'images/elsa.jpg' },
    { name: '獅子王辛巴', src: 'images/simba.jpg' }
  ];
  
  // 處理後的預設圖片
  let processedPresetImages = [];
  
  // 初始化圖片選擇區域
  async function initImageSelection() {
    const imageOptions = document.querySelector('.image-options');
    
    // 預處理所有預設圖片
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
  
  // 初始化模式選擇
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
  
  // 高亮選中的按鈕
  function highlightSelectedButton(id) {
    const buttons = document.querySelectorAll('.mode-options button, .size-options button');
    buttons.forEach(button => button.classList.remove('selected'));
    document.getElementById(id).classList.add('selected');
  }
  
  // 初始化尺寸選擇
  function initSizeSelection() {
    const sizeButtons = document.querySelectorAll('.size-options button');
    sizeButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedSize = parseInt(button.dataset.size);
        highlightSelectedButton(button.id);
      });
    });
    
    // 自定義尺寸
    document.getElementById('custom-size-input').addEventListener('change', (e) => {
      const value = parseInt(e.target.value);
      if (value >= 3 && value <= 10) {
        selectedSize = value;
      } else {
        alert('請輸入3到10之間的數字');
        e.target.value = 4;
      }
    });
  }
  
  // 初始化開始遊戲按鈕
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
  
  // 開始遊戲
  async function startGame(imageSource) {
    document.getElementById('game-setup').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');
    
    // 確保圖片已經過預處理
    try {
      // 如果是自定義上傳的圖片，它已經在上傳時預處理過了
      // 如果是預設圖片，確保使用處理後的版本
      if (selectedMode === 'image' && imageSource) {
        // 查找是否是預設圖片中的一個
        const isPreset = presetImages.some(img => img.src === imageSource);
        
        if (isPreset) {
          // 找到對應的處理後的圖片
          const processedImage = processedPresetImages.find(img => {
            const originalSrc = presetImages.find(original => original.name === img.name)?.src;
            return originalSrc === imageSource;
          });
          
          if (processedImage) {
            imageSource = processedImage.src;
          } else {
            // 如果找不到處理後的圖片，重新處理一次
            imageSource = await preprocessImage(imageSource, selectedSize);
          }
        }
      }
      
      gameInstance = new PuzzleGame(selectedSize, selectedMode, imageSource);
      renderGameBoard();
      gameInstance.startTimer();
      
      // 載入最高分
      loadHighScores();
    } catch (error) {
      console.error('遊戲初始化失敗:', error);
      alert('遊戲初始化失敗，請重試');
      document.getElementById('game-board').classList.add('hidden');
      document.getElementById('game-setup').classList.remove('hidden');
    }
  }
  
  // 渲染遊戲板
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
          block.classList.add(`color-${selectedColor}`);
        } else if (selectedMode === 'number') {
          block.textContent = value;
        } else {
          block.classList.add('image-block');
          // 設置背景圖片位置 - 將整張圖片切割成小塊
          // 計算這個值對應的原始位置 - 使用固定的網格位置而不是方塊的值
          // 這樣可以確保無論方塊如何移動，顯示的圖片部分都保持不變
          
          // 獲取方塊的值，這個值表示方塊在完成狀態下應該在的位置
          const originalCol = (value - 1) % selectedSize;
          const originalRow = Math.floor((value - 1) / selectedSize);
          
          // 創建一個包含圖片的容器
          block.style.position = 'relative';
          block.style.overflow = 'hidden';
          
          // 創建一個內部容器來放置完整圖片
          const imgContainer = document.createElement('div');
          imgContainer.style.position = 'absolute';
          imgContainer.style.width = `${selectedSize * 100}%`;
          imgContainer.style.height = `${selectedSize * 100}%`;
          imgContainer.style.backgroundImage = `url(${gameInstance.imageSource})`;
          imgContainer.style.backgroundSize = 'cover';
          imgContainer.style.backgroundRepeat = 'no-repeat';
          
          // 計算偏移量，使圖片的正確部分顯示在方塊中
          // 這裡使用方塊的值來確定應該顯示的圖片部分
          // 這確保了無論方塊移動到哪個位置，它顯示的圖片部分都是固定的
          const offsetX = -originalCol * 100;
          const offsetY = -originalRow * 100;
          
          // 設置偏移量，將圖片的正確部分定位到方塊中
          imgContainer.style.left = `${offsetX}%`;
          imgContainer.style.top = `${offsetY}%`;
          
          // 添加圖片容器到方塊中
          block.appendChild(imgContainer);
          
          // 添加邊框以便於區分各個方塊
          block.style.boxSizing = 'border-box';
          block.style.border = '1px solid rgba(255,255,255,0.2)';
          block.style.backgroundRepeat = 'no-repeat'; // 确保背景不重复
        }
        
        block.addEventListener('click', () => {
          if (gameInstance.isAdjacent(row, col)) {
            // 使用requestAnimationFrame優化渲染性能
            requestAnimationFrame(() => {
              gameInstance.moveBlock(row, col);
              updateGameStats();
              renderGameBoard();
              
              if (gameInstance.checkWin()) {
                gameComplete();
              }
            });
          }
        });
        
        puzzleContainer.appendChild(block);
      }
    }
  }
  
  // 更新遊戲統計
  function updateGameStats() {
    document.getElementById('moves').textContent = gameInstance.moves;
    // 時間更新由計時器處理
  }
  
  // 遊戲完成
  function gameComplete() {
    gameInstance.stopTimer();
    
    document.getElementById('game-board').classList.add('hidden');
    document.getElementById('game-complete').classList.remove('hidden');
    
    document.getElementById('completion-time').textContent = document.getElementById('time').textContent;
    document.getElementById('completion-moves').textContent = gameInstance.moves;
    
    // 保存高分
    gameInstance.saveHighScore();
    
    // 初始化完成界面按鈕
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
  
  // 重置遊戲設置
  function resetGameSettings() {
    selectedMode = null;
    selectedSize = null;
    selectedImage = null;
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('image-selection').classList.add('hidden');
  }
  
  // 載入最高分
  function loadHighScores() {
    const highScoresList = document.getElementById('high-scores-list');
    highScoresList.innerHTML = '';
    
    const scores = JSON.parse(localStorage.getItem('puzzleHighScores') || '{}');
    const key = `${selectedMode}-${selectedSize}`;
    const modeScores = scores[key] || { time: '無記錄', moves: '無記錄' };
    
    const timeScore = document.createElement('div');
    timeScore.innerHTML = `<strong>最短時間:</strong> ${modeScores.time}`;
    
    const movesScore = document.createElement('div');
    movesScore.innerHTML = `<strong>最少步數:</strong> ${modeScores.moves}`;
    
    highScoresList.appendChild(timeScore);
    highScoresList.appendChild(movesScore);
  }
  
  // 初始化遊戲控制按鈕
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
    
    // 添加提示按鈕功能
    document.getElementById('hint-button').addEventListener('click', () => {
      const hintMove = gameInstance.getHint();
      if (hintMove) {
        // 高亮提示的方块
        highlightHintBlock(hintMove.row, hintMove.col);
      }
    });
  }
  
  // 高亮提示的方塊
  function highlightHintBlock(row, col) {
    // 移除之前的提示高亮
    document.querySelectorAll('.puzzle-block').forEach(block => {
      block.classList.remove('hint');
    });
    
    // 計算方塊索引
    const index = row * selectedSize + col;
    const blocks = document.querySelectorAll('.puzzle-block');
    
    if (blocks[index]) {
      blocks[index].classList.add('hint');
      
      // 3秒後移除高亮
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
          } catch (error) {
            console.error('处理图片失败:', error);
            alert('图片处理失败，请尝试其他图片');
          }
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }
  
  // 初始化顏色選擇
  function initColorSelection() {
    const colorButtons = document.querySelectorAll('.color-options button');
    colorButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedColor = button.dataset.color;
        document.querySelectorAll('.color-options button').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
      });
    });
    
    // 預設選中第一個顏色選項（暗灰條紋）
    document.getElementById('color-default').classList.add('selected');
  }
  
  // 初始化所有UI組件
  function initUI() {
    initModeSelection();
    initImageSelection();
    initSizeSelection();
    initColorSelection();
    initStartGameButton();
    initGameControls();
    initCustomImageUpload();
    
    // 添加CSS類
    document.querySelectorAll('.mode-options button, .size-options button, .color-options button').forEach(button => {
      button.classList.add('option-button');
    });
  }
  
  // 啟動UI初始化
  initUI();

}); // Close DOMContentLoaded event listener
