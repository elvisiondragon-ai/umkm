// 🎯 Meta Pixel Utility for UMKM
// Based on the specific requirements: Only PageView and ViewContent

const TEST_CODE_MAPPING: Record<string, string> = {
  'testcode_indo': 'TEST39702',
};

export const initFacebookPixel = (pixelId: string): void => {
  if (typeof window === 'undefined') return;
  if ((window as any).fbq) return;

  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return; 
    n = f.fbq = function() { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; 
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  (window as any).fbq('init', pixelId);
};

export const trackPageView = (pixelId: string, testCode?: string) => {
  if (typeof window === 'undefined' || !(window as any).fbq) return;
  const options: any = {};
  if (testCode) options.test_event_code = TEST_CODE_MAPPING[testCode] || testCode;
  (window as any).fbq('trackSingle', pixelId, 'PageView', {}, options);
};

export const trackViewContent = (pixelId: string, eventData: any = {}, testCode?: string) => {
  if (typeof window === 'undefined' || !(window as any).fbq) return;
  const options: any = {};
  if (testCode) options.test_event_code = TEST_CODE_MAPPING[testCode] || testCode;
  (window as any).fbq('trackSingle', pixelId, 'ViewContent', eventData, options);
};
