"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DatabaseWrapper = void 0;
const pg_1 = require("pg");
class DatabaseWrapper {
    constructor() {
        this.pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }
    async initialize() {
        await this.init();
    }
    async init() {
        const client = await this.pool.connect();
        try {
            await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await client.query(`
        CREATE TABLE IF NOT EXISTS dishes (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          cook_user_id INTEGER,
          day TEXT NOT NULL CHECK (day IN ('friday', 'saturday', 'sunday')),
          meal TEXT NOT NULL CHECK (meal IN ('lunch', 'dinner', 'breakfast', 'snack')),
          cooking_time TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cook_user_id) REFERENCES users (id)
        )
      `);
            await client.query(`
        CREATE TABLE IF NOT EXISTS ingredients (
          id SERIAL PRIMARY KEY,
          dish_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          quantity TEXT,
          assigned_user_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (dish_id) REFERENCES dishes (id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_user_id) REFERENCES users (id)
        )
      `);
            await client.query(`
        CREATE TABLE IF NOT EXISTS meal_helpers (
          id SERIAL PRIMARY KEY,
          dish_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          role TEXT DEFAULT 'helper',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (dish_id) REFERENCES dishes (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(dish_id, user_id)
        )
      `);
        }
        finally {
            client.release();
        }
    }
    async query(sql, params = []) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(sql, params);
            return result.rows;
        }
        finally {
            client.release();
        }
    }
    async run(sql, params = []) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(sql, params);
            return {
                lastInsertRowid: result.rows[0]?.id,
                changes: result.rowCount
            };
        }
        finally {
            client.release();
        }
    }
    async close() {
        await this.pool.end();
    }
}
exports.DatabaseWrapper = DatabaseWrapper;
exports.db = new DatabaseWrapper();
