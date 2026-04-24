/* ===================================================
   SPICE & SIZZLE DINDIGUL — JAVASCRIPT
   Cinematic Intro + Orchestrated Home Reveal
   Full-Page Scroll + Scroll-Snap + Replay Reveals
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       VIDEO INTRO — CINEMATIC EXPERIENCE
       ============================================================ */
    const videoIntro = document.getElementById('video-intro');
    const introVideo = document.getElementById('intro-video');
    const skipBtn = document.getElementById('skip-intro');
    const introLogo = document.getElementById('intro-logo');
    const introProgress = document.getElementById('intro-progress');
    const mainNav = document.getElementById('main-nav');
    const scrollDotsNav = document.getElementById('scroll-dots');

    let introDismissed = false;

    // Block scroll while intro plays
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Add letterbox bars after a short delay for cinematic feel
    setTimeout(() => {
        videoIntro.classList.add('letterbox');
    }, 300);

    // Show the logo watermark at 40% of the video
    function showLogoAtMidpoint() {
        if (!introVideo.duration || isNaN(introVideo.duration)) return;
        const midpoint = introVideo.duration * 0.35;
        if (introVideo.currentTime >= midpoint && introLogo) {
            introLogo.classList.add('show');
        }
    }

    // Update progress bar
    function updateProgress() {
        if (!introVideo.duration || isNaN(introVideo.duration)) return;
        const pct = (introVideo.currentTime / introVideo.duration) * 100;
        if (introProgress) {
            introProgress.style.width = pct + '%';
        }
        showLogoAtMidpoint();
    }

    introVideo.addEventListener('timeupdate', updateProgress);

    // ---- Dismiss Intro (cinematic iris-wipe + orchestrated home reveal) ----
    function dismissIntro() {
        if (introDismissed) return;
        introDismissed = true;

        // Flash the progress bar to full
        if (introProgress) introProgress.style.width = '100%';

        // Brief pause then wipe away
        setTimeout(() => {
            videoIntro.classList.add('hidden');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';

            // After the iris closes, begin the home page reveal orchestration
            setTimeout(() => {
                revealHomePage();
                videoIntro.style.display = 'none';
            }, 1400);
        }, 300);
    }

    // Auto-dismiss when video ends
    introVideo.addEventListener('ended', () => {
        // Hold the last frame for a moment
        setTimeout(dismissIntro, 600);
    });

    // Skip button
    skipBtn.addEventListener('click', dismissIntro);

    // Fallback: auto-dismiss after 12s if video fails
    setTimeout(() => {
        if (!introDismissed) dismissIntro();
    }, 12000);


    /* ============================================================
       ORCHESTRATED HOME PAGE REVEAL
       Elements fly in with staggered timings after intro dismisses
       ============================================================ */
    function revealHomePage() {
        const homeBg = document.querySelector('.home-bg');
        const tagline = document.querySelector('.home-tagline');
        const title = document.querySelector('.home-title');
        const desc = document.querySelector('.home-desc');
        const btnCall = document.querySelector('.btn-call');
        const homeRight = document.querySelector('.home-right');
        const colorBars = document.querySelector('.color-bars');
        const scrollInd = document.getElementById('scroll-indicator');

        // 1. Background ken-burns zoom in
        setTimeout(() => {
            if (homeBg) homeBg.classList.add('animate-in');
        }, 100);

        // 2. Hero image scales in with a dramatic entrance
        setTimeout(() => {
            if (homeRight) homeRight.classList.add('animate-in');
        }, 400);

        // 3. Tagline slides up
        setTimeout(() => {
            if (tagline) tagline.classList.add('animate-in');
        }, 700);

        // 4. Title slides up
        setTimeout(() => {
            if (title) title.classList.add('animate-in');
        }, 900);

        // 5. Description slides up
        setTimeout(() => {
            if (desc) desc.classList.add('animate-in');
        }, 1100);

        // 6. CTA button pops in
        setTimeout(() => {
            if (btnCall) btnCall.classList.add('animate-in');
        }, 1350);

        // 7. Color bars animate with a wipe
        setTimeout(() => {
            if (colorBars) colorBars.classList.add('animate-in');
        }, 800);

        // 8. Scroll indicator fades in
        setTimeout(() => {
            if (scrollInd) scrollInd.classList.add('animate-in');
        }, 1800);

        // 9. Nav slides down from top
        setTimeout(() => {
            if (mainNav) mainNav.classList.add('nav-visible');
        }, 1200);

        // 10. Scroll dots fade in
        setTimeout(() => {
            if (scrollDotsNav) scrollDotsNav.classList.add('visible');
        }, 1600);
    }


    /* ---------- SECTIONS & NAV ---------- */
    const sections = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('nav-toggle');
    const navLinksUl = document.getElementById('nav-links');
    const scrollDots = document.querySelectorAll('.scroll-dot');
    const scrollIndicator = document.getElementById('scroll-indicator');

    /* ---------- SCROLL-TO on nav link click ---------- */
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.page;
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
            // Close mobile menu
            navLinksUl.classList.remove('open');
            navToggle.classList.remove('open');
        });
    });

    /* ---------- SCROLL-TO on dot click ---------- */
    scrollDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.dataset.target;
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ---------- SCROLL-DOWN indicator click ---------- */
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const about = document.getElementById('about');
            if (about) about.scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* ---------- HAMBURGER TOGGLE ---------- */
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navLinksUl.classList.toggle('open');
    });

    // Close menu on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#main-nav')) {
            navToggle.classList.remove('open');
            navLinksUl.classList.remove('open');
        }
    });


    /* ---------- INTERSECTION OBSERVER: Active section tracking ---------- */
    const sectionIds = ['home', 'about', 'menu', 'contact'];

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                // Update nav links
                navLinks.forEach(l => {
                    l.classList.toggle('active', l.dataset.page === id);
                });
                // Update scroll dots
                scrollDots.forEach(d => {
                    d.classList.toggle('active', d.dataset.target === id);
                });
                // Update URL hash silently
                history.replaceState(null, '', '#' + id);
            }
        });
    }, {
        threshold: 0.45
    });

    sections.forEach(section => {
        if (sectionIds.includes(section.id)) {
            sectionObserver.observe(section);
        }
    });


    /* ==========================================================
       SCROLL REVEAL — REPLAYS EVERY TIME ELEMENTS SCROLL IN/OUT
       ========================================================== */

    function setupScrollReveal() {
        const revealElements = [];

        // ---- About section ----
        const aboutHeader = document.querySelector('#about .section-header');
        if (aboutHeader) {
            aboutHeader.classList.add('scroll-reveal', 'scroll-reveal--up');
            revealElements.push(aboutHeader);
        }

        document.querySelectorAll('.about-card').forEach((el, i) => {
            el.classList.add('scroll-reveal', 'scroll-reveal--up', `scroll-reveal--d${i + 1}`);
            revealElements.push(el);
        });

        // ---- Menu section ----
        const menuHeader = document.querySelector('#menu .section-header');
        if (menuHeader) {
            menuHeader.classList.add('scroll-reveal', 'scroll-reveal--up');
            revealElements.push(menuHeader);
        }

        const menuCategories = document.querySelector('.menu-categories');
        if (menuCategories) {
            menuCategories.classList.add('scroll-reveal', 'scroll-reveal--up', 'scroll-reveal--d1');
            revealElements.push(menuCategories);
        }

        document.querySelectorAll('.menu-card').forEach((el, i) => {
            el.classList.add('scroll-reveal', 'scroll-reveal--scale', `scroll-reveal--d${(i % 4) + 1}`);
            revealElements.push(el);
        });

        // ---- Contact section ----
        const contactHeader = document.querySelector('#contact .section-header');
        if (contactHeader) {
            contactHeader.classList.add('scroll-reveal', 'scroll-reveal--up');
            revealElements.push(contactHeader);
        }

        document.querySelectorAll('.contact-card').forEach((el, i) => {
            el.classList.add('scroll-reveal', 'scroll-reveal--left', `scroll-reveal--d${i + 1}`);
            revealElements.push(el);
        });

        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.classList.add('scroll-reveal', 'scroll-reveal--right', 'scroll-reveal--d2');
            revealElements.push(contactForm);
        }

        const footer = document.getElementById('main-footer');
        if (footer) {
            footer.classList.add('scroll-reveal', 'scroll-reveal--up');
            revealElements.push(footer);
        }

        // Observer — does NOT unobserve, so animations replay
        const scrollRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        revealElements.forEach(el => scrollRevealObserver.observe(el));
    }

    setupScrollReveal();


    /* ---------- MENU CATEGORY TABS ---------- */
    const catBtns = document.querySelectorAll('.cat-btn');
    const menuGrids = document.querySelectorAll('.menu-grid');

    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.cat;

            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            menuGrids.forEach(grid => {
                grid.classList.remove('active');
                if (grid.id === `cat-${cat}`) {
                    grid.classList.add('active');
                    animateMenuCards(grid);
                }
            });
        });
    });

    function animateMenuCards(grid) {
        const cards = grid.querySelectorAll('.menu-card');
        cards.forEach((card, i) => {
            card.classList.remove('is-visible');
            card.style.opacity = '0';
            card.style.transform = 'scale(0.85)';
            setTimeout(() => {
                card.style.transition = 'opacity .45s cubic-bezier(.4,0,.2,1), transform .45s cubic-bezier(.4,0,.2,1)';
                card.style.transitionDelay = `${i * 0.08}s`;
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                setTimeout(() => {
                    card.classList.add('is-visible');
                    card.style.transition = '';
                    card.style.transitionDelay = '';
                    card.style.opacity = '';
                    card.style.transform = '';
                }, 500 + i * 80);
            }, 30);
        });
    }

    // Animate initial menu cards
    const initialGrid = document.querySelector('.menu-grid.active');
    if (initialGrid) animateMenuCards(initialGrid);


    /* ---------- CONTACT FORM ---------- */
    const contactFormEl = document.getElementById('contact-form');
    contactFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const message = document.getElementById('form-message').value.trim();

        if (!name || !email || !message) return;

        const btn = document.getElementById('btn-submit-contact');
        const orig = btn.textContent;
        btn.textContent = '✓ Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #2e7d32, #1b5e20)';

        setTimeout(() => {
            btn.textContent = orig;
            btn.style.background = '';
            contactFormEl.reset();
        }, 2500);
    });


    /* ---------- NAV SCROLL EFFECT ---------- */
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('main-nav');
        const scrollY = window.scrollY;

        if (scrollY > 60) {
            nav.style.background = 'rgba(26,14,9,.92)';
            nav.style.borderBottomColor = 'rgba(255,217,128,.12)';
        } else {
            nav.style.background = 'rgba(26,14,9,.7)';
            nav.style.borderBottomColor = 'rgba(255,217,128,.08)';
        }

        // Fade out scroll indicator when scrolling down
        if (scrollIndicator) {
            scrollIndicator.style.opacity = scrollY > 100 ? '0' : '';
            scrollIndicator.style.pointerEvents = scrollY > 100 ? 'none' : '';
        }
    });


    /* ---------- PARALLAX SUBTLE EFFECT ON BACKGROUNDS ---------- */
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const homeBg = document.querySelector('.home-bg');
        const aboutBg = document.querySelector('.about-bg');
        const contactBg = document.querySelector('.contact-bg');

        if (homeBg) {
            homeBg.style.transform = `translateY(${scrollY * 0.15}px)`;
        }
        if (aboutBg) {
            const aboutTop = document.getElementById('about').offsetTop;
            const diff = scrollY - aboutTop;
            aboutBg.style.transform = `translateY(${diff * 0.1}px)`;
        }
        if (contactBg) {
            const contactTop = document.getElementById('contact').offsetTop;
            const diff = scrollY - contactTop;
            contactBg.style.transform = `translateY(${diff * 0.1}px)`;
        }
    });


    /* ---------- INITIAL PAGE FROM HASH ---------- */
    const hash = location.hash.replace('#', '');
    if (hash) {
        const target = document.getElementById(hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'instant' });
            }, 100);
        }
    }


    /* ============================================================
       PHASE 3: ORDERING SYSTEM
       Dynamic Menu, Shopping Cart, Checkout, Toast
       ============================================================ */

    // ── Auth State ──
    let authToken = sessionStorage.getItem('authToken') || null;
    let authUser = JSON.parse(sessionStorage.getItem('authUser') || 'null');

    function getCSRFToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) return meta.getAttribute('content');
        const match = document.cookie.match(/csrftoken=([^;]+)/);
        return match ? match[1] : '';
    }

    function getAuthHeaders() {
        const h = { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() };
        if (authToken) h['Authorization'] = 'Token ' + authToken;
        return h;
    }

    function isLoggedIn() { return !!authToken; }

    function setAuthState(token, user) {
        authToken = token;
        authUser = user;
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('authUser', JSON.stringify(user));
        updateNavAuthUI();
    }

    function clearAuthState() {
        authToken = null;
        authUser = null;
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('authUser');
        updateNavAuthUI();
    }

    function updateNavAuthUI() {
        const btn = document.getElementById('nav-auth-btn');
        const label = document.getElementById('nav-auth-label');
        const myOrdersBtn = document.getElementById('nav-my-orders');
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (isLoggedIn()) {
            btn.classList.add('logged-in');
            label.textContent = authUser?.username || 'Account';
            myOrdersBtn.classList.add('visible');
            myOrdersBtn.style.display = '';
            if (logoutBtn) { logoutBtn.classList.add('visible'); logoutBtn.style.display = ''; }
        } else {
            btn.classList.remove('logged-in');
            label.textContent = 'Login';
            myOrdersBtn.classList.remove('visible');
            myOrdersBtn.style.display = 'none';
            if (logoutBtn) { logoutBtn.classList.remove('visible'); logoutBtn.style.display = 'none'; }
        }
    }

    updateNavAuthUI();

    // Logout button handler
    const navLogoutBtn = document.getElementById('nav-logout-btn');
    if (navLogoutBtn) {
        navLogoutBtn.addEventListener('click', () => {
            clearAuthState();
            showToast('Logged out successfully.');
        });
    }

    // ── Cart State ──
    let cartItems = [];

    // ── DOM References ──
    const cartFab = document.getElementById('cart-fab');
    const cartBadge = document.getElementById('cart-badge');
    const cartModal = document.getElementById('cart-modal');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const btnCheckout = document.getElementById('btn-checkout');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutOverlay = document.getElementById('checkout-overlay');
    const checkoutClose = document.getElementById('checkout-close');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutSummary = document.getElementById('checkout-summary');
    const checkoutTotalPrice = document.getElementById('checkout-total-price');
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');


    /* ─────────────────────────────────────────────
       DYNAMIC MENU — Fetch from API
       ───────────────────────────────────────────── */

    async function fetchMenu() {
        try {
            const res = await fetch('/api/menu/');
            if (!res.ok) throw new Error('Failed to fetch menu');
            const items = await res.json();
            renderMenuFromAPI(items);
        } catch (err) {
            console.error('Menu fetch error:', err);
            // Fallback: show error in starters grid
            const startersGrid = document.getElementById('cat-starters');
            if (startersGrid) {
                startersGrid.innerHTML = `
                    <div class="menu-loading" style="animation:none; opacity:.8;">
                        ⚠️ Could not load menu. Please refresh the page.
                    </div>`;
            }
        }
    }

    function renderMenuFromAPI(items) {
        // Group items by category
        const categories = {};
        items.forEach(item => {
            if (!categories[item.category]) categories[item.category] = [];
            categories[item.category].push(item);
        });

        // Render each category grid
        const categoryMap = {
            'starters': 'cat-starters',
            'maincourse': 'cat-maincourse',
            'breads': 'cat-breads',
            'desserts': 'cat-desserts'
        };

        Object.keys(categoryMap).forEach(cat => {
            const grid = document.getElementById(categoryMap[cat]);
            if (!grid) return;

            const catItems = categories[cat] || [];
            if (!catItems.length) {
                grid.innerHTML = '<div class="menu-loading" style="animation:none; opacity:.6;">No items available</div>';
                return;
            }

            grid.innerHTML = catItems.map(item => {
                const imgSrc = item.image_url || '';
                const imgTag = imgSrc
                    ? `<img src="${imgSrc}" alt="${item.name}" loading="lazy">`
                    : `<div style="width:100%;height:100%;background:var(--dark-surface);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:2rem;">🍽️</div>`;

                return `
                <div class="menu-card" id="menu-item-${item.id}">
                    <div class="menu-card-img">${imgTag}</div>
                    <div class="menu-card-info">
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                        <span class="menu-price">₹${parseFloat(item.price).toFixed(0)}</span>
                        <button class="btn-add-cart" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-img="${imgSrc}" onclick="handleAddToCart(this)">
                            🛒 Add to Cart
                        </button>
                    </div>
                </div>`;
            }).join('');
        });

        // Re-setup scroll reveal for dynamically loaded cards
        reSetupMenuReveal();

        // Re-setup category tab animations
        reSetupCategoryTabs();

        // Animate initial grid
        const activeGrid = document.querySelector('.menu-grid.active');
        if (activeGrid) animateMenuCards(activeGrid);
    }

    function reSetupMenuReveal() {
        const scrollRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        document.querySelectorAll('.menu-card').forEach((el, i) => {
            el.classList.add('scroll-reveal', 'scroll-reveal--scale', `scroll-reveal--d${(i % 4) + 1}`);
            scrollRevealObserver.observe(el);
        });
    }

    function reSetupCategoryTabs() {
        const freshCatBtns = document.querySelectorAll('.cat-btn');
        const freshMenuGrids = document.querySelectorAll('.menu-grid');

        freshCatBtns.forEach(btn => {
            // Remove old listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                const cat = newBtn.dataset.cat;

                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                newBtn.classList.add('active');

                freshMenuGrids.forEach(grid => {
                    grid.classList.remove('active');
                    if (grid.id === `cat-${cat}`) {
                        grid.classList.add('active');
                        animateMenuCards(grid);
                    }
                });
            });
        });
    }


    /* ─────────────────────────────────────────────
       SHOPPING CART
       ───────────────────────────────────────────── */

    // Make addToCart globally accessible from onclick — AUTH GATED
    let pendingCartBtn = null;
    window.handleAddToCart = function(btn) {
        if (!isLoggedIn()) {
            pendingCartBtn = btn;
            openAuthModal();
            return;
        }
        const id = parseInt(btn.dataset.id);
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const img = btn.dataset.img;
        addToCart(id, name, price, img);
        btn.textContent = '✓ Added!';
        btn.classList.add('added');
        setTimeout(() => { btn.textContent = '🛒 Add to Cart'; btn.classList.remove('added'); }, 1200);
    };

    function addToCart(id, name, price, img) {
        const existing = cartItems.find(item => item.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cartItems.push({ id, name, price, img, quantity: 1 });
        }
        updateCartUI();
    }

    function removeFromCart(id) {
        cartItems = cartItems.filter(item => item.id !== id);
        updateCartUI();
    }

    function updateQuantity(id, delta) {
        const item = cartItems.find(i => i.id === id);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        updateCartUI();
    }

    // Make these globally accessible for onclick handlers
    window.removeFromCart = removeFromCart;
    window.updateQuantity = updateQuantity;

    function getCartTotal() {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    function getCartCount() {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    function updateCartUI() {
        const count = getCartCount();
        const total = getCartTotal();

        // Update badge
        cartBadge.textContent = count;
        if (count > 0) {
            cartBadge.classList.add('has-items');
        } else {
            cartBadge.classList.remove('has-items');
        }

        // Update cart items list
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <span class="cart-empty-icon">🍽️</span>
                    <p>Your cart is empty</p>
                    <small>Add some delicious items from our menu!</small>
                </div>`;
            cartFooter.style.display = 'none';
        } else {
            cartItemsContainer.innerHTML = cartItems.map((item, i) => `
                <div class="cart-item" style="animation-delay:${i * 0.05}s">
                    <div class="cart-item-img">
                        ${item.img ? `<img src="${item.img}" alt="${item.name}">` : '<div style="width:100%;height:100%;background:var(--dark-card);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🍽️</div>'}
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(0)}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity(${item.id}, -1)" aria-label="Decrease quantity">−</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" aria-label="Increase quantity">+</button>
                        <button class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Remove item">✕</button>
                    </div>
                </div>
            `).join('');
            cartFooter.style.display = 'block';
        }

        // Update total
        cartTotalPrice.textContent = `₹${total.toFixed(0)}`;
    }


    /* ─────────────────────────────────────────────
       CART PANEL — Open/Close
       ───────────────────────────────────────────── */

    function openCart() {
        cartModal.classList.add('open');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }

    function closeCart() {
        cartModal.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }

    if (cartFab) cartFab.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);


    /* ─────────────────────────────────────────────
       CHECKOUT MODAL — Open/Close
       ───────────────────────────────────────────── */

    function openCheckout() {
        // Populate checkout summary
        checkoutSummary.innerHTML = cartItems.map(item => `
            <div class="checkout-summary-item">
                <div><span class="checkout-summary-qty">${item.quantity}×</span> ${item.name}</div>
                <span>₹${(item.price * item.quantity).toFixed(0)}</span>
            </div>
        `).join('');

        checkoutTotalPrice.textContent = `₹${getCartTotal().toFixed(0)}`;

        closeCart();
        setTimeout(() => {
            checkoutModal.classList.add('open');
            checkoutOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        }, 200);
    }

    function closeCheckout() {
        checkoutModal.classList.remove('open');
        checkoutOverlay.classList.remove('open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }

    if (btnCheckout) btnCheckout.addEventListener('click', openCheckout);
    if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);
    if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckout);


    /* ─────────────────────────────────────────────
       CHECKOUT — Submit Order
       ───────────────────────────────────────────── */

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const customerName = document.getElementById('checkout-name').value.trim();
            const customerPhone = document.getElementById('checkout-phone').value.trim();

            if (!customerName || !customerPhone) return;
            if (cartItems.length === 0) return;

            const orderBtn = document.getElementById('btn-place-order');
            const btnText = orderBtn.querySelector('.btn-order-text');
            const btnSpinner = orderBtn.querySelector('.btn-order-spinner');

            // Show loading state
            orderBtn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline';

            const payload = {
                customer_name: customerName,
                customer_phone: customerPhone,
                items: cartItems.map(item => ({
                    menu_item_id: item.id,
                    quantity: item.quantity,
                })),
            };

            try {
                const res = await fetch('/api/orders/', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload),
                });
                if (res.status === 201) {
                    const data = await res.json();
                    cartItems = [];
                    updateCartUI();
                    closeCheckout();
                    checkoutForm.reset();
                    showToast('✅ Your order has been placed successfully!');
                    setTimeout(() => openMyOrders(), 600);
                } else if (res.status === 401 || res.status === 403) {
                    showToast('❌ Please log in to place an order.', true);
                    clearAuthState();
                    setTimeout(() => openAuthModal(), 500);
                } else {
                    const errData = await res.json();
                    const errMsg = errData.items ? errData.items.join(', ') : (errData.detail || JSON.stringify(errData));
                    showToast(`❌ ${errMsg}`, true);
                }
            } catch (err) {
                showToast('❌ Network error. Please try again.', true);
                console.error('Order submit error:', err);
            } finally {
                orderBtn.disabled = false;
                btnText.style.display = 'inline';
                btnSpinner.style.display = 'none';
            }
        });
    }


    /* ─────────────────────────────────────────────
       TOAST NOTIFICATION
       ───────────────────────────────────────────── */

    function showToast(message, isError = false) {
        const toastIcon = toastNotification.querySelector('.toast-icon');
        toastMessage.textContent = message;
        toastNotification.classList.remove('error');

        if (isError) {
            toastNotification.classList.add('error');
            toastIcon.textContent = '❌';
        } else {
            toastIcon.textContent = '✅';
        }

        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 4000);
    }


    /* ─────────────────────────────────────────────
       AUTH MODAL LOGIC — SECURITY & UX ENHANCED
       ───────────────────────────────────────────── */
    const authModal = document.getElementById('auth-modal');
    const authOverlay = document.getElementById('auth-overlay');
    const authClose = document.getElementById('auth-close');
    const authTabLogin = document.getElementById('auth-tab-login');
    const authTabRegister = document.getElementById('auth-tab-register');
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const navAuthBtn = document.getElementById('nav-auth-btn');
    const navMyOrdersBtn = document.getElementById('nav-my-orders');

    // ── Validation helpers ──
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const MIN_PASSWORD_LENGTH = 8;

    function setFieldError(inputId, errorId, message) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        if (input) input.closest('.auth-form-group').classList.add('has-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('visible');
        }
    }

    function clearFieldError(inputId, errorId) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        if (input) input.closest('.auth-form-group').classList.remove('has-error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
    }

    function clearAllFieldErrors(prefix) {
        const ids = prefix === 'login'
            ? [['login-username', 'login-username-error'], ['login-password', 'login-password-error']]
            : [['register-username', 'register-username-error'], ['register-email', 'register-email-error'], ['register-password', 'register-password-error'], ['register-confirm-password', 'register-confirm-password-error']];
        ids.forEach(([inputId, errorId]) => clearFieldError(inputId, errorId));
        const formErr = document.getElementById(prefix + '-error');
        if (formErr) formErr.textContent = '';
        // Also clear non-field error banner
        const banner = document.getElementById(prefix + '-error-banner');
        if (banner) { banner.textContent = ''; banner.classList.remove('visible'); banner.style.display = 'none'; }
    }

    // Clear errors on input focus
    document.querySelectorAll('.auth-form-group input').forEach(input => {
        input.addEventListener('focus', () => {
            const group = input.closest('.auth-form-group');
            group.classList.remove('has-error');
            const errEl = group.querySelector('.auth-field-error');
            if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
        });
    });

    // ── Password Show/Hide Toggle ──
    document.querySelectorAll('.auth-password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            const eyeOpen = btn.querySelector('.eye-open');
            const eyeClosed = btn.querySelector('.eye-closed');
            if (input.type === 'password') {
                input.type = 'text';
                eyeOpen.style.display = 'none';
                eyeClosed.style.display = 'block';
            } else {
                input.type = 'password';
                eyeOpen.style.display = 'block';
                eyeClosed.style.display = 'none';
            }
            input.focus();
        });
    });

    function openAuthModal(tab) {
        authModal.classList.add('open');
        authOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        clearAllFieldErrors('login');
        clearAllFieldErrors('register');
        if (tab === 'register') switchAuthTab('register');
        else switchAuthTab('login');
    }
    function closeAuthModal() {
        authModal.classList.remove('open');
        authOverlay.classList.remove('open');
        document.body.style.overflow = '';
        clearAllFieldErrors('login');
        clearAllFieldErrors('register');
    }
    function switchAuthTab(tab) {
        clearAllFieldErrors('login');
        clearAllFieldErrors('register');
        if (tab === 'register') {
            authTabRegister.classList.add('active'); authTabLogin.classList.remove('active');
            registerForm.style.display = ''; loginForm.style.display = 'none';
        } else {
            authTabLogin.classList.add('active'); authTabRegister.classList.remove('active');
            loginForm.style.display = ''; registerForm.style.display = 'none';
        }
    }
    if (authClose) authClose.addEventListener('click', closeAuthModal);
    if (authOverlay) authOverlay.addEventListener('click', closeAuthModal);
    if (authTabLogin) authTabLogin.addEventListener('click', () => switchAuthTab('login'));
    if (authTabRegister) authTabRegister.addEventListener('click', () => switchAuthTab('register'));
    if (navAuthBtn) navAuthBtn.addEventListener('click', () => {
        if (!isLoggedIn()) openAuthModal();
    });
    if (navMyOrdersBtn) navMyOrdersBtn.addEventListener('click', () => openMyOrders());

    // ── Login form submit (with client-side validation & rate-limit handling) ──
    let loginSubmitting = false;
    if (loginForm) loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (loginSubmitting) return; // Prevent double-submit

        clearAllFieldErrors('login');
        const errEl = document.getElementById('login-error');
        const btn = document.getElementById('login-submit-btn');
        const txt = btn.querySelector('.auth-btn-text');
        const spin = btn.querySelector('.auth-btn-spinner');

        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        // ── Client-side validation ──
        let hasError = false;
        if (!username) {
            setFieldError('login-username', 'login-username-error', 'Username or email is required.');
            hasError = true;
        }
        if (!password) {
            setFieldError('login-password', 'login-password-error', 'Password is required.');
            hasError = true;
        } else if (password.length < MIN_PASSWORD_LENGTH) {
            setFieldError('login-password', 'login-password-error', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
            hasError = true;
        }
        if (hasError) return;

        // ── Submit ──
        loginSubmitting = true;
        btn.disabled = true; txt.style.display = 'none'; spin.style.display = 'inline';
        try {
            const res = await fetch('/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
                body: JSON.stringify({ username, password }),
            });

            if (res.status === 429) {
                // Rate limited
                const data = await res.json().catch(() => ({}));
                const wait = data.detail || 'Too many login attempts. Please try again shortly.';
                showToast(`⚠️ ${wait}`, true);
                return;
            }

            const data = await res.json();
            if (res.ok) {
                setAuthState(data.token, data.user);
                closeAuthModal(); loginForm.reset();
                showToast(`Welcome back, ${data.user.username}!`);
                if (pendingCartBtn) { handleAddToCart(pendingCartBtn); pendingCartBtn = null; }
            } else {
                errEl.textContent = data.error || 'Invalid email or password.';
                showToast('❌ ' + (data.error || 'Invalid email or password.'), true);
            }
        } catch {
            errEl.textContent = 'Network error. Please check your connection.';
            showToast('❌ Network error. Please try again.', true);
        } finally {
            loginSubmitting = false;
            btn.disabled = false; txt.style.display = 'inline'; spin.style.display = 'none';
        }
    });

    // ── Register form submit (with client-side + server-side field-specific errors) ──
    let registerSubmitting = false;

    /**
     * Maps API error keys to DOM element IDs.
     * The backend returns errors like: {"username": ["..."], "password": ["..."], "confirm_password": ["..."]}
     * We map each key to the corresponding register-{key}-error span.
     */
    const REGISTER_FIELD_MAP = {
        'username':         { input: 'register-username',          error: 'register-username-error' },
        'email':            { input: 'register-email',             error: 'register-email-error' },
        'password':         { input: 'register-password',          error: 'register-password-error' },
        'confirm_password': { input: 'register-confirm-password',  error: 'register-confirm-password-error' },
    };

    /**
     * Translates any remaining technical/developer-style error messages
     * into plain, user-friendly English that anyone can understand.
     */
    function friendlyMessage(msg) {
        if (!msg || typeof msg !== 'string') return msg;

        const TRANSLATIONS = {
            'This field may not be blank.':              'This field is required.',
            'This field is required.':                   'This field is required.',
            'Enter a valid email address.':              'That doesn\'t look like a valid email address.',
            'Ensure this field has at least 8 characters.': 'Password must be at least 8 characters long.',
            'This password is too short. It must contain at least 8 characters.': 'Password must be at least 8 characters long.',
            'This password is too common.':              'This password is too easy to guess. Please choose a stronger one.',
            'This password is entirely numeric.':        'Password can\'t be all numbers — please include some letters.',
        };

        // Exact match
        if (TRANSLATIONS[msg]) return TRANSLATIONS[msg];

        // Partial match (for messages that vary slightly)
        for (const [tech, friendly] of Object.entries(TRANSLATIONS)) {
            if (msg.toLowerCase().includes(tech.toLowerCase().replace(/\.$/, ''))) {
                return friendly;
            }
        }

        // Check for CSRF-related errors (should not reach users but just in case)
        if (msg.toLowerCase().includes('csrf')) {
            return 'Your session has expired. Please refresh the page and try again.';
        }

        return msg;
    }

    function displayRegistrationErrors(errors) {
        /**
         * Iterates the error payload from the API and injects user-friendly
         * messages into the DOM. Field errors go inline, non-field errors
         * go to the banner at the top of the form.
         */
        const nonFieldMessages = [];

        Object.keys(errors).forEach(key => {
            const messages = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
            // Translate each message to be user-friendly
            const friendly = messages.map(m => friendlyMessage(m));
            const joined = friendly.join(' ');

            if (REGISTER_FIELD_MAP[key]) {
                // Field-specific error — show inline below the input
                setFieldError(REGISTER_FIELD_MAP[key].input, REGISTER_FIELD_MAP[key].error, joined);
            } else if (key === 'non_field_errors' || key === 'error' || key === 'detail') {
                // General / non-field error
                nonFieldMessages.push(joined);
            } else {
                // Unknown field — show in the banner with a friendly prefix
                nonFieldMessages.push(joined);
            }
        });

        // Display non-field errors in the banner
        if (nonFieldMessages.length > 0) {
            const banner = document.getElementById('register-error-banner');
            if (banner) {
                banner.textContent = nonFieldMessages.join(' ');
                banner.style.display = '';
                // Trigger reflow then add visible class for smooth slide-in
                void banner.offsetHeight;
                banner.classList.add('visible');
            }
        }
    }

    if (registerForm) registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (registerSubmitting) return; // Prevent double-submit

        clearAllFieldErrors('register');
        const errEl = document.getElementById('register-error');
        const btn = document.getElementById('register-submit-btn');
        const txt = btn.querySelector('.auth-btn-text');
        const spin = btn.querySelector('.auth-btn-spinner');

        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // ── Client-side validation ──
        let hasError = false;
        if (!username) {
            setFieldError('register-username', 'register-username-error', 'Username is required.');
            hasError = true;
        }
        if (email && !EMAIL_REGEX.test(email)) {
            setFieldError('register-email', 'register-email-error', 'Please enter a valid email address.');
            hasError = true;
        }
        if (!password) {
            setFieldError('register-password', 'register-password-error', 'Password is required.');
            hasError = true;
        } else if (password.length < MIN_PASSWORD_LENGTH) {
            setFieldError('register-password', 'register-password-error', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
            hasError = true;
        }
        if (!confirmPassword) {
            setFieldError('register-confirm-password', 'register-confirm-password-error', 'Please confirm your password.');
            hasError = true;
        } else if (password && confirmPassword !== password) {
            setFieldError('register-confirm-password', 'register-confirm-password-error', 'Passwords do not match.');
            hasError = true;
        }
        if (hasError) return;

        // ── Submit ──
        registerSubmitting = true;
        btn.disabled = true; txt.style.display = 'none'; spin.style.display = 'inline';
        try {
            const res = await fetch('/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
                body: JSON.stringify({ username, email, password, confirm_password: confirmPassword }),
            });

            if (res.status === 429) {
                const data = await res.json().catch(() => ({}));
                const wait = data.detail || 'Too many attempts. Please wait a moment and try again.';
                showToast(`⚠️ ${friendlyMessage(wait)}`, true);
                return;
            }

            // Try to parse JSON — guard against HTML error pages
            let data;
            try {
                data = await res.json();
            } catch {
                // Server returned non-JSON (e.g. HTML CSRF error page)
                const banner = document.getElementById('register-error-banner');
                const msg = 'Something went wrong. Please refresh the page and try again.';
                if (banner) {
                    banner.textContent = msg;
                    banner.style.display = '';
                    void banner.offsetHeight;
                    banner.classList.add('visible');
                }
                showToast('❌ ' + msg, true);
                return;
            }

            if (res.ok) {
                setAuthState(data.token, data.user);
                closeAuthModal(); registerForm.reset();
                showToast(`Welcome, ${data.user.username}! Account created.`);
                if (pendingCartBtn) { handleAddToCart(pendingCartBtn); pendingCartBtn = null; }
            } else {
                // ── Field-specific error display from API ──
                displayRegistrationErrors(data);
                showToast('❌ Please fix the highlighted errors and try again.', true);
            }
        } catch {
            // Network failure — no response received at all
            const banner = document.getElementById('register-error-banner');
            const msg = 'Unable to connect to the server. Please check your internet connection and try again.';
            if (banner) {
                banner.textContent = msg;
                banner.style.display = '';
                void banner.offsetHeight;
                banner.classList.add('visible');
            }
            showToast('❌ Connection error. Please try again.', true);
        } finally {
            registerSubmitting = false;
            btn.disabled = false; txt.style.display = 'inline'; spin.style.display = 'none';
        }
    });


    /* ─────────────────────────────────────────────
       MY ORDERS MODAL
       ───────────────────────────────────────────── */
    const myordersModal = document.getElementById('myorders-modal');
    const myordersOverlay = document.getElementById('myorders-overlay');
    const myordersClose = document.getElementById('myorders-close');
    const myordersBody = document.getElementById('myorders-body');
    let myOrdersInterval = null;

    function openMyOrders() {
        if (!isLoggedIn()) { openAuthModal(); return; }
        myordersModal.classList.add('open');
        myordersOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        fetchMyOrders();
        myOrdersInterval = setInterval(fetchMyOrders, 5000);
    }
    window.openMyOrders = openMyOrders;

    function closeMyOrders() {
        myordersModal.classList.remove('open');
        myordersOverlay.classList.remove('open');
        document.body.style.overflow = '';
        if (myOrdersInterval) { clearInterval(myOrdersInterval); myOrdersInterval = null; }
    }
    if (myordersClose) myordersClose.addEventListener('click', closeMyOrders);
    if (myordersOverlay) myordersOverlay.addEventListener('click', closeMyOrders);

    async function fetchMyOrders() {
        try {
            const res = await fetch('/api/my-orders/', { headers: getAuthHeaders() });
            if (res.status === 401) { clearAuthState(); closeMyOrders(); openAuthModal(); return; }
            const orders = await res.json();
            renderMyOrders(orders);
        } catch (err) {
            myordersBody.innerHTML = '<div class="myorders-loading" style="animation:none">⚠️ Could not load orders.</div>';
        }
    }

    function getStatusBadge(status) {
        const s = status.toLowerCase();
        const icons = { pending: '⏳', preparing: '🔥', ready: '✅', 'out for delivery': '🚚', cancelled: '❌' };
        return `<span class="status-badge status-badge--${s.replace(/\s+/g, '-')}">${icons[s] || ''} ${status}</span>`;
    }

    // Cancel order (customer)
    window.cancelMyOrder = async function(orderId) {
        const btn = document.querySelector(`[data-cancel-id="${orderId}"]`);
        if (btn) { btn.disabled = true; btn.textContent = 'Cancelling...'; }
        try {
            const res = await fetch(`/api/orders/${orderId}/cancel/`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('✅ Order cancelled successfully.');
                fetchMyOrders();
            } else {
                showToast(`❌ ${data.error || 'Could not cancel order.'}`, true);
                if (btn) { btn.disabled = false; btn.textContent = '❌ Cancel Order'; }
            }
        } catch {
            showToast('❌ Network error. Please try again.', true);
            if (btn) { btn.disabled = false; btn.textContent = '❌ Cancel Order'; }
        }
    };

    // Grace period countdown timers
    let graceTimerInterval = null;

    function startGraceTimers() {
        if (graceTimerInterval) clearInterval(graceTimerInterval);
        graceTimerInterval = setInterval(() => {
            document.querySelectorAll('.grace-timer[data-created]').forEach(el => {
                const created = new Date(el.dataset.created).getTime();
                const now = Date.now();
                const elapsed = (now - created) / 1000;
                const remaining = Math.max(0, 120 - elapsed);
                const mins = Math.floor(remaining / 60);
                const secs = Math.floor(remaining % 60);
                const orderId = el.dataset.orderId;

                if (remaining <= 0) {
                    el.classList.add('expired');
                    el.textContent = '✅ Grace period ended';
                    // Hide cancel button, show message
                    const cancelBtn = document.querySelector(`[data-cancel-id="${orderId}"]`);
                    if (cancelBtn) cancelBtn.style.display = 'none';
                    const graceRow = el.closest('.myorder-grace-row');
                    if (graceRow && !graceRow.querySelector('.grace-expired-msg')) {
                        const msg = document.createElement('span');
                        msg.className = 'grace-expired-msg';
                        msg.textContent = '👨‍🍳 Kitchen is preparing your order';
                        graceRow.appendChild(msg);
                    }
                } else {
                    el.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                }
            });
        }, 1000);
    }

    function renderMyOrders(orders) {
        if (!orders.length) {
            myordersBody.innerHTML = `<div class="myorders-empty"><span class="myorders-empty-icon">📋</span><p>No orders yet. Start ordering from our menu!</p></div>`;
            return;
        }
        myordersBody.innerHTML = orders.map((order, i) => {
            const date = new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
            const itemsHtml = order.items.map(it =>
                `<div class="myorder-item-row"><div><span class="myorder-item-qty">${it.quantity}×</span> ${it.menu_item_name}</div><span>₹${parseFloat(it.subtotal).toFixed(0)}</span></div>`
            ).join('');

            // Grace period row for Pending orders
            let graceHtml = '';
            if (order.status === 'Pending') {
                const created = new Date(order.created_at).getTime();
                const elapsed = (Date.now() - created) / 1000;
                const remaining = Math.max(0, 120 - elapsed);

                if (remaining > 0) {
                    const mins = Math.floor(remaining / 60);
                    const secs = Math.floor(remaining % 60);
                    graceHtml = `
                    <div class="myorder-grace-row">
                        <span class="grace-timer" data-created="${order.created_at}" data-order-id="${order.id}">⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</span>
                        <button class="btn-cancel-order" data-cancel-id="${order.id}" onclick="cancelMyOrder(${order.id})">❌ Cancel Order</button>
                    </div>`;
                } else {
                    graceHtml = `
                    <div class="myorder-grace-row">
                        <span class="grace-timer expired" data-created="${order.created_at}" data-order-id="${order.id}">✅ Grace period ended</span>
                        <span class="grace-expired-msg">👨‍🍳 Kitchen is preparing your order</span>
                    </div>`;
                }
            }

            return `
            <div class="myorder-card" style="animation-delay:${i * 0.08}s">
                <div class="myorder-card-header">
                    <div><span class="myorder-id">Order #${order.id}</span><div class="myorder-date">${date}</div></div>
                    ${getStatusBadge(order.status)}
                </div>
                <div class="myorder-items-list">${itemsHtml}</div>
                <div class="myorder-total-row"><span>Total</span><span class="myorder-total-price">₹${parseFloat(order.total_price).toFixed(0)}</span></div>
                ${graceHtml}
            </div>`;
        }).join('') + '<div class="myorders-refresh-hint">Auto-refreshing every 5 seconds</div>';

        startGraceTimers();
    }


    /* ─────────────────────────────────────────────
       INITIALIZE
       ───────────────────────────────────────────── */

    fetchMenu();

});
