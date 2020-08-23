const CommandClient = require('eris-command-handler');
const env = process.env;
const fs = require('fs');
const u_wut_m8 = require('./.auth.json');
const request = require('request');
const Logger = require('./functions/logger');
const console = new Logger();
let settings = require('./functions/settings');
let globalBlacklist = require('./functions/globalBlacklist');
let stats = require('./functions/commandStatistics');
let owners = require('./functions/getOwners');
let prefixes = require('./functions/managePrefixes');
let suggestions = require('./functions/suggestionsHandler');
let i = 0;
const Sentry = require('@sentry/node');
Sentry.init({
    dsn: "https://1339921d7a004e06bf7207c2b2ee3132@o238460.ingest.sentry.io/5400574"
});
owners.initializeOwners().then(list => {
    console.log(`Loaded owners. There are currently ${list.users.length} owners.`);
}, (err) => {
    console.error(err)
});
suggestions.initializeSuggestions().then(suggestions => {
    console.log(`Loaded suggestions. There are currently ${suggestions.length} suggestions, get crackin!`);
}, (err) => {
    console.error(err)
});
const client = new CommandClient(env.DEBUG ? u_wut_m8.otherToken : u_wut_m8.token, {
    maxShards: env.DEBUG ? 3 : 'auto',
    getAllUsers: true,
    messageLimit: 0,
    defaultImageFormat: 'png',
    defaultImageSize: 2048
}, {
    description: 'The wife of Dad Bot! Invite him at https://alekeagle.com/dad_bot',
    owner: 'AlekEagle#0001',
    prefix: env.DEBUG ? 'test!' : 'm!'
});

client.editStatus('dnd', {
    type: 3,
    name: `myself start up!`
});

client.on('ready', () => {
    console.log('Connected.');
    if (!env.DEBUG) {
        request.post(`https://maker.ifttt.com/trigger/bot_connected/with/key/${u_wut_m8.iftttToken}`, {
            json: {
                value1: 'Mom Bot'
            }
        }, () => {
            console.log(`Told IFTTT that bot (re)connected`);
        });
    }
    client.users.set('1', {id: '1', createdAt: '2015-05-15T04:00:00.000Z', mention: '<@1>', bot: true, username: 'Clyde', discriminator: '0001', avatar: 'f78426a064bc9dd24847519259bc42af', system: true});
    loadCmds();
    loadEvts();
});

prefixes.managePrefixes({
    action: 'refresh',
    client
}).then(prefixes => {
    console.log(`Loaded ${prefixes.length} guild prefix(es).`)
});
prefixes.on('newPrefix', (id, prefix) => client.registerGuildPrefix(id, prefix));
prefixes.on('removePrefix', (id) => {
    delete client.guildPrefixes[id];
});
prefixes.on('updatePrefix', (id, prefix) => {
    client.guildPrefixes[id] = prefix;
});

global.loadEvts = (reload) => {
    if (reload) {
        client.eventNames().forEach(e => {
            if (e !== 'ready') {
                var eventlisteners = client.rawListeners(e);
                if (e === 'messageReactionAdd' || e === 'messageReactionRemove' || e === 'messageCreate') {
                    eventlisteners = eventlisteners.slice(1);
                }
                eventlisteners.forEach(ev => {
                    client.removeListener(e, ev);
                })

            }
        });
    }
    var events = fs.readdirSync('./events');
    console.log(`Loading ${events.length} events, please wait...`)
    events.forEach(e => {
        if (reload) delete require.cache[require.resolve(`./events/${e}`)];
        var eventFile = require(`./events/${e}`);
        client.on(eventFile.name, (...args) => {
            eventFile.exec(client, ...args)
        });
    });
}

global.loadCmds = (reload) => {
    if (reload) {
        Object.values(client.commands).map(c => c.label).filter(c => c !== 'help').forEach(c => {
            client.unregisterCommand(c);
        });
    }
    var commands = fs.readdirSync('./cmds');
    console.log(`Loading ${commands.length} commands, please wait...`)
    commands.forEach(c => {
        if (reload) delete require.cache[require.resolve(`./cmds/${c}`)];
        var cmdFile = require(`./cmds/${c}`);
        stats.initializeCommand(cmdFile.name);
        client.registerCommand(cmdFile.name, (msg, args) => {
            stats.updateUses(cmdFile.name);
            globalBlacklist.getValueByID(msg.channel.id).then(stat => {
                if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                    msg.channel.createMessage('This channel has been blacklisted from Mom Bot!, if you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nThis channel may no longer use these commands: `' + stat.cmds.join(', ') + '`');
                    return;
                } else {
                    globalBlacklist.getValueByID(msg.author.id).then(stat => {
                        if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                            msg.author.getDMChannel().then(chn => {
                                chn.createMessage('You have been blacklisted from Mom Bot! If you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nYou may no longer use these commands: `' + stat.cmds.join(', ') + '`').catch(() => {
                                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from Mom Bot! If you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nYou may no longer use these commands: \`${stat.cmds.join(', ')}\``);
                                });
                            });
                        } else {
                            if (msg.channel.guild) {
                                globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
                                    if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                                        msg.channel.createMessage('This server has been blacklisted from Mom Bot!, if you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nThis server may no longer use these commands: `' + stat.cmds.join(', ') + '`');
                                        return;
                                    } else {
                                        cmdFile.exec(client, msg, args);
                                    }
                                });
                            } else {
                                cmdFile.exec(client, msg, args);
                            }
                        }
                    });
                }
            });
        }, cmdFile.options);
    });
}
client.connect();