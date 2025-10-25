// Email configuration
// For GitHub Pages deployment, these values need to be set during build time
// or loaded from a secure configuration service

class EmailConfig {
    constructor() {
        // Singleton pattern - return existing instance if available
        if (window.emailConfigInstance) {
            return window.emailConfigInstance;
        }
        
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
        
        // Store as singleton
        window.emailConfigInstance = this;
    }
    
    refreshConfiguration() {
        // Always try to get the latest configuration
        this.serviceId = this.getConfigValue('EMAILJS_SERVICE_ID');
        this.templateId = this.getConfigValue('EMAILJS_TEMPLATE_ID');
        this.publicKey = this.getConfigValue('EMAILJS_PUBLIC_KEY');
        
        console.log('EmailConfig: Configuration loaded', {
            serviceId: this.serviceId || 'MISSING',
            templateId: this.templateId || 'MISSING', 
            publicKey: this.publicKey || 'MISSING'
        });
        
        // Return configuration status without calling isConfigured() to avoid infinite loop
        return this.serviceId && this.templateId && this.publicKey;
    }

    getConfigValue(key) {
        console.log('EmailConfig: Checking for EMAIL_CONFIG...', window.EMAIL_CONFIG);
        
        // Try to get from injected environment variables (set by build process)
        if (window.EMAIL_CONFIG && window.EMAIL_CONFIG[key]) {
            console.log('EmailConfig: Found', key, 'in window.EMAIL_CONFIG');
            return window.EMAIL_CONFIG[key];
        }
        
        // For development, try to load from .env file via a dev server
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            console.log('EmailConfig: Found', key, 'in process.env');
            return process.env[key];
        }
        
        // Configuration not found - this is expected in development without proper setup
        console.log('EmailConfig: No configuration found for', key);
        return null;
    }

    isConfigured() {
        // Check current configuration without refreshing to avoid infinite loops
        return this.serviceId && this.templateId && this.publicKey;
    }
}

// Export for use in other files
window.EmailConfig = EmailConfig;