// 圖片處理工具函數

/**
 * 從緩存中獲取處理過的圖片
 * @param {string} imageSource - 圖片源（URL或DataURL）
 * @param {number} size - 遊戲尺寸（幾乘幾的網格）
 * @returns {string|null} - 緩存的圖片DataURL或null（如果沒有緩存）
 */
function getImageFromCache(imageSource, size) {
  try {
    // 創建一個唯一的緩存鍵，結合圖片源和尺寸
    // 對於URL，我們使用URL的哈希值作為鍵的一部分
    // 對於DataURL，我們使用其哈希值（前50個字符）作為鍵的一部分
    let cacheKey;
    if (imageSource.startsWith('data:')) {
      // 對於DataURL，使用前50個字符作為標識符
      cacheKey = `img_cache_${imageSource.substring(0, 50)}_${size}`;
    } else {
      // 對於URL，使用URL的哈希值（使用簡單的字符串哈希函數）
      const urlHash = simpleHash(imageSource);
      cacheKey = `img_cache_url_${urlHash}_${size}`;
    }
    
    // 從localStorage獲取緩存的圖片
    const cachedImage = localStorage.getItem(cacheKey);
    if (cachedImage) {
      console.log('從緩存中獲取圖片成功');
      return cachedImage;
    }
    return null;
  } catch (error) {
    console.error('獲取圖片緩存失敗:', error);
    return null;
  }
}

/**
 * 將處理過的圖片保存到緩存
 * @param {string} imageSource - 圖片源（URL或DataURL）
 * @param {number} size - 遊戲尺寸（幾乘幾的網格）
 * @param {string} processedImage - 處理後的圖片DataURL
 */
/**
 * 簡單的字符串哈希函數，用於生成URL的唯一標識符
 * @param {string} str - 要哈希的字符串
 * @returns {string} - 哈希值
 */
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 轉換為32位整數
  }
  
  return Math.abs(hash).toString();
}

/**
 * 將處理過的圖片保存到緩存
 * @param {string} imageSource - 圖片源（URL或DataURL）
 * @param {number} size - 遊戲尺寸（幾乘幾的網格）
 * @param {string} processedImage - 處理後的圖片DataURL
 */
function saveImageToCache(imageSource, size, processedImage) {
  try {
    // 創建與getImageFromCache相同的緩存鍵
    let cacheKey;
    if (imageSource.startsWith('data:')) {
      cacheKey = `img_cache_${imageSource.substring(0, 50)}_${size}`;
    } else {
      const urlHash = simpleHash(imageSource);
      cacheKey = `img_cache_url_${urlHash}_${size}`;
    }
    
    // 嘗試保存到localStorage
    try {
      localStorage.setItem(cacheKey, processedImage);
      console.log('圖片已保存到緩存');
      
      // 更新緩存使用記錄
      updateCacheUsageRecord(cacheKey);
    } catch (storageError) {
      // 檢查是否是配額超出錯誤
      if (storageError.name === 'QuotaExceededError') {
        console.warn('localStorage配額已滿，正在清理舊緩存...');
        // 清理舊緩存並重試
        if (clearOldestCache()) {
          try {
            localStorage.setItem(cacheKey, processedImage);
            console.log('清理後成功保存圖片到緩存');
            updateCacheUsageRecord(cacheKey);
          } catch (retryError) {
            console.error('即使清理後仍無法保存到緩存:', retryError);
          }
        } else {
          console.error('無法清理緩存，無法保存新圖片');
        }
      } else {
        throw storageError; // 重新拋出非配額錯誤
      }
    }
  } catch (error) {
    console.error('保存圖片到緩存失敗:', error);
    // 緩存失敗不影響主要功能，只是記錄錯誤
  }
}

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
    
    // 首先嘗試從緩存中獲取圖片
    const cachedImage = getImageFromCache(imageSource, size);
    if (cachedImage) {
      console.log('preprocessImage: 使用緩存的圖片');
      resolve(cachedImage);
      return;
    }
    
    console.log('preprocessImage: 開始處理圖片，尺寸:', size);
    
    const img = new Image();
    // 對所有圖片都設置crossOrigin，避免CORS問題
    img.crossOrigin = 'Anonymous';
    
    // 設置載入超時
    const timeoutId = setTimeout(() => {
      console.error('preprocessImage: 圖片載入超時');
      reject(new Error('圖片載入超時'));
    }, 10000); // 10秒超時
    
    img.onload = function() {
      clearTimeout(timeoutId);
      console.log('preprocessImage: 圖片載入成功，尺寸:', img.width, 'x', img.height);
      
      try {
        // 創建一個正方形畫布，尺寸為size的整數倍，確保能被完美切割
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('preprocessImage: 無法獲取畫布上下文');
          reject(new Error('無法獲取畫布上下文'));
          return;
        }
        
        // 計算合適的畫布尺寸（確保是size的整數倍）
        // 使用較大的尺寸以保持圖片質量
        const canvasSize = Math.max(img.width, img.height);
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        
        // 填充背景（可選，防止透明背景）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 居中繪製圖片
        const offsetX = (canvas.width - img.width) / 2;
        const offsetY = (canvas.height - img.height) / 2;
        ctx.drawImage(img, offsetX, offsetY, img.width, img.height);
        
        // 返回處理後的圖片DataURL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        console.log('preprocessImage: 圖片處理成功');
        
        // 將處理後的圖片保存到緩存
        saveImageToCache(imageSource, size, dataUrl);
        
        resolve(dataUrl);
      } catch (error) {
        console.error('preprocessImage: 處理圖片時發生錯誤', error);
        reject(error);
      }
    };
    
    img.onerror = function(error) {
      clearTimeout(timeoutId);
      console.error('preprocessImage: 圖片載入失敗', error);
      reject(new Error('圖片載入失敗'));
    };
    
    // 確保在設置src之前已經綁定了事件處理程序
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
 * 批量預處理預設圖片
 * @param {Array} presetImages - 預設圖片數組
 * @returns {Promise<Array>} - 處理後的預設圖片數組
 */
async function preprocessPresetImages(presetImages) {
  const processedImages = [];
  
  for (const image of presetImages) {
    try {
      const processedSrc = await preprocessImage(image.src, 4); // 預設使用4x4尺寸
      processedImages.push({
        name: image.name,
        src: processedSrc
      });
    } catch (error) {
      console.error(`處理圖片 ${image.name} 失敗:`, error);
      // 如果處理失敗，使用原始圖片
      processedImages.push(image);
    }
  }
  
  return processedImages;
}

/**
 * 清除特定圖片的緩存
 * @param {string} imageSource - 圖片源（URL或DataURL）
 * @param {number} size - 遊戲尺寸（幾乘幾的網格）
 */
function clearImageCache(imageSource, size) {
  try {
    // 創建與getImageFromCache相同的緩存鍵
    let cacheKey;
    if (imageSource.startsWith('data:')) {
      cacheKey = `img_cache_${imageSource.substring(0, 50)}_${size}`;
    } else {
      const urlHash = simpleHash(imageSource);
      cacheKey = `img_cache_url_${urlHash}_${size}`;
    }
    
    // 從localStorage中移除該緩存
    localStorage.removeItem(cacheKey);
    console.log('已清除圖片緩存:', cacheKey);
  } catch (error) {
    console.error('清除圖片緩存失敗:', error);
    // 清除緩存失敗不影響主要功能，只是記錄錯誤
  }
}