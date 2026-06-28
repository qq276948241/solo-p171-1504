/* ================================
   组件 - 顶部导航 Header
   ================================ */
window.HeaderComponent = (function () {
  let _inited = false;
  let _unsub = null;

  const SVG_COFFEE_CUP = `
    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>`;

  function render() {
    const state = window.APP_STATE.getState();
    const { CATEGORIES } = window.APP_DATA;

    const tabsHTML = CATEGORIES.map(cat => `
      <button class="header__tab ${state.currentCategory === cat.id ? 'header__tab--active' : ''}"
              data-cat="${cat.id}">
        ${cat.label}
      </button>
    `).join('');

    const tableHTML = state.tableNo ? `<span class="header__table">桌号 ${state.tableNo}</span>` : '';

    const html = `
      <div class="header__shop">
        <div class="header__logo">${SVG_COFFEE_CUP}</div>
        <span class="header__title">暖巷咖啡</span>
        ${tableHTML}
      </div>
      <div class="header__tabs">
        ${tabsHTML}
      </div>
    `;

    const container = document.getElementById('header');
    container.innerHTML = html;

    container.querySelectorAll('.header__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.dataset.cat;
        window.APP_STATE.setCategory(cat);
      });
    });
  }

  function init() {
    if (_inited) return;
    _inited = true;
    render();
    _unsub = window.APP_STATE.subscribe(render);
  }

  function destroy() {
    if (_unsub) { _unsub(); _unsub = null; }
    _inited = false;
  }

  return { init, destroy, render };
})();
