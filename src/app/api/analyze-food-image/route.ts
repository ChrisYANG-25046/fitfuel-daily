import { NextResponse } from "next/server";

type WeightItem = {
  keywords: RegExp[];
  name: string;
  unitType: "weight";
  per100g: { cal: number; p: number; f: number; c: number };
};

type CountItem = {
  keywords: RegExp[];
  name: string;
  unitType: "count";
  perPiece: { cal: number; p: number; f: number; c: number };
  defaultCount?: number;
};

type BaseItem = WeightItem | CountItem;

// 1. 100gあたりの標準栄養価（または1個あたりの単位）
const BASE_DATABASE: BaseItem[] = [
  // --- グラムベース (100gあたり) ---
  {
    keywords: [/beef|牛|牛肉|ステーキ/i],
    name: "牛肉",
    unitType: "weight",
    per100g: { cal: 250, p: 20.0, f: 18.0, c: 0.5 },
  },
  {
    keywords: [/chicken|チキン|鶏|胸肉|むね肉|ささみ/i],
    name: "鶏肉/サラダチキン",
    unitType: "weight",
    per100g: { cal: 110, p: 23.0, f: 1.5, c: 0.0 },
  },
  {
    keywords: [/pork|豚|豚肉|ポーク/i],
    name: "豚肉",
    unitType: "weight",
    per100g: { cal: 220, p: 19.0, f: 15.0, c: 0.2 },
  },
  {
    keywords: [/fish|salmon|魚|鮭|サーモン|マグロ|刺身/i],
    name: "魚介類",
    unitType: "weight",
    per100g: { cal: 140, p: 20.0, f: 6.0, c: 0.0 },
  },
  {
    keywords: [/rice|ご飯|ライス|米|白米/i],
    name: "白ご飯",
    unitType: "weight",
    per100g: { cal: 160, p: 2.5, f: 0.3, c: 37.0 },
  },
  {
    keywords: [/noodle|ramen|udon|麺|ラーメン|うどん|そば|パスタ/i],
    name: "麺類",
    unitType: "weight",
    per100g: { cal: 175, p: 4.5, f: 1.0, c: 35.0 },
  },

  // --- 個数ベース (1個/1つあたり) ---
  {
    keywords: [/egg|tamago|卵|たまご|玉子/i],
    name: "卵",
    unitType: "count",
    perPiece: { cal: 80, p: 6.5, f: 5.5, c: 0.2 },
    defaultCount: 1,
  },
  {
    keywords: [/bread|toast|パン|トースト/i],
    name: "食パン",
    unitType: "count",
    perPiece: { cal: 160, p: 6.0, f: 2.5, c: 28.0 },
    defaultCount: 1,
  },
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("image")) as File | null;
    const textInput = (formData.get("text") as string) || "";
    const targetQuery = textInput || (file ? file.name : "");

    if (!targetQuery) {
      return NextResponse.json(
        { error: "解析対象のデータがありません" },
        { status: 400 }
      );
    }

    // 食材のマッチング
    let matchedFood: BaseItem | null = null;
    for (const item of BASE_DATABASE) {
      if (item.keywords.some((r) => r.test(targetQuery))) {
        matchedFood = item;
        break;
      }
    }

    if (!matchedFood) {
      return NextResponse.json({
        success: true,
        matched: false,
        message: "食材を特定できませんでした",
      });
    }

    const calculated = {
      name: matchedFood.name,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };

    if (matchedFood.unitType === "weight") {
      // グラム数解析（例: 289g, 150グラム, 200）
      const weightMatch = targetQuery.match(/(\d+(?:\.\d+)?)\s*(g|グラム|個)?/i);
      const grams = weightMatch ? parseFloat(weightMatch[1]) : 100; // デフォルト100g
      const ratio = grams / 100;

      calculated.name = `${matchedFood.name} (${grams}g)`;
      calculated.calories = Math.round(matchedFood.per100g.cal * ratio);
      calculated.protein = parseFloat((matchedFood.per100g.p * ratio).toFixed(1));
      calculated.fat = parseFloat((matchedFood.per100g.f * ratio).toFixed(1));
      calculated.carbs = parseFloat((matchedFood.per100g.c * ratio).toFixed(1));
    } else {
      // 個数解析（例: 2個, 2つ, 3）
      const countMatch = targetQuery.match(/(\d+(?:\.\d+)?)\s*(個|つ|個入)?/i);
      const count = countMatch
        ? parseFloat(countMatch[1])
        : matchedFood.defaultCount || 1;

      calculated.name = `${matchedFood.name} (${count}個)`;
      calculated.calories = Math.round(matchedFood.perPiece.cal * count);
      calculated.protein = parseFloat((matchedFood.perPiece.p * count).toFixed(1));
      calculated.fat = parseFloat((matchedFood.perPiece.f * count).toFixed(1));
      calculated.carbs = parseFloat((matchedFood.perPiece.c * count).toFixed(1));
    }

    return NextResponse.json({
      success: true,
      matched: true,
      data: {
        food_name: calculated.name,
        calories: calculated.calories,
        protein: calculated.protein,
        fat: calculated.fat,
        carbs: calculated.carbs,
        note: "自然言語・数量解析エンジンにより自動計算",
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: `解析失敗: ${err.message}` },
      { status: 500 }
    );
  }
}
