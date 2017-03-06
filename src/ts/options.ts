document.addEventListener('DOMContentLoaded', function() {
    const configs: any[] = JSON.parse(localStorage.getItem('origins') || '[]');
    configs.forEach(config => {
        if (config.origin === 'https://github.com') {
            if (!config.token) { return }
            const elm: any = document.querySelector('.github-config')
            console.log(config)
            elm.querySelector('[name="token"]').value = config.token
        } else {
            if (!(config.origin && config.apiRoot && config.token)) { return }
            const elm: any = document.querySelector('.github-enterprise-config')
            elm.querySelector('[name="origin"]').value = config.origin
            elm.querySelector('[name="api-root"]').value = config.apiRoot
            elm.querySelector('[name="token"]').value = config.token
        }
    })

    function githubConfig() {
        const githubToken: any = document.querySelector('.github-config [name="token"]');
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
        localStorage.setItem('origins', JSON.stringify(configs))
    })
})
