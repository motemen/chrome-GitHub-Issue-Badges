import config = require('./config');

Array.prototype.forEach.call(document.querySelectorAll('a.issue-link'), function (link: HTMLAnchorElement) {
  var m = /^https?:\/\/[^\/]+\/([^\/]+)\/([^\/]+)\/(?:issues|pull)\/(\d+)\b/.exec(link.href);
  var img = document.createElement('img');
  img.src = config.badgeOrigin + '/badge/' + m[1] + '/' + m[2] + '/' + m[3];
  img.style.verticalAlign = 'middle';
  link.appendChild(img);
  img.addEventListener('load', function () {
    link.removeChild(link.firstChild);
  });
});
