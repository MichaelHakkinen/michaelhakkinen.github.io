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
       PARTICLE CANVAS (hero) — 3D Shooting Stars with Mouse Deflection
    ────────────────────────────── */
    const canvas = document.createElement('canvas');
    canvas.id = 'heroParticles';
    canvas.style.cssText = `
        position:absolute; inset:0; width:100%; height:100%;
        pointer-events:none; z-index:1; opacity:0.75;
    `;
    const heroSection = document.getElementById('home');
    if (heroSection) heroSection.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H;
    let stars = [];
    const maxDepth = 1000;
    const starCount = 250; // Increased star count

    // Mouse tracking relative to the hero section
    let mouse = { x: -9999, y: -9999, active: false };

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
        mouse.active = false;
        mouse.x = -9999;
        mouse.y = -9999;
    }, { passive: true });

    const resize = () => {
        W = canvas.width  = heroSection.offsetWidth;
        H = canvas.height = heroSection.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COLORS = ['rgba(79, 142, 247, ', 'rgba(155, 93, 229, ', 'rgba(0, 212, 255, '];

    class Star {
        constructor() {
            this.reset(true);
        }

        reset(init = false) {
            // Distribute stars in a 3D box
            const spreadX = W * 1.5;
            const spreadY = H * 1.5;
            this.x = (Math.random() - 0.5) * spreadX;
            this.y = (Math.random() - 0.5) * spreadY;
            this.z = init ? Math.random() * maxDepth : maxDepth;

            this.vx = 0;
            this.vy = 0;
            this.speed = Math.random() * 1.5 + 1.2; // Decreased speed for a smoother, slower flow
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];

            this.prevX = this.x;
            this.prevY = this.y;
            this.prevZ = this.z;
        }

        update() {
            this.prevX = this.x;
            this.prevY = this.y;
            this.prevZ = this.z;

            // Move closer along Z, apply velocity deflection
            this.z -= this.speed;
            this.x += this.vx;
            this.y += this.vy;

            // Decay velocities
            this.vx *= 0.94;
            this.vy *= 0.94;

            const f = 450; // Focal length
            const centerX = W / 2;
            const centerY = H / 2;

            const screenX = centerX + (this.x / this.z) * f;
            const screenY = centerY + (this.y / this.z) * f;

            if (mouse.active) {
                const dx = screenX - mouse.x;
                const dy = screenY - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const repelRadius = 140;

                if (dist < repelRadius && dist > 1) {
                    const force = (repelRadius - dist) / repelRadius;
                    const push = force * force * 15;

                    const angle = Math.atan2(dy, dx);
                    const pushX = Math.cos(angle) * push;
                    const pushY = Math.sin(angle) * push;

                    const zScale = this.z / f;
                    this.vx += pushX * zScale * 0.75;
                    this.vy += pushY * zScale * 0.75;
                }
            }

            // Reset when star is too close or off-screen
            if (
                this.z <= 15 || 
                screenX < -150 || screenX > W + 150 || 
                screenY < -150 || screenY > H + 150
            ) {
                this.reset();
            }
        }

        draw() {
            const f = 450;
            const centerX = W / 2;
            const centerY = H / 2;

            const screenX = centerX + (this.x / this.z) * f;
            const screenY = centerY + (this.y / this.z) * f;

            const prevScreenX = centerX + (this.prevX / this.prevZ) * f;
            const prevScreenY = centerY + (this.prevY / this.prevZ) * f;

            const alpha = Math.min(1, (maxDepth - this.z) / 150) * 0.85;
            const size = Math.min(5, (1 - this.z / maxDepth) * 4.5 + 0.5);

            ctx.beginPath();
            ctx.moveTo(prevScreenX, prevScreenY);
            ctx.lineTo(screenX, screenY);
            ctx.strokeStyle = `${this.color}${alpha})`;
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.stroke();

            if (this.z < maxDepth * 0.55) {
                ctx.beginPath();
                ctx.arc(screenX, screenY, size * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            }
        }
    }

    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }

    const animateParticles = () => {
        ctx.clearRect(0, 0, W, H);
        stars.forEach(s => {
            s.update();
            s.draw();
        });
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
            // Match strictly numbers or numbers followed by % or + (e.g. "30%", "85%+")
            // This prevents replacing text in longer phrases like "100% on-schedule" or "5,000 – 20,000+ attendees"
            const match = text.match(/^(\d+)(%|\+)?$/);
            if (match) {
                const num    = parseInt(match[1], 10);
                const suffix = match[2] || '';
                // Wait for the timeline card reveal transition (0.7s) to finish before starting count-up
                setTimeout(() => {
                    animateCounter(el, num, suffix);
                }, 800);
            }
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.resume-timeline-description strong').forEach(el => {
        const text = el.textContent.trim();
        if (/^\d+(%|\+)?$/.test(text)) {
            // Reserve exact space and use tabular numbers to prevent text/layout shifting during count-up
            el.style.display = 'inline-block';
            el.style.minWidth = `${text.length + 0.2}ch`;
            el.style.textAlign = 'center';
            el.style.fontVariantNumeric = 'tabular-nums';
            
            counterObserver.observe(el);
        }
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
