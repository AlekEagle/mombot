'use strict';

let prefixes = require('../functions/managePrefixes');
let owners = require('../functions/getOwners');

module.exports = {
    name: 'prefix',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id) || msg.member.permission.has('manageGuild')) {
            if (args[0] && args[0] !== client.commandOptions.prefix) {
                prefixes.managePrefixes({ action: 'add', serverID: msg.channel.guild.id, prefix: args.join(' ').replace(/((?!^)-(?!\/)-$)/, ' ').replace(/-\/-/, '--') }).then(() => {
                    msg.channel.createMessage(`The server prefix is now \`${client.guildPrefixes[msg.channel.guild.id]}\``);
                }, () => {
                    msg.channel.createMessage('Whoops! everything broke! If the problem continues, go here https://alekeagle.com/discord and complain to the guy named AlekEagle#0001.');
                });
            } else {
                prefixes.managePrefixes({ action: 'remove', serverID: msg.channel.guild.id }).then(() => {
                    msg.channel.createMessage(`The server prefix is now \`${client.commandOptions.prefix}\``);
                }, () => {
                    msg.channel.createMessage('Whoops! everything broke! If the problem continues, go here https://alekeagle.com/discord and complain to the guy named AlekEagle#0001.');
                });
            }
        } else {
            msg.channel.createMessage('You can\'t talk to your mother like that! I don\'t listen to anyone, I only listen to your father, and people with the server permission `MANAGE_SERVER`.');
        }
    },

    options: {
        description: 'sets the prefix! (put "--" at the end of the prefix to indicate a space, if you don\'t want a space at the end, but you want two dashes at the end, use "-/-")',
        usage: '`[prefix[-- for space at end of prefix, -/- to escape the space at the end of the prefix and have a space]|leave blank for default prefix]`',
        fullDescription: 'Examples: \'mom--bot\' = \'mom--bot\'\n\'mom bot--\' = \'mom bot \'\n\'mom bot-/-\' = \'mom bot--\''
    }
}