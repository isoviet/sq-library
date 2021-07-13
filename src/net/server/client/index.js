//  Module:     src/net/server/client
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('@sq-lib/src/utils/logger')
const { Dissector } = require('@sq-lib/src/net/protocol/dissector')
const { PacketClient, PacketServer } = require('@sq-lib/src/net/protocol')

class ServerClient extends EventEmitter2 {
	constructor(options, socket) {
		super({wildcard: true})
		this.options = options
		this.socket = socket
		this.dissector = new Dissector()
		this.listenTo(this.socket, {
			close: 'client.close',
			connect: 'client.connect',
			data: 'client.data',
			drain: 'client.drain',
			end: 'client.end',
			error: 'client.error',
			lookup: 'client.lookup',
			ready: 'client.ready',
			timeout: 'client.timeout'
		})
		this.socket.setTimeout(this.options.timeout || 45000)
	}
	open() {
		Logger.debug('net', 'ServerClient.open')
		this.socket.on('data', (chunk) => {
			try {
				this.ondata(chunk)
			} catch(error) {
				this.emit('packet.error', error)
			}
		})
		this.socket.resume()
	}
	close() {
		Logger.debug('net', 'ServerClient.close')
		this.socket.destroy()
	}
	ondata(chunk) {
		Logger.debug('net', 'Client.ondata')
		let [buffer, excess] = this.dissector.read(chunk)
		if(buffer === undefined)
			return
		let packet = PacketClient.from(buffer)
		this.emit('packet.incoming', packet, buffer)
		if(excess === undefined)
			return
		this.ondata(excess)
	}
	sendPacket(type, data) {
		Logger.debug('net', 'ServerClient.sendPacket')
		let packet = new PacketServer(type, data)
		this.sendData(packet)
	}
	sendData(packet) {
		Logger.debug('net', 'ServerClient.sendData')
		let buffer = packet.toBuffer()
		this.socket.write(buffer, () => this.emit('packet.outcoming', packet, buffer))
	}
}

module.exports = {
	ServerClient: ServerClient
}