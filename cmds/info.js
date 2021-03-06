'use strict';

let nums = require('../functions/numbers');
let time = require('../functions/toReadableTime');
let util = require('util');
let cpu = util.promisify(require('process-cpu-utilization').get);
let memory = require('../functions/memoryUsage');

module.exports = {
    name: 'info',

    exec: (client, msg, args) => {
        msg.channel.sendTyping();
        cpu(['%cpu']).then(data => {
            msg.channel.createMessage({
                embed: {
                    title: 'Info',
                    fields: [{
                            name: 'Commands ran',
                            value: nums.cmdsRan.toLocaleString(),
                            inline: true
                        },
                        {
                            name: 'Messages Read',
                            value: nums.msgsRead.toLocaleString(),
                            inline: true
                        },
                        {
                            name: 'Auto responses answered',
                            value: nums.responses.toLocaleString(),
                            inline: true
                        },
                        {
                            name: 'Server count',
                            value: client.guilds.size.toLocaleString(),
                            inline: true
                        },
                        {
                            name: 'User count',
                            value: client.users.size.toLocaleString(),
                            inline: true
                        },
                        {
                            name: 'Shards',
                            value: client.shards.size,
                            inline: true
                        },
                        {
                            name: 'Current Shard',
                            value: msg.channel.guild.shard.id,
                            inline: true
                        },
                        {
                            name: 'CPU Usage',
                            value: `${data['%cpu']}%`,
                            inline: true
                        },
                        {
                            name: 'Memory Usage',
                            value: `${memory()} / ${memory(require('os').totalmem())}`,
                            inline: true
                        },
                        {
                            name: 'Uptime',
                            value: time(process.uptime()),
                            inline: true
                        }
                    ]
                }
            }).catch(err => {});
        });
    },

    options: {
        description: 'shows basic info about Mom bot!',
        fullDescription: 'There is absloutely nothing else about info.',
        guildOnly: true
    }
}