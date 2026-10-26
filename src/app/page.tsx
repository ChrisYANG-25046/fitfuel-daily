"use client";

import { useEffect, useState, useCallback, useRef, useMemo, FormEvent } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Meal, Preset, PresetInsertInput, MealInsertInput } from "@/types/meal";
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
  Bookmark,
  BookmarkPlus,
  Zap,
  Settings2,
  Camera,
  X,
  BarChart3,
  PieChart,
} from "lucide-react";

import WeeklyAnalyticsDashboard from "@/components/WeeklyAnalyticsDashboard";
import { computeWeeklyAnalytics, formatLocalDateKey } from "@/lib/analyticsUtils";


// =================================================================
// 食品栄養素データベース & スマート補完エンジン（ローカル・完全無料）
// =================================================================
import {
  FOOD_DATABASE,
  FoodNutritionRule,
  POPULAR_FOOD_TAGS,
  searchFoodSuggestions,
  estimateNutrition,
} from "@/data/foodDatabase";

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);

  // タブ状態: 'logging' (食事記録) | 'analytics' (7日間データ分析)
  const [activeTab, setActiveTab] = useState<"logging" | "analytics">("logging");

  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");

  // インクリメンタル検索（スマート補完）状態
  const [suggestions, setSuggestions] = useState<FoodNutritionRule[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);

  // 画像アップロード & AI解析状態
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysisInfo, setImageAnalysisInfo] = useState<{
    food_name: string;
    confidence: number;
    note?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 自動予測に関する通知メモ
  const [estimateNote, setEstimateNote] = useState<string | null>(null);

  // 1日の目標カロリー（デフォルト: 2000 kcal、Supabase user_settings と同期）
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [userSettingsId, setUserSettingsId] = useState<number | string>(1);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState("2000");
  const [savingTarget, setSavingTarget] = useState(false);

  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadingPresets, setLoadingPresets] = useState(isSupabaseConfigured);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  // プリセット操作関連の状態
  const [loggingPresetId, setLoggingPresetId] = useState<number | string | null>(null);
  const [savingPreset, setSavingPreset] = useState(false);
  const [deletingPresetId, setDeletingPresetId] = useState<number | string | null>(null);
  const [isPresetManageMode, setIsPresetManageMode] = useState(false);

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

  // Supabase からプリセット一覧を手動更新
  const fetchPresets = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setLoadingPresets(true);
    try {
      const { data, error } = await supabase
        .from("presets")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      setPresets(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("presets データの取得に失敗しました:", error);
    } finally {
      setLoadingPresets(false);
    }
  }, []);

  // 初期ローカルキャッシュからの目標カロリー復元（F5時の画面ちらつき防止）
  useEffect(() => {
    try {
      const cached = localStorage.getItem("fitfuel_target_calories");
      if (cached) {
        const val = parseInt(cached, 10);
        if (!isNaN(val) && val > 0) {
          setTargetCalories(val);
          setCustomTargetInput(val.toString());
        }
      }
    } catch {}
  }, []);

  // 初回マウント時に meals, presets, user_settings をすべて取得
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let ignore = false;

    // 1. 食事履歴の取得
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

    // 2. マイセット (presets) の取得
    supabase
      .from("presets")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          console.error("presets データの取得に失敗しました:", error);
        } else if (data) {
          setPresets(data);
        }
        setLoadingPresets(false);
      });

    // 3. ユーザー設定 (user_settings: 目標カロリー) の取得
    supabase
      .from("user_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          console.error("user_settings データの取得に失敗しました:", error);
        } else if (data && data.length > 0) {
          const settings = data[0];
          setUserSettingsId(settings.id);
          if (settings.target_calories && settings.target_calories > 0) {
            setTargetCalories(settings.target_calories);
            setCustomTargetInput(settings.target_calories.toString());
            try {
              localStorage.setItem("fitfuel_target_calories", settings.target_calories.toString());
            } catch {}
          }
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // オートコンプリート外側クリック検知
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        autocompleteContainerRef.current &&
        !autocompleteContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // 食品名入力時のリアルタイムインクリメンタル検索（スマート補完）
  const handleFoodNameChange = (val: string) => {
    setFoodName(val);
    if (estimateNote) setEstimateNote(null);

    if (val.trim().length >= 1) {
      const matches = searchFoodSuggestions(val, 8);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 候補選択（クリックまたはキーボード決定）
  const handleSelectSuggestion = (item: FoodNutritionRule) => {
    setFoodName(item.name);
    setCalories(item.calories.toString());
    setProtein(item.protein.toString());
    setFat(item.fat.toString());
    setCarbs(item.carbs.toString());
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    setEstimateNote(
      `✨「${item.label}」のカロリー(${item.calories} kcal)・PFC(P:${item.protein}g F:${item.fat}g C:${item.carbs}g)を自動補完しました（編集可能）`
    );
  };

  // 食品名入力欄のキーボードナビゲーション
  const handleFoodNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      }
      if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === "Enter" && foodName.trim() && !calories) {
      e.preventDefault();
      handleAutoEstimate();
    }
  };

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
    setShowSuggestions(false);

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

  // 写真ファイル選択時のAI解析処理
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage({
        type: "error",
        text: "JPEGまたはPNG形式の画像ファイルを選択してください",
      });
      return;
    }

    // プレビューの作成
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setAnalyzingImage(true);
    setStatusMessage(null);
    setEstimateNote(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/analyze-food-image", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "画像解析に失敗しました");
      }

      const { food_name, calories, protein, fat, carbs, confidence, note } =
        json.data;

      // フォーム各入力欄に自動反映（ユーザーは後から自由に編集可能）
      setFoodName(food_name);
      setCalories(calories.toString());
      setProtein(protein.toString());
      setFat(fat.toString());
      setCarbs(carbs.toString());

      setImageAnalysisInfo({
        food_name,
        confidence,
        note,
      });

      setStatusMessage({
        type: "success",
        text: `📸 写真から「${food_name}」（${calories} kcal）をAI解析・自動セットしました！`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("写真解析エラー:", error);
      setStatusMessage({
        type: "error",
        text: `写真の解析に失敗しました: ${error.message}`,
      });
    } finally {
      setAnalyzingImage(false);
    }
  };

  // アップロード写真の解除
  const handleClearImage = () => {
    setImagePreviewUrl(null);
    setImageAnalysisInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      handleClearImage();

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

  // =================================================================
  // 第3週機能: マイセット（presets）操作ロジック
  // =================================================================

  // 1. マイセットをクリックして即座に本日の meals に追加
  const handleAddMealFromPreset = async (preset: Preset) => {
    if (!isSupabaseConfigured) return;

    setLoggingPresetId(preset.id);
    setStatusMessage(null);
    try {
      const { data, error } = await supabase
        .from("meals")
        .insert([
          {
            food_name: preset.food_name,
            calories: preset.calories,
            protein: preset.protein ?? 0,
            fat: preset.fat ?? 0,
            carbs: preset.carbs ?? 0,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setMeals((prev) => [data[0], ...prev]);
      } else {
        await fetchMeals();
      }

      setStatusMessage({
        type: "success",
        text: `⚡ マイセットから「${preset.food_name}」（${preset.calories} kcal）を本日の食事に追加しました！`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({
        type: "error",
        text: `食事の追加に失敗しました: ${error.message}`,
      });
    } finally {
      setLoggingPresetId(null);
    }
  };

  // 2. 現在入力中のフォーム内容を「マイセット（presets）」に保存
  const handleSaveAsPreset = async () => {
    if (!isSupabaseConfigured) {
      setStatusMessage({
        type: "error",
        text: ".env.local に有効な Supabase 設定が必要です",
      });
      return;
    }

    const trimmedFood = foodName.trim();
    const calorieNum = parseInt(calories, 10);

    if (!trimmedFood) {
      setStatusMessage({ type: "error", text: "マイセットに保存する食品名を入力してください" });
      return;
    }

    if (isNaN(calorieNum) || calorieNum < 0) {
      setStatusMessage({
        type: "error",
        text: "マイセットに保存するカロリー数値を入力してください",
      });
      return;
    }

    const proteinNum = protein.trim() === "" ? 0 : parseFloat(protein);
    const fatNum = fat.trim() === "" ? 0 : parseFloat(fat);
    const carbsNum = carbs.trim() === "" ? 0 : parseFloat(carbs);

    setSavingPreset(true);
    setStatusMessage(null);
    try {
      const { data, error } = await supabase
        .from("presets")
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

      if (error) throw error;

      if (data && data.length > 0) {
        setPresets((prev) => [...prev, data[0]]);
      } else {
        await fetchPresets();
      }

      setStatusMessage({
        type: "success",
        text: `⭐「${trimmedFood}」（${calorieNum} kcal）をマイセットに保存しました！`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("presets への保存失敗:", error);
      setStatusMessage({
        type: "error",
        text: `マイセットの保存に失敗しました: ${error.message}`,
      });
    } finally {
      setSavingPreset(false);
    }
  };

  // 3. マイセットの削除
  const handleDeletePreset = async (presetId: number | string, pName: string) => {
    if (!isSupabaseConfigured) return;

    setDeletingPresetId(presetId);
    try {
      const { error } = await supabase.from("presets").delete().eq("id", presetId);
      if (error) throw error;

      setPresets((prev) => prev.filter((p) => p.id !== presetId));
      setStatusMessage({
        type: "success",
        text: `マイセット「${pName}」を削除しました`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({
        type: "error",
        text: `マイセットの削除に失敗しました: ${error.message}`,
      });
    } finally {
      setDeletingPresetId(null);
    }
  };

  // 4. 定番メニューの初期登録（初回利用時など）
  const handleSeedDefaultPresets = async () => {
    if (!isSupabaseConfigured) return;

    const defaults: PresetInsertInput[] = [
      { food_name: "🥗 サラダチキン", calories: 115, protein: 25.0, fat: 1.5, carbs: 0.0 },
      { food_name: "🥚 ゆで卵", calories: 78, protein: 6.5, fat: 5.2, carbs: 0.2 },
      { food_name: "🍚 白ご飯 (150g)", calories: 240, protein: 3.8, fat: 0.5, carbs: 53.4 },
      { food_name: "🥤 ホエイプロテイン", calories: 118, protein: 24.0, fat: 1.5, carbs: 2.5 },
      { food_name: "🥣 オートミール (40g)", calories: 152, protein: 5.5, fat: 2.5, carbs: 27.0 },
    ];

    try {
      const { data, error } = await supabase.from("presets").insert(defaults).select();
      if (error) throw error;
      if (data) setPresets(data);
      setStatusMessage({
        type: "success",
        text: "定番マイセット（5品）を初期登録しました！",
      });
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({
        type: "error",
        text: `初期登録に失敗しました: ${error.message}`,
      });
    }
  };

  // 5. 過去7日分のデモ用食事データの生成（分析ダッシュボード検証用）
  const handleSeedSampleWeeklyData = async () => {
    if (!isSupabaseConfigured) return;

    setLoading(true);
    const now = new Date();

    const sampleDays = [
      // 6日前
      {
        offset: 6,
        items: [
          { food_name: "オートミール (バナナ添え)", calories: 240, protein: 7.0, fat: 3.0, carbs: 50.0 },
          { food_name: "鶏胸肉グリル & 温野菜", calories: 380, protein: 42.0, fat: 8.0, carbs: 12.0 },
          { food_name: "鮭の塩焼き定食（玄米・味噌汁）", calories: 580, protein: 32.0, fat: 12.0, carbs: 75.0 },
          { food_name: "ホエイプロテイン", calories: 118, protein: 24.0, fat: 1.5, carbs: 2.5 },
        ],
      },
      // 5日前
      {
        offset: 5,
        items: [
          { food_name: "ゆで卵 2個 & トースト", calories: 310, protein: 18.0, fat: 13.0, carbs: 28.0 },
          { food_name: "牛丼 (並盛 1杯)", calories: 720, protein: 20.0, fat: 25.0, carbs: 102.0 },
          { food_name: "サラダチキン & グリーンサラダ", calories: 160, protein: 26.5, fat: 2.0, carbs: 7.5 },
          { food_name: "ギリシャヨーグルト", calories: 67, protein: 10.0, fat: 0.2, carbs: 5.0 },
        ],
      },
      // 4日前
      {
        offset: 4,
        items: [
          { food_name: "白ご飯 & 納豆 & 目玉焼き", calories: 420, protein: 18.0, fat: 13.0, carbs: 59.0 },
          { food_name: "豚ヒレ肉の生姜焼き定食", calories: 620, protein: 38.0, fat: 14.0, carbs: 78.0 },
          { food_name: "サバの塩焼き & 豆腐味噌汁", calories: 360, protein: 29.0, fat: 22.0, carbs: 8.0 },
        ],
      },
      // 3日前 (少しカロリーが高かった日)
      {
        offset: 3,
        items: [
          { food_name: "ミックスサンドイッチ & カフェラテ", calories: 425, protein: 19.2, fat: 14.0, carbs: 52.5 },
          { food_name: "カレーライス (並)", calories: 750, protein: 16.0, fat: 24.0, carbs: 112.0 },
          { food_name: "鶏の唐揚げ (4個)", calories: 320, protein: 22.0, fat: 20.0, carbs: 12.0 },
          { food_name: "ホエイプロテイン", calories: 118, protein: 24.0, fat: 1.5, carbs: 2.5 },
        ],
      },
      // 2日前
      {
        offset: 2,
        items: [
          { food_name: "オートミールボウル", calories: 280, protein: 10.5, fat: 4.8, carbs: 48.0 },
          { food_name: "和風ハンバーグ定食", calories: 680, protein: 32.0, fat: 26.0, carbs: 72.0 },
          { food_name: "マグロ赤身刺身 & 味噌汁", calories: 210, protein: 39.0, fat: 2.6, carbs: 5.0 },
          { food_name: "ホエイプロテイン", calories: 118, protein: 24.0, fat: 1.5, carbs: 2.5 },
        ],
      },
      // 1日前 (昨日)
      {
        offset: 1,
        items: [
          { food_name: "食パン & 目玉焼き & カフェラテ", calories: 358, protein: 17.3, fat: 16.1, carbs: 35.8 },
          { food_name: "親子丼", calories: 650, protein: 28.0, fat: 16.0, carbs: 95.0 },
          { food_name: "牛赤身ステーキと温野菜", calories: 380, protein: 36.0, fat: 14.0, carbs: 12.0 },
          { food_name: "ホエイプロテイン", calories: 118, protein: 24.0, fat: 1.5, carbs: 2.5 },
        ],
      },
    ];

    const recordsToInsert: Array<MealInsertInput & { created_at: string }> = [];

    sampleDays.forEach((dayData) => {
      dayData.items.forEach((item, idx) => {
        const d = new Date(now);
        d.setDate(d.getDate() - dayData.offset);
        d.setHours(8 + idx * 4, 15 + idx * 5, 0, 0);
        recordsToInsert.push({
          ...item,
          created_at: d.toISOString(),
        });
      });
    });

    try {
      const { error } = await supabase.from("meals").insert(recordsToInsert);
      if (error) throw error;
      await fetchMeals();
      setStatusMessage({
        type: "success",
        text: `📊 過去7日分のデモ用食事データ（${recordsToInsert.length}件）を投入しました！7日間の推移グラフが更新されました。`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({
        type: "error",
        text: `デモデータの投入に失敗しました: ${error.message}`,
      });
    } finally {
      setLoading(false);
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

  // プリセット食品をフォームにコピー（入力欄への適用）
  const handleApplyPresetToForm = (preset: Preset) => {
    setFoodName(preset.food_name);
    setCalories(preset.calories.toString());
    setProtein((preset.protein ?? 0).toString());
    setFat((preset.fat ?? 0).toString());
    setCarbs((preset.carbs ?? 0).toString());
    setEstimateNote(`マイセット「${preset.food_name}」を入力フォームに反映しました。`);
  };

  // 目標カロリー保存（Supabase user_settings テーブルへの UPDATE / UPSERT 同期）
  const handleSaveTarget = async () => {
    const val = parseInt(customTargetInput, 10);
    if (isNaN(val) || val <= 0) {
      setStatusMessage({
        type: "error",
        text: "目標カロリーには1以上の有効な数値を入力してください",
      });
      return;
    }

    setSavingTarget(true);
    setStatusMessage(null);
    try {
      if (isSupabaseConfigured) {
        // user_settings テーブルを更新
        const { error } = await supabase
          .from("user_settings")
          .update({
            target_calories: val,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userSettingsId);

        if (error) {
          // レコードが存在しなかった場合は upsert で作成
          const { error: upsertErr } = await supabase
            .from("user_settings")
            .upsert({
              id: userSettingsId,
              target_calories: val,
              updated_at: new Date().toISOString(),
            });
          if (upsertErr) throw upsertErr;
        }
      }

      setTargetCalories(val);
      setIsEditingTarget(false);
      try {
        localStorage.setItem("fitfuel_target_calories", val.toString());
      } catch {}

      setStatusMessage({
        type: "success",
        text: `🎯 1日の目標カロリーを ${val.toLocaleString()} kcal に更新・保存しました！（リロード後も保持されます）`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("目標カロリーの保存に失敗:", error);
      setStatusMessage({
        type: "error",
        text: `目標カロリーの保存に失敗しました: ${error.message}`,
      });
    } finally {
      setSavingTarget(false);
    }
  };

  // 7日間の週次分析データ（過去7日間の日別推移・PFCバランス）
  const weeklyAnalytics = useMemo(() => {
    return computeWeeklyAnalytics(meals, targetCalories);
  }, [meals, targetCalories]);

  // 今日の食事を抽出（ローカル日付基準）
  const todayKey = formatLocalDateKey(new Date());
  const todayMeals = meals.filter((item) => {
    if (!item.created_at) return true;
    return formatLocalDateKey(new Date(item.created_at)) === todayKey;
  });

  // 本日の合計値（進捗バーおよびPFCカード用。当日の記録がない場合は過去直近または全体フォールバック）
  const totalCalories = todayMeals.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = todayMeals.reduce((sum, item) => sum + Number(item.protein || 0), 0);
  const totalFat = todayMeals.reduce((sum, item) => sum + Number(item.fat || 0), 0);
  const totalCarbs = todayMeals.reduce((sum, item) => sum + Number(item.carbs || 0), 0);

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
              <span>Supabase Client 接続完了（meals &amp; presets 同期中）</span>
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
        {/* タブナビゲーション（食事記録 / 7日間データ分析） */}
        {/* ========================================================= */}
        <div className="flex items-center justify-center p-1.5 bg-slate-200/80 rounded-2xl max-w-md mx-auto shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("logging")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "logging"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>食事の記録</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-white text-indigo-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>7日間データ分析</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          </button>
        </div>

        {activeTab === "analytics" ? (
          <WeeklyAnalyticsDashboard
            analytics={weeklyAnalytics}
            onRefresh={fetchMeals}
            onSeedSampleData={handleSeedSampleWeeklyData}
            loading={loading}
          />
        ) : (
          <div className="space-y-8">
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
                        1日のカロリー目標進捗 (本日分)
                      </h2>
                      <p className="text-xs text-slate-500">
                        目標: {targetCalories.toLocaleString()} kcal に対する進捗度
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("analytics")}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>7日間推移グラフを見る</span>
                    </button>

                    {/* 目標値変更エリア */}
                    <div className="flex items-center gap-2 text-xs">
                {isEditingTarget ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveTarget();
                    }}
                    className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200"
                  >
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={customTargetInput}
                      onChange={(e) => setCustomTargetInput(e.target.value)}
                      disabled={savingTarget}
                      autoFocus
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-slate-500 font-medium text-xs">kcal</span>
                    <button
                      type="submit"
                      disabled={savingTarget}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer flex items-center gap-1 font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                      title="Supabaseに目標カロリーを保存"
                    >
                      {savingTarget ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>保存</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingTarget}
                      onClick={() => {
                        setCustomTargetInput(targetCalories.toString());
                        setIsEditingTarget(false);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
                      title="キャンセル"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTargetInput(targetCalories.toString());
                      setIsEditingTarget(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition-all cursor-pointer font-medium"
                    title="目標カロリーを変更"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>目標を変更</span>
                  </button>
                )}
              </div>
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

        {/* ========================================================= */}
        {/* 第3週機能: マイセット（よく食べる食事）エリア */}
        {/* ========================================================= */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>マイセット（よく食べる食事）</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                    {presets.length} 件
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  タグをクリック（ワンタップ）すると、即座に本日の食事（meals）に記録されます
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {presets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsPresetManageMode(!isPresetManageMode)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    isPresetManageMode
                      ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title="マイセットの削除モードを切り替え"
                >
                  {isPresetManageMode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>完了</span>
                    </>
                  ) : (
                    <>
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>整理・削除</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={fetchPresets}
                disabled={loadingPresets}
                title="マイセット再読み込み"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingPresets ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* プリセット一覧 */}
          {loadingPresets ? (
            <div className="py-6 flex items-center justify-center text-slate-400 gap-2 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-violet-500" />
              <span>マイセットを読み込み中...</span>
            </div>
          ) : presets.length === 0 ? (
            <div className="py-6 text-center space-y-3 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl p-5">
              <p className="text-sm font-medium text-slate-600">
                まだマイセットが登録されていません
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                下の入力フォームから食事を入力し「マイセットに保存」を押すか、まずはよく使う定番メニューを初期追加してみてください。
              </p>
              <button
                type="button"
                onClick={handleSeedDefaultPresets}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-medium text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>定番メニュー（5品）を初期登録する</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {presets.map((preset) => {
                const isLoggingThis = loggingPresetId === preset.id;
                const isDeletingThis = deletingPresetId === preset.id;

                return (
                  <div
                    key={preset.id}
                    className="relative group bg-slate-50 hover:bg-violet-50/60 border border-slate-200 hover:border-violet-300 rounded-xl p-3 transition-all flex flex-col justify-between"
                  >
                    {/* ワンタップ追加ボタンエリア */}
                    <button
                      type="button"
                      onClick={() => handleAddMealFromPreset(preset)}
                      disabled={isLoggingThis || isDeletingThis}
                      className="text-left w-full cursor-pointer focus:outline-none"
                      title="クリックで本日の食事に記録"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-slate-800 group-hover:text-violet-900 text-sm truncate">
                          {preset.food_name}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 shrink-0">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {preset.calories}
                          <span className="text-[10px] font-normal text-amber-500">kcal</span>
                        </span>
                      </div>

                      {/* PFC ミニ情報 */}
                      <div className="mt-2 text-[11px] text-slate-500 group-hover:text-violet-700 flex items-center justify-between">
                        <span>
                          P:{preset.protein ?? 0}g / F:{preset.fat ?? 0}g / C:{preset.carbs ?? 0}g
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 opacity-80 group-hover:opacity-100">
                          {isLoggingThis ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                              <span>追加中</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 text-emerald-500" />
                              <span>＋記録</span>
                            </>
                          )}
                        </span>
                      </div>
                    </button>

                    {/* 削除ボタン（管理モードまたはホバー時に表示） */}
                    <div
                      className={`absolute -top-1.5 -right-1.5 transition-all ${
                        isPresetManageMode
                          ? "opacity-100 scale-100"
                          : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePreset(preset.id, preset.food_name);
                        }}
                        disabled={isDeletingThis}
                        className="p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-full shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        title="このマイセットを削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* フォームに代入するリンク */}
                    <div className="pt-1.5 mt-1.5 border-t border-slate-200/60 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleApplyPresetToForm(preset)}
                        className="text-[10px] text-slate-400 hover:text-violet-600 underline cursor-pointer"
                        title="数値を修正して記録したい場合はフォームに代入"
                      >
                        フォームに代入
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
              自動予測 &amp; マイセット保存対応
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 📸 写真から自動解析エリア */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />

              {!imagePreviewUrl && !analyzingImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/80 hover:bg-emerald-50/40 rounded-2xl p-4 sm:p-5 text-center transition-all cursor-pointer group"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm border border-slate-100 group-hover:scale-105 group-hover:text-emerald-700 transition-all">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 group-hover:text-emerald-900 text-sm flex items-center justify-center gap-1.5">
                        <span>食事写真のアップロード＆プレビュー</span>
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        写真を選択するとプレビューが表示され、自動で食品名とPFCを推計します
                      </span>
                    </div>
                  </div>
                </div>
              ) : analyzingImage ? (
                <div className="border border-emerald-300 bg-emerald-50/60 rounded-2xl p-6 text-center animate-pulse space-y-2">
                  <RefreshCw className="w-7 h-7 animate-spin text-emerald-600 mx-auto" />
                  <p className="font-bold text-emerald-950 text-sm">
                    写真を解析中...
                  </p>
                  <p className="text-xs text-emerald-700">
                    画像を分析して料理と栄養素を計算しています
                  </p>
                </div>
              ) : (
                <div className="relative border border-emerald-200/80 bg-emerald-50/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-4">
                  {/* プレビュー画像 */}
                  <div className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-sm border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreviewUrl!}
                      alt="アップロードされた食事写真"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded font-medium">
                      プレビュー中
                    </span>
                  </div>

                  {/* 解析結果バッジと説明 */}
                  <div className="flex-1 space-y-1.5 text-left w-full">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        画像認識プレビュー
                        {imageAnalysisInfo?.confidence && (
                          <span className="font-normal opacity-80">
                            ({Math.round(imageAnalysisInfo.confidence * 100)}%)
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                        title="写真を解除"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>写真を解除</span>
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      {imageAnalysisInfo?.food_name || foodName}
                    </h4>

                    {imageAnalysisInfo?.note && (
                      <p className="text-xs text-slate-600">
                        {imageAnalysisInfo.note}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                      >
                        別の写真に変更する
                      </button>
                      <span className="text-[11px] text-slate-400">
                        ・各入力欄の数値はいつでも自由に手動微調整できます
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 食品名入力 & インクリメンタル検索（スマート自動補完） */}
            <div className="space-y-2" ref={autocompleteContainerRef}>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="food_name"
                  className="block text-sm font-semibold text-slate-700"
                >
                  食品名 / 料理名 <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">
                  リアルタイム候補表示 ＆ PFC自動補完対応
                </span>
              </div>

              <div className="relative">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      id="food_name"
                      type="text"
                      required
                      autoComplete="off"
                      placeholder="例：牛丼、カレー、プロテイン、サラダ、白ご飯"
                      value={foodName}
                      onChange={(e) => handleFoodNameChange(e.target.value)}
                      onFocus={() => {
                        if (foodName.trim().length >= 1) {
                          const matches = searchFoodSuggestions(foodName, 8);
                          setSuggestions(matches);
                          setShowSuggestions(matches.length > 0);
                        }
                      }}
                      onKeyDown={handleFoodNameKeyDown}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                    />

                    {foodName && (
                      <button
                        type="button"
                        onClick={() => {
                          setFoodName("");
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
                        title="入力をクリア"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

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

                {/* 🔍 インクリメンタル検索（スマート自動補完ドロップダウン） */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-100">
                    <div className="px-3.5 py-2 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        ローカル辞書候補（タップでPFC自動入力）
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        ↑↓キー選択 / Enter決定
                      </span>
                    </div>

                    {suggestions.map((item, idx) => {
                      const isSelected = idx === selectedSuggestionIndex;
                      return (
                        <div
                          key={`${item.name}-${idx}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(item);
                          }}
                          onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                          className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-emerald-50/90 text-emerald-950"
                              : "hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl shrink-0">
                              {item.icon || "🍽️"}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 truncate">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate">
                                  {item.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-xs">
                                <span className="font-bold text-amber-600">
                                  {item.calories} kcal
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-blue-600 font-semibold text-[11px]">
                                  P: {item.protein}g
                                </span>
                                <span className="text-amber-600 font-semibold text-[11px]">
                                  F: {item.fat}g
                                </span>
                                <span className="text-orange-600 font-semibold text-[11px]">
                                  C: {item.carbs}g
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="text-xs font-bold text-emerald-600 px-2 py-1 rounded-md bg-emerald-50 shrink-0">
                            補完する →
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 定番クイックタグ（ユーザーがワンタップでテスト・入力可能） */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  よく検索される食品:
                </span>
                {POPULAR_FOOD_TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => {
                      const matches = searchFoodSuggestions(tag.name, 1);
                      if (matches.length > 0) {
                        handleSelectSuggestion(matches[0]);
                      } else {
                        setFoodName(tag.name);
                        handleAutoEstimate();
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.name}</span>
                  </button>
                ))}
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

            {/* 送信・マイセット保存ボタングループ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* 食事を記録するボタン (2列幅) */}
              <button
                type="submit"
                disabled={submitting}
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
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

              {/* マイセットに保存ボタン */}
              <button
                type="button"
                onClick={handleSaveAsPreset}
                disabled={savingPreset || !foodName.trim()}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-3 bg-violet-50 hover:bg-violet-100 active:bg-violet-200 border border-violet-200 text-violet-700 font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm whitespace-nowrap"
                title="現在入力フォームにある食品名・カロリー・PFCをマイセットとして登録"
              >
                {savingPreset ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-600" />
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4 text-violet-600" />
                    <span>マイセットに保存</span>
                  </>
                )}
              </button>
            </div>
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
                上のマイセットをクリック、またはフォームから入力して記録しましょう
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

        {/* ========================================================= */}
        {/* 画面下部の7日間データ分析ダッシュボードセクション */}
        {/* ========================================================= */}
        <div id="weekly-analytics-section" className="pt-4 border-t border-slate-200/80">
          <WeeklyAnalyticsDashboard
            analytics={weeklyAnalytics}
            onRefresh={fetchMeals}
            onSeedSampleData={handleSeedSampleWeeklyData}
            loading={loading}
          />
        </div>
      </div>
    )}

        {/* フッター */}
        <footer className="text-center text-xs text-slate-400 pt-4 pb-8 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Supabase Client: <code>src/lib/supabaseClient.ts</code>
          </p>
          <p>テーブルスキーマ定義: <code>supabase/schema.sql</code> (meals &amp; presets)</p>
        </footer>
      </div>
    </main>
  );
}
