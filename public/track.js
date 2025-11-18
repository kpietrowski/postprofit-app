/**
 * Revenue Tracking SDK
 * Captures UTM parameters and tracks purchases
 */

(function() {
  'use strict';

  // Configuration
  const COOKIE_NAME = 'revenue_campaign';
  const COOKIE_EXPIRY_DAYS = 30;
  const API_ENDPOINT = window.location.origin + '/api/v1/track';

  // Get API key from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-api-key]');
  const API_KEY = scriptTag ? scriptTag.getAttribute('data-api-key') : null;

  if (!API_KEY) {
    console.warn('[RevenueTracker] No API key found. Add data-api-key attribute to script tag.');
    return;
  }

  /**
   * Get UTM parameters from URL
   */
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};

    // Standard UTM parameters
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmKeys.forEach(key => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });

    // Custom campaign parameter
    const campaign = params.get('c') || params.get('campaign');
    if (campaign) utm.campaign_id = campaign;

    return Object.keys(utm).length > 0 ? utm : null;
  }

  /**
   * Set cookie
   */
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + JSON.stringify(value) + ';' + expires + ';path=/;SameSite=Lax';
  }

  /**
   * Get cookie
   */
  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(c.substring(nameEQ.length, c.length));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Track purchase event
   */
  function trackPurchase(data) {
    const campaignData = getCookie(COOKIE_NAME);

    if (!campaignData) {
      console.warn('[RevenueTracker] No campaign data found in cookie');
      return Promise.resolve();
    }

    const payload = {
      ...campaignData,
      amount: data.amount,
      customer_id: data.customer_id || null,
      metadata: data.metadata || {},
      timestamp: new Date().toISOString()
    };

    return fetch(API_ENDPOINT + '/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to track purchase');
      console.log('[RevenueTracker] Purchase tracked successfully');
      return response.json();
    })
    .catch(error => {
      console.error('[RevenueTracker] Error tracking purchase:', error);
    });
  }

  /**
   * Initialize tracking
   */
  function init() {
    // Capture UTM parameters if present
    const utmParams = getUTMParams();
    if (utmParams) {
      setCookie(COOKIE_NAME, utmParams, COOKIE_EXPIRY_DAYS);
      console.log('[RevenueTracker] Campaign parameters captured:', utmParams);
    }

    // Expose trackPurchase to global scope
    window.RevenueTracker = {
      trackPurchase: trackPurchase,
      getCampaign: function() {
        return getCookie(COOKIE_NAME);
      }
    };

    // Auto-track if Stripe is present
    if (window.Stripe) {
      interceptStripe();
    }

    console.log('[RevenueTracker] Initialized');
  }

  /**
   * Intercept Stripe checkout to add metadata
   */
  function interceptStripe() {
    const campaignData = getCookie(COOKIE_NAME);
    if (!campaignData) return;

    // Hook into Stripe.redirectToCheckout if available
    if (window.Stripe && window.Stripe.redirectToCheckout) {
      const originalRedirect = window.Stripe.redirectToCheckout;
      window.Stripe.redirectToCheckout = function(options) {
        // Add campaign data to metadata
        options.metadata = options.metadata || {};
        Object.assign(options.metadata, campaignData);
        return originalRedirect.call(this, options);
      };
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
