export interface CategoryIntent {
  category: string;
  angles: string[];
  styles: string[];
  usages: string[];
  objectVariations: string[];
}

export const CATEGORY_INTENTS: CategoryIntent[] = [
  {
    category: 'ramen',
    angles: ['top view', 'side view', 'isometric view', 'close up'],
    styles: ['realistic', 'clipart', 'watercolor', 'minimalist', 'icon', '3d render', 'flat design'],
    usages: ['transparent png', 'isolated on white', 'menu style', 'sticker design', 'banner composition', 'ad creative'],
    objectVariations: ['spicy', 'miso', 'shoyu', 'tonkotsu', 'with egg', 'with chashu', 'black bowl', 'red bowl', 'chopsticks lifting noodles']
  },
  {
    category: 'sushi',
    angles: ['top view', 'side view', 'angled view'],
    styles: ['realistic', 'clipart', 'watercolor', 'minimalist', 'icon', '3d render'],
    usages: ['transparent png', 'isolated on white', 'sticker design', 'menu style'],
    objectVariations: ['salmon nigiri', 'tuna nigiri', 'sushi roll', 'maki', 'sushi platter', 'with chopsticks', 'with soy sauce', 'wooden geta tray']
  },
  {
    category: 'tempura',
    angles: ['top view', 'side view', 'close up'],
    styles: ['realistic', 'clipart', 'watercolor', 'minimalist'],
    usages: ['transparent png', 'isolated on white', 'sticker design', 'menu style'],
    objectVariations: ['shrimp tempura', 'vegetable tempura', 'tempura bowl (tendon)', 'with dipping sauce', 'crispy golden', 'on bamboo basket']
  },
  {
    category: 'gyoza',
    angles: ['top view', 'side view', 'angled view'],
    styles: ['realistic', 'clipart', 'watercolor', 'icon'],
    usages: ['transparent png', 'isolated on white', 'sticker design', 'menu style'],
    objectVariations: ['pan-fried', 'steamed', 'gyoza plate', 'with dipping sauce', 'chopsticks holding gyoza', 'crispy bottom']
  },
  {
    category: 'mochi',
    angles: ['top view', 'side view', 'isometric view'],
    styles: ['realistic', 'clipart', 'watercolor', 'kawaii', 'icon'],
    usages: ['transparent png', 'isolated on white', 'sticker design', 'social media graphic'],
    objectVariations: ['strawberry daifuku', 'matcha mochi', 'sakura mochi', 'three-color dango', 'with kinako', 'stretching mochi']
  },
  {
    category: 'bento',
    angles: ['top view', 'isometric view', 'angled view'],
    styles: ['realistic', 'clipart', 'watercolor', 'minimalist'],
    usages: ['transparent png', 'isolated on white', 'menu style', 'banner composition'],
    objectVariations: ['traditional wooden box', 'plastic lunch box', 'ekiben', 'makunouchi', 'kawaii character bento', 'with rice and umeboshi']
  },
  {
    category: 'torii',
    angles: ['front view', 'angled view', 'low angle'],
    styles: ['realistic', 'clipart', 'watercolor', 'silhouette', 'flat design'],
    usages: ['transparent png', 'isolated on white', 'travel banner', 'sticker design'],
    objectVariations: ['red torii gate', 'floating torii', 'stone torii', 'with cherry blossoms', 'with sunset background', 'snow covered']
  },
  {
    category: 'sakura',
    angles: ['close up', 'branch view', 'falling petals'],
    styles: ['realistic', 'clipart', 'watercolor', 'minimalist', 'flat design'],
    usages: ['transparent png', 'isolated on white', 'spring banner', 'decorative element', 'corner frame'],
    objectVariations: ['single flower', 'branch with blossoms', 'falling petals', 'cherry blossom tree', 'pink buds']
  },
  {
    category: 'matcha',
    angles: ['top view', 'side view', 'close up'],
    styles: ['realistic', 'clipart', 'watercolor', 'minimalist'],
    usages: ['transparent png', 'isolated on white', 'menu style', 'sticker design', 'social media graphic'],
    objectVariations: ['matcha tea bowl', 'with bamboo whisk', 'matcha latte', 'matcha ice cream', 'spilled matcha powder', 'traditional tea ceremony set']
  },
  {
    category: 'japanese-pattern',
    angles: ['flat top view', 'tiled'],
    styles: ['seamless', 'traditional', 'modern minimal', 'gold foil'],
    usages: ['transparent png', 'background texture', 'isolated on white', 'decorative border'],
    objectVariations: ['seigaiha (waves)', 'asanoha (hemp leaf)', 'ichimatsu (checkered)', 'shippo', 'karakusa', 'yagasuri']
  }
];
