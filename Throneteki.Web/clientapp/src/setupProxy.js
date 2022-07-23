const createProxyMiddleware = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : env.ASPNETCORE_URLS
    ? env.ASPNETCORE_URLS.split(';')[0]
    : 'http://localhost:51264';

const lobbyTarget = 'https://localhost:7182';

const context = [
    '/api',
    '/img',
    '/_configuration',
    '/.well-known',
    '/Identity',
    '/connect',
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
