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

});
