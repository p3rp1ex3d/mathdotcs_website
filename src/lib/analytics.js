// Minimal analytics wrapper for GA4 (gtag) and Clarity
export function pageview(path) {
  try {
    if (window.gtag) {
      window.gtag('event', 'page_view', { page_path: path });
    }
  } catch (e) {
    // ignore
  }

  try {
    if (window.clarity) {
      // clarity doesn't have a formal pageview API, but we can set a property
      window.clarity('set', 'page', path);
    }
  } catch (e) {}
}

export function trackEvent(name, params = {}) {
  try {
    if (window.gtag) {
      window.gtag('event', name, params);
    }
  } catch (e) {}

  try {
    if (window.clarity) {
      window.clarity('event', name);
    }
  } catch (e) {}
}

export function initGA(measurementId) {
  if (!measurementId) return;
  try {
    if (window.gtag) {
      window.gtag('config', measurementId, { send_page_view: false });
    }
  } catch (e) {}
}

// Convenience helpers for commonly used events
export const trackInteractiveLaunch = (id) => trackEvent('interactive_launch', { interactive: id });
export const trackInteractiveComplete = (id) => trackEvent('interactive_complete', { interactive: id });
export const trackSketchOpen = (slug) => trackEvent('sketch_open', { slug });
export const trackSketchSave = (slug) => trackEvent('sketch_save', { slug });
export const trackSketchClear = (slug) => trackEvent('sketch_clear', { slug });
export const trackVideoProgress = (videoId, percent) => trackEvent('video_progress', { videoId, percent });
