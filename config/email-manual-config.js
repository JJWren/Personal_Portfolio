// Manual EmailJS Configuration for Testing
// This file allows direct configuration when email-secrets.js fails to load

window.manualEmailJSConfig = function(serviceId, templateId, publicKey) {
    console.log('🔧 Manually configuring EmailJS...');
    
    window.EMAIL_CONFIG = {
        EMAILJS_SERVICE_ID: serviceId,
        EMAILJS_TEMPLATE_ID: templateId, 
        EMAILJS_PUBLIC_KEY: publicKey
    };
    
    console.log('✅ Manual configuration set:', window.EMAIL_CONFIG);
    
    // Trigger the config loaded event
    window.EMAIL_CONFIG_LOADED = true;
    window.dispatchEvent(new Event('emailConfigLoaded'));
    
    console.log('📢 emailConfigLoaded event dispatched');
    
    return 'Configuration applied. The contact form should now work.';
};

console.log('🛠️ Manual config function available: manualEmailJSConfig(serviceId, templateId, publicKey)');