// main.js

// Tabs 切换
function setupTabs() {
  const tabs = document.querySelectorAll('.diet-tab');
  const contents = document.querySelectorAll('.diet-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });
}

// 动态渲染首页饮食推荐
function renderDiet(data) {
  Object.keys(data).forEach(category => {
    const container = document.getElementById(category);
    const row = document.createElement('div');
    row.className = 'row';
    data[category].forEach(item => {
      row.innerHTML += `
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="${item.img}" class="card-img-top">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <p class="card-text">${item.text}</p>
              <a href="detail.html?id=${item.id}&category=${category}" class="btn btn-success">了解更多</a>
            </div>
          </div>
        </div>`;
    });
    container.appendChild(row);
  });
}

// 动态渲染首页新闻
function renderNews(newsData) {
  const newsList = document.getElementById('newsList');
  newsData.forEach(item => {
    newsList.innerHTML += `
      <div class="col-md-6 mb-3 d-flex align-items-center">
        <a href="news-detail.html?id=${item.id}">
          <img src="${item.img}" style="width:50px; height:50px; border-radius:8px; margin-right:12px;">
        </a>
        <a href="news-detail.html?id=${item.id}" class="text-dark text-decoration-none flex-grow-1">
          ${item.title} ${item.badge ? `<span class="badge bg-warning text-dark">${item.badge}</span>` : ''}
        </a>
      </div>`;
  });
}

// 动态渲染详情页内容（新闻或饮食）
function renderDetail(dataMap, prefix) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const data = dataMap[id];
  if (!data) {
    document.body.innerHTML = "<h2>未找到内容</h2>";
    return;
  }
  document.title = data.title;
  document.getElementById(`${prefix}-title`).innerText = data.title;
  if (data.meta) document.getElementById(`${prefix}-meta`).innerText = data.meta;
  if (data.content) document.getElementById(`${prefix}-content`).innerHTML = data.content;
  if (data.video) {
    document.getElementById(`${prefix}-video`).innerHTML = `<video controls width="100%"><source src="${data.video}" type="video/mp4"></video>`;
  }
  if (data.image) {
    document.getElementById(`${prefix}-image`).src = data.image;
  }
  if (data.description) {
    document.getElementById(`${prefix}-description`).innerText = data.description;
  }
}
