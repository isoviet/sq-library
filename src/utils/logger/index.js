//  Module:     src/utils/logger
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const fs = require('fs')
const util = require('util')

class Logger {
    static setOptions(options) {
        Logger.options = options
    }
    static setLevels(levels) {
        Logger.levels = levels;
        for(let level of Object.keys(levels))
            Logger[level] = Logger[level] || ((type, ...parts) => {
                return Logger.addLine(level, type, ...parts)
            })
    }
    static setFunc(func) {
        Logger.func = func
    }
    static setWriters(writers) {
        Logger.writers = writers
    }
    static createWriter(type) {
        return fs.createWriteStream(
            type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() + '.log', {
                flags: 'w+',
                encoding: 'utf8',
                autoClose: true
            }
        )
    }
    static formatLine(...parts) {
        let line = '';
        for(let part of parts) {
            line += line !== '' ? '\t' : '';
            line += typeof part === 'string' ? part : util.inspect(
                part, {
                    depth: 4,
                    colors: false
                }
            )
        };
        return line
    }
    static addLineToFile(type, line) {
        if(!Logger.writers[type] || !Logger.writers[type].writable)
            Logger.writers[type] = Logger.createWriter(type)
        else
            line += '\r\n'
        Logger.writers[type].write(line)
    }
    static addLineToConsole(level, line) {
        line = Logger.levels[level] + line + '\x1b[0m';
        return Logger.func(line)
    }
    static addLine(level, type, ...parts) {
        if(level !== 'unk' && !Logger.options[level])
            return
        let line = Logger.formatLine(...parts)
        Logger.addLineToConsole(level, line);
        if(!Logger.options.logFile)
            return
        Logger.addLineToFile(type, line)
    }
}

Logger.setOptions({
    logFile: 1,
    debug: 0,
    info: 1,
    warn: 1,
    error: 1,
    fatal: 1
})

Logger.setLevels({
    unk: '\x1b[1m',
    debug: '\x1b[30m\x1b[47mDEBUG\x1b[0m \x1b[1m',
    info: '\x1b[1m',
    warn: '\x1b[30m\x1b[43mWARN\x1b[0m \x1b[1m\x1b[33m',
    error: '\x1b[1m\x1b[41mERROR\x1b[0m \x1b[1m\x1b[31m',
    fatal: '\x1b[1m\x1b[41mFATAL\x1b[0m \x1b[1m\x1b[31m'
})

Logger.setFunc(console.log)

Logger.setWriters(new Object(null))

module.exports = {
    Logger: Logger
}