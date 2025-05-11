// imageUtils.js

/**
 * 預處理圖片，確保圖片是正方形且尺寸適合切割
 * @param {string} imageSource - 圖片源（URL或DataURL）
 * @param {number} size - 遊戲尺寸（幾乘幾的網格） - 這個 size 參數在這裡可能不再直接用於 preprocess，
 *                       因為切割會在下一步進行。但保留它可以幫助確定一個合理的初始畫布大小。
 * @returns {Promise<string>} - 處理後的圖片DataURL (正方形)
 */
function preprocessImage(imageSource, gridSize) { // Renamed size to gridSize for clarity
  return new Promise((resolve, reject) => {
    if (!imageSource) {
      console.error('preprocessImage: 圖片源為空');
      reject(new Error('圖片源為空'));
      return;
    }
    
    console.log('preprocessImage: 開始處理圖片，目標網格尺寸:', gridSize);
    
    const img = new Image();
    if (imageSource.startsWith('http')) {
      img.crossOrigin = 'Anonymous';
    }
    
    const timeoutId = setTimeout(() => {
      console.error('preprocessImage: 圖片載入超時');
      reject(new Error('圖片載入超時'));
    }, 10000); 
    
    img.onload = function() {
      clearTimeout(timeoutId);
      console.log('preprocessImage: 圖片載入成功，原始尺寸:', img.width, 'x', img.height);
      
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('preprocessImage: 無法獲取畫布上下文');
          reject(new Error('無法獲取畫布上下文'));
          return;
        }
        
        // 創建一個正方形畫布，尺寸取決於圖片較大的一邊，以減少質量損失
        // 最終切割的尺寸將基於這個正方形圖片
        const canvasDimension = Math.max(img.width, img.height);
        // 為了切割時像素對齊，最好讓這個尺寸是 gridSize 的倍數，或者至少足夠大
        // 例如，至少是 gridSize * 100px (每塊100px)
        const targetCanvasSize = Math.max(canvasDimension, gridSize * 100); 
        canvas.width = targetCanvasSize;
        canvas.height = targetCanvasSize;
        
        ctx.fillStyle = '#FFFFFF'; // 白色背景防止透明圖片問題
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 居中繪製原始圖片到這個正方形畫布上
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92); // 使用JPEG和稍高品質
          console.log('preprocessImage: 圖片預處理為正方形DataURL成功');
          resolve(dataUrl);
        } catch (error) {
          if (error.name === 'SecurityError') {
            console.warn('preprocessImage: 安全錯誤，無法處理本地圖片為DataURL，嘗試直接使用原始源');
            resolve(imageSource); // Fallback to original source if conversion fails due to security
          } else {
            console.error('preprocessImage: toDataURL失敗', error);
            reject(error);
          }
        }
      } catch (error) {
        console.error('preprocessImage: 處理圖片時發生錯誤', error);
        reject(error);
      }
    };
    
    img.onerror = function(errorEvent) {
      clearTimeout(timeoutId);
      let errorMsg = '圖片載入失敗';
      if (errorEvent && errorEvent.target && errorEvent.target.error) {
          errorMsg += `: ${errorEvent.target.error.message}`;
      } else if (typeof errorEvent === 'string') {
          errorMsg += `: ${errorEvent}`;
      }
      console.error('preprocessImage:', errorMsg, '源:', imageSource);
      reject(new Error(errorMsg));
    };
    
    try {
      img.src = imageSource;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('preprocessImage: 設置圖片源時發生錯誤', error);
      reject(error);
    }
  });
}

/**
 * 將（已預處理成正方形的）圖片切割成指定數量的小塊
 * @param {string} squareImageSource - 經過 preprocessImage 處理後的正方形圖片 DataURL
 * @param {number} gridSize - 遊戲尺寸 (e.g., 4 for 4x4)
 * @returns {Promise<string[]>} - 一個包含每個小塊圖片 DataURL 的數組
 */
function cutImageIntoPieces(squareImageSource, gridSize) {
  return new Promise((resolve, reject) => {
    if (!squareImageSource) {
      reject(new Error("用於切割的圖片源為空"));
      return;
    }
    console.log(`cutImageIntoPieces: 開始切割 ${gridSize}x${gridSize} 的圖片`);

    const mainImage = new Image();
    // Data URLs 不需要 crossOrigin
    // if (squareImageSource.startsWith('http')) {
    //   mainImage.crossOrigin = 'Anonymous';
    // }

    mainImage.onload = () => {
      console.log('cutImageIntoPieces: 主圖片載入成功，尺寸:', mainImage.width, 'x', mainImage.height);
      if (mainImage.width === 0 || mainImage.height === 0) {
          reject(new Error("切割用的主圖片尺寸無效 (0x0)"));
          return;
      }
      if (mainImage.width !== mainImage.height) {
        console.warn(`cutImageIntoPieces: 提供的圖片 (${mainImage.width}x${mainImage.height}) 不是正方形，切割效果可能不佳。期望由 preprocessImage 處理。`);
        // 可以選擇 reject 或繼續嘗試
      }

      const pieceWidth = mainImage.width / gridSize;
      const pieceHeight = mainImage.height / gridSize;
      const piecesDataUrls = [];

      // 不需要再創建一個 mainCanvas，直接使用 mainImage 作為源
      // const mainCanvas = document.createElement('canvas');
      // mainCanvas.width = mainImage.width;
      // mainCanvas.height = mainImage.height;
      // const mainCtx = mainCanvas.getContext('2d');
      // mainCtx.drawImage(mainImage, 0, 0);

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const pieceCanvas = document.createElement('canvas');
          pieceCanvas.width = pieceWidth;
          pieceCanvas.height = pieceHeight;
          const pieceCtx = pieceCanvas.getContext('2d');

          if (!pieceCtx) {
            reject(new Error("無法獲取小塊畫布的上下文"));
            return; // 退出循環和 Promise
          }

          try {
            pieceCtx.drawImage(
              mainImage,        // 源圖片元素
              c * pieceWidth,   // 源 x (從主圖的哪個橫座標開始切)
              r * pieceHeight,  // 源 y (從主圖的哪個縱座標開始切)
              pieceWidth,       // 源 width (要切的寬度)
              pieceHeight,      // 源 height (要切的高度)
              0,                // 目標 x (繪製到小畫布的 0)
              0,                // 目標 y (繪製到小畫布的 0)
              pieceWidth,       // 目標 width (繪製的寬度)
              pieceHeight       // 目標 height (繪製的高度)
            );
            piecesDataUrls.push(pieceCanvas.toDataURL('image/png')); // 使用 PNG 以保留透明度（如果需要）和質量
          } catch (e) {
            console.error(`cutImageIntoPieces: 在切割塊 (${r},${c}) 時drawImage或toDataURL失敗`, e);
            // 可以選擇填充一個錯誤標記或終止
            piecesDataUrls.push('error_piece'); // 標記錯誤
          }
        }
      }
      
      if (piecesDataUrls.length !== gridSize * gridSize) {
          console.error(`cutImageIntoPieces: 切割數量 (${piecesDataUrls.length}) 與預期 (${gridSize * gridSize}) 不符`);
          // 可以考慮 reject
      }
      console.log(`cutImageIntoPieces: 圖片切割完成，共 ${piecesDataUrls.length} 塊`);
      resolve(piecesDataUrls);
    };

    mainImage.onerror = (err) => {
      console.error('cutImageIntoPieces: 載入用於切割的主圖片失敗', err, '源:', squareImageSource.substring(0,100) + '...');
      reject(new Error("載入用於切割的主圖片失敗"));
    };

    mainImage.src = squareImageSource;
  });
}


/**
 * 批量預處理預設圖片 (這個函數現在只是確保它們是正方形的 DataURL)
 * @param {Array} presetImages - 預設圖片數組
 * @returns {Promise<Array>} - 處理後的預設圖片數組 (每個 src 都是正方形 DataURL)
 */
async function preprocessPresetImages(presetImages) {
  const processedImages = [];
  const defaultGridSizeForPreprocessing = 4; // Or some other sensible default

  for (const image of presetImages) {
    try {
      // 注意：這裡的 preprocessImage 應該只負責將圖片轉換為正方形的 DataURL
      // 真正的切割會在 startGame 時針對選定的圖片進行
      const processedSrc = await preprocessImage(image.src, defaultGridSizeForPreprocessing);
      processedImages.push({
        name: image.name,
        src: processedSrc // This src is a square DataURL, ready for cutting
      });
    } catch (error) {
      console.error(`預處理圖片 ${image.name} 失敗:`, error);
      processedImages.push({ ...image, src: image.src }); // Fallback to original if preprocessing fails
    }
  }
  return processedImages;
}