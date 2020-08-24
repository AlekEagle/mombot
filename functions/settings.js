'use strict';

const Sequelize = require('sequelize');
class MOptions extends Sequelize.Model {};
MOptions.init({
    id: { type: Sequelize.DataTypes.STRING, primaryKey: true },
    flags: Sequelize.DataTypes.SMALLINT,
    RNG: Sequelize.DataTypes.FLOAT
}, {
    sequelize: _database
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
        let value = (await MOptions.findOne({
            where: {
                id
            }
        }));
        if (!value) {
            return new Promise((resolve, reject) => resolve({id, flags: module.exports.toFlags(["RANDOM_RESPONSES", "SWEAR_RESPONSES"])}));
        }else {
            cache[id] = value.toJSON();
            return value.toJSON();
        }
    },
    updateValue: async (options) => {
        if (options.flags === 27) {
            delete cache[options.id];
            let res = (await MOptions.findOne({
                where: {
                    id: options.id
                }
            }));
            return await res.destroy();
        } else {
            cache[options.id] = options;
            return await MOptions.update(options, {
                where: {
                    id: options.id
                }
            });
        }
    },
    flags: flagNames
}