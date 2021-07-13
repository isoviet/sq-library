//  Module:     src/net/client
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('@sq-lib/src/utils/logger')
const { Dissector } = require('@sq-lib/src/net/protocol/dissector')
const { PacketClient, PacketServer } = require('@sq-lib/src/net/protocol')

class Client extends EventEmitter2 {
	constructor(options, socket) {
		super({wildcard: true})
		this.options = options
		this.socket = new net.Socket()
		this.packetId = 0x0
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
		this.socket.on('data', (chunk) => this.ondata(chunk))
	}
	open() {
		Logger.debug('net', 'Client.open')
		this.socket.connect({
			port: this.options.port || 11111,
			host: this.options.host || '127.0.0.1'
		})
	}
	close(error) {
		Logger.debug('net', 'Client.close')
		this.socket.destroy(error)
	}
	ondata(chunk) {
		Logger.debug('net', 'Client.ondata')
		let result
		try {
			result = this.dissector.read(chunk)
		} catch(error) {
			return this.close(error)
		}
		if(result.buffer === undefined)
			return
		let packet
		try {
			packet = PacketServer.from(result.buffer)
		} catch(error) {
			return this.close(error)
		}
		this.emit('packet.incoming', packet, result.buffer)
		if(result.remainder === undefined)
			return
		this.ondata(result.remainder)
	}
	sendPacket(type, ...data) {
		Logger.debug('net', 'Client.sendPacket')
		let packet = new PacketClient(type, ...data)
		this.sendData(packet)
	}
	sendData(packet) {
		Logger.debug('net', 'Client.sendData')
		packet.id = this.packetId++
		let buffer = packet.toBuffer()
		this.socket.write(buffer, () => this.emit('packet.outcoming', packet, buffer))
	}
}

module.exports = {
	Client: Client
}