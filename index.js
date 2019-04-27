const package = require("./package.json");

module.exports = {
    Client: require('./src/client.js'),
    TheFuntClient: require('./src/client.js'),
    version: package.version,
    aciklama: package.description
};
