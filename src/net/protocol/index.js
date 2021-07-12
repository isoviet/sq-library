//  Module:     src/net/protocol
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

module.exports = {
	... require('@sq-lib/data/protocol'),
	... require('@sq-lib/src/net/protocol/client'),
	... require('@sq-lib/src/net/protocol/server')
}