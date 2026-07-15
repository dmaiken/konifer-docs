const path = require('node:path');

function createConfigSnippet({trackingID, anonymizeIP}) {
  return `window.gtag('config', '${trackingID}', { ${anonymizeIP ? "'anonymize_ip': true" : ''} });`;
}

module.exports = function guardedGtagPlugin(_context, options) {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const trackingIDs = Array.isArray(options.trackingID) ? options.trackingID : [options.trackingID];
  const firstTrackingID = trackingIDs[0];

  return {
    name: 'guarded-gtag',
    getClientModules() {
      return [path.resolve(__dirname, './client.js')];
    },
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: 'https://www.google-analytics.com',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: 'https://www.googletagmanager.com',
            },
          },
          {
            tagName: 'script',
            attributes: {
              async: true,
              src: `https://www.googletagmanager.com/gtag/js?id=${firstTrackingID}`,
            },
          },
          {
            tagName: 'script',
            innerHTML: `
              window.dataLayer = window.dataLayer || [];
              if (typeof window.gtag !== 'function') {
                window.gtag = function gtag(){window.dataLayer.push(arguments);}
              }
              window.gtag('js', new Date());
              ${trackingIDs.map((trackingID) => createConfigSnippet({trackingID, anonymizeIP: options.anonymizeIP})).join('\n')}
            `,
          },
        ],
      };
    },
  };
};
