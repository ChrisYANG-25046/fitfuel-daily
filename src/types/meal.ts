export interface Meal {
  id: number | string;
  food_name: string;
  calories: number;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  created_at: string;
}

export interface MealInsertInput {
  food_name: string;
  calories: number;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
}

export interface Preset {
  id: number | string;
  food_name: string;
  calories: number;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  created_at?: string;
}

export interface PresetInsertInput {
  food_name: string;
  calories: number;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
}
