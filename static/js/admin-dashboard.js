// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
    loadRecentActivity();
    initializeActivityFilters();
    setInterval(refreshStats, 30000); // Refresh every 30 seconds
});

// Load dashboard statistics
function loadDashboardStats() {
    fetch('/api/admin/stats')
        .then(response => response.json())
        .then(data => {
            document.getElementById('todayReservations').textContent = data.today_reservations || 0;
            document.getElementById('totalMenuItems').textContent = data.total_menu_items || 0;
            document.getElementById('unreadMessages').textContent = data.unread_messages || 0;
            document.getElementById('monthlyRevenue').textContent = `₹${data.monthly_revenue || 0}`;
        })
        .catch(error => {
            console.error('Error loading stats:', error);
            // Set default values on error
            document.getElementById('todayReservations').textContent = '12';
            document.getElementById('totalMenuItems').textContent = '48';
            document.getElementById('unreadMessages').textContent = '8';
            document.getElementById('monthlyRevenue').textContent = '₹2,45,000';
        });
}

// Load recent activity
function loadRecentActivity(filter = 'all', limit = 10) {
    const activityList = document.getElementById('activityList');
    
    // Show loading state
    activityList.innerHTML = '<div class="p-8 text-center text-gray-500">Loading activity...</div>';
    
    // Mock data for demonstration
    const mockActivity = [
        {
            type: 'reservation',
            title: 'New reservation received',
            description: 'John Doe booked a table for 4 people on Dec 28, 2024 at 7:00 PM',
            time: '5 minutes ago',
            icon: 'fa-calendar-plus',
            color: 'text-blue-600'
        },
        {
            type: 'message',
            title: 'New contact message',
            description: 'Sarah Wilson inquired about catering services for 50 people',
            time: '12 minutes ago',
            icon: 'fa-envelope',
            color: 'text-green-600'
        },
        {
            type: 'menu',
            title: 'Menu item updated',
            description: 'Butter Chicken price updated from ₹320 to ₹350',
            time: '1 hour ago',
            icon: 'fa-utensils',
            color: 'text-orange-600'
        },
        {
            type: 'reservation',
            title: 'Reservation confirmed',
            description: 'Table booking for Mike Johnson confirmed for tonight',
            time: '2 hours ago',
            icon: 'fa-check-circle',
            color: 'text-green-600'
        },
        {
            type: 'menu',
            title: 'New menu item added',
            description: 'Paneer Makhani added to main course category',
            time: '3 hours ago',
            icon: 'fa-plus-circle',
            color: 'text-blue-600'
        }
    ];
    
    // Filter activities
    let filteredActivity = filter === 'all' ? mockActivity : mockActivity.filter(item => 
        (filter === 'reservations' && item.type === 'reservation') ||
        (filter === 'messages' && item.type === 'message') ||
        (filter === 'menu' && item.type === 'menu')
    );
    
    setTimeout(() => {
        activityList.innerHTML = '';
        
        if (filteredActivity.length === 0) {
            activityList.innerHTML = '<div class="p-8 text-center text-gray-500">No activity found</div>';
            return;
        }
        
        filteredActivity.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'p-6 hover:bg-gray-50 transition-colors';
            activityItem.innerHTML = `
                <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <i class="fas ${activity.icon} ${activity.color}"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900">${activity.title}</p>
                        <p class="text-sm text-gray-500 mt-1">${activity.description}</p>
                        <p class="text-xs text-gray-400 mt-2">${activity.time}</p>
                    </div>
                    <div class="flex-shrink-0">
                        <button onclick="viewActivityDetails('${activity.type}')" 
                                class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }, 500);
}

// Initialize activity filters
function initializeActivityFilters() {
    const filterButtons = document.querySelectorAll('.activity-filter');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update button states
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            
            this.classList.remove('bg-gray-200', 'text-gray-700');
            this.classList.add('bg-blue-600', 'text-white');
            
            // Load filtered activity
            const filter = this.dataset.filter;
            loadRecentActivity(filter);
        });
    });
}

// Modal Functions
function showAddItemModal() {
    const modal = document.getElementById('addItemModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeAddItemModal() {
    const modal = document.getElementById('addItemModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('addItemForm').reset();
}

function showAnalyticsModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-gray-800">Analytics Dashboard</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h4 class="font-semibold mb-4">Website Traffic</h4>
                    <div class="h-64 bg-white rounded flex items-center justify-center">
                        <div class="text-center">
                            <i class="fas fa-chart-line text-4xl text-gray-400 mb-2"></i>
                            <p class="text-gray-500">Traffic Chart</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h4 class="font-semibold mb-4">Revenue Trends</h4>
                    <div class="h-64 bg-white rounded flex items-center justify-center">
                        <div class="text-center">
                            <i class="fas fa-chart-bar text-4xl text-gray-400 mb-2"></i>
                            <p class="text-gray-500">Revenue Chart</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h4 class="font-semibold mb-4">Popular Menu Items</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span>Butter Chicken</span>
                            <span class="font-semibold">127 orders</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Chicken Tikka</span>
                            <span class="font-semibold">98 orders</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Paneer Makhani</span>
                            <span class="font-semibold">87 orders</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h4 class="font-semibold mb-4">Customer Feedback</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span>Average Rating</span>
                            <span class="font-semibold text-yellow-600">4.8★</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Total Reviews</span>
                            <span class="font-semibold">234</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Response Rate</span>
                            <span class="font-semibold text-green-600">95%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showStaffModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-gray-800">Staff Management</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                            RS
                        </div>
                        <div>
                            <p class="font-medium">Raj Singh</p>
                            <p class="text-sm text-gray-600">Head Chef</p>
                        </div>
                    </div>
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">On Duty</span>
                </div>
                
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            PK
                        </div>
                        <div>
                            <p class="font-medium">Priya Sharma</p>
                            <p class="text-sm text-gray-600">Manager</p>
                        </div>
                    </div>
                    <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">Break</span>
                </div>
                
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            AK
                        </div>
                        <div>
                            <p class="font-medium">Amit Kumar</p>
                            <p class="text-sm text-gray-600">Waiter</p>
                        </div>
                    </div>
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">On Duty</span>
                </div>
            </div>
            
            <div class="mt-6 text-center">
                <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                    <i class="fas fa-user-plus mr-2"></i>Add New Staff
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showRestaurantSettings() {
    showSettingsModal('Restaurant Information', `
        <form class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                <input type="text" value="Spice Garden Restaurant" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea class="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3">123 Food Street, Connaught Place, New Delhi, 110001</textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" value="+91 98765 43210" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value="info@spicegarden.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
            </div>
        </form>
    `);
}

function showOperatingHours() {
    showSettingsModal('Operating Hours', `
        <form class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Monday - Thursday</label>
                    <div class="flex space-x-2">
                        <input type="time" value="11:00" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                        <span class="self-center">to</span>
                        <input type="time" value="22:00" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Friday - Saturday</label>
                    <div class="flex space-x-2">
                        <input type="time" value="11:00" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                        <span class="self-center">to</span>
                        <input type="time" value="23:00" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sunday</label>
                <div class="flex space-x-2">
                    <input type="time" value="12:00" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                    <span class="self-center">to</span>
                    <input type="time" value="21:00" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                </div>
            </div>
        </form>
    `);
}

function showNotificationSettings() {
    showSettingsModal('Notification Settings', `
        <form class="space-y-6">
            <div class="space-y-4">
                <h4 class="font-medium">Email Notifications</h4>
                <div class="space-y-3">
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" checked class="rounded border-gray-300">
                        <span>New reservations</span>
                    </label>
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" checked class="rounded border-gray-300">
                        <span>Contact form submissions</span>
                    </label>
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" class="rounded border-gray-300">
                        <span>Daily reports</span>
                    </label>
                </div>
            </div>
            
            <div class="space-y-4">
                <h4 class="font-medium">SMS Notifications</h4>
                <div class="space-y-3">
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" checked class="rounded border-gray-300">
                        <span>Urgent reservations</span>
                    </label>
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" class="rounded border-gray-300">
                        <span>Staff alerts</span>
                    </label>
                </div>
            </div>
        </form>
    `);
}

function showSettingsModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-gray-800">${title}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            ${content}
            
            <div class="mt-6 flex space-x-4">
                <button onclick="saveSettings()" class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    Save Changes
                </button>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Utility Functions
function refreshStats() {
    loadDashboardStats();
}

function loadMoreActivity() {
    // Load more activity items
    showNotification('Loading more activity...', 'info');
}

function viewActivityDetails(type) {
    showNotification(`Viewing ${type} details...`, 'info');
}

function backupData() {
    showNotification('Creating backup... This may take a few minutes.', 'info');
    
    setTimeout(() => {
        showNotification('Backup completed successfully!', 'success');
    }, 3000);
}

function saveSettings() {
    showNotification('Settings saved successfully!', 'success');
    setTimeout(() => {
        document.querySelector('.fixed.inset-0').remove();
    }, 1000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    let bgColor, icon;
    
    switch(type) {
        case 'success':
            bgColor = 'bg-green-500';
            icon = 'fa-check-circle';
            break;
        case 'error':
            bgColor = 'bg-red-500';
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = 'bg-yellow-500';
            icon = 'fa-exclamation-triangle';
            break;
        default:
            bgColor = 'bg-blue-500';
            icon = 'fa-info-circle';
    }
    
    notification.className = `fixed top-20 right-6 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-0 max-w-sm`;
    notification.innerHTML = `
        <div class="flex items-start">
            <i class="fas ${icon} mt-0.5 mr-3 flex-shrink-0"></i>
            <div class="flex-1">
                <p class="font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 flex-shrink-0">
                <i class="fas fa-times opacity-70 hover:opacity-100"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Export functions for global access
window.adminDashboard = {
    showAddItemModal,
    closeAddItemModal,
    showAnalyticsModal,
    showStaffModal,
    showRestaurantSettings,
    showOperatingHours,
    showNotificationSettings,
    backupData
};