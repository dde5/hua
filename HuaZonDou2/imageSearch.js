// 網路圖片搜索工具

/**
 * 使用Unsplash API搜索圖片
 * @param {string} query - 搜索關鍵詞
 * @param {number} page - 頁碼
 * @param {number} perPage - 每頁顯示數量
 * @returns {Promise<Array>} - 搜索結果
 */
async function searchImages(query, page = 1, perPage = 10) {
  try {
    // 由於API密鑰問題，直接使用模擬數據
    console.log('使用模擬數據進行搜索:', query);
    return useMockData(query);
    
    // 以下代碼在有有效API密鑰時可以啟用
    /*
    const accessKey = 'YOUR_UNSPLASH_ACCESS_KEY'; // 需要替換為真實的API密鑰
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`搜索失敗: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
    */
  } catch (error) {
    console.error('圖片搜索錯誤:', error);
    // 如果API調用失敗，使用模擬數據
    return useMockData(query);
  }
}

/**
 * 使用Pixabay API搜索圖片（備用方案）
 * @param {string} query - 搜索關鍵詞
 * @param {number} page - 頁碼
 * @param {number} perPage - 每頁顯示數量
 * @returns {Promise<Array>} - 搜索結果
 */
async function searchPixabayImages(query, page = 1, perPage = 10) {
  try {
    // 由於API密鑰問題，直接使用模擬數據
    console.log('使用模擬數據進行搜索 (Pixabay):', query);
    return useMockData(query);
    
    // 以下代碼在有有效API密鑰時可以啟用
    // /* API KEY 不能用時刪掉前面//
    const apiKey = '49472016-4b5a8b33b9749687471ba622f'; // 需要替換為真實的API密鑰
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`搜索失敗: ${response.status}`);
    }
    
    const data = await response.json();
    return data.hits.map(hit => ({
      id: hit.id,
      urls: {
        regular: hit.webformatURL,
        small: hit.previewURL
      },
      alt_description: hit.tags
    }));
    // */ API KEY 不能用時刪掉前面//
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