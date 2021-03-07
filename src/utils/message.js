import React, { useEffect, useState, useMemo } from 'react'
import IconFont from '../simple/iconfont'
import EventName from '../event/eventName'
import '../style/message.less'

function VideoMessage({ event, api }) {
  const [state, setState] = useState({ status: null, errorTimer: null, loading: false })

  const message = useMemo(() => {
    if (!state.status) {
      return ''
    }
    if (state.status === 'fail') {
      return '视频错误'
    }
    if (state.status === 'reload') {
      return `视频加载错误，正在进行重连第${state.errorTimer}次重连`
    }
  }, [state.errorTimer, state.status])

  useEffect(() => {
    const openLoading = () => setState(old => ({ ...old, loading: true }))
    const closeLoading = () => setState(old => ({ ...old, loading: false }))
    const errorReload = timer => setState(() => ({ status: 'reload', errorTimer: timer, loading: true }))
    const reloadFail = () => setState(old => ({ ...old, status: 'fail' }))
    const reloadSuccess = () => setState(old => ({ ...old, status: null }))
    const reload = () => setState(old => ({ ...old, status: 'reload' }))
    const playEnd = () => (setState(old => ({ ...old, status: null, loading: false })), api.pause())

    event.addEventListener('loadstart', openLoading)
    event.addEventListener('waiting', openLoading)
    event.addEventListener('seeking', openLoading)
    event.addEventListener('loadeddata', closeLoading)
    event.addEventListener('canplay', closeLoading)
    event.on(EventName.ERROR_RELOAD, errorReload)
    event.on(EventName.RELOAD_FAIL, reloadFail)
    event.on(EventName.RELOAD_SUCCESS, reloadSuccess)
    event.on(EventName.RELOAD, reload)
    event.on(EventName.HISTORY_PLAY_END, playEnd)
    event.on(EventName.CLEAR_ERROR_TIMER, reloadSuccess)
  }, [event])

  const { loading, status } = state
  return (
    <div className={`lm-player-message-mask ${loading || status === 'fail' ? 'lm-player-mask-loading-animation' : ''}`}>
      <IconFont
        type={status === 'fail' ? 'lm-player-YesorNo_No_Dark' : 'lm-player-Loading'}
        className={`${loading && status !== 'fail' ? 'lm-player-loading-animation' : status === 'fail' ? 'lm-player-loadfail' : ''} lm-player-loading-icon`}
      />
      <span className="lm-player-message">{message}</span>
    </div>
  )
}


export const YUVMessage = ({api, playerState}) => {
  const [state, setState] = useState({ status: null, msg: '', errorTimer: null, loading: false })
  const [messageTips, setMessageTips] = useState('')

  const message = useMemo(() => {

    if (!state.status) {
      return ''
    }
    if (state.status === 'fail') {
      return '视频错误'
    }
    if (state.status === 'reload') {
      return `视频加载错误，正在进行重连第${state.errorTimer}次重连`
    }
    if (state.status === 'connet') {
      return `连接失败，请安装播放软件！`
    }
  }, [state.errorTimer, state.status])

  useEffect(() => {
    setMessageTips('')
    api.setPlayerIng(false)
    
    if(playerState.code == 70004){
      // 关闭
      setState({ status: null, errorTimer: null, loading: false })
    }

    if(playerState.code == 1000){
      // 重新连接
      setState({ status: 'connet', errorTimer: null, loading: false })
    }

    // 默认状态-开始loading...
    if(playerState.code == 70000){
      setState({ status: null, errorTimer: null, loading: true })
    }
    
    if(playerState.code == 70001){
      api.setPlayerIng(true)
      // 开始播放--消除loading...
      setState({ status: null, errorTimer: null, loading: false })
    }

    // 业务状态.....
    
    // 视频流播放异常-进行重装
    if(playerState.code == 70002){
      setState({ status: 'reload', errorTimer: playerState.errorTimer, loading: false })
    }

    // 视频流播放异常-显示
    if(playerState.code > 710000){
      setMessageTips('错误信息: ' + playerState.msg)
      setState({ status: 'fail', errorTimer: null, loading: false })
    }

  },[playerState])
  

  const { loading, status } = state

  const playerDownloadUrl = (window.BSConfig?.playerDownloadUrl) || localStorage.getItem('ZVPlayerUrl')

  return (
    <div className={`lm-player-message-mask ${loading || status === 'fail' || status === 'connet' || status === 'reload' ? 'lm-player-mask-loading-animation' : ''} ${status === 'connet' ? 'lm-player-puls-event' : ''}`}>
      <IconFont
        type={status === 'fail' ? 'lm-player-YesorNo_No_Dark' : 'lm-player-Loading'}
        className={`${loading && status !== 'fail' ? 'lm-player-loading-animation' : status === 'fail' ? 'lm-player-loadfail' : ''} lm-player-loading-icon`}
      />

      {
        status === 'connet'?
        <IconFont type={'lm-player-YesorNo_No_Dark'}
        className={`lm-player-loadfail lm-player-loading-icon`}
      />:null
      }

     {
        status === 'reload'?
        <IconFont type={'lm-player-Loading'}
        className={`lm-player-loading-animation lm-player-loading-icon`}
      />:null
      }
      
      <span className="lm-player-message">{message}</span>
      <span style={{ fontSize: 12, color: '#666' }}>{messageTips}</span>

      {
        status === 'connet' ? 
        <a className="lm-player-plus" target="_blank" href={playerDownloadUrl} style={{ pointerEvents: 'all' }} download="ZVPlayer.exe" rel="noopener noreferrer">下载</a>
         :null
      }
    </div>
  )
}

export const NoSource = () => {
  return (
    <div className="lm-player-message-mask lm-player-mask-loading-animation">
      <IconFont style={{ fontSize: 80 }} type="lm-player-PlaySource" title="请选择视频源"></IconFont>
    </div>
  )
}

export default VideoMessage