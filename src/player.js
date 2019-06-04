import React from "react";
import ReactDOM from "react-dom";
import VideoEvent from "./event";
import { getVideoType, createFlvPlayer, createHlsPlayer } from "./util";
import { Provider } from "./context";
import ContrallerBar from "./contraller_bar";
import ContrallerEvent from "./event/contrallerEvent";
import VideoMessage from "./message";
import TimeLine from "./time_line";
import ErrorEvent from "./event/errorEvent";
import DragEvent from "./event/dragEvent";
import Api from "./api";
import LiveHeart from "./live_heart";
import "./style/index.less";

class LMPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.player = null;
    this.event = null;
    this.flv = null;
    this.hls = null;
    this.playerType = null;
    this.playContainerRef = React.createRef();
    this.playContainer = null;
  }
  componentDidMount() {
    this.playContainer = ReactDOM.findDOMNode(this.playContainerRef.current);
    this.player = this.playContainer.querySelector("video");
    this.initPlayer();
    this.event = new VideoEvent(this.player);
    this.api = new Api(this.player, this.playContainer, this.event, this.flv, this.hls);
    this.forceUpdate();
    this.props.onInitPlayer && this.props.onInitPlayer(this.getPlayerApiContext());
  }
  componentWillUnmount() {
    this.event.destroy();
    this.api.destroy();
    this.player = null;
    this.event = null;
    this.flv = null;
    this.hls = null;
    this.playerType = null;
    this.playContainerRef = null;
    this.playContainer = null;
  }

  initPlayer = () => {
    if (!this.props.file) {
      return null;
    }
    const type = getVideoType(this.props.file);
    if (type === "flv" || this.props.type === "flv") {
      this.flv = createFlvPlayer(this.player, this.props);
    } else if (type === "m3u8" || this.props.type === "hls") {
      this.hls = createHlsPlayer(this.player, this.props.file);
    } else {
      this.player.src = this.props.file;
    }
  };

  renderVideoTools = () => {
    if (!this.player) {
      return null;
    }
    return (
      <>
        <ContrallerBar />
        <VideoMessage />
        <DragEvent />
        <ContrallerEvent />
        <ErrorEvent flvPlayer={this.flv} hlsPlayer={this.hls} />
        {!this.props.isLive && (
          <>
            <LiveHeart key={this.props.file} />
            <TimeLine />
          </>
        )}
      </>
    );
  };
  getPlayUrl = () => {
    return this.props.file;
  };
  getPlayerApiContext = () => {
    const api = this.api ? this.api.getApi() : {};
    const event = this.event
      ? {
          on: this.event.on.bind(this.event),
          off: this.event.off.bind(this.event),
          emit: this.event.emit.bind(this.event)
        }
      : {};
    return Object.assign({}, api, event, { getPlayUrl: this.getPlayUrl, playContainer: this.playContainer });
  };
  getProvider = () => {
    return {
      video: this.player,
      event: this.event,
      playerType: this.playerType,
      playerProps: this.props,
      api: this.api,
      playContainer: this.playContainer
    };
  };
  render() {
    const { autoplay, poster, preload = "none", muted = true, loop = false, playsinline = false } = this.props;
    const providerValue = this.getProvider();
    return (
      <div className="lm-player-container" ref={this.playContainerRef}>
        <div className="player-mask-layout">
          <video autoPlay={autoplay} preload={preload} muted={muted} poster={poster} controls={false} playsInline={playsinline} loop={loop} />
        </div>
        <Provider value={providerValue}>{this.renderVideoTools()}</Provider>
        {this.props.children}
      </div>
    );
  }
}

export default LMPlayer;
