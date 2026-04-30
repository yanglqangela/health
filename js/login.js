// login.js

function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // 自动识别管理员
    user.isAdmin = (user.username === 'admin-ylh');

    // 保存到 localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    alert('登录成功！');
    window.location.href = 'index.html';
  } else {
    alert('用户名或密码错误！');
  }
}


// 注册函数（示例）
function register() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  let users = JSON.parse(localStorage.getItem('users')) || [];
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    alert('用户名已存在，请换一个！');
    return;
  }

  const newUser = {
    username: username,
    password: password,
    isAdmin: (username === 'admin-ylh') // 注册时就赋值
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  alert('注册成功！');
  window.location.href = 'login.html';
}


