import { NextResponse } from "next/server";

// 1. 基礎食材辞書（包含主食、肉类/海鲜、常见日本超市蔬菜）
const BASE_INGREDIENTS = [
  // --- 主食 (Staples) ---
  { keywords: [/rice|ご飯|ライス|米|白米/i], name: "白ご飯 (150g)", calories: 240, protein: 3.8, fat: 0.5, carbs: 55.0 },
  { keywords: [/noodle|ramen|udon|soba|麺|ラーメン|うどん|そば|パスタ|面/i], name: "麺類/パスタ (200g)", calories: 350, protein: 9.0, fat: 2.0, carbs: 70.0 },
  { keywords: [/bread|toast|パン|トースト/i], name: "食パン (60g)", calories: 160, protein: 6.0, fat: 2.5, carbs: 28.0 },

  // --- 肉类 & 海鲜 (Proteins) ---
  { keywords: [/chicken|チキン|鶏|胸肉|むね肉|ささみ|鶏肉/i], name: "鶏肉/サラダチキン (100g)", calories: 110, protein: 23.0, fat: 1.5, carbs: 0.0 },
  { keywords: [/beef|gyu|牛|牛肉|ステーキ/i], name: "牛肉 (100g)", calories: 250, protein: 20.0, fat: 18.0, carbs: 0.5 },
  { keywords: [/pork|豚|豚肉|ポーク/i], name: "豚肉 (100g)", calories: 220, protein: 19.0, fat: 15.0, carbs: 0.2 },
  { keywords: [/fish|salmon|tuna|魚|鮭|サーモン|マグロ|刺身/i], name: "魚介類平均 (100g)", calories: 140, protein: 20.0, fat: 6.0, carbs: 0.0 },
  { keywords: [/shrimp|prawn|エビ|えび|海老/i], name: "エビ (100g)", calories: 90, protein: 20.0, fat: 0.5, carbs: 0.0 },
  { keywords: [/egg|tamago|卵|たまご|玉子/i], name: "全卵 (1個 50g)", calories: 80, protein: 6.5, fat: 5.5, carbs: 0.2 },

  // --- 日本超市常见蔬菜 (Vegetables) ---
  { keywords: [/tomato|トマト|西紅柿/i], name: "トマト (1個 150g)", calories: 30, protein: 1.0, fat: 0.2, carbs: 7.0 },
  { keywords: [/cabbage|キャベツ|白菜|はくさい/i], name: "キャベツ/白菜 (100g)", calories: 20, protein: 1.3, fat: 0.1, carbs: 4.5 },
  { keywords: [/broccoli|cauliflower|ブロッコリー|花菜/i], name: "ブロッコリー (100g)", calories: 33, protein: 4.3, fat: 0.5, carbs: 5.2 },
  { keywords: [/carrot|人参|にんじん|胡蘿蔔/i], name: "ニンジン (100g)", calories: 35, protein: 0.8, fat: 0.2, carbs: 8.5 },
  { keywords: [/eggplant|ナス|茄子/i], name: "ナス (1個 80g)", calories: 18, protein: 0.9, fat: 0.1, carbs: 4.1 },
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // "file" または "image" からファイルを取得
    const file = (formData.get("file") || formData.get("image")) as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "画像ファイルが送信されていません" },
        { status: 400 }
      );
    }

    const fileName = (file.name || "").toLowerCase();

    // 基礎食材辞書からマッチする食材を検索
    const matched = BASE_INGREDIENTS.find((item) =>
      item.keywords.some((regex) => regex.test(fileName))
    );

    // 一致した場合は該当の基礎食材栄養データを返却
    if (matched) {
      return NextResponse.json({
        success: true,
        matched: true,
        data: {
          food_name: matched.name,
          calories: matched.calories,
          protein: matched.protein,
          fat: matched.fat,
          carbs: matched.carbs,
          confidence: 0.95,
          note: `「${matched.name}」の栄養データを自動セットしました。`,
          source: "base_ingredients_master",
        },
      });
    }

    // 特定できない場合はランダム割り当てを廃止し、matched: false でスキップ
    return NextResponse.json({
      success: true,
      matched: false,
      data: null,
      message: "食材を自動特定できませんでした。手動で食品名・カロリー・PFCを入力してください。",
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("画像解析エラー:", err);
    return NextResponse.json(
      { success: false, error: `画像解析に失敗しました: ${err.message}` },
      { status: 500 }
    );
  }
}
