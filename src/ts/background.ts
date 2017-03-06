declare var chrome: any;

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
    // TODO github.com もしくは登録された ホストのみで発動するように
    if (changeInfo.status === 'complete') {
        chrome.tabs.executeScript(tab.id, { file: "js/inject.js" })
    }
})

// memo:
// content script はその拡張と同じ permission で cross-origin アクセスできるので、
// content script で issue を鳥にいっても良いのだが、そのためには ghe の token をページに通知してあげる昼用があり message のやり取りの回数は変わらない。
chrome.runtime.onMessage.addListener(function(req: string[], sender:any, sendResponse:any) {
    // TODO req を uniq する
    Promise.all(req.map(url => {
        const [ _, owner, repo, issueNum ] =
            /^https?:\/\/[^\/]+\/([^\/]+)\/([^\/]+)\/(?:issues|pull)\/(\d+)\b/.exec(url);

        return _fetchIssue(owner, repo, issueNum)
    })).then(issues => {
        sendResponse(issues)
    }).catch(e => {
        sendResponse() // close sendResponse's connection.
    })
    return true; // indicate to send a response asynchronously.
})

// github か ghe かで分岐
const apiRoot = '';
const token = '';
function _fetchIssue(owner: string, repo: string, issueNum: string) {
    return new Promise((ok: any, ng: any) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `${apiRoot}/repos/${owner}/${repo}/issues/${issueNum}`);
        xhr.setRequestHeader("Authorization", `token ${token}`)
        xhr.onload  = function(e) { ok(JSON.parse(xhr.responseText)) }
        xhr.onerror = function(e) { ng(e) }
        xhr.send();
    })
}

