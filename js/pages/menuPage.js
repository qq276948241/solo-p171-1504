/* ================================
   页面 - 菜单页
   ================================ */
window.MenuPage = (function () {
  function init() {
    window.HeaderComponent.init();
    window.ProductCardComponent.init();
    window.CartBarComponent.init(() => {
      window.CartPopupComponent.open();
    });
    window.CartPopupComponent.init((order) => {
      window.APP_ROUTER.navigate(`/order/${order.orderNo}`);
    });
  }

  function onEnter() {}

  return { init, onEnter };
})();
