/**
 * history下使用 用户切换下个播放地址
 */

import React from 'react'
import { videoDec } from '../context'
import PropTypes from 'prop-types'

@videoDec
class PlayEnd extends React.Component {
  componentDidMount() {
    const { event } = this.props
    event.addEventListener('ended', this.endedHandle, false)
  }
  componentWillUnmount() {
    const { event } = this.props
    event.removeEventListener('ended', this.endedHandle, false)
  }
  endedHandle = () => {
    let index = this.props.playIndex
    this.props.changePlayIndex(index + 1)
  }
  render() {
    return null
  }
}

PlayEnd.propTypes = {
  event: PropTypes.object,
  changePlayIndex: PropTypes.func,
  playIndex: PropTypes.number
}
export default PlayEnd