const params = new URLSearchParams(window.location.search);
const id = params.get('id');
// 根据 id 找到对应食物，填充页面内容

const tabs = document.querySelectorAll('.diet-tab');
const contents = document.querySelectorAll('.diet-content');

function activateTab(target) {
	tabs.forEach(t => t.classList.remove('active'));
	contents.forEach(c => c.classList.remove('active'));
	tabs.forEach(t => {
		if (t.dataset.target === target) t.classList.add('active');
	});
	document.getElementById(target).classList.add('active');
}

tabs.forEach(tab => {
	tab.addEventListener('click', () => {
		activateTab(tab.dataset.target);
		// 更新 URL hash
		location.hash = tab.dataset.target;
	});
});

// 载入时根据 hash 激活
window.addEventListener('load', () => {
	const hash = location.hash.replace('#', '');
	if (hash) activateTab(hash);
});



