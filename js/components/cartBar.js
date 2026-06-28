/* ================================
   组件 - 底部购物车栏 CartBar
   ================================ */
window.CartBarComponent = (function () {
  const SVG_CART = `
    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1.5"/>
      <circle cx="20" cy="21" r="1.5"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>`;

  let _onOpenCart = null;

  function setOnOpenCart(fn) { _onOpenCart = fn; }

  function render() {
    const total = window.APP_STATE.getCartTotal();
    const count = window.APP_STATE.getCartCount();
    const { formatPrice } = window.APP_DATA;

    const badgeHTML = count > 0
      ? `<span class="cart-bar__badge">${count > 99 ? '99+' : count}</span>`
      : '';

    const totalHTML = count > 0
      ? `
        <div class="cart-bar__total-label">合计</div>
        <div class="cart-bar__total"><small>¥</small>${formatPrice(total)}</div>
      `
      : `
        <div class="cart-bar__total-label">&nbsp;</div>
        <div class="cart-bar__total" style="opacity:0.5">购物车是空的</div>
      `;

    const html = `
      <div class="cart-bar__inner">
        <div class="cart-bar__icon-wrap" id="cart-icon-btn">
          ${SVG_CART}
          ${badgeHTML}
        </div>
        <div class="cart-bar__info">
          ${totalHTML}
        </div>
        <button class="cart-bar__checkout" id="cart-checkout-btn" ${count === 0 ? 'disabled' : ''}>
          去结算
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    `;

    const container = document.getElementById('cart-bar');
    container.innerHTML = html;

    document.getElementById('cart-icon-btn').addEventListener('click', () => {
      if (_onOpenCart) _onOpenCart();
    });
    document.getElementById('cart-checkout-btn').addEventListener('click', () => {
      if (count > 0 && _onOpenCart) _onOpenCart();
    });
  }

  function init(onOpenCart) {
    setOnOpenCart(onOpenCart);
    render();
    window.APP_STATE.subscribe(render);
  }

  return { init, render, setOnOpenCart };
})();
