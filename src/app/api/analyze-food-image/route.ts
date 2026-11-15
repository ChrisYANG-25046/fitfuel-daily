import { NextResponse } from "next/server";

type WeightFoodItem = {
  keywords: RegExp[];
  name: string;
  unitType: "weight";
  per100g: { cal: number; p: number; f: number; c: number };
};

type CountFoodItem = {
  keywords: RegExp[];
  name: string;
  unitType: "count";
  perPiece: { cal: number; p: number; f: number; c: number };
};

type FoodItem = WeightFoodItem | CountFoodItem;

// 日本の大型スーパー（イオン・ライフ・西友等）定番生鮮・野菜・海産・肉類・豆乳製品データベース
const SUPERMARKET_COMPREHENSIVE_DB: FoodItem[] = [
  // --- 果物類 (Fruit: 個数・1個/1本あたりの標準値) ---
  { keywords: [/kiwi|キウイ|奇异果/i], name: "キウイフルーツ", unitType: "count", perPiece: { cal: 53, p: 1.0, f: 0.1, c: 13.5 } },
  { keywords: [/apple|りんご|リンゴ|苹果/i], name: "りんご", unitType: "count", perPiece: { cal: 138, p: 0.5, f: 0.3, c: 38.0 } },
  { keywords: [/banana|バナナ|香蕉/i], name: "バナナ", unitType: "count", perPiece: { cal: 86, p: 1.1, f: 0.2, c: 22.5 } },
  { keywords: [/orange|mikan|みかん|ミカン|橘子/i], name: "みかん", unitType: "count", perPiece: { cal: 45, p: 0.7, f: 0.1, c: 11.0 } },
  { keywords: [/strawberry|いちご|イチゴ|草莓/i], name: "いちご", unitType: "count", perPiece: { cal: 5, p: 0.1, f: 0.0, c: 1.2 } },
  { keywords: [/grape|ぶどう|ブドウ|葡萄/i], name: "ぶどう", unitType: "weight", per100g: { cal: 59, p: 0.4, f: 0.1, c: 15.2 } },
  { keywords: [/avocado|アボカド|牛油果/i], name: "アボカド", unitType: "count", perPiece: { cal: 260, p: 3.0, f: 25.0, c: 8.0 } },
  { keywords: [/peach|もも|モモ|桃/i], name: "もも", unitType: "count", perPiece: { cal: 80, p: 1.2, f: 0.2, c: 20.4 } },
  { keywords: [/pear|なし|ナシ|梨/i], name: "梨", unitType: "count", perPiece: { cal: 95, p: 0.6, f: 0.2, c: 25.0 } },
  { keywords: [/grapefruit|グレープフルーツ|西柚/i], name: "グレープフルーツ", unitType: "count", perPiece: { cal: 100, p: 2.0, f: 0.2, c: 25.0 } },

  // --- 葉物・茎菜類 (Leafy & Stem Vegetables) ---
  { keywords: [/cabbage|キャベツ|甘藍|包菜/i], name: "キャベツ", unitType: "weight", per100g: { cal: 21, p: 1.3, f: 0.1, c: 4.8 } },
  { keywords: [/lettuce|レタス|生菜/i], name: "レタス", unitType: "weight", per100g: { cal: 11, p: 0.6, f: 0.1, c: 2.3 } },
  { keywords: [/chinese cabbage|白菜|はくさい/i], name: "白菜", unitType: "weight", per100g: { cal: 13, p: 0.9, f: 0.1, c: 3.0 } },
  { keywords: [/spinach|ほうれん草|ホウレンソウ|菠菜/i], name: "ほうれん草", unitType: "weight", per100g: { cal: 18, p: 2.2, f: 0.3, c: 3.1 } },
  { keywords: [/komatsuna|小松菜/i], name: "小松菜", unitType: "weight", per100g: { cal: 13, p: 1.5, f: 0.2, c: 2.4 } },
  // 玉ねぎを長ネギより先に定義して部分一致の誤判定を防止
  { keywords: [/onion|玉ねぎ|タマネギ|洋葱/i], name: "玉ねぎ", unitType: "count", perPiece: { cal: 65, p: 1.5, f: 0.1, c: 15.0 } },
  { keywords: [/negi|長ネギ|白ネギ|青ネギ|大葱|(?<![玉たま])ねぎ|(?<![玉たま])ネギ/i], name: "長ネギ", unitType: "weight", per100g: { cal: 28, p: 1.4, f: 0.1, c: 6.5 } },
  { keywords: [/nira|ニラ|にら|韭菜/i], name: "ニラ", unitType: "weight", per100g: { cal: 18, p: 1.7, f: 0.3, c: 3.2 } },
  { keywords: [/sprout|moyashi|もやし|豆芽/i], name: "もやし", unitType: "weight", per100g: { cal: 15, p: 1.7, f: 0.1, c: 2.6 } },
  { keywords: [/asparagus|アスパラ|芦笋/i], name: "アスパラガス", unitType: "weight", per100g: { cal: 21, p: 2.6, f: 0.2, c: 3.9 } },
  { keywords: [/celery|セロリ|芹菜/i], name: "セロリ", unitType: "weight", per100g: { cal: 12, p: 0.4, f: 0.1, c: 3.0 } },

  // --- 果菜・根菜類 (Fruiting & Root Vegetables) ---
  { keywords: [/tomato|トマト|西紅柿/i], name: "トマト", unitType: "count", perPiece: { cal: 30, p: 1.0, f: 0.2, c: 7.0 } },
  { keywords: [/cucumber|きゅうり|キュウリ|黄瓜/i], name: "きゅうり", unitType: "count", perPiece: { cal: 14, p: 0.8, f: 0.1, c: 3.0 } },
  { keywords: [/eggplant|ナス|茄子/i], name: "ナス", unitType: "count", perPiece: { cal: 18, p: 0.9, f: 0.1, c: 4.1 } },
  { keywords: [/green pepper|ピーマン|青椒/i], name: "ピーマン", unitType: "count", perPiece: { cal: 6, p: 0.3, f: 0.1, c: 1.4 } },
  { keywords: [/paprika|パプリカ|彩椒/i], name: "パプリカ", unitType: "count", perPiece: { cal: 38, p: 1.0, f: 0.2, c: 8.8 } },
  { keywords: [/broccoli|ブロッコリー|西兰花/i], name: "ブロッコリー", unitType: "weight", per100g: { cal: 37, p: 4.3, f: 0.6, c: 5.2 } },
  { keywords: [/cauliflower|カリフラワー|花菜/i], name: "カリフラワー", unitType: "weight", per100g: { cal: 26, p: 3.0, f: 0.1, c: 5.2 } },
  { keywords: [/carrot|人参|にんじん|胡蘿蔔/i], name: "人参", unitType: "weight", per100g: { cal: 35, p: 0.8, f: 0.2, c: 8.5 } },
  { keywords: [/radish|大根|だいこん|白萝卜/i], name: "大根", unitType: "weight", per100g: { cal: 15, p: 0.4, f: 0.1, c: 3.8 } },
  { keywords: [/burdock|ごぼう|ゴボウ|牛蒡/i], name: "ごぼう", unitType: "weight", per100g: { cal: 58, p: 1.8, f: 0.1, c: 15.4 } },
  { keywords: [/lotus|れんこん|レンコン|莲藕/i], name: "れんこん", unitType: "weight", per100g: { cal: 66, p: 1.9, f: 0.1, c: 15.5 } },
  { keywords: [/pumpkin|かぼちゃ|カボチャ|南瓜/i], name: "かぼちゃ", unitType: "weight", per100g: { cal: 78, p: 1.6, f: 0.3, c: 20.6 } },
  { keywords: [/potato|じゃがいも|ジャガイモ|马铃薯/i], name: "じゃがいも", unitType: "count", perPiece: { cal: 76, p: 1.6, f: 0.1, c: 17.3 } },
  { keywords: [/sweet potato|さつまいも|サツマイモ|红薯/i], name: "さつまいも", unitType: "weight", per100g: { cal: 126, p: 1.2, f: 0.2, c: 31.5 } },
  { keywords: [/zucchini|ズッキーニ|西葫芦/i], name: "ズッキーニ", unitType: "count", perPiece: { cal: 28, p: 2.0, f: 0.2, c: 5.6 } },
  { keywords: [/okra|オクラ|秋葵/i], name: "オクラ", unitType: "weight", per100g: { cal: 26, p: 2.1, f: 0.2, c: 6.6 } },

  // --- 菌類 (Mushrooms) ---
  { keywords: [/eringi|エリンギ|杏鲍菇/i], name: "エリンギ", unitType: "weight", per100g: { cal: 19, p: 2.8, f: 0.3, c: 4.3 } },
  { keywords: [/shimeji|しめじ|シメジ/i], name: "しめじ", unitType: "weight", per100g: { cal: 18, p: 2.0, f: 0.4, c: 4.8 } },
  { keywords: [/enoki|えのき|エノキ|金针菇/i], name: "えのき", unitType: "weight", per100g: { cal: 22, p: 2.7, f: 0.2, c: 7.6 } },
  { keywords: [/shiitake|しいたけ|シイタケ|香菇/i], name: "しいたけ", unitType: "count", perPiece: { cal: 4, p: 0.5, f: 0.1, c: 1.0 } },
  { keywords: [/maitake|まいたけ|マイタケ|舞茸/i], name: "まいたけ", unitType: "weight", per100g: { cal: 16, p: 2.0, f: 0.5, c: 4.4 } },

  // --- 肉類・加工肉 (Meat: 100gあたり) ---
  { keywords: [/chicken|チキン|鶏|胸肉|むね肉|ささみ|鶏肉/i], name: "鶏むね肉/ささみ", unitType: "weight", per100g: { cal: 108, p: 23.3, f: 1.5, c: 0.0 } },
  { keywords: [/thigh|もも肉|鶏もも/i], name: "鶏もも肉", unitType: "weight", per100g: { cal: 190, p: 16.6, f: 14.2, c: 0.0 } },
  { keywords: [/beef|牛|牛肉|ステーキ/i], name: "牛肉", unitType: "weight", per100g: { cal: 240, p: 18.0, f: 17.5, c: 0.4 } },
  { keywords: [/pork|豚|豚肉|ポーク|ロース/i], name: "豚肉", unitType: "weight", per100g: { cal: 210, p: 19.3, f: 14.7, c: 0.2 } },
  { keywords: [/mince|ひき肉|挽き肉|肉末/i], name: "合い挽き肉", unitType: "weight", per100g: { cal: 235, p: 17.5, f: 17.0, c: 0.2 } },
  { keywords: [/sausage|wiener|ソーセージ|ウインナー|香肠/i], name: "ウインナー", unitType: "count", perPiece: { cal: 65, p: 2.5, f: 6.0, c: 0.6 } },
  { keywords: [/ham|ハム|火腿/i], name: "ロースハム", unitType: "count", perPiece: { cal: 20, p: 1.8, f: 1.2, c: 0.3 } },

  // --- 魚介・海産品 (Seafood: 100gあたり) ---
  { keywords: [/salmon|鮭|サーモン|三文鱼/i], name: "鮭/サーモン", unitType: "weight", per100g: { cal: 170, p: 20.1, f: 9.4, c: 0.1 } },
  { keywords: [/tuna|マグロ|まぐろ|金枪鱼/i], name: "マグロ(赤身)", unitType: "weight", per100g: { cal: 115, p: 26.4, f: 1.4, c: 0.1 } },
  { keywords: [/mackerel|サバ|さば|鯖/i], name: "サバ", unitType: "weight", per100g: { cal: 210, p: 20.6, f: 16.8, c: 0.3 } },
  { keywords: [/yellowtail|ブリ|ぶり|ハマチ|鰤/i], name: "ブリ", unitType: "weight", per100g: { cal: 222, p: 21.4, f: 17.6, c: 0.3 } },
  { keywords: [/cod|タラ|たら|鱈|鳕鱼/i], name: "タラ", unitType: "weight", per100g: { cal: 72, p: 17.6, f: 0.2, c: 0.1 } },
  { keywords: [/horse mackerel|アジ|あじ|鯵/i], name: "アジ", unitType: "weight", per100g: { cal: 115, p: 19.7, f: 4.5, c: 0.1 } },
  { keywords: [/shrimp|prawn|エビ|えび|海老/i], name: "エビ", unitType: "weight", per100g: { cal: 82, p: 18.4, f: 0.6, c: 0.3 } },
  { keywords: [/squid|イカ|いか|乌贼|鱿鱼/i], name: "イカ", unitType: "weight", per100g: { cal: 76, p: 17.9, f: 0.8, c: 0.1 } },
  { keywords: [/octopus|タコ|たこ|章鱼/i], name: "タコ", unitType: "weight", per100g: { cal: 70, p: 16.4, f: 0.7, c: 0.1 } },
  { keywords: [/scallop|ホタテ|ほたて|扇贝/i], name: "ホタテ", unitType: "weight", per100g: { cal: 85, p: 16.9, f: 0.9, c: 2.3 } },
  { keywords: [/clam|あさり|アサリ|しじみ|蛤蜊/i], name: "あさり", unitType: "weight", per100g: { cal: 30, p: 6.0, f: 0.3, c: 0.4 } },
  { keywords: [/sashimi|刺身|お造り/i], name: "刺身盛り合わせ", unitType: "weight", per100g: { cal: 135, p: 22.0, f: 4.5, c: 0.2 } },

  // --- 豆製品・卵・乳製品・主食 ---
  { keywords: [/natto|納豆|纳豆/i], name: "納豆(1パック)", unitType: "count", perPiece: { cal: 100, p: 8.3, f: 5.0, c: 6.0 } },
  { keywords: [/tofu|豆腐|とうふ/i], name: "豆腐(木綿/絹)", unitType: "weight", per100g: { cal: 72, p: 6.6, f: 4.2, c: 1.6 } },
  { keywords: [/edamame|枝豆|毛豆/i], name: "枝豆", unitType: "weight", per100g: { cal: 135, p: 11.7, f: 6.2, c: 8.8 } },
  { keywords: [/egg|tamago|卵|たまご|玉子/i], name: "卵", unitType: "count", perPiece: { cal: 76, p: 6.2, f: 5.2, c: 0.2 } },
  { keywords: [/milk|牛乳|ミルク|牛奶/i], name: "牛乳(200ml)", unitType: "count", perPiece: { cal: 134, p: 6.6, f: 7.6, c: 9.6 } },
  { keywords: [/yogurt|ヨーグルト|酸奶/i], name: "無糖ヨーグルト", unitType: "weight", per100g: { cal: 56, p: 3.6, f: 3.0, c: 4.9 } },
  { keywords: [/rice|ご飯|ライス|米|白米/i], name: "白ご飯", unitType: "weight", per100g: { cal: 156, p: 2.5, f: 0.3, c: 35.6 } },
  { keywords: [/bread|toast|パン|トースト/i], name: "食パン(6枚切1枚)", unitType: "count", perPiece: { cal: 158, p: 5.6, f: 2.6, c: 28.0 } },
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("image")) as File | null;
    const textInput = (formData.get("text") as string) || "";
    const targetQuery = textInput || (file ? file.name : "");

    if (!targetQuery) {
      return NextResponse.json({ error: "解析対象のデータがありません" }, { status: 400 });
    }

    let matchedFood: FoodItem | null = null;
    for (const item of SUPERMARKET_COMPREHENSIVE_DB) {
      if (item.keywords.some((r) => r.test(targetQuery))) {
        matchedFood = item;
        break;
      }
    }

    // 該当なしの場合は誤ったデフォルト値を絶対に出さずスキップ
    if (!matchedFood) {
      return NextResponse.json({
        success: true,
        matched: false,
        message: "該当する生鮮食品が見つかりませんでした。正確な数値を手入力してください。",
      });
    }

    let calculated = { name: matchedFood.name, calories: 0, protein: 0, fat: 0, carbs: 0 };

    if (matchedFood.unitType === "weight") {
      const weightMatch = targetQuery.match(/(\d+(?:\.\d+)?)\s*(g|グラム)?/i);
      const grams = weightMatch ? parseFloat(weightMatch[1]) : 100;
      const ratio = grams / 100;

      calculated.name = `${matchedFood.name} (${grams}g)`;
      calculated.calories = Math.round(matchedFood.per100g.cal * ratio);
      calculated.protein = parseFloat((matchedFood.per100g.p * ratio).toFixed(1));
      calculated.fat = parseFloat((matchedFood.per100g.f * ratio).toFixed(1));
      calculated.carbs = parseFloat((matchedFood.per100g.c * ratio).toFixed(1));
    } else {
      const countMatch = targetQuery.match(/(\d+(?:\.\d+)?)\s*(個|つ|本|粒|枚|パック|杯)?/i);
      const count = countMatch ? parseFloat(countMatch[1]) : 1;

      calculated.name = `${matchedFood.name} (${count}個/単位)`;
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
        note: "日本スーパー生鮮データベースより自動計算",
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: `解析失敗: ${err.message}` }, { status: 500 });
  }
}
