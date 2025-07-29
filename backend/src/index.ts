import express from 'express';
import cors from 'cors';
import { db } from './database';
import { User, Dish, Ingredient, MealHelper } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Users endpoints
app.get('/api/users', (req, res) => {
  try {
    const users = db.query('SELECT * FROM users ORDER BY name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { name } = req.body;
    const result = db.run('INSERT INTO users (name) VALUES (?)', [name]);
    res.json({ id: result.lastInsertRowid, name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Dishes endpoints
app.get('/api/dishes', (req, res) => {
  try {
    const dishes = db.query(`
      SELECT d.*, u.name as cook_user_name 
      FROM dishes d 
      LEFT JOIN users u ON d.cook_user_id = u.id 
      ORDER BY 
        CASE d.day 
          WHEN 'friday' THEN 1 
          WHEN 'saturday' THEN 2 
          WHEN 'sunday' THEN 3 
        END,
        CASE d.meal 
          WHEN 'breakfast' THEN 1 
          WHEN 'lunch' THEN 2 
          WHEN 'dinner' THEN 3 
          WHEN 'snack' THEN 4 
        END
    `);

    // Get ingredients and helpers for each dish
    for (const dish of dishes) {
      const ingredients = db.query(`
        SELECT i.*, u.name as assigned_user_name 
        FROM ingredients i 
        LEFT JOIN users u ON i.assigned_user_id = u.id 
        WHERE i.dish_id = ?
      `, [dish.id]);
      
      const helpers = db.query(`
        SELECT mh.*, u.name as user_name 
        FROM meal_helpers mh 
        JOIN users u ON mh.user_id = u.id 
        WHERE mh.dish_id = ?
      `, [dish.id]);
      
      dish.ingredients = ingredients;
      dish.helpers = helpers;
    }

    res.json(dishes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

app.post('/api/dishes', (req, res) => {
  try {
    const { name, description, cook_user_id, day, meal, cooking_time } = req.body;
    const result = db.run(
      'INSERT INTO dishes (name, description, cook_user_id, day, meal, cooking_time) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, cook_user_id, day, meal, cooking_time]
    );
    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create dish' });
  }
});

app.put('/api/dishes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, cook_user_id, day, meal, cooking_time } = req.body;
    db.run(
      'UPDATE dishes SET name = ?, description = ?, cook_user_id = ?, day = ?, meal = ?, cooking_time = ? WHERE id = ?',
      [name, description, cook_user_id, day, meal, cooking_time, id]
    );
    res.json({ id: parseInt(id), ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dish' });
  }
});

app.delete('/api/dishes/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM dishes WHERE id = ?', [id]);
    res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete dish' });
  }
});

// Ingredients endpoints
app.post('/api/ingredients', (req, res) => {
  try {
    const { dish_id, name, quantity, assigned_user_id } = req.body;
    const result = db.run(
      'INSERT INTO ingredients (dish_id, name, quantity, assigned_user_id) VALUES (?, ?, ?, ?)',
      [dish_id, name, quantity, assigned_user_id]
    );
    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

app.put('/api/ingredients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, assigned_user_id } = req.body;
    db.run(
      'UPDATE ingredients SET name = ?, quantity = ?, assigned_user_id = ? WHERE id = ?',
      [name, quantity, assigned_user_id, id]
    );
    res.json({ id: parseInt(id), ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

app.delete('/api/ingredients/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM ingredients WHERE id = ?', [id]);
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

// Meal helpers endpoints
app.post('/api/meal-helpers', (req, res) => {
  try {
    const { dish_id, user_id, role } = req.body;
    const result = db.run(
      'INSERT INTO meal_helpers (dish_id, user_id, role) VALUES (?, ?, ?)',
      [dish_id, user_id, role || 'helper']
    );
    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add helper' });
  }
});

app.delete('/api/meal-helpers/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM meal_helpers WHERE id = ?', [id]);
    res.json({ message: 'Helper removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove helper' });
  }
});

// Reset endpoint - clears all data
app.post('/api/reset', (req, res) => {
  try {
    // Delete all data in reverse order due to foreign key constraints
    db.run('DELETE FROM meal_helpers');
    db.run('DELETE FROM ingredients');
    db.run('DELETE FROM dishes');
    db.run('DELETE FROM users');
    
    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});