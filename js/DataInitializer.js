class DataInitializer {
  static async loadInitialData() {
    try {
      const response = await fetch('data/initial-data.json');
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      
      for (let key in data) {
        if (!localStorage.getItem(key)) {
          // Convert array to JSON string for localStorage
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      }
      
      return true;
    } catch (e) {
      console.error('Error loading initial data:', e);
      return false;
    }
  }

  static exportCurrentData() {
    const data = {};
    const keys = ['users', 'dietRecords', 'healthRecords', 'healthGoals'];
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          // 解析JSON字符串为对象，而不是直接使用字符串
          data[key] = JSON.parse(value);
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
          data[key] = [];
        }
      } else {
        data[key] = [];
      }
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json;charset=utf-8' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'initial-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('数据已导出为 initial-data.json\n请将此文件放到项目的 data 文件夹中');
  }

  static clearAndReload() {
    if (confirm('确定要清除当前数据并重新加载初始数据吗？')) {
      localStorage.clear();
      window.location.reload();
    }
  }
}
