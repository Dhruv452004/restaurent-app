// Contact Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeFormValidation();
    initializeCharacterCounter();
    initializePriorityRadios();
    initializeEventListeners();
});

function initializeFormValidation() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function initializeCharacterCounter() {
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    
    messageTextarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCount.textContent = currentLength;
        
        // Change color based on character count
        if (currentLength > 400) {
            charCount.className = 'text-red-500 font-semibold';
        } else if (currentLength > 300) {
            charCount.className = 'text-yellow-500 font-semibold';
        } else {
            charCount.className = '';
        }
        
        // Limit to 500 characters
        if (currentLength > 500) {
            this.value = this.value.substring(0, 500);
            charCount.textContent = '500';
        }
    });
}

function initializePriorityRadios() {
    const radioLabels = document.querySelectorAll('input[name="priority"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove selected state from all labels
            document.querySelectorAll('input[name="priority"]').forEach(r => {
                const label = r.closest('label');
                label.classList.remove('border-teal-500', 'bg-teal-50');
                label.classList.add('border-gray-300');
            });
            
            // Add selected state to current label
            const label = this.closest('label');
            label.classList.remove('border-gray-300');
            label.classList.add('border-teal-500', 'bg-teal-50');
        });
    });
}

function initializeEventListeners() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Subject change handler
    const subjectSelect = document.getElementById('subject');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', handleSubjectChange);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    if (validateForm()) {
        submitContactForm();
    }
}

function validateForm() {
    const form = document.getElementById('contactForm');
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    clearFieldError(event);
    
    let isValid = true;
    let errorMessage = '';
    
    if (!value && field.hasAttribute('required')) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
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
    }
    
    // Message length validation
    if (field.id === 'message' && value.length < 10) {
        isValid = false;
        errorMessage = 'Please provide more details (minimum 10 characters)';
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
    
    const errorMsg = field.parentNode.querySelector('.field-error');
    if (errorMsg) {
        errorMsg.remove();
    }
}

function showFieldError(field, message) {
    field.classList.remove('border-gray-300');
    field.classList.add('border-red-500', 'ring-2', 'ring-red-500');
    
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

function handleSubjectChange(event) {
    const subject = event.target.value;
    const messageField = document.getElementById('message');
    
    // Pre-fill message based on subject
    const templates = {
        'reservation': 'I would like to inquire about making a reservation...',
        'catering': 'I am interested in your catering services for...',
        'private_event': 'I would like to book a private event for...',
        'feedback': 'I recently dined at your restaurant and wanted to share my feedback...',
        'complaint': 'I had an issue during my recent visit that I would like to address...',
        'job': 'I am interested in career opportunities at Spice Garden Restaurant...',
        'media': 'I am contacting you regarding a media inquiry about...'
    };
    
    if (templates[subject] && !messageField.value) {
        messageField.value = templates[subject];
        messageField.focus();
        messageField.setSelectionRange(messageField.value.length, messageField.value.length);
    }
}

function submitContactForm() {
    const submitBtn = document.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';
    submitSpinner.classList.remove('hidden');
    
    // Get form data
    const formData = new FormData(document.getElementById('contactForm'));
    
    // Add timestamp and user agent for tracking
    formData.append('timestamp', new Date().toISOString());
    formData.append('user_agent', navigator.userAgent);
    
    fetch('/contact', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage();
            resetForm();
        } else {
            showNotification(data.message || 'Failed to send message. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Something went wrong. Please try again or contact us directly.', 'error');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitText.textContent = 'Send Message';
        submitSpinner.classList.add('hidden');
    });
}

function showSuccessMessage() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <i class="fas fa-check text-2xl text-green-600"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Message Sent!</h3>
            <p class="text-gray-600 mb-6">Thank you for contacting us. We'll get back to you within 24 hours.</p>
            <div class="space-y-3">
                <button onclick="closeSuccessModal()" class="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition">
                    <i class="fas fa-home mr-2"></i>Back to Home
                </button>
                <div class="flex space-x-3">
                    <button onclick="callRestaurant()" class="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition">
                        <i class="fas fa-phone mr-1"></i>Call
                    </button>
                    <button onclick="sendWhatsApp()" class="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition">
                        <i class="fab fa-whatsapp mr-1"></i>WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeSuccessModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

function resetForm() {
    document.getElementById('contactForm').reset();
    document.getElementById('charCount').textContent = '0';
    
    // Reset priority radio styles
    document.querySelectorAll('input[name="priority"]').forEach(radio => {
        const label = radio.closest('label');
        label.classList.remove('border-teal-500', 'bg-teal-50');
        label.classList.add('border-gray-300');
    });
    
    // Select first priority by default
    document.querySelector('input[name="priority"][value="low"]').checked = true;
    const firstLabel = document.querySelector('input[name="priority"][value="low"]').closest('label');
    firstLabel.classList.add('border-teal-500', 'bg-teal-50');
}

function clearMessage() {
    document.getElementById('message').value = '';
    document.getElementById('charCount').textContent = '0';
}

// Quick contact functions
function callRestaurant() {
    window.open('tel:+919876543210', '_self');
}

function sendWhatsApp() {
    const phoneNumber = '919876543210';
    const message = 'Hi! I have a question about Spice Garden Restaurant.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function sendEmail() {
    const subject = 'Inquiry from Website';
    const body = 'Hello,\n\nI have a question about Spice Garden Restaurant.\n\nBest regards';
    const emailUrl = `mailto:info@spicegarden.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_self');
}

function getDirections() {
    const address = '123 Food Street, Connaught Place, New Delhi, 110001';
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, '_blank');
}

// FAQ System
function showFAQ(category) {
    const modal = document.getElementById('faqModal');
    const title = document.getElementById('faqTitle');
    const content = document.getElementById('faqContent');
    
    const faqData = {
        reservation: {
            title: 'Reservation Help',
            items: [
                {
                    question: 'How far in advance can I make a reservation?',
                    answer: 'You can make reservations up to 3 months in advance. We recommend booking at least 1 day ahead for regular dining and 1 week ahead for special occasions.'
                },
                {
                    question: 'Can I modify or cancel my reservation?',
                    answer: 'Yes, you can modify or cancel your reservation up to 4 hours before your scheduled time. Please call us or use the confirmation link in your email.'
                },
                {
                    question: 'Do you charge for reservations?',
                    answer: 'No, we do not charge any fees for making reservations. However, we do have a cancellation policy for large groups (8+ people).'
                },
                {
                    question: 'What if I\'m running late?',
                    answer: 'Please call us if you\'re running more than 15 minutes late. We hold tables for 15 minutes past the reservation time.'
                }
            ]
        },
        menu: {
            title: 'Menu Questions',
            items: [
                {
                    question: 'Do you have vegetarian options?',
                    answer: 'Yes! We have an extensive vegetarian menu with over 25 dishes including traditional dal, paneer preparations, and seasonal vegetables.'
                },
                {
                    question: 'Can you accommodate food allergies?',
                    answer: 'Absolutely. Please inform us about any allergies when making your reservation or ask your server. We can modify most dishes to accommodate common allergies.'
                },
                {
                    question: 'Do you offer vegan options?',
                    answer: 'Yes, we have dedicated vegan dishes and can modify many vegetarian items to be vegan-friendly by using plant-based alternatives.'
                },
                {
                    question: 'How spicy is your food?',
                    answer: 'We offer different spice levels for most dishes. Our menu indicates spice levels, and you can always request mild, medium, or hot preparation.'
                }
            ]
        },
        catering: {
            title: 'Catering Services',
            items: [
                {
                    question: 'Do you provide catering services?',
                    answer: 'Yes, we offer full catering services for events of 20+ people. We provide setup, serving staff, and cleanup for an additional fee.'
                },
                {
                    question: 'What\'s the minimum order for catering?',
                    answer: 'Our minimum catering order is for 20 people, with a minimum value of ₹15,000 including taxes and service charges.'
                },
                {
                    question: 'How far in advance should I book catering?',
                    answer: 'We recommend booking at least 1 week in advance for small events (20-50 people) and 2-3 weeks for larger events.'
                },
                {
                    question: 'Do you provide equipment and staff?',
                    answer: 'Yes, we provide all necessary serving equipment, chafing dishes, and experienced staff for setup and service.'
                }
            ]
        },
        dietary: {
            title: 'Dietary Options',
            items: [
                {
                    question: 'Gluten-free options?',
                    answer: 'We have several naturally gluten-free dishes and can modify others. Please inform us about celiac disease for proper precautions.'
                },
                {
                    question: 'Low-sodium dishes?',
                    answer: 'Many of our dishes can be prepared with reduced sodium. Our chefs can adjust seasoning based on your dietary requirements.'
                },
                {
                    question: 'Diabetic-friendly options?',
                    answer: 'We offer sugar-free desserts and can modify preparations to be diabetic-friendly. Our staff can guide you through suitable options.'
                },
                {
                    question: 'Keto/Low-carb options?',
                    answer: 'Yes, we have several keto-friendly dishes focusing on proteins and vegetables. Our tandoor items and grilled options work well for keto diets.'
                }
            ]
        }
    };
    
    const data = faqData[category];
    if (data) {
        title.textContent = data.title;
        
        content.innerHTML = '';
        data.items.forEach(item => {
            const faqItem = document.createElement('div');
            faqItem.className = 'border-b border-gray-200 pb-4 last:border-b-0';
            faqItem.innerHTML = `
                <h4 class="font-semibold text-gray-800 mb-2">${item.question}</h4>
                <p class="text-gray-600">${item.answer}</p>
            `;
            content.appendChild(faqItem);
        });
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeFAQ() {
    const modal = document.getElementById('faqModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Notification system
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

// Analytics and tracking
function trackFormInteraction(action, element) {
    // Track user interactions for analytics
    const data = {
        action: action,
        element: element,
        timestamp: new Date().toISOString(),
        page: 'contact'
    };
    
    // Send to analytics service
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': 'Contact Form',
            'event_label': element
        });
    }
}

// Form auto-save for better UX
let formAutoSaveTimer;
function autoSaveForm() {
    clearTimeout(formAutoSaveTimer);
    formAutoSaveTimer = setTimeout(() => {
        const formData = new FormData(document.getElementById('contactForm'));
        const formObject = {};
        
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        localStorage.setItem('contactFormDraft', JSON.stringify(formObject));
    }, 2000);
}

// Load saved form data
function loadSavedFormData() {
    const savedData = localStorage.getItem('contactFormDraft');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            Object.keys(formData).forEach(key => {
                const field = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
                if (field && formData[key]) {
                    if (field.type === 'checkbox' || field.type === 'radio') {
                        field.checked = formData[key] === 'on' || formData[key] === field.value;
                    } else {
                        field.value = formData[key];
                    }
                }
            });
            
            // Update character counter if message was loaded
            const messageField = document.getElementById('message');
            if (messageField.value) {
                document.getElementById('charCount').textContent = messageField.value.length;
            }
            
            showNotification('Draft restored from previous session', 'info');
        } catch (e) {
            console.error('Error loading saved form data:', e);
        }
    }
}

// Clear saved form data after successful submission
function clearSavedFormData() {
    localStorage.removeItem('contactFormDraft');
}

// Initialize auto-save
document.addEventListener('DOMContentLoaded', function() {
    loadSavedFormData();
    
    // Add auto-save listeners
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('input', autoSaveForm);
        form.addEventListener('change', autoSaveForm);
    }
});

// Export functions for global access
window.contactFunctions = {
    callRestaurant,
    sendWhatsApp,
    sendEmail,
    getDirections,
    showFAQ,
    closeFAQ,
    closeSuccessModal,
    resetForm,
    clearMessage
};