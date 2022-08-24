const createProxyMiddleware = require('http-proxy-middleware');

const target = 'http://localhost:5287';

const lobbyTarget = 'http://throneteki.lobby:7010';

const context = [
    '/api',
    '/img',
    '/_configuration',
    '/.well-known',
    '/Identity',
    '/connect',
    '/signin-thronesdb',
    '/introspect',
    '/ApplyDatabaseMigrations',
    '/_framework'
];

const lobbyContext = ['/lobbyhub'];

module.exports = function (app) {
    const appProxy = createProxyMiddleware(context, {
        target: target,
        secure: false,
        headers: {
            Connection: 'Keep-Alive'
        }
    });

    const lobbyProxy = createProxyMiddleware(lobbyContext, {
        target: lobbyTarget,
        secure: false,
        ws: true
    });

    app.use(appProxy);
    app.use(lobbyProxy);
};
