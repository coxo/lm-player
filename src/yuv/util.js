
/**
 * 全屏
 * @param {*} element
 */
export function fullscreen(element) {
  if (element.requestFullScreen) {
    element.requestFullScreen()
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  }
}

/**
 * exitFullscreen 退出全屏
 * @param  {Objct} element 选择器
 */
export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

/**
 * 判读是否支持全屏
 */
export function fullscreenEnabled() {
  return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled
}

/**
 * [isFullscreen 判断浏览器是否全屏]
 * @return [全屏则返回当前调用全屏的元素,不全屏返回false]
 */
export function isFullscreen(ele) {
  if (!ele) {
    return false
  }
  return document.fullscreenElement === ele || document.msFullscreenElement === ele || document.mozFullScreenElement === ele || document.webkitFullscreenElement === ele || false
}
// 添加 / 移除 全屏事件监听
export function fullScreenListener(isAdd, fullscreenchange) {
  const funcName = isAdd ? 'addEventListener' : 'removeEventListener'
  const fullScreenEvents = ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange']
  fullScreenEvents.map((v) => document[funcName](v, fullscreenchange))
}

/**
 * 计算视频拖拽边界
 * @param {*} ele
 * @param {*} currentPosition
 * @param {*} scale
 */
export function computedBound(ele, currentPosition, scale) {
  const data = currentPosition
  const eleRect = ele.getBoundingClientRect()
  const w = eleRect.width
  const h = eleRect.height
  let lx = 0,
    ly = 0
  if (scale === 1) {
    return [0, 0]
  }
  lx = (w * (scale - 1)) / 2 / scale
  ly = (h * (scale - 1)) / 2 / scale
  let x = 0,
    y = 0
  if (data[0] >= 0 && data[0] > lx) {
    x = lx
  }
  if (data[0] >= 0 && data[0] < lx) {
    x = data[0]
  }

  if (data[0] < 0 && data[0] < -lx) {
    x = -lx
  }
  if (data[0] < 0 && data[0] > -lx) {
    x = data[0]
  }

  if (data[1] >= 0 && data[1] > ly) {
    y = ly
  }
  if (data[1] >= 0 && data[1] < ly) {
    y = data[1]
  }

  if (data[1] < 0 && data[1] < -ly) {
    y = -ly
  }
  if (data[1] < 0 && data[1] > -ly) {
    y = data[1]
  }
  if (x !== data[0] || y !== data[1]) {
    return [x, y]
  } else {
    return
  }
}

/**
 * 生成UUID
 */
export function genuuid() {
  let s = [];
  let hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-';

  let uuidStr = s.join('');
  return uuidStr;
}


/**
 * 获取随机数
 */
export function getRandom() {
  return Math.random().toString(36).substr(2)
}

/**
 * 获取视频分辨率
 */
export function getVideoRatio() {
  return {
    // '5': { value: '1920*1080', name: '超高清'},
    '1': { value: '1280*720', name: '超清'},
    '2': { value: '960*544', name: '高清'},
    '3': { value: '640*480', name: '标清'},
    '4': { value: '352*288', name: '普清'},
  }
}
/**
 * 根据分屏获取对应的分辨率
 * 默认 960*544
 */
export function getScreenRate(num){
  const videoRatio = getVideoRatio()
  let ratio = ''

  switch (num) {
    case 1:
      ratio = videoRatio['1'].value
      break;
    case 4:
      ratio = videoRatio['2'].value
      break;
    case 9:
      ratio = videoRatio['3'].value
      break;
    case 16:
      ratio = videoRatio['4'].value
      break;
    default:
      ratio = videoRatio['2'].value
      break;
  }

  return ratio
}

/**
 * 获取全局配置
 * @param {*} key 
 */
export function getGlobalCache(key){
  const strS = localStorage.getItem('PY_PLUS')
  let playerOptions = null

  try {
    playerOptions = JSON.parse(strS);
  } catch (error) {
    console.error('播放配置出错，请检查浏览器存储！')
  }
  return playerOptions[key]
}
/**
 * 全局配置
 * decryptionMode： 是否加密
 * switchRate：码率切换控制
 */
export const GL_CACHE = {
  DM :'decryptionMode',
  SR :'switchRate'
}