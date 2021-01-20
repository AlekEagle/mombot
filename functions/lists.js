'use strict';

module.exports = {
    things: require('../lists.json').things,

    reloadLists: () => {
        delete require.cache[require.resolve(`../lists.json`)]
        module.exports.questions = require('../lists.json').things;
    }
}