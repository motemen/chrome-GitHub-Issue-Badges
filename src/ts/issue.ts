export class Issue {
    constructor(
        public repo: string,
        public number: string,
        public state: string,
        public assignee: { avatar_url: string }
    ) {}
}
