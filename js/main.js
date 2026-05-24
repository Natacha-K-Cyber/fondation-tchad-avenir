/* ===================================
   Fondation Tchad-Avenir — JS v2
   Animations dynamiques + interactions
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Header scroll effect ---
    const header = document.getElementById('header');
    let lastScroll = 0;

    const onScroll = () => {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 60);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- Hero Slider ---
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
        prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goToSlide(parseInt(dot.dataset.slide));
            resetAutoSlide();
        });
    });

    // Swipe support for mobile
    let touchStartX = 0;
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
        heroEl.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        heroEl.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? nextSlide() : prevSlide();
                resetAutoSlide();
            }
        }, { passive: true });
    }

    startAutoSlide();

    // Blurred backdrop: set --slide-bg CSS variable from each slide's img src
    document.querySelectorAll('.hero-slide').forEach(slide => {
        const img = slide.querySelector('img');
        if (img) slide.style.setProperty('--slide-bg', `url("${img.getAttribute('src')}")`);
    });

    // Mobile: tap to flip testimonial cards (hover doesn't work on touch devices)
    document.querySelectorAll('.temoignage-card').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('flipped'));
    });

    // --- Mobile navigation ---
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');
    let overlay = null;

    function openNav() {
        nav.classList.add('active');
        navToggle.classList.add('active');
        // Create backdrop overlay
        overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:999;opacity:0;transition:opacity 0.3s';
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.style.opacity = '1');
        overlay.addEventListener('click', closeNav);
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        nav.classList.remove('active');
        navToggle.classList.remove('active');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.remove(); overlay = null; }, 300);
        }
        document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', () => {
        nav.classList.contains('active') ? closeNav() : openNav();
    });

    nav.querySelectorAll('.nav-link, .nav-dropdown-link').forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // --- Smooth scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const top = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Animated counters ---
    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target);
        if (!target || el.dataset.animated) return;
        el.dataset.animated = 'true';
        const duration = 2200;
        const start = performance.now();

        const update = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };

    // --- Scroll Reveal System ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    // Counter observer
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

    // Auto-apply reveal classes to elements
    const revealConfig = [
        { selector: '.stat', anim: 'reveal', stagger: 0.15 },
        { selector: '.result-item', anim: 'reveal', stagger: 0.12 },
        /* temoignage-card: pas de reveal (preserve-3d incompatible avec opacity) */
        { selector: '.action-card', anim: 'reveal', stagger: 0.2 },
        { selector: '.action-highlight', anim: 'reveal', stagger: 0 },
        { selector: '.conseil-member', anim: 'reveal', stagger: 0.08 },
        { selector: '.don-card', anim: 'reveal', stagger: 0.15 },
        { selector: '.don-amount', anim: 'reveal', stagger: 0.1 },
        { selector: '.contact-item', anim: 'reveal', stagger: 0.12 },
        { selector: '.don-budget', anim: 'reveal', stagger: 0 },
        { selector: '.conseil-info', anim: 'reveal', stagger: 0 },
        { selector: '.value-pill', anim: 'reveal-scale', stagger: 0.08 },
        { selector: '.galerie-item', anim: 'reveal-scale', stagger: 0.08 },
        { selector: '.actu-card', anim: 'reveal', stagger: 0.15 },
    ];

    revealConfig.forEach(({ selector, anim, stagger }) => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add(anim);
            el.style.transitionDelay = `${i * stagger}s`;
            revealObserver.observe(el);
        });
    });

    // Special reveal for split layouts
    document.querySelectorAll('.impact-image-block, .mission-image-block').forEach(el => {
        el.classList.add('reveal-left');
        revealObserver.observe(el);
    });

    document.querySelectorAll('.impact-text-block, .mission-text-block').forEach(el => {
        el.classList.add('reveal-right');
        revealObserver.observe(el);
    });

    // --- Active nav highlight ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const highlightNav = () => {
        const scrollPos = window.scrollY + 150;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.style.color = '';
                    if (link.getAttribute('href') === `#${id}` && !link.classList.contains('nav-link--cta')) {
                        link.style.color = 'var(--color-primary)';
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });

    // hero-content-bottom supprimé (design split hero)

    // --- Contact form ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(contactForm).entries());
            const subject = encodeURIComponent(`[Tchad-Avenir] ${data.subject} — ${data.name}`);
            const body = encodeURIComponent(
                `Nom : ${data.name}\nEmail : ${data.email}\nSujet : ${data.subject}\n\nMessage :\n${data.message}`
            );
            window.location.href = `mailto:contact@tchadavenir.ch?subject=${subject}&body=${body}`;

            const btn = contactForm.querySelector('button[type="submit"]');
            const orig = btn.textContent;
            btn.textContent = 'Votre client email va s\'ouvrir...';
            btn.style.background = 'var(--color-secondary)';
            btn.style.color = '#fff';
            btn.style.borderColor = 'var(--color-secondary)';
            setTimeout(() => {
                btn.textContent = orig;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }, 4000);
        });
    }

    // --- Budget bar animation ---
    const budgetBar = document.querySelector('.budget-bar');
    if (budgetBar) {
        const segments = budgetBar.querySelectorAll('.budget-segment');
        segments.forEach(seg => {
            const w = seg.style.width;
            seg.style.width = '0';
            seg.dataset.width = w;
        });

        const budgetObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    segments.forEach((seg, i) => {
                        setTimeout(() => {
                            seg.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
                            seg.style.width = seg.dataset.width;
                        }, i * 150);
                    });
                    budgetObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        budgetObserver.observe(budgetBar);
    }
});

// --- Copy IBAN ---
function copyIBAN() {
    const iban = document.getElementById('iban').textContent;
    navigator.clipboard.writeText(iban.replace(/\s/g, '')).then(() => {
        const btn = document.querySelector('.btn-copy');
        const svg = btn.innerHTML;
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.style.background = 'rgba(42,122,95,0.4)';
        setTimeout(() => {
            btn.innerHTML = svg;
            btn.style.background = '';
        }, 2000);
    });
}
