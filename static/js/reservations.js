// Reservations Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    loadCartItems();
    initializeFormValidation();
    initializeEventListeners();
});

function initializeDatePicker() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        // Set minimum date to today
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        dateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Set maximum date to 3 months from now
        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);
        dateInput.max = maxDate.toISOString().split('T')[0];
    }
}

function loadCartItems() {
    // Check if user came from menu page with cart items
    const urlParams = new URLSearchParams(window.location.search);
    const fromMenu = urlParams.get('from');
    
    if (fromMenu === 'menu') {
        const cartData = localStorage.getItem('restaurantCart');
        if (cartData) {
            const cart = JSON.parse(cartData);
            displayCartPreview(cart);
        }
    }
}

function displayCartPreview(cart) {
    if (!cart || cart.length === 0) return;
    
    const cartPreview = document.getElementById('cartPreview');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    cartPreview.classList.remove('hidden');
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'flex justify-between items-center py-2 border-b border-orange-100 last:border-b-0';
        cartItem.innerHTML = `
            <div>
                <span class="font-medium">${item.name}</span>
                <span class="text-sm text-gray-600 ml-2">x${item.quantity}</span>
            </div>
            <span class="font-semibold text-orange-600">₹${itemTotal}</span>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `₹${total}`;
}

function initializeFormValidation() {
    const form = document.getElementById('reservationForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    clearFieldError(event);
    
    let isValid = true;
    let errorMessage = '';
    
    // Basic required field validation
    if (!value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Specific field validations
    switch(field.type) {
        case 'email':
            if (value && !isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
            
        case 'tel':
            if (value && !isValidPhone(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
            
        case 'date':
            if (value && !isValidDate(value)) {
                isValid = false;
                errorMessage = 'Please select a valid future date';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('border-red-500', 'ring-red-500');
    field.classList.add('border-gray-300');
    
    // Remove error message
    const errorMsg = field.parentNode.querySelector('.field-error');
    if (errorMsg) {
        errorMsg.remove();
    }
}

function showFieldError(field, message) {
    field.classList.remove('border-gray-300');
    field.classList.add('border-red-500', 'ring-2', 'ring-red-500');
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-500 text-sm mt-1';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${message}`;
    
    field.parentNode.appendChild(errorDiv);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

function isValidDate(dateString) {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate > today;
}

function initializeEventListeners() {
    // Form submission
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Guest number change
    const guestsSelect = document.getElementById('guests');
    if (guestsSelect) {
        guestsSelect.addEventListener('change', handleGuestChange);
    }
    
    // Date change - check availability
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.addEventListener('change', checkDateAvailability);
    }
    
    // Time change - check availability
    const timeSelect = document.getElementById('time');
    if (timeSelect) {
        timeSelect.addEventListener('change', checkTimeAvailability);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    if (validateForm()) {
        submitReservation();
    }
}

function validateForm() {
    const form = document.getElementById('reservationForm');
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    // Check terms acceptance
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
        showNotification('Please accept the Terms & Conditions', 'error');
        isValid = false;
    }
    
    return isValid;
}

function submitReservation() {
    const submitBtn = document.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Processing...';
    submitSpinner.classList.remove('hidden');
    
    // Get form data
    const formData = new FormData(document.getElementById('reservationForm'));
    
    // Add cart data if exists
    const cartData = localStorage.getItem('restaurantCart');
    if (cartData) {
        formData.append('cart_items', cartData);
    }
    
    // Submit to server
    fetch('/reservations', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage();
            resetForm();
            localStorage.removeItem('restaurantCart'); // Clear cart after successful reservation
        } else {
            showNotification(data.message || 'Reservation failed. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Something went wrong. Please try again or call us directly.', 'error');
    })
    .finally(() => {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Reserve Table';
        submitSpinner.classList.add('hidden');
    });
}

function showSuccessMessage() {
    // Create success modal/message
    const successModal = document.createElement('div');
    successModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    successModal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <i class="fas fa-check text-2xl text-green-600"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Reservation Confirmed!</h3>
            <p class="text-gray-600 mb-6">Thank you for your reservation. We'll send you a confirmation email shortly with all the details.</p>
            <div class="space-y-3">
                <button onclick="closeSuccessModal()" class="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition">
                    <i class="fas fa-home mr-2"></i>Back to Home
                </button>
                <button onclick="callRestaurant()" class="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition">
                    <i class="fas fa-phone mr-2"></i>Call Restaurant
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(successModal);
}

function closeSuccessModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
    window.location.href = '/';
}

function resetForm() {
    document.getElementById('reservationForm').reset();
    document.getElementById('cartPreview').classList.add('hidden');
}

function handleGuestChange(event) {
    const guestCount = parseInt(event.target.value);
    
    if (guestCount >= 9) {
        showNotification('For parties of 9 or more, please call us directly to make arrangements.', 'info');
    }
}

function checkDateAvailability(event) {
    const selectedDate = event.target.value;
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDate === today) {
        showNotification('Please select a date at least 1 day in advance.', 'warning');
        event.target.value = '';
        return;
    }
    
    // Check if it's a weekend - might need different time slots
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    updateTimeSlots(dayOfWeek);
}

function updateTimeSlots(dayOfWeek) {
    const timeSelect = document.getElementById('time');
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
    
    // Weekend might have different hours
    if (dayOfWeek === 0) { // Sunday
        // Sunday: 12PM - 9PM
        updateTimeOptions([
            {value: '12:00', text: '12:00 PM'},
            {value: '12:30', text: '12:30 PM'},
            {value: '13:00', text: '1:00 PM'},
            {value: '13:30', text: '1:30 PM'},
            {value: '14:00', text: '2:00 PM'},
            {value: '19:00', text: '7:00 PM'},
            {value: '19:30', text: '7:30 PM'},
            {value: '20:00', text: '8:00 PM'},
            {value: '20:30', text: '8:30 PM'},
            {value: '21:00', text: '9:00 PM'}
        ]);
    }
}

function updateTimeOptions(options) {
    const timeSelect = document.getElementById('time');
    timeSelect.innerHTML = '<option value="">Select Time</option>';
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        timeSelect.appendChild(optionElement);
    });
}

function checkTimeAvailability() {
    // Could implement real-time availability checking here
    // For now, just a placeholder
}

function callRestaurant() {
    const phoneNumber = '+919876543210';
    window.open(`tel:${phoneNumber}`, '_self');
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
            <div>
                <p class="font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 flex-shrink-0">
                <i class="fas fa-times opacity-70 hover:opacity-100"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Auto-fill form for testing (development only)
function autoFillForm() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        document.getElementById('name').value = 'John Doe';
        document.getElementById('email').value = 'john@example.com';
        document.getElementById('phone').value = '+91 98765 43210';
        
        // Set date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('date').value = tomorrow.toISOString().split('T')[0];
        
        document.getElementById('time').value = '19:00';
        document.getElementById('guests').value = '2';
        document.getElementById('occasion').value = 'date';
        document.getElementById('message').value = 'Looking forward to a great dining experience!';
    }
}

// Advanced features
function getLocationAndSuggestTable() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            // Could use this to calculate distance and suggest pickup/delivery options
            console.log('User location:', position.coords.latitude, position.coords.longitude);
        });
    }
}

function suggestAlternativeDate() {
    const dateInput = document.getElementById('date');
    const currentDate = new Date(dateInput.value);
    
    // Suggest next available date (mock implementation)
    const alternatives = [];
    for (let i = 1; i <= 7; i++) {
        const altDate = new Date(currentDate);
        altDate.setDate(altDate.getDate() + i);
        alternatives.push(altDate.toISOString().split('T')[0]);
    }
    
    return alternatives;
}

// Export functions for global access
window.reservationFunctions = {
    callRestaurant,
    autoFillForm,
    closeSuccessModal,
    showNotification
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
    // Add keyboard shortcut for auto-fill
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            autoFillForm();
        }
    });
}