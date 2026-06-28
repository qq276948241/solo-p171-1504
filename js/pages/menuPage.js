/* ================================
   页面 - 菜单页
   ================================ */
window.MenuPage = (function () {
  let _inited = false;
  let _unsubFav = null;

  const FAV_SECTION_ID = 'favorites-section';

  const SVG_HEART_FILLED = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#C68B59" stroke="#C68B59" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`;

  function _ensureFavContainer() {
    let el = document.getElementById(FAV_SECTION_ID);
    if (el) return el;

    el = document.createElement('div');
    el.id = FAV_SECTION_ID;
    const header = document.getElementById('header');
    const productList = document.getElementById('product-list');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(el, productList);
    }
    return el;
  }

  function renderFavorites() {
    const favorites = window.APP_STATE.getFavorites();
    const container = _ensureFavContainer();

    if (!favorites.length) {
      if (container.parentNode) {
        container.outerHTML = '';
      }
      const productList = document.getElementById('product-list');
      if (productList) {
        productList.style.paddingTop = '';
      }
      return;
    }

    const state = window.APP_STATE.getState();
    const { renderOne, bindEvents } = window.ProductCardComponent;
    const cardsHTML = favorites.map((p, i) => renderOne(p, state, i)).join('');

    container.innerHTML = `
      <div style="padding: calc(120px + env(safe-area-inset-top)) 16px 4px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
          ${SVG_HEART_FILLED}
          <span style="font-family:'Noto Serif SC',serif;font-size:16px;font-weight:700;color:var(--text-primary)">我的常点</span>
          <span style="font-size:12px;color:var(--text-muted);margin-left:2px">${favorites.length}款</span>
        </div>
        <div class="product-list" id="fav-product-list" style="padding:0;display:grid;grid-template-columns:1fr;gap:12px">
          ${cardsHTML}
        </div>
      </div>
    `;

    const productList = document.getElementById('product-list');
    if (productList) {
      productList.style.paddingTop = '8px';
    }

    const favList = document.getElementById('fav-product-list');
    if (favList) bindEvents(favList);
  }

  function init() {
    if (_inited) return;
    _inited = true;

    window.HeaderComponent.init();
    window.ProductCardComponent.init();
    window.CartBarComponent.init(() => {
      window.CartPopupComponent.open();
    });
    window.CartPopupComponent.init((order) => {
      window.APP_ROUTER.navigate(`/order/${order.orderNo}`);
    });

    renderFavorites();

    const { favStore } = window.APP_STATE._stores || {};
    if (favStore) {
      _unsubFav = favStore.subscribe(() => {
        renderFavorites();
        window.ProductCardComponent.refreshHearts(document.getElementById('product-list'));
      });
    } else {
      window.APP_STATE.subscribe(renderFavorites);
    }
  }

  function onEnter() {
    renderFavorites();
    window.ProductCardComponent.refreshHearts();
  }

  function destroy() {
    if (_unsubFav) { _unsubFav(); _unsubFav = null; }
    _inited = false;
  }

  return { init, destroy, onEnter, renderFavorites };
})();
