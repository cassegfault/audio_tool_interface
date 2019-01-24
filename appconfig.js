const environment = {};

switch (process.env.NODE_ENV) {
    default:
        environment.__API_PATH = JSON.stringify('/api');
        break;
}

module.exports = environment;