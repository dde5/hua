/**
 * 緩存管理工具
 * 用於管理localStorage中的圖片緩存，處理配額超出問題
 */

// 緩存使用記錄的鍵名
const CACHE_USAGE_RECORD_KEY = 'img_cache_usage_record';

// 最大緩存項數量（可根據需要調整）
const MAX_CACHE_ITEMS = 20;

/**
 * 更新緩存使用記錄
 * @param {string} cacheKey - 緩存鍵
 */
function updateCacheUsageRecord(cacheKey) {
  try {
    // 獲取現有的使用記錄
    let usageRecord = JSON.parse(localStorage.getItem(CACHE_USAGE_RECORD_KEY) || '[]');
    
    // 檢查該鍵是否已存在於記錄中
    const existingIndex = usageRecord.findIndex(record => record.key === cacheKey);
    
    // 當前時間戳
    const timestamp = Date.now();
    
    if (existingIndex >= 0) {
      // 如果已存在，更新時間戳
      usageRecord[existingIndex].timestamp = timestamp;
    } else {
      // 如果不存在，添加新記錄
      usageRecord.push({
        key: cacheKey,
        timestamp: timestamp
      });
    }
    
    // 保存更新後的記錄
    localStorage.setItem(CACHE_USAGE_RECORD_KEY, JSON.stringify(usageRecord));
  } catch (error) {
    console.error('更新緩存使用記錄失敗:', error);
  }
}

/**
 * 清理最舊的緩存項
 * @returns {boolean} - 是否成功清理
 */
function clearOldestCache() {
  try {
    // 獲取使用記錄
    let usageRecord = JSON.parse(localStorage.getItem(CACHE_USAGE_RECORD_KEY) || '[]');
    
    if (usageRecord.length === 0) {
      console.warn('沒有緩存使用記錄，無法清理');
      return false;
    }
    
    // 按時間戳排序（最舊的在前）
    usageRecord.sort((a, b) => a.timestamp - b.timestamp);
    
    // 取出最舊的記錄
    const oldestRecord = usageRecord.shift();
    
    // 從localStorage中移除該緩存
    localStorage.removeItem(oldestRecord.key);
    console.log('已清理最舊的緩存:', oldestRecord.key);
    
    // 更新使用記錄
    localStorage.setItem(CACHE_USAGE_RECORD_KEY, JSON.stringify(usageRecord));
    
    return true;
  } catch (error) {
    console.error('清理最舊緩存失敗:', error);
    return false;
  }
}

/**
 * 清理多個舊緩存項
 * @param {number} count - 要清理的緩存項數量
 * @returns {number} - 實際清理的緩存項數量
 */
function clearMultipleOldCache(count = 3) {
  let clearedCount = 0;
  
  for (let i = 0; i < count; i++) {
    if (clearOldestCache()) {
      clearedCount++;
    } else {
      break; // 如果清理失敗，停止繼續清理
    }
  }
  
  return clearedCount;
}

/**
 * 檢查緩存數量並在必要時進行清理
 */
function checkAndCleanCache() {
  try {
    // 獲取使用記錄
    let usageRecord = JSON.parse(localStorage.getItem(CACHE_USAGE_RECORD_KEY) || '[]');
    
    // 如果緩存項數量接近最大值，主動清理一些舊緩存
    if (usageRecord.length > MAX_CACHE_ITEMS * 0.8) {
      console.log('緩存項數量接近上限，主動清理...');
      // 清理約20%的舊緩存
      const cleanCount = Math.ceil(MAX_CACHE_ITEMS * 0.2);
      clearMultipleOldCache(cleanCount);
    }
  } catch (error) {
    console.error('檢查緩存狀態失敗:', error);
  }
}

/**
 * 獲取當前緩存使用情況
 * @returns {Object} - 緩存使用情況
 */
function getCacheUsageInfo() {
  try {
    // 獲取使用記錄
    let usageRecord = JSON.parse(localStorage.getItem(CACHE_USAGE_RECORD_KEY) || '[]');
    
    // 計算緩存大小（粗略估計）
    let totalSize = 0;
    for (const record of usageRecord) {
      const item = localStorage.getItem(record.key);
      if (item) {
        totalSize += item.length * 2; // 每個字符約2字節
      }
    }
    
    return {
      itemCount: usageRecord.length,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    console.error('獲取緩存使用情況失敗:', error);
    return { itemCount: 0, totalSizeBytes: 0, totalSizeMB: '0.00' };
  }
}

// 導出函數
window.updateCacheUsageRecord = updateCacheUsageRecord;
window.clearOldestCache = clearOldestCache;
window.clearMultipleOldCache = clearMultipleOldCache;
window.checkAndCleanCache = checkAndCleanCache;
window.getCacheUsageInfo = getCacheUsageInfo;