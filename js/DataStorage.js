class DataStorage {
  static save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('存储空间已满，请导出数据后清理');
      }
      return false;
    }
  }

  static load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static checkStorageCapacity() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    const usedMB = (total / 1024 / 1024).toFixed(2);
    const limitMB = 5;
    const percentage = (usedMB / limitMB * 100).toFixed(1);
    
    return { usedMB, limitMB, percentage };
  }

  static exportAllData() {
    const data = {};
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        data[key] = localStorage[key];
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static importData(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      let imported = 0;
      
      for (let key in data) {
        try {
          localStorage.setItem(key, data[key]);
          imported++;
        } catch (e) {
          console.error(`Failed to import ${key}`);
        }
      }
      
      return { success: true, imported };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  static clearAllData() {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      localStorage.clear();
      return true;
    }
    return false;
  }
}
