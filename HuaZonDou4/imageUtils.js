// imageUtils.js (修正版 - 移除批量預處理)

// imageUtils.js (修正版 - 移除批量預處理，preprocessImage 未被調用)

/**
 * (此函數目前未被 ui.js 調用)
 * 預處理圖片，確保圖片是正方形且尺寸適合切割
 * @param {string} imageSource - 圖片源（URL或DataURL）
 * @param {number} size - 遊戲尺寸（幾乘幾的網格）
 * @returns {Promise<string>} - 處理後的圖片DataURL
 */
function preprocessImage(imageSource, size) {
  return new Promise((resolve, reject) => {
    if (!imageSource) {
      console.error('preprocessImage: 圖片源為空');
      reject(new Error('圖片源為空'));
      return;
    }
    const gridSize = (typeof size === 'number' && size >= 3) ? size : 4;
    console.log(`preprocessImage: 開始處理圖片 '${imageSource.substring(0, 50)}...', 預期尺寸: ${gridSize}x${gridSize}`);
    const img = new Image();
    if (imageSource.startsWith('http')) img.crossOrigin = 'Anonymous';
    let timeoutId = null;
    const cleanup = () => { clearTimeout(timeoutId); img.onload = null; img.onerror = null; };
    timeoutId = setTimeout(() => { console.error(`preprocessImage: 圖片 '${imageSource.substring(0, 50)}...' 載入超時 (8秒)`); cleanup(); reject(new Error('圖片載入超時')); }, 8000);
    img.onload = function() {
      cleanup(); console.log('preprocessImage: 圖片載入成功，原始尺寸:', img.width, 'x', img.height);
      try {
        const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
        if (!ctx) { console.error('preprocessImage: 無法獲取畫布上下文'); reject(new Error('無法獲取畫布上下文')); return; }
        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
        if (img.width > img.height) { sourceX = (img.width - img.height) / 2; sourceWidth = img.height; }
        else if (img.height > img.width) { sourceY = (img.height - img.width) / 2; sourceHeight = img.width; }
        const canvasSize = Math.min(1024, Math.max(512, sourceWidth, sourceHeight));
        canvas.width = canvasSize; canvas.height = canvasSize;
        console.log(`preprocessImage: 畫布尺寸: ${canvasSize}x${canvasSize}, 來源裁切區域: x=${sourceX.toFixed(0)}, y=${sourceY.toFixed(0)}, w=${sourceWidth.toFixed(0)}, h=${sourceHeight.toFixed(0)}`);
        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8); console.log(`preprocessImage: 圖片處理成功，DataURL 長度: ${dataUrl.length}`); resolve(dataUrl);
        } catch (error) {
          if (error.name === 'SecurityError') { console.warn('preprocessImage: toDataURL 發生 SecurityError，返回原始來源'); resolve(imageSource); }
          else { console.error('preprocessImage: toDataURL 失敗', error); reject(error); }
        }
      } catch (error) { console.error('preprocessImage: 處理圖片時發生錯誤 (canvas)', error); reject(error); }
    };
    img.onerror = function(errorEvent) { cleanup(); console.error(`preprocessImage: 圖片 '${imageSource.substring(0, 50)}...' 載入失敗`, errorEvent); reject(new Error('圖片載入失敗')); };
    try { console.log(`preprocessImage: 設置 img.src = ${imageSource.substring(0, 100)}...`); img.src = imageSource; }
    catch (error) { cleanup(); console.error('preprocessImage: 設置圖片源時發生錯誤', error); reject(error); }
  });
}

// preprocessPresetImages 函數已移除

// 移除 preprocessPresetImages 函數
// async function preprocessPresetImages(presetImages) { ... } // REMOVED