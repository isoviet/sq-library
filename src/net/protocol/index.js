//  Module:     src/net/protocol
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

module.exports = {
	... require('data/protocol'),
	... require('src/net/protocol/client'),
	... require('src/net/protocol/server')
}