/**
 * PropertyFlow — Meta (Facebook) Pixel loader, consent-gated
 * v2.0
 *
 * SETUP: paste the Pixel/Dataset ID from Meta Events Manager below.
 * Until an ID is set this file is a safe no-op — nothing loads, nothing fires.
 *
 * ⚠️ AS OF 8 SEPT 2026 THE ID IS STILL EMPTY, SO THE PIXEL HAS NEVER FIRED
 * ONCE, on any page, since it was installed. Two consequences worth knowing
 * before anyone plans spend:
 *   - £500/month of Meta and Instagram is scheduled from 21 September. Without
 *     an ID it runs blind: no conversion data, no optimisation, no retargeting.
 *   - The audience and conversion history a pixel builds cannot be backfilled.
 *     Every day it stays empty is a day of learning the campaigns start
 *     without. This is the one item on the tracking list where waiting has a
 *     cost that cannot be recovered later.
 *   - privacy-policy.html names the Meta Pixel nine times. That is currently
 *     inaccurate in our favour, but it is still inaccurate.
 *
 * WHAT CHANGED IN v2, AND WHY THIS FILE GOT SMALLER
 * It used to fire its own conversion events — PageView, InitiateCheckout,
 * Lead, PartnerApplyIntent, CalculatorEngaged. That was a second, older
 * definition of "a conversion", maintained separately from the one GA4
 * measures, and the two had already drifted:
 *   - it had NO sign-up event at all, so Meta's bidding could only ever
 *     optimise toward click-throughs to the app rather than registrations;
 *   - `Lead` fired on ANY HubSpot form submission, so a plain contact enquiry
 *     counted the same as a Partner application;
 *   - `CalculatorEngaged` targeted #calculator, which the September redesign
 *     removed — it could no longer fire under any circumstances.
 *
 * So conversion events now go through pfTrack in js/analytics.js, which feeds
 * GA4, the GTM dataLayer and Meta from ONE call site (see META_EVENTS there).
 * GA4 and Meta can no longer disagree about what a conversion is, and adding
 * an event means touching one place instead of two.
 *
 * This file's remaining job: load the pixel after consent, and send the one
 * PageView. Everything else is analytics.js.
 *
 * PECR/consent: loads ONLY after the visitor accepts (pf_cookie_consent, set
 * by js/cookie-consent.js). If they accept mid-visit it initialises then.
 * Withdrawal is handled by cookie-consent.js, which clears _fbp and _fbc.
 *
 * STILL NEEDED OUTSIDE THIS FILE:
 *   - The pixel inside app.propertyflow.uk. register, model_chosen and
 *     first_property_added all happen there, and they are the events worth
 *     optimising toward. Without them Meta's best available signal is
 *     InitiateCheckout — someone clicking through — which for a £9.99 product
 *     is the difference between the budget working and not.
 *   - Conversions API for server-side deduplication and iOS attribution.
 *     Needs a server endpoint; not built.
 */
(function () {
  'use strict';

  var PIXEL_ID = ''; // ← PASTE META PIXEL ID HERE (e.g. '1234567890123456')

  var id = window.PF_META_PIXEL_ID || PIXEL_ID;
  if (!id) {
    if (window.console && console.info) {
      console.info('[meta-pixel] no Pixel ID configured — Meta tracking disabled');
    }
    return;
  }

  var COOKIE_NAME = 'pf_cookie_consent';
  var initialised = false;

  function hasConsent() {
    return new RegExp('(^|;\\s*)' + COOKIE_NAME + '=accepted').test(document.cookie);
  }

  function loadPixel() {
    if (initialised || !hasConsent()) return;
    initialised = true;

    /* Meta base code (official snippet) */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }

  /* Not { once: true } — consent can be withdrawn and given again, and
     loadPixel is idempotent. */
  document.addEventListener('pf:consent-granted', loadPixel);
  if (hasConsent()) loadPixel();
})();
