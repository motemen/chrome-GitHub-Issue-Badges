declare var chrome: any;
import { Issue } from './issue';
import { BadgeView } from './badgeView';

function pickupUrls() {
    const links = Array.prototype.slice.call(document.body.querySelectorAll('a.issue-link'))
        .filter((link: HTMLAnchorElement) => !link.querySelector('svg.embed-badge'));

    if (links.length === 0) {
        return Promise.resolve({ links: [], issues: [] });
    }
    // TODO: do nothing when links.length is zero.
    return new Promise((ok, ng) => {
        chrome.runtime.sendMessage(
            links.map((link: HTMLAnchorElement) => link.href),
            (issues: any[]) => { ok({ links, issues }); },
        );
    });
}

function escapeHTML(str: string) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

function update() {
    pickupUrls().then((arg: any) => {
        const links: HTMLAnchorElement[] = arg.links;
        const issues: any[] = arg.issues;

        const maxNumberLength = Math.max.apply(null, issues.map((i) => i.number.toString().length));
        const maxStateLength = Math.max.apply(null, issues.map((i) => i.state.length));

        let linkMap: { [url: string]: { html: string; number: number; title: string; } } = {};

        linkMap = issues.reduce((map, issueData) => {
            const users = issueData.assignees.length > 0 ? issueData.assignees : [ issueData.user ];
            const issue = new Issue(
                issueData.repository_url,
                '#' + issueData.number,
                (issueData.merged ? 'merged' : issueData.state),
                users,
            );
            const badgeView = new BadgeView(issue, maxNumberLength, maxStateLength);
            map[issueData.html_url] = {
              html: badgeView.render() + escapeHTML(issueData.title),
              title: issueData.title,
              number: issueData.number,
            };
            return map;
        }, linkMap);

        links.forEach((link) => {
            const entry = linkMap[link.href];
            if (entry) {
                link.innerHTML = entry.html;
                link.classList.add('tooltipped');
                link.classList.add('tooltipped-ne');
                link.setAttribute('aria-label', `#${entry.number} ${entry.title}`);
                // XXX: hack to suppress GitHub's default tooltip behavior
                link.removeAttribute('data-url');
            }
        });
    });
}

const observer = new MutationObserver((mutations) => {
    update();
});
observer.observe(document.body, { childList: true, subtree: true });

update();
