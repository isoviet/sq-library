//  Module:		src/utils/Logger
//  Project:	sq-lib
//  Author:		soviet
//  E-mail:		soviet@s0viet.ru
//  Web:		https://s0viet.ru/

const fs = require('fs')
const util = require('util')

const defaultLevels = {
    unk: '\x1b[1m',
    debug: '\x1b[30m\x1b[47mDEBUG\x1b[0m \x1b[1m',
    info: '\x1b[1m',
    warn: '\x1b[30m\x1b[43mWARN\x1b[0m \x1b[1m\x1b[33m',
    error: '\x1b[1m\x1b[41mERROR\x1b[0m \x1b[1m\x1b[31m',
    fatal: '\x1b[1m\x1b[41mFATAL\x1b[0m \x1b[1m\x1b[31m'
}
const defaultOptions = {
    logFile: 1,
    debug: 0,
    info: 1,
    warn: 1,
    error: 1,
    fatal: 1
}
const defaultFunc = console.log

function Logger(options) {
    if (Logger.__init__)
        return Logger
    let instance = {
        __init__: true,
        options: {
            ... Logger.options,
            ... options
        }
    };
    Object.assign(Logger, instance);
    Object.freeze(Logger);
    return Logger
}

let instance = {
    __init__: false,
    options: defaultOptions,
    func: defaultFunc,
    writers: new Object(null),
    createWriter(type) {
        return fs.createWriteStream(
            type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() + '.log', {
                flags: 'w+',
                encoding: 'utf8',
                autoClose: true
            }
        )
    },
    formatLine(...parts) {
        let line = '';
        for (part of parts) {
            line += line !== '' ? '\t' : '';
            line += typeof part === 'string' ? part : util.inspect(
                part, {
                    depth: 4,
                    colors: false
                }
            )
        };
        return line
    },
    addLineToFile(type, line) {
        if(!Logger.writers[type] || !Logger.writers[type].writable)
            Logger.writers[type] = Logger.createWriter(type)
        else
            line += '\r\n'
        Logger.writers[type].write(line)
    },
    addLineToConsole(level, line) {
        line = defaultLevels[level] + line + '\x1b[0m';
        return Logger.func(line)
    },
    addLine(level, type, ...parts) {
        if (level !== 'unk' && !Logger.options[level])
            return
        let line = Logger.formatLine(...parts)
        Logger.addLineToConsole(level, line);
        if(!Logger.options.logFile)
            return
        Logger.addLineToFile(level, line)
    }
}

for (let level of Object.keys(defaultLevels)) {
    instance[level] = (type, ...parts) => {
        return Logger.addLine(level, type, ...parts)
    }
}

Object.assign(Logger, instance);

module.exports = {
    Logger: Logger
}