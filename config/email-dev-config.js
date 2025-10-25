// Development EmailJS configuration
// This file provides fallback configuration for development
// In production, email-secrets.js will be loaded first and override these values

if (!window.EMAIL_CONFIG) {
  console.log('Loading development EmailJS configuration...');
  
  // Try to load from localStorage for development
  const devConfig = localStorage.getItem('emailjs_dev_config');
  
  if (devConfig) {
    try {
      window.EMAIL_CONFIG = JSON.parse(devConfig);
      console.log('Loaded EmailJS config from localStorage');
    } catch (e) {
      console.warn('Failed to parse EmailJS config from localStorage:', e);
    }
  }
  
  // If still no config, show instructions for developers
  if (!window.EMAIL_CONFIG) {
    console.warn(`
=== EmailJS Development Setup Required ===

To test the contact form locally, you need to set up your EmailJS configuration:

1. Go to https://www.emailjs.com/ and create an account
2. Set up a service and template
3. Run this in the browser console:

localStorage.setItem('emailjs_dev_config', JSON.stringify({
  EMAILJS_SERVICE_ID: 'your_service_id',
  EMAILJS_TEMPLATE_ID: 'your_template_id', 
  EMAILJS_PUBLIC_KEY: 'your_public_key'
}));

Then refresh the page.

For production deployment, set these as GitHub repository secrets.
    `);
  }
}