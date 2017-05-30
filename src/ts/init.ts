if (localStorage.getItem('origins') === null) {
    localStorage.setItem('origins', JSON.stringify([
        {
            origin : 'https://github.com',
            apiRoot: 'https://api.github.com'
        }
    ]))
    localStorage.setItem('mode', 'github')
}
