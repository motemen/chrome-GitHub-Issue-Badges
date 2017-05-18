export class Issue {
    constructor(
        public repo: string,
        public number: string,
        public state: string,
        public assignees: [ { avatar_url: string } ]
    ) {}
}
