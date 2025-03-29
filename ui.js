// ui.js (完整修正版 - 恢復 renderGameBoard 調用以確保穩定性)
document.addEventListener('DOMContentLoaded', () => {
  // 遊戲設置變數
  let selectedMode = null;
  let selectedSize = null;
  let selectedImage = null;
  let selectedColor = 'default';
  let gameInstance = null;
  let currentImageIdentifier = '';
  // let blockElements = []; // 不再需要全局存儲用於單獨更新

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
        } else {
            processedPresetImages = presetImages.map(img => ({ ...img }));
        }
    } catch (error) {
        console.error("預處理預設圖片時出錯:", error);
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
              identifierForGame = 'custom';
              const reader = new FileReader();
              reader.onload = (e) => { imageSourceForGame = e.target.result; startGame(imageSourceForGame, identifierForGame, gameSize); };
              reader.onerror = () => { alert("讀取自定義圖片失敗"); }; reader.readAsDataURL(customImageInput.files[0]); return;
          }
          else if (selectedImage && currentImageIdentifier) {
              identifierForGame = currentImageIdentifier; startGame(imageSourceForGame, identifierForGame, gameSize);
          } else { alert('圖片模式下，請選擇或上傳圖片'); return; }
      } else { identifierForGame = ''; imageSourceForGame = null; startGame(imageSourceForGame, identifierForGame, gameSize); }
    });
  }

  async function startGame(imageSource, identifier, size) {
    const gameSetupDiv = document.getElementById('game-setup'); const gameBoardDiv = document.getElementById('game-board');
    if (!gameSetupDiv || !gameBoardDiv) return;
    gameSetupDiv.classList.add('hidden'); gameBoardDiv.classList.remove('hidden');
    // blockElements = []; // 不再需要

    let finalImageSource = imageSource;
    if (selectedMode === 'image' && imageSource && typeof preprocessImage === 'function') {
        try {
            finalImageSource = await preprocessImage(imageSource, size);
        } catch (error) {
            console.error("startGame: 圖片預處理失敗:", error);
            alert("圖片處理失敗，無法開始遊戲");
            if (gameBoardDiv) gameBoardDiv.classList.add('hidden');
            if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
            return;
        }
    }

    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }

    try {
      // --- 確保 game.js 已加載且 PuzzleGame 可用 ---
      if (typeof PuzzleGame === 'undefined') {
          throw new Error("PuzzleGame is not defined. Check game.js loading order or syntax errors.");
      }
      // ---------------------------------------------
      gameInstance = new PuzzleGame(size, selectedMode, finalImageSource);
      if (gameInstance) {
          gameInstance.imageIdentifier = identifier || gameInstance.determineImageIdentifier(finalImageSource);
          renderGameBoard(); // 首次渲染
          gameInstance.startTimer();
          loadHighScores(selectedMode, gameInstance.imageIdentifier, size);
          soundManager.playGameStartSound();
          gameInstance.cheatEnabled = false;
      } else { throw new Error("遊戲實例創建失敗"); }
    } catch (error) {
      console.error('遊戲初始化或啟動失敗:', error); alert('遊戲初始化失敗: ' + error.message); // 顯示更詳細的錯誤
      if (gameBoardDiv) gameBoardDiv.classList.add('hidden'); if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
    }
  }

  // --- renderGameBoard: 恢復到只負責渲染當前 gameInstance.board 狀態 ---
  function renderGameBoard() {
      const puzzleContainer = document.querySelector('.puzzle-container');
      if (!puzzleContainer || !gameInstance) { console.error("Render Error: No container or game instance"); return; }

      puzzleContainer.innerHTML = ''; // 清空容器是必要的，因為要完全重繪
      // blockElements = []; // 不再需要全局存儲用於單獨更新

      const currentSize = gameInstance.size;
      puzzleContainer.style.gridTemplateColumns = `repeat(${currentSize}, 1fr)`;
      puzzleContainer.style.gridTemplateRows = `repeat(${currentSize}, 1fr)`;
      puzzleContainer.style.setProperty('--grid-size', currentSize);

      const fragment = document.createDocumentFragment();

      for (let row = 0; row < currentSize; row++) {
        for (let col = 0; col < currentSize; col++) {
          const block = document.createElement('div');
          block.className = 'puzzle-block'; // 基礎 class
          const value = gameInstance.board[row][col];

          // --- 添加 data-* 屬性，主要用於點擊時識別位置 ---
          block.dataset.row = row;
          block.dataset.col = col;
          block.dataset.value = value; // 可以用於調試
          // -------------------------------------------

          // --- 不再設置 grid-row/column-start，因為元素順序決定位置 ---
          // block.style.gridRowStart = row + 1;
          // block.style.gridColumnStart = col + 1;
          // --------------------------------------------------------

          if (value === 0) {
            block.classList.add('empty', `color-${selectedColor}`);
          } else if (selectedMode === 'number') {
            const numberSpan = document.createElement('span');
            numberSpan.textContent = value;
            numberSpan.style.cssText = 'display:flex; align-items:center; justify-content:center; width:100%; height:100%;';
            block.appendChild(numberSpan);
          } else { // 圖片模式
            block.classList.add('image-block');
            const originalCol = (value - 1) % currentSize;
            const originalRow = Math.floor((value - 1) / currentSize);
            block.style.position = 'relative';
            block.style.overflow = 'hidden';
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'absolute';
            imgContainer.style.width = `${currentSize * 100}%`;
            imgContainer.style.height = `${currentSize * 100}%`;
            if (gameInstance.imageSource) {
                 imgContainer.style.backgroundImage = `url(${gameInstance.imageSource})`;
                 imgContainer.style.backgroundSize = 'cover';
                 imgContainer.style.backgroundRepeat = 'no-repeat';
            } else {
                 block.textContent = 'X'; block.style.backgroundColor = 'red';
            }
            imgContainer.style.transform = 'translateZ(0)'; imgContainer.style.webkitTransform = 'translateZ(0)'; imgContainer.style.webkitBackfaceVisibility = 'hidden'; /* imgContainer.style.webkitPerspective = '1000'; */ imgContainer.style.willChange = 'transform'; imgContainer.style.transition = 'none';
            const offsetX = -originalCol * 100; const offsetY = -originalRow * 100;
            imgContainer.style.left = `${offsetX}%`; imgContainer.style.top = `${offsetY}%`;
            block.appendChild(imgContainer);
            block.style.border = '1px solid rgba(255,255,255,0.2)';
            block.style.backgroundColor = '#ddd';
          }
          fragment.appendChild(block);
          // 不再需要 blockElements.push(block);
        }
      }
      puzzleContainer.appendChild(fragment); // 一次性添加到 DOM
      // console.log("遊戲板重新渲染完成"); // 可以取消註釋用於調試
  }
  // --- renderGameBoard 結束 ---

  // --- updateGameBoardView 函數不再需要，可以刪除或註釋掉 ---
  /*
  function updateGameBoardView(moveDetails) {
      // ... 原來的優化邏輯 ...
  }
  */
  // --- updateGameBoardView 結束 ---

  function updateGameStats() { if(gameInstance) document.getElementById('moves').textContent = gameInstance.moves; }

  function gameComplete() {
    if (!gameInstance) return;
    gameInstance.stopTimer();
    soundManager.playWinSound();
    const cheatButton = document.getElementById('cheat-button'); if (cheatButton) cheatButton.classList.remove('active');
    if (gameInstance) gameInstance.cheatEnabled = false;

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

    const playAgainHandler = () => {
        gameCompleteDiv.classList.add('hidden');
        if (gameInstance) { startGame(gameInstance.imageSource, gameInstance.imageIdentifier, gameInstance.size); }
    };
    const backToMenuHandler = () => {
        gameCompleteDiv.classList.add('hidden');
        document.getElementById('game-setup').classList.remove('hidden');
        resetGameSettings();
    };
    if(playAgainBtn){ playAgainBtn.removeEventListener('click', playAgainHandler); playAgainBtn.addEventListener('click', playAgainHandler, {once: true});}
    if(backToMenuBtn){ backToMenuBtn.removeEventListener('click', backToMenuHandler); backToMenuBtn.addEventListener('click', backToMenuHandler, {once: true});}
  }

  function resetGameSettings() {
    selectedMode = null; selectedSize = null; selectedImage = null; currentImageIdentifier = '';
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    const imgSel = document.getElementById('image-selection'); if(imgSel) imgSel.classList.add('hidden');
    if (gameInstance) gameInstance.cheatEnabled = false;
    const cheatButton = document.getElementById('cheat-button'); if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }
    const customPreview = document.querySelector('.image-options .custom-preview'); if(customPreview) customPreview.remove();
    const customInput = document.getElementById('custom-image'); if(customInput) customInput.value='';
    const highScoresList = document.getElementById('high-scores-list'); if (highScoresList) highScoresList.innerHTML = '<div class="no-record">選擇關卡以查看記錄</div>';
    if (gameInstance) { gameInstance.stopTimer(); gameInstance = null; }
    // blockElements = []; // 不再需要
    console.log("遊戲設置已重置");
  }

  function loadHighScores(mode, identifier, size) {
      const highScoresList = document.getElementById('high-scores-list');
      if (!highScoresList) return;
      highScoresList.innerHTML = '';
      if (!mode || size === undefined || size === null || (mode === 'image' && (identifier === undefined || identifier === null))) { highScoresList.innerHTML = '<div class="no-record">參數錯誤無法載入記錄</div>'; return; }
      const scores = StorageManager.getItem('puzzleHighScores', {}); const key = `${mode}-${identifier}-${size}`;
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

  // --- 修改 initGameControls: 恢復調用 renderGameBoard ---
  function initGameControls() {
      document.getElementById('reset-game').addEventListener('click', () => {
          if (!gameInstance) return;
          gameInstance.resetGame();
          renderGameBoard(); // <--- 完全重繪
          soundManager.playGameStartSound();
          if (gameInstance) gameInstance.cheatEnabled = false;
          const cheatButton = document.getElementById('cheat-button');
          if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }
          document.querySelectorAll('.puzzle-block.hint, .puzzle-block.cheat-selected').forEach(b => b.classList.remove('hint', 'cheat-selected'));
          firstSelectedBlock = null;
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
      let cheatButton = document.getElementById('cheat-button');
      if (!cheatButton && gameControls) {
           cheatButton = document.createElement('button'); cheatButton.id = 'cheat-button'; cheatButton.textContent = '作弊模式'; gameControls.appendChild(cheatButton);
      }
      let cheatMode = false;
      let firstSelectedBlock = null; // 保持局部變量
      if(cheatButton) {
           cheatButton.addEventListener('click', () => {
               if (!gameInstance || !gameInstance.startTime) return;
               const currentTime = new Date();
               const elapsedTimeInSeconds = Math.floor((currentTime - (gameInstance.startTime || currentTime)) / 1000);
               const timeLimit = 5 * 60;
               if (elapsedTimeInSeconds < timeLimit && gameInstance.cheatCount === 0) {
                  const remMin = Math.floor((timeLimit - elapsedTimeInSeconds) / 60);
                  const remSec = (timeLimit - elapsedTimeInSeconds) % 60;
                  alert(`作弊模式將在 ${remMin}分${remSec}秒 後可用`); return;
               }
               cheatMode = !cheatMode;
               cheatButton.classList.toggle('active', cheatMode);
               if(gameInstance) gameInstance.cheatEnabled = cheatMode; // 同步到實例
               firstSelectedBlock = null;
               document.querySelectorAll('.puzzle-block.cheat-selected').forEach(block => block.classList.remove('cheat-selected'));
               if (cheatMode) { alert('作弊模式已啟用！點擊任意兩個非空方塊進行交換。'); soundManager.playCheatSound(); }
               else { alert('作弊模式已關閉。'); }
           });
      }

      const puzzleContainer = document.querySelector('.puzzle-container');
      if (puzzleContainer) {
           puzzleContainer.addEventListener('click', (e) => {
               if (!gameInstance) return; // 檢查 gameInstance 是否存在
               const block = e.target.closest('.puzzle-block');
               if (!block) return;
               // --- 從 data-* 讀取點擊位置 ---
               const row = parseInt(block.dataset.row);
               const col = parseInt(block.dataset.col);
               if (isNaN(row) || isNaN(col)) {
                   console.error("Click Error: Invalid row/col data attributes", block);
                   return; // 無效座標，不處理
               }
               // ---------------------------

               if (cheatMode && gameInstance.cheatEnabled) { // 作弊模式
                   if (block.classList.contains('empty')) { alert('作弊模式不能選擇空白方塊'); return; }
                   if (!firstSelectedBlock) {
                       firstSelectedBlock = { row, col, element: block };
                       block.classList.add('cheat-selected');
                   } else {
                       const swapResult = gameInstance.cheatSwap(firstSelectedBlock.row, firstSelectedBlock.col, row, col);
                       if (swapResult) { // cheatSwap 成功才更新
                           renderGameBoard(); // <--- 恢復調用 renderGameBoard
                           soundManager.playCheatSound();
                           requestAnimationFrame(() => { if (gameInstance.checkWin()) gameComplete(); });
                       }
                       // 清理選擇狀態
                       if(firstSelectedBlock.element) firstSelectedBlock.element.classList.remove('cheat-selected');
                       block.classList.remove('cheat-selected'); // 確保當前點擊的也移除
                       firstSelectedBlock = null;
                   }
               } else { // 正常移動模式
                   const moveResult = gameInstance.moveBlock(row, col); // game.js 判斷相鄰並更新內部狀態
                   if (moveResult) { // moveResult 不為 null 表示移動成功
                       updateGameStats();
                       soundManager.playMoveSound();
                       renderGameBoard(); // <--- 恢復調用 renderGameBoard
                       requestAnimationFrame(() => { if (gameInstance.checkWin()) gameComplete(); });
                   } else {
                       // console.log("Invalid move clicked"); // 可以取消註釋調試無效點擊
                   }
               }
           }, true);
      }
  }
  // --- initGameControls 結束 ---

  // --- highlightHintBlock: 需要基於 renderGameBoard 後的新 DOM 結構 ---
  function highlightHintBlock(row, col) {
      // 先移除舊的提示
      document.querySelectorAll('.puzzle-block.hint').forEach(block => { block.classList.remove('hint'); });

      // renderGameBoard 後，DOM 元素的順序就是 board 的順序
      const puzzleContainer = document.querySelector('.puzzle-container');
      if (!puzzleContainer || !gameInstance) return;

      const currentSize = gameInstance.size;
      const index = row * currentSize + col; // 計算在一維 DOM 列表中的索引
      const blocks = puzzleContainer.querySelectorAll('.puzzle-block'); // 獲取當前所有方塊

      if (blocks && blocks[index]) { // 檢查索引是否有效
          blocks[index].classList.add('hint');
          setTimeout(() => {
              // 再次查找以防 DOM 變化
              const currentBlocks = puzzleContainer.querySelectorAll('.puzzle-block');
              if (currentBlocks && currentBlocks[index]) {
                   currentBlocks[index].classList.remove('hint');
              }
          }, 3000);
      } else {
          console.warn(`Hint Error: Cannot find block at index ${index} for (${row}, ${col})`);
      }
  }
  // --- highlightHintBlock 結束 ---


  function initCustomImageUpload() {
    const customInput = document.getElementById('custom-image');
    if (!customInput) return;
    customInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            selectedImage = event.target.result;
            currentImageIdentifier = 'custom';
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

  function initColorSelection() { selectedColor = 'default'; }

  function initWebImageSearch() {
    const webSearchBtn = document.getElementById('web-image-search-btn');
    if (!webSearchBtn) return;
    webSearchBtn.addEventListener('click', () => WebImageSearch.showModal());
    WebImageSearch.init((imageUrl, imageName) => {
      document.querySelectorAll('.image-options img.selected').forEach(img => img.classList.remove('selected'));
      const customInput = document.getElementById('custom-image'); if (customInput) customInput.value = '';
      const existingPreview = document.querySelector('.image-options .custom-preview'); if (existingPreview) existingPreview.remove();
      selectedImage = imageUrl;
      currentImageIdentifier = imageName;
      const imageOptions = document.querySelector('.image-options');
      if (imageOptions) {
        const preview = document.createElement('img');
        preview.src = selectedImage; preview.alt = '網路圖片'; preview.title = currentImageIdentifier;
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
    });
  }

  function initUI() {
    initModeSelection();
    initImageSelection();
    initSizeSelection();
    initColorSelection();
    initStartGameButton();
    initGameControls(); // 使用恢復 renderGameBoard 的版本
    initCustomImageUpload();
    initWebImageSearch();
    document.querySelectorAll('.mode-options button, .size-options button, .color-options button').forEach(button => { button.classList.add('option-button'); });
    console.log("UI 初始化完成 (恢復 renderGameBoard 調用)");
  }

  initUI();

});