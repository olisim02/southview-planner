export interface User {
  id?: number;
  name: string;
  created_at?: string;
}

export interface Dish {
  id?: number;
  name: string;
  description?: string;
  cook_user_id?: number;
  cook_user_name?: string;
  day: 'friday' | 'saturday' | 'sunday';
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cooking_time?: string;
  created_at?: string;
  ingredients?: Ingredient[];
  helpers?: User[];
}

export interface Ingredient {
  id?: number;
  dish_id: number;
  name: string;
  quantity?: string;
  assigned_user_id?: number;
  assigned_user_name?: string;
  created_at?: string;
}

export interface MealHelper {
  id?: number;
  dish_id: number;
  user_id: number;
  user_name?: string;
  role?: string;
  created_at?: string;
}