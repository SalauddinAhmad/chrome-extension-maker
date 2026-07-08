// Designer OS — Tech Stack Detector Content Script
// Fingerprints technologies used on any website via DOM analysis

(function() {
  'use strict';

  if (window.__designerOSTechDetectorLoaded) return;
  window.__designerOSTechDetectorLoaded = true;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'DETECT_TECH_STACK') {
      const result = detectTechStack();
      sendResponse({ success: true, data: result });
    }
    return true;
  });

  function detectTechStack() {
    const tech = {
      frameworks: [],
      cssFrameworks: [],
      platforms: [],
      analytics: [],
      adPixels: [],
      cdns: [],
      other: [],
      meta: getPageMeta()
    };

    // =====================================================
    // JS FRAMEWORK DETECTION
    // =====================================================
    const jsFrameworkChecks = [
      { name: 'React', icon: '⚛️', color: '#61DAFB', checks: [
        () => !!window.React || !!document.querySelector('[data-reactroot]') || !!document.querySelector('[data-reactid]'),
        () => !!(window.__REACT_DEVTOOLS_GLOBAL_HOOK__),
        () => Array.from(document.querySelectorAll('*')).some(el => {
          const k = Object.keys(el).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
          return !!k;
        })
      ]},
      { name: 'Next.js', icon: '▲', color: '#000000', checks: [
        () => !!window.__NEXT_DATA__ || !!document.querySelector('#__NEXT_DATA__'),
        () => !!document.querySelector('script[src*="_next/static"]'),
        () => !!document.querySelector('link[href*="/_next/"]')
      ]},
      { name: 'Vue.js', icon: '💚', color: '#42b883', checks: [
        () => !!window.Vue || !!window.__VUE__,
        () => !!window.__VUE_DEVTOOLS_GLOBAL_HOOK__,
        () => Array.from(document.querySelectorAll('*')).some(el => el.__vue__ || el.__vue3__)
      ]},
      { name: 'Nuxt.js', icon: '💚', color: '#00C58E', checks: [
        () => !!window.__NUXT__ || !!window.$nuxt
      ]},
      { name: 'Angular', icon: '🔺', color: '#DD0031', checks: [
        () => !!window.angular || !!document.querySelector('[ng-app], [ng-version]'),
        () => !!window.getAllAngularRootElements,
        () => Array.from(document.querySelectorAll('*')).some(el => el.constructor?.name?.startsWith?.('Angular'))
      ]},
      { name: 'Svelte', icon: '🔥', color: '#FF3E00', checks: [
        () => !!window.__svelte,
        () => Array.from(document.querySelectorAll('*')).some(el => el.__svelte || Object.keys(el).some(k => k.startsWith('__svelte')))
      ]},
      { name: 'SvelteKit', icon: '🔥', color: '#FF3E00', checks: [
        () => !!document.querySelector('script[data-sveltekit-hydrate]')
      ]},
      { name: 'Ember.js', icon: '🐹', color: '#E04E39', checks: [
        () => !!window.Ember || !!window.Em
      ]},
      { name: 'Backbone.js', icon: '🦴', color: '#0071b5', checks: [
        () => !!window.Backbone
      ]},
      { name: 'Alpine.js', icon: '🏔️', color: '#77C1D2', checks: [
        () => !!window.Alpine || !!document.querySelector('[x-data], [x-init]')
      ]},
      { name: 'htmx', icon: '⚡', color: '#3d72d7', checks: [
        () => !!window.htmx || !!document.querySelector('[hx-get], [hx-post], [hx-target]')
      ]},
      { name: 'jQuery', icon: '🔵', color: '#0769AD', checks: [
        () => !!window.jQuery || !!window.$?.fn?.jquery
      ]}
    ];

    for (const framework of jsFrameworkChecks) {
      if (framework.checks.some(check => { try { return check(); } catch(e) { return false; } })) {
        tech.frameworks.push({ name: framework.name, icon: framework.icon, color: framework.color });
      }
    }

    // =====================================================
    // CSS FRAMEWORK DETECTION
    // =====================================================
    const cssChecks = [
      { name: 'Tailwind CSS', icon: '🎨', color: '#06B6D4', checks: [
        () => !!document.querySelector('[class*="tw-"], [class*="text-"], [class*="bg-"], [class*="flex-"], [class*="px-"]'),
        () => Array.from(document.styleSheets).some(ss => { try { return ss.href?.includes('tailwind'); } catch(e) { return false; } }),
        () => !!document.querySelector('script[src*="tailwind"]')
      ]},
      { name: 'Bootstrap', icon: '🅱️', color: '#7952B3', checks: [
        () => !!window.bootstrap || !!document.querySelector('[class*="col-md-"], [class*="col-lg-"], .container-fluid'),
        () => Array.from(document.styleSheets).some(ss => { try { return ss.href?.includes('bootstrap'); } catch(e) { return false; } })
      ]},
      { name: 'Material UI', icon: '🎯', color: '#1976D2', checks: [
        () => !!document.querySelector('[class*="MuiBox"], [class*="MuiButton"], [class*="makeStyles"]')
      ]},
      { name: 'Chakra UI', icon: '⚡', color: '#319795', checks: [
        () => !!document.querySelector('[class*="chakra"]')
      ]},
      { name: 'Ant Design', icon: '🐜', color: '#1890FF', checks: [
        () => !!document.querySelector('[class*="ant-"]')
      ]},
      { name: 'Bulma', icon: '💪', color: '#00D1B2', checks: [
        () => !!document.querySelector('.columns, .column, .hero, .navbar, .card.bulma'),
        () => Array.from(document.styleSheets).some(ss => { try { return ss.href?.includes('bulma'); } catch(e) { return false; } })
      ]},
      { name: 'Foundation', icon: '🏗️', color: '#1779BA', checks: [
        () => !!document.querySelector('.foundation, .grid-container, .cell'),
        () => !!window.Foundation
      ]},
      { name: 'Shadcn/UI', icon: '🎨', color: '#18181B', checks: [
        () => !!document.querySelector('[data-radix-popper-content-wrapper], [data-radix-collection-item]')
      ]}
    ];

    for (const css of cssChecks) {
      if (css.checks.some(check => { try { return check(); } catch(e) { return false; } })) {
        tech.cssFrameworks.push({ name: css.name, icon: css.icon, color: css.color });
      }
    }

    // =====================================================
    // PLATFORM/CMS DETECTION
    // =====================================================
    const platformChecks = [
      { name: 'WordPress', icon: '🔵', color: '#21759B', checks: [
        () => !!window.wp || !!document.querySelector('link[href*="wp-content"], script[src*="wp-content"], meta[name="generator"][content*="WordPress"]'),
        () => !!document.querySelector('#wpadminbar, .wp-admin')
      ]},
      { name: 'Shopify', icon: '🛒', color: '#96BF48', checks: [
        () => !!window.Shopify || !!document.querySelector('script[src*="shopify.com"], link[href*="myshopify"]'),
        () => !!document.querySelector('[data-shopify], meta[content*="Shopify"]')
      ]},
      { name: 'Webflow', icon: '🌊', color: '#146EF5', checks: [
        () => !!window.Webflow || !!document.querySelector('[data-wf-site], [data-wf-page]'),
        () => Array.from(document.scripts).some(s => s.src?.includes('webflow'))
      ]},
      { name: 'Wix', icon: '🔵', color: '#0C6EBD', checks: [
        () => !!window.wixBiSession || !!document.querySelector('[data-mesh-id], meta[content*="Wix"]'),
        () => Array.from(document.scripts).some(s => s.src?.includes('wix.com'))
      ]},
      { name: 'Squarespace', icon: '⬜', color: '#222222', checks: [
        () => !!window.Static || !!document.querySelector('meta[content*="Squarespace"]'),
        () => Array.from(document.scripts).some(s => s.src?.includes('squarespace'))
      ]},
      { name: 'Ghost', icon: '👻', color: '#15171A', checks: [
        () => !!window.ghost || !!document.querySelector('meta[name="generator"][content*="Ghost"]')
      ]},
      { name: 'Framer', icon: '🖼️', color: '#0055FF', checks: [
        () => Array.from(document.scripts).some(s => s.src?.includes('framerusercontent') || s.src?.includes('framer')),
        () => !!document.querySelector('[data-framer-component-type]')
      ]},
      { name: 'Webflow', icon: '🌊', color: '#146EF5', checks: [
        () => !!window.Webflow
      ]},
      { name: 'Notion', icon: '📝', color: '#000000', checks: [
        () => window.location.hostname.includes('notion.site') || window.location.hostname === 'notion.so'
      ]},
      { name: 'HubSpot CMS', icon: '🧡', color: '#FF7A59', checks: [
        () => !!window._hsp || !!window.HubSpot,
        () => Array.from(document.scripts).some(s => s.src?.includes('hubspot'))
      ]},
      { name: 'Vercel', icon: '▲', color: '#000000', checks: [
        () => Array.from(document.scripts).some(s => s.src?.includes('vercel')),
        () => !!document.querySelector('script[src*="_vercel"]')
      ]},
      { name: 'Netlify', icon: '🌐', color: '#00C7B7', checks: [
        () => Array.from(document.scripts).some(s => s.src?.includes('netlify'))
      ]}
    ];

    for (const platform of platformChecks) {
      if (platform.checks.some(check => { try { return check(); } catch(e) { return false; } })) {
        tech.platforms.push({ name: platform.name, icon: platform.icon, color: platform.color });
      }
    }

    // =====================================================
    // ANALYTICS DETECTION
    // =====================================================
    const analyticsChecks = [
      { name: 'Google Analytics 4', icon: '📊', checks: [() => !!window.gtag || !!window.ga || Array.from(document.scripts).some(s => s.src?.includes('googletagmanager') || s.src?.includes('google-analytics'))] },
      { name: 'Google Tag Manager', icon: '🏷️', checks: [() => !!window.google_tag_manager || !!document.querySelector('script[src*="googletagmanager"]')] },
      { name: 'Plausible', icon: '📈', checks: [() => !!window.plausible || Array.from(document.scripts).some(s => s.src?.includes('plausible'))] },
      { name: 'Mixpanel', icon: '📉', checks: [() => !!window.mixpanel] },
      { name: 'Amplitude', icon: '📡', checks: [() => !!window.amplitude] },
      { name: 'Segment', icon: '🔷', checks: [() => !!window.analytics?.track] },
      { name: 'Hotjar', icon: '🔥', checks: [() => !!window.hj || !!window._hjSettings] },
      { name: 'FullStory', icon: '🎬', checks: [() => !!window.FS] },
      { name: 'Clarity', icon: '🔮', checks: [() => !!window.clarity] },
      { name: 'Heap', icon: '🗂️', checks: [() => !!window.heap] },
      { name: 'PostHog', icon: '🦔', checks: [() => !!window.posthog] }
    ];

    for (const a of analyticsChecks) {
      if (a.checks.some(check => { try { return check(); } catch(e) { return false; } })) {
        tech.analytics.push({ name: a.name, icon: a.icon });
      }
    }

    // =====================================================
    // AD PIXEL DETECTION
    // =====================================================
    const adChecks = [
      { name: 'Meta Pixel (Facebook)', icon: '👤', checks: [() => !!window.fbq || !!window._fbq] },
      { name: 'Google Ads', icon: '📢', checks: [() => !!window.google_conversion_id || Array.from(document.scripts).some(s => s.src?.includes('googleadservices'))] },
      { name: 'TikTok Pixel', icon: '🎵', checks: [() => !!window.ttq || !!window.TiktokAnalyticsObject] },
      { name: 'LinkedIn Insight', icon: '💼', checks: [() => !!window._linkedin_partner_id || Array.from(document.scripts).some(s => s.src?.includes('snap.licdn'))] },
      { name: 'Twitter/X Pixel', icon: '𝕏', checks: [() => !!window.twq || Array.from(document.scripts).some(s => s.src?.includes('analytics.twitter'))] },
      { name: 'Pinterest Tag', icon: '📌', checks: [() => !!window.pintrk] },
      { name: 'Snapchat Pixel', icon: '👻', checks: [() => !!window.snaptr] }
    ];

    for (const a of adChecks) {
      if (a.checks.some(check => { try { return check(); } catch(e) { return false; } })) {
        tech.adPixels.push({ name: a.name, icon: a.icon });
      }
    }

    // =====================================================
    // OTHER SERVICES
    // =====================================================
    const otherChecks = [
      { name: 'Intercom', icon: '💬', checks: [() => !!window.Intercom] },
      { name: 'Crisp', icon: '💬', checks: [() => !!window.$crisp] },
      { name: 'Drift', icon: '💬', checks: [() => !!window.drift] },
      { name: 'Zendesk', icon: '🎟️', checks: [() => !!window.zE] },
      { name: 'Stripe', icon: '💳', checks: [() => !!window.Stripe || Array.from(document.scripts).some(s => s.src?.includes('js.stripe.com'))] },
      { name: 'Paddle', icon: '🏓', checks: [() => !!window.Paddle] },
      { name: 'Cloudflare', icon: '☁️', checks: [() => Array.from(document.scripts).some(s => s.src?.includes('cdnjs.cloudflare.com') || s.src?.includes('cdn.cloudflare')), () => !!window.__cfBeacon] },
      { name: 'Sentry', icon: '🐛', checks: [() => !!window.Sentry || !!window.__SENTRY__] },
      { name: 'Auth0', icon: '🔐', checks: [() => !!window.auth0] },
      { name: 'Supabase', icon: '⚡', checks: [() => Array.from(document.scripts).some(s => s.src?.includes('supabase'))] },
      { name: 'Firebase', icon: '🔥', checks: [() => !!window.firebase || Array.from(document.scripts).some(s => s.src?.includes('firebase'))] }
    ];

    for (const o of otherChecks) {
      if (o.checks.some(check => { try { return check(); } catch(e) { return false; } })) {
        tech.other.push({ name: o.name, icon: o.icon });
      }
    }

    return tech;
  }

  function getPageMeta() {
    const getMeta = (name) => document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.content || '';
    const getLink = (rel) => document.querySelector(`link[rel="${rel}"]`)?.href || '';

    return {
      title: document.title,
      description: getMeta('description'),
      generator: getMeta('generator'),
      viewport: getMeta('viewport'),
      ogTitle: getMeta('og:title'),
      ogType: getMeta('og:type'),
      favicon: getLink('icon') || getLink('shortcut icon'),
      canonicalUrl: getLink('canonical'),
      doctype: document.doctype?.name || 'unknown'
    };
  }

  console.log('[Designer OS] Tech detector loaded');
})();
