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
} from "lucide-react";

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
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

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("meals")
        .insert([
          {
            food_name: trimmedFood,
            calories: calorieNum,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      // 送信成功時にフォームを初期化しリストを更新
      setFoodName("");
      setCalories("");
      setStatusMessage({
        type: "success",
        text: `「${trimmedFood}」（${calorieNum} kcal）を記録しました！`,
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

  // プリセット食品のクイック入力
  const handleQuickAdd = (presetFood: string, presetCalories: number) => {
    setFoodName(presetFood);
    setCalories(presetCalories.toString());
  };

  // カロリー合計の算出
  const totalCalories = meals.reduce((sum, item) => sum + (item.calories || 0), 0);

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
                  のテーブル作成クエリを実行してください。設定完了後にサーバーを再起動します。
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

        {/* 食事入力フォームカード */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                食事・カロリーの記録
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              第1週 バーティカルスライス
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 食品名 */}
              <div className="space-y-1.5">
                <label
                  htmlFor="food_name"
                  className="block text-sm font-semibold text-slate-700"
                >
                  食品名 / 料理名 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="food_name"
                  type="text"
                  required
                  placeholder="例：サラダチキン、玄米ご飯、オートミール"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                />
              </div>

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
                    placeholder="例：250"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full pl-4 pr-14 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    kcal
                  </span>
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
                onClick={() => handleQuickAdd("🥗 サラダチキン", 115)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                サラダチキン (115 kcal)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd("🥚 ゆで卵", 78)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                ゆで卵 (78 kcal)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd("🍎 りんご (1個)", 95)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                りんご (95 kcal)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd("🥪 全粒粉サンド", 320)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                全粒粉サンド (320 kcal)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd("☕ ブラックコーヒー", 8)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                ブラックコーヒー (8 kcal)
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
                  <span>合計摂取: {totalCalories} kcal</span>
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
                上のフォームから食べたものとカロリーを入力して記録しましょう
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 px-2 rounded-xl transition-colors group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                      {meal.food_name || (meal as unknown as { name?: string }).name}
                    </div>
                    <div className="text-xs text-slate-400">
                      記録日時：
                      {meal.created_at
                        ? new Date(meal.created_at).toLocaleString("ja-JP", {
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "たった今"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
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
