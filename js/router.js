/* ================================
   路由管理 - Hash路由
   ================================ */
window.APP_ROUTER = (function () {
  const _routes = {};
  let _currentPage = null;

  function register(path, handler) {
    _routes[path] = handler;
  }

  function _parseHash() {
    const raw = window.location.hash.slice(1) || '/menu';
    const [pathPart] = raw.split('?');
    const segments = pathPart.split('/').filter(Boolean);

    if (segments[0] === 'order' && segments[1]) {
      return { name: 'order', params: { orderNo: segments[1] } };
    }
    return { name: 'menu', params: {} };
  }

  function _applyPage(name) {
    const menuEl = document.getElementById('page-menu');
    const orderEl = document.getElementById('page-order');

    if (name === 'order') {
      menuEl.classList.remove('page--active');
      orderEl.classList.add('page--active');
    } else {
      orderEl.classList.remove('page--active');
      menuEl.classList.add('page--active');
    }
    _currentPage = name;
  }

  function handleRoute() {
    const parsed = _parseHash();
    _applyPage(parsed.name);

    if (parsed.name === 'order' && _routes['/order']) {
      _routes['/order'](parsed.params);
    } else if (parsed.name === 'menu' && _routes['/menu']) {
      _routes['/menu'](parsed.params);
    }

    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function navigate(path) {
    if (window.location.hash === '#' + path) {
      handleRoute();
    } else {
      window.location.hash = path;
    }
  }

  function init() {
    window.addEventListener('hashchange', handleRoute);
    if (!window.location.hash) {
      window.location.hash = '/menu';
    } else {
      handleRoute();
    }
  }

  return {
    register,
    navigate,
    init,
    handleRoute
  };
})();
