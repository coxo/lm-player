import React from 'react';
import ReactDOM from 'react-dom';
import WebSocketController from "./scoket.js";
import WebGLPlayer from "./WebGLPlayer.js";
import { genuuid } from './util'

class YUVPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.currentCanvas = React.createRef();
    this.websocket = null;
    this.player = null;
    this.SOCKET_URL = 'ws://localhost:15080/transcoding';
    const {
      streamUrl,
      ratio
    } = this.props;
    this.STREAM_URL = streamUrl;
    this.RATIO = ratio;
    this.errorTimer = 0;
    this.reloadTimer = null;
    this.setPlayerState({ code: 70000, msg: ''});
  }

  setPlayerState(state) {
    this.props.onPlayerState(state);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.streamUrl !== nextProps.streamUrl) {
      this.closeWebSocket();
      this.STREAM_URL = nextProps.streamUrl;
      this.openPlayer();
    }

    if (this.props.ratio !== nextProps.ratio) {
      this.RATIO = nextProps.ratio;
      this.sendRatioCommand(this.RATIO)
    }
  }

  componentWillUnmount() {
    this.closeWebSocket();
    clearTimeout(this.reloadTimer);
  }

  sendRatioCommand(RATIO) {
    let rateArr = RATIO.split('*');
    RATIO && this.websocket && this.websocket.send(`{"commond":"modify", "url":"${RATIO}"}`);
    this.player && this.player.setSizefunction(rateArr[0], rateArr[1], 1920);
  }

  openPlayer() {
    if (!this.STREAM_URL) {
      console.log('拉流地址为空！请检查配置');
      return;
    }

    this._createScoket();
  }

  closeWebSocket() {
    if (this.websocket) {
      this.setPlayerState({code: 70004, msg: ''});
      this.websocket.destroy();
      this.websocket = null;
    }

    this.player && this.player.destroyfunction();
  }

  _onComplete(e) {// console.info('_onComplete==>', e)
  }

  _onError(e, info) {
    this.websocket = null;
    const errorReloadTimer = this.props.errorReloadTimer;
    console.error(e, info);

    // 判断socket是否连接
    if (info && info.code == 1000) {
      this.setPlayerState(info);
      return
    } 
    this.errorTimer = this.errorTimer + 1;

    // 开始loading...
    const that = this;
    
    if (this.errorTimer < errorReloadTimer + 1) {
      this.setPlayerState({code: 70002, msg: '', errorTimer: this.errorTimer});
      this.reloadTimer = setTimeout(() => {
        console.warn(`视频播放出错，正在进行重连第${that.errorTimer}次重连`);
        that._createScoket();
      }, 2 * 1000);
    }else{
      // 显示出错-停止重新拉起加载
      this.setPlayerState(e);
    }
  }

  _onCommand() {
    let bufferData = new Uint8Array(event.data);
    let ratioWidth = this.getRatioNumber(bufferData, [0, 2]);
    let ratioHeight = this.getRatioNumber(bufferData, [2, 4]);
    this.loadYuv(ratioWidth, ratioHeight, event.data);
  }

  loadYuv(ratioWidth, ratioHeight, data) {
    this.player.renderFrame(ratioWidth, ratioHeight, new Uint8Array(data, 4));
  }

  // 获取视频流-前四个字节-分辨率
  getRatioNumber(barrayData, byteRange) {
    const offset1 = byteRange[0];
    const offset2 = byteRange[1];
    let buffer = barrayData.subarray(offset1, offset2).reverse();
    let ratioBuffer = new Uint8Array([buffer[0], buffer[1], 0, 0]).buffer;
    return new Uint32Array(ratioBuffer)[0];
  }

  startPalyer() {
    let canvas = ReactDOM.findDOMNode(this.refs['currentCanvas']);
    this.player = new WebGLPlayer(canvas, {
      preserveDrawingBuffer: false
    });
    let rateArr = this.RATIO.split('*');
    this.player.setSizefunction(rateArr[0], rateArr[1], 1920);
    // 开始播放,清除loading
    this.setPlayerState({code: 70001, msg: ''});
    this.errorTimer = 0;
    clearTimeout(this.reloadTimer);
  }

  _createScoket() {
    const _SOCKET_URL = this.SOCKET_URL;
    const _STREAM_URL = this.STREAM_URL || '';
    const RATE = this.RATIO;
    const tokenId = genuuid();
    const that = this;
    let tokenStr = '';
    this.props.onToken(tokenId)

    if (!WebSocketController.isSupported()) {
      return;
    }

    this.closeWebSocket();
    this.websocket = new WebSocketController();
    this.websocket.onComplete = this._onComplete.bind(this);
    this.websocket.onError = this._onError.bind(this);
    this.websocket.onCommand = this._onCommand.bind(this); // 初始化成功后，开始发送拉流地址
    // console.info(tokenId)
    if(tokenId){
      tokenStr = `, "token":"${tokenId}"`
    }
    this.websocket.onOpen = function () {
      this.websocket.send(`{"commond":"url","url":"${_STREAM_URL}", "rate":"${RATE}"${tokenStr}}`);
    }.bind(this); 

    // 连接成功后，发送信令，开始视频拉流
    this.websocket.onSuccess = function (e) {
      if (e.msg === 'succeed') {
        this.startPalyer();
        this.websocket.send('{"commond":"start"}');
      } else {
        this.websocket.onError(e);
      }
    }.bind(this);

    this.websocket.open(_SOCKET_URL);
  }

  getDom() {
    return ReactDOM.findDOMNode(this.refs['currentCanvas']);
  }

  getWGL() {
    return this.player;
  }

  render() {
    return React.createElement("div", {
      class: "yuv-player-comp"
    }, React.createElement("div", {
      class: "row player-container"
    }, React.createElement("canvas", {
      class: "player-canvas-render",
      ref: "currentCanvas"
    })));
  }

}

export default YUVPlayer;
export { YUVPlayer as Player };
