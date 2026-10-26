"use client";

import { useState } from "react";
import { Meal, WeeklyAnalyticsData, DailyNutritionSummary } from "@/types/meal";
import {
  BarChart3,
  PieChart,
  Flame,
  Target,
  Activity,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Utensils,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface WeeklyAnalyticsDashboardProps {
  analytics: WeeklyAnalyticsData;
  onRefresh?: () => void;
  onSeedSampleData?: () => Promise<void>;
  loading?: boolean;
}

export default function WeeklyAnalyticsDashboard({
  analytics,
  onRefresh,
  onSeedSampleData,
  loading = false,
}: WeeklyAnalyticsDashboardProps) {
  const {
    dailySummaries,
    totalCalories,
    averageCalories,
    averageProtein,
    averageFat,
    averageCarbs,
    targetCalories,
    achievementRate,
    daysRecorded,
    totalDays,
    pfcPercentage,
    pfcGramsTotal,
  } = analytics;

  // 選択された日付（クリックで日別詳細表示）
  const [selectedDate, setSelectedDate] = useState<string | null>(
    dailySummaries[dailySummaries.length - 1]?.date || null
  );
  const [seeding, setSeeding] = useState(false);

  // 選択された日のデータ
  const selectedDay = dailySummaries.find((d) => d.date === selectedDate) || dailySummaries[dailySummaries.length - 1];

  // 棒グラフの最大スケール計算（目標カロリーまたは実測最大値の大きい方に余裕を持たせる）
  const maxCaloriesLogged = Math.max(...dailySummaries.map((d) => d.totalCalories), 0);
  const maxY = Math.max(Math.ceil((Math.max(maxCaloriesLogged, targetCalories * 1.15)) / 500) * 500, 2000);

  // 目標ラインの位置（下からの百分率 %）
  const targetLinePercent = Math.min(100, Math.max(0, (targetCalories / maxY) * 100));

  // 目標カロリーとの差分（1日平均）
  const calorieDiff = averageCalories - targetCalories;
  const isOverTarget = calorieDiff > 0;

  // PFC ドーナツチャートの円周計算 (r = 40, C = 2 * PI * 40 ≈ 251.327)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const proteinDash = (pfcPercentage.protein / 100) * circumference;
  const fatDash = (pfcPercentage.fat / 100) * circumference;
  const carbsDash = (pfcPercentage.carbs / 100) * circumference;

  const proteinOffset = 0;
  const fatOffset = -proteinDash;
  const carbsOffset = -(proteinDash + fatDash);

  const handleSeed = async () => {
    if (!onSeedSampleData) return;
    setSeeding(true);
    try {
      await onSeedSampleData();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* ダッシュボードヘッダー */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              7日間の栄養摂取データ分析
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              過去7日間
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {dailySummaries[0]?.date} 〜 {dailySummaries[dailySummaries.length - 1]?.date} の日別カロリー推移とPFCバランス
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>更新</span>
            </button>
          )}

          {onSeedSampleData && daysRecorded < 3 && (
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{seeding ? "データ生成中..." : "サンプルデータ投入 (デモ)"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* サマリーカード 4点 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* カード1: 1日平均カロリー */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>1日平均カロリー</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">
              {averageCalories.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">kcal/日</span>
          </div>
          <div className="text-xs flex items-center gap-1 text-slate-500">
            <span>目標 ({targetCalories.toLocaleString()} kcal) 対比:</span>
            <span
              className={`font-bold ${
                isOverTarget ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {isOverTarget ? `+${calorieDiff.toLocaleString()}` : `${calorieDiff.toLocaleString()}`} kcal
            </span>
          </div>
        </div>

        {/* カード2: 目標達成率 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>目標カロリー達成率</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">
              {achievementRate}
            </span>
            <span className="text-xs font-bold text-slate-500">%</span>
          </div>
          <div className="text-xs">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                achievementRate >= 90 && achievementRate <= 110
                  ? "bg-emerald-100 text-emerald-800"
                  : achievementRate < 90
                  ? "bg-blue-100 text-blue-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {achievementRate >= 90 && achievementRate <= 110
                ? "🎯 理想的な適正ペース"
                : achievementRate < 90
                ? "📉 アンダーカロリー (減量順調)"
                : "⚠️ 目標超過 (カロリー過多)"}
            </span>
          </div>
        </div>

        {/* カード3: 記録日数 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>記録継続日数</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">
              {daysRecorded}
            </span>
            <span className="text-xs font-bold text-slate-500">/ {totalDays} 日間</span>
          </div>
          <div className="text-xs text-slate-500">
            <span>記録率: </span>
            <span className="font-bold text-slate-700">
              {Math.round((daysRecorded / totalDays) * 100)}%
            </span>
            <span className="text-slate-400 ml-1">
              ({totalDays - daysRecorded}日 未記録)
            </span>
          </div>
        </div>

        {/* カード4: 7日間総摂取カロリー */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>7日間合計カロリー</span>
            <span className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
              <Utensils className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">
              {totalCalories.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">kcal</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>累計食事数:</span>
            <span className="font-bold text-slate-700">
              {dailySummaries.reduce((sum, d) => sum + d.mealCount, 0)} 食
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 日別カロリー推移グラフ（バーチャート ＋ 目標ライン） */}
      {/* ========================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>日別カロリー推移グラフ</span>
              <span className="text-xs font-normal text-slate-500">
                (目標ライン付き)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              過去7日間の摂取カロリーと1日目標カロリー（{targetCalories.toLocaleString()} kcal）の比較
            </p>
          </div>

          {/* 凡例 (Legend) */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
              <span>目標以内</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
              <span>目標超過</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-slate-200"></span>
              <span>記録なし (0 kcal)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-4 border-t-2 border-dashed border-emerald-600"></span>
              <span>目標ライン</span>
            </div>
          </div>
        </div>

        {/* グラフ描画エリア */}
        <div className="relative pt-6 pb-2">
          {/* 目盛線 & Y軸ラベル */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 pr-2">
            {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
              const val = Math.round(maxY * ratio);
              return (
                <div key={ratio} className="relative w-full flex items-center">
                  <span className="w-14 text-right pr-2 shrink-0">{val.toLocaleString()} kcal</span>
                  <div className="flex-1 border-b border-slate-100"></div>
                </div>
              );
            })}
          </div>

          {/* 目標カロリー水平ライン */}
          <div
            className="absolute left-14 right-0 z-10 pointer-events-none transition-all duration-300"
            style={{ bottom: `${targetLinePercent}%` }}
          >
            <div className="relative border-b-2 border-dashed border-emerald-500/80 w-full flex items-center justify-end pr-1">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50/90 px-1.5 py-0.5 rounded border border-emerald-300/80 -translate-y-1/2 shadow-2xs">
                🎯 目標: {targetCalories.toLocaleString()} kcal
              </span>
            </div>
          </div>

          {/* バーチャートのバーコンテナ */}
          <div className="relative ml-14 h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6">
            {dailySummaries.map((day) => {
              const isSelected = selectedDate === day.date;
              const heightPercent = day.totalCalories > 0
                ? Math.min(100, Math.max(6, (day.totalCalories / maxY) * 100))
                : 3; // 記録なしの日は3%の極小バーで0kcalを表示

              const isDayOver = day.totalCalories > targetCalories;
              const hasRecords = day.totalCalories > 0;

              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex-1 flex flex-col items-center justify-end h-full cursor-pointer group transition-all ${
                    isSelected ? "opacity-100" : "opacity-90 hover:opacity-100"
                  }`}
                >
                  {/* バー上部の数値 */}
                  <div className="mb-1 text-center transition-transform group-hover:-translate-y-0.5">
                    <span
                      className={`text-[11px] font-bold block ${
                        !hasRecords
                          ? "text-slate-400"
                          : isDayOver
                          ? "text-rose-600"
                          : "text-slate-700"
                      }`}
                    >
                      {day.totalCalories > 0 ? day.totalCalories.toLocaleString() : "0"}
                    </span>
                    <span className="text-[9px] text-slate-400 block -mt-0.5">kcal</span>
                  </div>

                  {/* 棒 (バー本体) */}
                  <div className="w-full max-w-[48px] h-full flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 relative shadow-xs ${
                        isSelected ? "ring-2 ring-indigo-500 ring-offset-2" : ""
                      } ${
                        !hasRecords
                          ? "bg-slate-200"
                          : isDayOver
                          ? "bg-gradient-to-t from-rose-500 to-amber-500"
                          : "bg-gradient-to-t from-teal-500 to-emerald-500"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* ホバー時のツールチップ */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                        <div className="bg-slate-900 text-white text-[11px] rounded-xl px-2.5 py-1.5 shadow-xl whitespace-nowrap">
                          <p className="font-bold">{day.fullDisplayDate}</p>
                          <p className="text-amber-300 font-semibold">{day.totalCalories.toLocaleString()} kcal</p>
                          {hasRecords ? (
                            <p className="text-[10px] text-slate-300">
                              P:{day.totalProtein}g / F:{day.totalFat}g / C:{day.totalCarbs}g ({day.mealCount}食)
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400">記録なし</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* X軸 日付ラベル */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-xs font-bold block ${
                        day.isToday ? "text-indigo-600" : "text-slate-700"
                      }`}
                    >
                      {day.displayDate}
                    </span>
                    <span
                      className={`text-[10px] block ${
                        day.dayOfWeek === "日"
                          ? "text-rose-500 font-bold"
                          : day.dayOfWeek === "土"
                          ? "text-blue-500 font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      ({day.dayOfWeek})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 選択した日のクイック詳細パネル */}
        {selectedDay && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {selectedDay.fullDisplayDate} の摂取詳細
                </span>
                {selectedDay.isToday && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
                    今日
                  </span>
                )}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedDay.totalCalories === 0
                      ? "bg-slate-200 text-slate-600"
                      : selectedDay.totalCalories <= targetCalories
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {selectedDay.totalCalories === 0
                    ? "記録なし"
                    : selectedDay.totalCalories <= targetCalories
                    ? `目標内 (${targetCalories - selectedDay.totalCalories} kcal 残り)`
                    : `目標超過 (+${selectedDay.totalCalories - targetCalories} kcal)`}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                合計: <strong className="text-slate-900">{selectedDay.totalCalories.toLocaleString()} kcal</strong> / 食事記録: {selectedDay.mealCount} 件
              </p>
            </div>

            {/* PFC の内訳バッジ */}
            <div className="flex items-center gap-2 text-xs">
              <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-900">
                <span className="text-[10px] text-blue-600 font-semibold block">たんぱく質 (P)</span>
                <span className="font-extrabold">{selectedDay.totalProtein}g</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900">
                <span className="text-[10px] text-amber-600 font-semibold block">脂質 (F)</span>
                <span className="font-extrabold">{selectedDay.totalFat}g</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/80 text-orange-900">
                <span className="text-[10px] text-orange-600 font-semibold block">炭水化物 (C)</span>
                <span className="font-extrabold">{selectedDay.totalCarbs}g</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 過去7日間の PFC 平均バランス（割合）チャート */}
      {/* ========================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <span>過去7日間のPFC平均バランス（エネルギー比率）</span>
            </h3>
            <p className="text-xs text-slate-500">
              摂取カロリーに占める各三大栄養素の割合（理想値: P 20〜30% / F 20〜25% / C 50〜60%）
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* 左側: ドーナツチャート (SVG) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* 背景円 */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="16"
                  fill="none"
                />

                {totalCalories > 0 ? (
                  <>
                    {/* たんぱく質 (Protein: Blue) */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#3b82f6"
                      strokeWidth="16"
                      strokeDasharray={`${proteinDash} ${circumference}`}
                      strokeDashoffset={proteinOffset}
                      fill="none"
                      className="transition-all duration-700"
                    />
                    {/* 脂質 (Fat: Amber) */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#f59e0b"
                      strokeWidth="16"
                      strokeDasharray={`${fatDash} ${circumference}`}
                      strokeDashoffset={fatOffset}
                      fill="none"
                      className="transition-all duration-700"
                    />
                    {/* 炭水化物 (Carbs: Orange) */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#f97316"
                      strokeWidth="16"
                      strokeDasharray={`${carbsDash} ${circumference}`}
                      strokeDashoffset={carbsOffset}
                      fill="none"
                      className="transition-all duration-700"
                    />
                  </>
                ) : (
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#cbd5e1"
                    strokeWidth="16"
                    fill="none"
                  />
                )}
              </svg>

              {/* ドーナツ中央テキスト */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  PFC比率
                </span>
                <span className="text-xs font-black text-slate-800">
                  {totalCalories > 0 ? "7日間平均" : "記録なし"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {totalCalories.toLocaleString()} kcal
                </span>
              </div>
            </div>

            {/* ドーナツ凡例 */}
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="font-semibold text-slate-700">P: {pfcPercentage.protein}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="font-semibold text-slate-700">F: {pfcPercentage.fat}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="font-semibold text-slate-700">C: {pfcPercentage.carbs}%</span>
              </div>
            </div>
          </div>

          {/* 右側: 栄養素別カード & アドバイス */}
          <div className="md:col-span-7 space-y-3">
            {/* たんぱく質 (P) */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>たんぱく質 (Protein)</span>
                </div>
                <span className="text-blue-700 font-extrabold text-sm">
                  {pfcPercentage.protein}% <span className="text-xs font-normal">({Math.round(averageProtein * 4)} kcal/日)</span>
                </span>
              </div>
              <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pfcPercentage.protein)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-blue-800">
                <span>1日平均: <strong>{averageProtein}g/日</strong></span>
                <span>7日合計: <strong>{pfcGramsTotal.protein}g</strong> (目安: 20〜30%)</span>
              </div>
            </div>

            {/* 脂質 (F) */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>脂質 (Fat)</span>
                </div>
                <span className="text-amber-700 font-extrabold text-sm">
                  {pfcPercentage.fat}% <span className="text-xs font-normal">({Math.round(averageFat * 9)} kcal/日)</span>
                </span>
              </div>
              <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pfcPercentage.fat)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-amber-800">
                <span>1日平均: <strong>{averageFat}g/日</strong></span>
                <span>7日合計: <strong>{pfcGramsTotal.fat}g</strong> (目安: 20〜25%)</span>
              </div>
            </div>

            {/* 炭水化物 (C) */}
            <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-orange-900">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span>炭水化物 (Carbohydrate)</span>
                </div>
                <span className="text-orange-700 font-extrabold text-sm">
                  {pfcPercentage.carbs}% <span className="text-xs font-normal">({Math.round(averageCarbs * 4)} kcal/日)</span>
                </span>
              </div>
              <div className="w-full bg-orange-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pfcPercentage.carbs)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-orange-800">
                <span>1日平均: <strong>{averageCarbs}g/日</strong></span>
                <span>7日合計: <strong>{pfcGramsTotal.carbs}g</strong> (目安: 50〜60%)</span>
              </div>
            </div>

            {/* 管理栄養アドバイスメモ */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">PFC分析アドバイス:</span>
                {totalCalories === 0 ? (
                  <span>まだ過去7日間の食事データがありません。日々の食事を記録してPFCバランスを確認しましょう。</span>
                ) : pfcPercentage.protein >= 20 ? (
                  <span>高タンパク質な食事が維持されています！筋肉量を保ちながら健康的に減量できる理想的なバランスです。</span>
                ) : pfcPercentage.fat > 30 ? (
                  <span>脂質の割合がやや高めです。炒め油や揚げ物を控え、赤身肉や魚、大豆製品などを取り入れてみましょう。</span>
                ) : (
                  <span>バランスよく摂取できています。日々の活動量に合わせて炭水化物量を微調整していきましょう。</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 過去7日間の日別記録一覧テーブル */}
      {/* ========================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              過去7日間の日別サマリー一覧
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            行をクリックすると該当日をグラフ上で選択できます
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">日付</th>
                <th className="py-3 px-4">摂取カロリー</th>
                <th className="py-3 px-4">たんぱく質 (P)</th>
                <th className="py-3 px-4">脂質 (F)</th>
                <th className="py-3 px-4">炭水化物 (C)</th>
                <th className="py-3 px-4">食事数</th>
                <th className="py-3 px-4">目標判定</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailySummaries.map((day) => {
                const isSelected = selectedDate === day.date;
                const isOver = day.totalCalories > targetCalories;
                const hasData = day.totalCalories > 0;

                return (
                  <tr
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50/80 font-semibold"
                        : "hover:bg-slate-50/80 text-slate-700"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{day.fullDisplayDate}</span>
                        {day.isToday && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                            今日
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${hasData ? (isOver ? "text-rose-600" : "text-emerald-700") : "text-slate-400"}`}>
                        {day.totalCalories.toLocaleString()} kcal
                      </span>
                    </td>
                    <td className="py-3 px-4 text-blue-700 font-medium">
                      {hasData ? `${day.totalProtein}g` : "-"}
                    </td>
                    <td className="py-3 px-4 text-amber-700 font-medium">
                      {hasData ? `${day.totalFat}g` : "-"}
                    </td>
                    <td className="py-3 px-4 text-orange-700 font-medium">
                      {hasData ? `${day.totalCarbs}g` : "-"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {day.mealCount} 食
                    </td>
                    <td className="py-3 px-4">
                      {!hasData ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                          記録なし
                        </span>
                      ) : isOver ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          <AlertTriangle className="w-3 h-3" />
                          超過 (+{day.totalCalories - targetCalories})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          目標内
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
