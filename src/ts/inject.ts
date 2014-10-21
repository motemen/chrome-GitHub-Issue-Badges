import config = require('./config');

function update () {
  Array.prototype.forEach.call(document.body.querySelectorAll('a.issue-link'), function (link: HTMLAnchorElement) {
    if (link.querySelector('img.badge')) return;

    var m = /^https?:\/\/[^\/]+\/([^\/]+)\/([^\/]+)\/(?:issues|pull)\/(\d+)\b/.exec(link.href);
    var img = document.createElement('img');
    img.src = config.badgeOrigin + '/badge/' + m[1] + '/' + m[2] + '/' + m[3];
    img.style.verticalAlign = 'middle';
    img.classList.add('badge');
    img.addEventListener('load', function () {
      link.removeChild(link.firstChild);
    });
    link.appendChild(img);
  });
}

update();

var observer = new MutationObserver(function (mutations) {
  update();
});
observer.observe(document.body, { childList: true, subtree: true });
