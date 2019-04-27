const package = require("./package.json");

module.exports = {
    Client: require('./src/client.js'),
    AdvancedClient: require('./src/client.js'),
    version: package.version,
    aciklama: package.description
};