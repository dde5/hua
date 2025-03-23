// 網路圖片搜索工具

// 存儲API設定
let apiSettings = {
  enabled: false,
  apiKey: '',
  verified: false
};

/**
 * 驗證Pixabay API序號
 * @param {string} apiKey - API序號
 * @returns {Promise<boolean>} - 驗證結果
 */
async function verifyPixabayApiKey(apiKey) {
  try {
    // 檢查API序號是否為空
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API序號不能為空');
    }
    
    // 使用一個簡單的查詢來測試API序號是否有效
    const testQuery = 'flower';
    
    // 修正URL格式，確保使用正確的參數格式
    // 使用encodeURIComponent處理查詢參數，避免特殊字符問題
    const url = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(testQuery)}&image_type=photo&per_page=1&safesearch=true`;
    
    console.log('驗證API URL:', url);
    console.log('使用的API序號:', apiKey);
    
    // 使用Promise包裝XMLHttpRequest，處理跨域問題
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.timeout = 20000; // 增加超時時間
      xhr.setRequestHeader('Accept', 'application/json');
      
      // 添加更多請求頭，模擬瀏覽器行為
      xhr.setRequestHeader('User-Agent', 'Mozilla/5.0');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      
      xhr.onload = function() {
        try {
          console.log('XMLHttpRequest狀態碼:', xhr.status);
          console.log('XMLHttpRequest響應頭:', xhr.getAllResponseHeaders());
          console.log('XMLHttpRequest響應文本:', xhr.responseText.substring(0, 200) + '...');
          
          // 檢查HTTP狀態碼
          if (xhr.status !== 200) {
            console.error(`HTTP錯誤: ${xhr.status} ${xhr.statusText}`);
            throw new Error(`HTTP錯誤: ${xhr.status} ${xhr.statusText}`);
          }
          
          // 嘗試解析響應
          let data;
          try {
            data = JSON.parse(xhr.responseText);
            console.log('API驗證響應:', data);
          } catch (parseError) {
            console.error('JSON解析錯誤:', parseError, '原始響應:', xhr.responseText);
            throw new Error('無法解析API響應');
          }
          
          // 檢查API錯誤信息
          if (data.error) {
            console.error('API錯誤:', data.error);
            throw new Error(`API錯誤: ${data.error}`);
          }
          
          // 檢查API響應是否包含預期的字段
          if (data && (typeof data.totalHits !== 'undefined' || Array.isArray(data.hits))) {
            // 更新API設定
            apiSettings.enabled = true;
            apiSettings.apiKey = apiKey;
            apiSettings.verified = true;
            
            // 保存API設定到localStorage
            saveApiSettings();
            
            // 更新UI狀態
            const apiStatus = document.getElementById('api-status');
            if (apiStatus) {
              apiStatus.textContent = '✓ API驗證成功';
              apiStatus.className = 'api-status success';
              
              // 顯示搜索選項
              const searchOption = document.getElementById('search-option-container');
              if (searchOption) {
                searchOption.classList.remove('hidden');
              }
            }
            
            console.log('API驗證成功!');
            resolve(true);
          } else {
            console.error('API返回的數據格式不正確:', data);
            throw new Error('API返回的數據格式不正確');
          }
        } catch (error) {
          console.error('XMLHttpRequest解析錯誤:', error);
          
          // 更新UI顯示錯誤信息
          const apiStatus = document.getElementById('api-status');
          if (apiStatus) {
            apiStatus.textContent = `✗ 驗證失敗: ${error.message}`;
            apiStatus.className = 'api-status error';
          }
          
          resolve(false);
        }
      };
      
      xhr.onerror = function() {
        console.error('XMLHttpRequest請求錯誤');
        
        // 更新UI顯示錯誤信息
        const apiStatus = document.getElementById('api-status');
        if (apiStatus) {
          apiStatus.textContent = '✗ 驗證失敗: 網絡請求錯誤';
          apiStatus.className = 'api-status error';
        }
        
        resolve(false);
      };
      
      xhr.ontimeout = function() {
        console.error('XMLHttpRequest請求超時');
        
        // 更新UI顯示錯誤信息
        const apiStatus = document.getElementById('api-status');
        if (apiStatus) {
          apiStatus.textContent = '✗ 驗證失敗: 請求超時';
          apiStatus.className = 'api-status error';
        }
        
        resolve(false);
      };
      
      // 發送請求
      try {
        xhr.send();
      } catch (sendError) {
        console.error('發送請求失敗:', sendError);
        resolve(false);
      }
    });
  } catch (error) {
    console.error('API驗證錯誤:', error);
    
    // 更新UI顯示錯誤信息
    const apiStatus = document.getElementById('api-status');
    if (apiStatus) {
      apiStatus.textContent = `✗ 驗證失敗: ${error.message}`;
      apiStatus.className = 'api-status error';
    }
    
    return false;
  }
}

/**
 * 保存API設定到localStorage
 */
function saveApiSettings() {
  localStorage.setItem('pixabayApiSettings', JSON.stringify(apiSettings));
}

/**
 * 從localStorage載入API設定
 */
function loadApiSettings() {
  const savedSettings = localStorage.getItem('pixabayApiSettings');
  if (savedSettings) {
    try {
      apiSettings = JSON.parse(savedSettings);
    } catch (error) {
      console.error('載入API設定失敗:', error);
    }
  }
}

/**
 * 使用Unsplash API搜索圖片 (已棄用)
 * @param {string} query - 搜索關鍵詞
 * @param {number} page - 頁碼
 * @param {number} perPage - 每頁顯示數量
 * @returns {Promise<Array>} - 搜索結果
 */
async function searchImages(query, page = 1, perPage = 10) {
  // 直接使用Pixabay API
  return searchPixabayImages(query, page, perPage);
}

/**
 * 使用Pixabay API搜索圖片
 * @param {string} query - 搜索關鍵詞
 * @param {number} page - 頁碼
 * @param {number} perPage - 每頁顯示數量
 * @returns {Promise<Array>} - 搜索結果
 */
async function searchPixabayImages(query, page = 1, perPage = 10) {
  try {
    // 檢查API是否已啟用和驗證
    if (!apiSettings.enabled || !apiSettings.verified) {
      console.log('API未啟用或未驗證，使用模擬數據');
      return useMockData(query);
    }
    
    console.log('使用Pixabay API進行搜索:', query);
    // 確保使用正確的URL格式和參數，添加image_type參數
    const url = `https://pixabay.com/api/?key=${apiSettings.apiKey}&q=${encodeURIComponent(query)}&image_type=photo&page=${page}&per_page=${perPage}`;
    console.log('搜索API URL:', url);
    
    // 直接使用XMLHttpRequest，與驗證函數保持一致
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.timeout = 15000;
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        try {
          console.log('XMLHttpRequest狀態碼:', xhr.status);
          console.log('XMLHttpRequest響應文本:', xhr.responseText.substring(0, 200) + '...');
          
          const data = JSON.parse(xhr.responseText);
          console.log('Pixabay搜索響應:', data);
          
          if (data && data.hits && Array.isArray(data.hits)) {
            resolve(data.hits.map(hit => ({
              id: hit.id,
              urls: {
                regular: hit.webformatURL,
                small: hit.previewURL
              },
              alt_description: hit.tags
            })));
          } else {
            console.error('API返回的數據格式不正確');
            resolve(useMockData(query));
          }
        } catch (error) {
          console.error('XMLHttpRequest解析錯誤:', error);
          resolve(useMockData(query));
        }
      };
      
      xhr.onerror = function() {
        console.error('XMLHttpRequest請求錯誤');
        resolve(useMockData(query));
      };
      
      xhr.ontimeout = function() {
        console.error('XMLHttpRequest請求超時');
        resolve(useMockData(query));
      };
      
      xhr.send();
    });
  } catch (error) {
    console.error('Pixabay圖片搜索錯誤:', error);
    return useMockData(query);
  }
}

/**
 * 當API調用失敗時使用模擬數據
 * @param {string} query - 搜索關鍵詞
 * @returns {Array} - 模擬的搜索結果
 */
function useMockData(query) {
  console.log('使用模擬數據替代API調用');
  // 使用預設圖片作為模擬數據
  return [
    {
      id: 'mock1',
      urls: {
        regular: 'images/mickey.jpg',
        small: 'images/mickey.jpg'
      },
      alt_description: `${query} 相關圖片 1`
    },
    {
      id: 'mock2',
      urls: {
        regular: 'images/donald.jpg',
        small: 'images/donald.jpg'
      },
      alt_description: `${query} 相關圖片 2`
    },
    {
      id: 'mock3',
      urls: {
        regular: 'images/pooh.jpg',
        small: 'images/pooh.jpg'
      },
      alt_description: `${query} 相關圖片 3`
    },
    {
      id: 'mock4',
      urls: {
        regular: 'images/elsa.jpg',
        small: 'images/elsa.jpg'
      },
      alt_description: `${query} 相關圖片 4`
    },
    {
      id: 'mock5',
      urls: {
        regular: 'images/simba.jpg',
        small: 'images/simba.jpg'
      },
      alt_description: `${query} 相關圖片 5`
    }
  ];
}

/**
 * 顯示搜索結果
 * @param {Array} images - 圖片數據
 * @param {HTMLElement} container - 顯示容器
 * @param {Function} onSelect - 選擇圖片時的回調函數
 */
function displaySearchResults(images, container, onSelect) {
  container.innerHTML = '';
  
  if (images.length === 0) {
    const noResults = document.createElement('p');
    noResults.textContent = '沒有找到相關圖片，請嘗試其他關鍵詞';
    container.appendChild(noResults);
    return;
  }
  
  images.forEach(image => {
    const imgElement = document.createElement('img');
    imgElement.src = image.urls.small;
    imgElement.alt = image.alt_description || '搜索結果圖片';
    imgElement.title = image.alt_description || '點擊選擇此圖片';
    imgElement.dataset.fullUrl = image.urls.regular;
    
    imgElement.addEventListener('click', () => {
      // 移除其他圖片的選中狀態
      container.querySelectorAll('img').forEach(img => img.classList.remove('selected'));
      // 添加選中狀態
      imgElement.classList.add('selected');
      // 調用選擇回調
      onSelect(image.urls.regular);
    });
    
    container.appendChild(imgElement);
  });
}

/**
 * 初始化圖片搜索界面
 * @param {HTMLElement} searchContainer - 搜索容器
 * @param {Function} onImageSelect - 選擇圖片時的回調函數
 */
function initImageSearch(searchContainer, onImageSelect) {
  // 創建搜索輸入框
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'image-search-input';
  searchInput.placeholder = '輸入關鍵詞搜索圖片...';
  searchInput.className = 'image-search-input';
  
  // 創建搜索按鈕
  const searchButton = document.createElement('button');
  searchButton.textContent = '搜索';
  searchButton.id = 'image-search-button';
  searchButton.className = 'image-search-button';
  
  // 創建搜索結果容器
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'image-search-results';
  resultsContainer.className = 'image-search-results';
  
  // 添加到搜索容器
  const searchForm = document.createElement('div');
  searchForm.className = 'image-search-form';
  searchForm.appendChild(searchInput);
  searchForm.appendChild(searchButton);
  
  searchContainer.appendChild(searchForm);
  searchContainer.appendChild(resultsContainer);
  
  // 添加搜索事件監聽器
  searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
      searchButton.disabled = true;
      searchButton.textContent = '搜索中...';
      
      try {
        // 嘗試使用Unsplash API
        let results = await searchImages(query);
        
        // 如果Unsplash API失敗，嘗試使用Pixabay API
        if (results.length === 0) {
          results = await searchPixabayImages(query);
        }
        
        displaySearchResults(results, resultsContainer, onImageSelect);
      } catch (error) {
        console.error('搜索失敗:', error);
        resultsContainer.innerHTML = '<p>搜索失敗，請稍後再試</p>';
      } finally {
        searchButton.disabled = false;
        searchButton.textContent = '搜索';
      }
    }
  });
  
  // 添加按Enter鍵搜索的功能
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchButton.click();
    }
  });
}