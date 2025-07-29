# BBQ Weekend Planner

A mobile-friendly web application for planning BBQ events over a weekend (Friday afternoon through Sunday). Users can coordinate who's cooking what dishes, when they'll cook them, what ingredients are needed, and who's helping with each meal.

## Features

- **Menu Display**: View the complete weekend schedule organized by day and meal
- **Dish Management**: Add, edit, and delete dishes with details like cook, cooking time, and description
- **User Management**: Add users to the event
- **Ingredient Tracking**: Add ingredients to dishes and assign who's bringing each item
- **Helper Assignment**: Add helpers to cooking tasks
- **Mobile Responsive**: Optimized for mobile devices so everyone can access it remotely

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express and TypeScript
- **Database**: SQLite
- **Styling**: CSS with mobile-first responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone this repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:3001

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on http://localhost:3000

### Building for Production

1. Build the backend:
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

## Database Schema

The application uses SQLite with the following tables:

- **users**: Store user information
- **dishes**: Store dish details including cook, day, meal, and timing
- **ingredients**: Store ingredients for each dish with optional user assignments
- **meal_helpers**: Store helper assignments for dishes

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

### Dishes
- `GET /api/dishes` - Get all dishes with ingredients and helpers
- `POST /api/dishes` - Create a new dish
- `PUT /api/dishes/:id` - Update a dish
- `DELETE /api/dishes/:id` - Delete a dish

### Ingredients
- `POST /api/ingredients` - Add ingredient to a dish
- `PUT /api/ingredients/:id` - Update an ingredient
- `DELETE /api/ingredients/:id` - Delete an ingredient

### Meal Helpers
- `POST /api/meal-helpers` - Add a helper to a dish
- `DELETE /api/meal-helpers/:id` - Remove a helper from a dish

## Usage

1. **Add Users**: Start by adding all the people who will be participating in the BBQ event
2. **Create Dishes**: Add dishes specifying the day, meal, cook, and other details
3. **Add Ingredients**: For each dish, add the required ingredients and optionally assign who's bringing each item
4. **Add Helpers**: Assign helpers to dishes who want to assist with cooking
5. **View Menu**: Switch to the menu view to see the complete weekend schedule

The menu view shows dishes organized by day (Friday, Saturday, Sunday) and meal (Breakfast, Lunch, Dinner, Snack), making it easy for everyone to see what's planned and when.

## Mobile Access

The application is designed to be mobile-friendly so participants can access it from their phones to:
- Check what dishes are planned
- See what ingredients they're assigned to bring
- View cooking schedules and assignments
- Add themselves as helpers to dishes

## Contributing

Feel free to submit issues and enhancement requests!