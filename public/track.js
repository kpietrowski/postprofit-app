/**
 * PostProfit Revenue Tracking SDK
 * Captures UTM parameters and tracks purchases automatically
 *
 * Usage: Add this to your website before </body>
 * <script src="https://app.postprofit.io/track.js" data-api-key="YOUR_API_KEY"></script>
 */

(function() {
  'use strict';

  // Configuration
  const COOKIE_NAME = 'pp_campaign';
  const COOKIE_EXPIRY_DAYS = 30;
  const API_BASE = 'https://app.postprofit.io';

  // Get API key from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-api-key]');
  const API_KEY = scriptTag ? scriptTag.getAttribute('data-api-key') : null;

  if (!API_KEY) {
    console.warn('[PostProfit] No API key found. Add data-api-key attribute to script tag.');
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
    utmKeys.forEach(function(key) {
      const value = params.get(key);
      if (value) utm[key] = value;
    });

    // Also check for ref parameter (common shorthand)
    const ref = params.get('ref');
    if (ref && !utm.utm_source) utm.utm_source = ref;

    return Object.keys(utm).length > 0 ? utm : null;
  }

  /**
   * Set cookie with cross-subdomain support
   */
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();

    // Get root domain for cross-subdomain tracking
    const domain = getRootDomain();
    const domainStr = domain ? ';domain=' + domain : '';

    document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + ';' + expires + ';path=/' + domainStr + ';SameSite=Lax';
  }

  /**
   * Get root domain (e.g., example.com from www.example.com)
   */
  function getRootDomain() {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;
    return '.' + parts.slice(-2).join('.');
  }

  /**
   * Get cookie value
   */
  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Send tracking data to PostProfit
   */
  function sendToAPI(endpoint, data) {
    return fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      },
      body: JSON.stringify(data)
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(err) {
          throw new Error(err.error || 'API request failed');
        });
      }
      return response.json();
    });
  }

  /**
   * Track a purchase - call this when a purchase is confirmed
   * @param {object} data - { amount: number, order_id?: string, customer_email?: string }
   */
  function trackPurchase(data) {
    const campaignData = getCookie(COOKIE_NAME);

    if (!campaignData) {
      console.warn('[PostProfit] No campaign data found - visitor may not have come from a tracked link');
      return Promise.resolve({ tracked: false, reason: 'no_campaign' });
    }

    if (!data || !data.amount) {
      console.error('[PostProfit] Amount is required for tracking');
      return Promise.reject(new Error('Amount is required'));
    }

    const payload = {
      utm_source: campaignData.utm_source,
      utm_medium: campaignData.utm_medium,
      utm_campaign: campaignData.utm_campaign,
      utm_content: campaignData.utm_content,
      utm_term: campaignData.utm_term,
      amount: parseFloat(data.amount),
      metadata: {
        order_id: data.order_id || null,
        customer_email: data.customer_email || null,
        page_url: window.location.href,
        referrer: document.referrer
      }
    };

    return sendToAPI('/api/v1/track/purchase', payload)
      .then(function(result) {
        console.log('[PostProfit] Purchase tracked:', result);
        return result;
      })
      .catch(function(error) {
        console.error('[PostProfit] Error tracking purchase:', error);
        throw error;
      });
  }

  /**
   * Get current campaign data (useful for passing to checkout)
   */
  function getCampaign() {
    return getCookie(COOKIE_NAME);
  }

  /**
   * Get campaign data as URL params (for appending to checkout URLs)
   */
  function getCampaignParams() {
    const campaign = getCookie(COOKIE_NAME);
    if (!campaign) return '';

    const params = new URLSearchParams();
    Object.keys(campaign).forEach(function(key) {
      if (campaign[key]) params.append(key, campaign[key]);
    });
    return params.toString();
  }

  /**
   * Automatically detect and track Stripe checkout success pages
   */
  function autoDetectStripeSuccess() {
    // Check if this is a Stripe success redirect
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId && window.location.pathname.includes('success')) {
      // This looks like a Stripe checkout success page
      // The actual tracking happens via Stripe webhook, but log for debugging
      console.log('[PostProfit] Stripe checkout success detected - revenue will be tracked via webhook');
    }
  }

  /**
   * Hook into common checkout flows
   */
  function setupCheckoutHooks() {
    // Watch for Stripe Checkout redirects
    const originalWindowOpen = window.open;
    window.open = function(url) {
      if (url && typeof url === 'string' && url.includes('checkout.stripe.com')) {
        // Append campaign params to Stripe checkout URL if possible
        const campaign = getCookie(COOKIE_NAME);
        if (campaign) {
          console.log('[PostProfit] Stripe checkout detected with campaign:', campaign);
        }
      }
      return originalWindowOpen.apply(this, arguments);
    };

    // Watch for form submissions to checkout
    document.addEventListener('submit', function(e) {
      const form = e.target;
      if (form.action && (form.action.includes('checkout') || form.action.includes('stripe'))) {
        // Add hidden fields for campaign data
        const campaign = getCookie(COOKIE_NAME);
        if (campaign) {
          Object.keys(campaign).forEach(function(key) {
            if (campaign[key] && !form.querySelector('input[name="' + key + '"]')) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = campaign[key];
              form.appendChild(input);
            }
          });
        }
      }
    });
  }

  /**
   * Initialize tracking
   */
  function init() {
    // Capture UTM parameters if present in URL
    const utmParams = getUTMParams();
    if (utmParams) {
      // Merge with existing cookie (don't overwrite if already tracking)
      const existing = getCookie(COOKIE_NAME);
      const merged = Object.assign({}, existing || {}, utmParams, {
        first_seen: existing ? existing.first_seen : new Date().toISOString(),
        last_seen: new Date().toISOString()
      });
      setCookie(COOKIE_NAME, merged, COOKIE_EXPIRY_DAYS);
      console.log('[PostProfit] Campaign captured:', merged);
    }

    // Setup checkout detection
    setupCheckoutHooks();
    autoDetectStripeSuccess();

    // Expose public API
    window.PostProfit = {
      trackPurchase: trackPurchase,
      getCampaign: getCampaign,
      getCampaignParams: getCampaignParams,
      version: '2.0.0'
    };

    // Legacy support
    window.RevenueTracker = window.PostProfit;

    console.log('[PostProfit] Tracking initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
