"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Users endpoints
app.get('/api/users', async (req, res) => {
    try {
        const users = await database_1.db.query('SELECT * FROM users ORDER BY name');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
app.post('/api/users', async (req, res) => {
    try {
        const { name } = req.body;
        const result = await database_1.db.run('INSERT INTO users (name) VALUES (?)', [name]);
        res.json({ id: result.lastID, name });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});
// Dishes endpoints
app.get('/api/dishes', async (req, res) => {
    try {
        const dishes = await database_1.db.query(`
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
            const ingredients = await database_1.db.query(`
        SELECT i.*, u.name as assigned_user_name 
        FROM ingredients i 
        LEFT JOIN users u ON i.assigned_user_id = u.id 
        WHERE i.dish_id = ?
      `, [dish.id]);
            const helpers = await database_1.db.query(`
        SELECT mh.*, u.name as user_name 
        FROM meal_helpers mh 
        JOIN users u ON mh.user_id = u.id 
        WHERE mh.dish_id = ?
      `, [dish.id]);
            dish.ingredients = ingredients;
            dish.helpers = helpers;
        }
        res.json(dishes);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dishes' });
    }
});
app.post('/api/dishes', async (req, res) => {
    try {
        const { name, description, cook_user_id, day, meal, cooking_time } = req.body;
        const result = await database_1.db.run('INSERT INTO dishes (name, description, cook_user_id, day, meal, cooking_time) VALUES (?, ?, ?, ?, ?, ?)', [name, description, cook_user_id, day, meal, cooking_time]);
        res.json({ id: result.lastID, ...req.body });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create dish' });
    }
});
app.put('/api/dishes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, cook_user_id, day, meal, cooking_time } = req.body;
        await database_1.db.run('UPDATE dishes SET name = ?, description = ?, cook_user_id = ?, day = ?, meal = ?, cooking_time = ? WHERE id = ?', [name, description, cook_user_id, day, meal, cooking_time, id]);
        res.json({ id: parseInt(id), ...req.body });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update dish' });
    }
});
app.delete('/api/dishes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.db.run('DELETE FROM dishes WHERE id = ?', [id]);
        res.json({ message: 'Dish deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete dish' });
    }
});
// Ingredients endpoints
app.post('/api/ingredients', async (req, res) => {
    try {
        const { dish_id, name, quantity, assigned_user_id } = req.body;
        const result = await database_1.db.run('INSERT INTO ingredients (dish_id, name, quantity, assigned_user_id) VALUES (?, ?, ?, ?)', [dish_id, name, quantity, assigned_user_id]);
        res.json({ id: result.lastID, ...req.body });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create ingredient' });
    }
});
app.put('/api/ingredients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity, assigned_user_id } = req.body;
        await database_1.db.run('UPDATE ingredients SET name = ?, quantity = ?, assigned_user_id = ? WHERE id = ?', [name, quantity, assigned_user_id, id]);
        res.json({ id: parseInt(id), ...req.body });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update ingredient' });
    }
});
app.delete('/api/ingredients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.db.run('DELETE FROM ingredients WHERE id = ?', [id]);
        res.json({ message: 'Ingredient deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete ingredient' });
    }
});
// Meal helpers endpoints
app.post('/api/meal-helpers', async (req, res) => {
    try {
        const { dish_id, user_id, role } = req.body;
        const result = await database_1.db.run('INSERT INTO meal_helpers (dish_id, user_id, role) VALUES (?, ?, ?)', [dish_id, user_id, role || 'helper']);
        res.json({ id: result.lastID, ...req.body });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add helper' });
    }
});
app.delete('/api/meal-helpers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.db.run('DELETE FROM meal_helpers WHERE id = ?', [id]);
        res.json({ message: 'Helper removed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to remove helper' });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
