document.addEventListener('DOMContentLoaded', () => {

    // ===== STATE MANAGEMENT =====
    const getCart = () => JSON.parse(localStorage.getItem('stylfieCart_v1')) || [];
    const saveCart = (cart) => localStorage.setItem('stylfieCart_v1', JSON.stringify(cart));
    const getWishlist = () => JSON.parse(localStorage.getItem('stylfieWishlist_v1')) || [];
    const saveWishlist = (wishlist) => localStorage.setItem('stylfieWishlist_v1', JSON.stringify(wishlist));
    const getOrders = () => JSON.parse(localStorage.getItem('stylfieOrders_v1')) || [];
    const saveOrders = (orders) => localStorage.setItem('stylfieOrders_v1', JSON.stringify(orders));

    // ===== CORE FUNCTIONS =====
    const removeOrder = (orderId) => {
    let orders = getOrders();
    orders = orders.filter(order => order.id !== orderId);
    saveOrders(orders);
    showToast('Order has been removed.');
    renderOrdersPage(); // Re-render the page to show the change
};
    const showToast = (message) => {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    };
    
    const updateCartCount = () => {
        const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count-badge').forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    };

    const addToCart = (productId, quantityToAdd) => {
    if (!quantityToAdd || quantityToAdd < 1) return;
    let cart = getCart();
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // CHANGE: This now SETS the quantity instead of adding to it.
        existingItem.quantity = quantityToAdd;
    } else {
        cart.push({ ...product, quantity: quantityToAdd });
    }
    
    saveCart(cart);
    showToast(`${quantityToAdd} x ${product.name} added to cart!`);
    updateCartCount();
};
    
    const removeFromCart = (productId) => {
        let cart = getCart().filter(item => item.id !== productId);
        saveCart(cart);
        showToast('Item removed from cart.');
        updateCartCount();
        renderCartPage();
    };

    const toggleWishlist = (productId, buttonEl) => {
        let wishlist = getWishlist();
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const isInWishlist = wishlist.some(item => item.id === productId);

        if (isInWishlist) {
            wishlist = wishlist.filter(item => item.id !== productId);
            showToast(`${product.name} removed from wishlist.`);
            if (buttonEl) buttonEl.innerHTML = `<i class="fa-regular fa-heart"></i>`;
        } else {
            wishlist.push(product);
            showToast(`${product.name} added to wishlist!`);
            if (buttonEl) buttonEl.innerHTML = `<i class="fa-solid fa-heart" style="color: #ef4444;"></i>`;
        }
        saveWishlist(wishlist);
        
        if (document.body.id === 'wishlist-page-body') {
            renderWishlistPage();
        }
    };

    const checkout = () => {
        const cart = getCart();
        if (cart.length === 0) {
            showToast("Your cart is empty.");
            return;
        }
        const orders = getOrders();
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        orders.push({ id: Date.now(), date: new Date().toLocaleDateString(), items: cart, total: total });
        saveOrders(orders);
        saveCart([]);
        showToast("Congratulations! Your order is placed.");
        setTimeout(() => window.location.href = 'myorder.html', 2000);
    };

    // ===== PAGE-SPECIFIC RENDERERS =====

    const renderProductGrid = (containerId, productList) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const wishlist = getWishlist();
        container.innerHTML = productList.map(p => {
            const isInWishlist = wishlist.some(item => item.id === p.id);
            const heartIcon = isInWishlist 
                ? `<i class="fa-solid fa-heart" style="color: #ef4444;"></i>` 
                : `<i class="fa-regular fa-heart"></i>`;
            return `
            <div class="product-card bg-light rounded-xl shadow-md overflow-hidden flex flex-col relative">
                <button class="wishlist-btn absolute top-2 right-2 text-xl text-gray-500 bg-white/70 p-2 rounded-full leading-none z-10" data-product-id="${p.id}">
                    ${heartIcon}
                </button>
                <a href="product.html?id=${p.id}" class="block">
                    <img src="${p.images[0]}" alt="${p.name}" class="w-full">
                    <div class="p-4">
                        <h4 class="font-semibold text-sm truncate hover:text-primary">${p.name}</h4>
                        <p class="text-primary font-bold mt-1">₹${p.price.toLocaleString()}</p>
                    </div>
                </a>
            </div>`;
        }).join('');
    };

    const renderProductDetailPage = () => {
    const container = document.getElementById('product-detail-container');
    if (!container) return;
    const productId = parseInt(new URLSearchParams(window.location.search).get('id'));
    const product = products.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = `<p class="text-center text-red-500">Product not found.</p>`;
        return;
    }

    document.title = `${product.name} - Stylfie Optics`;

    const wishlist = getWishlist();
    const isInWishlist = wishlist.some(item => item.id === product.id);
    const heartIcon = isInWishlist 
        ? `<i class="fa-solid fa-heart" style="color: #ef4444;"></i>` 
        : `<i class="fa-regular fa-heart"></i>`;
    
    container.innerHTML = `
        <div class="product-detail-layout">
            <div class="product-gallery">
                <img src="${product.images[0]}" alt="${product.name}" class="main-image">
                <div class="thumbnail-container">
                    ${product.images.map((img, index) => `
                        <img src="${img}" alt="Thumbnail ${index + 1}" class="thumbnail-img ${index === 0 ? 'active' : ''}">
                    `).join('')}
                </div>
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <p class="price">₹${product.price.toLocaleString()}</p>
                <p class="description">${product.description}</p>
                <div class="actions">
                    <div class="quantity-slider-group">
                        <div class="label">
                            <span>Quantity</span>
                            <span id="quantity-value">1</span>
                        </div>
                        <input type="range" id="quantity-slider" min="1" max="30" value="1" class="quantity-slider">
                    </div>
                    <div class="button-group">
                       <button class="add-to-cart-btn-main" data-product-id="${product.id}">
                           <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                       </button>
                       <button class="wishlist-btn-detail wishlist-btn" data-product-id="${product.id}">
                          ${heartIcon}
                       </button>
                    </div>
                </div>
            </div>
        </div>`;

    renderProductGrid('related-products-container', products.filter(p => p.id !== productId));
};
    const renderCartPage = () => {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    const cart = getCart();
    const summaryContainer = document.getElementById('cart-total-summary');
    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-500 mt-8">Your cart is empty.</div>`;
        if (summaryContainer) summaryContainer.innerHTML = '';
        return;
    }
    container.innerHTML = cart.map(item => `
        <div class="flex items-center p-4 bg-white rounded-xl shadow-sm">
            <a href="product.html?id=${item.id}">
                <img src="${item.images[0]}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover">
            </a>
            <div class="flex-1 ml-4">
                <a href="product.html?id=${item.id}" class="hover:text-primary">
                    <h4 class="font-semibold">${item.name}</h4>
                </a>
                <p class="text-gray-500 text-sm">Quantity: ${item.quantity}</p>
            </div>
            <div class="text-right">
                 <p class="text-primary font-bold">₹${(item.price * item.quantity).toLocaleString()}</p>
                 <div class="flex items-center justify-end mt-1">
                     <button class="remove-from-cart-btn text-gray-400 hover:text-red-500" data-product-id="${item.id}" title="Remove">
                         <i class="fas fa-trash-alt"></i>
                     </button>
                 </div>
            </div>
        </div>`).join('');
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="text-lg font-semibold">Total:</span>
                <span class="text-xl font-bold text-primary">₹${total.toLocaleString()}</span>
            </div>
            <button id="checkoutButton" class="w-full py-3 px-4 bg-orange-400 text-white font-bold rounded-xl mt-4 shadow-md">Checkout</button>
        `;
    }
};

    const renderWishlistPage = () => {
        const container = document.getElementById('wishlist-items-container');
        if (!container) return;
        const wishlist = getWishlist();
        if (wishlist.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-500 mt-8 col-span-full">Your wishlist is empty.</p>`;
            return;
        }
        container.innerHTML = wishlist.map(item => `
            <div class="flex items-center p-4 bg-white rounded-xl shadow-sm">
                <img src="${item.images[0]}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover">
                <div class="flex-1 ml-4">
                    <h4 class="font-semibold">${item.name}</h4>
                    <p class="text-primary font-bold mt-1">₹${item.price.toLocaleString()}</p>
                </div>
                <div class="flex items-center space-x-3">
                    <button class="move-to-cart-btn bg-orange-400 text-white rounded-full w-10 h-10 flex items-center justify-center" data-product-id="${item.id}" title="Move to Cart">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="remove-from-wishlist-btn text-red-500" data-product-id="${item.id}" title="Remove from Wishlist">
                        <i class="fas fa-trash-alt text-xl"></i>
                    </button>
                </div>
            </div>`).join('');
    };
    
    const renderOrdersPage = () => {
    const container = document.getElementById('orders-container');
    if(!container) return;
    const orders = getOrders();
    if (orders.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-500 mt-8">You have no past orders.</div>`;
        return;
    }
    container.innerHTML = orders.reverse().map(order => `
        <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div class="flex justify-between items-start border-b pb-2 mb-2">
                <div>
                    <p class="font-bold">Order #${order.id}</p>
                    <p class="text-sm text-gray-500">Placed on ${order.date}</p>
                </div>
                <div class="flex items-center space-x-4">
                    <p class="font-bold text-primary text-lg">₹${order.total.toLocaleString()}</p>
                    <button class="remove-order-btn text-gray-400 hover:text-red-500" data-order-id="${order.id}" title="Delete Order">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div>${order.items.map(item => `<p class="text-sm ml-2">&bull; ${item.name} (Qty: ${item.quantity})</p>`).join('')}</div>
        </div>
    `).join('');
};
    // ===== EVENT LISTENERS =====
// ===== EVENT LISTENERS =====
document.body.addEventListener('input', (e) => {
    if (e.target.matches('#quantity-slider')) {
        const quantityValue = document.getElementById('quantity-value');
        if (quantityValue) {
            quantityValue.textContent = e.target.value;
        }
    }
});

document.body.addEventListener('click', (e) => {
    const thumbnail = e.target.closest('.thumbnail-img');
    if (thumbnail) {
        const mainImage = document.querySelector('.main-image');
        if(mainImage) mainImage.src = thumbnail.src;
        document.querySelectorAll('.thumbnail-img').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
        return;
    }

    const btn = e.target.closest('button');
    if (!btn) return;
    
    const productId = parseInt(btn.dataset.productId);
    
    if (btn.matches('.add-to-cart-btn-main')) {
        const quantitySlider = document.getElementById('quantity-slider');
        const quantity = parseInt(quantitySlider.value);
        addToCart(productId, quantity);
    } else if (btn.matches('.remove-from-cart-btn')) {
        showToast('Item removed from cart.');
        removeFromCart(productId);
    } else if (btn.matches('.wishlist-btn')) {
        toggleWishlist(productId, btn);
    } else if (btn.matches('.remove-from-wishlist-btn')) {
        toggleWishlist(productId, null);
    } else if (btn.matches('.move-to-cart-btn')) {
        addToCart(productId, 1);
        toggleWishlist(productId, null);
    } else if (btn.matches('#checkoutButton')) {
        checkout();
    } else if (btn.matches('.remove-order-btn')) {
        // This is the new part to handle deleting an order
        const orderId = parseInt(btn.dataset.orderId);
        removeOrder(orderId);
    }
});
document.body.addEventListener('click', (e) => {
    const thumbnail = e.target.closest('.thumbnail-img');
    if (thumbnail) {
        const mainImage = document.querySelector('.main-image');
        if(mainImage) mainImage.src = thumbnail.src;
        document.querySelectorAll('.thumbnail-img').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
        return;
    }

    const btn = e.target.closest('button');
    if (!btn) return;
    
    const productId = parseInt(btn.dataset.productId);
    
    if (btn.matches('.add-to-cart-btn-main')) {
        const quantitySlider = document.getElementById('quantity-slider');
        const quantity = parseInt(quantitySlider.value);
        addToCart(productId, quantity);
    } else if (btn.matches('.remove-from-cart-btn')) {
        showToast('Item removed from cart.');
        removeFromCart(productId);
    } else if (btn.matches('.wishlist-btn')) {
        toggleWishlist(productId, btn);
    } else if (btn.matches('.remove-from-wishlist-btn')) {
        toggleWishlist(productId, null);
    } else if (btn.matches('.move-to-cart-btn')) {
        addToCart(productId, 1);
        toggleWishlist(productId, null);
    } else if (btn.matches('#checkoutButton')) {
        checkout();
    }
});
document.body.addEventListener('click', (e) => {
    const thumbnail = e.target.closest('.thumbnail-img');
    if (thumbnail) {
        const mainImage = document.querySelector('.main-image');
        if(mainImage) mainImage.src = thumbnail.src;
        document.querySelectorAll('.thumbnail-img').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
        return;
    }

    const btn = e.target.closest('button');
    if (!btn) return;
    
    const productId = parseInt(btn.dataset.productId);
    
    if (btn.matches('.add-to-cart-btn-main')) {
        const quantitySlider = document.getElementById('quantity-slider');
        const quantity = parseInt(quantitySlider.value);
        addToCart(productId, quantity);
    } else if (btn.matches('.remove-from-cart-btn')) {
        showToast('Item removed from cart.');
        removeFromCart(productId);
    } else if (btn.matches('.wishlist-btn')) {
        toggleWishlist(productId, btn);
    } else if (btn.matches('.move-to-wishlist-btn')) {
        toggleWishlist(productId, null); // Adds to wishlist
        removeFromCart(productId); // Removes from cart
        showToast('Moved to Wishlist!'); // Overrides the default remove message
    } else if (btn.matches('.remove-from-wishlist-btn')) {
        toggleWishlist(productId, null);
    } else if (btn.matches('.move-to-cart-btn')) {
        addToCart(productId, 1);
        toggleWishlist(productId, null);
    } else if (btn.matches('#checkoutButton')) {
        checkout();
    }
});

document.body.addEventListener('click', (e) => {
    const thumbnail = e.target.closest('.thumbnail-img');
    if (thumbnail) {
        const mainImage = document.querySelector('.main-image');
        if(mainImage) mainImage.src = thumbnail.src;
        document.querySelectorAll('.thumbnail-img').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
        return;
    }

    const btn = e.target.closest('button');
    if (!btn) return;
    
    const productId = parseInt(btn.dataset.productId);
    
    if (btn.matches('.add-to-cart-btn-main')) {
        // Updated to read from slider instead of the old +/- buttons
        const quantitySlider = document.getElementById('quantity-slider');
        const quantity = parseInt(quantitySlider.value);
        addToCart(productId, quantity);
    } else if (btn.matches('.remove-from-cart-btn')) {
        removeFromCart(productId);
    } else if (btn.matches('.wishlist-btn')) {
        toggleWishlist(productId, btn);
    } else if (btn.matches('.remove-from-wishlist-btn')) {
        toggleWishlist(productId, null);
    } else if (btn.matches('.move-to-cart-btn')) {
        addToCart(productId, 1);
        toggleWishlist(productId, null);
    } else if (btn.matches('#checkoutButton')) {
        checkout();
    }
});

    // ===== INITIALIZE PAGE =====
    const pageId = document.body.id;

    if (pageId === 'home-page-body') {
        renderProductGrid('featured-products-container', products.slice(0, 4));
    } else if (pageId === 'shop-page-body') {
        renderProductGrid('shop-products-container', products);
    } else if (pageId === 'product-page-body') {
        renderProductDetailPage();
    } else if (pageId === 'cart-page-body') {
        renderCartPage();
    } else if (pageId === 'wishlist-page-body') {
        renderWishlistPage();
    } else if (pageId === 'orders-page-body') {
        renderOrdersPage();
    }
    
    updateCartCount();
});
