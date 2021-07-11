//  Module:     data
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

module.exports = ({
	'Constants': {
		'PACKET_HEADER_SIZE': 0x4,
		'PACKET_MAX_SIZE': 0x500000,
		'POLICY_FILE_REQUEST': '<policy-file-request/>\0',
		'POLICY_FILE_CONTENT': '<?xml version="1.0"?>\n<cross-domain-policy>\n\t<site-control permitted-cross-domain-policies="all" />\n\t<allow-access-from domain="*" to-ports="%0,21,80" />\n</cross-domain-policy>\n\0'
	}
})