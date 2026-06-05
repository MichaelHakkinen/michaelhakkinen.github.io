document.addEventListener('DOMContentLoaded', () => {
    /* ──────────────────────────────
       NAVBAR: scroll effect
    ────────────────────────────── */
    const navbar = document.querySelector('#mainNav');

    const handleNavbarScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    /* ──────────────────────────────
       SMOOTH SCROLL for anchor links
    ────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            const offset = navbar.offsetHeight;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });

            // Close mobile menu if open
            const collapse = document.querySelector('.navbar-collapse');
            if (collapse && collapse.classList.contains('show')) {
                document.querySelector('.navbar-toggler')?.click();
            }
        });
    });

    /* ──────────────────────────────
       SCROLLSPY: highlight active nav
    ────────────────────────────── */
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.navbar-nav .nav-link');

    const scrollSpy = () => {
        const scrollY     = window.scrollY;
        const navH        = navbar.offsetHeight;
        const nearBottom  = (window.innerHeight + scrollY) >= document.documentElement.scrollHeight - 80;
        let current = '';

        if (nearBottom) {
            current = sections[sections.length - 1]?.id || '';
        } else {
            sections.forEach(sec => {
                if (scrollY >= sec.offsetTop - navH - 100) current = sec.id;
            });
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };

    window.addEventListener('scroll', scrollSpy, { passive: true });
    scrollSpy();

    /* ──────────────────────────────
       LANGUAGE TOGGLE (EN ↔ ID)
    ────────────────────────────── */
    const toggleBtn  = document.getElementById('langToggle');
    let currentLang  = 'en';

    const updateLangButton = () => {
        toggleBtn.innerHTML = currentLang === 'en'
            ? '<img src="flags/us.png" width="18" height="13" alt="EN"> EN'
            : '<img src="flags/id.png" width="18" height="13" alt="ID"> ID';
    };

    const applyLanguage = (lang) => {
        document.querySelectorAll('[data-en]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (!text) return;

            // Special case: CV download button (has data-en-label)
            if (el.id === 'cvDownload') {
                const label = el.getAttribute(`data-${lang}-label`);
                const href  = el.getAttribute(`data-${lang}`);
                if (label) {
                    el.querySelector('span').textContent = label;
                }
                if (href) el.setAttribute('href', href);
                return;
            }

            // Contains HTML tags → use innerHTML
            if (text.includes('<') && text.includes('>')) {
                el.innerHTML = text;
                return;
            }

            // Plain text
            el.textContent = text;
        });
    };

    if (toggleBtn) {
        updateLangButton();
        toggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'id' : 'en';
            updateLangButton();
            applyLanguage(currentLang);
        });
    }

    /* ──────────────────────────────
       PARTICLE CANVAS (hero)
    ────────────────────────────── */
    const canvas = document.createElement('canvas');
    canvas.id = 'heroParticles';
    canvas.style.cssText = `
        position:absolute; inset:0; width:100%; height:100%;
        pointer-events:none; z-index:1; opacity:0.55;
    `;
    const heroSection = document.getElementById('home');
    if (heroSection) heroSection.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    const resize = () => {
        W = canvas.width  = heroSection.offsetWidth;
        H = canvas.height = heroSection.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COLORS = ['rgba(79,142,247,', 'rgba(155,93,229,', 'rgba(0,212,255,'];

    class Particle {
        constructor() { this.reset(true); }
        reset(init = false) {
            this.x  = Math.random() * W;
            this.y  = init ? Math.random() * H : H + 10;
            this.r  = Math.random() * 1.8 + 0.4;
            this.vy = -(Math.random() * 0.35 + 0.1);
            this.vx = (Math.random() - 0.5) * 0.18;
            this.alpha = Math.random() * 0.5 + 0.15;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.y < -10) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `${this.color}${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 90; i++) particles.push(new Particle());

    const animateParticles = () => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    };
    animateParticles();

    /* ──────────────────────────────
       HERO CONTENT z-index fix
    ────────────────────────────── */
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) heroContent.style.position = 'relative';

    /* ──────────────────────────────
       TILT EFFECT on portfolio cards
    ────────────────────────────── */
    document.querySelectorAll('.portfolio-item').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const dx   = (e.clientX - cx) / (rect.width  / 2);
            const dy   = (e.clientY - cy) / (rect.height / 2);
            card.style.transform = `translateY(-8px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.01)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.15s ease, box-shadow 0.35s ease, border-color 0.35s ease';
        });
    });

    /* ──────────────────────────────
       TYPING EFFECT on hero subtitle
    ────────────────────────────── */
    const subtitleEl = document.querySelector('.hero-subtitle');
    if (subtitleEl) {
        const phrases = [
            'AI Engineer &nbsp;·&nbsp; Full-Stack Developer &nbsp;·&nbsp; NLP Researcher',
            'Python &nbsp;·&nbsp; PyTorch &nbsp;·&nbsp; TensorFlow &nbsp;·&nbsp; Laravel',
            'BERT &nbsp;·&nbsp; DeBERTa &nbsp;·&nbsp; Sentiment Analysis'
        ];
        let phraseIndex = 0;

        const cyclePhrase = () => {
            phraseIndex = (phraseIndex + 1) % phrases.length;
            subtitleEl.style.opacity = '0';
            subtitleEl.style.transform = 'translateY(8px)';
            setTimeout(() => {
                subtitleEl.innerHTML = phrases[phraseIndex];
                subtitleEl.style.opacity = '';
                subtitleEl.style.transform = '';
            }, 400);
        };

        subtitleEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        setInterval(cyclePhrase, 3800);
    }

    /* ──────────────────────────────
       COUNTER ANIMATION (on scroll)
    ────────────────────────────── */
    // Finds all <strong> text containing % or numbers in the about section
    // and animates them counting up when they enter viewport.
    const animateCounter = (el, target, suffix) => {
        const duration = 1400;
        const start    = performance.now();
        const update   = (time) => {
            const elapsed  = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el   = entry.target;
            const text = el.textContent.trim();
            const match = text.match(/^(\d+)(%|\+)?/);
            if (match) {
                const num    = parseInt(match[1], 10);
                const suffix = match[2] || '';
                animateCounter(el, num, suffix);
            }
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.resume-timeline-description strong').forEach(el => {
        if (/^\d/.test(el.textContent.trim())) counterObserver.observe(el);
    });

    /* ──────────────────────────────
       CURSOR GLOW (subtle)
    ────────────────────────────── */
    const glow = document.createElement('div');
    glow.style.cssText = `
        position:fixed; pointer-events:none; z-index:99999;
        width:300px; height:300px;
        border-radius:50%;
        background: radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%);
        transform: translate(-50%,-50%);
        transition: left 0.08s linear, top 0.08s linear;
        top:0; left:0;
    `;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
    });

});
