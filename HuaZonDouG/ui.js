// ui.js (完整修正版 - 優化 DOM 更新以提高 Safari 效能)
document.addEventListener('DOMContentLoaded', () => {
  // 遊戲設置變數
  let selectedMode = null;
  let selectedSize = null;
  let selectedImage = null; // 存儲原始 src 或預處理過的 src
  let selectedColor = 'default';
  let gameInstance = null;
  let currentImageIdentifier = '';

  // --- 新增：用於存儲方塊 DOM 元素的陣列 ---
  let blockElements = [];
  // ------------------------------------------

  // 預設圖片 (保持不變)
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
  let processedPresetImages = [];

  async function initImageSelection() {
    const imageOptions = document.querySelector('.image-options');
    if (!imageOptions) return;
    try {
        if (typeof preprocessPresetImages === 'function') {
            processedPresetImages = await preprocessPresetImages(presetImages);
            console.log("預設圖片已預處理 (假設)");
        } else {
            console.warn("preprocessPresetImages 函數不可用，將使用原始圖片");
            processedPresetImages = presetImages.map(img => ({ ...img }));
        }
    } catch (error) {
        console.error("預處理預設圖片時出錯:", error, "將使用原始圖片");
        processedPresetImages = presetImages.map(img => ({ ...img }));
    }
    imageOptions.innerHTML = '';
    processedPresetImages.forEach(image => {
      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.name; img.title = image.name; img.dataset.imageName = image.name;
      img.addEventListener('click', () => {
        document.querySelectorAll('.image-options img.selected').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        selectedImage = image.src;
        currentImageIdentifier = image.name;
        console.log("選擇預設圖片:", currentImageIdentifier);
        const customInput = document.getElementById('custom-image'); if (customInput) customInput.value = '';
        const customPreview = document.querySelector('.image-options .custom-preview'); if (customPreview) customPreview.remove();
      });
      imageOptions.appendChild(img);
    });
  }

  function initModeSelection() {
    document.getElementById('number-mode').addEventListener('click', () => {
      selectedMode = 'number'; document.getElementById('image-selection').classList.add('hidden'); highlightSelectedButton('number-mode');
      selectedImage = null; currentImageIdentifier = '';
      document.querySelectorAll('.image-options img.selected').forEach(i => i.classList.remove('selected'));
      const cp = document.querySelector('.image-options .custom-preview'); if (cp) cp.remove();
      const ci = document.getElementById('custom-image'); if (ci) ci.value = '';
    });
    document.getElementById('image-mode').addEventListener('click', () => {
      selectedMode = 'image'; document.getElementById('image-selection').classList.remove('hidden'); highlightSelectedButton('image-mode');
    });
  }

  function highlightSelectedButton(id) {
    const buttons = document.querySelectorAll('.mode-options button, .size-options button');
    buttons.forEach(button => button.classList.remove('selected'));
    const element = document.getElementById(id); if (element) element.classList.add('selected');
    document.querySelectorAll('.size-options button').forEach(btn => { if(parseInt(btn.dataset.size) === selectedSize) btn.classList.add('selected'); else btn.classList.remove('selected'); });
  }

  function initSizeSelection() {
    const sizeButtons = document.querySelectorAll('.size-options button');
    const customSizeInput = document.getElementById('custom-size-input');
    sizeButtons.forEach(button => { button.addEventListener('click', () => { selectedSize = parseInt(button.dataset.size); document.querySelectorAll('.size-options button').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); if(customSizeInput) customSizeInput.value = selectedSize; }); });
    if (customSizeInput) { if(!selectedSize) selectedSize = parseInt(customSizeInput.value) || 4; else customSizeInput.value = selectedSize; customSizeInput.addEventListener('change', (e) => { const v = parseInt(e.target.value); if (v>=3&&v<=10) { selectedSize = v; document.querySelectorAll('.size-options button').forEach(b => b.classList.remove('selected'));} else { alert('請輸入3到10'); e.target.value = selectedSize||4; } }); }
    else if (!selectedSize) selectedSize = 4;
  }

  function initStartGameButton() {
    document.getElementById('start-game').addEventListener('click', () => {
      if (!selectedMode) { alert('請選擇遊戲模式'); return; }
      if (!selectedSize) selectedSize = parseInt(document.getElementById('custom-size-input').value) || 4;
      const gameSize = selectedSize >= 3 && selectedSize <= 10 ? selectedSize : 4;
      let imageSourceForGame = selectedImage; let identifierForGame = '';

      if (selectedMode === 'image') {
          const customImageInput = document.getElementById('custom-image');
          if (customImageInput && customImageInput.files[0]) {
              console.log("檢測到自定義文件，將讀取..."); identifierForGame = 'custom';
              const reader = new FileReader();
              reader.onload = (e) => { imageSourceForGame = e.target.result; console.log("自定義圖片讀取完成"); startGame(imageSourceForGame, identifierForGame, gameSize); };
              reader.onerror = () => { alert("讀取自定義圖片失敗"); }; reader.readAsDataURL(customImageInput.files[0]); return;
          }
          else if (selectedImage && currentImageIdentifier) {
              identifierForGame = currentImageIdentifier; console.log(`使用已選圖片: ${identifierForGame}`); startGame(imageSourceForGame, identifierForGame, gameSize);
          } else { alert('圖片模式下，請選擇或上傳圖片'); return; }
      } else { identifierForGame = ''; imageSourceForGame = null; startGame(imageSourceForGame, identifierForGame, gameSize); }
    });
  }

  async function startGame(imageSource, identifier, size) {
    const gameSetupDiv = document.getElementById('game-setup'); const gameBoardDiv = document.getElementById('game-board');
    if (!gameSetupDiv || !gameBoardDiv) return;
    gameSetupDiv.classList.add('hidden'); gameBoardDiv.classList.remove('hidden');

    // --- 新增：清空舊的方塊元素引用 ---
    blockElements = [];
    // ----------------------------------

    let finalImageSource = imageSource;
    if (selectedMode === 'image' && imageSource && typeof preprocessImage === 'function') {
        console.log("startGame: 嘗試預處理圖片...");
        try {
            finalImageSource = await preprocessImage(imageSource, size);
            console.log("startGame: 圖片預處理完成");
        } catch (error) {
            console.error("startGame: 圖片預處理失敗:", error);
            alert("圖片處理失敗，無法開始遊戲");
            if (gameBoardDiv) gameBoardDiv.classList.add('hidden');
            if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
            return;
        }
    }

    let cheatMode = false; let firstSelectedBlock = null;
    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }

    try {
      console.log('創建遊戲實例，模式:', selectedMode, '尺寸:', size, '標識符:', identifier);
      gameInstance = new PuzzleGame(size, selectedMode, finalImageSource);

      if (gameInstance) {
          gameInstance.imageIdentifier = identifier || gameInstance.determineImageIdentifier(finalImageSource);
          console.log("手動設置 imageIdentifier 為:", gameInstance.imageIdentifier);

         renderGameBoard(); // <--- 首次渲染遊戲板
         gameInstance.startTimer();
         loadHighScores(selectedMode, gameInstance.imageIdentifier, size);
         soundManager.playGameStartSound();
         gameInstance.cheatEnabled = false;
      } else { throw new Error("遊戲實例創建失敗"); }

    } catch (error) {
      console.error('遊戲初始化或啟動失敗:', error); alert('遊戲初始化失敗');
      if (gameBoardDiv) gameBoardDiv.classList.add('hidden'); if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
    }
  }

  // --- 修改：renderGameBoard - 創建並儲存方塊元素 ---
  function renderGameBoard() {
      const puzzleContainer = document.querySelector('.puzzle-container');
      if (!puzzleContainer || !gameInstance) { console.error("Render Error: No container or game instance"); return; }

      puzzleContainer.innerHTML = ''; // 清空容器
      blockElements = []; // 清空舊的元素引用
      const currentSize = gameInstance.size;
      puzzleContainer.style.gridTemplateColumns = `repeat(${currentSize}, 1fr)`;
      puzzleContainer.style.gridTemplateRows = `repeat(${currentSize}, 1fr)`;
      puzzleContainer.style.setProperty('--grid-size', currentSize);

      const fragment = document.createDocumentFragment(); // 使用文檔片段提高性能

      for (let row = 0; row < currentSize; row++) {
        for (let col = 0; col < currentSize; col++) {
          const block = document.createElement('div');
          block.className = 'puzzle-block';
          const value = gameInstance.board[row][col];

          // --- 新增：設置 data 屬性用於標識和更新 ---
          block.dataset.row = row;
          block.dataset.col = col;
          block.dataset.value = value; // 存儲當前塊的值
          // 設置初始 grid 位置 (CSS 從 1 開始)
          block.style.gridRowStart = row + 1;
          block.style.gridColumnStart = col + 1;
          // ---------------------------------------

          if (value === 0) {
            block.classList.add('empty');
            block.classList.add(`color-${selectedColor}`);
          } else if (selectedMode === 'number') {
            const numberSpan = document.createElement('span');
            numberSpan.textContent = value;
            numberSpan.style.cssText = 'display:flex; align-items:center; justify-content:center; width:100%; height:100%;';
            block.appendChild(numberSpan);
          } else { // 圖片模式
            block.classList.add('image-block');
            const originalCol = (value - 1) % currentSize;
            const originalRow = Math.floor((value - 1) / currentSize);

            block.style.position = 'relative'; // 保持 relative
            block.style.overflow = 'hidden'; // 保持 hidden
            const imgContainer = document.createElement('div');
            // --- 新增：為內部 div 添加 data-value ---
            imgContainer.dataset.value = value;
            // -------------------------------------
            imgContainer.style.position = 'absolute';
            imgContainer.style.width = `${currentSize * 100}%`;
            imgContainer.style.height = `${currentSize * 100}%`;
            if (gameInstance.imageSource) {
                 imgContainer.style.backgroundImage = `url(${gameInstance.imageSource})`;
                 imgContainer.style.backgroundSize = 'cover'; // 保持 cover
                 imgContainer.style.backgroundRepeat = 'no-repeat'; // 保持 no-repeat
            } else {
                 console.error("渲染錯誤：圖片模式但 imageSource 為空");
                 block.textContent = 'X';
                 block.style.backgroundColor = 'red';
            }
            // Safari 優化 (保持)
            imgContainer.style.transform = 'translateZ(0)'; imgContainer.style.webkitTransform = 'translateZ(0)'; imgContainer.style.webkitBackfaceVisibility = 'hidden'; imgContainer.style.webkitPerspective = '1000'; imgContainer.style.willChange = 'transform'; imgContainer.style.transition = 'none';
            // 定位 (保持)
            const offsetX = -originalCol * 100; const offsetY = -originalRow * 100;
            imgContainer.style.left = `${offsetX}%`; imgContainer.style.top = `${offsetY}%`;

            block.appendChild(imgContainer);
            // 邊框 (保持)
            block.style.boxSizing = 'border-box'; block.style.border = '1px solid rgba(255,255,255,0.2)';
            block.style.backgroundRepeat = 'no-repeat';
          }

          fragment.appendChild(block); // 添加到文檔片段
          // --- 新增：將元素添加到 blockElements ---
          // blockElements[index] = block; // 按索引存儲，或使用其他方式
          // 使用 row/col 作為 key 可能更直觀
          blockElements.push(block); // 直接推入數組，後續查找
          // ------------------------------------
        }
      }
      puzzleContainer.appendChild(fragment); // 一次性添加到 DOM
      console.log("遊戲板渲染完成 (首次)");
  }

  // --- 新增：更新遊戲板視圖 (僅移動方塊) ---
  function updateGameBoardView(moveDetails) {
      if (!gameInstance || !blockElements || blockElements.length === 0) return;
      // console.log('updateGameBoardView called with:', moveDetails);

      // moveDetails 可以是 moveBlock 或 cheatSwap 返回的信息
      // 示例格式 (需要 game.js 配合返回):
      // For moveBlock: { movedValue: 5, oldRow: 2, oldCol: 1, newRow: 3, newCol: 1 } (newRow/Col 是空塊的新位置)
      // For cheatSwap: { block1: { value: 5, row: 1, col: 1 }, block2: { value: 10, row: 2, col: 2 } }

      const currentSize = gameInstance.size;

      if (moveDetails.type === 'move') {
          // --- 處理單步移動 ---
          const { movedValue, oldRow, oldCol, newRow, newCol } = moveDetails;

          // 找到移動的方塊 DOM 元素 (原來的非空塊)
          const movedElement = blockElements.find(el => parseInt(el.dataset.row) === oldRow && parseInt(el.dataset.col) === oldCol);
          // 找到空方塊 DOM 元素 (原來的空塊)
          const emptyElement = blockElements.find(el => el.classList.contains('empty'));

          if (!movedElement || !emptyElement) {
              console.error("Update Error: Cannot find moved or empty element");
              renderGameBoard(); // 出錯時回退到完全重繪
              return;
          }

          // 1. 更新移動方塊的位置和 data 屬性
          movedElement.style.gridRowStart = newRow + 1;
          movedElement.style.gridColumnStart = newCol + 1;
          movedElement.dataset.row = newRow;
          movedElement.dataset.col = newCol;

          // 2. 更新空方塊的位置和 data 屬性
          emptyElement.style.gridRowStart = oldRow + 1;
          emptyElement.style.gridColumnStart = oldCol + 1;
          emptyElement.dataset.row = oldRow;
          emptyElement.dataset.col = oldCol;

          // 3. 交換 class 和內容 (重要!)
          movedElement.classList.add('empty', `color-${selectedColor}`);
          movedElement.classList.remove('image-block'); // 如果是圖片模式，移除
          movedElement.innerHTML = ''; // 清空內容 (數字或圖片內部div)
          movedElement.dataset.value = 0; // 更新 data-value

          emptyElement.classList.remove('empty', 'color-default', 'color-blue', 'color-red', 'color-orange');
          emptyElement.dataset.value = movedValue; // 更新 data-value

          if (selectedMode === 'number') {
              const numberSpan = document.createElement('span');
              numberSpan.textContent = movedValue;
              numberSpan.style.cssText = 'display:flex; align-items:center; justify-content:center; width:100%; height:100%;';
              emptyElement.appendChild(numberSpan);
          } else { // 圖片模式
              emptyElement.classList.add('image-block');
              const originalCol = (movedValue - 1) % currentSize;
              const originalRow = Math.floor((movedValue - 1) / currentSize);

              const imgContainer = document.createElement('div');
              imgContainer.dataset.value = movedValue; // 設置 data-value
              imgContainer.style.position = 'absolute';
              imgContainer.style.width = `${currentSize * 100}%`;
              imgContainer.style.height = `${currentSize * 100}%`;
              if (gameInstance.imageSource) {
                   imgContainer.style.backgroundImage = `url(${gameInstance.imageSource})`;
                   imgContainer.style.backgroundSize = 'cover';
                   imgContainer.style.backgroundRepeat = 'no-repeat';
              }
              imgContainer.style.transform = 'translateZ(0)'; imgContainer.style.webkitTransform = 'translateZ(0)'; imgContainer.style.webkitBackfaceVisibility = 'hidden'; imgContainer.style.webkitPerspective = '1000'; imgContainer.style.willChange = 'transform'; imgContainer.style.transition = 'none';
              const offsetX = -originalCol * 100; const offsetY = -originalRow * 100;
              imgContainer.style.left = `${offsetX}%`; imgContainer.style.top = `${offsetY}%`;
              emptyElement.appendChild(imgContainer);
              emptyElement.style.border = '1px solid rgba(255,255,255,0.2)'; // 確保邊框存在
          }

          // console.log(`Moved block ${movedValue} to (${newRow},${newCol}), empty to (${oldRow},${oldCol})`);

      } else if (moveDetails.type === 'cheat') {
          // --- 處理作弊交換 ---
          const { block1, block2 } = moveDetails; // block1/2 = { value, row, col }

          const element1 = blockElements.find(el => parseInt(el.dataset.row) === block1.row && parseInt(el.dataset.col) === block1.col);
          const element2 = blockElements.find(el => parseInt(el.dataset.row) === block2.row && parseInt(el.dataset.col) === block2.col);

          if (!element1 || !element2) {
              console.error("Update Error: Cannot find cheat swap elements");
              renderGameBoard(); // 出錯時回退到完全重繪
              return;
          }

          // 1. 交換 Grid 位置
          const tempRow = element1.style.gridRowStart;
          const tempCol = element1.style.gridColumnStart;
          element1.style.gridRowStart = element2.style.gridRowStart;
          element1.style.gridColumnStart = element2.style.gridColumnStart;
          element2.style.gridRowStart = tempRow;
          element2.style.gridColumnStart = tempCol;

          // 2. 交換 data 屬性 (row/col)
          const tempDatasetRow = element1.dataset.row;
          const tempDatasetCol = element1.dataset.col;
          element1.dataset.row = element2.dataset.row;
          element1.dataset.col = element2.dataset.col;
          element2.dataset.row = tempDatasetRow;
          element2.dataset.col = tempDatasetCol;

          // 注意： cheatSwap 不交換 value，game.js 內部已經處理了 board 數據
          // UI 層面只需要交換位置即可，不需要更新內容或 data-value

          // 移除可能存在的作弊高亮
          element1.classList.remove('cheat-selected');
          element2.classList.remove('cheat-selected');

          // console.log(`Cheated swap UI for ${block1.value} at (${block1.row},${block1.col}) and ${block2.value} at (${block2.row},${block2.col})`);
      } else {
          console.error("Update Error: Unknown moveDetails type", moveDetails);
          renderGameBoard(); // 未知類型，重繪
      }
  }
  // --- 新增結束 ---

  function updateGameStats() { if(gameInstance) document.getElementById('moves').textContent = gameInstance.moves; }

  // --- 修改：gameComplete - 確保清理事宜 ---
  function gameComplete() {
    if (!gameInstance) return;
    gameInstance.stopTimer(); // <--- 確保計時器停止
    soundManager.playWinSound();
    // let cheatMode = false; let firstSelectedBlock = null; // 保留局部變量重置
    const cheatButton = document.getElementById('cheat-button'); if (cheatButton) cheatButton.classList.remove('active');
    if (gameInstance) gameInstance.cheatEnabled = false; // 重置作弊狀態

    const gameBoardDiv = document.getElementById('game-board'); const gameCompleteDiv = document.getElementById('game-complete');
    if (!gameBoardDiv || !gameCompleteDiv) return;
    gameBoardDiv.classList.add('hidden'); gameCompleteDiv.classList.remove('hidden');
    const timeEl = document.getElementById('time'); const completionTimeEl = document.getElementById('completion-time'); const completionMovesEl = document.getElementById('completion-moves');
    if (completionTimeEl && timeEl) completionTimeEl.textContent = timeEl.textContent; if (completionMovesEl) completionMovesEl.textContent = gameInstance.moves;
    const completionStats = document.querySelector('.completion-stats');
    if (completionStats) {
        const existingCheatInfo = document.getElementById('completion-cheat-info'); if (existingCheatInfo) completionStats.removeChild(existingCheatInfo);
        const cheatInfo = document.createElement('p'); cheatInfo.id = 'completion-cheat-info';
        if (gameInstance.cheatCount > 0) { cheatInfo.innerHTML = `<strong>作弊模式:</strong> <span class="cheat-used">使用了 ${gameInstance.cheatCount} 次</span>`; } else { cheatInfo.innerHTML = `<strong>作弊模式:</strong> <span class="cheat-not-used">未使用</span>`; }
        completionStats.appendChild(cheatInfo);
    }
    gameInstance.saveHighScore();
    const playAgainBtn = document.getElementById('play-again'); const backToMenuBtn = document.getElementById('back-to-menu');

    // --- 修改：再玩一次需要清空 blockElements ---
    const playAgainHandler = () => {
        gameCompleteDiv.classList.add('hidden');
        if (gameInstance) {
            // blockElements = []; // 清空引用，startGame 會重新生成
            startGame(gameInstance.imageSource, gameInstance.imageIdentifier, gameInstance.size); // 重新開始
        }
    };
    // -----------------------------------------
    const backToMenuHandler = () => {
        gameCompleteDiv.classList.add('hidden');
        document.getElementById('game-setup').classList.remove('hidden');
        resetGameSettings();
    };
    if(playAgainBtn){ playAgainBtn.removeEventListener('click', playAgainHandler); playAgainBtn.addEventListener('click', playAgainHandler, {once: true});}
    if(backToMenuBtn){ backToMenuBtn.removeEventListener('click', backToMenuHandler); backToMenuBtn.addEventListener('click', backToMenuHandler, {once: true});}
  }

  // --- 修改：resetGameSettings - 清空 blockElements ---
  function resetGameSettings() {
    selectedMode = null; selectedSize = null; selectedImage = null; currentImageIdentifier = '';
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    const imgSel = document.getElementById('image-selection'); if(imgSel) imgSel.classList.add('hidden');
    // let cheatMode = false; // 局部變量無需全局重置
    if (gameInstance) gameInstance.cheatEnabled = false; // 重置實例狀態
    const cheatButton = document.getElementById('cheat-button'); if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }
    const customPreview = document.querySelector('.image-options .custom-preview'); if(customPreview) customPreview.remove();
    const customInput = document.getElementById('custom-image'); if(customInput) customInput.value='';
    const highScoresList = document.getElementById('high-scores-list'); if (highScoresList) highScoresList.innerHTML = '<div class="no-record">選擇關卡以查看記錄</div>';
    if (gameInstance) { gameInstance.stopTimer(); gameInstance = null; }
    // --- 新增：清空元素引用 ---
    blockElements = [];
    // ------------------------
    console.log("遊戲設置已重置");
  }

  // 載入高分榜 (保持不變)
  function loadHighScores(mode, identifier, size) {
      const highScoresList = document.getElementById('high-scores-list');
      if (!highScoresList) { console.error("High score list element not found!"); return; }
      highScoresList.innerHTML = '';
      if (!mode || size === undefined || size === null || (mode === 'image' && (identifier === undefined || identifier === null))) { highScoresList.innerHTML = '<div class="no-record">參數錯誤無法載入記錄</div>'; return; }
      const scores = StorageManager.getItem('puzzleHighScores', {}); const key = `${mode}-${identifier}-${size}`; console.log("載入高分榜，Key:", key);
      const modeScores = Array.isArray(scores[key]) ? scores[key] : [];
      if (modeScores.length === 0) { const noRec = document.createElement('div'); noRec.textContent = '此關卡暫無記錄'; noRec.classList.add('no-record'); highScoresList.appendChild(noRec); }
      else {
        const table = document.createElement('table'); table.classList.add('high-scores-table'); const thead = document.createElement('thead'); const headerRow = document.createElement('tr'); const headers = ['關卡', '難度', '排名', '時間', '步數', '作弊']; headers.forEach(text => { const th = document.createElement('th'); th.textContent = text; headerRow.appendChild(th); }); thead.appendChild(headerRow); table.appendChild(thead);
        const tbody = document.createElement('tbody');
        modeScores.forEach((score, index) => {
          const row = document.createElement('tr');
          const levelCell = document.createElement('td'); levelCell.textContent = score.levelName || (mode === 'number' ? '數字模式' : identifier || '未知'); row.appendChild(levelCell);
          const diffCell = document.createElement('td'); diffCell.textContent = score.difficulty || `${size}x${size}`; row.appendChild(diffCell);
          const rankCell = document.createElement('td'); rankCell.textContent = `#${index + 1}`; row.appendChild(rankCell);
          const timeCell = document.createElement('td'); timeCell.textContent = score.time || 'N/A'; row.appendChild(timeCell);
          const movesCell = document.createElement('td'); movesCell.textContent = score.moves !== undefined ? score.moves : 'N/A'; row.appendChild(movesCell);
          const cheatCell = document.createElement('td'); if (score.cheatUsed) { cheatCell.textContent = `${score.cheatCount || 1}次`; cheatCell.classList.add('cheat-used'); } else { cheatCell.textContent = '無'; cheatCell.classList.add('cheat-not-used'); } row.appendChild(cheatCell);
          tbody.appendChild(row);
        });
        table.appendChild(tbody); highScoresList.appendChild(table);
      }
      const scoreTitle = document.querySelector('.high-scores h3'); if(scoreTitle) scoreTitle.style.display = 'block';
  }

  // --- 修改：initGameControls - 使用新的更新邏輯 ---
  function initGameControls() {
      // 重置遊戲按鈕: 需要調用 renderGameBoard 完全重繪
      document.getElementById('reset-game').addEventListener('click', () => {
          if (!gameInstance) return;
          gameInstance.resetGame(); // game.js 內部會處理計時器和數據
          renderGameBoard(); // <--- 完全重繪
          soundManager.playGameStartSound();
          // cheatMode = false; // 局部變量無需操作
          if (gameInstance) gameInstance.cheatEnabled = false; // 重置實例狀態
          const cheatButton = document.getElementById('cheat-button');
          if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }
          // 清除高亮
          document.querySelectorAll('.puzzle-block.hint, .puzzle-block.cheat-selected').forEach(b => b.classList.remove('hint', 'cheat-selected'));
          firstSelectedBlock = null; // 重置作弊選擇
      });

      // 新遊戲按鈕 (保持不變)
      document.getElementById('new-game').addEventListener('click', () => {
          if (gameInstance) gameInstance.stopTimer();
          document.getElementById('game-board').classList.add('hidden');
          document.getElementById('game-setup').classList.remove('hidden');
          resetGameSettings(); // 會清空 gameInstance 和 blockElements
      });

      // 靜音按鈕 (保持不變)
      const muteButton = document.getElementById('mute-button');
      if (muteButton) muteButton.addEventListener('click', () => { const isMuted = soundManager.toggleMute(); muteButton.classList.toggle('active', isMuted); muteButton.style.backgroundColor = isMuted ? '#e74c3c' : '#3498db'; if (!isMuted) soundManager.playGameStartSound(); });

      // 提示按鈕 (保持不變, highlightHintBlock 仍操作 DOM class)
      const hintButton = document.getElementById('hint-button');
      if (hintButton) hintButton.addEventListener('click', () => { if (!gameInstance) return; const hintMove = gameInstance.getHint(); if (hintMove) { highlightHintBlock(hintMove.row, hintMove.col); soundManager.playMoveSound(); } });

      // 顯示原圖按鈕 (保持不變)
      const showOriginalButton = document.getElementById('show-original-button');
      if (showOriginalButton) { let showingOriginal = false; showOriginalButton.addEventListener('click', () => { if(!gameInstance || gameInstance.mode !== 'image' || !gameInstance.imageSource){ alert("僅圖片模式可用"); return;} showingOriginal = !showingOriginal; showOriginalButton.classList.toggle('active', showingOriginal); const puzzleContainer = document.querySelector('.puzzle-container'); if(!puzzleContainer) return; let overlay = document.getElementById('original-image-overlay'); if (showingOriginal) { if (!overlay) { overlay = document.createElement('div'); overlay.id = 'original-image-overlay'; Object.assign(overlay.style, { position:'absolute', top:'0', left:'0', width:'100%', height:'100%', backgroundImage:`url(${gameInstance.imageSource})`, backgroundSize:'contain', backgroundPosition:'center', backgroundRepeat:'no-repeat', zIndex:'10', opacity:'0.9', transition:'opacity 0.3s ease' }); puzzleContainer.style.position = 'relative'; puzzleContainer.appendChild(overlay); } showOriginalButton.textContent = '隱藏原圖'; } else { if (overlay) overlay.remove(); showOriginalButton.textContent = '顯示原圖'; } }); }

      // 換色按鈕 (保持不變)
      const changeColorButton = document.getElementById('change-color-button');
      if (changeColorButton) { function updateChangeColorButtonStyle(color) { changeColorButton.classList.remove('color-default-btn', 'color-blue-btn', 'color-red-btn', 'color-orange-btn'); changeColorButton.classList.add(`color-${color}-btn`); switch(color){ case 'default': changeColorButton.style.backgroundColor = '#555'; changeColorButton.style.backgroundImage = 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.2) 10px, rgba(255, 255, 255, 0.2) 20px)'; break; case 'blue': changeColorButton.style.backgroundColor = '#3498db'; changeColorButton.style.backgroundImage = 'none'; break; case 'red': changeColorButton.style.backgroundColor = '#e74c3c'; changeColorButton.style.backgroundImage = 'none'; break; case 'orange': changeColorButton.style.backgroundColor = '#f39c12'; changeColorButton.style.backgroundImage = 'none'; break; } } updateChangeColorButtonStyle(selectedColor); changeColorButton.addEventListener('click', () => { const colors = ['default', 'blue', 'red', 'orange']; const currentIndex = colors.indexOf(selectedColor); const nextIndex = (currentIndex + 1) % colors.length; selectedColor = colors[nextIndex]; soundManager.playColorChangeSound(); updateChangeColorButtonStyle(selectedColor); document.querySelectorAll('.puzzle-block.empty').forEach(block => { block.classList.remove('color-default', 'color-blue', 'color-red', 'color-orange'); block.classList.add(`color-${selectedColor}`); }); }); }

      // 作弊按鈕 (邏輯不變，但後續調用 updateGameBoardView)
      const gameControls = document.querySelector('.game-controls');
      let cheatButton = document.getElementById('cheat-button');
      if (!cheatButton && gameControls) {
           cheatButton = document.createElement('button'); cheatButton.id = 'cheat-button'; cheatButton.textContent = '作弊模式'; gameControls.appendChild(cheatButton);
      }
      let cheatMode = false; // 局部變量控制模式
      let firstSelectedBlock = null; // 局部變量存儲首次點擊
      if(cheatButton) {
           cheatButton.addEventListener('click', () => {
               if (!gameInstance || !gameInstance.startTime) return;
               const currentTime = new Date();
               const elapsedTimeInSeconds = Math.floor((currentTime - (gameInstance.startTime || currentTime)) / 1000);
               const timeLimit = 5 * 60; // 5 分鐘
               if (elapsedTimeInSeconds < timeLimit && gameInstance.cheatCount === 0) { // 首次作弊才檢查時間
                  const remMin = Math.floor((timeLimit - elapsedTimeInSeconds) / 60);
                  const remSec = (timeLimit - elapsedTimeInSeconds) % 60;
                  alert(`作弊模式將在 ${remMin}分${remSec}秒 後可用`); return;
               }
               cheatMode = !cheatMode; // 切換局部模式狀態
               cheatButton.classList.toggle('active', cheatMode);
               if(gameInstance) gameInstance.cheatEnabled = cheatMode; // 同步到遊戲實例
               firstSelectedBlock = null; // 清空選擇
               document.querySelectorAll('.puzzle-block.cheat-selected').forEach(block => block.classList.remove('cheat-selected')); // 清除高亮
               if (cheatMode) { alert('作弊模式已啟用！點擊任意兩個非空方塊進行交換。'); soundManager.playCheatSound(); }
               else { alert('作弊模式已關閉。'); }
           });
      }

      // 遊戲板點擊事件 (核心修改)
      const puzzleContainer = document.querySelector('.puzzle-container');
      if (puzzleContainer) {
           puzzleContainer.addEventListener('click', (e) => {
               if (!gameInstance || !blockElements || blockElements.length === 0) return;
               const block = e.target.closest('.puzzle-block');
               if (!block) return;

               // 從 data-* 屬性獲取行列，而不是計算索引
               const row = parseInt(block.dataset.row);
               const col = parseInt(block.dataset.col);

               if (isNaN(row) || isNaN(col)) {
                   console.error("Click Error: Invalid row/col data attributes on block", block);
                   return;
               }

               if (cheatMode && gameInstance.cheatEnabled) {
                   // 作弊模式邏輯
                   if (block.classList.contains('empty')) {
                       alert('作弊模式不能選擇空白方塊');
                       return;
                   }
                   if (!firstSelectedBlock) {
                       firstSelectedBlock = { row, col, element: block };
                       block.classList.add('cheat-selected');
                   } else {
                       // 執行作弊交換 (game.js)
                       const swapResult = gameInstance.cheatSwap(firstSelectedBlock.row, firstSelectedBlock.col, row, col);
                       if (swapResult) {
                           // 更新 UI (僅交換位置)
                           updateGameBoardView(swapResult); // <--- 使用新的更新函數
                           soundManager.playCheatSound(); // 播放作弊音效
                           // 檢查是否獲勝
                           requestAnimationFrame(() => {
                               if (gameInstance.checkWin()) {
                                   gameComplete();
                               }
                           });
                       }
                       // 清除選擇狀態
                       if(firstSelectedBlock.element) firstSelectedBlock.element.classList.remove('cheat-selected');
                       block.classList.remove('cheat-selected'); // 當前點擊的塊也移除高亮
                       firstSelectedBlock = null;
                   }
               } else {
                   // 正常移動邏輯
                   const moveResult = gameInstance.moveBlock(row, col); // game.js 判斷是否相鄰並移動
                   if (moveResult) {
                       updateGameStats();
                       soundManager.playMoveSound();
                       // 更新 UI (移動方塊和空塊)
                       updateGameBoardView(moveResult); // <--- 使用新的更新函數
                       // 檢查是否獲勝 (異步確保UI更新後檢查)
                       requestAnimationFrame(() => {
                           if (gameInstance.checkWin()) {
                               gameComplete();
                           }
                       });
                   }
               }
           }, true); // 使用捕獲階段確保 .closest 能正確工作
      }
  }
  // --- 修改結束 ---

  // 高亮提示方塊 (保持不變, 操作 class)
  function highlightHintBlock(row, col) {
      document.querySelectorAll('.puzzle-block.hint').forEach(block => { block.classList.remove('hint'); });
      const currentSize = gameInstance ? gameInstance.size : selectedSize;
      if (!currentSize || !blockElements || blockElements.length === 0) return;

      // 通過 data 屬性查找元素
      const targetBlock = blockElements.find(el => parseInt(el.dataset.row) === row && parseInt(el.dataset.col) === col);

      if (targetBlock) {
          targetBlock.classList.add('hint');
          setTimeout(() => {
              if (targetBlock) targetBlock.classList.remove('hint');
          }, 3000); // 保持 3 秒高亮
      } else {
          console.warn(`Hint Error: Cannot find block at (${row}, ${col})`);
      }
  }

  // 初始化自定義圖片上傳 (保持不變)
  function initCustomImageUpload() {
    const customInput = document.getElementById('custom-image');
    if (!customInput) return;
    customInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            selectedImage = event.target.result;
            currentImageIdentifier = 'custom';
            console.log("自定義圖片已選擇 (原始 DataURL)");
            document.querySelectorAll('.image-options img.selected').forEach(img => img.classList.remove('selected'));
            const imageOptions = document.querySelector('.image-options');
            if (imageOptions) {
                 const existingPreview = imageOptions.querySelector('.image-options .custom-preview');
                 if (existingPreview) existingPreview.remove();
                 const preview = document.createElement('img');
                 preview.src = selectedImage; preview.alt = '預覽'; preview.title = '預覽';
                 preview.classList.add('selected', 'custom-preview');
                 preview.style.width = '100px'; preview.style.height = '100px'; preview.style.objectFit = 'cover';
                 imageOptions.appendChild(preview);
            }
             if (selectedMode !== 'image') {
                  selectedMode = 'image';
                  const imgBtn=document.getElementById('image-mode'); if(imgBtn) imgBtn.classList.add('selected');
                  const numBtn=document.getElementById('number-mode'); if(numBtn) numBtn.classList.remove('selected');
                  const imgSelDiv=document.getElementById('image-selection'); if(imgSelDiv) imgSelDiv.classList.remove('hidden');
             }
        };
        reader.onerror = () => { alert("讀取自定義圖片失敗"); };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  // 顏色選擇 (保持不變)
  function initColorSelection() { selectedColor = 'default'; }

  // 初始化網路搜圖 (保持不變)
  function initWebImageSearch() {
    const webSearchBtn = document.getElementById('web-image-search-btn');
    if (!webSearchBtn) return;
    webSearchBtn.addEventListener('click', () => {
      WebImageSearch.showModal();
    });
    WebImageSearch.init((imageUrl, imageName) => {
      document.querySelectorAll('.image-options img.selected').forEach(img => img.classList.remove('selected'));
      const customInput = document.getElementById('custom-image');
      if (customInput) customInput.value = '';
      const existingPreview = document.querySelector('.image-options .custom-preview');
      if (existingPreview) existingPreview.remove();
      selectedImage = imageUrl;
      currentImageIdentifier = imageName;
      console.log("選擇網路圖片:", currentImageIdentifier);
      const imageOptions = document.querySelector('.image-options');
      if (imageOptions) {
        const preview = document.createElement('img');
        preview.src = selectedImage;
        preview.alt = '網路圖片';
        preview.title = currentImageIdentifier;
        preview.classList.add('selected', 'custom-preview');
        preview.style.width = '100px';
        preview.style.height = '100px';
        preview.style.objectFit = 'cover';
        imageOptions.appendChild(preview);
      }
    });
  }

  // 初始化所有UI組件
  function initUI() {
    initModeSelection();
    initImageSelection(); // 保持 async
    initSizeSelection();
    initColorSelection();
    initStartGameButton();
    initGameControls(); // 使用更新後的版本
    initCustomImageUpload();
    initWebImageSearch();
    document.querySelectorAll('.mode-options button, .size-options button, .color-options button').forEach(button => { button.classList.add('option-button'); });
    console.log("UI 初始化完成 (已優化 DOM 更新)");
  }

  // 啟動UI初始化
  initUI();

}); // Close DOMContentLoaded event listener