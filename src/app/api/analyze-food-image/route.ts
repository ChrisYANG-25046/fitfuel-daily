import { NextResponse } from "next/server";

type WeightFoodItem = {
  keywords: RegExp[];
  name: string;
  unitType: "weight";
  per100g: { cal: number; p: number; f: number; c: number };
  perPiece?: { cal: number; p: number; f: number; c: number };
  defaultWeight?: string;
};

type CountFoodItem = {
  keywords: RegExp[];
  name: string;
  unitType: "count";
  perPiece: { cal: number; p: number; f: number; c: number };
  per100g?: { cal: number; p: number; f: number; c: number };
  defaultWeight?: string;
};

type FoodItem = WeightFoodItem | CountFoodItem;

// 日本大型超市生鮮・野菜・果物・肉海鮮・豆製品の大規模データベース
const COMPREHENSIVE_JAPAN_FOOD_DB: FoodItem[] = [
  // --- 水果類 (Fruit) ---
  {
    keywords: [/kiwi|キウイ|奇异果/i],
    name: "キウイフルーツ",
    unitType: "count",
    perPiece: { cal: 53, p: 1.0, f: 0.1, c: 13.5 },
    per100g: { cal: 53, p: 1.0, f: 0.1, c: 13.5 },
  },
  {
    keywords: [/apple|りんご|リンゴ|苹果/i],
    name: "りんご",
    unitType: "count",
    perPiece: { cal: 138, p: 0.5, f: 0.3, c: 38.0 },
    per100g: { cal: 57, p: 0.2, f: 0.1, c: 15.5 },
  },
  {
    keywords: [/banana|バナナ|香蕉/i],
    name: "バナナ",
    unitType: "count",
    perPiece: { cal: 86, p: 1.1, f: 0.2, c: 22.5 },
    per100g: { cal: 86, p: 1.1, f: 0.2, c: 22.5 },
  },
  {
    keywords: [/orange|mikan|みかん|ミカン|橘子|橙子/i],
    name: "みかん",
    unitType: "count",
    perPiece: { cal: 45, p: 0.7, f: 0.1, c: 11.0 },
    per100g: { cal: 45, p: 0.7, f: 0.1, c: 11.0 },
  },
  {
    keywords: [/strawberry|いちご|イチゴ|草莓/i],
    name: "いちご",
    unitType: "count",
    perPiece: { cal: 5, p: 0.1, f: 0.0, c: 1.2 },
    per100g: { cal: 34, p: 0.9, f: 0.1, c: 8.5 },
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
    per100g: { cal: 187, p: 2.5, f: 18.7, c: 6.2 },
  },

  // --- 定番野菜・葉物・根菜 (Vegetables) ---
  {
    keywords: [/cabbage|キャベツ|甘藍/i],
    name: "キャベツ",
    unitType: "weight",
    per100g: { cal: 21, p: 1.3, f: 0.1, c: 4.8 },
  },
  {
    keywords: [/lettuce|レタス|生菜/i],
    name: "レタス",
    unitType: "weight",
    per100g: { cal: 11, p: 0.6, f: 0.1, c: 2.3 },
  },
  {
    keywords: [/chinese cabbage|白菜|はくさい/i],
    name: "白菜",
    unitType: "weight",
    per100g: { cal: 13, p: 0.9, f: 0.1, c: 3.0 },
  },
  {
    keywords: [/spinach|ほうれん草|ホウレンソウ|菠菜/i],
    name: "ほうれん草",
    unitType: "weight",
    per100g: { cal: 18, p: 2.2, f: 0.3, c: 3.1 },
  },
  {
    keywords: [/komatsuna|小松菜/i],
    name: "小松菜",
    unitType: "weight",
    per100g: { cal: 13, p: 1.5, f: 0.2, c: 2.4 },
  },
  {
    keywords: [/onion|玉ねぎ|タマネギ|洋葱/i],
    name: "玉ねぎ",
    unitType: "count",
    perPiece: { cal: 65, p: 1.5, f: 0.1, c: 15.0 },
    per100g: { cal: 33, p: 0.8, f: 0.1, c: 7.5 },
  },
  {
    keywords: [/green onion|leek|長ネギ|長ねぎ|白ネギ|青ネギ|小ネギ|大葱|(?<![玉たま])ネギ|(?<![玉たま])ねぎ/i],
    name: "長ネギ",
    unitType: "count",
    perPiece: { cal: 34, p: 1.5, f: 0.1, c: 7.0 },
    per100g: { cal: 34, p: 1.5, f: 0.1, c: 7.0 },
  },
  {
    keywords: [/chive|nira|ニラ|にら|韭菜/i],
    name: "ニラ",
    unitType: "weight",
    per100g: { cal: 21, p: 1.7, f: 0.3, c: 4.0 },
  },
  {
    keywords: [/sprout|moyashi|もやし|豆芽/i],
    name: "もやし",
    unitType: "weight",
    per100g: { cal: 15, p: 1.7, f: 0.1, c: 2.6 },
  },
  {
    keywords: [/mini.*tomato|petit.*tomato|ミニトマト|プチトマト|小番茄/i],
    name: "ミニトマト",
    unitType: "count",
    perPiece: { cal: 4, p: 0.1, f: 0.0, c: 1.0 },
    per100g: { cal: 30, p: 1.1, f: 0.1, c: 7.2 },
  },
  {
    keywords: [/tomato|トマト|西紅柿|西红柿/i],
    name: "トマト",
    unitType: "count",
    perPiece: { cal: 30, p: 1.0, f: 0.2, c: 7.0 },
    per100g: { cal: 20, p: 0.7, f: 0.1, c: 4.7 },
  },
  {
    keywords: [/cucumber|きゅうり|キュウリ|黄瓜/i],
    name: "きゅうり",
    unitType: "count",
    perPiece: { cal: 14, p: 0.8, f: 0.1, c: 3.0 },
    per100g: { cal: 14, p: 0.8, f: 0.1, c: 3.0 },
  },
  {
    keywords: [/eggplant|ナス|茄子/i],
    name: "ナス",
    unitType: "count",
    perPiece: { cal: 18, p: 0.9, f: 0.1, c: 4.1 },
    per100g: { cal: 22, p: 1.1, f: 0.1, c: 5.1 },
  },
  {
    keywords: [/green pepper|ピーマン|青椒/i],
    name: "ピーマン",
    unitType: "count",
    perPiece: { cal: 6, p: 0.3, f: 0.1, c: 1.4 },
    per100g: { cal: 20, p: 1.0, f: 0.2, c: 4.7 },
  },
  {
    keywords: [/broccoli|ブロッコリー|西兰花/i],
    name: "ブロッコリー",
    unitType: "weight",
    per100g: { cal: 37, p: 4.3, f: 0.6, c: 5.2 },
  },
  {
    keywords: [/carrot|人参|にんじん|胡蘿蔔|胡萝卜/i],
    name: "人参",
    unitType: "weight",
    per100g: { cal: 35, p: 0.8, f: 0.2, c: 8.5 },
    perPiece: { cal: 53, p: 1.2, f: 0.3, c: 12.8 },
  },
  {
    keywords: [/radish|大根|だいこん|白萝卜/i],
    name: "大根",
    unitType: "weight",
    per100g: { cal: 15, p: 0.4, f: 0.1, c: 3.8 },
  },
  {
    keywords: [/pumpkin|かぼちゃ|カボチャ|南瓜/i],
    name: "かぼちゃ",
    unitType: "weight",
    per100g: { cal: 78, p: 1.6, f: 0.3, c: 20.6 },
  },
  {
    keywords: [/potato|じゃがいも|ジャガイモ|马铃薯/i],
    name: "じゃがいも",
    unitType: "count",
    perPiece: { cal: 76, p: 1.6, f: 0.1, c: 17.3 },
    per100g: { cal: 76, p: 1.6, f: 0.1, c: 17.3 },
  },
  {
    keywords: [/sweet potato|さつまいも|サツマイモ|红薯/i],
    name: "さつまいも",
    unitType: "weight",
    per100g: { cal: 126, p: 1.2, f: 0.2, c: 31.5 },
  },

  // --- 菌類 (Mushrooms: 100gあたり / 個数) ---
  {
    keywords: [/eringi|エリンギ|杏鲍菇/i],
    name: "エリンギ",
    unitType: "weight",
    per100g: { cal: 19, p: 2.8, f: 0.3, c: 4.3 },
  },
  {
    keywords: [/shimeji|しめじ|シメジ/i],
    name: "しめじ",
    unitType: "weight",
    per100g: { cal: 18, p: 2.0, f: 0.4, c: 4.8 },
  },
  {
    keywords: [/enoki|えのき|エノキ|金针菇/i],
    name: "えのき",
    unitType: "weight",
    per100g: { cal: 22, p: 2.7, f: 0.2, c: 7.6 },
  },
  {
    keywords: [/shiitake|しいたけ|シイタケ|香菇/i],
    name: "しいたけ",
    unitType: "count",
    perPiece: { cal: 4, p: 0.5, f: 0.1, c: 1.0 },
    per100g: { cal: 25, p: 3.0, f: 0.4, c: 5.5 },
  },

  // --- 豆製品 (Tofu & Natto) ---
  {
    keywords: [/natto|納豆|纳豆/i],
    name: "納豆",
    unitType: "count",
    perPiece: { cal: 100, p: 8.3, f: 5.0, c: 6.0 }, // 1パック(50g)
    per100g: { cal: 200, p: 16.5, f: 10.0, c: 12.0 },
  },
  {
    keywords: [/tofu|豆腐|とうふ/i],
    name: "木綿/絹豆腐",
    unitType: "weight",
    per100g: { cal: 72, p: 6.6, f: 4.2, c: 1.6 },
  },
  {
    keywords: [/edamame|枝豆|毛豆/i],
    name: "枝豆",
    unitType: "weight",
    per100g: { cal: 135, p: 11.7, f: 6.2, c: 8.8 },
  },

  // --- 肉類・加工肉 ---
  {
    keywords: [/chicken|チキン|鶏|胸肉|むね肉|ささみ/i],
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
    name: "牛肉",
    unitType: "weight",
    per100g: { cal: 240, p: 18.0, f: 17.5, c: 0.4 },
  },
  {
    keywords: [/pork|豚|豚肉|ポーク/i],
    name: "豚肉",
    unitType: "weight",
    per100g: { cal: 210, p: 19.3, f: 14.7, c: 0.2 },
  },
  {
    keywords: [/sausage|wiener|ソーセージ|ウインナー/i],
    name: "ウインナーソーセージ",
    unitType: "count",
    perPiece: { cal: 65, p: 2.5, f: 6.0, c: 0.6 },
    per100g: { cal: 320, p: 12.5, f: 30.0, c: 3.0 },
  },
  {
    keywords: [/ham|ハム/i],
    name: "ロースハム",
    unitType: "count",
    perPiece: { cal: 20, p: 1.8, f: 1.2, c: 0.3 },
    per100g: { cal: 196, p: 17.0, f: 14.0, c: 1.5 },
  },

  // --- 海鮮類 ---
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
    keywords: [/mackerel|サバ|さば|鯖/i],
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
    keywords: [/squid|イカ|いか|鱿鱼/i],
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

  // --- 卵・主食 ---
  {
    keywords: [/egg|tamago|卵|たまご|玉子/i],
    name: "卵",
    unitType: "count",
    perPiece: { cal: 76, p: 6.2, f: 5.2, c: 0.2 },
    per100g: { cal: 151, p: 12.3, f: 10.3, c: 0.4 },
  },
  {
    keywords: [/rice|ご飯|ライス|米|白米/i],
    name: "白ご飯",
    unitType: "weight",
    per100g: { cal: 156, p: 2.5, f: 0.3, c: 35.6 },
  },
  {
    keywords: [/noodle|ramen|udon|麺|ラーメン|うどん|そば|パスタ/i],
    name: "麺類",
    unitType: "weight",
    per100g: { cal: 175, p: 4.5, f: 1.0, c: 35.0 },
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

    let matchedFood: FoodItem | null = null;
    for (const item of COMPREHENSIVE_JAPAN_FOOD_DB) {
      if (item.keywords.some((r) => r.test(targetQuery))) {
        matchedFood = item;
        break;
      }
    }

    if (!matchedFood) {
      return NextResponse.json({
        success: true,
        matched: false,
        message:
          "該当する食品が見つかりませんでした。正確な数値を手入力してください。",
      });
    }

    // 明示的な重量・個数の正規表現抽出
    const weightMatch = targetQuery.match(/(\d+(?:\.\d+)?)\s*(g|グラム)/i);
    const countMatch = targetQuery.match(
      /(\d+(?:\.\d+)?)\s*(個|つ|本|粒|枚|パック|个|個入)/i
    );

    let calculated = {
      name: matchedFood.name,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };

    if (weightMatch && "per100g" in matchedFood && matchedFood.per100g) {
      // 1. グラム指定優先（例: トマト 200g, 牛肉 289g, 玉ねぎ 100g）
      const grams = parseFloat(weightMatch[1]);
      const ratio = grams / 100;

      calculated.name = `${matchedFood.name} (${grams}g)`;
      calculated.calories = Math.round(matchedFood.per100g.cal * ratio);
      calculated.protein = parseFloat((matchedFood.per100g.p * ratio).toFixed(1));
      calculated.fat = parseFloat((matchedFood.per100g.f * ratio).toFixed(1));
      calculated.carbs = parseFloat((matchedFood.per100g.c * ratio).toFixed(1));
    } else if (countMatch && "perPiece" in matchedFood && matchedFood.perPiece) {
      // 2. 個数/パック指定優先（例: きゅうり 2本, 納豆 1パック, トマト 2個）
      const count = parseFloat(countMatch[1]);
      const unitLabel = matchedFood.name.includes("納豆") ? "パック" : "個";

      calculated.name = `${matchedFood.name} (${count}${unitLabel})`;
      calculated.calories = Math.round(matchedFood.perPiece.cal * count);
      calculated.protein = parseFloat((matchedFood.perPiece.p * count).toFixed(1));
      calculated.fat = parseFloat((matchedFood.perPiece.f * count).toFixed(1));
      calculated.carbs = parseFloat((matchedFood.perPiece.c * count).toFixed(1));
    } else if (matchedFood.unitType === "weight") {
      // 3. 重量基準のデフォルト（例: キャベツ -> 100g）
      const numMatch = targetQuery.match(/(\d+(?:\.\d+)?)\s*(g|グラム)?/i);
      const grams = numMatch && numMatch[1] ? parseFloat(numMatch[1]) : 100;
      const ratio = grams / 100;

      calculated.name = `${matchedFood.name} (${grams}g)`;
      calculated.calories = Math.round(matchedFood.per100g.cal * ratio);
      calculated.protein = parseFloat((matchedFood.per100g.p * ratio).toFixed(1));
      calculated.fat = parseFloat((matchedFood.per100g.f * ratio).toFixed(1));
      calculated.carbs = parseFloat((matchedFood.per100g.c * ratio).toFixed(1));
    } else {
      // 4. 個数基準のデフォルト（例: トマト -> 1個, 納豆 -> 1パック）
      const numMatch = targetQuery.match(/(\d+(?:\.\d+)?)\s*(個|つ|本|粒|枚|パック)?/i);
      const count = numMatch && numMatch[1] ? parseFloat(numMatch[1]) : 1;
      const unitLabel = matchedFood.name.includes("納豆") ? "パック" : "個";

      calculated.name = `${matchedFood.name} (${count}${unitLabel})`;
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
        note: "スーパー生鮮・野菜・豆類データベースより自動計算",
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
