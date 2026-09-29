export interface Meal {
  id: number | string;
  food_name: string;
  calories: number;
  created_at: string;
}

export interface MealInsertInput {
  food_name: string;
  calories: number;
}
