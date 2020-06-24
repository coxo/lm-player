import React, { useMemo, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

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

class RuntimeException {
  constructor(message) {
    this._message = message;
  }

  get name() {
    return 'RuntimeException';
  }

  get message() {
    return this._message;
  }

  toString() {
    return this.name + ': ' + this.message;
  }

}

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

class WebGLPlayer {
  constructor(canvas, parent, options) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    this._init();
  }

  _init() {
    let gl = this.gl;

    if (!gl) {
      console.log('gl not support！');
      return;
    } // 图像预处理


    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // GLSL 格式的顶点着色器代码

    let vertexShaderSource = `
        attribute lowp vec4 a_vertexPosition;
        attribute vec2 a_texturePosition;
        varying vec2 v_texCoord;
        void main() {
            gl_Position = a_vertexPosition;
            v_texCoord = a_texturePosition;
        }
    `;
    let fragmentShaderSource = `
        precision lowp float;
        uniform sampler2D samplerY;
        uniform sampler2D samplerU;
        uniform sampler2D samplerV;
        varying vec2 v_texCoord;
        void main() {
            float r,g,b,y,u,v,fYmul;
            y = texture2D(samplerY, v_texCoord).r;
            u = texture2D(samplerU, v_texCoord).r;
            v = texture2D(samplerV, v_texCoord).r;

            fYmul = y * 1.1643828125;
            r = fYmul + 1.59602734375 * v - 0.870787598;
            g = fYmul - 0.39176171875 * u - 0.81296875 * v + 0.52959375;
            b = fYmul + 2.01723046875 * u - 1.081389160375;
            gl_FragColor = vec4(r, g, b, 1.0);
        }
    `;

    let vertexShader = this._compileShader(vertexShaderSource, gl.VERTEX_SHADER);

    let fragmentShader = this._compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    let program = this._createProgram(vertexShader, fragmentShader);

    this._initVertexBuffers(program); // 激活指定的纹理单元


    gl.activeTexture(gl.TEXTURE0);
    gl.y = this._createTexture();
    gl.uniform1i(gl.getUniformLocation(program, 'samplerY'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.u = this._createTexture();
    gl.uniform1i(gl.getUniformLocation(program, 'samplerU'), 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.v = this._createTexture();
    gl.uniform1i(gl.getUniformLocation(program, 'samplerV'), 2);
  }
  /**
   * 初始化顶点 buffer
   * @param {glProgram} program 程序
   */


  _initVertexBuffers(program) {
    let gl = this.gl;
    let vertexBuffer = gl.createBuffer();
    let vertexRectangle = new Float32Array([1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); // 向缓冲区写入数据

    gl.bufferData(gl.ARRAY_BUFFER, vertexRectangle, gl.STATIC_DRAW); // 找到顶点的位置

    let vertexPositionAttribute = gl.getAttribLocation(program, 'a_vertexPosition'); // 告诉显卡从当前绑定的缓冲区中读取顶点数据

    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0); // 连接vertexPosition 变量与分配给它的缓冲区对象

    gl.enableVertexAttribArray(vertexPositionAttribute);
    let textureRectangle = new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
    let textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureRectangle, gl.STATIC_DRAW);
    let textureCoord = gl.getAttribLocation(program, 'a_texturePosition');
    gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoord);
  }
  /**
   * 创建并编译一个着色器
   * @param {string} shaderSource GLSL 格式的着色器代码
   * @param {number} shaderType 着色器类型, VERTEX_SHADER 或 FRAGMENT_SHADER。
   * @return {glShader} 着色器。
   */


  _compileShader(shaderSource, shaderType) {
    // 创建着色器程序
    let shader = this.gl.createShader(shaderType); // 设置着色器的源码

    this.gl.shaderSource(shader, shaderSource); // 编译着色器

    this.gl.compileShader(shader);
    const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);

    if (!success) {
      let err = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      console.error('could not compile shader', err);
      return;
    }

    return shader;
  }
  /**
   * 从 2 个着色器中创建一个程序
   * @param {glShader} vertexShader 顶点着色器。
   * @param {glShader} fragmentShader 片断着色器。
   * @return {glProgram} 程序
   */


  _createProgram(vertexShader, fragmentShader) {
    const gl = this.gl;
    let program = gl.createProgram(); // 附上着色器

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program); // 将 WebGLProgram 对象添加到当前的渲染状态中

    gl.useProgram(program);
    const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);

    if (!success) {
      console.err('program fail to link' + this.gl.getShaderInfoLog(program));
      return;
    }

    return program;
  }
  /**
   * 设置纹理
   */


  _createTexture(filter = this.gl.LINEAR) {
    let gl = this.gl;
    let t = gl.createTexture(); // 将给定的 glTexture 绑定到目标（绑定点

    gl.bindTexture(gl.TEXTURE_2D, t); // 纹理包装 参考https://github.com/fem-d/webGL/blob/master/blog/WebGL基础学习篇（Lesson%207）.md -> Texture wrapping

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // 设置纹理过滤方式

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    return t;
  }
  /**
   * 渲染图片出来
   * @param {number} width 宽度
   * @param {number} height 高度
   */


  renderFrame(width, height, data) {
    let gl = this.gl; // 设置视口，即指定从标准设备到窗口坐标的x、y仿射变换

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // 设置清空颜色缓冲时的颜色值

    gl.clearColor(0, 0, 0, 0); // 清空缓冲 颜色缓冲区（COLOR_BUFFER_BIT）

    gl.clear(gl.COLOR_BUFFER_BIT);
    let uOffset = width * height;
    let vOffset = (width >> 1) * (height >> 1);
    gl.bindTexture(gl.TEXTURE_2D, gl.y); // 填充纹理

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data.subarray(0, uOffset));
    gl.bindTexture(gl.TEXTURE_2D, gl.u);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width >> 1, height >> 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data.subarray(uOffset, uOffset + vOffset));
    gl.bindTexture(gl.TEXTURE_2D, gl.v);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width >> 1, height >> 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data.subarray(uOffset + vOffset, data.length));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  /**
   * 根据重新设置 canvas 大小
   * @param {number} width 宽度
   * @param {number} height 高度
   * @param {number} maxWidth 最大宽度
   */


  setSizefunction(width, height, maxWidth) {
    let canvasWidth = Math.min(maxWidth, width);
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasWidth * height / width;
  }

  destroyfunction() {
    const {
      gl
    } = this; // 颜色缓冲区（COLOR_BUFFER_BIT） | 深度缓冲区（DEPTH_BUFFER_BIT） | 模板缓冲区（STENCIL_BUFFER_BIT）

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  }

}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function IconFont({
  type,
  className = '',
  ...props
}) {
  return React.createElement("i", _extends({
    className: `yuv-player-iconfont ${type} ${className}`
  }, props));
}
IconFont.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string
};

const NoSource = () => {
  return React.createElement("div", {
    className: "yuv-player-message-mask yuv-player-mask-loading-animation"
  }, React.createElement(IconFont, {
    style: {
      fontSize: 80
    },
    type: "yuv-player-PlaySource",
    title: "\u8BF7\u9009\u62E9\u89C6\u9891\u6E90"
  }));
};

function ContentSource({
  status
}) {
  const {
    msg = '',
    loading = true
  } = useMemo(() => {
    if (status == 1) {
      return {
        msg: '',
        loading: false
      };
    }

    if (status === 2) {
      return {
        msg: '视频错误',
        loading: false
      };
    }

    if (status === 3) {
      return {
        msg: '视频加载错误，正在进行重连...',
        loading: true
      };
    }
  }, [status]);
  console.info(loading, status);
  return React.createElement("div", {
    className: `yuv-player-message-mask ${loading || status === 2 ? 'yuv-player-mask-loading-animation' : ''}`
  }, React.createElement(IconFont, {
    type: status === 2 ? 'yuv-player-YesorNo_No_Dark' : 'yuv-player-Loading',
    className: `${loading && status !== 2 ? 'yuv-player-loading-animation' : status === 2 ? 'yuv-player-loadfail' : ''} yuv-player-loading-icon`
  }), React.createElement("span", {
    className: "yuv-player-message"
  }, msg));
}

function YUVMessage({
  playerState
}) {
  console.info('当前播放状态为：==>', playerState);

  if (playerState == 0) {
    return React.createElement(NoSource, null);
  } else {
    return React.createElement(ContentSource, {
      status: playerState
    });
  }
}

function Bar({
  visibel = true,
  className = '',
  children,
  ...props
}) {
  if (visibel === false) {
    return null;
  }

  return React.createElement("span", _extends({
    className: `contraller-bar-item ${className}`
  }, props), children);
}
Bar.propTypes = {
  visibel: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.any
};

function PlayerBar({
  playContainer,
  api,
  scale,
  snapshot,
  rightExtContents,
  rightMidExtContents
}) {
  const [dep, setDep] = useState(Date.now()); // useEffect(() => {
  const fullscreen = useCallback(() => {
    // !isFullscreen(playContainer) ? api.requestFullScreen() : api.cancelFullScreen()
    setDep(Date.now());
  }, [api, playContainer]);
  const setScale = useCallback((...args) => {// const dragDom = playContainer.querySelector('.player-mask-layout')
    // api.setScale(...args)
    // let position = computedBound(dragDom, api.getPosition(), api.getScale())
    // if (position) {
    //   api.setPosition(position, true)
    // }
  }, [api, playContainer]);
  return React.createElement("div", {
    className: "contraller-right-bar"
  }, rightMidExtContents, scale && React.createElement(React.Fragment, null, React.createElement(Bar, null, React.createElement(IconFont, {
    title: "\u7F29\u5C0F",
    onClick: () => setScale(-0.2),
    type: 'yuv-player-ZoomOut_Main'
  })), React.createElement(Bar, null, React.createElement(IconFont, {
    title: "\u590D\u4F4D",
    onClick: () => setScale(1, true),
    type: 'yuv-player-ZoomDefault_Main'
  })), React.createElement(Bar, null, React.createElement(IconFont, {
    title: "\u653E\u5927",
    onClick: () => setScale(0.2),
    type: 'yuv-player-ZoomIn_Main'
  }))), snapshot && React.createElement(Bar, null, React.createElement(IconFont, {
    title: "\u622A\u56FE",
    onClick: () => snapshot(api.snapshot()),
    type: "yuv-player-SearchBox"
  })), React.createElement(Bar, null, React.createElement(IconFont, {
    title:  '全屏',
    onClick: fullscreen,
    type:  'yuv-player-Full_Main'
  })), rightExtContents);
}

PlayerBar.propTypes = {
  api: PropTypes.object,
  event: PropTypes.object,
  playerProps: PropTypes.object,
  playContainer: PropTypes.node,
  reloadHistory: PropTypes.func,
  isHistory: PropTypes.bool
};

function ContrallerBar({
  playContainer,
  snapshot,
  rightExtContents,
  rightMidExtContents,
  scale,
  visibel,
  api,
  event,
  video,
  isHistory,
  reloadHistory,
  isLive,
  leftExtContents,
  leftMidExtContents
}) {
  return React.createElement("div", {
    className: `contraller-bar-layout ${!visibel ? 'hide-contraller-bar' : ''}`
  }, React.createElement(PlayerBar, {
    snapshot: "true"
  }));
}

ContrallerBar.propTypes = {
  visibel: PropTypes.bool
};

class YUVPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.currentCanvas = React.createRef();
    this.websocket = null;
    this.SOCKET_URL = 'ws://localhost:15080/transcoding';
    const {
      streamUrl,
      ratio
    } = this.props;
    this.STREAM_URL = streamUrl;
    this.RATIO = ratio;
    this.state = {
      PLAYER_STATE: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.ratio !== nextProps.ratio) {
      this.RATIO = nextProps.ratio;
      this.RATIO && this.websocket.send(`{"commond":"modify", "url":"${this.RATIO}"}`);
    }
  }

  componentDidMount() {
    if (!this.STREAM_URL) {
      console.log('拉流地址为空！请检查配置');
      return;
    }

    this._createScoket();
  }

  _onComplete(e) {
    console.info('_onComplete==>', e);
  }

  _onError(e) {
    this.websocket = null;
    console.error(e);
  }

  _onCommand() {
    // console.info('接收视频帧数据：',event);
    let bufferData = new Uint8Array(event.data);
    let ratioWidth = this.getRatioNumber(bufferData, [0, 2]);
    let ratioHeight = this.getRatioNumber(bufferData, [2, 4]);
    let canvas = ReactDOM.findDOMNode(this.refs['currentCanvas']);
    let webglPlayer = new WebGLPlayer(canvas, {
      preserveDrawingBuffer: false
    });
    webglPlayer.setSizefunction(ratioWidth, ratioHeight, 1920);
   // console.info(ratioWidth, ratioHeight); // webglPlayer.renderFrame(new Uint8Array(event.data), width, height, ylen, uvlen);

    webglPlayer.renderFrame(ratioWidth, ratioHeight, new Uint8Array(event.data, 4));
  }

  getRatioNumber(barrayData, byteRange) {
    const offset1 = byteRange[0];
    const offset2 = byteRange[1];
    let buffer = barrayData.subarray(offset1, offset2).reverse();
    let ratioBuffer = new Uint8Array([buffer[0], buffer[1], 0, 0]).buffer;
    return new Uint32Array(ratioBuffer)[0];
  }

  startPalyer() {
    this.setState({
      PLAYER_STATE: 1
    });
  }

  _createScoket() {
    const _SOCKET_URL = this.SOCKET_URL;
    const _STREAM_URL = this.STREAM_URL;
    let that = this;

    if (!WebSocketController.isSupported()) {
      return;
    }

    if (this.websocket) {
      this.websocket.destroy();
      this.websocket = null;
    }

    this.websocket = new WebSocketController();
    this.websocket.onComplete = this._onComplete.bind(this);
    this.websocket.onError = this._onError.bind(this);
    this.websocket.onCommand = this._onCommand.bind(this); // 初始化成功后，开始发送拉流地址

    this.websocket.onOpen = function () {
      this.websocket.send('{"commond":"url","url":"' + _STREAM_URL + '"}');
    }.bind(this); // 连接成功后，发送信令，开始视频拉流


    this.websocket.onSuccess = function (e) {
      console.info(e);

      if (e.msg === 'succeed') {
        that.startPalyer();
        this.RATIO && this.websocket.send(`{"commond":"modify", "url":"${this.RATIO}"}`);
        this.websocket.send('{"commond":"start"}');
      } else {
        this.websocket.onError(e.msg);
      }
    }.bind(this);

    this.websocket.open(_SOCKET_URL);
  }

  render() {
    const {
      PLAYER_STATE
    } = this.state;
    return React.createElement("div", {
      class: "yuv-player-comp"
    }, React.createElement(YUVMessage, {
      playerState: PLAYER_STATE
    }), React.createElement(ContrallerBar, null), React.createElement("div", {
      class: "row player-container"
    }, React.createElement("canvas", {
      class: "player-canvas-render",
      ref: "currentCanvas"
    })));
  }

}

export default YUVPlayer;
export { YUVPlayer as Player };