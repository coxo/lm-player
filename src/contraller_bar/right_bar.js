import React, { useState, useMemo, useEffect, useCallback } from 'react'
import IconFont from '../simple/iconfont'
import Bar from './bar'
import { isFullscreen, fullScreenListener, computedBound, getVideoRatio, getGlobalCache, GL_CACHE } from '../yuv/util'
import PropTypes from 'prop-types'

function RightBar({ playContainer, api, isLive, scale, snapshot, rightExtContents, rightMidExtContents }) {
  // 获取视频分辨率
  const ratioValue = getVideoRatio()
  const [dep, setDep] = useState(Date.now())
  // 默认高清3，544
  const [viewText, setViewText] = useState(ratioValue[2].name);

  const isSwithRate = getGlobalCache(GL_CACHE.SR) || false

  useEffect(() => {
    const update = () => setDep(Date.now())
    fullScreenListener(true, update)
    return () => fullScreenListener(false, update)
  }, [])

  const isfull = useMemo(() => isFullscreen(playContainer), [dep, playContainer])

  const fullscreen = useCallback(() => {
    !isFullscreen(playContainer) ? api.requestFullScreen() : api.cancelFullScreen()
    setDep(Date.now())
  }, [api, playContainer])

  const setScale = useCallback(
    (...args) => {
      const dragDom = playContainer.querySelector('.player-mask-layout')
      api.setScale(...args)
      let position = computedBound(dragDom, api.getPosition(), api.getScale())
      if (position) {
        api.setPosition(position, true)
      }
    },
    [api, playContainer]
  )

  const setRatio = useCallback(
    (...args) => {
      setViewText(ratioValue[args].name)
      api.exeRatioCommand(ratioValue[args].value)
    },
    [api]
  )

  return (
    <div className="contraller-right-bar">
      {rightMidExtContents}
      {scale && (
        <>
          <Bar>
            <IconFont title="缩小" onClick={() => setScale(-0.2)} type={'lm-player-ZoomOut_Main'} />
          </Bar>
          <Bar>
            <IconFont title="复位" onClick={() => setScale(1, true)} type={'lm-player-ZoomDefault_Main'} />
          </Bar>
          <Bar>
            <IconFont title="放大" onClick={() => setScale(0.2)} type={'lm-player-ZoomIn_Main'} />
          </Bar>
        </>
      )}

      {snapshot && (
        <Bar>
          <IconFont title="截图" onClick={() => snapshot(api.snapshot())} type="lm-player-SearchBox" />
        </Bar>
      )}

     {isLive && isSwithRate && (
        <Bar className={'ratioMenu'}>
            <span class='ratioMenu-main'>{viewText}</span>
            <ul class="ratioMenu-level">
              {
                Object.keys(ratioValue).map((item)=>(
                  <li class="ratioMenu-level-1" onClick={() => setRatio(item)}>{ratioValue[item].name}</li>
                ))
              }
            </ul>
        </Bar>
      )}

      <Bar>
        <IconFont title={isfull ? '窗口' : '全屏'} onClick={fullscreen} type={isfull ? 'lm-player-ExitFull_Main' : 'lm-player-Full_Main'} />
      </Bar>
      {rightExtContents}
    </div>
  )
}

RightBar.propTypes = {
  api: PropTypes.object,
  event: PropTypes.object,
  playerProps: PropTypes.object,
  playContainer: PropTypes.node,
  reloadHistory: PropTypes.func,
  isHistory: PropTypes.bool,
}
export default RightBar
