import { Meal } from "./meal";

export interface DailyNutritionSummary {
  date: string; // "YYYY-MM-DD"
  displayDate: string; // "10/26"
  fullDisplayDate: string; // "10月26日 (日)"
  dayOfWeek: string; // "月", "火", "水", "木", "金", "土", "日"
  isToday: boolean;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  mealCount: number;
  meals: Meal[];
}

export interface WeeklyAnalyticsData {
  dailySummaries: DailyNutritionSummary[];
  totalCalories: number;
  averageCalories: number;
  averageProtein: number;
  averageFat: number;
  averageCarbs: number;
  targetCalories: number;
  achievementRate: number; // % (平均 / 目標)
  daysRecorded: number; // 記録がある日数 (0〜7)
  totalDays: number; // 7
  pfcPercentage: {
    protein: number;
    fat: number;
    carbs: number;
  };
  pfcGramsTotal: {
    protein: number;
    fat: number;
    carbs: number;
  };
  pfcCaloriesTotal: {
    protein: number;
    fat: number;
    carbs: number;
  };
}
