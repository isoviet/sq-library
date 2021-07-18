//  Module:     PolicyServerClient
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('@sq-lib/common/utils/Logger')

class PolicyServerClient extends EventEmitter2 {
	constructor(options, socket, data) {
		super({wildcard: true})
		this.options = options
		this.socket = socket
		this.data = data
		this.state = {
			readBytes: 0x0,
			recv: ''
		}
		this.listenTo(socket, {
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
		socket.setNoDelay(Boolean(options.tcpNoDelay ?? 0))
		socket.setTimeout(options.timeout ?? 45000)
		socket.on('data', (chunk) => this.onData(chunk))
	}
	open() {
		Logger.debug('net', 'PolicyServerClient.open')
		this.socket.resume()
	}
	close(error) {
		Logger.debug('net', 'PolicyServerClient.close')
		this.socket.destroy(error)
	}
	onData(chunk) {
		Logger.debug('net', 'PolicyServerClient.onData')
		this.state.readBytes += chunk.byteLength
		if(this.state.readBytes > this.data.request.length)
			return this.close(new Error(`unexpected data: "${this.state.recv}"`))
		this.state.recv += chunk.toString('latin1')
		if(!this.data.request.startsWith(this.state.recv))
			return this.close(new Error(`unexpected data: "${this.state.recv}"`))
		if(this.state.recv !== this.data.request)
			return
		this.sendData(this.data.content, () => this.close())
	}
	sendData(data, onSend) {
		this.socket.write(data, onSend)
	}
}

module.exports = {
	PolicyServerClient: PolicyServerClient
}