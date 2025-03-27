// 網路圖片搜索工具

/**
 * 使用Google搜索圖片
 * @param {string} query - 搜索關鍵詞
 * @returns {string} - Google搜索URL
 */
function getGoogleImageSearchUrl(query) {
  // 使用encodeURIComponent處理查詢參數，避免特殊字符問題
  return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
}

/**
 * 當用戶選擇使用Google搜索圖片
 * @param {string} query - 搜索關鍵詞
 */
function openGoogleImageSearch(query) {
  if (!query || query.trim() === '') {
    alert('請輸入搜索關鍵詞');
    return;
  }
  
  // 打開新窗口進行Google圖片搜索
  const searchUrl = getGoogleImageSearchUrl(query);
  const googleWindow = window.open(searchUrl, '_blank');
  
  // 提示用戶如何使用Google搜圖功能
  alert('請在Google圖片中選擇您想要的圖片，然後右鍵選擇「複製圖片地址」，再回到遊戲點擊「使用Google圖片」按鈕');
  
  // 創建一個全局變量來存儲Google圖片URL
  window.googleImageUrl = '';
}

/**
 * 使用模擬數據作為預設圖片
 * @param {string} query - 搜索關鍵詞
 * @returns {Array} - 模擬的搜索結果
 */
function useMockData(query) {
  console.log('使用預設圖片');
  // 獲取當前頁面的基礎URL，確保圖片路徑是絕對路徑
  const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
  console.log('基礎URL:', baseUrl);
  
  // 使用實際存在的預設圖片作為模擬數據，使用絕對路徑
  return [
    {
      id: 'C1',
      urls: {
        regular: baseUrl + 'images/C1.jpg',
        small: baseUrl + 'images/C1.jpg'
      },
      alt_description: `${query} 相關圖片 - C1`
    },
    {
      id: 'C2',
      urls: {
        regular: baseUrl + 'images/C2.jpg',
        small: baseUrl + 'images/C2.jpg'
      },
      alt_description: `${query} 相關圖片 - C2`
    },
    {
      id: 'E1',
      urls: {
        regular: baseUrl + 'images/E1.jpg',
        small: baseUrl + 'images/E1.jpg'
      },
      alt_description: `${query} 相關圖片 - E1`
    },
    {
      id: 'E2',
      urls: {
        regular: baseUrl + 'images/E2.jpg',
        small: baseUrl + 'images/E2.jpg'
      },
      alt_description: `${query} 相關圖片 - E2`
    },
    {
      id: 'M1',
      urls: {
        regular: baseUrl + 'images/M1.jpg',
        small: baseUrl + 'images/M1.jpg'
      },
      alt_description: `${query} 相關圖片 - M1`
    },
    {
      id: 'M2',
      urls: {
        regular: baseUrl + 'images/M2.jpg',
        small: baseUrl + 'images/M2.jpg'
      },
      alt_description: `${query} 相關圖片 - M2`
    },
    {
      id: 'H1',
      urls: {
        regular: baseUrl + 'images/H1.jpg',
        small: baseUrl + 'images/H1.jpg'
      },
      alt_description: `${query} 相關圖片 - H1`
    },
    {
      id: 'H2',
      urls: {
        regular: baseUrl + 'images/H2.jpg',
        small: baseUrl + 'images/H2.jpg'
      },
      alt_description: `${query} 相關圖片 - H2`
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
 * 檢查圖片是否可以載入
 * @param {string} url - 圖片URL
 * @returns {Promise<boolean>} - 圖片是否可載入
 */
function checkImageLoadable(url) {
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
}

/**
 * 搜索Google圖片並直接顯示結果
 * @param {string} query - 搜索關鍵詞
 * @param {HTMLElement} resultsContainer - 結果顯示容器
 * @param {Function} onSelect - 選擇圖片時的回調函數
 */
async function searchGoogleImages(query, resultsContainer, onSelect) {
  if (!query || query.trim() === '') {
    alert('請輸入搜索關鍵詞');
    return;
  }
  
  // 顯示載入中提示
  resultsContainer.innerHTML = '<p>正在搜索圖片，請稍候...</p>';
  
  try {
    // 使用模擬數據作為搜索結果
    const mockResults = useMockData(query);
    
    // 篩選出可載入的圖片
    const loadableImages = [];
    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = '正在檢查圖片可用性，請稍候...';
    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(loadingMessage);
    
    // 檢查每張圖片是否可載入
    for (const image of mockResults) {
      const isLoadable = await checkImageLoadable(image.urls.regular);
      if (isLoadable) {
        loadableImages.push(image);
      }
    }
    
    // 顯示可載入的圖片
    displaySearchResults(loadableImages, resultsContainer, onSelect);
    
    if (loadableImages.length === 0) {
      resultsContainer.innerHTML = '<p>沒有找到可用的圖片，請嘗試其他關鍵詞</p>';
    }
  } catch (error) {
    console.error('搜索圖片時發生錯誤:', error);
    resultsContainer.innerHTML = '<p>搜索圖片時發生錯誤，請重試</p>';
  }
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
  searchButton.textContent = '搜索圖片';
  searchButton.id = 'search-button';
  searchButton.className = 'search-button';
  
  // 創建搜索結果容器
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'image-search-results';
  resultsContainer.className = 'image-search-results';
  
  // 添加到搜索容器
  const searchForm = document.createElement('div');
  searchForm.className = 'search-form';
  searchForm.appendChild(searchInput);
  searchForm.appendChild(searchButton);
  
  // 添加表單和結果容器到搜索容器
  searchContainer.appendChild(searchForm);
  searchContainer.appendChild(resultsContainer);
  
  // 添加按Enter鍵觸發搜索的功能
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      searchGoogleImages(query, resultsContainer, (imageUrl) => {
        // 確認是否使用此圖片進入遊戲
        if (confirm('確定要使用此圖片進入遊戲嗎？')) {
          // 調用選擇回調，將圖片URL傳遞給遊戲
          onImageSelect(imageUrl);
          
          // 自動點擊開始遊戲按鈕
          document.getElementById('start-game').click();
        }
      });
    }
  });
  
  // 添加搜索按鈕點擊事件
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    searchGoogleImages(query, resultsContainer, (imageUrl) => {
      // 確認是否使用此圖片進入遊戲
      if (confirm('確定要使用此圖片進入遊戲嗎？')) {
        // 調用選擇回調，將圖片URL傳遞給遊戲
        onImageSelect(imageUrl);
        
        // 自動點擊開始遊戲按鈕
        document.getElementById('start-game').click();
      }
    });
  });
}

/**
 * 還原Google圖片網址，去除無效資訊
 * @param {string} url - 原始URL
 * @returns {string} - 還原後的URL
 */
function 還原圖片網址(url) {
  try {
    // 處理 Google Images 連結
    if (url.startsWith("https://www.google.com/imgres")) {
      const urlParams = new URLSearchParams(new URL(url).search);
      const imgurl = urlParams.get('imgurl');
      if (imgurl) {
        return imgurl;
      }
    }
    // 處理 Google 網址重定向
    else if (url.startsWith("https://www.google.com/url?sa=i") || url.includes("google.com/url")) {
      const urlParams = new URLSearchParams(new URL(url).search);
      const targetUrl = urlParams.get('url') || urlParams.get('q');
      if (targetUrl) {
        return targetUrl;
      }
    }
    // 處理 Google 圖片搜索結果
    else if (url.includes("googleusercontent.com")) {
      return url; // 直接返回 Google 圖片 CDN 的 URL
    }
    // 處理 iStockphoto 連結
    else if (url.startsWith("https://www.istockphoto.com")) {
      return url; // 直接返回 iStockphoto URL
    }
    // 處理其他常見圖片網站
    else if (url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png") || url.includes(".gif") || url.includes(".webp")) {
      return url; // 如果 URL 包含常見圖片擴展名，直接返回
    }
    // 如果都不是以上幾種，直接返回原始 URL (不做任何處理)
    return url;
  } catch (error) {
    // 處理 URL 解析錯誤等情況
    console.error("處理 URL 時發生錯誤:", error);
    return url; // 返回原始URL，而不是錯誤訊息
  }
}
