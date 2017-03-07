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

function fillInConfig(elm: any, config: any) {
    if (!(config.origin && config.apiRoot && config.token)) { return }
    elm.querySelector('[name="origin"]').value = config.origin
    elm.querySelector('[name="api-root"]').value = config.apiRoot
    elm.querySelector('[name="token"]').value = config.token
}

document.addEventListener('DOMContentLoaded', function() {
    const configs: any[] = JSON.parse(localStorage.getItem('origins') || '[]');
    configs.forEach(config => {
        const elm: any = document.querySelector('.github-config')
        fillInConfig(elm, config)
    })

    document.querySelector('.github-config [name="origin"]').addEventListener('input', e => {
        var elm: any = document.querySelector('.github-config [name="api-root"]');
        elm.value = (<HTMLInputElement>e.target).value + '/api/v3';
    })

    document.querySelector('.save-button').addEventListener('click', function(e) {
        const github = getConfig(document.querySelector('.github-config'));
        const configs = [github].filter(c => c !== undefined)
        localStorage.setItem('origins', JSON.stringify(configs))
        alert('saved')
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
