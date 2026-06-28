/* ================================
   组件 - 半屏购物车弹窗 CartPopup
   ================================ */
window.CartPopupComponent = (function () {
  const SVG_CART = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1.5"/>
      <circle cx="20" cy="21" r="1.5"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>`;

  const SVG_TRASH = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`;

  const SVG_CLOCK = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`;

  const SVG_NOTE = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="13" y2="17"/>
    </svg>`;

  const SVG_EMPTY = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#8D6E63" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>`;

  let _open = false;
  let _onOrderSuccess = null;

  function setOnOrderSuccess(fn) { _onOrderSuccess = fn; }

  function open() {
    _open = true;
    document.getElementById('cart-popup-mask').classList.remove('hidden');
    document.getElementById('cart-popup').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    render();
  }

  function close() {
    _open = false;
    document.getElementById('cart-popup-mask').classList.add('hidden');
    document.getElementById('cart-popup').classList.add('hidden');
    document.body.style.overflow = '';
  }

  function isOpen() { return _open; }

  function _renderCartItems(state) {
    if (!state.cart.length) {
      return `
        <div class="cart-empty">
          <div class="cart-empty__icon">${SVG_EMPTY}</div>
          <div class="cart-empty__text">购物车空空如也</div>
          <div class="cart-empty__hint">去挑选一些喜欢的饮品吧～</div>
        </div>
      `;
    }

    const { formatPrice } = window.APP_DATA;
    return state.cart.map(item => `
      <div class="cart-item" data-key="${item._key}">
        <img class="cart-item__img" src="${item.image}" alt="${item.name}" loading="lazy"
             onerror="this.style.background='linear-gradient(135deg,#F5EEE3,#EFE5D8)';this.style.opacity='0.3'">
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <span class="cart-item__spec">${item.sizeLabel}</span>
          <div class="cart-item__bottom">
            <span class="cart-item__price">¥${formatPrice(item.price)}</span>
            <div class="qty-ctrl">
              <button class="qty-ctrl__btn" data-action="minus" data-key="${item._key}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <span class="qty-ctrl__num">${item.quantity}</span>
              <button class="qty-ctrl__btn qty-ctrl__btn--plus" data-action="plus" data-key="${item._key}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function _renderPickupTimes(state) {
    const { PICKUP_TIMES } = window.APP_DATA;
    return PICKUP_TIMES.map(t => `
      <div class="pickup-time-item ${state.pickupTimeId === t.id ? 'pickup-time-item--active' : ''}"
           data-time="${t.id}">
        <div>${t.label}</div>
        <div class="pickup-time-item__label">${t.timeDesc}</div>
      </div>
    `).join('');
  }

  function _renderNoteTags(state) {
    const { NOTE_TAGS } = window.APP_DATA;
    return NOTE_TAGS.map(tag => `
      <button class="note-tag ${state.activeNoteTags.includes(tag) ? 'note-tag--active' : ''}"
              data-tag="${tag}">
        ${tag}
      </button>
    `).join('');
  }

  function render() {
    if (!_open) return;
    const state = window.APP_STATE.getState();
    const total = window.APP_STATE.getCartTotal();
    const count = window.APP_STATE.getCartCount();
    const { formatPrice } = window.APP_DATA;

    const html = `
      <div class="cart-popup__handle"></div>
      <div class="cart-popup__header">
        <div class="cart-popup__title">
          ${SVG_CART}
          购物车
          <span class="cart-popup__count">${count}件商品</span>
        </div>
        ${count > 0 ? `<button class="cart-popup__clear" id="cart-clear-btn">${SVG_TRASH} 清空</button>` : ''}
      </div>
      <div class="cart-popup__body" id="cart-popup-body">
        ${_renderCartItems(state)}
      </div>

      ${count > 0 ? `
        <div class="cart-popup__section">
          <div class="cart-popup__section-title">
            ${SVG_CLOCK}
            取餐时间
          </div>
          <div class="pickup-time-list" id="pickup-time-list">
            ${_renderPickupTimes(state)}
          </div>
        </div>

        <div class="cart-popup__section">
          <div class="cart-popup__section-title">
            ${SVG_NOTE}
            口味备注
          </div>
          <textarea class="note-input" id="order-note-input" maxlength="100"
                    placeholder="如有特殊要求请在此说明（少冰、去糖、忌口等）"
                    rows="2">${state.orderNote}</textarea>
          <div class="note-tags" id="note-tags">
            ${_renderNoteTags(state)}
          </div>
        </div>

        <div class="cart-popup__footer">
          <div class="cart-popup__summary">
            <span class="cart-popup__summary-label">应付金额</span>
            <span class="cart-popup__summary-price"><small>¥</small>${formatPrice(total)}</span>
          </div>
          <button class="cart-popup__submit" id="cart-submit-btn">
            提交订单
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>
      ` : ''}
    `;

    const container = document.getElementById('cart-popup');
    container.innerHTML = html;

    _bindEvents(container);
  }

  function _bindEvents(container) {
    container.querySelectorAll('.qty-ctrl__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const delta = btn.dataset.action === 'plus' ? 1 : -1;
        window.APP_STATE.updateQuantity(key, delta);
      });
    });

    const clearBtn = document.getElementById('cart-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        window.APP_STATE.clearCart();
      });
    }

    container.querySelectorAll('.pickup-time-item').forEach(item => {
      item.addEventListener('click', () => {
        window.APP_STATE.setPickupTime(item.dataset.time);
      });
    });

    const noteInput = document.getElementById('order-note-input');
    if (noteInput) {
      noteInput.addEventListener('input', (e) => {
        window.APP_STATE.setOrderNote(e.target.value);
      });
    }

    container.querySelectorAll('.note-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        window.APP_STATE.toggleNoteTag(tag.dataset.tag);
      });
    });

    const submitBtn = document.getElementById('cart-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', _handleSubmit);
    }
  }

  let _submitting = false;
  function _handleSubmit() {
    if (_submitting) return;
    const count = window.APP_STATE.getCartCount();
    if (count === 0) {
      _showToast('请先选择商品');
      return;
    }

    _submitting = true;
    const btn = document.getElementById('cart-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        提交中...
      `;
    }

    setTimeout(() => {
      const result = window.APP_STATE.submitOrder();
      _submitting = false;

      if (!result.ok) {
        _showToast(result.error);
        render();
        return;
      }

      _showToast('下单成功！');
      close();
      if (_onOrderSuccess) {
        _onOrderSuccess(result.order);
      }
    }, 600);
  }

  function _showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(_showToast._t);
    _showToast._t = setTimeout(() => {
      toast.classList.add('hidden');
    }, 1800);
  }

  function init(onOrderSuccess) {
    setOnOrderSuccess(onOrderSuccess);

    document.getElementById('cart-popup-mask').addEventListener('click', () => {
      close();
    });

    window.APP_STATE.subscribe(() => {
      if (_open) render();
    });
  }

  return {
    init, open, close, isOpen, render,
    setOnOrderSuccess
  };
})();
