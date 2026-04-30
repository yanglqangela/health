window.onload = function() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || {};
  const username = loggedInUser.username;
  loadDietRecords(username);
};

function loadDietRecords(username) {
  const table = document.getElementById('dietRecordTable');
  table.innerHTML = '';  // Clear existing records
  const records = JSON.parse(localStorage.getItem(username + '_dietRecords')) || [];
  records.forEach((record, index) => {
    const row = table.insertRow();
    row.innerHTML = `
      <td>${record.foodName}</td>
      <td>${record.foodTime}</td>
      <td>${record.foodCalories}</td>
      <td>${record.foodQuantity}</td>
      <td><button class="btn btn-danger" onclick="deleteRecord(${index})">删除</button></td>
    `;
  });
}
