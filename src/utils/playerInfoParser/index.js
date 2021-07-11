//	Module:		src/utils/PlayerInfoParser
//	Project:	sq-lib
//	Author:		soviet
//	E-mail:		soviet@s0viet.ru
//	Web:		https://s0viet.ru/

const { PlayerInfoData } = require('data/playerInfoData')

function PlayerInfoParser(protocol) {
	if(PlayerInfoParser.__init__)
		return PlayerInfoParser
	let instance = {
		__init__: true,
		protocol: protocol,
		convertMaskArr(mask) {
			let arr = [];
			for(let sig of PlayerInfoData) {
				if(sig.name)
					if(!!(mask & sig.mask) || sig.mask === 0)
						arr.push(sig.name)
			};
			return arr
		},
		convertArrMask(arr) {
			let mask = 0;
			for(let sig of PlayerInfoData) {
				if(arr.indexOf(sig.name) !== -1)
					mask = mask | sig.mask
			};
			return mask
		},
		readVal(type, buffer, offset) {
			if(type instanceof Array) {
				if(type[0] === 'array') {
					let bytesRead = 0;
					let { value, size } = protocol.readCtx[type[1].countType](buffer, offset);
					let arr = new Array(value);
					bytesRead += size;
					for(let i = 0; i < value; i++) {
						let { value, size } = this.readVal(type[1].type, buffer, offset + bytesRead);
						arr[i] = value;
						bytesRead += size
					};
					return {
						value: arr,
						size: bytesRead
					}
				}
				else if(type[0] == 'container')
				{
					let bytesRead = 0;
					let container = new Object();
					for(let elem of type[1]) {
						let { value, size } = this.readVal(elem.type, buffer, offset + bytesRead);
						container[elem.name] = value;
						bytesRead += size
					};
					return {
						value: container,
						size: bytesRead
					}
				}
			}
			return protocol.readCtx[type](buffer, offset)
		},
		writeVal(type, value, buffer, offset) {
			if(type instanceof Array) {
				if(type[0] === 'array') {
					offset = this.writeVal(type[1].countType, value.length, buffer, offset);
					for(let elem of value) {
						offset = this.writeVal(type[1].type, elem, buffer, offset);
					};
					return offset
				}
				else if(type[0] === 'container')
				{
					for(let elem of type[1]) {
						offset = this.writeVal(elem.type, value[elem.name], buffer, offset);
					};
					return offset
				}
			}
			return this.protocol.writeCtx[type](value, buffer, offset)
		},
		sizeOfVal(type, value) {
			if(type instanceof Array) {
				if(type[0] === 'array') {
					let size = this.sizeOfVal(type[1].countType, value.length);
					for(let elem of value) {
						size += this.sizeOfVal(type[1].type, elem);
					};
					return size
				}
				else if(type[0] === 'container')
				{
					let size = 0;
					for(let elem of type[1]) {
						size += this.sizeOfVal(elem.type, value[elem.name]);
					};
					return size
				}
			}
			return this.protocol.sizeOfCtx[type](value)
		},
		read(buffer, mask) {
			if(typeof(mask) === 'number')
					mask = this.convertMaskArr(mask)
				else
					mask = mask
			let offset = 0;
			let { value, size } = this.readVal("UInt", buffer, offset);
			let arr = new Array(value)
			offset += size;
			for(let i = 0; i < value; i++) {
				let data = new Object(null);
				for(let sig of PlayerInfoData) {
					if(mask.indexOf(sig.name) !== -1) {
						let { value, size } = this.readVal(sig.signature, buffer, offset);
						offset += size;
						data[sig.name] = value
					}
				};
				arr[i] = data
			}
			return arr
		},
		write(arr) {
			let buffer = Buffer.allocUnsafe(this.sizeOf(arr));
			let offset = 0;
			offset = this.writeVal("UInt", arr.length, buffer, offset);
			for(let elem of arr) {
				for(let sig of PlayerInfoData) {
					if(elem[sig.name] !== undefined) {
						offset = this.writeVal(sig.signature, elem[sig.name], buffer, offset);
					}
				};
			}
			return buffer
		},
		sizeOf(arr) {
			let size = 0;
			size += this.sizeOfVal("UInt", arr.length);
			for(let elem of arr) {
				for(let sig of PlayerInfoData) {
					if(elem[sig.name] !== undefined) {
						size += this.sizeOfVal(sig.signature, elem[sig.name]);
					}
				};
			}
			return size
		}
	}
	Object.assign(PlayerInfoParser, instance);
	Object.freeze(PlayerInfoParser);
	return instance
}

module.exports = {
	PlayerInfoParser: PlayerInfoParser
}