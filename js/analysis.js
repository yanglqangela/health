// Check if viewing another user's data (from admin panel)
const urlParams = new URLSearchParams(window.location.search);
const viewingUsername = urlParams.get('user');

let currentUser;
if (viewingUsername) {
  // Admin viewing another user's data
  const adminUser = DataStorage.load('currentUser') || {};
  if (!adminUser.isAdmin) {
    alert('无权限查看其他用户数据');
    window.location.href = 'index.html';
  }
  // Load the target user's data
  const users = DataStorage.load('users') || [];
  currentUser = users.find(u => u.username === viewingUsername);
  if (!currentUser) {
    alert('用户不存在');
    window.location.href = 'admin.html';
  }
} else {
  // Normal user viewing their own data
  currentUser = DataStorage.load('currentUser') || {};
  if (!currentUser.username) {
    window.location.href = 'login.html';
  }
}

const dateInput = document.getElementById('analysisDate');
dateInput.value = new Date().toISOString().slice(0, 10);
dateInput.addEventListener('change', loadAnalysis);

// Show viewing info if admin is viewing another user
if (viewingUsername) {
  const banner = document.querySelector('.analysis-banner');
  const viewingInfo = document.createElement('div');
  viewingInfo.className = 'alert alert-info mt-3';
  viewingInfo.innerHTML = `
    <strong>正在查看用户：</strong>${viewingUsername}
    <a href="admin.html" class="btn btn-sm btn-secondary float-end">返回后台管理</a>
  `;
  banner.parentNode.insertBefore(viewingInfo, banner.nextSibling);
}

let macroChartInstance = null;
let weeklyChartInstance = null;

function loadAnalysis() {
  const date = dateInput.value;
  const username = currentUser.username;
  const actual = NutritionCalculator.calculateDailyIntake(date, username);
  const recommended = NutritionCalculator.getRecommendedIntake(currentUser);
  const score = NutritionCalculator.calculateNutritionScore(actual, recommended);
  const status = NutritionCalculator.checkNutrientStatus(actual, recommended);
  const scoreInfo = NutritionCalculator.getScoreLevel(score);
  const suggestions = NutritionCalculator.getSuggestions(score, status);

  displayScore(score, scoreInfo);
  displayNutrientComparison(actual, recommended, status);
  displaySuggestions(suggestions);
  displayMacroChart(actual);
  displayWeeklyChart();
}

function displayScore(score, scoreInfo) {
  const circle = document.getElementById('scoreCircle');
  const level = document.getElementById('scoreLevel');
  
  circle.textContent = score;
  circle.style.backgroundColor = scoreInfo.color;
  level.textContent = scoreInfo.level;
  level.style.color = scoreInfo.color;
}

function displayNutrientComparison(actual, recommended, status) {
  const container = document.getElementById('nutrientComparison');
  const nutrients = [
    { name: '热量', key: 'calories', unit: 'kcal' },
    { name: '碳水化合物', key: 'carbs', unit: 'g' },
    { name: '蛋白质', key: 'protein', unit: 'g' },
    { name: '脂肪', key: 'fat', unit: 'g' }
  ];

  let html = '';
  nutrients.forEach(n => {
    const actualVal = actual[n.key];
    const recVal = recommended[n.key];
    const percentage = recVal > 0 ? Math.round((actualVal / recVal) * 100) : 0;
    const statusText = status[n.key];
    const statusColor = statusText === 'normal' ? '#4caf50' : statusText === 'low' ? '#2196f3' : '#f44336';
    const statusLabel = statusText === 'normal' ? '正常' : statusText === 'low' ? '偏低' : '偏高';

    html += `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span>${n.name}: ${actualVal} / ${recVal} ${n.unit}</span>
          <span class="status-badge" style="background: ${statusColor}; color: white;">${statusLabel} ${percentage}%</span>
        </div>
        <div class="nutrient-bar">
          <div class="nutrient-fill" style="width: ${Math.min(percentage, 100)}%; background: ${statusColor};"></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function displaySuggestions(suggestions) {
  const list = document.getElementById('suggestionsList');
  if (suggestions.length === 0) {
    list.innerHTML = '<li>您的营养摄入很均衡，继续保持！</li>';
  } else {
    list.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
  }
}

function displayMacroChart(actual) {
  const ctx = document.getElementById('macroChart');
  const ratio = NutritionCalculator.calculateMacroRatio(actual.carbs, actual.protein, actual.fat);

  if (macroChartInstance) {
    macroChartInstance.destroy();
  }

  macroChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['碳水化合物', '蛋白质', '脂肪'],
      datasets: [{
        data: [ratio.carbs, ratio.protein, ratio.fat],
        backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed}%`
          }
        }
      }
    }
  });
}

function displayWeeklyChart() {
  const ctx = document.getElementById('weeklyChart');
  const today = new Date();
  const labels = [];
  const data = [];
  const username = currentUser.username;

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    labels.push(dateStr.slice(5));
    const intake = NutritionCalculator.calculateDailyIntake(dateStr, username);
    data.push(intake.calories);
  }

  const recommended = NutritionCalculator.getRecommendedIntake(currentUser);

  if (weeklyChartInstance) {
    weeklyChartInstance.destroy();
  }

  weeklyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '实际摄入',
        data,
        backgroundColor: '#66bb6a'
      }, {
        label: '推荐摄入',
        data: Array(7).fill(recommended.calories),
        type: 'line',
        borderColor: '#f44336',
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: '热量 (kcal)' }
        }
      }
    }
  });
}

loadAnalysis();
