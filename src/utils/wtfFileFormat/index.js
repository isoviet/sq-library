//  Module:     src/utils/wtfFileFormat
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const fs = require('fs')

class WtfFileFormat {
    static readFileSync(path) {
        let content = fs.readFileSync(path, 'utf8')
        if(content === undefined)
            throw new Error(`unable to read "${path}"`)
        return content;
    }
    static parseValue(value) {
        if(value.startsWith('"') && value.endsWith('"'))
            return value.substr(1, value.length - 2)
        if(value.includes('.'))
            return parseFloat(value)
        return parseInt(value, 10)
    }
    static parseContent(content) {
        let data = new Object(null)
        let last = data
        for(let line of content.split('\n')) {
            let [prefix, arg1, arg2] = lines[i].split(/\s+/)
            if(!prefix)
                continue
            switch(prefix) {
                case 'CAT':
                    last = data[this.parseValue(arg1)] = new Object(null)
                case 'SET':
                    last[arg1] = this.parseValue(arg2)
            }
        }
        return data
    }
    static read(path) {
        let content = this.readFileSync(path)
        let data = this.parseContent(content)
        return data
    }
}

module.exports = {
    WtfFileFormat: WtfFileFormat
}