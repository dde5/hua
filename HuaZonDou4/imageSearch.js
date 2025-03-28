// 圖片處理工具

/**
 * 獲取圖片名稱
 * @param {string} imagePath - 圖片路徑
 * @returns {string} - 圖片名稱
 */
function getImageName(imagePath) {
  if (!imagePath) return '';
  
  // 先檢查是否為預設圖片
  // 獲取預設圖片列表
  const presetImgs = getPresetImages();
  const presetImg = presetImgs.find(img => img.url === imagePath);
  if (presetImg) {
    // 如果是預設圖片，直接返回其ID
    return presetImg.id;
  }
  
  // 從圖片路徑中提取圖片名稱
  const match = imagePath.match(/images\/([^.]+)\./i);
  if (match && match[1]) {
    return match[1];
  } else if (imagePath.startsWith('http')) {
    // 嘗試從URL中提取文件名
    const urlParts = imagePath.split('/');
    const fileName = urlParts[urlParts.length - 1].split('.')[0];
    return 'net_' + (fileName || new Date().getTime());
  } else if (imagePath.startsWith('data:')) {
    // 如果是自定義上傳圖片（Data URL格式），使用固定前綴加時間戳
    return 'custom_' + new Date().getTime();
  } else {
    // 其他情況，使用時間戳作為唯一識別符
    return 'custom_' + new Date().getTime();
  }
}

/**
 * 獲取預設圖片列表
 * @returns {Array} - 預設圖片列表
 */
function getPresetImages() {
  console.log('獲取預設圖片');
  // 獲取當前頁面的基礎URL，確保圖片路徑是絕對路徑
  let baseUrl = '';
  
  // 檢查是否為file://協議
  if (window.location.protocol === 'file:') {
    // 對於本地文件，直接使用相對路徑
    baseUrl = '';
    console.log('檢測到本地文件協議，使用相對路徑');
  } else {
    // 對於http/https協議，使用完整的基礎URL
    baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    console.log('基礎URL:', baseUrl);
  }
  
  // 預設圖片分類
  const imageCategories = {
    landscape: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'],
    animal: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'],
    portrait: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
    art: ['M1', 'M2', 'M3', 'M4', 'M5']
  };
  
  // 將所有圖片合併為一個列表
  const allImages = [];
  for (const category in imageCategories) {
    imageCategories[category].forEach(img => {
      allImages.push({
        id: img,
        name: img,
        url: baseUrl + 'images/' + img + '.jpg',
        title: img,  // 使用圖片名稱作為title
        alt: img     // 使用圖片名稱作為alt
      });
    });
  }
  
  return allImages;
}

/**
 * 顯示預設圖片列表
 * @param {Array} images - 圖片數據
 * @param {HTMLElement} container - 顯示容器
 * @param {Function} onSelect - 選擇圖片時的回調函數
 */
function displayPresetImages(images, container, onSelect) {
  container.innerHTML = '';
  
  if (images.length === 0) {
    const noResults = document.createElement('p');
    noResults.textContent = '沒有可用的圖片';
    container.appendChild(noResults);
    return;
  }
  
  images.forEach(image => {
    const imgElement = document.createElement('img');
    imgElement.src = image.url;
    imgElement.alt = image.alt || image.name;
    imgElement.title = image.title || image.name;
    imgElement.dataset.fullUrl = image.url;
    
    imgElement.addEventListener('click', () => {
      // 移除其他圖片的選中狀態
      container.querySelectorAll('img').forEach(img => img.classList.remove('selected'));
      // 添加選中狀態
      imgElement.classList.add('selected');
      // 調用選擇回調
      onSelect(image.url);
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
 * 初始化圖片選擇界面
 * @param {HTMLElement} container - 圖片容器
 * @param {Function} onImageSelect - 選擇圖片時的回調函數
 */
function initImageSelection(container, onImageSelect) {
  // 獲取預設圖片列表
  const presetImages = getPresetImages();
  
  // 顯示預設圖片
  displayPresetImages(presetImages, container, (imageUrl) => {
    // 調用選擇回調，將圖片URL傳遞給遊戲
    onImageSelect(imageUrl);
  });
}
