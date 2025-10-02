// Add this array near the top of main.js
const bannerImages = [
    'https://static5.lenskart.com/media/uploads/Desktop-v2-topbanner-bigvisiondays-oe-260825.png',
    'https://static5.lenskart.com/media/uploads/Desktop-v2-topbanner-twyst-220925.png',
    'https://static5.lenskart.com/media/uploads/Desktop-v2-topbanner-hellokitty-16sep25.png',
    'https://static5.lenskart.com/media/uploads/Desktop-v2-topbanner-zodiac-16sep25.png'
];
document.addEventListener('DOMContentLoaded', () => {

    // ===== STATE MANAGEMENT =====
    const getCart = () => JSON.parse(localStorage.getItem('stylfieCart_v1')) || [];
    const saveCart = (cart) => localStorage.setItem('stylfieCart_v1', JSON.stringify(cart));
    const getWishlist = () => JSON.parse(localStorage.getItem('stylfieWishlist_v1')) || [];
    const saveWishlist = (wishlist) => localStorage.setItem('stylfieWishlist_v1', JSON.stringify(wishlist));
    const getOrders = () => JSON.parse(localStorage.getItem('stylfieOrders_v1')) || [];
    const saveOrders = (orders) => localStorage.setItem('stylfieOrders_v1', JSON.stringify(orders));
    
    // ===== CORE FUNCTIONS =====
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
    
    const removeOrder = (orderId) => {
        let orders = getOrders();
        orders = orders.filter(order => order.id !== orderId);
        saveOrders(orders);
        showToast('Order has been removed.');
        renderOrdersPage();
    };


    // ===== PAGE-SPECIFIC RENDERERS (OPTIMIZED) =====

    const renderProductGrid = (containerId, productList) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const wishlist = getWishlist();
        const fragment = document.createDocumentFragment();
        productList.forEach(p => {
            const isInWishlist = wishlist.some(item => item.id === p.id);
            const heartIcon = isInWishlist 
                ? `<i class="fa-solid fa-heart" style="color: #ef4444;"></i>` 
                : `<i class="fa-regular fa-heart"></i>`;
            
            const card = document.createElement('div');
            card.className = 'product-card bg-light rounded-xl shadow-md overflow-hidden flex flex-col relative';
            card.innerHTML = `
                <button class="wishlist-btn absolute top-2 right-2 text-xl text-gray-500 bg-white/70 p-2 rounded-full leading-none z-10" data-product-id="${p.id}">
                    ${heartIcon}
                </button>
                <a href="product.html?id=${p.id}" class="block">
                    <img src="${p.images[0]}" alt="${p.name}" class="w-full" loading="lazy" decoding="async">
                    <div class="p-4">
                        <h4 class="font-semibold text-sm truncate hover:text-primary">${p.name}</h4>
                        <p class="text-primary font-bold mt-1">₹${p.price.toLocaleString()}</p>
                    </div>
                </a>
            `;
            fragment.appendChild(card);
        });
        container.innerHTML = '';
        container.appendChild(fragment);
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
                            <img src="${img}" alt="Thumbnail ${index + 1}" class="thumbnail-img ${index === 0 ? 'active' : ''}" loading="lazy" decoding="async">
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
                    <img src="${item.images[0]}" alt="${item.name}" class="w-16 h-16 rounded-lg object-contain" loading="lazy" decoding="async">
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
                <img src="${item.images[0]}" alt="${item.name}" class="w-16 h-16 rounded-lg object-contain" loading="lazy" decoding="async">
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
                <div class="flex justify-between items-center border-b pb-2 mb-2">
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
    ////////////////////////////////////
    const setupFilterModal = () => {
        const filterBtn = document.getElementById('filter-btn');
        const filterModal = document.getElementById('filter-modal');
        const closeModalBtn = document.getElementById('close-filter-modal');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');

        if (!filterBtn || !filterModal) return;

        const openModal = () => filterModal.classList.remove('hidden');
        const closeModal = () => filterModal.classList.add('hidden');

        filterBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        
        applyFiltersBtn.addEventListener('click', () => {
            applyFiltersAndSort();
            closeModal();
        });

        filterModal.addEventListener('click', (e) => {
            if (e.target === filterModal) {
                closeModal();
            }
        });
    };
    ////////////////////////////////////////////////////////////////////////
    // ===== SHOP PAGE FILTERING & SORTING LOGIC =====
    const applyFiltersAndSort = () => {
        let filteredProducts = [...products];

        // --- Filtering ---
        const activeFilters = {
            category: [],
            type: []
        };
        document.querySelectorAll('.filter-checkbox:checked').forEach(checkbox => {
            activeFilters[checkbox.dataset.filter].push(checkbox.value);
        });

        if (activeFilters.category.length > 0) {
            filteredProducts = filteredProducts.filter(p => activeFilters.category.includes(p.category));
        }
        if (activeFilters.type.length > 0) {
            filteredProducts = filteredProducts.filter(p => activeFilters.type.includes(p.type));
        }

        const priceRange = document.getElementById('price-range');
        if (priceRange) {
            const maxPrice = parseInt(priceRange.value);
            filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
        }

        // --- Sorting ---
        const sortValue = document.getElementById('sort-select').value;
        if (sortValue === 'price-asc') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'price-desc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortValue === 'trending') {
            filteredProducts = filteredProducts.filter(p => p.trending);
        } else if (sortValue === 'best-selling') {
            filteredProducts = filteredProducts.filter(p => p.bestSelling);
        }

        renderProductGrid('shop-products-container', filteredProducts);
    };

    // ===== EVENT LISTENERS =====
    document.body.addEventListener('input', (e) => {
        if (e.target.matches('#quantity-slider')) {
            const quantityValue = document.getElementById('quantity-value');
            if (quantityValue) {
                quantityValue.textContent = e.target.value;
            }
        }
        // Price slider ki value dikhayein, lekin filter apply na karein
        if(e.target.matches('#price-range')) {
            document.getElementById('price-value').textContent = e.target.value;
        }
    });
    
    document.body.addEventListener('change', (e) => {
        // Sirf sort select karne par turant apply karein
        if(e.target.matches('#sort-select')) {
            applyFiltersAndSort();
        }
    });

    document.body.addEventListener('click', (e) => {
        if(e.target.matches('#clear-filters-btn')) {
            document.querySelectorAll('.filter-checkbox').forEach(c => c.checked = false);
            const priceRange = document.getElementById('price-range');
            if(priceRange) {
                priceRange.value = priceRange.max;
                document.getElementById('price-value').textContent = priceRange.max;
            }
            return; // Sirf clear karein, apply nahi
        }
        
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

        // Baki sabhi buttons ka logic
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
            const orderId = parseInt(btn.dataset.orderId);
            removeOrder(orderId);
        }
    });
    // ===== INITIALIZE PAGE =====
    const pageId = document.body.id;
    if (pageId === 'home-page-body') {
        renderProductGrid('featured-products-container', products.slice(0, 4));
        startBannerSlider(); // <-- ADD THIS LINE
    } else if (pageId === 'shop-page-body') {
    applyFiltersAndSort();
    setupFilterModal(); // Modal ko setup karne ke liye is line ko jodein
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
//////////////////////////////////////////////////////////////////////////////////
// Add this new function to main.js
// REPLACE your old startBannerSlider function with this new one

const startBannerSlider = () => {
    const bannerImageEl = document.getElementById('banner-image');
    const indicatorsContainer = document.getElementById('banner-indicators');
    
    // Exit if the necessary elements aren't on the page
    if (!bannerImageEl || !indicatorsContainer) return;

    // 1. Create a dot for each banner image
    indicatorsContainer.innerHTML = ''; // Clear any existing dots first
    bannerImages.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('indicator-dot');
        indicatorsContainer.appendChild(dot);
    });

    const dots = indicatorsContainer.querySelectorAll('.indicator-dot');

    // 2. Function to update the active dot
    const updateActiveIndicator = (index) => {
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    };

    let currentBannerIndex = 0;
    updateActiveIndicator(currentBannerIndex); // Set the first dot as active initially

    // 3. Set the interval to change slide and update indicator
    setInterval(() => {
        currentBannerIndex = (currentBannerIndex + 1) % bannerImages.length;
        bannerImageEl.src = bannerImages[currentBannerIndex];
        updateActiveIndicator(currentBannerIndex);
    }, 1500); // Note: I increased this to 3 seconds for a better user experience.
};
