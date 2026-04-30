const currentUser = DataStorage.load('currentUser') || {};
if (!currentUser.username) {
  window.location.href = 'login.html';
}

document.getElementById('weightDate').value = new Date().toISOString().slice(0, 10);

document.getElementById('weightForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const date = document.getElementById('weightDate').value;
  const weight = parseFloat(document.getElementById('weightValue').value);
  
  const bmi = currentUser.height ? HealthTracker.calculateBMI(weight, currentUser.height) : null;
  HealthTracker.addHealthRecord('weight', { weight, bmi, unit: 'kg' }, date);
  
  this.reset();
  document.getElementById('weightDate').value = new Date().toISOString().slice(0, 10);
  
  loadHealthData();
  alert('保存成功！');
});

function loadHealthData() {
  updateBMI();
  loadWeightChart();
  loadHistoryTable();
}

function updateBMI() {
  if (!currentUser.height) {
    document.getElementById('bmiDisplay').textContent = '--';
    document.getElementById('bmiCategory').textContent = '请先在个人中心设置身高';
    return;
  }

  const history = HealthTracker.getHealthHistory('weight');
  if (history.length === 0) {
    document.getElementById('bmiDisplay').textContent = '--';
    document.getElementById('bmiCategory').textContent = '暂无体重记录';
    return;
  }

  const latest = history[history.length - 1];
  const bmi = HealthTracker.calculateBMI(latest.value.weight, currentUser.height);
  const category = HealthTracker.getBMICategory(bmi);

  document.getElementById('bmiDisplay').textContent = bmi;
  document.getElementById('bmiDisplay').style.backgroundColor = category.color;
  document.getElementById('bmiDisplay').style.color = 'white';
  document.getElementById('bmiCategory').textContent = category.category;
  document.getElementById('bmiRisk').textContent = category.risk;
}

function loadWeightChart() {
  const history = HealthTracker.getHealthHistory('weight');
  if (history.length === 0) return;

  const labels = history.map(h => h.date.slice(5));
  const data = history.map(h => h.value.weight);

  ChartManager.createLineChart('weightChart', labels, [{
    label: '体重 (kg)',
    data,
    borderColor: '#42a5f5',
    backgroundColor: 'rgba(66, 165, 245, 0.1)',
    fill: true,
    tension: 0.4
  }]);
}

function loadHistoryTable() {
  const tbody = document.getElementById('historyTable');
  const history = HealthTracker.getHealthHistory('weight');
  
  if (history.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">暂无记录</td></tr>';
    return;
  }

  tbody.innerHTML = history.reverse().map(record => {
    const bmi = HealthTracker.calculateBMI(record.value.weight, currentUser.height);
    const category = HealthTracker.getBMICategory(bmi);
    
    return `
      <tr>
        <td>${record.date}</td>
        <td>${record.value.weight}</td>
        <td>${bmi || '--'}</td>
        <td><span style="color: ${category.color}">${category.category}</span></td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteRecord('${record.id}')">删除</button></td>
      </tr>
    `;
  }).join('');
}

function deleteRecord(id) {
  if (confirm('确定要删除这条记录吗？')) {
    HealthTracker.deleteHealthRecord(id);
    loadHealthData();
  }
}

loadHealthData();
