// ui.js (完整修正版 - 僅加入高分功能)
document.addEventListener('DOMContentLoaded', () => {
  // 遊戲設置變數
  let selectedMode = null;
  let selectedSize = null;
  let selectedImage = null; // 存儲原始 src 或預處理過的 src
  let selectedColor = 'default';
  let gameInstance = null;
  let currentImageIdentifier = ''; // <<< 新增

  // 預設圖片
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

  // 處理後的預設圖片 (按原始代碼邏輯填充)
  let processedPresetImages = []; // 假設 preprocessPresetImages 會填充此數組

  // 初始化圖片選擇區域 (基於原始代碼)
  async function initImageSelection() {
    const imageOptions = document.querySelector('.image-options');
    if (!imageOptions) return;

    // --- 修改：嘗試填充 processedPresetImages，如果失敗則使用原始 ---
    try {
        // **重要：假設原始代碼中有 preprocessPresetImages 函數**
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
    // --- 修改結束 ---

    imageOptions.innerHTML = ''; // 清空

    // 使用 processedPresetImages 渲染
    processedPresetImages.forEach(image => {
      const img = document.createElement('img');
      img.src = image.src; // 顯示處理過的或原始的 src
      img.alt = image.name; img.title = image.name; img.dataset.imageName = image.name;
      img.addEventListener('click', () => {
        document.querySelectorAll('.image-options img.selected').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        selectedImage = image.src; // 存儲當前顯示的 src
        currentImageIdentifier = image.name; // <<< 設置穩定標識符
        console.log("選擇預設圖片:", currentImageIdentifier);
        const customInput = document.getElementById('custom-image'); if (customInput) customInput.value = '';
        const customPreview = document.querySelector('.image-options .custom-preview'); if (customPreview) customPreview.remove();
      });
      imageOptions.appendChild(img);
    });
  }

  // 初始化模式選擇
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

  // 高亮選中的按鈕
  function highlightSelectedButton(id) {
    const buttons = document.querySelectorAll('.mode-options button, .size-options button');
    buttons.forEach(button => button.classList.remove('selected'));
    const element = document.getElementById(id); if (element) element.classList.add('selected');
    document.querySelectorAll('.size-options button').forEach(btn => { if(parseInt(btn.dataset.size) === selectedSize) btn.classList.add('selected'); else btn.classList.remove('selected'); });
  }

  // 初始化尺寸選擇
  function initSizeSelection() {
    const sizeButtons = document.querySelectorAll('.size-options button');
    const customSizeInput = document.getElementById('custom-size-input');
    sizeButtons.forEach(button => { button.addEventListener('click', () => { selectedSize = parseInt(button.dataset.size); document.querySelectorAll('.size-options button').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); if(customSizeInput) customSizeInput.value = selectedSize; }); });
    if (customSizeInput) { if(!selectedSize) selectedSize = parseInt(customSizeInput.value) || 4; else customSizeInput.value = selectedSize; customSizeInput.addEventListener('change', (e) => { const v = parseInt(e.target.value); if (v>=3&&v<=10) { selectedSize = v; document.querySelectorAll('.size-options button').forEach(b => b.classList.remove('selected'));} else { alert('請輸入3到10'); e.target.value = selectedSize||4; } }); }
    else if (!selectedSize) selectedSize = 4;
  }

  // 初始化開始遊戲按鈕
  function initStartGameButton() {
    document.getElementById('start-game').addEventListener('click', () => { // <<< 保持非 async
      if (!selectedMode) { alert('請選擇遊戲模式'); return; }
      if (!selectedSize) selectedSize = parseInt(document.getElementById('custom-size-input').value) || 4;
      const gameSize = selectedSize >= 3 && selectedSize <= 10 ? selectedSize : 4;
      let imageSourceForGame = selectedImage; let identifierForGame = '';

      if (selectedMode === 'image') {
          const customImageInput = document.getElementById('custom-image');
          if (customImageInput && customImageInput.files[0]) {
              console.log("檢測到自定義文件，將讀取..."); identifierForGame = 'custom';
              const reader = new FileReader();
              reader.onload = (e) => { imageSourceForGame = e.target.result; console.log("自定義圖片讀取完成"); startGame(imageSourceForGame, identifierForGame, gameSize); }; // <<< 傳遞 gameSize
              reader.onerror = () => { alert("讀取自定義圖片失敗"); }; reader.readAsDataURL(customImageInput.files[0]); return; // 等待讀取
          }
          else if (selectedImage && currentImageIdentifier) { // 使用已選中的預設圖片
              identifierForGame = currentImageIdentifier; console.log(`使用已選圖片: ${identifierForGame}`); startGame(imageSourceForGame, identifierForGame, gameSize); // <<< 傳遞 gameSize
          } else { alert('圖片模式下，請選擇或上傳'); return; }
      } else { identifierForGame = ''; imageSourceForGame = null; startGame(imageSourceForGame, identifierForGame, gameSize); } // <<< 傳遞 gameSize
    });
  }

  // --- 修改：接收標識符和尺寸，調用 loadHighScores ---
  async function startGame(imageSource, identifier, size) { // <<< 添加 identifier 和 size
    const gameSetupDiv = document.getElementById('game-setup'); const gameBoardDiv = document.getElementById('game-board');
    if (!gameSetupDiv || !gameBoardDiv) return;
    gameSetupDiv.classList.add('hidden'); gameBoardDiv.classList.remove('hidden');

    // 原始代碼有預處理邏輯，我們需要根據情況決定是否保留
    // 假設原始 startGame 需要異步處理 preprocessImage
    let finalImageSource = imageSource;
    if (selectedMode === 'image' && imageSource && typeof preprocessImage === 'function') {
        // **假設原始代碼在 startGame 內部預處理**
        console.log("startGame: 嘗試預處理圖片...");
        try {
            // **重要：這裡使用了 await，所以 startGame 保持 async**
            finalImageSource = await preprocessImage(imageSource, size);
            console.log("startGame: 圖片預處理完成");
        } catch (error) {
            console.error("startGame: 圖片預處理失敗:", error);
            alert("圖片處理失敗，無法開始遊戲");
            if (gameBoardDiv) gameBoardDiv.classList.add('hidden');
            if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
            return; // 預處理失敗則終止
        }
    }

    // 原始代碼中的作弊模式重置
    let cheatMode = false; let firstSelectedBlock = null;
    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }

    try {
      console.log('創建遊戲實例，模式:', selectedMode, '尺寸:', size, '標識符:', identifier);
      gameInstance = new PuzzleGame(size, selectedMode, finalImageSource); // <<< 使用 size 和處理過的 finalImageSource

      // 手動設置標識符，因為構造函數沒改
      if (gameInstance) {
          gameInstance.imageIdentifier = identifier || gameInstance.determineImageIdentifier(finalImageSource);
          console.log("手動設置 imageIdentifier 為:", gameInstance.imageIdentifier);

         renderGameBoard(); // 使用原始 renderGameBoard
         gameInstance.startTimer();

         // --- 新增：載入高分 ---
         loadHighScores(selectedMode, gameInstance.imageIdentifier, size);
         // --- 新增結束 ---

         soundManager.playGameStartSound();
         gameInstance.cheatEnabled = false; // 重置作弊狀態
      } else { throw new Error("遊戲實例創建失敗"); }

    } catch (error) {
      console.error('遊戲初始化或啟動失敗:', error); alert('遊戲初始化失敗');
      if (gameBoardDiv) gameBoardDiv.classList.add('hidden'); if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
    }
  }

  // **渲染遊戲板 (使用你原始文件中的版本)**
  function renderGameBoard() {
      const puzzleContainer = document.querySelector('.puzzle-container');
      if (!puzzleContainer || !gameInstance) { console.error("Render Error: No container or game instance"); return; } // 添加保護

      puzzleContainer.innerHTML = ''; // 清空
      // 使用 selectedSize (全局) 還是 gameInstance.size (實例)? 應該用 gameInstance.size
      const currentSize = gameInstance.size;
      puzzleContainer.style.gridTemplateColumns = `repeat(${currentSize}, 1fr)`;
      puzzleContainer.style.gridTemplateRows = `repeat(${currentSize}, 1fr)`;
      puzzleContainer.style.setProperty('--grid-size', currentSize); // For Safari

      for (let row = 0; row < currentSize; row++) {
        for (let col = 0; col < currentSize; col++) {
          const block = document.createElement('div');
          block.className = 'puzzle-block';
          const value = gameInstance.board[row][col];

          if (value === 0) {
            block.classList.add('empty');
            block.classList.add(`color-${selectedColor}`); // 使用全局 selectedColor
          } else if (selectedMode === 'number') {
            const numberSpan = document.createElement('span');
            numberSpan.textContent = value;
            numberSpan.style.cssText = 'display:flex; align-items:center; justify-content:center; width:100%; height:100%;';
            block.appendChild(numberSpan);
          } else { // 圖片模式
            block.classList.add('image-block');
            const originalCol = (value - 1) % currentSize;
            const originalRow = Math.floor((value - 1) / currentSize);

            // **這是你原始代碼的邏輯：創建內部 div 來顯示圖片**
            block.style.position = 'relative';
            block.style.overflow = 'hidden';
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'absolute';
            imgContainer.style.width = `${currentSize * 100}%`;
            imgContainer.style.height = `${currentSize * 100}%`;
            if (gameInstance.imageSource) { // 檢查 imageSource 是否存在
                 imgContainer.style.backgroundImage = `url(${gameInstance.imageSource})`;
            } else {
                 console.error("渲染錯誤：圖片模式但 imageSource 為空");
                 block.textContent = 'X'; // 顯示錯誤標記
                 block.style.backgroundColor = 'red';
            }
            imgContainer.style.backgroundSize = 'cover'; // 原始是 cover
            imgContainer.style.backgroundRepeat = 'no-repeat';
            // Safari 優化 (來自原始代碼)
            imgContainer.style.transform = 'translateZ(0)'; imgContainer.style.webkitTransform = 'translateZ(0)'; imgContainer.style.webkitBackfaceVisibility = 'hidden'; imgContainer.style.webkitPerspective = '1000'; imgContainer.style.willChange = 'transform'; imgContainer.style.transition = 'none';
            // 定位
            const offsetX = -originalCol * 100; const offsetY = -originalRow * 100;
            imgContainer.style.left = `${offsetX}%`; imgContainer.style.top = `${offsetY}%`;
            // Safari 定位修復 (來自原始代碼) - 這部分可能不需要了，如果外層 .image-block 處理得當
            // if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) { /* Safari specific left/top adjustments */ }

            block.appendChild(imgContainer);
            // 邊框 (來自原始代碼)
            block.style.boxSizing = 'border-box'; block.style.border = '1px solid rgba(255,255,255,0.2)';
            block.style.backgroundRepeat = 'no-repeat';
          }
          // **重要：原始代碼移除了點擊事件處理，依賴外部添加**
          puzzleContainer.appendChild(block);
        }
      }
       console.log("遊戲板渲染完成 (使用原始 renderGameBoard 邏輯)");
  }

  // 更新遊戲統計
  function updateGameStats() { if(gameInstance) document.getElementById('moves').textContent = gameInstance.moves; }

  // 遊戲完成 (加入高分保存和作弊顯示)
  function gameComplete() {
    if (!gameInstance) return;
    gameInstance.stopTimer(); soundManager.playWinSound();
    let cheatMode = false; let firstSelectedBlock = null; // 假設有這些變量
    const cheatButton = document.getElementById('cheat-button'); if (cheatButton) cheatButton.classList.remove('active');
    if (gameInstance) gameInstance.cheatEnabled = false;
    const gameBoardDiv = document.getElementById('game-board'); const gameCompleteDiv = document.getElementById('game-complete');
    if (!gameBoardDiv || !gameCompleteDiv) return;
    gameBoardDiv.classList.add('hidden'); gameCompleteDiv.classList.remove('hidden');
    const timeEl = document.getElementById('time'); const completionTimeEl = document.getElementById('completion-time'); const completionMovesEl = document.getElementById('completion-moves');
    if (completionTimeEl && timeEl) completionTimeEl.textContent = timeEl.textContent; if (completionMovesEl) completionMovesEl.textContent = gameInstance.moves;
    const completionStats = document.querySelector('.completion-stats');
    if (completionStats) { // 添加作弊顯示
        const existingCheatInfo = document.getElementById('completion-cheat-info'); if (existingCheatInfo) completionStats.removeChild(existingCheatInfo);
        const cheatInfo = document.createElement('p'); cheatInfo.id = 'completion-cheat-info';
        if (gameInstance.cheatCount > 0) { cheatInfo.innerHTML = `<strong>作弊模式:</strong> <span class="cheat-used">使用了 ${gameInstance.cheatCount} 次</span>`; } else { cheatInfo.innerHTML = `<strong>作弊模式:</strong> <span class="cheat-not-used">未使用</span>`; }
        completionStats.appendChild(cheatInfo);
    }
    gameInstance.saveHighScore(); // <<< 保存高分
    const playAgainBtn = document.getElementById('play-again'); const backToMenuBtn = document.getElementById('back-to-menu');
    const playAgainHandler = () => { gameCompleteDiv.classList.add('hidden'); if (gameInstance) startGame(gameInstance.imageSource, gameInstance.imageIdentifier, gameInstance.size); }; // 傳遞參數
    const backToMenuHandler = () => { gameCompleteDiv.classList.add('hidden'); document.getElementById('game-setup').classList.remove('hidden'); resetGameSettings(); };
    if(playAgainBtn){ playAgainBtn.removeEventListener('click', playAgainHandler); playAgainBtn.addEventListener('click', playAgainHandler, {once: true});}
    if(backToMenuBtn){ backToMenuBtn.removeEventListener('click', backToMenuHandler); backToMenuBtn.addEventListener('click', backToMenuHandler, {once: true});}
  }

  // 重置遊戲設置 (加入清除高分顯示)
  function resetGameSettings() {
    selectedMode = null; selectedSize = null; selectedImage = null; currentImageIdentifier = ''; // 清除標識符
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    const imgSel = document.getElementById('image-selection'); if(imgSel) imgSel.classList.add('hidden');
    let cheatMode = false; if (gameInstance) gameInstance.cheatEnabled = false;
    const cheatButton = document.getElementById('cheat-button'); if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }
    const customPreview = document.querySelector('.image-options .custom-preview'); if(customPreview) customPreview.remove();
    const customInput = document.getElementById('custom-image'); if(customInput) customInput.value='';
    const highScoresList = document.getElementById('high-scores-list'); if (highScoresList) highScoresList.innerHTML = '<div class="no-record">選擇關卡以查看記錄</div>'; // 清除顯示
    if (gameInstance) { gameInstance.stopTimer(); gameInstance = null; } // 清除實例
    console.log("遊戲設置已重置");
  }

  // 載入和顯示高分榜
  function loadHighScores(mode, identifier, size) {
      const highScoresList = document.getElementById('high-scores-list');
      if (!highScoresList) { console.error("High score list element not found!"); return; }
      highScoresList.innerHTML = ''; // 清空
      if (!mode || size === undefined || size === null || (mode === 'image' && (identifier === undefined || identifier === null))) { highScoresList.innerHTML = '<div class="no-record">參數錯誤無法載入記錄</div>'; return; }
      const scores = StorageManager.getItem('puzzleHighScores', {}); const key = `${mode}-${identifier}-${size}`; console.log("載入高分榜，Key:", key);
      const modeScores = Array.isArray(scores[key]) ? scores[key] : [];
      if (modeScores.length === 0) { const noRec = document.createElement('div'); noRec.textContent = '此關卡暫無記錄'; noRec.classList.add('no-record'); highScoresList.appendChild(noRec); }
      else { // 渲染表格
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
      const scoreTitle = document.querySelector('.high-scores h3'); if(scoreTitle) scoreTitle.style.display = 'block'; // 確保標題顯示
  }

  // **初始化遊戲控制按鈕 (使用你原始文件中的版本)**
  function initGameControls() {
      // --- 這是你原始文件提供的 initGameControls 內容 ---
      document.getElementById('reset-game').addEventListener('click', () => {
          if (!gameInstance) return; // 添加保護
          gameInstance.resetGame();
          renderGameBoard();
          soundManager.playGameStartSound();
          let cheatMode = false; // 重置局部變量 (如果原始代碼有)
          if (gameInstance) gameInstance.cheatEnabled = false;
          const cheatButton = document.getElementById('cheat-button');
          if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }
      });
      document.getElementById('new-game').addEventListener('click', () => {
          if (gameInstance) gameInstance.stopTimer();
          document.getElementById('game-board').classList.add('hidden');
          document.getElementById('game-setup').classList.remove('hidden');
          resetGameSettings();
      });
      const muteButton = document.getElementById('mute-button');
      if (muteButton) muteButton.addEventListener('click', () => { const isMuted = soundManager.toggleMute(); muteButton.classList.toggle('active', isMuted); muteButton.style.backgroundColor = isMuted ? '#e74c3c' : '#3498db'; if (!isMuted) soundManager.playGameStartSound(); });
      const hintButton = document.getElementById('hint-button');
      if (hintButton) hintButton.addEventListener('click', () => { if (!gameInstance) return; const hintMove = gameInstance.getHint(); if (hintMove) { highlightHintBlock(hintMove.row, hintMove.col); soundManager.playMoveSound(); } });
      const showOriginalButton = document.getElementById('show-original-button');
      if (showOriginalButton) { let showingOriginal = false; showOriginalButton.addEventListener('click', () => { if(!gameInstance || gameInstance.mode !== 'image' || !gameInstance.imageSource){ alert("僅圖片模式可用"); return;} showingOriginal = !showingOriginal; showOriginalButton.classList.toggle('active', showingOriginal); const puzzleContainer = document.querySelector('.puzzle-container'); if(!puzzleContainer) return; let overlay = document.getElementById('original-image-overlay'); if (showingOriginal) { if (!overlay) { overlay = document.createElement('div'); overlay.id = 'original-image-overlay'; Object.assign(overlay.style, { position:'absolute', top:'0', left:'0', width:'100%', height:'100%', backgroundImage:`url(${gameInstance.imageSource})`, backgroundSize:'contain', backgroundPosition:'center', backgroundRepeat:'no-repeat', zIndex:'10', opacity:'0.9', transition:'opacity 0.3s ease' }); puzzleContainer.style.position = 'relative'; puzzleContainer.appendChild(overlay); } showOriginalButton.textContent = '隱藏原圖'; } else { if (overlay) overlay.remove(); showOriginalButton.textContent = '顯示原圖'; } }); }
      const changeColorButton = document.getElementById('change-color-button');
      if (changeColorButton) { function updateChangeColorButtonStyle(color) { changeColorButton.classList.remove('color-default-btn', 'color-blue-btn', 'color-red-btn', 'color-orange-btn'); changeColorButton.classList.add(`color-${color}-btn`); switch(color){ case 'default': changeColorButton.style.backgroundColor = '#555'; changeColorButton.style.backgroundImage = 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.2) 10px, rgba(255, 255, 255, 0.2) 20px)'; break; case 'blue': changeColorButton.style.backgroundColor = '#3498db'; changeColorButton.style.backgroundImage = 'none'; break; case 'red': changeColorButton.style.backgroundColor = '#e74c3c'; changeColorButton.style.backgroundImage = 'none'; break; case 'orange': changeColorButton.style.backgroundColor = '#f39c12'; changeColorButton.style.backgroundImage = 'none'; break; } } updateChangeColorButtonStyle(selectedColor); changeColorButton.addEventListener('click', () => { const colors = ['default', 'blue', 'red', 'orange']; const currentIndex = colors.indexOf(selectedColor); const nextIndex = (currentIndex + 1) % colors.length; selectedColor = colors[nextIndex]; soundManager.playColorChangeSound(); updateChangeColorButtonStyle(selectedColor); document.querySelectorAll('.puzzle-block.empty').forEach(block => { block.classList.remove('color-default', 'color-blue', 'color-red', 'color-orange'); block.classList.add(`color-${selectedColor}`); }); }); }
      const gameControls = document.querySelector('.game-controls');
      let cheatButton = document.getElementById('cheat-button'); // Check if already exists
      if (!cheatButton && gameControls) { // Create if doesn't exist
           cheatButton = document.createElement('button'); cheatButton.id = 'cheat-button'; cheatButton.textContent = '作弊模式'; gameControls.appendChild(cheatButton);
      }
      // 作弊模式變數 (局部) - 來自原始代碼
      let cheatMode = false; let firstSelectedBlock = null;
      if(cheatButton) { // 添加事件監聽器 (如果按鈕存在)
           cheatButton.addEventListener('click', () => { if (!gameInstance || !gameInstance.startTime) return; const currentTime = new Date(); const elapsedTimeInSeconds = Math.floor((currentTime - gameInstance.startTime) / 1000); const timeLimit = 5 * 60; if (elapsedTimeInSeconds < timeLimit) { const remMin = Math.floor((timeLimit - elapsedTimeInSeconds) / 60); const remSec = (timeLimit - elapsedTimeInSeconds) % 60; alert(`作弊模式將在 ${remMin}分${remSec}秒 後可用`); return; } cheatMode = !cheatMode; cheatButton.classList.toggle('active', cheatMode); if(gameInstance) gameInstance.cheatEnabled = cheatMode; firstSelectedBlock = null; document.querySelectorAll('.puzzle-block').forEach(block => block.classList.remove('cheat-selected')); if (cheatMode) { alert('作弊模式已啟用！點擊任意兩個方塊進行交換。'); soundManager.playCheatSound(); } });
      }
      const puzzleContainer = document.querySelector('.puzzle-container');
      if (puzzleContainer) { // 添加方塊點擊事件 (來自原始代碼)
           puzzleContainer.addEventListener('click', (e) => { if (!gameInstance) return; const block = e.target.closest('.puzzle-block'); if (!block) return; const blocks = Array.from(puzzleContainer.querySelectorAll('.puzzle-block')); const index = blocks.indexOf(block); const currentSize = gameInstance.size; const row = Math.floor(index / currentSize); const col = index % currentSize; if (cheatMode && gameInstance.cheatEnabled) { if (block.classList.contains('empty')) return; if (!firstSelectedBlock) { firstSelectedBlock = { row, col, element: block }; block.classList.add('cheat-selected'); } else { const { row: row1, col: col1 } = firstSelectedBlock; gameInstance.cheatSwap(row1, col1, row, col); if(firstSelectedBlock.element) firstSelectedBlock.element.classList.remove('cheat-selected'); firstSelectedBlock = null; renderGameBoard(); if (gameInstance.checkWin()) gameComplete(); } } else { if (gameInstance.isAdjacent(row, col)) { requestAnimationFrame(() => { gameInstance.moveBlock(row, col); updateGameStats(); requestAnimationFrame(() => { renderGameBoard(); if (gameInstance.checkWin()) gameComplete(); }); }); } } }, true);
      }
      // --- 原始 initGameControls 內容結束 ---
  }

  // **高亮提示的方塊 (使用你原始文件中的版本)**
  function highlightHintBlock(row, col) {
      // --- 這是你原始文件提供的 highlightHintBlock 內容 ---
      document.querySelectorAll('.puzzle-block').forEach(block => { block.classList.remove('hint'); });
      // 使用 selectedSize (全局) 還是 gameInstance.size? 應該用 gameInstance.size
      const currentSize = gameInstance ? gameInstance.size : selectedSize; // Fallback
      if (!currentSize) return; // 無法計算索引
      const index = row * currentSize + col;
      const blocks = document.querySelectorAll('.puzzle-block');
      if (blocks[index]) { blocks[index].classList.add('hint'); setTimeout(() => { if (blocks[index]) blocks[index].classList.remove('hint'); }, 3000); }
      // --- 原始 highlightHintBlock 內容結束 ---
  }


  // 初始化自定义图片上传 (加入標識符設置)
  function initCustomImageUpload() {
    const customInput = document.getElementById('custom-image');
    if (!customInput) return;
    customInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = async (event) => { // 保持 async 以匹配原始代碼的 await preprocessImage
            // **修改：不再預處理，直接使用 event.target.result**
            selectedImage = event.target.result; // 存儲原始 DataURL
            currentImageIdentifier = 'custom'; // <<< 設置標識符
            console.log("自定義圖片已選擇 (原始 DataURL)");

            // 清除預設圖片選中
            document.querySelectorAll('.image-options img.selected').forEach(img => img.classList.remove('selected'));
            // 顯示/更新預覽
            const imageOptions = document.querySelector('.image-options');
            if (imageOptions) {
                 const existingPreview = imageOptions.querySelector('.image-options .custom-preview');
                 if (existingPreview) existingPreview.remove();
                 const preview = document.createElement('img');
                 preview.src = selectedImage; preview.alt = '預覽'; preview.title = '預覽';
                 preview.classList.add('selected', 'custom-preview'); // 標記為選中
                 preview.style.width = '100px'; preview.style.height = '100px'; preview.style.objectFit = 'cover';
                 imageOptions.appendChild(preview);
            }
            // 自動切換到圖片模式
             if (selectedMode !== 'image') {
                  selectedMode = 'image';
                  const imgBtn=document.getElementById('image-mode'); if(imgBtn) imgBtn.classList.add('selected');
                  const numBtn=document.getElementById('number-mode'); if(numBtn) numBtn.classList.remove('selected');
                  const imgSelDiv=document.getElementById('image-selection'); if(imgSelDiv) imgSelDiv.classList.remove('hidden');
             }
             // **原始代碼有 try...catch 包裹 preprocessImage，現在不需要了**
        };
        reader.onerror = () => { alert("讀取自定義圖片失敗"); };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  // 顏色選擇
  function initColorSelection() { selectedColor = 'default'; }

  // 初始化所有UI組件
  function initUI() {
    initModeSelection();
    initImageSelection(); // 原始版本是 async
    initSizeSelection();
    initColorSelection();
    initStartGameButton();
    initGameControls(); // <<< 使用你的原始版本
    initCustomImageUpload();
    document.querySelectorAll('.mode-options button, .size-options button, .color-options button').forEach(button => { button.classList.add('option-button'); });
    console.log("UI 初始化完成 (基於原始代碼)");
  }

  // 啟動UI初始化
  initUI();

}); // Close DOMContentLoaded event listener