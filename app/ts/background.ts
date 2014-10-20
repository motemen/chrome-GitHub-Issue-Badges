/// <reference path="../../typings/chrome/chrome.d.ts" />

import config = require('./config');

chrome.webRequest.onHeadersReceived.addListener(function (details) {
  var responseHeaders = details.responseHeaders;
  for (var i = 0; i < responseHeaders.length; ++i) {
    if (responseHeaders[i].name === 'Content-Security-Policy') {
      responseHeaders[i].value = responseHeaders[i].value.replace(/\bimg-src\b/, '$& ' + config.badgeOrigin);
    }
  }

  return { responseHeaders: responseHeaders };
}, {
  urls: [ 'https://github.com/*' ],
  types: <any>[ 'main_frame' ] // XXX tsd incorrect
}, [
  'blocking', 'responseHeaders'
]);
