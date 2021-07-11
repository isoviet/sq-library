//	Module:		src/net/server
//	Project:	sq-lib
//	Author:		soviet
//	E-mail:		soviet@s0viet.ru
//	Web:		https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('src/utils/logger')
const { Constants } = require('data/constants')
const { PolicyServerClient } = require('src/net/policyServer/client')

class PolicyServer extends EventEmitter2 {
	constructor(options) {
		super({wildcard: true});
		this.options = options;
		this.socket = new net.Server({
			allowHalfOpen: false,
			pauseOnConnect: true
		});
		this.data = {
			request: Constants.POLICY_FILE_REQUEST,
			content: Constants.POLICY_FILE_CONTENT.replace(
				'%0',
				(this.options.allowedPorts || [11111]).join(',')
			)
		}
		this.clients = [];
		this.listenTo(
			this.socket,
			{
				close: 'server.close',
				connection: 'server.connection',
				error: 'server.error',
				listening: 'server.listening'
			}
		);
		this.on('server.connection', this.onconnect);
		this.on('server.close', this.ondisconnect)
	}
	listen() {
		Logger.debug('net', 'PolicyServer.listen');
		this.socket.listen(
			{
				port: this.options.port || 843,
				host: this.options.host || '0.0.0.0'
			}
		 )
	}
	close() {
		Logger.debug('net', 'PolicyServer.close');
		this.socket.close();
		for(let client of this.clients)
			client.close()
	}
	onconnect(socket) {
		Logger.debug('net', 'PolicyServer.onconnect');
		let client = new PolicyServerClient(this.options, socket, this.data);
		client.onAny((event, client, ...args) => {
			this.emit(event, client, ...args)
		});
		this.clients.push(client);
		if(!this.options.manualOpen)
			client.open()
		client.emit('client.connect')
	}
	ondisconnect(client) {
		Logger.debug('net', 'PolicyServer.ondisconnect');
		this.clients = this.clients.filter(e => e !== client)
	}
}

module.exports = {
	PolicyServer: PolicyServer,
	PolicyServerClient: PolicyServerClient
}