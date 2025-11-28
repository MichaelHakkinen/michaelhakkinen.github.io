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

    // ==============================
    // Language Toggle (EN ↔ ID)
    // ==============================
    const toggleBtn = document.getElementById("langToggle");

    if (toggleBtn) {
        let currentLang = "en";

        const updateButton = () => {
            toggleBtn.innerHTML =
                currentLang === "en"
                    ? '<img src="flags/us.png" width="20" height="14" class="me-1"> EN'
                    : '<img src="flags/id.png" width="20" height="14" class="me-1"> ID';
        };

        updateButton();

        toggleBtn.addEventListener("click", () => {
            currentLang = currentLang === "en" ? "id" : "en";
            updateButton();

            document.querySelectorAll("[data-en]").forEach(el => {
                const newText = el.getAttribute(`data-${currentLang}`);
                if (!newText) return;

                // Case 1: special download button
                if (el.tagName === "A" && el.hasAttribute("data-en-label")) {
                    el.textContent = el.getAttribute(`data-${currentLang}-label`);
                    el.setAttribute("href", el.getAttribute(`data-${currentLang}`));

                    const icon = document.createElement("i");
                    icon.className = "fas fa-download ms-2 animate__animated animate__bounce animate__infinite animate__slow";
                    el.appendChild(icon);
                    return;
                }

                // Case 2: If element contains <b>, replace ONLY the bold text
                const boldChild = el.querySelector("b");
                if (boldChild) {
                    boldChild.textContent = newText;
                    return;
                }

                // Case 3: Normal text replacement
                const targetBold = el.querySelector("b[data-lang-target]");
                if (targetBold) {
                    targetBold.textContent = newText;
                } else {
                    el.textContent = newText;
                }

            });
        });
    }


});



