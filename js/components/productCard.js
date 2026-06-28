/* ================================
   组件 - 商品卡片 ProductCard
   ================================ */
window.ProductCardComponent = (function () {
  const SVG_PLUS = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`;

  function _renderOne(product, state, index) {
    const { getPrice, getAvailableSizes, formatPrice } = window.APP_DATA;
    const currentSize = state.selectedSizes[product.id] || 'medium';
    const currentPrice = getPrice(product, currentSize);
    const cartQty = window.APP_STATE.getProductCartQty(product.id);
    const sizes = getAvailableSizes(product);

    const sizesHTML = sizes.map(s => `
      <button class="product-card__size ${currentSize === s.id ? 'product-card__size--active' : ''}"
              data-pid="${product.id}" data-size="${s.id}">
        ${s.label}
      </button>
    `).join('');

    const qtyHTML = cartQty > 0
      ? `
        <div class="qty-ctrl" data-pid="${product.id}">
          <button class="qty-ctrl__btn qty-ctrl__btn--minus" data-action="minus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <span class="qty-ctrl__num">${cartQty}</span>
          <button class="qty-ctrl__btn qty-ctrl__btn--plus" data-action="plus">
            ${SVG_PLUS}
          </button>
        </div>
      `
      : `<button class="add-btn" data-pid="${product.id}" data-action="add">${SVG_PLUS}</button>`;

    return `
      <article class="product-card" style="animation-delay:${index * 0.04}s" data-pid="${product.id}">
        <div class="product-card__img-wrap">
          <img class="product-card__img" src="${product.image}" alt="${product.name}" loading="lazy"
               onerror="this.style.background='linear-gradient(135deg,#F5EEE3,#EFE5D8)';this.style.opacity='0.3'">
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${product.name}</h3>
          <p class="product-card__desc">${product.description}</p>
          ${product.category !== 'dessert' ? `<div class="product-card__sizes">${sizesHTML}</div>` : ''}
          <div class="product-card__bottom">
            <span class="product-card__price"><small>¥</small>${formatPrice(currentPrice)}</span>
            ${qtyHTML}
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    const state = window.APP_STATE.getState();
    const { getProductsByCategory } = window.APP_DATA;
    const products = getProductsByCategory(state.currentCategory);

    const html = products.map((p, i) => _renderOne(p, state, i)).join('');
    const container = document.getElementById('product-list');
    container.innerHTML = html;
    _bindEvents(container);
  }

  function _bindEvents(container) {
    container.querySelectorAll('.product-card__size').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.dataset.pid;
        const size = btn.dataset.size;
        window.APP_STATE.setSize(pid, size);
      });
    });

    container.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.dataset.pid;
        _handleAdd(pid, btn);
      });
    });

    container.querySelectorAll('.qty-ctrl').forEach(ctrl => {
      const pid = ctrl.dataset.pid;
      ctrl.querySelector('.qty-ctrl__btn--plus').addEventListener('click', (e) => {
        e.stopPropagation();
        _handleAdd(pid, ctrl);
      });
      ctrl.querySelector('.qty-ctrl__btn--minus').addEventListener('click', (e) => {
        e.stopPropagation();
        _handleMinus(pid);
      });
    });
  }

  function _handleAdd(pid, srcEl) {
    window.APP_STATE.addToCart(pid);
    _playFlyAnimation(srcEl);
  }

  function _handleMinus(pid) {
    const state = window.APP_STATE.getState();
    const product = window.APP_DATA.getProductById(pid);
    const currentSize = state.selectedSizes[pid] || 'medium';

    const matching = state.cart
      .filter(c => c.productId === pid)
      .sort((a, b) => {
        if (a.size === currentSize) return -1;
        if (b.size === currentSize) return 1;
        return 0;
      });

    if (matching.length) {
      window.APP_STATE.updateQuantity(matching[0]._key, -1);
    }
  }

  function _playFlyAnimation(srcEl) {
    const ball = document.getElementById('fly-to-cart');
    const cartIcon = document.querySelector('.cart-bar__icon-wrap');
    if (!srcEl || !cartIcon || !ball) return;

    try {
      const srcRect = srcEl.getBoundingClientRect();
      const destRect = cartIcon.getBoundingClientRect();

      const startX = srcRect.left + srcRect.width / 2;
      const startY = srcRect.top + srcRect.height / 2;
      const endX = destRect.left + destRect.width / 2;
      const endY = destRect.top + destRect.height / 2;

      ball.style.left = `${startX}px`;
      ball.style.top = `${startY}px`;
      ball.classList.remove('hidden');

      ball.animate([
        { left: `${startX}px`, top: `${startY}px`, transform: 'scale(1)', opacity: 1 },
        { left: `${(startX + endX) / 2}px`, top: `${Math.min(startY, endY) - 80}px`, transform: 'scale(0.8)', offset: 0.5 },
        { left: `${endX}px`, top: `${endY}px`, transform: 'scale(0.3)', opacity: 0.6 }
      ], {
        duration: 500,
        easing: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)'
      }).onfinish = () => {
        ball.classList.add('hidden');
        cartIcon.animate([
          { transform: 'translateY(-8px) scale(1)' },
          { transform: 'translateY(-8px) scale(1.18)' },
          { transform: 'translateY(-8px) scale(1)' }
        ], { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      };
    } catch (e) {}
  }

  function init() {
    render();
    window.APP_STATE.subscribe(render);
  }

  return { init, render };
})();
