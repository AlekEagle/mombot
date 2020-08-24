'use strict';

const EventEmitter = require('events').EventEmitter;
const Logger = require('./logger');
const console = new Logger();
const Sequelize = require('sequelize');
const sequelize = new Sequelize(`postgres://alek:${process.env.serverPass}@127.0.0.1:5432/alekeagle`, {
    logging: false
});
class MomPrefixes extends Sequelize.Model {};
MomPrefixes.init({
    serverID: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    prefix: Sequelize.STRING
}, {
    sequelize
});
MomPrefixes.sync({
    force: false
}).then(() => {
    console.log('Prefixes synced to database successfully!');
}).catch(err => {
    console.error('an error occured while proforming this operation');
    console.error(err);
});
class thisModule extends EventEmitter {
    managePrefixes(value) {
        return new Promise((resolve, reject) => {
            switch (value.action) {
                case 'add':
                    MomPrefixes.findOne({
                        where: {
                            serverID: value.serverID
                        }
                    }).then(prefix => {
                        if (prefix) {
                            prefix.update({
                                prefix: value.prefix
                            }).then(p => {
                                this.emit('updatePrefix', p.serverID, p.prefix);
                                resolve();
                            }, err => {
                                console.error(err);
                                reject(err);
                            })
                        } else {
                            MomPrefixes.create({
                                serverID: value.serverID,
                                prefix: value.prefix
                            }).then(prefix => {
                                this.emit('newPrefix', prefix.serverID, prefix.prefix);
                                resolve();
                            }, err => {
                                console.error(err);
                                reject(err);
                            });
                        }
                    }, err => {
                        console.error(err);
                        reject(err);
                    });
                    break;
                case 'refresh':
                    MomPrefixes.findAll().then(prefixes => {
                        prefixes.forEach(p => {
                            value.client.registerGuildPrefix(p.serverID, p.prefix);
                        });
                        resolve(prefixes);
                    }, err => {
                        console.error(err);
                        reject(err);
                    });
                    break;
                case 'remove':
                    MomPrefixes.findOne({
                        where: {
                            serverID: value.serverID
                        }
                    }).then(prefix => {
                        if (prefix) {
                            prefix.destroy().then(() => {
                                this.emit('removePrefix', value.serverID);
                                resolve();
                            }, err => {
                                console.error(err);
                                reject(err);
                            });
                        } else {
                            resolve();
                        }
                    }, err => {
                        console.error(err);
                        reject(err);
                    })
                    break;
                default:
                    reject(`${value.action} does not exist.`);
                    break;
            }
        })
    }
}

module.exports = new thisModule();