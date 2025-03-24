// 圖片預加載模組

/**
 * 圖片預加載器類
 * 負責預先載入和緩存圖片，提高遊戲性能
 */
class ImagePreloader {
  constructor() {
    // 圖片緩存對象
    this.imageCache = new Map();
    // 載入中的圖片Promise
    this.loadingImages = new Map();
    // 支持的圖片格式
    this.supportedFormats = {
      webp: false,
      avif: false,
      jpeg: true,
      png: true
    };
    // 初始化檢測瀏覽器支持的圖片格式
    this.detectSupportedFormats();
    // 是否為Safari瀏覽器
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  /**
   * 檢測瀏覽器支持的圖片格式
   */
  detectSupportedFormats() {
    const testWebP = new Image();
    testWebP.onload = () => {
      this.supportedFormats.webp = (testWebP.height === 1);
    };
    testWebP.onerror = () => {
      this.supportedFormats.webp = false;
    };
    testWebP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';

    const testAvif = new Image();
    testAvif.onload = () => {
      this.supportedFormats.avif = (testAvif.height === 1);
    };
    testAvif.onerror = () => {
      this.supportedFormats.avif = false;
    };
    testAvif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  }

  /**
   * 預加載單個圖片
   * @param {string} src - 圖片URL
   * @param {Object} options - 選項
   * @returns {Promise<HTMLImageElement>} - 載入完成的圖片元素
   */
  preloadImage(src, options = {}) {
    // 如果圖片已經在緩存中，直接返回
    if (this.imageCache.has(src)) {
      return Promise.resolve(this.imageCache.get(src));
    }

    // 如果圖片正在載入中，返回已有的Promise
    if (this.loadingImages.has(src)) {
      return this.loadingImages.get(src);
    }

    // 設置默認選項
    const defaultOptions = {
      timeout: 10000, // 10秒超時
      size: null, // 目標尺寸
      quality: 0.9, // 圖片質量
      useOptimalFormat: true // 是否使用最佳格式
    };

    const finalOptions = { ...defaultOptions, ...options };

    // 創建新的載入Promise
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // 處理跨域問題

      // 設置超時處理
      const timeoutId = setTimeout(() => {
        reject(new Error(`圖片載入超時: ${src}`));
      }, finalOptions.timeout);

      img.onload = async () => {
        clearTimeout(timeoutId);
        
        try {
          // 使用image.decode()提高性能，特別是在Safari中
          if ('decode' in img) {
            await img.decode();
          }

          // 如果需要處理圖片尺寸或格式
          if (finalOptions.size || finalOptions.useOptimalFormat) {
            const processedImg = await this.processImage(img, finalOptions);
            this.imageCache.set(src, processedImg);
            this.loadingImages.delete(src);
            resolve(processedImg);
          } else {
            this.imageCache.set(src, img);
            this.loadingImages.delete(src);
            resolve(img);
          }
        } catch (error) {
          this.loadingImages.delete(src);
          reject(error);
        }
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        this.loadingImages.delete(src);
        reject(new Error(`圖片載入失敗: ${src}`));
      };

      img.src = src;
    });

    this.loadingImages.set(src, loadPromise);
    return loadPromise;
  }

  /**
   * 處理圖片尺寸和格式
   * @param {HTMLImageElement} img - 原始圖片元素
   * @param {Object} options - 處理選項
   * @returns {HTMLImageElement} - 處理後的圖片元素
   */
  processImage(img, options) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 計算目標尺寸
      let targetWidth = img.width;
      let targetHeight = img.height;

      if (options.size) {
        // 確保尺寸是options.size的整數倍，便於後續切割
        targetWidth = targetHeight = Math.max(img.width, img.height);
        // 如果尺寸過大，進行縮放以提高性能
        const maxSize = options.size * 100; // 根據遊戲尺寸設置合理的最大尺寸
        if (targetWidth > maxSize) {
          targetWidth = targetHeight = maxSize;
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 填充白色背景（防止透明背景）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 居中繪製圖片
      const offsetX = (canvas.width - img.width) / 2;
      const offsetY = (canvas.height - img.height) / 2;
      ctx.drawImage(img, offsetX, offsetY, img.width, img.height);

      // 選擇最佳圖片格式
      let format = 'image/jpeg';
      let quality = options.quality;

      if (options.useOptimalFormat) {
        if (this.supportedFormats.webp) {
          format = 'image/webp';
          quality = 0.8; // WebP可以使用較低的質量設置
        } else if (this.supportedFormats.avif) {
          format = 'image/avif';
          quality = 0.7; // AVIF可以使用更低的質量設置
        }
      }

      // 創建新圖片
      const processedImg = new Image();
      processedImg.crossOrigin = 'Anonymous';

      processedImg.onload = () => {
        resolve(processedImg);
      };

      // 轉換為選定的格式
      processedImg.src = canvas.toDataURL(format, quality);
    });
  }

  /**
   * 批量預加載圖片
   * @param {Array<string>} sources - 圖片URL數組
   * @param {Object} options - 選項
   * @param {Function} progressCallback - 進度回調函數
   * @returns {Promise<Array<HTMLImageElement>>} - 載入完成的圖片元素數組
   */
  preloadImages(sources, options = {}, progressCallback = null) {
    let loaded = 0;
    const total = sources.length;

    return Promise.all(
      sources.map(src => 
        this.preloadImage(src, options)
          .then(img => {
            loaded++;
            if (progressCallback) {
              progressCallback(loaded, total, src);
            }
            return img;
          })
          .catch(error => {
            console.error(`預加載圖片失敗: ${src}`, error);
            loaded++;
            if (progressCallback) {
              progressCallback(loaded, total, src, error);
            }
            // 返回一個錯誤標記，而不是拋出錯誤，以避免整個Promise.all失敗
            return { error, src };
          })
      )
    );
  }

  /**
   * 預加載預設圖片
   * @param {Array} presetImages - 預設圖片數組
   * @param {Object} options - 選項
   * @param {Function} progressCallback - 進度回調函數
   * @returns {Promise<Array>} - 處理後的預設圖片數組
   */
  preloadPresetImages(presetImages, options = {}, progressCallback = null) {
    const sources = presetImages.map(image => image.src);
    
    return this.preloadImages(sources, options, progressCallback)
      .then(images => {
        return presetImages.map((preset, index) => {
          // 檢查是否有錯誤
          if (images[index] && images[index].error) {
            console.warn(`使用原始圖片 ${preset.name}，因為預加載失敗`);
            return preset;
          }
          
          return {
            name: preset.name,
            src: images[index].src || preset.src,
            element: images[index]
          };
        });
      });
  }

  /**
   * 從緩存中獲取圖片
   * @param {string} src - 圖片URL
   * @returns {HTMLImageElement|null} - 緩存的圖片元素或null
   */
  getFromCache(src) {
    return this.imageCache.get(src) || null;
  }

  /**
   * 將圖片添加到緩存
   * @param {string} src - 圖片URL
   * @param {HTMLImageElement} img - 圖片元素
   */
  addToCache(src, img) {
    this.imageCache.set(src, img);
  }

  /**
   * 清除特定圖片的緩存
   * @param {string} src - 圖片URL
   */
  clearCache(src) {
    this.imageCache.delete(src);
  }

  /**
   * 清除所有圖片緩存
   */
  clearAllCache() {
    this.imageCache.clear();
  }

  /**
   * 獲取Safari特定的優化設置
   * @returns {Object} - Safari優化設置
   */
  getSafariOptimizations() {
    if (!this.isSafari) return {};
    
    return {
      // Safari特定的渲染優化
      useHardwareAcceleration: true,
      useTransform: true,
      avoidReflows: true,
      // Safari在處理大量圖片時的建議設置
      batchSize: 3, // 每批處理的圖片數量（減少以提高穩定性）
      delayBetweenBatches: 80, // 批次間延遲（毫秒）（增加以確保完全載入）
      // 圖片處理優化
      preferredFormat: 'jpeg', // Safari對WebP支持較差
      quality: 0.85, // 適當降低質量以提高性能
      maxImageSize: 800 // 限制最大圖片尺寸以保持性能
    };
  }
}

// 創建全局預加載器實例
const imagePreloader = new ImagePreloader();