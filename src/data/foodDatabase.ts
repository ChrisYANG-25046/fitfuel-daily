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
// 食品名からカロリー・PFCを自動予測する関数
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

  const query = input.trim();

  // ヒューリスティック推定
  if (/肉|チキン|牛|豚|ささみ|魚|エビ|サーモン|プロテイン/i.test(query)) {
    return {
      food_name: query,
      label: `${query} (一般的な肉・魚・高タンパク質)`,
      calories: 200,
      protein: 20.0,
      fat: 10.0,
      carbs: 2.0,
      isExactOrKnown: false,
      icon: "🥩",
    };
  }

  if (/飯|ごはん|米|麺|パン|パスタ|うどん|丼|ラーメン|オートミール/i.test(query)) {
    return {
      food_name: query,
      label: `${query} (一般的な主食・炭水化物)`,
      calories: 250,
      protein: 6.0,
      fat: 3.0,
      carbs: 50.0,
      isExactOrKnown: false,
      icon: "🍚",
    };
  }

  if (/サラダ|野菜|スープ|味噌汁|ブロッコリー/i.test(query)) {
    return {
      food_name: query,
      label: `${query} (一般的な野菜・汁物)`,
      calories: 60,
      protein: 2.0,
      fat: 1.0,
      carbs: 10.0,
      isExactOrKnown: false,
      icon: "🥗",
    };
  }

  // デフォルト値
  return {
    food_name: query || "未指定の食品",
    label: `${query || "食品"} (標準的な概算値)`,
    calories: 150,
    protein: 8.0,
    fat: 5.0,
    carbs: 18.0,
    isExactOrKnown: false,
    icon: "🍽️",
  };
}
