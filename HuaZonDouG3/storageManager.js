// 存儲管理器 - 處理不同環境下的資料存儲

/**
 * 存儲管理器 - 提供跨環境的資料存儲解決方案
 * 在本地環境使用localStorage，在網路環境下使用sessionStorage作為備選
 */
const StorageManager = {
  // 內存存儲作為最後的備選
  _memoryStorage: {},
  /**
   * 設置資料到存儲
   * @param {string} key - 存儲鍵名
   * @param {any} value - 要存儲的值
   */
  setItem: function(key, value) {
    let storageSuccess = false;
    
    try {
      // 嘗試使用localStorage
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`資料已存儲到localStorage: ${key}`);
      storageSuccess = true;
    } catch (e) {
      console.warn(`localStorage存儲失敗: ${e.message}，嘗試使用sessionStorage`);
      try {
        // 如果localStorage失敗，嘗試使用sessionStorage
        sessionStorage.setItem(key, JSON.stringify(value));
        console.log(`資料已存儲到sessionStorage: ${key}`);
        storageSuccess = true;
      } catch (e2) {
        console.error(`所有存儲方式都失敗: ${e2.message}`);
      }
    }
    
    // 如果所有存儲方式都失敗，嘗試使用內存存儲作為最後的備選
    if (!storageSuccess) {
      console.warn(`嘗試使用內存存儲作為備選`);
      if (!this._memoryStorage) {
        this._memoryStorage = {};
      }
      this._memoryStorage[key] = value;
      console.log(`資料已存儲到內存: ${key}`);
    }
  },

  /**
   * 從存儲中獲取資料
   * @param {string} key - 存儲鍵名
   * @param {any} defaultValue - 如果沒有找到資料時的預設值
   * @returns {any} - 存儲的資料或預設值
   */
  getItem: function(key, defaultValue = null) {
    let data = null;
    let localStorageSuccess = false;
    
    // 先嘗試從localStorage獲取
    try {
      data = localStorage.getItem(key);
      if (data !== null) {
        console.log(`從localStorage獲取資料: ${key}`);
        localStorageSuccess = true;
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn(`從localStorage獲取資料失敗: ${e.message}`);
    }
    
    // 如果localStorage沒有或失敗，嘗試從sessionStorage獲取
    try {
      data = sessionStorage.getItem(key);
      if (data !== null) {
        console.log(`從sessionStorage獲取資料: ${key}`);
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn(`從sessionStorage獲取資料失敗: ${e.message}`);
    }
    
    // 如果Web存儲都失敗，嘗試從內存存儲獲取
    if (this._memoryStorage && this._memoryStorage[key] !== undefined) {
      console.log(`從內存存儲獲取資料: ${key}`);
      return this._memoryStorage[key];
    }
    
    // 如果都沒有找到，返回預設值
    console.log(`未找到資料: ${key}，返回預設值`);
    return defaultValue;
  },

  /**
   * 從存儲中移除資料
   * @param {string} key - 要移除的存儲鍵名
   */
  removeItem: function(key) {
    try {
      localStorage.removeItem(key);
      console.log(`從localStorage移除資料: ${key}`);
    } catch (e) {
      console.warn(`從localStorage移除資料失敗: ${e.message}`);
    }
    
    try {
      sessionStorage.removeItem(key);
      console.log(`從sessionStorage移除資料: ${key}`);
    } catch (e) {
      console.warn(`從sessionStorage移除資料失敗: ${e.message}`);
    }
    
    // 從內存存儲中移除
    if (this._memoryStorage && this._memoryStorage[key] !== undefined) {
      delete this._memoryStorage[key];
      console.log(`從內存存儲移除資料: ${key}`);
    }
  }
};