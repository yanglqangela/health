const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
if (!currentUser.isAdmin) {
  alert('你没有权限访问该页面');
  window.location.href = 'index.html';
}

let currentViewUsername = null;

function showUserList() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const dietRecords = JSON.parse(localStorage.getItem('dietRecords')) || [];
  const healthRecords = JSON.parse(localStorage.getItem('healthRecords')) || [];
  const healthGoals = JSON.parse(localStorage.getItem('healthGoals')) || [];

  let html = '<div class="row">';
  
  users.forEach(user => {
    const userDietCount = dietRecords.filter(r => r.userId === user.username).length;
    const userHealthCount = healthRecords.filter(r => r.userId === user.username).length;
    const userGoalCount = healthGoals.filter(g => g.userId === user.username).length;
    
    html += `
      <div class="col-md-4 mb-3">
        <div class="card" style="cursor: pointer;" onclick="viewUserData('${user.username}')">
          <div class="card-body">
            <h5 class="card-title">${user.username}</h5>
            <p class="card-text">
              <small class="text-muted">
                ${user.isAdmin ? '<span class="badge bg-danger">管理员</span>' : '<span class="badge bg-primary">普通用户</span>'}
              </small>
            </p>
            <ul class="list-unstyled">
              <li>饮食记录: ${userDietCount} 条</li>
              <li>健康记录: ${userHealthCount} 条</li>
              <li>健康目标: ${userGoalCount} 个</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  document.getElementById('userList').innerHTML = html;
  document.getElementById('userDetailSection').style.display = 'none';
  document.getElementById('userListSection').style.display = 'block';
  document.getElementById('dataManagerSection').style.display = 'none';
}

function viewUserData(username) {
  currentViewUsername = username;
  document.getElementById('currentViewUser').textContent = username;
  document.getElementById('userListSection').style.display = 'none';
  document.getElementById('userDetailSection').style.display = 'block';
  
  viewUserDietRecords(username);
}

function viewUserDietRecords(username) {
  const records = JSON.parse(localStorage.getItem('dietRecords')) || [];
  const userRecords = records.filter(r => r.userId === username);
  
  let html = `<h5>饮食记录 (共${userRecords.length}条)</h5>`;
  
  if (userRecords.length === 0) {
    html += '<p class="text-muted">暂无饮食记录</p>';
  } else {
    html += `
      <table class="table table-bordered table-striped">
        <thead class="table-light">
          <tr>
            <th>日期</th>
            <th>时间</th>
            <th>食物名称</th>
            <th>热量(kcal)</th>
            <th>碳水(g)</th>
            <th>蛋白质(g)</th>
            <th>脂肪(g)</th>
            <th>数量</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    userRecords.forEach(record => {
      const date = record.date || new Date().toISOString().slice(0, 10);
      html += `
        <tr>
          <td>${date}</td>
          <td>${record.foodTime || '--'}</td>
          <td>${record.foodName}</td>
          <td>${record.foodCalories}</td>
          <td>${record.foodCarbs}</td>
          <td>${record.foodProtein}</td>
          <td>${record.foodFat}</td>
          <td>${record.foodQuantity}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
  }
  
  document.getElementById('dietRecordsTable').innerHTML = html;
  
  if (userRecords.length > 0) {
    generateUserDietChart(userRecords);
  } else {
    document.getElementById('dietChart').innerHTML = '';
  }
}

function generateUserDietChart(records) {
  const dailyTotals = {};
  
  records.forEach(record => {
    const date = record.date || new Date().toISOString().slice(0, 10);
    
    if (!dailyTotals[date]) {
      dailyTotals[date] = { calories: 0, carbs: 0, protein: 0, fat: 0 };
    }
    
    dailyTotals[date].calories += record.foodCalories * record.foodQuantity;
    dailyTotals[date].carbs += record.foodCarbs * record.foodQuantity;
    dailyTotals[date].protein += record.foodProtein * record.foodQuantity;
    dailyTotals[date].fat += record.foodFat * record.foodQuantity;
  });
  
  const chartDiv = document.getElementById('dietChart');
  chartDiv.innerHTML = '<canvas id="userDietChart"></canvas>';
  const ctx = document.getElementById('userDietChart').getContext('2d');
  
  const labels = Object.keys(dailyTotals).sort();
  const caloriesData = labels.map(date => dailyTotals[date].calories);
  const carbsData = labels.map(date => dailyTotals[date].carbs);
  const proteinData = labels.map(date => dailyTotals[date].protein);
  const fatData = labels.map(date => dailyTotals[date].fat);
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '热量 (kcal)',
          data: caloriesData,
          borderColor: '#ef5350',
          backgroundColor: 'rgba(239, 83, 80, 0.1)',
          tension: 0.3
        },
        {
          label: '碳水 (g)',
          data: carbsData,
          borderColor: '#42a5f5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          tension: 0.3
        },
        {
          label: '蛋白质 (g)',
          data: proteinData,
          borderColor: '#66bb6a',
          backgroundColor: 'rgba(102, 187, 106, 0.1)',
          tension: 0.3
        },
        {
          label: '脂肪 (g)',
          data: fatData,
          borderColor: '#ffa726',
          backgroundColor: 'rgba(255, 167, 38, 0.1)',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '每日营养摄入趋势'
        },
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function viewUserHealthRecords(username) {
  const records = JSON.parse(localStorage.getItem('healthRecords')) || [];
  const userRecords = records.filter(r => r.userId === username && r.type === 'weight');
  
  let html = `<h5>健康指标 (共${userRecords.length}条)</h5>`;
  
  if (userRecords.length === 0) {
    html += '<p class="text-muted">暂无健康记录</p>';
  } else {
    html += `
      <table class="table table-bordered table-striped">
        <thead class="table-light">
          <tr>
            <th>日期</th>
            <th>时间</th>
            <th>体重(kg)</th>
            <th>BMI</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    userRecords.forEach(record => {
      const bmi = record.value.bmi || '--';
      html += `
        <tr>
          <td>${record.date}</td>
          <td>${record.time}</td>
          <td>${record.value.weight}</td>
          <td>${bmi}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
  }
  
  document.getElementById('healthRecordsTable').innerHTML = html;
  
  if (userRecords.length > 0) {
    generateUserHealthChart(userRecords);
  } else {
    document.getElementById('healthChart').innerHTML = '';
  }
}

function generateUserHealthChart(records) {
  const chartDiv = document.getElementById('healthChart');
  chartDiv.innerHTML = '<canvas id="userHealthChart"></canvas>';
  const ctx = document.getElementById('userHealthChart').getContext('2d');
  
  const sortedRecords = records.sort((a, b) => a.date.localeCompare(b.date));
  const labels = sortedRecords.map(r => r.date);
  const weightData = sortedRecords.map(r => r.value.weight);
  const bmiData = sortedRecords.map(r => r.value.bmi || null);
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '体重 (kg)',
          data: weightData,
          borderColor: '#42a5f5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          yAxisID: 'y',
          tension: 0.3
        },
        {
          label: 'BMI',
          data: bmiData,
          borderColor: '#66bb6a',
          backgroundColor: 'rgba(102, 187, 106, 0.1)',
          yAxisID: 'y1',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '体重与BMI趋势'
        },
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: '体重 (kg)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'BMI'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

function viewUserGoals(username) {
  const goals = JSON.parse(localStorage.getItem('healthGoals')) || [];
  const userGoals = goals.filter(g => g.userId === username);
  
  let html = `<h5>健康目标 (共${userGoals.length}个)</h5>`;
  
  if (userGoals.length === 0) {
    html += '<p class="text-muted">暂无健康目标</p>';
  } else {
    html += `
      <table class="table table-bordered table-striped">
        <thead class="table-light">
          <tr>
            <th>目标名称</th>
            <th>目标数值</th>
            <th>当前进度</th>
            <th>剩余</th>
            <th>完成度</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    userGoals.forEach(goal => {
      const remaining = goal.goalTarget - goal.goalProgressValue;
      const percentage = Math.round((goal.goalProgressValue / goal.goalTarget) * 100);
      html += `
        <tr>
          <td>${goal.goalName}</td>
          <td>${goal.goalTarget}</td>
          <td>${goal.goalProgressValue}</td>
          <td>${remaining}</td>
          <td>
            <div class="progress">
              <div class="progress-bar" role="progressbar" style="width: ${percentage}%" 
                   aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                ${percentage}%
              </div>
            </div>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
  }
  
  document.getElementById('healthGoalsTable').innerHTML = html;
}

function backToUserList() {
  document.getElementById('userListSection').style.display = 'block';
  document.getElementById('userDetailSection').style.display = 'none';
  document.getElementById('dataManagerSection').style.display = 'none';
  currentViewUsername = null;
  showUserList();
}

function viewUserAnalysis() {
  if (currentViewUsername) {
    window.location.href = `analysis.html?user=${encodeURIComponent(currentViewUsername)}`;
  }
}

function showDataManager() {
  document.getElementById('userListSection').style.display = 'none';
  document.getElementById('userDetailSection').style.display = 'none';
  document.getElementById('dataManagerSection').style.display = 'block';
  
  loadUserSelectionList();
  loadSystemDataStats();
  loadSystemDataPreview();
}

function hideDataManager() {
  document.getElementById('userListSection').style.display = 'block';
  document.getElementById('dataManagerSection').style.display = 'none';
}

function loadUserSelectionList() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const dietRecords = JSON.parse(localStorage.getItem('dietRecords')) || [];
  const healthRecords = JSON.parse(localStorage.getItem('healthRecords')) || [];
  const healthGoals = JSON.parse(localStorage.getItem('healthGoals')) || [];
  
  let html = '';
  users.forEach(user => {
    const userDietCount = dietRecords.filter(r => r.userId === user.username).length;
    const userHealthCount = healthRecords.filter(r => r.userId === user.username).length;
    const userGoalCount = healthGoals.filter(g => g.userId === user.username).length;
    
    html += `
      <div class="form-check mb-2">
        <input class="form-check-input user-checkbox" type="checkbox" value="${user.username}" id="user_${user.username}">
        <label class="form-check-label" for="user_${user.username}">
          <strong>${user.username}</strong> 
          ${user.isAdmin ? '<span class="badge bg-danger">管理员</span>' : '<span class="badge bg-primary">用户</span>'}
          <small class="text-muted">(饮食:${userDietCount} 健康:${userHealthCount} 目标:${userGoalCount})</small>
        </label>
      </div>
    `;
  });
  
  document.getElementById('userSelectionList').innerHTML = html;
}

function toggleAllUsers() {
  const selectAll = document.getElementById('selectAllUsers').checked;
  const checkboxes = document.querySelectorAll('.user-checkbox');
  checkboxes.forEach(cb => cb.checked = selectAll);
}

function exportSelectedUsersData() {
  const checkboxes = document.querySelectorAll('.user-checkbox:checked');
  const selectedUsernames = Array.from(checkboxes).map(cb => cb.value);
  
  console.log('Selected usernames:', selectedUsernames);
  
  if (selectedUsernames.length === 0) {
    alert('请至少选择一个用户');
    return;
  }
  
  const allUsers = JSON.parse(localStorage.getItem('users')) || [];
  const allDietRecords = JSON.parse(localStorage.getItem('dietRecords')) || [];
  const allHealthRecords = JSON.parse(localStorage.getItem('healthRecords')) || [];
  const allHealthGoals = JSON.parse(localStorage.getItem('healthGoals')) || [];
  
  console.log('All users:', allUsers.length);
  console.log('All diet records:', allDietRecords.length);
  
  const selectedUsers = allUsers.filter(u => selectedUsernames.includes(u.username));
  const selectedDietRecords = allDietRecords.filter(r => selectedUsernames.includes(r.userId));
  const selectedHealthRecords = allHealthRecords.filter(r => selectedUsernames.includes(r.userId));
  const selectedHealthGoals = allHealthGoals.filter(g => selectedUsernames.includes(g.userId));
  
  console.log('Selected users:', selectedUsers.length);
  console.log('Selected diet records:', selectedDietRecords.length);
  console.log('Selected health records:', selectedHealthRecords.length);
  console.log('Selected health goals:', selectedHealthGoals.length);
  
  // 使用数组对象，确保正确的UTF-8编码
  const data = {
    users: selectedUsers,
    dietRecords: selectedDietRecords,
    healthRecords: selectedHealthRecords,
    healthGoals: selectedHealthGoals
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json;charset=utf-8' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'initial-data.json';
  a.click();
  URL.revokeObjectURL(url);
  
  alert(`已导出 ${selectedUsernames.length} 个用户的数据\n包含：\n- 用户信息: ${selectedUsers.length} 个\n- 饮食记录: ${selectedDietRecords.length} 条\n- 健康记录: ${selectedHealthRecords.length} 条\n- 健康目标: ${selectedHealthGoals.length} 个\n\n请将 initial-data.json 文件放到项目的 data 文件夹中`);
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Starting admin.js');
  console.log('userList element:', document.getElementById('userList'));
  console.log('userDetailSection element:', document.getElementById('userDetailSection'));
  console.log('localStorage users:', localStorage.getItem('users'));
  
  showUserList();
  
  const dietTab = document.getElementById('diet-tab');
  const healthTab = document.getElementById('health-tab');
  const goalTab = document.getElementById('goal-tab');
  
  if (dietTab) {
    dietTab.addEventListener('click', function() {
      if (currentViewUsername) {
        viewUserDietRecords(currentViewUsername);
      }
    });
  }
  
  if (healthTab) {
    healthTab.addEventListener('click', function() {
      if (currentViewUsername) {
        viewUserHealthRecords(currentViewUsername);
      }
    });
  }
  
  if (goalTab) {
    goalTab.addEventListener('click', function() {
      if (currentViewUsername) {
        viewUserGoals(currentViewUsername);
      }
    });
  }
});

function reloadSystemData() {
  DataInitializer.clearAndReload();
}

function clearSystemData() {
  if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    localStorage.clear();
    alert('数据已清除');
    window.location.reload();
  }
}

function loadSystemDataStats() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const dietRecords = JSON.parse(localStorage.getItem('dietRecords')) || [];
  const healthRecords = JSON.parse(localStorage.getItem('healthRecords')) || [];
  const healthGoals = JSON.parse(localStorage.getItem('healthGoals')) || [];

  const stats = `
    <strong>用户数量：</strong>${users.length} 个<br>
    <strong>饮食记录：</strong>${dietRecords.length} 条<br>
    <strong>健康记录：</strong>${healthRecords.length} 条<br>
    <strong>健康目标：</strong>${healthGoals.length} 个
  `;

  document.getElementById('systemDataStats').innerHTML = stats;
}

function loadSystemDataPreview() {
  const data = {
    users: JSON.parse(localStorage.getItem('users')) || [],
    dietRecords: JSON.parse(localStorage.getItem('dietRecords')) || [],
    healthRecords: JSON.parse(localStorage.getItem('healthRecords')) || [],
    healthGoals: JSON.parse(localStorage.getItem('healthGoals')) || []
  };

  document.getElementById('systemDataPreview').textContent = JSON.stringify(data, null, 2);
}
