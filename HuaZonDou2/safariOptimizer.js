// Safari瀏覽器優化模組

/**
 * Safari瀏覽器優化器類
 * 提供針對Safari瀏覽器的特定優化功能
 */
class SafariOptimizer {
  constructor() {
    // 檢測是否為Safari瀏覽器
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // 如果是Safari，應用特定優化
    if (this.isSafari) {
      this.applySafariOptimizations();
    }
  }
  
  /**
   * 應用Safari特定的優化
   */
  applySafariOptimizations() {
    console.log('檢測到Safari瀏覽器，應用特定優化...');
    
    // 添加Safari特定的CSS類到body
    document.body.classList.add('safari-browser');
    
    // 優化圖片渲染
    this.optimizeImageRendering();
    
    // 優化動畫性能
    this.optimizeAnimations();
    
    // 優化事件處理
    this.optimizeEventHandling();
    
    // 監聽視窗大小變化，重新應用優化
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * 優化圖片渲染
   */
  optimizeImageRendering() {
    // 為所有圖片添加硬件加速
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // 啟用硬件加速
      img.style.transform = 'translateZ(0)';
      img.style.webkitTransform = 'translateZ(0)';
      img.style.webkitBackfaceVisibility = 'hidden';
      
      // 使用原生延遲載入
      img.loading = 'lazy';
      
      // 添加錯誤處理
      img.onerror = function() {
        console.warn('圖片載入失敗:', img.src);
        // 可以在這裡添加備用圖片
      };
    });
  }
  
  /**
   * 優化動畫性能
   */
  optimizeAnimations() {
    // 使用requestAnimationFrame代替setTimeout進行動畫
    window.safariRAF = (callback) => {
      return window.requestAnimationFrame(callback);
    };
    
    // 優化CSS動畫
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      /* Safari動畫優化 */
      @supports (-webkit-touch-callout: none) {
        .animated {
          -webkit-transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          -webkit-perspective: 1000;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }
  
  /**
   * 優化事件處理
   */
  optimizeEventHandling() {
    // 使用被動事件監聽器提高滾動性能
    const wheelOpt = { passive: true };
    const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
    
    document.addEventListener(wheelEvent, () => {}, wheelOpt);
    document.addEventListener('touchstart', () => {}, wheelOpt);
    document.addEventListener('touchmove', () => {}, wheelOpt);
    
    // 優化點擊事件，減少延遲
    document.addEventListener('touchend', (e) => {
      // 防止Safari中的300ms點擊延遲
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    }, false);
  }
  
  /**
   * 處理視窗大小變化
   */
  handleResize() {
    // 在視窗大小變化時重新應用優化
    this.optimizeImageRendering();
  }
  
  /**
   * 獲取Safari特定的優化設置
   * @returns {Object} - Safari優化設置
   */
  getOptimizationSettings() {
    if (!this.isSafari) return {};
    
    return {
      // Safari特定的渲染優化
      useHardwareAcceleration: true,
      useTransform: true,
      avoidReflows: true,
      // Safari在處理大量圖片時的建議設置
      batchSize: 4, // 每批處理的圖片數量
      delayBetweenBatches: 50, // 批次間延遲（毫秒）
      // 圖片優化
      preferredFormat: 'jpeg', // Safari對WebP支持較差
      quality: 0.85,
      // 事件處理優化
      usePassiveEvents: true
    };
  }
  
  /**
   * 釋放資源
   * 在遊戲完成後調用，釋放不需要的資源
   */
  releaseResources() {
    if (!this.isSafari) return;
    
    console.log('釋放Safari優化資源...');
    
    // 移除事件監聽器
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    // 釋放圖片資源
    if (window.imagePreloader && typeof window.imagePreloader.clearAllCache === 'function') {
      window.imagePreloader.clearAllCache();
    }
  }
}

// 創建全局Safari優化器實例
const safariOptimizer = new SafariOptimizer();

// 將優化器添加到全局對象
window.safariOptimizer = safariOptimizer;