// 图片处理工具函数

/**
 * 预处理图片，确保图片是正方形且尺寸适合切割
 * @param {string} imageSource - 图片源（URL或DataURL）
 * @param {number} size - 游戏尺寸（几乘几的网格）
 * @returns {Promise<string>} - 处理后的图片DataURL
 */
function preprocessImage(imageSource, size) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // 处理跨域问题
    
    img.onload = function() {
      // 创建一个正方形画布，尺寸为size的整数倍，确保能被完美切割
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 计算合适的画布尺寸（确保是size的整数倍）
      // 使用较大的尺寸以保持图片质量
      const canvasSize = Math.max(img.width, img.height);
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      
      // 填充背景（可选，防止透明背景）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 居中绘制图片
      const offsetX = (canvas.width - img.width) / 2;
      const offsetY = (canvas.height - img.height) / 2;
      ctx.drawImage(img, offsetX, offsetY, img.width, img.height);
      
      // 返回处理后的图片DataURL
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.onerror = function() {
      reject(new Error('圖片加載失敗'));
    };
    
    img.src = imageSource;
  });
}

/**
 * 批量预处理预设图片
 * @param {Array} presetImages - 预设图片数组
 * @returns {Promise<Array>} - 处理后的预设图片数组
 */
async function preprocessPresetImages(presetImages) {
  const processedImages = [];
  
  for (const image of presetImages) {
    try {
      const processedSrc = await preprocessImage(image.src, 4); // 默认使用4x4尺寸
      processedImages.push({
        name: image.name,
        src: processedSrc
      });
    } catch (error) {
      console.error(`處理圖片 ${image.name} 失敗:`, error);
      // 如果处理失败，使用原始图片
      processedImages.push(image);
    }
  }
  
  return processedImages;
}