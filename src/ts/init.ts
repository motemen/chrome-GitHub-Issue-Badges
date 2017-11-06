import { TokenStatus } from './token_status';

if (localStorage.getItem('origins') === null) {
    localStorage.setItem('origins', JSON.stringify([
        {
            origin : 'https://github.com',
            apiRoot: 'https://api.github.com',
            token: '',
            status: TokenStatus.unchecked
        }
    ]))
    localStorage.setItem('mode', 'github')
}
