//  Module:     src/net/protocol/dissector
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const { Logger } = require('@sq-lib/src/utils/logger')
const { Constants } = require('@sq-lib/data/constants')

const DissectorStates = {
	HEADER: 0,
	PAYLOAD: 1
}

class Dissector {
	constructor() {
		this.header = Buffer.allocUnsafe(Constants.PACKET_HEADER_SIZE)
		this.packet = null
		this.reset()
	}
	reset() {
		this.state = DissectorStates.HEADER
		this.bytesRead = 0x0
	}
	read(chunk) {
		this.bytesRead += chunk.byteLength
		switch(this.state) {
			case DissectorStates.HEADER:
				let added = chunk.copy(this.header, this.bytesRead - chunk.byteLength, 0)
				if(this.bytesRead < Constants.PACKET_HEADER_SIZE)
					return []
				let length = this.header.readUInt32LE(0)
				if(length > Constants.PACKET_MAX_SIZE)
					throw new Error(`too big packet size: ${length}`)
				this.state = DissectorStates.PAYLOAD
				this.packet = Buffer.allocUnsafe(length + Constants.PACKET_HEADER_SIZE)
				this.packet.writeUInt32LE(length)
				if(this.bytesRead === Constants.PACKET_HEADER_SIZE)
					return []
				chunk = chunk.slice(added)
			case DissectorStates.PAYLOAD:
				let excess = this.bytesRead - this.packet.byteLength
				chunk.copy(this.packet, this.bytesRead - chunk.byteLength, 0, chunk.byteLength - Math.max(excess, 0))
				if(excess < 0)
					return []
				this.reset()
				if(excess > 0)
					return [this.packet, chunk.slice(chunk.length - excess)]
				return [this.packet]
			default:
				throw new Error(`unknown state: ${this.state}`)
		}
	}
}

module.exports = {
	Dissector: Dissector
}