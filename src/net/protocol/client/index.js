//  Module:		src/net/protocol/client
//  Project:	sq-lib
//  Author:		soviet
//  E-mail:		soviet@s0viet.ru
//  Web:		https://s0viet.ru/

const { Protocol } = require('data/protocol')
const { ProtoDefCompiler, CompiledProtodef } = require('protodef').Compiler

const Compiler = new ProtoDefCompiler()
const ProtocolClient = new CompiledProtodef(
	Compiler.sizeOfCompiler.compile(Protocol.client.sizeOfCode),
	Compiler.writeCompiler.compile(Protocol.client.writeCode),
	Compiler.readCompiler.compile(Protocol.client.readCode)
)

class PacketClient {
	constructor(type, ...data) {
		if(type) {
			this.length = undefined;
			this.id = 0;
			this.type = type;
			this.data = data
		}
	}
	toBuffer() {
		let buffer = ProtocolClient.createPacketBuffer('packet', this);
		let length = buffer.byteLength - 4;
		buffer.writeUInt32LE(length, 0);
		this.length = length;
		return buffer
	}
	static from(buffer) {
		return Object.assign(
			new this(),
			{
				... ProtocolClient.parsePacketBuffer('packet', buffer).data,
				... {
					'length': buffer.byteLength - 4
				}
			}
		)
	}
}

module.exports = {
	ProtocolClient: ProtocolClient,
	PacketClient: PacketClient
}