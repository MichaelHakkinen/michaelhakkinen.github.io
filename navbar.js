document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const brand = document.querySelector('.navbar-brand');
    const homeLink = document.querySelector('a[href="#home"]');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = targetPosition + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });

    // Make all external links open in a new tab
    document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (link.hostname !== window.location.hostname) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
    });

    // Enable ScrollSpy
    new bootstrap.ScrollSpy(document.body, {
        target: '#mainNav',
        offset: 100
    });

    // Highlight brand when Home is active
    document.addEventListener("activate.bs.scrollspy", () => {
        if (homeLink.classList.contains("active")) {
            brand.classList.add("active-brand");
        } else {
            brand.classList.remove("active-brand");
        }
    });

    // Timeline animations
    const items = document.querySelectorAll('.resume-timeline-item');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    items.forEach((item, index) => {
        item.style.opacity = 0;
        item.style.transform = 'translateY(20px)';
        item.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(item);
    });

    let currentLang = "en";
    const toggleBtn = document.getElementById("langToggle");

    toggleBtn.addEventListener("click", () => {
        currentLang = currentLang === "en" ? "id" : "en";
        toggleBtn.textContent = currentLang === "en" ? "🇬🇧 EN" : "🇮🇩 ID";

        document.querySelectorAll("[data-en]").forEach(el => {
            if (el.tagName === "A") {
                if (el.hasAttribute(`data-${currentLang}`)) {
                    el.setAttribute("href", el.getAttribute(`data-${currentLang}`));
                }
                if (el.hasAttribute(`data-${currentLang}-label`)) {
                    el.textContent = el.getAttribute(`data-${currentLang}-label`);
                }
            } else {
                el.textContent = el.getAttribute(`data-${currentLang}`);
            }
        });
    });
});

