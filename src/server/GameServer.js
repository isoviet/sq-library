//  Module:     GameServer
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('@sq-lib/common/utils/Logger')
const { PacketClient } = require('@sq-lib/common/PacketClient')
const { GameServerClient } = require('@sq-lib/server/GameServerClient')

class GameServer extends EventEmitter2 {
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
		this.on('server.connection', this.onConnect)
		this.on('client.close', this.onDisconnect)
		this.on('client.error', this.onDisconnect)
		this.on('client.timeout', this.onDisconnect)
	}
	listen() {
		Logger.debug('net', 'GameServer.listen')
		for(let server of this.servers) {
			server.socket.listen({
				port: server.port,
				host: this.options.host ?? '0.0.0.0'
			})
		}
	}
	close() {
		Logger.debug('net', 'GameServer.close')
		for(let server of this.servers)
			server.socket.close()
		for(let client of this.clients)
			client.close()
	}
	onConnect(server, socket) {
		Logger.debug('net', 'GameServer.onConnect')
		let client = new GameServerClient(this.options, socket)
		client.onAny((event, ...args) => this.emit(event, client, ...args))
		this.clients.push(client)
		if(this.options.manualOpen !== true)
			client.open()
		client.emit('client.connect')
	}
	onDisconnect(server, client) {
		Logger.debug('net', 'GameServer.onDisconnect')
		this.clients = this.clients.filter(e => e.socket.readyState !== 'closed')
	}
	sendPacketAll(type, func, params) {
		Logger.debug('net', 'GameServer.sendPacketAll')
		let packet = new PacketServer(type, params)
		this.sendMassData(packet, func)
	}
	sendDataAll(packet, func) {
		Logger.debug('net', 'GameServer.sendDataAll')
		for(let client of this.clients)
			if(func === undefined || func(client))
				client.sendData(packet)
	}
}

module.exports = {
	GameServer: GameServer,
	GameServerClient: GameServerClient
}