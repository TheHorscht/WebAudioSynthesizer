(function(e){function t(t){for(var o,a,s=t[0],u=t[1],c=t[2],f=0,d=[];f<s.length;f++)a=s[f],i[a]&&d.push(i[a][0]),i[a]=0;for(o in u)Object.prototype.hasOwnProperty.call(u,o)&&(e[o]=u[o]);l&&l(t);while(d.length)d.shift()();return r.push.apply(r,c||[]),n()}function n(){for(var e,t=0;t<r.length;t++){for(var n=r[t],o=!0,s=1;s<n.length;s++){var u=n[s];0!==i[u]&&(o=!1)}o&&(r.splice(t--,1),e=a(a.s=n[0]))}return e}var o={},i={app:0},r=[];function a(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=o,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)a.d(n,o,function(t){return e[t]}.bind(null,o));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="/WebAudioSynthesizer/";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],u=s.push.bind(s);s.push=t,s=s.slice();for(var c=0;c<s.length;c++)t(s[c]);var l=u;r.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},1440:function(e,t){document.documentElement.setAttribute("data-browser",navigator.userAgent)},2856:function(e,t,n){},"39e2":function(e,t,n){},"3ef6":function(e,t,n){"use strict";var o=n("cd99"),i=n.n(o);i.a},"56d7":function(e,t,n){"use strict";n.r(t);n("cadf"),n("551c"),n("097d");var o=n("2b0e"),i=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("knob",{attrs:{size:50}}),n("knob",{attrs:{size:75}}),n("knob",{attrs:{size:100}}),n("div",{staticClass:"ASDR-container"},[n("vue-slider",e._b({},"vue-slider",e.sliderConfig.verticalASDR,!1)),n("vue-slider",e._b({},"vue-slider",e.sliderConfig.verticalASDR,!1)),n("vue-slider",e._b({},"vue-slider",e.sliderConfig.verticalASDR,!1)),n("vue-slider",e._b({},"vue-slider",e.sliderConfig.verticalASDR,!1)),n("span",[e._v("A")]),n("span",[e._v("S")]),n("span",[e._v("D")]),n("span",[e._v("R")])],1),n("div",[n("vue-slider",e._b({attrs:{min:80,max:200},model:{value:e.bpm,callback:function(t){e.bpm=t},expression:"bpm"}},"vue-slider",e.sliderConfig.horizontal,!1)),e._v("\n    BPM: "+e._s(e.bpm)+"\n  ")],1),n("div",{staticClass:"kb-and-sequencer"},[n("vue-keyboard",{ref:"keyboard",on:{noteOn:e.onKeyboardNoteOn,noteOff:e.onKeyboardNoteOff}}),n("vue-sequencer",{ref:"sequencer",attrs:{audioContext:e.audioCtx,bpm:e.bpm},on:{noteOn:e.onSequencerNoteOn,noteOff:e.onSequencerNoteOff}})],1),n("input",{attrs:{type:"button",value:"Play/Pause"},on:{click:e.togglePlaying}})],1)},r=[],a=(n("8615"),n("ac6a"),function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"container"},[n("svg",{attrs:{width:e.size,height:e.size,viewBox:"0 0 100 100",version:"1.1",xmlns:"http://www.w3.org/2000/svg"}},[n("g",{on:{pointerdown:function(t){return t.stopPropagation(),e.pointerDown(t)},pointerup:function(t){return t.stopPropagation(),e.pointerUp(t)},pointermove:function(t){return t.stopPropagation(),e.pointerMove(t)}}},[n("circle",{attrs:{cx:"50",cy:"50",r:"40",fill:"url(#gradient)"}}),n("circle",{attrs:{cx:"50",cy:"50",r:"35",fill:"url(#gradientReversed)"}})]),n("g",e._l(e.ticks,function(e,t){return n("line",{key:t,staticClass:"tickLine",attrs:{x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2}})})),n("line",{attrs:{x1:e.line.x1,y1:e.line.y1,x2:e.line.x2,y2:e.line.y2}}),n("defs",[n("linearGradient",{attrs:{id:"gradient",x1:"0%",y1:"0%",x2:"100%",y2:"100%"}},[n("stop",{attrs:{offset:"0%","stop-color":"#447799"}}),n("stop",{attrs:{offset:"50%","stop-color":"#224488"}}),n("stop",{attrs:{offset:"100%","stop-color":"#112266"}})],1),n("linearGradient",{attrs:{id:"gradientReversed",href:"#gradient",gradientTransform:"rotate(180, 0.5, 0.5)"}})],1)])])}),s=[],u=(n("c5f6"),n("53a5")),c=n.n(u),l=function(e){return e/360*Math.PI*2},f={name:"knob",props:{size:{type:Number,default:50},min:{type:Number,default:0},max:{type:Number,default:100},value:{type:Number,default:0},tickCount:{type:Number,default:11}},data:function(){return{currentValue:0}},mounted:function(){this.currentValue=this.value},methods:{pointerDown:function(e){e.target.setPointerCapture(e.pointerId)},pointerUp:function(e){e.target.releasePointerCapture(e.pointerId)},pointerMove:function(e){if(e.target.hasPointerCapture(e.pointerId)){var t=this.currentValue-.5*e.movementY;this.currentValue=c()(t,this.min,this.max)}}},computed:{p:function(e){return e.currentValue/e.max},line:function(){var e=l(225+270*this.p-90);return{x1:50+30*Math.cos(e),y1:50+30*Math.sin(e),x2:50+35*Math.cos(e),y2:50+35*Math.sin(e)}},ticks:function(){for(var e=[],t=0;t<this.tickCount;t++){var n=t/(this.tickCount-1),o=l(225+270*n-90);e.push({x1:50+45*Math.cos(o),y1:50+45*Math.sin(o),x2:50+50*Math.cos(o),y2:50+50*Math.sin(o)})}return e}},watch:{currentValue:function(e,t){this.$emit("input",e)}}},d=f,h=(n("aace"),n("2877")),p=Object(h["a"])(d,a,s,!1,null,"993acdc4",null);p.options.__file="knob.vue";var y=p.exports,v=n("6f79"),g=n.n(v),m=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("svg",{attrs:{width:"100%",height:"100%",viewBox:"0 0 100 200",preserveAspectRatio:"none"}},[e._l(24,function(t){return[1,3,5,7,8,10,12].includes((t-1)%12+1)?n("rect",{key:"whiteKey"+t,class:["white-key",e.isKeyDown_[12-t+48]?"white-key-down":""],attrs:{"vector-effect":"non-scaling-stroke",x:"0",y:100*Math.floor((t-1)/12)+[0,0,0,12.5,0,29.5,0,46.57,58.33,0,71,0,88][(t-1)%12+1],width:"100",height:[0,12.5,0,17,0,17.08,0,11.75,13,0,17,0,12][(t-1)%12+1],"data-b":t},on:{pointerdown:function(n){e.keyDown(12-t+48,!0,n)},pointerup:function(n){e.keyUp(12-t+48,!0,n)}}}):e._e()}),e._l(24,function(t){return[2,4,6,9,11].includes((t-1)%12+1)?n("rect",{key:"blackKey"+t,class:["black-key",e.isKeyDown_[12-t+48]?"black-key-down":""],attrs:{x:"0",y:100*Math.floor((t-1)/12)+(t-1)%12*100/12,width:"63",height:100/12},on:{pointerdown:function(n){e.keyDown(12-t+48,!0,n)},pointerup:function(n){e.keyUp(12-t+48,!0,n)}}}):e._e()})],2)},b=[],w=(n("14b9"),{});window.addEventListener("keydown",function(e){e.repeat||(w[e.code]||window.dispatchEvent(new CustomEvent("key-event-down-norepeat",{detail:e})),w[e.code]=!0)}),window.addEventListener("keyup",function(e){w[e.code]&&window.dispatchEvent(new CustomEvent("key-event-up",{detail:e})),w[e.code]=!1});n("1440");var k={KeyZ:36,KeyS:37,KeyX:38,KeyD:39,KeyC:40,KeyV:41,KeyG:42,KeyB:43,KeyH:44,KeyN:45,KeyJ:46,KeyM:47,Comma:48,KeyL:49,Period:50,Semicolon:51,Slash:52,KeyQ:48,Digit2:49,KeyW:50,Digit3:51,KeyE:52,KeyR:53,Digit5:54,KeyT:55,Digit6:56,KeyY:57,Digit7:58,KeyU:59,KeyI:60,Digit9:61,KeyO:62,Digit0:63,KeyP:64,BracketLeft:65,Equal:66,BracketRight:67},x={name:"VueKeyboard",data:function(){return{isKeyDown_:{}}},mounted:function(){var e=this;window.addEventListener("key-event-down-norepeat",function(t){if(t=t.detail,t.code in k){k[t.code],k[t.code];e.keyDown(k[t.code],!0)}}),window.addEventListener("key-event-up",function(t){t=t.detail;k[t.code],k[t.code];e.keyUp(k[t.code],!0)})},methods:{keyDown:function(e,t,n){n&&n.target.setPointerCapture(n.pointerId);var o={id:"kb"+e,pitch:e};t&&!this.isKeyDown_[e]&&this.$emit("noteOn",o),this.$set(this.isKeyDown_,e,!0)},keyUp:function(e,t,n){if(n&&n.target.releasePointerCapture(n.pointerId),this.isKeyDown_[e]){var o={id:"kb"+e,pitch:e};t&&this.isKeyDown_[e]&&this.$emit("noteOff",o),this.$set(this.isKeyDown_,e,!1)}},releaseAllKeys:function(){for(var e in this.isKeyDown_)this.$set(this.isKeyDown_,e,!1)}}},C=x,O=(n("861b"),Object(h["a"])(C,m,b,!1,null,"d722ceee",null));O.options.__file="keyboard.vue";var _=O.exports,q=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("svg",{attrs:{width:"100%",height:"100%",viewBox:"0 0 100 200",preserveAspectRatio:"none"}},[e._l(4,function(e){return n("rect",{key:"bgrect"+e,class:(e-1)%2==0?"bg1":"bg2",attrs:{x:25*(e-1),width:"25",y:"0",height:"100%"}})}),e._l(2,function(t){return[e._l(12,function(o){return[2,4,6,9,11].includes(o%12)?n("rect",{key:"whiteBlackRect"+o+t,staticClass:"blackKeyGrid",attrs:{x:0,width:"100%",y:100*(o-1)/12+100*(t-1),height:100/12}}):e._e()}),e._l(192,function(o,i){return n("rect",{key:"emptyrect"+i+t,staticClass:"note note-empty",attrs:{x:6.25*Math.floor(i%16),width:6.25,y:Math.floor(i/16)*(100/12)+100*(t-1),height:100/12,"stroke-width":"0.1"},on:{mousedown:function(n){e.placeNote(Math.floor(i%16),Math.floor(i/16)+12*(t-1))}}})})]}),e._l(e.notes,function(t){return n("rect",{key:"note"+t.x+"-"+t.y,staticClass:"note note-placed",attrs:{x:100*t.x/16,width:6.25,y:t.y*(1/12)*100,height:1/24*100+"%","stroke-width":"0.1"},on:{mousedown:function(n){e.removeNote(t)}}})}),e._l(2,function(t){return[e._l(4,function(e){return n("path",{key:"outline1"+e+t,staticClass:"line-outline",attrs:{d:"M25 0 L0 0 0 100",transform:"translate("+25*(e-1)+", "+100*(t-1)+")","vector-effect":"non-scaling-stroke"}})}),n("path",{key:"outline2"+t,staticClass:"line-outline",attrs:{d:"M100 0 L100 100 0 100",transform:"translate(0, "+100*(t-1)+")","vector-effect":"non-scaling-stroke"}}),n("path",{key:"outline3"+t,staticClass:"line-outline",attrs:{d:"M0 "+100/12*7+" L100 "+100/12*7,transform:"translate(0, "+100*(t-1)+")","vector-effect":"non-scaling-stroke"}})]}),e.playing?n("line",{attrs:{x1:100*e.playheadPosition,y1:"0",x2:100*e.playheadPosition,y2:"100%","stroke-width":"0.2",stroke:"yellow"}}):e._e()],2)},K=[],P=n("8afe"),N=(n("6c7b"),function(){var e=0;return function(){return"sq"+e++}}()),T=0,D=0,S={name:"VueSequencer",props:{width:{type:Number,default:800},height:{type:Number,default:400},audioContext:{type:AudioContext,required:!0},bpm:{type:Number,default:120,required:!0}},data:function(){return{notes:[],sequencePosition:0,sequenceCurrentLoop:0,playing:!1,lookahead:.1}},mounted:function(){Array(16).fill(0).forEach(function(e,t){}),this.update_()},methods:{update_:function(){var e=this;if(this.playing){var t=this.getUpcomingEvents(this.sequencePosition,this.lookahead);t.on.forEach(function(t){var n=t.x*e.secondsPerSixteenthNote,o=n+e.sequenceLength*t.onTriggerCount;o+=D,t.onTriggerCount++,e.$emit("noteOn",{note:t,whenTime:o})}),t.off.forEach(function(t){var n=t.x*e.secondsPerSixteenthNote+e.secondsPerSixteenthNote,o=n+e.sequenceLength*t.offTriggerCount;o+=D,t.offTriggerCount++,e.$emit("noteOff",{note:t,whenTime:o})});var n=this.audioContext.currentTime-T;T=this.audioContext.currentTime,this.sequencePosition+=n,this.sequencePosition>this.sequenceLength&&(this.sequencePosition-=this.sequenceLength,this.sequenceCurrentLoop++)}window.requestAnimationFrame(this.update_)},placeNote:function(e,t){var n=e/16,o=n>this.playheadPosition?0:1;this.notes.push({id:N(),pitch:59-t,x:e,y:t,onTriggerCount:this.sequenceCurrentLoop+o,offTriggerCount:this.sequenceCurrentLoop+o})},removeNote:function(e){var t=this.notes.indexOf(e);this.notes.splice(t,1)},getUpcomingEvents:function(e,t){var n=this,o={on:[],off:[]},i=function(e,t){var o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;return{on:n.notes.filter(function(i){var r=i.x*n.secondsPerSixteenthNote;return r>=e&&r<=t&&i.onTriggerCount===n.sequenceCurrentLoop+o}),off:n.notes.filter(function(i){var r=i.x*n.secondsPerSixteenthNote+n.secondsPerSixteenthNote;return r>=e&&r<=t&&i.offTriggerCount===n.sequenceCurrentLoop+o})}},r=e+t-this.sequenceLength;if(r>0){var a,s,u,c,l=i(e,this.sequenceLength),f=i(0,r,1);(a=o.on).push.apply(a,Object(P["a"])(l.on)),(s=o.on).push.apply(s,Object(P["a"])(f.on)),(u=o.off).push.apply(u,Object(P["a"])(l.off)),(c=o.off).push.apply(c,Object(P["a"])(f.off))}else{var d,h,p=i(e,e+t);(d=o.on).push.apply(d,Object(P["a"])(p.on)),(h=o.off).push.apply(h,Object(P["a"])(p.off))}return o},play:function(){this.stop(),this.playing=!0,D=this.audioContext.currentTime,T=this.audioContext.currentTime},stop:function(){this.sequencePosition=0,this.sequenceCurrentLoop=0,this.playing=!1,this.notes.forEach(function(e){e.onTriggerCount=0,e.offTriggerCount=0})},resume:function(){this.playing=!0}},watch:{bpm:function(e,t){console.log(e,t)}},computed:{playheadPosition:function(e){return e.sequencePosition/e.sequenceLength},secondsPerSixteenthNote:function(e){return 60/e.bpm/4},sequenceLength:function(e){return 16*e.secondsPerSixteenthNote}}},E=S,M=(n("3ef6"),Object(h["a"])(E,q,K,!1,null,"1ac28b84",null));M.options.__file="sequencer.vue";var j=M.exports,L=n("c93e"),A={tooltip:!1},$={horizontal:Object(L["a"])({},A,{width:200,height:5}),verticalASDR:Object(L["a"])({},A,{direction:"vertical",width:5,height:100,tooltip:"hover","tooltip-dir":"top"})},R=n("c665"),V=n("dc0a"),U=n("aa9a"),z=n("d328"),B=n("11d9"),F=(n("20d6"),function(){function e(){Object(R["a"])(this,e),this.lookup={}}return Object(U["a"])(e,[{key:"addEventListener",value:function(e,t){e in this.lookup?t in this.lookup[e]||this.lookup[e].push(t):this.lookup[e]=[t]}},{key:"removeEventListener",value:function(e,t){if(e in this.lookup){var n=this.lookup[e].findIndex(function(e){return e===t});n>=0&&this.lookup[e].splice(n,1)}}},{key:"dispatchEvent",value:function(e,t){e in this.lookup&&this.lookup[e].forEach(function(e){e(t)})}}]),e}()),I=function(){for(var e=[],t=0;t<127;++t)e[t]=13.75*Math.pow(2,(t-9)/12);return function(t){return e[t]}}(),G={sine:"sine",square:"square",sawtooth:"sawtooth",triangle:"triangle"},J=function(e){function t(e){var n;return Object(R["a"])(this,t),n=Object(z["a"])(this,Object(B["a"])(t).call(this)),n.audioCtx=e,n.oscillatorNode=e.createOscillator(),n.biquadFilter=e.createBiquadFilter(),n.gainNode=e.createGain(),n.oscillatorNode.type=G.sawtooth,n.biquadFilter.type="lowpass",n.oscillatorNode.connect(n.biquadFilter).connect(n.gainNode).connect(n.audioCtx.destination),n}return Object(U["a"])(t,[{key:"noteOn",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.audioCtx.currentTime;t=Math.max(t,this.audioCtx.currentTime),this.biquadFilter.frequency.value=2e4,this.biquadFilter.frequency.exponentialRampToValueAtTime(1e3,t+.3),this.gainNode.gain.value=.02,this.oscillatorNode.frequency.value=I(e),this.oscillatorNode.start(t)}},{key:"noteOff",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.audioCtx.currentTime;t=Math.max(t,this.audioCtx.currentTime),this.oscillatorNode.stop(t+3),window.setTimeout(function(){e.gainNode.disconnect(),e.biquadFilter.disconnect()},3e3),this.gainNode.gain.setValueAtTime(this.gainNode.gain.value,t),this.gainNode.gain.exponentialRampToValueAtTime(1e-5,t+3),window.setTimeout(function(){e.dispatchEvent("voiceDonePlaying")},50)}}]),Object(V["a"])(t,e),t}(F),W={},Y=(function(){var e=0}(),[]);window.voices=W;var H={name:"app",components:{knob:y,vueSlider:g.a,vueKeyboard:_,vueSequencer:j},data:function(){return{sliderConfig:$,audioCtx:new AudioContext,bpm:120}},mounted:function(){},methods:{onKeyboardNoteOn:function(e){var t=e.pitch,n=e.id;this.noteOn(n,t)},onKeyboardNoteOff:function(e){var t=e.pitch,n=e.id;this.noteOff(n,t)},onSequencerNoteOn:function(e){var t=this,n=e.note,o=e.whenTime,i=n.pitch,r=n.id,a=o-this.audioCtx.currentTime,s=window.setTimeout(function(){t.$refs.keyboard.keyDown(i,!1);var e=Y.indexOf(s);Y.splice(e,1)},1e3*a);Y.push(s),this.noteOn(r,i,o)},onSequencerNoteOff:function(e){var t=this,n=e.note,o=e.whenTime,i=n.pitch,r=n.id,a=o-this.audioCtx.currentTime,s=window.setTimeout(function(){t.$refs.keyboard.keyUp(i,!1);var e=Y.indexOf(s);Y.splice(e,1)},1e3*a);Y.push(s),this.noteOff(r,i,o)},noteOn:function(e,t,n){var o=new J(this.audioCtx);e in W?W[e].push(o):W[e]=[o],o.noteOn(t,n),o.addEventListener("voiceDonePlaying",function(){})},noteOff:function(e,t,n){if(e in W&&W[e].length>0){var o=W[e].pop();o.noteOff(n)}},togglePlaying:function(){this.$refs.sequencer.playing?(this.$refs.sequencer.stop(),this.$refs.keyboard.releaseAllKeys(),Y.forEach(function(e){window.clearTimeout(e)}),Y=[],Object.values(W).forEach(function(e){e.forEach(function(e){return e.noteOff()}),e.length=0})):this.$refs.sequencer.play()}}},Q=H,X=(n("5c0b"),Object(h["a"])(Q,i,r,!1,null,null,null));X.options.__file="App.vue";var Z=X.exports;o["a"].config.productionTip=!1,new o["a"]({render:function(e){return e(Z)}}).$mount("#app")},"5c0b":function(e,t,n){"use strict";var o=n("2856"),i=n.n(o);i.a},7679:function(e,t,n){},"861b":function(e,t,n){"use strict";var o=n("39e2"),i=n.n(o);i.a},aace:function(e,t,n){"use strict";var o=n("7679"),i=n.n(o);i.a},cd99:function(e,t,n){}});
//# sourceMappingURL=app.a3147674.js.map