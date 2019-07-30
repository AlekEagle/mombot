'use strict';


module.exports = {
    name: 'vote',

    exec: (client, msg, args) => {
        msg.channel.createMessage(`vote https://discordbots.org/bot/605864767915294730/vote`)
    },

    options: {
        description: 'Voting will help me a lot!',
        fullDescription: 'Voting will help me a lot!'
    }
}