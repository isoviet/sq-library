//  Module:     src/net/server
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('@sq-lib/src/utils/logger')
const { PacketClient } = require('@sq-lib/src/net/protocol')
const { ServerClient } = require('@sq-lib/src/net/server/client')

class Server extends EventEmitter2 {
	constructor(options) {
		super({wildcard: true})
		this.options = options
		if(!(options.port instanceof Array))
			options.port = [options.port]
		this.servers = []
		for(let port of options.port) {
			let server = {
				port: port,
				socket: new net.Server({
					allowHalfOpen: false,
					pauseOnConnect: true
				})
			}
			this.listenTo(server.socket, {
				close: 'server.close',
				connection: 'server.connection',
				error: 'server.error',
				listening: 'server.listening'
			}, {
				reducers: (args) => args.data.unshift(server.socket)
			})
			this.servers.push(server)
		}
		this.clients = []
		this.on('server.connection', this.onconnect)
		this.on('client.close', this.ondisconnect)
	}
	listen() {
		Logger.debug('net', 'Server.listen')
		for(let server of this.servers) {
			server.socket.listen({
				port: server.port,
				host: this.options.host ?? '0.0.0.0'
			})
		}
	}
	close() {
		Logger.debug('net', 'Server.close')
		for(let server of this.servers)
			server.socket.close()
		for(let client of this.clients)
			client.close()
	}
	onconnect(server, socket) {
		Logger.debug('net', 'Server.onconnect')
		let client = new ServerClient(this.options, socket)
		client.onAny((event, ...args) => this.emit(event, client, ...args))
		this.clients.push(client)
		if(!this.options.manualOpen)
			client.open()
		client.emit('client.connect')
	}
	ondisconnect(client) {
		Logger.debug('net', 'Server.ondisconnect')
		this.clients = this.clients.filter(e => e !== client)
	}
	sendPacketAll(type, func, ...params) {
		Logger.debug('net', 'Server.sendPacketAll')
		let packet = new PacketClient(type, ...params)
		this.sendMassData(packet, func)
	}
	sendDataAll(packet, func) {
		Logger.debug('net', 'Server.sendDataAll')
		for(let client of this.clients)
			if(func === undefined || func(client))
				client.sendData(packet)
	}
}

module.exports = {
	Server: Server,
	ServerClient: ServerClient,
	... require('@sq-lib/src/net/server/policy')
}