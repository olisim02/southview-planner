import express from 'express';
import cors from 'cors';
import { db } from './database';
import { User, Dish, Ingredient, MealHelper } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users ORDER BY name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await db.query('INSERT INTO users (name) VALUES ($1) RETURNING id', [name]);
    res.json({ id: result[0].id, name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Dishes endpoints
app.get('/api/dishes', async (req, res) => {
  try {
    const dishes = await db.query(`
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
      const ingredients = await db.query(`
        SELECT i.*, u.name as assigned_user_name 
        FROM ingredients i 
        LEFT JOIN users u ON i.assigned_user_id = u.id 
        WHERE i.dish_id = $1
      `, [dish.id]);
      
      const helpers = await db.query(`
        SELECT mh.*, u.name as user_name 
        FROM meal_helpers mh 
        JOIN users u ON mh.user_id = u.id 
        WHERE mh.dish_id = $1
      `, [dish.id]);
      
      dish.ingredients = ingredients;
      dish.helpers = helpers;
    }

    res.json(dishes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

app.post('/api/dishes', async (req, res) => {
  try {
    const { name, description, cook_user_id, day, meal, cooking_time } = req.body;
    const result = await db.query(
      'INSERT INTO dishes (name, description, cook_user_id, day, meal, cooking_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, description, cook_user_id, day, meal, cooking_time]
    );
    res.json({ id: result[0].id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create dish' });
  }
});

app.put('/api/dishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, cook_user_id, day, meal, cooking_time } = req.body;
    await db.query(
      'UPDATE dishes SET name = $1, description = $2, cook_user_id = $3, day = $4, meal = $5, cooking_time = $6 WHERE id = $7',
      [name, description, cook_user_id, day, meal, cooking_time, id]
    );
    res.json({ id: parseInt(id), ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dish' });
  }
});

app.delete('/api/dishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM dishes WHERE id = $1', [id]);
    res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete dish' });
  }
});

// Ingredients endpoints
app.post('/api/ingredients', async (req, res) => {
  try {
    const { dish_id, name, quantity, assigned_user_id } = req.body;
    const result = await db.query(
      'INSERT INTO ingredients (dish_id, name, quantity, assigned_user_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [dish_id, name, quantity, assigned_user_id]
    );
    res.json({ id: result[0].id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

app.put('/api/ingredients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, assigned_user_id } = req.body;
    await db.query(
      'UPDATE ingredients SET name = $1, quantity = $2, assigned_user_id = $3 WHERE id = $4',
      [name, quantity, assigned_user_id, id]
    );
    res.json({ id: parseInt(id), ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

app.delete('/api/ingredients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM ingredients WHERE id = $1', [id]);
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

// Meal helpers endpoints
app.post('/api/meal-helpers', async (req, res) => {
  try {
    const { dish_id, user_id, role } = req.body;
    const result = await db.query(
      'INSERT INTO meal_helpers (dish_id, user_id, role) VALUES ($1, $2, $3) RETURNING id',
      [dish_id, user_id, role || 'helper']
    );
    res.json({ id: result[0].id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add helper' });
  }
});

app.delete('/api/meal-helpers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM meal_helpers WHERE id = $1', [id]);
    res.json({ message: 'Helper removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove helper' });
  }
});

// Reset endpoint - clears all data
app.post('/api/reset', async (req, res) => {
  try {
    // Delete all data in reverse order due to foreign key constraints
    await db.query('DELETE FROM meal_helpers');
    await db.query('DELETE FROM ingredients');
    await db.query('DELETE FROM dishes');
    await db.query('DELETE FROM users');
    
    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    await db.initialize();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();