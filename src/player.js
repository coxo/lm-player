import React, { useRef, useEffect, useState, useMemo } from 'react'
import VideoEvent from './event'
import ContrallerBar from './contraller_bar'
import ContrallerEvent from './event/contrallerEvent'
import { NoSource, YUVMessage } from './utils/message'
import TimeLine from './simple/time_line'
import ErrorEvent from './event/errorEvent'
import DragEvent from './event/dragEvent'
import YUVApi from './yuv/api'
import LiveHeart from './simple/live_heart'
import PropTypes from 'prop-types'
import YUVPlayer from './yuv/player'

import './style/index.less'
import './yuv/player.css'

import { getScreenRate, getGlobalCache, GL_CACHE } from './yuv/util'

function SinglePlayer({ type, isFrontEnd, frontList, file, className, autoPlay, muted, poster, playsinline, loop, preload, children, onInitPlayer, screenNum , config,  onVideoFn, historyList, ...props }) {
  const playContainerRef = useRef(null)
  const YUVRef = useRef(null)
  const [playerObj, setPlayerObj] = useState(null)

  const [playerState, setPlayerState] = useState({code: 70000, msg: ''})

  const rate = useMemo(() => getScreenRate(screenNum), [screenNum]);

  const filePath = useMemo(() => {
    let url;
    const index = 0
    if(isFrontEnd){
      try {
        if(frontList && frontList[index]){
          url = frontList[index].flv;
        }
      } catch (e) {
        console.warn('未找到播放地址！', historyList)
      }
    }else{
      url = file
    }
    return url;
  }, [file, isFrontEnd]);

  // 播放运行模式
  // 0：不用插件
  // 1：h264不用插件，其它用插件
  // 2：全用插件

  // 是否解密
  const VD_RUN_DEC = getGlobalCache(GL_CACHE.DM)

  const [yuvUrl, setYuvUrl] = useState(null)

  function onToken(token){
    if(onVideoFn){
      onVideoFn({
        uuid: token
      })
    }
  }
  
  function loadPlusPlayer(playerObject){
    console.info('进入插件播放模式==>')
    playerObject.event = new VideoEvent(YUVRef.current.getDom())
    playerObject.player = YUVRef.current;
    playerObject.api = new YUVApi(playerObject)
    setPlayerObj(playerObject)

    if (onInitPlayer) {
      onInitPlayer(Object.assign({}, playerObject.api.getApi(), playerObject.event.getApi()))
    }
  }

  function onClose(){
    YUVRef.current && YUVRef.current.closeWebSocket()
    playerObj && playerObj.api.setPlayerIng(false)
  }

  function onPlayerState(state){
    setPlayerState(state)
  }

  useEffect(
    () => () => {
      onClose()
    },
    [filePath]
  )

  useEffect(() => {
    const playerObject = {
      playContainer: playContainerRef.current,
      video: playContainerRef.current.querySelector('video')
    }

    if(filePath){
      // 是否解密
      setYuvUrl(filePath + (VD_RUN_DEC || ''))
    }

    if (!filePath) {
      setYuvUrl('')
      onClose()
      return
    }
    // 全用插件
    loadPlusPlayer(playerObject)
  }, [filePath])

  return (
    <div className={`lm-player-container ${className}`} ref={playContainerRef}>
      <div className="player-mask-layout">
      {
        <YUVPlayer streamUrl={yuvUrl} ratio={rate} ref={YUVRef} onToken={onToken} onPlayerState={onPlayerState}  errorReloadTimer={props.errorReloadTimer}/>
      }
      </div>

     <VideoTools
      playerObj={playerObj}
      isLive={props.isLive}
      key={filePath}
      hideContrallerBar={props.hideContrallerBar}
      errorReloadTimer={props.errorReloadTimer}
      scale={props.scale}
      snapshot={props.snapshot}
      leftExtContents={props.leftExtContents}
      leftMidExtContents={props.leftMidExtContents}
      rightExtContents={props.rightExtContents}
      rightMidExtContents={props.rightMidExtContents}
      draggable={props.draggable}
      isPlus={true}
      playerState={playerState}
      />
      {children}
    </div>
  )
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
    return <NoSource />
  }

  if (playerState.code === 70004) {
    return <NoSource />
  }
  return (
    <>
      {
        <YUVMessage api={playerObj.api} event={playerObj.event} playerState={playerState}/> 
      }
      {draggable && <DragEvent playContainer={playerObj.playContainer} api={playerObj.api} event={playerObj.event} />}
      {!hideContrallerBar && (
        <ContrallerEvent event={playerObj.event} playContainer={playerObj.playContainer}>
          <ContrallerBar
            api={playerObj.api}
            event={playerObj.event}
            playContainer={playerObj.playContainer}
            video={playerObj.video}
            snapshot={snapshot}
            rightExtContents={rightExtContents}
            rightMidExtContents={rightMidExtContents}
            scale={scale}
            isHistory={false}
            isLive={isLive}
            leftExtContents={leftExtContents}
            leftMidExtContents={leftMidExtContents}
            isPlus={true}
          />
          {!isLive && <TimeLine api={playerObj.api} event={playerObj.event} />}
        </ContrallerEvent>
      )}
      <ErrorEvent flv={playerObj.flv} hls={playerObj.hls} api={playerObj.api} event={playerObj.event} errorReloadTimer={errorReloadTimer} />
      {isLive && <LiveHeart api={playerObj.api} />}
    </>
  )
}

SinglePlayer.propTypes = {
  file: PropTypes.string.isRequired, //播放地址 必填
  isLive: PropTypes.bool, //是否实时视频
  errorReloadTimer: PropTypes.number, //视频错误重连次数
  type: PropTypes.oneOf(['flv', 'hls', 'native']), //强制视频流类型
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
}
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
}

export default SinglePlayer
