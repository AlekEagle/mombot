'use strict';

let owners = require('../functions/getOwners');

module.exports = {
  name: 'reboot',

  exec: async (client, msg, args) => {
    if (await owners.isAdmin(msg.author.id)) {
      client.createMessage(
        msg.channel.id,
        `Alright ${msg.author.username}! Imma go take a nap!`
      );
      setTimeout(() => {
        process.exit(0);
      }, 100);
    } else
      client.createMessage(
        msg.channel.id,
        'You need the permission `BOT_ADMIN_OWNER` to use this command!'
      );
  },

  options: {
    hidden: true,
    fullDescription: 'Reboots the bot (owner only command)',
    aliases: ['restart', 'reboit']
  }
};
