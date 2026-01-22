// API is now on the same server - no CORS issues!
const API_BASE_URL = '/api';
const MEALDB_API = 'https://www.themealdb.com/api/json/v1/1';

// API Helper Functions
const api = {
    // Auth endpoints
    async signup(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            
            return data;
        } catch (error) {
            console.error('Signup API Error:', error);
            throw error;
        }
    },

    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            return data;
        } catch (error) {
            console.error('Login API Error:', error);
            throw error;
        }
    },

    async getCurrentUser() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Failed to get user');
            }
            
            return data;
        } catch (error) {
            console.error('Get User API Error:', error);
            throw error;
        }
    },

    async addFavorite(meal) {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            
            const response = await fetch(`${API_BASE_URL}/auth/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(meal)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Failed to add favorite');
            }
            
            return data;
        } catch (error) {
            console.error('Add Favorite API Error:', error);
            throw error;
        }
    },

    async removeFavorite(mealId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            
            const response = await fetch(`${API_BASE_URL}/auth/favorites/${mealId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Failed to remove favorite');
            }
            
            return data;
        } catch (error) {
            console.error('Remove Favorite API Error:', error);
            throw error;
        }
    },

    // MealDB API endpoints
    async searchRecipes(query) {
        const response = await fetch(`${MEALDB_API}/search.php?s=${query}`);
        const data = await response.json();
        return data.meals || [];
    },

    async getRecipesByCategory(category) {
        const response = await fetch(`${MEALDB_API}/filter.php?c=${category}`);
        const data = await response.json();
        
        if (!data.meals) return [];

        // Get detailed information for each recipe
        const detailedRecipes = await Promise.all(
            data.meals.slice(0, 12).map(async (meal) => {
                return await this.getRecipeById(meal.idMeal);
            })
        );

        return detailedRecipes;
    },

    async getRecipeById(id) {
        const response = await fetch(`${MEALDB_API}/lookup.php?i=${id}`);
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    },

    async getRandomRecipe() {
        const response = await fetch(`${MEALDB_API}/random.php`);
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    }
};