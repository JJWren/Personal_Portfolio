// Mobile Navigation Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');

mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar background on scroll
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0, 48, 73, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(0, 48, 73, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Active navigation link highlighting (works with partials loader)
window.addEventListener('scroll', () => {
    // Only update active nav if we're on the home section
    if (window.partialsLoader && window.partialsLoader.currentSection === 'home') {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = 'home';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        // Only update if we're still on home
        if (current === 'home') {
            navLinks.forEach(link => {
                link.classList.remove('active');
                // Remove any inline color styling to let CSS take over
                link.style.color = '';
            });
            
            const homeLink = document.querySelector('.nav-link[href="#home"]');
            if (homeLink) {
                homeLink.classList.add('active');
                // Remove inline styling to let CSS take over
                homeLink.style.color = '';
            }
        }
    }
});

// Smooth scrolling for navigation links (enhanced for partials)
document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href^="#"]');
    if (target) {
        const href = target.getAttribute('href');
        const sectionId = href.substring(1);
        
        // Check if this is a section that should be loaded as a partial
        if (target.hasAttribute('data-section')) {
            // Let the partials loader handle this
            return;
        }
        
        // Handle traditional anchor links (like scroll to home)
        if (sectionId === 'home' || document.getElementById(sectionId)) {
            e.preventDefault();
            const targetElement = document.getElementById(sectionId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    }
});

// Contact form handling (enhanced for partials)
function handleContactFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Simple validation
    if (!name || !email || !subject || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate form submission
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Make function available globally for partials loader
window.handleContactFormSubmission = handleContactFormSubmission;

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Make notification function available globally
window.showNotification = showNotification;

// Typing animation for hero title
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    // Extract just the text content for typing, preserve HTML structure
    const fullHTML = heroTitle.innerHTML;
    const textOnly = heroTitle.textContent;
    
    // Create a version without the highlight span for typing
    const simpleText = textOnly;
    heroTitle.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < simpleText.length) {
            heroTitle.textContent = simpleText.substring(0, i + 1);
            i++;
            setTimeout(typeWriter, 50);
        } else {
            // After typing is complete, replace with the full HTML version
            setTimeout(() => {
                heroTitle.innerHTML = fullHTML;
            }, 500);
        }
    };
    
    // Start typing animation after a short delay
    setTimeout(typeWriter, 500);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    if (parallax) {
        const speed = scrolled * 0.2; // Reduced speed for better performance
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu if open
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Focus management for accessibility
const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Trap focus in mobile menu when open
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && navMenu.classList.contains('active')) {
        const focusableContent = navMenu.querySelectorAll(focusableElements);
        const firstFocusableElement = focusableContent[0];
        const lastFocusableElement = focusableContent[focusableContent.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }
});

// Resize handler for responsive behavior
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Initialize home section active state
document.addEventListener('DOMContentLoaded', () => {
    const homeLink = document.querySelector('.nav-link[href="#home"]');
    if (homeLink) {
        homeLink.classList.add('active');
        // Remove inline styling to let CSS take over
        homeLink.style.color = '';
    }
});

// Console welcome message
console.log('%cHello there!', 'color: #667eea; font-size: 24px; font-weight: bold;');
console.log('%cThanks for checking out my portfolio! Feel free to explore the code.', 'color: #666; font-size: 14px;');
console.log('%cIf you have any questions or want to work together, don\'t hesitate to reach out!', 'color: #666; font-size: 14px;');
console.log('%cThis site uses a custom partials loading system - check out partials-loader.js!', 'color: #667eea; font-size: 12px;');