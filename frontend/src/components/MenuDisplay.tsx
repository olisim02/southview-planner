import React, { useState, useEffect } from 'react';
import { Dish } from '../types';
import { getDishes } from '../api';

const MenuDisplay: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const fetchedDishes = await getDishes();
      setDishes(fetchedDishes);
    } catch (err) {
      setError('Failed to load menu');
      console.error('Error fetching dishes:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupDishesByDay = () => {
    const grouped: { [key: string]: { [key: string]: Dish[] } } = {
      friday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      saturday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      sunday: { breakfast: [], lunch: [], dinner: [], snack: [] }
    };

    dishes.forEach(dish => {
      if (grouped[dish.day] && grouped[dish.day][dish.meal]) {
        grouped[dish.day][dish.meal].push(dish);
      }
    });

    return grouped;
  };

  if (loading) return <div className="loading">Loading menu...</div>;
  if (error) return <div className="error">{error}</div>;

  const groupedDishes = groupDishesByDay();

  return (
    <div className="schedule-container">
      {Object.entries(groupedDishes).map(([day, meals]) => (
        <div key={day} className="day-section">
          <h2 className="day-header">{day}</h2>
          <div className="meals-grid">
            {Object.entries(meals).map(([meal, dishList]) => (
              <div key={meal} className="meal-section">
                <h3 className="meal-header">{meal}</h3>
                {dishList.length > 0 ? (
                  dishList.map(dish => (
                    <div key={dish.id} className="dish-card">
                      <div className="dish-name">{dish.name}</div>
                      {dish.cook_user_name && (
                        <div className="dish-cook">Cook: {dish.cook_user_name}</div>
                      )}
                      {dish.description && (
                        <div className="dish-description">{dish.description}</div>
                      )}
                      {dish.cooking_time && (
                        <div className="dish-time">Cooking time: {dish.cooking_time}</div>
                      )}
                      
                      {dish.ingredients && dish.ingredients.length > 0 && (
                        <div className="ingredients-section">
                          <div className="section-title">Ingredients:</div>
                          <ul className="ingredients-list">
                            {dish.ingredients.map(ingredient => (
                              <li key={ingredient.id} className="ingredient-item">
                                {ingredient.quantity ? `${ingredient.quantity} ` : ''}{ingredient.name}
                                {ingredient.assigned_user_name && (
                                  <span className="ingredient-assigned"> (bringing: {ingredient.assigned_user_name})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {dish.helpers && dish.helpers.length > 0 && (
                        <div className="helpers-section">
                          <div className="section-title">Helpers:</div>
                          <ul className="helpers-list">
                            {dish.helpers.map(helper => (
                              <li key={helper.id} className="helper-item">
                                <span className="helper-name">{helper.user_name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-dishes">No dishes planned for {meal}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuDisplay;