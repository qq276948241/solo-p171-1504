/* ================================
   状态管理 - 购物车与全局状态
   ================================ */
window.APP_STATE = (function () {
  const STORAGE_KEY_CART = 'nax_cafe_cart_v1';
  const STORAGE_KEY_ORDER = 'nax_cafe_order_seq_v1';
  const STORAGE_KEY_LAST = 'nax_cafe_last_order_v1';
  const STORAGE_KEY_FAV = 'nax_cafe_favorites_v1';

  /* ------------------------------------------------------------
     createStore — 可持久化订阅式数据仓库工厂
     接收 localStorage key 和初始值，返回统一操作接口
     ------------------------------------------------------------ */
  function createStore(storageKey, initialValue) {
    let _data = initialValue;
    const _listeners = new Set();

    function notify() {
      _listeners.forEach(fn => {
        try { fn(_data); } catch (e) { console.error(e); }
      });
    }

    return {
      get() { return _data; },

      set(newVal) {
        _data = newVal;
        this.persist();
        notify();
        return _data;
      },

      update(mutator) {
        const result = mutator(_data);
        if (result !== undefined) _data = result;
        this.persist();
        notify();
        return _data;
      },

      subscribe(fn) {
        _listeners.add(fn);
        return () => _listeners.delete(fn);
      },

      persist() {
        try { localStorage.setItem(storageKey, JSON.stringify(_data)); }
        catch (e) {}
      },

      restore() {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            _data = (parsed ?? initialValue);
          }
        } catch (e) {
          _data = initialValue;
        }
        return _data;
      }
    };
  }

  /* ------------------------------------------------------------
     业务 Store 实例
     ------------------------------------------------------------ */
  const cartStore = createStore(STORAGE_KEY_CART, []);
  const favStore = createStore(STORAGE_KEY_FAV, []);

  /* ------------------------------------------------------------
     全局状态（非 Store 管理的零散字段）
     ------------------------------------------------------------ */
  const _globalListeners = new Set();

  let _state = {
    currentCategory: 'coffee',
    selectedSizes: {},
    cart: [],
    pickupTimeId: 'now',
    orderNote: '',
    activeNoteTags: [],
    lastOrder: null,
    tableNo: '',
    favorites: []
  };

  // Store 变化 → 同步到 _state → 触发全局通知
  // 保证组件层通过 APP_STATE.subscribe 拿到的 state.cart/state.favorites 始终最新
  cartStore.subscribe(data => {
    _state.cart = data;
    _notifyGlobal();
  });
  favStore.subscribe(data => {
    _state.favorites = data;
    _notifyGlobal();
  });

  /* ------------------------------------------------------------
     初始化工具
     ------------------------------------------------------------ */
  function _initDefaultSizes() {
    const { PRODUCTS } = window.APP_DATA;
    PRODUCTS.forEach(p => {
      _state.selectedSizes[p.id] = p.category === 'dessert' ? 'single' : 'medium';
    });
  }

  function _persistLastOrder() {
    try { localStorage.setItem(STORAGE_KEY_LAST, JSON.stringify(_state.lastOrder)); }
    catch (e) {}
  }

  function _restoreLastOrder() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LAST);
      if (raw) _state.lastOrder = JSON.parse(raw);
    } catch (e) {}
  }

  function _generateOrderNo() {
    const today = new Date().toDateString();
    let seqData = { date: today, prefix: 0, number: 0 };
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ORDER);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === today) seqData = parsed;
      }
    } catch (e) {}

    seqData.number++;
    if (seqData.number > 999) {
      seqData.number = 1;
      seqData.prefix = (seqData.prefix + 1) % 26;
    }
    try { localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(seqData)); }
    catch (e) {}

    const letter = String.fromCharCode(65 + seqData.prefix);
    const num = String(seqData.number).padStart(3, '0');
    return `${letter}${num}`;
  }

  function _notifyGlobal() {
    _globalListeners.forEach(fn => {
      try { fn(_state); } catch (e) { console.error(e); }
    });
  }

  /* ------------------------------------------------------------
     对外订阅 & 读取（保持兼容）
     ------------------------------------------------------------ */
  function subscribe(fn) {
    _globalListeners.add(fn);
    return () => _globalListeners.delete(fn);
  }

  function getState() { return _state; }

  /* ------------------------------------------------------------
     分类 / 规格
     ------------------------------------------------------------ */
  function setCategory(cat) {
    _state.currentCategory = cat;
    _notifyGlobal();
  }

  function setSize(productId, size) {
    _state.selectedSizes[productId] = size;
    _notifyGlobal();
  }

  /* ------------------------------------------------------------
     购物车操作（内部走 cartStore）
     ------------------------------------------------------------ */
  function _makeCartKey(productId, size) {
    return `${productId}__${size}`;
  }

  function addToCart(productId) {
    const { getProductById, getPrice, getSizeLabel } = window.APP_DATA;
    const product = getProductById(productId);
    if (!product) return 0;

    const size = _state.selectedSizes[productId] || 'medium';
    const key = _makeCartKey(productId, size);

    let qty;
    cartStore.update(cart => {
      let existing = cart.find(c => c._key === key);
      if (existing) {
        existing.quantity++;
        qty = existing.quantity;
      } else {
        qty = 1;
        cart.push({
          _key: key,
          productId,
          name: product.name,
          image: product.image,
          category: product.category,
          size,
          sizeLabel: getSizeLabel(product, size),
          price: getPrice(product, size),
          quantity: 1
        });
      }
    });
    return qty;
  }

  function updateQuantity(cartKey, delta) {
    cartStore.update(cart => {
      const idx = cart.findIndex(c => c._key === cartKey);
      if (idx === -1) return;
      cart[idx].quantity += delta;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    });
  }

  function removeFromCart(cartKey) {
    cartStore.update(cart => {
      const idx = cart.findIndex(c => c._key === cartKey);
      if (idx !== -1) cart.splice(idx, 1);
    });
  }

  function clearCart() {
    cartStore.set([]);
    _state.orderNote = '';
    _state.activeNoteTags = [];
    _state.pickupTimeId = 'now';
    _notifyGlobal();
  }

  function getCartCount() {
    return cartStore.get().reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartTotal() {
    return cartStore.get().reduce((sum, item) => sum + item.quantity * item.price, 0);
  }

  function getProductCartQty(productId) {
    return cartStore.get()
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  /* ------------------------------------------------------------
     取餐时间 / 备注 / 标签
     ------------------------------------------------------------ */
  function setPickupTime(id) {
    _state.pickupTimeId = id;
    _notifyGlobal();
  }

  function setOrderNote(text) {
    _state.orderNote = text;
    _notifyGlobal();
  }

  function toggleNoteTag(tag) {
    const idx = _state.activeNoteTags.indexOf(tag);
    if (idx === -1) _state.activeNoteTags.push(tag);
    else _state.activeNoteTags.splice(idx, 1);
    _notifyGlobal();
    return _state.activeNoteTags;
  }

  function _buildFullNote() {
    const parts = [];
    if (_state.activeNoteTags.length) parts.push(_state.activeNoteTags.join('、'));
    if (_state.orderNote.trim()) parts.push(_state.orderNote.trim());
    return parts.join('；');
  }

  /* ------------------------------------------------------------
     收藏操作（内部走 favStore）
     ------------------------------------------------------------ */
  function toggleFavorite(productId) {
    let added;
    favStore.update(favs => {
      const idx = favs.indexOf(productId);
      if (idx === -1) { favs.push(productId); added = true; }
      else { favs.splice(idx, 1); added = false; }
    });
    return added;
  }

  function isFavorited(productId) {
    return favStore.get().indexOf(productId) !== -1;
  }

  function getFavorites() {
    const { getProductById } = window.APP_DATA;
    return favStore.get()
      .map(id => getProductById(id))
      .filter(Boolean);
  }

  /* ------------------------------------------------------------
     下单
     ------------------------------------------------------------ */
  function submitOrder() {
    const cart = cartStore.get();
    if (!cart.length) return { ok: false, error: '请先选择商品' };

    const { PICKUP_TIMES } = window.APP_DATA;
    const pickupTime = PICKUP_TIMES.find(t => t.id === _state.pickupTimeId) || PICKUP_TIMES[0];
    const orderNo = _generateOrderNo();

    const items = cart.map(c => ({
      name: c.name,
      sizeLabel: c.sizeLabel,
      price: c.price,
      quantity: c.quantity,
      subtotal: c.price * c.quantity
    }));

    const total = getCartTotal();
    const itemCount = getCartCount();
    const waitBase = pickupTime.minutes;
    const extraWait = Math.min(Math.floor(itemCount / 3) * 2, 10);
    const waitMin = Math.max(5, waitBase + extraWait - 2);
    const waitMax = waitMin + 4;

    const now = new Date();
    const pickupDate = new Date(now.getTime() + waitBase * 60000);
    const pickupTimeStr = `${String(pickupDate.getHours()).padStart(2,'0')}:${String(pickupDate.getMinutes()).padStart(2,'0')}`;

    const order = {
      orderNo,
      items,
      total,
      itemCount,
      estimatedWait: `约${waitMin}-${waitMax}分钟`,
      pickupTimeLabel: pickupTime.label,
      pickupTimeStr,
      tableNo: _state.tableNo,
      note: _buildFullNote(),
      createdAt: now.toISOString()
    };

    _state.lastOrder = order;
    _persistLastOrder();
    clearCart();

    return { ok: true, order };
  }

  /* ------------------------------------------------------------
     其他
     ------------------------------------------------------------ */
  function setTableNo(no) { _state.tableNo = no; }
  function getLastOrder() { return _state.lastOrder; }

  /* ------------------------------------------------------------
     初始化
     ------------------------------------------------------------ */
  function init() {
    _initDefaultSizes();
    cartStore.restore();
    favStore.restore();
    _restoreLastOrder();

    try {
      const params = new URLSearchParams(window.location.search);
      const table = params.get('table');
      if (table) _state.tableNo = table.toUpperCase();
    } catch (e) {}
  }

  /* ------------------------------------------------------------
     对外暴露（保持完全兼容）
     ------------------------------------------------------------ */
  return {
    init,
    subscribe,
    getState,
    setCategory,
    setSize,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,
    getProductCartQty,
    setPickupTime,
    setOrderNote,
    toggleNoteTag,
    submitOrder,
    setTableNo,
    getLastOrder,
    toggleFavorite,
    isFavorited,
    getFavorites,
    _stores: { cartStore, favStore }
  };
})();
