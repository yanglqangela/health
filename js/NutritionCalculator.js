class NutritionCalculator {
  static calculateDailyIntake(date) {
    const records = JSON.parse(localStorage.getItem('dietRecords')) || [];
    const dateStr = date || new Date().toISOString().slice(0, 10);
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const currentUserId = currentUser.username;
    
    const dayRecords = records.filter(r => {
      const recordDate = r.date || r.foodTime?.slice(0, 10);
      return recordDate === dateStr && r.userId === currentUserId;
    });
    
    return dayRecords.reduce((total, record) => {
      const qty = record.foodQuantity || record.quantity || 1;
      return {
        calories: total.calories + (record.foodCalories || 0) * qty,
        carbs: total.carbs + (record.foodCarbs || 0) * qty,
        protein: total.protein + (record.foodProtein || 0) * qty,
        fat: total.fat + (record.foodFat || 0) * qty
      };
    }, { calories: 0, carbs: 0, protein: 0, fat: 0 });
  }

  static getRecommendedIntake(userProfile) {
    if (!userProfile || !userProfile.age || !userProfile.weight || !userProfile.height) {
      return { calories: 2000, carbs: 250, protein: 75, fat: 67 };
    }

    const { gender, age, weight, height, activityLevel, customIntake } = userProfile;
    
    if (customIntake && customIntake.calories) {
      return customIntake;
    }

    let bmr;
    if (gender === '男') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    };

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
    
    return {
      calories: Math.round(tdee),
      carbs: Math.round(tdee * 0.55 / 4),
      protein: Math.round(tdee * 0.20 / 4),
      fat: Math.round(tdee * 0.25 / 9)
    };
  }

  static calculateNutritionScore(actual, recommended) {
    let score = 0;

    const calcScore = (actualVal, recVal, maxPoints) => {
      const ratio = actualVal / recVal;
      if (ratio >= 0.9 && ratio <= 1.1) return maxPoints;
      if (ratio >= 0.8 && ratio <= 1.2) return maxPoints * 0.7;
      if (ratio >= 0.7 && ratio <= 1.3) return maxPoints * 0.4;
      return maxPoints * 0.2;
    };

    score += calcScore(actual.calories, recommended.calories, 30);
    score += calcScore(actual.carbs, recommended.carbs, 25);
    score += calcScore(actual.protein, recommended.protein, 25);
    score += calcScore(actual.fat, recommended.fat, 20);

    return Math.round(score);
  }

  static calculateMacroRatio(carbs, protein, fat) {
    const total = (carbs * 4) + (protein * 4) + (fat * 9);
    if (total === 0) return { carbs: 0, protein: 0, fat: 0 };

    return {
      carbs: Math.round((carbs * 4 / total) * 100),
      protein: Math.round((protein * 4 / total) * 100),
      fat: Math.round((fat * 9 / total) * 100)
    };
  }

  static checkNutrientStatus(actual, recommended) {
    const status = {};
    
    ['calories', 'carbs', 'protein', 'fat'].forEach(nutrient => {
      const ratio = actual[nutrient] / recommended[nutrient];
      if (ratio < 0.7) status[nutrient] = 'low';
      else if (ratio > 1.3) status[nutrient] = 'high';
      else status[nutrient] = 'normal';
    });

    return status;
  }

  static getScoreLevel(score) {
    if (score >= 90) return { level: '优秀', color: '#4caf50' };
    if (score >= 75) return { level: '良好', color: '#8bc34a' };
    if (score >= 60) return { level: '及格', color: '#ffc107' };
    return { level: '需改善', color: '#f44336' };
  }

  static getSuggestions(score, status) {
    const suggestions = [];
    
    if (status.calories === 'low') suggestions.push('热量摄入不足，建议增加主食摄入');
    if (status.calories === 'high') suggestions.push('热量摄入过多，建议控制总量');
    if (status.protein === 'low') suggestions.push('蛋白质不足，建议增加鱼肉蛋奶');
    if (status.carbs === 'high') suggestions.push('碳水过多，建议减少精制主食');
    if (status.fat === 'high') suggestions.push('脂肪过多，建议少油烹饪');
    
    if (score < 60 && suggestions.length === 0) {
      suggestions.push('营养摄入不够均衡，建议多样化饮食');
    }

    return suggestions;
  }
}
