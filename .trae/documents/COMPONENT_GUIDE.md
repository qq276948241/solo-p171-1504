# 暖巷咖啡 · 组件使用指南

> 这份文档给接手维护的同学看，不用翻代码就能搞懂每个组件在干嘛、什么时候被调用、数据从哪来到哪去。看完你应该能照葫芦画瓢加一个新组件或者新页面。

---

## 一、开场：用户扫桌角二维码那一刻

假设顾客坐在 A5 桌，拿起手机扫了桌角的二维码，浏览器打开了：

```
http://.../index.html?table=A5
```

接下来事情按这个顺序发生：

1. `index.html` 按顺序加载 9 个 JS 文件（data → state → router → 4 个组件 → 2 个页面 → app）
2. `app.js` 的 `init()` 被调用
3. `APP_STATE.init()` 跑起来：
   - 从 localStorage 恢复购物车（`cartStore.restore()`）
   - 从 localStorage 恢复收藏（`favStore.restore()`）
   - 从 URL 里把 `table=A5` 读出来，存到全局状态 `_state.tableNo`
4. `APP_ROUTER.init()` 解析 hash，默认跳到 `#/menu`，触发 `MenuPage.onEnter()`
5. `MenuPage.init()` 把 4 个小组件挨个拉起来

---

## 二、菜单页登场：4 个组件怎么协作

菜单页是整个应用最复杂的页面，4 个组件像搭积木一样拼在 `index.html` 里：

```
┌─────────────────────────────────┐
│  Header  (店名 + 桌号 + 分类Tab) │
├─────────────────────────────────┤
│  我的常点区（有收藏才显示）         │ ← MenuPage 自己管的一块
│  ┌───────────────────────────┐  │
│  │ ProductCard（常点商品）    │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  商品列表区                       │
│  ┌───────────────────────────┐  │
│  │ ProductCard × N            │  │ ← 每个商品一张卡
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  CartBar (购物车图标 + 金额)     │ ← 固定在底部
└─────────────────────────────────┘
        ↓ 点购物车图标
┌─────────────────────────────────┐
│  CartPopup (半屏购物车弹层)      │ ← 覆盖在上面
└─────────────────────────────────┘
```

下面逐个拆解。

---

## 三、Header 组件（头部导航）

**文件**：`js/components/header.js`

### 它在干嘛
显示店名「暖巷咖啡」、桌号（比如「桌号 A5」），还有三个分类 Tab（咖啡 / 茶饮 / 甜点）。点 Tab 切换下面商品列表的分类。

### 数据流向
| 方向 | 数据源/目标 | 说明 |
|------|-------------|------|
| **读** | `APP_STATE.getState().currentCategory` | 当前选中哪个分类 |
| **读** | `APP_STATE.getState().tableNo` | 桌号 |
| **写** | `APP_STATE.setCategory(catId)` | 用户点 Tab 时写回 |

### 生命周期
| 方法 | 什么时候被调 | 做了什么 |
|------|--------------|----------|
| `init()` | `MenuPage.init()` 里第一个被调 | 调一次 `render()`，然后 `APP_STATE.subscribe(render)` 订阅全局变化；有 `_inited` 守卫，重复调用也不会重复订阅 |
| `render()` | init 时 + 每次全局状态变化时 | 用 `innerHTML` 全量重画整个 header，再给每个 Tab 绑 `click` 事件 |

### 新人注意
- header 的 DOM 节点是 `index.html` 里写死的 `<header id="header">`，组件只负责往里填内容
- 分类 Tab 的数据来自 `APP_DATA.CATEGORIES`，不是写死的

---

## 四、ProductCard 组件（商品卡片）

**文件**：`js/components/productCard.js`

### 它在干嘛
渲染一张商品卡——图、名、描述、规格按钮（小/中/大杯）、价格、加购按钮，还有右上角那颗收藏爱心。这个组件是菜单页出现次数最多的组件，既在"我的常点"区用，也在正常商品列表里用。

### 数据流向
| 方向 | 数据源/目标 | 说明 |
|------|-------------|------|
| **读** | `APP_DATA.getProductsByCategory(cat)` | 按分类取商品列表 |
| **读** | `APP_STATE.isFavorited(pid)` → `favStore.get()` | 爱心空心/实心 |
| **读** | `APP_STATE.getProductCartQty(pid)` → `cartStore.get()` | 卡片右下角显示已加购几件 |
| **读** | `APP_STATE.getState().selectedSizes[pid]` | 该商品当前选的规格 |
| **写** | `APP_STATE.setSize(pid, size)` | 用户点规格按钮 |
| **写** | `APP_STATE.toggleFavorite(pid)` → `favStore.update(...)` | 用户点爱心 |
| **写** | `APP_STATE.addToCart(pid)` / `updateQuantity(...)` → `cartStore.update(...)` | 用户点加购/减号 |

### 生命周期
| 方法 | 什么时候被调 | 做了什么 |
|------|--------------|----------|
| `init()` | `MenuPage.init()` 里第二个被调 | 先 `render()` 画主列表，然后**绑两套事件委托**（主列表 + 常点区），再订阅两个变化源 |
| `render()` | init 时 + 全局状态变化时（规格/购物车变了） | 只重画 `#product-list` 主列表，不碰"我的常点"区 |
| `renderOne(product, state, index)` | 被 `render()` 和 `MenuPage.renderFavorites()` 调用 | 返回单张卡片的 HTML 字符串，不操作 DOM |
| `bindEvents(container)` | `MenuPage.renderFavorites()` 常点区重画后调用 | 给传入的容器绑**事件委托**（幂等，重复调没事） |
| `refreshHearts(root)` | `favStore` 变化时 + `MenuPage.onEnter()` 时 | **只更新所有爱心按钮的 SVG**，不全量重渲染，避免状态错位 |

### 事件委托机制（修复爱心状态 bug 的关键）
之前是每次 `innerHTML` 覆盖后 `querySelectorAll` 逐个 `addEventListener`，时序不对就会丢事件。现在是在容器上绑**一次** click，用 `e.target.closest('.product-card__fav')` 这种方式分发：

```
用户点击爱心
    ↓
容器捕获 click 事件
    ↓
e.target.closest('.product-card__fav') 命中了
    ↓
e.stopPropagation()  （拦住，别冒泡到加购按钮）
    ↓
调 APP_STATE.toggleFavorite(pid)
```

规格按钮、加购按钮、减号按钮都是同样的套路。**只有爱心按钮拦了 stopPropagation**，其他按钮按需求正常冒泡。

---

## 五、CartBar 组件（底部购物车栏）

**文件**：`js/components/cartBar.js`

### 它在干嘛
固定在屏幕最底下的一条，左边是购物车图标带红色数字角标，中间显示合计金额，右边是焦糖色的「去结算」按钮（购物车空了就变灰禁用）。点任何地方都打开 CartPopup。

### 数据流向
| 方向 | 数据源/目标 | 说明 |
|------|-------------|------|
| **读** | `APP_STATE.getCartCount()` → `cartStore.get()` | 角标数字（超过 99 显示 99+） |
| **读** | `APP_STATE.getCartTotal()` → `cartStore.get()` | 合计金额 |
| **写** | 无 | 只读，写操作交给 CartPopup |

### 生命周期
| 方法 | 什么时候被调 | 做了什么 |
|------|--------------|----------|
| `init(onOpenCart)` | `MenuPage.init()` 里第三个被调，传一个打开弹层的回调 | 存回调，`render()` 一次，订阅全局变化；`_inited` 守卫防重复订阅 |
| `render()` | init 时 + 每次 cartStore 变化时 | 全量重画 bar，给图标和按钮绑 click（触发传入的 `onOpenCart` 回调） |

---

## 六、CartPopup 组件（半屏购物车弹层）

**文件**：`js/components/cartPopup.js`

### 它在干嘛
从底部滑上来的半屏弹层，分四块：购物车明细（调数量）、取餐时间选择（立即出餐 / 10 分钟 / 20 分钟）、口味备注（标签 + 文本框）、底部的提交按钮。点黑色遮罩或者提交成功就关掉。

### 数据流向
| 方向 | 数据源/目标 | 说明 |
|------|-------------|------|
| **读** | `APP_STATE.getState().cart` → `cartStore.get()` | 购物车明细 |
| **读** | `APP_STATE.getState().pickupTimeId` | 当前选的取餐时间 |
| **读** | `APP_STATE.getState().activeNoteTags` | 选中的口味标签 |
| **读** | `APP_STATE.getState().orderNote` | 用户填的文字备注 |
| **读** | `APP_STATE.getCartTotal()` / `getCartCount()` | 金额和件数 |
| **写** | `APP_STATE.updateQuantity(key, delta)` → `cartStore.update(...)` | 调数量 |
| **写** | `APP_STATE.clearCart()` → `cartStore.set([])` | 清空 |
| **写** | `APP_STATE.setPickupTime(id)` | 选取餐时间 |
| **写** | `APP_STATE.toggleNoteTag(tag)` / `setOrderNote(text)` | 写备注 |
| **写** | `APP_STATE.submitOrder()` | 提交，内部清空购物车、存最近订单、生成取单号 |

### 生命周期
| 方法 | 什么时候被调 | 做了什么 |
|------|--------------|----------|
| `init(onOrderSuccess)` | `MenuPage.init()` 里第四个被调，传提交成功后的跳转回调 | 存回调，给遮罩绑 click 关弹层，订阅全局变化但加了 `if (_open) render()` 守卫——弹层关着的时候白跑，省性能 |
| `open()` | CartBar 被点击时 | 显示遮罩和弹层，`document.body.style.overflow = 'hidden'` 禁止背景滚动，调一次 `render()` |
| `render()` | open 时 + 弹层开着时任何状态变化时 | 全量重画弹层内部（如果购物车空了就只显示空空提示，不画后面三块），然后绑事件 |
| `close()` | 遮罩被点击 / 提交成功时 | 隐藏遮罩和弹层，恢复 body 滚动 |

### 新人注意
- 弹层的 DOM 节点 `#cart-popup` 和 `#cart-popup-mask` 是 `index.html` 写死的，组件只控制 `hidden` class
- 提交订单用了 `setTimeout` 模拟 600ms 的后端请求延迟，`_submitting` 标志防重复点

---

## 七、MenuPage 页面组件（菜单页）

**文件**：`js/pages/menuPage.js`

### 它在干嘛
上面 4 个小组件的"包工头"，自己不渲染具体业务 UI，只负责：
1. 按顺序调 4 个组件的 `init()`
2. 管理"我的常点"这块区域——上面 4 个组件谁都不管这个，MenuPage 自己来

### "我的常点"区的特殊之处
这块不是 `index.html` 里写死的，是 MenuPage 动态创建/销毁的：

- 用户有收藏：`_ensureFavContainer()` 动态创建 `<div id="favorites-section">`，插到 header 和 product-list 之间，然后往里渲染收藏的商品卡（复用 `ProductCardComponent.renderOne` 生成 HTML + `bindEvents` 绑事件委托）
- 用户把最后一个收藏也取消了：`container.outerHTML = ''` 把整块 DOM 删掉，下面商品列表的 `paddingTop` 还原

### 数据流向
| 方向 | 数据源/目标 | 说明 |
|------|-------------|------|
| **读** | `APP_STATE.getFavorites()` → `favStore.get()` | 收藏了哪些商品 |
| **写** | 无 | 不直接写，收藏的写操作在 ProductCard 的爱心点击里 |

### 生命周期
| 方法 | 什么时候被调 | 做了什么 |
|------|--------------|----------|
| `init()` | 路由第一次进入菜单页时（`APP_ROUTER` 里调） | 依次 `HeaderComponent.init()` → `ProductCardComponent.init()` → `CartBarComponent.init()` → `CartPopupComponent.init()`，然后 `renderFavorites()`，最后**只订阅 `favStore` 的变化**（不订阅全局，避免购物车变化时白看重画常点区） |
| `onEnter()` | 每次路由回到菜单页（比如从确认页退回来） | 调 `renderFavorites()` + `ProductCardComponent.refreshHearts()` 同步一下爱心状态 |
| `renderFavorites()` | init 时 + favStore 变化时 + onEnter 时 | 根据收藏列表动态创建/销毁"我的常点"整块 DOM |

---

## 八、提交订单 → 跳转确认页

用户在 CartPopup 里点了「提交订单」，600ms 后：

1. `APP_STATE.submitOrder()` 被调：
   - 从 `cartStore.get()` 读购物车
   - 生成取单号（A001 → A002 → ... 每天重置）
   - 组装订单对象，存到 `_state.lastOrder` + localStorage
   - `clearCart()` 清空 `cartStore`、备注、取餐时间
2. `CartPopupComponent.close()` 关掉弹层
3. 调 `onOrderSuccess(order)` 回调 → `APP_ROUTER.navigate('/order/A001')`
4. Hash 变成 `#/order/A001`，路由切换：
   - `MenuPage` 没有 `destroy()` 被调（组件目前设计上是常驻的，因为 SPA 只有两个页面来回跳）
   - `OrderConfirmPage.onEnter()` 被调，开始渲染订单确认页

### OrderConfirmPage 页面组件
**文件**：`js/pages/orderConfirmPage.js`

这个页面比较简单，没有复用 components 目录下的任何小组件（因为确认页没有商品卡、没有购物车栏），只依赖：
- `APP_STATE.getLastOrder()` 读订单数据
- `APP_DATA` 读商品数据
- `APP_ROUTER.back()` 提供"继续点单"按钮回菜单页

确认页渲染完了就展示取单号、预计等待时间、订单明细、取餐时间。

---

## 九、State Store 与组件之间的数据流向全景

### createStore 工厂
所有需要持久化的数据都用 `state.js` 里的 `createStore(storageKey, initialValue)` 造，目前有两个实例：

| Store | localStorage key | 初始值 | 管什么 |
|-------|------------------|--------|--------|
| `cartStore` | `nax_cafe_cart_v1` | `[]` | 购物车数组 `[{_key, productId, name, price, quantity, ...}]` |
| `favStore` | `nax_cafe_favorites_v1` | `[]` | 收藏商品ID数组 `['c1', 'c4']` |

每个 Store 自带 6 个方法：

| 方法 | 做什么 |
|------|--------|
| `get()` | 返回当前数据快照 |
| `set(newVal)` | 直接替换整个数据，自动 persist + notify |
| `update(mutator)` | 传个函数进去原地改或者返回新值，自动 persist + notify |
| `subscribe(fn)` | 订阅变化，返回取消订阅的函数 |
| `persist()` | 手动存 localStorage（一般内部自动调） |
| `restore()` | 从 localStorage 恢复（init 时调一次） |

### 数据流图

```
┌──────────────────────────────────────────────────────────┐
│                    用户点击/输入                           │
└────────────┬─────────────────────────────────────────────┘
             │ 调 APP_STATE 暴露的方法
             ▼
┌──────────────────────────────────────────────────────────┐
│  APP_STATE.addToCart()                                    │
│  APP_STATE.toggleFavorite()                               │
│  APP_STATE.setSize()                                      │
│  ...（22 个对外方法，都在 state.js return 里声明）         │
└────────────┬─────────────────────────────────────────────┘
             │ 内部调用
             ▼
┌─────────────┐         ┌─────────────┐
│ cartStore   │         │ favStore    │
│ .update(..) │         │ .update(..) │
└──────┬──────┘         └──────┬──────┘
       │                       │
       ├─ persist()            ├─ persist()
       │  (localStorage)       │  (localStorage)
       │                       │
       └─ notify() ──────┬─────┘
                         │ 各自的订阅者收到通知
                         ▼
┌──────────────────────────────────────────────────────────┐
│  组件层的订阅回调                                          │
│                                                            │
│  cartStore.subscribe:                                      │
│    → ProductCard（全量重画主列表，因为购物车数量变了）       │
│    → CartBar（更新角标和金额）                              │
│    → CartPopup（开着的话重画弹层内容）                      │
│                                                            │
│  favStore.subscribe:                                       │
│    → ProductCard._refreshHearts（只换爱心 SVG）            │
│    → MenuPage.renderFavorites（增删"我的常点"卡片）         │
│                                                            │
│  全局 APP_STATE.subscribe:                                 │
│    → Header（分类 Tab / 桌号变了才需要）                    │
└──────────────────────────────────────────────────────────┘
```

关键点：**组件永远只调 `APP_STATE` 暴露的方法，不直接碰 cartStore / favStore**。只有 ProductCard 和 MenuPage 为了精确订阅才直接调 `_stores.favStore.subscribe()`（带 `_` 前缀表示内部使用）。

---

## 十、照葫芦画瓢：加一个新组件

假设你要加一个「优惠券弹窗」组件，叫 `CouponPopup`。按这个套路来：

### Step 1：数据层（state.js）
如果优惠券需要持久化，就加个新 Store：
```javascript
const couponStore = createStore('nax_cafe_coupon_v1', { selectedId: null, list: [] });
```
然后在 return 里暴露读写方法（`selectCoupon(id)`、`getSelectedCoupon()` 之类）。

如果不需要持久化，直接往 `_state` 里加字段就行。

### Step 2：组件层（`js/components/couponPopup.js`）
套 ProductCard / CartPopup 的模板：

```javascript
window.CouponPopupComponent = (function () {
  let _inited = false;    // 去重守卫
  let _unsub = null;      // 存取消订阅的句柄

  function render() {
    // 读 APP_STATE，innerHTML 全量画，或者局部更新
  }

  function init(onSelectCoupon) {
    if (_inited) return;   // 守卫第一行就写
    _inited = true;
    render();
    _unsub = window.APP_STATE.subscribe(() => {
      if (_open) render(); // 弹层关着就白跑
    });
  }

  function destroy() {     // 顺手加一个，好习惯
    if (_unsub) { _unsub(); _unsub = null; }
    _inited = false;
  }

  return { init, destroy, render, open, close };
})();
```

### Step 3：页面层
在 `MenuPage.init()`（或者你新加的页面）里调 `CouponPopupComponent.init(回调)`，需要时手动 `open()` / `close()`。

### Step 4：DOM 层
如果组件需要挂载节点，在 `index.html` 里加个空容器 `<div id="coupon-popup" class="hidden"></div>`，或者像 MenuPage 的"我的常点"那样动态 createElement。

---

## 十一、照葫芦画瓢：加一个新页面

假设要加一个「我的订单」页面，路由 `#/orders`：

### Step 1：页面文件
新建 `js/pages/myOrdersPage.js`，套 OrderConfirmPage 的模板：
```javascript
window.MyOrdersPage = (function () {
  function init() {
    // 如果这个页面需要复用 ProductCard / CartBar 等组件，在这里调它们的 init()
  }

  function onEnter() {
    // 每次路由进入时调，读数据 + 画 DOM
  }

  return { init, onEnter };
})();
```

### Step 2：注册路由
在 `js/router.js` 的路由表里加一条：
```javascript
routes: {
  '/menu': 'MenuPage',
  '/order/:orderNo': 'OrderConfirmPage',
  '/orders': 'MyOrdersPage'   // 加这行
}
```

### Step 3：加载脚本
在 `index.html` 的 `<script>` 标签里按顺序把新页面文件加上（放在 `router.js` 之后、`app.js` 之前）。

---

## 十二、文件结构速查

```
project171/
├── index.html                  # 入口 HTML，写死了 header / product-list / cart-bar / cart-popup 等容器
├── css/
│   └── style.css               # 所有样式（CSS Variables + BEM 命名）
└── js/
    ├── data.js                 # 静态数据：12 个商品、分类、取餐时间、备注标签
    ├── state.js                # 全局状态：createStore 工厂 + cartStore + favStore + 22 个对外方法
    ├── router.js               # Hash 路由，解析 #/menu 和 #/order/:orderNo
    ├── components/
    │   ├── header.js           # 店名 + 桌号 + 分类 Tab
    │   ├── productCard.js      # 商品卡片（规格/爱心/加购，事件委托）
    │   ├── cartBar.js          # 底部购物车栏（角标 + 金额）
    │   └── cartPopup.js        # 半屏购物车弹层（明细/时间/备注/提交）
    ├── pages/
    │   ├── menuPage.js         # 菜单页：4 个组件的包工头 + 管"我的常点"区
    │   └── orderConfirmPage.js # 订单确认页：取单号/等待时间/明细
    └── app.js                  # 应用入口：依次 init state / router / 页面
```

---

> 看完这份文档，再配合代码里的注释，应该能快速上手。改组件时记得两件事：
> 1. `init()` 第一行写 `if (_inited) return` 防重复订阅
> 2. 能订阅单个 store 就别订阅全局 `APP_STATE`，减少不必要的重渲染
