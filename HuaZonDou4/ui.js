// ui.js (完整修正版 - 延遲處理)
document.addEventListener('DOMContentLoaded', () => {
  // 遊戲設置變數
  let selectedMode = null;
  let selectedSize = null;
  let selectedImage = null; // 存儲原始圖片源 (路徑或 DataURL)
  let selectedColor = 'default';
  let gameInstance = null;
  let currentImageIdentifier = ''; // 存儲穩定的圖片標識符

  // 預設圖片 (原始路徑)
  const presetImages = [
    { name: 'C1', src: 'images/C1.jpg' }, { name: 'C2', src: 'images/C2.jpg' },
    { name: 'C3', src: 'images/C3.jpg' }, { name: 'C4', src: 'images/C4.jpg' },
    { name: 'C5', src: 'images/C5.jpg' }, { name: 'C6', src: 'images/C6.jpg' },
    { name: 'C7', src: 'images/C7.jpg' }, { name: 'C8', src: 'images/C8.jpg' },
    { name: 'E1', src: 'images/E1.jpg' }, { name: 'E2', src: 'images/E2.jpg' },
    { name: 'E3', src: 'images/E3.jpg' }, { name: 'E4', src: 'images/E4.jpg' },
    { name: 'E5', src: 'images/E5.jpg' }, { name: 'E6', src: 'images/E6.jpg' },
    { name: 'M1', src: 'images/M1.jpg' }, { name: 'M2', src: 'images/M2.jpg' },
    { name: 'M3', src: 'images/M3.jpg' }, { name: 'M4', src: 'images/M4.jpg' },
    { name: 'M5', src: 'images/M5.jpg' }, { name: 'H1', src: 'images/H1.jpg' },
    { name: 'H2', src: 'images/H2.jpg' }, { name: 'H3', src: 'images/H3.jpg' },
    { name: 'H4', src: 'images/H4.jpg' }, { name: 'H5', src: 'images/H5.jpg' },
    { name: 'H6', src: 'images/H6.jpg' }
  ];

  // 初始化圖片選擇區域 (不再預處理)
  function initImageSelection() {
    const imageOptions = document.querySelector('.image-options');
    if (!imageOptions) return;

    imageOptions.innerHTML = ''; // Clear previous options

    // 直接使用原始 presetImages
    presetImages.forEach(image => {
      const img = document.createElement('img');
      img.src = image.src; // <-- 使用原始路徑
      img.alt = image.name;
      img.title = image.name;
      img.dataset.imageName = image.name; // 儲存標識符

      img.addEventListener('click', () => {
        document.querySelectorAll('.image-options img, .image-search-results img').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        selectedImage = image.src; // <-- 存儲原始路徑
        currentImageIdentifier = image.name; // <-- 存儲標識符
        console.log("選擇預設圖片:", currentImageIdentifier, "原始來源:", selectedImage);
        // 清除自定義圖片輸入
        const customImageInput = document.getElementById('custom-image');
        if (customImageInput) customImageInput.value = '';
      });
      imageOptions.appendChild(img);
    });
    console.log("預設圖片選項已載入 (未預處理)");
  }

  // 初始化模式選擇
  function initModeSelection() {
    const numberModeBtn = document.getElementById('number-mode');
    const imageModeBtn = document.getElementById('image-mode');
    const imageSelectionDiv = document.getElementById('image-selection');

    if (numberModeBtn) {
        numberModeBtn.addEventListener('click', () => {
            selectedMode = 'number';
            if (imageSelectionDiv) imageSelectionDiv.classList.add('hidden');
            highlightSelectedButton('number-mode');
            // 清除圖片選擇
            selectedImage = null;
            currentImageIdentifier = '';
            document.querySelectorAll('.image-options img, .image-search-results img').forEach(i => i.classList.remove('selected'));
            const customImageInput = document.getElementById('custom-image');
            if (customImageInput) customImageInput.value = '';
        });
    }

    if (imageModeBtn) {
        imageModeBtn.addEventListener('click', () => {
            selectedMode = 'image';
            if (imageSelectionDiv) imageSelectionDiv.classList.remove('hidden');
            highlightSelectedButton('image-mode');
        });
    }
  }

  // 高亮選中的按鈕
  function highlightSelectedButton(id) {
    const buttons = document.querySelectorAll('.mode-options button, .size-options button');
    buttons.forEach(button => button.classList.remove('selected'));
    const elementToSelect = document.getElementById(id);
    if(elementToSelect) elementToSelect.classList.add('selected');

    // Also update size-options buttons based on selectedSize
    document.querySelectorAll('.size-options button').forEach(btn => {
        if (parseInt(btn.dataset.size) === selectedSize) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
  }

  // 初始化尺寸選擇
  function initSizeSelection() {
    const sizeButtons = document.querySelectorAll('.size-options button');
    const customSizeInput = document.getElementById('custom-size-input');

    sizeButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedSize = parseInt(button.dataset.size);
        document.querySelectorAll('.size-options button').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        if(customSizeInput) customSizeInput.value = selectedSize;
        console.log("選擇尺寸:", selectedSize);
      });
    });

    if (customSizeInput) {
        if (!selectedSize) {
            selectedSize = parseInt(customSizeInput.value) || 4;
        } else {
            customSizeInput.value = selectedSize;
        }

        customSizeInput.addEventListener('change', (e) => {
          const value = parseInt(e.target.value);
          if (value >= 3 && value <= 10) {
            selectedSize = value;
            document.querySelectorAll('.size-options button').forEach(btn => btn.classList.remove('selected'));
            console.log("選擇自定義尺寸:", selectedSize);
          } else {
            alert('請輸入3到10之間的數字');
            e.target.value = selectedSize || 4;
          }
        });
    } else {
        if (!selectedSize) selectedSize = 4;
    }
  }

  // 初始化開始遊戲按鈕 (邏輯調整)
  function initStartGameButton() {
    const startGameBtn = document.getElementById('start-game');
    if(!startGameBtn) return;

    // **修改點擊事件為 async**
    startGameBtn.addEventListener('click', async () => { // <-- 改為 async
      if (!selectedMode) {
        alert('請選擇遊戲模式');
        return;
      }
      if (!selectedSize) {
         const customInput = document.getElementById('custom-size-input');
         selectedSize = customInput ? (parseInt(customInput.value) || 4) : 4;
      }
      // 確保 gameSize 在有效範圍內
      const gameSize = selectedSize >= 3 && selectedSize <= 10 ? selectedSize : 4;

      let imageSourceToProcess = null; // 存儲需要處理的圖片來源 (原始路徑或原始DataURL)
      let identifierForGame = '';    // 存儲傳給遊戲實例的標識符

      if (selectedMode === 'image') {
          const customImageInput = document.getElementById('custom-image');
          // 優先處理自定義圖片
          if (customImageInput && customImageInput.files[0]) {
              console.log("檢測到自定義圖片上傳");
              identifierForGame = 'custom';
              try {
                  // 從 input 讀取原始 DataURL
                  imageSourceToProcess = await readFileAsDataURL(customImageInput.files[0]);
                  console.log("自定義圖片讀取完成");
              } catch (error) {
                  console.error("讀取自定義圖片失敗:", error);
                  alert("讀取自定義圖片失敗，請重試。");
                  return;
              }
          } else if (selectedImage) { // 處理選擇的預設圖片或網路圖片
              imageSourceToProcess = selectedImage; // 這是原始路徑
              identifierForGame = currentImageIdentifier; // 這是標識符
              console.log(`使用已選擇的圖片: ${identifierForGame}, 來源: ${imageSourceToProcess}`);
          } else {
              alert('圖片模式下，請選擇一張圖片或上傳自定義圖片');
              return;
          }

          // --- 在 startGame 內部進行預處理 ---
          if (imageSourceToProcess && typeof preprocessImage === 'function') {
              console.log("開始預處理選擇的圖片...");
              startGameBtn.disabled = true; // 禁用按鈕防止重複點擊
              startGameBtn.textContent = '圖片處理中...';
              try {
                  // **調用 preprocessImage 處理原始來源**
                  const processedDataUrl = await preprocessImage(imageSourceToProcess, gameSize);
                  console.log("圖片預處理完成。");
                  // **使用處理後的 DataURL 開始遊戲**
                  startGame(processedDataUrl, identifierForGame); // <--- 傳遞處理後的 DataURL
              } catch (error) {
                  console.error('開始遊戲前的圖片預處理失敗:', error);
                  alert(`圖片處理失敗: ${error.message}`);
                  // 確保按鈕恢復
                  startGameBtn.disabled = false;
                  startGameBtn.textContent = '開始遊戲';
              }
              // Finally block is not needed here as startGame call happens inside try
              // If startGame itself could throw, add another try...catch around it

          } else if (imageSourceToProcess) {
               // 如果 preprocessImage 函數不存在或來源無效
               console.warn("preprocessImage 函數不存在或圖片來源無效，直接使用原始來源 (可能導致問題)");
               startGame(imageSourceToProcess, identifierForGame);
               // 確保按鈕恢復 (如果上面有禁用)
               startGameBtn.disabled = false;
               startGameBtn.textContent = '開始遊戲';
          } else {
               // 理論上不應執行到這裡
               alert("無法確定圖片來源。");
               // 確保按鈕恢復
               startGameBtn.disabled = false;
               startGameBtn.textContent = '開始遊戲';
          }
          // --- 預處理結束 ---

      } else {
          // 數字模式
          identifierForGame = '';
          selectedImage = null; // 確保數字模式無圖片
          // 直接開始遊戲，無需預處理
          startGame(null, identifierForGame);
      }
    });
}

// 輔助函數：讀取文件為 DataURL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// 開始遊戲 (接收的 processedImageSource 現在應該是預處理過的 DataURL 或 null)
function startGame(processedImageSource, imageIdentifier) {
    const gameSetupDiv = document.getElementById('game-setup');
    const gameBoardDiv = document.getElementById('game-board');
    if (!gameSetupDiv || !gameBoardDiv) return;

    gameSetupDiv.classList.add('hidden');
    gameBoardDiv.classList.remove('hidden');

    // 延遲一點播放聲音
    setTimeout(() => soundManager.playGameStartSound(), 100);

    firstSelectedBlock = null; // 重置作弊選擇

    const cheatButton = document.getElementById('cheat-button');

    try {
      const finalImageSource = processedImageSource; // 已經是處理過的
      // 再次確認 gameSize
      const gameSize = selectedSize >= 3 && selectedSize <= 10 ? selectedSize : 4;

      console.log('創建遊戲實例，模式:', selectedMode, '尺寸:', gameSize, '標識符:', imageIdentifier);
      gameInstance = new PuzzleGame(gameSize, selectedMode, finalImageSource, imageIdentifier);

      gameInstance.cheatEnabled = false;
      if (cheatButton) {
          cheatButton.classList.remove('active');
      }

      renderGameBoard(); // 渲染遊戲板
      gameInstance.startTimer(); // 啟動計時器

      // 載入高分
      loadHighScores(selectedMode, imageIdentifier, gameSize);

    } catch (error) {
      console.error('遊戲實例創建或初始化失敗:', error);
      alert('遊戲初始化失敗，請重試');
      if (gameBoardDiv) gameBoardDiv.classList.add('hidden');
      if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
      // 恢復開始按鈕狀態
      const startGameBtn = document.getElementById('start-game');
      if (startGameBtn) {
            startGameBtn.disabled = false;
            startGameBtn.textContent = '開始遊戲';
      }
    }
}

// 渲染遊戲板 (使用上次修正的邏輯，增加日誌)
// ui.js (僅 renderGameBoard 函數修改)

function renderGameBoard() {
    const puzzleContainer = document.querySelector('.puzzle-container');
    if (!puzzleContainer || !gameInstance) {
        console.error("無法渲染遊戲板：容器或遊戲實例不存在。");
        return;
    }

    puzzleContainer.innerHTML = ''; // 清空舊板
    puzzleContainer.style.gridTemplateColumns = `repeat(${gameInstance.size}, 1fr)`;
    puzzleContainer.style.gridTemplateRows = `repeat(${gameInstance.size}, 1fr)`;
    puzzleContainer.style.setProperty('--grid-size', gameInstance.size);

    const emptyBlockColorClass = `color-${selectedColor}`;
    const imageSourceForBoard = gameInstance.imageSource; // 獲取預處理過的 DataURL

    // --- **核心修改：設置 CSS 變量** ---
    if (gameInstance.mode === 'image' && imageSourceForBoard) {
        // 在父容器上設置 CSS 變量
        puzzleContainer.style.setProperty('--puzzle-image-url', `url(${imageSourceForBoard})`);
        console.log(`設置 CSS 變量 --puzzle-image-url`);
    } else {
        // 如果不是圖片模式或沒有圖片源，清除變量
        puzzleContainer.style.removeProperty('--puzzle-image-url');
    }
    // --- **修改結束** ---

    for (let row = 0; row < gameInstance.size; row++) {
      for (let col = 0; col < gameInstance.size; col++) {
        const block = document.createElement('div');
        block.className = 'puzzle-block';
        block.dataset.row = row;
        block.dataset.col = col;
        const value = gameInstance.board[row][col];

        if (value === 0) {
          block.classList.add('empty', emptyBlockColorClass);
          block.style.backgroundColor = 'transparent';
          block.style.backgroundImage = 'none'; // 確保空塊無背景
        }
        else if (gameInstance.mode === 'image' && imageSourceForBoard) {
          block.classList.add('image-block');
          block.style.backgroundColor = 'transparent'; // 背景透明，讓 CSS 變量的圖顯示

          // --- **核心修改：不再設置 backgroundImage** ---
          // block.style.backgroundImage = `url(${imageSourceForBoard})`; // REMOVED
          // --- **修改結束** ---

          const originalCol = (value - 1) % gameInstance.size;
          const originalRow = Math.floor((value - 1) / gameInstance.size);

          try {
            const backgroundWidth = gameInstance.size * 100;
            const backgroundHeight = gameInstance.size * 100;
            const backgroundPosX = -originalCol * 100;
            const backgroundPosY = -originalRow * 100;

            // **只設置 size 和 position**
            block.style.backgroundSize = `${backgroundWidth}% ${backgroundHeight}%`;
            block.style.backgroundPosition = `${backgroundPosX}% ${backgroundPosY}%`;
            block.style.backgroundRepeat = 'no-repeat';

          } catch (e) {
            console.error(`設置圖片方塊樣式錯誤: (r:${row}, c:${col}, val:${value})`, e);
            block.textContent = 'E'; // Error marker
            block.style.backgroundColor = '#fcc'; // Error background
            // 清除可能繼承的 CSS 變量背景
            block.style.backgroundImage = 'none';
          }
        }
        else if (gameInstance.mode === 'number') {
          block.style.backgroundImage = 'none'; // 確保數字塊無誤用圖片背景
          const numberSpan = document.createElement('span');
          numberSpan.textContent = value;
          numberSpan.style.cssText = 'display:flex; align-items:center; justify-content:center; width:100%; height:100%;'; // Inline for simplicity
          block.appendChild(numberSpan);
        } else {
           console.warn("渲染遊戲板時遇到預期外的方塊狀態", {row, col, value, mode: gameInstance.mode});
           block.style.backgroundColor = '#ff0000'; block.textContent = '!'; block.style.backgroundImage = 'none';
        }
        puzzleContainer.appendChild(block);
      }
    }
     // console.log("遊戲板渲染完成 (使用 CSS 變量)");
}

// 其他 ui.js 中的函數保持不變...


// 更新遊戲統計
function updateGameStats() {
    const movesSpan = document.getElementById('moves');
    if (movesSpan && gameInstance) {
        movesSpan.textContent = gameInstance.moves;
    }
    // 時間由計時器更新
}

 // 遊戲完成
 function gameComplete() {
    if (!gameInstance) return;

    gameInstance.stopTimer();
    soundManager.playWinSound();

    gameInstance.cheatEnabled = false; // 確保作弊狀態關閉
    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) {
      cheatButton.classList.remove('active');
    }

    const gameBoardDiv = document.getElementById('game-board');
    const gameCompleteDiv = document.getElementById('game-complete');
    if (!gameBoardDiv || !gameCompleteDiv) return;

    gameBoardDiv.classList.add('hidden');
    gameCompleteDiv.classList.remove('hidden');

    const completionTimeSpan = document.getElementById('completion-time');
    const completionMovesSpan = document.getElementById('completion-moves');
    const timeSpan = document.getElementById('time'); // Get current time display

    if(completionTimeSpan && timeSpan) completionTimeSpan.textContent = timeSpan.textContent;
    if(completionMovesSpan) completionMovesSpan.textContent = gameInstance.moves;

    const completionStats = document.querySelector('.completion-stats');
    if (completionStats) {
        const existingCheatInfo = document.getElementById('completion-cheat-info');
        if (existingCheatInfo) {
          completionStats.removeChild(existingCheatInfo);
        }

        const cheatInfo = document.createElement('p');
        cheatInfo.id = 'completion-cheat-info';
        if (gameInstance.cheatCount > 0) {
          cheatInfo.innerHTML = `<strong>作弊模式:</strong> <span class="cheat-used">使用了 ${gameInstance.cheatCount} 次</span>`;
        } else {
          cheatInfo.innerHTML = `<strong>作弊模式:</strong> <span class="cheat-not-used">未使用</span>`;
        }
        completionStats.appendChild(cheatInfo);
    }

    // 保存高分
    gameInstance.saveHighScore(); // gameInstance 內部知道自己的 mode, identifier, size

    // --- 按鈕事件監聽器 (使用 once) ---
    const playAgainBtn = document.getElementById('play-again');
    const backToMenuBtn = document.getElementById('back-to-menu');

    const playAgainHandler = () => {
        gameCompleteDiv.classList.add('hidden');
        // 重新開始遊戲，使用相同的設置 (processed image source, identifier)
        if (gameInstance) {
            startGame(gameInstance.imageSource, gameInstance.imageIdentifier);
        }
    };

    const backToMenuHandler = () => {
        gameCompleteDiv.classList.add('hidden');
        const gameSetupDiv = document.getElementById('game-setup');
        if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
        resetGameSettings();
    };

    if (playAgainBtn) {
        playAgainBtn.removeEventListener('click', playAgainHandler); // Remove previous just in case
        playAgainBtn.addEventListener('click', playAgainHandler, { once: true });
    }
    if (backToMenuBtn) {
        backToMenuBtn.removeEventListener('click', backToMenuHandler);
        backToMenuBtn.addEventListener('click', backToMenuHandler, { once: true });
    }
  }

// 重置遊戲設置
function resetGameSettings() {
    selectedMode = null;
    selectedSize = null;
    selectedImage = null; // Reset original source
    currentImageIdentifier = '';

    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    const imageSelectionDiv = document.getElementById('image-selection');
    if(imageSelectionDiv) imageSelectionDiv.classList.add('hidden');
    const customImageInput = document.getElementById('custom-image');
    if (customImageInput) customImageInput.value = ''; // Clear file input
     // Remove custom preview if it exists
     const customPreview = document.querySelector('.image-options .custom-preview');
     if(customPreview) customPreview.remove();


    document.querySelectorAll('.mode-options button, .size-options button').forEach(button => button.classList.remove('selected'));
    const customSizeInput = document.getElementById('custom-size-input');
    if(customSizeInput) customSizeInput.value = 4; // Reset custom size input

    if (gameInstance) {
        gameInstance.cheatEnabled = false;
    }
    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) {
      cheatButton.classList.remove('active');
    }

     const highScoresList = document.getElementById('high-scores-list');
     if (highScoresList) {
        highScoresList.innerHTML = '<div class="no-record">選擇關卡以查看記錄</div>';
     }

     if (gameInstance) {
         gameInstance.stopTimer();
         gameInstance = null; // Clear game instance
     }
     const timeSpan = document.getElementById('time');
     const movesSpan = document.getElementById('moves');
     if(timeSpan) timeSpan.textContent = '00:00';
     if(movesSpan) movesSpan.textContent = '0';

     // Reset start game button state
     const startGameBtn = document.getElementById('start-game');
      if (startGameBtn) {
            startGameBtn.disabled = false;
            startGameBtn.textContent = '開始遊戲';
      }

     console.log("遊戲設置已重置");
  }

// 載入最高分 (與上次修正相同)
function loadHighScores(mode, identifier, size) {
    const highScoresList = document.getElementById('high-scores-list');
    if (!highScoresList) return;
    highScoresList.innerHTML = '';

    if (!mode || size === undefined || size === null) {
        highScoresList.innerHTML = '<div class="no-record">無法載入記錄：參數缺失</div>';
        return;
    }
     if (mode === 'image' && (identifier === undefined || identifier === null)) {
        highScoresList.innerHTML = '<div class="no-record">無法載入記錄：圖片標識符缺失</div>';
        return;
     }

    const scores = StorageManager.getItem('puzzleHighScores', {});
    const key = `${mode}-${identifier}-${size}`;
    console.log("載入高分榜，Key:", key);

    const modeScores = Array.isArray(scores[key]) ? scores[key] : [];

    if (modeScores.length === 0) {
      const noRecord = document.createElement('div');
      noRecord.textContent = '此關卡暫無記錄';
      noRecord.classList.add('no-record');
      highScoresList.appendChild(noRecord);
    } else {
      const table = document.createElement('table');
      table.classList.add('high-scores-table');
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const headers = ['關卡', '難度', '排名', '時間', '步數', '作弊'];
      headers.forEach(text => { const th = document.createElement('th'); th.textContent = text; headerRow.appendChild(th); });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      modeScores.forEach((score, index) => {
        const row = document.createElement('tr');
        const levelCell = document.createElement('td');
        levelCell.textContent = score.levelName || (mode === 'number' ? '數字模式' : identifier || '未知圖片');
        row.appendChild(levelCell);
        const difficultyCell = document.createElement('td');
        difficultyCell.textContent = score.difficulty || `${size}x${size}`;
        row.appendChild(difficultyCell);
        const rankCell = document.createElement('td'); rankCell.textContent = `#${index + 1}`; row.appendChild(rankCell);
        const timeCell = document.createElement('td'); timeCell.textContent = score.time || 'N/A'; row.appendChild(timeCell);
        const movesCell = document.createElement('td'); movesCell.textContent = score.moves !== undefined ? score.moves : 'N/A'; row.appendChild(movesCell);
        const cheatCell = document.createElement('td');
        if (score.cheatUsed) { cheatCell.textContent = `${score.cheatCount || 1}次`; cheatCell.classList.add('cheat-used'); }
        else { cheatCell.textContent = '無'; cheatCell.classList.add('cheat-not-used'); }
        row.appendChild(cheatCell);
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      highScoresList.appendChild(table);
    }
  }


// 初始化遊戲控制按鈕 (與上次修正相同)
function initGameControls() {
    const resetBtn = document.getElementById('reset-game');
    const newGameBtn = document.getElementById('new-game');
    const muteBtn = document.getElementById('mute-button');
    const hintBtn = document.getElementById('hint-button');
    const showOriginalBtn = document.getElementById('show-original-button');
    const changeColorBtn = document.getElementById('change-color-button');
    const puzzleContainer = document.querySelector('.puzzle-container'); // For block clicks

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (!gameInstance) return;
            gameInstance.resetGame();
            renderGameBoard();
            updateGameStats();
            soundManager.playGameStartSound();
            gameInstance.cheatEnabled = false;
            const cheatButton = document.getElementById('cheat-button');
            if (cheatButton) cheatButton.classList.remove('active');
            console.log("遊戲已重置");
        });
    }

    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            if (gameInstance) gameInstance.stopTimer();
            const gameBoardDiv = document.getElementById('game-board');
            const gameSetupDiv = document.getElementById('game-setup');
            if(gameBoardDiv) gameBoardDiv.classList.add('hidden');
            if(gameSetupDiv) gameSetupDiv.classList.remove('hidden');
            resetGameSettings();
        });
    }

    if (muteBtn) {
        muteBtn.classList.toggle('active', soundManager.muted);
        muteBtn.style.backgroundColor = soundManager.muted ? '#e74c3c' : '#3498db';
        muteBtn.addEventListener('click', () => {
            const isMuted = soundManager.toggleMute();
            muteBtn.classList.toggle('active', isMuted);
            muteBtn.style.backgroundColor = isMuted ? '#e74c3c' : '#3498db';
            if (!isMuted) soundManager.playGameStartSound();
        });
    }

    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            if (!gameInstance) return;
            const hintMove = gameInstance.getHint();
            if (hintMove) {
                highlightHintBlock(hintMove.row, hintMove.col);
                soundManager.playMoveSound();
            } else { console.log("無法獲取提示"); }
        });
    }

    if (showOriginalBtn) {
        let showingOriginal = false;
        showOriginalBtn.addEventListener('click', () => {
           if (gameInstance && gameInstance.mode === 'image' && gameInstance.imageSource) {
                showingOriginal = !showingOriginal;
                showOriginalBtn.classList.toggle('active', showingOriginal);
                const puzzleCont = document.querySelector('.puzzle-container');
                if (!puzzleCont) return;
                let overlay = document.getElementById('original-image-overlay');
                if (showingOriginal) {
                    if (!overlay) {
                        overlay = document.createElement('div'); overlay.id = 'original-image-overlay';
                        Object.assign(overlay.style, { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundImage: `url(${gameInstance.imageSource})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: '10', opacity: '0', transition: 'opacity 0.3s ease' });
                        puzzleCont.style.position = 'relative'; puzzleCont.appendChild(overlay); void overlay.offsetWidth; overlay.style.opacity = '1';
                    }
                    showOriginalBtn.textContent = '隱藏原圖';
                } else {
                    if (overlay) { overlay.style.opacity = '0'; overlay.addEventListener('transitionend', () => overlay.remove(), { once: true }); }
                    showOriginalBtn.textContent = '顯示原圖';
                }
           } else { alert("僅在圖片模式下可用"); }
        });
    }

    if (changeColorBtn) {
        function updateChangeColorButtonStyle(color) { /* ... (same as before) ... */
            changeColorBtn.classList.remove('color-default-btn', 'color-blue-btn', 'color-red-btn', 'color-orange-btn');
            changeColorBtn.classList.add(`color-${color}-btn`);
            switch(color) { case 'default': changeColorBtn.style.backgroundColor = '#555'; break; case 'blue': changeColorBtn.style.backgroundColor = '#3498db'; break; case 'red': changeColorBtn.style.backgroundColor = '#e74c3c'; break; case 'orange': changeColorBtn.style.backgroundColor = '#f39c12'; break; }
            changeColorBtn.style.backgroundImage = (color === 'default') ? 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.2) 10px, rgba(255, 255, 255, 0.2) 20px)' : 'none';
         }
        updateChangeColorButtonStyle(selectedColor);
        changeColorBtn.addEventListener('click', () => {
            const colors = ['default', 'blue', 'red', 'orange'];
            const currentIndex = colors.indexOf(selectedColor);
            const nextIndex = (currentIndex + 1) % colors.length;
            selectedColor = colors[nextIndex];
            soundManager.playColorChangeSound();
            updateChangeColorButtonStyle(selectedColor);
            document.querySelectorAll('.puzzle-block.empty').forEach(block => { block.classList.remove('color-default', 'color-blue', 'color-red', 'color-orange'); block.classList.add(`color-${selectedColor}`); });
        });
    }

    // --- 作弊按鈕邏輯 (與上次修正相同) ---
    const gameControls = document.querySelector('.game-controls');
    let cheatButton = document.getElementById('cheat-button');
    if (!cheatButton && gameControls) {
        cheatButton = document.createElement('button'); cheatButton.id = 'cheat-button'; cheatButton.textContent = '作弊模式'; gameControls.appendChild(cheatButton); console.log("作弊按鈕已創建");
    } else if (!cheatButton) { console.error("無法找到 .game-controls"); return; }

    let firstSelectedBlock = null;
    cheatButton.addEventListener('click', () => {
        if (!gameInstance) { console.warn("作弊按鈕點擊：遊戲實例未初始化"); alert("請先開始遊戲"); return; }
        const currentTime = new Date(); const startTime = gameInstance.startTime || currentTime; const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000); const timeLimit = 5 * 60;
        if (elapsedTimeInSeconds < timeLimit) {
            const remainingSecondsTotal = timeLimit - elapsedTimeInSeconds; const remainingMinutes = Math.floor(remainingSecondsTotal / 60); const remainingSeconds = remainingSecondsTotal % 60;
            alert(`作弊模式將在 ${remainingMinutes}分${remainingSeconds}秒 後可用`);
            gameInstance.cheatEnabled = false; cheatButton.classList.remove('active'); return;
        }
        gameInstance.cheatEnabled = !gameInstance.cheatEnabled;
        cheatButton.classList.toggle('active', gameInstance.cheatEnabled);
        if (firstSelectedBlock) { firstSelectedBlock.element.classList.remove('cheat-selected'); firstSelectedBlock = null; }
        document.querySelectorAll('.puzzle-block.cheat-selected').forEach(block => { block.classList.remove('cheat-selected'); });
        if (gameInstance.cheatEnabled) { alert('作弊模式已啟用！點擊任意兩個非空白方塊進行交換。'); soundManager.playCheatSound(); }
        console.log("作弊模式狀態切換為:", gameInstance.cheatEnabled);
    });

    // --- Block Click Handling (與上次修正相同) ---
    if (puzzleContainer) {
        puzzleContainer.addEventListener('click', (e) => {
          if (!gameInstance) return;
          const blockElement = e.target.closest('.puzzle-block');
          if (!blockElement || blockElement.classList.contains('empty')) { if (firstSelectedBlock) { firstSelectedBlock.element.classList.remove('cheat-selected'); firstSelectedBlock = null; console.log("作弊選擇已取消 (點擊空白處)"); } return; }
          const blocksArray = Array.from(puzzleContainer.children); const index = blocksArray.indexOf(blockElement); if (index === -1) return;
          const row = Math.floor(index / gameInstance.size); const col = index % gameInstance.size;

          if (gameInstance.cheatEnabled) { // 作弊模式
              const currentTime = new Date(); const startTime = gameInstance.startTime || currentTime; const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000); const timeLimit = 5 * 60;
              if (elapsedTimeInSeconds < timeLimit) { alert('作弊功能尚未啟用 (未滿5分鐘)。'); gameInstance.cheatEnabled = false; if(cheatButton) cheatButton.classList.remove('active'); if (firstSelectedBlock) { firstSelectedBlock.element.classList.remove('cheat-selected'); firstSelectedBlock = null; } return; }

              if (!firstSelectedBlock) { firstSelectedBlock = { row, col, element: blockElement }; blockElement.classList.add('cheat-selected'); console.log("作弊選擇1:", `(${row},${col})`); }
              else { console.log("作弊選擇2:", `(${row},${col})`);
                if (firstSelectedBlock.row === row && firstSelectedBlock.col === col) { blockElement.classList.remove('cheat-selected'); firstSelectedBlock = null; console.log("作弊取消選擇 (重覆點擊)"); return; }
                const { row: row1, col: col1 } = firstSelectedBlock; const swapped = gameInstance.cheatSwap(row1, col1, row, col);
                firstSelectedBlock.element.classList.remove('cheat-selected'); firstSelectedBlock = null;
                if (swapped) { requestAnimationFrame(() => { renderGameBoard(); updateGameStats(); if (gameInstance.checkWin()) { gameComplete(); } }); }
              }
          } else { // 普通模式
            if (gameInstance.isAdjacent(row, col)) {
              const moved = gameInstance.moveBlock(row, col);
              if (moved) { requestAnimationFrame(() => { renderGameBoard(); updateGameStats(); if (gameInstance.checkWin()) { gameComplete(); } }); }
            }
          }
        }, true); // Use capture phase
    } else { console.error("無法找到 .puzzle-container"); }
}


// 高亮提示的方塊 (與上次修正相同)
function highlightHintBlock(row, col) {
    if (!gameInstance) return;
    document.querySelectorAll('.puzzle-block.hint').forEach(block => { block.classList.remove('hint'); });
    const index = row * gameInstance.size + col; const blocks = document.querySelectorAll('.puzzle-container .puzzle-block');
    if (blocks && blocks[index]) { blocks[index].classList.add('hint'); setTimeout(() => { if (blocks[index] && blocks[index].classList.contains('hint')) { blocks[index].classList.remove('hint'); } }, 3000); }
}


// 初始化自定义图片上传 (只讀取，不預處理)
function initCustomImageUpload() {
    const customImageInput = document.getElementById('custom-image');
    if (!customImageInput) return;

    customImageInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        // 使用 readFileAsDataURL 讀取原始 DataURL
        readFileAsDataURL(file).then(dataUrl => {
             selectedImage = dataUrl; // **存儲原始 DataURL**
             currentImageIdentifier = 'custom';
             console.log("自定義圖片已選擇 (未預處理), 標識符:", currentImageIdentifier);

             // 清除預設圖片選擇
             document.querySelectorAll('.image-options img.selected').forEach(img => img.classList.remove('selected'));
             // 移除舊的自定義預覽
             const imageOptions = document.querySelector('.image-options');
             if(imageOptions){
                 const existingPreview = imageOptions.querySelector('.custom-preview');
                 if (existingPreview) existingPreview.remove();
                 // 添加新的預覽
                 const preview = document.createElement('img');
                 preview.src = selectedImage; preview.alt = '自定義預覽'; preview.title = '自定義預覽';
                 preview.classList.add('selected', 'custom-preview');
                 preview.style.width = '100px'; preview.style.height = '100px'; preview.style.objectFit = 'cover';
                 imageOptions.appendChild(preview);
             }

             // 自動選擇圖片模式
             if (selectedMode !== 'image') {
                  selectedMode = 'image';
                  const imageModeBtn = document.getElementById('image-mode');
                  const numberModeBtn = document.getElementById('number-mode');
                  if(imageModeBtn) imageModeBtn.classList.add('selected');
                  if(numberModeBtn) numberModeBtn.classList.remove('selected');
                  const imageSelectionDiv = document.getElementById('image-selection');
                  if(imageSelectionDiv) imageSelectionDiv.classList.remove('hidden');
             }

        }).catch(error => {
            console.error('讀取上傳圖片失敗:', error);
            alert('讀取圖片失敗，請重試');
            selectedImage = null;
            currentImageIdentifier = '';
            e.target.value = ''; // 清除文件輸入
        });
      }
    });
}

// 顏色選擇 - 保持默認
function initColorSelection() {
    selectedColor = 'default';
}

// 初始化所有UI組件
function initUI() {
    initModeSelection();
    initImageSelection(); // Handles async loading internally now if needed
    initSizeSelection();
    initColorSelection();
    initStartGameButton();
    initGameControls();
    initCustomImageUpload();

    document.querySelectorAll('.mode-options button, .size-options button').forEach(button => {
      button.classList.add('option-button');
    });

    console.log("UI 初始化完成");
  }

  // 啟動UI初始化
  initUI();

}); // Close DOMContentLoaded event listener