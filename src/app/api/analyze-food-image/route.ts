import { NextResponse } from "next/server";

type WeightFreshItem = {
  keywords: RegExp[];
  name: string;
  unitType: "weight";
  per100g: { cal: number; p: number; f: number; c: number };
  defaultWeight?: string;
};

type CountFreshItem = {
  keywords: RegExp[];
  name: string;
  unitType: "count";
  perPiece: { cal: number; p: number; f: number; c: number };
  defaultWeight?: string;
};

type FreshItem = WeightFreshItem | CountFreshItem;

// 日本大型超市常见生鲜、水果、肉类、海鲜精细数据库
const EXPANDED_JAPAN_FRESH_DATABASE: FreshItem[] = [
  // --- 水果類 (Fruit: 個数・1個あたりの標準値) ---
  {
    keywords: [/kiwi|キウイ|奇异果|弥生/i],
    name: "キウイフルーツ",
    unitType: "count",
    perPiece: { cal: 53, p: 1.0, f: 0.1, c: 13.5 },
    defaultWeight: "1個 (約100g)",
  },
  {
    keywords: [/apple|りんご|リンゴ|苹果/i],
    name: "りんご",
    unitType: "count",
    perPiece: { cal: 138, p: 0.5, f: 0.3, c: 38.0 },
    defaultWeight: "1個 (約250g)",
  },
  {
    keywords: [/banana|バナナ|香蕉/i],
    name: "バナナ",
    unitType: "count",
    perPiece: { cal: 86, p: 1.1, f: 0.2, c: 22.5 },
    defaultWeight: "1本 (約100g)",
  },
  {
    keywords: [/orange|mikan|みかん|ミカン|桔子|橙子/i],
    name: "みかん/オレンジ",
    unitType: "count",
    perPiece: { cal: 45, p: 0.7, f: 0.1, c: 11.0 },
    defaultWeight: "1個 (約100g)",
  },
  {
    keywords: [/strawberry|いちご|イチゴ|草莓/i],
    name: "いちご",
    unitType: "count",
    perPiece: { cal: 5, p: 0.1, f: 0.0, c: 1.2 },
    defaultWeight: "1粒 (約15g)",
  },
  {
    keywords: [/grape|ぶどう|ブドウ|葡萄/i],
    name: "ぶどう",
    unitType: "weight",
    per100g: { cal: 59, p: 0.4, f: 0.1, c: 15.2 },
  },
  {
    keywords: [/avocado|アボカド|牛油果/i],
    name: "アボカド",
    unitType: "count",
    perPiece: { cal: 260, p: 3.0, f: 25.0, c: 8.0 },
    defaultWeight: "1個 (約140g)",
  },

  // --- 肉類・加工肉 (Meat: 100gあたり) ---
  {
    keywords: [/chicken|チキン|鶏|胸肉|むね肉|ささみ|鶏肉/i],
    name: "鶏むね肉/ささみ",
    unitType: "weight",
    per100g: { cal: 108, p: 23.3, f: 1.5, c: 0.0 },
  },
  {
    keywords: [/thigh|もも肉|鶏もも/i],
    name: "鶏もも肉",
    unitType: "weight",
    per100g: { cal: 190, p: 16.6, f: 14.2, c: 0.0 },
  },
  {
    keywords: [/beef|牛|牛肉|ステーキ/i],
    name: "牛肉 (赤身/バラ平均)",
    unitType: "weight",
    per100g: { cal: 240, p: 18.0, f: 17.5, c: 0.4 },
  },
  {
    keywords: [/pork|豚|豚肉|ポーク|ロース/i],
    name: "豚肉",
    unitType: "weight",
    per100g: { cal: 210, p: 19.3, f: 14.7, c: 0.2 },
  },
  {
    keywords: [/sausage|wiener|winener|ソーセージ|ウインナー|香肠/i],
    name: "ウインナーソーセージ",
    unitType: "count",
    perPiece: { cal: 65, p: 2.5, f: 6.0, c: 0.6 },
    defaultWeight: "1本 (約20g)",
  },
  {
    keywords: [/ham|ハム|火腿/i],
    name: "ロースハム",
    unitType: "count",
    perPiece: { cal: 20, p: 1.8, f: 1.2, c: 0.3 },
    defaultWeight: "1枚 (約10g)",
  },

  // --- 魚介・海鮮製品 (Seafood: 100gあたり) ---
  {
    keywords: [/salmon|鮭|サーモン|三文鱼/i],
    name: "鮭/サーモン",
    unitType: "weight",
    per100g: { cal: 170, p: 20.1, f: 9.4, c: 0.1 },
  },
  {
    keywords: [/tuna|マグロ|まぐろ|金枪鱼/i],
    name: "マグロ (赤身)",
    unitType: "weight",
    per100g: { cal: 115, p: 26.4, f: 1.4, c: 0.1 },
  },
  {
    keywords: [/mackerel|サバ|さば|青魚|鯖/i],
    name: "サバ",
    unitType: "weight",
    per100g: { cal: 210, p: 20.6, f: 16.8, c: 0.3 },
  },
  {
    keywords: [/shrimp|prawn|エビ|えび|海老/i],
    name: "エビ",
    unitType: "weight",
    per100g: { cal: 82, p: 18.4, f: 0.6, c: 0.3 },
  },
  {
    keywords: [/squid|イカ|いか|乌贼|鱿鱼/i],
    name: "イカ",
    unitType: "weight",
    per100g: { cal: 76, p: 17.9, f: 0.8, c: 0.1 },
  },
  {
    keywords: [/octopus|タコ|たこ|章鱼/i],
    name: "タコ",
    unitType: "weight",
    per100g: { cal: 70, p: 16.4, f: 0.7, c: 0.1 },
  },

  // --- 卵・主食・定番野菜 ---
  {
    keywords: [/egg|tamago|卵|たまご|玉子/i],
    name: "卵",
    unitType: "count",
    perPiece: { cal: 76, p: 6.2, f: 5.2, c: 0.2 },
    defaultWeight: "1個 (Lサイズ50g)",
  },
  {
    keywords: [/rice|ご飯|ライス|米|白米/i],
    name: "白ご飯",
    unitType: "weight",
    per100g: { cal: 156, p: 2.5, f: 0.3, c: 35.6 },
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

    // 1. 食材キーワードの厳密な交集・マッチング
    let matchedFood: FreshItem | null = null;
    for (const item of EXPANDED_JAPAN_FRESH_DATABASE) {
      if (item.keywords.some((r) => r.test(targetQuery))) {
        matchedFood = item;
        break;
      }
    }

    // 2. データベース中に該当する食材がない場合、適当なデフォルト値（150kcal等）を排除し、必ず matched: false を返却
    if (!matchedFood) {
      return NextResponse.json({
        success: true,
        matched: false,
        message:
          "該当する生鮮食品が見つかりませんでした。正確な数値を手入力してください。",
      });
    }

    let calculated = {
      name: matchedFood.name,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };

    if (matchedFood.unitType === "weight") {
      // グラム数解析（例: 牛肉 289g, 200g）
      const weightMatch = targetQuery.match(/(\d+(?:\.\d+)?)\s*(g|グラム)?/i);
      const grams = weightMatch ? parseFloat(weightMatch[1]) : 100;
      const ratio = grams / 100;

      calculated.name = `${matchedFood.name} (${grams}g)`;
      calculated.calories = Math.round(matchedFood.per100g.cal * ratio);
      calculated.protein = parseFloat((matchedFood.per100g.p * ratio).toFixed(1));
      calculated.fat = parseFloat((matchedFood.per100g.f * ratio).toFixed(1));
      calculated.carbs = parseFloat((matchedFood.per100g.c * ratio).toFixed(1));
    } else {
      // 個数解析（例: キウイ 1個 -> 53kcal, P:1.0g, F:0.1g, C:13.5g）
      const countMatch = targetQuery.match(/(\d+(?:\.\d+)?)\s*(個|つ|本|粒|枚)?/i);
      const count = countMatch ? parseFloat(countMatch[1]) : 1;

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
        note: "スーパー生鮮・果物データベースより正確に動的計算",
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
