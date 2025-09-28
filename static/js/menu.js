// Menu Page JavaScript
let cart = [];
let allItems = [];

// Initialize menu items
document.addEventListener('DOMContentLoaded', function() {
    allItems = Array.from(document.querySelectorAll('.menu-item'));
    updateCartDisplay();
    
    // Initialize event listeners
    initializeEventListeners();
});

function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    // Add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart-btn')) {
            const button = e.target.closest('.add-to-cart-btn');
            const itemId = parseInt(button.dataset.itemId);
            const itemName = button.dataset.itemName;
            const itemPrice = parseFloat(button.dataset.itemPrice);
            
            addToCart(itemId, itemName, itemPrice);
        }
        
        if (e.target.closest('.quick-order-btn')) {
            const button = e.target.closest('.quick-order-btn');
            const itemId = parseInt(button.dataset.itemId);
            
            quickOrder(itemId);
        }
    });
}

// Category Filter
function filterCategory(category) {
    const items = document.querySelectorAll('.menu-item');
    let visibleCount = 0;
    
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Update active category button
    updateActiveCategoryButton(event.target);
    
    checkNoResults(visibleCount);
}

function updateActiveCategoryButton(activeButton) {
    // Remove active class from all buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-orange-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    // Add active class to clicked button
    activeButton.classList.remove('bg-gray-200', 'text-gray-700');
    activeButton.classList.add('bg-orange-600', 'text-white');
}

// Search Functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.menu-item');
    let visibleCount = 0;
    
    items.forEach(item => {
        const name = item.dataset.name;
        const description = item.querySelector('p').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || description.includes(searchTerm)) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    checkNoResults(visibleCount);
}

// Sort Functionality
function handleSort(e) {
    const sortBy = e.target.value;
    const container = document.getElementById('menuGrid');
    const items = Array.from(document.querySelectorAll('.menu-item'));
    
    items.sort((a, b) => {
        switch(sortBy) {
            case 'name':
                return a.dataset.name.localeCompare(b.dataset.name);
            case 'price-low':
                return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
            case 'price-high':
                return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
            default:
                return 0;
        }
    });
    
    // Re-append sorted items
    items.forEach(item => container.appendChild(item));
}

// Cart Functions
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    
    updateCartDisplay();
    showCartNotification(name);
    
    // Add visual feedback to button
    addButtonFeedback(event.target);
}

function addButtonFeedback(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartDisplay();
}

function updateCartQuantity(id, newQuantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(id);
        } else {
            item.quantity = newQuantity;
        }
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartSummary = document.getElementById('cartSummary');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartSummary.classList.add('hidden');
        return;
    }
    
    cartSummary.classList.remove('hidden');
    
    // Clear previous items
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'flex justify-between items-center text-sm py-1';
        cartItem.innerHTML = `
            <div class="flex-1">
                <span class="font-medium">${item.name}</span>
                <div class="flex items-center mt-1 space-x-2">
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" 
                            class="w-6 h-6 bg-gray-200 rounded-full text-xs hover:bg-gray-300">-</button>
                    <span class="text-xs font-semibold">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" 
                            class="w-6 h-6 bg-gray-200 rounded-full text-xs hover:bg-gray-300">+</button>
                </div>
            </div>
            <div class="text-right ml-2">
                <div class="font-semibold">₹${itemTotal}</div>
                <button onclick="removeFromCart(${item.id})" 
                        class="text-red-500 text-xs hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `₹${total}`;
    
    // Update cart badge if exists
    updateCartBadge();
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge');
    
    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    showNotification('Cart cleared!', 'info');
}

function closeCart() {
    document.getElementById('cartSummary').classList.add('hidden');
}

function quickOrder(itemId) {
    // Get item details
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    const itemName = itemElement ? itemElement.querySelector('h3').textContent : 'Item';
    
    // Create WhatsApp message
    const phoneNumber = '919354328799'; // Replace with actual number
    const message = `Hi! I'd like to order ${itemName} from Spice Garden Restaurant.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
}

function proceedToOrder() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    // Save cart to localStorage for reservation page
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
    
    // Redirect to reservations
    window.location.href = '/reservations?from=menu';
}

// Notification Functions
function showCartNotification(itemName) {
    showNotification(`${itemName} added to cart!`, 'success');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    const icon = type === 'success' ? 'fa-check' : type === 'warning' ? 'fa-exclamation' : 'fa-info';
    
    notification.className = `fixed top-20 right-6 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-0`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icon} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Utility Functions
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('menuGrid');
    
    if (spinner) spinner.classList.remove('hidden');
    if (grid) grid.style.opacity = '0.5';
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('menuGrid');
    
    if (spinner) spinner.classList.add('hidden');
    if (grid) grid.style.opacity = '1';
}

function checkNoResults(visibleCount) {
    const noResults = document.getElementById('noResults');
    const menuGrid = document.getElementById('menuGrid');
    
    if (visibleCount === 0) {
        if (noResults) noResults.classList.remove('hidden');
        if (menuGrid) menuGrid.classList.add('opacity-50');
    } else {
        if (noResults) noResults.classList.add('hidden');
        if (menuGrid) menuGrid.classList.remove('opacity-50');
    }
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'name';
    
    // Reset category to 'all'
    filterCategory('all');
    
    // Show all items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = 'block';
    });
    
    hideNoResults();
}

function resetSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = 'block';
    });
    
    hideNoResults();
}

function hideNoResults() {
    const noResults = document.getElementById('noResults');
    if (noResults) noResults.classList.add('hidden');
}

// Advanced Features
function toggleFavorite(itemId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(itemId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showNotification('Removed from favorites', 'info');
    } else {
        favorites.push(itemId);
        showNotification('Added to favorites', 'success');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    document.querySelectorAll('[data-favorite-btn]').forEach(btn => {
        const itemId = parseInt(btn.dataset.itemId);
        const icon = btn.querySelector('i');
        
        if (favorites.includes(itemId)) {
            icon.className = 'fas fa-heart text-red-500';
        } else {
            icon.className = 'far fa-heart text-gray-400';
        }
    });
}

// Initialize favorites on load
document.addEventListener('DOMContentLoaded', function() {
    updateFavoriteButtons();
});

// Export functions for global access
window.menuFunctions = {
    filterCategory,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    quickOrder,
    proceedToOrder,
    closeCart,
    clearCart,
    resetFilters,
    resetSearch,
    toggleFavorite
};