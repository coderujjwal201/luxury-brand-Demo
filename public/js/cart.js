/**
 * Thistlewood - Client-Side Cart & Razorpay Checkout Integration
 */

// Global cart state initialized from LocalStorage
let cart = JSON.parse(localStorage.getItem('thistlewood_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  updateCartBubble();
  
  // Initialize specific page logics
  if (document.getElementById('cart-page-container')) {
    renderCartPage();
  }
  
  if (document.getElementById('checkout-page-container')) {
    renderCheckoutSummary();
    setupCheckoutForm();
  }

  // Bind Add to Cart button on Product Detail page
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', handleAddToCart);
  }
});

/**
 * Sync Navigation Header Cart Indicator bubble
 */
function updateCartBubble() {
  const bubbles = document.querySelectorAll('.cart-count');
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  bubbles.forEach(bubble => {
    bubble.textContent = totalQty;
    bubble.style.display = totalQty > 0 ? 'flex' : 'none';
  });
}

/**
 * Handle Add to Cart action on product detail pages
 */
function handleAddToCart(e) {
  const btn = e.target;
  const productId = btn.getAttribute('data-product-id');
  const productName = btn.getAttribute('data-product-name');
  const productPrice = parseFloat(btn.getAttribute('data-product-price'));
  const productImage = btn.getAttribute('data-product-image');
  const productSlug = btn.getAttribute('data-product-slug');
  
  // Find selected size button
  const selectedSizeBtn = document.querySelector('.size-option-btn.selected');
  if (!selectedSizeBtn) {
    alert('Please select a size before adding to cart.');
    return;
  }
  const selectedSize = selectedSizeBtn.getAttribute('data-size');
  
  // Check if item already exists with this size
  const existingIndex = cart.findIndex(item => item.id === productId && item.size === selectedSize);
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      slug: productSlug,
      size: selectedSize,
      quantity: 1
    });
  }
  
  saveCart();
  updateCartBubble();
  
  // Mini micro-interaction on button
  const originalText = btn.textContent;
  btn.textContent = 'ADDED TO BAG';
  btn.style.backgroundColor = 'var(--accent-color)';
  btn.style.borderColor = 'var(--accent-color)';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.backgroundColor = '';
    btn.style.borderColor = '';
  }, 2000);
}

function saveCart() {
  localStorage.setItem('thistlewood_cart', JSON.stringify(cart));
}

/**
 * Render Cart List on Dedicated /cart page
 */
function renderCartPage() {
  const container = document.getElementById('cart-items-tbody');
  const emptyState = document.getElementById('cart-empty-state');
  const cartTableWrap = document.getElementById('cart-table-wrapper');
  const subtotalLabel = document.getElementById('cart-subtotal-amount');
  const totalLabel = document.getElementById('cart-total-amount');

  if (!container) return;

  if (cart.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (cartTableWrap) cartTableWrap.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (cartTableWrap) cartTableWrap.style.display = 'grid';

  container.innerHTML = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="cart-item-info">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <h4><a href="/products/${item.slug}">${item.name}</a></h4>
            <p>Size: ${item.size}</p>
            <button class="cart-remove-btn" data-index="${index}">Remove</button>
          </div>
        </div>
      </td>
      <td>
        <div class="quantity-controls">
          <button class="quantity-btn dec-btn" data-index="${index}">&minus;</button>
          <span class="quantity-val">${item.quantity}</span>
          <button class="quantity-btn inc-btn" data-index="${index}">&plus;</button>
        </div>
      </td>
      <td class="cart-subtotal-cell">
        ₹${(itemSubtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
    `;
    container.appendChild(tr);
  });

  // Render prices
  if (subtotalLabel) subtotalLabel.textContent = `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  if (totalLabel) totalLabel.textContent = `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Bind edit handlers
  container.querySelectorAll('.dec-btn').forEach(btn => {
    btn.addEventListener('click', (e) => adjustQuantity(e.target.getAttribute('data-index'), -1));
  });
  container.querySelectorAll('.inc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => adjustQuantity(e.target.getAttribute('data-index'), 1));
  });
  container.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => removeCartItem(e.target.getAttribute('data-index')));
  });
}

function adjustQuantity(index, delta) {
  const idx = parseInt(index);
  cart[idx].quantity += delta;
  
  if (cart[idx].quantity <= 0) {
    cart.splice(idx, 1);
  }
  
  saveCart();
  updateCartBubble();
  renderCartPage();
}

function removeCartItem(index) {
  const idx = parseInt(index);
  cart.splice(idx, 1);
  saveCart();
  updateCartBubble();
  renderCartPage();
}

/**
 * Render checkout summary lines
 */
function renderCheckoutSummary() {
  const container = document.getElementById('checkout-items-list');
  const subtotalLabel = document.getElementById('checkout-subtotal');
  const totalLabel = document.getElementById('checkout-total');
  
  if (!container) return;

  container.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    const div = document.createElement('div');
    div.classList.add('checkout-item');
    div.innerHTML = `
      <span class="checkout-item-name">${item.name} (${item.size}) x ${item.quantity}</span>
      <span class="checkout-item-price">₹${itemSubtotal.toLocaleString('en-IN')}</span>
    `;
    container.appendChild(div);
  });

  if (subtotalLabel) subtotalLabel.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (totalLabel) totalLabel.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
}

/**
 * Checkout Form Submission & Razorpay Integration Handler
 */
function setupCheckoutForm() {
  const form = document.getElementById('checkout-details-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your shopping bag is empty.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'PROCESSING ORDER...';
    submitBtn.disabled = true;

    // Grab form fields
    const formData = {
      customer_name: document.getElementById('checkout-name').value,
      customer_email: document.getElementById('checkout-email').value,
      customer_phone: document.getElementById('checkout-phone').value,
      shipping_address: document.getElementById('checkout-address').value,
      shipping_city: document.getElementById('checkout-city').value,
      shipping_zip: document.getElementById('checkout-zip').value,
      shipping_country: document.getElementById('checkout-country').value,
      items: cart.map(item => ({
        product_id: item.id,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      // 1. Post order to backend
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const orderResult = await response.json();
      
      if (!response.ok || !orderResult.success) {
        throw new Error(orderResult.message || 'Failed to initialize order on server.');
      }

      const { razorpay_order_id, amount, razorpay_key, local_order_id } = orderResult;

      // 2. Launch payment modal
      if (razorpay_order_id.startsWith('order_mock_')) {
        // Run simulated overlay test payment
        launchSimulatedPayment(razorpay_order_id, amount, formData, local_order_id, submitBtn, originalText);
      } else {
        // Open standard Razorpay popup checkout
        launchRealRazorpay(razorpay_order_id, amount, razorpay_key, formData, local_order_id, submitBtn, originalText);
      }

    } catch (err) {
      console.error(err);
      alert(`Order Checkout Error: ${err.message}`);
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

/**
 * Trigger Real Razorpay Checkout overlay via SDK CDN
 */
function launchRealRazorpay(orderId, amount, key, customerInfo, localOrderId, submitBtn, btnText) {
  if (typeof Razorpay === 'undefined') {
    alert('Razorpay payment library failed to load. Please verify your internet connection.');
    submitBtn.textContent = btnText;
    submitBtn.disabled = false;
    return;
  }

  const isEvening = document.documentElement.classList.contains('theme-evening');
  const accentColor = isEvening ? '#B08D5C' : '#2F4538';

  const options = {
    key: key,
    amount: amount,
    currency: 'INR',
    name: 'Thistlewood',
    description: `Order ${localOrderId}`,
    order_id: orderId,
    handler: async function (response) {
      // Payment successful callback
      try {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });
        
        const verifyResult = await verifyRes.json();
        if (verifyRes.ok && verifyResult.success) {
          // Clear Cart and redirect
          localStorage.removeItem('thistlewood_cart');
          cart = [];
          window.location.href = `/order-confirmation?order_id=${verifyResult.order_id}`;
        } else {
          alert(`Payment Verification Failed: ${verifyResult.message}`);
          submitBtn.textContent = btnText;
          submitBtn.disabled = false;
        }
      } catch (err) {
        alert('Verification error.');
        submitBtn.textContent = btnText;
        submitBtn.disabled = false;
      }
    },
    prefill: {
      name: customerInfo.customer_name,
      email: customerInfo.customer_email,
      contact: customerInfo.customer_phone
    },
    theme: {
      color: accentColor
    },
    modal: {
      ondismiss: function () {
        submitBtn.textContent = btnText;
        submitBtn.disabled = false;
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

/**
 * Launch custom mock checkout UI simulation in browser
 */
function launchSimulatedPayment(orderId, amount, customerInfo, localOrderId, submitBtn, btnText) {
  // Create overlay modal
  const overlay = document.createElement('div');
  overlay.id = 'payment-simulation-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000';
  overlay.style.backdropFilter = 'blur(10px)';

  const card = document.createElement('div');
  card.style.backgroundColor = 'var(--bg-color, #EDE8DF)';
  card.style.color = 'var(--text-color, #23241F)';
  card.style.border = '1px solid var(--border-color)';
  card.style.padding = '40px';
  card.style.width = '90%';
  card.style.maxWidth = '460px';
  card.style.textAlign = 'center';
  card.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';
  card.style.fontFamily = 'var(--font-body)';

  // Determine current theme style context
  const isEvening = document.documentElement.classList.contains('theme-evening');
  const accent = isEvening ? '#B08D5C' : '#2F4538';

  card.innerHTML = `
    <h3 style="font-family: var(--font-display); font-size: 1.5rem; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 0.1em;">
      Thistlewood Payment
    </h3>
    <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-muted); margin-bottom: 15px;">
      Razorpay Test Simulation
    </p>
    <div style="border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 20px 0; margin-bottom: 30px;">
      <p style="font-size: 0.8rem; margin-bottom: 5px;">Total Amount Due</p>
      <p style="font-family: var(--font-display); font-size: 1.8rem; font-weight: bold; color: ${accent};">
        ₹${(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </p>
      <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 10px;">Order ID: ${orderId}</p>
    </div>
    
    <div style="display: flex; flex-direction: column; gap: 15px;">
      <button id="sim-pay-success-btn" style="background-color: var(--text-color); color: var(--bg-color); border: 1px solid var(--text-color); padding: 16px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; cursor: pointer; font-weight: bold; transition: all 0.3s ease; font-family: var(--font-body);">
        Simulate Successful Payment
      </button>
      <button id="sim-pay-fail-btn" style="background-color: transparent; color: var(--text-color); border: 1px solid var(--border-color); padding: 16px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; cursor: pointer; transition: all 0.3s ease; font-family: var(--font-body);">
        Simulate Declined Payment
      </button>
    </div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Success flow simulation
  document.getElementById('sim-pay-success-btn').addEventListener('click', async () => {
    overlay.innerHTML = '<div style="color: #FFF; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.15em; font-family: var(--font-body);">Verifying payment transaction...</div>';
    
    try {
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
          razorpay_signature: 'signature_mock_value'
        })
      });

      const verifyResult = await verifyRes.json();
      if (verifyRes.ok && verifyResult.success) {
        localStorage.removeItem('thistlewood_cart');
        cart = [];
        document.body.removeChild(overlay);
        window.location.href = `/order-confirmation?order_id=${verifyResult.order_id}`;
      } else {
        alert('Simulated Verification failed.');
        document.body.removeChild(overlay);
        submitBtn.textContent = btnText;
        submitBtn.disabled = false;
      }
    } catch (err) {
      alert('Verification API failed.');
      document.body.removeChild(overlay);
      submitBtn.textContent = btnText;
      submitBtn.disabled = false;
    }
  });

  // Decline flow simulation
  document.getElementById('sim-pay-fail-btn').addEventListener('click', () => {
    alert('Simulated Transaction Declined by Issuer.');
    document.body.removeChild(overlay);
    submitBtn.textContent = btnText;
    submitBtn.disabled = false;
  });
}
