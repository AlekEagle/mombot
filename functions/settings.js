'use strict';

const u_wut_m8 = require('../.auth.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(`postgres://alek:${u_wut_m8.serverPass}@127.0.0.1:5432/alekeagle`, {
    logging: false
});
class MOptions extends Sequelize.Model {};
MOptions.init({
    id: { type: Sequelize.DataTypes.STRING, primaryKey: true },
    flags: Sequelize.DataTypes.SMALLINT,
    RNG: Sequelize.DataTypes.FLOAT
}, {
    sequelize
});

MOptions.sync();

const flagNames = [
    "SWEAR_RESPONSES",
    "RANDOM_RESPONSES"
], cache = {};

module.exports = {
    getFlags: (flags) => {
        let flagArray = [];
        for (let i in flagNames) {
            if (((flags >> i) & 1) == 1) flagArray.push(flagNames[i]);
        }
        return flagArray;
    },
    toFlags: (flagArray) => {
        let flags = 0;
        flagArray.forEach(it => {
            flags += 1 << flagNames.indexOf(it);
        });
        return flags;
    },
    getValueByID: async (id) => {
        if (cache.hasOwnProperty(id)) return cache[id];
        let value = (await MOptions.findOrCreate({
            where: {
                id
            }, defaults: {id, flags: module.exports.toFlags(["RANDOM_RESPONSES", "SWEAR_RESPONSES"])}
        }));
        cache[id] = value[0];
        return value[0];
    },
    updateValue: async (options) => {
        cache[options.id] = options;
        return await MOptions.update(options, {
            where: {
                id: options.id
            }
        });
    },
    flags: flagNames
}