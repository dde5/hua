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
  window.open(searchUrl, '_blank');
}

/**
 * 使用模擬數據作為預設圖片
 * @param {string} query - 搜索關鍵詞
 * @returns {Array} - 模擬的搜索結果
 */
function useMockData(query) {
  console.log('使用預設圖片');
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
  
  // 創建Google搜圖按鈕
  const googleSearchButton = document.createElement('button');
  googleSearchButton.textContent = 'Google搜圖';
  googleSearchButton.id = 'google-search-button';
  googleSearchButton.className = 'google-search-button';
  
  // 創建搜索結果容器
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'image-search-results';
  resultsContainer.className = 'image-search-results';
  
  // 添加到搜索容器
  const searchForm = document.createElement('div');
  searchForm.className = 'search-form';
  searchForm.appendChild(searchInput);
  
  // 移除搜索按鈕，因為它沒有特別作用
  
  // 添加Google搜圖按鈕到表單
  searchForm.appendChild(googleSearchButton);
  
  // 添加表單和結果容器到搜索容器
  searchContainer.appendChild(searchForm);
  searchContainer.appendChild(resultsContainer);
  
  // 移除搜索按鈕點擊事件，因為我們已經移除了搜索按鈕
  
  // 添加按Enter鍵觸發Google搜圖的功能
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      openGoogleImageSearch(query);
    }
  });
  
  // 添加Google搜圖按鈕點擊事件
  googleSearchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    openGoogleImageSearch(query);
  });
}