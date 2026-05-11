class DataInitializer {
  static async loadInitialData() {
    try {
      const response = await fetch('data/initial-data.json');
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      
      // 确保数据格式正确，支持新的导出格式
      const expectedKeys = ['users', 'dietRecords', 'healthRecords', 'healthGoals'];
      
      for (let key of expectedKeys) {
        if (data[key] && !localStorage.getItem(key)) {
          // 确保数据是数组格式
          const arrayData = Array.isArray(data[key]) ? data[key] : [];
          localStorage.setItem(key, JSON.stringify(arrayData));
        } else if (!localStorage.getItem(key)) {
          // 如果数据文件中没有该键，创建空数组
          localStorage.setItem(key, JSON.stringify([]));
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
    
    alert('数据已导出为 initial-data.json\n请将此文件放到项目的 data 文件夹中\n\n导出的数据包含：\n- 用户信息: ' + data.users.length + ' 个\n- 饮食记录: ' + data.dietRecords.length + ' 条\n- 健康记录: ' + data.healthRecords.length + ' 条\n- 健康目标: ' + data.healthGoals.length + ' 个');
  }

  static clearAndReload() {
    if (confirm('确定要清除当前数据并重新加载初始数据吗？')) {
      localStorage.clear();
      window.location.reload();
    }
  }

  static async forceReloadData() {
    if (confirm('确定要重新加载 data/initial-data.json 文件中的数据吗？\n这将覆盖当前的所有数据！')) {
      try {
        const response = await fetch('data/initial-data.json');
        if (!response.ok) {
          alert('无法加载 data/initial-data.json 文件');
          return false;
        }
        
        const data = await response.json();
        const expectedKeys = ['users', 'dietRecords', 'healthRecords', 'healthGoals'];
        
        // 清除现有数据并加载新数据
        for (let key of expectedKeys) {
          if (data[key]) {
            const arrayData = Array.isArray(data[key]) ? data[key] : [];
            localStorage.setItem(key, JSON.stringify(arrayData));
          } else {
            localStorage.setItem(key, JSON.stringify([]));
          }
        }
        
        alert('数据重新加载成功！页面将刷新。');
        window.location.reload();
        return true;
      } catch (e) {
        console.error('Error reloading data:', e);
        alert('重新加载数据时出错：' + e.message);
        return false;
      }
    }
  }
}
