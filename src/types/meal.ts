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

export interface UserSettings {
  id: number | string;
  target_calories: number;
  target_protein?: number | null;
  target_fat?: number | null;
  target_carbs?: number | null;
  updated_at?: string;
}

export interface UserSettingsUpdateInput {
  target_calories: number;
  target_protein?: number | null;
  target_fat?: number | null;
  target_carbs?: number | null;
}
