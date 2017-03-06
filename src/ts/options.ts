document.addEventListener('DOMContentLoaded', function() {
    function githubConfig() {
        const githubToken: any = document.querySelector('.github-config [name="github-token"]');
        const token = githubToken.value;
        return token ? {
            origin  : 'https://github.com',
            apiRoot : 'https://api.github.com',
            token   : token
        } : undefined;
    }
    function githubEnterpriseConfig() {
        const config: any = document.querySelector('.github-enterprise-config');
        const origin = config.querySelector('[name="origin"]').value;
        const apiRoot = config.querySelector('[name="api-root"]').value;
        const token = config.querySelector('[name="token"]').value;
        return origin && apiRoot && token ? {
            origin  : origin,
            apiRoot : apiRoot,
            token   : token
        } : undefined;
    }
    document.querySelector('.save-button').addEventListener('click', function(e) {
        const github = githubConfig();
        const githubEnterprise = githubEnterpriseConfig();

        const configs = [github, githubEnterprise].filter(c => c !== undefined)
        console.log(configs)
        localStorage.setItem('origins', JSON.stringify(configs))
    })
})
