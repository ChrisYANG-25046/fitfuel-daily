// =================================================================
// FitFuel Daily - ローカル食品栄養素データベース & スマート補完エンジン
// 外部有料APIを一切使用せず、完全無料・オフライン・即時動作
// =================================================================

export interface FoodNutritionRule {
  name: string; // 代表名（例: "牛丼"）
  label: string; // 表示ラベル（例: "牛丼 (並盛 1杯)"）
  category: "主食" | "肉・魚" | "卵・大豆・乳製品" | "定番料理・外食" | "野菜・サラダ" | "フルーツ" | "飲料・サプリ";
  keywords: string[];
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  icon?: string;
  description?: string;
}

// ひらがな・カタカナ相互変換ユーティリティ
export function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  );
}

export function toHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) - 0x60)
  );
}

// 定番の人気クイックタグ（ユーザーがワンタップでテスト・入力可能）
export const POPULAR_FOOD_TAGS = [
  { name: "牛丼", icon: "🍲", label: "牛丼 (並盛)" },
  { name: "カレー", icon: "🍛", label: "カレーライス" },
  { name: "プロテイン", icon: "🥤", label: "ホエイプロテイン" },
  { name: "サラダ", icon: "🥗", label: "グリーンサラダ" },
  { name: "トマト", icon: "🍅", label: "トマト (1個)" },
  { name: "白ご飯", icon: "🍚", label: "白ご飯 (150g)" },
  { name: "サラダチキン", icon: "🍗", label: "サラダチキン (110g)" },
  { name: "ゆで卵", icon: "🥚", label: "ゆで卵 (1個)" },
  { name: "バナナ", icon: "🍌", label: "バナナ (1本)" },
];

export const FOOD_DATABASE: FoodNutritionRule[] = [
  // ===============================================================
  // 定番料理・外食（牛丼、カレー、ラーメン、丼ものなど）
  // ===============================================================
  {
    name: "牛丼",
    label: "牛丼 (並盛 1杯)",
    category: "定番料理・外食",
    keywords: ["牛丼", "ぎゅうどん", "ぎゅう丼", "牛めし", "牛肉丼", "gyudon", "beef bowl", "牛"],
    calories: 720,
    protein: 20.0,
    fat: 25.0,
    carbs: 102.0,
    icon: "🍲",
    description: "牛肉と玉ねぎの甘辛煮。主食とタンパク質を同時に摂取できます。",
  },
  {
    name: "牛丼 (大盛)",
    label: "牛丼 (大盛 1杯)",
    category: "定番料理・外食",
    keywords: ["牛丼大盛", "大盛牛丼", "ぎゅうどんおおもり"],
    calories: 890,
    protein: 24.5,
    fat: 30.0,
    carbs: 128.0,
    icon: "🍲",
  },
  {
    name: "カレーライス",
    label: "カレーライス (1皿)",
    category: "定番料理・外食",
    keywords: ["カレー", "カレーライス", "かれー", "かれーらいす", "ビーフカレー", "チキンカレー", "ポークカレー", "curry", "curry rice"],
    calories: 750,
    protein: 16.0,
    fat: 24.0,
    carbs: 112.0,
    icon: "🍛",
    description: "日本の定番カレーライス。ルーとご飯で満足感が高い一皿。",
  },
  {
    name: "カツカレー",
    label: "カツカレー (1皿)",
    category: "定番料理・外食",
    keywords: ["カツカレー", "かつかれー", "katsu curry"],
    calories: 1050,
    protein: 28.0,
    fat: 45.0,
    carbs: 130.0,
    icon: "🍛",
  },
  {
    name: "キーマカレー",
    label: "キーマカレー (1皿)",
    category: "定番料理・外食",
    keywords: ["キーマカレー", "きーまかれー", "keema curry"],
    calories: 620,
    protein: 22.0,
    fat: 20.0,
    carbs: 85.0,
    icon: "🍛",
  },
  {
    name: "親子丼",
    label: "親子丼 (1杯)",
    category: "定番料理・外食",
    keywords: ["親子丼", "おやこどん", "おやこ丼", "oyakodon"],
    calories: 650,
    protein: 28.0,
    fat: 16.0,
    carbs: 95.0,
    icon: "🍲",
    description: "鶏肉と卵をふんわりとじた高タンパクな定番丼。",
  },
  {
    name: "豚生姜焼き",
    label: "豚の生姜焼き (1人前)",
    category: "定番料理・外食",
    keywords: ["生姜焼き", "しょうが焼き", "豚生姜焼き", "しょうがやき", "ginger pork"],
    calories: 380,
    protein: 22.0,
    fat: 26.0,
    carbs: 12.0,
    icon: "🍖",
  },
  {
    name: "ハンバーグ",
    label: "ハンバーグ (デミグラス 1人前)",
    category: "定番料理・外食",
    keywords: ["ハンバーグ", "はんばーぐ", "デミグラスハンバーグ", "hamburger steak"],
    calories: 420,
    protein: 20.0,
    fat: 28.0,
    carbs: 18.0,
    icon: "🥩",
  },
  {
    name: "唐揚げ",
    label: "鶏の唐揚げ (4個 約120g)",
    category: "定番料理・外食",
    keywords: ["唐揚げ", "から揚げ", "からあげ", "カラアゲ", "fried chicken"],
    calories: 320,
    protein: 22.0,
    fat: 20.0,
    carbs: 12.0,
    icon: "🍗",
  },
  {
    name: "餃子",
    label: "焼き餃子 (5個)",
    category: "定番料理・外食",
    keywords: ["餃子", "ギョーザ", "ギョウザ", "ぎょうざ", "gyoza"],
    calories: 210,
    protein: 7.5,
    fat: 11.0,
    carbs: 19.0,
    icon: "🥟",
  },
  {
    name: "ラーメン",
    label: "醤油ラーメン (1杯)",
    category: "定番料理・外食",
    keywords: ["ラーメン", "拉麺", "らーめん", "醤油ラーメン", "中華そば", "ramen"],
    calories: 520,
    protein: 21.0,
    fat: 18.0,
    carbs: 68.0,
    icon: "🍜",
  },
  {
    name: "味噌ラーメン",
    label: "味噌ラーメン (1杯)",
    category: "定番料理・外食",
    keywords: ["味噌ラーメン", "みそラーメン", "みそらーめん", "miso ramen"],
    calories: 580,
    protein: 23.0,
    fat: 22.0,
    carbs: 72.0,
    icon: "🍜",
  },
  {
    name: "チャーハン",
    label: "チャーハン (1皿 300g)",
    category: "定番料理・外食",
    keywords: ["チャーハン", "炒飯", "ちゃーはん", "fried rice"],
    calories: 620,
    protein: 15.0,
    fat: 22.0,
    carbs: 88.0,
    icon: "🍳",
  },
  {
    name: "寿司",
    label: "握り寿司 (並盛 8貫)",
    category: "定番料理・外食",
    keywords: ["寿司", "にぎり寿司", "すし", "スシ", "sushi"],
    calories: 460,
    protein: 20.0,
    fat: 4.5,
    carbs: 82.0,
    icon: "🍣",
  },
  {
    name: "サンドイッチ",
    label: "ミックスサンドイッチ (1個)",
    category: "定番料理・外食",
    keywords: ["サンドイッチ", "サンド", "さんどいっち", "sandwich"],
    calories: 320,
    protein: 14.0,
    fat: 8.0,
    carbs: 45.0,
    icon: "🥪",
  },
  {
    name: "ピザ",
    label: "マルゲリータピザ (1切れ)",
    category: "定番料理・外食",
    keywords: ["ピザ", "ぴざ", "pizza", "マルゲリータ"],
    calories: 260,
    protein: 11.0,
    fat: 10.0,
    carbs: 30.0,
    icon: "🍕",
  },

  // ===============================================================
  // サプリ・プロテイン・乳製品（プロテイン、ヨーグルトなど）
  // ===============================================================
  {
    name: "ホエイプロテイン",
    label: "ホエイプロテイン (1杯 30g)",
    category: "飲料・サプリ",
    keywords: ["プロテイン", "ホエイプロテイン", "ぷろていん", "ほえいぷろていん", "プロテインドリンク", "protein", "whey"],
    calories: 118,
    protein: 24.0,
    fat: 1.5,
    carbs: 2.5,
    icon: "🥤",
    description: "吸収が早く筋肥大・減量中のタンパク質補給に最適。",
  },
  {
    name: "ソイプロテイン",
    label: "ソイプロテイン (1杯 25g)",
    category: "飲料・サプリ",
    keywords: ["ソイプロテイン", "大豆プロテイン", "そいぷろていん", "soy protein"],
    calories: 95,
    protein: 20.0,
    fat: 1.0,
    carbs: 2.0,
    icon: "🥤",
    description: "大豆由来で腹持ちが良く、ダイエット中に人気のプロテイン。",
  },
  {
    name: "プロテインバー",
    label: "プロテインバー (1本)",
    category: "飲料・サプリ",
    keywords: ["プロテインバー", "ぷろていんばー", "protein bar"],
    calories: 195,
    protein: 15.0,
    fat: 8.5,
    carbs: 15.0,
    icon: "🍫",
  },
  {
    name: "ギリシャヨーグルト",
    label: "ギリシャヨーグルト (無糖 100g)",
    category: "卵・大豆・乳製品",
    keywords: ["ギリシャヨーグルト", "オイコス", "ギリシャ", "greek yogurt", "oikos"],
    calories: 67,
    protein: 10.0,
    fat: 0.2,
    carbs: 5.0,
    icon: "🥣",
  },
  {
    name: "プレーンヨーグルト",
    label: "プレーンヨーグルト (100g)",
    category: "卵・大豆・乳製品",
    keywords: ["ヨーグルト", "よーぐると", "酸奶", "yogurt"],
    calories: 62,
    protein: 3.6,
    fat: 3.0,
    carbs: 4.9,
    icon: "🥣",
  },
  {
    name: "牛乳",
    label: "普通牛乳 (200ml)",
    category: "飲料・サプリ",
    keywords: ["牛乳", "ぎゅうにゅう", "ミルク", "milk"],
    calories: 134,
    protein: 6.6,
    fat: 7.6,
    carbs: 9.6,
    icon: "🥛",
  },
  {
    name: "無調整豆乳",
    label: "無調整豆乳 (200ml)",
    category: "飲料・サプリ",
    keywords: ["豆乳", "とうにゅう", "ソイミルク", "soy milk"],
    calories: 95,
    protein: 7.2,
    fat: 4.5,
    carbs: 5.8,
    icon: "🥛",
  },
  {
    name: "プロセスチーズ",
    label: "スライスチーズ (1枚 18g)",
    category: "卵・大豆・乳製品",
    keywords: ["チーズ", "ちーず", "スライスチーズ", "cheese"],
    calories: 56,
    protein: 4.0,
    fat: 4.6,
    carbs: 0.2,
    icon: "🧀",
  },

  // ===============================================================
  // サラダ・野菜（サラダ、ブロッコリーなど）
  // ===============================================================
  {
    name: "グリーンサラダ",
    label: "グリーンサラダ (ノンオイル 1皿)",
    category: "野菜・サラダ",
    keywords: ["サラダ", "さらだ", "生野菜", "野菜サラダ", "グリーンサラダ", "レタス", "salad"],
    calories: 45,
    protein: 1.5,
    fat: 0.5,
    carbs: 7.5,
    icon: "🥗",
    description: "レタス・きゅうり・トマトなど。食物繊維・ビタミン補給に。",
  },
  {
    name: "シーザーサラダ",
    label: "シーザーサラダ (1皿)",
    category: "野菜・サラダ",
    keywords: ["シーザーサラダ", "しーざーさらだ", "caesar salad"],
    calories: 220,
    protein: 5.0,
    fat: 18.0,
    carbs: 8.0,
    icon: "🥗",
  },
  {
    name: "ポテトサラダ",
    label: "ポテトサラダ (小鉢 80g)",
    category: "野菜・サラダ",
    keywords: ["ポテトサラダ", "ポテサラ", "ぽてさら", "potato salad"],
    calories: 140,
    protein: 2.0,
    fat: 8.0,
    carbs: 15.0,
    icon: "🥔",
  },
  {
    name: "ブロッコリー",
    label: "茹でブロッコリー (100g)",
    category: "野菜・サラダ",
    keywords: ["ブロッコリー", "ぶろっこりー", "broccoli"],
    calories: 33,
    protein: 4.3,
    fat: 0.5,
    carbs: 5.2,
    icon: "🥦",
    description: "筋トレ・減量定番の高タンパク＆高ビタミン野菜。",
  },
  {
    name: "トマト",
    label: "トマト (中玉 1個 150g)",
    category: "野菜・サラダ",
    keywords: ["トマト", "とまと", "tomato", "番茄", "西红柿"],
    calories: 30,
    protein: 1.1,
    fat: 0.2,
    carbs: 7.0,
    icon: "🍅",
    description: "リコピンやビタミンCが豊富で低カロリーな健康野菜。",
  },
  {
    name: "ミニトマト",
    label: "ミニトマト (5個 約75g)",
    category: "野菜・サラダ",
    keywords: ["ミニトマト", "プチトマト", "みにとまと", "ぷちとまと", "cherry tomato", "小番茄"],
    calories: 22,
    protein: 0.8,
    fat: 0.1,
    carbs: 5.4,
    icon: "🍅",
    description: "手軽につまめるビタミン補給。サラダやお弁当の彩りに。",
  },
  {
    name: "味噌汁",
    label: "豆腐とわかめの味噌汁 (1杯)",
    category: "野菜・サラダ",
    keywords: ["味噌汁", "みそ汁", "みそしる", "miso soup"],
    calories: 42,
    protein: 2.8,
    fat: 1.2,
    carbs: 4.8,
    icon: "🥣",
  },
  {
    name: "わかめスープ",
    label: "わかめスープ (1杯)",
    category: "野菜・サラダ",
    keywords: ["わかめスープ", "スープ", "soup"],
    calories: 20,
    protein: 1.2,
    fat: 0.5,
    carbs: 2.5,
    icon: "🥣",
  },

  // ===============================================================
  // 主食（白ご飯、オートミール、パン、麺類など）
  // ===============================================================
  {
    name: "白ご飯",
    label: "白ご飯 (1膳 150g)",
    category: "主食",
    keywords: ["白ご飯", "ご飯", "ごはん", "ライス", "白米", "米飯", "米", "お米", "rice", "white rice"],
    calories: 240,
    protein: 3.8,
    fat: 0.5,
    carbs: 53.4,
    icon: "🍚",
  },
  {
    name: "玄米ご飯",
    label: "玄米ご飯 (1膳 150g)",
    category: "主食",
    keywords: ["玄米ご飯", "玄米", "げんまい", "brown rice"],
    calories: 228,
    protein: 4.2,
    fat: 1.5,
    carbs: 51.0,
    icon: "🌾",
  },
  {
    name: "オートミール",
    label: "オートミール (1食 40g)",
    category: "主食",
    keywords: ["オートミール", "燕麦", "おーとみーる", "oatmeal", "oats"],
    calories: 152,
    protein: 5.5,
    fat: 2.5,
    carbs: 27.0,
    icon: "🥣",
  },
  {
    name: "食パン",
    label: "食パン (6枚切り 1枚)",
    category: "主食",
    keywords: ["食パン", "トースト", "パン", "しょくぱん", "toast", "bread"],
    calories: 158,
    protein: 5.6,
    fat: 2.6,
    carbs: 28.0,
    icon: "🍞",
  },
  {
    name: "パスタ",
    label: "パスタ (乾麺100g 調理後)",
    category: "主食",
    keywords: ["パスタ", "スパゲッティ", "ぱすた", "pasta", "spaghetti"],
    calories: 360,
    protein: 13.0,
    fat: 2.0,
    carbs: 71.0,
    icon: "🍝",
  },
  {
    name: "うどん",
    label: "うどん (1玉 200g)",
    category: "主食",
    keywords: ["うどん", "饂飩", "烏冬", "udon"],
    calories: 242,
    protein: 5.2,
    fat: 0.8,
    carbs: 53.0,
    icon: "🍜",
  },
  {
    name: "そば",
    label: "ざるそば / かけそば (1人前)",
    category: "主食",
    keywords: ["そば", "蕎麦", "ざるそば", "soba"],
    calories: 270,
    protein: 12.0,
    fat: 1.8,
    carbs: 54.0,
    icon: "🥢",
  },
  {
    name: "おにぎり",
    label: "鮭おにぎり (1個)",
    category: "主食",
    keywords: ["おにぎり", "おむすび", "お握り", "onigiri"],
    calories: 180,
    protein: 3.5,
    fat: 1.0,
    carbs: 38.0,
    icon: "🍙",
  },
  {
    name: "さつまいも",
    label: "焼き芋・さつまいも (1本 150g)",
    category: "主食",
    keywords: ["さつまいも", "サツマイモ", "焼き芋", "sweet potato"],
    calories: 190,
    protein: 1.8,
    fat: 0.3,
    carbs: 45.0,
    icon: "🍠",
  },

  // ===============================================================
  // 肉・魚（高タンパク質）
  // ===============================================================
  {
    name: "サラダチキン",
    label: "サラダチキン (プレーン 1パック 110g)",
    category: "肉・魚",
    keywords: ["サラダチキン", "さらだちきん", "鶏胸ハム", "salad chicken"],
    calories: 115,
    protein: 25.0,
    fat: 1.5,
    carbs: 0.0,
    icon: "🍗",
    description: "ダイエッター定番。高タンパク・低脂質の王道食品。",
  },
  {
    name: "鶏胸肉",
    label: "鶏胸肉・皮なし (100g)",
    category: "肉・魚",
    keywords: ["鶏胸肉", "鶏むね肉", "鳥胸肉", "とりむね", "chicken breast"],
    calories: 108,
    protein: 22.3,
    fat: 1.5,
    carbs: 0.0,
    icon: "🍗",
  },
  {
    name: "鶏ささみ",
    label: "鶏ささみ (100g)",
    category: "肉・魚",
    keywords: ["ささみ", "ササミ", "鶏ささみ", "chicken tender"],
    calories: 105,
    protein: 23.0,
    fat: 0.8,
    carbs: 0.0,
    icon: "🍗",
  },
  {
    name: "鶏もも肉",
    label: "鶏もも肉・皮なし (100g)",
    category: "肉・魚",
    keywords: ["鶏もも肉", "鶏モモ肉", "とりもも", "chicken thigh"],
    calories: 116,
    protein: 19.0,
    fat: 4.0,
    carbs: 0.0,
    icon: "🍗",
  },
  {
    name: "牛赤身肉ステーキ",
    label: "牛赤身ステーキ (100g)",
    category: "肉・魚",
    keywords: ["牛肉", "ビーフ", "牛赤身肉", "牛ヒレ", "ステーキ", "beef", "steak"],
    calories: 180,
    protein: 21.5,
    fat: 9.8,
    carbs: 0.4,
    icon: "🥩",
  },
  {
    name: "豚ヒレ肉",
    label: "豚ヒレ肉 (100g)",
    category: "肉・魚",
    keywords: ["豚ヒレ肉", "豚ヒレ", "ぶたひれ", "pork tenderloin"],
    calories: 115,
    protein: 22.8,
    fat: 1.9,
    carbs: 0.2,
    icon: "🥩",
  },
  {
    name: "豚ロース",
    label: "豚肉・ロース (100g)",
    category: "肉・魚",
    keywords: ["豚肉", "ポーク", "豚ロース", "ぶたにく", "pork"],
    calories: 250,
    protein: 19.3,
    fat: 19.2,
    carbs: 0.2,
    icon: "🥩",
  },
  {
    name: "鮭の塩焼き",
    label: "鮭の塩焼き (1切れ 80g)",
    category: "肉・魚",
    keywords: ["鮭", "サケ", "さけ", "サーモン", "salmon"],
    calories: 150,
    protein: 18.0,
    fat: 7.5,
    carbs: 0.1,
    icon: "🐟",
  },
  {
    name: "サバの塩焼き",
    label: "サバの塩焼き (1切れ 80g)",
    category: "肉・魚",
    keywords: ["サバ", "鯖", "さば", "さばの塩焼き", "mackerel"],
    calories: 200,
    protein: 16.5,
    fat: 14.0,
    carbs: 0.2,
    icon: "🐟",
  },
  {
    name: "マグロ赤身",
    label: "マグロ赤身刺身 (100g)",
    category: "肉・魚",
    keywords: ["マグロ", "鮪", "まぐろ", "tuna"],
    calories: 125,
    protein: 26.4,
    fat: 1.4,
    carbs: 0.1,
    icon: "🐟",
  },
  {
    name: "エビ",
    label: "ボイルエビ (100g)",
    category: "肉・魚",
    keywords: ["エビ", "海老", "えび", "shrimp"],
    calories: 82,
    protein: 18.4,
    fat: 0.3,
    carbs: 0.3,
    icon: "🦐",
  },

  // ===============================================================
  // 卵・大豆
  // ===============================================================
  {
    name: "ゆで卵",
    label: "ゆで卵 (1個 50g)",
    category: "卵・大豆・乳製品",
    keywords: ["ゆで卵", "ゆでたまご", "茹で卵", "煮卵", "味玉", "boiled egg"],
    calories: 78,
    protein: 6.5,
    fat: 5.2,
    carbs: 0.2,
    icon: "🥚",
  },
  {
    name: "目玉焼き",
    label: "目玉焼き (1個)",
    category: "卵・大豆・乳製品",
    keywords: ["目玉焼き", "めだまやき", "fried egg"],
    calories: 95,
    protein: 6.5,
    fat: 7.5,
    carbs: 0.3,
    icon: "🍳",
  },
  {
    name: "生卵",
    label: "全卵 (生卵 1個 50g)",
    category: "卵・大豆・乳製品",
    keywords: ["卵", "たまご", "生卵", "玉子", "egg"],
    calories: 76,
    protein: 6.2,
    fat: 5.2,
    carbs: 0.2,
    icon: "🥚",
  },
  {
    name: "納豆",
    label: "納豆 (1パック 45g たれ付き)",
    category: "卵・大豆・乳製品",
    keywords: ["納豆", "なっとう", "ナットウ", "natto"],
    calories: 86,
    protein: 7.4,
    fat: 4.5,
    carbs: 5.4,
    icon: "🥢",
  },
  {
    name: "木綿豆腐",
    label: "木綿豆腐 (1/2丁 150g)",
    category: "卵・大豆・乳製品",
    keywords: ["木綿豆腐", "豆腐", "とうふ", "tofu"],
    calories: 110,
    protein: 9.8,
    fat: 6.3,
    carbs: 2.5,
    icon: "🧊",
  },

  // ===============================================================
  // フルーツ
  // ===============================================================
  {
    name: "りんご",
    label: "りんご (1個 約300g)",
    category: "フルーツ",
    keywords: ["りんご", "リンゴ", "林檎", "apple"],
    calories: 95,
    protein: 0.3,
    fat: 0.2,
    carbs: 25.0,
    icon: "🍎",
  },
  {
    name: "バナナ",
    label: "バナナ (1本 約100g)",
    category: "フルーツ",
    keywords: ["バナナ", "ばなな", "banana"],
    calories: 86,
    protein: 1.1,
    fat: 0.2,
    carbs: 22.5,
    icon: "🍌",
  },
  {
    name: "みかん",
    label: "温州みかん (1個)",
    category: "フルーツ",
    keywords: ["みかん", "ミカン", "蜜柑", "orange"],
    calories: 45,
    protein: 0.7,
    fat: 0.1,
    carbs: 11.0,
    icon: "🍊",
  },
  {
    name: "アボカド",
    label: "アボカド (1/2個)",
    category: "フルーツ",
    keywords: ["アボカド", "あぼかど", "avocado"],
    calories: 140,
    protein: 1.8,
    fat: 13.5,
    carbs: 5.5,
    icon: "🥑",
  },
  {
    name: "ブルーベリー",
    label: "ブルーベリー (100g)",
    category: "フルーツ",
    keywords: ["ブルーベリー", "blueberry"],
    calories: 49,
    protein: 0.6,
    fat: 0.1,
    carbs: 13.0,
    icon: "🫐",
  },

  // ===============================================================
  // 飲料
  // ===============================================================
  {
    name: "ブラックコーヒー",
    label: "ブラックコーヒー (無糖 200ml)",
    category: "飲料・サプリ",
    keywords: ["ブラックコーヒー", "コーヒー", "珈琲", "coffee", "black coffee"],
    calories: 8,
    protein: 0.4,
    fat: 0.0,
    carbs: 1.4,
    icon: "☕",
  },
  {
    name: "カフェラテ",
    label: "カフェラテ (無糖 200ml)",
    category: "飲料・サプリ",
    keywords: ["カフェラテ", "ラテ", "latte"],
    calories: 105,
    protein: 5.2,
    fat: 6.0,
    carbs: 7.5,
    icon: "☕",
  },
  {
    name: "緑茶・水",
    label: "お茶・緑茶・水 (0 kcal)",
    category: "飲料・サプリ",
    keywords: ["緑茶", "お茶", "水", "お水", "ミネラルウォーター", "tea", "water"],
    calories: 0,
    protein: 0.0,
    fat: 0.0,
    carbs: 0.0,
    icon: "🍵",
  },
];

// =================================================================
// インクリメンタル検索（スマート補完）関数
// =================================================================
export function searchFoodSuggestions(query: string, limit = 8): FoodNutritionRule[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const hiraQuery = toHiragana(trimmed);
  const kataQuery = toKatakana(trimmed);

  interface ScoredItem {
    item: FoodNutritionRule;
    score: number;
  }

  const scored: ScoredItem[] = [];

  for (const item of FOOD_DATABASE) {
    let score = 0;
    const lowerName = item.name.toLowerCase();
    const lowerLabel = item.label.toLowerCase();

    // 1. 名前との完全一致
    if (lowerName === trimmed || lowerName === hiraQuery || lowerName === kataQuery) {
      score += 200;
    }
    // 2. キーワードとの完全一致
    else if (
      item.keywords.some((k) => {
        const lk = k.toLowerCase();
        return lk === trimmed || lk === hiraQuery || lk === kataQuery;
      })
    ) {
      score += 150;
    }
    // 3. 名前がクエリから始まる（前方一致）
    else if (lowerName.startsWith(trimmed) || lowerName.startsWith(hiraQuery) || lowerName.startsWith(kataQuery)) {
      score += 100;
    }
    // 4. キーワードがクエリから始まる
    else if (
      item.keywords.some((k) => {
        const lk = k.toLowerCase();
        return lk.startsWith(trimmed) || lk.startsWith(hiraQuery) || lk.startsWith(kataQuery);
      })
    ) {
      score += 80;
    }
    // 5. 名前やキーワードがクエリを含む（部分一致）
    else if (
      lowerName.includes(trimmed) ||
      lowerName.includes(hiraQuery) ||
      lowerName.includes(kataQuery)
    ) {
      score += 60;
    } else if (
      item.keywords.some((k) => {
        const lk = k.toLowerCase();
        return lk.includes(trimmed) || lk.includes(hiraQuery) || lk.includes(kataQuery);
      })
    ) {
      score += 50;
    }
    // 6. 表示ラベルがクエリを含む
    else if (
      lowerLabel.includes(trimmed) ||
      lowerLabel.includes(hiraQuery) ||
      lowerLabel.includes(kataQuery)
    ) {
      score += 30;
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  // スコア順にソートして上位を返却
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

// =================================================================
// 食品名からカロリー・PFCを自動予測する関数（数量・重量解析エンジン対応）
// =================================================================
export function estimateNutrition(input: string): {
  food_name: string;
  label: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  isExactOrKnown: boolean;
  icon: string;
} {
  const query = input.trim();
  if (!query) {
    return {
      food_name: "未入力",
      label: "未入力",
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      isExactOrKnown: false,
      icon: "🍽️",
    };
  }

  // 1. 数量・重量解析（自然言語換算エンジン）
  // 日本大型スーパー定番生鮮・果物・魚介・肉類・野菜・菌類・豆類精細データベース
  // --- グラムベース (100gあたり) ---
  const weightDb = [
    // 葉物・根菜・定番野菜
    { keywords: [/cabbage|キャベツ|甘藍/i], name: "キャベツ", per100g: { cal: 21, p: 1.3, f: 0.1, c: 4.8 }, icon: "🥬" },
    { keywords: [/lettuce|レタス|生菜/i], name: "レタス", per100g: { cal: 11, p: 0.6, f: 0.1, c: 2.3 }, icon: "🥬" },
    { keywords: [/chinese cabbage|白菜|はくさい/i], name: "白菜", per100g: { cal: 13, p: 0.9, f: 0.1, c: 3.0 }, icon: "🥬" },
    { keywords: [/spinach|ほうれん草|ホウレンソウ|菠菜/i], name: "ほうれん草", per100g: { cal: 18, p: 2.2, f: 0.3, c: 3.1 }, icon: "🥬" },
    { keywords: [/komatsuna|小松菜/i], name: "小松菜", per100g: { cal: 13, p: 1.5, f: 0.2, c: 2.4 }, icon: "🥬" },
    { keywords: [/onion|玉ねぎ|タマネギ|洋葱/i], name: "玉ねぎ", per100g: { cal: 33, p: 0.8, f: 0.1, c: 7.5 }, icon: "🧅" },
    { keywords: [/green onion|leek|長ネギ|長ねぎ|白ネギ|青ネギ|小ネギ|大葱|(?<![玉たま])ネギ|(?<![玉たま])ねぎ/i], name: "長ネギ", per100g: { cal: 34, p: 1.5, f: 0.1, c: 7.0 }, icon: "🌱" },
    { keywords: [/chive|nira|ニラ|にら|韭菜/i], name: "ニラ", per100g: { cal: 21, p: 1.7, f: 0.3, c: 4.0 }, icon: "🌱" },
    { keywords: [/sprout|moyashi|もやし|豆芽/i], name: "もやし", per100g: { cal: 15, p: 1.7, f: 0.1, c: 2.6 }, icon: "🌱" },
    { keywords: [/mini.*tomato|petit.*tomato|ミニトマト|プチトマト|小番茄/i], name: "ミニトマト", per100g: { cal: 30, p: 1.1, f: 0.1, c: 7.2 }, icon: "🍅" },
    { keywords: [/tomato|トマト|西紅柿|西红柿/i], name: "トマト", per100g: { cal: 20, p: 0.7, f: 0.1, c: 4.7 }, icon: "🍅" },
    { keywords: [/cucumber|きゅうり|キュウリ|黄瓜/i], name: "きゅうり", per100g: { cal: 14, p: 0.8, f: 0.1, c: 3.0 }, icon: "🥒" },
    { keywords: [/eggplant|ナス|茄子/i], name: "ナス", per100g: { cal: 22, p: 1.1, f: 0.1, c: 5.1 }, icon: "🍆" },
    { keywords: [/green pepper|ピーマン|青椒/i], name: "ピーマン", per100g: { cal: 20, p: 1.0, f: 0.2, c: 4.7 }, icon: "🫑" },
    { keywords: [/broccoli|ブロッコリー|西兰花/i], name: "ブロッコリー", per100g: { cal: 37, p: 4.3, f: 0.6, c: 5.2 }, icon: "🥦" },
    { keywords: [/carrot|人参|にんじん|胡蘿蔔|胡萝卜/i], name: "人参", per100g: { cal: 35, p: 0.8, f: 0.2, c: 8.5 }, icon: "🥕" },
    { keywords: [/radish|大根|だいこん|白萝卜/i], name: "大根", per100g: { cal: 15, p: 0.4, f: 0.1, c: 3.8 }, icon: "🥢" },
    { keywords: [/pumpkin|かぼちゃ|カボチャ|南瓜/i], name: "かぼちゃ", per100g: { cal: 78, p: 1.6, f: 0.3, c: 20.6 }, icon: "🎃" },
    { keywords: [/potato|じゃがいも|ジャガイモ|马铃薯/i], name: "じゃがいも", per100g: { cal: 76, p: 1.6, f: 0.1, c: 17.3 }, icon: "🥔" },
    { keywords: [/sweet potato|さつまいも|サツマイモ|红薯/i], name: "さつまいも", per100g: { cal: 126, p: 1.2, f: 0.2, c: 31.5 }, icon: "🍠" },

    // 菌類（きのこ）
    { keywords: [/eringi|エリンギ|杏鲍菇/i], name: "エリンギ", per100g: { cal: 19, p: 2.8, f: 0.3, c: 4.3 }, icon: "🍄" },
    { keywords: [/shimeji|しめじ|シメジ/i], name: "しめじ", per100g: { cal: 18, p: 2.0, f: 0.4, c: 4.8 }, icon: "🍄" },
    { keywords: [/enoki|えのき|エノキ|金针菇/i], name: "えのき", per100g: { cal: 22, p: 2.7, f: 0.2, c: 7.6 }, icon: "🍄" },
    { keywords: [/shiitake|しいたけ|シイタケ|香菇/i], name: "しいたけ", per100g: { cal: 25, p: 3.0, f: 0.4, c: 5.5 }, icon: "🍄" },

    // 豆製品
    { keywords: [/tofu|豆腐|とうふ/i], name: "木綿/絹豆腐", per100g: { cal: 72, p: 6.6, f: 4.2, c: 1.6 }, icon: "🧊" },
    { keywords: [/edamame|枝豆|毛豆/i], name: "枝豆", per100g: { cal: 135, p: 11.7, f: 6.2, c: 8.8 }, icon: "🫛" },

    // フルーツ・肉・海鮮・主食
    { keywords: [/grape|ぶどう|ブドウ|葡萄/i], name: "ぶどう", per100g: { cal: 59, p: 0.4, f: 0.1, c: 15.2 }, icon: "🍇" },
    { keywords: [/chicken|チキン|鶏|胸肉|むね肉|ささみ|鶏肉/i], name: "鶏むね肉/ささみ", per100g: { cal: 108, p: 23.3, f: 1.5, c: 0.0 }, icon: "🍗" },
    { keywords: [/thigh|もも肉|鶏もも/i], name: "鶏もも肉", per100g: { cal: 190, p: 16.6, f: 14.2, c: 0.0 }, icon: "🍗" },
    { keywords: [/beef|牛|牛肉|ステーキ/i], name: "牛肉", per100g: { cal: 240, p: 18.0, f: 17.5, c: 0.4 }, icon: "🥩" },
    { keywords: [/pork|豚|豚肉|ポーク|ロース/i], name: "豚肉", per100g: { cal: 210, p: 19.3, f: 14.7, c: 0.2 }, icon: "🥩" },
    { keywords: [/salmon|鮭|サーモン|三文鱼/i], name: "鮭/サーモン", per100g: { cal: 170, p: 20.1, f: 9.4, c: 0.1 }, icon: "🐟" },
    { keywords: [/tuna|マグロ|まぐろ|金枪鱼/i], name: "マグロ (赤身)", per100g: { cal: 115, p: 26.4, f: 1.4, c: 0.1 }, icon: "🐟" },
    { keywords: [/mackerel|サバ|さば|青魚|鯖/i], name: "サバ", per100g: { cal: 210, p: 20.6, f: 16.8, c: 0.3 }, icon: "🐟" },
    { keywords: [/shrimp|prawn|エビ|えび|海老/i], name: "エビ", per100g: { cal: 82, p: 18.4, f: 0.6, c: 0.3 }, icon: "🦐" },
    { keywords: [/squid|イカ|いか|乌贼|鱿鱼/i], name: "イカ", per100g: { cal: 76, p: 17.9, f: 0.8, c: 0.1 }, icon: "🦑" },
    { keywords: [/octopus|タコ|たこ|章鱼/i], name: "タコ", per100g: { cal: 70, p: 16.4, f: 0.7, c: 0.1 }, icon: "🐙" },
    { keywords: [/rice|ご飯|ライス|米|白米/i], name: "白ご飯", per100g: { cal: 156, p: 2.5, f: 0.3, c: 35.6 }, icon: "🍚" },
    { keywords: [/noodle|ramen|udon|麺|ラーメン|うどん|そば|パスタ/i], name: "麺類", per100g: { cal: 175, p: 4.5, f: 1.0, c: 35.0 }, icon: "🍜" },
  ];

  // --- 個数ベース (1個/1本/1粒/1枚/1パックあたり) ---
  const countDb = [
    { keywords: [/natto|納豆|纳豆/i], name: "納豆", perPiece: { cal: 100, p: 8.3, f: 5.0, c: 6.0 }, icon: "🥢", unit: "パック" },
    { keywords: [/mini.*tomato|petit.*tomato|ミニトマト|プチトマト|小番茄/i], name: "ミニトマト", perPiece: { cal: 4, p: 0.1, f: 0.0, c: 1.0 }, icon: "🍅" },
    { keywords: [/tomato|トマト|西紅柿|西红柿/i], name: "トマト", perPiece: { cal: 30, p: 1.0, f: 0.2, c: 7.0 }, icon: "🍅" },
    { keywords: [/cucumber|きゅうり|キュウリ|黄瓜/i], name: "きゅうり", perPiece: { cal: 14, p: 0.8, f: 0.1, c: 3.0 }, icon: "🥒" },
    { keywords: [/eggplant|ナス|茄子/i], name: "ナス", perPiece: { cal: 18, p: 0.9, f: 0.1, c: 4.1 }, icon: "🍆" },
    { keywords: [/green pepper|ピーマン|青椒/i], name: "ピーマン", perPiece: { cal: 6, p: 0.3, f: 0.1, c: 1.4 }, icon: "🫑" },
    { keywords: [/green onion|leek|長ネギ|長ねぎ|ネギ|ねぎ|大葱/i], name: "長ネギ", perPiece: { cal: 34, p: 1.5, f: 0.1, c: 7.0 }, icon: "🌱" },
    { keywords: [/onion|玉ねぎ|タマネギ|洋葱/i], name: "玉ねぎ", perPiece: { cal: 65, p: 1.5, f: 0.1, c: 15.0 }, icon: "🧅" },
    { keywords: [/potato|じゃがいも|ジャガイモ|马铃薯/i], name: "じゃがいも", perPiece: { cal: 76, p: 1.6, f: 0.1, c: 17.3 }, icon: "🥔" },
    { keywords: [/shiitake|しいたけ|シイタケ|香菇/i], name: "しいたけ", perPiece: { cal: 4, p: 0.5, f: 0.1, c: 1.0 }, icon: "🍄" },
    { keywords: [/kiwi|キウイ|奇异果/i], name: "キウイフルーツ", perPiece: { cal: 53, p: 1.0, f: 0.1, c: 13.5 }, icon: "🥝" },
    { keywords: [/apple|りんご|リンゴ|苹果/i], name: "りんご", perPiece: { cal: 138, p: 0.5, f: 0.3, c: 38.0 }, icon: "🍎" },
    { keywords: [/banana|バナナ|香蕉/i], name: "バナナ", perPiece: { cal: 86, p: 1.1, f: 0.2, c: 22.5 }, icon: "🍌" },
    { keywords: [/orange|mikan|みかん|ミカン|橘子/i], name: "みかん", perPiece: { cal: 45, p: 0.7, f: 0.1, c: 11.0 }, icon: "🍊" },
    { keywords: [/strawberry|いちご|イチゴ|草莓/i], name: "いちご", perPiece: { cal: 5, p: 0.1, f: 0.0, c: 1.2 }, icon: "🍓" },
    { keywords: [/avocado|アボカド|牛油果/i], name: "アボカド", perPiece: { cal: 260, p: 3.0, f: 25.0, c: 8.0 }, icon: "🥑" },
    { keywords: [/sausage|wiener|ソーセージ|ウインナー/i], name: "ウインナーソーセージ", perPiece: { cal: 65, p: 2.5, f: 6.0, c: 0.6 }, icon: "🌭" },
    { keywords: [/ham|ハム/i], name: "ロースハム", perPiece: { cal: 20, p: 1.8, f: 1.2, c: 0.3 }, icon: "🍖" },
    { keywords: [/egg|tamago|卵|たまご|玉子/i], name: "卵", perPiece: { cal: 76, p: 6.2, f: 5.2, c: 0.2 }, icon: "🥚" },
    { keywords: [/bread|toast|パン|トースト/i], name: "食パン", perPiece: { cal: 160, p: 6.0, f: 2.5, c: 28.0 }, icon: "🍞" },
  ];

  const explicitWeightMatch = query.match(/(\d+(?:\.\d+)?)\s*(g|グラム)/i);
  const explicitCountMatch = query.match(/(\d+(?:\.\d+)?)\s*(個|つ|本|粒|枚|パック|个|個入)/i);

  // グラム指定がある場合
  if (explicitWeightMatch) {
    const grams = parseFloat(explicitWeightMatch[1]);
    const ratio = grams / 100;
    for (const item of weightDb) {
      if (item.keywords.some((r) => r.test(query))) {
        return {
          food_name: `${item.name} (${grams}g)`,
          label: `${item.name} (${grams}g)`,
          calories: Math.round(item.per100g.cal * ratio),
          protein: parseFloat((item.per100g.p * ratio).toFixed(1)),
          fat: parseFloat((item.per100g.f * ratio).toFixed(1)),
          carbs: parseFloat((item.per100g.c * ratio).toFixed(1)),
          isExactOrKnown: true,
          icon: item.icon,
        };
      }
    }
  }

  // 個数指定がある場合
  if (explicitCountMatch) {
    const count = parseFloat(explicitCountMatch[1]);
    for (const item of countDb) {
      if (item.keywords.some((r) => r.test(query))) {
        const unit = item.unit || "個";
        return {
          food_name: `${item.name} (${count}${unit})`,
          label: `${item.name} (${count}${unit})`,
          calories: Math.round(item.perPiece.cal * count),
          protein: parseFloat((item.perPiece.p * count).toFixed(1)),
          fat: parseFloat((item.perPiece.f * count).toFixed(1)),
          carbs: parseFloat((item.perPiece.c * count).toFixed(1)),
          isExactOrKnown: true,
          icon: item.icon,
        };
      }
    }
  }

  // 単位指定なしで個数ベース照合
  for (const item of countDb) {
    if (item.keywords.some((r) => r.test(query))) {
      const unit = item.unit || "個";
      return {
        food_name: `${item.name} (1${unit})`,
        label: `${item.name} (1${unit})`,
        calories: item.perPiece.cal,
        protein: item.perPiece.p,
        fat: item.perPiece.f,
        carbs: item.perPiece.c,
        isExactOrKnown: true,
        icon: item.icon,
      };
    }
  }

  // 単位指定なしでグラムベース照合
  for (const item of weightDb) {
    if (item.keywords.some((r) => r.test(query))) {
      return {
        food_name: `${item.name} (100g)`,
        label: `${item.name} (100g)`,
        calories: item.per100g.cal,
        protein: item.per100g.p,
        fat: item.per100g.f,
        carbs: item.per100g.c,
        isExactOrKnown: true,
        icon: item.icon,
      };
    }
  }

  // 2. 通常のローカル辞書検索
  const matches = searchFoodSuggestions(input, 1);
  if (matches.length > 0) {
    const matched = matches[0];
    return {
      food_name: matched.name,
      label: matched.label,
      calories: matched.calories,
      protein: matched.protein,
      fat: matched.fat,
      carbs: matched.carbs,
      isExactOrKnown: true,
      icon: matched.icon || "🍽️",
    };
  }

  // 3. 該当食材がない場合（適当な150kcal等のデフォルト値を完全廃止し、未特定として返却）
  return {
    food_name: query,
    label: `${query} (未登録食材)`,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    isExactOrKnown: false,
    icon: "🍽️",
  };
}
