/**
 * main.js - Main JavaScript functionality for Lost & Found Tracker
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load recent items on the homepage
    if (document.getElementById('recentItems')) {
        loadRecentItems();
    }
    
    // Handle logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Check for notifications
    checkNotifications();
});

/**
 * Load recent items for homepage display
 */
function loadRecentItems() {
    const recentItemsContainer = document.getElementById('recentItems');
    
    // Show loading spinner
    recentItemsContainer.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    // Fetch recent items from the API
    fetch('api/items/recent.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                recentItemsContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-muted">No recent items to display.</p>
                    </div>
                `;
                return;
            }
            
            // Clear container
            recentItemsContainer.innerHTML = '';
            
            // Add items to the container
            data.forEach(item => {
                const itemCard = createItemCard(item);
                recentItemsContainer.appendChild(itemCard);
            });
        })
        .catch(error => {
            console.error('Error fetching recent items:', error);
            recentItemsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Error loading recent items. Please try again later.
                    </div>
                </div>
            `;
        });
}

/**
 * Create HTML for an item card
 * @param {Object} item - The item data
 * @returns {HTMLElement} - The item card element
 */
function createItemCard(item) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    const cardClass = item.type === 'lost' ? 'border-danger' : 'border-success';
    const badgeClass = item.type === 'lost' ? 'bg-danger' : 'bg-success';
    const badgeText = item.type === 'lost' ? 'Lost' : 'Found';
    
    const imageUrl = item.image_url ? item.image_url : 'images/placeholder.jpg';
    
    col.innerHTML = `
        <div class="card h-100 ${cardClass}">
            <div class="position-relative">
                <img src="${imageUrl}" class="card-img-top" alt="${item.title}" style="height: 200px; object-fit: cover;">
                <span class="position-absolute top-0 end-0 badge ${badgeClass} m-2">${badgeText}</span>
            </div>
            <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text small text-muted">
                    <i class="bi bi-geo-alt"></i> ${item.location}<br>
                    <i class="bi bi-calendar"></i> ${formatDate(item.date_lost_found)}
                </p>
                <p class="card-text">${truncateText(item.description, 100)}</p>
            </div>
            <div class="card-footer bg-transparent">
                <a href="item.php?id=${item.item_id}" class="btn btn-sm btn-outline-primary">View Details</a>
            </div>
        </div>
    `;
    
    return col;
}

/**
 * Truncate text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Format date for display
 * @param {string} dateString - Date string from API
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

/**
 * Check for user notifications
 */
function checkNotifications() {
    // Only check notifications if user is logged in
    if (!isLoggedIn()) return;
    
    fetch('api/notifications/check.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.count > 0) {
                // Update notification indicator
                const navbarNav = document.getElementById('navbarNav');
                if (navbarNav) {
                    const notificationItem = document.createElement('li');
                    notificationItem.className = 'nav-item';
                    notificationItem.innerHTML = `
                        <a class="nav-link position-relative" href="notifications.html">
                            Notifications
                            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                ${data.count}
                                <span class="visually-hidden">unread messages</span>
                            </span>
                        </a>
                    `;
                    navbarNav.querySelector('ul').appendChild(notificationItem);
                }
            }
        })
        .catch(error => {
            console.error('Error checking notifications:', error);
        });
}