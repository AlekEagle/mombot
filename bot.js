const CommandClient = require('eris-command-handler');
const env = process.env;
const fs = require('fs');
const u_wut_m8 = require('./.auth.json');
const DBL = require('dblapi.js');
const request = require('request');
const Logger = require('./functions/logger');
const console = new Logger();
let nums = require('./functions/numbers');
let globalBlacklist = require('./functions/globalBlacklist');
let stats = require('./functions/commandStatistics');
let owners = require('./functions/getOwners');
let prefixes = require('./functions/managePrefixes');
let shards = require('./functions/shardManager');
let suggestions = require('./functions/suggestionsHandler');
let i = 0;
const Sentry = require('@sentry/node');
Sentry.init({ dsn: "https://1339921d7a004e06bf7207c2b2ee3132@o238460.ingest.sentry.io/5400574" });
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
function nextShard() {
    console.log(`Connecting to shard ${i}`);
    const client = new CommandClient(env.DEBUG ? u_wut_m8.otherToken : u_wut_m8.token, {
        firstShardID: i,
        lastShardID: i,
        maxShards: nums.shardCount,
        getAllUsers: true
    }, {
        description: 'The wife of Dad Bot! Invite him at https://alekeagle.com/dad_bot',
        owner: 'AlekEagle#0001',
        prefix: env.DEBUG ? 'test!' : 'm!'
    });
    function onDBLVote(data) {
        client.getDMChannel(data.user).then(msg => {
            msg.createMessage("Thanks for voting! This helps me a lot!").catch(() => {});
        }, () => {
            console.error('Unable to DM user')
        });
    }
    if (i < nums.shardCount && !env.DEBUG) request.post(`https://maker.ifttt.com/trigger/process_started/with/key/${u_wut_m8.iftttToken}`,{
            json: {
                value1: 'Mom Bot',
                value2: i.toString()
            }
        }, () => {
            console.log(`Told IFTTT that shard ${i} started`);
    });
    client.on('ready', () => {
        if (i < nums.shardCount) {
            prefixes.managePrefixes({action: 'refresh', client}).then(prefixes => {
                console.log(`Loaded ${prefixes.length} guild prefix(es).`)
            });
            prefixes.on('newPrefix', (id, prefix) => client.registerGuildPrefix(id, prefix));
            prefixes.on('removePrefix', (id) => {
                delete client.guildPrefixes[id];
            });
            prefixes.on('updatePrefix', (id, prefix) => {
                client.guildPrefixes[id] = prefix;
            });
            shards.connectShard(client.options.firstShardID, client);
            console.log(`Connected to shard ${i}`);
            let http = require('http'),
                app = require('express')(),
                server = http.createServer(app);
            app.post('/vote', (req, res) => {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    body = JSON.parse(body)
                    if (body.type === 'test') {
                        console.log(body)
                        onDBLVote(body)
                    }else {
                        onDBLVote(body)
                    }
                    res.end('{"success":"true"}')
                })
            })
            app.get('/reloadcmds', (req, res) => {
                Object.values(client.commands).map(c => c.label).filter(c => c !== 'help').forEach(c => {
                    client.unregisterCommand(c);
                });
                var commands = fs.readdirSync('./cmds');
                console.log(`Loading ${commands.length} commands, please wait...`)
                commands.forEach(c => {
                    delete require.cache[require.resolve(`./cmds/${c}`)]
                    var cmdFile = require(`./cmds/${c}`);
                    stats.initializeCommand(cmdFile.name);
                    client.registerCommand(cmdFile.name, (msg, args) => {
                        stats.updateUses(cmdFile.name);
                        globalBlacklist.getValueByID(msg.channel.id).then(stat => {
                            if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                                msg.channel.createMessage('This channel has been blacklisted from Mom Bot!, if you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nThis channel may no longer use these commands: `' + stat.cmds.join(', ') + '`');
                                return;
                            }else {
                                globalBlacklist.getValueByID(msg.author.id).then(stat => {
                                    if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                                        msg.author.getDMChannel().then(chn => {
                                            chn.createMessage('You have been blacklisted from Mom Bot! If you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nYou may no longer use these commands: `' + stat.cmds.join(', ') + '`').catch(() => {
                                                msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from Mom Bot! If you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nYou may no longer use these commands: \`${stat.cmds.join(', ')}\``);
                                            });
                                        });
                                    }else {
                                        globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
                                            if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                                                msg.channel.createMessage('This server has been blacklisted from Mom Bot!, if you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nThis server may no longer use these commands: `' + stat.cmds.join(', ') + '`');
                                                return;
                                            }else {
                                                cmdFile.exec(client, msg, args);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }, cmdFile.options)
                });
                res.end('{ "success": true }')
            });
            app.get('/reloadevts', (req, res) => {
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
                var events = fs.readdirSync('./events');
                console.log(`Loading ${events.length} events, please wait...`);
                events.forEach(e => {
                    delete require.cache[require.resolve(`./events/${e}`)];
                    var eventFile = require(`./events/${e}`);
                    client.on(eventFile.name, (...args) => {
                        eventFile.exec(client, ...args);
                    });
                });
            });
            server.listen(parseInt(`427${i}`))
        }
        if (i < nums.shardCount && !env.DEBUG) {
            request.post(`https://maker.ifttt.com/trigger/bot_restarted/with/key/${u_wut_m8.iftttToken}`,{
                json: {
                    value1: 'Mom Bot',
                    value2: client.options.firstShardID.toString()
                }
            }, () => {
                console.log(`Told IFTTT that shard ${client.options.firstShardID} connected`);
            });
            client.editStatus('online', {
                type: 0,
                name: `try ${client.commandOptions.prefix}help`
            });
        }else if (!env.DEBUG) {
            request.post(`https://maker.ifttt.com/trigger/bot_reconnected/with/key/${u_wut_m8.iftttToken}`,{
                json: {
                    value1: 'Mom Bot',
                    value2: client.options.firstShardID.toString()
                }
            }, () => {
                console.log(`Told IFTTT that shard ${client.options.firstShardID} reconnected`);
            });
        }
        if (i < nums.shardCount) {
            i ++
            if (i < nums.shardCount) nextShard()
        }
    });
    var events = fs.readdirSync('./events');
    console.log(`Loading ${events.length} events, please wait...`)
    events.forEach(e => {
        var eventFile = require(`./events/${e}`);
        client.on(eventFile.name, (...args) => {
            eventFile.exec(client, ...args)
        })
    })
    var commands = fs.readdirSync('./cmds');
    console.log(`Loading ${commands.length} commands, please wait...`)
    commands.forEach(c => {
        var cmdFile = require(`./cmds/${c}`);
        stats.initializeCommand(cmdFile.name);
        client.registerCommand(cmdFile.name, (msg, args) => {
            stats.updateUses(cmdFile.name);
            globalBlacklist.getValueByID(msg.channel.id).then(stat => {
                if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                    msg.channel.createMessage('This channel has been blacklisted from Mom Bot!, if you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nThis channel may no longer use these commands: `' + stat.cmds.join(', ') + '`');
                    return;
                }else {
                    globalBlacklist.getValueByID(msg.author.id).then(stat => {
                        if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                            msg.author.getDMChannel().then(chn => {
                                chn.createMessage('You have been blacklisted from Mom Bot! If you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nYou may no longer use these commands: `' + stat.cmds.join(', ') + '`').catch(() => {
                                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from Mom Bot! If you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nYou may no longer use these commands: \`${stat.cmds.join(', ')}\``);
                                });
                            });
                        }else {
                            globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
                                if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                                    msg.channel.createMessage('This server has been blacklisted from Mom Bot!, if you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nThis server may no longer use these commands: `' + stat.cmds.join(', ') + '`');
                                    return;
                                }else {
                                    cmdFile.exec(client, msg, args);
                                }
                            });
                        }
                    });
                }
            });
        }, cmdFile.options)
    })
    client.connect();
}
nextShard();