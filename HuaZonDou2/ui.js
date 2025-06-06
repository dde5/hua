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
    { name: 'C1', src: 'images/C1.jpg' },
    { name: 'C2', src: 'images/C2.jpg' },
    { name: 'C3', src: 'images/C3.jpg' },
    { name: 'C4', src: 'images/C4.jpg' },
    { name: 'C5', src: 'images/C5.jpg' },
    { name: 'C6', src: 'images/C6.jpg' },
    { name: 'C7', src: 'images/C7.jpg' },
    { name: 'C8', src: 'images/C8.jpg' },
    { name: 'E1', src: 'images/E1.jpg' },
    { name: 'E2', src: 'images/E2.jpg' },
    { name: 'E3', src: 'images/E3.jpg' },
    { name: 'E4', src: 'images/E4.jpg' },
    { name: 'E5', src: 'images/E5.jpg' },
    { name: 'E6', src: 'images/E6.jpg' },
    { name: 'M1', src: 'images/M1.jpg' },
    { name: 'M2', src: 'images/M2.jpg' },
    { name: 'M3', src: 'images/M3.jpg' },
    { name: 'M4', src: 'images/M4.jpg' },
    { name: 'M5', src: 'images/M5.jpg' },
    { name: 'H1', src: 'images/H1.jpg' },
    { name: 'H2', src: 'images/H2.jpg' },
    { name: 'H3', src: 'images/H3.jpg' },
    { name: 'H4', src: 'images/H4.jpg' },
    { name: 'H5', src: 'images/H5.jpg' },
    { name: 'H6', src: 'images/H6.jpg' }
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
    
    // 播放遊戲開始音效
    soundManager.playGameStartSound();
    
    // 重置作弊模式相關變數
    cheatMode = false;
    firstSelectedBlock = null;
    
    // 確保遊戲實例的作弊模式也被禁用
    if (gameInstance) {
      gameInstance.cheatEnabled = false;
    }
    
    // 確保作弊按鈕顯示為未啟用狀態（紅色）
    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) {
      cheatButton.classList.remove('active');
      cheatButton.style.backgroundColor = '#e74c3c';
    }
    
    // 確保圖片已經過預處理
    try {
      // 如果是自定義上傳的圖片，它已經在上傳時預處理過了
      // 如果是預設圖片，確保使用處理後的版本
      if (selectedMode === 'image' && imageSource) {
        console.log('處理圖片模式，圖片來源:', imageSource.substring(0, 50) + '...');
        
        // 查找是否是預設圖片中的一個
        const isPreset = presetImages.some(img => img.src === imageSource);
        
        if (isPreset) {
          console.log('使用預設圖片');
          // 找到對應的處理後的圖片
          const processedImage = processedPresetImages.find(img => {
            const originalImage = presetImages.find(original => original.name === img.name);
            return originalImage && originalImage.src === imageSource;
          });
          
          if (processedImage) {
            console.log('找到預處理過的圖片');
            imageSource = processedImage.src;
          } else {
            console.log('未找到預處理過的圖片，重新處理');
            // 如果找不到處理後的圖片，重新處理一次
            imageSource = await preprocessImage(imageSource, selectedSize);
          }
        } else if (imageSource.startsWith('http')) {
          console.log('處理網絡圖片');
          // 處理從Google搜圖獲取的網絡圖片
          try {
            // 預處理網絡圖片
            imageSource = await preprocessImage(imageSource, selectedSize);
          } catch (error) {
            console.error('處理網絡圖片失敗:', error);
            alert('無法載入網絡圖片，請嘗試其他圖片或使用預設圖片');
            // 回到設置界面
            document.getElementById('game-board').classList.add('hidden');
            document.getElementById('game-setup').classList.remove('hidden');
            return;
          }
        } else {
          console.log('處理自定義或其他類型圖片');
          // 確保所有非預設、非網絡圖片都經過處理
          try {
            imageSource = await preprocessImage(imageSource, selectedSize);
          } catch (error) {
            console.error('處理圖片失敗:', error);
            alert('圖片處理失敗，請嘗試其他圖片');
            document.getElementById('game-board').classList.add('hidden');
            document.getElementById('game-setup').classList.remove('hidden');
            return;
          }
        }
      }
      
      console.log('創建遊戲實例，模式:', selectedMode, '尺寸:', selectedSize);
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
    puzzleContainer.style.gridTemplateRows = `repeat(${selectedSize}, 1fr)`;
    
    // 設置CSS變量，用於Safari兼容性
    puzzleContainer.style.setProperty('--grid-size', selectedSize);
    
    for (let row = 0; row < selectedSize; row++) {
      for (let col = 0; col < selectedSize; col++) {
        const block = document.createElement('div');
        block.className = 'puzzle-block';
        
        const value = gameInstance.board[row][col];
        if (value === 0) {
          block.classList.add('empty');
          block.classList.add(`color-${selectedColor}`);
        } else if (selectedMode === 'number') {
          // 創建一個span元素來包裝數字，以便更精確控制其位置
          const numberSpan = document.createElement('span');
          numberSpan.textContent = value;
          numberSpan.style.display = 'flex';
          numberSpan.style.alignItems = 'center';
          numberSpan.style.justifyContent = 'center';
          numberSpan.style.width = '100%';
          numberSpan.style.height = '100%';
          block.appendChild(numberSpan);
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
          
          // 添加Safari特定的樣式 - 優化版
          imgContainer.style.transform = 'translateZ(0)';
          imgContainer.style.webkitTransform = 'translateZ(0)';
          imgContainer.style.webkitBackfaceVisibility = 'hidden';
          imgContainer.style.webkitPerspective = '1000';
          imgContainer.style.willChange = 'transform';
          imgContainer.style.transition = 'none'; // 移除可能的過渡效果，提高交換速度
          
          // 計算偏移量，使圖片的正確部分顯示在方塊中
          // 這裡使用方塊的值來確定應該顯示的圖片部分
          // 這確保了無論方塊移動到哪個位置，它顯示的圖片部分都是固定的
          const offsetX = -originalCol * 100;
          const offsetY = -originalRow * 100;
          
          // 確保在Safari中正確顯示
          if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            // 修復Safari中的圖片顯示問題
            imgContainer.style.width = `${selectedSize * 100}%`;
            imgContainer.style.height = `${selectedSize * 100}%`;
            imgContainer.style.backgroundSize = 'cover';
            // 確保圖片正確定位
            imgContainer.style.left = `${offsetX}%`;
            imgContainer.style.top = `${offsetY}%`;
          }
          
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
        
        // 移除方塊點擊事件處理程序，因為我們已經在作弊模式的點擊事件處理程序中處理了所有的邏輯
        
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
    
    // 播放勝利音效
    soundManager.playWinSound();
    
    // 關閉作弊模式
    cheatMode = false;
    gameInstance.cheatEnabled = false;
    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) {
      cheatButton.classList.remove('active');
    }
    
    document.getElementById('game-board').classList.add('hidden');
    document.getElementById('game-complete').classList.remove('hidden');
    
    document.getElementById('completion-time').textContent = document.getElementById('time').textContent;
    document.getElementById('completion-moves').textContent = gameInstance.moves;
    
    // 顯示作弊模式使用信息
    const completionStats = document.querySelector('.completion-stats');
    
    // 移除之前可能存在的作弊信息
    const existingCheatInfo = document.getElementById('completion-cheat-info');
    if (existingCheatInfo) {
      completionStats.removeChild(existingCheatInfo);
    }
    
    // 添加作弊模式使用信息
    const cheatInfo = document.createElement('p');
    cheatInfo.id = 'completion-cheat-info';
    
    if (gameInstance.cheatCount > 0) {
      cheatInfo.innerHTML = `<strong>作弊模式:</strong> 使用了 ${gameInstance.cheatCount} 次`;
      cheatInfo.classList.add('cheat-used');
    } else {
      cheatInfo.innerHTML = `<strong>作弊模式:</strong> 未使用`;
      cheatInfo.classList.add('cheat-not-used');
    }
    
    completionStats.appendChild(cheatInfo);
    
    // 保存高分，確保作弊次數被記錄
    gameInstance.saveHighScore();
    
    // 初始化完成界面按鈕
    document.getElementById('play-again').addEventListener('click', () => {
      document.getElementById('game-complete').classList.add('hidden');
      // 不需要在這裡設置 startTime，讓 PuzzleGame 構造函數處理
      // 重置作弊按鈕狀態
      const cheatButton = document.getElementById('cheat-button');
      if (cheatButton) {
        cheatButton.classList.remove('active');
      }
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
    
    // 重置作弊模式狀態和按鈕顏色
    cheatMode = false;
    if (gameInstance) {
      gameInstance.cheatEnabled = false;
    }
    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) {
      cheatButton.classList.remove('active');
      cheatButton.style.backgroundColor = '#e74c3c'; // 設置為紅色（未啟用狀態）
    }
  }
  
  // 載入最高分
  function loadHighScores() {
    const highScoresList = document.getElementById('high-scores-list');
    highScoresList.innerHTML = '';
    
    const scores = JSON.parse(localStorage.getItem('puzzleHighScores') || '{}');
    
    // 獲取當前圖片名稱
    let imageName = '';
    if (selectedMode === 'image' && selectedImage) {
      // 從圖片路徑中提取圖片名稱
      const match = selectedImage.match(/images\/([^.]+)\./i);
      if (match && match[1]) {
        imageName = match[1];
      } else if (selectedImage.startsWith('http')) {
        // 嘗試從URL中提取文件名
        const urlParts = selectedImage.split('/');
        const fileName = urlParts[urlParts.length - 1].split('.')[0];
        // 如果能提取到文件名，使用它，否則使用通用名稱
        // 使用完整檔名作為識別符，確保不同URL的圖片有不同的識別符
        imageName = fileName || 'custom';
      } else {
        // 如果是自定義上傳圖片，使用通用名稱
        imageName = 'custom';
      }
    }
    
    const key = `${selectedMode}-${imageName}-${selectedSize}`;
    // 確保modeScores一定是陣列
    const modeScores = Array.isArray(scores[key]) ? scores[key] : [];
    
    // 創建標題
    const title = document.createElement('h4');
    let titleText = '';
    
    if (selectedMode === 'number') {
      titleText = `數字模式 ${selectedSize}×${selectedSize} 前三名記錄`;
    } else {
      // 從圖片路徑中提取圖片名稱
      let displayImageName = 'custom';
      if (selectedImage) {
        const match = selectedImage.match(/images\/([^.]+)\./i);
        if (match && match[1]) {
          // 取圖片檔名的前10個字母，如果不足10個則取全部
          // 使用完整檔名作為顯示名稱，確保不同圖片有不同的顯示名稱
          displayImageName = match[1];
        }
      }
      titleText = `圖片-${displayImageName} ${selectedSize}×${selectedSize} 前三名記錄`;
    }
    
    title.textContent = titleText;
    highScoresList.appendChild(title);
    
    if (modeScores.length === 0) {
      // 如果沒有記錄
      const noRecord = document.createElement('div');
      noRecord.textContent = '暫無記錄';
      noRecord.classList.add('no-record');
      highScoresList.appendChild(noRecord);
    } else {
      // 創建記錄表格
      const table = document.createElement('table');
      table.classList.add('high-scores-table');
      
      // 創建表頭
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      // 添加關卡列
      const levelHeader = document.createElement('th');
      levelHeader.textContent = '關卡';
      headerRow.appendChild(levelHeader);
      
      // 添加難度列
      const difficultyHeader = document.createElement('th');
      difficultyHeader.textContent = '難度';
      headerRow.appendChild(difficultyHeader);
      
      const rankHeader = document.createElement('th');
      rankHeader.textContent = '排名';
      
      const timeHeader = document.createElement('th');
      timeHeader.textContent = '時間';
      
      const movesHeader = document.createElement('th');
      movesHeader.textContent = '步數';
      
      const cheatHeader = document.createElement('th');
      cheatHeader.textContent = '作弊';
      
      headerRow.appendChild(rankHeader);
      headerRow.appendChild(timeHeader);
      headerRow.appendChild(movesHeader);
      headerRow.appendChild(cheatHeader);
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // 創建表格內容
      const tbody = document.createElement('tbody');
      
      modeScores.forEach((score, index) => {
        const row = document.createElement('tr');
        
        // 關卡信息
        const levelCell = document.createElement('td');
        let levelText = '';
        
        if (selectedMode === 'number') {
          levelText = '數字模式';
        } else {
          // 從圖片路徑中提取圖片名稱
          let displayImageName = 'custom';
          if (selectedImage) {
            const match = selectedImage.match(/images\/([^.]+)\./i);
            if (match && match[1]) {
              // 取圖片檔名的前10個字母，如果不足10個則取全部
              // 使用完整檔名作為顯示名稱，確保不同圖片有不同的顯示名稱
          displayImageName = match[1];
            } else if (selectedImage.startsWith('http')) {
              // 嘗試從URL中提取文件名
              const urlParts = selectedImage.split('/');
              const fileName = urlParts[urlParts.length - 1].split('.')[0];
              // 如果能提取到文件名，使用它的前10個字母，否則使用通用名稱
              // 使用完整檔名作為顯示名稱，確保不同URL的圖片有不同的顯示名稱
              displayImageName = fileName || 'custom';
            }
          }
          levelText = `圖片-${displayImageName}`;
        }
        levelCell.textContent = levelText;
        row.appendChild(levelCell);
        
        // 難度信息
        const difficultyCell = document.createElement('td');
        difficultyCell.textContent = `${selectedSize}×${selectedSize}`;
        row.appendChild(difficultyCell);
        
        // 排名
        const rankCell = document.createElement('td');
        rankCell.textContent = `#${index + 1}`;
        
        // 時間
        const timeCell = document.createElement('td');
        timeCell.textContent = score.time;
        
        // 步數
        const movesCell = document.createElement('td');
        movesCell.textContent = score.moves;
        
        // 作弊信息
        const cheatCell = document.createElement('td');
        if (score.cheatUsed) {
          cheatCell.textContent = `${score.cheatCount}次`;
          cheatCell.classList.add('cheat-used');
        } else {
          cheatCell.textContent = '無';
          cheatCell.classList.add('cheat-not-used');
        }
        
        row.appendChild(rankCell);
        row.appendChild(timeCell);
        row.appendChild(movesCell);
        row.appendChild(cheatCell);
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      highScoresList.appendChild(table);
    }
  }
  
  // 初始化遊戲控制按鈕
  function initGameControls() {
    document.getElementById('reset-game').addEventListener('click', () => {
      gameInstance.resetGame();
      renderGameBoard();
      // 播放重置遊戲音效
      soundManager.playGameStartSound();
      
      // 重置作弊模式狀態和按鈕顏色
      cheatMode = false;
      if (gameInstance) {
        gameInstance.cheatEnabled = false;
      }
      const cheatButton = document.getElementById('cheat-button');
      if (cheatButton) {
        cheatButton.classList.remove('active');
        cheatButton.style.backgroundColor = '#e74c3c'; // 設置為紅色（未啟用狀態）
      }
    });
    
    document.getElementById('new-game').addEventListener('click', () => {
      document.getElementById('game-board').classList.add('hidden');
      document.getElementById('game-setup').classList.remove('hidden');
      gameInstance.stopTimer();
      resetGameSettings();
      // 播放遊戲開始音效
    });
    
    // 添加靜音按鈕功能
    const muteButton = document.getElementById('mute-button');
    muteButton.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      
      // 更新按鈕樣式
      if (isMuted) {
        muteButton.classList.add('active');
        muteButton.style.backgroundColor = '#e74c3c'; // 紅色
      } else {
        muteButton.classList.remove('active');
        muteButton.style.backgroundColor = '#3498db'; // 恢復原本的藍色
      }
      
      // 播放音效測試（如果未靜音）
      if (!isMuted) {
        soundManager.playGameStartSound();
      }
    });
    
    // 添加提示按鈕功能
    document.getElementById('hint-button').addEventListener('click', () => {
      const hintMove = gameInstance.getHint();
      if (hintMove) {
        // 高亮提示的方块
        highlightHintBlock(hintMove.row, hintMove.col);
        // 播放提示音效
        soundManager.playMoveSound();
      }
    });
    
    // 添加顯示原圖按鈕功能
    let showingOriginal = false;
    const showOriginalButton = document.getElementById('show-original-button');
    showOriginalButton.addEventListener('click', () => {
      showingOriginal = !showingOriginal;
      
      // 切換按鈕樣式
      showOriginalButton.classList.toggle('active', showingOriginal);
      
      // 獲取所有拼圖方塊
      const puzzleBlocks = document.querySelectorAll('.puzzle-block');
      
      if (showingOriginal) {
        // 顯示原圖 - 創建一個覆蓋層
        const overlay = document.createElement('div');
        overlay.id = 'original-image-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundImage = `url(${gameInstance.imageSource})`;
        overlay.style.backgroundSize = 'cover';
        overlay.style.backgroundPosition = 'center';
        overlay.style.zIndex = '10';
        overlay.style.opacity = '0.9';
        overlay.style.transition = 'opacity 0.3s ease';
        
        // 添加到拼圖容器
        const puzzleContainer = document.querySelector('.puzzle-container');
        puzzleContainer.style.position = 'relative';
        puzzleContainer.appendChild(overlay);
        
        // 更新按鈕文字
        showOriginalButton.textContent = '隱藏原圖';
      } else {
        // 隱藏原圖 - 移除覆蓋層
        const overlay = document.getElementById('original-image-overlay');
        if (overlay) {
          overlay.parentNode.removeChild(overlay);
        }
        
        // 恢復按鈕文字
        showOriginalButton.textContent = '顯示原圖';
      }
    });
    
    // 添加換色按鈕功能
    const changeColorButton = document.getElementById('change-color-button');
    // 設置初始按鈕顏色
    updateChangeColorButtonStyle(selectedColor);
    
    // 換色按鈕點擊事件
    changeColorButton.addEventListener('click', () => {
      // 顏色選項
      const colors = ['default', 'blue', 'red', 'orange'];
      // 獲取當前顏色的索引
      const currentIndex = colors.indexOf(selectedColor);
      // 計算下一個顏色的索引（循環）
      const nextIndex = (currentIndex + 1) % colors.length;
      // 設置新的顏色
      selectedColor = colors[nextIndex];
      
      // 播放換色音效
      soundManager.playColorChangeSound();
      
      // 更新按鈕樣式
      updateChangeColorButtonStyle(selectedColor);
      
      // 更新所有空白方塊的顏色
      document.querySelectorAll('.puzzle-block.empty').forEach(block => {
        // 移除所有顏色類
        block.classList.remove('color-default', 'color-blue', 'color-red', 'color-orange');
        // 添加新的顏色類
        block.classList.add(`color-${selectedColor}`);
      });
    });
    
    // 更新換色按鈕樣式的函數
    function updateChangeColorButtonStyle(color) {
      const button = document.getElementById('change-color-button');
      
      // 移除所有可能的顏色類
      button.classList.remove('color-default-btn', 'color-blue-btn', 'color-red-btn', 'color-orange-btn');
      
      // 添加對應的顏色類
      button.classList.add(`color-${color}-btn`);
      
      // 根據顏色設置按鈕的背景樣式
      switch(color) {
        case 'default':
          button.style.backgroundColor = '#555';
          button.style.backgroundImage = 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.2) 10px, rgba(255, 255, 255, 0.2) 20px)';
          break;
        case 'blue':
          button.style.backgroundColor = '#3498db';
          button.style.backgroundImage = 'none';
          break;
        case 'red':
          button.style.backgroundColor = '#e74c3c';
          button.style.backgroundImage = 'none';
          break;
        case 'orange':
          button.style.backgroundColor = '#f39c12';
          button.style.backgroundImage = 'none';
          break;
      }
    }
    
    // 添加作弊按鈕
    const gameControls = document.querySelector('.game-controls');
    const cheatButton = document.createElement('button');
    cheatButton.id = 'cheat-button';
    cheatButton.textContent = '作弊模式';
    gameControls.appendChild(cheatButton);
    
    // 作弊模式變數
    let cheatMode = false;
    let firstSelectedBlock = null;
    
    // 作弊按鈕點擊事件
    cheatButton.addEventListener('click', () => {
      // 檢查是否已經過了5分鐘的時間限制
      const currentTime = new Date();
      const elapsedTimeInSeconds = Math.floor((currentTime - gameInstance.startTime) / 1000);
      const timeLimit = 5 * 60; // 5分鐘，單位為秒
      
      if (elapsedTimeInSeconds < timeLimit) {
        const remainingMinutes = Math.floor((timeLimit - elapsedTimeInSeconds) / 60);
        const remainingSeconds = (timeLimit - elapsedTimeInSeconds) % 60;
        alert(`作弊模式將在 ${remainingMinutes}分${remainingSeconds}秒 後可用`);
        return;
      }
      
      cheatMode = !cheatMode;
      cheatButton.classList.toggle('active', cheatMode);
      
      // 更新遊戲實例的作弊模式狀態
      gameInstance.cheatEnabled = cheatMode;
      
      // 重置選中狀態
      firstSelectedBlock = null;
      document.querySelectorAll('.puzzle-block').forEach(block => {
        block.classList.remove('cheat-selected');
      });
      
      // 更新提示文字
      if (cheatMode) {
        alert('作弊模式已啟用！點擊任意兩個方塊進行交換。');
        // 播放作弊音效
        soundManager.playCheatSound();
      }
    });
    
    // 修改方塊點擊事件處理，支持作弊模式
    document.querySelector('.puzzle-container').addEventListener('click', (e) => {
      // 獲取點擊的方塊
      const block = e.target.closest('.puzzle-block');
      if (!block) return;
      
      // 獲取方塊位置
      const blocks = Array.from(document.querySelectorAll('.puzzle-container .puzzle-block'));
      const index = blocks.indexOf(block);
      const row = Math.floor(index / selectedSize);
      const col = index % selectedSize;
      
      // 作弊模式處理邏輯
      if (cheatMode && gameInstance.cheatEnabled) {
        
        // 空白方塊不能被選中
        if (block.classList.contains('empty')) return;
      
      if (!firstSelectedBlock) {
        // 選中第一個方塊
        firstSelectedBlock = { row, col, element: block };
        block.classList.add('cheat-selected');
      } else {
        // 選中第二個方塊，執行交換
        const { row: row1, col: col1 } = firstSelectedBlock;
        
        // 執行交換
        gameInstance.cheatSwap(row1, col1, row, col);
        
        // 重置選中狀態
        firstSelectedBlock.element.classList.remove('cheat-selected');
        firstSelectedBlock = null;
        
        // 更新遊戲板
        renderGameBoard();
        
        // 檢查是否完成
        if (gameInstance.checkWin()) {
          gameComplete();
        }
      }
      } else {
        // 非作弊模式下，處理正常的方塊移動
        if (gameInstance.isAdjacent(row, col)) {
          // 使用requestAnimationFrame優化渲染性能
          // 在Safari中，使用多層requestAnimationFrame來確保更平滑的動畫
          requestAnimationFrame(() => {
            // 先執行邏輯操作
            gameInstance.moveBlock(row, col);
            updateGameStats();
            
            // 使用第二個requestAnimationFrame來確保視覺更新在下一幀進行
            // 這有助於減少Safari中的渲染延遲
            requestAnimationFrame(() => {
              renderGameBoard();
              
              if (gameInstance.checkWin()) {
                gameComplete();
              }
            });
          });
        }
      }
    }, true); // 使用捕獲階段以確保事件處理
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
  
  // 顏色選擇已從設置界面移除，預設使用暗灰條紋
  function initColorSelection() {
    // 設置預設顏色為暗灰條紋
    selectedColor = 'default';
  }
  
  // 初始化API設定
  function initApiSettings() {
    const apiCheckbox = document.getElementById('enable-api');
    const searchOptionContainer = document.getElementById('search-option-container');
    
    // 檢查是否有保存的API設定
    const apiEnabled = localStorage.getItem('api_enabled') === 'true';
    
    if (apiEnabled) {
      apiCheckbox.checked = true;
      searchOptionContainer.classList.remove('hidden');
      
      // 初始化圖片搜索界面 - 使用Google搜圖
      const searchContainer = document.getElementById('image-search-container');
      initImageSearch(searchContainer, (imageUrl) => {
        selectedImage = imageUrl;
      });
    }
    
    // 啟用/禁用Google搜圖功能
    apiCheckbox.addEventListener('change', () => {
      if (apiCheckbox.checked) {
        searchOptionContainer.classList.remove('hidden');
        localStorage.setItem('api_enabled', 'true');
        
        // 初始化圖片搜索界面 - 使用Google搜圖
        // 先清空容器，避免重複添加搜索界面
        const searchContainer = document.getElementById('image-search-container');
        searchContainer.innerHTML = '';
        initImageSearch(searchContainer, (imageUrl) => {
          selectedImage = imageUrl;
        });
      } else {
        searchOptionContainer.classList.add('hidden');
        localStorage.setItem('api_enabled', 'false');
      }
    });
  }
  
  // 初始化網路圖片搜索
  function initNetworkImageSearch() {
    const searchContainer = document.getElementById('image-search-container');
    
    // 使用imageSearch.js中的函數初始化搜索界面
    initImageSearch(searchContainer, (imageUrl) => {
      // 當用戶選擇了一張網路圖片時
      selectedImage = imageUrl;
    });
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
    initApiSettings(); // 初始化Google搜圖功能
    
    // 添加CSS類
    document.querySelectorAll('.mode-options button, .size-options button, .color-options button').forEach(button => {
      button.classList.add('option-button');
    });
  }
  
  // 啟動UI初始化
  initUI();

}); // Close DOMContentLoaded event listener
