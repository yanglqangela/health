class HealthTracker {
  static addHealthRecord(type, value, date) {
    const records = DataStorage.load('healthRecords') || [];
    const record = {
      id: Date.now().toString(),
      userId: (DataStorage.load('currentUser') || {}).username,
      date: date || new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      type,
      value
    };
    
    records.push(record);
    return DataStorage.save('healthRecords', records);
  }

  static getHealthHistory(type, startDate, endDate) {
    const records = DataStorage.load('healthRecords') || [];
    const userId = (DataStorage.load('currentUser') || {}).username;
    
    return records.filter(r => {
      if (r.userId !== userId) return false;
      if (type && r.type !== type) return false;
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  static calculateBMI(weight, height) {
    if (!weight || !height || height === 0) return null;
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  }

  static getBMICategory(bmi) {
    if (bmi < 18.5) return { category: '偏瘦', color: '#2196f3', risk: '营养不良风险' };
    if (bmi < 24) return { category: '正常', color: '#4caf50', risk: '健康范围' };
    if (bmi < 28) return { category: '超重', color: '#ff9800', risk: '注意控制体重' };
    return { category: '肥胖', color: '#f44336', risk: '建议减重' };
  }

  static checkHealthStatus(type, value, userProfile) {
    if (type === 'weight') {
      const bmi = this.calculateBMI(value.weight, userProfile.height);
      const category = this.getBMICategory(bmi);
      return {
        normal: category.category === '正常',
        message: `BMI: ${bmi}, ${category.category} - ${category.risk}`
      };
    }
    return { normal: true, message: '正常' };
  }

  static getHealthTrend(type, days = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    const history = this.getHealthHistory(
      type,
      startDate.toISOString().slice(0, 10),
      endDate.toISOString().slice(0, 10)
    );

    if (history.length < 2) return { trend: 'insufficient', change: 0 };

    const first = type === 'weight' ? history[0].value.weight : history[0].value;
    const last = type === 'weight' ? history[history.length - 1].value.weight : history[history.length - 1].value;
    const change = last - first;

    return {
      trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
      change: Math.round(change * 10) / 10,
      data: history
    };
  }

  static deleteHealthRecord(id) {
    const records = DataStorage.load('healthRecords') || [];
    const filtered = records.filter(r => r.id !== id);
    return DataStorage.save('healthRecords', filtered);
  }
}
