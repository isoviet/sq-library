//  Module:     src/utils/wtfFileFormat
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const fs = require('fs')

class WtfFileFormat {
    static readFileSync(path) {
        let content = fs.readFileSync(path, 'utf8');
        if(!content)
            throw new Error('can\'t read "' + path + '"')
        return content;
    }
    static parseValue(value) {
        let char = value.substr(0, 1);
        switch(char) {
            case '"':
            case "'":
                if(char === value.substr(value.length - 1))
                    return value.substr(1, value.length - 2)
            default:
                if(value.indexOf(".") !== -1)
                    return parseFloat(value)
                return parseInt(value, 10)
        }
    }
    static parseContent(content) {
        let data = {};
        let last = data;
        for(let line of raw.split('\n')) {
            let [prefix, content] = lines[i].replace(/ +/g, ' ').match(/^([A-Z]+)*\s([\a-\z\A-\Z\0-\9\.\'\"\s]+);*/);
            switch(prefix) {
                case 'CAT':
                    last = data[this.parseValue(content)] = {}
                case 'SET':
                    let [varName, varValue] = content.split(' ');
                    last[varName] = this.parseValue(varValue);
                    break
                default:
            }
        };
        return data
    }
    static read(path) {
        let content = this.readFileSync(path);
        let data = this.parseContent(content);
        return data
    }
}

module.exports = {
    WtfFileFormat: WtfFileFormat
}