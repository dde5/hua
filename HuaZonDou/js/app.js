// 游戏状态
const gameState = {
    mode: 'number', // 'number' 或 'picture'
    size: 5, // 默认5x5
    selectedImage: null, // 选中的图片
    customImage: null, // 用户上传的图片
    board: [], // 游戏板数据
    emptyTile: { row: 0, col: 0 }, // 空白方块位置
    moves: 0, // 移动次数
    startTime: null, // 游戏开始时间
    timer: null, // 计时器
    elapsedTime: 0, // 已过时间（秒）
    isGameComplete: false, // 游戏是否完成
};

// DOM元素
const elements = {
    mainMenu: document.getElementById('main-menu'),
    gameScreen: document.getElementById('game-screen'),
    gameComplete: document.getElementById('game-complete'),
    gameBoard: document.getElementById('game-board'),
    numberMode: document.getElementById('number-mode'),
    pictureMode: document.getElementById('picture-mode'),
    pictureSelection: document.getElementById('picture-selection'),
    imageOptions: null, // 将在后面初始化
    customImageUpload: document.getElementById('custom-image-upload'),
    sizeButtons: document.querySelectorAll('.size-btn[data-size]'),
    customSizeInput: document.getElementById('custom-size-input'),
    customSizeBtn: document.getElementById('custom-size-btn'),
    startGame: document.getElementById('start-game'),
    resetGame: document.getElementById('reset-game'),
    newGame: document.getElementById('new-game'),
    hint: document.getElementById('hint'),
    timer: document.getElementById('timer'),
    movesCount: document.getElementById('moves-count'),
    completionTime: document.getElementById('completion-time'),
    completionMoves: document.getElementById('completion-moves'),
    recordMessage: document.getElementById('record-message'),
    playAgain: document.getElementById('play-again'),
    backToMenu: document.getElementById('back-to-menu'),
    highScoresList: document.getElementById('high-scores-list'),
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化图片选项
    elements.imageOptions = document.querySelectorAll('.image-option');
    
    // 创建测试图片（因为没有真实图片文件）
    createDummyImages();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 加载高分记录
    loadHighScores();
    
    // 更新高分显示
    updateHighScoresDisplay();
});

// 创建测试图片（因为没有真实的图片文件）
function createDummyImages() {
    // 定义一些简单的颜色来表示不同的图片
    const colors = {
        mickey: '#ff9900',
        donald: '#3399ff',
        pooh: '#ffcc00',
        elsa: '#99ccff',
        simba: '#cc9966'
    };
    
    // 为每个预设图片创建一个假的图片对象
    Object.keys(colors).forEach(name => {
        // 在window对象上存储这些图片对象以便在游戏中使用
        window[`${name}Element`] = {
            isCanvas: true,
            color: colors[name]
        };
        
        // 替换图片元素的src
        const imgElement = document.querySelector(`.image-option[data-image="${name}"] img`);
        if (imgElement) {
            // 创建一个彩色的canvas
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');
            
            // 填充背景色
            ctx.fillStyle = colors[name];
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 添加文字
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(name, canvas.width / 2, canvas.height / 2);
            
            // 更新图片src
            imgElement.src = canvas.toDataURL();
        }
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 模式选择
    elements.numberMode.addEventListener('click', () => {
        selectMode('number');
    });
    
    elements.pictureMode.addEventListener('click', () => {
        selectMode('picture');
    });
    
    // 图片选择
    elements.imageOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectImage(option);
        });
    });
    
    // 自定义图片上传
    elements.customImageUpload.addEventListener('change', handleCustomImageUpload);
    
    // 尺寸选择
    elements.sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectSize(parseInt(button.dataset.size));
        });
    });
    
    // 自定义尺寸
    elements.customSizeBtn.addEventListener('click', () => {
        const size = parseInt(elements.customSizeInput.value);
        if (size >= 3 && size <= 10) {
            selectSize(size);
        } else {
            alert('请输入3到10之间的尺寸');
        }
    });
    
    // 开始游戏
    elements.startGame.addEventListener('click', startNewGame);
    
    // 重置游戏
    elements.resetGame.addEventListener('click', resetGame);
    
    // 新游戏
    elements.newGame.addEventListener('click', backToMainMenu);
    
    // 提示
    elements.hint.addEventListener('click', showHint);
    
    // 再玩一次
    elements.playAgain.addEventListener('click', () => {
        hideElement(elements.gameComplete);
        resetGame();
    });
    
    // 返回主菜单
    elements.backToMenu.addEventListener('click', backToMainMenu);
}

// 选择游戏模式
function selectMode(mode) {
    gameState.mode = mode;
    
    // 更新UI
    if (mode === 'number') {
        elements.numberMode.classList.add('selected');
        elements.pictureMode.classList.remove('selected');
        hideElement(elements.pictureSelection);
    } else {
        elements.pictureMode.classList.add('selected');
        elements.numberMode.classList.remove('selected');
        showElement(elements.pictureSelection);
    }
}

// 选择图片
function selectImage(option) {
    // 移除之前的选择
    elements.imageOptions.forEach(opt => opt.classList.remove('selected'));
    
    // 添加新选择
    option.classList.add('selected');
    
    // 更新游戏状态
    gameState.selectedImage = option.dataset.image;
    gameState.customImage = null;
}

// 处理自定义图片上传
function handleCustomImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            gameState.customImage = e.target.result;
            gameState.selectedImage = null;
            
            // 移除之前的选择
            elements.imageOptions.forEach(opt => opt.classList.remove('selected'));
        };
        reader.readAsDataURL(file);
    } else {
        alert('请选择一个有效的图片文件');
    }
}

// 选择游戏尺寸
function selectSize(size) {
    gameState.size = size;
    
    // 更新UI
    elements.sizeButtons.forEach(button => {
        if (parseInt(button.dataset.size) === size) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}

// 开始新游戏
function startNewGame() {
    // 验证游戏设置
    if (gameState.mode === 'picture' && !gameState.selectedImage && !gameState.customImage) {
        alert('请选择一张图片或上传自定义图片');
        return;
    }
    
    // 初始化游戏板
    initializeBoard();
    
    // 打乱游戏板（确保可解）
    shuffleBoard();
    
    // 更新UI
    updateBoardDisplay();
    
    // 重置游戏状态
    gameState.moves = 0;
    gameState.elapsedTime = 0;
    gameState.isGameComplete = false;
    
    // 更新计数器显示
    elements.movesCount.textContent = '0';
    elements.timer.textContent = '00:00';
    
    // 开始计时
    startTimer();
    
    // 切换显示
    hideElement(elements.mainMenu);
    showElement(elements.gameScreen);
}

// 初始化游戏板
function initializeBoard() {
    const size = gameState.size;
    gameState.board = [];
    
    // 创建有序的游戏板
    for (let row = 0; row < size; row++) {
        const rowData = [];
        for (let col = 0; col < size; col++) {
            const index = row * size + col + 1;
            if (index < size * size) {
                rowData.push(index);
            } else {
                rowData.push(0); // 空白方块用0表示
                gameState.emptyTile = { row, col };
            }
        }
        gameState.board.push(rowData);
    }
}

// 打乱游戏板（确保可解）
function shuffleBoard() {
    const size = gameState.size;
    const totalShuffles = size * size * 20; // 随机移动的次数
    
    // 执行随机移动
    for (let i = 0; i < totalShuffles; i++) {
        const { row, col } = gameState.emptyTile;
        const possibleMoves = [];
        
        // 收集可能的移动
        if (row > 0) possibleMoves.push({ row: row - 1, col }); // 上
        if (row < size - 1) possibleMoves.push({ row: row + 1, col }); // 下
        if (col > 0) possibleMoves.push({ row, col: col - 1 }); // 左
        if (col < size - 1) possibleMoves.push({ row, col: col + 1 }); // 右
        
        // 随机选择一个移动
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        
        // 执行移动
        swapTiles(randomMove.row, randomMove.col);
    }
    
    // 重置移动次数（因为这只是初始化）
    gameState.moves = 0;
}

// 交换方块
function swapTiles(row, col) {
    const { row: emptyRow, col: emptyCol } = gameState.emptyTile;
    
    // 只有相邻方块才能交换
    const isAdjacent = (
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
    
    if (!isAdjacent) return false;
    
    // 交换方块
    const temp = gameState.board[row][col];
    gameState.board[row][col] = 0;
    gameState.board[emptyRow][emptyCol] = temp;
    
    // 更新空白方块位置
    gameState.emptyTile = { row, col };
    
    return true;
}

// 更新游戏板显示
function updateBoardDisplay() {
    const size = gameState.size;
    const board = elements.gameBoard;
    
    // 清空游戏板
    board.innerHTML = '';
    
    // 设置网格大小
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    // 创建方块
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const value = gameState.board[row][col];
            const tile = document.createElement('div');
            tile.classList.add('tile');
            
            if (value === 0) {
                tile.classList.add('empty');
            } else {
                // 添加点击事件
                tile.addEventListener('click', () => {
                    handleTileClick(row, col);
                });
                
                // 设置方块内容
                if (gameState.mode === 'number') {
                    tile.textContent = value;
                } else if (gameState.mode === 'picture') {
                    // 计算图片位置（原始位置）
                    const originalRow = Math.floor((value - 1) / size);
                    const originalCol = (value - 1) % size;
                    
                    // 设置背景图片
                    if (gameState.customImage) {
                        // 使用背景图片和背景位置
                        tile.style.backgroundImage = `url(${gameState.customImage})`;
                        tile.style.backgroundSize = `${size * 100}%`;
                        tile.style.backgroundPosition = `-${originalCol * 100}% -${originalRow * 100}%`;
                    } else if (gameState.selectedImage) {
                        const selectedImage = window[`${gameState.selectedImage}Element`];
                        
                        if (selectedImage && selectedImage.isCanvas) {
                            // 使用颜色创建一个简单的渐变效果代替图片
                            const gradient = `linear-gradient(135deg, ${selectedImage.color}, white)`;
                            tile.style.backgroundImage = gradient;
                            tile.style.color = 'black';
                            tile.textContent = value; // 仍然显示数字，以便于区分
                        } else {
                            // 使用背景图片和背景位置
                            tile.style.backgroundImage = `url(images/${gameState.selectedImage}.jpg)`;
                            tile.style.backgroundSize = `${size * 100}%`;
                            tile.style.backgroundPosition = `-${originalCol * 100}% -${originalRow * 100}%`;
                        }
                    }
                }
            }
            
            board.appendChild(tile);
        }
    }
}

// 处理方块点击
function handleTileClick(row, col) {
    // 如果游戏已完成，则忽略点击
    if (gameState.isGameComplete) return;
    
    // 尝试移动方块
    if (swapTiles(row, col)) {
        // 增加移动次数
        gameState.moves++;
        elements.movesCount.textContent = gameState.moves;
        
        // 更新游戏板显示
        updateBoardDisplay();
        
        // 检查游戏是否完成
        if (isGameComplete()) {
            handleGameComplete();
        }
    }
}

// 检查游戏是否完成
function isGameComplete() {
    const size = gameState.size;
    
    // 检查最后一个位置是否为空白方块
    if (gameState.emptyTile.row !== size - 1 || gameState.emptyTile.col !== size - 1) {
        return false;
    }
    
    // 检查其他方块是否按顺序排列
    let expectedValue = 1;
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            // 跳过最后一个位置
            if (row === size - 1 && col === size - 1) {
                continue;
            }
            
            if (gameState.board[row][col] !== expectedValue) {
                return false;
            }
            
            expectedValue++;
        }
    }
    
    return true;
}

// 处理游戏完成
function handleGameComplete() {
    // 停止计时器
    clearInterval(gameState.timer);
    gameState.timer = null;
    
    // 设置游戏状态
    gameState.isGameComplete = true;
    
    // 更新完成界面
    elements.completionTime.textContent = formatTime(gameState.elapsedTime);
    elements.completionMoves.textContent = gameState.moves;
    
    // 保存高分
    const isNewRecord = saveHighScore();
    
    // 显示新纪录信息
    if (isNewRecord) {
        showElement(elements.recordMessage);
    } else {
        hideElement(elements.recordMessage);
    }
    
    // 更新高分显示
    updateHighScoresDisplay();
    
    // 显示完成界面
    hideElement(elements.gameScreen);
    showElement(elements.gameComplete);
}

// 保存高分
function saveHighScore() {
    const key = `huarongdao_${gameState.mode}_${gameState.size}x${gameState.size}`;
    let highScores = JSON.parse(localStorage.getItem(key)) || { time: Infinity, moves: Infinity };
    let isNewRecord = false;
    
    // 检查是否是新纪录
    if (gameState.elapsedTime < highScores.time) {
        highScores.time = gameState.elapsedTime;
        isNewRecord = true;
    }
    
    if (gameState.moves < highScores.moves) {
        highScores.moves = gameState.moves;
        isNewRecord = true;
    }
    
    // 保存新纪录
    if (isNewRecord) {
        localStorage.setItem(key, JSON.stringify(highScores));
    }
    
    return isNewRecord;
}

// 加载所有高分记录
function loadHighScores() {
    window.highScores = {};
    
    // 遍历本地存储中的所有记录
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('huarongdao_')) {
            try {
                const value = JSON.parse(localStorage.getItem(key));
                window.highScores[key] = value;
            } catch (e) {
                console.error('Error loading high score:', e);
            }
        }
    }
}

// 更新高分显示
function updateHighScoresDisplay() {
    const highScoresList = elements.highScoresList;
    highScoresList.innerHTML = '';
    
    loadHighScores();
    const scores = window.highScores;
    
    if (Object.keys(scores).length === 0) {
        highScoresList.innerHTML = '<p>暂无记录</p>';
        return;
    }
    
    // 创建高分列表
    for (const key in scores) {
        if (scores.hasOwnProperty(key)) {
            const match = key.match(/huarongdao_(\w+)_(\d+)x\d+/);
            if (match) {
                const mode = match[1] === 'number' ? '数字模式' : '图片模式';
                const size = match[2];
                const { time, moves } = scores[key];
                
                // 只显示有效记录
                if (time !== Infinity && moves !== Infinity) {
                    const scoreItem = document.createElement('div');
                    scoreItem.classList.add('score-item');
                    scoreItem.innerHTML = `
                        <strong>${mode} ${size}×${size}</strong>
                        <div>最短时间: ${formatTime(time)}</div>
                        <div>最少步数: ${moves}</div>
                    `;
                    highScoresList.appendChild(scoreItem);
                }
            }
        }
    }
}

// 开始计时器
function startTimer() {
    gameState.startTime = Date.now();
    gameState.elapsedTime = 0;
    
    // 清除旧的计时器
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    // 更新计时器显示
    elements.timer.textContent = '00:00';
    
    // 设置新的计时器
    gameState.timer = setInterval(() => {
        gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        elements.timer.textContent = formatTime(gameState.elapsedTime);
    }, 1000);
}

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 重置游戏
function resetGame() {
    // 停止计时器
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // 重置游戏状态
    gameState.moves = 0;
    gameState.elapsedTime = 0;
    gameState.isGameComplete = false;
    
    // 重新初始化并打乱游戏板
    initializeBoard();
    shuffleBoard();
    
    // 更新游戏板显示
    updateBoardDisplay();
    
    // 更新计数器显示
    elements.movesCount.textContent = '0';
    elements.timer.textContent = '00:00';
    
    // 重新开始计时
    startTimer();
}

// 返回主菜单
function backToMainMenu() {
    // 停止计时器
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // 隐藏游戏界面和完成界面
    hideElement(elements.gameScreen);
    hideElement(elements.gameComplete);
    
    // 显示主菜单
    showElement(elements.mainMenu);
}

// 显示提示
function showHint() {
    // TODO: 实现提示功能（可选）
    alert('提示功能正在开发中...');
}

// 辅助函数：显示元素
function showElement(element) {
    element.classList.remove('hidden');
}

// 辅助函数：隐藏元素
function hideElement(element) {
    element.classList.add('hidden');
} 