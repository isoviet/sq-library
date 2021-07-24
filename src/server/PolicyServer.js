//  Module:     PolicyServer
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('@sq-lib/common/utils/Logger')
const { Constants } = require('@sq-lib/shared/Constants')
const { PolicyServerClient } = require('@sq-lib/server/PolicyServerClient')

class PolicyServer extends EventEmitter2 {
	constructor(options) {
		super({wildcard: true})
		this.options = options
		this.server = new net.Server({
			allowHalfOpen: false,
			pauseOnConnect: true
		})
		this.data = {
			request: Constants.POLICY_FILE_REQUEST,
			content: Constants.POLICY_FILE_CONTENT.replace(
				'%0',
				(options.allowedPorts ?? [11111]).join(',')
			)
		}
		this.clients = []
		this.listenTo(this.server, {
			close: 'server.close',
			connection: 'server.connection',
			error: 'server.error',
			listening: 'server.listening'
		}, {
			reducers: (args) => args.data.unshift(this.server)
		})
		this.on('server.connection', this.onConnect)
		this.on('server.close', this.onDisconnect)
		this.on('client.error', this.onDisconnect)
		this.on('client.timeout', this.onDisconnect)
	}
	listen() {
		Logger.debug('net', 'PolicyServer.listen')
		this.server.listen({
			port: this.options.port ?? 843,
			host: this.options.host ?? '0.0.0.0'
		})
	}
	close() {
		Logger.debug('net', 'PolicyServer.close')
		this.server.close()
		for(let client of this.clients)
			client.close()
	}
	onConnect(server, socket) {
		Logger.debug('net', 'PolicyServer.onConnect')
		let client = new PolicyServerClient(this.options, socket, this.data)
		client.onAny((event, client, ...args) => this.emit(event, client, ...args))
		this.clients.push(client)
		if(this.options.manualOpen !== true)
			client.open()
		client.emit('client.connect')
	}
	onDisconnect(server, client) {
		Logger.debug('net', 'PolicyServer.onDisconnect')
		this.clients = this.clients.filter(e => e.socket.readyState !== 'closed')
	}
}

module.exports = {
	PolicyServer: PolicyServer,
	PolicyServerClient: PolicyServerClient
}