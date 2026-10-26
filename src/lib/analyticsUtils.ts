import { Meal, DailyNutritionSummary, WeeklyAnalyticsData } from "@/types/meal";

const DAY_OF_WEEK_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * Date オブジェクトからローカル時間基準の "YYYY-MM-DD" 文字列を取得
 */
export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 過去7日分の日付配列を生成（6日前 〜 今日）
 */
export function generatePast7Days(baseDate: Date = new Date()): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

/**
 * Supabase の meals レコード群から過去7日間の日別サマリーと週次統計を集計
 */
export function computeWeeklyAnalytics(
  meals: Meal[],
  targetCalories: number,
  baseDate: Date = new Date()
): WeeklyAnalyticsData {
  const past7Days = generatePast7Days(baseDate);
  const todayKey = formatLocalDateKey(baseDate);

  // 食事レコードを YYYY-MM-DD ごとにグループ化
  const mealsByDate = new Map<string, Meal[]>();
  for (const meal of meals) {
    if (!meal.created_at) continue;
    const mealDate = new Date(meal.created_at);
    const dateKey = formatLocalDateKey(mealDate);
    const existing = mealsByDate.get(dateKey) || [];
    existing.push(meal);
    mealsByDate.set(dateKey, existing);
  }

  // 過去7日分の日別集計（記録がない日も 0 kcal として必ず7日分生成）
  const dailySummaries: DailyNutritionSummary[] = past7Days.map((d) => {
    const dateKey = formatLocalDateKey(d);
    const dayMeals = mealsByDate.get(dateKey) || [];

    const totalCalories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = dayMeals.reduce((sum, m) => sum + Number(m.protein || 0), 0);
    const totalFat = dayMeals.reduce((sum, m) => sum + Number(m.fat || 0), 0);
    const totalCarbs = dayMeals.reduce((sum, m) => sum + Number(m.carbs || 0), 0);

    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeek = DAY_OF_WEEK_NAMES[d.getDay()];
    const isToday = dateKey === todayKey;

    return {
      date: dateKey,
      displayDate: isToday ? `今日` : `${month}/${day}`,
      fullDisplayDate: `${month}月${day}日 (${dayOfWeek})`,
      dayOfWeek,
      isToday,
      totalCalories,
      totalProtein: parseFloat(totalProtein.toFixed(1)),
      totalFat: parseFloat(totalFat.toFixed(1)),
      totalCarbs: parseFloat(totalCarbs.toFixed(1)),
      mealCount: dayMeals.length,
      meals: dayMeals,
    };
  });

  // 全体集計値の計算
  const totalCalories = dailySummaries.reduce((sum, d) => sum + d.totalCalories, 0);
  const totalProtein = dailySummaries.reduce((sum, d) => sum + d.totalProtein, 0);
  const totalFat = dailySummaries.reduce((sum, d) => sum + d.totalFat, 0);
  const totalCarbs = dailySummaries.reduce((sum, d) => sum + d.totalCarbs, 0);

  const daysRecorded = dailySummaries.filter((d) => d.mealCount > 0).length;
  const totalDays = 7;

  // 1日平均カロリー（7日間の平均）
  const averageCalories = Math.round(totalCalories / totalDays);
  const averageProtein = parseFloat((totalProtein / totalDays).toFixed(1));
  const averageFat = parseFloat((totalFat / totalDays).toFixed(1));
  const averageCarbs = parseFloat((totalCarbs / totalDays).toFixed(1));

  // 目標達成率（平均摂取カロリー / 1日目標カロリー %）
  const achievementRate =
    targetCalories > 0 ? Math.round((averageCalories / targetCalories) * 100) : 0;

  // PFC のエネルギー比率（P: 4 kcal/g, F: 9 kcal/g, C: 4 kcal/g）
  const proteinKcal = totalProtein * 4;
  const fatKcal = totalFat * 9;
  const carbsKcal = totalCarbs * 4;
  const totalPfcKcal = proteinKcal + fatKcal + carbsKcal;

  let proteinPercent = 0;
  let fatPercent = 0;
  let carbsPercent = 0;

  if (totalPfcKcal > 0) {
    proteinPercent = Math.round((proteinKcal / totalPfcKcal) * 100);
    fatPercent = Math.round((fatKcal / totalPfcKcal) * 100);
    // 合計が100%になるように炭水化物を調整
    carbsPercent = Math.max(0, 100 - proteinPercent - fatPercent);
  }

  return {
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
    pfcPercentage: {
      protein: proteinPercent,
      fat: fatPercent,
      carbs: carbsPercent,
    },
    pfcGramsTotal: {
      protein: parseFloat(totalProtein.toFixed(1)),
      fat: parseFloat(totalFat.toFixed(1)),
      carbs: parseFloat(totalCarbs.toFixed(1)),
    },
    pfcCaloriesTotal: {
      protein: Math.round(proteinKcal),
      fat: Math.round(fatKcal),
      carbs: Math.round(carbsKcal),
    },
  };
}
