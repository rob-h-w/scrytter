const Hapi = require('hapi');

const { initializeApp } = require('./application');
const { apiRoutes, routes } = require('./routes');

const server = Hapi.server({
    host: '0.0.0.0',
    port: 8925,
    routes
});

async function start() {
    try {
        await initializeApp();
        await server.register(require('inert'));

        server.route(apiRoutes);

        await server.start();
        console.log('Server started at: ' + server.info.uri);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}

start();
