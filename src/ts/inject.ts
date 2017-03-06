declare var chrome: any;
import { Issue } from './issue';
import { BadgeView } from './badgeView';

function pickupUrls() {
    const links = Array.prototype.slice.call(document.body.querySelectorAll('a.issue-link'))
        .filter((link: HTMLAnchorElement) => !link.querySelector('svg.embed-badge'));

    return new Promise((ok, ng) => {
        chrome.runtime.sendMessage(
            links.map((link: HTMLAnchorElement) => link.href),
            function(issues: any[]) { ok({ links, issues }) }
        )
    })
}

function update() {
    pickupUrls().then((arg: any) => {
        const links: HTMLAnchorElement[] = arg.links;
        const issues: any[] = arg.issues;
        const svgMap = issues.reduce((svgMap, issueData) => {
            const user = issueData.assignee || issueData.user
            const issue = new Issue(
                issueData.repository_url,
                '#' + issueData.number,
                issueData.state,
                user
            )
            const badgeView = new BadgeView(issue)
            svgMap[issueData.html_url] = badgeView.render() + ' ' + issueData.title;
            return svgMap;
        }, <any>{})

        links.forEach(link => {
            const svg = svgMap[link.href];
            if (svg) {
                link.innerHTML = svg;
            }
        })
    });
}

var observer = new MutationObserver(function (mutations) {
    update();
});
observer.observe(document.body, { childList: true, subtree: true });

update();
