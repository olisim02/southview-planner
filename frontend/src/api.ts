import axios from 'axios';
import { User, Dish, Ingredient, MealHelper } from './types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Users API
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const response = await api.post('/users', user);
  return response.data;
};

// Dishes API
export const getDishes = async (): Promise<Dish[]> => {
  const response = await api.get('/dishes');
  return response.data;
};

export const createDish = async (dish: Omit<Dish, 'id'>): Promise<Dish> => {
  const response = await api.post('/dishes', dish);
  return response.data;
};

export const updateDish = async (id: number, dish: Partial<Dish>): Promise<Dish> => {
  const response = await api.put(`/dishes/${id}`, dish);
  return response.data;
};

export const deleteDish = async (id: number): Promise<void> => {
  await api.delete(`/dishes/${id}`);
};

// Ingredients API
export const createIngredient = async (ingredient: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
  const response = await api.post('/ingredients', ingredient);
  return response.data;
};

export const updateIngredient = async (id: number, ingredient: Partial<Ingredient>): Promise<Ingredient> => {
  const response = await api.put(`/ingredients/${id}`, ingredient);
  return response.data;
};

export const deleteIngredient = async (id: number): Promise<void> => {
  await api.delete(`/ingredients/${id}`);
};

// Meal helpers API
export const addMealHelper = async (helper: Omit<MealHelper, 'id'>): Promise<MealHelper> => {
  const response = await api.post('/meal-helpers', helper);
  return response.data;
};

export const removeMealHelper = async (id: number): Promise<void> => {
  await api.delete(`/meal-helpers/${id}`);
};