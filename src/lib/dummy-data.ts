import { Asset, Category } from "@/types";

export const dummyCategories: Category[] = [
  { id: "1", name: "日本の食", slug: "japanese-food", count: 120 },
  { id: "2", name: "医療・歯科", slug: "medical-dental", count: 85 },
  { id: "3", name: "事務用品", slug: "office-supplies", count: 64 },
  { id: "4", name: "年中行事", slug: "annual-events", count: 92 },
  { id: "5", name: "日本の日常小物", slug: "daily-items", count: 110 },
];

// Generation helper to ensure exactly 100 ultra-premium items for Programmatic SEO
const foodNames = [
  { slug: "ramen-shoyu", title: "醤油ラーメン", tags: ["ラーメン", "和食", "麺類", "屋台"] },
  { slug: "sushi-tuna", title: "中トロ握り寿司", tags: ["寿司", "マグロ", "高級", "和食"] },
  { slug: "takoyaki-balls", title: "屋台たこ焼き", tags: ["たこ焼き", "屋台", "大阪", "B級グルメ"] },
  { slug: "tempura-shrimp", title: "海老天ぷら", tags: ["天ぷら", "海老", "揚げ物", "和食"] },
  { slug: "wagashi-cherry", title: "桜餅・和菓子", tags: ["和菓子", "桜餅", "春", "スイーツ"] },
  { slug: "matcha-premium", title: "本格京都抹茶", tags: ["抹茶", "日本茶", "茶道", "お茶"] },
  { slug: "bento-makunouchi", title: "特製幕の内弁当", tags: ["弁当", "幕の内", "ランチ", "和風"] },
  { slug: "gyoza-crispy", title: "羽付き餃子", tags: ["餃子", "中華", "おつまみ", "人気"] },
  { slug: "misoshiru-tofu", title: "豆腐とわかめの味噌汁", tags: ["味噌汁", "和食", "朝食", "汁物"] },
  { slug: "yakitori-negima", title: "炭火焼き鳥（ねぎま）", tags: ["焼き鳥", "鶏肉", "居酒屋", "おつまみ"] },
  { slug: "udon-kitsune", title: "きつねうどん", tags: ["うどん", "和食", "麺類", "ランチ"] },
  { slug: "soba-zaru", title: "ざるそば", tags: ["そば", "和食", "麺類", "ヘルシー"] },
  { slug: "karaage-golden", title: "若鶏の唐揚げ", tags: ["唐揚げ", "鶏肉", "お弁当", "居酒屋"] },
  { slug: "curry-katsu", title: "カツカレー", tags: ["カレー", "カツ", "洋食", "定番"] },
  { slug: "sashimi-platter", title: "新鮮刺身盛り合わせ", tags: ["刺身", "マグロ", "サーモン", "高級"] },
  { slug: "taiyaki-classic", title: "鯛焼き（つぶあん）", tags: ["たい焼き", "スイーツ", "和風", "おやつ"] },
  { slug: "dango-three-color", title: "三色三色花見団子", tags: ["団子", "花見", "スイーツ", "春"] },
  { slug: "yakiniku-galbi", title: "極上カルビ焼肉", tags: ["焼肉", "カルビ", "肉料理", "高級"] },
  { slug: "sushiset-deluxe", title: "特選握り寿司セット", tags: ["寿司", "和食", "ランチ", "宴会"] },
  { slug: "sake-premium", title: "純米大吟醸 日本酒", tags: ["日本酒", "お酒", "和風", "居酒屋"] }
];

const japanNames = [
  { slug: "fujisan-view", title: "富士山と赤富士", tags: ["富士山", "世界遺産", "日本一", "シンボル"] },
  { slug: "sakura-bloom", title: "満開の桜の花", tags: ["桜", "春", "お花見", "ピンク"] },
  { slug: "torii-gate", title: "厳島神社風の赤鳥居", tags: ["鳥居", "神社", "パワースポット", "伝統"] },
  { slug: "jinja-shrine", title: "伝統的日本神社本殿", tags: ["神社", "寺院", "伝統", "参拝"] },
  { slug: "katana-blade", title: "漆黒の日本刀（侍刀）", tags: ["日本刀", "侍", "刀", "武器"] },
  { slug: "wagasa-red", title: "京和傘（蛇の目傘）", tags: ["和傘", "京都", "伝統工芸", "和風"] },
  { slug: "chochin-lantern", title: "祭り赤提灯", tags: ["提灯", "祭り", "屋台", "夜市"] },
  { slug: "manekineko-gold", title: "招き猫（千客万来）", tags: ["招き猫", "縁起物", "金運", "商売繁盛"] },
  { slug: "daruma-red", title: "必勝祈願の赤だるま", tags: ["だるま", "縁起物", "合格祈願", "伝統"] },
  { slug: "tatami-mat", title: "純国産い草畳", tags: ["畳", "和室", "インテリア", "日本家具"] },
  { slug: "shuriken-star", title: "忍者手裏剣（金属製）", tags: ["手裏剣", "忍者", "武器", "甲賀"] },
  { slug: "shinkansen-train", title: "超高速新幹線車両", tags: ["新幹線", "鉄道", "交通", "ハイテク"] },
  { slug: "tokyotower-red", title: "夜空の東京タワー", tags: ["東京タワー", "東京", "観光地", "ランドマーク"] },
  { slug: "japanmap-gold", title: "日本列島ゴールドマップ", tags: ["日本地図", "地図", "ゴールド", "ビジネス"] },
  { slug: "matsuri-taiko", title: "お祭り大太鼓", tags: ["祭り", "太鼓", "和楽器", "演奏"] },
  { slug: "kabuto-helmet", title: "戦国武将の兜・甲冑", tags: ["兜", "甲冑", "戦国時代", "侍"] },
  { slug: "sensu-fan", title: "金箔の扇子", tags: ["扇子", "舞踊", "和風小物", "お正月"] },
  { slug: "koinobori-flag", title: "端午の節句 鯉のぼり", tags: ["鯉のぼり", "子供の日", "年中行事", "5月"] },
  { slug: "kimono-furisode", title: "伝統的な振袖着物", tags: ["着物", "振袖", "成人式", "伝統衣装"] },
  { slug: "kokeshi-doll", title: "伝統木製こけし人形", tags: ["こけし", "郷土玩具", "民芸品", "木製"] }
];

const businessNames = [
  { slug: "businessman-suit", title: "ビジネスパーソン（男性スーツ）", tags: ["ビジネスマン", "スーツ", "男性", "笑顔"] },
  { slug: "businesswoman-suit", title: "ビジネスパーソン（女性スーツ）", tags: ["ビジネスウーマン", "スーツ", "女性", "キャリア"] },
  { slug: "office-meeting", title: "オフィスのブレインストーミング", tags: ["会議", "オフィス", "ディスカッション", "チーム"] },
  { slug: "ai-chip", title: "次世代AIプロセッサチップ", tags: ["AI", "人工知能", "半導体", "ハイテク"] },
  { slug: "cloud-server", title: "セキュアクラウドデータベース", tags: ["クラウド", "サーバー", "データ管理", "IT"] },
  { slug: "contract-signature", title: "電子契約書と署名印", tags: ["契約書", "電子署名", "ビジネス", "信頼"] },
  { slug: "business-chart", title: "売上急成長3D棒グラフ", tags: ["グラフ", "売上分析", "成長", "データ"] },
  { slug: "smartphone-new", title: "最新スマートデバイスベゼル", tags: ["スマホ", "ガジェット", "モバイル", "通信"] },
  { slug: "laptop-pc", title: "超薄型アルミノートPC", tags: ["PC", "ノートパソコン", "ワークプレイス", "ガジェット"] },
  { slug: "server-rack", title: "データセンターサーバーラック", tags: ["サーバー", "データセンター", "ホスティング", "インフラ"] },
  { slug: "data-dashboard", title: "マーケティング分析画面", tags: ["データ分析", "ダッシュボード", "解析", "統計"] },
  { slug: "hanko-stamp", title: "日本の印鑑・朱肉", tags: ["印鑑", "はんこ", "契約", "伝統"] },
  { slug: "office-chair", title: "エルゴノミクスオフィスチェア", tags: ["オフィスチェア", "家具", "ワークスペース", "疲労軽減"] },
  { slug: "business-shake", title: "信頼のビジネス握手", tags: ["握手", "パートナーシップ", "契約", "成功"] },
  { slug: "badge-id", title: "社員証・ICカードホルダー", tags: ["社員証", "セキュリティ", "カード", "ID"] },
  { slug: "whiteboard-flow", title: "アイデア手書きホワイトボード", tags: ["ホワイトボード", "フローチャート", "アイデア", "企画"] },
  { slug: "business-card", title: "高級和紙名刺ホルダー", tags: ["名刺", "名刺入れ", "挨拶", "ビジネス小物"] },
  { slug: "calendar-schedule", title: "デジタルカレンダー予定表", tags: ["カレンダー", "予定", "タスク", "スケジュール"] },
  { slug: "money-yen", title: "一万円札（日本円スタック）", tags: ["日本円", "紙幣", "お金", "ビジネス"] },
  { slug: "calculator-pro", title: "プロフェッショナル事務用電卓", tags: ["電卓", "会計", "経理", "事務用品"] }
];

const medicalNames = [
  { slug: "hospital-building", title: "最先端医療総合病院ビル", tags: ["病院", "医療機関", "ビル", "クリニック"] },
  { slug: "doctor-stethoscope", title: "白衣を着たベテラン医師", tags: ["医者", "白衣", "聴診器", "男性"] },
  { slug: "nurse-scrubs", title: "笑顔のスクラブ看護師", tags: ["看護師", "スクラブ", "女性", "ヘルスケア"] },
  { slug: "carte-tablet", title: "電子カルテ用タブレット", tags: ["電子カルテ", "医療データ", "スマート医療", "DX"] },
  { slug: "medicine-bottle", title: "処方錠剤と薬瓶", tags: ["薬", "処方箋", "サプリメント", "健康"] },
  { slug: "dentist-chair", title: "最新歯科ユニット治療用チェア", tags: ["歯科", "歯医者", "治療器具", "クリニック"] },
  { slug: "mri-scanner", title: "高解像度MRI全身スキャン装置", tags: ["MRI", "医療機器", "精密検査", "がん検診"] },
  { slug: "ecg-monitor", title: "心電図波形モニター画面", tags: ["心電図", "バイタルサイン", "心拍", "救急医療"] },
  { slug: "ambulance-jp", title: "日本の高規格救急車", tags: ["救急車", "緊急車両", "消防", "救命士"] },
  { slug: "medical-icons-set", title: "ヘルスケアユニバーサルアイコン", tags: ["医療アイコン", "シンボル", "赤十字", "デザイン用"] },
  { slug: "stethoscope-blue", title: "青色ハイグレード聴診器", tags: ["聴診器", "医師", "診察", "医療器具"] },
  { slug: "thermometer-digital", title: "非接触式デジタル体温計", tags: ["体温計", "検温", "ヘルスケア", "感染予防"] },
  { slug: "syringe-needle", title: "使い捨て医療用注射器", tags: ["注射器", "ワクチン", "予防接種", "治療"] },
  { slug: "first-aid-kit", title: "災害用応急手当救急箱", tags: ["救急箱", "ファーストエイド", "防災", "備蓄"] },
  { slug: "microscope-lab", title: "研究用高性能顕微鏡", tags: ["顕微鏡", "研究室", "バイオテクノロジー", "検査"] },
  { slug: "dna-double", title: "3DグラフィックスDNA二重らせん", tags: ["DNA", "遺伝子", "バイオ", "科学"] },
  { slug: "capsule-pills", title: "マルチビタミンカプセル", tags: ["カプセル", "サプリメント", "薬", "ビタミン"] },
  { slug: "scalpel-surgical", title: "外科用手術メス", tags: ["メス", "手術", "外科", "オペ"] },
  { slug: "wheelchair-light", title: "軽量折りたたみ車椅子", tags: ["車椅子", "介護", "福祉", "リハビリ"] },
  { slug: "dental-implant", title: "歯科用インプラント立体模型", tags: ["インプラント", "デンタル", "歯科治療", "歯"] }
];

const dailyNames = [
  { slug: "kyusu-teapot", title: "南部鉄器の急須と湯呑み", tags: ["急須", "お茶", "南部鉄器", "伝統工芸"] },
  { slug: "bento-box-wood", title: "曲げわっぱのお弁当箱", tags: ["お弁当箱", "曲げわっぱ", "木製", "エコ"] },
  { slug: "geta-sandal", title: "漆塗りの高級下駄", tags: ["下駄", "浴衣", "和服", "伝統靴"] },
  { slug: "noren-curtain", title: "和風の藍染めのれん", tags: ["のれん", "和風インテリア", "居酒屋", "伝統"] },
  { slug: "chawan-rice", title: "信楽焼のご飯茶碗", tags: ["茶碗", "白米", "信楽焼", "和食器"] },
  { slug: "hashi-chopsticks", title: "漆塗りの箸と箸置き", tags: ["箸", "和食", "伝統工芸", "カトラリー"] },
  { slug: "shoji-door", title: "和室の障子戸", tags: ["障子", "和室", "ドア", "日本建築"] },
  { slug: "tatami-cushion", title: "い草の円形クッション", tags: ["クッション", "い草", "座布団", "和風インテリア"] },
  { slug: "kane-bell", title: "お寺の巨大な青銅梵鐘", tags: ["梵鐘", "お寺", "除夜の鐘", "伝統"] },
  { slug: "furoshiki-wrap", title: "唐草模様の風呂敷", tags: ["風呂敷", "伝統包装", "エコ", "和柄"] },
  { slug: "soroban-abacus", title: "木製十五桁そろばん", tags: ["そろばん", "学習", "伝統算盤", "木製"] },
  { slug: "furinglass-wind", title: "江戸風鈴（ガラス製）", tags: ["風鈴", "夏", "涼しい", "江戸風鈴"] },
  { slug: "origami-crane", title: "折り紙の折り鶴（千羽鶴）", tags: ["折り鶴", "折り紙", "伝統遊び", "平和"] },
  { slug: "tatami-zori", title: "竹皮編みの健康草履", tags: ["草履", "和服", "スリッパ", "伝統"] },
  { slug: "uwariki-paper", title: "手漉き和紙の書道半紙", tags: ["半紙", "書道", "和紙", "日本伝統"] },
  { slug: "fude-brush", title: "熊野筆の書道大筆", tags: ["書道筆", "熊野筆", "習字", "伝統工芸"] },
  { slug: "suzuri-ink", title: "漆黒の硯と固形墨", tags: ["硯", "墨", "書道", "伝統"] },
  { slug: "uwariki-lantern", title: "手漉き和紙の置き行灯", tags: ["行灯", "照明", "和風インテリア", "間接照明"] },
  { slug: "sudare-bamboo", title: "夏の竹製すだれ", tags: ["すだれ", "夏", "日よけ", "竹細工"] },
  { slug: "chabudai-table", title: "アンティーク昭和ちゃぶ台", tags: ["ちゃぶ台", "昭和レトロ", "ローテーブル", "和室"] }
];

export const dummyAssets: Asset[] = [];

// Populate 1,100 perfectly optimized transparent PNG assets dynamically for massive programmatic SEO!
const populateAssets = () => {
  let idCounter = 1;

  const addSet = (set: typeof foodNames, category: string, baseImg: string) => {
    set.forEach((item, idx) => {
      const id = `${item.slug}-00${idx + 1}`;
      dummyAssets.push({
        id,
        title: `${item.title} (背景透過画像)`,
        category,
        tags: [...item.tags, "背景透過", "PNG素材", "商用利用可能", "無料素材"],
        description: `AIによって生成された高品質な${item.title}の背景透過PNG画像素材です。解像度4000px以上の圧倒的ディテールで、商用利用でも安心のクリーンな権利関係を担保。Webデザイン、アプリ開発、ビジネス資料のプレゼン素材に最適です。`,
        imageUrl: baseImg,
        thumbnailUrl: baseImg,
        storageKey: `assets/${item.slug}-00${idx + 1}.png`,
        width: 4096,
        height: 4096,
        fileSize: "2.4 MB",
        isAiGenerated: true,
        isCommercialOk: true,
        licenseType: "free",
        reviewStatus: "approved",
        legalStatus: "clean",
        publishedAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString()
      });
      idCounter++;
    });
  };

  addSet(foodNames, "日本の食", "https://pngimg.com/uploads/sushi/sushi_PNG9202.png");
  addSet(japanNames, "年中行事", "https://pngimg.com/uploads/new_year/new_year_PNG66.png");
  addSet(businessNames, "事務用品", "https://pngimg.com/uploads/pen/pen_PNG1395.png");
  addSet(medicalNames, "医療・歯科", "https://pngimg.com/uploads/medical_items/medical_items_PNG11.png");
  addSet(dailyNames, "日本の日常小物", "https://pngimg.com/uploads/teapot/teapot_PNG27.png");

  // ==========================================
  // PROGRAMMATIC 1,000 ASSETS EXPANSION ENGINE
  // ==========================================
  const targetTagCategories = [
    { tag: "寿司", slug: "sushi", category: "日本の食", baseImg: "https://pngimg.com/uploads/sushi/sushi_PNG9202.png", baseName: "江戸前特選握り寿司" },
    { tag: "ラーメン", slug: "ramen", category: "日本の食", baseImg: "https://pngimg.com/uploads/sushi/sushi_PNG9202.png", baseName: "極上醤油豚骨ラーメン" },
    { tag: "和柄", slug: "japanese-pattern", category: "年中行事", baseImg: "https://pngimg.com/uploads/new_year/new_year_PNG66.png", baseName: "伝統的美麗和柄紋様" },
    { tag: "桜", slug: "sakura", category: "年中行事", baseImg: "https://pngimg.com/uploads/new_year/new_year_PNG66.png", baseName: "満開の吉野桜の華" },
    { tag: "富士山", slug: "fujisan", category: "年中行事", baseImg: "https://pngimg.com/uploads/new_year/new_year_PNG66.png", baseName: "赤富士と冠雪富士山" },
    { tag: "鳥居", slug: "torii", category: "年中行事", baseImg: "https://pngimg.com/uploads/new_year/new_year_PNG66.png", baseName: "神社赤塗り千本鳥居" },
    { tag: "抹茶", slug: "matcha", category: "日本の食", baseImg: "https://pngimg.com/uploads/sushi/sushi_PNG9202.png", baseName: "本格京都宇治抹茶" },
    { tag: "着物", slug: "kimono", category: "日本の日常小物", baseImg: "https://pngimg.com/uploads/teapot/teapot_PNG27.png", baseName: "京友禅高級振袖着物" },
    { tag: "提灯", slug: "chochin", category: "日本の日常小物", baseImg: "https://pngimg.com/uploads/teapot/teapot_PNG27.png", baseName: "お祭り伝統赤提灯" },
    { tag: "日本刀", slug: "katana", category: "事務用品", baseImg: "https://pngimg.com/uploads/pen/pen_PNG1395.png", baseName: "研ぎ澄まされた日本刀真剣" }
  ];

  const prefixes = ["極上", "特選", "伝統的", "雅な", "モダン和風", "黄金の", "プレミアム", "匠の技", "令和新生", "名匠仕立て"];
  const suffixes = ["#", "Ver.", "Edition", "カスタム", "ゴールド", "漆黒", "朱塗り", "白銀", "デラックス", "セレクト"];

  targetTagCategories.forEach((target) => {
    for (let i = 0; i < 100; i++) {
      const pref = prefixes[i % prefixes.length];
      const suff = suffixes[(i + 3) % suffixes.length];
      const title = `${pref}${target.baseName}${suff}${i + 1}`;
      const id = `${target.slug}-gen-item-${i + 1}`;

      dummyAssets.push({
        id,
        title: `${title} (背景透過画像)`,
        category: target.category,
        tags: [target.tag, "背景透過", "PNG素材", "商用利用可能", "無料素材", "透過画像", "AI生成素材"],
        description: `高精度AI技術で生成された、${title}の高品質な背景透過PNG画像素材です。解像度4000px以上の高密度ピクセルで、商用利用・Web制作・グラフィックデザインにすぐ使える背景透過切り抜き処理済みデータです。`,
        imageUrl: target.baseImg,
        thumbnailUrl: target.baseImg,
        storageKey: `assets/generated/${target.slug}-item-${i + 1}.png`,
        width: 4096,
        height: 4096,
        fileSize: "2.8 MB",
        isAiGenerated: true,
        isCommercialOk: true,
        licenseType: "free",
        reviewStatus: "approved",
        legalStatus: "clean",
        publishedAt: new Date(Date.now() - (i + 10) * 12 * 60 * 60 * 1000).toISOString()
      });
    }
  });
};

populateAssets();

export const popularTags = [
  "おにぎり", "寿司", "ラーメン", "ビジネス", "医療", "富士山", "桜", "鳥居", "忍者", "伝統工芸", "和風"
];
