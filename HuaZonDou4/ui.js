// UI互動邏輯
document.addEventListener('DOMContentLoaded', () => {
  // 遊戲設置變數
  let selectedMode = null;
  let selectedSize = null;
  let selectedImage = null; // 存儲預處理後的圖片源 (Data URL 或原始路徑)
  let selectedColor = 'default'; // 預設為暗灰條紋
  let gameInstance = null;
  let currentImageIdentifier = ''; // 新增：用於存儲穩定的圖片標識符 ('C1', 'custom', 'network', etc.)

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

  // 處理後的預設圖片 (包含 name 和預處理後的 src)
  let processedPresetImages = [];

  // 初始化圖片選擇區域
  async function initImageSelection() {
    const imageOptions = document.querySelector('.image-options');
    if (!imageOptions) return; // Add guard clause

    // 預處理所有預設圖片
    // 使用 preprocessPresetImages (從 imageUtils.js)
    if (typeof preprocessPresetImages === 'function') {
      processedPresetImages = await preprocessPresetImages(presetImages);
    } else {
      console.warn("preprocessPresetImages function not found, using original images.");
      processedPresetImages = presetImages.map(img => ({ ...img })); // Shallow copy
    }

    imageOptions.innerHTML = ''; // Clear previous options

    processedPresetImages.forEach(image => {
      const img = document.createElement('img');
      img.src = image.src; // 使用預處理後的 src
      img.alt = image.name;
      img.title = image.name;
      img.dataset.imageName = image.name; // 儲存圖片名稱用於關卡識別
      img.addEventListener('click', () => {
        document.querySelectorAll('.image-options img, .image-search-results img').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        selectedImage = image.src; // 存儲預處理後的 src
        currentImageIdentifier = image.name; // <-- 使用穩定的預設圖片名稱作為標識符
        console.log("選擇預設圖片:", currentImageIdentifier, "來源(預處理後):", selectedImage.substring(0, 30) + "...");
        // 清除自定義圖片輸入
        const customImageInput = document.getElementById('custom-image');
        if (customImageInput) customImageInput.value = '';
      });
      imageOptions.appendChild(img);
    });
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
        // highlightSelectedButton(button.id); // highlightSelectedButton will handle this now
        document.querySelectorAll('.size-options button').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        if(customSizeInput) customSizeInput.value = selectedSize; // Update custom input as well
        console.log("選擇尺寸:", selectedSize);
      });
    });

    // 自定義尺寸
    if (customSizeInput) {
        // Set initial value if selectedSize is not set by buttons
        if (!selectedSize) {
            selectedSize = parseInt(customSizeInput.value) || 4;
        } else {
            customSizeInput.value = selectedSize;
        }

        customSizeInput.addEventListener('change', (e) => {
          const value = parseInt(e.target.value);
          if (value >= 3 && value <= 10) {
            selectedSize = value;
            // Remove selection from preset buttons if custom size is used
            document.querySelectorAll('.size-options button').forEach(btn => btn.classList.remove('selected'));
            console.log("選擇自定義尺寸:", selectedSize);
          } else {
            alert('請輸入3到10之間的數字');
            e.target.value = selectedSize || 4; // Revert to previous valid size or default
          }
        });
    } else {
        // Default size if input doesn't exist
        if (!selectedSize) selectedSize = 4;
    }
  }

  // 初始化開始遊戲按鈕
  function initStartGameButton() {
    const startGameBtn = document.getElementById('start-game');
    if(!startGameBtn) return;

    startGameBtn.addEventListener('click', () => {
      if (!selectedMode) {
        alert('請選擇遊戲模式');
        return;
      }

      // Ensure selectedSize is set (use default if necessary)
      if (!selectedSize) {
         const customInput = document.getElementById('custom-size-input');
         selectedSize = customInput ? (parseInt(customInput.value) || 4) : 4;
         console.log("未選擇尺寸，使用預設或輸入值:", selectedSize);
      }

      if (selectedMode === 'image' && !selectedImage) {
        const customImageInput = document.getElementById('custom-image');
        if (customImageInput && customImageInput.files[0]) {
          const customImage = customImageInput.files[0];
          const reader = new FileReader();
          reader.onload = async (e) => {
             currentImageIdentifier = 'custom'; // 固定標識符
             try {
                 const sizeToProcess = selectedSize || 4;
                 const processedSrc = await preprocessImage(e.target.result, sizeToProcess);
                 selectedImage = processedSrc; // 更新 selectedImage 為處理後的 Data URL
                 console.log("自定義圖片處理完成, 標識符:", currentImageIdentifier);
                 startGame(selectedImage, currentImageIdentifier); // 傳遞標識符
             } catch (error) {
                 console.error('處理自定義圖片失敗:', error);
                 alert('圖片處理失敗，請嘗試其他圖片');
             }
          };
          reader.readAsDataURL(customImage);
        } else {
          alert('圖片模式下，請選擇一張圖片或上傳自定義圖片');
          return;
        }
      } else {
           // 如果 selectedImage 存在但 currentImageIdentifier 為空 (可能來自網路搜索或其他舊邏輯)
           if (selectedMode === 'image' && !currentImageIdentifier) {
               console.warn("圖片模式下 Identifier 為空，嘗試推斷...");
               if (selectedImage && selectedImage.startsWith('http')) {
                   currentImageIdentifier = 'network'; // 或嘗試從URL解析
                   console.log("推斷為網路圖片, 標識符:", currentImageIdentifier);
               } else if (selectedImage && selectedImage.startsWith('data:')) {
                    currentImageIdentifier = 'custom'; // 推斷為自定義
                    console.warn("推斷為自定義圖片 (Data URL), 標識符:", currentImageIdentifier);
               } else {
                   // 嘗試從預設圖片中找回標識符 (備用)
                   const foundPreset = processedPresetImages.find(p => p.src === selectedImage);
                   if(foundPreset) {
                       currentImageIdentifier = foundPreset.name;
                       console.log("從來源找回預設圖片標識符:", currentImageIdentifier);
                   } else {
                       currentImageIdentifier = 'unknown'; // 未知
                       console.warn("未知圖片來源, 標識符設為 unknown");
                   }
               }
           } else if (selectedMode === 'number') {
               currentImageIdentifier = ''; // 數字模式無標識符
               selectedImage = null; // 確保數字模式下圖片源為 null
           }
           // 如果 selectedMode 是 image 但 selectedImage 是 null (理論上不應發生在此處)
           else if (selectedMode === 'image' && !selectedImage) {
               alert('圖片模式下發生錯誤：找不到圖片來源。');
               return;
           }

          startGame(selectedImage, currentImageIdentifier); // 傳遞標識符
      }
    });
  }

  // 開始遊戲
  async function startGame(imageSource, imageIdentifier) { // <-- 接收標識符
    const gameSetupDiv = document.getElementById('game-setup');
    const gameBoardDiv = document.getElementById('game-board');
    if (!gameSetupDiv || !gameBoardDiv) return;

    gameSetupDiv.classList.add('hidden');
    gameBoardDiv.classList.remove('hidden');

    soundManager.playGameStartSound();

    firstSelectedBlock = null; // 重置作弊模式選擇

    const cheatButton = document.getElementById('cheat-button'); // 作弊按鈕實例

    try {
      // 圖像預處理邏輯：僅在需要時進行
      // 預設圖片和自定義上傳應已處理
      let finalImageSource = imageSource;
      if (selectedMode === 'image' && imageSource && typeof preprocessImage === 'function' && !imageSource.startsWith('data:image/jpeg')) { // 檢查是否為處理過的 jpeg Data URL
          console.log('圖像模式，來源非預期 Data URL，嘗試預處理:', imageSource.substring(0, 50) + "...");
          try {
              const sizeToProcess = selectedSize || 4;
              finalImageSource = await preprocessImage(imageSource, sizeToProcess);
              console.log("遊戲開始時預處理完成");
          } catch (error) {
              console.error('遊戲開始時圖像預處理失敗:', error);
              alert('圖像處理失敗，無法開始遊戲。請返回並重試。');
              gameBoardDiv.classList.add('hidden');
              gameSetupDiv.classList.remove('hidden');
              return;
          }
      } else if (selectedMode === 'image') {
           console.log('圖像模式，使用來源:', (finalImageSource || '').substring(0, 50) + "...");
      }

      console.log('創建遊戲實例，模式:', selectedMode, '尺寸:', selectedSize, '標識符:', imageIdentifier);
      // 確保尺寸有效
      const gameSize = selectedSize >= 3 && selectedSize <= 10 ? selectedSize : 4;
      gameInstance = new PuzzleGame(gameSize, selectedMode, finalImageSource, imageIdentifier); // <-- 傳遞標識符和有效尺寸

      // 確保遊戲實例的作弊狀態是關閉的
      gameInstance.cheatEnabled = false;

      // 重置作弊按鈕視覺狀態
      if (cheatButton) {
          cheatButton.classList.remove('active');
      }

      renderGameBoard(); // 渲染遊戲板
      gameInstance.startTimer(); // 啟動計時器

      // 載入此關卡的最高分
      loadHighScores(selectedMode, imageIdentifier, gameSize); // <-- 傳遞參數以加載正確的記錄
    } catch (error) {
      console.error('遊戲初始化失敗:', error);
      alert('遊戲初始化失敗，請重試');
      if (gameBoardDiv) gameBoardDiv.classList.add('hidden');
      if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
    }
  }

  // 渲染遊戲板
  function renderGameBoard() {
    const puzzleContainer = document.querySelector('.puzzle-container');
    if (!puzzleContainer || !gameInstance) return; // Guard clauses

    puzzleContainer.innerHTML = ''; // 清空舊板
    puzzleContainer.style.gridTemplateColumns = `repeat(${gameInstance.size}, 1fr)`;
    puzzleContainer.style.gridTemplateRows = `repeat(${gameInstance.size}, 1fr)`;
    puzzleContainer.style.setProperty('--grid-size', gameInstance.size); // For Safari compatibility

    // 確定空白塊的顏色類
    const emptyBlockColorClass = `color-${selectedColor}`;

    for (let row = 0; row < gameInstance.size; row++) {
      for (let col = 0; col < gameInstance.size; col++) {
        const block = document.createElement('div');
        block.className = 'puzzle-block';
        block.dataset.row = row; // Optional: Store position for easier debugging
        block.dataset.col = col; // Optional

        const value = gameInstance.board[row][col];

        if (value === 0) {
          block.classList.add('empty', emptyBlockColorClass);
        } else if (gameInstance.mode === 'number') {
          const numberSpan = document.createElement('span');
          numberSpan.textContent = value;
          // Basic styling for centering, more robust styling in CSS
          numberSpan.style.display = 'flex';
          numberSpan.style.alignItems = 'center';
          numberSpan.style.justifyContent = 'center';
          numberSpan.style.width = '100%';
          numberSpan.style.height = '100%';
          block.appendChild(numberSpan);
        } else if (gameInstance.mode === 'image' && gameInstance.imageSource) {
          block.classList.add('image-block');

          const originalCol = (value - 1) % gameInstance.size;
          const originalRow = Math.floor((value - 1) / gameInstance.size);

          // Use background properties directly on the block for simplicity
          // Ensure imageSource is valid before setting
          try {
              block.style.backgroundImage = `url(${gameInstance.imageSource})`;
              // Calculate background size and position based on the grid size
              const backgroundWidth = gameInstance.size * 100;
              const backgroundHeight = gameInstance.size * 100;
              const backgroundPosX = -originalCol * 100;
              const backgroundPosY = -originalRow * 100;

              block.style.backgroundSize = `${backgroundWidth}% ${backgroundHeight}%`;
              block.style.backgroundPosition = `${backgroundPosX}% ${backgroundPosY}%`;
              block.style.backgroundRepeat = 'no-repeat'; // Ensure no repeat
              block.style.border = '1px solid rgba(255,255,255,0.1)'; // Subtle border

              // Optimization hints for browsers (might be in CSS already)
              block.style.willChange = 'transform';
              block.style.transform = 'translateZ(0)'; // Promote to layer

          } catch (e) {
               console.error("Error setting background for image block:", e);
               // Optionally add fallback text or color
               block.textContent = '?';
               block.style.backgroundColor = '#ccc';
          }
        }

        puzzleContainer.appendChild(block);
      }
    }
  }


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

    // --- 按鈕事件監聽器 ---
    // 為避免重複添加監聽器，先移除舊的再添加新的，或者使用 once 選項
    const playAgainBtn = document.getElementById('play-again');
    const backToMenuBtn = document.getElementById('back-to-menu');

    const playAgainHandler = () => {
        gameCompleteDiv.classList.add('hidden');
        // 重新開始遊戲，使用相同的設置
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
        playAgainBtn.removeEventListener('click', playAgainHandler); // Remove previous listener
        playAgainBtn.addEventListener('click', playAgainHandler, { once: true }); // Add new one-time listener
    }
    if (backToMenuBtn) {
        backToMenuBtn.removeEventListener('click', backToMenuHandler); // Remove previous listener
        backToMenuBtn.addEventListener('click', backToMenuHandler, { once: true }); // Add new one-time listener
    }
  }

  // 重置遊戲設置
  function resetGameSettings() {
    selectedMode = null;
    selectedSize = null;
    selectedImage = null;
    currentImageIdentifier = ''; // 重置標識符

    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    const imageSelectionDiv = document.getElementById('image-selection');
    if(imageSelectionDiv) imageSelectionDiv.classList.add('hidden');
    const customImageInput = document.getElementById('custom-image');
    if (customImageInput) customImageInput.value = ''; // Clear file input

    // 重置模式和尺寸按鈕視覺狀態
    document.querySelectorAll('.mode-options button, .size-options button').forEach(button => button.classList.remove('selected'));
    const customSizeInput = document.getElementById('custom-size-input');
    if(customSizeInput) customSizeInput.value = 4; // Reset custom size input to default

    // 重置作弊按鈕狀態
    if (gameInstance) {
        gameInstance.cheatEnabled = false;
    }
    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) {
      cheatButton.classList.remove('active');
    }

    // 清空高分榜顯示
     const highScoresList = document.getElementById('high-scores-list');
     if (highScoresList) {
        highScoresList.innerHTML = '<div class="no-record">選擇關卡以查看記錄</div>'; // Update placeholder text
     }

     // 停止計時器（如果正在運行）
     if (gameInstance) {
         gameInstance.stopTimer();
         gameInstance = null; // Clear game instance
     }
     const timeSpan = document.getElementById('time');
     const movesSpan = document.getElementById('moves');
     if(timeSpan) timeSpan.textContent = '00:00';
     if(movesSpan) movesSpan.textContent = '0';

     console.log("遊戲設置已重置");
  }

  // 載入最高分
  function loadHighScores(mode, identifier, size) { // <-- 接收參數
    const highScoresList = document.getElementById('high-scores-list');
    if (!highScoresList) return;
    highScoresList.innerHTML = ''; // Clear previous list

    // 檢查參數有效性
    if (!mode || size === undefined || size === null) {
        highScoresList.innerHTML = '<div class="no-record">無法載入記錄：參數缺失</div>';
        return;
    }
     // 對於圖片模式，identifier 不能是 undefined 或 null，但可以是空字符串 ''
     if (mode === 'image' && identifier === undefined || identifier === null) {
        highScoresList.innerHTML = '<div class="no-record">無法載入記錄：圖片標識符缺失</div>';
        return;
     }


    const scores = StorageManager.getItem('puzzleHighScores', {});

    // 使用傳入的參數生成 key
    const key = `${mode}-${identifier}-${size}`;
    console.log("載入高分榜，Key:", key); // Debugging

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
      headers.forEach(text => {
          const th = document.createElement('th');
          th.textContent = text;
          headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');

      modeScores.forEach((score, index) => {
        const row = document.createElement('tr');

        // 直接使用儲存的數據
        const levelCell = document.createElement('td');
        // Provide fallback based on current game state if stored data is missing
        levelCell.textContent = score.levelName || (mode === 'number' ? '數字模式' : identifier || '未知圖片');
        row.appendChild(levelCell);

        const difficultyCell = document.createElement('td');
        difficultyCell.textContent = score.difficulty || `${size}x${size}`;
        row.appendChild(difficultyCell);

        const rankCell = document.createElement('td');
        rankCell.textContent = `#${index + 1}`;
        row.appendChild(rankCell);

        const timeCell = document.createElement('td');
        timeCell.textContent = score.time || 'N/A';
        row.appendChild(timeCell);

        const movesCell = document.createElement('td');
        movesCell.textContent = score.moves !== undefined ? score.moves : 'N/A';
        row.appendChild(movesCell);

        const cheatCell = document.createElement('td');
        if (score.cheatUsed) {
          cheatCell.textContent = `${score.cheatCount || 1}次`; // Default to 1 if count missing
          cheatCell.classList.add('cheat-used');
        } else {
          cheatCell.textContent = '無';
          cheatCell.classList.add('cheat-not-used');
        }
        row.appendChild(cheatCell);

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      highScoresList.appendChild(table);
    }
  }

   // 初始化遊戲控制按鈕
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
            gameInstance.resetGame(); // Resets internal state and timer
            renderGameBoard();        // Renders the new board
            updateGameStats();        // Updates moves display
            soundManager.playGameStartSound();

            // Reset cheat button state
            gameInstance.cheatEnabled = false; // Ensure instance state is reset
            const cheatButton = document.getElementById('cheat-button');
            if (cheatButton) {
                cheatButton.classList.remove('active');
            }
            console.log("遊戲已重置");
        });
    }

    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            if (gameInstance) {
                gameInstance.stopTimer();
            }
            const gameBoardDiv = document.getElementById('game-board');
            const gameSetupDiv = document.getElementById('game-setup');
            if(gameBoardDiv) gameBoardDiv.classList.add('hidden');
            if(gameSetupDiv) gameSetupDiv.classList.remove('hidden');
            resetGameSettings(); // Resets UI and clears game instance
        });
    }

    if (muteBtn) {
        // Initialize button state based on soundManager
        muteBtn.classList.toggle('active', soundManager.muted);
        muteBtn.style.backgroundColor = soundManager.muted ? '#e74c3c' : '#3498db';

        muteBtn.addEventListener('click', () => {
            const isMuted = soundManager.toggleMute();
            muteBtn.classList.toggle('active', isMuted);
            muteBtn.style.backgroundColor = isMuted ? '#e74c3c' : '#3498db'; // Update color
            // Test sound if unmuted
            if (!isMuted) {
                soundManager.playGameStartSound();
            }
        });
    }

    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            if (!gameInstance) return;
            const hintMove = gameInstance.getHint();
            if (hintMove) {
                highlightHintBlock(hintMove.row, hintMove.col);
                soundManager.playMoveSound(); // Play sound for hint
            } else {
                console.log("無法獲取提示 (可能已完成或無有效移動)");
            }
        });
    }

    if (showOriginalBtn) {
        let showingOriginal = false; // State local to this button
        showOriginalBtn.addEventListener('click', () => {
           if (gameInstance && gameInstance.mode === 'image' && gameInstance.imageSource) {
                showingOriginal = !showingOriginal;
                showOriginalBtn.classList.toggle('active', showingOriginal);
                const puzzleCont = document.querySelector('.puzzle-container');
                if (!puzzleCont) return;

                let overlay = document.getElementById('original-image-overlay');

                if (showingOriginal) {
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'original-image-overlay';
                        // Basic overlay styling, adjust in CSS for better control
                        Object.assign(overlay.style, {
                            position: 'absolute', top: '0', left: '0',
                            width: '100%', height: '100%',
                            backgroundImage: `url(${gameInstance.imageSource})`,
                            backgroundSize: 'contain', // Use contain to see the whole image
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
                            zIndex: '10', opacity: '0', transition: 'opacity 0.3s ease'
                        });
                        puzzleCont.style.position = 'relative'; // Ensure container is positioned
                        puzzleCont.appendChild(overlay);
                        // Force reflow before adding class for transition
                        void overlay.offsetWidth;
                        overlay.style.opacity = '1';
                    }
                    showOriginalBtn.textContent = '隱藏原圖';
                } else {
                    if (overlay) {
                        overlay.style.opacity = '0';
                        // Remove after transition
                        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
                    }
                    showOriginalBtn.textContent = '顯示原圖';
                }
           } else {
               alert("僅在圖片模式下可用");
           }
        });
    }

    if (changeColorBtn) {
        // Update button style function
        function updateChangeColorButtonStyle(color) {
            changeColorBtn.classList.remove('color-default-btn', 'color-blue-btn', 'color-red-btn', 'color-orange-btn');
            changeColorBtn.classList.add(`color-${color}-btn`);
            // Update background directly (optional, CSS might handle it)
             switch(color) {
                case 'default': changeColorBtn.style.backgroundColor = '#555'; break;
                case 'blue': changeColorBtn.style.backgroundColor = '#3498db'; break;
                case 'red': changeColorBtn.style.backgroundColor = '#e74c3c'; break;
                case 'orange': changeColorBtn.style.backgroundColor = '#f39c12'; break;
             }
             changeColorBtn.style.backgroundImage = (color === 'default') ? 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.2) 10px, rgba(255, 255, 255, 0.2) 20px)' : 'none';
        }

        // Set initial style
        updateChangeColorButtonStyle(selectedColor);

        changeColorBtn.addEventListener('click', () => {
            const colors = ['default', 'blue', 'red', 'orange'];
            const currentIndex = colors.indexOf(selectedColor);
            const nextIndex = (currentIndex + 1) % colors.length;
            selectedColor = colors[nextIndex];

            soundManager.playColorChangeSound();
            updateChangeColorButtonStyle(selectedColor);

            // Update empty blocks
            document.querySelectorAll('.puzzle-block.empty').forEach(block => {
                block.classList.remove('color-default', 'color-blue', 'color-red', 'color-orange');
                block.classList.add(`color-${selectedColor}`);
            });
        });
    }

    // --- 作弊按鈕邏輯修正 ---
    const gameControls = document.querySelector('.game-controls');
    let cheatButton = document.getElementById('cheat-button');
    if (!cheatButton && gameControls) { // 如果按鈕不存在則創建
        cheatButton = document.createElement('button');
        cheatButton.id = 'cheat-button';
        cheatButton.textContent = '作弊模式';
        gameControls.appendChild(cheatButton);
        console.log("作弊按鈕已創建");
    } else if (!cheatButton) {
        console.error("無法找到 .game-controls 元素以添加作弊按鈕");
        return; // Cannot proceed without cheat button container
    }

    let firstSelectedBlock = null; // Track first selected block for cheat swap

    cheatButton.addEventListener('click', () => {
        if (!gameInstance) {
            console.warn("作弊按鈕點擊：遊戲實例未初始化");
            alert("請先開始遊戲");
            return;
        }

        const currentTime = new Date();
        // Ensure startTime is valid
        const startTime = gameInstance.startTime || currentTime;
        const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);
        // Time limit: 5 minutes (300 seconds)
        const timeLimit = 5 * 60;

        // Check time limit
        if (elapsedTimeInSeconds < timeLimit) {
            const remainingSecondsTotal = timeLimit - elapsedTimeInSeconds;
            const remainingMinutes = Math.floor(remainingSecondsTotal / 60);
            const remainingSeconds = remainingSecondsTotal % 60;
            alert(`作弊模式將在 ${remainingMinutes}分${remainingSeconds}秒 後可用`);
            // Ensure button and game state remain inactive
            gameInstance.cheatEnabled = false;
            cheatButton.classList.remove('active');
            return; // Time not up, do not toggle
        }

        // --- Core fix: Toggle gameInstance's state directly ---
        gameInstance.cheatEnabled = !gameInstance.cheatEnabled;

        // Update button visual state based on the new gameInstance state
        cheatButton.classList.toggle('active', gameInstance.cheatEnabled);

        // Reset block selection state
        if (firstSelectedBlock) {
            firstSelectedBlock.element.classList.remove('cheat-selected'); // Clear visual selection
            firstSelectedBlock = null;
        }
        // Also clear any lingering selections just in case
        document.querySelectorAll('.puzzle-block.cheat-selected').forEach(block => {
            block.classList.remove('cheat-selected');
        });


        // Provide feedback
        if (gameInstance.cheatEnabled) {
            alert('作弊模式已啟用！點擊任意兩個非空白方塊進行交換。');
            soundManager.playCheatSound();
        } else {
            // Optional: Alert when disabled, or just rely on button style
            // alert('作弊模式已禁用。');
        }
        console.log("作弊模式狀態切換為:", gameInstance.cheatEnabled); // Debug
    });


    // --- Block Click Handling (Unified) ---
    if (puzzleContainer) {
        puzzleContainer.addEventListener('click', (e) => {
          if (!gameInstance) return; // Ensure game is running

          const blockElement = e.target.closest('.puzzle-block');
          if (!blockElement || blockElement.classList.contains('empty')) {
              // Clicked on gap or empty block
              if (firstSelectedBlock) {
                   // If cheat mode was active and a block was selected, deselect it
                   firstSelectedBlock.element.classList.remove('cheat-selected');
                   firstSelectedBlock = null;
                   console.log("作弊選擇已取消 (點擊空白處)");
              }
              return;
          }

          // Get block position (using gameInstance.size)
          const blocksArray = Array.from(puzzleContainer.children);
          const index = blocksArray.indexOf(blockElement);
          if (index === -1) return; // Should not happen if blockElement is valid

          const row = Math.floor(index / gameInstance.size);
          const col = index % gameInstance.size;

          // --- Cheat Mode Logic ---
          if (gameInstance.cheatEnabled) {

              // Check time limit again before allowing swap logic
              const currentTime = new Date();
              const startTime = gameInstance.startTime || currentTime;
              const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);
              const timeLimit = 5 * 60;
              if (elapsedTimeInSeconds < timeLimit) {
                  alert('作弊功能尚未啟用 (未滿5分鐘)。');
                  // Force disable cheat state if somehow activated early
                  gameInstance.cheatEnabled = false;
                  if(cheatButton) cheatButton.classList.remove('active');
                  if (firstSelectedBlock) { // Clear selection
                      firstSelectedBlock.element.classList.remove('cheat-selected');
                      firstSelectedBlock = null;
                  }
                  return;
              }


              if (!firstSelectedBlock) {
                // Select first block
                firstSelectedBlock = { row, col, element: blockElement };
                blockElement.classList.add('cheat-selected');
                console.log("作弊選擇1:", `(${row},${col})`);
              } else {
                // Select second block
                 console.log("作弊選擇2:", `(${row},${col})`);

                // Check if clicking the same block again to deselect
                if (firstSelectedBlock.row === row && firstSelectedBlock.col === col) {
                  blockElement.classList.remove('cheat-selected');
                  firstSelectedBlock = null;
                  console.log("作弊取消選擇 (重覆點擊)");
                  return;
                }

                // Perform the swap via gameInstance
                const { row: row1, col: col1 } = firstSelectedBlock;
                const swapped = gameInstance.cheatSwap(row1, col1, row, col);

                // Clear visual selection regardless of swap success
                firstSelectedBlock.element.classList.remove('cheat-selected');
                firstSelectedBlock = null;

                if (swapped) {
                  // If swap was successful (not an empty block, etc.)
                  requestAnimationFrame(() => { // Use rAF for smoother update
                      renderGameBoard();
                      updateGameStats();
                      if (gameInstance.checkWin()) {
                          gameComplete();
                      }
                  });
                }
              }
          }
          // --- Normal Mode Logic ---
          else {
            // Check if the clicked block is adjacent to the empty space
            if (gameInstance.isAdjacent(row, col)) {
              const moved = gameInstance.moveBlock(row, col); // moveBlock handles swap & sound
              if (moved) {
                 requestAnimationFrame(() => { // Use rAF for smoother update
                    renderGameBoard();
                    updateGameStats(); // Update moves display
                    if (gameInstance.checkWin()) {
                       gameComplete();
                    }
                 });
              }
            }
            // Else: Clicked a non-movable block in normal mode - do nothing
          }
        }, true); // Use capture phase
    } else {
        console.error("無法找到 .puzzle-container 元素以添加點擊監聽器");
    }
  }

  // 高亮提示的方塊
  function highlightHintBlock(row, col) {
    if (!gameInstance) return;
    // Remove previous hints
    document.querySelectorAll('.puzzle-block.hint').forEach(block => {
      block.classList.remove('hint');
    });

    const index = row * gameInstance.size + col;
    const blocks = document.querySelectorAll('.puzzle-container .puzzle-block');

    if (blocks && blocks[index]) {
      blocks[index].classList.add('hint');

      // Remove highlight after 3 seconds
      setTimeout(() => {
         // Check if the block still exists and has the class before removing
         if (blocks[index] && blocks[index].classList.contains('hint')) {
            blocks[index].classList.remove('hint');
         }
      }, 3000);
    }
  }

  // 初始化自定义图片上传
  function initCustomImageUpload() {
    const customImageInput = document.getElementById('custom-image');
    if (!customImageInput) return;

    customImageInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            // Use currently selected size or default for preprocessing
            const size = selectedSize || 4;
            const processedImage = await preprocessImage(event.target.result, size);
            selectedImage = processedImage; // Store the processed Data URL
            currentImageIdentifier = 'custom'; // Set identifier
            console.log("自定義圖片已選擇並預處理, 標識符:", currentImageIdentifier);

            // Clear preset image selection
             document.querySelectorAll('.image-options img, .image-search-results img').forEach(img => img.classList.remove('selected'));

            // Optional: Show preview (could reuse image-options)
            const imageOptions = document.querySelector('.image-options');
            if (imageOptions) {
                // Remove previous custom preview if exists
                const existingPreview = imageOptions.querySelector('.custom-preview');
                if (existingPreview) {
                  imageOptions.removeChild(existingPreview);
                }
                // Add new preview
                const preview = document.createElement('img');
                preview.src = selectedImage;
                preview.alt = '自定義預覽';
                preview.title = '自定義預覽';
                preview.classList.add('selected', 'custom-preview'); // Mark as selected and custom
                preview.style.width = '100px'; // Match preset style
                preview.style.height = '100px';
                preview.style.objectFit = 'cover';
                imageOptions.appendChild(preview);

                 // Automatically select image mode if a custom image is uploaded
                 if (selectedMode !== 'image') {
                      selectedMode = 'image';
                      const imageModeBtn = document.getElementById('image-mode');
                      const numberModeBtn = document.getElementById('number-mode');
                      if(imageModeBtn) imageModeBtn.classList.add('selected');
                      if(numberModeBtn) numberModeBtn.classList.remove('selected');
                      const imageSelectionDiv = document.getElementById('image-selection');
                      if(imageSelectionDiv) imageSelectionDiv.classList.remove('hidden');
                 }
            }


          } catch (error) {
            console.error('處理上傳圖片失敗:', error);
            alert('圖片處理失敗，請嘗試其他圖片');
            selectedImage = null; // Clear selection on error
            currentImageIdentifier = '';
            e.target.value = ''; // Clear the file input
          }
        };
        reader.readAsDataURL(e.target.files[0]);
      } else {
          // No file selected, potentially clear selection?
          // selectedImage = null;
          // currentImageIdentifier = '';
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
    initImageSelection(); // Should be called after mode selection setup maybe? Or handle async loading
    initSizeSelection();
    initColorSelection();
    initStartGameButton();
    initGameControls(); // Sets up buttons including cheat button listener
    initCustomImageUpload();

    // Add helper class (optional)
    document.querySelectorAll('.mode-options button, .size-options button').forEach(button => {
      button.classList.add('option-button');
    });

    console.log("UI 初始化完成");
  }

  // 啟動UI初始化
  initUI();

}); // Close DOMContentLoaded event listener