//  Module:		src/net
//  Project:	sq-lib
//  Author:		soviet
//  E-mail:		soviet@s0viet.ru
//  Web:		https://s0viet.ru/

module.exports = {
	... require('@sq-lib/src/net/protocol'),
	... require('@sq-lib/src/net/client'),
	... require('@sq-lib/src/net/server'),
	... require('@sq-lib/src/net/policyServer')
}