//  Module:     Protection
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const max = Math.max

class Protection {
	static onConnect = {
		bind: (server) => {
			return (socketServer, socketClient) => {
				let timeout = server.options.maxConnsPerIpTimeout
				let closed = this.closeExcessConns(server, socketClient)
				if(closed == 0)
					server.onConnect(socketServer, socketClient)
				else
					setTimeout(server.onConnect.bind(server), timeout, socketServer, socketClient)
			}
		}
	}
	static closeExcessConns(server, socketClient) {
		let maxConns = server.options.maxConnsPerIp
		let conns = []
		let ip = socketClient.address().address
		for(let c of server.clients)
			if(c.socket.address().address === ip)
				conns.push(c.socket)
		conns.push(socketClient)
		let closed = conns.length - maxConns
		for(let i = 0; i < closed; i++) {
			conns[i].destroy(new Error('"maxConnsPerIp" limit exceeded!'))
		}
		return max(closed, 0)
	}
}

module.exports = {
	Protection: Protection
}