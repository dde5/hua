// ui.js
document.addEventListener('DOMContentLoaded', () => {
  let selectedMode = null;
  let selectedSize = null;
  let selectedImageOriginalSrc = null; // 用於存儲原始選擇的圖片源(可能是路徑或預處理後的DataURL)
  let processedSquareImageSrc = null; // 存儲 preprocessImage 後的正方形 DataURL
  let imagePieces = []; // <<--- 新增：存儲切割後的圖片 DataURL 數組
  let gameInstance = null;
  let currentImageIdentifier = '';
  let currentImageDisplayName = '';
  let selectedColor = 'default';

  // 預設圖片
  const presetImages = [
    { name: 'C1', src: 'images/C1.webp' }, { name: 'C2', src: 'images/C2.webp' },
    { name: 'C3', src: 'images/C3.webp' }, { name: 'C4', src: 'images/C4.webp' },
    { name: 'C5', src: 'images/C5.webp' }, { name: 'C6', src: 'images/C6.webp' },
    { name: 'C7', src: 'images/C7.webp' }, { name: 'C8', src: 'images/C8.webp' },
    { name: 'E1', src: 'images/E1.webp' }, { name: 'E2', src: 'images/E2.webp' },
    { name: 'E3', src: 'images/E3.webp' }, { name: 'E4', src: 'images/E4.webp' },
    { name: 'E5', src: 'images/E5.webp' }, { name: 'E6', src: 'images/E6.webp' },
    { name: 'M1', src: 'images/M1.webp' }, { name: 'M2', src: 'images/M2.webp' },
    { name: 'M3', src: 'images/M3.webp' }, { name: 'M4', src: 'images/M4.webp' },
    { name: 'M5', src: 'images/M5.webp' }, { name: 'H1', src: 'images/H1.webp' },
    { name: 'H2', src: 'images/H2.webp' }, { name: 'H3', src: 'images/H3.webp' },
    { name: 'H4', src: 'images/H4.webp' }, { name: 'H5', src: 'images/H5.webp' },
    { name: 'H6', src: 'images/H6.webp' }
  ];
  let processedPresetImagesCache = []; // 緩存 preprocessPresetImages 的結果

  function sanitizeFilenameForKey(filename) {
      if (!filename) return 'custom_unknown';
      const baseName = filename.substring(filename.lastIndexOf('/') + 1).substring(filename.lastIndexOf('\\') + 1);
      const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const truncated = sanitized.substring(0, 30);
      const finalKey = 'custom_' + truncated.toLowerCase();
      return finalKey === 'custom_' ? 'custom_upload' : finalKey;
  }

  async function initImageSelection() {
    const imageOptions = document.querySelector('.image-options');
    if (!imageOptions) return;
    try {
        // 預處理預設圖片 (將它們轉換為正方形 DataURL 以便預覽和後續切割)
        if (processedPresetImagesCache.length === 0 && typeof preprocessPresetImages === 'function') {
            processedPresetImagesCache = await preprocessPresetImages(presetImages);
        }
    } catch (error) {
        console.error("預處理預設圖片時出錯:", error);
        processedPresetImagesCache = presetImages.map(img => ({ ...img })); // Fallback
    }
    imageOptions.innerHTML = '';
    processedPresetImagesCache.forEach(image => { // 使用緩存的結果
      const img = document.createElement('img');
      img.src = image.src; // image.src 現在應該是預處理後的正方形 DataURL
      img.alt = image.name; img.title = image.name; img.dataset.imageName = image.name;

      img.addEventListener('click', () => {
        document.querySelectorAll('.image-options img.selected').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        selectedImageOriginalSrc = image.src; // 存儲這個（可能是預處理過的）源
        processedSquareImageSrc = image.src; // 因為預設圖片已經預處理過了
        currentImageIdentifier = image.name;
        currentImageDisplayName = image.name;
        const customInput = document.getElementById('custom-image'); if (customInput) customInput.value = '';
        const customPreview = document.querySelector('.image-options .custom-preview'); if (customPreview) customPreview.remove();
      });

      img.addEventListener('dblclick', async () => {
        selectedMode = 'image';
        highlightSelectedButton('image-mode');
        document.getElementById('image-selection').classList.remove('hidden');
        selectedImageOriginalSrc = image.src;
        processedSquareImageSrc = image.src;
        currentImageIdentifier = image.name;
        currentImageDisplayName = image.name;
        document.querySelectorAll('.image-options img.selected').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        const gameSize = getGameSize();
        // startGame現在是異步的
        await startGameFlow(processedSquareImageSrc, currentImageIdentifier, gameSize, currentImageDisplayName);
      });
      imageOptions.appendChild(img);
    });
  }

  function initModeSelection() {
    document.getElementById('number-mode').addEventListener('click', () => {
      selectedMode = 'number'; document.getElementById('image-selection').classList.add('hidden'); highlightSelectedButton('number-mode');
      selectedImageOriginalSrc = null; processedSquareImageSrc = null; imagePieces = [];
      currentImageIdentifier = ''; currentImageDisplayName = '';
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
    // 預設選中一個尺寸，比如第一個按鈕或自定義輸入框的值
    if (sizeButtons.length > 0 && !selectedSize) {
        const defaultSizeButton = sizeButtons[0];
        selectedSize = parseInt(defaultSizeButton.dataset.size);
        defaultSizeButton.classList.add('selected');
        if (customSizeInput) customSizeInput.value = selectedSize;
    } else if (customSizeInput && !selectedSize) {
        selectedSize = parseInt(customSizeInput.value) || 4;
    }


    sizeButtons.forEach(button => { button.addEventListener('click', () => { selectedSize = parseInt(button.dataset.size); document.querySelectorAll('.size-options button').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); if(customSizeInput) customSizeInput.value = selectedSize; }); });
    if (customSizeInput) {
        if(!selectedSize && customSizeInput.value) selectedSize = parseInt(customSizeInput.value);
        else if (selectedSize) customSizeInput.value = selectedSize;

        customSizeInput.addEventListener('change', (e) => { const v = parseInt(e.target.value); if (v>=3&&v<=10) { selectedSize = v; document.querySelectorAll('.size-options button').forEach(b => b.classList.remove('selected'));} else { alert('請輸入3到10'); e.target.value = selectedSize||4; } });
    }
    else if (!selectedSize) selectedSize = 4;
  }

  function getGameSize() {
      if (!selectedSize) {
          const customInput = document.getElementById('custom-size-input');
          if (customInput && customInput.value) {
            selectedSize = parseInt(customInput.value);
          } else {
            // 如果都沒有，找一個 .size-options button.selected
            const selectedBtn = document.querySelector('.size-options button.selected');
            if (selectedBtn) selectedSize = parseInt(selectedBtn.dataset.size);
            else selectedSize = 4; // 最終 fallback
          }
      }
      return selectedSize >= 3 && selectedSize <= 10 ? selectedSize : 4;
  }

  // 包裝 startGame 的調用流程，使其異步
  async function startGameFlow(imageSrcForCutting, identifier, size, displayName) {
    const gameSetupDiv = document.getElementById('game-setup');
    const gameBoardDiv = document.getElementById('game-board');
    if (!gameSetupDiv || !gameBoardDiv) return;

    gameSetupDiv.classList.add('hidden');
    gameBoardDiv.classList.remove('hidden');

    let finalImageIdentifier = identifier;
    let finalImageDisplayName = displayName;
    let finalImagePieces = []; // 用於存儲切割後的圖片

    if (selectedMode === 'image') {
        if (!imageSrcForCutting) {
            alert("圖片模式下，圖片源缺失，無法開始遊戲。");
            gameBoardDiv.classList.add('hidden');
            gameSetupDiv.classList.remove('hidden');
            return;
        }
        try {
            console.log("準備切割圖片，源:", imageSrcForCutting.substring(0,100)+"...", "尺寸:", size);
            if (typeof cutImageIntoPieces !== 'function') {
                throw new Error("cutImageIntoPieces 函數未定義");
            }
            finalImagePieces = await cutImageIntoPieces(imageSrcForCutting, size);
            imagePieces = finalImagePieces; // 更新全局的 imagePieces
            if (!finalImagePieces || finalImagePieces.length !== size * size) {
                throw new Error(`圖片切割失敗或數量不正確，期望 ${size*size} 塊，實際 ${finalImagePieces ? finalImagePieces.length : 0} 塊`);
            }
        } catch (error) {
            console.error("startGameFlow: 圖片切割失敗:", error);
            alert("圖片切割失敗，無法開始遊戲: " + error.message);
            gameBoardDiv.classList.add('hidden');
            gameSetupDiv.classList.remove('hidden');
            return;
        }
    } else { // 數字模式
        finalImageIdentifier = '';
        finalImageDisplayName = '數字模式';
        imagePieces = []; // 清空
    }

    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }

    try {
      if (typeof PuzzleGame === 'undefined') {
          throw new Error("PuzzleGame is not defined. Check game.js loading order or syntax errors.");
      }
      // PuzzleGame 構造函數現在可能不需要直接接收 imageSource，因為渲染由 ui.js 控制
      // 但如果 game.js 內部邏輯 (如顯示原圖) 依賴它，則仍需傳遞 processedSquareImageSrc
      gameInstance = new PuzzleGame(size, selectedMode, processedSquareImageSrc, finalImageIdentifier, finalImageDisplayName);
      if (gameInstance) {
          renderGameBoard(); // renderGameBoard 現在會使用全局的 imagePieces
          gameInstance.startTimer();
          loadHighScores(selectedMode, gameInstance.imageIdentifier, size);
          soundManager.playGameStartSound();
          gameInstance.cheatEnabled = false;
      } else { throw new Error("遊戲實例創建失敗"); }
    } catch (error) {
      console.error('遊戲初始化或啟動失敗:', error); alert('遊戲初始化失敗: ' + error.message);
      if (gameBoardDiv) gameBoardDiv.classList.add('hidden'); if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
    }
  }


  function initStartGameButton() {
    document.getElementById('start-game').addEventListener('click', async () => { // 改為 async
      if (!selectedMode) { alert('請選擇遊戲模式'); return; }
      const gameSize = getGameSize();
      let imageSourceForProcessing = selectedImageOriginalSrc; // 這是選擇或上傳的原始src
      let identifierForGame = currentImageIdentifier;
      let displayNameForGame = currentImageDisplayName;

      if (selectedMode === 'image') {
          const customImageInput = document.getElementById('custom-image');
          // 檢查是否有文件上傳且 selectedImageOriginalSrc 不是來自預設或網路（即它是一個新的 file upload）
          // 或者 processedSquareImageSrc 尚未被設置（意味著還沒處理過上傳的圖）
          if (customImageInput && customImageInput.files[0] && (!processedSquareImageSrc || selectedImageOriginalSrc !== processedSquareImageSrc)) {
              const file = customImageInput.files[0];
              identifierForGame = sanitizeFilenameForKey(file.name);
              displayNameForGame = file.name;
              const reader = new FileReader();
              reader.onload = async (e) => { // onload 也改為 async
                  try {
                      // 步驟1: 預處理成正方形 DataURL
                      const squareDataURL = await preprocessImage(e.target.result, gameSize);
                      processedSquareImageSrc = squareDataURL; // 更新全局的預處理圖片
                      selectedImageOriginalSrc = e.target.result; // 更新原始選擇
                      currentImageIdentifier = identifierForGame; // 更新標識符
                      currentImageDisplayName = displayNameForGame; // 更新顯示名稱
                      // 步驟2: 開始遊戲流程 (包含切割)
                      await startGameFlow(processedSquareImageSrc, identifierForGame, gameSize, displayNameForGame);
                  } catch (error) {
                      alert("圖片處理失敗: " + error.message);
                      console.error("Error processing uploaded image:", error);
                  }
              };
              reader.onerror = () => { alert("讀取自定義圖片失敗"); };
              reader.readAsDataURL(file);
              return; // 等待 FileReader 完成
          }
          else if (processedSquareImageSrc && identifierForGame) { // 如果已有預處理的圖片 (來自預設、網路或已處理的上傳)
              await startGameFlow(processedSquareImageSrc, identifierForGame, gameSize, displayNameForGame);
          } else {
              alert('圖片模式下，請選擇、上傳或等待圖片處理完成'); return;
          }
      } else { // 數字模式
          identifierForGame = ''; displayNameForGame = '數字模式';
          processedSquareImageSrc = null; imagePieces = []; // 清理圖片相關數據
          await startGameFlow(null, identifierForGame, gameSize, displayNameForGame);
      }
    });
  }

  // renderGameBoard: ***核心修改部分***
  function renderGameBoard() {
      const puzzleContainer = document.querySelector('.puzzle-container');
      if (!puzzleContainer || !gameInstance) { console.error("Render Error: No container or game instance"); return; }
      puzzleContainer.innerHTML = ''; // 清空舊的
      const currentSize = gameInstance.size;
      puzzleContainer.style.gridTemplateColumns = `repeat(${currentSize}, 1fr)`;
      // puzzleContainer.style.gridTemplateRows = `repeat(${currentSize}, 1fr)`; // 通常正方形，CSS aspect-ratio 會處理
      // puzzleContainer.style.setProperty('--grid-size', currentSize); // 如果CSS有用
      const fragment = document.createDocumentFragment();

      for (let row = 0; row < currentSize; row++) {
        for (let col = 0; col < currentSize; col++) {
          const block = document.createElement('div');
          block.className = 'puzzle-block';
          const value = gameInstance.board[row][col]; // 數字 1 到 (size*size - 1), 0 是空格
          block.dataset.row = row;
          block.dataset.col = col;
          block.dataset.value = value;

          if (value === 0) { // 空白塊
            block.classList.add('empty', `color-${selectedColor}`);
          } else if (selectedMode === 'number') { // 數字模式
            const numberSpan = document.createElement('span');
            numberSpan.textContent = value;
            // 確保 span 填滿並居中 (可以移到 CSS)
            numberSpan.style.cssText = 'display:flex; align-items:center; justify-content:center; width:100%; height:100%;';
            block.appendChild(numberSpan);
          } else { // 圖片模式 - ***使用切割好的圖片***
            block.classList.add('image-block'); // 保持這個 class 以便應用通用樣式
            if (imagePieces && imagePieces[value - 1] && imagePieces[value - 1] !== 'error_piece') {
                // value 是 1-based index for pieces array (0-based)
                const imgElement = document.createElement('img');
                imgElement.src = imagePieces[value - 1];
                imgElement.alt = `Piece ${value}`;
                // 樣式確保圖片填滿塊，可以移到 CSS 的 .image-block img
                imgElement.style.width = '100%';
                imgElement.style.height = '100%';
                imgElement.style.display = 'block'; // 移除 img 底部可能的空隙
                imgElement.style.objectFit = 'cover'; // 確保填滿
                block.appendChild(imgElement);
            } else {
                // 切割失敗或找不到圖片的後備顯示
                block.textContent = 'X';
                block.style.backgroundColor = 'lightgrey';
                block.style.display = 'flex';
                block.style.alignItems = 'center';
                block.style.justifyContent = 'center';
                console.warn(`無法渲染圖片塊 ${value}: 圖片數據缺失或錯誤`);
            }
            // 不再需要 background-image, background-position 等樣式
            // 但可以保留 .image-block 的邊框等通用樣式
          }
          fragment.appendChild(block);
        }
      }
      puzzleContainer.appendChild(fragment);
  }

  function updateGameStats() { if(gameInstance) document.getElementById('moves').textContent = gameInstance.moves; }

  async function gameComplete() { // 保持 async 以防未來需要
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
    gameInstance.saveHighScore(); // 內部使用 identifier 和 displayName
    const playAgainBtn = document.getElementById('play-again'); const backToMenuBtn = document.getElementById('back-to-menu');

    const playAgainHandler = async () => { // 改為 async
        gameCompleteDiv.classList.add('hidden');
        if (gameInstance) {
            // 使用 processedSquareImageSrc (預處理後的大圖) 和之前的設置重新開始
            // startGameFlow 會負責重新切割
            await startGameFlow(
                processedSquareImageSrc, // 傳遞預處理過的正方形大圖
                gameInstance.imageIdentifier,
                gameInstance.size,
                gameInstance.imageDisplayName
            );
        }
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
    selectedMode = null; selectedSize = null;
    selectedImageOriginalSrc = null; processedSquareImageSrc = null; imagePieces = [];
    currentImageIdentifier = ''; currentImageDisplayName = '';
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    const imgSel = document.getElementById('image-selection'); if(imgSel) imgSel.classList.add('hidden');
    if (gameInstance) gameInstance.cheatEnabled = false;
    const cheatButton = document.getElementById('cheat-button'); if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }
    const customPreview = document.querySelector('.image-options .custom-preview'); if(customPreview) customPreview.remove();
    const customInput = document.getElementById('custom-image'); if(customInput) customInput.value='';
    const highScoresList = document.getElementById('high-scores-list'); if (highScoresList) highScoresList.innerHTML = '<div class="no-record">選擇關卡以查看記錄</div>';
    if (gameInstance) { gameInstance.stopTimer(); gameInstance = null; }
    console.log("遊戲設置已重置");
  }

  function loadHighScores(mode, identifier, size) { /* ...保持不變... */
      const highScoresList = document.getElementById('high-scores-list');
      if (!highScoresList) return;
      highScoresList.innerHTML = '';
      let keyPrefix = mode;
      let keyIdentifier = identifier;

      if (mode === 'number') {
          keyIdentifier = ''; // 數字模式下標識符為空
      } else if (mode === 'image') {
          if (!identifier) {
              highScoresList.innerHTML = '<div class="no-record">圖片模式記錄參數錯誤 (無標識符)</div>'; return;
          }
      } else {
           highScoresList.innerHTML = '<div class="no-record">未知遊戲模式無法載入記錄</div>'; return;
      }
      if (size === undefined || size === null || size < 3 || size > 10) {
          highScoresList.innerHTML = '<div class="no-record">遊戲尺寸參數錯誤無法載入記錄</div>'; return;
      }

      const scores = StorageManager.getItem('puzzleHighScores', {});
      const key = `${keyPrefix}-${keyIdentifier}-${size}`;
      console.log("載入高分榜，Key:", key);
      const modeScores = Array.isArray(scores[key]) ? scores[key] : [];

      if (modeScores.length === 0) {
          const noRec = document.createElement('div'); noRec.textContent = '此關卡暫無記錄'; noRec.classList.add('no-record'); highScoresList.appendChild(noRec);
      } else {
        const table = document.createElement('table'); table.classList.add('high-scores-table'); const thead = document.createElement('thead'); const headerRow = document.createElement('tr'); const headers = ['關卡', '難度', '排名', '時間', '步數', '作弊']; headers.forEach(text => { const th = document.createElement('th'); th.textContent = text; headerRow.appendChild(th); }); thead.appendChild(headerRow); table.appendChild(thead);
        const tbody = document.createElement('tbody');
        modeScores.forEach((score, index) => {
          const row = document.createElement('tr');
          const levelCell = document.createElement('td');
          levelCell.textContent = score.levelName || '未知關卡';
          levelCell.title = score.levelName || '未知關卡'; // For tooltip on long names
          row.appendChild(levelCell);
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

  function initGameControls() {
      document.getElementById('reset-game').addEventListener('click', () => {
          if (!gameInstance) return;
          console.log("Reset button clicked: Stopping timer explicitly...");
          gameInstance.stopTimer();
          gameInstance.resetGame(); // 重置內部狀態 (moves 設為 0, board shuffles)
          renderGameBoard();      // 完全重繪 (會使用新的 board 和 imagePieces)
          gameInstance.startTimer();  // 啟動新的計時器
          updateGameStats();      // 立即更新步數顯示為 0
          document.getElementById('time').textContent = '00:00'; // 也重置時間顯示
          soundManager.playGameStartSound();
          if (gameInstance) gameInstance.cheatEnabled = false;
          const cheatButton = document.getElementById('cheat-button');
          if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c'; }
          document.querySelectorAll('.puzzle-block.hint, .puzzle-block.cheat-selected').forEach(b => b.classList.remove('hint', 'cheat-selected'));
          firstSelectedBlock = null; // 在 ui.js 頂層定義 let firstSelectedBlock = null;
          console.log("遊戲已重置，計時器和步數已更新");
      });

      document.getElementById('new-game').addEventListener('click', () => {
          if (gameInstance) gameInstance.stopTimer();
          document.getElementById('game-board').classList.add('hidden');
          document.getElementById('game-setup').classList.remove('hidden');
          resetGameSettings();
          // updateGameStats(); // 返回菜單時，棋盤上的統計數據會隱藏，所以不需要特別更新
          document.getElementById('moves').textContent = '0';
          document.getElementById('time').textContent = '00:00';
      });

      const muteButton = document.getElementById('mute-button');
      if (muteButton) muteButton.addEventListener('click', () => { const isMuted = soundManager.toggleMute(); muteButton.classList.toggle('active', isMuted); muteButton.style.backgroundColor = isMuted ? '#e74c3c' : '#3498db'; if (!isMuted) soundManager.playGameStartSound(); });

      const hintButton = document.getElementById('hint-button');
      if (hintButton) hintButton.addEventListener('click', () => { if (!gameInstance) return; const hintMove = gameInstance.getHint(); if (hintMove) { highlightHintBlock(hintMove.row, hintMove.col); soundManager.playMoveSound(); } });

      // "顯示原圖" 按鈕現在應該使用 processedSquareImageSrc
      const showOriginalButton = document.getElementById('show-original-button');
      if (showOriginalButton) {
          let showingOriginal = false;
          showOriginalButton.addEventListener('click', () => {
              if(!gameInstance || gameInstance.mode !== 'image' || !processedSquareImageSrc){ // 使用 processedSquareImageSrc
                  alert("僅圖片模式可用，且需有已處理圖片"); return;
              }
              showingOriginal = !showingOriginal;
              showOriginalButton.classList.toggle('active', showingOriginal);
              const puzzleContainer = document.querySelector('.puzzle-container'); if(!puzzleContainer) return;
              let overlay = document.getElementById('original-image-overlay');
              if (showingOriginal) {
                  if (!overlay) {
                      overlay = document.createElement('div'); overlay.id = 'original-image-overlay';
                      Object.assign(overlay.style, {
                          position:'absolute', top:'0', left:'0', width:'100%', height:'100%',
                          backgroundImage:`url(${processedSquareImageSrc})`, // 使用預處理過的正方形大圖
                          backgroundSize:'contain', backgroundPosition:'center', backgroundRepeat:'no-repeat',
                          zIndex:'10', opacity:'0.9', backgroundColor: 'rgba(255,255,255,0.5)', // 添加背景色以防圖片本身有透明
                          transition:'opacity 0.3s ease'
                      });
                      puzzleContainer.style.position = 'relative'; // 確保 overlay 相對它定位
                      puzzleContainer.appendChild(overlay);
                  }
                  showOriginalButton.textContent = '隱藏原圖';
              } else {
                  if (overlay) overlay.remove();
                  showOriginalButton.textContent = '顯示原圖';
              }
          });
      }

      const changeColorButton = document.getElementById('change-color-button');
      if (changeColorButton) { /* ... (換色邏輯保持不變) ... */
        function updateChangeColorButtonStyle(color) { changeColorButton.classList.remove('color-default-btn', 'color-blue-btn', 'color-red-btn', 'color-orange-btn'); changeColorButton.classList.add(`color-${color}-btn`); switch(color){ case 'default': changeColorButton.style.backgroundColor = '#555'; changeColorButton.style.backgroundImage = 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.2) 10px, rgba(255, 255, 255, 0.2) 20px)'; break; case 'blue': changeColorButton.style.backgroundColor = '#3498db'; changeColorButton.style.backgroundImage = 'none'; break; case 'red': changeColorButton.style.backgroundColor = '#e74c3c'; changeColorButton.style.backgroundImage = 'none'; break; case 'orange': changeColorButton.style.backgroundColor = '#f39c12'; changeColorButton.style.backgroundImage = 'none'; break; } } updateChangeColorButtonStyle(selectedColor); changeColorButton.addEventListener('click', () => { const colors = ['default', 'blue', 'red', 'orange']; const currentIndex = colors.indexOf(selectedColor); const nextIndex = (currentIndex + 1) % colors.length; selectedColor = colors[nextIndex]; soundManager.playColorChangeSound(); updateChangeColorButtonStyle(selectedColor); document.querySelectorAll('.puzzle-block.empty').forEach(block => { block.classList.remove('color-default', 'color-blue', 'color-red', 'color-orange'); block.classList.add(`color-${selectedColor}`); }); });
      }

      const gameControls = document.querySelector('.game-controls');
      let cheatButton = document.getElementById('cheat-button');
      if (!cheatButton && gameControls) {
           cheatButton = document.createElement('button'); cheatButton.id = 'cheat-button'; cheatButton.textContent = '作弊模式'; gameControls.appendChild(cheatButton);
      }
      let cheatMode = false; // cheatMode 應為 ui.js 範圍內的變量
      let firstSelectedBlock = null; // 同上
      if(cheatButton) { /* ... (作弊按鈕點擊邏輯保持不變) ... */
           cheatButton.addEventListener('click', () => {
               if (!gameInstance || !gameInstance.startTime) {
                   alert('遊戲尚未開始或計時器異常'); return;
               }
               const currentTime = new Date();
               const elapsedTimeInSeconds = Math.floor((currentTime - (gameInstance.startTime || currentTime)) / 1000);
               const timeLimit = 5 * 60;
               if (gameInstance.cheatCount === 0 && elapsedTimeInSeconds < timeLimit) {
                  const remMin = Math.floor((timeLimit - elapsedTimeInSeconds) / 60);
                  const remSec = (timeLimit - elapsedTimeInSeconds) % 60;
                  alert(`作弊模式將在 ${remMin}分${remSec}秒 後可用`); return;
               }
               cheatMode = !cheatMode;
               cheatButton.classList.toggle('active', cheatMode);
               if(gameInstance) gameInstance.cheatEnabled = cheatMode;
               firstSelectedBlock = null;
               document.querySelectorAll('.puzzle-block.cheat-selected').forEach(block => block.classList.remove('cheat-selected'));
               if (cheatMode) { alert('作弊模式已啟用！點擊任意兩個非空方塊進行交換。'); soundManager.playCheatSound(); }
               else { alert('作弊模式已關閉。'); }
           });
      }

      const puzzleContainer = document.querySelector('.puzzle-container');
      if (puzzleContainer) {
           puzzleContainer.addEventListener('click', (e) => {
               if (!gameInstance) return;
               const blockElement = e.target.closest('.puzzle-block'); // 更可靠地獲取塊元素
               if (!blockElement) return;
               const row = parseInt(blockElement.dataset.row);
               const col = parseInt(blockElement.dataset.col);
               if (isNaN(row) || isNaN(col)) return;

               if (cheatMode && gameInstance.cheatEnabled) { // 使用 ui.js 的 cheatMode
                   if (blockElement.classList.contains('empty')) { alert('作弊模式不能選擇空白方塊'); return; }
                   if (!firstSelectedBlock) {
                       firstSelectedBlock = { row, col, element: blockElement };
                       blockElement.classList.add('cheat-selected');
                   } else {
                       const swapSuccess = gameInstance.cheatSwap(firstSelectedBlock.row, firstSelectedBlock.col, row, col);
                       if (swapSuccess) {
                           renderGameBoard(); // 重繪棋盤
                           updateGameStats(); // 更新步數
                           soundManager.playCheatSound();
                           requestAnimationFrame(() => { if (gameInstance.checkWin()) gameComplete(); });
                       }
                       if(firstSelectedBlock.element) firstSelectedBlock.element.classList.remove('cheat-selected');
                       blockElement.classList.remove('cheat-selected'); // 移除當前點擊塊的高亮
                       firstSelectedBlock = null;
                   }
               } else { // 非作弊模式
                   const moveSuccess = gameInstance.moveBlock(row, col);
                   if (moveSuccess) {
                       updateGameStats(); // 移動成功後更新步數
                       soundManager.playMoveSound();
                       // renderGameBoard(); // moveBlock 內部不直接重繪，依賴外部調用
                       // 這裡需要一種方式讓 game.js 通知 ui.js 重繪特定塊，或者 ui.js 自己重繪
                       // 簡單起見，我們還是完整重繪
                       renderGameBoard();
                       requestAnimationFrame(() => { if (gameInstance.checkWin()) gameComplete(); });
                   }
               }
           }, true); // 使用捕獲階段以處理嵌套元素（如img）的點擊
      }
  }
  let firstSelectedBlock = null; // 作弊模式用的，定義在 initGameControls 外層

  function highlightHintBlock(row, col) { /* ...保持不變... */
      document.querySelectorAll('.puzzle-block.hint').forEach(block => { block.classList.remove('hint'); });
      const puzzleContainer = document.querySelector('.puzzle-container');
      if (!puzzleContainer || !gameInstance) return;
      const currentSize = gameInstance.size;
      const index = row * currentSize + col;
      const blocks = puzzleContainer.querySelectorAll('.puzzle-block');
      if (blocks && blocks[index]) {
          blocks[index].classList.add('hint');
          setTimeout(() => {
              // 再次查詢以防 DOM 變化
              const currentBlocksAfterTimeout = puzzleContainer.querySelectorAll('.puzzle-block');
              if (currentBlocksAfterTimeout && currentBlocksAfterTimeout[index]) {
                   currentBlocksAfterTimeout[index].classList.remove('hint');
              }
          }, 3000);
      } else {
          console.warn(`Hint Error: Cannot find block at index ${index} for (${row}, ${col})`);
      }
  }

  function initCustomImageUpload() {
    const customInput = document.getElementById('custom-image');
    if (!customInput) return;
    customInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (event) => { // 改為 async
            try {
                // 步驟 1: 預處理上傳的圖片為正方形 DataURL
                const gameSizeForPreview = getGameSize(); // 用當前選擇的尺寸預處理
                const squareDataURL = await preprocessImage(event.target.result, gameSizeForPreview);

                selectedImageOriginalSrc = event.target.result; // 存儲原始 File Reader 結果
                processedSquareImageSrc = squareDataURL; // 存儲預處理後的結果
                currentImageIdentifier = sanitizeFilenameForKey(file.name);
                currentImageDisplayName = file.name;
                console.log(`自定義圖片選擇: Name='${currentImageDisplayName}', ID='${currentImageIdentifier}'`);

                document.querySelectorAll('.image-options img.selected').forEach(img => img.classList.remove('selected'));
                const imageOptions = document.querySelector('.image-options');
                if (imageOptions) {
                     const existingPreview = imageOptions.querySelector('.image-options .custom-preview');
                     if (existingPreview) existingPreview.remove();
                     const preview = document.createElement('img');
                     preview.src = processedSquareImageSrc; // 預覽使用預處理後的正方形圖
                     preview.alt = '自定義預覽';
                     preview.title = currentImageDisplayName;
                     preview.classList.add('selected', 'custom-preview');
                     preview.style.width = '100px'; preview.style.height = '100px'; preview.style.objectFit = 'cover';
                     imageOptions.appendChild(preview);
                     preview.addEventListener('dblclick', async () => { // 改為 async
                         selectedMode = 'image';
                         highlightSelectedButton('image-mode');
                         document.getElementById('image-selection').classList.remove('hidden');
                         const gameSize = getGameSize();
                         // startGameFlow 會負責切割 processedSquareImageSrc
                         await startGameFlow(processedSquareImageSrc, currentImageIdentifier, gameSize, currentImageDisplayName);
                     });
                }
                 if (selectedMode !== 'image') {
                      selectedMode = 'image';
                      const imgBtn=document.getElementById('image-mode'); if(imgBtn) imgBtn.classList.add('selected');
                      const numBtn=document.getElementById('number-mode'); if(numBtn) numBtn.classList.remove('selected');
                      const imgSelDiv=document.getElementById('image-selection'); if(imgSelDiv) imgSelDiv.classList.remove('hidden');
                 }
            } catch (error) {
                alert("處理上傳圖片失敗: " + error.message);
                console.error("Error processing uploaded image for preview:", error);
            }
        };
        reader.onerror = () => { alert("讀取自定義圖片失敗"); };
        reader.readAsDataURL(file);
      }
    });
  }

  function initColorSelection() { selectedColor = 'default'; }

  function initWebImageSearch() {
    const webSearchBtn = document.getElementById('web-image-search-btn');
    if (!webSearchBtn) return;
    // 確保 WebImageSearch 初始化時傳遞了正確的回調
    WebImageSearch.init(async (imageUrl, imageName) => { // 回調改為 async
        try {
            // 步驟 1: 預處理網路圖片為正方形 DataURL
            const gameSizeForPreview = getGameSize();
            const squareDataURL = await preprocessImage(imageUrl, gameSizeForPreview);

            selectedImageOriginalSrc = imageUrl; // 存儲原始網路圖片 URL
            processedSquareImageSrc = squareDataURL; // 存儲預處理後的結果
            currentImageIdentifier = 'net_' + sanitizeFilenameForKey(imageName);
            currentImageDisplayName = imageName;
            console.log(`網路圖片選擇: Name='${currentImageDisplayName}', ID='${currentImageIdentifier}'`);

            document.querySelectorAll('.image-options img.selected').forEach(img => img.classList.remove('selected'));
            const customInput = document.getElementById('custom-image'); if (customInput) customInput.value = '';
            const imageOptions = document.querySelector('.image-options');
            if (imageOptions) {
                const existingPreview = imageOptions.querySelector('.image-options .custom-preview');
                if (existingPreview) existingPreview.remove();
                const preview = document.createElement('img');
                preview.src = processedSquareImageSrc; // 預覽使用預處理後的正方形圖
                preview.alt = '網路圖片預覽';
                preview.title = currentImageDisplayName;
                preview.classList.add('selected', 'custom-preview');
                preview.style.width = '100px'; preview.style.height = '100px'; preview.style.objectFit = 'cover';
                imageOptions.appendChild(preview);
                preview.addEventListener('dblclick', async () => { // 改為 async
                     selectedMode = 'image';
                     highlightSelectedButton('image-mode');
                     document.getElementById('image-selection').classList.remove('hidden');
                     const gameSize = getGameSize();
                     await startGameFlow(processedSquareImageSrc, currentImageIdentifier, gameSize, currentImageDisplayName);
                });
            }
            if (selectedMode !== 'image') {
                selectedMode = 'image';
                const imgBtn=document.getElementById('image-mode'); if(imgBtn) imgBtn.classList.add('selected');
                const numBtn=document.getElementById('number-mode'); if(numBtn) numBtn.classList.remove('selected');
                const imgSelDiv=document.getElementById('image-selection'); if(imgSelDiv) imgSelDiv.classList.remove('hidden');
           }
        } catch (error) {
            alert("處理網路圖片失敗: " + error.message);
            console.error("Error processing web image for preview:", error);
        }
    });
    webSearchBtn.addEventListener('click', () => WebImageSearch.showModal());
  }

  function initUI() {
    initModeSelection();
    initImageSelection(); // 現在是異步的，但主要影響預設圖的初始加載
    initSizeSelection();
    initColorSelection();
    initStartGameButton();
    initGameControls();
    initCustomImageUpload();
    initWebImageSearch(); // 確保 WebImageSearch.init 在這裡或之前被調用
    document.querySelectorAll('.mode-options button, .size-options button').forEach(button => { button.classList.add('option-button'); });
    console.log("UI 初始化完成 (使用內存切割圖片方案)");
  }

  initUI();
});