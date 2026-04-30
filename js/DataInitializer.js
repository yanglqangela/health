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
          localStorage.setItem(key, data[key]);
        }
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }

  static exportCurrentData() {
    const data = {};
    const keys = ['users', 'dietRecords', 'healthRecords', 'healthGoals', 'currentUser'];
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        data[key] = value;
      }
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
