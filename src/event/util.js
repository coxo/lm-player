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