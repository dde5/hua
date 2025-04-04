// ui.js (完整修正版 - 包含所有功能和 Bug 修復)
document.addEventListener('DOMContentLoaded', () => {
  // 遊戲設置變數
  let selectedMode = null;
  let selectedSize = null;
  let selectedImage = null; // DataURL 或原始路徑
  let selectedColor = 'default';
  let gameInstance = null;
  let currentImageIdentifier = ''; // 清理後的標識符 (用於 Key)
  let currentImageDisplayName = ''; // 原始或可讀檔名 (用於顯示)

  // 預設圖片
  const presetImages = [
    { name: 'C1', src: 'images/C1.jpg' }, { name: 'C2', src: 'images/C2.jpg' },
    { name: 'C3', src: 'images/C3.jpg' }, { name: 'C完整** `ui.js` 檔案程式碼。

```javascript
// ui.js (最終修正版 - 添加雙擊啟動、修復重置計時器、區分自定義圖片記錄)
document.addEventListener('DOMContentLoaded', () => {
  // 遊戲設置變數
  let selectedMode = null;
  let selectedSize = null;
  let selectedImage = null; // DataURL
  let selectedColor = 'default';
  let gameInstance = null;
  let currentImageIdentifier = ''; // 清理後的標識符 (用於 Key)
  let currentImageDisplayName = ''; // 原始或可讀檔名 (用於顯示)

  // 預設圖片 (保持不變)
  const presetImages = [
    { name: 'C1', src: 'images/C1.jpg' }, { name: 'C2', src: 'images/C2.jpg' },
    { name: 'C3', src: 'images/C3.jpg' }, { name: 'C4', src: 'images/C4.jpg' },
    { name: 'C5', src: 'images/C5.jpg' }, { name: 'C6', src: '4', src: 'images/C4.jpg' },
    { name: 'C5', src: 'images/C5.jpg' }, { name: 'C6', src: 'images/C6.jpg' },
    { name: 'C7', src: 'images/C7.jpg' }, { name: 'C8', src: 'images/C8.jpg' },
    { name: 'Eimages/C6.jpg' },
    { name: 'C7', src: 'images/C7.jpg' }, { name: 'C8', src: 'images/C8.jpg' },
    { name: 'E1', src: 'images/E1.jpg' }, { name: 'E2', src: 'images/E2.jpg' },
    { name: 'E3', src: 'images/E3.jpg' }, { name: 'E4', src: 'images/E4.jpg' },
    { name: 'E5', src: 'images/E5.jpg' }, { name: 'E6', src: 'images/E6.jpg' },
    { name: 'M1', src: 'images/M1.jpg' }, { name: 'M2', src: 'images/M2.jpg'1', src: 'images/E1.jpg' }, { name: 'E2', src: 'images/E2.jpg' },
    { name: 'E3', src: 'images/E3.jpg' }, { name: 'E4', src: 'images/E4.jpg' },
    { name: 'E5', src: 'images/E5.jpg' }, { name: 'E6', src: 'images/E6.jpg' },
    { name: },
    { name: 'M3', src: 'images/M3.jpg' }, { name: 'M4', src: 'images/M4.jpg' },
    { name: 'M5', src: 'images/M5.jpg' }, { name: 'H1', src: 'images/H1.jpg' },
    { name: 'H2', src: 'images/H2.jpg' }, { name: 'H 'M1', src: 'images/M1.jpg' }, { name: 'M2', src: 'images/M2.jpg' },
    { name: 'M3', src: 'images/M3.jpg' }, { name: 'M4', src: 'images/M4.jpg' },
    { name: 'M5',3', src: 'images/H3.jpg' },
    { name: 'H4', src: 'images/H4.jpg' }, { name: 'H5', src: 'images/H5.jpg' },
    { name: 'H6', src: 'images/M5.jpg' }, { name: 'H1', src: 'images/H1.jpg' },
    { name: 'H2', src: 'images/H2.jpg' }, { name: 'H src: 'images/H6.jpg' }
  ];
  let processedPresetImages = [];

  // 輔助函數：清理檔3', src: 'images/H3.jpg' },
    { name: 'H4', src: 'images/H4.jpg'名作為標識符
  function sanitizeFilenameForKey(filename) {
      if (!filename) return 'custom_unknown';
      const baseName = filename.substring(filename }, { name: 'H5', src: 'images/H5..lastIndexOf('/') + 1).substring(filename.lastIndexOf('\\') + jpg' },
    { name: 'H6', src: 'images1);
      const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const truncated = sanitized.substring(0,/H6.jpg' }
  ];
  let processedPresetImages = [];

  // 輔助函數：清理檔名作為標識符
  function sanitizeFilenameForKey(filename) {
      if (!filename) return 'custom_unknown';
      const baseName = filename.substring 30);
      const finalKey = 'custom_' + truncated.toLowerCase();
      return finalKey === 'custom_' ? 'custom_upload' : finalKey;
  }(filename.lastIndexOf('/') + 1).substring(filename.lastIndexOf('\\')

  // initImageSelection: 添加 dblclick 監聽器
   + 1);
      const sanitized = baseName.replace(/[^aasync function initImageSelection() {
    const imageOptions = document.querySelector-zA-Z0-9_-]/g, '_');
      const truncated = sanitized.substring(0, 30);
      const finalKey = 'custom_' + truncated('.image-options');
    if (!imageOptions) return;
    .toLowerCase();
      return finalKey === 'custom_' ? 'custom_try {
        if (typeof preprocessPresetImages === 'function') {
            processedPresetImages =upload' : finalKey;
  }

  // 初始化圖片選擇（ await preprocessPresetImages(presetImages);
        } else {
            processedPresetImages = presetImages.map(img => ({ ...img }));
        包含雙擊啟動）
  async function initImageSelection() {
    const imageOptions}
    } catch (error) {
        console.error("預 = document.querySelector('.image-options');
    if (!imageOptions)處理預設圖片時出錯:", error);
        processedPresetImages = return;
    try {
        if (typeof preprocessPresetImages === 'function') {
            processedPresetImages = await preprocessPresetImages(presetImages presetImages.map(img => ({ ...img }));
    }
    );
        } else {
            processedPresetImages = presetImages.mapimageOptions.innerHTML = '';
    processedPresetImages.forEach(image => {
      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.name;(img => ({ ...img }));
        }
    } catch (error) {
        console.error("預處理預設圖片時出錯:", error);
        processedPresetImages = preset img.title = image.name; img.dataset.imageName = imageImages.map(img => ({ ...img }));
    }
    image.name;

      // 單擊：選擇圖片
      img.addEventListener('click', () => {Options.innerHTML = '';
    processedPresetImages.forEach(image => {
      const img = document.createElement('img');
      img.src
        document.querySelectorAll('.image-options img.selected').forEach(i => i.classList.remove('selected'));
        img.classList.add = image.src;
      img.alt = image.name; img('selected');
        selectedImage = image.src;
        currentImage.title = image.name; img.dataset.imageName = image.Identifier = image.name;
        currentImageDisplayName = image.name;
        const customname;

      // 單擊：選擇圖片
      img.addEventListener('click', () => {
        document.querySelectorAll('.image-options img.selected').forEach(iInput = document.getElementById('custom-image'); if (customInput) custom => i.classList.remove('selected'));
        img.classList.add('selected');
Input.value = '';
        const customPreview = document.querySelector('.image        selectedImage = image.src;
        currentImageIdentifier = image.-options .custom-preview'); if (customPreview) customPreview.remove();
      });

      // 雙擊：直接開始遊戲
      img.addEventListener('name;
        currentImageDisplayName = image.name;
        const customInput = document.getElementById('custom-image'); if (customInput) customInput.value =dblclick', () => {
        console.log('雙擊圖片:', '';
        const customPreview = document.querySelector('.image-options .custom image.name);
        selectedMode = 'image';
        highlightSelectedButton('image-mode');
-preview'); if (customPreview) customPreview.remove();
      });        document.getElementById('image-selection').classList.remove('hidden');

        selectedImage = image.src;
        currentImageIdentifier = image.name;
        currentImageDisplayName

      // 雙擊：直接開始遊戲
      img.addEventListener(' = image.name;
        document.querySelectorAll('.image-options img.dblclick', () => {
        console.log('雙擊圖片:', image.name);
        selectedMode = 'image';
        highlightSelectedButton('image-mode');
        document.getElementById('image-selection').classList.remove('hidden');
        selectedselected').forEach(i => i.classList.remove('selected'));
        Image = image.src;
        currentImageIdentifier = image.name;img.classList.add('selected');

        const gameSize = getGameSize();
        startGame(selectedImage, currentImageIdentifier, gameSize, currentImageDisplayName);
      
        currentImageDisplayName = image.name;
        document.querySelectorAll('.image-options img.});

      imageOptions.appendChild(img);
    });
  }

  functionselected').forEach(i => i.classList.remove('selected'));
         initModeSelection() {
    document.getElementById('number-mode').addEventListener('click', () => {
      selectedMode = 'number'; document.img.classList.add('selected');
        const gameSize = getGamegetElementById('image-selection').classList.add('hidden'); highlightSelectedButton('number-mode');
Size();
        startGame(selectedImage, currentImageIdentifier, gameSize, currentImageDisplayName);
            selectedImage = null; currentImageIdentifier = ''; currentImageDisplayName = '';
      document});
      imageOptions.appendChild(img);
    });
  }

  // 初始化.querySelectorAll('.image-options img.selected').forEach(i => i.classList.remove('selected'));
      const cp = document.querySelector('.image模式選擇
  function initModeSelection() {
    document.getElementById('number-mode').addEventListener-options .custom-preview'); if (cp) cp.remove();
('click', () => {
      selectedMode = 'number'; document.getElementById('image-selection').classList      const ci = document.getElementById('custom-image'); if (ci).add('hidden'); highlightSelectedButton('number-mode');
      selected ci.value = '';
    });
    document.getElementById('image-Image = null; currentImageIdentifier = ''; currentImageDisplayName = '';
      documentmode').addEventListener('click', () => {
      selectedMode = 'image.querySelectorAll('.image-options img.selected').forEach(i => i.classList.remove('selected'));
      const cp = document.querySelector('.image'; document.getElementById('image-selection').classList.remove('hidden'); highlightSelectedButton('image-options .custom-preview'); if (cp) cp.remove();
-mode');
    });
  }

  function highlightSelectedButton(id) {
    const buttons = document.querySelectorAll('.mode-options button, .size-options      const ci = document.getElementById('custom-image'); if (ci) button');
    buttons.forEach(button => button.classList.remove(' ci.value = '';
    });
    document.getElementById('image-mode').addEventListener('click', () => {
      selectedMode = 'imageselected'));
    const element = document.getElementById(id); if (element) element.classList.add('selected');
    document.querySelectorAll('.size-options button').forEach('; document.getElementById('image-selection').classList.remove('hidden'); highlightbtn => { if(parseInt(btn.dataset.size) === selectedSize) btn.classList.add('selected'); else btn.classList.remove('selected');SelectedButton('image-mode');
    });
  }

  // 高亮選中按鈕
  function highlightSelectedButton(id) { });
  }

  function initSizeSelection() {
    const sizeButtons = document.querySelectorAll('.size
    const buttons = document.querySelectorAll('.mode-options button, .size-options button');
    const customSizeInput = document.getElementById('custom-options button');
    buttons.forEach(button => button.classList.remove('selected'));
    const element = document.getElementById(id); if (element) element.classList.-size-input');
    sizeButtons.forEach(button => { button.addEventListener('click', () => { selectedSize = parseInt(button.datasetadd('selected');
    document.querySelectorAll('.size-options button').forEach(btn => { if(parseInt.size); document.querySelectorAll('.size-options button').forEach(b => b.classList.(btn.dataset.size) === selectedSize) btn.classList.add('selected'); else btn.classList.remove('selected'); });
  }

  // 初始化remove('selected')); button.classList.add('selected'); if(customSizeInput) customSizeInput尺寸選擇
  function initSizeSelection() {
    const sizeButtons =.value = selectedSize; }); });
    if (customSizeInput) { if(! document.querySelectorAll('.size-options button');
    const customSizeInput =selectedSize) selectedSize = parseInt(customSizeInput.value) ||  document.getElementById('custom-size-input');
    sizeButtons.forEach4; else customSizeInput.value = selectedSize; customSizeInput.addEventListener('change', (e) => { const v = parseInt(e.target.value); if ((button => { button.addEventListener('click', () => { selectedSize =v>=3&&v<=10) { selectedSize = v; document parseInt(button.dataset.size); document.querySelectorAll('.size-options button').forEach(b => b.classList.remove('selected')); button.classList.querySelectorAll('.size-options button').forEach(b => b.classList..add('selected'); if(customSizeInput) customSizeInput.value = selectedSize; }); });remove('selected'));} else { alert('請輸入3到10');
    if (customSizeInput) { if(!selectedSize) selectedSize = parseInt(customSizeInput.value) || 4; else customSizeInput.value = selectedSize; customSize e.target.value = selectedSize||4; } }); }
    else if (!selectedSize) selectedSize = 4;
  }

Input.addEventListener('change', (e) => { const v = parseInt(  function getGameSize() {
      if (!selectedSize) selectedSize = parseInt(document.getElementById('e.target.value); if (v>=3&&v<=10) { selectedSize = v; document.querySelectorAll('.size-options button').forEach(b => b.classList.remove('selected'));} else { alertcustom-size-input').value) || 4;
      return selectedSize >= 3 && selectedSize('請輸入3到10'); e.target.value = selectedSize <= 10 ? selectedSize : 4;
  }

  ||4; } }); }
    else if (!selectedSize) selectedSizefunction initStartGameButton() {
    document.getElementById('start-game').addEventListener = 4;
  }

  // 獲取遊戲尺寸
  function getGameSize()('click', () => {
      if (!selectedMode) { alert('請選擇遊戲 {
      if (!selectedSize) selectedSize = parseInt(document.getElementById('custom-size-input').value) || 4;
      return selectedSize >= 3 && selectedSize模式'); return; }
      const gameSize = getGameSize();
 <= 10 ? selectedSize : 4;
  }

        let imageSourceForGame = selectedImage;
      let identifierForGame// 初始化開始遊戲按鈕
  function initStartGameButton() {
    document = currentImageIdentifier;
      let displayNameForGame = currentImageDisplayName;.getElementById('start-game').addEventListener('click', () => {
      

      if (selectedMode === 'image') {
          const customImageInput = document.getElementByIdif (!selectedMode) { alert('請選擇遊戲模式'); return; }
      const gameSize = getGameSize();
      let imageSourceForGame = selectedImage;
      let('custom-image');
          if (customImageInput && customImageInput identifierForGame = currentImageIdentifier;
      let displayNameForGame = current.files[0] && (!selectedImage || !selectedImage.startsWith('data:'))) {
              const file = customImageInput.files[0];
              identifierForGame = sanitizeFilenameForKey(file.name);
              displayNameForGame = file.name;
              const reader = new FileReader();
              reader.onload = (e)ImageDisplayName;

      if (selectedMode === 'image') {
           => {
                  imageSourceForGame = e.target.result;
                  selectedconst customImageInput = document.getElementById('custom-image');
          // 如果選擇了文件但尚未處理
          if (customImageInput && customImageInput.files[0Image = imageSourceForGame;
                  currentImageIdentifier = identifierForGame;
                  currentImageDisplayName] && (!selectedImage || !selectedImage.startsWith('data:'))) { = displayNameForGame;
                  startGame(imageSourceForGame, identifierForGame, gameSize, displayNameForGame);
              };
              reader.onerror = ()
              const file = customImageInput.files[0];
              identifier => { alert("讀取自定義圖片失敗"); }; reader.readAsDataURL(fileForGame = sanitizeFilenameForKey(file.name);
              displayNameForGame); return;
          }
          else if (selectedImage && identifierForGame) {
              startGame = file.name;
              const reader = new FileReader();
              reader(imageSourceForGame, identifierForGame, gameSize, displayNameForGame);
          } else { alert('圖片模式下，請選擇或上傳圖片'); return; }
      } else.onload = (e) => {
                  imageSourceForGame = e.target.result;
                  selectedImage = imageSourceForGame; // {
          identifierForGame = ''; displayNameForGame = '數字模式'; 更新狀態
                  currentImageIdentifier = identifierForGame;
                  currentImageDisplayName imageSourceForGame = null;
          startGame(imageSourceForGame, identifierForGame, gameSize, displayNameForGame);
      }
    });
  }

 = displayNameForGame;
                  startGame(imageSourceForGame, identifierForGame, game  async function startGame(imageSource, identifier, size, displayName) {
    const gameSetupDiv = document.getElementById('game-setup'); const gameBoardDiv = documentSize, displayNameForGame);
              };
              reader.onerror = () => { alert("讀取自定義圖片失敗"); }; reader.readAsDataURL(file.getElementById('game-board');
    if (!gameSetupDiv || !gameBoardDiv) return;
    gameSetupDiv.classList.add('); return;
          }
          // 如果已選擇圖片
          else if (selectedImage && identifierForGame) {
              startGame(imageSourceForGame, identifierForGame, gameSize, displayNamehidden'); gameBoardDiv.classList.remove('hidden');

    let finalImageSource = imageSource;
    if (selectedMode === 'image' && imageSource && typeof preprocessImage === 'function')ForGame);
          } else { alert('圖片模式下，請選擇或上傳 {
        try {
            finalImageSource = await preprocessImage(imageSource, size);
        } catch (error) {
            console.error("startGame: 圖片預處理失敗:", error圖片'); return; }
      } else { // 數字模式
          );
            alert("圖片處理失敗，無法開始遊戲");
            if (gameBoardDividentifierForGame = ''; displayNameForGame = '數字模式'; imageSourceForGame = null) gameBoardDiv.classList.add('hidden');
            if (game;
          startGame(imageSourceForGame, identifierForGame, gameSize, displayNameForGame);
      SetupDiv) gameSetupDiv.classList.remove('hidden');
            return;
        }
    }

    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) { cheatButton.classList.remove('active}
    });
  }

  // 開始遊戲
  async function'); cheatButton.style.backgroundColor = '#e74c3c'; startGame(imageSource, identifier, size, displayName) {
    const game }

    try {
      if (typeof PuzzleGame === 'undefined')SetupDiv = document.getElementById('game-setup'); const gameBoardDiv = {
          throw new Error("PuzzleGame is not defined. Check game. document.getElementById('game-board');
    if (!gameSetupDiv || !gameBoardDiv) return;
    gameSetupDiv.classList.addjs loading order or syntax errors.");
      }
      gameInstance = new('hidden'); gameBoardDiv.classList.remove('hidden');

    let finalImageSource = imageSource PuzzleGame(size, selectedMode, finalImageSource, identifier, displayName); // 傳遞參數
      if (gameInstance) {
          renderGameBoard();
          game;
    if (selectedMode === 'image' && imageSource && typeof preprocessImageInstance.startTimer();
          loadHighScores(selectedMode, gameInstance.imageIdentifier, size === 'function') {
        try {
            finalImageSource = await preprocessImage(imageSource, size);
        } catch (error) {);
          soundManager.playGameStartSound();
          gameInstance.cheatEnabled = false;
      } else { throw new Error("遊戲實例創建失敗"); }
    } catch (error) {
      console.error('遊戲初始化或啟動失敗:', error
            console.error("startGame: 圖片預處理失敗:", error);
            alert); alert('遊戲初始化失敗: ' + error.message);
      if (gameBoardDiv) game("圖片處理失敗，無法開始遊戲");
            if (gameBoardDiv) gameBoardDiv.BoardDiv.classList.add('hidden'); if (gameSetupDiv) gameclassList.add('hidden');
            if (gameSetupDiv) gameSetupDiv.classList.remove('hidden');
            return;
        }
    }

    const cheatButton = document.getElementByIdSetupDiv.classList.remove('hidden');
    }
  }

  // renderGameBoard (保持穩定版邏輯)
  function renderGameBoard() {
      ('cheat-button');
    if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c3c';const puzzleContainer = document.querySelector('.puzzle-container');
      if (!puzzleContainer || !game }

    try {
      if (typeof PuzzleGame === 'undefined')Instance) { console.error("Render Error: No container or game instance"); return; } {
          throw new Error("PuzzleGame is not defined. Check game.
      puzzleContainer.innerHTML = '';
      const currentSize = gameInstancejs loading order or syntax errors.");
      }
      gameInstance = new.size;
      puzzleContainer.style.gridTemplateColumns = `repeat(${currentSize}, 1fr)`;
      puzzleContainer.style.gridTemplateRows = `repeat(${ PuzzleGame(size, selectedMode, finalImageSource, identifier, displayName);currentSize}, 1fr)`;
      puzzleContainer.style.setProperty('--
      if (gameInstance) {
          renderGameBoard();
          gameInstance.startTimer();
          loadHighScores(selectedMode, gameInstance.imageIdentifier, sizegrid-size', currentSize);
      const fragment = document.createDocument);
          soundManager.playGameStartSound();
          gameInstance.cheatEnabled = falseFragment();

      for (let row = 0; row < currentSize;
      } else { throw new Error("遊戲實例創建失敗"); }
    } catch (error; row++) {
        for (let col = 0; col <) {
      console.error('遊戲初始化或啟動失敗:', error); alert('遊戲初始化失敗: ' + error.message);
      if (gameBoardDiv) game currentSize; col++) {
          const block = document.createElement('divBoardDiv.classList.add('hidden'); if (gameSetupDiv) game');
          block.className = 'puzzle-block';
          const value = gameInstance.board[row][col];
          block.dataset.row = row;SetupDiv.classList.remove('hidden');
    }
  }


          block.dataset.col = col;
          block.dataset.  // 渲染遊戲板（穩定版）
  function renderGameBoard()value = value;

          if (value === 0) {
             {
      const puzzleContainer = document.querySelector('.puzzle-container');
      ifblock.classList.add('empty', `color-${selectedColor}`);
           (!puzzleContainer || !gameInstance) { console.error("Render Error: No} else if (selectedMode === 'number') {
            const numberSpan = document. container or game instance"); return; }
      puzzleContainer.innerHTML = '';
      constcreateElement('span');
            numberSpan.textContent = value;
            number currentSize = gameInstance.size;
      puzzleContainer.style.gridSpan.style.cssText = 'display:flex; align-items:TemplateColumns = `repeat(${currentSize}, 1fr)`;
      puzzlecenter; justify-content:center; width:100%; height:100%;';
            block.appendChild(numberSpan);
          Container.style.gridTemplateRows = `repeat(${currentSize}, 1fr)`;
      puzzleContainer.style.setProperty('--grid-size', currentSize);
      const fragment = document.createDocumentFragment();

      for (let row = 0; row < currentSize; row++) {
} else { // 圖片模式
            block.classList.add('image-block');
            const originalCol = (value - 1) % currentSize;
            const original        for (let col = 0; col < currentSize; col++) {
          const block = document.createElement('div');
          block.className = 'puzzle-block';
          const value = gameInstance.board[row][col];
          block.dataset.row = row;
          block.dataset.col =Row = Math.floor((value - 1) / currentSize);
            block.style.position = col;
          block.dataset.value = value;

          if ( 'relative';
            block.style.overflow = 'hidden';
            const imgContainer = document.createElement('div');
            imgContainer.stylevalue === 0) {
            block.classList.add('empty', `color-${selectedColor}`);
          } else if (selectedMode === 'number') {
            .position = 'absolute';
            imgContainer.style.width = `${currentSize * 100}%`;
            imgContainer.style.const numberSpan = document.createElement('span');
            numberSpan.textContentheight = `${currentSize * 100}%`;
            if ( = value;
            numberSpan.style.cssText = 'display:flex; align-items:center; justify-content:center; width:gameInstance.imageSource) {
                 imgContainer.style.backgroundImage = `url(${gameInstance.imageSource})`;
                 imgContainer.style.100%; height:100%;';
            block.appendChild(numberSpan);
          } else { // 圖片模式
            block.classList.add('image-block');
            const originalCol = (value - 1)backgroundSize = 'cover';
                 imgContainer.style.backgroundRepeat = % currentSize;
            const originalRow = Math.floor((value - 'no-repeat';
            } else {
                 block.textContent = 1) / currentSize);
            block.style.position = 'relative';
            block.style 'X'; block.style.backgroundColor = 'red';
            }
.overflow = 'hidden';
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'absolute';
                        imgContainer.style.transform = 'translateZ(0)'; imgContainer.style.webkitTransform = 'translateZ(0)'; imgContainer.styleimgContainer.style.width = `${currentSize * 100}%`;
            imgContainer.style.height = `${currentSize * 1.webkitBackfaceVisibility = 'hidden'; imgContainer.style.willChange = 'transform'; imgContainer.style.transition = 'none';
            const offsetX = -originalCol *00}%`;
            if (gameInstance.imageSource) {
 100; const offsetY = -originalRow * 100                 imgContainer.style.backgroundImage = `url(${gameInstance.imageSource})`;
                 imgContainer.style;
            imgContainer.style.left = `${offsetX}%`; imgContainer.style.top = `${offsetY}%`;
            block.appendChild(imgContainer);
            .backgroundSize = 'cover';
                 imgContainer.style.backgroundRepeatblock.style.border = '1px solid rgba(255,2 = 'no-repeat';
            } else {
                 block.textContent55,255,0.2)';
            block.style.backgroundColor = '#ddd';
          }
          fragment.appendChild(block = 'X'; block.style.backgroundColor = 'red';
            }
            imgContainer.style.transform = 'translateZ(0)'; imgContainer.style);
        }
      }
      puzzleContainer.appendChild(fragment);.webkitTransform = 'translateZ(0)'; imgContainer.style.webkit
  }

  function updateGameStats() { if(gameInstance) document.getElementById('BackfaceVisibility = 'hidden'; imgContainer.style.willChange = 'transform'; imgContainer.style.transition = 'none';
            const offsetXmoves').textContent = gameInstance.moves; }

  // gameComplete: 傳遞 displayName
  function gameComplete() {
    if (!gameInstance) return; = -originalCol * 100; const offsetY = -originalRow
    gameInstance.stopTimer();
    soundManager.playWinSound();
    const cheatButton = document.getElementById('cheat-button'); if (cheatButton) cheatButton.classList.remove('active');
    if (gameInstance) gameInstance.cheatEnabled = * 100;
            imgContainer.style.left = `${offsetX}%`; imgContainer.style.top = `${offsetY}%`;
            block.appendChild(imgContainer false;

    const gameBoardDiv = document.getElementById('game-board'); const gameCompleteDiv =);
            block.style.border = '1px solid rgba(255,2 document.getElementById('game-complete');
    if (!gameBoardDiv ||55,255,0.2)';
            block.style !gameCompleteDiv) return;
    gameBoardDiv.classList.add.backgroundColor = '#ddd';
          }
          fragment.appendChild(block('hidden'); gameCompleteDiv.classList.remove('hidden');
    const);
        }
      }
      puzzleContainer.appendChild(fragment); timeEl = document.getElementById('time'); const completionTimeEl = document.
  }

  // 更新遊戲統計
  function updateGameStats()getElementById('completion-time'); const completionMovesEl = document.getElementById('completion-moves');
    if (completionTimeEl && timeEl) completionTimeEl.textContent = timeEl.textContent; if (completionMovesEl) completionMovesEl.textContent = { if(gameInstance) document.getElementById('moves').textContent = gameInstance.moves; }

  // gameInstance.moves;
    const completionStats = document.querySelector('.completion-stats');
    if 遊戲完成
  function gameComplete() {
    if (!gameInstance) return;
 (completionStats) {
        const existingCheatInfo = document.getElementById('completion-cheat-info'); if    gameInstance.stopTimer();
    soundManager.playWinSound();
    const cheatButton = (existingCheatInfo) completionStats.removeChild(existingCheatInfo);
        const cheatInfo = document. document.getElementById('cheat-button'); if (cheatButton) cheatButton.classList.createElement('p'); cheatInfo.id = 'completion-cheat-info';
        if (gameInstance.cheatCount > 0) { cheatInfo.innerHTML = `<strong>作弊模式:</strong> <span class="cheat-remove('active');
    if (gameInstance) gameInstance.cheatEnabled = false;

    const gameBoardDiv = document.getElementById('game-board'); const gameCompleteDiv = document.getElementById('game-complete');
    if (!gameBoardDiv ||used">使用了 ${gameInstance.cheatCount} 次</span>`; } else { !gameCompleteDiv) return;
    gameBoardDiv.classList.add cheatInfo.innerHTML = `<strong>作弊模式:</strong> <span class="cheat-not-used">未使用</span>`; }
        completionStats.appendChild('hidden'); gameCompleteDiv.classList.remove('hidden');
    const(cheatInfo);
    }
    gameInstance.saveHighScore();
 timeEl = document.getElementById('time'); const completionTimeEl = document.    const playAgainBtn = document.getElementById('play-again'); const backgetElementById('completion-time'); const completionMovesEl = document.getElementById('completionToMenuBtn = document.getElementById('back-to-menu');

    -moves');
    if (completionTimeEl && timeEl) completionTimeEl.textContent = timeEl.textContent; if (completionMovesEl) completionMovesEl.textContent =const playAgainHandler = () => {
        gameCompleteDiv.classList.add('hidden');
        if (gameInstance) {
            startGame(
 gameInstance.moves;
    const completionStats = document.querySelector('.completion-stats');
    if                gameInstance.imageSource, // 注意：這裡可能是處理過的 DataURL
                gameInstance.image (completionStats) {
        const existingCheatInfo = document.getElementById('completion-cheat-info'); ifIdentifier,
                gameInstance.size,
                gameInstance.imageDisplayName
            );
        }
 (existingCheatInfo) completionStats.removeChild(existingCheatInfo);
            };
    const backToMenuHandler = () => {
        gameCompleteDiv.classList.add('hidden');
        document.getElementById('gameconst cheatInfo = document.createElement('p'); cheatInfo.id = '-setup').classList.remove('hidden');
        resetGameSettings();
    };
    ifcompletion-cheat-info';
        if (gameInstance.cheatCount >(playAgainBtn){ playAgainBtn.removeEventListener('click', playAgainHandler); playAgainBtn.addEventListener('click', playAgainHandler, {once: true});}
 0) { cheatInfo.innerHTML = `<strong>作弊模式:</strong>    if(backToMenuBtn){ backToMenuBtn.removeEventListener(' <span class="cheat-used">使用了 ${gameInstance.cheatCount} 次</span>`; } else { cheatInfo.innerHTML = `<strong>作弊模式click', backToMenuHandler); backToMenuBtn.addEventListener('click',:</strong> <span class="cheat-not-used">未使用</span>`; } backToMenuHandler, {once: true});}
  }

  
        completionStats.appendChild(cheatInfo);
    }
    gameInstance.saveHighScore();
    const playAgainBtn = document.getElementById('play-again'); const backfunction resetGameSettings() {
    selectedMode = null; selectedSize = null; selectedImage = null; currentImageIdentifier = ''; currentImageDisplayName = '';
    documentToMenuBtn = document.getElementById('back-to-menu');

    .querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    const// 再玩一次
    const playAgainHandler = () => {
        gameCompleteDiv.classList.add('hidden');
        if (gameInstance) {
            //  imgSel = document.getElementById('image-selection'); if(imgSel)重新開始同一關卡，傳遞所有必要信息
            startGame(
 imgSel.classList.add('hidden');
    if (gameInstance) gameInstance.cheat                gameInstance.imageSource, // 使用實例中的 imageSource (可能是Enabled = false;
    const cheatButton = document.getElementById('cheat-button'); if (cheatButton) { cheatButton.classList.remove('active處理過的)
                gameInstance.imageIdentifier,
                gameInstance.size,
                gameInstance.imageDisplayName
            );
        }
    };
    //'); cheatButton.style.backgroundColor = '#e74c3c'; }
    const customPreview = document.querySelector('.image-options .custom-preview'); if(custom 返回主選單
    const backToMenuHandler = () => {
Preview) customPreview.remove();
    const customInput = document.getElementById        gameCompleteDiv.classList.add('hidden');
        document.getElementById('custom-image'); if(customInput) customInput.value='';
    const high('game-setup').classList.remove('hidden');
        resetGameSettings();
    };
    if(playAgainBtn){ playAgainBtn.removeEventListener('click', playAgainScoresList = document.getElementById('high-scores-list'); if (highScoresList) highScoresList.innerHTML = '<div class="no-recordHandler); playAgainBtn.addEventListener('click', playAgainHandler, {once">選擇關卡以查看記錄</div>';
    if (gameInstance) { gameInstance.stopTimer(); gameInstance = null; }
    console.log("遊戲: true});}
    if(backToMenuBtn){ backToMenuBtn.removeEventListener('click', backToMenuHandler); backToMenuBtn設置已重置");
  }

  // loadHighScores: 使用.addEventListener('click', backToMenuHandler, {once: true});} identifier 加載，顯示時依賴 score.levelName
  function loadHighScores(mode, identifier, size) {
      const highScoresList = document.getElementById
  }

  // 重置遊戲設置
  function resetGameSettings('high-scores-list');
      if (!highScoresList) return() {
    selectedMode = null; selectedSize = null; selectedImage = null; currentImageIdentifier = ''; currentImageDisplayName = '';
    document.querySelectorAll('.selected;
      highScoresList.innerHTML = '';
      if (mode === 'number' && size !== undefined && size !== null) {
          identifier = '';
      } else if (mode ===').forEach(el => el.classList.remove('selected'));
    const img 'image' && (!identifier || size === undefined || size === null)) {
          highSel = document.getElementById('image-selection'); if(imgSel) imgSel.classList.add('hidden');
    if (gameInstance) gameInstance.cheatScoresList.innerHTML = '<div class="no-record">參數錯誤無法載入記錄</div>'; return;
      } else if (mode !== 'number' &&Enabled = false;
    const cheatButton = document.getElementById('cheat- mode !== 'image') {
           highScoresList.innerHTML = '<divbutton'); if (cheatButton) { cheatButton.classList.remove('active'); cheatButton. class="no-record">模式錯誤無法載入記錄</div>'; return;
      }

      const scoresstyle.backgroundColor = '#e74c3c'; }
    const = StorageManager.getItem('puzzleHighScores', {});
      const key = `${mode}-${identifier}-${size}`;
      console.log("載入高分榜，Key:", customPreview = document.querySelector('.image-options .custom-preview'); if key);
      const modeScores = Array.isArray(scores[key]) ? scores[key](customPreview) customPreview.remove();
    const customInput = document.getElementById('custom-image : [];

      if (modeScores.length === 0) {
          const noRec = document.createElement('div'); noRec.textContent ='); if(customInput) customInput.value='';
    const highScoresList = document.getElementById('high '此關卡暫無記錄'; noRec.classList.add('no-scores-list'); if (highScoresList) highScoresList.innerHTML-record'); highScoresList.appendChild(noRec);
      } else = '<div class="no-record">選擇關卡以查看記錄</div> {
        const table = document.createElement('table'); table.classList.';
    if (gameInstance) { gameInstance.stopTimer(); gameInstance = null;add('high-scores-table'); const thead = document.createElement(' }
    console.log("遊戲設置已重置");
  }thead'); const headerRow = document.createElement('tr'); const headers = ['關卡', '

  // 載入高分榜
  function loadHighScores(mode, identifier, size) {
      const highScoresList = document.難度', '排名', '時間', '步數', '作弊']; headers.forEach(text => { const th = document.createElement('th'); thgetElementById('high-scores-list');
      if (!highScoresList) return;
      highScoresList.innerHTML = '';
      if (mode === 'number' &&.textContent = text; headerRow.appendChild(th); }); thead.appendChild(headerRow); table size !== undefined && size !== null) {
          identifier = ''; // 數字.appendChild(thead);
        const tbody = document.createElement('tbody');
        modeScores.forEach((score, index) => {
          const模式強制空標識符
      } else if (mode === 'image' && (!identifier row = document.createElement('tr');
          const levelCell = document. || size === undefined || size === null)) {
          highScoresList.innerHTML = '<div class="no-record">參數錯誤無法載入記錄</div>'; return;
createElement('td');
          levelCell.textContent = score.levelName ||      } else if (mode !== 'number' && mode !== 'image') '未知關卡';
          levelCell.title = score.levelName {
           highScoresList.innerHTML = '<div class="no-record">模式錯誤 || '未知關卡';
          row.appendChild(levelCell);
          const diffCell = document.無法載入記錄</div>'; return;
      }

      const scores = StorageManager.getItem('puzzleHighcreateElement('td'); diffCell.textContent = score.difficulty || `${size}x${size}`; row.Scores', {});
      const key = `${mode}-${identifier}-${size}`;
      console.log("appendChild(diffCell);
          const rankCell = document.createElement('td載入高分榜，Key:", key);
      const modeScores = Array.isArray(scores['); rankCell.textContent = `#${index + 1}`; row.appendChild(rankCell);
          key]) ? scores[key] : [];

      if (modeScores.const timeCell = document.createElement('td'); timeCell.textContent = scorelength === 0) {
          const noRec = document.createElement('div'); noRec.textContent = '此關卡暫無記錄'; no.time || 'N/A'; row.appendChild(timeCell);
          const movesCell = document.createElement('td'); movesCell.textContent = score.moves !== undefined ? score.moves : 'N/A'; rowRec.classList.add('no-record'); highScoresList.appendChild(noRec);
      } else {
        const table = document.createElement.appendChild(movesCell);
          const cheatCell = document.createElement('('table'); table.classList.add('high-scores-table'); consttd'); if (score.cheatUsed) { cheatCell.textContent = `${score.cheatCount || 1}次`; cheatCell.classList.add('cheat- thead = document.createElement('thead'); const headerRow = document.createElement('tr');used'); } else { cheatCell.textContent = '無'; cheatCell. const headers = ['關卡', '難度', '排名', '時間', '步數',classList.add('cheat-not-used'); } row.appendChild(cheat '作弊']; headers.forEach(text => { const th = document.Cell);
          tbody.appendChild(row);
        });
        tablecreateElement('th'); th.textContent = text; headerRow.appendChild(th); }); thead.appendChild(headerRow); table.appendChild(thead);
        const.appendChild(tbody); highScoresList.appendChild(table);
      } tbody = document.createElement('tbody');
        modeScores.forEach((score
      const scoreTitle = document.querySelector('.high-scores h3'); if(, index) => {
          const row = document.createElement('tr');scoreTitle) scoreTitle.style.display = 'block';
  }

  // initGameControls: 包含重置計時器修復
  function init
          const levelCell = document.createElement('td');
          levelCell.textContent = score.levelName || '未知關卡'; // 使用存儲的 levelName
          levelCellGameControls() {
      document.getElementById('reset-game').addEventListener('click', () => {
          if (!gameInstance) return;
          console.log("Reset button clicked: Stopping.title = score.levelName || '未知關卡';
          row.appendChild(levelCell); timer explicitly...");
          gameInstance.stopTimer(); // 在 resetGame 之前明確停止

          const diffCell = document.createElement('td'); diffCell.textContent          gameInstance.resetGame();
          renderGameBoard();
          gameInstance = score.difficulty || `${size}x${size}`; row.appendChild(diffCell);
          const.startTimer(); // 重新啟動計時器
          soundManager rankCell = document.createElement('td'); rankCell.textContent = `#${.playGameStartSound();
          if (gameInstance) gameInstance.index + 1}`; row.appendChild(rankCell);
          const timeCell = document.createElement('td'); timeCell.textContent = score.time || 'N/A';cheatEnabled = false;
          const cheatButton = document.getElementById('cheat row.appendChild(timeCell);
          const movesCell = document.createElement-button');
          if (cheatButton) { cheatButton.classList.remove('active'); cheatButton.style.backgroundColor = '#e74c('td'); movesCell.textContent = score.moves !== undefined ? score.3c'; }
          document.querySelectorAll('.puzzle-block.hint, .puzzle-block.cheat-moves : 'N/A'; row.appendChild(movesCell);
          const cheatCell = document.createElement('td'); if (score.cheatUsedselected').forEach(b => b.classList.remove('hint', 'cheat) { cheatCell.textContent = `${score.cheatCount || 1}-selected'));
          firstSelectedBlock = null; // 重置局部作次`; cheatCell.classList.add('cheat-used'); } else {弊狀態
          console.log("遊戲已重置並重新計時 cheatCell.textContent = '無'; cheatCell.classList.add('cheat");
      });

      document.getElementById('new-game').addEventListener('click', () => {
          -not-used'); } row.appendChild(cheatCell);
          tbodyif (gameInstance) gameInstance.stopTimer();
          document.getElementById('game-board').classList.add('hidden');
          document.getElementById.appendChild(row);
        });
        table.appendChild(tbody); highScoresList.appendChild(table);
      }
      const scoreTitle = document.querySelector('.high-scores h3'); if(('game-setup').classList.remove('hidden');
          resetGameSettings();
      });

      const muteButton = document.getElementById('mute-scoreTitle) scoreTitle.style.display = 'block';
  }button');
      if (muteButton) muteButton.addEventListener('click', () => { const

  // 初始化遊戲控制按鈕 (包含重置計時器修復)
  function initGameControls() {
      // 重置遊戲按鈕
      document.getElementById('reset-game'). isMuted = soundManager.toggleMute(); muteButton.classList.toggle('active', isMuted); muteButton.style.backgroundColor = isMuted ? '#e74c3c' : '#3498db'; ifaddEventListener('click', () => {
          if (!gameInstance) return;
          console (!isMuted) soundManager.playGameStartSound(); });

      const hintButton = document.getElementById.log("Reset button clicked: Stopping timer explicitly...");
          gameInstance.stopTimer(); // 在 resetGame 前明確停止
          gameInstance.reset('hint-button');
      if (hintButton) hintButton.addEventListener('click', () => { if (!gameInstance) return; const hintMoveGame();
          renderGameBoard();
          gameInstance.startTimer(); //  = gameInstance.getHint(); if (hintMove) { highlightHintBlock(hintMove.row,重新啟動計時器
          soundManager.playGameStartSound();
          if hintMove.col); soundManager.playMoveSound(); } });

      const showOriginalButton = document.getElementById('show-original-button');
 (gameInstance) gameInstance.cheatEnabled = false;
          const cheatButton = document.getElementById('cheat-button');
          if (cheatButton      if (showOriginalButton) { let showingOriginal = false; showOriginal) { cheatButton.classList.remove('active'); cheatButton.style.Button.addEventListener('click', () => { if(!gameInstance || gameInstance.modebackgroundColor = '#e74c3c'; }
          document.querySelectorAll !== 'image' || !gameInstance.imageSource){ alert("僅圖片模式可用"); return;} showingOriginal = !showingOriginal; showOriginalButton.classList.toggle('active', showingOriginal); const puzzle('.puzzle-block.hint, .puzzle-block.cheat-selected').Container = document.querySelector('.puzzle-container'); if(!puzzleContainer) return; let overlay =forEach(b => b.classList.remove('hint', 'cheat-selected'));
          let firstSelectedBlock = null; // 重置作弊選擇狀態
          console.log document.getElementById('original-image-overlay'); if (showingOriginal) { if("遊戲已重置並重新計時");
      });

      // (!overlay) { overlay = document.createElement('div'); overlay.id = 新遊戲按鈕
      document.getElementById('new-game').addEventListener(' 'original-image-overlay'; Object.assign(overlay.style, { position:'absolute', top:'0', left:'0', width:'10click', () => {
          if (gameInstance) gameInstance.stopTimer();
          document.getElementById('game-board').classList.add('hidden');
          document.getElementById0%', height:'100%', backgroundImage:`url(${gameInstance.image('game-setup').classList.remove('hidden');
          resetGameSettingsSource})`, backgroundSize:'contain', backgroundPosition:'center', backgroundRepeat:'no-repeat', zIndex:'10', opacity:'0.9',();
      });

      // 靜音按鈕
      const mute transition:'opacity 0.3s ease' }); puzzleContainer.style.Button = document.getElementById('mute-button');
      if (muteButtonposition = 'relative'; puzzleContainer.appendChild(overlay); } showOriginalButton.textContent = '隱藏) muteButton.addEventListener('click', () => { const isMuted = soundManager.toggle原圖'; } else { if (overlay) overlay.remove(); showOriginalButton.textContent = '顯示原Mute(); muteButton.classList.toggle('active', isMuted); muteButton.style圖'; } }); }

      const changeColorButton = document.getElementById('change-color-button');
      if (changeColorButton) { function.backgroundColor = isMuted ? '#e74c3c' : updateChangeColorButtonStyle(color) { changeColorButton.classList.remove('color '#3498db'; if (!isMuted) soundManager.-default-btn', 'color-blue-btn', 'color-redplayGameStartSound(); });

      // 提示按鈕
      const hintButton = document.getElementById('hint-button');
      if (hint-btn', 'color-orange-btn'); changeColorButton.classList.add(`color-${color}-btn`); switch(color){ case 'default':Button) hintButton.addEventListener('click', () => { if (!gameInstance changeColorButton.style.backgroundColor = '#555'; changeColorButton.style.backgroundImage = 'repeating-linear-gradient(45deg) return; const hintMove = gameInstance.getHint(); if (hintMove), rgba(255, 255, 255 { highlightHintBlock(hintMove.row, hintMove.col); soundManager.playMoveSound(); } });

      // 顯示原圖按鈕
      const show, 0.1), rgba(255, 255, 255, 0.1) 10px,OriginalButton = document.getElementById('show-original-button');
      if rgba(255, 255, 255, (showOriginalButton) { let showingOriginal = false; showOriginalButton.addEventListener('click', () => { if(!gameInstance || gameInstance.mode 0.2) 10px, rgba(255, !== 'image' || !gameInstance.imageSource){ alert("僅圖片模式可用"); return;} showing 255, 255, 0.2) Original = !showingOriginal; showOriginalButton.classList.toggle('active', showingOriginal); const puzzleContainer = document.querySelector('.puzzle-container'); if(!puzzleContainer) return; let overlay =20px)'; break; case 'blue': changeColorButton.style. document.getElementById('original-image-overlay'); if (showingOriginal) { if (!overlay) {backgroundColor = '#3498db'; changeColorButton.style.backgroundImage overlay = document.createElement('div'); overlay.id = 'original-image = 'none'; break; case 'red': changeColorButton.style.-overlay'; Object.assign(overlay.style, { position:'absolute',backgroundColor = '#e74c3c'; changeColorButton.style.backgroundImage = 'none'; break; case 'orange': changeColorButton.style top:'0', left:'0', width:'100%', height:'.backgroundColor = '#f39c12'; changeColorButton.style100%', backgroundImage:`url(${gameInstance.imageSource})`, backgroundSize:'contain', backgroundPosition:'center', backgroundRepeat:'no-repeat', zIndex:'10.backgroundImage = 'none'; break; } } updateChangeColorButtonStyle(selectedColor); changeColorButton.addEventListener('click', () => { const colors = ['default', 'blue',', opacity:'0.9', transition:'opacity 0.3s ease 'red', 'orange']; const currentIndex = colors.indexOf(selectedColor);' }); puzzleContainer.style.position = 'relative'; puzzleContainer.appendChild(overlay); } showOriginalButton.textContent = '隱藏原圖'; } else { if const nextIndex = (currentIndex + 1) % colors.length; selected (overlay) overlay.remove(); showOriginalButton.textContent = '顯示原Color = colors[nextIndex]; soundManager.playColorChangeSound(); updateChangeColorButtonStyle(selectedColor); document.querySelectorAll('.puzzle-block.empty圖'; } }); }

      // 換色按鈕
      const changeColorButton = document.').forEach(block => { block.classList.remove('color-default',getElementById('change-color-button');
      if (changeColorButton) 'color-blue', 'color-red', 'color-orange'); block { function updateChangeColorButtonStyle(color) { changeColorButton.classList.remove('color.classList.add(`color-${selectedColor}`); }); }); }

      const gameControls = document.querySelector-default-btn', 'color-blue-btn', 'color-red('.game-controls');
      let cheatButton = document.getElementById('cheat-btn', 'color-orange-btn'); changeColorButton.classList.add(`color-${color}-btn`); switch(color){ case 'default': changeColorButton.style.backgroundColor = '#555'; changeColorButton-button');
      if (!cheatButton && gameControls) {
           cheatButton = document.createElement('button'); cheatButton.id = 'cheat-button'; cheatButton.textContent.style.backgroundImage = 'repeating-linear-gradient(45deg = '作弊模式'; gameControls.appendChild(cheatButton);
      }
      let cheatMode, rgba(255, 255, 255 = false;
      let firstSelectedBlock = null;
      if(cheatButton) {
, 0.1), rgba(255, 255           cheatButton.addEventListener('click', () => {
               if (!game, 255, 0.1) 10px,Instance || !gameInstance.startTime) {
                   alert('遊戲尚未開始或計 rgba(255, 255, 255,時器異常');
                   return;
               }
               const currentTime = new Date(); 0.2) 10px, rgba(255,
               const elapsedTimeInSeconds = Math.floor((currentTime - gameInstance. 255, 255, 0.2) 20px)'; break; case 'blue': changeColorButton.style.startTime) / 1000);
               const timeLimit = 5 * 6backgroundColor = '#3498db'; changeColorButton.style.backgroundImage0;
               if (gameInstance.cheatCount === 0 && elapsedTime = 'none'; break; case 'red': changeColorButton.style.InSeconds < timeLimit) {
                  const remMin = Math.floorbackgroundColor = '#e74c3c'; changeColorButton.style.((timeLimit - elapsedTimeInSeconds) / 60);
                  constbackgroundImage = 'none'; break; case 'orange': changeColorButton.style remSec = (timeLimit - elapsedTimeInSeconds) % 60;
                  alert(`作弊模式將在 ${remMin}分${rem.backgroundColor = '#f39c12'; changeColorButton.style.backgroundImage = 'none'; break; } } updateChangeColorButtonStyle(selectedSec}秒 後可用`); return;
               }
               cheatMode = !cheatMode;
               Color); changeColorButton.addEventListener('click', () => { const colors = ['default',cheatButton.classList.toggle('active', cheatMode);
               if( 'blue', 'red', 'orange']; const currentIndex = colors.indexOf(selectedColor);gameInstance) gameInstance.cheatEnabled = cheatMode;
               firstSelected const nextIndex = (currentIndex + 1) % colors.length; selectedColor = colors[nextBlock = null;
               document.querySelectorAll('.puzzle-block.cheat-Index]; soundManager.playColorChangeSound(); updateChangeColorButtonStyle(selectedColor); documentselected').forEach(block => block.classList.remove('cheat-selected'));
               if (cheatMode) { alert('作弊模式已啟用！點擊任意兩個非空方.querySelectorAll('.puzzle-block.empty').forEach(block => { block.classList.remove('color-default', 'color-blue', 'color-塊進行交換。'); soundManager.playCheatSound(); }
               else { alert('作弊模式已關閉。'); }
           });
      }

      const puzzleContainer = document.querySelectorred', 'color-orange'); block.classList.add(`color-${selected('.puzzle-container');
      if (puzzleContainer) {
           puzzleColor}`); }); }); }

      // 作弊按鈕
      const gameContainer.addEventListener('click', (e) => {
               if (!gameControls = document.querySelector('.game-controls');
      let cheatButton = document.getElementById('cheat-button');
      if (!cheatButton && gameControls) {
           cheatButton = document.createElement('buttonInstance) return;
               const block = e.target.closest('.puzzle-block');
               if (!block) return;
               const row = parseInt(block.dataset.row'); cheatButton.id = 'cheat-button'; cheatButton.textContent =);
               const col = parseInt(block.dataset.col);
                '作弊模式'; gameControls.appendChild(cheatButton);
      }
      let cheatMode = false;
      let firstSelectedBlock = null;
      if(cheatif (isNaN(row) || isNaN(col)) return;

               if (cheatMode && gameInstance.cheatEnabled) {
                   if (block.classList.contains('emptyButton) {
           cheatButton.addEventListener('click', () => {
               if (!gameInstance || !gameInstance.startTime) { // 檢查')) { alert('作弊模式不能選擇空白方塊'); return; }
                   if startTime
                   alert('遊戲尚未開始或計時器異常'); return;
               }
               const currentTime (!firstSelectedBlock) {
                       firstSelectedBlock = { row, col = new Date();
               const elapsedTimeInSeconds = Math.floor((currentTime, element: block };
                       block.classList.add('cheat-selected');
                   } else {
                       const swapSuccess = gameInstance.cheatSwap(firstSelectedBlock.row - gameInstance.startTime) / 1000);
               const timeLimit = 5 *, firstSelectedBlock.col, row, col);
                       if (swap 60; // 5 分鐘
               if (gameInstance.cheatCount === 0 && elapsedTimeInSeconds < timeLimit) {
                  const remMin = Math.floor((timeLimit - elapsedTimeInSeconds) / 60);
                  constSuccess) {
                           renderGameBoard();
                           soundManager.playCheatSound();
                           request remSec = (timeLimit - elapsedTimeInSeconds) % 60;AnimationFrame(() => { if (gameInstance.checkWin()) gameComplete(); });
                  alert(`作弊模式將在 ${remMin}分${rem
                       }
                       if(firstSelectedBlock.element) firstSelectedBlock.element.classList.remove('cheat-selected');
                       block.classList.remove('cheat-selected');
                       firstSelectedBlock =Sec}秒 後可用`); return;
               }
               cheatMode = !cheatMode;
                null;
                   }
               } else {
                   const moveSuccess = gameInstance.moveBlock(cheatButton.classList.toggle('active', cheatMode);
               if(gameInstance) gameInstance.cheatEnabled = cheatMode;
               firstSelectedBlock = null;
               documentrow, col);
                   if (moveSuccess) {
                       updateGameStats();
                       soundManager..querySelectorAll('.puzzle-block.cheat-selected').forEach(block => blockplayMoveSound();
                       renderGameBoard();
                       requestAnimationFrame(() => { if (gameInstance.classList.remove('cheat-selected'));
               if (cheatMode) { alert('作弊模式已.checkWin()) gameComplete(); });
                   }
               }
           啟用！點擊任意兩個非空方塊進行交換。'); soundManager.playCheatSound(); }
}, true);
      }
  }

  // highlightHintBlock (保持不變)
  function highlightHintBlock(row, col) {
      document.querySelectorAll('.puzzle-block.hint               else { alert('作弊模式已關閉。'); }
           ').forEach(block => { block.classList.remove('hint'); });
      const puzzle});
      }

      // 點擊事件處理（穩定版）
      const puzzleContainer =Container = document.querySelector('.puzzle-container');
      if (!puzzleContainer document.querySelector('.puzzle-container');
      if (puzzleContainer) {
           puzzleContainer.addEventListener('click', (e) => {
                || !gameInstance) return;
      const currentSize = gameInstance.if (!gameInstance) return;
               const block = e.target.size;
      const index = row * currentSize + col;
      closest('.puzzle-block');
               if (!block) return;
               const blocks = puzzleContainer.querySelectorAll('.puzzle-block');
      if (const row = parseInt(block.dataset.row);
               const col =blocks && blocks[index]) {
          blocks[index].classList.add parseInt(block.dataset.col);
               if (isNaN(row)('hint');
          setTimeout(() => {
              const currentBlocks = puzzle || isNaN(col)) return;

               if (cheatMode && gameInstance.cheatEnabled) { // 作弊模式
                   if (block.classList.contains('emptyContainer.querySelectorAll('.puzzle-block');
              if (currentBlocks && currentBlocks[index]) {
                   currentBlocks[index].classList.remove('hint');
              }
          }, 3000);
      ')) { alert('作弊模式不能選擇空白方塊'); return; }
                   if} else {
          console.warn(`Hint Error: Cannot find block at (!firstSelectedBlock) {
                       firstSelectedBlock = { row, col index ${index} for (${row}, ${col})`);
      }
  }

  // initCustomImageUpload: 包含檔名處理和, element: block };
                       block.classList.add('cheat-selected雙擊
  function initCustomImageUpload() {
    const customInput');
                   } else {
                       const swapSuccess = gameInstance.cheat = document.getElementById('custom-image');
    if (!customInput)Swap(firstSelectedBlock.row, firstSelectedBlock.col, row, return;
    customInput.addEventListener('change', (e) => { col);
                       if (swapSuccess) {
                           renderGameBoard(); // 重繪
                           soundManager.playCheatSound();
                           requestAnimationFrame(() => { if (gameInstance
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];.checkWin()) gameComplete(); });
                       }
                       if(firstSelectedBlock.element) first
        const reader = new FileReader();
        reader.onload = async (eventSelectedBlock.element.classList.remove('cheat-selected');
                       block) => {
            selectedImage = event.target.result;
            currentImageIdentifier = sanitizeFilename.classList.remove('cheat-selected');
                       firstSelectedBlock = null;
                   }
               ForKey(file.name);
            currentImageDisplayName = file.name;
            console.log} else { // 正常移動模式
                   const moveSuccess = gameInstance.moveBlock(row, col);
                   if (moveSuccess) {
                       updateGameStats();
                       soundManager.playMoveSound();
                       renderGameBoard(); // 重繪
                       requestAnimationFrame(() =>(`自定義圖片選擇: Name='${currentImageDisplayName}', ID='${currentImageIdentifier}'`);
            document.querySelectorAll('.image-options img.selected').forEach(img => img.classList.remove('selected { if (gameInstance.checkWin()) gameComplete(); });
                   }'));
            const imageOptions = document.querySelector('.image-options');

               }
           }, true);
      }
  }

  // 高            if (imageOptions) {
                 const existingPreview = imageOptions.亮提示方塊
  function highlightHintBlock(row, col) {
      document.querySelectorAll('.puzzle-block.hint').forEach(block => { block.classList.remove('hintquerySelector('.image-options .custom-preview');
                 if (existingPreview) existingPreview.remove();
                 const preview = document.createElement('img');
                 preview.src = selectedImage;
                 preview.alt = '自'); });
      const puzzleContainer = document.querySelector('.puzzle-container');
      if (!puzzleContainer || !gameInstance) return;
      const currentSize = gameInstance.size;
      const index = row * currentSize + col;
      定義預覽';
                 preview.title = currentImageDisplayName;
                 preview.classList.add('selected', 'custom-preview');
                 preview.style.width = '100px'; preview.style.heightconst blocks = puzzleContainer.querySelectorAll('.puzzle-block');
      if ( = '100px'; preview.style.objectFit = 'coverblocks && blocks[index]) {
          blocks[index].classList.add';
                 imageOptions.appendChild(preview);
                 preview.addEventListener('dblclick', () => {
                     console.log('雙擊自定義預覽');
                     selectedMode('hint');
          setTimeout(() => {
              const currentBlocks = puzzleContainer.querySelectorAll('.puzzle-block');
              if (currentBlocks && current = 'image';
                     highlightSelectedButton('image-mode');
                     document.getElementById('image-selection').classList.remove('hidden');
                     const gameSize = getGameSize();
                     startGameBlocks[index]) {
                   currentBlocks[index].classList.remove('(selectedImage, currentImageIdentifier, gameSize, currentImageDisplayName);
hint');
              }
          }, 3000);
                       });
            }
             if (selectedMode !== 'image') {} else {
          console.warn(`Hint Error: Cannot find block at
                  selectedMode = 'image';
                  const imgBtn=document. index ${index} for (${row}, ${col})`);
      }
  }

  // 初始化自定義圖片上傳（包含雙擊和檔名處理getElementById('image-mode'); if(imgBtn) imgBtn.classList.add('selected');
                  const numBtn=document.getElementById('number-）
  function initCustomImageUpload() {
    const customInput = document.getElementById('custom-image');
    if (!customInput) return;
    customInput.addEventListenermode'); if(numBtn) numBtn.classList.remove('selected');('change', (e) => {
      if (e.target.
                  const imgSelDiv=document.getElementById('image-selection'); if(imgSelDiv) imgSelDiv.classList.remove('hidden');
files && e.target.files[0]) {
        const file =             }
        };
        reader.onerror = () => { alert("讀取自定義 e.target.files[0];
        const reader = new FileReader();
        reader.圖片失敗"); };
        reader.readAsDataURL(file);
onload = async (event) => {
            selectedImage = event.target      }
    });
  }

  // initColorSelection (保持不變)
  function initColorSelection() { selectedColor = 'default'; }

  // initWeb.result;
            currentImageIdentifier = sanitizeFilenameForKey(file.nameImageSearch: 包含檔名處理和雙擊
  function initWeb);
            currentImageDisplayName = file.name;
            console.logImageSearch() {
    const webSearchBtn = document.getElementById('web(`自定義圖片選擇: Name='${currentImageDisplayName}', ID='${currentImageIdentifier}'`);-image-search-btn');
    if (!webSearchBtn) return
            document.querySelectorAll('.image-options img.selected').forEach(img;
    webSearchBtn.addEventListener('click', () => WebImageSearch => img.classList.remove('selected'));
            const imageOptions = document.querySelector('.image-.showModal());
    WebImageSearch.init((imageUrl, imageName)options');
            if (imageOptions) {
                 const existingPreview = imageOptions.querySelector('.image-options .custom-preview');
                 if (existingPreview) existingPreview => {
      document.querySelectorAll('.image-options img.selected').forEach(img => img.classList.remove('selected'));
      const customInput = document.getElementById('.remove();
                 const preview = document.createElement('img');
                 custom-image'); if (customInput) customInput.value = '';
      const existingpreview.src = selectedImage;
                 preview.alt = '自定義預覽';
                 preview.Preview = document.querySelector('.image-options .custom-preview'); if (existingPreview) existingPreviewtitle = currentImageDisplayName;
                 preview.classList.add('selected',.remove();
      selectedImage = imageUrl;
      currentImageIdentifier = ' 'custom-preview');
                 preview.style.width = '10net_' + sanitizeFilenameForKey(imageName);
      currentImageDisplayName = imageName;
      console.log(`網路圖片選擇: Name='${currentImageDisplayName}', ID='${currentImageIdentifier}'`);
      const imageOptions0px'; preview.style.height = '100px'; preview = document.querySelector('.image-options');
      if (imageOptions).style.objectFit = 'cover';
                 imageOptions.appendChild(preview);
                 // 添加雙擊預覽圖開始遊戲
                 preview.addEventListener('dblclick', () => {
                     console.log('雙擊自定義預覽');
                     selectedMode = 'image';
                     highlight {
        const preview = document.createElement('img');
        preview.src = selectedImage;
        preview.alt = '網路圖片預覽';
        preview.SelectedButton('image-mode');
                     document.getElementById('image-selectiontitle = currentImageDisplayName;
        preview.classList.add('selected', 'custom-preview');
        preview.style.width = '10').classList.remove('hidden');
                     const gameSize = getGameSize();
                     startGame(selectedImage, currentImageIdentifier, gameSize, currentImageDisplayName);
0px'; preview.style.height = '100px'; preview                 });
            }
             if (selectedMode !== 'image') {
                  selectedMode = 'image.style.objectFit = 'cover';
        imageOptions.appendChild(preview);
         preview.addEventListener('dblclick', () => {
             ';
                  const imgBtn=document.getElementById('image-mode'); if(imgBtn) imgBtn.classList.add('selected');
                  constconsole.log('雙擊網路圖片預覽');
             selectedMode = 'image';
             highlight numBtn=document.getElementById('number-mode'); if(numBtn) numBtn.classList.remove('selected');
                  const imgSelDiv=SelectedButton('image-mode');
             document.getElementById('image-selection').classList.remove('hidden');
             const gameSize = getGameSizedocument.getElementById('image-selection'); if(imgSelDiv) imgSel();
             startGame(selectedImage, currentImageIdentifier, gameSize, currentImageDisplayName);
         });
      }
       if (selectedMode !== 'image') {
            selectedMode = 'image';
            const imgBtn=document.getElementById('Div.classList.remove('hidden');
             }
        };
        reader.onerror = ()image-mode'); if(imgBtn) imgBtn.classList.add(' => { alert("讀取自定義圖片失敗"); };
        reader.readAsDataURL(file);
      }
    });
  }

  // 初始化顏色選擇
  function initColorSelection() { selectedColor = 'default'; }selected');
            const numBtn=document.getElementById('number-mode'); if(numBtn) numBtn.classList.remove('selected');
            

  // 初始化網路搜圖（包含雙擊和檔名處理）
  function initWebImageSearch() {
    const webSearchBtn = document.getElementById('web-image-search-btn');
    if (!const imgSelDiv=document.getElementById('image-selection'); if(imgwebSearchBtn) return;
    webSearchBtn.addEventListener('click', () => WebImageSearch.showModal());
    WebImageSearch.initSelDiv) imgSelDiv.classList.remove('hidden');
       }
    });
  }

((imageUrl, imageName) => {
      document.querySelectorAll('.image-options img.  // initUI (保持不變)
  function initUI() {
    initModeSelection();
    initImageSelection();
    initSizeSelection();
    initColorSelection();
    initStartGameButton();
    initGameControls();
    initCustomselected').forEach(img => img.classList.remove('selected'));
      const customInput = document.getElementById('custom-image'); if (customInput) customInput.value =ImageUpload();
    initWebImageSearch();
    document.querySelectorAll('.mode-options button, .size-options button, .color-options button').forEach(button => { button.classList.add('option-button'); });
    console.log("UI 初始化完成 (添加雙擊, 修復重置計時, 區 '';
      const existingPreview = document.querySelector('.image-options .custom-preview'); if (existingPreview) existingPreview.remove();
      selectedImage = imageUrl;
      currentImageIdentifier = 'net_' + sanitizeFilenameForKey(imageName);
      currentImageDisplayName = imageName;
      console.log(`網路圖片選擇: Name='${currentImageDisplayName}', ID='${currentImageIdentifier}'`);
      const imageOptions = document.querySelector('.image-options');分自定義記錄)");
  }

  initUI();

});