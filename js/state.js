/* ================================
   状态管理 - 购物车与全局状态
   ================================ */
window.APP_STATE = (function () {
  const STORAGE_KEY_CART = 'nax_cafe_cart_v1';
  const STORAGE_KEY_ORDER = 'nax_cafe_order_seq_v1';
  const STORAGE_KEY_LAST = 'nax_cafe_last_order_v1';

  const _listeners = new Set();

  let _state = {
    currentCategory: 'coffee',
    selectedSizes: {},
    cart: [],
    pickupTimeId: 'now',
    orderNote: '',
    activeNoteTags: [],
    lastOrder: null,
    tableNo: ''
  };

  function _initDefaultSizes() {
    const { PRODUCTS } = window.APP_DATA;
    PRODUCTS.forEach(p => {
      if (p.category === 'dessert') {
        _state.selectedSizes[p.id] = 'single';
      } else {
        _state.selectedSizes[p.id] = 'medium';
      }
    });
  }

  function _persistCart() {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(_state.cart));
    } catch (e) {}
  }

  function _restoreCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CART);
      if (raw) {
        _state.cart = JSON.parse(raw);
      }
    } catch (e) {
      _state.cart = [];
    }
  }

  function _persistLastOrder() {
    try {
      localStorage.setItem(STORAGE_KEY_LAST, JSON.stringify(_state.lastOrder));
    } catch (e) {}
  }

  function _restoreLastOrder() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LAST);
      if (raw) {
        _state.lastOrder = JSON.parse(raw);
      }
    } catch (e) {}
  }

  function _generateOrderNo() {
    const today = new Date().toDateString();
    let seqData = { date: today, prefix: 0, number: 0 };
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ORDER);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === today) {
          seqData = parsed;
        }
      }
    } catch (e) {}

    seqData.number++;
    if (seqData.number > 999) {
      seqData.number = 1;
      seqData.prefix = (seqData.prefix + 1) % 26;
    }
    try {
      localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(seqData));
    } catch (e) {}

    const letter = String.fromCharCode(65 + seqData.prefix);
    const num = String(seqData.number).padStart(3, '0');
    return `${letter}${num}`;
  }

  function _notify() {
    _listeners.forEach(fn => {
      try { fn(_state); } catch (e) { console.error(e); }
    });
  }

  function subscribe(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  }

  function getState() {
    return _state;
  }

  function setCategory(cat) {
    _state.currentCategory = cat;
    _notify();
  }

  function setSize(productId, size) {
    _state.selectedSizes[productId] = size;
    _notify();
  }

  function _makeCartKey(productId, size) {
    return `${productId}__${size}`;
  }

  function addToCart(productId) {
    const { getProductById, getPrice, getSizeLabel } = window.APP_DATA;
    const product = getProductById(productId);
    if (!product) return 0;

    const size = _state.selectedSizes[productId] || 'medium';
    const key = _makeCartKey(productId, size);

    let existing = _state.cart.find(c => c._key === key);
    if (existing) {
      existing.quantity++;
    } else {
      existing = {
        _key: key,
        productId,
        name: product.name,
        image: product.image,
        category: product.category,
        size,
        sizeLabel: getSizeLabel(product, size),
        price: getPrice(product, size),
        quantity: 1
      };
      _state.cart.push(existing);
    }

    _persistCart();
    _notify();
    return existing.quantity;
  }

  function updateQuantity(cartKey, delta) {
    const idx = _state.cart.findIndex(c => c._key === cartKey);
    if (idx === -1) return;

    const item = _state.cart[idx];
    item.quantity += delta;
    if (item.quantity <= 0) {
      _state.cart.splice(idx, 1);
    }
    _persistCart();
    _notify();
  }

  function removeFromCart(cartKey) {
    const idx = _state.cart.findIndex(c => c._key === cartKey);
    if (idx !== -1) {
      _state.cart.splice(idx, 1);
      _persistCart();
      _notify();
    }
  }

  function clearCart() {
    _state.cart = [];
    _state.orderNote = '';
    _state.activeNoteTags = [];
    _state.pickupTimeId = 'now';
    _persistCart();
    _notify();
  }

  function getCartCount() {
    return _state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartTotal() {
    return _state.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }

  function getProductCartQty(productId) {
    let total = 0;
    _state.cart.forEach(item => {
      if (item.productId === productId) total += item.quantity;
    });
    return total;
  }

  function setPickupTime(id) {
    _state.pickupTimeId = id;
    _notify();
  }

  function setOrderNote(text) {
    _state.orderNote = text;
    _notify();
  }

  function toggleNoteTag(tag) {
    const idx = _state.activeNoteTags.indexOf(tag);
    if (idx === -1) {
      _state.activeNoteTags.push(tag);
    } else {
      _state.activeNoteTags.splice(idx, 1);
    }
    _notify();
    return _state.activeNoteTags;
  }

  function _buildFullNote() {
    const parts = [];
    if (_state.activeNoteTags.length) {
      parts.push(_state.activeNoteTags.join('、'));
    }
    if (_state.orderNote.trim()) {
      parts.push(_state.orderNote.trim());
    }
    return parts.join('；');
  }

  function submitOrder() {
    if (!_state.cart.length) {
      return { ok: false, error: '请先选择商品' };
    }

    const { PICKUP_TIMES } = window.APP_DATA;
    const pickupTime = PICKUP_TIMES.find(t => t.id === _state.pickupTimeId) || PICKUP_TIMES[0];
    const orderNo = _generateOrderNo();

    const items = _state.cart.map(c => ({
      name: c.name,
      sizeLabel: c.sizeLabel,
      price: c.price,
      quantity: c.quantity,
      subtotal: c.price * c.quantity
    }));

    const total = getCartTotal();
    const waitBase = pickupTime.minutes;
    const itemCount = getCartCount();
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

  function setTableNo(no) {
    _state.tableNo = no;
  }

  function getLastOrder() {
    return _state.lastOrder;
  }

  function init() {
    _initDefaultSizes();
    _restoreCart();
    _restoreLastOrder();

    try {
      const params = new URLSearchParams(window.location.search);
      const table = params.get('table');
      if (table) {
        _state.tableNo = table.toUpperCase();
      }
    } catch (e) {}
  }

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
    getLastOrder
  };
})();
