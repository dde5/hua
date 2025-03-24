// 圖片處理工具函數

/**
 * 預處理圖片，確保圖片是正方形且尺寸適合切割
 * @param {string} imageSource - 圖片源（URL或DataURL）
 * @param {number} size - 遊戲尺寸（幾乘幾的網格）
 * @returns {Promise<string>} - 處理後的圖片DataURL
 */
function preprocessImage(imageSource, size) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // 處理跨域問題
    
    img.onload = function() {
      // 創建一個正方形畫布，尺寸為size的整數倍，確保能被完美切割
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
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
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.onerror = function() {
      reject(new Error('圖片載入失敗'));
    };
    
    img.src = imageSource;
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