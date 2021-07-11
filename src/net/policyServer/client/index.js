//  Module:		src/net/server
//  Project:	sq-lib
//  Author:		soviet
//  E-mail:		soviet@s0viet.ru
//  Web:		https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('src/utils/logger')
const { Constants } = require('data/constants')

class PolicyServerClient extends EventEmitter2 {
	constructor(options, socket, data) {
		super({wildcard: true});
		this.options = options;
		this.socket = socket;
		this.data = data;
		this.state = {
			readBytes: 0x0,
			recv: ''
		}
		this.listenTo(
			this.socket,
			{
				close: 'client.close',
				connect: 'client.connect',
				data: 'client.data',
				drain: 'client.drain',
				end: 'client.end',
				error: 'client.error',
				lookup: 'client.lookup',
				ready: 'client.ready',
				timeout: 'client.timeout'
			},
			{
				reducers: (event) => {
					return event.data.unshift(this)
				}
			}
		);
		this.socket.setTimeout(this.options.timeout || 45000)
	}
	open() {
		Logger.debug('net', 'PolicyServerClient.open');
		this.socket.on('data', (chunk) => { 
			return this.ondata(chunk)
		});
		this.socket.resume()
	}
	close() {
		Logger.debug('net', 'PolicyServerClient.close');
		this.socket.destroy()
	}
	ondata(chunk) {
		Logger.debug('net', 'PolicyServerClient.ondata');
		this.state.readBytes += chunk.byteLength;
		if(this.state.readBytes > this.data.request.length)
			throw new Error(`unexpected data: "${this.state.recv}"`)
		this.state.recv += chunk.toString('latin1');
		if(!this.data.request.startsWith(this.state.recv))
			throw new Error(`unexpected data: "${this.state.recv}"`)
		else if(this.state.recv === this.data.request)
			this.socket.end(this.data.content);
			this.close()
	}
}

module.exports = {
	PolicyServerClient: PolicyServerClient
}