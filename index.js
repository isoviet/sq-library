//	Module:		main
//	Project:	sq-lib
//	Author:		soviet
//	E-mail:		soviet@s0viet.ru
//	Web:		https://s0viet.ru/

if(typeof Global==='undefined'){const Module=require('module'),Global=new Proxy(Module['prototype'],{'has':(a,b)=>{return b in a;},'get':(a,b)=>{return a[b];},'set':(a,b,c)=>{return global[b]=a[b]=c;}});Global['Global']=Global;}function aliasPath(a){let b=a['match'](/^\@([\w-]+)/)[0x0],c=Global['require']['aliases'][b];return a['replace'](b,c);}function addAlias(a,b){Global['require']['aliases']['@'+a]=b;}function removeAlias(a){delete Global['require']['aliases'][a];}if(typeof Global['require']['aliases']==='undefined'){let include=Global['require'];Global['require']=function(a){if(a['startsWith']('@'))a=aliasPath(a);return include['call'](this,a);},Global['require']['aliases']=new Object(null);}
addAlias('sq-lib', __dirname)
module.exports = require('./src/index.js')