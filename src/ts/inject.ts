import config = require('./config');
declare var Promise: any;
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

function update () {
    const links = Array.prototype.slice.call(document.body.querySelectorAll('a.issue-link'))
    links.forEach(function (link: HTMLAnchorElement) {
        if (link.querySelector('svg.embed-badge')) { return; }

        const [ url, owner, repo, issueNum ] =
            /^https?:\/\/[^\/]+\/([^\/]+)\/([^\/]+)\/(?:issues|pull)\/(\d+)\b/.exec(link.href);

        return _fetchIssue(owner, repo, issueNum).then((issueData: any) => {
            const user = issueData.assignee || issueData.user
            const issue = new Issue(
                issueData.repository_url,
                '#' + issueData.number,
                issueData.state,
                user,
                issueData.labels
            )
            const badgeView = new BadgeView(issue)
            
            if (issueData.state === 'closed') {
                link.style.textDecoration = 'line-through'
                link.style.color = 'red'
            }
            link.innerHTML = badgeView.render() + ' ' + issueData.title;
        })
    })
}

update();

var observer = new MutationObserver(function (mutations) {
    update();
});
// observer.observe(document.body, { childList: true, subtree: true });

// --------------------------

class Issue {
    constructor(
        public repo: string,
        public number: string,
        public state: string,
        public assignee: { avatar_url: string },
        public labels?: Label[]
    ) {}
}

class Label {
    constructor(
        public color: string,
        public name: string,
        public url: string
    ) {}
}

const BADGE_HEIGHT = 20
const LABEL_WIDTH  =  8

class BadgeView {
    static stateColors: { [key: string]: string; } = {
        open   : '6CC644',
        merged : '6E5494',
        closed : 'BD2C00'
    };
    issue: Issue;

    constructor(issue: Issue/* badgeHeight, labelWidth */) {
        this.issue = issue;
    }

    get badgeWidth() {
        const iconSize = this.badgeHeight;
        return this.numberWidth + this.stateWidth + iconSize/* + this.labelWidth */
    }
    get badgeHeight() {
        return BADGE_HEIGHT;
    }
    get numberWidth() { // not so correct :P
        return 15 + this.issue.number.length * 9
    }
    get stateWidth() { // not so correct :P
        return 10 + this.issue.state.length * 7
    }
    get stateColor() {
        return BadgeView.stateColors[this.issue.state];
    }

    render() {
        const iconSize = this.badgeHeight;
        return `
<svg class="embed-badge" width="${this.badgeWidth}" height="${this.badgeHeight}">
  <rect x="0" y="0" style="fill:#555"
        width="${this.numberWidth}" height="${this.badgeHeight}" />
  <rect x="${this.numberWidth}" y="0" style="fill:#${this.stateColor}"
        width="${this.stateWidth}" height="${this.badgeHeight}" />
  <rect x="${this.numberWidth + this.stateWidth}" y="0" style="fill:#999"
        width="${this.badgeWidth}" height="${this.badgeHeight}" />
  <!-- TODO: labels -->
  <image x="${this.numberWidth + this.stateWidth}" y="0"
        width="${iconSize}" height="${iconSize}"
        xlink:href="${this.issue.assignee.avatar_url}"></image>
  <linearGradient id="cover" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#bbb" stop-opacity="0.10">
    <stop offset="100%" stop-color="#000" stop-opacity="0.10">
  </linearGradient>
  <rect x="0" y="0" width="${this.badgeWidth}" height="${this.badgeHeight}" style="fill:url(#cover)" />
  <g style="fill:#fff; text-anchor:middle; font-family:DejaVu Sans,Verdana,Geneva,sans-serif; font-size:11px">
    <text x="${this.numberWidth/2-2}" y="15" style="fill:#010101; fill-opacity: .3">${this.issue.number}</text>
    <text x="${this.numberWidth/2-2}" y="14">${this.issue.number}</text>
    <text x="${this.numberWidth+this.stateWidth/2}" y="15" style="fill:#010100; fill-opacity: .3">${this.issue.state}</text>
    <text x="${this.numberWidth+this.stateWidth/2}" y="14">${this.issue.state}</text>
  </g>
</svg>
`
    }
}
