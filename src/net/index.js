//	Module:		src/net
//	Project:	sq-lib
//	Author:		soviet
//	E-mail:		soviet@s0viet.ru
//	Web:		https://s0viet.ru/

module.exports = {
	... require('src/net/protocol'),
	... require('src/net/client'),
	... require('src/net/server'),
	... require('src/net/policyServer')
}