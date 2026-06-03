// Customer Menu Page Functionality

let cart = [];
let selectedCategory = 'all';
let allMenuItems = [];

const CURRENCY = '₹';
const TAX_RATE = 0.05;

// DOM Elements
const menuGrid = document.getElementById('menuGrid');
const categoryBtns = document.querySelectorAll('.category-btn');
const cartBtn = document.querySelector('.cart-btn');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const placeOrderBtn = document.querySelector('.place-order-btn');
const cartCloseBtn = document.querySelector('.close-cart');
const searchInput = document.getElementById('searchInput');
const itemModal = document.getElementById('itemModal');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  initializePage();
});

async function initializePage() {
  // Get user and restaurant info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const restaurantId = user.restaurantId || 'default';
  
  // Get table number from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const tableNumber = urlParams.get('table') || '1';
  document.getElementById('tableNumber').textContent = `Table ${tableNumber}`;

  // Load menu items
  await loadMenuItems(restaurantId);
  
  // Setup event listeners
  setupEventListeners();
  
  // Load cart from sessionStorage
  loadCart();
}

async function loadMenuItems(restaurantId) {
  try {
    const items = await MenuAPI.getMenuItems(restaurantId);
    allMenuItems = items;
    renderMenuItems(items);
  } catch (error) {
    console.error('Error loading menu:', error);
    menuGrid.innerHTML = '<p class="error">Failed to load menu. Please refresh the page.</p>';
  }
}

function renderMenuItems(items) {
  menuGrid.innerHTML = '';
  
  if (items.length === 0) {
    menuGrid.innerHTML = '<p class="no-items">No items available</p>';
    return;
  }

  items.forEach(item => {
    const discountPercent = item.discountedPrice 
      ? Math.round(((item.price - item.discountedPrice) / item.price) * 100)
      : 0;

    const html = `
      <div class="menu-item" data-id="${item._id}">
        <div class="menu-item-image">
          <img src="${item.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 150%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22150%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E" alt="${item.name}">
          ${discountPercent > 0 ? `<span class="discount-badge">${discountPercent}% OFF</span>` : ''}
        </div>
        <div class="menu-item-content">
          <div class="menu-item-name">${item.name}</div>
          <div class="menu-item-badges">
            ${item.isVegetarian ? '<span class="menu-item-badge">🌱 Veg</span>' : '<span class="menu-item-badge">🍗 Non-Veg</span>'}
            ${item.prepTime ? `<span class="menu-item-badge">⏱️ ${item.prepTime}m</span>` : ''}
          </div>
          <div class="menu-item-rating">
            ⭐ ${item.rating || 4.5} (${item.totalReviews || 0} reviews)
          </div>
          <div class="menu-item-price">
            ${item.discountedPrice ? `<span class="menu-item-original-price">${CURRENCY}${item.price}</span>` : ''}
            <span class="menu-item-final-price">${CURRENCY}${item.discountedPrice || item.price}</span>
          </div>
          <button class="menu-item-btn add-item-btn" data-id="${item._id}">+ Add</button>
        </div>
      </div>
    `;
    
    menuGrid.innerHTML += html;
  });

  // Add click listeners to add buttons
  document.querySelectorAll('.add-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.dataset.id;
      showItemModal(itemId);
    });
  });

  // Add click listeners to menu items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const itemId = item.dataset.id;
      showItemModal(itemId);
    });
  });
}

function showItemModal(itemId) {
  const item = allMenuItems.find(i => i._id === itemId);
  if (!item) return;

  document.getElementById('detailImage').src = item.image || 'data:image/svg+xml,...';
  document.getElementById('detailName').textContent = item.name;
  document.getElementById('detailDescription').textContent = item.description || 'No description available';
  document.getElementById('detailRating').textContent = '⭐'.repeat(Math.round(item.rating || 4.5));
  document.getElementById('detailReviews').textContent = `${item.totalReviews || 0} reviews`;
  
  const vegBadge = document.getElementById('vegBadge');
  if (item.isVegetarian) {
    vegBadge.style.display = 'inline-block';
  } else {
    vegBadge.style.display = 'none';
  }

  const spicyBadge = document.getElementById('spicyBadge');
  if (item.isSpicy && item.isSpicy !== 'none') {
    spicyBadge.style.display = 'inline-block';
  } else {
    spicyBadge.style.display = 'none';
  }

  const originalPrice = document.getElementById('originalPrice');
  const finalPrice = document.getElementById('finalPrice');
  
  if (item.discountedPrice) {
    originalPrice.textContent = `${CURRENCY}${item.price}`;
    finalPrice.textContent = `${CURRENCY}${item.discountedPrice}`;
  } else {
    originalPrice.textContent = '';
    finalPrice.textContent = `${CURRENCY}${item.price}`;
  }

  document.querySelector('.qty-input').value = '1';
  document.getElementById('instructions').value = '';

  // Setup modal buttons
  itemModal.classList.add('active');
  
  document.querySelector('.modal-close').onclick = () => {
    itemModal.classList.remove('active');
  };

  document.querySelector('.add-to-cart-btn').onclick = () => {
    const quantity = parseInt(document.querySelector('.qty-input').value);
    const instructions = document.getElementById('instructions').value;
    addToCart(item, quantity, instructions);
    itemModal.classList.remove('active');
  };

  // Quantity controls
  document.querySelector('.qty-btn.minus').onclick = () => {
    const input = document.querySelector('.qty-input');
    if (input.value > 1) input.value = parseInt(input.value) - 1;
  };

  document.querySelector('.qty-btn.plus').onclick = () => {
    const input = document.querySelector('.qty-input');
    input.value = parseInt(input.value) + 1;
  };
}

function addToCart(item, quantity, instructions = '') {
  const existingItem = cart.find(ci => ci._id === item._id && ci.instructions === instructions);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...item,
      quantity,
      instructions,
      price: item.discountedPrice || item.price,
    });
  }

  updateCart();
  showNotification(`${item.name} added to cart!`, 'success');
}

function updateCart() {
  // Save to sessionStorage
  sessionStorage.setItem('cart', JSON.stringify(cart));
  
  // Update UI
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Render cart items
  renderCartItems();
  
  // Calculate totals
  calculateTotals();
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${CURRENCY}${item.price}</div>
        ${item.instructions ? `<small>${item.instructions}</small>` : ''}
      </div>
      <div class="cart-item-quantity">
        <button class="qty-adjust minus-qty" data-index="${index}">−</button>
        <span>${item.quantity}</span>
        <button class="qty-adjust plus-qty" data-index="${index}">+</button>
      </div>
      <button class="cart-item-remove" data-index="${index}">✕</button>
    </div>
  `).join('');

  // Add event listeners
  document.querySelectorAll('.minus-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
        updateCart();
      }
    });
  });

  document.querySelectorAll('.plus-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      cart[index].quantity++;
      updateCart();
    });
  });

  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      cart.splice(index, 1);
      updateCart();
    });
  });
}

function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  subtotalEl.textContent = `${CURRENCY}${subtotal.toFixed(2)}`;
  taxEl.textContent = `${CURRENCY}${tax.toFixed(2)}`;
  totalEl.textContent = `${CURRENCY}${total.toFixed(2)}`;
}

function setupEventListeners() {
  // Category filtering
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.dataset.category;
      
      const filtered = selectedCategory === 'all' 
        ? allMenuItems
        : allMenuItems.filter(item => item.category === selectedCategory);
      
      renderMenuItems(filtered);
    });
  });

  // Cart button
  cartBtn.addEventListener('click', () => {
    cartSidebar.classList.toggle('active');
  });

  cartCloseBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
  });

  // Place order
  placeOrderBtn.addEventListener('click', placeOrder);

  // Search
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allMenuItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
    renderMenuItems(filtered);
  });

  // Modal close
  itemModal.addEventListener('click', (e) => {
    if (e.target === itemModal) {
      itemModal.classList.remove('active');
    }
  });
}

async function placeOrder() {
  if (cart.length === 0) {
    showNotification('Your cart is empty', 'warning');
    return;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const tableNumber = parseInt(document.getElementById('tableNumber').textContent.split(' ')[1]);

  try {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Placing order...';

    const order = await OrderAPI.createOrder({
      restaurantId: user.restaurantId,
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      tableNumber,
      orderType: 'dine_in',
      items: cart.map(item => ({
        menuItemId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.instructions,
      })),
      subtotal: parseFloat(subtotalEl.textContent.replace('₹', '')),
      tax: parseFloat(taxEl.textContent.replace('₹', '')),
      totalAmount: parseFloat(totalEl.textContent.replace('₹', '')),
    });

    showNotification('Order placed successfully! Your order is being prepared.', 'success');
    
    // Clear cart
    cart = [];
    updateCart();
    sessionStorage.removeItem('cart');
    cartSidebar.classList.remove('active');

    // Redirect to order tracking
    setTimeout(() => {
      window.location.href = `/pages/order-tracking.html?orderId=${order.order._id}`;
    }, 2000);
  } catch (error) {
    showNotification('Failed to place order. Please try again.', 'error');
    console.error('Order error:', error);
  } finally {
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order';
  }
}

function loadCart() {
  const savedCart = sessionStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCart();
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type}`;
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '2000';
  notification.style.maxWidth = '400px';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 4000);
}
