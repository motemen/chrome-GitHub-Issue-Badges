function getConfig(elm: any) {
    const origin  = elm.querySelector('[name="origin"]').value;
    const apiRoot = elm.querySelector('[name="api-root"]').value;
    const token   = elm.querySelector('[name="token"]').value;

    return origin && apiRoot && token ? {
        origin  : origin,
        apiRoot : apiRoot,
        token   : token
    } : undefined;
}

document.addEventListener('DOMContentLoaded', function() {
    const configs: any[] = JSON.parse(localStorage.getItem('origins') || '[]');
    configs.forEach(config => {
        if (config.origin === 'https://github.com') {
            if (!config.token) { return }
            const elm: any = document.querySelector('.github-config')
            elm.querySelector('[name="token"]').value = config.token
        } else {
            if (!(config.origin && config.apiRoot && config.token)) { return }
            const elm: any = document.querySelector('.github-enterprise-config')
            elm.querySelector('[name="origin"]').value = config.origin
            elm.querySelector('[name="api-root"]').value = config.apiRoot
            elm.querySelector('[name="token"]').value = config.token
        }
    })

    document.querySelector('.save-button').addEventListener('click', function(e) {
        const github = getConfig(document.querySelector('.github-config'));
        const githubEnterprise = getConfig(document.querySelector('.github-enterprise-config'));

        const configs = [github, githubEnterprise].filter(c => c !== undefined)
        localStorage.setItem('origins', JSON.stringify(configs))
    })

    Array.prototype.forEach.call(document.querySelectorAll('.test-button'), (button: HTMLButtonElement) => {
        button.addEventListener('click', function(e: any) {
            const config = getConfig(e.target.parentNode);
            if (config === undefined) {
                alert('please input')
                return;
            }
            const xhr = new XMLHttpRequest();
            xhr.open("GET", config.apiRoot);
            xhr.setRequestHeader("Authorization", `token ${config.token}`)
            xhr.onload  = function(e) {
                alert('connection ' + xhr.statusText + ': ' + xhr.responseText)
            }
            xhr.onerror = function(e) {
                alert('connection failed')
            }
            xhr.send();
        })
    })
})
