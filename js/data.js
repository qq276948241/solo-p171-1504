/* ================================
   数据层 - 商品数据与常量
   ================================ */
window.APP_DATA = (function () {
  const SIZE_MAP = {
    small:  { label: '小杯', add: 0 },
    medium: { label: '中杯', add: 3 },
    large:  { label: '大杯', add: 6 }
  };

  const DESSERT_SIZE = {
    single: { label: '一份', add: 0 }
  };

  const PRODUCTS = [
    {
      id: 'c1',
      name: '手冲埃塞俄比亚',
      category: 'coffee',
      description: '花香果酸，茉莉花与柑橘调性',
      basePrice: 22,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pour%20over%20coffee%20in%20ceramic%20cup%20on%20wooden%20table%2C%20warm%20lighting%2C%20cafe%20aesthetic%2C%20minimalist%20style%2C%20close%20up%2C%20professional%20food%20photography&image_size=square',
      sizes: ['small', 'medium', 'large']
    },
    {
      id: 'c2',
      name: '焦糖玛奇朵',
      category: 'coffee',
      description: '香草与焦糖交织，绵密奶泡',
      basePrice: 20,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=caramel%20macchiato%20coffee%20latte%20with%20caramel%20drizzle%20in%20clear%20glass%2C%20beautiful%20layers%2C%20warm%20cafe%20background%2C%20professional%20food%20photography&image_size=square',
      sizes: ['small', 'medium', 'large']
    },
    {
      id: 'c3',
      name: '燕麦拿铁',
      category: 'coffee',
      description: '燕麦奶醇香，丝滑顺口低卡',
      basePrice: 24,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=oat%20milk%20latte%20coffee%20with%20beautiful%20latte%20art%20in%20white%20ceramic%20cup%2C%20cozy%20cafe%20setting%2C%20soft%20natural%20lighting%2C%20professional%20photography&image_size=square',
      sizes: ['small', 'medium', 'large']
    },
    {
      id: 'c4',
      name: '冰美式',
      category: 'coffee',
      description: '双份浓缩，清爽回甘',
      basePrice: 15,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iced%20americano%20coffee%20in%20tall%20glass%20with%20ice%20cubes%20and%20water%20droplets%2C%20summer%20refreshing%20drink%2C%20cafe%20background%2C%20professional%20photography&image_size=square',
      sizes: ['small', 'medium', 'large']
    },
    {
      id: 't1',
      name: '桂花乌龙',
      category: 'tea',
      description: '金桂飘香，乌龙回甘悠长',
      basePrice: 16,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=osmanthus%20oolong%20tea%20in%20elegant%20glass%20teacup%20with%20floating%20osmanthus%20flowers%2C%20chinese%20tea%20aesthetic%2C%20soft%20lighting%2C%20professional%20photography&image_size=square',
      sizes: ['small', 'medium', 'large']
    },
    {
      id: 't2',
      name: '荔枝气泡茶',
      category: 'tea',
      description: '鲜甜荔枝果肉，气泡清爽',
      basePrice: 20,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lychee%20sparkling%20iced%20tea%20with%20fresh%20lychee%20fruit%20and%20mint%20in%20tall%20glass%2C%20summer%20refreshing%20drink%2C%20beautiful%20presentation%2C%20professional%20food%20photography&image_size=square',
      sizes: ['small', 'medium', 'large']
    },
    {
      id: 't3',
      name: '芋泥波波奶茶',
      category: 'tea',
      description: '手捣芋泥，Q弹珍珠',
      basePrice: 18,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=taro%20bubble%20milk%20tea%20with%20tapioca%20pearls%20and%20mashed%20taro%20layers%20in%20clear%20cup%2C%20purple%20aesthetic%2C%20asian%20boba%20tea%2C%20professional%20photography&image_size=square',
      sizes: ['small', 'medium', 'large']
    },
    {
      id: 't4',
      name: '蜂蜜柚子茶',
      category: 'tea',
      description: '韩国柚子蜜，维C满满',
      basePrice: 16,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=honey%20citron%20tea%20yuzu%20tea%20in%20transparent%20cup%20with%20yuzu%20peel%2C%20golden%20color%2C%20cozy%20warm%20drink%2C%20cafe%20setting%2C%20professional%20photography&image_size=square',
      sizes: ['small', 'medium', 'large']
    },
    {
      id: 'd1',
      name: '经典提拉米苏',
      category: 'dessert',
      description: '马斯卡彭芝士，咖啡酒香',
      basePrice: 28,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tiramisu%20dessert%20in%20elegant%20ceramic%20dish%20with%20cocoa%20powder%20dusting%2C%20italian%20dessert%2C%20cafe%20plate%20presentation%2C%20professional%20food%20photography&image_size=square',
      sizes: ['single']
    },
    {
      id: 'd2',
      name: '巴斯克芝士蛋糕',
      category: 'dessert',
      description: '焦香外皮，绵密内芯',
      basePrice: 26,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=basque%20burnt%20cheesecake%20slice%20with%20caramelized%20top%20on%20white%20plate%2C%20creamy%20interior%2C%20cafe%20dessert%2C%20professional%20food%20photography&image_size=square',
      sizes: ['single']
    },
    {
      id: 'd3',
      name: '抹茶千层蛋糕',
      category: 'dessert',
      description: '宇治抹茶粉，层层奶油',
      basePrice: 30,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=matcha%20mille%20crepe%20cake%20slice%20with%20green%20tea%20powder%20dusting%20and%20red%20bean%20on%20top%2C%20elegant%20layers%2C%20japanese%20dessert%2C%20professional%20photography&image_size=square',
      sizes: ['single']
    },
    {
      id: 'd4',
      name: '可颂三明治',
      category: 'dessert',
      description: '培根生菜番茄，酥脆可颂',
      basePrice: 24,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=croissant%20sandwich%20with%20bacon%20lettuce%20tomato%20BLT%20on%20wooden%20cutting%20board%2C%20flaky%20golden%20croissant%2C%20brunch%20food%2C%20professional%20food%20photography&image_size=square',
      sizes: ['single']
    }
  ];

  const PICKUP_TIMES = [
    { id: 'now',     label: '立即取',  timeDesc: '约8分钟',   minutes: 8 },
    { id: '15min',   label: '15分钟后', timeDesc: '约15分钟',  minutes: 15 },
    { id: '30min',   label: '30分钟后', timeDesc: '约30分钟',  minutes: 30 },
    { id: '60min',   label: '1小时后',  timeDesc: '约60分钟',  minutes: 60 }
  ];

  const NOTE_TAGS = ['少冰', '去冰', '少糖', '半糖', '无糖', '不要奶盖', '加珍珠', '多奶泡'];

  const CATEGORIES = [
    { id: 'coffee',  label: '咖啡' },
    { id: 'tea',     label: '茶饮' },
    { id: 'dessert', label: '甜点' }
  ];

  function getProductsByCategory(category) {
    return PRODUCTS.filter(p => p.category === category);
  }

  function getProductById(id) {
    return PRODUCTS.find(p => p.id === id);
  }

  function getPrice(product, size) {
    const sizeInfo = size === 'single'
      ? DESSERT_SIZE[size]
      : SIZE_MAP[size];
    return product.basePrice + (sizeInfo ? sizeInfo.add : 0);
  }

  function getSizeLabel(product, size) {
    if (product.category === 'dessert') {
      return DESSERT_SIZE[size]?.label || '一份';
    }
    return SIZE_MAP[size]?.label || '中杯';
  }

  function getAvailableSizes(product) {
    if (product.category === 'dessert') {
      return [{ id: 'single', label: DESSERT_SIZE.single.label }];
    }
    return product.sizes.map(id => ({ id, label: SIZE_MAP[id].label }));
  }

  function formatPrice(price) {
    return price.toFixed(0);
  }

  return {
    PRODUCTS,
    SIZE_MAP,
    DESSERT_SIZE,
    PICKUP_TIMES,
    NOTE_TAGS,
    CATEGORIES,
    getProductsByCategory,
    getProductById,
    getPrice,
    getSizeLabel,
    getAvailableSizes,
    formatPrice
  };
})();
