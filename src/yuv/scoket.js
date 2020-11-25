import {RuntimeException} from './exception.js';

const ControllerStatus = {
    kIdle: 0,
    kConnecting: 1,
    kBuffering: 2,
    kError: 3,
    kComplete: 4
  };
const ControllerErrors = {
    OK: 'OK',
    EXCEPTION: 'Exception',
    HTTP_STATUS_CODE_INVALID: 'HttpStatusCodeInvalid',
    CONNECTING_TIMEOUT: 'ConnectingTimeout'
  };

/* Controller has callbacks which have following prototypes:
 *     function onError(errorType: number, errorInfo: {code: number, msg: string}): void
 *     function onComplete(rangeFrom: number, rangeTo: number): void
 *     function onCommand(response: jsonobj): void
 */

class WebSocketController {
    static isSupported() {
      try {
        return typeof self.WebSocket !== 'undefined';
      } catch (e) {
        return false;
      }
    }
  
    constructor() {
      this.TAG = 'WebSocketController';
      this._type = 'websocket-controller';
      this._status = ControllerStatus.kIdle; // callbacks
  
      this._onError = null;
      this._onComplete = null;
      this._onCommand = null;
      this._onSuccess = null;
      this._onOpen = null;
      this._ws = null;
      this._requestAbort = false;
    }
  
    destroy() {
      if (this._ws) {
        this.abort();
      }
  
      this._status = ControllerStatus.kIdle;
      this._onError = null;
      this._onComplete = null;
      this._onCommand = null;
      this._onSuccess = null;
      this._onOpen = null;
      console.log('close webscoket!');
    }
  
    isWorking() {
      return this._status === ControllerStatus.kConnecting || this._status === ControllerStatus.kBuffering;
    }
  
    get type() {
      return this._type;
    }
  
    get status() {
      return this._status;
    }
  
    get onCommand() {
      return this._onCommand;
    }
  
    set onCommand(callback) {
      this._onCommand = callback;
    }
  
    get onSuccess() {
      return this._onSuccess;
    }
  
    set onSuccess(callback) {
      this._onSuccess = callback;
    }
  
    get onOpen() {
      return this._onOpen;
    }
  
    set onOpen(callback) {
      this._onOpen = callback;
    }
  
    get onError() {
      return this._onError;
    }
  
    set onError(callback) {
      this._onError = callback;
    }
  
    get onComplete() {
      return this._onComplete;
    }
  
    set onComplete(callback) {
      this._onComplete = callback;
    }
  
    open(url) {
      try {
        ///renly
        let ws = this._ws = new self.WebSocket(url);
        ws.binaryType = 'arraybuffer';
        ws.onopen = this._onWebSocketOpen.bind(this);
        ws.onclose = this._onWebSocketClose.bind(this);
        ws.onmessage = this._onWebSocketMessage.bind(this);
        ws.onerror = this._onWebSocketError.bind(this);
        this._status = ControllerStatus.kConnecting;
      } catch (e) {
        this._status = ControllerStatus.kError;
        let info = {
          code: e.code,
          msg: e.message
        };
  
        if (this._onError) {
          this._onError(ControllerErrors.EXCEPTION, info);
        } else {
          throw new RuntimeException(info.msg);
        }
      }
    }
    /*
     * obj = {
     *    "type":"command",
     *    "name":"SetSpeed",
     *    "param":param
     * };
     */
  
  
    send(obj) {
      let ws = this._ws;
      console.log("send==>", obj);
  
      if (ws && ws.readyState === 1) {
        // OPEN
        if (typeof obj === 'string') {
          ws.send(obj);
        } else {
          ws.send(JSON.stringify(obj));
        }
      } else {
        this._status = ControllerStatus.kError;
        let info = {
          code: -1,
          msg: 'Unsupported WebSocket readyState while sending'
        };
  
        if (this._onError) {
          this._onError(ControllerErrors.EXCEPTION, info);
        } else {
          throw new RuntimeException(info.msg);
        }
  
        console.log("send error");
      }
    }
  
    abort() {
      let ws = this._ws;
  
      if (ws && (ws.readyState === 0 || ws.readyState === 1)) {
        // CONNECTING || OPEN
        this._requestAbort = true;
        ws.close();
      }
  
      this._ws = null;
      this._status = ControllerStatus.kComplete;
    }
  
    _onWebSocketOpen(e) {
      let ws = this._ws;
      this._status = ControllerStatus.kBuffering;
  
      if (this._onOpen) {
        this._onOpen();
      }
    }
  
    _onWebSocketClose(e) {
      if (this._requestAbort === true) {
        this._requestAbort = false;
        return;
      }
  
      this._status = ControllerStatus.kComplete;
  
      if (this._onComplete) {
        this._onComplete();
      }
    }
  
    _onWebSocketMessage(e) {
      //sendcommand的回复
      if (typeof e.data === 'object') {
        this._onCommandResponse(e.data);
      } else if (typeof e.data === 'string') {
        this._onSuccessResponse(e.data);
      } else {
        this._status = ControllerStatus.kError;
        let info = {
          code: -1,
          msg: 'Unsupported WebSocket message type: ' + e.data.constructor.name
        };
  
        if (this._onError) {
          this._onError(ControllerErrors.EXCEPTION, info);
        } else {
          throw new RuntimeException(info.msg);
        }
      }
    }
  
    _onCommandResponse(response) {
      let res = response;
  
      if (this._onCommand) {
        this._onCommand(res);
      }
    }
  
    _onSuccessResponse(response) {
      let res = response;
  
      if (this._onSuccess) {
        this._onSuccess(JSON.parse(res));
      }
    }
  
    _onWebSocketError(e) {
      this._status = ControllerStatus.kError;
      let info = {
        code: e.code || 1000,
        msg: e.message || '未检测到播放插件，请运行插件！'
      };
  
      if (this._onError) {
        this._onError(ControllerErrors.EXCEPTION, info);
      } else {
        throw new RuntimeException(info.msg);
      }
    }
  
}
export default WebSocketController;