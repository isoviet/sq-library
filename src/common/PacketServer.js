//  Module:     PacketServer
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const { Protocol } = require('@sq-lib/shared/Protocol')
const { PlayerInfoParser } = require('@sq-lib/utils/PlayerInfoParser')
const { ProtoDefCompiler, CompiledProtodef } = require('protodef').Compiler

const Compiler = new ProtoDefCompiler()
const ProtocolServer = new CompiledProtodef(
	Compiler.sizeOfCompiler.compile(Protocol.server.sizeOfCode),
	Compiler.writeCompiler.compile(Protocol.server.writeCode),
	Compiler.readCompiler.compile(Protocol.server.readCode)
)

PlayerInfoParser.setProtocol(ProtocolServer)

class PacketServer {
	constructor(type, data) {
		if(type === undefined) 
			return
		this.length = undefined
		this.type = type
		this.data = data
	}
	toBuffer() {
		let buffer = ProtocolServer.createPacketBuffer('packet', {
			... this,
			... {
				'data': this.type == 'PacketInfo' || this.type == 'PacketInfoNet' ? {
					'data': PlayerInfoParser.write(this.data.data),
					'mask': this.data.mask
				} : this.data
			}
		})
		this.length = buffer.byteLength - 4
		buffer.writeUInt32LE(this.length, 0)
		return buffer
	}
	static from(buffer) {
		let packet = ProtocolServer.parsePacketBuffer('packet', buffer).data
		return Object.assign(new this(), {
			... packet,
			... {
				'data': packet.type == 'PacketInfo' || packet.type == 'PacketInfoNet' ? {
					'data': PlayerInfoParser.read(packet.data.data, packet.data.mask),
					'mask': packet.data.mask
				} : packet.data
			},
			... {
				'length': buffer.byteLength - 4
			}
		})
	}
}

module.exports = {
	ProtocolServer: ProtocolServer,
	PacketServer: PacketServer
}