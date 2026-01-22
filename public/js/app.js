let currentCategory = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    attachEventListeners();
});

function initializeApp() {
    // Display user name
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.name;
    }
}

function attachEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Search
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Random recipe
    document.getElementById('randomBtn').addEventListener('click', handleRandomRecipe);
    
    // Category selection
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            handleCategorySelection(category);
        });
    });
    
    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
        showCategorySection();
    });
    
    // Modal close
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

async function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (!searchTerm) {
        showError('Please enter a search term');
        return;
    }
    
    showLoading();
    hideCategorySection();
    
    try {
        const recipes = await api.searchRecipes(searchTerm);
        displayRecipes(recipes, `Search results for "${searchTerm}"`);
    } catch (error) {
        showError('Failed to search recipes. Please try again.');
    } finally {
        hideLoading();
    }
}

async function handleCategorySelection(category) {
    currentCategory = category;
    showLoading();
    hideCategorySection();
    
    try {
        const recipes = await api.getRecipesByCategory(category);
        displayRecipes(recipes, `${category} Recipes`);
        document.getElementById('backBtn').style.display = 'inline-block';
    } catch (error) {
        showError('Failed to load recipes. Please try again.');
    } finally {
        hideLoading();
    }
}

async function handleRandomRecipe() {
    showLoading();
    hideCategorySection();
    
    try {
        const recipe = await api.getRandomRecipe();
        displayRecipes([recipe], 'Random Recipe');
    } catch (error) {
        showError('Failed to load random recipe. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayRecipes(recipes, title) {
    const recipesSection = document.getElementById('recipesSection');
    const recipesGrid = document.getElementById('recipesGrid');
    const recipesTitle = document.getElementById('recipesTitle');
    
    recipesTitle.textContent = title;
    recipesGrid.innerHTML = '';
    
    if (!recipes || recipes.length === 0) {
        recipesGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #666;">No recipes found. Try a different search.</p>';
        recipesSection.style.display = 'block';
        return;
    }
    
    recipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        recipesGrid.appendChild(card);
    });
    
    recipesSection.style.display = 'block';
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const youtubeUrl = recipe.strYoutube || '#';
    
    card.innerHTML = `
        <div class="recipe-image">
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <div class="recipe-category">${recipe.strCategory}</div>
            <button class="btn-favorite" onclick="toggleFavorite('${recipe.idMeal}', '${recipe.strMeal.replace(/'/g, "\\'")}', '${recipe.strMealThumb}', event)" title="Add to favorites">
                ❤️
            </button>
        </div>
        <div class="recipe-content">
            <h3 class="recipe-title">${recipe.strMeal}</h3>
            <p class="recipe-area">📍 ${recipe.strArea}</p>
            <div class="recipe-actions">
                ${youtubeUrl !== '#' ? `
                    <a href="${youtubeUrl}" target="_blank" class="btn-youtube">
                        <span>▶</span> Tutorial
                    </a>
                ` : ''}
                <button class="btn btn-details" onclick="showRecipeDetails('${recipe.idMeal}')">
                    View Recipe
                </button>
            </div>
        </div>
    `;
    
    return card;
}

async function showRecipeDetails(mealId) {
    showLoading();
    
    try {
        const recipe = await api.getRecipeById(mealId);
        
        if (!recipe) {
            showError('Recipe not found');
            return;
        }
        
        const modal = document.getElementById('recipeModal');
        const detailsContainer = document.getElementById('recipeDetails');
        
        // Get ingredients
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure} ${ingredient}`);
            }
        }
        
        detailsContainer.innerHTML = `
            <div class="recipe-detail-header">
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                <div class="recipe-detail-overlay">
                    <h2 class="recipe-detail-title">${recipe.strMeal}</h2>
                </div>
            </div>
            <div class="recipe-detail-body">
                <div class="recipe-detail-meta">
                    <div class="meta-item">
                        <span class="meta-label">Category:</span> ${recipe.strCategory}
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Cuisine:</span> ${recipe.strArea}
                    </div>
                    ${recipe.strYoutube ? `
                        <div class="meta-item">
                            <a href="${recipe.strYoutube}" target="_blank" class="btn-youtube" style="display: inline-flex;">
                                <span>▶</span> Watch Tutorial
                            </a>
                        </div>
                    ` : ''}
                </div>
                
                <div class="recipe-detail-section">
                    <h3>Ingredients</h3>
                    <div class="ingredients-list">
                        ${ingredients.map(ing => `<div class="ingredient-item">${ing}</div>`).join('')}
                    </div>
                </div>
                
                <div class="recipe-detail-section">
                    <h3>Instructions</h3>
                    <p class="instructions">${recipe.strInstructions}</p>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        showError('Failed to load recipe details');
    } finally {
        hideLoading();
    }
}

function closeModal() {
    const modal = document.getElementById('recipeModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function hideCategorySection() {
    document.getElementById('categorySection').style.display = 'none';
}

function showCategorySection() {
    document.getElementById('categorySection').style.display = 'block';
    document.getElementById('recipesSection').style.display = 'none';
    document.getElementById('backBtn').style.display = 'none';
    document.getElementById('searchInput').value = '';
    currentCategory = null;
}

// Toggle Favorite
async function toggleFavorite(mealId, mealName, mealThumb, event) {
    event.stopPropagation(); // Prevent card click
    
    const button = event.target;
    
    try {
        // Check if already favorited (you can enhance this with actual state tracking)
        const result = await api.addFavorite({
            mealId: mealId,
            mealName: mealName,
            mealThumb: mealThumb
        });
        
        // Visual feedback
        button.textContent = '💚';
        button.style.transform = 'scale(1.3)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 300);
        
        showSuccess('Added to favorites!');
    } catch (error) {
        if (error.message.includes('already in favorites')) {
            showError('Already in your favorites!');
        } else {
            showError('Failed to add to favorites');
        }
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}