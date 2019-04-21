!function(e,t){"object"===typeof exports&&"object"===typeof module?module.exports=t(require("React"),require("Hls"),require("flvjs")):"function"===typeof define&&define.amd?define("LMPlayer",["React","Hls","flvjs"],t):"object"===typeof exports?exports.LMPlayer=t(require("React"),require("Hls"),require("flvjs")):e.LMPlayer=t(e.React,e.Hls,e.flvjs)}(window,function(e,t,n){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=8)}([function(t,n){t.exports=e},function(e,n){e.exports=t},function(e,t){e.exports=n},function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function o(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),e}function a(e){return(a="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function u(e){return(u="function"===typeof Symbol&&"symbol"===a(Symbol.iterator)?function(e){return a(e)}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":a(e)})(e)}function l(e,t){return!t||"object"!==u(t)&&"function"!==typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function s(e){return(s=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function c(e,t){return(c=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function f(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&c(e,t)}n.r(t);var p=n(0),d=n.n(p),y=function(){function e(t){r(this,e),this.video=t,this.events={}}return o(e,[{key:"on",value:function(e,t){arguments.length>2&&void 0!==arguments[2]&&arguments[2]&&this.events.eventName?this.events[e].push(t):void 0!==this.video["on".concat(e)]&&this.video.addEventListener(e,t,!1)}},{key:"emit",value:function(e,t){this.events[e].listener.forEach(function(e){e(t)})}},{key:"off",value:function(e,t){if(arguments.length>2&&void 0!==arguments[2]&&arguments[2]&&this.events.eventName){var n=this.events[e].listener.findIndex(function(e){return e===t});n>-1&&this.events[e].listener.splice(n,1)}else void 0!==this.video["on".concat(e)]&&this.video.removeEventListener(e,t,!1)}},{key:"dispose",value:function(){this.video=null,this.events=null}}]),e}(),h=n(2),v=n.n(h),m=n(1),b=n.n(m);function g(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var k=d.a.createContext(null),P=k.Provider,E=k.Consumer;function R(e){var t=function(t){function n(){return r(this,n),l(this,s(n).apply(this,arguments))}return f(n,d.a.Component),o(n,[{key:"render",value:function(){var t=this.props,n=t.forwardRef,r=g(t,["forwardRef"]);return d.a.createElement(E,null,function(t){return d.a.createElement(e,Object.assign({},r,t,{ref:n}))})}}]),n}();return d.a.forwardRef(function(e,n){return d.a.createElement(t,Object.assign({},e,{forwardRef:n}))})}var S;n(3);function D(e){var t=e.type,n=e.className,r=void 0===n?"":n,i=g(e,["type","className"]);return d.a.createElement("i",Object.assign({className:"lm-player-iconfont ".concat(t," ").concat(r)},i))}var j,O,T,w=R(S=function(e){function t(e){var n;return r(this,t),(n=l(this,s(t).call(this,e))).updateRender=function(){n.forceUpdate()},n.changePlayStatus=function(){var e=n.props,t=e.api;e.video.paused?t.play():t.pause()},n}return f(t,d.a.Component),o(t,[{key:"componentDidMount",value:function(){this.props.event.on("play",this.updateRender),this.props.event.on("pause",this.updateRender)}},{key:"componentWillUnmount",value:function(){this.props.event.off("play",this.updateRender),this.props.event.off("pause",this.updateRender)}},{key:"render",value:function(){var e=this.props.video;return d.a.createElement("div",{className:"contraller-left-bar"},d.a.createElement("span",{className:"contraller-bar-item",onClick:this.changePlayStatus},d.a.createElement(D,{type:e.paused?"lm-player-Play_Main":"lm-player-Pause_Main"})))}}]),t}())||S,L=function(e){function t(){return r(this,t),l(this,s(t).apply(this,arguments))}return f(t,d.a.Component),o(t,[{key:"render",value:function(){return null}}]),t}(),x=(n(4),function(e){function t(){return r(this,t),l(this,s(t).call(this))}return f(t,d.a.Component),o(t,[{key:"render",value:function(){return d.a.createElement("div",{className:"contraller-bar-layout"},d.a.createElement(w,null),d.a.createElement(L,null))}}]),t}()),C=(n(5),R(j=function(e){function t(e){var n;return r(this,t),(n=l(this,s(t).call(this,e))).openLoading=function(){n.setState({loading:!0})},n.closeLoading=function(){n.setState({loading:!1})},n.state={loading:!1},n}return f(t,d.a.Component),o(t,[{key:"componentDidMount",value:function(){var e=this.props.event;e.on("loadstart",this.openLoading),e.on("waiting",this.openLoading),e.on("seeking",this.openLoading),e.on("loadeddata",this.closeLoading),e.on("canplay",this.closeLoading)}},{key:"render",value:function(){var e=this.state.loading;return d.a.createElement("div",{className:"loading-mask ".concat(e?"mask-loading-animation":"")},d.a.createElement(D,{type:"lm-player-Loading",className:"".concat(e?"video-loading-animation":""," video-loading-icon")}))}}]),t}())||j),M=(n(7),R(O=function(e){function t(e){var n;return r(this,t),(n=l(this,s(t).call(this,e))).getDuration=function(){var e=n.props.api;n.setState({duration:e.getDuration()})},n.getCurrentTime=function(){var e=n.props.api;n.setState({currentTime:e.getCurrentTime()})},n.getBuffered=function(){var e=n.props.api;n.setState({buffered:e.getSecondsLoaded()})},n.changePlayTime=function(e){var t=n.props,r=t.video,i=t.api;r.paused||i.pause();var o=n.timeLineDomRef.current.getBoundingClientRect().width,a=e.layerX/o*n.state.duration;n.setState({currentTime:a}),i.seekTo(a)},n.seekendPlay=function(){var e=n.props,t=e.video,r=e.api;t.paused&&r.play()},n.timeLineDomRef=d.a.createRef(),n.state={duration:0,currentTime:0,buffered:0},n}return f(t,d.a.Component),o(t,[{key:"componentDidMount",value:function(){var e=this.props.event;e.on("loadedmetadata",this.getDuration),e.on("durationchange",this.getDuration),e.on("timeupdate",this.getCurrentTime),e.on("progress",this.getBuffered),e.on("seeked",this.seekendPlay),this.timeLineDomRef.current.addEventListener("click",this.changePlayTime,!1)}},{key:"componentWillUnmount",value:function(){var e=this.props.event;e.off("loadedmetadata",this.getDuration),e.off("durationchange",this.getDuration),e.off("timeupdate",this.getCurrentTime),e.off("progress",this.getBuffered),e.off("seeked",this.seekendPlay),this.timeLineDomRef.current.removeEventListener("click",this.changePlayTime,!1)}},{key:"render",value:function(){var e=this.state,t=e.duration,n=e.currentTime,r=e.buffered,i=Math.round(n/t*100),o=Math.round(r/t*100);return d.a.createElement("div",{className:"video-time-line-layout",ref:this.timeLineDomRef},d.a.createElement("div",{className:"time-line-box"}),d.a.createElement("div",{className:"time-buffer-box",style:{width:"".concat(o,"%")}}),d.a.createElement("div",{className:"play-time-line-box",style:{width:"".concat(i,"%")}}))}}]),t}())||O),_=R(T=function(e){function t(){var e,n;r(this,t);for(var i=arguments.length,o=new Array(i),a=0;a<i;a++)o[a]=arguments[a];return(n=l(this,(e=s(t)).call.apply(e,[this].concat(o)))).errorHandle=function(e){console.error(e)},n}return f(t,d.a.Component),o(t,[{key:"componentDidMount",value:function(){this.props.event.on("error",this.errorHandle,!1)}},{key:"render",value:function(){return null}}]),t}())||T,N=function(){function e(t,n,i){var o=this;r(this,e),this.mute=function(){o.player.muted=!0},this.unmute=function(){o.player.muted=!1},this.player=t,this.flv=n,this.hls=i}return o(e,[{key:"play",value:function(){this.player.paused&&this.player.play()}},{key:"pause",value:function(){this.player.pause()}},{key:"stop",value:function(){this.player.removeAttribute("src"),this.hls&&this.hls.destroy(),this.flv&&(this.flv.unload(),this.flv.destroy())}},{key:"seekTo",value:function(e){this.flv&&(this.flv.unload(),this.flv.load()),this.player.currentTime=e}},{key:"setVolume",value:function(e){this.player.volume=e}},{key:"enablePIP",value:function(){this.player.requestPictureInPicture&&document.pictureInPictureElement!==this.player&&this.player.requestPictureInPicture()}},{key:"disablePIP",value:function(){document.exitPictureInPicture&&document.pictureInPictureElement===this.player&&document.exitPictureInPicture()}},{key:"setPlaybackRate",value:function(e){this.player.playbackRate=e}},{key:"getDuration",value:function(){if(!this.player)return null;var e=this.player,t=e.duration,n=e.seekable;return t===1/0&&n.length>0?n.end(n.length-1):t}},{key:"getCurrentTime",value:function(){return this.player?this.player.currentTime:null}},{key:"getSecondsLoaded",value:function(){if(!this.player)return null;var e=this.player.buffered;if(0===e.length)return 0;var t=e.end(e.length-1),n=this.getDuration();return t>n?n:t}}]),e}(),I=(n(6),function(e){function t(e){var n;return r(this,t),(n=l(this,s(t).call(this,e))).initPlayer=function(){if(!n.props.url)return null;var e=function(e){var t=/([^\.\/\\]+)\.(([a-z]|[0-9])+)$/i.exec(e);if(t)return t[2]}(n.props.url);"flv"===e||"flv"===n.props.type?n.flv=function(e,t){if(v.a.isSupported()){var n=v.a.createPlayer({type:"flv",url:t.url,isLive:!!t.isLive},{enableWorker:!1,enableStashBuffer:!1,isLive:!!t.isLive});return n.attachMediaElement(e),n.load(),n}}(n.videoDomRef.current,n.props):"m3u8"===e||"hls"===n.props.type?n.hls=function(e,t){var n=new b.a;return n.attachMedia(e),n.on(b.a.Events.MEDIA_ATTACHED,function(){n.loadSource(t.url),n.on(b.a.Events.MANIFEST_PARSED,function(){resolve(n)})}),n}(n.videoDomRef.current,n.props):n.videoDomRef.current.src=n.props.url,n.props.playCallback&&n.props.playCallback(n.api)},n.renderVideoTools=function(){return n.videoDomRef.current?d.a.createElement(d.a.Fragment,null,d.a.createElement(x,null),d.a.createElement(C,null),d.a.createElement(M,null),d.a.createElement(_,null)):null},n.event=null,n.flv=null,n.hls=null,n.playerType=null,n.videoDomRef=d.a.createRef(),n}return f(t,d.a.Component),o(t,[{key:"componentDidMount",value:function(){this.initPlayer(),this.event=new y(this.videoDomRef.current),this.api=new N(this.videoDomRef.current,this.flv,this.hls),this.props.playsinline&&(this.player.setAttribute("playsinline",""),this.player.setAttribute("webkit-playsinline",""),this.player.setAttribute("x5-playsinline","")),this.props.autoPlay&&this.api.play(),this.forceUpdate()}},{key:"render",value:function(){var e=this.props.autoPlay,t={video:this.videoDomRef.current,event:this.event,playerType:this.playerType,playerProps:this.props,api:this.api};return d.a.createElement("div",{className:"lm-player-container"},d.a.createElement("div",{className:"player-mask-layout"},d.a.createElement("video",{ref:this.videoDomRef,autoPlay:e,muted:!0})),d.a.createElement(P,{value:t},this.renderVideoTools()),this.props.children)}}]),t}());t.default=I}]).default});
//# sourceMappingURL=LMPlayer.js.map