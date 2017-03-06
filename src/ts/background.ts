declare var chrome: any;
declare var URL: any;

import config = require('./config');

chrome.webRequest.onHeadersReceived.addListener(function (details: any) {
  var responseHeaders = details.responseHeaders;
  for (var i = 0; i < responseHeaders.length; ++i) {
    if (responseHeaders[i].name === 'Content-Security-Policy') {
      responseHeaders[i].value = responseHeaders[i].value.replace(/\bimg-src\b/, '$& ' + config.badgeOrigin);
    }
  }

  return { responseHeaders: responseHeaders };
}, {
  urls: [ config.githubOrigin + '/*' ],
  types: <any>[ 'main_frame' ] // XXX tsd incorrect
}, [
  'blocking', 'responseHeaders'
]);

chrome.tabs.onUpdated.addListener(function(tagId: any, changeInfo: any, tab: any) {
    if (
        changeInfo.status === 'complete' &&
        ~validOrigins().indexOf(new URL(tab.url).origin)
       ) {
        chrome.tabs.executeScript(tab.id, { file: "js/inject.js" })
    }
})

chrome.runtime.onMessage.addListener(function(req: string[], sender:any, sendResponse:any) {
    const origin = new URL(sender.url).origin;
    // TODO req を uniq する
    Promise.all(req.map(url => {
        const [ _, owner, repo, issueNum ] =
            /^https?:\/\/[^\/]+\/([^\/]+)\/([^\/]+)\/(?:issues|pull)\/(\d+)\b/.exec(url);

        return _fetchIssue(origin, owner, repo, issueNum)
    })).then(issues => {
        sendResponse(issues)
    }).catch(e => {
        sendResponse() // close sendResponse's connection.
    })
    return true; // indicate to send a response asynchronously.
})

function origins():{ [host: string]: { apiRoot: string; token?: string; } } {
    const mapping: { [host: string]: { apiRoot: string; token?: string; } } = {
        'https://github.com': {
            apiRoot: 'https://api.github.com'
        }
    };
    let list: any[] = [];
    if (localStorage.getItem('origins')) {
        try {
            list = JSON.parse(localStorage.getItem('origins'));
        } catch(e) {
            list = [];
        }
    }
    list.forEach((item: any) => {
        mapping[item.origin] = {
            apiRoot: item.apiRoot,
            token  : item.token
        }
    });
    return mapping;
}

function validOrigins() {
    return Object.keys(origins());
}

function _fetchIssue(origin: string, owner: string, repo: string, issueNum: string) {
    const apiRoot = origins()[origin].apiRoot;
    const token   = origins()[origin].token;
    return new Promise((ok: any, ng: any) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `${apiRoot}/repos/${owner}/${repo}/issues/${issueNum}`);
        if (token) {
            xhr.setRequestHeader("Authorization", `token ${token}`)
        }
        xhr.onload  = function(e) { ok(JSON.parse(xhr.responseText)) }
        xhr.onerror = function(e) { ng(e) }
        xhr.send();
    })
}

