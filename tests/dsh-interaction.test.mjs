import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('host locale and canceled pairing can be retried without transferring a password', async () => {
 let client, component, props, cursor=0, first=true, attempts=0;
 const states=[], effects=[], calls=[];
 const React={useState(v){const i=cursor++;if(first)states[i]=typeof v==='function'?v():v;return [states[i],v=>{states[i]=typeof v==='function'?v(states[i]):v}];},useEffect(fn){if(first)effects.push(fn)}};
 const jsx=(type,props)=>({type,props});
 runInNewContext(readFileSync(new URL('../dist/client.js',import.meta.url),'utf8'),{URLSearchParams,navigator:{language:'en-US',languages:['en-US']},document:{documentElement:{style:{colorScheme:'light'}},body:{hasAttribute:()=>false}},matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}}),MutationObserver:class{observe(){} disconnect(){}},window:{location:{hash:'#kaitu-page=kaitu-auday'},__ModuleLoader__:{load({factory}){client=factory(name=>name==='react'?React:{jsx,jsxs:jsx});}}}});
 const ctx={effect(){},remote:{$mount:async()=>()=>{},kaitu:{preferences:async()=>({ok:true,value:{locale:'zh-CN'}})},kaituAuday:{request:async(op,input)=>{calls.push([op,input]);if(op==='discover')return {ok:true,value:JSON.stringify({services:['synthetic-phone']})};if(op==='pair'){const n=attempts++;if(n===0)return {ok:false,error:{message:'password_input_cancelled'}};if(n===1)return {ok:false,error:{message:'authentication_or_connection_failed'}};}return {ok:true,value:'{}'};}}},plugin(p){p.apply(ctx)},slots:{inject(_,fn){fn()},register(meta,comp){if(meta.name==='main'){component=comp;props=meta.inject()}}}};
 await client.apply(ctx);
 function render(){cursor=0;const tree=component(props);if(first){first=false;for(const fn of effects)fn()}return tree}
 function nodes(node){if(!node||typeof node!=='object')return [];return [node,...[node.props?.children].flat(Infinity).flatMap(nodes)];}
 function button(tree,text){return nodes(tree).find(x=>x.type==='button' && x.props.children===text)}
 let tree=render();await new Promise(resolve => setImmediate(resolve));tree=render();
 assert.ok(button(tree,'查找手机')); await button(tree,'查找手机').props.onClick();tree=render();
 await button(tree,'连接').props.onClick();tree=render();assert.ok(button(tree,'重新输入密码并连接'));
 await button(tree,'重新输入密码并连接').props.onClick();tree=render();assert.ok(button(tree,'重新输入密码并连接')); await button(tree,'重新输入密码并连接').props.onClick();tree=render();assert.ok(button(tree,'连接')); 
 assert.equal(calls.filter(([op])=>op==='pair').length,3);
 assert.deepEqual(calls.filter(([op])=>op==='pair').map(([,input])=>JSON.parse(input)),[{service:'synthetic-phone'},{service:'synthetic-phone'},{service:'synthetic-phone'}]);
});
