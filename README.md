# Embed-GitHub-Issue-Badges

![screenshot](docs/screenshot.png)

Chrome extension to embed [GitHub Issue Badge](https://github.com/motemen/github-issue-badge)'s into GitHub issues.

## How to build

    npm install
    npm run build

`build/` directory has the extension content. Install it via `chrome://extension`.

## Build for GitHub:Enterprise or your own deployed app

Before building, edit `src/ts/config.ts` to match your configuration. For example:

```typescript
export var badgeOrigin  = 'http://github-issue-badge.yourcompany.example.com';
export var githubOrigin = 'https://github.yourcompany.example.com';
```
