// webImageSearch.js - 網路搜圖功能

/**
 * 網路搜圖模組 - 提供網路圖片搜索功能 (使用Pixabay API)
 */
const WebImageSearch = {
  // Pixabay API 密鑰
  apiKey: '49472016-4b5a8b33b9749687471ba622f', // 預設API密鑰
  // 用戶自定義API密鑰
  userApiKey: null,
  // Pixabay API 端點
  apiUrl: 'https://pixabay.com/api/',
  // 搜圖彈出層元素
  modal: null,
  // 搜索結果容器
  resultsContainer: null,
  // 搜索輸入框
  searchInput: null,
  // 搜索按鈕
  searchButton: null,
  // 關閉按鈕
  closeButton: null,
  // 載入中指示器
  loadingIndicator: null,
  // 圖片選擇回調函數
  onImageSelectCallback: null,
  // 當前搜索關鍵詞
  currentSearchTerm: '',
  // 已驗證可用的圖片列表
  validImages: [],
  
  /**
   * 初始化網路搜圖模組
   * @param {Function} onImageSelect - 圖片選擇回調函數
   */
  init(onImageSelect) {
    this.onImageSelectCallback = onImageSelect;
    this.loadUserApiKey();
    this.createModal();
    this.bindEvents();
    console.log('網路搜圖模組初始化完成');
  },
  
  /**
   * 從本地存儲加載用戶API密鑰
   */
  loadUserApiKey() {
    const savedKey = localStorage.getItem('pixabay_user_api_key');
    if (savedKey) {
      this.userApiKey = savedKey;
      console.log('已從本地存儲加載用戶API密鑰');
    }
  },
  
  /**
   * 保存用戶API密鑰到本地存儲
   * @param {string} apiKey - 用戶輸入的API密鑰
   */
  saveUserApiKey(apiKey) {
    if (apiKey && apiKey.trim() !== '') {
      this.userApiKey = apiKey.trim();
      localStorage.setItem('pixabay_user_api_key', this.userApiKey);
      console.log('用戶API密鑰已保存');
      return true;
    }
    return false;
  },
  
  /**
   * 創建搜圖彈出層
   */
  createModal() {
    // 檢查是否已存在
    if (document.getElementById('web-image-search-modal')) {
      this.modal = document.getElementById('web-image-search-modal');
      this.resultsContainer = document.getElementById('web-image-search-results');
      this.searchInput = document.getElementById('web-image-search-input');
      this.searchButton = document.getElementById('web-image-search-button');
      this.closeButton = document.getElementById('web-image-search-close');
      this.loadingIndicator = document.getElementById('web-image-search-loading');
      this.apiKeyInput = document.getElementById('pixabay-api-key-input');
      this.apiKeySaveButton = document.getElementById('pixabay-api-key-save');
      return;
    }
    
    // 創建彈出層
    this.modal = document.createElement('div');
    this.modal.id = 'web-image-search-modal';
    this.modal.className = 'web-image-search-modal';
    
    // 創建彈出層內容
    const modalContent = document.createElement('div');
    modalContent.className = 'web-image-search-modal-content';
    
    // 創建標題
    const title = document.createElement('h2');
    title.textContent = '網路搜圖 (Pixabay)';
    
    // 創建API Key設置區域
    const apiKeyArea = document.createElement('div');
    apiKeyArea.className = 'api-key-area';
    
    // 創建API Key輸入框
    this.apiKeyInput = document.createElement('input');
    this.apiKeyInput.type = 'text';
    this.apiKeyInput.id = 'pixabay-api-key-input';
    this.apiKeyInput.placeholder = '輸入您的Pixabay API Key...';
    if (this.userApiKey) {
      this.apiKeyInput.value = this.userApiKey;
    }
    
    // 創建API Key保存按鈕
    this.apiKeySaveButton = document.createElement('button');
    this.apiKeySaveButton.id = 'pixabay-api-key-save';
    this.apiKeySaveButton.textContent = '保存';
    
    // 創建申請API Key的連結
    const apiKeyLink = document.createElement('a');
    apiKeyLink.href = 'https://pixabay.com/api/docs/';
    apiKeyLink.target = '_blank';
    apiKeyLink.rel = 'noopener noreferrer';
    apiKeyLink.textContent = '申請免費API Key';
    apiKeyLink.className = 'api-key-link';
    
    // 組裝API Key區域
    const apiKeyInputGroup = document.createElement('div');
    apiKeyInputGroup.className = 'api-key-input-group';
    apiKeyInputGroup.appendChild(this.apiKeyInput);
    apiKeyInputGroup.appendChild(this.apiKeySaveButton);
    
    apiKeyArea.appendChild(apiKeyInputGroup);
    apiKeyArea.appendChild(apiKeyLink);
    
    // 創建搜索區域
    const searchArea = document.createElement('div');
    searchArea.className = 'web-image-search-area';
    
    // 創建搜索輸入框
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.id = 'web-image-search-input';
    this.searchInput.placeholder = '輸入關鍵詞搜索圖片...';
    
    // 創建搜索按鈕
    this.searchButton = document.createElement('button');
    this.searchButton.id = 'web-image-search-button';
    this.searchButton.textContent = '搜索';
    
    // 創建關閉按鈕
    this.closeButton = document.createElement('button');
    this.closeButton.id = 'web-image-search-close';
    this.closeButton.className = 'web-image-search-close-button';
    this.closeButton.innerHTML = '&times;';
    
    // 創建載入中指示器
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.id = 'web-image-search-loading';
    this.loadingIndicator.className = 'web-image-search-loading';
    this.loadingIndicator.innerHTML = '<div class="spinner"></div><p>搜索中...</p>';
    this.loadingIndicator.style.display = 'none';
    
    // 創建搜索結果容器
    this.resultsContainer = document.createElement('div');
    this.resultsContainer.id = 'web-image-search-results';
    this.resultsContainer.className = 'web-image-search-results';
    
    // 組裝彈出層
    searchArea.appendChild(this.searchInput);
    searchArea.appendChild(this.searchButton);
    
    modalContent.appendChild(this.closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(apiKeyArea);
    modalContent.appendChild(searchArea);
    modalContent.appendChild(this.loadingIndicator);
    modalContent.appendChild(this.resultsContainer);
    
    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);
  },
  
  /**
   * 綁定事件
   */
  bindEvents() {
    // 搜索按鈕點擊事件
    this.searchButton.addEventListener('click', () => {
      this.searchImages();
    });
    
    // 輸入框回車事件
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.searchImages();
      }
    });
    
    // API Key保存按鈕點擊事件
    this.apiKeySaveButton.addEventListener('click', () => {
      const apiKey = this.apiKeyInput.value.trim();
      if (this.saveUserApiKey(apiKey)) {
        alert('API Key已保存！');
      } else {
        alert('請輸入有效的API Key！');
      }
    });
    
    // API Key輸入框回車事件
    this.apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const apiKey = this.apiKeyInput.value.trim();
        if (this.saveUserApiKey(apiKey)) {
          alert('API Key已保存！');
        } else {
          alert('請輸入有效的API Key！');
        }
      }
    });
    
    // 關閉按鈕點擊事件
    this.closeButton.addEventListener('click', () => {
      this.hideModal();
    });
    
    // 點擊彈出層外部關閉
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });
  },
  
  /**
   * 顯示彈出層
   */
  showModal() {
    this.modal.style.display = 'flex';
    this.searchInput.focus();
  },
  
  /**
   * 隱藏彈出層
   */
  hideModal() {
    this.modal.style.display = 'none';
  },
  
  /**
   * 搜索圖片
   */
  async searchImages() {
    const searchTerm = this.searchInput.value.trim();
    if (!searchTerm) {
      alert('請輸入搜索關鍵詞');
      return;
    }
    
    this.currentSearchTerm = searchTerm;
    this.showLoading();
    this.clearResults();
    
    try {
      // 使用 Pixabay API 搜索圖片
      const images = await this.fetchImageResults(searchTerm);
      
      // 過濾並處理圖片 URL
      const processedImages = await this.processAndFilterImages(images);
      
      // 顯示結果
      this.displayResults(processedImages);
    } catch (error) {
      console.error('搜索圖片時出錯:', error);
      this.showError('搜索圖片時出錯，請稍後再試');
    } finally {
      this.hideLoading();
    }
  },
  
  /**
   * 獲取圖片搜索結果 (使用Pixabay API)
   * @param {string} searchTerm - 搜索關鍵詞
   * @returns {Promise<Array>} - 圖片結果數組
   */
  async fetchImageResults(searchTerm) {
    try {
      // 構建 Pixabay API 請求 URL
      const url = new URL(this.apiUrl);
      // 優先使用用戶自定義API密鑰
      const apiKey = this.userApiKey || this.apiKey;
      url.searchParams.append('key', apiKey);
      url.searchParams.append('q', searchTerm);
      url.searchParams.append('image_type', 'photo');
      url.searchParams.append('per_page', '20'); // 每頁返回20張圖片
      url.searchParams.append('safesearch', 'true'); // 安全搜索
      
      // 發送請求
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Pixabay API 請求失敗: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.totalHits === 0) {
        return []; // 沒有找到圖片
      }
      
      // 提取圖片 URL
      return data.hits.map(hit => ({
        url: hit.largeImageURL, // 使用大圖 URL
        previewUrl: hit.previewURL, // 預覽圖 URL
        width: hit.imageWidth,
        height: hit.imageHeight,
        tags: hit.tags,
        user: hit.user
      }));
    } catch (error) {
      console.error('從 Pixabay 獲取圖片時出錯:', error);
      throw error;
    }
  },
  
  /**
   * 處理並過濾圖片 URL
   * @param {Array} images - 原始圖片數據數組
   * @returns {Promise<Array>} - 處理後的可用圖片數組
   */
  async processAndFilterImages(images) {
    this.validImages = [];
    
    // 處理每個圖片 URL，確保是有效的圖片 URL
    const processPromises = images.map(async (image) => {
      try {
        // 檢查圖片是否可載入
        const isLoadable = await this.checkImageLoadable(image.url);
        
        if (isLoadable) {
          return {
            originalUrl: image.url,
            cleanUrl: image.url,
            previewUrl: image.previewUrl,
            tags: image.tags,
            user: image.user,
            valid: true
          };
        }
      } catch (error) {
        console.error('處理圖片時出錯:', error);
      }
      
      return null;
    });
    
    // 等待所有處理完成
    const results = await Promise.all(processPromises);
    
    // 過濾出有效的圖片
    this.validImages = results.filter(result => result && result.valid);
    
    return this.validImages;
  },
  
  /**
   * 檢查圖片是否可載入
   * @param {string} url - 圖片 URL
   * @returns {Promise<boolean>} - 圖片是否可載入
   */
  checkImageLoadable(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      // 設置載入超時
      const timeoutId = setTimeout(() => {
        console.error('圖片載入超時:', url);
        resolve(false);
      }, 5000); // 5秒超時
      
      img.onload = function() {
        clearTimeout(timeoutId);
        // 檢查圖片尺寸是否合適
        if (img.width < 100 || img.height < 100) {
          console.warn('圖片尺寸太小:', url);
          resolve(false);
          return;
        }
        console.log('圖片載入成功:', url);
        resolve(true);
      };
      
      img.onerror = function() {
        clearTimeout(timeoutId);
        console.error('圖片載入失敗:', url);
        resolve(false);
      };
      
      try {
        img.src = url;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('設置圖片源時發生錯誤:', error);
        resolve(false);
      }
    });
  },
  
  /**
   * 顯示搜索結果
   * @param {Array} images - 處理後的圖片數組
   */
  displayResults(images) {
    this.clearResults();
    
    if (images.length === 0) {
      const noResults = document.createElement('p');
      noResults.className = 'web-image-search-no-results';
      noResults.textContent = '沒有找到可用的圖片，請嘗試其他關鍵詞';
      this.resultsContainer.appendChild(noResults);
      return;
    }
    
    // 創建圖片網格
    const grid = document.createElement('div');
    grid.className = 'web-image-search-grid';
    
    // 添加每個圖片
    images.forEach((image, index) => {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'web-image-search-item';
      
      const img = document.createElement('img');
      img.src = image.previewUrl || image.cleanUrl; // 使用預覽圖或原圖
      img.alt = `${this.currentSearchTerm}-${index + 1}`;
      img.title = image.tags || `${this.currentSearchTerm}-${index + 1}`;
      img.dataset.originalUrl = image.originalUrl;
      img.dataset.cleanUrl = image.cleanUrl;
      
      // 添加圖片來源信息
      if (image.user) {
        const attribution = document.createElement('div');
        attribution.className = 'web-image-search-attribution';
        attribution.textContent = `By: ${image.user}`;
        imgWrapper.appendChild(attribution);
      }
      
      // 點擊選擇圖片
      img.addEventListener('click', () => {
        this.selectImage(image.cleanUrl, `${this.currentSearchTerm}-${index + 1}`);
      });
      
      imgWrapper.appendChild(img);
      grid.appendChild(imgWrapper);
    });
    
    // 添加 Pixabay 歸屬聲明
    const attribution = document.createElement('div');
    attribution.className = 'web-image-search-pixabay-attribution';
    attribution.innerHTML = '圖片由 <a href="https://pixabay.com/" target="_blank" rel="noopener noreferrer">Pixabay</a> 提供';
    
    this.resultsContainer.appendChild(grid);
    this.resultsContainer.appendChild(attribution);
  },
  
  /**
   * 選擇圖片
   * @param {string} imageUrl - 圖片 URL
   * @param {string} imageName - 圖片名稱
   */
  selectImage(imageUrl, imageName) {
    if (this.onImageSelectCallback) {
      this.onImageSelectCallback(imageUrl, imageName);
      this.hideModal();
    }
  },
  
  /**
   * 清空搜索結果
   */
  clearResults() {
    this.resultsContainer.innerHTML = '';
  },
  
  /**
   * 顯示載入中指示器
   */
  showLoading() {
    this.loadingIndicator.style.display = 'flex';
  },
  
  /**
   * 隱藏載入中指示器
   */
  hideLoading() {
    this.loadingIndicator.style.display = 'none';
  },
  
  /**
   * 顯示錯誤信息
   * @param {string} message - 錯誤信息
   */
  showError(message) {
    const errorElement = document.createElement('p');
    errorElement.className = 'web-image-search-error';
    errorElement.textContent = message;
    this.clearResults();
    this.resultsContainer.appendChild(errorElement);
  }
};