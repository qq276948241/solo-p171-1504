/* ================================
   页面 - 订单确认页
   ================================ */
window.OrderConfirmPage = (function () {
  const SVG_CHECK = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;

  const SVG_CUP = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    </svg>`;

  const SVG_CLOCK = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`;

  const SVG_LOC = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>`;

  const SVG_LIST = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>`;

  const SVG_NOTE = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>`;

  const SVG_BACK = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>`;

  const SVG_REFRESH = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>`;

  function render(params) {
    const order = window.APP_STATE.getLastOrder();
    const container = document.getElementById('order-content');

    if (!order || (params.orderNo && params.orderNo !== order.orderNo)) {
      container.innerHTML = _renderNoOrder();
      _bindEmptyEvents();
      return;
    }

    container.innerHTML = _renderOrder(order);
    _bindEvents();
  }

  function _renderNoOrder() {
    const SVG_X = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>`;
    return `
      <div class="order-page">
        <div class="order-hero" style="padding-bottom:48px">
          <div class="order-success-icon" style="background:linear-gradient(135deg,#A1887F,#795548);box-shadow:0 4px 16px rgba(121,85,72,0.3)">
            ${SVG_X}
          </div>
          <div class="order-success-text" style="margin-top:8px">暂无订单</div>
          <div class="order-success-sub" style="margin-bottom:32px">返回菜单开始点单吧～</div>
          <div class="order-actions" style="justify-content:center;margin:0 auto;max-width:320px">
            <button class="order-btn order-btn--primary" id="back-to-menu-btn">
              ${SVG_BACK} 返回菜单
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function _renderOrder(order) {
    const { formatPrice } = window.APP_DATA;
    const itemsTotal = order.items.reduce((s, i) => s + i.subtotal, 0);

    const itemsHTML = order.items.map(item => `
      <div class="order-items__item">
        <div class="order-items__info">
          <div class="order-items__name">${item.name}</div>
          <div class="order-items__spec">${item.sizeLabel}</div>
        </div>
        <div class="order-items__right">
          <div class="order-items__price">¥${formatPrice(item.subtotal)}</div>
          <div class="order-items__qty">x${item.quantity}</div>
        </div>
      </div>
    `).join('');

    const noteHTML = order.note
      ? `
        <div class="order-note-box">
          <div class="order-note-box__label">${SVG_NOTE} 口味备注</div>
          <div class="order-note-box__content">${order.note}</div>
        </div>
      ` : '';

    return `
      <div class="order-page">
        <div class="order-hero">
          <div class="order-success-icon">${SVG_CHECK}</div>
          <div class="order-success-text">下单成功！</div>
          <div class="order-success-sub">请凭取单号到吧台取餐</div>
        </div>

        <div class="order-no-card">
          <div class="order-no-label">取 餐 号</div>
          <div class="order-no">${order.orderNo}</div>
          <div class="order-info-grid">
            <div class="order-info-item">
              <div class="order-info-item__label">${SVG_CUP} 商品</div>
              <div class="order-info-item__value">${order.itemCount}件</div>
            </div>
            <div class="order-info-item">
              <div class="order-info-item__label">${SVG_CLOCK} 预计等待</div>
              <div class="order-info-item__value">${order.estimatedWait}</div>
            </div>
            <div class="order-info-item">
              <div class="order-info-item__label">${SVG_CLOCK} 取餐时间</div>
              <div class="order-info-item__value">${order.pickupTimeStr}</div>
            </div>
            <div class="order-info-item">
              <div class="order-info-item__label">${SVG_LOC} ${order.tableNo ? '桌号' : '堂食'}</div>
              <div class="order-info-item__value">${order.tableNo || '自取'}</div>
            </div>
          </div>
        </div>

        <div class="order-section">
          <div class="order-section__title">${SVG_LIST} 订单明细</div>
          <div class="order-items">
            ${itemsHTML}
          </div>
          ${noteHTML}
          <div class="order-total">
            <span class="order-total__label">共${order.itemCount}件商品</span>
            <span class="order-total__value">¥${formatPrice(order.total)}</span>
          </div>
        </div>

        <div class="order-actions">
          <button class="order-btn order-btn--secondary" id="back-to-menu-btn">
            ${SVG_BACK} 返回菜单
          </button>
          <button class="order-btn order-btn--primary" id="order-again-btn">
            ${SVG_REFRESH} 再来一单
          </button>
        </div>

        <div class="order-tip">
          <strong>温馨提示：</strong>请留意叫号屏和语音播报，
          ${order.tableNo ? '您的饮品制作完成后将送到您的座位。' : '凭取单号到吧台取餐，祝您用餐愉快！'}
        </div>
      </div>
    `;
  }

  function _bindEvents() {
    const backBtn = document.getElementById('back-to-menu-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.APP_ROUTER.navigate('/menu');
      });
    }
    const againBtn = document.getElementById('order-again-btn');
    if (againBtn) {
      againBtn.addEventListener('click', () => {
        window.APP_ROUTER.navigate('/menu');
      });
    }
  }

  function _bindEmptyEvents() {
    const backBtn = document.getElementById('back-to-menu-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.APP_ROUTER.navigate('/menu');
      });
    }
  }

  function init() {}

  return { init, render };
})();
