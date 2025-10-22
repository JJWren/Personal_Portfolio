// Email configuration
// For GitHub Pages deployment, these values need to be set during build time
// or loaded from a secure configuration service

class EmailConfig {
    constructor() {
        // For development, you can load from environment or config file
        // For production (GitHub Pages, etc), these should be set via GitHub Secrets
        // and injected during the build process
        
        console.log('=== EmailConfig Constructor Debug ===');
        console.log('window.EMAIL_CONFIG exists:', typeof window.EMAIL_CONFIG);
        console.log('window.EMAIL_CONFIG value:', window.EMAIL_CONFIG);
        console.log('window object keys containing EMAIL:', Object.keys(window).filter(k => k.includes('EMAIL')));
        
        // Initialize properties to null
        this.serviceId = null;
        this.templateId = null;
        this.publicKey = null;
        
        // Try immediate load first
        this.refreshConfiguration();
    }
    
    refreshConfiguration() {
        console.log('=== refreshConfiguration() called ===');
        console.log('window.EMAIL_CONFIG before refresh:', window.EMAIL_CONFIG);
        
        // Always try to get the latest configuration
        this.serviceId = this.getConfigValue('EMAILJS_SERVICE_ID');
        this.templateId = this.getConfigValue('EMAILJS_TEMPLATE_ID');
        this.publicKey = this.getConfigValue('EMAILJS_PUBLIC_KEY');
        
        console.log('EmailConfig: Configuration refreshed', {
            hasWindowConfig: !!window.EMAIL_CONFIG,
            serviceId: this.serviceId ? `SET (${this.serviceId})` : 'MISSING',
            templateId: this.templateId ? `SET (${this.templateId})` : 'MISSING',
            publicKey: this.publicKey ? `SET (${this.publicKey.substring(0,10)}...)` : 'MISSING'
        });
        
        return this.isConfigured();
    }

    getConfigValue(key) {
        console.log(`=== getConfigValue('${key}') ===`);
        console.log('window.EMAIL_CONFIG exists:', !!window.EMAIL_CONFIG);
        console.log('window.EMAIL_CONFIG:', window.EMAIL_CONFIG);
        console.log(`window.EMAIL_CONFIG[${key}]:`, window.EMAIL_CONFIG ? window.EMAIL_CONFIG[key] : 'NO_WINDOW_CONFIG');
        
        // Try to get from injected environment variables (set by build process)
        if (window.EMAIL_CONFIG && window.EMAIL_CONFIG[key]) {
            console.log(`✅ Found ${key} in window.EMAIL_CONFIG:`, window.EMAIL_CONFIG[key]);
            return window.EMAIL_CONFIG[key];
        }
        
        // For development, try to load from .env file via a dev server
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            console.log(`✅ Found ${key} in process.env`);
            return process.env[key];
        }
        
        console.log(`❌ Configuration not found for ${key}`);
        // Configuration not found - this is expected in development without proper setup
        return null;
    }

    isConfigured() {
        // Always refresh configuration when checking if configured
        this.refreshConfiguration();
        return this.serviceId && this.templateId && this.publicKey;
    }
}

// Export for use in other files
window.EmailConfig = EmailConfig;