/* ================================
   组件 - 商品卡片 ProductCard
   ================================ */
window.ProductCardComponent = (function () {
  let _inited = false;
  let _unsubGlobal = null;
  let _unsubFav = null;

  const SVG_PLUS = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`;

  const SVG_HEART_EMPTY = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#C68B59" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`;

  const SVG_HEART_FILLED = `
    <svg viewBox="0 0 24 24" fill="#C68B59" stroke="#C68B59" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`;

  function _renderOne(product, state, index) {
    const { getPrice, getAvailableSizes, formatPrice } = window.APP_DATA;
    const currentSize = state.selectedSizes[product.id] || 'medium';
    const currentPrice = getPrice(product, currentSize);
    const cartQty = window.APP_STATE.getProductCartQty(product.id);
    const favorited = window.APP_STATE.isFavorited(product.id);
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
          <button class="product-card__fav" data-action="fav" data-pid="${product.id}"
                  style="position:absolute;top:6px;right:6px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.92);box-shadow:0 1px 4px rgba(62,39,35,0.12);display:flex;align-items:center;justify-content:center;z-index:2">
            ${favorited ? SVG_HEART_FILLED : SVG_HEART_EMPTY}
          </button>
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

  /* ------------------------------------------------------------
     局部更新：只刷新所有爱心图标的空心/实心状态，不重画整张卡片
     ------------------------------------------------------------ */
  function _refreshHearts(root) {
    const scope = root || document;
    scope.querySelectorAll('.product-card__fav').forEach(btn => {
      const pid = btn.dataset.pid;
      const favorited = window.APP_STATE.isFavorited(pid);
      btn.innerHTML = favorited ? SVG_HEART_FILLED : SVG_HEART_EMPTY;
    });
  }

  function render() {
    const state = window.APP_STATE.getState();
    const { getProductsByCategory } = window.APP_DATA;
    const products = getProductsByCategory(state.currentCategory);

    const html = products.map((p, i) => _renderOne(p, state, i)).join('');
    const container = document.getElementById('product-list');
    container.innerHTML = html;
  }

  /* ------------------------------------------------------------
     事件委托：在容器上绑一次 click，利用冒泡分发所有按钮动作
     - 爱心：stopPropagation 拦截，防止触发加购
     - 加购/规格/数量控制：允许正常冒泡到卡片（如果卡片上有监听的话）
     ------------------------------------------------------------ */
  function _delegateEvents(container) {
    if (!container) return;
    if (container.__productCardDelegated) return;
    container.__productCardDelegated = true;

    container.addEventListener('click', (e) => {
      const sizeBtn = e.target.closest('.product-card__size');
      if (sizeBtn) {
        e.stopPropagation();
        const pid = sizeBtn.dataset.pid;
        const size = sizeBtn.dataset.size;
        window.APP_STATE.setSize(pid, size);
        return;
      }

      const favBtn = e.target.closest('.product-card__fav');
      if (favBtn) {
        e.stopPropagation();
        const pid = favBtn.dataset.pid;
        window.APP_STATE.toggleFavorite(pid);
        return;
      }

      const addBtn = e.target.closest('.add-btn');
      if (addBtn) {
        e.stopPropagation();
        const pid = addBtn.dataset.pid;
        _handleAdd(pid, addBtn);
        return;
      }

      const qtyPlus = e.target.closest('.qty-ctrl__btn--plus');
      if (qtyPlus) {
        e.stopPropagation();
        const ctrl = qtyPlus.closest('.qty-ctrl');
        const pid = ctrl.dataset.pid;
        _handleAdd(pid, ctrl);
        return;
      }

      const qtyMinus = e.target.closest('.qty-ctrl__btn--minus');
      if (qtyMinus) {
        e.stopPropagation();
        const ctrl = qtyMinus.closest('.qty-ctrl');
        const pid = ctrl.dataset.pid;
        _handleMinus(pid);
        return;
      }
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

  function bindEvents(container) {
    _delegateEvents(container);
  }

  function init() {
    if (_inited) return;
    _inited = true;

    render();
    _delegateEvents(document.getElementById('product-list'));
    _delegateEvents(document.getElementById('fav-product-list'));

    _unsubGlobal = window.APP_STATE.subscribe(() => {
      render();
      _delegateEvents(document.getElementById('fav-product-list'));
    });

    const { favStore } = window.APP_STATE._stores || {};
    if (favStore) {
      _unsubFav = favStore.subscribe(() => {
        _refreshHearts(document.getElementById('product-list'));
        _refreshHearts(document.getElementById('fav-product-list'));
      });
    }
  }

  function destroy() {
    if (_unsubGlobal) { _unsubGlobal(); _unsubGlobal = null; }
    if (_unsubFav)   { _unsubFav();   _unsubFav = null; }
    _inited = false;
  }

  return {
    init, destroy, render,
    renderOne: _renderOne,
    bindEvents,
    refreshHearts: _refreshHearts
  };
})();
