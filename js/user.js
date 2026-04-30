const users = [
  { username: 'admin-ylh', password: '123456', isAdmin: true },
  { username: 'user1', password: 'abc123', isAdmin: false }
];
localStorage.setItem('users', JSON.stringify(users));
