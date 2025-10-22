// Contact Form Handler with Bot Protection
class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitBtn = document.getElementById('submit-btn');
        this.messageDiv = document.getElementById('form-message');
        this.mathAnswer = 0;
        this.emailConfig = new EmailConfig();
        this.lastSubmission = 0;
        this.submissionCount = 0;
        this.maxSubmissionsPerHour = 5;
        
        if (this.form && !this.form.hasAttribute('data-handler-initialized')) {
            this.init();
            this.form.setAttribute('data-handler-initialized', 'true');
        }
    }

    init() {
        this.generateMathCaptcha();
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Initialize EmailJS with configuration
        if (this.emailConfig.isConfigured()) {
            emailjs.init(this.emailConfig.publicKey);
            console.log('EmailJS initialized successfully');
        } else {
            console.warn('EmailJS configuration not available. Email functionality disabled.');
        }
    }

    generateMathCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        this.mathAnswer = num1 + num2;
        
        const questionSpan = document.getElementById('math-question');
        console.log('Generating math captcha:', `${num1} + ${num2} = ${this.mathAnswer}`);
        console.log('Question span element:', questionSpan);
        
        if (questionSpan) {
            questionSpan.textContent = `${num1} + ${num2}`;
            console.log('Math question updated to:', questionSpan.textContent);
        } else {
            console.error('math-question span not found in DOM');
        }
    }

    validateForm(formData) {
        const errors = [];

        // Check honeypot field (should be empty)
        if (formData.get('website')) {
            errors.push('Bot detected');
        }

        // Validate name
        const name = formData.get('name').trim();
        if (name.length < 2 || name.length > 50) {
            errors.push('Name must be between 2 and 50 characters');
        }

        // Validate email
        const email = formData.get('email').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        }

        // Validate subject
        const subject = formData.get('subject').trim();
        if (subject.length < 5 || subject.length > 100) {
            errors.push('Subject must be between 5 and 100 characters');
        }

        // Validate message
        const message = formData.get('message').trim();
        if (message.length < 10 || message.length > 1000) {
            errors.push('Message must be between 10 and 1000 characters');
        }

        // Validate CAPTCHA
        const captchaAnswer = parseInt(formData.get('captcha'));
        if (isNaN(captchaAnswer) || captchaAnswer !== this.mathAnswer) {
            errors.push('Please solve the math problem correctly');
        }

        // Check for suspicious patterns
        if (this.containsSuspiciousContent(name + ' ' + subject + ' ' + message)) {
            errors.push('Message contains suspicious content');
        }

        return errors;
    }

    containsSuspiciousContent(text) {
        const suspiciousPatterns = [
            // Spam keywords
            /\b(viagra|cialis|casino|poker|lottery|winner|prize)\b/i,
            /\b(click here|visit now|limited time|act now)\b/i,
            
            // URLs (could be phishing)
            /(http|https):\/\/[^\s]+/g,
            
            // Money/financial references
            /\$\d+|\d+\$/,
            /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card patterns
            
            // Potential XSS attempts
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi, // Event handlers like onclick=
            /data:\s*text\/html/gi,
            
            // SQL injection patterns
            /'\s*(union|select|insert|update|delete|drop|create|alter)\s/gi,
            /\b(or|and)\s+\d+\s*=\s*\d+/gi,
            
            // Excessive special characters (potential encoding attacks)
            /[<>{}()[\]]{5,}/,
            /%[0-9a-f]{2}/gi, // URL encoded characters
            
            // Suspicious email patterns
            /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b.*\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi // Multiple emails
        ];

        return suspiciousPatterns.some(pattern => pattern.test(text));
    }

    showMessage(message, type = 'info') {
        this.messageDiv.className = `form-message ${type}`;
        // Ensure message is properly escaped and sanitized
        this.messageDiv.textContent = this.sanitizeText(message);
        this.messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    sanitizeText(text) {
        // Remove any potential HTML tags and sanitize the text
        return String(text).replace(/<[^>]*>/g, '').trim();
    }

    sanitizeInput(input) {
        if (!input) return '';
        
        // Convert to string and trim
        let sanitized = String(input).trim();
        
        // Remove HTML tags
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        
        // Encode potentially dangerous characters
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        
        // Remove null bytes and other control characters
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
        
        return sanitized;
    }

    setSubmitButton(loading = false) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }
    }

    checkRateLimit() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // Reset counter if more than an hour has passed
        if (now - this.lastSubmission > oneHour) {
            this.submissionCount = 0;
        }
        
        // Check if user is submitting too frequently
        if (now - this.lastSubmission < 30000) { // 30 seconds between submissions
            return 'Please wait 30 seconds between submissions';
        }
        
        // Check hourly limit
        if (this.submissionCount >= this.maxSubmissionsPerHour) {
            return 'Too many submissions. Please try again later';
        }
        
        return null;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Check rate limiting
        const rateLimitError = this.checkRateLimit();
        if (rateLimitError) {
            this.showMessage(rateLimitError, 'error');
            return;
        }
        
        const formData = new FormData(this.form);
        const errors = this.validateForm(formData);

        if (errors.length > 0) {
            this.showMessage(errors.join('. '), 'error');
            this.generateMathCaptcha(); // Generate new CAPTCHA
            return;
        }

        this.setSubmitButton(true);
        this.showMessage('Sending your message...', 'info');

        try {
            // Option 1: EmailJS (Recommended)
            await this.sendWithEmailJS(formData);
            
            // Option 2: Alternative - mailto fallback
            // this.sendWithMailto(formData);
            
        } catch (error) {
            console.error('Error sending email:', error);
            this.showMessage('Failed to send message. Please try again or contact me directly at joshua.j.mykitta@gmail.com', 'error');
        } finally {
            this.setSubmitButton(false);
            this.generateMathCaptcha(); // Generate new CAPTCHA
        }
    }

    async sendWithEmailJS(formData) {
        // Debug: Check what's available
        console.log('DEBUG: window.EMAIL_CONFIG =', window.EMAIL_CONFIG);
        console.log('DEBUG: emailConfig object =', this.emailConfig);
        
        // Use configuration values
        const SERVICE_ID = this.emailConfig.serviceId;
        const TEMPLATE_ID = this.emailConfig.templateId;
        const PUBLIC_KEY = this.emailConfig.publicKey;

        console.log('DEBUG: Extracted values:', {
            SERVICE_ID: SERVICE_ID || 'MISSING',
            TEMPLATE_ID: TEMPLATE_ID || 'MISSING',
            PUBLIC_KEY: PUBLIC_KEY || 'MISSING'
        });

        if (!this.emailConfig.isConfigured()) {
            console.error('EmailJS Configuration Check Failed:', {
                serviceId: SERVICE_ID || 'MISSING',
                templateId: TEMPLATE_ID || 'MISSING', 
                publicKey: PUBLIC_KEY || 'MISSING'
            });
            throw new Error('EmailJS is not properly configured');
        }
        
        console.log('EmailJS Configuration OK - attempting to send email');

        const templateParams = {
            from_name: this.sanitizeInput(formData.get('name')),
            from_email: this.sanitizeInput(formData.get('email')),
            subject: this.sanitizeInput(formData.get('subject')),
            message: this.sanitizeInput(formData.get('message')),
            to_email: 'joshua.j.mykitta@gmail.com'
        };

        try {
            const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
            
            if (result.text === 'OK') {
                // Update rate limiting counters on successful submission
                this.lastSubmission = Date.now();
                this.submissionCount++;
                
                this.showMessage('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
                this.form.reset();
                this.generateMathCaptcha(); // Generate new CAPTCHA after successful reset
            } else {
                throw new Error('EmailJS failed');
            }
        } catch (error) {
            console.error('EmailJS error:', error);
            throw new Error('Failed to send email via EmailJS');
        }
        console.log('Form data:', templateParams);
    }

    sendWithMailto(formData) {
        // Fallback option - opens user's email client
        const subject = encodeURIComponent(`Portfolio Contact: ${formData.get('subject')}`);
        const body = encodeURIComponent(
            `Name: ${formData.get('name')}\n` +
            `Email: ${formData.get('email')}\n` +
            `Subject: ${formData.get('subject')}\n\n` +
            `Message:\n${formData.get('message')}`
        );
        
        window.location.href = `mailto:joshua.j.mykitta@gmail.com?subject=${subject}&body=${body}`;
        this.showMessage('Opening your email client...', 'info');
    }
}

// Make ContactFormHandler available globally for dynamic loading
window.ContactFormHandler = ContactFormHandler;

// Initialize when DOM is loaded (for non-dynamic content)
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if contact form exists and hasn't been initialized by partials loader
    const form = document.getElementById('contact-form');
    if (form && !form.hasAttribute('data-handler-initialized')) {
        new ContactFormHandler();
    }
});

// Rate limiting to prevent spam
const rateLimiter = {
    attempts: [],
    maxAttempts: 3,
    timeWindow: 300000, // 5 minutes

    canSend() {
        const now = Date.now();
        this.attempts = this.attempts.filter(time => now - time < this.timeWindow);
        
        if (this.attempts.length >= this.maxAttempts) {
            return false;
        }
        
        this.attempts.push(now);
        return true;
    }
};