// 圖片處理工具函數

// 圖片緩存對象 - 避免重複處理相同圖片
const imageCache = new Map();

/**
 * 預處理圖片，確保圖片是正方形且尺寸適合切割
 * @param {string} imageSource - 圖片源（URL或DataURL）
 * @param {number} size - 遊戲尺寸（幾乘幾的網格）
 * @param {Object} options - 額外選項
 * @returns {Promise<string>} - 處理後的圖片DataURL
 */
function preprocessImage(imageSource, size, options = {}) {
  // 檢查緩存中是否已有處理過的圖片
  const cacheKey = `${imageSource}_${size}_${JSON.stringify(options)}`;
  if (imageCache.has(cacheKey)) {
    return Promise.resolve(imageCache.get(cacheKey));
  }
  
  // 使用全局預加載器處理圖片
  if (window.imagePreloader) {
    const preloaderOptions = {
      size: size,
      quality: options.quality || 0.9,
      useOptimalFormat: options.useOptimalFormat !== false,
      timeout: options.timeout || 15000
    };
    
    return window.imagePreloader.preloadImage(imageSource, preloaderOptions)
      .then(processedImg => {
        // 將處理後的圖片添加到緩存
        const dataUrl = processedImg.src;
        imageCache.set(cacheKey, dataUrl);
        return dataUrl;
      })
      .catch(error => {
        console.error('使用預加載器處理圖片失敗:', error);
        // 如果預加載器失敗，回退到傳統方法
        return processImageTraditional(imageSource, size, options);
      });
  }
  
  // 如果預加載器不可用，使用傳統方法
  return processImageTraditional(imageSource, size, options)
    .then(dataUrl => {
      // 將處理後的圖片添加到緩存
      imageCache.set(cacheKey, dataUrl);
      return dataUrl;
    });
}

/**
 * 使用傳統方法處理圖片（作為備用方法）
 * @param {string} imageSource - 圖片源（URL或DataURL）
 * @param {number} size - 遊戲尺寸（幾乘幾的網格）
 * @param {Object} options - 額外選項
 * @returns {Promise<string>} - 處理後的圖片DataURL
 */
function processImageTraditional(imageSource, size, options = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // 處理跨域問題
    
    // 設置超時處理
    const timeoutId = setTimeout(() => {
      reject(new Error(`圖片載入超時: ${imageSource}`));
    }, options.timeout || 15000);
    
    img.onload = function() {
      clearTimeout(timeoutId);
      
      // 創建一個正方形畫布，尺寸為size的整數倍，確保能被完美切割
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 計算合適的畫布尺寸（確保是size的整數倍）
      // 使用較大的尺寸以保持圖片質量，但不要過大
      let canvasSize = Math.max(img.width, img.height);
      
      // 如果尺寸過大，進行縮放以提高性能
      const maxSize = size * 100; // 根據遊戲尺寸設置合理的最大尺寸
      if (canvasSize > maxSize) {
        canvasSize = maxSize;
      }
      
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      
      // 填充背景（防止透明背景）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 居中繪製圖片
      const offsetX = (canvas.width - img.width) / 2;
      const offsetY = (canvas.height - img.height) / 2;
      ctx.drawImage(img, offsetX, offsetY, img.width, img.height);
      
      // 選擇最佳圖片格式
      let format = 'image/jpeg';
      let quality = options.quality || 0.9;
      
      // 返回處理後的圖片DataURL
      resolve(canvas.toDataURL(format, quality));
    };
    
    img.onerror = function() {
      clearTimeout(timeoutId);
      reject(new Error(`圖片載入失敗: ${imageSource}`));
    };
    
    img.src = imageSource;
  });
}

/**
 * 批量預處理預設圖片
 * @param {Array} presetImages - 預設圖片數組
 * @param {Object} options - 額外選項
 * @returns {Promise<Array>} - 處理後的預設圖片數組
 */
async function preprocessPresetImages(presetImages, options = {}) {
  // 如果預加載器可用，使用預加載器批量處理
  if (window.imagePreloader) {
    try {
      const preloaderOptions = {
        size: options.size || 4, // 預設使用4x4尺寸
        quality: options.quality || 0.9,
        useOptimalFormat: options.useOptimalFormat !== false
      };
      
      // 顯示載入進度的回調函數
      const progressCallback = options.progressCallback || ((loaded, total) => {
        console.log(`預加載圖片進度: ${loaded}/${total}`);
      });
      
      return await window.imagePreloader.preloadPresetImages(presetImages, preloaderOptions, progressCallback);
    } catch (error) {
      console.error('使用預加載器批量處理圖片失敗:', error);
      // 如果預加載器失敗，回退到傳統方法
    }
  }
  
  // 傳統方法處理
  const processedImages = [];
  const size = options.size || 4; // 預設使用4x4尺寸
  
  for (const image of presetImages) {
    try {
      const processedSrc = await preprocessImage(image.src, size, options);
      processedImages.push({
        name: image.name,
        src: processedSrc
      });
      
      // 如果有進度回調，調用它
      if (options.progressCallback) {
        options.progressCallback(processedImages.length, presetImages.length, image.src);
      }
    } catch (error) {
      console.error(`處理圖片 ${image.name} 失敗:`, error);
      // 如果處理失敗，使用原始圖片
      processedImages.push(image);
      
      // 如果有進度回調，調用它（帶錯誤信息）
      if (options.progressCallback) {
        options.progressCallback(processedImages.length, presetImages.length, image.src, error);
      }
    }
  }
  
  return processedImages;
}