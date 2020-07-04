import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

function SimplePlayer({ autoPlay, muted, poster, playsinline, loop, preload}) {
  return (
    <video autoPlay={autoPlay} preload={preload} muted={muted} poster={poster} controls={false} playsInline={playsinline} loop={loop} />
  )
}


SimplePlayer.propTypes = {
  muted: PropTypes.string,
  autoPlay: PropTypes.bool,
  playsInline: PropTypes.bool,
  preload: PropTypes.string,
  poster: PropTypes.string,
  loop: PropTypes.bool
}

SimplePlayer.defaultProps = {
  muted: 'muted',
  autoPlay: true,
  playsInline: false,
  preload: 'auto',
  loop: false
}

export default SimplePlayer
