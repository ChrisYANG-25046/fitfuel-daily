"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Meal } from "@/types/meal";
import {
  Utensils,
  Flame,
  Plus,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Database,
  Sparkles,
  Info,
  Target,
  Activity,
  Edit2,
  Check,
  Wand2,
} from "lucide-react";

// =================================================================
// 食品栄養素データベース（自動予測・推定用）
// =================================================================
interface FoodNutritionRule {
  keywords: string[];
  label: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const FOOD_DATABASE: FoodNutritionRule[] = [
  // フルーツ
  {
    keywords: ["りんご", "リンゴ", "林檎", "苹果", "apple"],
    label: "りんご (1個 約300g)",
    calories: 95,
    protein: 0.3,
    fat: 0.2,
    carbs: 25.0,
  },
  {
    keywords: ["バナナ", "香蕉", "banana"],
    label: "バナナ (1本 約100g)",
    calories: 86,
    protein: 1.1,
    fat: 0.2,
    carbs: 22.5,
  },
  {
    keywords: ["みかん", "ミカン", "蜜柑", "橘子", "orange"],
    label: "みかん (1個)",
    calories: 45,
    protein: 0.7,
    fat: 0.1,
    carbs: 11.0,
  },
  {
    keywords: ["アボカド", "牛油果", "鳄梨", "avocado"],
    label: "アボカド (1/2個)",
    calories: 140,
    protein: 1.8,
    fat: 13.5,
    carbs: 5.5,
  },
  {
    keywords: ["ブルーベリー", "蓝莓", "blueberry"],
    label: "ブルーベリー (100g)",
    calories: 49,
    protein: 0.6,
    fat: 0.1,
    carbs: 13.0,
  },

  // 主食（炭水化物）
  {
    keywords: ["白ご飯", "ご飯", "ごはん", "ライス", "白米", "米饭", "米飯", "rice", "white rice"],
    label: "白ご飯 (1膳 150g)",
    calories: 240,
    protein: 3.8,
    fat: 0.5,
    carbs: 53.4,
  },
  {
    keywords: ["玄米ご飯", "玄米", "糙米", "brown rice"],
    label: "玄米ご飯 (1膳 150g)",
    calories: 228,
    protein: 4.2,
    fat: 1.5,
    carbs: 51.0,
  },
  {
    keywords: ["オートミール", "燕麦", "oatmeal", "oats"],
    label: "オートミール (1食 40g)",
    calories: 152,
    protein: 5.5,
    fat: 2.5,
    carbs: 27.0,
  },
  {
    keywords: ["食パン", "トースト", "パン", "吐司", "面包", "toast", "bread"],
    label: "食パン (6枚切り 1枚)",
    calories: 158,
    protein: 5.6,
    fat: 2.6,
    carbs: 28.0,
  },
  {
    keywords: ["パスタ", "スパゲッティ", "意面", "pasta", "spaghetti"],
    label: "パスタ (乾麺100g調理後)",
    calories: 360,
    protein: 13.0,
    fat: 2.0,
    carbs: 71.0,
  },
  {
    keywords: ["うどん", "饂飩", "乌冬面", "udon"],
    label: "うどん (1玉 200g)",
    calories: 242,
    protein: 5.2,
    fat: 0.8,
    carbs: 53.0,
  },
  {
    keywords: ["そば", "蕎麦", "荞麦面", "soba"],
    label: "そば (茹で 1人前)",
    calories: 270,
    protein: 12.0,
    fat: 1.8,
    carbs: 54.0,
  },
  {
    keywords: ["おにぎり", "おむすび", "饭团", "onigiri"],
    label: "おにぎり (1個)",
    calories: 180,
    protein: 3.5,
    fat: 1.0,
    carbs: 38.0,
  },
  {
    keywords: ["さつまいも", "サツマイモ", "焼き芋", "红薯", "sweet potato"],
    label: "さつまいも (1本 150g)",
    calories: 190,
    protein: 1.8,
    fat: 0.3,
    carbs: 45.0,
  },

  // 肉・魚（高タンパク質）
  {
    keywords: ["サラダチキン", "鸡胸肉沙拉", "salad chicken"],
    label: "サラダチキン (1パック 110g)",
    calories: 115,
    protein: 25.0,
    fat: 1.5,
    carbs: 0.0,
  },
  {
    keywords: ["鶏胸肉", "鶏むね肉", "鳥胸肉", "鸡胸肉", "chicken breast"],
    label: "鶏胸肉・皮なし (100g)",
    calories: 108,
    protein: 22.3,
    fat: 1.5,
    carbs: 0.0,
  },
  {
    keywords: ["ささみ", "ササミ", "鸡里脊", "chicken tender"],
    label: "鶏ささみ (100g)",
    calories: 105,
    protein: 23.0,
    fat: 0.8,
    carbs: 0.0,
  },
  {
    keywords: ["鶏もも肉", "鶏モモ肉", "鸡腿肉", "chicken thigh"],
    label: "鶏もも肉 (皮なし 100g)",
    calories: 116,
    protein: 19.0,
    fat: 4.0,
    carbs: 0.0,
  },
  {
    keywords: ["牛肉", "ビーフ", "牛赤身肉", "牛排", "ステーキ", "beef", "steak"],
    label: "牛赤身肉ステーキ (100g)",
    calories: 180,
    protein: 21.5,
    fat: 9.8,
    carbs: 0.4,
  },
  {
    keywords: ["豚ヒレ肉", "豚ヒレ", "猪里脊", "pork tenderloin"],
    label: "豚ヒレ肉 (100g)",
    calories: 115,
    protein: 22.8,
    fat: 1.9,
    carbs: 0.2,
  },
  {
    keywords: ["豚肉", "ポーク", "豚ロース", "猪肉", "pork"],
    label: "豚肉・ロース (100g)",
    calories: 250,
    protein: 19.3,
    fat: 19.2,
    carbs: 0.2,
  },
  {
    keywords: ["鮭", "サケ", "サーモン", "三文鱼", "salmon"],
    label: "鮭 (1切れ 80g)",
    calories: 150,
    protein: 18.0,
    fat: 7.5,
    carbs: 0.1,
  },
  {
    keywords: ["サバ", "鯖", "さばの塩焼き", "鲭鱼", "mackerel"],
    label: "サバ (1切れ 80g)",
    calories: 200,
    protein: 16.5,
    fat: 14.0,
    carbs: 0.2,
  },
  {
    keywords: ["マグロ", "鮪", "金枪鱼", "tuna"],
    label: "マグロ赤身 (100g)",
    calories: 125,
    protein: 26.4,
    fat: 1.4,
    carbs: 0.1,
  },
  {
    keywords: ["エビ", "海老", "えび", "虾", "shrimp"],
    label: "エビ (100g)",
    calories: 82,
    protein: 18.4,
    fat: 0.3,
    carbs: 0.3,
  },

  // 卵・大豆・乳製品
  {
    keywords: ["ゆで卵", "ゆでたまご", "煮卵", "水煮蛋", "boiled egg"],
    label: "ゆで卵 (1個 50g)",
    calories: 78,
    protein: 6.5,
    fat: 5.2,
    carbs: 0.2,
  },
  {
    keywords: ["目玉焼き", "煎蛋", "fried egg"],
    label: "目玉焼き (1個)",
    calories: 95,
    protein: 6.5,
    fat: 7.5,
    carbs: 0.3,
  },
  {
    keywords: ["卵", "たまご", "生卵", "鸡蛋", "egg"],
    label: "全卵 (1個 50g)",
    calories: 76,
    protein: 6.2,
    fat: 5.2,
    carbs: 0.2,
  },
  {
    keywords: ["プロテイン", "ホエイプロテイン", "蛋白粉", "protein powder"],
    label: "ホエイプロテイン (1杯 30g)",
    calories: 118,
    protein: 24.0,
    fat: 1.5,
    carbs: 2.5,
  },
  {
    keywords: ["プロテインバー", "蛋白棒", "protein bar"],
    label: "プロテインバー (1本)",
    calories: 195,
    protein: 15.0,
    fat: 8.5,
    carbs: 15.0,
  },
  {
    keywords: ["納豆", "なっとう", "纳豆", "natto"],
    label: "納豆 (1パック 45g)",
    calories: 86,
    protein: 7.4,
    fat: 4.5,
    carbs: 5.4,
  },
  {
    keywords: ["木綿豆腐", "絹ごし豆腐", "豆腐", "tofu"],
    label: "豆腐 (1/2丁 150g)",
    calories: 110,
    protein: 9.8,
    fat: 6.3,
    carbs: 2.5,
  },
  {
    keywords: ["ギリシャヨーグルト", "希腊酸奶", "greek yogurt"],
    label: "ギリシャヨーグルト (1個 100g)",
    calories: 67,
    protein: 10.0,
    fat: 0.2,
    carbs: 5.0,
  },
  {
    keywords: ["ヨーグルト", "酸奶", "yogurt"],
    label: "プレーンヨーグルト (100g)",
    calories: 62,
    protein: 3.6,
    fat: 3.0,
    carbs: 4.9,
  },
  {
    keywords: ["牛乳", "ミルク", "牛奶", "milk"],
    label: "牛乳 (200ml)",
    calories: 134,
    protein: 6.6,
    fat: 7.6,
    carbs: 9.6,
  },
  {
    keywords: ["豆乳", "ソイミルク", "豆奶", "soy milk"],
    label: "無調整豆乳 (200ml)",
    calories: 95,
    protein: 7.2,
    fat: 4.5,
    carbs: 5.8,
  },
  {
    keywords: ["チーズ", "スライスチーズ", "芝士", "cheese"],
    label: "スライスチーズ (1枚 18g)",
    calories: 56,
    protein: 4.0,
    fat: 4.6,
    carbs: 0.2,
  },

  // 定番料理・外食
  {
    keywords: ["サラダ", "野菜サラダ", "沙拉", "salad"],
    label: "グリーンサラダ (ノンオイル)",
    calories: 45,
    protein: 1.5,
    fat: 0.5,
    carbs: 7.5,
  },
  {
    keywords: ["味噌汁", "みそ汁", "みそしる", "味噌汤", "miso soup"],
    label: "味噌汁 (1杯)",
    calories: 42,
    protein: 2.8,
    fat: 1.2,
    carbs: 4.8,
  },
  {
    keywords: ["カレーライス", "カレー", "咖喱饭", "curry"],
    label: "カレーライス (1皿)",
    calories: 750,
    protein: 16.0,
    fat: 24.0,
    carbs: 112.0,
  },
  {
    keywords: ["ラーメン", "拉面", "ramen"],
    label: "醤油ラーメン (1杯)",
    calories: 520,
    protein: 21.0,
    fat: 18.0,
    carbs: 68.0,
  },
  {
    keywords: ["牛丼", "牛肉饭", "gyudon"],
    label: "牛丼 (並盛 1杯)",
    calories: 720,
    protein: 20.0,
    fat: 25.0,
    carbs: 102.0,
  },
  {
    keywords: ["チャーハン", "炒飯", "炒饭", "fried rice"],
    label: "チャーハン (1皿)",
    calories: 620,
    protein: 15.0,
    fat: 22.0,
    carbs: 88.0,
  },
  {
    keywords: ["全粒粉サンド", "サンドイッチ", "サンド", "三明治", "sandwich"],
    label: "サンドイッチ (1個)",
    calories: 320,
    protein: 14.0,
    fat: 8.0,
    carbs: 45.0,
  },
  {
    keywords: ["ハンバーガー", "汉堡", "burger"],
    label: "ハンバーガー (1個)",
    calories: 420,
    protein: 18.0,
    fat: 20.0,
    carbs: 41.0,
  },
  {
    keywords: ["ピザ", "披萨", "pizza"],
    label: "ピザ (1切れ)",
    calories: 260,
    protein: 11.0,
    fat: 10.0,
    carbs: 30.0,
  },
  {
    keywords: ["餃子", "ギョーザ", "ギョウザ", "饺子", "gyoza"],
    label: "焼き餃子 (5個)",
    calories: 210,
    protein: 7.5,
    fat: 11.0,
    carbs: 19.0,
  },
  {
    keywords: ["寿司", "にぎり寿司", "寿司", "sushi"],
    label: "握り寿司 (8貫)",
    calories: 460,
    protein: 20.0,
    fat: 4.5,
    carbs: 82.0,
  },

  // 飲み物
  {
    keywords: ["ブラックコーヒー", "コーヒー", "珈琲", "黑咖啡", "咖啡", "black coffee", "coffee"],
    label: "ブラックコーヒー (無糖)",
    calories: 8,
    protein: 0.4,
    fat: 0.0,
    carbs: 1.4,
  },
  {
    keywords: ["カフェラテ", "ラテ", "拿铁", "latte"],
    label: "カフェラテ (無糖 200ml)",
    calories: 105,
    protein: 5.2,
    fat: 6.0,
    carbs: 7.5,
  },
  {
    keywords: ["緑茶", "お茶", "水", "绿茶", "green tea", "water"],
    label: "お茶・水 (0 kcal)",
    calories: 0,
    protein: 0.0,
    fat: 0.0,
    carbs: 0.0,
  },
];

// 食品名からカロリー・PFCを推定する関数
function estimateNutrition(input: string): {
  label: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  isExactOrKnown: boolean;
} {
  const query = input.trim().toLowerCase();
  if (!query) {
    return {
      label: "未入力",
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      isExactOrKnown: false,
    };
  }

  // 1. 完全一致チェック
  for (const item of FOOD_DATABASE) {
    if (item.keywords.some((k) => k.toLowerCase() === query)) {
      return {
        label: item.label,
        calories: item.calories,
        protein: item.protein,
        fat: item.fat,
        carbs: item.carbs,
        isExactOrKnown: true,
      };
    }
  }

  // 2. 部分一致チェック（より長いキーワードの一致を優先）
  let bestMatch: { item: FoodNutritionRule; matchedLen: number } | null = null;
  for (const item of FOOD_DATABASE) {
    for (const kw of item.keywords) {
      const lowerKw = kw.toLowerCase();
      if (query.includes(lowerKw) || lowerKw.includes(query)) {
        const len = lowerKw.length;
        if (!bestMatch || len > bestMatch.matchedLen) {
          bestMatch = { item, matchedLen: len };
        }
      }
    }
  }

  if (bestMatch) {
    return {
      label: bestMatch.item.label,
      calories: bestMatch.item.calories,
      protein: bestMatch.item.protein,
      fat: bestMatch.item.fat,
      carbs: bestMatch.item.carbs,
      isExactOrKnown: true,
    };
  }

  // 3. 辞書にない場合のヒューリスティック推定
  if (/肉|チキン|牛|豚|ささみ|魚|エビ|プロテイン/.test(query)) {
    return {
      label: "一般的な肉・魚・高タンパク料理",
      calories: 200,
      protein: 20.0,
      fat: 10.0,
      carbs: 2.0,
      isExactOrKnown: false,
    };
  }

  if (/飯|ごはん|米|麺|パン|パスタ|うどん|丼/.test(query)) {
    return {
      label: "一般的な主食・炭水化物料理",
      calories: 250,
      protein: 6.0,
      fat: 3.0,
      carbs: 50.0,
      isExactOrKnown: false,
    };
  }

  if (/野菜|サラダ|スープ|味噌汁/.test(query)) {
    return {
      label: "一般的な野菜・汁物料理",
      calories: 60,
      protein: 2.0,
      fat: 1.0,
      carbs: 10.0,
      isExactOrKnown: false,
    };
  }

  if (/茶|水|コーヒー/.test(query)) {
    return {
      label: "一般的な無糖飲料",
      calories: 5,
      protein: 0.0,
      fat: 0.0,
      carbs: 1.0,
      isExactOrKnown: false,
    };
  }

  // 4. デフォルトの標準概算値 (150 kcal)
  return {
    label: "標準的な食品",
    calories: 150,
    protein: 8.0,
    fat: 5.0,
    carbs: 18.0,
    isExactOrKnown: false,
  };
}

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");

  // 自動予測に関する通知メモ
  const [estimateNote, setEstimateNote] = useState<string | null>(null);

  // 1日の目標カロリー（デフォルト: 2000 kcal）
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState("2000");

  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Supabase から食事記録一覧を手動更新
  const fetchMeals = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setMeals(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("meals データの取得に失敗しました:", error);
      setStatusMessage({
        type: "error",
        text: `データの取得に失敗しました: ${error.message || "Supabase のテーブルまたは RLS ポリシーを確認してください"}`,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回マウント時にデータを取得
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let ignore = false;

    supabase
      .from("meals")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          console.error("meals データの取得に失敗しました:", error);
          setStatusMessage({
            type: "error",
            text: `データの取得に失敗しました: ${error.message || "Supabase のテーブルまたは RLS ポリシーを確認してください"}`,
          });
        } else if (data) {
          setMeals(data);
        }
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // 自動予測ボタン押下時の処理
  const handleAutoEstimate = () => {
    const trimmed = foodName.trim();
    if (!trimmed) {
      setStatusMessage({
        type: "error",
        text: "先に「食品名 / 料理名」を入力してから自動予測ボタンを押してください",
      });
      return;
    }

    const result = estimateNutrition(trimmed);

    // 入力欄に数値を自動反映（ユーザーは後から自由に編集可能）
    setCalories(result.calories.toString());
    setProtein(result.protein.toString());
    setFat(result.fat.toString());
    setCarbs(result.carbs.toString());

    if (result.isExactOrKnown) {
      setEstimateNote(
        `「${result.label}」の栄養データを自動入力しました。※概算値です。必要に応じて微調整してください。`
      );
    } else {
      setEstimateNote(
        `「${trimmed}」の標準的な概算値（${result.calories} kcal）を入力しました。※概算値です。必要に応じて微調整してください。`
      );
    }
  };

  // 食事記録の追加フォーム送信
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!isSupabaseConfigured) {
      setStatusMessage({
        type: "error",
        text: ".env.local に有効な NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください",
      });
      return;
    }

    const trimmedFood = foodName.trim();
    const calorieNum = parseInt(calories, 10);

    if (!trimmedFood) {
      setStatusMessage({ type: "error", text: "食品名を入力してください" });
      return;
    }

    if (isNaN(calorieNum) || calorieNum < 0) {
      setStatusMessage({
        type: "error",
        text: "有効なカロリー数値を入力してください（0以上の半角数字）",
      });
      return;
    }

    // PFC（任意項目：空文字の場合は 0）
    const proteinNum = protein.trim() === "" ? 0 : parseFloat(protein);
    const fatNum = fat.trim() === "" ? 0 : parseFloat(fat);
    const carbsNum = carbs.trim() === "" ? 0 : parseFloat(carbs);

    if (
      (protein.trim() !== "" && (isNaN(proteinNum) || proteinNum < 0)) ||
      (fat.trim() !== "" && (isNaN(fatNum) || fatNum < 0)) ||
      (carbs.trim() !== "" && (isNaN(carbsNum) || carbsNum < 0))
    ) {
      setStatusMessage({
        type: "error",
        text: "PFC（タンパク質・脂質・炭水化物）には0以上の数値を入力してください",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("meals")
        .insert([
          {
            food_name: trimmedFood,
            calories: calorieNum,
            protein: isNaN(proteinNum) ? 0 : proteinNum,
            fat: isNaN(fatNum) ? 0 : fatNum,
            carbs: isNaN(carbsNum) ? 0 : carbsNum,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      // 送信成功時にフォームを初期化しリストを更新
      setFoodName("");
      setCalories("");
      setProtein("");
      setFat("");
      setCarbs("");
      setEstimateNote(null);

      setStatusMessage({
        type: "success",
        text: `「${trimmedFood}」（${calorieNum} kcal, P:${proteinNum}g F:${fatNum}g C:${carbsNum}g）を記録しました！`,
      });

      // リストに即座に反映
      if (data && data.length > 0) {
        setMeals((prev) => [data[0], ...prev]);
      } else {
        await fetchMeals();
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("meals への書き込みに失敗しました:", error);
      setStatusMessage({
        type: "error",
        text: `記録に失敗しました: ${error.message || "meals テーブルの存在または権限ポリシーを確認してください"}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // （補助機能）食事記録の削除
  const handleDelete = async (id: number | string) => {
    if (!isSupabaseConfigured) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from("meals").delete().eq("id", id);
      if (error) throw error;

      setMeals((prev) => prev.filter((item) => item.id !== id));
      setStatusMessage({ type: "success", text: "記録を削除しました" });
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({
        type: "error",
        text: `削除に失敗しました: ${error.message}`,
      });
    } finally {
      setDeletingId(null);
    }
  };

  // プリセット食品のクイック入力（PFCも含めて入力）
  const handleQuickAdd = (
    presetFood: string,
    presetCalories: number,
    presetP: number,
    presetF: number,
    presetC: number
  ) => {
    setFoodName(presetFood);
    setCalories(presetCalories.toString());
    setProtein(presetP.toString());
    setFat(presetF.toString());
    setCarbs(presetC.toString());
    setEstimateNote(`「${presetFood}」のプリセット値を入力しました。※必要に応じて微調整してください。`);
  };

  // 目標カロリー保存
  const handleSaveTarget = () => {
    const val = parseInt(customTargetInput, 10);
    if (!isNaN(val) && val > 0) {
      setTargetCalories(val);
      setIsEditingTarget(false);
    }
  };

  // 合計値の算出
  const totalCalories = meals.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = meals.reduce((sum, item) => sum + Number(item.protein || 0), 0);
  const totalFat = meals.reduce((sum, item) => sum + Number(item.fat || 0), 0);
  const totalCarbs = meals.reduce((sum, item) => sum + Number(item.carbs || 0), 0);

  // 進捗率（%）
  const progressRatio = targetCalories > 0 ? (totalCalories / targetCalories) * 100 : 0;
  const progressPercentage = Math.round(progressRatio);
  const isOverTarget = totalCalories > targetCalories;
  const remainingCalories = Math.max(0, targetCalories - totalCalories);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* ヘッダーエリア */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-2 shadow-sm">
            <Utensils className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            減量・食事記録アプリ
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Next.js (App Router) + TypeScript + Tailwind CSS + Supabase
          </p>
        </header>

        {/* Supabase 接続状態カード */}
        {!isSupabaseConfigured ? (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <h3 className="font-semibold text-base text-amber-950">
                  Supabase の環境設定が必要です
                </h3>
                <p>
                  プロジェクトルートの{" "}
                  <code className="bg-amber-100 px-2 py-0.5 rounded font-mono text-xs text-amber-800">
                    .env.local
                  </code>{" "}
                  に Supabase URL と Anon Key を設定してください：
                </p>
                <div className="bg-amber-950 text-amber-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
                  <br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
                </div>
                <p className="text-xs text-amber-700">
                  💡 Supabase の SQL Editor で{" "}
                  <code className="font-mono bg-amber-100 px-1 rounded">
                    supabase/schema.sql
                  </code>{" "}
                  のテーブル作成クエリを実行してください。
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Supabase Client 接続完了（データベース同期中）</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              接続中
            </span>
          </div>
        )}

        {/* 状態通知バナー */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs underline hover:opacity-80 ml-4 shrink-0 cursor-pointer"
            >
              閉じる
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 目標進捗バー & PFC合計サマリーカードエリア */}
        {/* ========================================================= */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          {/* 目標カロリー進捗ヘッダー */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    1日のカロリー目標進捗
                  </h2>
                  <p className="text-xs text-slate-500">
                    目標: {targetCalories.toLocaleString()} kcal に対する進捗度
                  </p>
                </div>
              </div>

              {/* 目標値変更エリア */}
              <div className="flex items-center gap-2 text-xs">
                {isEditingTarget ? (
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                    <input
                      type="number"
                      min="500"
                      step="50"
                      value={customTargetInput}
                      onChange={(e) => setCustomTargetInput(e.target.value)}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:outline-none"
                    />
                    <span className="text-slate-500">kcal</span>
                    <button
                      type="button"
                      onClick={handleSaveTarget}
                      className="p-1 text-emerald-600 hover:bg-emerald-100 rounded cursor-pointer"
                      title="保存"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTargetInput(targetCalories.toString());
                      setIsEditingTarget(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="目標カロリーを変更"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>目標を変更</span>
                  </button>
                )}
              </div>
            </div>

            {/* 進捗数値表示 */}
            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {totalCalories.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  / {targetCalories.toLocaleString()} kcal
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full ${
                    isOverTarget
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {progressPercentage}%
                </span>
                <span className="text-xs text-slate-500">
                  {isOverTarget
                    ? `目標超過 +${(totalCalories - targetCalories).toLocaleString()} kcal`
                    : `残り ${remainingCalories.toLocaleString()} kcal`}
                </span>
              </div>
            </div>

            {/* 進捗バー */}
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverTarget
                    ? "bg-gradient-to-r from-amber-500 to-rose-500"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500"
                }`}
                style={{ width: `${Math.min(100, progressRatio)}%` }}
              />
            </div>
          </div>

          {/* 今日の合計 PFC サマリーカード */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              今日の PFC 摂取サマリー
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* たんぱく質 (P) */}
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-700 mb-1">
                  <span>たんぱく質 (P)</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-[10px]">
                    4 kcal/g
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-blue-950">
                    {totalProtein.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-blue-700">g</span>
                </div>
                <span className="text-[11px] text-blue-600 mt-1">
                  約 {Math.round(totalProtein * 4)} kcal 相当
                </span>
              </div>

              {/* 脂質 (F) */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-700 mb-1">
                  <span>脂質 (F)</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-[10px]">
                    9 kcal/g
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-amber-950">
                    {totalFat.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-amber-700">g</span>
                </div>
                <span className="text-[11px] text-amber-600 mt-1">
                  約 {Math.round(totalFat * 9)} kcal 相当
                </span>
              </div>

              {/* 炭水化物 (C) */}
              <div className="bg-orange-50/80 border border-orange-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-orange-700 mb-1">
                  <span>炭水化物 (C)</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[10px]">
                    4 kcal/g
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-orange-950">
                    {totalCarbs.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-orange-700">g</span>
                </div>
                <span className="text-[11px] text-orange-600 mt-1">
                  約 {Math.round(totalCarbs * 4)} kcal 相当
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 食事入力フォームカード */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                食事・カロリー・PFCの記録
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              自動予測対応
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 食品名入力 & 自動予測ボタン */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="food_name"
                  className="block text-sm font-semibold text-slate-700"
                >
                  食品名 / 料理名 <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">
                  入力後に「自動予測」を押すと自動入力されます
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="food_name"
                  type="text"
                  required
                  placeholder="例：りんご、白ご飯、鶏胸肉、バナナ、サラダチキン"
                  value={foodName}
                  onChange={(e) => {
                    setFoodName(e.target.value);
                    if (estimateNote) setEstimateNote(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && foodName.trim() && !calories) {
                      e.preventDefault();
                      handleAutoEstimate();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                />

                <button
                  type="button"
                  onClick={handleAutoEstimate}
                  disabled={!foodName.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  title="食品名からカロリーとPFCを推計して自動入力"
                >
                  <Wand2 className="w-4 h-4 text-indigo-200" />
                  <span>カロリー・PFCを自動予測</span>
                </button>
              </div>
            </div>

            {/* 自動予測後の注意書きメッセージ */}
            {estimateNote && (
              <div className="flex items-center justify-between gap-2 p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-indigo-900 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-medium">{estimateNote}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEstimateNote(null)}
                  className="text-[11px] text-indigo-500 hover:text-indigo-800 underline shrink-0 cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            )}

            {/* 推定カロリー */}
            <div className="space-y-1.5">
              <label
                htmlFor="calories"
                className="block text-sm font-semibold text-slate-700"
              >
                推定カロリー (Calories / kcal){" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="calories"
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="例：250（自動予測または直接入力）"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full pl-4 pr-14 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  kcal
                </span>
              </div>
            </div>

            {/* PFC（任意項目：自動予測または手動入力・編集可能） */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>PFCバランス</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    （任意入力・数値は自由に変更可能 / 単位: g）
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">
                  減量・筋肉維持の目安に
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* たんぱく質 */}
                <div className="space-y-1">
                  <label
                    htmlFor="protein"
                    className="block text-xs font-semibold text-slate-600"
                  >
                    たんぱく質 (g)
                  </label>
                  <input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="例：25"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* 脂質 */}
                <div className="space-y-1">
                  <label
                    htmlFor="fat"
                    className="block text-xs font-semibold text-slate-600"
                  >
                    脂質 (g)
                  </label>
                  <input
                    id="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="例：5"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                {/* 炭水化物 */}
                <div className="space-y-1">
                  <label
                    htmlFor="carbs"
                    className="block text-xs font-semibold text-slate-600"
                  >
                    炭水化物 (g)
                  </label>
                  <input
                    id="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="例：40"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* クイック入力プリセット */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                クイック入力：
              </span>
              <button
                type="button"
                onClick={() => handleQuickAdd("🥗 サラダチキン", 115, 25, 1.5, 0)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                サラダチキン (115 kcal / P:25)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd("🥚 ゆで卵", 78, 6.5, 5.2, 0.2)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                ゆで卵 (78 kcal / P:6.5)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd("🍚 玄米ご飯 (150g)", 228, 4.2, 1.5, 51)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                玄米ご飯 (228 kcal / C:51)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd("🥪 全粒粉サンド", 320, 14, 8, 45)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                全粒粉サンド (320 kcal)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd("🍎 りんご (1個)", 95, 0.3, 0.2, 25)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                りんご (95 kcal)
              </button>
            </div>

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Supabaseに記録中...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>食事を記録する</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 食事履歴リストカード */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>保存済みの食事一覧</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {meals.length} 件
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Supabase の <code>meals</code> テーブルから取得・ページ更新後もデータは保持されます
              </p>
            </div>

            <div className="flex items-center gap-3">
              {meals.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/60 rounded-xl text-amber-800 text-xs font-semibold">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>合計摂取: {totalCalories.toLocaleString()} kcal</span>
                </div>
              )}

              <button
                type="button"
                onClick={fetchMeals}
                disabled={loading}
                title="再読み込み"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* リスト表示部分 */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-7 h-7 animate-spin text-emerald-500" />
              <p className="text-sm">Supabase から食事データを取得中...</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Utensils className="w-6 h-6" />
              </div>
              <p className="text-slate-600 font-medium text-sm">
                まだ食事の記録がありません
              </p>
              <p className="text-slate-400 text-xs">
                上のフォームから食べたもの・カロリー・PFCを入力して記録しましょう
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors group"
                >
                  {/* 食事名・PFC値・時間 */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                      {meal.food_name || (meal as unknown as { name?: string }).name}
                    </div>

                    {/* PFC 表示 (例: P: 25g / F: 5g / C: 40g) */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        P: {meal.protein ?? 0}g / F: {meal.fat ?? 0}g / C: {meal.carbs ?? 0}g
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {meal.created_at
                          ? new Date(meal.created_at).toLocaleString("ja-JP", {
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "たった今"}
                      </span>
                    </div>
                  </div>

                  {/* カロリーバッジと削除ボタン */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs sm:text-sm rounded-lg border border-amber-200/50">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{meal.calories}</span>
                      <span className="text-[10px] font-normal text-amber-600">
                        kcal
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(meal.id)}
                      disabled={deletingId === meal.id}
                      title="削除"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <footer className="text-center text-xs text-slate-400 pt-4 pb-8 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Supabase Client: <code>src/lib/supabaseClient.ts</code>
          </p>
          <p>テーブルスキーマ定義: <code>supabase/schema.sql</code></p>
        </footer>
      </div>
    </main>
  );
}
