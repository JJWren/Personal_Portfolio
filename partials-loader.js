// Partials Loader System - Similar to cshtml partials
class PartialsLoader {
    constructor() {
        this.loadedSections = new Set();
        this.currentSection = 'home';
        this.contentContainer = document.getElementById('dynamic-content');
        this.navLinks = document.querySelectorAll('.nav-link[data-section]');
        this.sectionButtons = document.querySelectorAll('[data-section]');
        
        // Initialize the loader
        this.init();
    }

    init() {
        // Add event listeners to navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                
                // Handle Home navigation (no data-section attribute)
                if (!section && link.getAttribute('href') === '#home') {
                    this.showHome();
                    this.updateActiveNav(link);
                    this.scrollToSection('home');
                } else if (section) {
                    this.loadSection(section);
                    this.updateActiveNav(link);
                    this.scrollToSection(section);
                }
            });
        });

        // Add event listeners to other section buttons (like hero buttons)
        this.sectionButtons.forEach(button => {
            if (!button.classList.contains('nav-link')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = button.getAttribute('data-section');
                    this.loadSection(section);
                    this.updateActiveNav(document.querySelector(`.nav-link[data-section="${section}"]`));
                    this.scrollToSection(section);
                });
            }
        });

        // Load initial section based on URL hash
        const urlHash = window.location.hash.substring(1);
        if (urlHash && urlHash !== 'home') {
            this.loadSection(urlHash);
        }

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            const urlHash = window.location.hash.substring(1);
            if (urlHash && urlHash !== 'home') {
                this.loadSection(urlHash);
            }
        });

        // Intersection Observer for automatic section loading
        this.setupIntersectionObserver();
    }

    async loadSection(sectionName) {
        if (!sectionName || sectionName === 'home') {
            return;
        }

        // Check if section is already loaded
        if (this.loadedSections.has(sectionName)) {
            this.showSection(sectionName);
            return;
        }

        try {
            // Show loading indicator
            this.showLoadingIndicator();

            // Fetch the partial HTML
            const response = await fetch(`partials/${sectionName}.html`);
            
            if (!response.ok) {
                throw new Error(`Failed to load section: ${sectionName}`);
            }

            const html = await response.text();
            
            // Append the section to the content container
            this.contentContainer.insertAdjacentHTML('beforeend', html);
            
            // Mark section as loaded
            this.loadedSections.add(sectionName);
            
            // Hide loading indicator
            this.hideLoadingIndicator();
            
            // Initialize any section-specific functionality
            this.initializeSectionFeatures(sectionName);
            
            // Show the section
            this.showSection(sectionName);
            
            // Update URL hash
            window.history.pushState(null, null, `#${sectionName}`);
            
            console.log(`✅ Loaded section: ${sectionName}`);
            
        } catch (error) {
            console.error('Error loading section:', error);
            this.hideLoadingIndicator();
            this.showErrorMessage(`Failed to load ${sectionName} section. Please try again.`);
        }
    }

    showSection(sectionName) {
        // Hide all dynamic sections (but keep hero/home visible)
        const allSections = this.contentContainer.querySelectorAll('section');
        allSections.forEach(section => {
            section.style.display = 'none';
        });

        // Show the requested section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Trigger any entrance animations
            this.triggerSectionAnimation(targetSection);
        }

        this.currentSection = sectionName;
    }

    hideAllSections() {
        // Only hide dynamic sections, not the hero
        const allSections = this.contentContainer.querySelectorAll('section');
        allSections.forEach(section => {
            section.style.display = 'none';
        });
    }

    showHome() {
        // Hide all dynamic sections to show only the hero
        this.hideAllSections();
        this.currentSection = 'home';
        // Update URL hash
        window.history.pushState(null, null, '#home');
    }

    updateActiveNav(activeLink) {
        // Remove active class from all nav links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            // Remove any inline color styling to let CSS take over
            link.style.color = '';
        });

        // Add active class to clicked link
        if (activeLink) {
            activeLink.classList.add('active');
            // Remove inline styling to let CSS take over
            activeLink.style.color = '';
        }
    }

    scrollToSection(sectionName) {
        if (sectionName === 'home') {
            // Scroll to top for home section
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    }

    showLoadingIndicator() {
        // Remove existing loading indicator
        this.hideLoadingIndicator();
        
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'section-loading';
        loadingDiv.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading section...</p>
            </div>
        `;
        
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        const container = loadingDiv.querySelector('.loading-container');
        container.style.cssText = `
            text-align: center;
            padding: 2rem;
        `;
        
        const spinner = loadingDiv.querySelector('.loading-spinner');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        `;
        
        // Add spinner animation
        if (!document.getElementById('spinner-styles')) {
            const spinnerStyles = document.createElement('style');
            spinnerStyles.id = 'spinner-styles';
            spinnerStyles.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(spinnerStyles);
        }
        
        document.body.appendChild(loadingDiv);
    }

    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('section-loading');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'section-error';
        errorDiv.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary">Close</button>
            </div>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    initializeSectionFeatures(sectionName) {
        const section = document.getElementById(sectionName);
        if (!section) return;

        // Initialize contact form if it's the contact section
        if (sectionName === 'contact') {
            this.initializeContactForm(section);
        }

        // Initialize stats counter if it's the about section
        if (sectionName === 'about') {
            this.initializeStatsCounter(section);
        }

        // Initialize project links if it's the projects section
        if (sectionName === 'projects') {
            this.initializeProjectLinks(section);
        }

        // Re-apply intersection observer for animations
        this.observeElementsForAnimation(section);
    }

    initializeContactForm(section) {
        const contactForm = section.querySelector('#contact-form');
        if (contactForm && !contactForm.hasAttribute('data-initialized')) {
            // Initialize the ContactFormHandler for this form
            if (window.ContactFormHandler) {
                new window.ContactFormHandler();
            }
            contactForm.setAttribute('data-initialized', 'true');
        }
    }

    initializeStatsCounter(section) {
        const stats = section.querySelectorAll('.stat h3');
        if (stats.length > 0) {
            // Trigger counter animation
            stats.forEach(stat => {
                if (!stat.hasAttribute('data-animated')) {
                    const originalText = stat.textContent;
                    const numberMatch = originalText.match(/[\d.]+/);
                    
                    if (numberMatch) {
                        const target = parseFloat(numberMatch[0]);
                        const isDecimal = numberMatch[0].includes('.');
                        let count = 0;
                        const increment = target / 50;
                        
                        const timer = setInterval(() => {
                            count += increment;
                            if (count >= target) {
                                stat.textContent = originalText;
                                clearInterval(timer);
                            } else {
                                const currentValue = isDecimal ? count.toFixed(1) : Math.floor(count);
                                stat.textContent = originalText.replace(/[\d.]+/, currentValue);
                            }
                        }, 30);
                    }
                    
                    stat.setAttribute('data-animated', 'true');
                }
            });
        }
    }

    initializeProjectLinks(section) {
        const projectLinks = section.querySelectorAll('.project-link');
        projectLinks.forEach(link => {
            if (!link.hasAttribute('data-initialized')) {
                link.addEventListener('click', (e) => {
                    // Add any specific project link handling here
                    console.log('Project link clicked:', link.href);
                });
                link.setAttribute('data-initialized', 'true');
            }
        });
    }

    triggerSectionAnimation(section) {
        // Reset animation
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        
        // Trigger animation
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }, 100);
    }

    observeElementsForAnimation(section) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        const animateElements = section.querySelectorAll('.project-card, .hobby-card, .blog-card, .timeline-item');
        animateElements.forEach(el => {
            if (!el.hasAttribute('data-observed')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
                el.setAttribute('data-observed', 'true');
            }
        });
    }

    setupIntersectionObserver() {
        // This could be used for automatic section loading when scrolling
        // For now, we'll keep manual loading through navigation
    }

    // Public method to load a section programmatically
    loadSectionPublic(sectionName) {
        this.loadSection(sectionName);
    }

    // Public method to check if a section is loaded
    isSectionLoaded(sectionName) {
        return this.loadedSections.has(sectionName);
    }

    // Public method to get all loaded sections
    getLoadedSections() {
        return Array.from(this.loadedSections);
    }
}

// Initialize the partials loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Make sure the dynamic content container exists
    if (document.getElementById('dynamic-content')) {
        window.partialsLoader = new PartialsLoader();
        console.log('🚀 Partials Loader initialized');
    } else {
        console.error('❌ Dynamic content container not found');
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PartialsLoader;
}