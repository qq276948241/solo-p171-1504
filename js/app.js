/* ================================
   应用入口 - 初始化所有模块
   ================================ */
(function () {
  function boot() {
    window.APP_STATE.init();
    window.MenuPage.init();
    window.OrderConfirmPage.init();

    window.APP_ROUTER.register('/menu', () => {
      window.MenuPage.onEnter && window.MenuPage.onEnter();
    });
    window.APP_ROUTER.register('/order', (params) => {
      window.OrderConfirmPage.render(params);
    });

    window.APP_ROUTER.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
