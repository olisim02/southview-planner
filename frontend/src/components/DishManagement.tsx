import React, { useState, useEffect } from 'react';
import { User, Dish, Ingredient } from '../types';
import { getUsers, createUser, getDishes, createDish, updateDish, deleteDish, createIngredient, updateIngredient, deleteIngredient, addMealHelper, removeMealHelper } from '../api';

interface DishManagementProps {
  onDishesChange: () => void;
}

const DishManagement: React.FC<DishManagementProps> = ({ onDishesChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [newUser, setNewUser] = useState('');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [dishForm, setDishForm] = useState({
    name: '',
    description: '',
    cook_user_id: '',
    day: 'friday' as const,
    meal: 'lunch' as const,
    cooking_time: ''
  });
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    assigned_user_id: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchDishes();
  }, []);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDishes = async () => {
    try {
      const fetchedDishes = await getDishes();
      setDishes(fetchedDishes);
      onDishesChange();
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.trim()) return;

    try {
      await createUser({ name: newUser.trim() });
      setNewUser('');
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name.trim()) return;

    try {
      const dishData = {
        ...dishForm,
        cook_user_id: dishForm.cook_user_id ? parseInt(dishForm.cook_user_id) : undefined
      };
      await createDish(dishData);
      setDishForm({
        name: '',
        description: '',
        cook_user_id: '',
        day: 'friday',
        meal: 'lunch',
        cooking_time: ''
      });
      fetchDishes();
    } catch (error) {
      console.error('Error creating dish:', error);
    }
  };

  const handleDeleteDish = async (dishId: number) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;

    try {
      await deleteDish(dishId);
      fetchDishes();
      if (selectedDish?.id === dishId) {
        setSelectedDish(null);
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDish || !newIngredient.name.trim()) return;

    try {
      const ingredientData = {
        dish_id: selectedDish.id!,
        name: newIngredient.name.trim(),
        quantity: newIngredient.quantity.trim() || undefined,
        assigned_user_id: newIngredient.assigned_user_id ? parseInt(newIngredient.assigned_user_id) : undefined
      };
      await createIngredient(ingredientData);
      setNewIngredient({ name: '', quantity: '', assigned_user_id: '' });
      fetchDishes();
      const updatedDish = dishes.find(d => d.id === selectedDish.id);
      if (updatedDish) setSelectedDish(updatedDish);
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  const handleAddHelper = async (userId: number) => {
    if (!selectedDish) return;

    try {
      await addMealHelper({
        dish_id: selectedDish.id!,
        user_id: userId,
        role: 'helper'
      });
      fetchDishes();
      const updatedDish = dishes.find(d => d.id === selectedDish.id);
      if (updatedDish) setSelectedDish(updatedDish);
    } catch (error) {
      console.error('Error adding helper:', error);
    }
  };

  const handleRemoveHelper = async (helperId: number) => {
    try {
      await removeMealHelper(helperId);
      fetchDishes();
      if (selectedDish) {
        const updatedDish = dishes.find(d => d.id === selectedDish.id);
        if (updatedDish) setSelectedDish(updatedDish);
      }
    } catch (error) {
      console.error('Error removing helper:', error);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      {/* Add User Section */}
      <div className="dish-card" style={{ backgroundColor: '#2c3e50', color: '#ffffff' }}>
        <h3 style={{ marginBottom: '15px', color: '#e67e22' }}>Add New User</h3>
        <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="Enter user name"
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button type="submit" className="nav-button" style={{ padding: '10px 20px' }}>
            Add User
          </button>
        </form>
        <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#bdc3c7' }}>
          <strong>Current users:</strong> {users.map(u => u.name).join(', ') || 'None'}
        </div>
      </div>

      {/* Add Dish Section */}
      <div className="dish-card" style={{ backgroundColor: '#2c3e50', color: '#ffffff' }}>
        <h3 style={{ marginBottom: '15px', color: '#e67e22' }}>Add New Dish</h3>
        <form onSubmit={handleCreateDish} style={{ display: 'grid', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input
              type="text"
              value={dishForm.name}
              onChange={(e) => setDishForm({...dishForm, name: e.target.value})}
              placeholder="Dish name"
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              required
            />
            <select
              value={dishForm.cook_user_id}
              onChange={(e) => setDishForm({...dishForm, cook_user_id: e.target.value})}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Select cook (optional)</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          
          <textarea
            value={dishForm.description}
            onChange={(e) => setDishForm({...dishForm, description: e.target.value})}
            placeholder="Description (optional)"
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <select
              value={dishForm.day}
              onChange={(e) => setDishForm({...dishForm, day: e.target.value as any})}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
            
            <select
              value={dishForm.meal}
              onChange={(e) => setDishForm({...dishForm, meal: e.target.value as any})}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            
            <input
              type="text"
              value={dishForm.cooking_time}
              onChange={(e) => setDishForm({...dishForm, cooking_time: e.target.value})}
              placeholder="Cooking time"
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <button type="submit" className="nav-button">Add Dish</button>
        </form>
      </div>

      {/* Dishes List */}
      <div className="dish-card" style={{ backgroundColor: '#2c3e50', color: '#ffffff' }}>
        <h3 style={{ marginBottom: '15px', color: '#e67e22' }}>Manage Dishes</h3>
        {dishes.length === 0 ? (
          <p style={{ color: '#bdc3c7', textAlign: 'center', padding: '20px' }}>No dishes added yet</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {dishes.map(dish => (
              <div key={dish.id} style={{ 
                padding: '15px', 
                border: '1px solid #4a5f7a', 
                borderRadius: '8px',
                backgroundColor: selectedDish?.id === dish.id ? '#d35400' : '#34495e',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div onClick={() => setSelectedDish(dish)} style={{ cursor: 'pointer', flex: 1 }}>
                    <strong>{dish.name}</strong> - {dish.day} {dish.meal}
                    {dish.cook_user_name && <span style={{ color: '#bdc3c7' }}> (Cook: {dish.cook_user_name})</span>}
                  </div>
                  <button 
                    onClick={() => handleDeleteDish(dish.id!)}
                    style={{ 
                      background: '#e74c3c', 
                      color: 'white', 
                      border: 'none', 
                      padding: '5px 10px', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dish Details */}
      {selectedDish && (
        <div className="dish-card" style={{ backgroundColor: '#2c3e50', color: '#ffffff' }}>
          <h3 style={{ marginBottom: '15px', color: '#e67e22' }}>Manage: {selectedDish.name}</h3>
          
          {/* Add Ingredient */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#34495e', borderRadius: '8px', border: '1px solid #4a5f7a' }}>
            <h4 style={{ marginBottom: '10px', color: '#f39c12' }}>Add Ingredient</h4>
            <form onSubmit={handleAddIngredient} style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                  placeholder="Ingredient name"
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  required
                />
                <input
                  type="text"
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})}
                  placeholder="Quantity"
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <select
                  value={newIngredient.assigned_user_id}
                  onChange={(e) => setNewIngredient({...newIngredient, assigned_user_id: e.target.value})}
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Who's bringing?</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="nav-button" style={{ padding: '8px 16px' }}>
                Add Ingredient
              </button>
            </form>
          </div>

          {/* Ingredients List */}
          {selectedDish.ingredients && selectedDish.ingredients.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#f39c12' }}>Ingredients:</h4>
              <ul style={{ listStyle: 'none' }}>
                {selectedDish.ingredients.map(ingredient => (
                  <li key={ingredient.id} style={{ 
                    padding: '8px', 
                    backgroundColor: '#34495e', 
                    marginBottom: '5px', 
                    borderRadius: '4px',
                    border: '1px solid #4a5f7a',
                    color: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      {ingredient.quantity && `${ingredient.quantity} `}{ingredient.name}
                      {ingredient.assigned_user_name && (
                        <span style={{ color: '#f39c12', fontWeight: 500 }}> (bringing: {ingredient.assigned_user_name})</span>
                      )}
                    </span>
                    <button 
                      onClick={() => deleteIngredient(ingredient.id!).then(fetchDishes)}
                      style={{ 
                        background: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        padding: '3px 8px', 
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add Helper */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#34495e', borderRadius: '8px', border: '1px solid #4a5f7a' }}>
            <h4 style={{ marginBottom: '10px', color: '#f39c12' }}>Add Helper</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {users.filter(user => 
                !selectedDish.helpers?.some(helper => helper.user_id === user.id) &&
                user.id !== selectedDish.cook_user_id
              ).map(user => (
                <button
                  key={user.id}
                  onClick={() => handleAddHelper(user.id!)}
                  className="nav-button"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  Add {user.name}
                </button>
              ))}
            </div>
          </div>

          {/* Helpers List */}
          {selectedDish.helpers && selectedDish.helpers.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '10px', color: '#f39c12' }}>Helpers:</h4>
              <ul style={{ listStyle: 'none' }}>
                {selectedDish.helpers.map(helper => (
                  <li key={helper.id} style={{ 
                    padding: '8px', 
                    backgroundColor: '#34495e', 
                    marginBottom: '5px', 
                    borderRadius: '4px',
                    border: '1px solid #4a5f7a',
                    color: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{helper.user_name}</span>
                    <button 
                      onClick={() => handleRemoveHelper(helper.id!)}
                      style={{ 
                        background: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        padding: '3px 8px', 
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DishManagement;