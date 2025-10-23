// EmailJS configuration - injected by GitHub Actions
window.EMAIL_CONFIG = {
    EMAILJS_SERVICE_ID: "${{ secrets.EMAILJS_SERVICE_ID }}",
    EMAILJS_TEMPLATE_ID: "${{ secrets.EMAILJS_TEMPLATE_ID }}",
    EMAILJS_PUBLIC_KEY: "${{ secrets.EMAILJS_PUBLIC_KEY }}"
};

// EmailJS configuration - injected by GitHub Actions
window.EMAIL_CONFIG = {
    EMAILJS_SERVICE_ID: 'service_hzt69ni',
    EMAILJS_TEMPLATE_ID: 'template_qfb70hf',
    EMAILJS_PUBLIC_KEY: 'Fe9gY3ItziOzjcIYQ'
};

// Email configuration
// For GitHub Pages deployment, these values need to be set during build time
// or loaded from a secure configuration service

class EmailConfig {
    constructor() {
        // For development, you can load from environment or config file
        // For production (GitHub Pages, etc), these should be set via GitHub Secrets
        // and injected during the build process
        
        console.log('EmailConfig: Initializing with window.EMAIL_CONFIG:', !!window.EMAIL_CONFIG);
        
        // Initialize properties to null
        this.serviceId = null;
        this.templateId = null;
        this.publicKey = null;
        
        // Try immediate load first
        this.refreshConfiguration();
    }
    
    refreshConfiguration() {
        // Always try to get the latest configuration
        this.serviceId = this.getConfigValue('EMAILJS_SERVICE_ID');
        this.templateId = this.getConfigValue('EMAILJS_TEMPLATE_ID');
        this.publicKey = this.getConfigValue('EMAILJS_PUBLIC_KEY');
        
        console.log('EmailJS config refreshed:', {
            hasServiceId: !!this.serviceId,
            hasTemplateId: !!this.templateId,
            hasPublicKey: !!this.publicKey
        });
        
        // Return configuration status without calling isConfigured() to avoid infinite loop
        return this.serviceId && this.templateId && this.publicKey;
    }

    getConfigValue(key) {
        // Try to get from injected environment variables (set by build process)
        if (window.EMAIL_CONFIG && window.EMAIL_CONFIG[key]) {
            return window.EMAIL_CONFIG[key];
        }
        
        // For development, try to load from .env file via a dev server
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
        
        // Configuration not found - this is expected in development without proper setup
        return null;
    }

    isConfigured() {
        // Check current configuration without refreshing to avoid infinite loops
        return this.serviceId && this.templateId && this.publicKey;
    }
}

// Export for use in other files
window.EmailConfig = EmailConfig;