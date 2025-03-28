// imageUtils.js (修正版 - 移除批量預處理)

/**
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

    // 確保 size 是有效數字
    const gridSize = (typeof size === 'number' && size >= 3) ? size : 4;
    console.log(`preprocessImage: 開始處理圖片 '${imageSource.substring(0, 50)}...', 預期尺寸: ${gridSize}x${gridSize}`);

    const img = new Image();
    // 設置 crossOrigin 處理 CORS (僅對 http/https)
    if (imageSource.startsWith('http')) {
      img.crossOrigin = 'Anonymous';
    }

    let timeoutId = null;

    const cleanup = () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };

    // 設置載入超時 (縮短為 8 秒)
    timeoutId = setTimeout(() => {
      console.error(`preprocessImage: 圖片 '${imageSource.substring(0, 50)}...' 載入超時 (8秒)`);
      cleanup();
      reject(new Error('圖片載入超時'));
    }, 8000); // 8 seconds timeout

    img.onload = function() {
      cleanup();
      console.log('preprocessImage: 圖片載入成功，原始尺寸:', img.width, 'x', img.height);

      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          console.error('preprocessImage: 無法獲取畫布上下文');
          reject(new Error('無法獲取畫布上下文'));
          return;
        }

        // --- 畫布尺寸與繪圖邏輯 ---
        // 目標：創建一個正方形畫布，讓圖片居中繪製，盡可能保留圖片內容
        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

        // 確定繪製區域（裁切成正方形）
        if (img.width > img.height) { // 寬圖片
            sourceX = (img.width - img.height) / 2;
            sourceWidth = img.height;
        } else if (img.height > img.width) { // 高圖片
            sourceY = (img.height - img.width) / 2;
            sourceHeight = img.width;
        }
         // 如果已經是正方形，sourceX/Y=0, sourceWidth/Height=img.width/height

        // 設置畫布尺寸，建議是目標尺寸的倍數，例如 512x512 或更大，以保證質量
        // 但也要考慮性能，不宜過大
        const canvasSize = Math.min(1024, Math.max(512, sourceWidth, sourceHeight)); // 限制在 512-1024 之間
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        console.log(`preprocessImage: 畫布尺寸: ${canvasSize}x${canvasSize}, 來源裁切區域: x=${sourceX.toFixed(0)}, y=${sourceY.toFixed(0)}, w=${sourceWidth.toFixed(0)}, h=${sourceHeight.toFixed(0)}`);

        // 可選：填充背景色（若圖片有透明部分）
        // ctx.fillStyle = '#FFFFFF';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 將圖片的裁切區域繪製到整個畫布上
        ctx.drawImage(
          img,
          sourceX, sourceY,           // Source rectangle (cropped square)
          sourceWidth, sourceHeight,
          0, 0,                     // Destination rectangle (entire canvas)
          canvas.width, canvas.height
        );

        // 返回處理後的圖片DataURL，降低質量以減小體積
        try {
          // 使用 image/jpeg 並降低質量 (例如 0.8)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // <--- 降低質量
          console.log(`preprocessImage: 圖片處理成功，DataURL 長度: ${dataUrl.length}`);
          resolve(dataUrl);
        } catch (error) {
          // SecurityError 可能發生在 file:// 協議上，但預處理 file:// 通常意義不大
          if (error.name === 'SecurityError') {
            console.warn('preprocessImage: toDataURL 發生 SecurityError (可能是本地文件)，嘗試返回原始來源');
            resolve(imageSource); // Fallback to original source for local files
          } else {
            console.error('preprocessImage: toDataURL 失敗', error);
            reject(error);
          }
        }
      } catch (error) {
        console.error('preprocessImage: 處理圖片時發生錯誤 (canvas)', error);
        reject(error);
      }
    };

    img.onerror = function(errorEvent) {
      cleanup();
      console.error(`preprocessImage: 圖片 '${imageSource.substring(0, 50)}...' 載入失敗`, errorEvent);
      reject(new Error('圖片載入失敗'));
    };

    // 設置 src 開始加載
    try {
        console.log(`preprocessImage: 設置 img.src = ${imageSource.substring(0, 100)}...`);
        img.src = imageSource;
    } catch (error) {
      cleanup();
      console.error('preprocessImage: 設置圖片源時發生錯誤', error);
      reject(error);
    }
  });
}

// 移除 preprocessPresetImages 函數
// async function preprocessPresetImages(presetImages) { ... } // REMOVED