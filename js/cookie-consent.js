/**
 * PropertyFlow Cookie Consent Banner
 * PECR-compliant, lightweight, no dependencies
 * v2.0 (Sept 2026)
 *
 * - Strictly necessary cookies only until the visitor chooses.
 * - "Accept" sets pf_cookie_consent=accepted (12 months) and dispatches
 *   `pf:consent-granted`; GA4 (inline head loader), the Meta pixel
 *   (js/meta-pixel.js) and the HubSpot tracker (loaded here) start only then.
 * - "Reject" sets pf_cookie_consent=rejected (12 months); nothing else loads.
 * - window.pfCookieSettings() reopens the banner (the "Cookie settings"
 *   footer link on every page calls it).
 */
(function () {
  'use strict';

  var COOKIE_NAME = 'pf_cookie_consent';
  var COOKIE_DAYS = 365;
  var POLICY_URL = '/cookies/';
  var HUBSPOT_SRC = '//js-eu1.hs-scripts.com/147879634.js';

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  /* HubSpot tracking (analytics/functionality cookies) — only after consent */
  function loadHubSpot() {
    if (window.__pfHubSpot) return;
    window.__pfHubSpot = true;
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.id = 'hs-script-loader';
    s.async = true;
    s.defer = true;
    s.src = HUBSPOT_SRC;
    document.head.appendChild(s);
  }

  if (getCookie(COOKIE_NAME) === 'accepted') {
    loadHubSpot();
  } else {
    document.addEventListener('pf:consent-granted', loadHubSpot);
  }

  var banner = null;

  function buildBanner() {
    banner = document.createElement('div');
    banner.id = 'pf-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.style.cssText =
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
      'background:#141A23;color:#ffffff;font-family:inherit;' +
      'padding:1rem 1.5rem;box-sizing:border-box;' +
      'box-shadow:0 -2px 12px rgba(17,17,17,0.35);';

    var inner = document.createElement('div');
    inner.style.cssText =
      'max-width:1200px;margin:0 auto;display:flex;align-items:center;' +
      'justify-content:space-between;gap:1rem;flex-wrap:wrap;';

    var text = document.createElement('p');
    text.style.cssText = 'margin:0;font-size:0.9rem;line-height:1.5;flex:1 1 0%;min-width:240px;';
    text.innerHTML =
      'We use strictly necessary cookies to run the site. With your consent we also use ' +
      'analytics and marketing cookies to understand how the site is used. ' +
      'You can change your choice at any time from the Cookie settings link in the footer. ' +
      '<a href="' + POLICY_URL + '" style="color:#eea946;text-decoration:underline;">Cookie&nbsp;Policy</a>';

    var btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'flex-shrink:0;display:flex;gap:0.6rem;flex-wrap:wrap;';

    function makeButton(label, primary) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText =
        'padding:0.55rem 1.4rem;font-size:0.9rem;font-weight:600;border-radius:0.625rem;' +
        'cursor:pointer;font-family:inherit;transition:background 0.2s cubic-bezier(0.16,1,0.3,1);' +
        (primary ? 'background:#E65A38;color:#ffffff;border:none;'
                 : 'background:transparent;color:#ffffff;border:1px solid rgba(255,255,255,0.45);');
      b.addEventListener('focus', function () { b.style.boxShadow = '0 0 0 3px rgba(230,90,56,0.45)'; });
      b.addEventListener('blur', function () { b.style.boxShadow = 'none'; });
      return b;
    }

    var reject = makeButton('Reject non-essential', false);
    var accept = makeButton('Accept all', true);

    function close() {
      banner.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1)';
      banner.style.transform = 'translateY(100%)';
      setTimeout(function () {
        if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
        banner = null;
      }, 400);
    }

    accept.addEventListener('click', function () {
      setCookie(COOKIE_NAME, 'accepted', COOKIE_DAYS);
      try { document.dispatchEvent(new CustomEvent('pf:consent-granted')); } catch (e) { /* old browsers */ }
      loadHubSpot();
      close();
    });

    reject.addEventListener('click', function () {
      setCookie(COOKIE_NAME, 'rejected', COOKIE_DAYS);
      close();
    });

    btnWrap.appendChild(reject);
    btnWrap.appendChild(accept);
    inner.appendChild(text);
    inner.appendChild(btnWrap);
    banner.appendChild(inner);
    document.body.appendChild(banner);
  }

  function show() {
    if (banner) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildBanner);
    } else {
      buildBanner();
    }
  }

  /* Reopen the choice from the "Cookie settings" footer link */
  window.pfCookieSettings = function () {
    if (banner) return;
    buildBanner();
  };

  var choice = getCookie(COOKIE_NAME);
  if (choice !== 'accepted' && choice !== 'rejected') show();
})();
