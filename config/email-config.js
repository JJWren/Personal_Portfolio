// Email configuration
// For GitHub Pages deployment, these values need to be set during build time
// or loaded from a secure configuration service

class EmailConfig {
    constructor() {
        // For development, you can load from environment or config file
        // For production (GitHub Pages, etc), these should be set via GitHub Secrets
        // and injected during the build process
        
        this.serviceId = this.getConfigValue('EMAILJS_SERVICE_ID');
        this.templateId = this.getConfigValue('EMAILJS_TEMPLATE_ID');
        this.publicKey = this.getConfigValue('EMAILJS_PUBLIC_KEY');
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
        return this.serviceId && this.templateId && this.publicKey;
    }
}

// Export for use in other files
window.EmailConfig = EmailConfig;