(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('prop-types'), require('react-dom'), require('flv.zv.js'), require('hls.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'prop-types', 'react-dom', 'flv.zv.js', 'hls.js'], factory) :
  (global = global || self, factory(global.LMPlayer = {}, global.React, global.PropTypes, global.ReactDOM, global.flvjs, global.Hls));
}(this, (function (exports, React, PropTypes, ReactDOM, flvjs, Hls) { 'use strict';

  var React__default = 'default' in React ? React['default'] : React;
  PropTypes = PropTypes && Object.prototype.hasOwnProperty.call(PropTypes, 'default') ? PropTypes['default'] : PropTypes;
  ReactDOM = ReactDOM && Object.prototype.hasOwnProperty.call(ReactDOM, 'default') ? ReactDOM['default'] : ReactDOM;
  flvjs = flvjs && Object.prototype.hasOwnProperty.call(flvjs, 'default') ? flvjs['default'] : flvjs;

  class VideoEventInstance {
    constructor(video) {
      this.video = video;
      this.events = {};
      this.playerEvents = {};
    }

    on(eventName, handle) {
      this.events && this.events[eventName] ? this.events[eventName].listener.push(handle) : this.events[eventName] = {
        type: eventName,
        listener: [handle]
      };
    }

    addEventListener(eventName, handle) {
      if (this.video) {
        this.playerEvents[eventName] ? this.playerEvents[eventName].push(handle) : this.playerEvents[eventName] = [handle];
        this.video.addEventListener(eventName, handle, false);
      }
    }

    removeEventListener(eventName, handle) {
      if (this.video) {
        if (!this.playerEvents || !this.playerEvents[eventName]) {
          return;
        }

        let index = this.playerEvents[eventName].findIndex(v => v === handle);
        index > -1 && this.playerEvents[eventName].splice(index, 1);
        this.video.removeEventListener(eventName, handle, false);
      }
    }

    emit(eventName, ...data) {
      if (!this.events || !this.events[eventName]) {
        return;
      }

      this.events[eventName].listener.forEach(v => {
        v(...data);
      });
    }

    off(eventName, handle) {
      if (!this.events || !this.events.eventName) {
        return;
      }

      let index = this.events[eventName].listener.findIndex(v => v === handle);
      index > -1 && this.events[eventName].listener.splice(index, 1);
    }

    getApi() {
      return {
        on: this.on.bind(this),
        off: this.off.bind(this),
        emit: this.emit.bind(this),
        addEventListener: this.addEventListener.bind(this),
        removeEventListener: this.removeEventListener.bind(this)
      };
    }

    destroy() {
      Object.keys(this.playerEvents).forEach(key => {
        this.playerEvents[key].forEach(fn => {
          this.removeEventListener(key, fn);
        });
      });
      this.playerEvents = {};
      this.events = {};
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
    return /*#__PURE__*/React__default.createElement("i", _extends({
      className: `lm-player-iconfont ${type} ${className}`
    }, props));
  }
  IconFont.propTypes = {
    type: PropTypes.string,
    className: PropTypes.string
  };

  class Slider extends React__default.Component {
    constructor(props) {
      super(props);

      this.renderSliderTips = e => {
        const {
          renderTips
        } = this.props;

        if (!renderTips) {
          return;
        }

        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          const {
            x,
            width,
            top
          } = this.layoutDom.getBoundingClientRect();
          const tipsX = e.pageX - x;
          let percent = (e.pageX - x) / width;
          percent = percent < 0 ? 0 : percent > 1 ? 1 : percent;
          this.setState({
            tipsX,
            tipsY: top,
            showTips: true,
            tempValue: percent
          });
        }, 200);
      };

      this.hideSliderTips = () => {
        clearTimeout(this.timer);
        this.setState({
          showTips: false
        });
      };

      this.cancelPropagation = e => {
        e.stopPropagation();
      };

      this.startDrag = e => {
        e.stopPropagation();
        this.dragFlag = true;
        document.body.addEventListener('mousemove', this.moveChange);
        document.body.addEventListener('mouseup', this.stopDrag);
      };

      this.moveChange = e => {
        e.stopPropagation();
        const percent = this.computedPositionForEvent(e);
        this.setState({
          value: percent
        });
      };

      this.stopDrag = e => {
        e.stopPropagation();
        document.body.removeEventListener('mousemove', this.moveChange);
        document.body.removeEventListener('mouseup', this.stopDrag);
        this.dragFlag = false;
        let percent = this.state.value / 100;
        percent = percent < 0 ? 0 : percent > 1 ? 1 : percent;
        this.props.onChange && this.props.onChange(percent);
      };

      this.changeCurrentValue = event => {
        event.stopPropagation();
        const {
          width,
          x
        } = this.layoutDom.getBoundingClientRect();
        let percent = (event.pageX - x) / width;
        this.props.onChange && this.props.onChange(percent);
      };

      this.sliderDomRef = /*#__PURE__*/React__default.createRef();
      this.layoutDom = null;
      this.lineDom = null;
      this.dragDom = null;
      this.dragFlag = false;
      this.state = {
        value: this.props.currentPercent || 0,
        tempValue: 0,
        showTips: false,
        tipsX: 0,
        tipsY: 0
      };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      if (!this.dragFlag) {
        this.setState({
          value: nextProps.currentPercent || 0
        });
      }
    }

    componentDidMount() {
      this.layoutDom = this.sliderDomRef.current;
      this.dragDom = this.layoutDom.querySelector('.drag-change-icon');
      this.lineDom = this.layoutDom.querySelector('.slider-content');
      this.layoutDom.addEventListener('mousemove', this.renderSliderTips, false);
      this.layoutDom.addEventListener('mouseout', this.hideSliderTips, false);
      this.lineDom.addEventListener('click', this.changeCurrentValue, false);
      this.dragDom.addEventListener('click', this.cancelPropagation, false);
      this.dragDom.addEventListener('mousedown', this.startDrag, false);
    }

    componentWillUnmount() {
      clearTimeout(this.timer);
      this.layoutDom.removeEventListener('mousemove', this.renderSliderTips, false);
      this.layoutDom.removeEventListener('mouseout', this.hideSliderTips, false);
      this.lineDom.removeEventListener('click', this.changeCurrentValue, false);
      this.dragDom.removeEventListener('click', this.cancelPropagation, false);
      this.dragDom.removeEventListener('mousedown', this.startDrag, false);
      document.body.removeEventListener('mousemove', this.moveChange);
      document.body.removeEventListener('mouseup', this.stopDrag);
      this.sliderDomRef = null;
      this.layoutDom = null;
      this.lineDom = null;
      this.dragDom = null;
      this.dragFlag = null;
    }

    computedPositionForEvent(e) {
      const {
        x,
        width
      } = this.layoutDom.getBoundingClientRect();
      const {
        pageX
      } = e;
      let dx = pageX - x;

      if (dx > width) {
        dx = width;
      }

      if (dx < 0) {
        dx = 0;
      }

      return dx / width * 100;
    }

    render() {
      const {
        value,
        showTips,
        tipsX
      } = this.state;
      const {
        availablePercent = 0,
        className = '',
        tipsY
      } = this.props;
      return /*#__PURE__*/React__default.createElement("div", {
        className: `slider-layout ${className}`,
        ref: this.sliderDomRef
      }, /*#__PURE__*/React__default.createElement("div", {
        className: "slider-content"
      }, /*#__PURE__*/React__default.createElement("div", {
        className: "slider-max-line"
      }), /*#__PURE__*/React__default.createElement("div", {
        className: "slider-visibel-line",
        style: {
          width: `${availablePercent}%`
        }
      }), /*#__PURE__*/React__default.createElement("div", {
        className: "slider-current-line",
        style: {
          width: `${value}%`
        }
      }), this.props.children), /*#__PURE__*/React__default.createElement("div", {
        className: "slider-other-content"
      }, /*#__PURE__*/React__default.createElement("div", {
        className: "drag-change-icon",
        draggable: false,
        style: {
          left: `${value}%`
        }
      })), /*#__PURE__*/React__default.createElement(Tips, {
        visibel: showTips,
        className: "lm-player-slide-tips",
        style: {
          left: tipsX,
          top: tipsY
        },
        getContainer: () => this.sliderDomRef.current
      }, this.props.renderTips && this.props.renderTips(this.state.tempValue)));
    }

  }

  Slider.propTypes = {
    currentPercent: PropTypes.number,
    seekTo: PropTypes.func,
    video: PropTypes.element,
    renderTips: PropTypes.func,
    availablePercent: PropTypes.number,
    onChange: PropTypes.func,
    children: PropTypes.any,
    className: PropTypes.string,
    tipsY: PropTypes.number
  };
  Slider.defaultProps = {
    tipsY: -10
  };

  function Tips({
    getContainer,
    visibel,
    children,
    style,
    className = ''
  }) {
    const ele = React.useRef(document.createElement('div'));
    React.useEffect(() => {
      const box = getContainer ? getContainer() || document.body : document.body;
      box.appendChild(ele.current);
      return () => box.removeChild(ele.current);
    }, [getContainer]);

    if (!visibel) {
      return null;
    }

    return /*#__PURE__*/ReactDOM.createPortal( /*#__PURE__*/React__default.createElement("div", {
      className: className,
      style: style
    }, children), ele.current);
  }

  Tips.propTypes = {
    visibel: PropTypes.bool,
    children: PropTypes.element,
    style: PropTypes.any,
    className: PropTypes.string
  };

  function Bar({
    visibel = true,
    className = '',
    children,
    ...props
  }) {
    if (visibel === false) {
      return null;
    }

    return /*#__PURE__*/React__default.createElement("span", _extends({
      className: `contraller-bar-item ${className}`
    }, props), children);
  }
  Bar.propTypes = {
    visibel: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.any
  };

  var EventName = {
    RELOAD: "reload",
    //手动视频重载
    RELOAD_FAIL: "reloadFail",
    // 视频出错，重连失败
    RELOAD_SUCCESS: "reloadSuccess",
    //视频出错，重连成功
    ERROR: "error",
    //视频出错
    ERROR_RELOAD: "errorRload",
    //视频出错，自动重连
    HISTORY_PLAY_END: "historyPlayEnd",
    //历史视频列表播放结束
    SEEK: "seek",
    //跳跃播放时间
    TRANSFORM: "transform",
    //视频容器缩放
    CHANGE_PLAY_INDEX: "changePlayIndex",
    //历史视频列表播放索引改变
    HIDE_CONTRALLER: "hideContraller",
    SHOW_CONTRALLER: "showContraller",
    CLEAR_ERROR_TIMER: "clearErrorTimer"
  };

  function LeftBar({
    api,
    event,
    video,
    isHistory,
    reloadHistory,
    isLive,
    isVolume = false,
    leftExtContents,
    leftMidExtContents
  }) {
    const [openSliderVolume, setOpenSliderVolume] = React.useState(false);
    const [dep, setDep] = React.useState(Date.now());
    React.useEffect(() => {
      const updateRender = () => {
        setDep(Date.now());
      };

      event.addEventListener('play', updateRender);
      event.addEventListener('pause', updateRender);
      event.addEventListener('volumechange', updateRender);
      return () => {
        event.removeEventListener('play', updateRender);
        event.removeEventListener('pause', updateRender);
        event.removeEventListener('volumechange', updateRender);
      };
    }, [event]);

    if (!video) {
      video = {
        paused: false,
        muted: 0,
        volume: 0
      };
    } //缓存值


    const paused = React.useMemo(() => video.paused, [dep, video]);
    const statusIconClassName = React.useMemo(() => paused ? 'lm-player-Play_Main' : 'lm-player-Pause_Main', [paused]);
    const statusText = React.useMemo(() => paused ? '播放' : '暂停', [paused]);
    const volumeVal = React.useMemo(() => video.muted ? 0 : video.volume, [dep, video]);
    const volumeIcon = React.useMemo(() => volumeVal === 0 ? 'lm-player-volume-close' : video.volume === 1 ? 'lm-player-volume-max' : 'lm-player-volume-normal-fuben', [volumeVal]);
    const volumePercent = React.useMemo(() => volumeVal === 0 ? 0 : volumeVal * 100, [volumeVal]);
    const sliderClassName = React.useMemo(() => openSliderVolume ? 'contraller-bar-hover-volume' : '', [openSliderVolume]); //TODO 方法

    const changePlayStatus = React.useCallback(() => video.paused ? api.play() : api.pause(), [video, api]);
    const mutedChantgeStatus = React.useCallback(() => video.muted ? api.unmute() : api.mute(), [api, video]);
    const onChangeVolume = React.useCallback(volume => {
      api.setVolume(parseFloat(volume.toFixed(1)));
      volume > 0 && video.muted && api.unmute();
    }, [api, video]);
    const reload = React.useCallback(() => {
      isHistory ? reloadHistory() : api.reload();
      event.emit(EventName.CLEAR_ERROR_TIMER);
    }, [event, isHistory, api]);
    return /*#__PURE__*/React__default.createElement("div", {
      className: "contraller-left-bar"
    }, leftExtContents, /*#__PURE__*/React__default.createElement(Bar, {
      visibel: !isLive
    }, /*#__PURE__*/React__default.createElement(IconFont, {
      onClick: changePlayStatus,
      type: statusIconClassName,
      title: statusText
    })), /*#__PURE__*/React__default.createElement(Bar, {
      visibel: isVolume,
      className: `contraller-bar-volume ${sliderClassName}`,
      onMouseOver: () => setOpenSliderVolume(true),
      onMouseOut: () => setOpenSliderVolume(false)
    }, /*#__PURE__*/React__default.createElement(IconFont, {
      onClick: mutedChantgeStatus,
      type: volumeIcon,
      title: "\u97F3\u91CF"
    }), /*#__PURE__*/React__default.createElement("div", {
      className: "volume-slider-layout"
    }, /*#__PURE__*/React__default.createElement(Slider, {
      className: "volume-slider",
      currentPercent: volumePercent,
      onChange: onChangeVolume,
      renderTips: precent => /*#__PURE__*/React__default.createElement("span", null, Math.round(precent * 100), "%"),
      tipsY: -2
    }))), /*#__PURE__*/React__default.createElement(Bar, null, /*#__PURE__*/React__default.createElement(IconFont, {
      onClick: reload,
      type: "lm-player-Refresh_Main",
      title: "\u91CD\u8F7D"
    })), leftMidExtContents);
  }

  LeftBar.propTypes = {
    api: PropTypes.object,
    event: PropTypes.object,
    playerProps: PropTypes.object,
    video: PropTypes.node,
    reloadHistory: PropTypes.func,
    isHistory: PropTypes.bool
  };

  /**
   * 全屏
   * @param {*} element
   */
  function fullscreen(element) {
    if (element.requestFullScreen) {
      element.requestFullScreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
  /**
   * exitFullscreen 退出全屏
   * @param  {Objct} element 选择器
   */

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
  /**
   * [isFullscreen 判断浏览器是否全屏]
   * @return [全屏则返回当前调用全屏的元素,不全屏返回false]
   */

  function isFullscreen(ele) {
    if (!ele) {
      return false;
    }

    return document.fullscreenElement === ele || document.msFullscreenElement === ele || document.mozFullScreenElement === ele || document.webkitFullscreenElement === ele || false;
  } // 添加 / 移除 全屏事件监听

  function fullScreenListener(isAdd, fullscreenchange) {
    const funcName = isAdd ? 'addEventListener' : 'removeEventListener';
    const fullScreenEvents = ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'];
    fullScreenEvents.map(v => document[funcName](v, fullscreenchange));
  }
  /**
   * 计算视频拖拽边界
   * @param {*} ele
   * @param {*} currentPosition
   * @param {*} scale
   */

  function computedBound(ele, currentPosition, scale) {
    const data = currentPosition;
    const eleRect = ele.getBoundingClientRect();
    const w = eleRect.width;
    const h = eleRect.height;
    let lx = 0,
        ly = 0;

    if (scale === 1) {
      return [0, 0];
    }

    lx = w * (scale - 1) / 2 / scale;
    ly = h * (scale - 1) / 2 / scale;
    let x = 0,
        y = 0;

    if (data[0] >= 0 && data[0] > lx) {
      x = lx;
    }

    if (data[0] >= 0 && data[0] < lx) {
      x = data[0];
    }

    if (data[0] < 0 && data[0] < -lx) {
      x = -lx;
    }

    if (data[0] < 0 && data[0] > -lx) {
      x = data[0];
    }

    if (data[1] >= 0 && data[1] > ly) {
      y = ly;
    }

    if (data[1] >= 0 && data[1] < ly) {
      y = data[1];
    }

    if (data[1] < 0 && data[1] < -ly) {
      y = -ly;
    }

    if (data[1] < 0 && data[1] > -ly) {
      y = data[1];
    }

    if (x !== data[0] || y !== data[1]) {
      return [x, y];
    } else {
      return;
    }
  }
  /**
   * 生成UUID
   */

  function genuuid() {
    let s = [];
    let hexDigits = '0123456789abcdef';

    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }

    s[14] = '4';
    s[19] = hexDigits.substr(s[19] & 0x3 | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    let uuidStr = s.join('');
    return uuidStr;
  }
  /**
   * 获取视频分辨率
   */

  function getVideoRatio() {
    return {
      // '5': { value: '1920*1080', name: '超高清'},
      '1': {
        value: '1280*720',
        name: '超清'
      },
      '2': {
        value: '960*544',
        name: '高清'
      },
      '3': {
        value: '640*480',
        name: '标清'
      },
      '4': {
        value: '352*288',
        name: '普清'
      }
    };
  }
  /**
   * 根据分屏获取对应的分辨率
   * 默认 960*544
   */

  function getScreenRate(num) {
    const videoRatio = getVideoRatio();
    let ratio = '';

    switch (num) {
      case 1:
        ratio = videoRatio['1'].value;
        break;

      case 4:
        ratio = videoRatio['2'].value;
        break;

      case 9:
        ratio = videoRatio['3'].value;
        break;

      case 16:
        ratio = videoRatio['4'].value;
        break;

      default:
        ratio = videoRatio['2'].value;
        break;
    }

    return ratio;
  }
  /**
   * 获取全局配置
   * @param {*} key 
   */

  function getGlobalCache(key) {
    const strS = localStorage.getItem('PY_PLUS');
    let playerOptions = null;

    try {
      playerOptions = JSON.parse(strS);
    } catch (error) {
      console.error('播放配置出错，请检查浏览器存储！');
    }

    return playerOptions[key];
  }
  /**
   * 全局配置
   * decryptionMode： 是否加密
   * switchRate：码率切换控制
   */

  const GL_CACHE = {
    DM: 'decryptionMode',
    SR: 'switchRate'
  };

  function RightBar({
    playContainer,
    api,
    isLive,
    scale,
    snapshot,
    rightExtContents,
    rightMidExtContents
  }) {
    // 获取视频分辨率
    const ratioValue = getVideoRatio();
    const [dep, setDep] = React.useState(Date.now()); // 默认高清3，544

    const [viewText, setViewText] = React.useState(ratioValue[2].name);
    const isSwithRate = getGlobalCache(GL_CACHE.SR) || false;
    React.useEffect(() => {
      const update = () => setDep(Date.now());

      fullScreenListener(true, update);
      return () => fullScreenListener(false, update);
    }, []);
    const isfull = React.useMemo(() => isFullscreen(playContainer), [dep, playContainer]);
    const fullscreen = React.useCallback(() => {
      !isFullscreen(playContainer) ? api.requestFullScreen() : api.cancelFullScreen();
      setDep(Date.now());
    }, [api, playContainer]);
    const setScale = React.useCallback((...args) => {
      const dragDom = playContainer.querySelector('.player-mask-layout');
      api.setScale(...args);
      let position = computedBound(dragDom, api.getPosition(), api.getScale());

      if (position) {
        api.setPosition(position, true);
      }
    }, [api, playContainer]);
    const setRatio = React.useCallback((...args) => {
      setViewText(ratioValue[args].name);
      api.exeRatioCommand(ratioValue[args].value);
    }, [api]);
    return /*#__PURE__*/React__default.createElement("div", {
      className: "contraller-right-bar"
    }, rightMidExtContents, scale && /*#__PURE__*/React__default.createElement(React__default.Fragment, null, /*#__PURE__*/React__default.createElement(Bar, null, /*#__PURE__*/React__default.createElement(IconFont, {
      title: "\u7F29\u5C0F",
      onClick: () => setScale(-0.2),
      type: 'lm-player-ZoomOut_Main'
    })), /*#__PURE__*/React__default.createElement(Bar, null, /*#__PURE__*/React__default.createElement(IconFont, {
      title: "\u590D\u4F4D",
      onClick: () => setScale(1, true),
      type: 'lm-player-ZoomDefault_Main'
    })), /*#__PURE__*/React__default.createElement(Bar, null, /*#__PURE__*/React__default.createElement(IconFont, {
      title: "\u653E\u5927",
      onClick: () => setScale(0.2),
      type: 'lm-player-ZoomIn_Main'
    }))), snapshot && /*#__PURE__*/React__default.createElement(Bar, null, /*#__PURE__*/React__default.createElement(IconFont, {
      title: "\u622A\u56FE",
      onClick: () => snapshot(api.snapshot()),
      type: "lm-player-SearchBox"
    })), isLive && isSwithRate && /*#__PURE__*/React__default.createElement(Bar, {
      className: 'ratioMenu'
    }, /*#__PURE__*/React__default.createElement("span", {
      class: "ratioMenu-main"
    }, viewText), /*#__PURE__*/React__default.createElement("ul", {
      class: "ratioMenu-level"
    }, Object.keys(ratioValue).map(item => /*#__PURE__*/React__default.createElement("li", {
      class: "ratioMenu-level-1",
      onClick: () => setRatio(item)
    }, ratioValue[item].name)))), /*#__PURE__*/React__default.createElement(Bar, null, /*#__PURE__*/React__default.createElement(IconFont, {
      title: isfull ? '窗口' : '全屏',
      onClick: fullscreen,
      type: isfull ? 'lm-player-ExitFull_Main' : 'lm-player-Full_Main'
    })), rightExtContents);
  }

  RightBar.propTypes = {
    api: PropTypes.object,
    event: PropTypes.object,
    playerProps: PropTypes.object,
    playContainer: PropTypes.node,
    reloadHistory: PropTypes.func,
    isHistory: PropTypes.bool
  };

  function ScaleBar({
    playContainer,
    api,
    scale
  }) {
    const setScale = React.useCallback((...args) => {
      const dragDom = playContainer.querySelector('.player-mask-layout');
      api.setScale(...args);
      let position = computedBound(dragDom, api.getPosition(), api.getScale());

      if (position) {
        api.setPosition(position, true);
      }
    }, [api, playContainer]);
    return /*#__PURE__*/React__default.createElement("div", {
      className: "contraller-scale-bar"
    }, scale && /*#__PURE__*/React__default.createElement(React__default.Fragment, null, /*#__PURE__*/React__default.createElement(Bar, null, /*#__PURE__*/React__default.createElement(IconFont, {
      title: "\u7F29\u5C0F",
      onClick: () => setScale(-0.2),
      type: 'lm-player-ZoomOut_Main'
    })), /*#__PURE__*/React__default.createElement(Bar, null, /*#__PURE__*/React__default.createElement(IconFont, {
      title: "\u590D\u4F4D",
      onClick: () => setScale(1, true),
      type: 'lm-player-ZoomDefault_Main'
    })), /*#__PURE__*/React__default.createElement(Bar, null, /*#__PURE__*/React__default.createElement(IconFont, {
      title: "\u653E\u5927",
      onClick: () => setScale(0.2),
      type: 'lm-player-ZoomIn_Main'
    }))));
  }

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
    leftMidExtContents,
    isPlus
  }) {
    return /*#__PURE__*/React__default.createElement(React__default.Fragment, null, /*#__PURE__*/React__default.createElement("div", {
      className: `contraller-bar-layout ${!visibel ? 'hide-contraller-bar' : ''}`
    }, /*#__PURE__*/React__default.createElement(LeftBar, {
      api: api,
      event: event,
      video: video,
      isHistory: isHistory,
      reloadHistory: reloadHistory,
      isLive: isLive,
      leftMidExtContents: leftMidExtContents,
      leftExtContents: leftExtContents,
      isPlus: isPlus
    }), /*#__PURE__*/React__default.createElement(RightBar, {
      api: api,
      event: event,
      isLive: isLive,
      playContainer: playContainer,
      snapshot: snapshot,
      rightExtContents: rightExtContents,
      rightMidExtContents: rightMidExtContents
    })), /*#__PURE__*/React__default.createElement("div", {
      className: `contraller-scale-layout ${!visibel ? 'hide-contraller-bar' : ''}`
    }, /*#__PURE__*/React__default.createElement(ScaleBar, {
      api: api,
      playContainer: playContainer,
      scale: scale
    })));
  }

  ContrallerBar.propTypes = {
    visibel: PropTypes.bool
  };

  function ContrallerEvent({
    event,
    playContainer,
    children
  }) {
    const timer = React.useRef(null);
    const [visibel, setVisibel] = React.useState(true);
    React.useEffect(() => {
      const showContraller = () => {
        setVisibel(true);
        hideContraller();
        event.emit(EventName.SHOW_CONTRALLER);
      };

      const hideContraller = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          setVisibel(false);
          event.emit(EventName.HIDE_CONTRALLER);
        }, 3 * 1000);
      };

      playContainer.addEventListener('mousemove', showContraller, false);
      playContainer.addEventListener('mouseout', hideContraller, false);
      return () => {
        playContainer.removeEventListener('mousemove', showContraller, false);
        playContainer.removeEventListener('mouseout', hideContraller, false);
      };
    }, []);
    return React__default.Children.map(children, child => /*#__PURE__*/React__default.isValidElement(child) ? /*#__PURE__*/React__default.cloneElement(child, {
      visibel
    }) : child);
  }

  function VideoMessage({
    event,
    api
  }) {
    const [state, setState] = React.useState({
      status: null,
      errorTimer: null,
      loading: false
    });
    const message = React.useMemo(() => {
      if (!state.status) {
        return '';
      }

      if (state.status === 'fail') {
        return '视频错误';
      }

      if (state.status === 'reload') {
        return `视频加载错误，正在进行重连第${state.errorTimer}次重连`;
      }
    }, [state.errorTimer, state.status]);
    React.useEffect(() => {
      const openLoading = () => setState(old => ({ ...old,
        loading: true
      }));

      const closeLoading = () => setState(old => ({ ...old,
        loading: false
      }));

      const errorReload = timer => setState(() => ({
        status: 'reload',
        errorTimer: timer,
        loading: true
      }));

      const reloadFail = () => setState(old => ({ ...old,
        status: 'fail'
      }));

      const reloadSuccess = () => setState(old => ({ ...old,
        status: null
      }));

      const reload = () => setState(old => ({ ...old,
        status: 'reload'
      }));

      const playEnd = () => (setState(old => ({ ...old,
        status: null,
        loading: false
      })), api.pause());

      event.addEventListener('loadstart', openLoading);
      event.addEventListener('waiting', openLoading);
      event.addEventListener('seeking', openLoading);
      event.addEventListener('loadeddata', closeLoading);
      event.addEventListener('canplay', closeLoading);
      event.on(EventName.ERROR_RELOAD, errorReload);
      event.on(EventName.RELOAD_FAIL, reloadFail);
      event.on(EventName.RELOAD_SUCCESS, reloadSuccess);
      event.on(EventName.RELOAD, reload);
      event.on(EventName.HISTORY_PLAY_END, playEnd);
      event.on(EventName.CLEAR_ERROR_TIMER, reloadSuccess);
    }, [event]);
    const {
      loading,
      status
    } = state;
    return /*#__PURE__*/React__default.createElement("div", {
      className: `lm-player-message-mask ${loading || status === 'fail' ? 'lm-player-mask-loading-animation' : ''}`
    }, /*#__PURE__*/React__default.createElement(IconFont, {
      type: status === 'fail' ? 'lm-player-YesorNo_No_Dark' : 'lm-player-Loading',
      className: `${loading && status !== 'fail' ? 'lm-player-loading-animation' : status === 'fail' ? 'lm-player-loadfail' : ''} lm-player-loading-icon`
    }), /*#__PURE__*/React__default.createElement("span", {
      className: "lm-player-message"
    }, message));
  }

  const YUVMessage = ({
    api,
    playerState
  }) => {
    const [state, setState] = React.useState({
      status: null,
      msg: '',
      errorTimer: null,
      loading: false
    });
    const [messageTips, setMessageTips] = React.useState('');
    const message = React.useMemo(() => {
      if (!state.status) {
        return '';
      }

      if (state.status === 'fail') {
        return '视频错误';
      }

      if (state.status === 'reload') {
        return `视频加载错误，正在进行重连第${state.errorTimer}次重连`;
      }

      if (state.status === 'connet') {
        return `连接失败，请安装播放软件！`;
      }
    }, [state.errorTimer, state.status]);
    React.useEffect(() => {
      setMessageTips('');
      api.setPlayerIng(false);

      if (playerState.code == 70004) {
        // 关闭
        setState({
          status: null,
          errorTimer: null,
          loading: false
        });
      }

      if (playerState.code == 1000) {
        // 重新连接
        setState({
          status: 'connet',
          errorTimer: null,
          loading: false
        });
      } // 默认状态-开始loading...


      if (playerState.code == 70000) {
        setState({
          status: null,
          errorTimer: null,
          loading: true
        });
      }

      if (playerState.code == 70001) {
        api.setPlayerIng(true); // 开始播放--消除loading...

        setState({
          status: null,
          errorTimer: null,
          loading: false
        });
      } // 业务状态.....
      // 视频流播放异常-进行重装


      if (playerState.code == 70002) {
        setState({
          status: 'reload',
          errorTimer: playerState.errorTimer,
          loading: false
        });
      } // 视频流播放异常-显示


      if (playerState.code > 710000) {
        setMessageTips('错误信息: ' + playerState.msg);
        setState({
          status: 'fail',
          errorTimer: null,
          loading: false
        });
      }
    }, [playerState]);
    const {
      loading,
      status
    } = state;
    const playerDownloadUrl = window.BSConfig && window.BSConfig.playerDownloadUrl;
    return /*#__PURE__*/React__default.createElement("div", {
      className: `lm-player-message-mask ${loading || status === 'fail' || status === 'connet' || status === 'reload' ? 'lm-player-mask-loading-animation' : ''} ${status === 'connet' ? 'lm-player-puls-event' : ''}`
    }, /*#__PURE__*/React__default.createElement(IconFont, {
      type: status === 'fail' ? 'lm-player-YesorNo_No_Dark' : 'lm-player-Loading',
      className: `${loading && status !== 'fail' ? 'lm-player-loading-animation' : status === 'fail' ? 'lm-player-loadfail' : ''} lm-player-loading-icon`
    }), status === 'connet' ? /*#__PURE__*/React__default.createElement(IconFont, {
      type: 'lm-player-YesorNo_No_Dark',
      className: `lm-player-loadfail lm-player-loading-icon`
    }) : null, status === 'reload' ? /*#__PURE__*/React__default.createElement(IconFont, {
      type: 'lm-player-Loading',
      className: `lm-player-loading-animation lm-player-loading-icon`
    }) : null, /*#__PURE__*/React__default.createElement("span", {
      className: "lm-player-message"
    }, message), /*#__PURE__*/React__default.createElement("span", {
      style: {
        fontSize: 12,
        color: '#666'
      }
    }, messageTips), status === 'connet' ? /*#__PURE__*/React__default.createElement("a", {
      className: "lm-player-plus",
      target: "_blank",
      href: playerDownloadUrl,
      style: {
        pointerEvents: 'all'
      },
      download: "ZVPlayer.exe",
      rel: "noopener noreferrer"
    }, "\u4E0B\u8F7D") : null);
  };
  const NoSource = () => {
    return /*#__PURE__*/React__default.createElement("div", {
      className: "lm-player-message-mask lm-player-mask-loading-animation"
    }, /*#__PURE__*/React__default.createElement(IconFont, {
      style: {
        fontSize: 80
      },
      type: "lm-player-PlaySource",
      title: "\u8BF7\u9009\u62E9\u89C6\u9891\u6E90"
    }));
  };

  /**
   * 播放时间转字符串
   * @param {*} second_time
   */

  function timeStamp(second_time) {
    let time = Math.ceil(second_time);

    if (time > 60) {
      let second = Math.ceil(second_time % 60);
      let min = Math.floor(second_time / 60);
      time = `${min < 10 ? `0${min}` : min}:${second < 10 ? `0${second}` : second}`;

      if (min > 60) {
        min = Math.ceil(second_time / 60 % 60);
        let hour = Math.floor(second_time / 60 / 60);
        time = `${hour < 10 ? `0${hour}` : hour}:${min < 10 ? `0${min}` : min}:${second < 10 ? `0${second}` : second}`;
      } else {
        time = `00:${time}`;
      }
    } else {
      time = `00:00:${time < 10 ? `0${time}` : time}`;
    }

    return time;
  }
  /**
   * 全屏
   * @param {*} element
   */

  function fullscreen$1(element) {
    if (element.requestFullScreen) {
      element.requestFullScreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
  /**
   * exitFullscreen 退出全屏
   * @param  {Objct} element 选择器
   */

  function exitFullscreen$1() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
  /**
   * [isFullscreen 判断浏览器是否全屏]
   * @return [全屏则返回当前调用全屏的元素,不全屏返回false]
   */

  function isFullscreen$1(ele) {
    if (!ele) {
      return false;
    }

    return document.fullscreenElement === ele || document.msFullscreenElement === ele || document.mozFullScreenElement === ele || document.webkitFullscreenElement === ele || false;
  } // 添加 / 移除 全屏事件监听

  function TineLine({
    event,
    api,
    visibel
  }) {
    const [state, setState] = React.useState({
      duration: 0,
      currentTime: 0,
      buffered: 0
    });
    React.useEffect(() => {
      const getDuration = () => setState(old => ({ ...old,
        duration: api.getDuration()
      }));

      const getCurrentTime = () => setState(old => ({ ...old,
        currentTime: api.getCurrentTime(),
        buffered: api.getSecondsLoaded()
      }));

      const getBuffered = () => setState(old => ({ ...old,
        buffered: api.getSecondsLoaded()
      }));

      const seekendPlay = () => api.play();

      event.addEventListener('loadedmetadata', getDuration);
      event.addEventListener('durationchange', getDuration);
      event.addEventListener('timeupdate', getCurrentTime);
      event.addEventListener('progress', getBuffered);
      event.addEventListener('suspend', getBuffered);
      event.addEventListener('seeked', seekendPlay); // return () => {
      //   event.removeEventListener('loadedmetadata', getDuration)
      //   event.removeEventListener('durationchange', getDuration)
      //   event.removeEventListener('timeupdate', getCurrentTime)
      //   event.removeEventListener('progress', getBuffered)
      //   event.removeEventListener('suspend', getBuffered)
      //   event.removeEventListener('seeked', seekendPlay)
      // }
    }, [event, api]);
    const {
      duration,
      currentTime,
      buffered
    } = state;
    const playPercent = React.useMemo(() => Math.round(currentTime / duration * 100), [currentTime, duration]);
    const bufferedPercent = React.useMemo(() => Math.round(buffered / duration * 100), [buffered, duration]);
    const changePlayTime = React.useCallback(percent => {
      const currentTime = percent * duration;
      api.pause();
      api.seekTo(currentTime);
      setState(old => ({ ...old,
        currentTime
      }));
    }, [duration, api]);

    const renderTimeLineTips = percent => {
      const currentTime = percent * duration;
      const time = timeStamp(currentTime);
      return /*#__PURE__*/React__default.createElement("span", null, time);
    };

    return /*#__PURE__*/React__default.createElement("div", {
      className: `video-time-line-layout ${!visibel ? 'hide-time-line' : ''}`
    }, /*#__PURE__*/React__default.createElement(IconFont, {
      type: "lm-player-PrevFast",
      onClick: () => api.backWind(),
      className: "time-line-action-item"
    }), /*#__PURE__*/React__default.createElement(Slider, {
      className: "time-line-box",
      currentPercent: playPercent,
      availablePercent: bufferedPercent,
      onChange: changePlayTime,
      renderTips: renderTimeLineTips
    }), /*#__PURE__*/React__default.createElement(IconFont, {
      type: "lm-player-NextFast_Light",
      onClick: () => api.fastForward(),
      className: "time-line-action-item"
    }));
  }

  function ErrorEvent({
    event,
    api,
    errorReloadTimer,
    flv,
    hls,
    changePlayIndex,
    isHistory,
    playIndex
  }) {
    const [errorTimer, setErrorTime] = React.useState(0);
    const errorInfo = React.useRef(null);
    const reloadTimer = React.useRef(null);
    React.useEffect(() => {
      const errorHandle = (...args) => {
        if (args[2] && args[2].msg && args[2].msg.includes("Unsupported audio")) {
          return;
        }

        console.error(...args);

        if (args[1] && args[1].details && (args[1].details.includes("bufferStalledError") || args[1].details.includes("bufferNudgeOnStall") || args[1].details.includes("bufferSeekOverHole") || args[1].details.includes("bufferAddCodecError"))) {
          return;
        }

        errorInfo.current = args;
        setErrorTime(errorTimer + 1);
      };

      const reloadSuccess = () => {
        if (errorTimer > 0) {
          console.warn('视频重连成功！');
          event.emit(EventName.RELOAD_SUCCESS);
          api.restPlayRate();
          clearErrorTimer();
        }
      };

      const clearErrorTimer = () => setErrorTime(0);

      if (flv) {
        flv.on('error', errorHandle);
      }

      if (hls) {
        hls.on('hlsError', errorHandle);
      }

      if (isHistory) {
        //历史视频切换播放索引时清除错误次数
        event.on(EventName.CHANGE_PLAY_INDEX, clearErrorTimer); //历史视频主动清除错误次数

        event.on(EventName.CLEAR_ERROR_TIMER, clearErrorTimer);
      }

      event.addEventListener('error', errorHandle, false); //获取video状态清除错误状态

      event.addEventListener('canplay', reloadSuccess, false);
      return () => {
        try {
          if (flv) {
            flv.off('error', errorHandle);
          }

          if (hls) {
            hls.off('hlsError', errorHandle);
          }
        } catch (e) {
          console.warn(e);
        }

        if (isHistory) {
          event.off(EventName.CHANGE_PLAY_INDEX, clearErrorTimer);
          event.off(EventName.CLEAR_ERROR_TIMER, clearErrorTimer);
        }

        event.removeEventListener('error', errorHandle, false);
        event.removeEventListener('canplay', reloadSuccess, false);
      };
    }, [event, flv, hls, errorTimer]);
    React.useEffect(() => {
      if (errorTimer === 0) {
        return;
      }

      if (errorTimer > errorReloadTimer) {
        isHistory ? changePlayIndex(playIndex + 1) : event.emit(EventName.RELOAD_FAIL);
        api.unload();
        return;
      }

      console.warn(`视频播放出错，正在进行重连${errorTimer}`);
      reloadTimer.current = setTimeout(() => {
        event.emit(EventName.ERROR_RELOAD, errorTimer, ...errorInfo.current);
        api.reload(true);
      }, 2 * 1000);
      return () => {
        clearTimeout(reloadTimer.current);
      };
    }, [errorTimer, api, event, flv, hls]);
    return /*#__PURE__*/React__default.createElement(React__default.Fragment, null);
  }

  /**
   * 计算视频拖拽边界
   * @param {*} ele
   * @param {*} currentPosition
   * @param {*} scale
   */
  function computedBound$1(ele, currentPosition, scale) {
    const data = currentPosition;
    const eleRect = ele.getBoundingClientRect();
    const w = eleRect.width;
    const h = eleRect.height;
    let lx = 0,
        ly = 0;

    if (scale === 1) {
      return [0, 0];
    }

    lx = w * (scale - 1) / 2 / scale;
    ly = h * (scale - 1) / 2 / scale;
    let x = 0,
        y = 0;

    if (data[0] >= 0 && data[0] > lx) {
      x = lx;
    }

    if (data[0] >= 0 && data[0] < lx) {
      x = data[0];
    }

    if (data[0] < 0 && data[0] < -lx) {
      x = -lx;
    }

    if (data[0] < 0 && data[0] > -lx) {
      x = data[0];
    }

    if (data[1] >= 0 && data[1] > ly) {
      y = ly;
    }

    if (data[1] >= 0 && data[1] < ly) {
      y = data[1];
    }

    if (data[1] < 0 && data[1] < -ly) {
      y = -ly;
    }

    if (data[1] < 0 && data[1] > -ly) {
      y = data[1];
    }

    if (x !== data[0] || y !== data[1]) {
      return [x, y];
    } else {
      return;
    }
  }

  class DragEvent extends React__default.Component {
    constructor(props) {
      super(props);

      this.openDrag = e => {
        this.position.start = [e.pageX, e.pageY];
        this.dragDom.addEventListener('mousemove', this.moveChange);
        document.body.addEventListener('mouseup', this.stopDrag);
      };

      this.moveChange = e => {
        const {
          api
        } = this.props;
        const currentPosition = api.getPosition();
        this.position.end = [e.pageX, e.pageY];
        const x = currentPosition[0] + (this.position.end[0] - this.position.start[0]);
        const y = currentPosition[1] + (this.position.end[1] - this.position.start[1]);
        const position = [x, y];
        api.setPosition(position);
        this.position.start = [e.pageX, e.pageY];
      };

      this.stopDrag = () => {
        this.dragDom.removeEventListener('mousemove', this.moveChange);
        document.body.removeEventListener('mouseup', this.stopDrag);
        this.transformChange();
      };

      this.transformChange = () => {
        const {
          api
        } = this.props;
        let position = computedBound$1(this.dragDom, api.getPosition(), api.getScale());
        position && api.setPosition(position, true);
      };

      const {
        playContainer
      } = props;
      this.dragDom = playContainer.querySelector('.player-mask-layout');
      this.position = {
        start: [0, 0],
        end: [0, 0]
      };
    }

    componentDidMount() {
      this.dragDom.addEventListener('mousedown', this.openDrag);
      this.props.event.addEventListener('transform', this.transformChange, true);
    }

    componentWillUnmount() {
      this.dragDom.removeEventListener('mousedown', this.openDrag);
    }

    render() {
      return null;
    }

  }

  DragEvent.propTypes = {
    api: PropTypes.object,
    event: PropTypes.object,
    playContainer: PropTypes.node,
    playerProps: PropTypes.object
  };

  class YUVApi {
    constructor({
      player,
      playContainer,
      event,
      flv,
      hls
    }) {
      this.currentCanvas = player;
      this.player = player && player.getDom();
      this.playContainer = playContainer;
      this.flv = flv;
      this.hls = hls;
      this.event = event;
      this.scale = 1;
      this.playbackRate = 1;
      this.position = [0, 0];
    }
    /**
     * 播放器销毁后 动态跟新api下的flv，hls对象
     * @param {*} param0
     */


    updateChunk({
      flv,
      hls
    }) {
      this.flv = flv;
      this.hls = hls;
    }
    /**
     * 全屏
     */


    requestFullScreen() {
      if (!isFullscreen(this.playContainer)) {
        fullscreen(this.playContainer);
      }
    }
    /**
     * 退出全屏
     */


    cancelFullScreen() {
      if (isFullscreen(this.playContainer)) {
        exitFullscreen();
      }
    }

    play() {
      if (this.player.paused) {
        this.player.play();
      }
    }

    pause() {
      if (!this.player.paused) {
        this.player.pause();
      }
    }

    destroy() {
      this.player.removeAttribute('src');
      this.unload();

      if (this.flv) {
        this.flv.destroy();
      }

      if (this.hls) {
        this.hls.destroy();
      }
    }
    /**
     * 设置currentTime实现seek
     * @param {*} seconds
     * @param {*} noEmit
     */


    seekTo(seconds, noEmit) {
      const buffered = this.getBufferedTime();

      if (this.flv && buffered[0] > seconds) {
        this.flv.unload();
        this.flv.load();
      } // this.player.currentTime = seconds


      if (!noEmit) {
        this.event.emit(EventName.SEEK, seconds);
      }
    }
    /**
     * 视频重载
     */


    reload(notEmit) {
      this.currentCanvas && this.currentCanvas.closeWebSocket();
      this.currentCanvas && this.currentCanvas.openPlayer();
    }

    unload() {
      this.currentCanvas && this.currentCanvas.closeWebSocket();
    }

    load() {
      this.currentCanvas && this.currentCanvas.openPlayer();
    }

    setVolume(fraction) {
      this.player.volume = fraction;
    }

    mute() {// this.player.muted = true
    }

    unmute() {// this.player.muted = false
    }

    setVolume(fraction) {
      this.player.volume = fraction;
    }

    exeRatioCommand(RATIO) {
      this.currentCanvas && this.currentCanvas.sendRatioCommand(RATIO);
    }
    /**
     * 开启画中画功能
     */


    requestPictureInPicture() {
      if (this.player.requestPictureInPicture && document.pictureInPictureElement !== this.player) {
        this.player.requestPictureInPicture();
      }
    }
    /**
     * 关闭画中画功能
     */


    exitPictureInPicture() {
      if (document.exitPictureInPicture && document.pictureInPictureElement === this.player) {
        document.exitPictureInPicture();
      }
    }
    /**
     * 设置播放速率
     * @param {*} rate
     */


    setPlaybackRate(rate) {
      this.playbackRate = rate;
      this.player.playbackRate = rate;
    }

    restPlayRate() {
      console.info(this.playbackRate);
      this.player.playbackRate = this.playbackRate;
    }
    /**
     * 获取视频总时长
     */


    getDuration() {
      if (!this.player) return null;
      const {
        duration,
        seekable
      } = this.player;

      if (duration === Infinity && seekable.length > 0) {
        return seekable.end(seekable.length - 1);
      }

      return duration;
    }

    setPlayerIng(status) {
      if (status) {
        this.player.currentTime = 1;
      } else {
        this.player.currentTime = 0;
      }

      return this.player.playering = status;
    }
    /**
     * 获取当前播放时间
     */


    getCurrentTime() {
      if (!this.player) return null;
      return this.player.currentTime;
    }
    /**
     * 获取缓存时间
     */


    getSecondsLoaded() {
      return this.getBufferedTime()[1];
    }
    /**
     * 获取当前视频缓存的起止时间
     */


    getBufferedTime() {
      if (!this.player) return null;
      const {
        buffered
      } = this.player;

      if (!buffered || buffered.length === 0) {
        return [0, 0];
      }

      const end = buffered.end(buffered.length - 1);
      const start = buffered.start(buffered.length - 1);
      const duration = this.getDuration();

      if (end > duration) {
        return duration;
      }

      return [start, end];
    }
    /**
     * 快进通过seekTo方法实现
     * @param {*} second
     */


    fastForward(second = 5) {
      const duration = this.getDuration();
      const currentTime = this.getCurrentTime();
      const time = currentTime + second;
      this.seekTo(time > duration - 1 ? duration - 1 : time);
    }
    /**
     * 快退通过seekTo方法实现
     * @param {*} second
     */


    backWind(second = 5) {
      const currentTime = this.getCurrentTime();
      const time = currentTime - second;
      this.seekTo(time < 1 ? 1 : time);
    }
    /**
     * 视频截屏方法
     */


    snapshot() {
      return this.player.toDataURL();
    }

    setScale(num, isRest = false) {
      let scale = this.scale + num;

      if (isRest) {
        scale = num;
      } else {
        if (scale < 1) {
          scale = 1;
        }

        if (scale > 3) {
          scale = 3;
        }
      }

      this.scale = scale;
      this.player.style.transition = 'transform 0.3s';

      this.__setTransform();

      this.event.emit(EventName.TRANSFORM);
      setTimeout(() => {
        this.player.style.transition = 'unset';
      }, 1000);
    }

    getScale() {
      return this.scale;
    }

    setPosition(position, isAnimate) {
      this.position = position;
      this.player.style.transition = isAnimate ? 'transform 0.3s' : 'unset';

      this.__setTransform();
    }

    getPosition() {
      return this.position;
    }

    __setTransform() {
      this.player && (this.player.style.transform = `scale(${this.scale}) translate(${this.position[0]}px,${this.position[1]}px)`);
    }

    getApi() {
      return {
        play: this.play.bind(this),
        reload: this.reload.bind(this),
        pause: this.pause.bind(this),
        seekTo: this.seekTo.bind(this),
        setVolume: this.setVolume.bind(this),
        mute: this.mute.bind(this),
        unmute: this.unmute.bind(this),
        requestPictureInPicture: this.requestPictureInPicture.bind(this),
        exitPictureInPicture: this.exitPictureInPicture.bind(this),
        restPlayRate: this.restPlayRate.bind(this),
        setPlaybackRate: this.setPlaybackRate.bind(this),
        destroy: this.destroy.bind(this),
        getDuration: this.getDuration.bind(this),
        getCurrentTime: this.getCurrentTime.bind(this),
        getSecondsLoaded: this.getSecondsLoaded.bind(this),
        getBufferedTime: this.getBufferedTime.bind(this),
        fastForward: this.fastForward.bind(this),
        backWind: this.backWind.bind(this),
        snapshot: this.snapshot.bind(this),
        requestFullScreen: this.requestFullScreen.bind(this),
        cancelFullScreen: this.cancelFullScreen.bind(this),
        __player: this.player,
        flv: this.flv,
        hls: this.hls
      };
    }

  }

  function getHiddenProp() {
    const prefixes = ["webkit", "moz", "ms", "o"]; // 如果hidden 属性是原生支持的，我们就直接返回

    if ("hidden" in document) {
      return "hidden";
    } // 其他的情况就循环现有的浏览器前缀，拼接我们所需要的属性


    for (let i = 0; i < prefixes.length; i++) {
      // 如果当前的拼接的前缀在 document对象中存在 返回即可
      if (prefixes[i] + "Hidden" in document) {
        return prefixes[i] + "Hidden";
      }
    } // 其他的情况 直接返回null


    return null;
  }

  function getVisibilityState() {
    const prefixes = ["webkit", "moz", "ms", "o"];

    if ("visibilityState" in document) {
      return "visibilityState";
    }

    for (let i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + "VisibilityState" in document) {
        return prefixes[i] + "VisibilityState";
      }
    } // 找不到返回 null


    return null;
  }

  function visibilityState() {
    return document[getVisibilityState()];
  }

  function addEventListener(listener) {
    const visProp = getHiddenProp();
    const evtname = visProp.replace(/[H|h]idden/, "") + "visibilitychange";
    document.addEventListener(evtname, listener, false);
  }

  function removeEventListener(listener) {
    const visProp = getHiddenProp();
    const evtname = visProp.replace(/[H|h]idden/, "") + "visibilitychange";
    document.removeEventListener(evtname, listener, false);
  }

  var BrowserTab = {
    addEventListener,
    removeEventListener,
    visibilityState
  };

  function LiveHeart({
    api
  }) {
    React.useEffect(() => {
      const browserTabChange = function () {
        if (BrowserTab.visibilityState() === 'visible') {
          const current = api.getCurrentTime();
          const buffered = api.getSecondsLoaded();

          if (buffered - current > 5) {
            console.warn(`当前延时过大current->${current} buffered->${buffered}, 基于视频当前缓存时间更新当前播放时间 updateTime -> ${buffered - 2}`);
            api.seekTo(buffered - 2 > 0 ? buffered - 2 : 0);
          }
        }
      };

      BrowserTab.addEventListener(browserTabChange);
      return () => {
        BrowserTab.removeEventListener(browserTabChange);
      };
    }, [api]);
    return /*#__PURE__*/React__default.createElement(React__default.Fragment, null);
  }

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

  class WebGLPlayer {
    constructor(canvas, parent, options) {
      this.canvas = canvas;
      this.gl = canvas.getContext('webgl', {
        preserveDrawingBuffer: true
      }) || canvas.getContext('experimental-webgl', {
        preserveDrawingBuffer: true
      });

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
          uniform float px;
          uniform float py;
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
      let uOffset = width * height; // 四分之一的长乘宽 获取U

      let vOffset = (width >> 1) * (height >> 1);
      gl.bindTexture(gl.TEXTURE_2D, gl.y); // 填充Y纹理,Y 的宽度和高度就是 width，和 height，存储的位置就是data.subarray(0, width * height)

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data.subarray(0, uOffset));
      gl.bindTexture(gl.TEXTURE_2D, gl.u); // 填充U纹理,Y 的宽度和高度就是 width/2 和 height/2，存储的位置就是data.subarray(width * height, width/2 * height/2 + width * height)

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width >> 1, height >> 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data.subarray(uOffset, uOffset + vOffset));
      gl.bindTexture(gl.TEXTURE_2D, gl.v); // 填充U纹理,Y 的宽度和高度就是 width/2 和 height/2，存储的位置就是data.subarray(width/2 * height/2 + width * height, data.length)

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
      this.canvas.style = 'width:100%;height:100%';

      this.canvas.oncontextmenu = function () {
        return false;
      };
    }

    destroyfunction() {
      const {
        gl
      } = this; // 颜色缓冲区（COLOR_BUFFER_BIT） | 深度缓冲区（DEPTH_BUFFER_BIT） | 模板缓冲区（STENCIL_BUFFER_BIT）

      try {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
      } catch (err) {
        console.error(err);
      }
    }

  }

  class YUVPlayer extends React__default.Component {
    constructor(props) {
      super(props);
      this.currentCanvas = /*#__PURE__*/React__default.createRef();
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
      this.setPlayerState({
        code: 70000,
        msg: ''
      });
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
        this.sendRatioCommand(this.RATIO);
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
        this.setPlayerState({
          code: 70004,
          msg: ''
        });
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
      console.error(e, info); // 判断socket是否连接

      if (info && info.code == 1000) {
        this.setPlayerState(info);
        return;
      }

      this.errorTimer = this.errorTimer + 1; // 开始loading...

      const that = this;

      if (this.errorTimer < errorReloadTimer + 1) {
        this.setPlayerState({
          code: 70002,
          msg: '',
          errorTimer: this.errorTimer
        });
        this.reloadTimer = setTimeout(() => {
          console.warn(`视频播放出错，正在进行重连第${that.errorTimer}次重连`);

          that._createScoket();
        }, 2 * 1000);
      } else {
        // 显示出错-停止重新拉起加载
        this.setPlayerState(e);
      }
    }

    _onCommand(data) {
      let bufferData = new Uint8Array(data);
      let ratioWidth = this.getRatioNumber(bufferData, [0, 2]);
      let ratioHeight = this.getRatioNumber(bufferData, [2, 4]);
      let that = this;

      try {
        that.loadYuv(ratioWidth, ratioHeight, data);
      } catch (e) {
        console.error(e);
      }
    }

    loadYuv(ratioWidth, ratioHeight, data) {
      this.player.renderFrame(ratioWidth, ratioHeight, new Uint8Array(data, 4));
    } // 获取视频流-前四个字节-分辨率


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
      this.player.setSizefunction(rateArr[0], rateArr[1], 1920); // 开始播放,清除loading

      this.setPlayerState({
        code: 70001,
        msg: ''
      });
      this.errorTimer = 0;
      clearTimeout(this.reloadTimer);
    }

    _createScoket() {
      const _SOCKET_URL = this.SOCKET_URL;

      const _STREAM_URL = this.STREAM_URL || '';

      const RATE = this.RATIO;
      const tokenId = genuuid();
      let tokenStr = '';
      this.props.onToken(tokenId);

      if (!WebSocketController.isSupported()) {
        return;
      }

      this.closeWebSocket();
      this.websocket = new WebSocketController();
      this.websocket.onComplete = this._onComplete.bind(this);
      this.websocket.onError = this._onError.bind(this);
      this.websocket.onCommand = this._onCommand.bind(this); // 初始化成功后，开始发送拉流地址
      // console.info(tokenId)

      if (tokenId) {
        tokenStr = `, "token":"${tokenId}"`;
      }

      this.websocket.onOpen = function () {
        this.websocket.send(`{"commond":"url","url":"${_STREAM_URL}", "rate":"${RATE}"${tokenStr}}`);
      }.bind(this); // 连接成功后，发送信令，开始视频拉流


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
      return /*#__PURE__*/React__default.createElement("div", {
        class: "yuv-player-comp"
      }, /*#__PURE__*/React__default.createElement("div", {
        class: "row player-container"
      }, /*#__PURE__*/React__default.createElement("canvas", {
        class: "player-canvas-render",
        ref: "currentCanvas"
      })));
    }

  }

  function SinglePlayer({
    type,
    file,
    className,
    autoPlay,
    muted,
    poster,
    playsinline,
    loop,
    preload,
    children,
    onInitPlayer,
    screenNum,
    config,
    onVideoFn,
    ...props
  }) {
    const playContainerRef = React.useRef(null);
    const YUVRef = React.useRef(null);
    const [playerObj, setPlayerObj] = React.useState(null);
    const [playerState, setPlayerState] = React.useState({
      code: 70000,
      msg: ''
    });
    const rate = React.useMemo(() => getScreenRate(screenNum), [screenNum]); // 播放运行模式
    // 0：不用插件
    // 1：h264不用插件，其它用插件
    // 2：全用插件
    // 是否解密

    const VD_RUN_DEC = getGlobalCache(GL_CACHE.DM);
    const [yuvUrl, setYuvUrl] = React.useState(null);

    function onToken(token) {
      if (onVideoFn) {
        onVideoFn({
          uuid: token
        });
      }
    }

    function loadPlusPlayer(playerObject) {
      console.info('进入插件播放模式==>');
      playerObject.event = new VideoEventInstance(YUVRef.current.getDom());
      playerObject.player = YUVRef.current;
      playerObject.api = new YUVApi(playerObject);
      setPlayerObj(playerObject);

      if (onInitPlayer) {
        onInitPlayer(Object.assign({}, playerObject.api.getApi(), playerObject.event.getApi()));
      }
    }

    function onClose() {
      YUVRef.current && YUVRef.current.closeWebSocket();
      playerObj && playerObj.api.setPlayerIng(false);
    }

    function onPlayerState(state) {
      setPlayerState(state);
    }

    React.useEffect(() => () => {
      onClose();
    }, [file]);
    React.useEffect(() => {
      const playerObject = {
        playContainer: playContainerRef.current,
        video: playContainerRef.current.querySelector('video')
      };

      if (file) {
        // 是否解密
        setYuvUrl(file + (VD_RUN_DEC || ''));
      }

      if (!file) {
        setYuvUrl('');
        onClose();
        return;
      } // 全用插件


      loadPlusPlayer(playerObject);
    }, [file]);
    return /*#__PURE__*/React__default.createElement("div", {
      className: `lm-player-container ${className}`,
      ref: playContainerRef
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "player-mask-layout"
    }, /*#__PURE__*/React__default.createElement(YUVPlayer, {
      streamUrl: yuvUrl,
      ratio: rate,
      ref: YUVRef,
      onToken: onToken,
      onPlayerState: onPlayerState,
      errorReloadTimer: props.errorReloadTimer
    })), /*#__PURE__*/React__default.createElement(VideoTools, {
      playerObj: playerObj,
      isLive: props.isLive,
      key: file,
      hideContrallerBar: props.hideContrallerBar,
      errorReloadTimer: props.errorReloadTimer,
      scale: props.scale,
      snapshot: props.snapshot,
      leftExtContents: props.leftExtContents,
      leftMidExtContents: props.leftMidExtContents,
      rightExtContents: props.rightExtContents,
      rightMidExtContents: props.rightMidExtContents,
      draggable: props.draggable,
      isPlus: true,
      playerState: playerState
    }), children);
  }

  function VideoTools({
    playerObj,
    draggable,
    isLive,
    hideContrallerBar,
    scale,
    snapshot,
    leftExtContents,
    leftMidExtContents,
    rightExtContents,
    rightMidExtContents,
    errorReloadTimer,
    playerState
  }) {
    if (!playerObj) {
      return /*#__PURE__*/React__default.createElement(NoSource, null);
    }

    if (playerState.code === 70004) {
      return /*#__PURE__*/React__default.createElement(NoSource, null);
    }

    return /*#__PURE__*/React__default.createElement(React__default.Fragment, null, /*#__PURE__*/React__default.createElement(YUVMessage, {
      api: playerObj.api,
      event: playerObj.event,
      playerState: playerState
    }), draggable && /*#__PURE__*/React__default.createElement(DragEvent, {
      playContainer: playerObj.playContainer,
      api: playerObj.api,
      event: playerObj.event
    }), !hideContrallerBar && /*#__PURE__*/React__default.createElement(ContrallerEvent, {
      event: playerObj.event,
      playContainer: playerObj.playContainer
    }, /*#__PURE__*/React__default.createElement(ContrallerBar, {
      api: playerObj.api,
      event: playerObj.event,
      playContainer: playerObj.playContainer,
      video: playerObj.video,
      snapshot: snapshot,
      rightExtContents: rightExtContents,
      rightMidExtContents: rightMidExtContents,
      scale: scale,
      isHistory: false,
      isLive: isLive,
      leftExtContents: leftExtContents,
      leftMidExtContents: leftMidExtContents,
      isPlus: true
    }), !isLive && /*#__PURE__*/React__default.createElement(TineLine, {
      api: playerObj.api,
      event: playerObj.event
    })), /*#__PURE__*/React__default.createElement(ErrorEvent, {
      flv: playerObj.flv,
      hls: playerObj.hls,
      api: playerObj.api,
      event: playerObj.event,
      errorReloadTimer: errorReloadTimer
    }), isLive && /*#__PURE__*/React__default.createElement(LiveHeart, {
      api: playerObj.api
    }));
  }

  SinglePlayer.propTypes = {
    file: PropTypes.string.isRequired,
    //播放地址 必填
    isLive: PropTypes.bool,
    //是否实时视频
    errorReloadTimer: PropTypes.number,
    //视频错误重连次数
    type: PropTypes.oneOf(['flv', 'hls', 'native']),
    //强制视频流类型
    onInitPlayer: PropTypes.func,
    draggable: PropTypes.bool,
    hideContrallerBar: PropTypes.bool,
    scale: PropTypes.bool,
    muted: PropTypes.string,
    autoPlay: PropTypes.bool,
    playsInline: PropTypes.bool,
    preload: PropTypes.string,
    poster: PropTypes.string,
    loop: PropTypes.bool,
    snapshot: PropTypes.func,
    className: PropTypes.string,
    rightExtContents: PropTypes.element,
    rightMidExtContents: PropTypes.element,
    leftExtContents: PropTypes.element,
    leftMidExtContents: PropTypes.element,
    flvOptions: PropTypes.object,
    flvConfig: PropTypes.object,
    children: PropTypes.element
  };
  SinglePlayer.defaultProps = {
    isLive: true,
    draggable: true,
    scale: true,
    errorReloadTimer: 5,
    muted: 'muted',
    autoPlay: true,
    playsInline: false,
    preload: 'auto',
    loop: false,
    hideContrallerBar: false
  };

  const computedIndexFormTime = (historyList, time) => {
    let index = 0;

    try {
      index = historyList.fragments.findIndex(v => v.end > time);
    } catch (e) {
      console.error('historyList data error', historyList);
    }

    return index;
  };
  const computedTimeAndIndex = (historyList, currentTime) => {
    const index = computedIndexFormTime(historyList, currentTime);
    let seekTime = 0;

    try {
      const fragment = historyList.fragments[index];

      if (!fragment) {
        return [0, 0];
      }

      seekTime = currentTime - fragment.begin - 1;
    } catch (e) {
      console.error('historyList data error', historyList);
    }

    return [index, seekTime];
  };
  /**
   * 创建HLS对象
   * @param {*} video
   * @param {*} file
   */

  function createHlsPlayer(video, file) {
    if (Hls.isSupported()) {
      const player = new Hls({
        liveDurationInfinity: true,
        levelLoadingTimeOut: 15000,
        fragLoadingTimeOut: 25000,
        enableWorker: true
      });
      player.loadSource(file);
      player.attachMedia(video);
      return player;
    }
  }
  /**
   * 创建FLV对象
   * @param {*} video
   * @param {*} options
   */

  function createFlvPlayer(video, options) {
    const {
      flvOptions = {},
      flvConfig = {}
    } = options;

    if (flvjs.isSupported()) {
      const player = flvjs.createPlayer(Object.assign({}, flvOptions, {
        type: 'flv',
        url: options.file
      }), Object.assign({}, flvConfig, {
        enableWorker: true,
        // lazyLoad: false,
        // Indicates how many seconds of data to be kept for lazyLoad.
        // lazyLoadMaxDuration: 0,
        // autoCleanupMaxBackwardDuration: 3,
        // autoCleanupMinBackwardDuration: 2,
        // autoCleanupSourceBuffer: true,
        enableStashBuffer: false,
        stashInitialSize: 128,
        isLive: options.isLive || true
      }));
      player.attachMediaElement(video);
      player.load();
      return player;
    }
  }
  /**
   * 获取播放文件类型
   * @param {*} url
   */

  function getVideoType(url) {
    return url.indexOf('.flv') > -1 ? 'flv' : url.indexOf('.m3u8') > -1 ? 'm3u8' : 'native';
  }
  /**
   * 日期格式化
   * @param {*} timetemp
   */

  function dateFormat(timetemp) {
    const date = new Date(timetemp);
    let YYYY = date.getFullYear();
    let DD = date.getDate();
    let MM = date.getMonth() + 1;
    let hh = date.getHours();
    let mm = date.getMinutes();
    let ss = date.getSeconds();
    return `${YYYY}.${MM > 9 ? MM : '0' + MM}.${DD > 9 ? DD : '0' + DD} ${hh > 9 ? hh : '0' + hh}.${mm > 9 ? mm : '0' + mm}.${ss > 9 ? ss : '0' + ss}`;
  }

  const computedLineList = historyList => {
    const duration = historyList.duration;
    return historyList.fragments.map(v => {
      return {
        disabled: !v.file,
        size: (v.end - v.begin) / duration * 100
      };
    });
  };

  function TineLine$1({
    event,
    api,
    visibel,
    historyList,
    playIndex,
    seekTo,
    defaultTime
  }) {
    const [state, setState] = React.useState({
      duration: 1,
      currentTime: defaultTime,
      buffered: 0,
      isEnd: false
    });
    React.useEffect(() => setState(old => ({ ...old,
      currentTime: defaultTime
    })), [defaultTime]);
    React.useEffect(() => {
      const getDuration = () => setState(old => ({ ...old,
        duration: api.getDuration()
      }));

      const getCurrentTime = () => setState(old => ({ ...old,
        currentTime: api.getCurrentTime(),
        buffered: api.getSecondsLoaded()
      }));

      const getBuffered = () => setState(old => ({ ...old,
        buffered: api.getSecondsLoaded()
      }));

      const historyPlayEnd = () => setState(old => ({ ...old,
        isEnd: true
      }));

      const reload = () => setState(old => ({ ...old,
        isEnd: false,
        currentTime: api.getCurrentTime()
      }));

      const seekendPlay = () => api.play();

      event.addEventListener('loadedmetadata', getDuration);
      event.addEventListener('durationchange', getDuration);
      event.addEventListener('timeupdate', getCurrentTime);
      event.addEventListener('progress', getBuffered);
      event.addEventListener('suspend', getBuffered);
      event.addEventListener('seeked', seekendPlay);
      event.on(EventName.HISTORY_PLAY_END, historyPlayEnd);
      event.on(EventName.RELOAD, reload);
      return () => {
        event.removeEventListener('loadedmetadata', getDuration);
        event.removeEventListener('durationchange', getDuration);
        event.removeEventListener('timeupdate', getCurrentTime);
        event.removeEventListener('progress', getBuffered);
        event.removeEventListener('suspend', getBuffered);
        event.removeEventListener('seeked', seekendPlay);
        event.off(EventName.HISTORY_PLAY_END, historyPlayEnd);
        event.off(EventName.RELOAD, reload);
      };
    }, [event, api]);
    const changePlayTime = React.useCallback(percent => {
      const currentTime = percent * historyList.duration; //修正一下误差

      const [index, time] = computedTimeAndIndex(historyList, currentTime);
      console.log(index, time);
      seekTo(currentTime, index);
      setState(old => ({ ...old,
        currentTime: time,
        isEnd: false
      }));
    }, [historyList]);

    const renderTimeLineTips = percent => {
      const currentTime = percent * historyList.duration * 1000;
      const date = dateFormat(historyList.beginDate + currentTime);
      return /*#__PURE__*/React__default.createElement("span", null, date);
    };

    const {
      currentTime,
      buffered,
      isEnd
    } = state;
    const lineList = React.useMemo(() => computedLineList(historyList), [historyList]);
    const currentLine = React.useMemo(() => lineList.filter((_, i) => i < playIndex).map(v => v.size), [playIndex, lineList]);
    const currentIndexTime = React.useMemo(() => currentLine.length === 0 ? 0 : currentLine.length > 1 ? currentLine.reduce((p, c) => p + c) : currentLine[0], [currentLine]);
    const playPercent = React.useMemo(() => currentTime / historyList.duration * 100 + currentIndexTime, [currentIndexTime, historyList, currentTime]);
    const bufferedPercent = React.useMemo(() => buffered / historyList.duration * 100 + currentIndexTime, [historyList, currentIndexTime, buffered]);
    return /*#__PURE__*/React__default.createElement("div", {
      className: `video-time-line-layout ${!visibel ? 'hide-time-line' : ''}`
    }, /*#__PURE__*/React__default.createElement(IconFont, {
      type: "lm-player-PrevFast",
      onClick: () => api.backWind(),
      className: "time-line-action-item"
    }), /*#__PURE__*/React__default.createElement(Slider, {
      className: "time-line-box",
      currentPercent: isEnd ? '100' : playPercent,
      availablePercent: bufferedPercent,
      onChange: changePlayTime,
      renderTips: renderTimeLineTips
    }, /*#__PURE__*/React__default.createElement(React__default.Fragment, null, lineList.map((v, i) => {
      const currentSizeLine = lineList.filter((v, i2) => i2 < i).map(v => v.size);
      const currentIndexSize = currentSizeLine.length === 0 ? 0 : currentSizeLine.length > 1 ? currentSizeLine.reduce((p, c) => p + c) : currentSizeLine[0];
      return /*#__PURE__*/React__default.createElement("div", {
        className: `history-time-line-item ${v.disabled ? 'history-time-line-disabled' : ''}`,
        key: i,
        style: {
          width: `${v.size}%`,
          left: `${currentIndexSize}%`
        }
      });
    }))), /*#__PURE__*/React__default.createElement(IconFont, {
      type: "lm-player-NextFast_Light",
      onClick: () => api.fastForward(),
      className: "time-line-action-item"
    }));
  }

  TineLine$1.propTypes = {
    event: PropTypes.object,
    api: PropTypes.object,
    changePlayIndex: PropTypes.func,
    playIndex: PropTypes.number,
    historyList: PropTypes.array,
    seekTo: PropTypes.func,
    visibel: PropTypes.bool
  };

  let index = 0;
  class Api {
    constructor({
      video,
      playContainer,
      event,
      flv,
      hls,
      isPlus
    }) {
      this.player = video;
      this.playContainer = playContainer;
      this.flv = flv;
      this.hls = hls;
      this.event = event;
      this.scale = 1;
      this.position = [0, 0];
      this.isPlus = isPlus;
      this.playbackRate = 1;
      this.currPath = null;
    }
    /**
     * 播放器销毁后 动态跟新api下的flv，hls对象
     * @param {*} param
     */


    updateChunk({
      flv,
      hls
    }) {
      this.flv = flv;
      this.hls = hls;
    }
    /**
     * 当前播放的地址
     */


    setPath(file) {
      this.currPath = file;
    }
    /**
     * 获取播放地址
     */


    getFilePath() {
      return this.currPath;
    }
    /**
     * 全屏
     */


    requestFullScreen() {
      if (!isFullscreen$1(this.playContainer)) {
        fullscreen$1(this.playContainer);
      }
    }
    /**
     * 退出全屏
     */


    cancelFullScreen() {
      if (isFullscreen$1(this.playContainer)) {
        exitFullscreen$1();
      }
    }

    play() {
      if (this.player.paused) {
        this.player.play();
      }
    }

    pause() {
      if (!this.player.paused) {
        this.player.pause();
      }
    }

    destroy() {
      this.player.removeAttribute('src');
      this.unload();

      if (this.flv) {
        index++;
        this.flv.destroy();
      }

      if (this.hls) {
        index++;
        this.hls.destroy();
      }

      this.player = null;
      this.playContainer = null;
      this.flv = null;
      this.hls = null;
      this.event = null;
      this.scale = null;
      this.position = null;
      console.warn('destroy', index);
    }
    /**
     * 设置currentTime实现seek
     * @param {*} seconds
     * @param {*} noEmit
     */


    seekTo(seconds, noEmit) {
      const buffered = this.getBufferedTime();

      if (this.flv && buffered[0] > seconds) {
        this.flv.unload();
        this.flv.load();
      }

      console.log(this.player);

      if (this.player) {
        console.log(this.player.currentTime);
        this.player.currentTime = seconds;

        if (!noEmit) {
          this.event.emit(EventName.SEEK, seconds);
        }
      }
    }
    /**
     * 视频重载
     */


    reload(notEmit) {
      if (this.getCurrentTime !== 0) {
        this.seekTo(0);
      }

      if (this.hls) {
        this.hls.swapAudioCodec();
        this.hls.recoverMediaError();
      }

      this.unload();
      this.load();
      !notEmit && this.event.emit(EventName.RELOAD);
    }

    unload() {
      this.flv && this.flv.unload();
      this.hls && this.hls.stopLoad();
    }

    load() {
      if (this.flv) {
        this.flv.load();
      }

      if (this.hls) {
        this.hls.startLoad();
        this.hls.loadSource(this.hls.url);
      }
    }

    setVolume(fraction) {
      this.player.volume = fraction;
    }

    mute() {
      this.player.muted = true;
    }

    unmute() {
      this.player.muted = false;
    }
    /**
     * 开启画中画功能
     */


    requestPictureInPicture() {
      if (this.player.requestPictureInPicture && document.pictureInPictureElement !== this.player) {
        this.player.requestPictureInPicture();
      }
    }
    /**
     * 关闭画中画功能
     */


    exitPictureInPicture() {
      if (document.exitPictureInPicture && document.pictureInPictureElement === this.player) {
        document.exitPictureInPicture();
      }
    }
    /**
     * 设置播放速率
     * @param {*} rate
     */


    setPlaybackRate(rate) {
      this.playbackRate = rate;
      this.player && (this.player.playbackRate = rate);
    }

    restPlayRate() {
      console.info(this.playbackRate);
      this.player.playbackRate = this.playbackRate;
    }
    /**
     * 获取视频总时长
     */


    getDuration() {
      if (!this.player) return null;
      const {
        duration,
        seekable
      } = this.player;

      if (duration === Infinity && seekable.length > 0) {
        return seekable.end(seekable.length - 1);
      }

      return duration;
    }

    getPlayerIng() {
      return this.player.playbackRate;
    }
    /**
     * 获取当前播放时间
     */


    getCurrentTime() {
      if (!this.player) return null;
      return this.player.currentTime;
    }
    /**
     * 获取缓存时间
     */


    getSecondsLoaded() {
      return this.getBufferedTime()[1];
    }
    /**
     * 获取当前视频缓存的起止时间
     */


    getBufferedTime() {
      if (!this.player) return [];
      const {
        buffered
      } = this.player;

      if (buffered.length === 0) {
        return [0, 0];
      }

      const end = buffered.end(buffered.length - 1);
      const start = buffered.start(buffered.length - 1);
      const duration = this.getDuration();

      if (end > duration) {
        return duration;
      }

      return [start, end];
    }
    /**
     * 快进通过seekTo方法实现
     * @param {*} second
     */


    fastForward(second = 5) {
      const duration = this.getDuration();
      const currentTime = this.getCurrentTime();
      const time = currentTime + second;
      this.seekTo(time > duration - 1 ? duration - 1 : time);
    }
    /**
     * 快退通过seekTo方法实现
     * @param {*} second
     */


    backWind(second = 5) {
      const currentTime = this.getCurrentTime();
      const time = currentTime - second;
      this.seekTo(time < 1 ? 1 : time);
    }
    /**
     * 视频截屏方法
     */


    snapshot() {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      canvas.width = this.player.videoWidth;
      canvas.height = this.player.videoHeight;
      ctx.drawImage(this.player, 0, 0, canvas.width, canvas.height);
      setTimeout(() => {
        canvas.remove();
        canvas = null;
        ctx = null;
      }, 200);
      return canvas.toDataURL();
    }

    setScale(num, isRest = false) {
      let scale = this.scale + num;

      if (isRest) {
        scale = num;
      } else {
        if (scale < 1) {
          scale = 1;
        }

        if (scale > 3) {
          scale = 3;
        }
      }

      this.scale = scale;
      this.player.style.transition = 'transform 0.3s';

      this.__setTransform();

      this.event.emit(EventName.TRANSFORM);
      setTimeout(() => {
        this.player.style.transition = 'unset';
      }, 1000);
    }

    getScale() {
      return this.scale;
    }

    setPosition(position, isAnimate) {
      this.position = position;
      this.player.style.transition = isAnimate ? 'transform 0.3s' : 'unset';

      this.__setTransform();
    }

    getPosition() {
      return this.position;
    }

    __setTransform() {
      this.player.style.transform = `scale(${this.scale}) translate(${this.position[0]}px,${this.position[1]}px)`;
    }

    getApi() {
      return {
        play: this.play.bind(this),
        reload: this.reload.bind(this),
        pause: this.pause.bind(this),
        seekTo: this.seekTo.bind(this),
        setVolume: this.setVolume.bind(this),
        mute: this.mute.bind(this),
        unmute: this.unmute.bind(this),
        requestPictureInPicture: this.requestPictureInPicture.bind(this),
        exitPictureInPicture: this.exitPictureInPicture.bind(this),
        restPlayRate: this.restPlayRate.bind(this),
        getPlayerIng: this.getPlayerIng.bind(this),
        setPlaybackRate: this.setPlaybackRate.bind(this),
        getFilePath: this.getFilePath.bind(this),
        destroy: this.destroy.bind(this),
        getDuration: this.getDuration.bind(this),
        getCurrentTime: this.getCurrentTime.bind(this),
        getSecondsLoaded: this.getSecondsLoaded.bind(this),
        getBufferedTime: this.getBufferedTime.bind(this),
        fastForward: this.fastForward.bind(this),
        backWind: this.backWind.bind(this),
        snapshot: this.snapshot.bind(this),
        requestFullScreen: this.requestFullScreen.bind(this),
        cancelFullScreen: this.cancelFullScreen.bind(this),
        __player: this.player,
        flv: this.flv,
        hls: this.hls
      };
    }

  }

  /**
   * history下使用 用户切换下个播放地址
   */

  function PlayEnd({
    event,
    changePlayIndex,
    playIndex
  }) {
    React.useEffect(() => {
      const endedHandle = () => changePlayIndex(playIndex + 1);

      event.addEventListener('ended', endedHandle, false);
      return () => {
        event.removeEventListener('ended', endedHandle, false);
      };
    }, [event, playIndex, changePlayIndex]);
    return /*#__PURE__*/React__default.createElement(React__default.Fragment, null);
  }

  PlayEnd.propTypes = {
    event: PropTypes.object,
    changePlayIndex: PropTypes.func,
    playIndex: PropTypes.number
  };

  function HistoryPlayer({
    type,
    historyList,
    speed,
    defaultTime,
    className,
    autoPlay,
    muted,
    poster,
    playsinline,
    loop,
    preload,
    children,
    onInitPlayer,
    ...props
  }) {
    const playContainerRef = React.useRef(null);
    const [playerObj, setPlayerObj] = React.useState(null);
    const playerRef = React.useRef(null);
    const [playStatus, setPlayStatus] = React.useState(() => computedTimeAndIndex(historyList, defaultTime));
    const playIndex = React.useMemo(() => playStatus[0], [playStatus]);
    const defaultSeekTime = React.useMemo(() => playStatus[1], [playStatus]);
    const file = React.useMemo(() => {
      let url;

      try {
        url = historyList.fragments[playIndex].file;
      } catch (e) {
        console.warn('未找到播放地址！', historyList);
      }

      return url;
    }, [historyList, playIndex]);
    /**
     * 重写api下的seekTo方法
     */

    const seekTo = React.useCallback(currentTime => {
      const [index, seekTime] = computedTimeAndIndex(historyList, currentTime);

      if (playerRef.current.event && playerRef.current.api) {
        //判断是否需要更新索引
        setPlayStatus(old => {
          if (old[0] !== index) {
            return [index, seekTime];
          } else {
            playerRef.current.api.seekTo(seekTime, true);
            return old;
          }
        });
      }
    }, [playIndex, historyList]);
    const changePlayIndex = React.useCallback(index => {
      if (index > historyList.fragments.length - 1) {
        return playerRef.current && playerRef.current.event && playerRef.current.event.emit(EventName.HISTORY_PLAY_END);
      }

      if (!historyList.fragments[index].file) {
        return changePlayIndex(index + 1);
      }

      if (playerRef.current && playerRef.current.event) {
        playerRef.current.event.emit(EventName.CHANGE_PLAY_INDEX, index);
      }

      setPlayStatus([index, 0]);
    }, [historyList]);
    const reloadHistory = React.useCallback(() => {
      if (playStatus[0] === 0) {
        playerRef.current.api.seekTo(defaultSeekTime);
      }

      setPlayStatus([0, 0]);
      playerRef.current.event.emit(EventName.RELOAD);
    }, []);
    React.useEffect(() => {
      if (!file) {
        changePlayIndex(playIndex + 1);
      }
    }, [file, playIndex, historyList]);
    React.useEffect(() => {
      if (file && playerObj) {
        playerObj && playerObj.api.setPlaybackRate(speed);
      }
    }, [file, playIndex, historyList, speed]);
    React.useEffect(() => () => {
      if (playerRef.current && playerRef.current.event) {
        playerRef.current.event.destroy();
      }

      if (playerRef.current && playerRef.current.api) {
        playerRef.current.api.destroy();
      }

      playerRef.current = null;
    }, [file]);
    React.useEffect(() => {
      if (!file) {
        return;
      }

      const playerObject = {
        playContainer: playContainerRef.current,
        video: playContainerRef.current.querySelector('video')
      };
      let isInit = false;
      const formartType = getVideoType(file);

      if (formartType === 'flv' || type === 'flv') {
        isInit = true;
        playerObject.flv = createFlvPlayer(playerObject.video, { ...props,
          file
        });
      }

      if (formartType === 'm3u8' || type === 'hls') {
        isInit = true;
        playerObject.hls = createHlsPlayer(playerObject.video, file);
      }

      if (!isInit && (!['flv', 'm3u8'].includes(formartType) || type === 'native')) {
        playerObject.video.src = file;
      }

      if (playerObject.event) {
        playerObject.event.destroy();
      }

      playerObject.event = new VideoEventInstance(playerObject.video);

      if (playerObject.api) {
        playerObject.api.destroy();
      }

      playerObject.api = new Api(playerObject);
      playerRef.current = playerObject;
      setPlayerObj(playerObject);

      if (defaultSeekTime) {
        playerObject.api.seekTo(defaultSeekTime);
      }

      if (onInitPlayer) {
        onInitPlayer(Object.assign({}, playerObject.api.getApi(), playerObject.event.getApi(), {
          seekTo,
          changePlayIndex,
          reload: reloadHistory
        }));
      }

      playerObject.api.setPath(file);
      playerObject.api.setPlaybackRate(speed);
    }, [historyList, file]);
    return /*#__PURE__*/React__default.createElement("div", {
      className: `lm-player-container ${className}`,
      ref: playContainerRef
    }, /*#__PURE__*/React__default.createElement("div", {
      className: "player-mask-layout"
    }, /*#__PURE__*/React__default.createElement("video", {
      autoPlay: autoPlay,
      preload: preload,
      muted: muted,
      poster: poster,
      controls: false,
      playsInline: playsinline,
      loop: loop
    })), /*#__PURE__*/React__default.createElement(VideoTools$1, {
      defaultTime: defaultSeekTime,
      playerObj: playerObj,
      isLive: props.isLive,
      hideContrallerBar: props.hideContrallerBar,
      errorReloadTimer: props.errorReloadTimer,
      scale: props.scale,
      snapshot: props.snapshot,
      leftExtContents: props.leftExtContents,
      leftMidExtContents: props.leftMidExtContents,
      rightExtContents: props.rightExtContents,
      rightMidExtContents: props.rightMidExtContents,
      draggable: props.draggable,
      changePlayIndex: changePlayIndex,
      reloadHistory: reloadHistory,
      historyList: historyList,
      playIndex: playIndex,
      seekTo: seekTo,
      key: file
    }), children);
  }

  function VideoTools$1({
    playerObj,
    draggable,
    isLive,
    hideContrallerBar,
    scale,
    snapshot,
    leftExtContents,
    leftMidExtContents,
    rightExtContents,
    rightMidExtContents,
    errorReloadTimer,
    changePlayIndex,
    reloadHistory,
    historyList,
    seekTo,
    playIndex,
    defaultTime
  }) {
    if (!playerObj) {
      return /*#__PURE__*/React__default.createElement(NoSource, null);
    }

    return /*#__PURE__*/React__default.createElement(React__default.Fragment, null, /*#__PURE__*/React__default.createElement(VideoMessage, {
      api: playerObj.api,
      event: playerObj.event,
      isPlus: false
    }), draggable && /*#__PURE__*/React__default.createElement(DragEvent, {
      playContainer: playerObj.playContainer,
      api: playerObj.api,
      event: playerObj.event
    }), !hideContrallerBar && /*#__PURE__*/React__default.createElement(ContrallerEvent, {
      event: playerObj.event,
      playContainer: playerObj.playContainer
    }, /*#__PURE__*/React__default.createElement(ContrallerBar, {
      api: playerObj.api,
      event: playerObj.event,
      playContainer: playerObj.playContainer,
      video: playerObj.video,
      snapshot: snapshot,
      rightExtContents: rightExtContents,
      rightMidExtContents: rightMidExtContents,
      scale: scale,
      isHistory: true,
      isLive: isLive,
      leftExtContents: leftExtContents,
      leftMidExtContents: leftMidExtContents,
      reloadHistory: reloadHistory
    }), /*#__PURE__*/React__default.createElement(TineLine$1, {
      defaultTime: defaultTime,
      changePlayIndex: changePlayIndex,
      historyList: historyList,
      playIndex: playIndex,
      seekTo: seekTo,
      api: playerObj.api,
      event: playerObj.event
    })), /*#__PURE__*/React__default.createElement(ErrorEvent, {
      changePlayIndex: changePlayIndex,
      playIndex: playIndex,
      isHistory: true,
      flv: playerObj.flv,
      hls: playerObj.hls,
      api: playerObj.api,
      event: playerObj.event,
      errorReloadTimer: errorReloadTimer
    }), /*#__PURE__*/React__default.createElement(PlayEnd, {
      event: playerObj.event,
      changePlayIndex: changePlayIndex,
      playIndex: playIndex
    }));
  }

  HistoryPlayer.propTypes = {
    historyList: PropTypes.object.isRequired,
    //播放地址 必填
    errorReloadTimer: PropTypes.number,
    //视频错误重连次数
    type: PropTypes.oneOf(['flv', 'hls', 'native']),
    //强制视频流类型
    onInitPlayer: PropTypes.func,
    isDraggable: PropTypes.bool,
    isScale: PropTypes.bool,
    muted: PropTypes.string,
    autoPlay: PropTypes.bool,
    playsInline: PropTypes.bool,
    preload: PropTypes.string,
    poster: PropTypes.string,
    loop: PropTypes.bool,
    defaultTime: PropTypes.number,
    className: PropTypes.string,
    playsinline: PropTypes.bool,
    children: PropTypes.any,
    autoplay: PropTypes.bool,
    rightExtContents: PropTypes.element,
    rightMidExtContents: PropTypes.element,
    leftExtContents: PropTypes.element,
    leftMidExtContents: PropTypes.element,
    flvOptions: PropTypes.object,
    flvConfig: PropTypes.object
  };
  HistoryPlayer.defaultProps = {
    draggable: true,
    scale: true,
    errorReloadTimer: 5,
    muted: 'muted',
    autoPlay: true,
    playsInline: false,
    preload: 'auto',
    loop: false,
    defaultTime: 0,
    historyList: {
      beginDate: 0,
      duration: 0,
      fragments: []
    }
  };

  function createPlayer({
    container,
    children,
    onInitPlayer,
    ...props
  }) {
    ReactDOM.render( /*#__PURE__*/React__default.createElement(SinglePlayer, _extends({}, props, {
      onInitPlayer: player => {
        player.destroy = function () {
          ReactDOM.unmountComponentAtNode(container);
        };

        onInitPlayer && onInitPlayer(player);
      }
    }), children), container);
  }
  function createHistoryPlayer({
    container,
    children,
    onInitPlayer,
    ...props
  }) {
    ReactDOM.render( /*#__PURE__*/React__default.createElement(HistoryPlayer, _extends({}, props, {
      onInitPlayer: player => {
        player.destroy = function () {
          ReactDOM.unmountComponentAtNode(container);
        };

        onInitPlayer && onInitPlayer(player);
      }
    }), children), container);
  }

  exports.Bar = Bar;
  exports.EventName = EventName;
  exports.HistoryPlayer = HistoryPlayer;
  exports.Player = SinglePlayer;
  exports.createHistoryPlayer = createHistoryPlayer;
  exports.createPlayer = createPlayer;
  exports.default = SinglePlayer;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
