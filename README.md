# GitHub Issue Badges

![screenshot](docs/screenshot.png)

Chrome extension to change issue links into badges.

## How to build

    npm install
    npm run build

## Store links

- [GitHub Issue Badges](https://chrome.google.com/webstore/detail/github-issue-badges/mkfiamgphibplgocbkifgcpnioogccfm)
- [GitHub Issue Badges (for Enterprise)](https://chrome.google.com/webstore/detail/github-issue-badges-for-e/bnbbodldimbdcckbnplohombkipjnmni)

## For developers: how to make a new release

1. Bump version in src/manifest.json
2. Commit changes and make a tag
3. Run `npm run build`
4. Run `./node_modules/.bin/gulp dist`
5. Upload `./dist/{GITHUB,GHE}-<VERSION>.zip` to [Chrome webstore developer dashboard](https://chrome.google.com/webstore/developer/dashboard)
